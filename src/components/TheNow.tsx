import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Activity, ChevronRight, PanelLeftClose, Crosshair } from 'lucide-react';
import { useWorkspace } from '../store';
import { Avatar } from './Avatar';
import { TokenCard } from './Tokens';
import { registerZone, clearZone } from '../dropzone';

const KIND_META: Record<string, { label: string; color: string }> = {
  wellness: { label: 'Wellbeing', color: 'var(--color-lumen)' },
  sla: { label: 'Approvals', color: 'var(--color-ember)' },
  payroll: { label: 'Payroll', color: 'var(--color-halo-text)' },
  doc: { label: 'Documents', color: 'var(--color-mist)' },
  risk: { label: 'Risk', color: 'var(--color-coral)' },
  review: { label: 'Reviews', color: 'var(--color-halo-text)' },
  onboarding: { label: 'Onboarding', color: 'var(--color-lumen)' },
  headcount: { label: 'Analytics', color: 'var(--color-blue-text)' },
  coverage: { label: 'Coverage', color: 'var(--color-ember)' },
  nudge: { label: 'Nudge', color: 'var(--color-lumen)' },
};
// Semantic tint hierarchy (single source of truth, mirrors Focus):
// coral = act now / at risk · ember = due soon / needs attention · halo = people & insight · lumen = healthy / informational
const CUE_TINT: Record<string, 'lumen' | 'halo' | 'ember' | 'mist' | 'coral'> = { risk: 'coral', sla: 'ember', coverage: 'ember', payroll: 'ember', doc: 'ember', nudge: 'ember', review: 'halo', onboarding: 'halo', headcount: 'halo', wellness: 'lumen' };
const AGO = ['just now', '2m', '11m', '40m', '1h', '2h'];

