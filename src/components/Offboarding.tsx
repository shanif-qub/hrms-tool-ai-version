// Offboarding — the exit mirror of onboarding. Per-leaver exit checklists with
// derived progress, owner tags, last day and reason, plus a control to start
// offboarding for any active person. HR-only surface.

import { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, UserMinus, Check, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../store';
import { Avatar } from './Avatar';
import type { Leaver } from '../types';

const OWNER_TINT: Record<string, string> = { 'IT': 'var(--color-lumen)', 'People Team': 'var(--color-halo-text)', 'Manager': 'var(--color-ember)', 'Finance': 'var(--color-ember)' };
const REASON_TINT: Record<Leaver['reason'], string> = { Resigned: 'var(--color-ember)', 'Contract end': 'var(--color-halo-text)', Retirement: 'var(--color-lumen)', Involuntary: 'var(--color-coral)' };

export default function Offboarding() {
  const w = useWorkspace();
  const [adding, setAdding] = useState(false);
  const [pid, setPid] = useState('');
  const [reason, setReason] = useState<Leaver['reason']>('Resigned');
  const [lastDay, setLastDay] = useState('');
  const activePeople = w.people.filter(p => p.status !== 'flight_risk' || true).filter(p => !w.leavers.some(l => l.name === p.name) && p.id !== 'm1');

  return (
    <div className="absolute inset-0 overflow-y-auto panel-scroll" style={{ paddingTop: 84, paddingBottom: 120 }}>
      <div className="mx-auto w-[min(960px,94vw)]">
        <header className="glass-panel shape-soft px-5 py-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-[var(--color-ember)]" />
            <div>
              <div className="font-display text-lg text-[var(--color-vapor)]">Offboarding</div>
              <div className="text-[13px] text-[var(--color-mist)]">A clean, dignified exit — knowledge transfer and asset return before access is revoked. Every step has an owner.</div>
            </div>
          </div>
          <button onClick={() => { setAdding(a => !a); setPid(activePeople[0]?.id ?? ''); }} className="text-[13px] px-3 py-2 rounded-full font-semibold glass-soft text-[var(--color-ember)] hover:bg-white/10 transition-colors flex items-center gap-2"><UserMinus className="w-3.5 h-3.5" /> Start offboarding</button>
        </header>

        {adding && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="glass-panel shape-soft p-4 mb-4">
            <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3">Start an exit</div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-[12px] uppercase tracking-wider text-[var(--color-trace)] flex-1 min-w-[160px]">Person
                <select value={pid} onChange={e => setPid(e.target.value)} className="px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)] transition-colors">
                  {activePeople.map(p => <option key={p.id} value={p.id} className="bg-[var(--color-abyss)]">{p.name} · {p.role}</option>)}
                </select></label>
              <label className="flex flex-col gap-1 text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Reason
                <select value={reason} onChange={e => setReason(e.target.value as Leaver['reason'])} className="px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)] transition-colors">
                  {(['Resigned', 'Contract end', 'Retirement', 'Involuntary'] as Leaver['reason'][]).map(r => <option key={r} value={r} className="bg-[var(--color-abyss)]">{r}</option>)}
                </select></label>
              <label className="flex flex-col gap-1 text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Last day
                <input value={lastDay} onChange={e => setLastDay(e.target.value)} placeholder="e.g. 30 Sep" className="w-28 px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm focus:border-[var(--color-lumen)] transition-colors" /></label>
              <button onClick={() => { if (pid && lastDay.trim()) { w.startOffboarding(pid, reason, lastDay.trim()); setAdding(false); setLastDay(''); } }} disabled={!pid || !lastDay.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] disabled:opacity-30 hover:bg-[var(--color-ember)]/25 transition-colors">Create exit plan</button>
            </div>
          </motion.div>
        )}

        {w.leavers.length === 0 ? (
          <div className="glass-panel shape-soft p-8 text-center">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl glass-soft mb-3"><LogOut className="w-6 h-6 text-[var(--color-trace)]" /></span>
            <div className="font-display text-lg text-[var(--color-vapor)]">No one is leaving right now</div>
            <p className="text-sm text-[var(--color-mist)] mt-1">When someone moves on, start their exit here to track a clean handover.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {w.leavers.map(l => {
              const done = l.checklist.filter(k => k.done).length;
              const pct = Math.round(done / l.checklist.length * 100);
              const accessItem = l.checklist.find(k => /access/i.test(k.label));
              const accessBlocked = accessItem && !accessItem.done && l.checklist.some(k => /knowledge|asset/i.test(k.label) && !k.done);
              return (
                <div key={l.id} className="glass-panel shape-soft p-4 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar seed={l.name} name={l.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--color-vapor)] truncate">{l.name}</div>
                      <div className="text-[12px] text-[var(--color-trace)] truncate">{l.role} · last day {l.lastDay}</div>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0" style={{ color: REASON_TINT[l.reason], background: 'color-mix(in srgb, currentColor 12%, transparent)' }}>{l.reason}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="h-full" style={{ background: pct === 100 ? 'var(--color-lumen)' : 'var(--color-ember)' }} /></div>
                    <span className="text-[12px] font-mono text-[var(--color-trace)] shrink-0">{done}/{l.checklist.length}</span>
                  </div>
                  <div className="space-y-1 flex-1">
                    {l.checklist.map(k => {
                      const isAccess = /access/i.test(k.label);
                      const lockedByOrder = isAccess && !k.done && l.checklist.some(o => /knowledge|asset/i.test(o.label) && !o.done);
                      return (
                        <button key={k.id} onClick={() => { if (lockedByOrder) { w.toast('Finish knowledge transfer and asset return before revoking access', 'warn'); return; } w.toggleExitTask(l.id, k.id); }}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors group/item">
                          <span className={`w-4 h-4 rounded grid place-items-center shrink-0 border transition-colors ${k.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : lockedByOrder ? 'border-[var(--color-glass-edge)] opacity-40' : 'border-[var(--color-glass-edge)] group-hover/item:border-[var(--color-lumen)]/50'}`}>{k.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
                          <span className={`text-[13px] flex-1 min-w-0 truncate ${k.done ? 'text-[var(--color-trace)] line-through' : lockedByOrder ? 'text-[var(--color-trace)]' : 'text-[var(--color-vapor)]'}`}>{k.label}</span>
                          {lockedByOrder && <AlertTriangle className="w-3 h-3 text-[var(--color-ember)] shrink-0" />}
                          <span className="text-[11px] uppercase tracking-wider shrink-0" style={{ color: OWNER_TINT[k.owner] ?? 'var(--color-trace)' }}>{k.owner}</span>
                        </button>
                      );
                    })}
                  </div>
                  {accessBlocked && <div className="mt-2 text-[12px] text-[var(--color-ember)] flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Access stays live until handover & assets are done.</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
