import { useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Shield, Sparkles, Plus, Minus, Send, RotateCcw, Check, Users, AlertTriangle, Wand2, CalendarClock } from 'lucide-react';
import { useWorkspace } from '../store';
import { COMP_ROWS, COVERAGE } from '../data';
import { Avatar } from './Avatar';

const L = (n: number) => `\u20b9${(n / 100000).toFixed(1)}L`;
const K = (n: number) => `\u20b9${Math.round(n / 1000)}k`;
const STEP = 25000;

export default function Planning() {
  const w = useWorkspace();
  const [tab, setTab] = useState<'comp' | 'coverage'>('comp');
  const isHR = w.lens === 'hr';
  const canEdit = w.lens === 'manager' && w.comp.status === 'draft';
  const name = (id: string) => w.people.find(p => p.id === id)?.name ?? id;
  const roleOf = (id: string) => w.people.find(p => p.id === id)?.role ?? '';
  const total = Object.values(w.comp.plan).reduce((a, b) => a + b, 0);
  const remaining = w.comp.budget - total;
  const over = total > w.comp.budget;
  const pool = w.people.filter(p => p.managerId === 'm1' && p.status === 'active');

  const Tabs = (
    <div className="flex items-center gap-1 glass-soft p-1 rounded-full">
      {([['comp', 'Compensation', IndianRupee], ['coverage', 'Coverage', Users]] as const).map(([k, label, Icon]) => (
        <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors ${tab === k ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Icon className="w-3.5 h-3.5" /> {label}</button>
      ))}
    </div>
  );

  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 panel-scroll overflow-y-auto overflow-x-hidden flex flex-col items-center">
      <div className="w-[min(880px,95vw)] space-y-4">
        <div className="flex items-center justify-between">{Tabs}
          <button onClick={() => w.ask(tab === 'comp' ? 'How should I plan compensation within budget?' : 'Who should cover the upcoming leave?')} className="px-3 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q</button>
        </div>

        {tab === 'comp' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* budget header */}
            <div className="glass-panel tint-lumen p-5" style={{ borderRadius: 'var(--r-soft)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><Shield className="w-3.5 h-3.5" /> Merit budget</div>
                <div className="text-[13px]" style={{ color: over ? 'var(--color-coral)' : 'var(--color-mist)' }}>{K(total)} of {K(w.comp.budget)} allocated · {over ? `${K(-remaining)} over` : `${K(remaining)} left`}</div>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (total / w.comp.budget) * 100)}%`, background: over ? 'var(--color-coral)' : 'var(--color-lumen)' }} /></div>
              {w.comp.status === 'submitted' && <div className="mt-3 text-[13px] text-[var(--color-lumen)] flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Routed to HR — awaiting approval.</div>}
              {w.comp.status === 'approved' && <div className="mt-3 text-[13px] text-[var(--color-lumen)] flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Approved by HR.</div>}
            </div>

            {/* rows */}
            {COMP_ROWS.map(row => {
              const raise = w.comp.plan[row.id] ?? 0;
              const newSal = row.salary + raise;
              const pct = (val: number) => Math.max(0, Math.min(1, (val - row.min) / (row.max - row.min)));
              const st = newSal > row.max ? { t: 'Above band', c: 'var(--color-halo)' } : newSal < row.min ? { t: 'Below band', c: 'var(--color-ember)' } : { t: 'In band', c: 'var(--color-lumen)' };
              return (
                <div key={row.id} className="glass-panel p-4" style={{ borderRadius: 'var(--r-soft)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar seed={name(row.id)} name={name(row.id)} size={34} />
                    <div className="min-w-0 flex-1"><div className="text-[14px] text-[var(--color-vapor)]">{name(row.id)}</div><div className="text-[12px] text-[var(--color-trace)] truncate">{roleOf(row.id)}</div></div>
                    <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${st.c} 15%, transparent)`, color: st.c }}>{st.t}</span>
                  </div>
                  {/* band bar */}
                  <div className="relative h-2 rounded-full bg-[var(--color-lumen)]/12 mb-2">
                    <span className="absolute w-2 h-2 rounded-full bg-[var(--color-mist)] top-0" style={{ left: `calc(${pct(row.salary) * 100}% - 4px)` }} title="Current" />
                    <span className="absolute w-3 h-3 rounded-full ring-2 top-[-2px]" style={{ left: `calc(${pct(newSal) * 100}% - 6px)`, background: st.c, boxShadow: '0 0 0 2px var(--color-abyss)' }} title="Projected" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--color-trace)] mb-3"><span>{L(row.min)}</span><span>mid {L(row.mid)}</span><span>{L(row.max)}</span></div>
                  <div className="flex items-center gap-3">
                    <div className="text-[13px] text-[var(--color-mist)]">Now <span className="text-[var(--color-vapor)] font-mono">{L(row.salary)}</span></div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button disabled={!canEdit || raise <= 0} onClick={() => w.compSet(row.id, raise - STEP)} className="w-7 h-7 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] disabled:opacity-30"><Minus className="w-3.5 h-3.5" /></button>
                      <div className="w-16 text-center"><div className="text-[13px] font-mono text-[var(--color-lumen)]">+{K(raise)}</div><div className="text-[11px] text-[var(--color-trace)]">{raise ? `+${((raise / row.salary) * 100).toFixed(1)}%` : '—'}</div></div>
                      <button disabled={!canEdit} onClick={() => w.compSet(row.id, raise + STEP)} className="w-7 h-7 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-[13px] text-[var(--color-mist)] w-24 text-right">New <span className="text-[var(--color-vapor)] font-mono">{L(newSal)}</span></div>
                  </div>
                  {newSal > row.max && raise > 0 && <div className="mt-2 text-[12px] text-[var(--color-halo-text)] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Above band ceiling — HR sign-off required.</div>}
                  {newSal < row.min && <div className="mt-2 text-[12px] text-[var(--color-ember)] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Still below band minimum.</div>}
                </div>
              );
            })}

            {/* actions */}
            <div className="flex items-center gap-2">
              {!isHR && w.comp.status === 'draft' && <>
                <button disabled={total === 0 || over} onClick={() => w.submitCompPlan()} className="px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white disabled:opacity-40 hover:brightness-110 transition flex items-center gap-2"><Send className="w-4 h-4" /> Route to HR</button>
                <button disabled={total === 0} onClick={() => w.resetCompPlan()} className="px-3 py-2 rounded-full text-sm glass-soft hover:bg-white/10 text-[var(--color-mist)] disabled:opacity-40 flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" /> Clear</button>
                <span className="text-[12px] text-[var(--color-trace)] ml-1">Raises never apply directly — HR reviews and approves the draft.</span>
              </>}
              {isHR && w.comp.status === 'submitted' && <button onClick={() => w.approveCompPlan()} className="px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white hover:brightness-110 transition flex items-center gap-2"><Check className="w-4 h-4" /> Approve plan</button>}
              {isHR && w.comp.status === 'draft' && <span className="text-[13px] text-[var(--color-trace)]">No compensation draft has been routed to you yet.</span>}
            </div>
          </motion.div>
        )}

        {tab === 'coverage' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-4 flex items-center justify-between" style={{ borderRadius: 'var(--r-soft)' }}>
              <div className="text-[13px] text-[var(--color-mist)]">{COVERAGE.filter(c => !w.coverage[c.id]).length} of {COVERAGE.length} leave windows still uncovered</div>
              <button onClick={() => w.autoCoverAll()} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" /> Auto-assign from Q</button>
            </div>
            {COVERAGE.map(c => {
              const cover = w.coverage[c.id];
              return (
                <div key={c.id} className="glass-panel p-4" style={{ borderRadius: 'var(--r-soft)', borderLeft: cover ? '2px solid var(--color-lumen)' : '2px solid var(--color-ember)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="relative"><Avatar seed={name(c.personId)} name={name(c.personId)} size={34} /><span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-abyss)] bg-[var(--color-ember)]" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] text-[var(--color-vapor)]">{name(c.personId)} <span className="text-[12px] text-[var(--color-trace)]">is away</span></div>
                      <div className="text-[12px] text-[var(--color-trace)] flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {c.dates} · at risk: {c.risk}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-[var(--color-mist)]">Covered by</span>
                    <select value={cover ?? ''} onChange={e => w.setCoverage(c.id, e.target.value)} className="text-[13px] px-3 py-2 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[var(--color-vapor)] focus:border-[var(--color-lumen)]">
                      <option value="">— unassigned —</option>
                      {pool.filter(p => p.id !== c.personId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {!cover && <button onClick={() => w.setCoverage(c.id, c.suggested)} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-halo)]/15 text-[var(--color-halo-text)] hover:bg-[var(--color-halo)]/25 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Q suggests {name(c.suggested).split(' ')[0]}</button>}
                    {cover
                      ? <span className="text-[12px] text-[var(--color-lumen)] flex items-center gap-1 ml-auto"><Check className="w-3 h-3" /> Covered</span>
                      : <span className="text-[12px] text-[var(--color-ember)] flex items-center gap-1 ml-auto"><AlertTriangle className="w-3 h-3" /> Coverage gap</span>}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
