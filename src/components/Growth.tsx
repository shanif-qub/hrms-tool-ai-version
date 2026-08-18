import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, ThumbsUp, Eye, Target, MessageSquare, Milestone, Plus, Minus, Check, CalendarClock, ClipboardList } from 'lucide-react';
import { useWorkspace } from '../store';
import { SELF_REVIEW, ME_ID } from '../data';
import { JourneyTimeline } from './Journey';

export default function Growth() {
  const w = useWorkspace();
  const [tab, setTab] = useState<'growth' | 'journey'>('growth');
  const [reviewText, setReviewText] = useState('');
  const [aiText, setAiText] = useState('');
  const gapColor = SELF_REVIEW.alignment.gap === 'medium' ? 'var(--color-ember)' : SELF_REVIEW.alignment.gap === 'high' ? 'var(--color-coral)' : 'var(--color-lumen)';
  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 panel-scroll overflow-y-auto overflow-x-hidden flex flex-col items-center">
      <div className="w-[min(860px,95vw)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 glass-soft p-1 rounded-full">
            <button onClick={() => setTab('growth')} className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors ${tab === 'growth' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><TrendingUp className="w-3.5 h-3.5" /> Growth</button>
            <button onClick={() => setTab('journey')} className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors ${tab === 'journey' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Milestone className="w-3.5 h-3.5" /> Journey</button>
          </div>
          <button onClick={() => w.ask(tab === 'journey' ? 'Summarise my growth and tenure so far' : 'Prep a brief for my next 1:1 with Marcus')} className="px-3 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> {tab === 'journey' ? 'Ask Q' : 'Prep 1:1 with Q'}</button>
        </div>

        {tab === 'journey' ? (
          <motion.div key="journey" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><Milestone className="w-3.5 h-3.5" /> Your journey · Lumen Labs</div>
            <div className="glass-panel tint-lumen p-6"><JourneyTimeline /></div>
          </motion.div>
        ) : (
        <motion.div key="growth" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* AI summary */}
        <div className="glass-panel tint-halo p-5">
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-halo-text)] mb-3"><Sparkles className="w-3.5 h-3.5" /> Q summary of your self-review</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-2"><ThumbsUp className="w-3 h-3 text-[var(--color-lumen)]" /> Strengths</div>
              <ul className="space-y-2 text-[13px] text-[var(--color-mist)]">{SELF_REVIEW.strengths.map(x => <li key={x} className="flex gap-2"><span className="text-[var(--color-lumen)]">·</span>{x}</li>)}</ul>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[13px] uppercase tracking-wider text-[var(--color-trace)] mb-2"><Eye className="w-3 h-3 text-[var(--color-ember)]" /> Blind spots</div>
              <ul className="space-y-2 text-[13px] text-[var(--color-mist)]">{SELF_REVIEW.blindspots.map(x => <li key={x} className="flex gap-2"><span className="text-[var(--color-ember)]">·</span>{x}</li>)}</ul>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl glass-soft flex items-start gap-2" style={{ borderLeft: `2px solid ${gapColor}` }}>
            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: gapColor }} />
            <div className="text-[13px] text-[var(--color-mist)]"><span className="text-[var(--color-vapor)] font-semibold">Perception gap ({SELF_REVIEW.alignment.gap}). </span>{SELF_REVIEW.alignment.note}</div>
          </div>
        </div>

        {/* goals (live) */}
        <div className="glass-panel tint-lumen p-5">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><Target className="w-3.5 h-3.5" /> Goals this cycle</div>
          <div className="space-y-4">
            {w.goals.filter(g => g.owner === ME_ID && !g.archived).map((g, i) => { const c = g.status === 'done' ? 'var(--color-lumen)' : g.status === 'at_risk' ? 'var(--color-ember)' : 'var(--color-lumen)'; return (
              <div key={g.id} className="space-y-1">
                <div className="flex justify-between items-center gap-2 text-[13px]">
                  <span className="text-[var(--color-vapor)] min-w-0">{g.title}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}>{g.status.replace('_', ' ')}</span>
                    <button onClick={() => w.updateGoalProgress(g.id, -10)} className="w-5 h-5 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><Minus className="w-3 h-3" /></button>
                    <span className="font-mono text-[var(--color-trace)] w-9 text-center">{g.progress}%</span>
                    <button onClick={() => w.updateGoalProgress(g.id, 10)} className="w-5 h-5 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><Plus className="w-3 h-3" /></button>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="h-full rounded-full" style={{ background: c }} /></div>
                <div className="text-[11px] text-[var(--color-trace)]">Due {g.dueOn}{g.parentId ? ' · cascaded from your manager' : ''}</div>
              </div>
            ); })}
          </div>
        </div>

        {/* next 1:1 */}
        {w.oneOnOnes.filter(o => o.personId === ME_ID).map(o => (
          <div key={o.id} className="glass-panel tint-halo p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><CalendarClock className="w-3.5 h-3.5" /> Next 1:1 with Marcus</div>
              <span className="text-[12px] text-[var(--color-halo-text)]">{o.scheduledFor}</span>
            </div>
            <div className="text-[12px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Shared agenda</div>
            <ul className="space-y-1 mb-3">{o.agenda.map(a => <li key={a} className="text-[13px] text-[var(--color-mist)] flex gap-2"><span className="text-[var(--color-halo-text)]">·</span>{a}</li>)}</ul>
            <div className="text-[12px] uppercase tracking-wider text-[var(--color-trace)] mb-2">Action items</div>
            <div className="space-y-2 mb-2">
              {o.actions.map(ai => (
                <button key={ai.id} onClick={() => w.ooToggle(o.id, ai.id)} className="w-full flex items-start gap-2 text-left group">
                  <span className={`mt-0.5 w-4 h-4 rounded-md border shrink-0 grid place-items-center ${ai.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] group-hover:border-[var(--color-lumen)]'}`}>{ai.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
                  <span className={`text-[13px] ${ai.done ? 'text-[var(--color-trace)] line-through' : 'text-[var(--color-vapor)]'}`}>{ai.text}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={aiText} onChange={e => setAiText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && aiText.trim()) { w.ooAddAction(o.id, aiText); setAiText(''); } }} placeholder="Add an action item…" className="flex-1 px-3 py-2 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[13px] text-[var(--color-vapor)]" />
              <button onClick={() => w.ask('Prep a brief for my next 1:1 with Marcus')} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-2 shrink-0"><Sparkles className="w-3.5 h-3.5" /> Prep with Q</button>
            </div>
          </div>
        ))}

        {/* Q2 review */}
        {w.reviews.filter(r => r.personId === ME_ID).map(r => (
          <div key={r.id} className="glass-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><ClipboardList className="w-3.5 h-3.5" /> {r.cycle} review</div>
              <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: r.status === 'complete' ? 'color-mix(in srgb, var(--color-lumen) 15%, transparent)' : 'rgba(255,255,255,0.08)', color: r.status === 'complete' ? 'var(--color-lumen)' : 'var(--color-mist)' }}>{r.status === 'not_started' ? 'Self-review due' : r.status === 'self_submitted' ? 'Awaiting manager' : 'Complete'}</span>
            </div>
            {r.status === 'not_started' ? (
              <>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3} placeholder="How did this quarter go? Wins, challenges, what you want next…" className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] resize-none focus:border-[var(--color-lumen)]" />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => { if (reviewText.trim()) w.submitSelfReview(r.id, reviewText.trim()); }} disabled={!reviewText.trim()} className="px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white disabled:opacity-40 hover:brightness-110 transition">Submit self-review</button>
                  <button onClick={() => w.ask('Draft a self-review from my goals and recent work')} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Draft with Q</button>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-[13px]">
                <div><span className="text-[var(--color-trace)] text-[12px] uppercase tracking-wider">Your self-review</span><p className="text-[var(--color-mist)] mt-0.5">{r.self}</p></div>
                {r.manager && <div><span className="text-[var(--color-trace)] text-[12px] uppercase tracking-wider">Manager feedback</span><p className="text-[var(--color-vapor)] mt-0.5">{r.manager}</p></div>}
              </div>
            )}
          </div>
        ))}
        </motion.div>
        )}
      </div>
    </div>
  );
}
