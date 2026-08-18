import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Plus, X, Trash2, GripVertical, Check, Clock, CalendarClock, ChevronDown, ChevronUp,
  ArrowDownToLine, Bold, Italic, Highlighter, List, ListOrdered, Palette, Type,
  StickyNote, ListTodo, Pencil, CornerDownRight, Timer, Workflow, Sparkles, Radio, Sun, Moon, LayoutGrid,
  Maximize2, Send, ArrowRight, Play, Pause, RotateCcw, Share2, Wand2,
} from 'lucide-react';
import { useWorkspace } from '../store';
import { hit, hitQBar, hitQBarRect, qProximity, qProximityRect, qBarCenter } from '../dropzone';
import { Area } from '../layout';
import { WorkspaceItem, WsKind, WsTodoEntry, WsListItem, WsSubtask, WsConnector } from '../types';
import { VibeApp } from './VibeApps';
import { ME_ID } from '../data';

const GRID = 24;                       // dense snap grid
const snap = (v: number) => Math.round(v / GRID) * GRID;
type Side = 'top' | 'right' | 'bottom' | 'left';

const KIND_META: Record<WsKind, { label: string; icon: any; color: string }> = {
  note: { label: 'Note', icon: StickyNote, color: '#FFB454' },
  list: { label: 'List', icon: List, color: '#52D0DD' },
  todo: { label: 'To-do', icon: ListTodo, color: '#6A3DFF' },
  tool: { label: 'Tool', icon: LayoutGrid, color: '#6A3DFF' },
};
const SWATCHES = ['#FFB454', '#FF6B6B', '#52D0DD', '#6A3DFF', '#7ED957', '#F49AC2', '#A6B6C6', '#FFD93D'];
const uid = (p: string) => `${p}${Date.now()}${Math.floor(Math.random() * 1000)}`;
const DEFAULT_SIZE: Record<WsKind, { w: number; h: number }> = { note: { w: 272, h: 210 }, list: { w: 264, h: 180 }, todo: { w: 280, h: 200 }, tool: { w: 340, h: 300 } };

