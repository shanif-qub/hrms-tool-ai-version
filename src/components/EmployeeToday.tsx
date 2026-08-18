import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarPlus, IndianRupee, FileCheck, Sparkles, CalendarClock, Cake, Plane, PartyPopper, Sun, ArrowRight, Users, ListChecks, HeartHandshake, Receipt, GraduationCap, FileText, ChevronLeft, PanelRightClose, Heart, Award, Wifi, Check } from 'lucide-react';
import { useWorkspace } from '../store';
import { CALENDAR, NOW, MONTHS, ME_ID, TODOS, KUDOS, WEEK_AHEAD } from '../data';
import ClockWidget, { PeriodBar } from './ClockWidget';
import { TokenCard } from './Tokens';
import { Avatar } from './Avatar';
import { sfx } from '../sound';
import { haptic } from '../haptics';
import { registerZone, clearZone } from '../dropzone';

const KIND_ICON: Record<string, ReactNode> = {
  birthday: <Cake className="w-3.5 h-3.5" />, leave: <Plane className="w-3.5 h-3.5" />,
  event: <PartyPopper className="w-3.5 h-3.5" />, holiday: <Sun className="w-3.5 h-3.5" />, rh: <Sun className="w-3.5 h-3.5" />,
};
const TODO_ICON: Record<string, ReactNode> = {
  doc: <FileText className="w-3.5 h-3.5" />, money: <Receipt className="w-3.5 h-3.5" />, tax: <IndianRupee className="w-3.5 h-3.5" />, learning: <GraduationCap className="w-3.5 h-3.5" />,
};
// status: colour + label (lighter purple for legibility)
const STATUS = (s: string) => s === 'on_leave' ? { t: 'On leave', c: 'var(--color-halo-text)' } : s === 'flight_risk' ? { t: 'In', c: 'var(--color-ember)' } : { t: 'In', c: 'var(--color-lumen)' };
// leave-aware presence per teammate — richer than in/out
const PRESENCE: Record<string, { t: string; c: string }> = {
  m1: { t: 'In', c: 'var(--color-lumen)' },
  p2: { t: 'In · at risk', c: 'var(--color-ember)' },
  p3: { t: 'Remote', c: 'var(--color-blue)' },
  p4: { t: 'On leave', c: 'var(--color-halo-text)' },
  p5: { t: 'In', c: 'var(--color-lumen)' },
};
const WA_ICON: Record<string, ReactNode> = { birthday: <Cake className="w-3.5 h-3.5" />, leave: <Plane className="w-3.5 h-3.5" />, holiday: <Sun className="w-3.5 h-3.5" />, anniversary: <Award className="w-3.5 h-3.5" /> };
const WA_COLOR: Record<string, string> = { birthday: 'var(--color-halo-text)', leave: 'var(--color-blue)', holiday: 'var(--color-ember)', anniversary: 'var(--color-lumen)' };