export default function TheNow() {
  const w = useWorkspace();
  const [filter, setFilter] = useState<string>('All');
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = () => registerZone('panel-now', w.panelLeft ? panelRef.current : null, 'panel'); r(); window.addEventListener('resize', r); return () => { window.removeEventListener('resize', r); clearZone('panel-now'); }; });

  const act = (kind: string, id: string) => {
    if (w.lens === 'manager') {
      if (kind === 'sla' || kind === 'coverage') w.setRegion('approvals');
      else if (kind === 'risk') w.setRegion('team');
      else if (kind === 'review') w.setRegion('analytics');
    } else if (w.lens === 'hr') {
      if (kind === 'payroll') w.setRegion('payroll');
      else if (kind === 'onboarding') w.setRegion('onboarding');
      else if (kind === 'doc') w.setRegion('documents');
      else if (kind === 'headcount') w.setRegion('analytics');
      else if (kind === 'risk') w.setRegion('people');
    } else {
      if (kind === 'wellness') w.setRegion('calendar');
      else if (kind === 'payroll') w.setRegion('payroll');
      else if (kind === 'doc') w.setRegion('documents');
      else if (kind === 'nudge') { w.pulse(window.innerWidth / 2, window.innerHeight - 170, 'ok'); w.setRegion('home'); w.toast('Nudge resolved — timesheet opened', 'ok'); }
    }
    w.dismissCue(id);
  };

  const mine = w.cues.filter(c => c.persona === w.lens);
  const kinds = Array.from(new Set(mine.map(c => c.kind)));
  const chips = ['All', ...kinds];
  const shown = mine.filter(c => filter === 'All' || c.kind === filter);

  const collapsed = !w.panelLeft;
  const capsule = (
    <div className="fixed left-3 top-[76px] z-20 flex flex-col gap-2">
      <button onClick={() => w.setPanel('left', true)} aria-label="Expand The Now feed" className="w-12 glass-panel shape-soft flex flex-col items-center gap-3 py-3 hover:bg-white/10 transition-colors">
        <span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-lumen)] opacity-60 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-lumen)]" /></span>
        <Activity className="w-4 h-4 text-[var(--color-lumen)]" />
        <span className="text-[13px] font-mono text-[var(--color-mist)]">{w.cues.filter(c => c.persona === w.lens).length}</span>
        <ChevronRight className="w-4 h-4 text-[var(--color-trace)] mt-1" />
      </button>
      {w.lens !== 'employee' && (() => {
        const critical = w.lens === 'manager'
          ? (w.leaves.some(l => l.status === 'pending' && l.isSlaBreached) || w.people.some(p => p.status === 'flight_risk'))
          : w.payslips.some(p => p.status === 'pooled');
        return (
          <button onClick={() => w.setRegion('focus')} aria-label="Open Focus — full-screen priority queue" title="Focus — priority queue"
            className={`w-12 glass-panel shape-soft flex flex-col items-center gap-2 py-3 hover:bg-white/10 transition-colors ${w.region === 'focus' ? 'ring-1 ring-[var(--color-lumen)]' : ''}`}>
            {critical && <span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-coral)] opacity-70 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-coral)]" /></span>}
            <Crosshair className={`w-4 h-4 ${critical ? 'text-[var(--color-coral)]' : 'text-[var(--color-lumen)]'}`} />
            <span className="text-[11px] uppercase tracking-wider text-[var(--color-trace)]">Focus</span>
          </button>
        );
      })()}
    </div>
  );

  return (
    <>
      {collapsed && capsule}
      <div ref={panelRef} className="fixed left-3 z-20 w-[20rem] flex flex-col pointer-events-none" style={{ top: 76, bottom: 96, visibility: collapsed ? 'hidden' : 'visible' }} aria-hidden={collapsed}>
      <div className="glass-panel pointer-events-auto px-3 py-3 mb-3 shape-soft shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-vapor)] text-sm font-display"><span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-lumen)] opacity-60 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-lumen)]" /></span> The Now</div>
          <div className="flex items-center gap-2">
            {w.lens !== 'employee' && (
              <button onClick={() => w.setRegion('focus')} aria-label="Open Focus — full-screen priority queue" title="Open Focus — full-screen priority queue" className="text-[13px] px-2 py-1 rounded-full glass-soft text-[var(--color-lumen)] hover:bg-white/10 transition-colors flex items-center gap-1"><Crosshair className="w-3 h-3" /> Focus</button>
            )}
            <span className="text-[13px] font-mono text-[var(--color-trace)] flex items-center gap-1"><Activity className="w-3 h-3" /> {w.cues.length} live</span><button onClick={() => w.setPanel('left', false)} aria-label="Collapse feed" className="text-[var(--color-trace)] hover:text-[var(--color-vapor)] pointer-events-auto"><PanelLeftClose className="w-4 h-4" /></button></div>
        </div>
        {chips.length > 1 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {chips.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`text-[13px] px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${filter === c ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}>
                {c !== 'All' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: KIND_META[c]?.color }} />}{c === 'All' ? 'All' : KIND_META[c]?.label ?? c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`panel-scroll flex-1 min-h-0 flex flex-col gap-4 px-3 pt-3 -mx-1 ${w.dragging ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        <AnimatePresence>
          {shown.map((cue, idx) => {
            const meta = KIND_META[cue.kind] ?? { label: cue.kind, color: 'var(--color-lumen)' };
            return (
              <motion.div key={cue.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16, scale: 0.96 }} transition={{ delay: idx * 0.06, type: 'spring', stiffness: 280, damping: 26 }} className="pointer-events-auto">
                <TokenCard id={cue.id} kind="cue" placement="flow" shape="rect" tint={CUE_TINT[cue.kind] ?? 'lumen'} label={cue.message} className="w-full" onClose={() => w.dismissCue(cue.id)}
                  expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>Q surfaced this from your recent calendar, project and attendance activity.</p><div className="text-[13px] text-[var(--color-trace)]">Drag onto a person or leave token to act in context · drag to Q for the full chain</div></div>}
                  deep={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Signal type</span><span className="capitalize">{cue.kind}</span></div><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Confidence</span><span className="text-[var(--color-lumen)]">0.82</span></div><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Sources</span><span>calendar · slack · git</span></div></div>}>
                  <div className="flex items-start gap-3">
                    {cue.kind === 'nudge' && cue.from
                      ? <span className="shrink-0"><Avatar seed={cue.from} name={cue.from} size={28} /></span>
                      : <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />}
                    <div className="flex flex-col gap-2 w-full min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] uppercase tracking-widest font-semibold" style={{ color: meta.color }}>{cue.kind === 'nudge' && cue.from ? `${cue.from.split(' ')[0]} nudged you` : meta.label}</span>
                        <span className="text-[13px] font-mono text-[var(--color-trace)]">{AGO[idx % AGO.length]}</span>
                      </div>
                      <p className="text-sm leading-snug text-[var(--color-vapor)]">{cue.message}</p>
                      <button onClick={(e) => { e.stopPropagation(); act(cue.kind, cue.id); }} className="self-start text-[13px] px-3 py-2 rounded-full font-semibold text-[var(--color-lumen)] glass-soft hover:bg-white/10 transition-colors">{cue.actionText}</button>
                    </div>
                  </div>
                </TokenCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {shown.length === 0 && <div className="glass-soft p-4 text-[13px] text-[var(--color-mist)] pointer-events-auto flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-[var(--color-lumen)]" /> {w.cues.length === 0 ? 'All caught up. Q will surface things here as they happen.' : 'Nothing in this filter.'}</div>}
      </div>
    </div>
    </>
  );
}