// Timer presets in minutes: 1–5 by 1, then 5s to an hour, then 15-min steps to 4h.
const TIMER_STEPS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];
const stepTimer = (ms: number | undefined, dir: 1 | -1): number | undefined => {
  const cur = ms ? Math.round(ms / 60000) : 0;
  const idx = TIMER_STEPS.findIndex(v => v >= cur);
  if (dir > 0) { const next = idx < 0 ? 0 : Math.min(idx + (TIMER_STEPS[idx] === cur ? 1 : 0), TIMER_STEPS.length - 1); return TIMER_STEPS[next] * 60000; }
  // down
  if (!ms) return undefined; const below = [...TIMER_STEPS].reverse().find(v => v < cur); return below ? below * 60000 : undefined;
};
const fmtTimer = (ms: number) => { const m = Math.round(ms / 60000); return m < 60 ? `${m}m` : m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h${m % 60}`; };


export default function Workspace({ area }: { area: Area }) {
  const w = useWorkspace();
  const items = w.wsItems.filter(i => i.lens === w.lens);
  const conns = w.wsConnectors.filter(c => items.some(i => i.id === c.fromId) && items.some(i => i.id === c.toId));
  const surfaceRef = useRef<HTMLDivElement>(null);

  // ── infinite canvas: pan offset. screen = world + pan. ──
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan); panRef.current = pan;

  // live measured sizes (world-independent) keyed by id
  const sizes = useRef<Record<string, { w: number; h: number }>>({});
  const [, force] = useState(0);
  const bump = useCallback(() => force(n => (n + 1) % 100000), []);
  const reportSize = useCallback((id: string, s: { w: number; h: number }) => { const prev = sizes.current[id]; if (!prev || prev.w !== s.w || prev.h !== s.h) { sizes.current[id] = s; bump(); } }, [bump]);

  // a single active pointer gesture (pan | drag-card | connect | resize)
  type Gesture =
    | { kind: 'pan'; sx: number; sy: number; ox: number; oy: number }
    | { kind: 'drag'; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean }
    | { kind: 'connect'; id: string; side: Side; t0: number; sx: number; sy: number; moved: boolean }
    | { kind: 'resize'; id: string; sx: number; sy: number; ow: number; oh: number };
  const gesture = useRef<Gesture | null>(null);
  const [, setGestureTick] = useState(0);
  const rerenderGesture = () => setGestureTick(t => (t + 1) % 100000);

  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);   // world coords of pointer during connect
  const [hoverTarget, setHoverTarget] = useState<{ id: string; side: Side } | null>(null);
  const [selConn, setSelConn] = useState<string | null>(null);
  const [dragSnap, setDragSnap] = useState<{ id: string; x: number; y: number } | null>(null);
  const [qPull, setQPull] = useState<{ id: string; title: string; color: string; x: number; y: number; tx: number; ty: number } | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'card' | 'board'; id: string; name: string; count?: number } | null>(null);
  const [anchorMenu, setAnchorMenu] = useState<{ id: string; side: Side; x: number; y: number } | null>(null);

  // group members by flowboard (only boards with >=2 members render a section)
  const boardGroups: Record<string, WorkspaceItem[]> = {};
  for (const it of items) { if (it.flowboardId) (boardGroups[it.flowboardId] ??= []).push(it); }
  Object.keys(boardGroups).forEach(k => { if (boardGroups[k].length < 2) delete boardGroups[k]; });

  const rectOf = (id: string) => { const it = items.find(i => i.id === id); const s = sizes.current[id]; if (!it || !s) return null; const d = dragSnap && dragSnap.id === id ? dragSnap : null; return { x: d ? d.x : it.pos.x, y: d ? d.y : it.pos.y, w: s.w, h: s.h }; };
  const anchor = (id: string, side: Side) => { const r = rectOf(id); if (!r) return null; switch (side) { case 'top': return { x: r.x + r.w / 2, y: r.y }; case 'bottom': return { x: r.x + r.w / 2, y: r.y + r.h }; case 'left': return { x: r.x, y: r.y + r.h / 2 }; case 'right': return { x: r.x + r.w, y: r.y + r.h / 2 }; } };
  const bestSide = (id: string, from: { x: number; y: number }): Side => { const r = rectOf(id); if (!r) return 'left'; const cx = r.x + r.w / 2, cy = r.y + r.h / 2; const dx = from.x - cx, dy = from.y - cy; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'); };
  const extend = (p: { x: number; y: number }, side: Side, d: number) => side === 'top' ? { x: p.x, y: p.y - d } : side === 'bottom' ? { x: p.x, y: p.y + d } : side === 'left' ? { x: p.x - d, y: p.y } : { x: p.x + d, y: p.y };
  const pathFor = (a: { x: number; y: number }, aSide: Side, b: { x: number; y: number }, bSide: Side) => { const off = 44; const ap = extend(a, aSide, off), bp = extend(b, bSide, off); return `M ${a.x} ${a.y} C ${ap.x} ${ap.y}, ${bp.x} ${bp.y}, ${b.x} ${b.y}`; };


  // ── unified pointer handling on the surface ──
  const startPan = (e: React.PointerEvent) => { gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }; setSelConn(null); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); rerenderGesture(); };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current; if (!g) return;
    if (g.kind === 'pan') { setPan({ x: g.ox + (e.clientX - g.sx), y: g.oy + (e.clientY - g.sy) }); return; }
    if (g.kind === 'drag') {
      const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
      if (!g.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      g.moved = true;
      const nx = snap(g.ox + dx), ny = snap(g.oy + dy);
      const it = items.find(i => i.id === g.id);
      const sb = surfaceRef.current?.getBoundingClientRect();
      if (it && sb) { const sz = it.size ?? DEFAULT_SIZE[it.kind]; const left = sb.left + nx + pan.x, top = sb.top + ny + pan.y; w.setQHover(qProximityRect({ left, top, right: left + sz.w, bottom: top + sz.h })); }
      setDragSnap({ id: g.id, x: nx, y: ny });
      return;
    }
    if (g.kind === 'resize') { const it = items.find(i => i.id === g.id); if (!it) return; w.wsResize(g.id, Math.max(200, g.ow + (e.clientX - g.sx)), Math.max(120, g.oh + (e.clientY - g.sy))); return; }
    if (g.kind === 'connect') {
      if (!g.moved && (Math.abs(e.clientX - g.sx) + Math.abs(e.clientY - g.sy)) > 6) g.moved = true;
      const b = surfaceRef.current!.getBoundingClientRect();
      const wp = { x: e.clientX - b.left - pan.x, y: e.clientY - b.top - pan.y };
      setPtr(wp);
      let hit: { id: string; side: Side } | null = null;
      for (const it of items) { if (it.id === g.id) continue; const r = rectOf(it.id); if (!r) continue; if (wp.x >= r.x - 10 && wp.x <= r.x + r.w + 10 && wp.y >= r.y - 10 && wp.y <= r.y + r.h + 10) { const src = anchor(g.id, g.side) ?? wp; hit = { id: it.id, side: bestSide(it.id, src) }; break; } }
      setHoverTarget(hit);
    }
  };

  const endGesture = (e: React.PointerEvent) => {
    const g = gesture.current; gesture.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    if (!g) return;
    if (g.kind === 'drag') {
      // drag onto the Q bar → ask Q about this card (hit-test the CARD RECT before clearing dragging)
      const it0 = items.find(i => i.id === g.id);
      const sb = surfaceRef.current?.getBoundingClientRect();
      let overQ = false;
      if (g.moved && it0 && sb && dragSnap) { const sz = it0.size ?? DEFAULT_SIZE[it0.kind]; const left = sb.left + dragSnap.x + pan.x, top = sb.top + dragSnap.y + pan.y; overQ = hitQBarRect({ left, top, right: left + sz.w, bottom: top + sz.h }); }
      w.setDragging(false);
      if (overQ) {
        const it = it0;
        const qc = qBarCenter();
        if (it && qc) setQPull({ id: g.id, title: it.title, color: it.color, x: e.clientX, y: e.clientY, tx: qc.cx, ty: qc.cy });
        setTimeout(() => { w.wsToQ(g.id); setQPull(null); }, 380);
        setDragSnap(null); w.setDragging(false); rerenderGesture(); return;
      }
      if (g.moved && dragSnap) w.wsMove(g.id, dragSnap.x, dragSnap.y); setDragSnap(null);
    }
    else if (g.kind === 'connect') {
      const quick = Date.now() - g.t0 < 300 && !g.moved;
      if (hoverTarget) w.wsConnect(g.id, hoverTarget.id, g.side, hoverTarget.side);
      else if (quick) { const a = anchor(g.id, g.side); if (a) setAnchorMenu({ id: g.id, side: g.side, x: a.x + pan.x, y: a.y + pan.y }); }
      setPtr(null); setHoverTarget(null);
    }
    else if (g.kind === 'resize') { const it = items.find(i => i.id === g.id); if (it?.size) w.wsResize(g.id, snap(it.size.w), snap(it.size.h)); }
    rerenderGesture();
  };

  // handlers passed to cards
  const beginDrag = (id: string, e: React.PointerEvent) => { const it = items.find(i => i.id === id); if (!it) return; w.wsFront(id); w.setDragging(true); gesture.current = { kind: 'drag', id, sx: e.clientX, sy: e.clientY, ox: it.pos.x, oy: it.pos.y, moved: false }; surfaceRef.current?.setPointerCapture?.(e.pointerId); rerenderGesture(); };
  const beginConnect = (id: string, side: Side, e: React.PointerEvent) => { gesture.current = { kind: 'connect', id, side, t0: Date.now(), sx: e.clientX, sy: e.clientY, moved: false }; surfaceRef.current?.setPointerCapture?.(e.pointerId); const b = surfaceRef.current!.getBoundingClientRect(); setPtr({ x: e.clientX - b.left - pan.x, y: e.clientY - b.top - pan.y }); rerenderGesture(); };
  const beginResize = (id: string, e: React.PointerEvent) => { const it = items.find(i => i.id === id); const s = sizes.current[id]; if (!it || !s) return; w.wsFront(id); gesture.current = { kind: 'resize', id, sx: e.clientX, sy: e.clientY, ow: it.size?.w ?? s.w, oh: it.size?.h ?? s.h }; surfaceRef.current?.setPointerCapture?.(e.pointerId); rerenderGesture(); };

  const g = gesture.current;
  const connecting = g?.kind === 'connect' ? g : null;

  return (
    <div ref={surfaceRef} className="absolute overflow-visible touch-none" style={{ left: area.x, top: area.y, width: area.w, height: area.h, cursor: g?.kind === 'pan' ? 'grabbing' : undefined }}
      onPointerDown={(e) => { if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) startPan(e); }}
      onPointerMove={onPointerMove} onPointerUp={endGesture} onPointerCancel={endGesture}>

      {/* dot grid (pans with canvas) */}
      <div data-canvas className="absolute inset-0" aria-hidden style={{ backgroundImage: 'radial-gradient(circle, var(--color-glass-edge) 1px, transparent 1px)', backgroundSize: `${GRID}px ${GRID}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.45 }} />

      {/* connector layer — one SVG spanning the viewport, translated by pan (matches card space) */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          {conns.map(c => <marker key={`m${c.id}`} id={`ah-${c.id}`} markerWidth="10" markerHeight="10" refX="7.5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={c.color ?? 'var(--color-halo)'} /></marker>)}
          {conns.map(c => <marker key={`ms${c.id}`} id={`ah-s-${c.id}`} markerWidth="10" markerHeight="10" refX="2.5" refY="5" orient="auto"><path d="M10,0 L0,5 L10,10 Z" fill={c.color ?? 'var(--color-halo)'} /></marker>)}
        </defs>
        <g transform={`translate(${pan.x},${pan.y})`}>
          {conns.map(c => { const fs = c.fromSide ?? bestSide(c.fromId, anchor(c.toId, c.toSide ?? 'left') ?? { x: 0, y: 0 }); const ts = c.toSide ?? bestSide(c.toId, anchor(c.fromId, fs) ?? { x: 0, y: 0 }); const a = anchor(c.fromId, fs), b = anchor(c.toId, ts); if (!a || !b) return null; const col = c.color ?? 'var(--color-halo)'; const active = selConn === c.id; const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; return (
            <g key={c.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onPointerDown={(e) => { e.stopPropagation(); setSelConn(active ? null : c.id); }}>
              <path d={pathFor(a, fs, b, ts)} fill="none" stroke="transparent" strokeWidth={18} />
              <path d={pathFor(a, fs, b, ts)} fill="none" stroke={col} strokeWidth={active ? 2.6 : 1.8} strokeOpacity={active ? 1 : 0.8} markerEnd={c.arrowEnd ? `url(#ah-${c.id})` : undefined} markerStart={c.arrowStart ? `url(#ah-s-${c.id})` : undefined} />
              {c.label && <text x={mid.x} y={mid.y - 7} textAnchor="middle" style={{ fontSize: 11, fontFamily: 'Outfit', fill: 'var(--color-vapor)', paintOrder: 'stroke', stroke: 'var(--color-abyss)', strokeWidth: 3 }}>{c.label}</text>}
            </g>
          ); })}
          {/* live drag connector */}
          {connecting && ptr && (() => { const a = anchor(connecting.id, connecting.side); if (!a) return null; const end = hoverTarget ? (anchor(hoverTarget.id, hoverTarget.side) ?? ptr) : ptr; const es: Side = hoverTarget ? hoverTarget.side : bestSide(connecting.id, ptr); return <path d={pathFor(a, connecting.side, end, es)} fill="none" stroke="var(--color-lumen)" strokeWidth={2.2} strokeDasharray="7 5" />; })()}
          {/* snap guides */}
          {dragSnap && (() => { const r = rectOf(dragSnap.id); if (!r) return null; return <><line x1={r.x} y1={-4000} x2={r.x} y2={4000} stroke="var(--color-lumen)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} /><line x1={-4000} y1={r.y} x2={4000} y2={r.y} stroke="var(--color-lumen)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} /></>; })()}
        </g>
      </svg>

      {/* flowboard sections (behind cards) */}
      {Object.entries(boardGroups).map(([fb, members]) => {
        const xs = members.map(m => (dragSnap && dragSnap.id === m.id ? dragSnap.x : m.pos.x));
        const ys = members.map(m => (dragSnap && dragSnap.id === m.id ? dragSnap.y : m.pos.y));
        const ws2 = members.map(m => sizes.current[m.id]?.w ?? DEFAULT_SIZE[m.kind].w);
        const hs = members.map(m => (m.size?.h ?? DEFAULT_SIZE[m.kind].h));
        const PAD = 28 + (w.wsBoards[fb]?.pad ?? 0), TITLE = 30;
        const minX = Math.min(...xs) - PAD, minY = Math.min(...ys) - PAD - TITLE;
        const maxX = Math.max(...members.map((m, i) => xs[i] + ws2[i])) + PAD;
        const maxY = Math.max(...members.map((m, i) => ys[i] + hs[i])) + PAD;
        const col = members[0]?.color ?? 'var(--color-halo)';
        return <FlowboardSection key={fb} fb={fb} x={minX + pan.x} y={minY + pan.y} w={maxX - minX} h={maxY - minY} color={col}
          name={w.wsBoards[fb]?.name ?? 'Flowboard'} pad={w.wsBoards[fb]?.pad ?? 0}
          onMove={(dx, dy) => w.wsBoardMove(fb, dx, dy)} onOrganize={() => w.wsBoardOrganize(fb)} onScale={(delta) => w.wsBoardPad(fb, (w.wsBoards[fb]?.pad ?? 0) + delta)}
          onRename={(n) => w.wsBoardName(fb, n)} onClose={() => setConfirm({ kind: 'board', id: fb, name: w.wsBoards[fb]?.name ?? 'this flowboard', count: members.length })} />;
      })}

      {/* cards (positioned in screen space = world + pan) */}
      {items.map(item => { const r = dragSnap && dragSnap.id === item.id ? dragSnap : item.pos; return (
        <WsCard key={item.id} item={item} screenX={r.x + pan.x} screenY={r.y + pan.y}
          reportSize={reportSize} connecting={!!connecting} isConnectSource={connecting?.id === item.id} isConnectTarget={hoverTarget?.id === item.id}
          dragging={g?.kind === 'drag' && g.id === item.id}
          onBeginDrag={beginDrag} onBeginConnect={beginConnect} onBeginResize={beginResize} inFlowboard={!!item.flowboardId} onRequestClose={() => setConfirm({ kind: 'card', id: item.id, name: item.title })} />
      ); })}

      {/* connector inspector */}
      {selConn && (() => { const c = conns.find(x => x.id === selConn); if (!c) return null; const fs = c.fromSide ?? 'right', ts = c.toSide ?? 'left'; const a = anchor(c.fromId, fs), b = anchor(c.toId, ts); if (!a || !b) return null; const mid = { x: (a.x + b.x) / 2 + pan.x, y: (a.y + b.y) / 2 + pan.y }; return (
        <div className="absolute z-50 glass-elevated p-2 rounded-xl flex items-center gap-2 flex-wrap" style={{ left: Math.max(4, Math.min(area.w - 236, mid.x - 100)), top: Math.max(4, mid.y + 12), width: 232 }} onPointerDown={e => e.stopPropagation()}>
          <input defaultValue={c.label ?? ''} onBlur={e => w.wsConnUpdate(c.id, { label: e.target.value || undefined })} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} placeholder="Label this connection…" className="w-full bg-transparent outline-none text-[13px] text-[var(--color-vapor)] border-b border-[var(--color-glass-edge)] pb-1 mb-1" />
          <div className="flex gap-0.5">{['#6A3DFF', '#52D0DD', '#FFB454', '#FF6B6B', '#7ED957'].map(col => <button key={col} onClick={() => w.wsConnUpdate(c.id, { color: col })} className="w-4 h-4 rounded-full border border-white/20" style={{ background: col }} />)}</div>
          <span className="w-px h-4 bg-[var(--color-glass-edge)]" />
          <button onClick={() => w.wsConnUpdate(c.id, { arrowStart: !c.arrowStart })} title="Arrowhead at start" className={`w-6 h-6 grid place-items-center rounded ${c.arrowStart ? 'text-[var(--color-lumen)] bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:bg-white/10'}`}><ArrowRight className="w-3.5 h-3.5 rotate-180" /></button>
          <button onClick={() => w.wsConnUpdate(c.id, { arrowEnd: !c.arrowEnd })} title="Arrowhead at end" className={`w-6 h-6 grid place-items-center rounded ${c.arrowEnd ? 'text-[var(--color-lumen)] bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:bg-white/10'}`}><ArrowRight className="w-3.5 h-3.5" /></button>
          <span className="flex-1" />
          <button onClick={() => { w.wsDisconnect(c.id); setSelConn(null); }} title="Remove connection" className="w-6 h-6 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-3.5 h-3.5" /></button>
        </div>
      ); })()}

      {/* canvas utilities (recenter only — adding is via the universal + button) */}
      {(pan.x !== 0 || pan.y !== 0) && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ bottom: 14 }}>
          <button onClick={() => setPan({ x: 0, y: 0 })} title="Recenter canvas" className="glass-elevated px-3 py-2 rounded-full flex items-center gap-2 text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)] shadow-lg"><RotateCcw className="w-3.5 h-3.5" /> Recenter</button>
        </div>
      )}

      {/* pull-in ghost: on drop-to-Q the card flies into the Q bar, then the real card stays put */}
      {qPull && createPortal(
        <motion.div initial={{ left: qPull.x - 90, top: qPull.y - 26, opacity: 0.95, scale: 1 }} animate={{ left: qPull.tx - 30, top: qPull.ty - 14, opacity: 0, scale: 0.35 }} transition={{ duration: 0.36, ease: [0.4, 0, 0.2, 1] }}
          className="fixed z-[9998] pointer-events-none glass-elevated rounded-xl px-3 py-2 shadow-2xl" style={{ borderTop: `3px solid ${qPull.color}`, width: 180 }}>
          <span className="text-[13px] font-semibold text-[var(--color-vapor)] truncate block">{qPull.title}</span>
          <span className="text-[11px] text-[var(--color-lumen)]">→ asking Q…</span>
        </motion.div>, document.body)}

      {/* anchor mini-menu: click an empty anchor to create + connect a new card */}
      {anchorMenu && (
        <>
          <div className="fixed inset-0 z-[150]" onPointerDown={() => setAnchorMenu(null)} />
          <div className="absolute z-[160] glass-elevated p-1 rounded-xl shadow-2xl flex flex-col gap-0.5 w-40" style={{ left: anchorMenu.x + 8, top: anchorMenu.y + 8 }} onPointerDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2 pt-1 pb-0.5"><span className="text-[11px] uppercase tracking-wider text-[var(--color-trace)]">Add & connect</span><button onClick={() => setAnchorMenu(null)} className="w-4 h-4 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-3 h-3" /></button></div>
            {(['note', 'list', 'todo'] as WsKind[]).map(k => { const M = KIND_META[k]; const Icon = M.icon; return (
              <button key={k} onClick={() => { w.wsAddConnected(anchorMenu.id, anchorMenu.side, k); setAnchorMenu(null); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] text-[var(--color-vapor)] hover:bg-white/8 transition-colors">
                <span className="w-6 h-6 rounded-md grid place-items-center shrink-0" style={{ background: `color-mix(in srgb, ${M.color} 18%, transparent)`, color: M.color }}><Icon className="w-3.5 h-3.5" /></span>{M.label}
              </button>
            ); })}
          </div>
        </>
      )}

      {/* confirm modal — full-screen fixed overlay */}
      {confirm && (
        <div className="fixed inset-0 z-[200] grid place-items-center" onPointerDown={e => e.stopPropagation()}>
          <div className="fixed inset-0 bg-[var(--color-abyss)]/70 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative glass-elevated rounded-2xl p-5 w-[340px] shadow-2xl">
            <div className="flex items-center gap-3 mb-2"><span className="w-9 h-9 rounded-xl grid place-items-center bg-[var(--color-coral)]/15 text-[var(--color-coral)]"><Trash2 className="w-4 h-4" /></span>
              <h3 className="font-display text-[15px] text-[var(--color-vapor)]">{confirm.kind === 'board' ? 'Delete flowboard?' : 'Delete card?'}</h3></div>
            <p className="text-[13px] text-[var(--color-mist)] leading-relaxed mb-4">
              {confirm.kind === 'board' ? <>This removes <b className="text-[var(--color-vapor)]">{confirm.name}</b> and all <b className="text-[var(--color-vapor)]">{confirm.count}</b> cards inside it. This can\u2019t be undone.</> : <>\u201c<b className="text-[var(--color-vapor)]">{confirm.name}</b>\u201d will be permanently removed.</>}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-full text-[13px] glass-soft hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => { if (confirm.kind === 'board') w.wsBoardDelete(confirm.id); else w.wsDelete(confirm.id); setConfirm(null); }} className="px-4 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-coral)]/20 text-[var(--color-coral)] hover:bg-[var(--color-coral)]/30 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* empty state */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none">
          <span className="inline-grid place-items-center w-16 h-16 rounded-2xl glass-soft mb-3"><StickyNote className="w-7 h-7 text-[var(--color-ember)]" /></span>
          <div className="font-display text-xl text-[var(--color-vapor)]">Your workspace</div>
          <p className="text-sm text-[var(--color-mist)] mt-2 text-center max-w-xs">An infinite canvas. Add a card below, drag it by its top-left handle, link cards into flowboards from the side dots, and drag empty space to pan.</p>
        </div>
      )}
    </div>
  );
}

