import { useEffect, useState, useRef, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls } from 'motion/react';
import { PenSquare, CalendarDays, FileText, IndianRupee, Users, Layers, Sparkles, Plane, TrendingUp, LifeBuoy, ClipboardCheck, BarChart3, MessageSquare, UserPlus, Building2, AlertTriangle, Share2, LayoutGrid, Check, X, Pause, RotateCcw, UserCog, Radio, Timer, Shield, Crosshair, Eye, EyeOff, Wand2, Maximize2, GripVertical } from 'lucide-react';
import { BOARD_PALETTE } from '../boardPalette';
import { Masked } from './Masked';
import { registerZone, clearZone, hit, hitQBar, hitQBarRect, qProximity, qProximityRect, qBarCenter } from '../dropzone';
import { useWorkspace } from '../store';
import { ConceptIcon, iconFor } from '../icons';
import { computeLayout, computeOrgTree, Area } from '../layout';
import { ME_ID, HR_METRICS, ONBOARDING, MONTHS, NOW, DIRECTORY } from '../data';
import { PersonTokenView, LeaveTokenView, PayslipTokenView, TokenCard } from './Tokens';
import { SynthTokenView, PulseLayer } from './Synthesized';
import FluidField from './FluidField';
import EmployeeToday from './EmployeeToday';
import ManagerToday from './ManagerToday';
import HrToday from './HrToday';
import VibeStudio from './VibeStudio';
import { AttendanceViz, CompViz, WorkloadViz, TalentMap, TimeOffHeatmap, Viz } from './Viz';
import TopChrome from './TopChrome';
import TheNow from './TheNow';
import TheCue from './TheCue';
import QPanel from './QPanel';
import RiverOfCash from './RiverOfCash';
import Calendar from './Calendar';
import { JourneyMini } from './Journey';
import Growth from './Growth';
import { Avatar } from './Avatar';
import Documents from './Documents';
import TeamDocs from './TeamDocs';
import TeamGrowth from './TeamGrowth';
import Planning from './Planning';
import Focus from './Focus';
import TimeOffAdmin from './TimeOffAdmin';
import Offboarding from './Offboarding';
import Tour from './Tour';
import GestureLegend from './GestureLegend';
import GroupPanel from './GroupPanel';
import SimulateOverlay from './SimulateOverlay';
import Overlays from './Overlays';
import DocumentViewer from './DocumentViewer';
import Workspace from './Workspace';
import ContextualAdd from './ContextualAdd';
import BudgetLever from './BudgetLever';
import Roster from './Roster';
import Wallpaper from './Wallpaper';
import { VibeApp, VIBE_ICON, vibeTitle } from './VibeApps';
import Toasts from './Toasts';
import PlainMode from './PlainMode';
import { PayslipLibrary, Reimbursements } from './PayrollExtras';

