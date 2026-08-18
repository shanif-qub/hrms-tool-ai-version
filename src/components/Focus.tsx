// Focus — a full-screen extension of The Now for My Team and The Org.
// Every open item derived live from state, sorted by priority, colour-coded,
// completable one-by-one. Each task carries direct actions AND a per-task
// "Ask Q" so the whole queue is conversational. Swipe a card right to clear it.

import { useMemo, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Crosshair, Sparkles, Check, ArrowUpRight, X, ClipboardCheck, AlertTriangle, LifeBuoy, MessageSquare, IndianRupee, UserPlus, FileText, Activity } from 'lucide-react';
import { useWorkspace } from '../store';
import { COVERAGE } from '../data';
import { sfx } from '../sound';
import RationaleDisclosure from './RationaleDisclosure';

type Prio = 'critical' | 'high' | 'medium' | 'low';
const PRIO: Record<Prio, { label: string; color: string; rank: number }> = {
  critical: { label: 'Critical', color: 'var(--color-coral)', rank: 0 },
  high: { label: 'High', color: 'var(--color-ember)', rank: 1 },
  medium: { label: 'Medium', color: 'var(--color-halo-text)', rank: 2 },
  low: { label: 'Low', color: 'var(--color-lumen)', rank: 3 },
};

interface Task {
  id: string; prio: Prio; kind: string; icon: ReactNode;
  title: string; detail: string;
  primary?: { label: string; run: () => void };
  secondary?: { label: string; run: () => void };
  ask: string;           // what "Ask Q" sends
  rationale?: NonNullable<import('../types').QMsg['rationale']>;
  clearable?: boolean;   // swipe/skip removes it (cues); derived items clear themselves when acted on
  cueId?: string;
}

