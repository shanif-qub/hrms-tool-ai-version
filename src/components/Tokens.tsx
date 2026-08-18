import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'motion/react';
import { Calendar, IndianRupee, TriangleAlert, AlertCircle, IdCard, ShieldCheck, Wand2, MessageSquare, GripVertical, SquareStack, ScanEye, X } from 'lucide-react';
import { PersonToken, LeaveToken, PayslipToken, Pos } from '../types';
import { useWorkspace } from '../store';
import { hit, registerZone, clearZone, qProximity, qProximityRect, hitQBar, hitQBarRect, qBarCenter } from '../dropzone';
import { resolveCombo } from '../combos';
import { sfx } from '../sound';
import { haptic } from '../haptics';
import { Avatar } from './Avatar';
import { Masked } from './Masked';
import { LEAVE_HISTORY } from '../data';

const SPINE: Record<string, string> = { lumen: 'var(--color-lumen)', halo: 'var(--color-halo)', ember: 'var(--color-ember)', mist: 'var(--color-trace)', coral: 'var(--color-coral)' };

const vw = () => (typeof window !== 'undefined' ? window.innerWidth : 1400);
const vh = () => (typeof window !== 'undefined' ? window.innerHeight : 900);
const clampX = (v: number) => Math.max(24, Math.min(vw() - 300, v));
const clampY = (v: number) => Math.max(90, Math.min(vh() - 220, v));

export interface FrameProps {
  id: string; kind: string; label: string;
  placement?: 'free' | 'flow';   // free = absolute canvas token; flow = in normal layout
  reposition?: boolean;          // free tokens reposition on empty drop; others snap back
  pos?: Pos;                     // required for placement 'free'
  width?: number;
  dimmed?: boolean; glow?: string; className?: string;
  onActivate?: () => void;
  onClose?: () => void;
  shape?: 'rect' | 'soft' | 'capsule' | 'circle' | 'pill';
  tint?: 'lumen' | 'halo' | 'ember' | 'mist' | 'coral';
  children: ReactNode;           // face (always visible)
  expand?: ReactNode;            // layer 1 — long hover / tap
  deep?: ReactNode;              // layer 2 — peel (top-right)
  spawn?: boolean;               // emphatic entrance (merge results)
}

const GRID = 32;  // invisible snap grid