export default function Continuum() {
  const w = useWorkspace();
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 900);
  const [rosterView, setRosterView] = useState<boolean | null>(null);
  const [orgHover, setOrgHover] = useState<string | null>(null);
  useEffect(() => { const r = () => { setVw(window.innerWidth); setVh(window.innerHeight); }; window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  // Global keyboard shortcuts — frictionless navigation without leaving the keyboard.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (!typing && e.key === '/')) {
        e.preventDefault(); (document.getElementById('cue-input') as HTMLInputElement | null)?.focus(); return;
      }
      if (typing) return;
      if (e.key === 'Escape') {
        if (w.overlay) w.setOverlay(null);
        else if (w.qOpen) w.setQ(false);
        else if (w.vibeOpen) w.setVibe(false);
        else if (w.region !== 'home') w.setRegion('home');
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '1') w.setLens('employee');
      else if (e.key === '2') w.setLens('manager');
      else if (e.key === '3') w.setLens('hr');
      else if (e.key === 'b' && w.region === 'home') w.setHomeView(w.homeView === 'signal' ? 'board' : w.homeView === 'board' ? 'workspace' : 'signal');
      else if (e.key === 'f' && w.lens !== 'employee') w.setRegion('focus');
      else if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); w.setLegend(!w.showLegend); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [w]);
  useEffect(() => {
    try {
      if (!localStorage.getItem('q_kbhint')) {
        localStorage.setItem('q_kbhint', '1');
        const t = setTimeout(() => w.toast('Tip: press / to talk to Q · ? for all gestures · Esc goes home', 'info'), 1600);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Contextual, one-time affordance hints per surface — progressive disclosure so
  // the grammar is discovered in context, not memorised up front. Each fires once.
  useEffect(() => {
    const hintFor: Record<string, { key: string; msg: string } | undefined> = {
      board: { key: 'q_hint_board', msg: w.lens === 'employee' ? 'This is your Board — drag cards to arrange, or use ⋯ to Send elsewhere. Add more from the + button.' : 'This is your Board — drag cards to reorder, or use ⋯ to Send elsewhere. Build new ones in Canvas.' },
      focus: { key: 'q_hint_focus', msg: 'Focus: work top-down by priority. Tap “Why this?” on a card to see Q’s reasoning, or swipe right to clear.' },
    };
    const surface = w.region === 'home' ? (w.homeView === 'board' ? 'board' : '') : w.region;
    const h = hintFor[surface];
    if (!h) return;
    try {
      if (!localStorage.getItem(h.key)) {
        localStorage.setItem(h.key, '1');
        const t = setTimeout(() => w.toast(h.msg, 'info'), 900);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.region, w.homeView]);

  const PAGES: Record<string, string[]> = {
    employee: ['home', 'calendar', 'documents', 'growth', 'payroll'],
    manager: ['home', 'team', 'approvals', 'analytics'],
    hr: ['home', 'people', 'payroll', 'onboarding', 'documents', 'analytics'],
  };
  const personaPage = PAGES[w.lens].includes(w.region);
  const isConstellation = (w.lens === 'manager' && w.region === 'team') || (w.lens === 'hr' && w.region === 'people');
  const leftInset = personaPage ? (w.panelLeft ? 332 : 72) : 24;
  const rightInset = w.qOpen ? 384 : personaPage ? (w.panelRight ? 340 : 72) : 24;
  const area: Area = { x: leftInset, y: 84, w: vw - leftInset - rightInset - 24, h: vh - 84 - 132 };
  // Stable area: uses the panels' OPEN widths regardless of collapse, so the orbit stays centred in place when a panel toggles.
  const sLeft = personaPage ? 332 : 24;
  const sRight = w.qOpen ? 384 : personaPage ? 340 : 24;
  const stableArea: Area = { x: sLeft, y: 84, w: vw - sLeft - sRight - 24, h: vh - 84 - 132 };
  const boardMode = w.region === 'home' && w.homeView === 'board';
  const workspaceMode = w.region === 'home' && w.homeView === 'workspace';
  const boardArea: Area = { x: 24, y: 96, w: vw - 48, h: vh - 96 - 132 };

  const lineage = useMemo(() => {
    if (!orgHover) return null;
    const set = new Set<string>();
    let cur: string | undefined = orgHover;
    let guard = 0;
    while (cur && guard++ < 12) { set.add(cur); cur = w.people.find(p => p.id === cur)?.managerId; }
    return set;
  }, [orgHover, w.people]);

  // Plain mode renders after ALL hooks so hook order stays stable.
  if (w.plain) return <PlainMode onExit={() => w.setPlain(false)} />;

  const layout = w.lens === 'hr'
    ? computeOrgTree(w.people.filter(p => !w.hidden.includes(p.id)), area)
    : computeLayout(w.lens, w.people, area);
  const anomalies = w.payslips.some(p => p.status === 'pooled') || w.people.some(p => p.status === 'flight_risk');
  const dimPerson = (status?: string) => w.highlight === 'risk' ? status !== 'flight_risk' : (w.highlight === 'leave' || w.highlight === 'payroll');

  return (
    <div className="fixed inset-0 overflow-hidden grain isolate" style={{ ['--aurora-ember' as any]: anomalies ? 0.16 : 0.05 }}>
      <Wallpaper id={w.wallpaper} />
      <FluidField />
      {w.dragging && !w.reduced && (
        <div className="fixed inset-0 pointer-events-none z-[4]" aria-hidden>
          <svg className="w-full h-full">
            <defs><pattern id="dotgrid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.1" fill="var(--color-glass-edge)" opacity="0.6" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dotgrid)" />
          </svg>
        </div>
      )}

      <motion.div key={`${w.nonce}-${w.lens}-${w.region}`} initial={w.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={w.reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 160, damping: 24 }} className={`absolute inset-0 ${w.dragging ? 'z-[60]' : ''}`}>

        {isConstellation && (() => {
          const cPeople = w.lens === 'manager' ? w.people.filter(p => p.managerId === 'm1') : w.people.filter(p => !w.hidden.includes(p.id));
          const big = cPeople.length > 8;
          const roster = rosterView ?? big;   // auto-roster past 8, user can override
          return (
            <>
              <div className="absolute z-[12] flex items-center gap-1 glass-soft p-0.5" style={{ right: area.x + 4 > 0 ? undefined : 0, left: area.x + area.w - 150, top: area.y - 4, borderRadius: 999 }}>
                <button onClick={() => setRosterView(false)} className={`text-[13px] px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${!roster ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Share2 className="w-3 h-3" /> Graph</button>
                <button onClick={() => setRosterView(true)} className={`text-[13px] px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${roster ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><LayoutGrid className="w-3 h-3" /> Roster</button>
              </div>
              {roster ? (
                <Roster people={cPeople} title={w.lens === 'manager' ? 'My team' : 'People'} area={area} />
              ) : (
                <>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                    {layout.links.map((l, i) => { const lit = !!(lineage && l.fromId && l.toId && lineage.has(l.fromId) && lineage.has(l.toId)); const stroke = lit ? 'var(--color-lumen)' : l.risk ? 'var(--color-coral)' : 'var(--color-halo)'; return l.d
                      ? <path key={i} d={l.d} fill="none" stroke={stroke} strokeOpacity={lit ? 0.95 : lineage ? (l.risk ? 0.25 : 0.12) : (l.risk ? 0.55 : 0.3)} strokeWidth={lit ? 2.2 : l.risk ? 1.6 : 1.2} strokeDasharray={l.risk && !lit ? '4 4' : undefined} style={lit ? { filter: 'drop-shadow(0 0 6px var(--color-lumen))' } : undefined} />
                      : <line key={i} x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y} stroke={stroke} strokeOpacity={lit ? 0.95 : (l.risk ? 0.5 : 0.22)} strokeWidth={lit ? 2.2 : l.risk ? 1.6 : 1} strokeDasharray={l.risk && !lit ? '4 4' : undefined} />; })}
                  </svg>
                  {w.people.filter(p => !w.hidden.includes(p.id)).map(p => layout.people[p.id] && (
                    <div key={p.id} onPointerOver={() => w.lens === 'hr' && setOrgHover(p.id)} onPointerOut={() => w.lens === 'hr' && setOrgHover(h => h === p.id ? null : h)}>
                      <PersonTokenView data={p} pos={layout.people[p.id]} dimmed={lineage ? !lineage.has(p.id) : dimPerson(p.status)} />
                    </div>
                  ))}
                  <BudgetLever x={area.x + 8} y={area.y + area.h - 64} />
                </>
              )}
            </>
          );
        })()}

        {boardMode && (
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <svg className="w-full h-full"><defs><pattern id="boardgrid" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="1.2" fill="var(--color-glass-edge)" opacity="0.55" /></pattern></defs><rect width="100%" height="100%" fill="url(#boardgrid)" /></svg>
          </div>
        )}
        {w.region === 'home' && !boardMode && !workspaceMode && (w.lens === 'employee' ? <EmployeeHome area={stableArea} /> : w.lens === 'manager' ? <ManagerHome area={stableArea} /> : <HrHome area={stableArea} />)}
        {w.region === 'home' && !boardMode && !workspaceMode && <WsSignalPins area={boardArea} />}
        {boardMode && <BoardChrome area={boardArea} />}
        {boardMode && <BoardGrid area={boardArea} />}
        {workspaceMode && <Workspace area={boardArea} />}
        {w.region === 'home' && <ModeSwitch />}
        {w.region === 'calendar' && <Calendar />}
        {w.region === 'documents' && (w.lens === 'employee' ? <Documents /> : <TeamDocs />)}
        {w.lens === 'employee' && w.region === 'growth' && <Growth />}
        {w.lens !== 'employee' && w.region === 'growth' && <TeamGrowth />}
        {w.lens !== 'employee' && w.region === 'planning' && <Planning />}
        {w.lens !== 'employee' && w.region === 'focus' && <Focus />}
        {w.lens === 'hr' && w.region === 'timeadmin' && <TimeOffAdmin />}
        {w.lens === 'hr' && w.region === 'exit' && <Offboarding />}
        {w.lens === 'employee' && w.region === 'payroll' && (
          <RegionWrap label="Your payroll tributary" icon={<IndianRupee className="w-3.5 h-3.5" />}>
            <div className="flex flex-wrap gap-4 justify-center">{w.payslips.filter(p => !w.hidden.includes(p.id)).map(p => <div key={p.id} className="relative" style={{ width: 260, height: 130 }}><PayslipTokenView data={p} pos={{ x: 0, y: 0 }} /></div>)}</div>
            <div className="grid lg:grid-cols-2 gap-4 mt-6 max-w-5xl mx-auto w-full">
              <PayslipLibrary />
              <Reimbursements />
            </div>
          </RegionWrap>
        )}
        {w.lens === 'manager' && w.region === 'approvals' && <ManagerApprovals />}
        {w.region === 'analytics' && <Analytics />}
        {w.lens === 'hr' && w.region === 'payroll' && <RiverOfCash />}
        {w.lens === 'hr' && w.region === 'onboarding' && <Onboarding />}
      </motion.div>


      <TopChrome />
      {personaPage && !boardMode && <TheNow />}
      {personaPage && !w.qOpen && !boardMode && (w.lens === 'employee' ? <EmployeeToday /> : w.lens === 'manager' ? <ManagerToday /> : <HrToday />)}
      <TheCue />
      <QPanel />
      <GroupPanel />
      <SimulateOverlay />
      <Overlays />
      <DocumentViewer />
      {(w.lens === 'manager' || w.lens === 'hr') && <VibeStudio />}
      <ContextualAdd />
      {w.synth.map(t => <SynthTokenView key={t.id} data={t} />)}
      <PulseLayer />
      <Toasts />
      <Tour />
      <GestureLegend />
    </div>
  );
}

function RegionWrap({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 panel-scroll overflow-y-auto overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-4">{icon} {label}</div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- EMPLOYEE · My World (Life Sphere) ---------------- */
const HINT: Record<string, string> = {
  calendar: 'Your month at a glance — holidays, events and leave.',
  leave: 'Earned, sick, casual and RH balances. Apply in a tap.',
  pay: 'Latest net pay, breakdown and any anomalies.',
  documents: 'Policies awaiting your acknowledgment.',
  growth: 'Velocity, goals and growth conversations.',
  requests: 'Raise an IT, facilities or HR request.',
  journey: 'Your milestones — joins, moves, promotions and pay.',
};

function PayDeep() {
  const w = useWorkspace();
  const rows: [string, string][] = [['Monthly net', '\u20b91.45L'], ['Effective tax', '18%'], ['Comp percentile', '62nd'], ['Next appraisal', 'Oct']];
  const mask = (v: string) => /\d/.test(v) ? '\u2022\u2022\u2022\u2022' : v;
  return (
    <div className="flex flex-col gap-2">
      <Stat items={rows.map(([k, v]) => [k, w.showPay ? v : mask(v)] as [string, string])} />
      <button onClick={(e) => { e.stopPropagation(); w.togglePay(); }} aria-label={w.showPay ? 'Hide pay amounts' : 'Reveal pay amounts'}
        className="self-start text-[13px] px-3 py-1 rounded-full glass-soft text-[var(--color-lumen)] hover:bg-white/10 transition-colors flex items-center gap-2">
        {w.showPay ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {w.showPay ? 'Hide amounts' : 'Reveal amounts'}
      </button>
    </div>
  );
}

const NODE_DEEP: Record<string, [string, string][]> = {
  calendar: [['Working days left', '12'], ['Holidays this month', '2'], ['Busiest week', 'Jul 21–25']],
  leave: [['Accrual', '+1.5 d/mo'], ['Expiring Dec 31', '4 d'], ['Sep coverage', 'low density']],
  pay: [['Effective tax', '18%'], ['Comp percentile', '62nd'], ['Next appraisal', 'Oct']],
  documents: [['Org acknowledged', '72%'], ['Pending for you', '2'], ['Retention', '7 yrs']],
  growth: [['Velocity', '85 (↑6 QoQ)'], ['Growth talk', '1 due'], ['Trending skills', '2 in role']],
  requests: [['Open tickets', '2'], ['Avg resolution', '1.4 days'], ['IT SLA', '92%']],
  journey: [['Tenure', '4 yrs 5 mo'], ['Promotions', '1'], ['Last comp change', 'Apr 2025']],
};
const Stat = ({ items }: { items: [string, string][] }) => (
  <div className="space-y-2 text-[13px]">{items.map(([k, v]) => <div key={k} className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">{k}</span><span className="text-[var(--color-vapor)] font-mono text-right whitespace-nowrap shrink-0">{v}</span></div>)}</div>
);

type OrbitNode = { key: string; label: string; value: React.ReactNode; icon: ReactNode; concept?: string; accent: string; tint: 'lumen' | 'halo' | 'ember' | 'mist' | 'coral'; run: () => void; pulse?: boolean; deep: ReactNode; hint: string };

function HomeOrbit({ area, nodes: allNodes, hub, caption }: { area: Area; nodes: OrbitNode[]; hub: ReactNode; caption: string }) {
  const w = useWorkspace();
  const nodes = allNodes.filter(n => !w.hidden.includes(n.key));
  const cx = area.x + area.w / 2, cy = area.y + area.h / 2 - 6;
  const R = Math.min(236, Math.max(168, Math.min(area.w, area.h) * 0.42)), RY = R * 0.82;
  const N = nodes.length;
  const at = (i: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / N; return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * RY }; };
  const HUB = 170, NW = 168;
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        <ellipse cx={cx} cy={cy} rx={R} ry={RY} fill="none" stroke="var(--color-glass-edge)" strokeDasharray="2 7" opacity="0.5" />
        {nodes.map((n, i) => { const p = at(i); return <line key={n.key} x1={cx} y1={cy} x2={p.x} y2={p.y} className={w.reduced ? '' : 'spoke'} stroke={n.accent} strokeOpacity={n.pulse ? 0.6 : 0.32} strokeWidth={n.pulse ? 1.7 : 1.2} />; })}
      </svg>
      <div className="absolute" style={{ left: cx - HUB / 2, top: cy - HUB / 2, width: HUB, height: HUB }}>{hub}</div>
      {nodes.map((n, i) => { const p = at(i); const spec = n.concept ? iconFor(n.concept) : null; return (
        <TokenCard key={n.key} id={n.key} kind="nav" placement="free" reposition={false} pos={{ x: p.x - NW / 2, y: p.y - 30 }} width={NW} shape="soft" tint={n.tint} className="z-20 node-lift" label={`${n.label} sphere`} deep={n.deep}
          onClose={() => w.hide(n.key)}
          expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>{n.hint}</p><button onClick={(e) => { e.stopPropagation(); n.run(); }} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Open {n.label}</button></div>}>
          {/* horizontal: larger icon chip leads, label + value beside it */}
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0 relative" style={{ background: `color-mix(in srgb, ${n.accent} 15%, transparent)` }}>
              {spec ? <ConceptIcon concept={n.concept!} size="card" tintOverride={n.tint} strokeWidth={2} /> : <span style={{ color: n.accent }}>{n.icon}</span>}
              {n.pulse && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: n.accent, boxShadow: `0 0 8px ${n.accent}` }} />}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--color-vapor)] leading-tight">{n.label}</div>
              <div className="text-[13px] font-mono leading-tight mt-0.5" style={{ color: n.accent === 'var(--color-halo)' ? 'var(--color-halo-text)' : n.accent }}>{n.value}</div>
            </div>
          </div>
        </TokenCard>
      ); })}
      <div className="absolute left-1/2 -translate-x-1/2 text-[13px] field-sub" style={{ top: cy + RY + 70 }}>{caption}</div>
    </>
  );
}

// central sphere used by every persona home
function Hub({ seed, name, sub, frac, onAsk, icon, group }: { seed?: string; name: string; sub: string; frac: number; onAsk: () => void; icon?: ReactNode; group?: string[] }) {
  const w = useWorkspace();
  const HUB = 170, ar = 73, circ = 2 * Math.PI * ar;
  return (
    <>
      {!w.reduced && <div className="brand-ring hub-halo absolute rounded-full" style={{ inset: -4, animation: 'hubSpin 18s linear infinite' }} />}
      <button onClick={onAsk} aria-label="Ask Q" className="hub-disc absolute inset-0 grid place-items-center overflow-hidden group border border-[var(--color-glass-edge)]" style={{ borderRadius: '50%' }}>
        <span aria-hidden className="absolute inset-0 hub-fill" />
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${HUB} ${HUB}`}>
          <circle cx={HUB / 2} cy={HUB / 2} r={ar} fill="none" stroke="var(--color-glass-edge)" strokeWidth="3.5" />
          <motion.circle cx={HUB / 2} cy={HUB / 2} r={ar} fill="none" stroke="url(#hubGrad)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={circ} className="clock-arc" initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - frac) }} transition={{ duration: 1.1, ease: 'easeOut' }} />
          <defs><linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-blue)" /><stop offset="100%" stopColor="var(--color-lumen)" /></linearGradient></defs>
        </svg>
        <div className="relative flex flex-col items-center leading-none">
          {group ? (
            <span className="flex -space-x-2">{group.slice(0, 3).map(g => <Avatar key={g} seed={g} name={g} size={36} className="border-2 border-[var(--color-abyss)]" />)}</span>
          ) : seed ? <Avatar seed={seed} name={name} size={54} className="border border-[var(--color-glass-edge)]" /> : <span className="w-[54px] h-[54px] rounded-full grid place-items-center bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">{icon}</span>}
          <span className="text-sm font-semibold text-[var(--color-vapor)] mt-2">{name}</span>
          <span className="text-[13px] font-mono text-[var(--color-trace)] mt-1">{sub}</span>
          <span className="text-[13px] text-[var(--color-lumen)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ask Q →</span>
        </div>
      </button>
    </>
  );
}

function WsSignalPins({ area }: { area: Area }) {
  const w = useWorkspace();
  const pins = w.nowBoard.filter(b => b.lens === w.lens && b.type === 'ws');
  const items = pins.map(p => w.wsItems.find(i => i.id === p.ref)).filter(Boolean) as typeof w.wsItems;
  const CW = 236, CH = 118, GRID = 24;
  const snap = (v: number) => Math.round(v / GRID) * GRID;
  // default clockwise slots (used until a pin is first dragged)
  const LEFT_BUF = 72, RIGHT_BUF = 72, TOPPAD = 8, BOT_RESERVED = 96;
  const leftX = area.x + LEFT_BUF, rightX = area.x + area.w - RIGHT_BUF - CW;
  const topY = area.y + TOPPAD + 40, midY = area.y + area.h / 2 - CH / 2, botY = area.y + area.h - CH - BOT_RESERVED;
  const slots = [{ x: leftX, y: topY }, { x: rightX, y: topY }, { x: rightX, y: midY }, { x: rightX, y: botY }, { x: leftX, y: botY }, { x: leftX, y: midY }];

  const [drag, setDrag] = useState<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [snapPos, setSnapPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const posOf = (pinId: string, idx: number) => { const pin = pins.find(p => p.id === pinId); return pin?.pos ?? slots[idx % slots.length]; };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      drag.moved = true;
      const nx = snap(drag.ox + dx), ny = snap(drag.oy + dy);
      w.setQHover(qProximityRect({ left: nx, top: ny, right: nx + CW, bottom: ny + CH }));
      setSnapPos({ id: drag.id, x: nx, y: ny });
    };
    const up = (e: PointerEvent) => {
      if (drag.moved) {
        const sp = { x: snap(drag.ox + (e.clientX - drag.sx)), y: snap(drag.oy + (e.clientY - drag.sy)) };
        if (hitQBarRect({ left: sp.x, top: sp.y, right: sp.x + CW, bottom: sp.y + CH })) { const it = items.find(i => i.id === (pins.find(p => p.id === drag.id)?.ref)); if (it) w.wsToQ(it.id); }
        else w.boardMove(drag.id, sp.x, sp.y);
      }
      w.setDragging(false); setDrag(null); setSnapPos(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag]); // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}>
      {/* subtle snap-grid, only while dragging a pin */}
      {drag?.moved && <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, var(--color-glass-edge) 1px, transparent 1px)', backgroundSize: `${GRID}px ${GRID}px`, opacity: 0.35 }} />}
      {items.map((it, idx) => { const pin = pins.find(p => p.ref === it.id)!; const base = (snapPos && snapPos.id === pin.id) ? snapPos : posOf(pin.id, idx);
        return <SignalPinCard key={it.id} item={it} x={base.x} y={base.y} w={CW} dragging={drag?.id === pin.id}
          onGrab={(e) => { e.preventDefault(); w.setDragging(true); const p = posOf(pin.id, idx); setDrag({ id: pin.id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false }); }}
          onOpen={() => { w.setHomeView('workspace'); w.wsFront(it.id); }} onClose={() => w.boardRemove(pin.id)} onAskQ={() => w.wsToQ(it.id)} />;
      })}
    </div>
  );
}

function SignalPinCard({ item, x, y, w: cw, dragging, onGrab, onOpen, onClose, onAskQ }: { item: any; x: number; y: number; w: number; dragging?: boolean; onGrab: (e: React.PointerEvent) => void; onOpen: () => void; onClose: () => void; onAskQ: () => void }) {
  return (
    <div className={`absolute group ${dragging ? 'z-[70]' : 'z-20'}`} style={{ left: x, top: y, width: cw, pointerEvents: 'auto' }}>
      {/* four-corner grammar: TL drag · TR open-in-workspace · BR close */}
      <button onPointerDown={onGrab} title="Drag" className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-2.5 -top-2.5 z-10 w-6 h-6 grid place-items-center rounded-xl glass-elevated cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-vapor)]"><GripVertical className="w-3.5 h-3.5" /></button>
      <button onClick={onOpen} title="Open in workspace" className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-2.5 -top-2.5 z-10 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-lumen)]"><PenSquare className="w-3.5 h-3.5" /></button>
      <button onClick={onAskQ} title="Ask Q about this" aria-label="Ask Q about this" className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-2.5 -bottom-2.5 z-10 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-lumen)]"><Sparkles className="w-3.5 h-3.5" /></button>
      <button onClick={onClose} title="Remove from Signal" aria-label="Remove from Signal" className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-2.5 -bottom-2.5 z-10 w-6 h-6 grid place-items-center rounded-xl glass-elevated text-[var(--color-mist)] hover:text-[var(--color-coral)]"><X className="w-3.5 h-3.5" /></button>
      <div className="glass-elevated p-3 shadow-lg" style={{ borderRadius: 14, borderTop: `3px solid ${item.color}` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${item.color} 18%, transparent)`, color: item.color }}>{item.kind}</span>
          <span className="text-[13px] font-semibold text-[var(--color-vapor)] truncate flex-1">{item.title}</span>
        </div>
        <SignalPinPreview item={item} />
        <button onClick={onAskQ} className="mt-2 text-[12px] px-2 py-1 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3" /> Ask Q for actions</button>
      </div>
    </div>
  );
}

function SignalPinPreview({ item }: { item: any }) {
  const [, tick] = useState(0);
  const firstTimer = item.kind === 'todo' ? (item.todos ?? []).find((t: any) => t.timerMs !== undefined && !t.done) : null;
  useEffect(() => { if (!firstTimer?.timerStartedAt) return; const iv = setInterval(() => tick((n: number) => n + 1), 500); return () => clearInterval(iv); }, [firstTimer?.timerStartedAt]);
  if (item.kind === 'note') { const t = (item.noteHtml ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); return <p className="text-[13px] text-[var(--color-mist)] leading-relaxed line-clamp-2">{t || 'Empty note'}</p>; }
  if (item.kind === 'list') { const items2 = (item.listItems ?? []).map((l: any) => l.text).filter(Boolean); return <p className="text-[13px] text-[var(--color-mist)] leading-relaxed line-clamp-2">{items2.slice(0, 3).join(' · ') || 'Empty list'}</p>; }
  // todo: show progress + a live mini timer if present
  const todos = item.todos ?? []; const done = todos.filter((t: any) => t.done).length;
  let timerStr = ''; let tone = 'lumen';
  if (firstTimer) { const total = firstTimer.timerMs ?? 0; const rem = firstTimer.timerStartedAt ? Math.max(0, total - (Date.now() - firstTimer.timerStartedAt)) : total; const frac = total ? rem / total : 1; tone = rem <= 0 ? 'coral' : frac > 0.5 ? 'lumen' : frac > 0.2 ? 'ember' : 'coral'; const mm = Math.floor(rem / 60000), ss = Math.floor((rem % 60000) / 1000); timerStr = rem <= 0 ? "0:00" : `${mm}:${String(ss).padStart(2, '0')}`; }
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-[var(--color-mist)]">{done}/{todos.length} done</span>
      {firstTimer && <span className="ml-auto flex items-center gap-1 font-mono text-[13px] font-bold px-2 py-0.5 rounded-full" style={{ color: `var(--color-${tone})`, background: `color-mix(in srgb, var(--color-${tone}) 14%, transparent)` }}><Timer className="w-3 h-3" />{timerStr}</span>}
    </div>
  );
}