export default function Focus() {
  const w = useWorkspace();
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(0);
  const tick = () => { setDone(d => d + 1); sfx.confirm(); };

  const tasks = useMemo<Task[]>(() => {
    const t: Task[] = [];
    const reports = w.people.filter(p => p.managerId === 'm1');

    if (w.lens === 'manager') {
      // Pending approvals — one task per request; SLA breach escalates to critical.
      w.leaves.filter(l => l.status === 'pending').forEach(l => t.push({
        id: `ap-${l.id}`, prio: l.isSlaBreached ? 'critical' : 'high', kind: 'Approval', icon: <ClipboardCheck className="w-4 h-4" />,
        title: `${l.personName} · ${l.days}d ${l.kind} leave`,
        detail: `${l.startDate}${l.endDate !== l.startDate ? ` – ${l.endDate}` : ''}${l.isSlaBreached ? ' · SLA breaches in under 2h' : ''}${l.conflictWith ? ` · overlaps ${l.conflictWith}` : ''}`,
        primary: { label: 'Approve', run: () => { w.approve(l.id); tick(); } },
        secondary: { label: 'Decline', run: () => { w.reject(l.id); tick(); } },
        ask: `Tell me about ${l.personName.split(' ')[0]}'s leave request — any conflicts?`,
      }));
      // Flight risk.
      w.people.filter(p => p.status === 'flight_risk').forEach(p => t.push({
        id: `fr-${p.id}`, prio: 'critical', kind: 'Risk', icon: <AlertTriangle className="w-4 h-4" />,
        title: `${p.name} — elevated flight risk`,
        detail: `Attendance ${Math.round((p.attendance ?? 0.9) * 100)}% and trending down. A retention move now is far cheaper than a backfill.`,
        primary: { label: 'Simulate a move', run: () => { w.simulate(p.id, 'bonus'); tick(); } },
        secondary: { label: 'Open team', run: () => w.setRegion('team') },
        ask: `Why is ${p.name.split(' ')[0]} a flight risk and what would you try first?`,
        rationale: {
          why: `${p.name.split(' ')[0]}'s attendance and engagement are declining together — the pattern that most often precedes a resignation.`,
          whyNow: `Attendance sits at ${Math.round((p.attendance ?? 0.9) * 100)}% and the slide has held for weeks, so this is a trend, not a blip.`,
          whyNot: 'A high score flags a conversation, not a certainty — it can be wrong, and the move is yours to make.',
          confidence: ((p.attendance ?? 0.9) < 0.78 ? 'high' : 'medium') as 'high' | 'medium',
          evidence: [`Attendance ${Math.round((p.attendance ?? 0.9) * 100)}% vs ~92% team median`, `Velocity ${Math.round((p.velocity ?? 0.5) * 100)}`, 'Backfilling this role costs months of ramp'],
        },
      }));
      // Coverage gaps.
      const uncovered = COVERAGE.filter(c => !w.coverage[c.id]);
      if (uncovered.length) t.push({
        id: 'cov', prio: 'high', kind: 'Coverage', icon: <LifeBuoy className="w-4 h-4" />,
        title: `${uncovered.length} leave window${uncovered.length === 1 ? '' : 's'} uncovered`,
        detail: uncovered.map(c => `${w.people.find(p => p.id === c.personId)?.name.split(' ')[0]} (${c.risk})`).join(' · '),
        primary: { label: 'Auto-assign cover', run: () => { w.autoCoverAll(); tick(); } },
        secondary: { label: 'Open planning', run: () => w.setRegion('planning') },
        ask: 'Who should cover the upcoming leave windows?',
      });
      // Outstanding self-reviews.
      const out = w.reviews.filter(r => r.status === 'not_started');
      if (out.length) t.push({
        id: 'rev', prio: 'medium', kind: 'Reviews', icon: <MessageSquare className="w-4 h-4" />,
        title: `${out.length} self-review${out.length === 1 ? '' : 's'} outstanding`,
        detail: `Q2 cycle: ${out.map(r => w.people.find(p => p.id === r.personId)?.name.split(' ')[0]).filter(Boolean).join(', ')} still to submit.`,
        primary: { label: 'Nudge them', run: () => { w.nudgeReviews(); tick(); } },
        secondary: { label: 'Open growth', run: () => w.setRegion('growth') },
        ask: 'Where is the review cycle and who is outstanding?',
      });
      // Comp plan not started.
      if (w.comp.status === 'draft' && Object.keys(w.comp.plan).length === 0) t.push({
        id: 'comp', prio: 'medium', kind: 'Planning', icon: <IndianRupee className="w-4 h-4" />,
        title: 'Merit budget unallocated',
        detail: `₹${(w.comp.budget / 100000).toFixed(1)}L to plan. One report sits below band — the cheapest retention lever you have.`,
        primary: { label: 'Open planning', run: () => w.setRegion('planning') },
        ask: 'Help me plan compensation — who should I prioritise?',
      });
      void reports;
    }

    if (w.lens === 'hr') {
      // Pooled payroll anomalies.
      w.payslips.filter(p => p.status === 'pooled').forEach(p => t.push({
        id: `pp-${p.id}`, prio: 'critical', kind: 'Payroll', icon: <IndianRupee className="w-4 h-4" />,
        title: `${p.month} pay pooled — ${p.personName}`,
        detail: `${p.anomalyReason ?? 'Needs a human sign-off before release.'} ₹${p.amount.toLocaleString('en-IN')} held.`,
        primary: { label: 'Approve correction', run: () => { w.overridePayroll(p.id); tick(); } },
        secondary: { label: 'Open payroll', run: () => w.setRegion('payroll') },
        ask: `Why is ${p.personName.split(' ')[0]}'s ${p.month} pay pooled?`,
      }));
      // Comp plan routed from a manager.
      if (w.comp.status === 'submitted') t.push({
        id: 'compapprove', prio: 'high', kind: 'Planning', icon: <IndianRupee className="w-4 h-4" />,
        title: 'A comp plan awaits your approval',
        detail: `Marcus routed ${Object.keys(w.comp.plan).length} raise${Object.keys(w.comp.plan).length === 1 ? '' : 's'} for sign-off — one sits above band ceiling.`,
        primary: { label: 'Approve plan', run: () => { w.approveCompPlan(); tick(); } },
        secondary: { label: 'Review in planning', run: () => w.setRegion('planning') },
        ask: 'Walk me through the comp plan Marcus submitted.',
      });
      // Onboarding buddies.
      w.candidates.filter(c => c.progress >= 90 && !c.buddy).forEach(c => t.push({
        id: `ob-${c.id}`, prio: 'high', kind: 'Onboarding', icon: <UserPlus className="w-4 h-4" />,
        title: `${c.name} needs a start buddy`,
        detail: `${c.progress}% through onboarding (${c.stage}). Assign a buddy before day one.`,
        primary: { label: 'Open onboarding', run: () => w.setRegion('onboarding') },
        ask: `Who would be a good start buddy for ${c.name.split(' ')[0]}?`,
      }));
      // Exits / risk from the org view.
      w.people.filter(p => p.status === 'flight_risk').forEach(p => t.push({
        id: `hfr-${p.id}`, prio: 'high', kind: 'Risk', icon: <AlertTriangle className="w-4 h-4" />,
        title: `${p.name} — retention watch`,
        detail: 'Flagged by their manager. Comp gap is a factor; a plan may route to you.',
        primary: { label: 'Open org', run: () => w.setRegion('people') },
        ask: `What is the org-level view on ${p.name.split(' ')[0]}'s risk?`,
      }));
    }

    // Live cues for this lens round out the queue (skip the approvals summary cue —
    // approvals are itemised above).
    const cuePrio: Record<string, Prio> = { risk: 'critical', sla: 'high', coverage: 'high', payroll: 'high', review: 'medium', doc: 'medium', headcount: 'medium', onboarding: 'medium', wellness: 'low', nudge: 'low' };
    w.cues.filter(c => c.persona === w.lens && !(c.kind === 'sla' && /approval/.test(c.message))).forEach(c => t.push({
      id: `cue-${c.id}`, prio: cuePrio[c.kind] ?? 'low', kind: 'Signal', icon: c.kind === 'doc' ? <FileText className="w-4 h-4" /> : <Activity className="w-4 h-4" />,
      title: c.message.length > 64 ? c.message.slice(0, 64) + '…' : c.message,
      detail: c.message.length > 64 ? c.message : 'Q surfaced this from live activity.',
      primary: { label: c.actionText, run: () => { w.dismissCue(c.id); tick(); } },
      ask: `Tell me more: ${c.message}`,
      clearable: true, cueId: c.id,
    }));

    return t.filter(x => !skipped.has(x.id)).sort((a, b) => PRIO[a.prio].rank - PRIO[b.prio].rank);
  }, [w, skipped]);

  const counts = (['critical', 'high', 'medium', 'low'] as Prio[]).map(p => [p, tasks.filter(t => t.prio === p).length] as const).filter(([, n]) => n > 0);
  const skip = (t: Task) => { setSkipped(s => new Set(s).add(t.id)); if (t.cueId) w.dismissCue(t.cueId); setDone(d => d + 1); sfx.close(); };

  return (
    <div className="absolute inset-0 overflow-y-auto panel-scroll" style={{ paddingTop: 84, paddingBottom: 120 }}>
      <div className="mx-auto w-[min(760px,92vw)]">
        <header className="glass-panel shape-soft px-5 py-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Crosshair className="w-5 h-5 text-[var(--color-lumen)]" />
              <div>
                <div className="font-display text-lg text-[var(--color-vapor)]">Focus</div>
                <div className="text-[13px] text-[var(--color-mist)]">{tasks.length ? `${tasks.length} open · pick them off one by one` : 'All clear'}{done ? ` · ${done} cleared this session` : ''}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {counts.map(([p, n]) => (
                <span key={p} className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2" style={{ color: PRIO[p].color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIO[p].color, boxShadow: `0 0 6px ${PRIO[p].color}` }} />{n} {PRIO[p].label.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[13px] text-[var(--color-trace)] flex items-center gap-2"><Sparkles className="w-3 h-3 text-[var(--color-lumen)]" /> Every card answers to Q — tap “Ask Q”, or just type: “approve Sarah’s leave”, “auto-assign coverage”. Swipe right to clear.</div>
        </header>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {tasks.map((t, i) => (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60, scale: 0.97 }}
                transition={w.reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 300, damping: 28, delay: Math.min(i * 0.04, 0.3) }}
                drag={w.reduced ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.05, right: 0.5 }}
                onDragEnd={(_, info) => { if (info.offset.x > 130) skip(t); }}
                className="glass-panel shape-soft relative overflow-hidden cursor-grab active:cursor-grabbing">
                <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: PRIO[t.prio].color, boxShadow: `0 0 10px ${PRIO[t.prio].color}` }} />
                <div className="pl-5 pr-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ color: PRIO[t.prio].color }}>{t.icon}</span>
                      <span className="text-[12px] uppercase tracking-widest font-semibold" style={{ color: PRIO[t.prio].color }}>{PRIO[t.prio].label} · {t.kind}</span>
                    </div>
                    <button onClick={() => skip(t)} aria-label="Clear from Focus" title="Clear from Focus" className="text-[var(--color-trace)] hover:text-[var(--color-vapor)] shrink-0"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-vapor)] font-medium leading-snug">{t.title}</div>
                  <div className="mt-0.5 text-[13px] text-[var(--color-mist)] leading-snug">{t.detail}</div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {t.primary && (
                      <button onClick={t.primary.run} className="text-[13px] px-3 py-2 rounded-full font-semibold glass-soft hover:bg-white/10 transition-colors flex items-center gap-2" style={{ color: PRIO[t.prio].color }}>
                        <Check className="w-3 h-3" /> {t.primary.label}
                      </button>
                    )}
                    {t.secondary && (
                      <button onClick={t.secondary.run} className="text-[13px] px-3 py-2 rounded-full text-[var(--color-mist)] glass-soft hover:bg-white/10 hover:text-[var(--color-vapor)] transition-colors flex items-center gap-2">
                        {t.secondary.label} <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => w.ask(t.ask)} className="text-[13px] px-3 py-2 rounded-full text-[var(--color-lumen)] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Ask Q
                    </button>
                  </div>
                  {t.rationale && <div className="mt-2"><RationaleDisclosure rationale={t.rationale} indent={false} /></div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel shape-soft px-5 py-8 text-center">
              <Sparkles className="w-6 h-6 text-[var(--color-lumen)] mx-auto mb-2" />
              <div className="text-sm text-[var(--color-vapor)] font-medium">All clear{done ? ` — ${done} item${done === 1 ? '' : 's'} handled` : ''}.</div>
              <div className="text-[13px] text-[var(--color-mist)] mt-1">Q will surface new items here as they happen.</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