function WsCard({ item, screenX, screenY, reportSize, connecting, isConnectSource, isConnectTarget, dragging, onBeginDrag, onBeginConnect, onBeginResize, inFlowboard, onRequestClose }: {
  item: WorkspaceItem; screenX: number; screenY: number;
  reportSize: (id: string, s: { w: number; h: number }) => void;
  connecting: boolean; isConnectSource: boolean; isConnectTarget: boolean; dragging: boolean;
  onBeginDrag: (id: string, e: React.PointerEvent) => void; onBeginConnect: (id: string, side: Side, e: React.PointerEvent) => void; onBeginResize: (id: string, e: React.PointerEvent) => void; inFlowboard: boolean; onRequestClose: () => void;
}) {
  const w = useWorkspace();
  const [editingTitle, setEditingTitle] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [menu, setMenu] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => { if (!menu) setShareOpen(false); }, [menu]);
  const cardRef = useRef<HTMLDivElement>(null);
  const size = item.size ?? DEFAULT_SIZE[item.kind];

  useEffect(() => { const el = cardRef.current; if (!el) return; const measure = () => reportSize(item.id, { w: el.offsetWidth, h: el.offsetHeight }); measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect(); }, [item.id, size.w, size.h, reportSize]);

  const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];
  const sidePos: Record<Side, string> = { top: 'left-1/2 -translate-x-1/2 -top-1.5', right: '-right-1.5 top-1/2 -translate-y-1/2', bottom: 'left-1/2 -translate-x-1/2 -bottom-1.5', left: '-left-1.5 top-1/2 -translate-y-1/2' };
  const dim = connecting && !isConnectSource && !isConnectTarget;

  return (
    <div ref={cardRef} className={`group absolute select-none ${dragging ? 'z-[100]' : ''}`}
      style={{ left: screenX, top: screenY, width: size.w, zIndex: dragging ? 100 : item.z, opacity: dim ? 0.55 : 1, transition: dragging ? 'none' : 'opacity 0.15s' }}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest('[data-nodrag]')) return; w.wsFront(item.id); }}>

      {/* ── uniform corner-handle grammar (matches tokens): TL move · TR peel-n/a · BL send · BR close ──
          For workspace we map: TL = move, TR = resize, BL = send/share, BR = CLOSE (uniform close corner). */}
      <button data-handle aria-label="Move" onPointerDown={(e) => { e.stopPropagation(); onBeginDrag(item.id, e); }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -left-2.5 -top-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-vapor)] z-[85]"><GripVertical className="w-3.5 h-3.5" /></button>
      <button data-handle aria-label="Resize" onPointerDown={(e) => { e.stopPropagation(); onBeginResize(item.id, e); }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -right-2.5 -top-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated cursor-nesw-resize text-[var(--color-mist)] hover:text-[var(--color-lumen)] z-[85]"><Maximize2 className="w-3 h-3" /></button>
      <button data-handle aria-label="Send or share" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setMenu(m => !m); }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -left-2.5 -bottom-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-lumen)] z-[85]"><Send className="w-3 h-3" /></button>
      <button data-handle aria-label="Close — delete card" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onRequestClose(); }}
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity absolute -right-2.5 -bottom-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-coral)] z-[85]"><X className="w-3.5 h-3.5" /></button>

      {/* four side anchors for connections */}
      {SIDES.map(side => (
        <button key={side} data-handle aria-label={`Connect from ${side}`}
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onBeginConnect(item.id, side, e); }}
          className={`absolute ${sidePos[side]} w-3 h-3 rounded-full bg-[var(--color-halo)] border-2 border-[var(--color-abyss)] z-[80] cursor-crosshair transition-opacity ${connecting ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`} style={{ boxShadow: '0 0 6px var(--color-halo)' }} />
      ))}

      {/* send/share menu */}
      {menu && (
        <div className="absolute left-0 -bottom-1 translate-y-full z-50 w-52 glass-elevated p-1 flex flex-col gap-0.5" style={{ borderRadius: 14 }} onPointerDown={e => e.stopPropagation()}>
          {!shareOpen ? (<>
            <button onClick={() => { w.wsToQ(item.id); setMenu(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[13px] text-[var(--color-vapor)] hover:bg-white/8"><Sparkles className="w-3.5 h-3.5 text-[var(--color-lumen)]" /> Ask Q for actions</button>
            <button onClick={() => { w.wsToSignal(item.id); setMenu(false); }} disabled={inFlowboard} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[13px] text-[var(--color-vapor)] hover:bg-white/8 disabled:opacity-40 disabled:cursor-not-allowed"><Radio className="w-3.5 h-3.5 text-[var(--color-ember)]" /> Send to Signal</button>
            {(item.kind === 'list' || item.kind === 'todo') && (w.lens === 'manager' || w.lens === 'hr') && <button onClick={() => { w.wsToCanvas(item.id); setMenu(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[13px] text-[var(--color-vapor)] hover:bg-white/8"><Wand2 className="w-3.5 h-3.5 text-[var(--color-halo-text)]" /> Turn into Canvas tool</button>}
            <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[13px] text-[var(--color-vapor)] hover:bg-white/8"><Share2 className="w-3.5 h-3.5 text-[var(--color-halo-text)]" /> Share with… {item.sharedWith?.length ? <span className="ml-auto text-[11px] text-[var(--color-trace)]">{item.sharedWith.length}</span> : null}</button>
            {inFlowboard && <span className="text-[11px] text-[var(--color-trace)] px-3 pb-1">Detach from the board to send.</span>}
          </>) : (<>
            <button onClick={() => setShareOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] text-[var(--color-mist)] hover:bg-white/8"><ArrowRight className="w-3 h-3 rotate-180" /> Share with a teammate</button>
            <div className="max-h-44 overflow-auto panel-scroll">
              {w.people.filter(p => p.id !== ME_ID).map(p => { const on = item.sharedWith?.includes(p.id); return (
                <button key={p.id} onClick={() => { on ? w.wsUnshare(item.id, p.id) : w.wsShare(item.id, p.id); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-[13px] hover:bg-white/8">
                  <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 text-[11px] font-semibold ${on ? 'bg-[var(--color-lumen)]/20 text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)]'}`}>{p.name.split(' ').map(w2 => w2[0]).slice(0, 2).join('')}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[var(--color-vapor)]">{p.name}</span><span className="block text-[11px] text-[var(--color-trace)] truncate">{p.role}</span></span>
                  {on && <Check className="w-3.5 h-3.5 text-[var(--color-lumen)] shrink-0" />}
                </button>
              ); })}
            </div>
          </>)}
        </div>
      )}

      <div className={`glass-elevated shadow-xl rounded-[16px] flex flex-col ${item.kind === 'note' ? 'overflow-visible' : 'overflow-hidden'} ${item.light ? 'ws-light' : ''} ${isConnectTarget ? 'ring-2 ring-[var(--color-lumen)]' : ''}`} style={{ height: size.h, borderTop: `3px solid ${item.color}`, boxShadow: inFlowboard ? `0 0 0 1px color-mix(in srgb, ${item.color} 45%, transparent), 0 12px 34px rgba(0,0,0,0.34)` : undefined }}>
        <WsHeader item={item} editingTitle={editingTitle} setEditingTitle={setEditingTitle} showColor={showColor} setShowColor={setShowColor} onMoveHandle={onBeginDrag} inFlowboard={inFlowboard} />
        <div className={`flex-1 min-h-0 flex flex-col ${item.kind === 'note' ? 'overflow-visible rounded-b-[16px]' : 'overflow-auto panel-scroll'} ${item.light ? 'bg-white' : 'bg-[var(--color-glass)]'}`}>
          {item.kind === 'note' && <NoteBody item={item} />}
          {item.kind === 'list' && <ListBody item={item} />}
          {item.kind === 'todo' && <TodoBody item={item} />}
          {item.kind === 'tool' && <ToolBody item={item} />}
        </div>
      </div>
    </div>
  );
}

// Header doubles as a drag zone (press-and-drag anywhere on it moves the card).
function WsHeader({ item, editingTitle, setEditingTitle, showColor, setShowColor, onMoveHandle, inFlowboard }: { item: WorkspaceItem; editingTitle: boolean; setEditingTitle: (b: boolean) => void; showColor: boolean; setShowColor: (b: boolean) => void; onMoveHandle: (id: string, e: React.PointerEvent) => void; inFlowboard: boolean }) {
  const w = useWorkspace();
  const M = KIND_META[item.kind]; const Icon = M.icon;
  return (
    <div className="ws-head flex items-center gap-2 px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing rounded-t-[13px]" style={{ background: item.light ? `color-mix(in srgb, ${item.color} 82%, #000 4%)` : `color-mix(in srgb, ${item.color} 12%, transparent)` }}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest('[data-nodrag]')) return; onMoveHandle(item.id, e); }}>
      <span className="w-5 h-5 rounded grid place-items-center shrink-0" style={{ color: item.light ? '#ffffff' : item.color }}><Icon className="w-3.5 h-3.5" /></span>
      {editingTitle ? (
        <input autoFocus defaultValue={item.title} data-nodrag onBlur={e => { w.wsUpdate(item.id, { title: e.target.value || M.label }); setEditingTitle(false); }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} onPointerDown={e => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent outline-none text-[13px] font-semibold text-[var(--color-vapor)] border-b border-[var(--color-glass-edge)]" />
      ) : (
        <button data-nodrag onClick={() => setEditingTitle(true)} onPointerDown={e => e.stopPropagation()} className="flex-1 min-w-0 text-left ws-head-title text-[13px] font-semibold text-[var(--color-vapor)] truncate flex items-center gap-2 group/t">
          {item.title}<Pencil className="w-2.5 h-2.5 opacity-0 group-hover/t:opacity-60 shrink-0" />
        </button>
      )}
      {inFlowboard && <span data-nodrag className="ws-board-badge text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-halo)]/25 text-[var(--color-halo-text)] flex items-center gap-1 shrink-0"><Workflow className="w-2.5 h-2.5" /> board</span>}
      {!!item.sharedWith?.length && <span data-nodrag title={`Shared with ${item.sharedWith.length} ${item.sharedWith.length === 1 ? 'person' : 'people'}`} className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-lumen)]/20 text-[var(--color-lumen)] flex items-center gap-1 shrink-0"><Share2 className="w-2.5 h-2.5" /> {item.sharedWith.length}</span>}
      <button data-nodrag onClick={() => w.wsUpdate(item.id, { light: !item.light })} onPointerDown={e => e.stopPropagation()} title={item.light ? 'Switch to dark' : 'Switch to light (accessibility)'} className="w-5 h-5 grid place-items-center rounded text-[var(--color-mist)] hover:text-[var(--color-vapor)] shrink-0">{item.light ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}</button>
      <div className="relative shrink-0" data-nodrag onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => setShowColor(!showColor)} aria-label="Recolor" className="w-4 h-4 rounded-full border border-white/20 block" style={{ background: item.color }} />
        {showColor && (
          <div className="absolute right-0 top-6 z-50 glass-elevated p-2 rounded-xl grid grid-cols-4 gap-2 w-32">
            {SWATCHES.map(c => <button key={c} onClick={() => { w.wsUpdate(item.id, { color: c }); setShowColor(false); }} className="w-5 h-5 rounded-full border border-white/15 hover:scale-110 transition-transform" style={{ background: c }} />)}
            <label className="col-span-4 mt-1 flex items-center justify-center gap-1 py-2 rounded-lg glass-soft cursor-pointer text-[11px] text-[var(--color-mist)]"><Palette className="w-3 h-3" /> Custom<input type="color" value={item.color} onChange={e => w.wsUpdate(item.id, { color: e.target.value })} className="w-0 h-0 opacity-0 absolute" /></label>
          </div>
        )}
      </div>
    </div>
  );
}
/* ─────────────── NOTE: rich text ─────────────── */
const NOTE_FONTS = [
  { id: 'ws-font-inter', label: 'Inter (sans)' },
  { id: 'ws-font-worksans', label: 'Work Sans (sans)' },
  { id: 'ws-font-lora', label: 'Lora (serif)' },
  { id: 'ws-font-playfair', label: 'Playfair (serif)' },
  { id: 'ws-font-mono', label: 'JetBrains (mono)' },
];
const FONT_SIZES = [{ label: 'S', px: '13px' }, { label: 'M', px: '15px' }, { label: 'L', px: '18px' }, { label: 'XL', px: '22px' }];
const TEXT_COLORS = ['#F2F6FA', '#52D0DD', '#FFB454', '#FF6B6B', '#6A3DFF', '#7ED957'];

function ToolBody({ item }: { item: WorkspaceItem }) {
  const w = useWorkspace();
  const app = w.vibeApps.find(v => v.id === item.toolRef);
  if (!app) return (
    <div className="p-3 h-full flex flex-col items-center justify-center gap-2 text-center" data-nodrag>
      <span className="text-[13px] text-[var(--color-trace)]">This tool was removed from Canvas.</span>
      <button onClick={() => w.wsDelete(item.id)} className="text-[12px] px-3 py-1 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]">Remove card</button>
    </div>
  );
  return (
    <div className="p-3 h-full overflow-auto panel-scroll" data-nodrag>
      <VibeApp template={app.template} parts={app.parts} config={app.config} />
      <button onClick={() => w.setVibe(true)} className="mt-2 w-full py-2 rounded-lg text-[12px] text-[var(--color-halo-text)] bg-[var(--color-halo)]/12 hover:bg-[var(--color-halo)]/20 transition-colors flex items-center justify-center gap-2"><Wand2 className="w-3 h-3" /> Edit in Canvas</button>
    </div>
  );
}

function NoteBody({ item }: { item: WorkspaceItem }) {
  const w = useWorkspace();
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [font, setFont] = useState('ws-font-inter');
  const [menu, setMenu] = useState<{ id: 'list' | 'size' | 'color' | 'font'; x: number; y: number } | null>(null);

  useEffect(() => { if (ref.current && ref.current.innerHTML !== (item.noteHtml ?? '')) ref.current.innerHTML = item.noteHtml ?? ''; /* eslint-disable-next-line */ }, []);
  const save = () => { if (ref.current) w.wsUpdate(item.id, { noteHtml: ref.current.innerHTML }); };
  useEffect(() => {
    const handler = () => { const el = ref.current; if (!el) return; const s = window.getSelection(); if (s && s.rangeCount && el.contains(s.anchorNode)) savedRange.current = s.getRangeAt(0).cloneRange(); };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);
  const [active, setActive] = useState<{ bold: boolean; italic: boolean; highlight: boolean }>({ bold: false, italic: false, highlight: false });
  const refreshActive = () => {
    const el = ref.current; if (!el) return;
    const s = window.getSelection();
    const inEditor = s && s.rangeCount && el.contains(s.anchorNode);
    if (!inEditor) return;
    let hl = false;
    try {
      // detect a non-transparent background on the selection's element chain
      let node: Node | null = s!.anchorNode;
      while (node && node !== el) { if (node.nodeType === 1) { const bg = getComputedStyle(node as Element).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { hl = true; break; } } node = node.parentNode; }
    } catch { /* noop */ }
    try { setActive({ bold: document.queryCommandState('bold'), italic: document.queryCommandState('italic'), highlight: hl }); } catch { /* noop */ }
  };
  useEffect(() => {
    const h = () => refreshActive();
    document.addEventListener('selectionchange', h);
    return () => document.removeEventListener('selectionchange', h);
  }, []);

  const runCmd = (c: string, v?: string) => {
    const el = ref.current; if (!el) return;
    el.focus();
    const s = window.getSelection();
    if (s) {
      // restore the last in-editor selection; if none, select all content so the command has a target
      if (savedRange.current && el.contains(savedRange.current.commonAncestorContainer)) { s.removeAllRanges(); s.addRange(savedRange.current); }
      else if (!s.rangeCount || !el.contains(s.anchorNode)) { const r = document.createRange(); r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r); }
    }
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* noop */ }
    document.execCommand(c, false, v);
    if (s && s.rangeCount) savedRange.current = s.getRangeAt(0).cloneRange();
    refreshActive();
    save();
  };
  // Highlight toggles: if the selection is already highlighted, clear it; else apply.
  const toggleHighlight = () => { runCmd('hiliteColor', active.highlight ? 'transparent' : '#FFE08A'); };
  // dropdown menu anchored under its button (inline; note body is overflow-visible)
  const Btn = ({ children, onClick, title, on }: any) => <button data-nodrag onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onClick(); }} title={title} className={`w-7 h-7 grid place-items-center rounded-md transition-colors shrink-0 ${on ? 'text-[var(--color-lumen)] bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)] hover:bg-white/10'}`}>{children}</button>;
  const openMenu = (id: 'list' | 'size' | 'color' | 'font', e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (menu?.id === id) { setMenu(null); return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ id, x: r.left, y: r.bottom + 6 });
  };
  useEffect(() => { if (!menu) return; const close = (ev: PointerEvent) => { const t = ev.target as HTMLElement; if (!t.closest('[data-note-menu]') && !t.closest('[data-note-dropbtn]')) setMenu(null); }; const reflow = () => setMenu(null); window.addEventListener('pointerdown', close); window.addEventListener('resize', reflow); return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('resize', reflow); }; }, [menu]);

  const menuItems = (id: 'list' | 'size' | 'color' | 'font') => (<>
    {id === 'list' && <>
      <button data-nodrag onMouseDown={e => { e.preventDefault(); runCmd('insertUnorderedList'); setMenu(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded text-[13px] text-[var(--color-vapor)] hover:bg-white/10"><List className="w-3.5 h-3.5" /> Bulleted</button>
      <button data-nodrag onMouseDown={e => { e.preventDefault(); runCmd('insertOrderedList'); setMenu(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded text-[13px] text-[var(--color-vapor)] hover:bg-white/10"><ListOrdered className="w-3.5 h-3.5" /> Numbered</button>
    </>}
    {id === 'size' && FONT_SIZES.map(s => <button key={s.label} data-nodrag onMouseDown={e => { e.preventDefault(); runCmd('fontSize', s.label === 'S' ? '2' : s.label === 'M' ? '3' : s.label === 'L' ? '5' : '6'); setMenu(null); }} className="w-full flex items-center justify-between px-2 py-2 rounded text-[13px] text-[var(--color-vapor)] hover:bg-white/10 gap-4"><span>{s.label === 'S' ? 'Small' : s.label === 'M' ? 'Medium' : s.label === 'L' ? 'Large' : 'X-Large'}</span><span style={{ fontSize: s.px }} className="font-mono text-[var(--color-mist)]">A</span></button>)}
    {id === 'color' && <div className="flex gap-1 p-1">{TEXT_COLORS.map(c => <button key={c} data-nodrag onMouseDown={e => { e.preventDefault(); runCmd('foreColor', c); setMenu(null); }} className="w-5 h-5 rounded-full border border-white/15 hover:scale-110 transition-transform" style={{ background: c }} />)}</div>}
    {id === 'font' && NOTE_FONTS.map(f => <button key={f.id} data-nodrag onMouseDown={e => { e.preventDefault(); setFont(f.id); setMenu(null); }} className={`w-full text-left px-2 py-2 rounded text-[13px] hover:bg-white/10 ${f.id} ${font === f.id ? 'text-[var(--color-lumen)]' : 'text-[var(--color-vapor)]'}`}>{f.label}</button>)}
  </>);

  const DropBtn = ({ id, label, title }: any) => (
    <div className="relative shrink-0" data-note-dropbtn>
      <button data-nodrag onMouseDown={e => openMenu(id, e)} title={title} className={`h-7 pl-2 pr-1 rounded-md flex items-center gap-0.5 transition-colors ${menu?.id === id ? 'text-[var(--color-lumen)] bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)] hover:bg-white/10'}`}>{label}<ChevronDown className="w-3 h-3 opacity-70" /></button>
    </div>
  );

  return (
    <div className="flex flex-col h-full" data-nodrag>
      {/* toolbar — shrink-0, stays out of the scroll region */}
      <div className="ws-note-toolbar flex items-center gap-0.5 px-2 py-1 border-b border-[var(--color-glass-edge)] shrink-0 flex-wrap">
        <Btn onClick={() => runCmd('bold')} title="Bold (Ctrl+B)" on={active.bold}><Bold className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => runCmd('italic')} title="Italic (Ctrl+I)" on={active.italic}><Italic className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={toggleHighlight} title="Highlight" on={active.highlight}><Highlighter className="w-3.5 h-3.5" /></Btn>
        <span className="w-px h-4 bg-[var(--color-glass-edge)] mx-0.5" />
        <DropBtn id="list" label={<List className="w-3.5 h-3.5" />} title="Lists" />
        <DropBtn id="size" label={<span className="text-[13px] font-semibold">A</span>} title="Text size" />
        <DropBtn id="color" label={<Palette className="w-3.5 h-3.5" />} title="Text colour" />
        <DropBtn id="font" label={<Type className="w-3.5 h-3.5" />} title="Font" />
      </div>
      {/* editable area scrolls */}
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={save} onBlur={save} data-nodrag
        data-placeholder="Write anything…" data-empty={!item.noteHtml}
        className={`ws-note-body ${font} px-3 py-3 flex-1 overflow-auto panel-scroll text-[14px] leading-relaxed outline-none`} />
      {/* dropdown rendered in a portal at the top layer so the card edge never clips it */}
      {menu && createPortal(
        <div data-note-menu className={`fixed z-[9999] glass-elevated p-1 rounded-lg shadow-2xl ${item.light ? 'ws-light' : ''}`} style={{ left: menu.x, top: menu.y, width: menu.id === 'color' ? 'auto' : 168, maxWidth: 220 }} onMouseDown={e => e.preventDefault()}>
          {menuItems(menu.id)}
        </div>, document.body)}
    </div>
  );
}

/* ─────────────── LIST: bulleted / numbered / nested ─────────────── */
function ListBody({ item }: { item: WorkspaceItem }) {
  const w = useWorkspace();
  const list = item.listItems ?? [];
  const style = item.listStyle ?? 'bulleted';
  const update = (items: WsListItem[]) => w.wsUpdate(item.id, { listItems: items });

  const setText = (id: string, text: string) => update(list.map(l => l.id === id ? { ...l, text } : l));
  const addAfter = (id: string) => { const idx = list.findIndex(l => l.id === id); const depth = list[idx]?.depth ?? 0; const next = [...list]; next.splice(idx + 1, 0, { id: uid('l'), text: '', depth }); update(next); };
  const remove = (id: string) => update(list.filter(l => l.id !== id));
  const indent = (id: string, dir: 1 | -1) => update(list.map(l => l.id === id ? { ...l, depth: Math.max(0, Math.min(3, l.depth + dir)) } : l));

  return (
    <div className="px-3 py-2">
      {/* style toggle */}
      <div className="flex items-center gap-1 mb-2">
        <button onClick={() => w.wsUpdate(item.id, { listStyle: 'bulleted' })} className={`w-6 h-6 grid place-items-center rounded ${style === 'bulleted' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:bg-white/10'}`}><List className="w-3.5 h-3.5" /></button>
        <button onClick={() => w.wsUpdate(item.id, { listStyle: 'numbered' })} className={`w-6 h-6 grid place-items-center rounded ${style === 'numbered' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:bg-white/10'}`}><ListOrdered className="w-3.5 h-3.5" /></button>
      </div>
      <div className="space-y-0.5">
        {list.map((l, i) => {
          const num = list.slice(0, i + 1).filter(x => x.depth === l.depth).length;
          const marker = l.depth === 0
            ? (style === 'numbered' ? `${num}.` : '•')
            : (style === 'numbered' ? `${String.fromCharCode(96 + (num % 26))}.` : l.depth === 1 ? '◦' : '▪');
          return (
            <div key={l.id} className="flex items-center gap-2 group/li" style={{ paddingLeft: l.depth * 16 }}>
              <span className="text-[var(--color-mist)] text-[13px] w-4 text-right shrink-0 select-none" style={{ color: l.depth ? 'var(--color-trace)' : 'var(--color-mist)' }}>{marker}</span>
              <input value={l.text} onChange={e => setText(l.id, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAfter(l.id); } else if (e.key === 'Tab') { e.preventDefault(); indent(l.id, e.shiftKey ? -1 : 1); } else if (e.key === 'Backspace' && l.text === '' && list.length > 1) { e.preventDefault(); remove(l.id); } }}
                placeholder="List item…" className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[var(--color-vapor)] placeholder:text-[var(--color-trace)]" />
              <button onClick={() => indent(l.id, 1)} title="Indent" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] opacity-0 group-hover/li:opacity-100 hover:text-[var(--color-vapor)]"><CornerDownRight className="w-3 h-3" /></button>
              <button onClick={() => remove(l.id)} title="Remove" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] opacity-0 group-hover/li:opacity-100 hover:text-[var(--color-coral)]"><X className="w-3 h-3" /></button>
            </div>
          );
        })}
      </div>
      <button onClick={() => update([...list, { id: uid('l'), text: '', depth: 0 }])} className="mt-2 text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)] flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>
    </div>
  );
}

/* ─────────────── TODO: timers, deadlines, subtasks, progress ─────────────── */
function TodoBody({ item }: { item: WorkspaceItem }) {
  const w = useWorkspace();
  const todos = item.todos ?? [];
  const update = (t: WsTodoEntry[]) => w.wsUpdate(item.id, { todos: t });
  const addEntry = () => update([...todos, { id: uid('t'), text: '', done: false, subtasks: [] }]);

  return (
    <div className="px-3 py-2 space-y-2">
      {todos.length === 0 && <p className="text-[13px] text-[var(--color-trace)] px-1 py-2">No tasks yet. Add one below.</p>}
      {todos.map(entry => <TodoEntry key={entry.id} entry={entry} todos={todos} update={update} />)}
      <button onClick={addEntry} className="text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)] flex items-center gap-1 pt-1"><Plus className="w-3 h-3" /> Add task</button>
    </div>
  );
}

function TodoEntry({ entry, todos, update }: { entry: WsTodoEntry; todos: WsTodoEntry[]; update: (t: WsTodoEntry[]) => void }) {
  const [open, setOpen] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const patch = (p: Partial<WsTodoEntry>) => update(todos.map(t => t.id === entry.id ? { ...t, ...p } : t));
  const del = () => update(todos.filter(t => t.id !== entry.id));
  const deprioritize = () => update([...todos.filter(t => t.id !== entry.id), entry]);
  const subDone = entry.subtasks.filter(s => s.done).length;
  const pct = entry.subtasks.length ? Math.round((subDone / entry.subtasks.length) * 100) : (entry.done ? 100 : 0);

  const addSub = () => patch({ subtasks: [...entry.subtasks, { id: uid('s'), text: '', done: false }] });
  const setSub = (id: string, p: Partial<WsSubtask>) => patch({ subtasks: entry.subtasks.map(s => s.id === id ? { ...s, ...p } : s) });
  const delSub = (id: string) => patch({ subtasks: entry.subtasks.filter(s => s.id !== id) });

  return (
    <div className="rounded-lg glass-soft p-2 group/te">
      <div className="flex items-center gap-2">
        <button onClick={() => patch({ done: !entry.done })} className={`w-4 h-4 rounded grid place-items-center shrink-0 border transition-colors ${entry.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] hover:border-[var(--color-lumen)]'}`}>{entry.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</button>
        <input value={entry.text} onChange={e => patch({ text: e.target.value })} placeholder="Task…" className={`flex-1 min-w-0 bg-transparent outline-none text-[13px] ${entry.done ? 'line-through text-[var(--color-trace)]' : 'text-[var(--color-vapor)]'} placeholder:text-[var(--color-trace)]`} />
        <button onClick={() => setShowMeta(m => !m)} title="Timer / deadline" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-lumen)] opacity-0 group-hover/te:opacity-100"><Clock className="w-3.5 h-3.5" /></button>
        <button onClick={deprioritize} title="Send to bottom" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-vapor)] opacity-0 group-hover/te:opacity-100"><ArrowDownToLine className="w-3.5 h-3.5" /></button>
        <button onClick={() => setOpen(o => !o)} title="Sub-tasks" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-vapor)]">{open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
        <button onClick={del} title="Delete" className="w-5 h-5 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-coral)] opacity-0 group-hover/te:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      {/* meta: timer + deadline — preset stepper, no fiddly number input */}
      {showMeta && (
        <div className="flex items-center gap-2 mt-2 pl-6 flex-wrap">
          <div className="flex items-center gap-1 glass-soft rounded-full px-2 py-1">
            <Timer className="w-3 h-3 text-[var(--color-mist)]" />
            <button onClick={() => patch({ timerMs: stepTimer(entry.timerMs, -1), timerStartedAt: undefined })} className="w-5 h-5 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)]"><ChevronDown className="w-3 h-3" /></button>
            <span className="text-[12px] font-mono text-[var(--color-vapor)] min-w-[42px] text-center">{entry.timerMs ? fmtTimer(entry.timerMs) : 'off'}</span>
            <button onClick={() => patch({ timerMs: stepTimer(entry.timerMs, 1), timerStartedAt: undefined })} className="w-5 h-5 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)]"><ChevronUp className="w-3 h-3" /></button>
            {entry.timerMs && <button onClick={() => patch({ timerMs: undefined, timerStartedAt: undefined })} title="Clear timer" className="w-4 h-4 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-2.5 h-2.5" /></button>}
          </div>
          <label className="flex items-center gap-2 text-[12px] text-[var(--color-mist)] glass-soft rounded-full px-2 py-1 cursor-pointer">
            <CalendarClock className="w-3 h-3" />
            <input type="date" value={entry.deadline ?? ''} onChange={e => patch({ deadline: e.target.value || undefined })} style={{ colorScheme: 'dark' }} className="bg-transparent outline-none text-[12px] text-[var(--color-vapor)]" />
            {entry.deadline && <button onClick={(e) => { e.preventDefault(); patch({ deadline: undefined }); }} className="text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-2.5 h-2.5" /></button>}
          </label>
        </div>
      )}
      {/* prominent countdown timer + deadline urgency */}
      {(entry.deadline || entry.timerMs) && !entry.done && (
        <div className="mt-2 pl-6 flex flex-col gap-2">
          {entry.timerMs !== undefined && <CountdownChip entry={entry} patch={patch} />}
          {entry.deadline && <div><DeadlineChip date={entry.deadline} /></div>}
        </div>
      )}

      {/* progress bar from sub-tasks */}
      {entry.subtasks.length > 0 && (
        <div className="flex items-center gap-2 mt-2 pl-6">
          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full" style={{ background: pct === 100 ? 'var(--color-lumen)' : 'var(--color-halo-text)' }} /></div>
          <span className="text-[11px] font-mono text-[var(--color-trace)]">{subDone}/{entry.subtasks.length}</span>
        </div>
      )}

      {/* sub-tasks */}
      {open && (
        <div className="mt-2 pl-6 space-y-1">
          <div className="flex items-center gap-1 mb-1">
            <button onClick={() => patch({ ordered: false })} className={`text-[11px] px-2 py-0.5 rounded ${!entry.ordered ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-trace)]'}`}>• Bulleted</button>
            <button onClick={() => patch({ ordered: true })} className={`text-[11px] px-2 py-0.5 rounded ${entry.ordered ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-trace)]'}`}>1. Numbered</button>
          </div>
          {entry.subtasks.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 group/st">
              <span className="text-[11px] text-[var(--color-trace)] w-3 shrink-0 text-right select-none">{entry.ordered ? `${i + 1}.` : '•'}</span>
              <button onClick={() => setSub(s.id, { done: !s.done })} className={`w-3.5 h-3.5 rounded grid place-items-center shrink-0 border ${s.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)]'}`}>{s.done && <Check className="w-2.5 h-2.5 text-[var(--color-abyss)]" />}</button>
              <input value={s.text} onChange={e => setSub(s.id, { text: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }} placeholder="Sub-task…" className={`flex-1 min-w-0 bg-transparent outline-none text-[13px] ${s.done ? 'line-through text-[var(--color-trace)]' : 'text-[var(--color-mist)]'} placeholder:text-[var(--color-trace)]`} />
              <button onClick={() => delSub(s.id)} className="w-4 h-4 grid place-items-center rounded text-[var(--color-trace)] hover:text-[var(--color-coral)] opacity-0 group-hover/st:opacity-100"><X className="w-2.5 h-2.5" /></button>
            </div>
          ))}
          <button onClick={addSub} className="text-[12px] text-[var(--color-mist)] hover:text-[var(--color-vapor)] flex items-center gap-1 mt-0.5"><Plus className="w-2.5 h-2.5" /> Add sub-task</button>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Timer countdown + deadline urgency ─────────────── */
function CountdownChip({ entry, patch }: { entry: WsTodoEntry; patch: (p: Partial<WsTodoEntry>) => void }) {
  const w = useWorkspace();
  const total = entry.timerMs ?? 0;
  const running = !!entry.timerStartedAt;
  const [, tick] = useState(0);
  const lastBeep = useRef(0);
  useEffect(() => { if (!running) return; const iv = setInterval(() => tick(n => n + 1), 250); return () => clearInterval(iv); }, [running]);

  const elapsed = running ? Date.now() - entry.timerStartedAt! : 0;
  const remaining = Math.max(0, total - elapsed);
  const done = running && remaining <= 0;
  const frac = total > 0 ? remaining / total : 1;
  const mm = Math.floor(remaining / 60000), ss = Math.floor((remaining % 60000) / 1000);
  const timeStr = `${mm}:${String(ss).padStart(2, '0')}`;

  const tone = done ? 'coral' : frac > 0.5 ? 'lumen' : frac > 0.2 ? 'ember' : 'coral';
  const col = `var(--color-${tone})`;
  const urgent = running && !done && frac <= 0.2;

  // red-phase sound: a subtle but alarming double-beep every ~4s while urgent (and one at done)
  useEffect(() => {
    if (w.reduced) return;
    if (!(urgent || done)) return;
    const now = Date.now();
    const interval = done ? 2200 : 4000;
    if (now - lastBeep.current < interval) return;
    lastBeep.current = now;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext); if (!AC) return;
      const ctx = new AC();
      const beep = (t: number, f: number) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.start(t); o.stop(t + 0.2); };
      const t0 = ctx.currentTime; beep(t0, 880); beep(t0 + 0.24, done ? 660 : 880);
      setTimeout(() => ctx.close(), 700);
    } catch { /* audio unavailable */ }
  }, [urgent, done, remaining, w.reduced]);

  const start = () => patch({ timerStartedAt: Date.now() });
  const pause = () => patch({ timerMs: remaining, timerStartedAt: undefined });
  const reset = () => patch({ timerMs: total, timerStartedAt: undefined });

  const R = 22, C = 2 * Math.PI * R;
  const dash = C * (1 - (done ? 1 : frac));

  return (
    <motion.div
      animate={urgent ? { scale: [1, 1.015, 1] } : { scale: 1 }} transition={urgent ? { duration: 1.0, repeat: Infinity } : {}}
      className="ws-timer flex items-center gap-3 rounded-2xl px-3 py-3 w-full"
      style={{ background: `color-mix(in srgb, ${col} 10%, transparent)`, boxShadow: urgent ? `0 0 18px color-mix(in srgb, ${col} 45%, transparent)` : undefined, border: `1px solid color-mix(in srgb, ${col} 28%, transparent)` }}>
      {/* radial ring */}
      <div className="relative shrink-0" style={{ width: 54, height: 54 }}>
        <svg width="54" height="54" className="-rotate-90">
          <circle className="ws-timer-track" cx="27" cy="27" r={R} fill="none" stroke="var(--color-glass-edge)" strokeWidth="4" />
          <circle cx="27" cy="27" r={R} fill="none" stroke={col} strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash} style={{ transition: running ? 'stroke-dashoffset 0.25s linear' : 'none' }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          {done ? <span className="text-[11px] font-bold" style={{ color: col }}>DONE</span>
            : <span className="font-mono font-bold tabular-nums leading-none" style={{ color: col, fontSize: mm >= 100 ? 13 : 15 }}>{timeStr}</span>}
        </div>
      </div>
      {/* label + controls */}
      <div className="flex-1 min-w-0">
        <div className="ws-timer-label text-[12px] text-[var(--color-mist)] mb-1">{done ? 'Timer finished' : running ? 'Counting down' : 'Timer ready'}</div>
        <div className="flex items-center gap-2">
          {!done && (running
            ? <button onClick={pause} title="Pause" className="ws-timer-soft h-7 px-3 rounded-full glass-soft hover:bg-white/10 flex items-center gap-1 text-[12px] font-medium" style={{ color: col }}><Pause className="w-3 h-3" /> Pause</button>
            : <button onClick={start} title="Start" className="h-7 px-3 rounded-full flex items-center gap-1 text-[12px] font-semibold" style={{ background: `color-mix(in srgb, ${col} 20%, transparent)`, color: col }}><Play className="w-3 h-3" /> Start</button>)}
          {(running || done) && <button onClick={reset} title="Reset" className="ws-timer-soft w-7 h-7 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><RotateCcw className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
    </motion.div>
  );
}

function DeadlineChip({ date }: { date: string }) {
  const target = new Date(date + 'T23:59:59').getTime();
  const now = Date.now();
  const days = Math.ceil((target - now) / 86400000);
  const overdue = days < 0;
  const tone = overdue ? 'coral' : days <= 1 ? 'coral' : days <= 3 ? 'ember' : 'mist';
  const col = `var(--color-${tone})`;
  const label = overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`;
  return (
    <motion.span
      animate={overdue || days === 0 ? { opacity: [1, 0.6, 1] } : { opacity: 1 }} transition={overdue || days === 0 ? { duration: 1.4, repeat: Infinity } : {}}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium"
      style={{ background: `color-mix(in srgb, ${col} 14%, transparent)`, color: col }}>
      <CalendarClock className="w-3 h-3" /> {label}
    </motion.span>
  );
}

/* ─────────────── FlowBoard section (Figma-like, 4 corner handles) ─────────────── */
function FlowboardSection({ fb, x, y, w: fw, h: fh, color, name, pad, onMove, onOrganize, onScale, onRename, onClose }: {
  fb: string; x: number; y: number; w: number; h: number; color: string; name: string; pad: number;
  onMove: (dx: number, dy: number) => void; onOrganize: () => void; onScale: (delta: number) => void; onRename: (n: string) => void; onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const drag = useRef<{ sx: number; sy: number } | null>(null);
  const scale = useRef<{ sx: number; sy: number; pad: number } | null>(null);

  const dragDown = (e: React.PointerEvent) => { e.stopPropagation(); drag.current = { sx: e.clientX, sy: e.clientY }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const dragMove = (e: React.PointerEvent) => { if (!drag.current) return; const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy; drag.current = { sx: e.clientX, sy: e.clientY }; onMove(dx, dy); };
  const dragUp = () => { drag.current = null; };

  const scaleDown = (e: React.PointerEvent) => { e.stopPropagation(); scale.current = { sx: e.clientX, sy: e.clientY, pad }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const scaleMove = (e: React.PointerEvent) => { if (!scale.current) return; const d = Math.round(Math.max(e.clientX - scale.current.sx, e.clientY - scale.current.sy)); onScale((scale.current.pad + d) - pad); };
  const scaleUp = () => { scale.current = null; };

  const HANDLE = 'w-6 h-6 grid place-items-center rounded-xl glass-elevated z-[70] pointer-events-auto transition-colors';
  return (
    <div className="absolute rounded-2xl group/fb" style={{ left: x, top: y, width: fw, height: fh, zIndex: 1, border: `1.5px dashed color-mix(in srgb, ${color} 55%, transparent)`, background: `color-mix(in srgb, ${color} 6%, transparent)`, pointerEvents: 'none' }}>
      {/* title label (top-left, inside) */}
      <div className="absolute left-2.5 top-1.5 flex items-center gap-2 pointer-events-auto" style={{ color }}>
        <Workflow className="w-3 h-3 shrink-0" />
        {editing ? (
          <input autoFocus defaultValue={name} onBlur={e => { onRename(e.target.value || 'Flowboard'); setEditing(false); }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="bg-transparent outline-none text-[13px] font-semibold text-[var(--color-vapor)] border-b border-white/20 min-w-0 w-32" />
        ) : (
          <button onClick={() => setEditing(true)} className="text-[13px] font-semibold text-[var(--color-vapor)] truncate flex items-center gap-1 group/n max-w-[200px]">{name}<Pencil className="w-2.5 h-2.5 opacity-0 group-hover/n:opacity-60" /></button>
        )}
      </div>

      {/* four corner handles (revealed on hover) — matches card grammar */}
      <div className="opacity-0 group-hover/fb:opacity-100 transition-opacity">
        {/* TL: drag */}
        <button onPointerDown={dragDown} onPointerMove={dragMove} onPointerUp={dragUp} title="Drag flowboard" className={`${HANDLE} absolute -left-3 -top-3 cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-vapor)]`}><GripVertical className="w-3.5 h-3.5" /></button>
        {/* TR: organize */}
        <button onPointerDown={e => e.stopPropagation()} onClick={onOrganize} title="Organize cards by flow" className={`${HANDLE} absolute -right-3 -top-3 text-[var(--color-mist)] hover:text-[var(--color-lumen)]`}><LayoutGrid className="w-3.5 h-3.5" /></button>
        {/* BL: scale */}
        <button onPointerDown={scaleDown} onPointerMove={scaleMove} onPointerUp={scaleUp} title="Scale flowboard" className={`${HANDLE} absolute -left-3 -bottom-3 cursor-nesw-resize text-[var(--color-mist)] hover:text-[var(--color-lumen)]`}><Maximize2 className="w-3 h-3" /></button>
        {/* BR: close */}
        <button onPointerDown={e => e.stopPropagation()} onClick={onClose} title="Delete flowboard" className={`${HANDLE} absolute -right-3 -bottom-3 text-[var(--color-mist)] hover:text-[var(--color-coral)]`}><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}