function NowBoard({ area }: { area: Area }) {
  const w = useWorkspace();
  const items = w.nowBoard.filter(b => b.lens === w.lens && b.type !== "ws");
  if (items.length === 0) return null;
  let cx = area.x + 8, cy = area.y + 8;
  const label = (r: string) => r === 'attendance' ? 'Attendance' : r === 'comp' ? 'Compensation' : r === 'workload' ? 'Workload' : r === 'myHours' ? 'My hours' : r === 'myLeave' ? 'My leave' : r === 'myGoals' ? 'My goals' : r === 'myPay' ? 'My pay' : r;
  return (
    <>
      {items.map(it => {
        const pos = { x: cx, y: cy };
        const isChart = it.type === 'chart';
        cy += (it.type === 'person') ? 126 : 232; if (cy > area.y + area.h - 120) { cy = area.y + 8; cx += 250; }
        if (it.type === 'tool') {
          const app = w.vibeApps.find(v => v.id === it.ref); if (!app) return null;
          return (
            <TokenCard key={it.id} id={it.ref} kind="chart" placement="free" pos={pos} width={300} shape="rect" tint="halo" label={app.title || vibeTitle(app.template)} onClose={() => w.boardRemove(it.id)}
              expand={<div className="text-[13px] text-[var(--color-mist)]">Built in Canvas. Drag anywhere; close to remove from your board.</div>}>
              <div className="flex items-center gap-2 text-[13px] font-medium mb-2">{VIBE_ICON[app.template]} {app.title || vibeTitle(app.template)}<span className="ml-auto text-[11px] text-[var(--color-halo-text)] uppercase tracking-wider">Canvas</span></div>
              <VibeApp template={app.template} parts={app.parts} config={app.config} />
            </TokenCard>
          );
        }
        if (it.type === 'person') {
          const p = w.people.find(pp => pp.id === it.ref); if (!p) return null;
          return (
            <TokenCard key={it.id} id={it.ref} kind="person" placement="free" pos={pos} width={208} shape="soft" tint="mist" label={p.name} onClose={() => w.boardRemove(it.id)}
              expand={<div className="text-[13px] text-[var(--color-mist)]">Drag onto a chart to compare, or onto Q for a brief.</div>}>
              <div className="flex items-center gap-3"><span className="relative shrink-0"><Avatar seed={p.name} name={p.name} size={34} />{p.status === 'flight_risk' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-abyss)] bg-[var(--color-ember)]" />}</span><div className="min-w-0"><div className="text-[13px] text-[var(--color-vapor)] truncate">{p.name}</div><div className="text-[12px] text-[var(--color-trace)] truncate">{p.role}</div></div></div>
            </TokenCard>
          );
        }
        return (
          <TokenCard key={it.id} id={it.ref} kind="chart" placement="free" pos={pos} width={292} shape="rect" tint="halo" label={label(it.ref)} onClose={() => w.boardRemove(it.id)}
            expand={<div className="text-[13px] text-[var(--color-mist)]">Drop a person onto this to compare them against {label(it.ref).toLowerCase()}.</div>}>
            <div className="text-[13px] font-medium mb-2">{label(it.ref)}</div><Viz kind={it.ref} />
          </TokenCard>
        );
      })}
    </>
  );
}