export function TokenFrame(p: FrameProps) {
  const w = useWorkspace();
  const { peeledId, selection } = w;
  const placement = p.placement ?? 'free';
  const canReposition = p.reposition !== false;
  const floatPos = w.floating[p.id];
  const isFloating = !!floatPos;
  const pos = p.pos ?? { x: 0, y: 0 };
  const isPeeled = peeledId === p.id;
  const selected = selection.includes(p.id);

  const ref = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const x = useMotionValue(0), y = useMotionValue(0);
  const hold = useRef<{ id: string | null; t: number }>({ id: null, t: 0 });
  const fired = useRef(false);
  const lastQHover = useRef<'none' | 'influence' | 'release'>('none');
  const hoverTimer = useRef<any>(null);
  const [preview, setPreview] = useState<{ verdict: string; title: string } | null>(null);
  const [expanded, setExpanded] = useState(false);   // long-hover
  const [pinned, setPinned] = useState(false);        // tap-pinned expand
  const [shaking, setShaking] = useState(false);
  const [drg, setDrg] = useState(false);
  const inCenterRef = useRef(false);
  const [inCenter, setInCenter] = useState(false);

  const reg = () => registerZone(`tok-${p.id}`, ref.current, 'token', { kind: p.kind, id: p.id });
  useEffect(() => { reg(); const r = () => reg(); window.addEventListener('resize', r); return () => { window.removeEventListener('resize', r); clearZone(`tok-${p.id}`); }; }, [p.id, p.kind, pos.x, pos.y]);

  const back = () => { animate(x, 0, { type: 'spring', stiffness: 420, damping: 34 }); animate(y, 0, { type: 'spring', stiffness: 420, damping: 34 }); };
  const center = (r: DOMRect) => ({ cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
  const showL1 = (expanded || pinned) && !!p.expand;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (e.shiftKey) w.toggleSelect(p.id); else if (p.onActivate) p.onActivate(); else setPinned(v => !v); }
    if (e.key === 'Escape') { if (isPeeled) w.peel(null); setPinned(false); }
  };

  const peelFx = () => { const r = ref.current?.getBoundingClientRect(); if (r) w.pulse(r.left + r.width / 2, r.top + r.height / 2, 'q'); sfx.peel(); haptic('med'); };

  const node = (
    <motion.div
      ref={ref}
      className={`group token-card ${drg ? 'is-dragging' : ''} ${isPeeled || drg ? 'glass-elevated solid-card' : 'glass-panel'} shape-${p.shape ?? 'rect'} ${p.tint ? 'tint-' + p.tint : ''} ${isFloating ? 'fixed' : placement === 'free' ? 'absolute idle-life' : 'relative'} select-none ${shaking ? 'shake' : ''} ${p.expand && inCenter ? 'cursor-zoom-in' : ''} ${p.className ?? ''}`}
      style={{ x, y, ...(isFloating ? { left: floatPos.x, top: floatPos.y } : placement === 'free' ? { left: pos.x, top: pos.y } : {}), width: isFloating ? (p.width ?? 300) : p.width, boxShadow: selected ? '0 0 0 2px var(--color-halo), ' + (p.glow || 'var(--shadow)') : p.glow, zIndex: drg ? 9997 : isPeeled ? 60 : isFloating ? 30 : (showL1 || selected) ? 45 : 10 }}
      drag dragListener={false} dragControls={controls} dragMomentum={false}
      onDragStart={() => { w.setDragging(true); setDrg(true); sfx.pickup(); fired.current = false; hold.current = { id: null, t: 0 }; setExpanded(false); }}
      onDrag={(_e, info) => {
        const cr = ref.current?.getBoundingClientRect();
        const prox = cr ? qProximityRect(cr) : qProximity(info.point.x, info.point.y);
        if (prox !== lastQHover.current) { lastQHover.current = prox; w.setQHover(prox); }
        const overQ = prox !== 'none';
        const tz = overQ ? null : hit(info.point.x, info.point.y, 'token', p.id);
        const tgt = overQ ? '__q__' : tz?.id ?? null;
        if (tgt !== hold.current.id) { hold.current = { id: tgt, t: Date.now() }; fired.current = false; setPreview(null); }
        if (tgt === '__q__') {
          if (!fired.current) { fired.current = true; sfx.hover(); haptic('low'); }
          const title = prox === 'release' ? 'Release to ask Q' : 'Drag here to ask Q';
          setPreview(pv => (pv && pv.verdict === 'q' && pv.title === title) ? pv : { verdict: 'q', title });
        }
        else if (tgt && !fired.current && Date.now() - hold.current.t > 400) {
          fired.current = true; sfx.hover(); haptic('low');
          if (tz) { const r = resolveCombo({ kind: p.kind, id: p.id }, { kind: tz.data.kind, id: tz.data.id }, w); setPreview({ verdict: r.verdict, title: r.title }); }
        }
      }}
      onDragEnd={(_e, info) => {
        w.setDragging(false); setDrg(false); setPreview(null); fired.current = false; lastQHover.current = 'none';
        const px = info.point.x, py = info.point.y;
        const cr = ref.current?.getBoundingClientRect();
        if (cr ? hitQBarRect(cr) : hitQBar(px, py)) { const r = qBarCenter();
          if (selected && selection.length > 1) w.explainCluster(selection); else w.explainToken(p.kind, p.id);
          if (r) w.pulse(r.cx, r.cy, 'q'); sfx.confirm(); haptic('high'); back(); return; }
        // A panel is an organising zone — dropping here docks/snaps, never merges.
        const overPanel = hit(px, py, 'panel');
        const snapAbs = (v: number) => Math.round(v / GRID) * GRID;
        if (overPanel) {
          if (isFloating) { w.dockCard(p.id); x.set(0); y.set(0); setTimeout(reg, 260); return; }
          back(); return;
        }
        const tz = hit(px, py, 'token', p.id);
        if (tz) {
          const r = resolveCombo({ kind: p.kind, id: p.id }, { kind: tz.data.kind, id: tz.data.id }, w);
          const { cx, cy } = center(tz.rect);
          if (r.verdict === 'reject') { sfx.reject(); haptic('low'); w.pulse(cx, cy, 'reject'); setShaking(true); setTimeout(() => setShaking(false), 360); }
          else { w.spawnSynth({ id: `syn${Date.now()}`, type: 'synth', title: r.title, lines: r.lines, viz: r.viz, verdict: r.verdict, aColor: r.aColor, bColor: r.bColor, action: r.action ?? null, pos: { x: clampX(tz.rect.right + 18 + (w.synth.length % 4) * 16), y: clampY(tz.rect.bottom + 14 + (w.synth.length % 4) * 16) } });
            w.pulse(cx, cy, r.verdict); r.verdict === 'combine' ? sfx.merge() : sfx.relate(); haptic(r.verdict === 'combine' ? 'high' : 'med'); }
          back(); return;
        }
        if (isFloating) {
          const r = ref.current!.getBoundingClientRect(); w.floatCard(p.id, snapAbs(r.left), snapAbs(r.top));
          x.set(0); y.set(0); setTimeout(reg, 260); return;
        }
        if (!canReposition) { back(); return; }
        if (placement === 'flow') {
          const r = ref.current!.getBoundingClientRect(); w.floatCard(p.id, snapAbs(r.left), snapAbs(r.top));
          x.set(0); y.set(0); setTimeout(reg, 260); return;
        }
        const snap = (v: number, base: number) => Math.round((base + v) / GRID) * GRID - base;
        animate(x, snap(x.get(), pos.x), { type: 'spring', stiffness: 500, damping: 40 });
        animate(y, snap(y.get(), pos.y), { type: 'spring', stiffness: 500, damping: 40 });
        setTimeout(reg, 260);
      }}
      onMouseMove={(e: any) => {
        if (!p.expand || pinned) return;
        const r = ref.current?.getBoundingClientRect(); if (!r) return;
        const pad = 20;
        const c = e.clientX > r.left + pad && e.clientX < r.right - pad && e.clientY > r.top + pad && e.clientY < r.bottom - pad;
        if (c === inCenterRef.current) return;
        inCenterRef.current = c; setInCenter(c);
        if (c) { hoverTimer.current = setTimeout(() => { setExpanded(true); sfx.hover(); }, 320); }
        else { clearTimeout(hoverTimer.current); setExpanded(false); }
      }}
      onHoverEnd={() => { clearTimeout(hoverTimer.current); inCenterRef.current = false; setInCenter(false); if (!pinned) setExpanded(false); }}
      onTap={(e: any) => { if (e.target?.closest?.('[data-handle]')) return; if (e.metaKey || e.ctrlKey || e.shiftKey) { w.toggleSelect(p.id); return; } if (p.onActivate) p.onActivate(); else if (p.expand) setPinned(v => !v); else { peelFx(); w.peel(p.id); } }}
      onDoubleClick={() => w.peel(isPeeled ? null : p.id)}
      whileDrag={{ scale: 1.05, zIndex: 80 }}
      initial={w.reduced ? false : { opacity: 0, scale: p.spawn ? 0.62 : 0.92 }}
      animate={{ opacity: p.dimmed ? 0.26 : 1, scale: 1 }}
      transition={w.reduced ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 24 }}
      role="button" tabIndex={0} aria-expanded={showL1 || isPeeled} aria-pressed={selected} aria-label={p.label} onKeyDown={onKey}
    >
      {/* corner grammar — projected tabs, reveal on hover, no pointer capture when hidden */}
      <button data-handle aria-label="Move" onPointerDown={(e) => { e.stopPropagation(); controls.start(e); }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -left-2.5 -top-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-vapor)] z-[85]"><GripVertical className="w-3.5 h-3.5" /></button>
      <button data-handle aria-label="Stack" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); w.toggleSelect(p.id); }}
        className={`opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -left-2.5 -bottom-2.5 h-6 min-w-6 px-1 grid place-items-center rounded-xl glass-elevated z-[85] ${selected ? 'text-[var(--color-halo-text)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}>
        <span className="flex items-center gap-0.5"><SquareStack className="w-3.5 h-3.5" />{selection.length > 0 && <span className="text-[13px] font-mono">{selection.length}</span>}</span></button>
      <button data-handle aria-label={isPeeled ? 'Close raw AI layer' : 'Peel deeper AI layer'} aria-pressed={isPeeled} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); peelFx(); w.peel(isPeeled ? null : p.id); }}
        className={`${isPeeled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'} transition-opacity absolute -right-2.5 -top-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated z-[85] ${isPeeled ? 'text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-lumen)]'}`}>
        <span className="relative grid place-items-center"><ScanEye className="w-3.5 h-3.5" />{isPeeled && <span aria-hidden className="absolute w-[18px] h-px bg-current rotate-45 rounded-full" />}</span></button>
      <button data-handle aria-label={isFloating ? 'Return to panel' : 'Close — remove from view'} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); sfx.close(); if (isFloating) { w.dockCard(p.id); x.set(0); y.set(0); } else { (p.onClose ?? (() => w.hide(p.id)))(); } }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -right-2.5 -bottom-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-coral)] z-[85]" title={isFloating ? 'Return to panel' : 'Close'}><X className="w-3.5 h-3.5" /></button>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-mono px-2 py-1 rounded-full glass-elevated z-[90]"
            style={{ color: preview.verdict === 'reject' ? 'var(--color-coral)' : preview.verdict === 'relate' ? 'var(--color-mist)' : 'var(--color-lumen)' }}>
            {preview.verdict === 'q' ? '→ ' : preview.verdict === 'reject' ? '✕ ' : preview.verdict === 'combine' ? '⤵ ' : '· '}{preview.title}
          </motion.div>
        )}
      </AnimatePresence>

      {placement === 'flow' && p.tint && <span aria-hidden className="card-spine" style={{ background: SPINE[p.tint] }} />}

      {/* Layers 0 & 2 share one box. Peeling lifts the face from its top-right
          corner to reveal the raw AI layer beneath it — a true peel, not an
          accordion. Reduced-motion falls back to a crossfade. */}
      {p.deep ? (
        <div className="relative">
          {/* layer 2 — deep layer establishes card height when peeled; face lifts to reveal it */}
          {isPeeled ? (
            <motion.div
              initial={w.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.24, delay: w.reduced ? 0 : 0.1 }}
              className="p-4">
              <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-2 flex items-center gap-1"><ScanEye className="w-3 h-3" /> Layer 2 · raw AI metrics</div>
              {p.deep}
              <button onClick={(e) => { e.stopPropagation(); w.explainToken(p.kind, p.id); }} className="mt-3 w-full py-2 rounded-xl text-[13px] text-[var(--color-mist)] glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><MessageSquare className="w-3 h-3" /> Ask Q about this</button>
            </motion.div>
          ) : (
            <div className="p-4">{p.children}</div>
          )}
          {/* the peeling face — an overlay that lifts from the top-right corner during the transition */}
          <AnimatePresence>
            {isPeeled && (
              <motion.div
                key="peeling-face"
                aria-hidden
                className="absolute inset-0 origin-top-right pointer-events-none"
                style={{ transformPerspective: 1000, borderRadius: 'inherit', background: 'var(--color-glass)', backdropFilter: 'blur(12px)' }}
                initial={{ opacity: 1, rotateX: 0, rotateZ: 0, y: 0, x: 0 }}
                animate={w.reduced
                  ? { opacity: 0, transition: { duration: 0.18 } }
                  : { opacity: 0, rotateX: -38, rotateZ: 7, y: -12, x: 8, boxShadow: '0 18px 30px rgba(0,0,0,0.35)', transition: { duration: 0.34, ease: [0.4, 0, 0.2, 1] } }}
                exit={{ opacity: 0 }}>
                <div className="p-4">{p.children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="p-4">{p.children}</div>
      )}

      {/* layer 1 — expand (long hover / tap) — unchanged accordion */}
      <AnimatePresence>
        {showL1 && (
          <motion.div initial={w.reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={w.reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }} exit={w.reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">{p.expand}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  // When a card is floated out of a side panel, portal it to the body so it stays
  // put even after the panel collapses/unmounts. Docking (close handle) removes it.
  return isFloating ? createPortal(node, document.body) : node;
}

// generic card for non-typed surfaces (feed, kpi, nav, onboarding, document, chart)
export function TokenCard(props: FrameProps) { return <TokenFrame {...props} />; }

/* ---------------- typed token views ---------------- */
export function PersonTokenView({ data, pos, dimmed, placement, reposition }: { data: PersonToken; pos?: Pos; dimmed?: boolean; placement?: 'free' | 'flow'; reposition?: boolean }) {
  const { simulate } = useWorkspace();
  const risk = data.status === 'flight_risk', onLeave = data.status === 'on_leave';
  const glow = risk ? '0 0 26px rgba(255,107,107,0.24)' : `0 0 ${10 + (data.velocity ?? 0.5) * 20}px rgba(63,224,200,${0.08 + (data.velocity ?? 0.5) * 0.10})`;
  return (
    <TokenFrame id={data.id} kind="person" placement={placement} reposition={reposition} pos={pos} dimmed={dimmed} glow={glow} shape="soft" tint={risk ? 'coral' : 'lumen'} className={`min-w-[210px] ${risk ? 'border-[var(--color-coral)]/55' : ''}`} label={`${data.name}, ${data.role}`}
      expand={
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <F k="Department" v={data.department} /><F k="Manager" v="Marcus Vance" accent />
          <F k="Attendance" v={`${Math.round((data.attendance ?? 0.9) * 100)}%`} /><F k="Velocity" v={`${Math.round((data.velocity ?? 0.5) * 100)}`} />
          <div className="col-span-2 text-[13px] text-[var(--color-trace)]">Peel (top-right) for raw AI metrics · drag onto another token to compare</div>
        </div>}
      deep={
        <div className="flex flex-col gap-3">
          <div className="glass-soft p-3"><div className="text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Emergency contact</div><div className="flex justify-between text-[13px]"><span>Dana Mercer</span><Masked value="+91 98765 40198" className="text-[var(--color-lumen)]" /></div></div>
          <div className="glass-soft p-3 text-[13px]"><div className="text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Sentiment signal</div><div className="flex justify-between"><span className="text-[var(--color-mist)]">6-wk trend</span><span className={risk ? 'text-[var(--color-ember)]' : 'text-[var(--color-lumen)]'}>{risk ? 'declining' : 'stable'}</span></div></div>
          {risk && (<div className="rounded-xl border border-[var(--color-ember)]/30 bg-[var(--color-ember)]/10 p-3 text-[13px] text-[var(--color-ember)]"><div className="flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><div><span className="font-semibold block mb-1">Q · flight-risk prediction</span><p className="opacity-90 leading-relaxed">{data.flightRiskReason}</p></div></div><button onClick={(e) => { e.stopPropagation(); simulate(data.id, 'bonus'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2"><Wand2 className="w-3.5 h-3.5" /> Simulate retention move</button></div>)}
          <button className="w-full py-2 glass-soft text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"><IdCard className="w-3.5 h-3.5" /> Export digital ID</button>
        </div>}>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10"><Avatar seed={data.name} name={data.name} size={40} />
          {risk && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-coral)] animate-pulse shadow-[0_0_8px_var(--color-coral)]" />}
          {onLeave && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-halo)]" />}</div>
        <div className="min-w-0"><div className="font-semibold text-sm truncate">{data.name}</div><div className="text-[13px] text-[var(--color-mist)] font-mono truncate">{data.role}</div></div>
      </div>
    </TokenFrame>
  );
}

export function LeaveTokenView({ data, pos, dimmed, placement, reposition }: { data: LeaveToken; pos?: Pos; dimmed?: boolean; placement?: 'free' | 'flow'; reposition?: boolean }) {
  const { approve, reject } = useWorkspace();
  const resolved = data.status !== 'pending'; const sla = data.isSlaBreached && !resolved;
  return (
    <TokenFrame id={data.id} kind="leave_request" placement={placement} reposition={reposition} pos={pos} dimmed={dimmed} glow={sla ? '0 0 24px rgba(255,180,84,0.22)' : undefined} shape="rect" tint={sla ? 'ember' : 'lumen'} className={`min-w-[230px] ${sla ? 'border-[var(--color-ember)]' : 'border-[var(--color-lumen)]/30'}`} label={`Leave from ${data.personName}`}
      expand={
        <div className="flex flex-col gap-3">
          {LEAVE_HISTORY[`${data.personId}:${data.kind}`] !== undefined && (
            <div className="glass-soft p-3 text-[13px] text-[var(--color-mist)] leading-snug">
              <span className="text-[var(--color-vapor)] font-semibold">{data.personName.split(' ')[0]} has booked {LEAVE_HISTORY[`${data.personId}:${data.kind}`]}d {data.kind} for the same reason in the last 12 months.</span> This request adds {data.days}d → {LEAVE_HISTORY[`${data.personId}:${data.kind}`] + data.days}d.
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-[13px]"><F k="Type" v={data.kind} /><F k="Days" v={`${data.days}`} /></div>
          {!resolved ? (<div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); approve(data.id); }} className="flex-1 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Approve</button><button onClick={(e) => { e.stopPropagation(); reject(data.id); }} className="flex-1 py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 transition-colors">Decline</button></div>) : <div className={`text-[13px] font-semibold ${data.status === 'approved' ? 'text-[var(--color-lumen)]' : 'text-[var(--color-coral)]'}`}>{data.status === 'approved' ? 'Approved' : 'Declined'}</div>}
        </div>}
      deep={
        <div className="flex flex-col gap-3 text-[13px]">
          {data.conflictWith ? <div className="glass-soft p-3"><div className="flex items-center gap-2 mb-1 text-[var(--color-ember)]"><AlertCircle className="w-3.5 h-3.5" /> Coverage conflict</div><p className="text-[var(--color-mist)]">Overlaps {data.conflictWith}'s leave — Design left thin. Q suggests shifting one by 2 days.</p></div> : <div className="glass-soft p-3 text-[var(--color-mist)]">No coverage conflict detected.</div>}
          <div className="glass-soft p-3"><div className="text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-1">Governing policy</div><span className="text-[var(--color-mist)]">Leave &amp; Holiday Policy v3.2 · {data.kind} accrual applies.</span></div>
        </div>}>
      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 text-[var(--color-mist)]"><Calendar className={`w-4 h-4 ${sla ? 'text-[var(--color-ember)]' : 'text-[var(--color-lumen)]'}`} /><span className="text-[13px] font-semibold uppercase tracking-wider capitalize">{data.kind} leave</span></div>
        {sla && <span className="text-[13px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-ember)]/20 text-[var(--color-ember)] border border-[var(--color-ember)]/30">SLA · 2H</span>}
        {data.status === 'approved' && <span className="text-[13px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-lumen)]/15 text-[var(--color-lumen)]">OK</span>}
        {data.status === 'rejected' && <span className="text-[13px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-coral)]/15 text-[var(--color-coral)]">NO</span>}</div>
      <div className="font-display font-medium">{data.personName}</div>
      <div className="text-sm font-mono text-[var(--color-mist)]">{data.startDate} → {data.endDate}</div>
    </TokenFrame>
  );
}

export function PayslipTokenView({ data, pos, dimmed, placement, reposition }: { data: PayslipToken; pos?: Pos; dimmed?: boolean; placement?: 'free' | 'flow'; reposition?: boolean }) {
  const { overridePayroll } = useWorkspace();
  const pooled = data.status === 'pooled';
  return (
    <TokenFrame id={data.id} kind="payslip" placement={placement} reposition={reposition} pos={pos} dimmed={dimmed} glow={pooled ? '0 0 24px rgba(255,107,107,0.22)' : undefined} shape="rect" tint={pooled ? 'coral' : 'halo'} className={`min-w-[240px] border-l-4 ${pooled ? 'border-l-[var(--color-coral)]' : 'border-l-[var(--color-lumen)]'}`} label={`Payslip ${data.month}`}
      expand={
        <div><div className="text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Compensation breakdown</div><div className="flex h-2 rounded-full overflow-hidden bg-white/5"><div className="w-[62%] bg-[var(--color-lumen)]" /><div className="w-[24%] bg-[var(--color-halo)]" /><div className="w-[14%] bg-[var(--color-ember)]" /></div><div className="grid grid-cols-3 gap-1 text-[13px] pt-2 text-[var(--color-mist)]"><Dot c="var(--color-lumen)" t="Base" /><Dot c="var(--color-halo)" t="HRA" /><Dot c="var(--color-ember)" t="TDS" /></div></div>}
      deep={
        <div className="flex flex-col gap-3">
          {pooled ? (<div className="rounded-xl border border-[var(--color-coral)]/30 bg-[var(--color-coral)]/10 p-3"><div className="flex items-center gap-2 text-[var(--color-coral)] mb-1"><TriangleAlert className="w-4 h-4" /><span className="text-[13px] font-semibold">Release blocked · awaiting sign-off</span></div><p className="text-[13px] text-[var(--color-mist)] leading-relaxed mb-3">{data.anomalyReason}</p><button onClick={(e) => { e.stopPropagation(); overridePayroll(data.id); }} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Approve correction</button></div>) : <div className="glass-soft p-3 text-[13px] text-[var(--color-mist)]">Released and reconciled. No anomalies on this run.</div>}
        </div>}>
      <div className="flex items-center justify-between mb-2 text-[var(--color-mist)]"><div className="flex items-center gap-2"><IndianRupee className="w-4 h-4" /><span className="text-[13px] font-semibold uppercase tracking-wider">Payroll · {data.month}</span></div></div>
      <div className="flex items-baseline gap-2"><Masked value={'₹' + data.amount.toLocaleString('en-IN')} className="text-2xl font-medium" />{pooled ? <span className="text-[13px] px-2 py-0.5 rounded-full bg-[var(--color-coral)]/15 text-[var(--color-coral)] border border-[var(--color-coral)]/30">POOLED</span> : <span className="text-[13px] px-2 py-0.5 rounded-full bg-[var(--color-lumen)]/15 text-[var(--color-lumen)] border border-[var(--color-lumen)]/30">RELEASED</span>}</div>
    </TokenFrame>
  );
}

const F = ({ k, v, accent }: { k: string; v: string; accent?: boolean }) => <div className="flex flex-col"><span className="text-[var(--color-trace)] mb-0.5">{k}</span><span className={`capitalize ${accent ? 'text-[var(--color-lumen)]' : 'text-[var(--color-vapor)]'}`}>{v}</span></div>;
const Dot = ({ c, t }: { c: string; t: string }) => <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{t}</span>;
