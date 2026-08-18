import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, CalendarClock, ClipboardList, Plus, Check, Sparkles, GitBranch, Bell, TrendingUp, MessageSquare } from 'lucide-react';
import { useWorkspace } from '../store';
import { Avatar } from './Avatar';

export default function TeamGrowth() {
  const w = useWorkspace();
  const [tab, setTab] = useState<'goals' | 'oneonones' | 'reviews'>('goals');
  const [newGoal, setNewGoal] = useState('');
  const [ai, setAi] = useState<Record<string, string>>({});
  const [fb, setFb] = useState<Record<string, string>>({});
  const name = (id: string) => w.people.find(p => p.id === id)?.name ?? id;
  const teamGoals = w.goals.filter(g => !g.parentId && !g.archived);
  const rollup = (id: string) => { const kids = w.goals.filter(g => g.parentId === id); if (!kids.length) return null; return Math.round(kids.reduce((s, g) => s + g.progress, 0) / kids.length); };
  const statusColor = (st: string) => st === 'at_risk' ? 'var(--color-ember)' : 'var(--color-lumen)';

  const Tabs = (
    <div className="flex items-center gap-1 glass-soft p-1 rounded-full">
      {([['goals', 'Goals', Target], ['oneonones', '1:1s', CalendarClock], ['reviews', 'Reviews', ClipboardList]] as const).map(([k, label, Icon]) => (
        <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors ${tab === k ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Icon className="w-3.5 h-3.5" /> {label}</button>
      ))}
    </div>
  );

  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 panel-scroll overflow-y-auto overflow-x-hidden flex flex-col items-center">
      <div className="w-[min(860px,95vw)] space-y-4">
        <div className="flex items-center justify-between">{Tabs}
          <button onClick={() => w.ask(tab === 'reviews' ? 'Summarise where the Q2 review cycle stands' : tab === 'oneonones' ? 'Give me talking points for my 1:1s this week' : 'How is my team tracking against goals?')} className="px-3 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q</button>
        </div>

        {tab === 'goals' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-4 flex items-center gap-2" style={{ borderRadius: 'var(--r-soft)' }}>
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newGoal.trim()) { w.createGoal(newGoal.trim(), 'Sep 30'); setNewGoal(''); } }} placeholder="New team goal…" className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)]" />
              <button onClick={() => { if (newGoal.trim()) { w.createGoal(newGoal.trim(), 'Sep 30'); setNewGoal(''); } }} className="px-4 py-3 rounded-xl text-sm font-semibold brand-gradient-btn text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Create</button>
            </div>
            {teamGoals.map(g => { const roll = rollup(g.id); const kids = w.goals.filter(k => k.parentId === g.id && !k.archived); return (
              <div key={g.id} className="glass-panel tint-lumen p-5" style={{ borderRadius: 'var(--r-soft)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0"><div className="text-[15px] text-[var(--color-vapor)] font-medium">{g.title}</div><div className="text-[12px] text-[var(--color-trace)] mt-0.5">Team goal · due {g.dueOn}{roll !== null ? ` · roll-up ${roll}%` : ''}</div></div>
                  <button onClick={() => w.cascadeGoal(g.id)} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] flex items-center gap-1 shrink-0"><GitBranch className="w-3 h-3" /> Cascade to team</button>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-glass-edge)] overflow-hidden mb-3"><motion.div initial={{ width: 0 }} animate={{ width: `${roll ?? g.progress}%` }} className="h-full rounded-full bg-[var(--color-lumen)]" /></div>
                {kids.length > 0 && <div className="space-y-2">{kids.map(k => (
                  <div key={k.id} className="flex items-center gap-3">
                    <Avatar seed={name(k.owner)} name={name(k.owner)} size={24} />
                    <span className="text-[13px] text-[var(--color-vapor)] w-28 truncate">{name(k.owner).split(' ')[0]}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${k.progress}%`, background: statusColor(k.status) }} /></div>
                    <span className="text-[12px] font-mono text-[var(--color-trace)] w-9 text-right">{k.progress}%</span>
                  </div>
                ))}</div>}
                {kids.length === 0 && <div className="text-[13px] text-[var(--color-trace)]">Not cascaded yet — share it so each report gets their slice.</div>}
              </div>
            ); })}
          </motion.div>
        )}

        {tab === 'oneonones' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {w.oneOnOnes.map(o => (
              <div key={o.id} className="glass-panel tint-halo p-5" style={{ borderRadius: 'var(--r-soft)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><Avatar seed={name(o.personId)} name={name(o.personId)} size={30} /><div><div className="text-[14px] text-[var(--color-vapor)] font-medium">{name(o.personId)}</div><div className="text-[12px] text-[var(--color-halo-text)]">{o.scheduledFor}</div></div></div>
                  <button onClick={() => w.ask(`Give me talking points for my 1:1 with ${name(o.personId).split(' ')[0]}`)} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Talking points</button>
                </div>
                {o.agenda.length > 0 && <><div className="text-[12px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Agenda</div><ul className="space-y-1 mb-3">{o.agenda.map(a => <li key={a} className="text-[13px] text-[var(--color-mist)] flex gap-2"><span className="text-[var(--color-halo-text)]">·</span>{a}</li>)}</ul></>}
                <div className="text-[12px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Action items</div>
                <div className="space-y-2 mb-2">
                  {o.actions.map(a => (
                    <button key={a.id} onClick={() => w.ooToggle(o.id, a.id)} className="w-full flex items-start gap-2 text-left group">
                      <span className={`mt-0.5 w-4 h-4 rounded-md border shrink-0 grid place-items-center ${a.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] group-hover:border-[var(--color-lumen)]'}`}>{a.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
                      <span className={`text-[13px] ${a.done ? 'text-[var(--color-trace)] line-through' : 'text-[var(--color-vapor)]'}`}>{a.text}</span>
                    </button>
                  ))}
                  {o.actions.length === 0 && <div className="text-[13px] text-[var(--color-trace)]">No action items yet.</div>}
                </div>
                <input value={ai[o.id] ?? ''} onChange={e => setAi(m => ({ ...m, [o.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && (ai[o.id] ?? '').trim()) { w.ooAddAction(o.id, ai[o.id]); setAi(m => ({ ...m, [o.id]: '' })); } }} placeholder="Add an action item…" className="w-full px-3 py-2 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[13px] text-[var(--color-vapor)]" />
              </div>
            ))}
          </motion.div>
        )}

        {tab === 'reviews' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-4 flex items-center justify-between" style={{ borderRadius: 'var(--r-soft)' }}>
              <div className="text-[13px] text-[var(--color-vapor)]">Q2 2026 cycle · <span className="text-[var(--color-mist)]">{w.reviews.filter(r => r.status !== 'not_started').length} / {w.reviews.length} self-reviews in</span></div>
              <button onClick={() => w.nudgeReviews()} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> Nudge outstanding</button>
            </div>
            {w.reviews.map(r => (
              <div key={r.id} className="glass-panel p-4" style={{ borderRadius: 'var(--r-soft)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3"><Avatar seed={name(r.personId)} name={name(r.personId)} size={28} /><span className="text-[14px] text-[var(--color-vapor)] font-medium">{name(r.personId)}</span></div>
                  <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: r.status === 'complete' ? 'color-mix(in srgb, var(--color-lumen) 15%, transparent)' : r.status === 'not_started' ? 'color-mix(in srgb, var(--color-ember) 15%, transparent)' : 'rgba(255,255,255,0.08)', color: r.status === 'complete' ? 'var(--color-lumen)' : r.status === 'not_started' ? 'var(--color-ember)' : 'var(--color-mist)' }}>{r.status === 'not_started' ? 'Self-review outstanding' : r.status === 'self_submitted' ? 'Awaiting your feedback' : 'Complete'}</span>
                </div>
                {r.self && <div className="text-[13px] mb-2"><span className="text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Self-review</span><p className="text-[var(--color-mist)] mt-0.5">{r.self}</p></div>}
                {r.status === 'self_submitted' && (
                  <div className="mt-2">
                    <textarea value={fb[r.id] ?? ''} onChange={e => setFb(m => ({ ...m, [r.id]: e.target.value }))} rows={2} placeholder="Your feedback…" className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] resize-none focus:border-[var(--color-lumen)]" />
                    <button onClick={() => { if ((fb[r.id] ?? '').trim()) w.saveManagerReview(r.id, fb[r.id].trim()); }} disabled={!(fb[r.id] ?? '').trim()} className="mt-2 px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white disabled:opacity-40 hover:brightness-110 transition">Save & complete</button>
                  </div>
                )}
                {r.manager && <div className="text-[13px] mt-1"><span className="text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Your feedback</span><p className="text-[var(--color-vapor)] mt-0.5">{r.manager}</p></div>}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