function BoardGrid({ area }: { area: Area }) {
  const w = useWorkspace();
  const items = w.nowBoard.filter(b => b.lens === w.lens && b.type !== 'ws');
  const surfaceRef = useRef<HTMLDivElement>(null);
  const GRID = 24; const snap = (v: number) => Math.round(v / GRID) * GRID;
  const label = (r: string) => r === 'attendance' ? 'Attendance' : r === 'comp' ? 'Compensation' : r === 'workload' ? 'Workload' : r === 'myHours' ? 'My hours' : r === 'myLeave' ? 'My leave' : r === 'myGoals' ? 'My goals' : r === 'myPay' ? 'My pay' : r === 'retention' ? 'Retention' : r;

  const [pan, setPan] = useState({ x: 0, y: 0 });
  type Gesture = { kind: 'pan'; sx: number; sy: number; ox: number; oy: number } | { kind: 'drag'; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | { kind: 'resize'; id: string; sx: number; sy: number; ow: number; oh: number };
  const gesture = useRef<Gesture | null>(null);
  const [, setTick] = useState(0); const rerender = () => setTick(t => (t + 1) % 100000);
  const [dragSnap, setDragSnap] = useState<{ id: string; x: number; y: number } | null>(null);
  const [qPull, setQPull] = useState<{ title: string; x: number; y: number; tx: number; ty: number } | null>(null);

  // default position + size (world coords) for cards that predate free positioning
  const defaultSize = (it: typeof items[number]) => { const app = it.type === 'tool' ? w.vibeApps.find(v => v.id === it.ref) : undefined; const isDash = app?.template === 'dashboard'; return it.size ?? { w: isDash ? 480 : 300, h: 260 }; };
  const posOf = (it: typeof items[number], idx: number) => it.pos ?? { x: 40 + (idx % 4) * 300, y: 40 + Math.floor(idx / 4) * 240 };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current; if (!g) return;
    if (g.kind === 'pan') { setPan({ x: g.ox + (e.clientX - g.sx), y: g.oy + (e.clientY - g.sy) }); return; }
    if (g.kind === 'drag') { const dx = e.clientX - g.sx, dy = e.clientY - g.sy; if (!g.moved && Math.abs(dx) + Math.abs(dy) < 3) return; g.moved = true; const nx = snap(g.ox + dx), ny = snap(g.oy + dy); const it = items.find(i => i.id === g.id); const sb = surfaceRef.current?.getBoundingClientRect(); if (it && sb) { const sz = defaultSize(it); const left = sb.left + nx + pan.x, top = sb.top + ny + pan.y; w.setQHover(qProximityRect({ left, top, right: left + sz.w, bottom: top + sz.h })); } setDragSnap({ id: g.id, x: nx, y: ny }); return; }
    if (g.kind === 'resize') { w.boardResize(g.id, Math.max(220, snap(g.ow + (e.clientX - g.sx))), Math.max(160, snap(g.oh + (e.clientY - g.sy)))); return; }
  };
  const endGesture = (e: React.PointerEvent) => {
    const g = gesture.current; gesture.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
    if (g?.kind === 'drag' && g.moved) {
      const it0 = items.find(i => i.id === g.id);
      const sb = surfaceRef.current?.getBoundingClientRect();
      let overQ = false;
      if (it0 && sb && dragSnap) { const sz = defaultSize(it0); const left = sb.left + dragSnap.x + pan.x, top = sb.top + dragSnap.y + pan.y; overQ = hitQBarRect({ left, top, right: left + sz.w, bottom: top + sz.h }); }
      const tz = hit(e.clientX, e.clientY, 'token', `bc-${g.id}`);
      if (overQ) {
        const it = items.find(i => i.id === g.id); const qc = qBarCenter();
        const label = it ? (it.type === 'person' ? (w.people.find((p: any) => p.id === it.ref)?.name ?? 'Card') : it.type === 'tool' ? (w.vibeApps.find((v: any) => v.id === it.ref)?.title || 'Tool') : it.ref) : 'Card';
        if (qc) setQPull({ title: label, x: e.clientX, y: e.clientY, tx: qc.cx, ty: qc.cy });
        setTimeout(() => { w.boardToQ(g.id); setQPull(null); }, 380);
      }
      else if (tz && tz.data?.boardId && tz.data.boardId !== g.id) { w.boardCombine(g.id, tz.data.boardId); }
      else if (dragSnap) w.boardMove(g.id, dragSnap.x, dragSnap.y);
    }
    w.setDragging(false); setDragSnap(null); rerender();
  };
  const beginDrag = (id: string, idx: number, e: React.PointerEvent) => { const it = items.find(i => i.id === id)!; const p = posOf(it, idx); w.setDragging(true); gesture.current = { kind: 'drag', id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false }; surfaceRef.current?.setPointerCapture?.(e.pointerId); rerender(); };
  const beginResize = (id: string, idx: number, e: React.PointerEvent) => { const it = items.find(i => i.id === id)!; const s = defaultSize(it); gesture.current = { kind: 'resize', id, sx: e.clientX, sy: e.clientY, ow: s.w, oh: s.h }; surfaceRef.current?.setPointerCapture?.(e.pointerId); rerender(); };

  if (items.length === 0) return null;
  return (
    <div ref={surfaceRef} className="absolute overflow-visible touch-none" style={{ left: area.x, top: area.y + 44, width: area.w, height: area.h - 44 }}
      onPointerDown={(e) => { if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas) { gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); rerender(); } }}
      onPointerMove={onPointerMove} onPointerUp={endGesture} onPointerCancel={endGesture}>
      <div data-canvas className="absolute inset-0" aria-hidden style={{ backgroundImage: 'radial-gradient(circle, var(--color-glass-edge) 1px, transparent 1px)', backgroundSize: `${GRID}px ${GRID}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.4 }} />
      {/* snap guides */}
      {dragSnap && <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}><g transform={`translate(${pan.x},${pan.y})`}><line x1={dragSnap.x} y1={-4000} x2={dragSnap.x} y2={4000} stroke="var(--color-lumen)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} /><line x1={-4000} y1={dragSnap.y} x2={4000} y2={dragSnap.y} stroke="var(--color-lumen)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} /></g></svg>}
      {items.map((it, idx) => { const base = dragSnap && dragSnap.id === it.id ? dragSnap : posOf(it, idx); const size = defaultSize(it); const active = (gesture.current?.kind === 'drag' || gesture.current?.kind === 'resize') && gesture.current.id === it.id;
        return <BoardCard key={it.id} it={it} idx={idx} screenX={base.x + pan.x} screenY={base.y + pan.y} size={size} label={label} active={active}
          onBeginDrag={beginDrag} onBeginResize={beginResize} />; })}
      {(pan.x !== 0 || pan.y !== 0) && <button onClick={() => setPan({ x: 0, y: 0 })} className="absolute z-30 left-1/2 -translate-x-1/2 bottom-3 glass-elevated px-3 py-2 rounded-full flex items-center gap-2 text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)] shadow-lg"><RotateCcw className="w-3.5 h-3.5" /> Recenter</button>}
      {qPull && createPortal(
        <motion.div initial={{ left: qPull.x - 90, top: qPull.y - 26, opacity: 0.95, scale: 1 }} animate={{ left: qPull.tx - 30, top: qPull.ty - 14, opacity: 0, scale: 0.35 }} transition={{ duration: 0.36, ease: [0.4, 0, 0.2, 1] }}
          className="fixed z-[9998] pointer-events-none glass-elevated rounded-xl px-3 py-2 shadow-2xl" style={{ borderTop: '3px solid var(--color-halo)', width: 180 }}>
          <span className="text-[13px] font-semibold text-[var(--color-vapor)] truncate block">{qPull.title}</span>
          <span className="text-[11px] text-[var(--color-lumen)]">→ asking Q…</span>
        </motion.div>, document.body)}
    </div>
  );
}

function BoardCard({ it, idx, screenX, screenY, size, label, active, onBeginDrag, onBeginResize }: any) {
  const w = useWorkspace();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const reg = () => registerZone(`bc-${it.id}`, ref.current, 'token', { boardId: it.id }); reg(); const t = setInterval(reg, 400); return () => { clearInterval(t); clearZone(`bc-${it.id}`); }; }, [it.id, screenX, screenY, size.w, size.h]);
  const app = it.type === 'tool' ? w.vibeApps.find((v: any) => v.id === it.ref) : undefined;
  const person = it.type === 'person' ? w.people.find((p: any) => p.id === it.ref) : undefined;
  const canShare = it.type === 'tool' && (w.lens === 'manager' || w.lens === 'hr');
  const HANDLE = 'opacity-0 group-hover/bc:opacity-100 transition-opacity absolute z-20 w-6 h-6 grid place-items-center rounded-xl glass-elevated';
  return (
    <div ref={ref} className="group/bc absolute" style={{ left: screenX, top: screenY, width: size.w, zIndex: active ? 60 : 5 }}>
      {/* four-corner grammar: TL drag · TR scale · BL share · BR close */}
      <button data-handle onPointerDown={e => { e.stopPropagation(); onBeginDrag(it.id, idx, e); }} aria-label="Move" title="Drag" className={`${HANDLE} -left-2.5 -top-2.5 cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-vapor)]`}><GripVertical className="w-3.5 h-3.5" /></button>
      <button data-handle onPointerDown={e => { e.stopPropagation(); onBeginResize(it.id, idx, e); }} aria-label="Resize" title="Resize" className={`${HANDLE} -right-2.5 -top-2.5 cursor-nesw-resize text-[var(--color-mist)] hover:text-[var(--color-lumen)]`}><Maximize2 className="w-3 h-3" /></button>
      {/* BL always present so the four-corner grammar is never broken:
          share for shareable tools, otherwise send-to-Q. */}
      {canShare
        ? <button data-handle onPointerDown={e => e.stopPropagation()} onClick={() => w.publishTool(it.ref)} aria-label="Share with team" title="Share with team" className={`${HANDLE} -left-2.5 -bottom-2.5 text-[var(--color-mist)] hover:text-[var(--color-halo-text)]`}><Share2 className="w-3.5 h-3.5" /></button>
        : <button data-handle onPointerDown={e => e.stopPropagation()} onClick={() => w.boardToQ(it.id)} aria-label="Ask Q about this card" title="Ask Q about this" className={`${HANDLE} -left-2.5 -bottom-2.5 text-[var(--color-mist)] hover:text-[var(--color-lumen)]`}><Sparkles className="w-3.5 h-3.5" /></button>}
      <button data-handle onPointerDown={e => e.stopPropagation()} onClick={() => w.boardRemove(it.id)} aria-label="Close — remove card" title="Remove" className={`${HANDLE} -right-2.5 -bottom-2.5 text-[var(--color-mist)] hover:text-[var(--color-coral)]`}><X className="w-3.5 h-3.5" /></button>

      <div className="glass-panel tint-halo p-3 overflow-auto panel-scroll" style={{ height: size.h, borderRadius: 'var(--r-soft)' }}>
        {it.type === 'tool' && app ? (<>
          <div className="flex items-center gap-2 text-[13px] font-medium mb-2 pr-6">{VIBE_ICON[app.template]}<span className="truncate">{app.title || vibeTitle(app.template)}</span></div>
          <VibeApp template={app.template} parts={app.parts} config={app.config} />
        </>) : it.type === 'person' && person ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4"><Avatar seed={person.name} name={person.name} size={44} /><div className="text-center"><div className="text-[13px] text-[var(--color-vapor)]">{person.name}</div><div className="text-[12px] text-[var(--color-trace)]">{person.role}</div></div></div>
        ) : (<>
          <div className="text-[13px] font-medium mb-2 pr-6">{['kpi', 'attrition', 'headcount', 'bandladder', 'heatmap', 'leaderboard', 'funnel'].includes(it.ref) ? vibeTitle(it.ref) : label(it.ref)}</div>
          {['kpi', 'attrition', 'headcount', 'bandladder', 'heatmap', 'leaderboard', 'funnel'].includes(it.ref) ? <VibeApp template={it.ref} /> : <Viz kind={it.ref} />}
        </>)}
      </div>
    </div>
  );
}
function ModeSwitch() {
  const w = useWorkspace();
  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-0.5 glass-elevated p-1" style={{ borderRadius: 9999 }}>
      {([['signal', 'Signal', Radio], ['board', 'Board', LayoutGrid], ['workspace', 'Workspace', PenSquare]] as const).map(([v, label, Icon]) => (
        <button key={v} onClick={() => w.setHomeView(v)} title={`${label} view`} className={`px-3 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors ${w.homeView === v ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Icon className="w-3.5 h-3.5" /> {label}</button>
      ))}
    </div>
  );
}