const RAIL_DEEP: Record<string, [string, string][]> = {
  clock: [['This week', '37h 20m'], ['Avg in / out', '09:04 / 18:32'], ['Overtime', '2h 10m'], ['Regularizations', '1 pending']],
  insight: [['Earned balance', '14 d'], ['Lapsing Dec 31', '4 d'], ['Best window', 'Sep 4–7']],
  pending: [['Reimbursement', '₹4,200 in review'], ['Declaration', '5 days left'], ['Training', '40% done']],
  actions: [['Most used', 'Apply leave'], ['Shortcuts', '4'], ['Saved this week', '25 min']],
  agenda: [['Next event', "Priya's birthday"], ['Team leave', '1 this week'], ['Free focus blocks', '6']],
  kudos: [['Received', '3 this qtr'], ['Given', '1'], ['Team avg', '2.4']],
  team: [['Available today', '4 / 5'], ['On leave', 'Elena → 28 Jul'], ['At risk', 'Sarah']],
};
const Stat = ({ items }: { items: [string, string][] }) => (
  <div className="space-y-2 text-[13px]">{items.map(([k, v]) => <div key={k} className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">{k}</span><span className="text-[var(--color-vapor)] font-mono text-right whitespace-nowrap shrink-0">{v}</span></div>)}</div>
);

function KudosBloom({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <defs><radialGradient id="kb-g" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#FFE08A" /><stop offset="55%" stopColor="#FF9FB6" /><stop offset="100%" stopColor="#6A3DFF" /></radialGradient></defs>
      <g fill="url(#kb-g)">
        {[0, 60, 120, 180, 240, 300].map(a => <ellipse key={a} cx="12" cy="5.4" rx="2.7" ry="4.4" transform={`rotate(${a} 12 12)`} />)}
      </g>
      <circle cx="12" cy="12" r="3.1" fill="#fff" fillOpacity="0.92" />
    </svg>
  );
}

const KUDOS_REASONS = ['Great teamwork', 'Above & beyond', 'Brilliant idea', 'Clutch delivery', 'Always helpful'];

function OnboardingCard() {
  const w = useWorkspace();
  const tasks = w.onboardingTasks;
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  if (done === tasks.length) return null;
  const R = 15, C = 2 * Math.PI * R;
  return (
    <TokenCard id="onboarding-checklist" kind="kpi" placement="flow" shape="soft" tint="halo" label="Getting started" onActivate={() => {}}
      deep={<Stat items={[['Completed', `${done} / ${tasks.length}`], ['Buddy', w.onboardingBuddy], ['Week', '1 of 2']]} />}
      className="w-full border border-[var(--color-halo)]/30"
      expand={<div className="text-[13px] text-[var(--color-mist)]">Your first-week setup. Tick items as you go — Q can walk you through any of them.</div>}>
      <div className="flex items-center gap-3 mb-3">
        <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90">
          <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
          <motion.circle cx="20" cy="20" r={R} fill="none" stroke="var(--color-lumen)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 0.6 }} />
        </svg>
        <div className="min-w-0">
          <div className="text-[13px] text-[var(--color-vapor)] font-medium">Welcome — let’s get you set up</div>
          <div className="text-[13px] text-[var(--color-trace)]">{done} of {tasks.length} done · buddy {w.onboardingBuddy.split(' ')[0]}</div>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <button key={t.id} onClick={(e) => { e.stopPropagation(); w.toggleOnboardingTask(t.id); }} className="w-full flex items-start gap-3 text-left group">
            <span className={`mt-0.5 w-4 h-4 rounded-md border shrink-0 grid place-items-center transition-colors ${t.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] group-hover:border-[var(--color-lumen)]'}`}>{t.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
            <span className="min-w-0 flex-1">
              <span className={`text-[13px] ${t.done ? 'text-[var(--color-trace)] line-through' : 'text-[var(--color-vapor)]'}`}>{t.label}</span>
              {!t.done && t.hint && <span className="block text-[12px] text-[var(--color-trace)]">{t.hint}</span>}
            </span>
          </button>
        ))}
      </div>
      <button onClick={(e) => { e.stopPropagation(); w.ask('What should I do first to get set up?'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 transition-colors flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q to guide me</button>
    </TokenCard>
  );
}

function PulseCard() {
  const w = useWorkspace();
  const s = w.survey;
  return (
    <div className="glass-panel tint-halo p-4">
      <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-lumen)] mb-2"><Heart className="w-3 h-3" /> Weekly pulse</div>
      <div className="text-sm text-[var(--color-vapor)] mb-3">{s.question}</div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(n => { const on = s.myScore === n; return (
          <button key={n} onClick={() => w.submitPulse(n)} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${on ? 'bg-[var(--color-lumen)] text-[var(--color-abyss)] font-semibold' : 'glass-soft hover:bg-white/10 text-[var(--color-mist)]'}`}>{n}</button>
        ); })}
      </div>
      <div className="flex justify-between text-[11px] text-[var(--color-trace)] mt-2"><span>Rough week</span><span>Great week</span></div>
      {s.myScore !== undefined
        ? <div className="text-[12px] text-[var(--color-lumen)] mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Your pulse is in — tap to change.</div>
        : <div className="text-[11px] text-[var(--color-trace)] mt-2">Anonymous · shared only as a team trend, never attributed.</div>}
    </div>
  );
}

function RecognitionCard() {  const w = useWorkspace();
  const team = w.people.filter(p => p.id !== ME_ID).slice(0, 5);
  const [given, setGiven] = useState(KUDOS.given);
  const [composing, setComposing] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const send = (name: string, reason: string) => {
    setGiven(g => g + 1); setComposing(null); setCelebrate(c => c + 1);
    w.pulse(window.innerWidth - 180, 380, 'ok'); sfx.merge(); haptic('high');
    setTimeout(() => setCelebrate(0), 1500);
    w.toast(`Kudos to ${name.split(' ')[0]} — “${reason}”`, 'ok');
  };
  const total = KUDOS.received + (given - KUDOS.given);
  const person = team.find(p => p.id === composing);
  return (
    <TokenCard id="kudos" kind="kpi" placement="flow" shape="soft" tint="coral" label="Recognition" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.kudos} />} className="w-full border border-[var(--color-coral)]/25"
      expand={<div className="text-[13px] text-[var(--color-mist)]">Recognition keeps teams healthy. Tap a teammate to send kudos with a reason.</div>}>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-coral)]"><KudosBloom size={14} /> Recognition</div>
          <span className="text-[13px] font-mono px-2 py-0.5 rounded-full brand-gradient-btn text-white flex items-center gap-1"><KudosBloom size={11} /> {total}</span>
        </div>
        <div className="rounded-2xl p-3 mb-3 brand-gradient-soft flex items-start gap-3">
          <Avatar seed={KUDOS.from} name={KUDOS.from} size={32} />
          <p className="text-[13px] text-[var(--color-vapor)] leading-snug"><span className="font-semibold">{KUDOS.from}</span> {KUDOS.message}.</p>
        </div>

        {person ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={(e) => { e.stopPropagation(); setComposing(null); }} className="text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)]">← </button>
              <Avatar seed={person.name} name={person.name} size={24} />
              <span className="text-[13px] text-[var(--color-vapor)]">Kudos to {person.name.split(' ')[0]}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {KUDOS_REASONS.map(r => (
                <button key={r} onClick={(e) => { e.stopPropagation(); send(person.name, r); }}
                  className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-[var(--color-coral)]/15 hover:text-[var(--color-coral)] transition-colors">{r}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Recognise a teammate</span>
              <span className="text-[13px] font-mono text-[var(--color-trace)]">{given} given</span>
            </div>
            <div className="flex items-center gap-2">
              {team.map(p => (
                <button key={p.id} onClick={(e) => { e.stopPropagation(); setComposing(p.id); sfx.pickup(); }} title={`Send kudos to ${p.name}`} aria-label={`Send kudos to ${p.name}`}
                  className="rounded-full hover:scale-110 transition-transform ring-1 ring-transparent hover:ring-[var(--color-coral)]"><Avatar seed={p.name} name={p.name} size={32} /></button>
              ))}
            </div>
          </>
        )}

        {celebrate > 0 && (
          <div className="absolute inset-0 pointer-events-none grid place-items-center overflow-visible">
            <motion.div key={celebrate} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 1.5, 1.9], opacity: [0, 1, 0] }} transition={{ duration: 1.2, ease: 'easeOut' }}><KudosBloom size={54} /></motion.div>
            {Array.from({ length: 10 }).map((_, k) => { const a = (k / 10) * Math.PI * 2; return (
              <motion.span key={k} initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }} animate={{ opacity: [0, 1, 0], x: Math.cos(a) * 78, y: Math.sin(a) * 54, scale: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute w-1.5 h-1.5 rounded-full" style={{ background: k % 2 ? 'var(--color-coral)' : 'var(--color-lumen)' }} />
            ); })}
          </div>
        )}
      </div>
    </TokenCard>
  );
}

export default function EmployeeToday() {
  const w = useWorkspace();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const me = w.people.find(p => p.id === ME_ID)!;
  const pendingDocs = w.documents.filter(d => d.mustAck && !d.acked).length;
  const team = w.people.filter(p => p.id !== ME_ID).slice(0, 5);
  const upcoming = CALENDAR.filter(e => e.m > NOW.m || (e.m === NOW.m && e.d >= NOW.d)).sort((a, b) => a.m - b.m || a.d - b.d).slice(0, 3);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = () => registerZone('panel-today', w.panelRight ? panelRef.current : null, 'panel'); r(); window.addEventListener('resize', r); return () => { window.removeEventListener('resize', r); clearZone('panel-today'); }; });

  const collapsed = !w.panelRight;
  const capsule = (
    <button onClick={() => w.setPanel('right', true)} aria-label="Expand Today panel" className="fixed right-3 top-[76px] z-20 w-12 glass-panel shape-soft flex flex-col items-center gap-3 py-3 hover:bg-white/10 transition-colors">
      <ChevronLeft className="w-4 h-4 text-[var(--color-trace)]" />
      <Sparkles className="w-4 h-4 text-[var(--color-lumen)]" />
      <span className="text-[13px] font-mono text-[var(--color-mist)]">{TODOS.length}</span>
      <CalendarClock className="w-4 h-4 text-[var(--color-mist)] mt-1" />
    </button>
  );

  const actions = [
    { label: 'Apply leave', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setRegion('calendar') },
    { label: 'Payslip', icon: <IndianRupee className="w-4 h-4" />, run: () => w.setRegion('payroll') },
    { label: pendingDocs ? `Sign ${pendingDocs} docs` : 'Documents', icon: <FileCheck className="w-4 h-4" />, badge: pendingDocs || undefined, run: () => w.setRegion('documents') },
    { label: 'Ask Q', icon: <Sparkles className="w-4 h-4" />, run: () => w.setQ(true) },
  ];

  return (
    <>
      {collapsed && capsule}
      <div ref={panelRef} className="fixed right-3 z-20 w-[21rem] flex flex-col" style={{ top: 76, bottom: 96, visibility: collapsed ? 'hidden' : 'visible', pointerEvents: collapsed ? 'none' : undefined }} aria-hidden={collapsed}>
      <div className="px-1 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <div className="text-lg font-display brand-text field-title leading-tight">{greet}, {me.name.split(' ')[0]}</div>
          <div className="text-[13px] font-mono field-sub">{MONTHS[NOW.m]} {NOW.d} · {me.role}</div>
        </div>
        <button onClick={() => w.setPanel('right', false)} aria-label="Collapse panel" className="text-[var(--color-trace)] hover:text-[var(--color-vapor)] mt-1"><PanelRightClose className="w-4 h-4" /></button>
      </div>

      <div className={`panel-scroll flex-1 min-h-0 flex flex-col gap-3 px-3 pt-3 -mx-1 ${w.dragging ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        {/* hero clock */}
        <TokenCard id="clock-today" kind="kpi" placement="flow" shape="soft" tint="lumen" label="Today — attendance" onActivate={() => {}} deep={<div className="space-y-3"><PeriodBar /><Stat items={RAIL_DEEP.clock} /></div>} className="w-full border border-[var(--color-lumen)]/35"
          expand={<div className="text-[13px] text-[var(--color-mist)]">This week 37h 20m · avg in/out 09:04 / 18:32 · 1 regularization pending.</div>}>
          <ClockWidget bare />
        </TokenCard>

        {/* distinct proactive Q insight (leave lapse) */}
        <TokenCard id="q-insight" kind="cue" placement="flow" shape="soft" tint="halo" label="Q insight" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.insight} />} className="w-full border border-[var(--color-lumen)]/30"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Drag onto your Calendar sphere or onto Q to plan the time off automatically.</div>}>
          <div className="flex items-center gap-2 mb-2 text-[13px] uppercase tracking-widest text-[var(--color-lumen)]"><Sparkles className="w-3 h-3" /> Q insight</div>
          <p className="text-[14px] text-[var(--color-vapor)] leading-snug mb-3">4 of your earned-leave days will lapse on Dec 31. Want me to block two long weekends so none go to waste?</p>
          <button onClick={(e) => { e.stopPropagation(); w.ask('How much leave will lapse this year and can you plan it?'); }} className="w-full py-2 rounded-full text-[13px] font-semibold brand-gradient-btn text-white hover:brightness-110 transition flex items-center justify-center gap-2">Plan time off <ArrowRight className="w-3.5 h-3.5" /></button>
        </TokenCard>

        {/* recognition — prominent, interactive */}
        <OnboardingCard />
        <RecognitionCard />
        <PulseCard />

        {/* pending / to-dos */}
        <TokenCard id="pending" kind="kpi" placement="flow" shape="soft" tint="ember" label="Pending for you" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.pending} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Q curated these from documents, payroll and learning. Drag onto Q to triage.</div>}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><ListChecks className="w-3 h-3" /> Pending for you</div>
            <span className="text-[13px] font-mono w-4 h-4 grid place-items-center rounded-full brand-gradient-btn text-white">{TODOS.length}</span>
          </div>
          <div className="space-y-2">
            {TODOS.map(t => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full grid place-items-center glass-soft text-[var(--color-lumen)] shrink-0">{TODO_ICON[t.kind]}</span>
                <span className="text-[13px] text-[var(--color-vapor)] flex-1 leading-tight">{t.label}</span>
                <span className="text-[13px] font-mono text-[var(--color-trace)] shrink-0">{t.due}</span>
              </div>
            ))}
          </div>
        </TokenCard>

        {/* quick actions */}
        <TokenCard id="quick-actions" kind="kpi" placement="flow" shape="soft" tint="mist" label="Quick actions" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.actions} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Your most-used actions for the day.</div>}>
          <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3">Quick actions</div>
          <div className="grid grid-cols-2 gap-2">
            {actions.map(a => (
              <button key={a.label} onClick={(e) => { e.stopPropagation(); a.run(); }} className="relative node-lift glass-soft rounded-2xl px-3 py-3 flex flex-col items-start gap-2 hover:bg-white/10 transition-colors text-left">
                <span className="text-[var(--color-lumen)]">{a.icon}</span>
                <span className="text-[13px] text-[var(--color-vapor)] leading-tight">{a.label}</span>
                {a.badge && <span className="absolute top-2 right-2 text-[13px] font-mono w-4 h-4 grid place-items-center rounded-full brand-gradient-btn text-white">{a.badge}</span>}
              </button>
            ))}
          </div>
        </TokenCard>

        {/* next up */}
        <TokenCard id="agenda" kind="kpi" placement="flow" shape="soft" tint="halo" label="Week ahead" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.agenda} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Your upcoming days. Drag onto Q to plan the week.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><CalendarClock className="w-3 h-3" /> Week ahead</div>
          <div className="space-y-2">
            {WEEK_AHEAD.map(e => (
              <div key={e.id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full grid place-items-center glass-soft shrink-0" style={{ color: WA_COLOR[e.kind] }}>{WA_ICON[e.kind] ?? <PartyPopper className="w-3.5 h-3.5" />}</span>
                <span className="text-[13px] text-[var(--color-vapor)] flex-1 leading-tight">{e.label}</span>
                <span className="text-[13px] font-mono text-[var(--color-trace)] shrink-0">{e.date}</span>
              </div>
            ))}
          </div>
        </TokenCard>

        {/* team presence + legend */}
        <TokenCard id="team-today" kind="kpi" placement="flow" shape="soft" tint="mist" label="Your team today" onActivate={() => {}} deep={<Stat items={RAIL_DEEP.team} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Live presence across your team. Drag onto Q for a full coverage read.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><Users className="w-3 h-3" /> Your team today</div>
          <div className="space-y-2">
            {team.map(p => { const st = PRESENCE[p.id] ?? STATUS(p.status); return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="relative w-7 h-7 shrink-0"><Avatar seed={p.name} name={p.name} size={28} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-abyss)]" style={{ background: st.c }} /></span>
                <span className="text-[14px] text-[var(--color-vapor)] flex-1 truncate">{p.name}</span>
                <span className="text-[13px] font-mono" style={{ color: st.c }}>{st.t}</span>
              </div>
            ); })}
          </div>
          {/* legend */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-glass-edge)] text-[13px] text-[var(--color-mist)]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-lumen)' }} /> In</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-blue)' }} /> Remote</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-halo-text)' }} /> On leave</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-ember)' }} /> At risk</span>
          </div>
        </TokenCard>
      </div>
    </div>
    </>
  );
}