const BOARD_COPY: Record<string, { title: string; body: string }> = {
  employee: { title: 'Your board', body: 'A calm space of your own. Add cards from the + button to place your hours and leave — or ask Q to drop an info card here — then drag to arrange.' },
  manager: { title: "Your team board", body: 'Assemble the views you watch — attendance, workload, compensation — from the + button, from Canvas, or by asking Q. Drag to arrange; it stays put.' },
  hr: { title: 'The org board', body: 'Pin the org-wide views you track from the + button, Canvas or Q. Everything here is scoped to The Org and saved for next time.' },
};

function BoardChrome({ area }: { area: Area }) {
  const w = useWorkspace();
  const copy = BOARD_COPY[w.lens] ?? BOARD_COPY.employee;
  const mine = w.nowBoard.filter(b => b.lens === w.lens);
  return (
    <>
      {/* empty state */}
      {mine.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <span className="inline-grid place-items-center w-16 h-16 rounded-2xl glass-soft mb-3 pointer-events-none"><LayoutGrid className="w-7 h-7 text-[var(--color-halo-text)]" /></span>
          <div className="font-display text-xl text-[var(--color-vapor)] pointer-events-none">{copy.title}</div>
          <p className="text-sm text-[var(--color-mist)] mt-2 text-center max-w-xs pointer-events-none">{copy.body}</p>
          <div className="mt-4 flex items-center gap-2">
            {(w.lens === 'manager' || w.lens === 'hr') && <button onClick={() => w.setVibe(true)} className="text-[13px] px-3 py-2 rounded-full font-semibold brand-gradient-btn text-white flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" /> Build one in Canvas</button>}
            <button onClick={() => w.setLegend(true)} className="text-[13px] px-3 py-2 rounded-full glass-soft text-[var(--color-mist)] hover:text-[var(--color-vapor)] transition-colors">See the gestures</button>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeHome({ area }: { area: Area }) {
  const w = useWorkspace();
  const me = w.people.find(p => p.id === ME_ID)!;
  const pendingDocs = w.documents.filter(d => d.mustAck && !d.acked).length;
  const balTotal = w.leaveTypes.reduce((a, t) => a + t.balance, 0);
  const payDue = w.cues.some(c => c.persona === 'employee' && c.kind === 'payroll');
  const elapsed = (w.att?.workedMs ?? 0) + (w.att && w.att.status !== 'out' && w.att.sessionStart ? Date.now() - w.att.sessionStart : 0);
  const frac = Math.max(0.04, Math.min(1, elapsed / (8 * 3600_000)));
  const nodes: OrbitNode[] = [
    { key: 'calendar', concept: 'calendar', label: 'Calendar', value: `${MONTHS[NOW.m]} ${NOW.d}`, icon: <CalendarDays className="w-4 h-4" />, accent: 'var(--color-lumen)', tint: 'lumen', run: () => w.setRegion('calendar'), deep: <Stat items={NODE_DEEP.calendar} />, hint: HINT.calendar },
    { key: 'leave', concept: 'leave', label: 'Leave', value: `${balTotal}d left`, icon: <Plane className="w-4 h-4" />, accent: 'var(--color-lumen)', tint: 'lumen', run: () => w.setRegion('calendar'), deep: <Stat items={NODE_DEEP.leave} />, hint: HINT.leave },
    { key: 'pay', concept: 'pay', label: 'Pay', value: <Masked value="₹1.45L" />, icon: <IndianRupee className="w-4 h-4" />, accent: payDue ? 'var(--color-ember)' : 'var(--color-lumen)', tint: payDue ? 'ember' : 'lumen', run: () => w.setRegion('payroll'), deep: <PayDeep />, hint: HINT.pay + ' Amounts stay hidden until you reveal them — tap the eye.' },
    { key: 'documents', concept: 'document', label: 'Documents', value: pendingDocs ? `${pendingDocs} to sign` : 'all signed', icon: <FileText className="w-4 h-4" />, accent: pendingDocs ? 'var(--color-ember)' : 'var(--color-lumen)', tint: pendingDocs ? 'ember' : 'lumen', pulse: pendingDocs > 0, run: () => w.setRegion('documents'), deep: <Stat items={NODE_DEEP.documents} />, hint: HINT.documents },
    { key: 'growth', concept: 'growth', label: 'Growth', value: 'on track', icon: <TrendingUp className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('growth'), deep: <JourneyMini />, hint: HINT.growth },
    { key: 'requests', concept: 'requests', label: 'Requests', value: '2 open', icon: <LifeBuoy className="w-4 h-4" />, accent: 'var(--color-lumen)', tint: 'lumen', run: () => w.toast('Helpdesk — raise IT, facilities or HR requests', 'info'), deep: <Stat items={NODE_DEEP.requests} />, hint: HINT.requests },
  ];
  const hub = <Hub seed={w.avatarSeed ?? me.name} name={me.name.split(' ')[0]} sub={`${Math.floor(elapsed / 3600000)}h ${Math.floor((elapsed % 3600000) / 60000)}m today`} frac={frac} onAsk={() => w.ask('Give me a quick summary of my day')} />;
  return <HomeOrbit area={area} nodes={nodes} hub={hub} caption="Tap a sphere to open · tap the centre to ask Q about your day" />;
}

const MGR_DEEP: Record<string, [string, string][]> = {
  approvals: [['Pending', '3'], ['Breaching SLA', '1 (<2h)'], ['Avg decision', '4.2h']],
  team: [['Reports', '5'], ['At risk', '1 (Sarah)'], ['On leave', 'Elena → 28 Jul']],
  availability: [['Available today', '4 / 5'], ['Coverage gap', 'Jul 25–28'], ['Remote', '1']],
  insights: [['Team velocity', '72'], ['Attendance', '86%'], ['Review cycle', '2 outstanding']],
  reviews: [['Cycle', 'Q2 2026'], ['Self-reviews in', '3 / 5'], ['1:1s due', '1']],
};
function ManagerHome({ area }: { area: Area }) {
  const w = useWorkspace();
  const reports = w.people.filter(p => p.managerId === 'm1');
  const pending = w.leaves.filter(l => l.status === 'pending').length;
  const focusCritical = w.leaves.some(l => l.status === 'pending' && l.isSlaBreached) || w.people.some(p => p.status === 'flight_risk');
  const planningDue = Object.keys(w.coverage).length < 3 || (w.comp.status === 'draft' && Object.keys(w.comp.plan).length === 0);
  const focusCount = pending + w.people.filter(p => p.status === 'flight_risk').length + w.cues.filter(c => c.persona === 'manager').length;
  const nodes: OrbitNode[] = [
    { key: 'focus', concept: 'focus', label: 'Focus', value: `${focusCount} open`, icon: <Crosshair className="w-4 h-4" />, accent: focusCritical ? 'var(--color-coral)' : 'var(--color-lumen)', tint: focusCritical ? 'coral' : 'lumen', pulse: focusCritical, run: () => w.setRegion('focus'), deep: <Stat items={[['Open items', String(focusCount)], ['Critical', focusCritical ? 'yes' : 'none'], ['Sorted by', 'priority']]} />, hint: 'Everything on your desk in one prioritised queue — clear it one card at a time, or tell Q to act.' },
    { key: 'approvals', concept: 'approval', label: 'Approvals', value: pending ? `${pending} pending` : 'clear', icon: <ClipboardCheck className="w-4 h-4" />, accent: pending ? 'var(--color-ember)' : 'var(--color-lumen)', tint: pending ? 'ember' : 'lumen', pulse: pending > 0, run: () => w.setRegion('approvals'), deep: <Stat items={MGR_DEEP.approvals} />, hint: 'Leave & regularization requests awaiting your decision.' },
    { key: 'team', concept: 'team', label: 'Team', value: `${reports.length} reports`, icon: <Users className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('team'), deep: <Stat items={MGR_DEEP.team} />, hint: 'Your constellation — presence, risk and workload.' },
    { key: 'availability', concept: 'attendance', label: 'Availability', value: `${reports.filter(p => p.status === 'active').length} / ${reports.length} in`, icon: <CalendarDays className="w-4 h-4" />, accent: 'var(--color-lumen)', tint: 'lumen', run: () => { w.setRegion('approvals'); w.setOverlay('matrix'); }, deep: <Stat items={MGR_DEEP.availability} />, hint: 'Two-week coverage matrix across your reports.' },
    { key: 'insights', concept: 'analytics', label: 'Insights', value: 'on track', icon: <BarChart3 className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('analytics'), deep: <Stat items={MGR_DEEP.insights} />, hint: 'Attendance, workload and comp signals for the team.' },
    { key: 'reviews', concept: 'growth', label: 'Growth', value: 'goals · 1:1s', icon: <MessageSquare className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('growth'), deep: <Stat items={MGR_DEEP.reviews} />, hint: 'Goals cascade, 1:1s and the review cycle for your reports.' },
    { key: 'planning', concept: 'planning', label: 'Planning', value: 'comp · coverage', icon: <IndianRupee className="w-4 h-4" />, accent: planningDue ? 'var(--color-ember)' : 'var(--color-lumen)', tint: planningDue ? 'ember' : 'lumen', run: () => w.setRegion('planning'), deep: <Stat items={[['Merit budget', '₹6.0L'], ['Uncovered leave', '3 windows'], ['Below band', '1 (Sarah)']]} />, hint: 'Plan raises within budget and arrange leave coverage — both route through the right approvals.' },
    { key: 'documents', concept: 'document', label: 'Documents', value: `${w.entities.filter(e => e.authorId === 'm1' && e.status === 'published').length} shared`, icon: <FileText className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('documents'), deep: <Stat items={MGR_DEEP.reviews} />, hint: 'Team documents you author and share — publish to your reports.' },
  ];
  const hub = <Hub group={reports.slice(0, 3).map(r => r.name)} name="Your team" sub={`${reports.filter(p => p.status === 'active').length} / ${reports.length} in`} frac={0.8} onAsk={() => w.ask('Give me a quick read on my team today')} />;
  return <HomeOrbit area={area} nodes={nodes} hub={hub} caption="Tap a sphere to open · tap the centre to ask Q about your team" />;
}

const HR_DEEP: Record<string, [string, string][]> = {
  org: [['Headcount', '124'], ['Departments', '8'], ['Attrition (LTM)', '9%']],
  payroll: [['Run status', '1 pooled'], ['Net this month', '₹1.9 Cr'], ['Effective tax', '18%']],
  onboarding: [['In pipeline', '3'], ['Closest', 'Aisha · 90%'], ['Avg time-to-productive', '31 d']],
  policies: [['Org acknowledged', '72%'], ['Pending', '34 people'], ['Latest', 'Handbook v4.0']],
  insights: [['Anomalies', '4'], ['Pending exits', '2'], ['Below comp band', '18%']],
};
function HrHome({ area }: { area: Area }) {
  const w = useWorkspace();
  const hrCritical = w.payslips.some(p => p.status === 'pooled');
  const buddyDue = w.candidates.some(c => c.progress >= 90 && !c.buddy);
  const onbClosest = [...w.candidates].sort((a, b) => b.progress - a.progress)[0];
  const onbDeep: [string, string][] = [['In pipeline', String(w.candidates.length)], ['Closest', onbClosest ? `${onbClosest.name.split(' ')[0]} \u00b7 ${onbClosest.progress}%` : '\u2014'], ['Awaiting a buddy', String(w.candidates.filter(c => !c.buddy).length)]];
  const exitClosest = [...w.leavers].sort((a, b) => new Date(a.lastDay + ' 2026').getTime() - new Date(b.lastDay + ' 2026').getTime())[0];
  const exitDeep: [string, string][] = [['Leaving', String(w.leavers.length)], ['Next exit', exitClosest ? `${exitClosest.name.split(' ')[0]} \u00b7 ${exitClosest.lastDay}` : '\u2014'], ['Avg exit progress', w.leavers.length ? `${Math.round(w.leavers.reduce((s, l) => s + l.progress, 0) / w.leavers.length)}%` : '\u2014']];
  const hrFocusCount = w.payslips.filter(p => p.status === 'pooled').length + w.candidates.filter(c => c.progress >= 90 && !c.buddy).length + (w.comp.status === 'submitted' ? 1 : 0) + w.cues.filter(c => c.persona === 'hr').length;
  const nodes: OrbitNode[] = [
    { key: 'focus', concept: 'focus', label: 'Focus', value: `${hrFocusCount} open`, icon: <Crosshair className="w-4 h-4" />, accent: hrCritical ? 'var(--color-coral)' : 'var(--color-lumen)', tint: hrCritical ? 'coral' : 'lumen', pulse: hrCritical, run: () => w.setRegion('focus'), deep: <Stat items={[['Open items', String(hrFocusCount)], ['Critical', hrCritical ? 'payroll pooled' : 'none'], ['Sorted by', 'priority']]} />, hint: 'The org\u2019s open items in one prioritised queue — payroll anomalies, comp drafts, onboarding and live signals.' },
    { key: 'org', concept: 'org', label: 'Org', value: '124 people', icon: <Users className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('people'), deep: <Stat items={HR_DEEP.org} />, hint: 'The full org constellation and reporting lines.' },
    { key: 'payroll', concept: 'payroll', label: 'Payroll', value: hrCritical ? '1 pooled' : 'flowing', icon: <IndianRupee className="w-4 h-4" />, accent: hrCritical ? 'var(--color-ember)' : 'var(--color-lumen)', tint: hrCritical ? 'ember' : 'lumen', pulse: hrCritical, run: () => w.setRegion('payroll'), deep: <Stat items={HR_DEEP.payroll} />, hint: 'The pay run command center — totals, anomalies and release, in one place.' },
    { key: 'onboarding', concept: 'onboarding', label: 'Onboarding', value: `${w.candidates.length} in pipe`, icon: <UserPlus className="w-4 h-4" />, accent: buddyDue ? 'var(--color-ember)' : 'var(--color-halo)', tint: buddyDue ? 'ember' : 'halo', run: () => w.setRegion('onboarding'), deep: <Stat items={onbDeep} />, hint: 'Day-one checklists per joiner \u2014 who\u2019s ready, who needs a buddy.' },
    { key: 'exit', concept: 'offboarding', label: 'Offboarding', value: w.leavers.length ? `${w.leavers.length} leaving` : 'none', icon: <UserCog className="w-4 h-4" />, accent: w.leavers.length ? 'var(--color-ember)' : 'var(--color-halo)', tint: w.leavers.length ? 'ember' : 'halo', run: () => w.setRegion('exit'), deep: <Stat items={exitDeep} />, hint: 'Exit checklists \u2014 clean handover before access is revoked.' },
    { key: 'timeadmin', concept: 'timeadmin', label: 'Time & holidays', value: `${w.holidays.length} holidays`, icon: <CalendarDays className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('timeadmin'), deep: <Stat items={[['Leave types', String(w.leaveTypes.length)], ['Restricted days', String(w.holidays.filter(h => h.kind === 'restricted').length)], ['Next holiday', w.holidays[0]?.label ?? '—']]} />, hint: 'Define leave types and allotments, and manage the org\u2019s holiday calendar \u2014 HR only.' },
    { key: 'policies', concept: 'policy', label: 'Policies', value: '72% ack', icon: <FileText className="w-4 h-4" />, accent: 'var(--color-ember)', tint: 'ember', run: () => w.setRegion('documents'), deep: <Stat items={HR_DEEP.policies} />, hint: 'Org-wide acknowledgment and knowledge base.' },
    { key: 'insights', concept: 'analytics', label: 'Insights', value: '4 flags', icon: <BarChart3 className="w-4 h-4" />, accent: 'var(--color-halo)', tint: 'halo', run: () => w.setRegion('analytics'), deep: <Stat items={HR_DEEP.insights} />, hint: 'Headcount, comp, DEI and attrition patterns.' },
    { key: 'planning', concept: 'planning', label: 'Planning', value: 'comp review', icon: <Shield className="w-4 h-4" />, accent: w.comp.status === 'submitted' ? 'var(--color-ember)' : 'var(--color-lumen)', tint: w.comp.status === 'submitted' ? 'ember' : 'lumen', run: () => w.setRegion('planning'), deep: <Stat items={[['Comp drafts', 'from managers'], ['Coverage', 'org-wide']]} />, hint: 'Review compensation drafts routed by managers and org-wide leave coverage.' },
  ];
  const hub = <Hub name="The org" sub="124 people" frac={0.72} onAsk={() => w.ask('Give me a quick read on the org today')} icon={<Building2 className="w-6 h-6" />} />;
  return <HomeOrbit area={area} nodes={nodes} hub={hub} caption="Tap a sphere to open · tap the centre to ask Q about the org" />;
}

/* ---------------- MANAGER approvals — inbox ---------------- */
function ManagerApprovals() {
  const w = useWorkspace();
  const { leaves, setOverlay, approve, reject, hold, resume, approveMany, rejectMany, setDelegate, approvalDelegate, people } = w;
  const pending = leaves.filter(l => l.status === 'pending');
  const held = leaves.filter(l => l.status === 'held');
  const reports = people.filter(p => p.managerId === 'm1');
  const delegateName = approvalDelegate ? people.find(p => p.id === approvalDelegate)?.name : null;
  const [sel, setSel] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = pending.length > 0 && pending.every(l => sel.has(l.id));
  const selectAll = () => setSel(allSelected ? new Set() : new Set(pending.map(l => l.id)));
  const selIds = pending.filter(l => sel.has(l.id)).map(l => l.id);
  const dateStr = (l: typeof leaves[number]) => l.startDate + (l.endDate !== l.startDate ? ` – ${l.endDate}` : '');

  const Row = ({ l, heldRow = false }: { l: typeof leaves[number]; heldRow?: boolean }) => (
    <div className="glass-panel p-3 flex items-center gap-3" style={{ borderRadius: 'var(--r-soft)' }}>
      {!heldRow && (
        <button onClick={() => toggle(l.id)} aria-label="Select" className={`w-5 h-5 rounded-md border shrink-0 grid place-items-center transition-colors ${sel.has(l.id) ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] hover:border-[var(--color-lumen)]'}`}>{sel.has(l.id) && <Check className="w-3.5 h-3.5 text-[var(--color-abyss)]" />}</button>
      )}
      <Avatar seed={l.personName} name={l.personName} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] text-[var(--color-vapor)] font-medium">{l.personName}</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/8 text-[var(--color-mist)] capitalize">{l.kind}</span>
          {l.isSlaBreached && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-ember)]/15 text-[var(--color-ember)] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SLA &lt; 2h</span>}
        </div>
        <div className="text-[13px] text-[var(--color-trace)] mt-0.5">{dateStr(l)} · {l.days} day{l.days === 1 ? '' : 's'}{l.conflictWith ? ` · overlaps ${l.conflictWith}` : ''}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {heldRow
          ? <button onClick={() => resume(l.id)} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Resume</button>
          : <button onClick={() => hold(l.id)} aria-label="Hold" className="w-8 h-8 grid place-items-center rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]" title="Hold for later"><Pause className="w-3.5 h-3.5" /></button>}
        <button onClick={() => reject(l.id)} aria-label="Decline" className="w-8 h-8 grid place-items-center rounded-full glass-soft hover:bg-[var(--color-coral)]/15 text-[var(--color-coral)]" title="Decline"><X className="w-4 h-4" /></button>
        <button onClick={() => approve(l.id)} aria-label="Approve" className="w-8 h-8 grid place-items-center rounded-full bg-[var(--color-lumen)]/15 hover:bg-[var(--color-lumen)]/25 text-[var(--color-lumen)]" title="Approve"><Check className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <RegionWrap label="Approvals · inbox" icon={<ClipboardCheck className="w-3.5 h-3.5" />}>
      {/* delegate control */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <UserCog className="w-4 h-4 text-[var(--color-halo-text)]" />
          <span className="text-[13px] text-[var(--color-mist)]">Delegate while away</span>
          <select value={approvalDelegate ?? ''} onChange={e => setDelegate(e.target.value || null)}
            className="text-[13px] px-3 py-2 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[var(--color-vapor)]">
            <option value="" className="bg-[var(--color-abyss)]">No delegate</option>
            {reports.map(p => <option key={p.id} value={p.id} className="bg-[var(--color-abyss)]">{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOverlay('matrix')} className="text-[13px] px-3 py-2 rounded-xl glass-soft hover:bg-white/10 transition-colors">Availability matrix</button>
          <button onClick={() => w.toast('Nudged 3 reports to submit their timesheets', 'ok')} className="text-[13px] px-3 py-2 rounded-xl glass-soft hover:bg-white/10 transition-colors">Nudge overdue (3)</button>
        </div>
      </div>
      {delegateName && (
        <div className="mb-3 px-4 py-3 rounded-2xl bg-[var(--color-halo)]/12 border border-[var(--color-halo)]/25 text-[13px] text-[var(--color-vapor)] flex items-center gap-2">
          <UserCog className="w-4 h-4 text-[var(--color-halo-text)] shrink-0" /> While you’re away, {delegateName.split(' ')[0]} can clear this queue. Approvals within policy can auto-approve.
        </div>
      )}

      {/* batch toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={selectAll} disabled={!pending.length} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] disabled:opacity-30 flex items-center gap-2">
          <span className={`w-4 h-4 rounded border grid place-items-center ${allSelected ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)]'}`}>{allSelected && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
          Select all
        </button>
        <span className="flex-1" />
        <button onClick={() => { rejectMany(selIds); setSel(new Set()); }} disabled={!selIds.length} className="text-[13px] px-4 py-2 rounded-xl font-semibold glass-soft hover:bg-[var(--color-coral)]/15 text-[var(--color-coral)] disabled:opacity-30 transition-colors">Decline selected ({selIds.length})</button>
        <button onClick={() => { approveMany(selIds); setSel(new Set()); }} disabled={!selIds.length} className="text-[13px] px-4 py-2 rounded-xl font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/30 transition-colors">Approve selected ({selIds.length})</button>
      </div>

      {/* pending */}
      <div className="space-y-3">
        {pending.length === 0 && <div className="glass-soft p-4 text-sm text-[var(--color-mist)] rounded-2xl flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-lumen)]" /> Inbox zero — nothing awaiting your decision.</div>}
        {pending.map(l => <Row key={l.id} l={l} />)}
      </div>

      {/* held */}
      {held.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-[var(--color-trace)] mb-2"><Pause className="w-3.5 h-3.5" /> On hold ({held.length})</div>
          <div className="space-y-3">{held.map(l => <Row key={l.id} l={l} heldRow />)}</div>
        </div>
      )}
    </RegionWrap>
  );
}

/* ---------------- Analytics ---------------- */
function Analytics() {
  const w = useWorkspace();
  const mgr = w.lens === 'manager';
  return (
    <RegionWrap label="Insights · generated by Q" icon={<Layers className="w-3.5 h-3.5" />}>
      <div className="grid md:grid-cols-2 gap-x-4 gap-y-5">
        {mgr && (() => { const risk = w.people.find(p => p.status === 'flight_risk'); if (!risk) return null; const fn = risk.name.split(' ')[0]; return (
          <div className="md:col-span-2 glass-elevated p-5" style={{ borderRadius: 'var(--r-soft)', border: '1px solid color-mix(in srgb, var(--color-halo) 40%, transparent)' }}>
            <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-halo-text)] mb-2"><Sparkles className="w-3.5 h-3.5" /> Q recommends</div>
            <div className="text-sm text-[var(--color-vapor)] mb-1">{risk.name} is showing flight-risk signals — attendance is trending down and there's a compensation gap. Acting this week materially improves retention odds.</div>
            <div className="text-[13px] text-[var(--color-mist)] mb-3">I can put together a retention plan and prep your next 1:1 so the conversation lands well.</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => w.ask(`Simulate a retention plan for ${fn}`)} className="px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white hover:brightness-110 transition flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Draft retention plan</button>
              <button onClick={() => w.ask(`Give me talking points for my 1:1 with ${fn}`)} className="px-4 py-2 rounded-full text-sm font-semibold glass-soft hover:bg-white/10 text-[var(--color-mist)]">Prep the 1:1</button>
            </div>
          </div>
        ); })()}
        {(() => { const s = w.survey; const avg = s.sum / s.count; const hi = Math.max(...s.history), lo = Math.min(...s.history); const pts = s.history.map((v, i) => `${(i / (s.history.length - 1)) * 100},${28 - ((v - lo) / (hi - lo || 1)) * 24}`).join(' '); return (
          <div className="md:col-span-2 glass-panel tint-lumen p-5" style={{ borderRadius: 'var(--r-soft)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><TrendingUp className="w-3.5 h-3.5" /> Team pulse</div>
              <button onClick={() => w.ask('Summarise the latest pulse themes')} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Summarise with Q</button>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div><div className="text-3xl font-display text-[var(--color-vapor)]">{avg.toFixed(1)}<span className="text-base text-[var(--color-trace)]">/5</span></div><div className="text-[12px] text-[var(--color-trace)]">{s.count} responses this week</div></div>
              <svg viewBox="0 0 100 30" className="w-40 h-10" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="var(--color-lumen)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>
              <div className="flex-1 min-w-[200px]">
                <div className="text-[12px] uppercase tracking-wider text-[var(--color-trace)] mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Q themes</div>
                <div className="flex flex-wrap gap-2">{s.themes.map(t => <span key={t} className="text-[12px] px-2 py-1 rounded-full glass-soft text-[var(--color-mist)]">{t}</span>)}</div>
              </div>
            </div>
          </div>
        ); })()}
        {w.vibeInsights.map(id => { const app = w.vibeApps.find(v => v.id === id); if (!app) return null; return (
          <TokenCard key={id} id={id} kind="chart" placement="flow" shape="rect" tint="halo" className="w-full" label={vibeTitle(app.template)} onClose={() => w.removeInsights(id)}
            expand={<div className="text-[13px] text-[var(--color-mist)]">Built in Canvas. Close to remove from Insights.</div>}>
            <div className="flex items-center gap-2 text-[13px] font-medium mb-3">{VIBE_ICON[app.template]} {vibeTitle(app.template)}<span className="ml-auto text-[11px] text-[var(--color-halo-text)] uppercase tracking-wider">Canvas</span></div>
            <VibeApp template={app.template} parts={app.parts} config={app.config} />
          </TokenCard>
        ); })}
        {mgr && <TokenCard id="talent" kind="chart" placement="flow" shape="rect" tint="halo" className="w-full" label="Talent distribution" deep={<Stat items={[['Stars', '1'], ['High potential', '1'], ['Inconsistent', '1 (Sarah)']]} />} expand={<div className="text-[13px] text-[var(--color-mist)]">Performance × potential across your reports. Tap a name to open their profile.</div>}><div className="text-[13px] font-medium mb-3">Talent distribution</div><TalentMap /></TokenCard>}
        {mgr && <TokenCard id="timeoff" kind="chart" placement="flow" shape="rect" tint="halo" className="w-full" label="Team time-off heatmap" deep={<Stat items={[['Heaviest week', 'Wk 3–4'], ['Coverage gap', 'Jul 25–28'], ['On leave now', 'Elena']]} />} expand={<div className="text-[13px] text-[var(--color-mist)]">Where leave clusters across the team. Red = heavy.</div>}><div className="text-[13px] font-medium mb-3">Team time-off heatmap</div><TimeOffHeatmap /></TokenCard>}
        <TokenCard id="attendance" kind="chart" placement="flow" shape="rect" tint="halo" className="w-full" label="Attendance trend" expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>The single strongest input to Sarah's flight-risk score.</p><button onClick={(e) => { e.stopPropagation(); w.ask('Why is Sarah a flight risk?'); }} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Ask Q about Sarah</button><button onClick={(e) => { e.stopPropagation(); w.boardAdd('chart', 'attendance'); w.toast('Attendance added to your board', 'ok'); }} className="w-full py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 text-[var(--color-mist)]">Add to board</button></div>}><div className="text-[13px] font-medium mb-3">Sarah — attendance trend</div><AttendanceViz /></TokenCard>
        <TokenCard id="comp" kind="chart" placement="flow" shape="rect" tint="halo" className="w-full" label="Compensation distribution" expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>18% of the team sits below band.</p><button onClick={(e) => { e.stopPropagation(); w.ask('Show compensation distribution'); }} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Ask Q about pay bands</button><button onClick={(e) => { e.stopPropagation(); w.boardAdd('chart', 'comp'); w.toast('Compensation added to your board', 'ok'); }} className="w-full py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 text-[var(--color-mist)]">Add to board</button></div>}><div className="text-[13px] font-medium mb-3">Compensation distribution</div><CompViz /></TokenCard>
        {mgr && <TokenCard id="directory" kind="chart" placement="flow" shape="rect" tint="mist" className="w-full" label="Manager directory" deep={<Stat items={[['Your span', '5 direct'], ['Team leads', '2'], ['Deepest chain', '2 levels']]} />} expand={<div className="text-[13px] text-[var(--color-mist)]">Direct, indirect and total reports across the team.</div>}>
          <div className="text-[13px] font-medium mb-3">Manager directory</div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_repeat(3,44px)] gap-1 text-[12px] uppercase tracking-wider text-[var(--color-trace)]"><span /><span className="text-center">Dir</span><span className="text-center">Ind</span><span className="text-center">Tot</span></div>
            {DIRECTORY.map(d => (
              <div key={d.name} className="grid grid-cols-[1fr_repeat(3,44px)] gap-1 items-center">
                <div className="min-w-0"><div className="text-[13px] text-[var(--color-vapor)] truncate">{d.name}</div><div className="text-[12px] text-[var(--color-trace)] truncate">{d.role}</div></div>
                <span className="text-center font-mono text-[13px] text-[var(--color-vapor)]">{d.direct}</span>
                <span className="text-center font-mono text-[13px] text-[var(--color-mist)]">{d.indirect}</span>
                <span className="text-center font-mono text-[13px] text-[var(--color-lumen)]">{d.total}</span>
              </div>
            ))}
          </div>
        </TokenCard>}
        <TokenCard id="workload" kind="chart" placement="flow" shape="rect" tint="halo" className="w-full md:col-span-2" label="Team workload heatmap" expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>Where the team is over- or under-loaded.</p><button onClick={(e) => { e.stopPropagation(); w.setRegion('team'); }} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Compare people in My Team</button><button onClick={(e) => { e.stopPropagation(); w.boardAdd('chart', 'workload'); w.toast('Workload added to your board', 'ok'); }} className="w-full py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 text-[var(--color-mist)]">Add to board</button></div>}><div className="text-[13px] font-medium mb-3">Team workload heatmap</div><WorkloadViz /></TokenCard>
      </div>
    </RegionWrap>
  );
}

/* ---------------- HR onboarding ---------------- */
function Onboarding() {
  const w = useWorkspace();
  const buddyPool = w.people.filter(p => p.status === 'active').slice(0, 6);
  const OWNER_TINT: Record<string, string> = { 'IT': 'var(--color-lumen)', 'People Team': 'var(--color-halo-text)', 'Manager': 'var(--color-ember)', 'Joiner': 'var(--color-mist)' };
  return (
    <RegionWrap label="Onboarding pipeline \u00b7 day one" icon={<Users className="w-3.5 h-3.5" />}>
      <p className="text-[13px] text-[var(--color-mist)] mb-4">Each joiner has a day-one checklist \u2014 tick items as they complete, assign a start buddy, and progress updates itself. Every item shows who owns it.</p>
      <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
        {w.candidates.map(c => {
          const list = c.checklist ?? [];
          const done = list.filter(k => k.done).length;
          const pct = list.length ? Math.round((done / list.length) * 100) : c.progress;
          const isNew = pct === 0;
          return (
            <div key={c.id} className="glass-panel shape-soft p-4 flex flex-col">
              {/* header */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar seed={c.name} name={c.name} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--color-vapor)] truncate">{c.name}</div>
                  <div className="text-[12px] text-[var(--color-trace)] truncate">{c.role ?? c.stage}{c.startDate ? ` \u00b7 starts ${c.startDate}` : ''}</div>
                </div>
                {isNew && <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-lumen)]/15 text-[var(--color-lumen)] shrink-0">New</span>}
              </div>
              {/* derived progress */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className="h-full" style={{ background: pct === 100 ? 'var(--color-lumen)' : 'var(--color-halo-text)' }} /></div>
                <span className="text-[12px] font-mono text-[var(--color-trace)] shrink-0">{done}/{list.length}</span>
              </div>
              {/* checklist */}
              <div className="space-y-1 flex-1">
                {list.map(k => (
                  <button key={k.id} onClick={() => w.toggleJoinerTask(c.id, k.id)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors group/item">
                    <span className={`w-4 h-4 rounded grid place-items-center shrink-0 border transition-colors ${k.done ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)] group-hover/item:border-[var(--color-lumen)]/50'}`}>{k.done && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
                    <span className={`text-[13px] flex-1 min-w-0 truncate ${k.done ? 'text-[var(--color-trace)] line-through' : 'text-[var(--color-vapor)]'}`}>{k.label}</span>
                    <span className="text-[11px] uppercase tracking-wider shrink-0" style={{ color: OWNER_TINT[k.owner] ?? 'var(--color-trace)' }}>{k.owner}</span>
                  </button>
                ))}
              </div>
              {/* buddy */}
              <div className="mt-3 pt-3 border-t border-[var(--color-glass-edge)] flex items-center gap-2">
                <span className="text-[12px] text-[var(--color-trace)] shrink-0">Buddy</span>
                <select value={c.buddy ? (buddyPool.find(p => p.name === c.buddy)?.id ?? '') : ''} onChange={(e) => { if (e.target.value) w.assignBuddy(c.id, e.target.value); }}
                  className="flex-1 text-[13px] px-2 py-1 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[var(--color-vapor)] focus:border-[var(--color-lumen)] transition-colors">
                  <option value="" className="bg-[var(--color-abyss)]">{c.buddy ?? 'Assign\u2026'}</option>
                  {buddyPool.map(p => <option key={p.id} value={p.id} className="bg-[var(--color-abyss)]">{p.name}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
      {w.activity.length > 0 && (
        <div className="mt-6">
          <div className="text-[12px] uppercase tracking-widest text-[var(--color-trace)] mb-2">Recent activity</div>
          <div className="space-y-2">{w.activity.slice(0, 4).map(a => <div key={a.id} className="flex items-center gap-2 text-[13px] text-[var(--color-mist)]"><span className="flex-1 truncate">{a.text}</span><span className="text-[var(--color-trace)]">{a.at}</span></div>)}</div>
        </div>
      )}
    </RegionWrap>
  );
}

/* ---------------- side context ---------------- */
function ManagerHeatmap() {
  const { leaves, bulkApprove, setRegion, setOverlay } = useWorkspace();
  const pending = leaves.filter(l => l.status === 'pending').length;
  return (
    <div className="fixed right-4 top-20 z-20 w-56">
      <TokenCard id="team-availability" kind="kpi" placement="flow" shape="soft" tint="halo" className="w-full" label="Team availability"
        expand={<div className="text-[13px] text-[var(--color-mist)]">Red cells are absences. {pending} request{pending === 1 ? '' : 's'} pending — open the full matrix to plan coverage.</div>}>
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><Users className="w-3.5 h-3.5" /> Team availability</div>
        <button onClick={(e) => { e.stopPropagation(); setOverlay('matrix'); }} className="w-full mb-3 grid grid-cols-7 gap-1 hover:opacity-80 transition-opacity" aria-label="Open availability matrix">{Array.from({ length: 21 }).map((_, i) => <span key={i} className="h-4 rounded-sm" style={{ background: i % 7 === 5 || i % 7 === 6 ? 'rgba(180,210,235,0.05)' : i % 5 === 0 ? 'var(--color-ember)' : 'var(--color-lumen-soft)' }} />)}</button>
        <button onClick={(e) => { e.stopPropagation(); setRegion('approvals'); }} className="w-full py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 transition-colors mb-2">Review approvals ({pending})</button>
        <button onClick={(e) => { e.stopPropagation(); bulkApprove(); }} disabled={!pending} className="w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/30 transition-colors">Bulk approve</button>
      </TokenCard>
    </div>
  );
}

function HrMetrics() {
  return (
    <div className="fixed right-4 top-20 z-20 flex flex-col gap-2 w-44">
      {HR_METRICS.map(m => (
        <TokenCard key={m.label} id={m.label} kind="kpi" placement="flow" shape="pill" tint={m.tone === 'ember' ? 'ember' : 'halo'} className={`w-full ${m.tone === 'ember' ? 'border-l-2 border-l-[var(--color-ember)]' : ''}`} label={m.label}
          expand={<div className="text-[13px] text-[var(--color-mist)]">{m.tone === 'ember' ? 'Trending the wrong way. Peel to Ask Q who drives it.' : 'Within range. Peel to Ask Q for the breakdown.'}</div>}>
          <div className={`text-xl font-display font-light ${m.tone === 'ember' ? 'text-[var(--color-ember)]' : 'text-[var(--color-vapor)]'}`}>{m.value}</div>
          <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">{m.label}</div>
        </TokenCard>
      ))}
    </div>
  );
}
