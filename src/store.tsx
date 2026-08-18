import { createContext, useContext, useMemo, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { INITIAL_HOLIDAYS, METRIC_SNAPSHOTS, VIBE_TEMPLATES, makeChecklist, makeExitChecklist, OFFBOARDING, MetricKey } from './data';
import { useReducedMotion } from 'motion/react';
import {
  Persona, Highlight, Region, Overlay, LeaveMode, Attendance, LeaveType,
  PersonToken, LeaveToken, PayslipToken, DocumentItem, Cue, Toast, QMsg, SynthToken, Pulse,
  Entity, Activity, Audience, OnbTask, OnboardingCandidate, Goal, OneOnOne, Review, PulseState, CompState, Holiday, Leaver,
  WorkspaceItem, WsConnector, WsKind, WsTodoEntry,
  Reimbursement, AssetItem,
} from './types';
import { setMuted, sfx } from './sound';
import { fuzzyFix, understand, parseVizPrompt } from './qbrain';
import { emit as emitTelemetry } from './telemetry';
import { remember, lastThread, MemoryThread } from './memory';

function lensesFor(role: Persona): Persona[] { return role === 'employee' ? ['employee'] : role === 'manager' ? ['employee', 'manager'] : ['employee', 'manager', 'hr']; }
function audienceLabel(a: Audience): string { return a.scope === 'org' ? 'the whole org' : a.scope === 'team' ? 'your team' : 'one person'; }
import {
  PEOPLE, LEAVES, PAYSLIPS, DOCUMENTS, CUES, ENTITIES, ME_ID, INITIAL_LEAVE_TYPES, INITIAL_ATTENDANCE, HR_METRICS, ONBOARDING, REIMBURSEMENTS, ASSETS,
  MY_HOURS, MY_LEAVE, MONTHS, NOW, ONBOARD_TASKS, ONBOARD_BUDDY, GOALS, ONE_ON_ONES, REVIEWS, COMP_BUDGET, COVERAGE,
} from './data';

interface State {
  lens: Persona; region: Region; overlay: Overlay;
  docView: string | null;   // id of the document open in the viewer
  role: Persona; availableLenses: Persona[];   // RBAC: which lenses this user may enter
  people: PersonToken[]; leaves: LeaveToken[]; payslips: PayslipToken[]; documents: DocumentItem[];
  leaveTypes: LeaveType[];
  cues: Cue[]; toasts: Toast[];
  entities: Entity[]; activity: Activity[];
  approvalDelegate: string | null;
  showTour: boolean; showLegend: boolean; onboardingTasks: OnbTask[]; onboardingBuddy: string; candidates: OnboardingCandidate[]; leavers: Leaver[];
  goals: Goal[]; oneOnOnes: OneOnOne[]; reviews: Review[];
  survey: PulseState;
  comp: CompState; coverage: Record<string, string>;
  att: Attendance;
  peeledId: string | null; selection: string[]; dragging: boolean; qHover: 'none' | 'influence' | 'release';
  highlight: Highlight; intentEcho: string | null;
  qOpen: boolean; qLog: QMsg[]; qMood: 'idle' | 'listening' | 'thinking' | 'answering';
  sim: { personId: string; lever: 'bonus' | 'project' | 'promo' } | null;
  nonce: number;
  hidden: string[];
  floating: Record<string, { x: number; y: number }>;
  vibeOpen: boolean;
  vibeApps: { id: string; template: string; title?: string; refine?: string; parts?: string[]; config?: { kind: string; label: string; data?: { labels?: string[]; values?: number[] } } }[];
  sharedTools: { id: string; appId: string; title: string; from: string; at: string; to?: string }[];
  sharedHidden: string[];
  showPay: boolean;
  holidays: Holiday[];
  homeView: 'signal' | 'board' | 'workspace';
  wsItems: WorkspaceItem[];
  wsConnectors: WsConnector[];
  wsZ: number;   // z-counter for bring-to-front
  wsBoards: Record<string, { name: string; pad?: number }>;   // flowboard metadata (name + optional extra padding from scale)
  vibePinned: string[];
  vibeInsights: string[];
  vibeChat: { id: string; role: 'user' | 'q'; text: string; appId?: string }[];
  canvasHistory: { id: string; title: string; chat: { id: string; role: 'user' | 'q'; text: string; appId?: string }[] }[];
  nowBoard: { id: string; type: 'person' | 'chart' | 'tool' | 'ws'; ref: string; lens: Persona; pos?: { x: number; y: number }; size?: { w: number; h: number } }[];
  wallpaper: string;
  avatarSeed: string | null;
  motionOff: boolean;
  plain: boolean;
  reimbursements: Reimbursement[];
  assets: AssetItem[];
  synth: SynthToken[];
  pulses: Pulse[];
  soundOn: boolean;
  panelLeft: boolean;
  panelRight: boolean;
}

type Action =
  | { t: 'lens'; lens: Persona } | { t: 'role'; role: Persona } | { t: 'region'; region: Region } | { t: 'overlay'; overlay: Overlay } | { t: 'docView'; id: string | null }
  | { t: 'float'; id: string; x: number; y: number } | { t: 'dock'; id: string }
  | { t: 'vibeOpen'; open: boolean } | { t: 'vibeCreate'; template: string; appId: string; prompt: string } | { t: 'vibeSay'; turns: State['vibeChat'] } | { t: 'vibeRemove'; id: string } | { t: 'vibePin'; id: string } | { t: 'vibeUnpin'; id: string } | { t: 'vibeInsight'; id: string; on: boolean } | { t: 'vibeClear' } | { t: 'boardAdd'; kind: 'person' | 'chart' | 'tool'; ref: string; lens: Persona } | { t: 'boardReorder'; id: string; toIndex: number; lens: Persona } | { t: 'boardRemove'; id: string } | { t: 'boardMove'; id: string; x: number; y: number } | { t: 'boardResize'; id: string; w: number; h: number } | { t: 'boardToQ'; id: string } | { t: 'boardCombine'; idA: string; idB: string }
  | { t: 'vibeRename'; id: string; title: string } | { t: 'vibeDuplicate'; id: string; newId: string } | { t: 'vibeRefine'; id: string; note: string } | { t: 'vibeCombine'; newId: string; parts: string[]; title: string } | { t: 'vibeWidget'; newId: string; config: { kind: string; label: string; data?: { labels?: string[]; values?: number[] } }; prompt: string } | { t: 'vibeWidgets'; specs: { kind: string; label: string; data?: { labels?: string[]; values?: number[] } }[]; prompt: string } | { t: 'hideShared'; appId: string } | { t: 'togglePay' } | { t: 'addHoliday'; label: string; date: string; kind: Holiday['kind'] } | { t: 'removeHoliday'; id: string } | { t: 'setAllot'; typeId: string; days: number } | { t: 'addPerson'; name: string; role: string; department: string; managerId: string } | { t: 'addCandidate'; name: string; stage: string } | { t: 'toggleJoinerTask'; candidateId: string; taskId: string } | { t: 'toggleExitTask'; leaverId: string; taskId: string } | { t: 'startOffboarding'; personId: string; reason: Leaver['reason']; lastDay: string } | { t: 'widgetKind'; id: string; kind: string } | { t: 'homeView'; view: 'signal' | 'board' | 'workspace' }
  | { t: 'wsAdd'; kind: WsKind; x: number; y: number } | { t: 'wsAddTool'; toolRef: string } | { t: 'wsToCanvas'; id: string } | { t: 'wsUpdate'; id: string; patch: Partial<WorkspaceItem> } | { t: 'wsMove'; id: string; x: number; y: number } | { t: 'wsDelete'; id: string } | { t: 'wsFront'; id: string } | { t: 'wsConnect'; fromId: string; toId: string; fromSide?: 'top'|'right'|'bottom'|'left'; toSide?: 'top'|'right'|'bottom'|'left' } | { t: 'wsResize'; id: string; w: number; h: number } | { t: 'wsDisconnect'; id: string } | { t: 'wsConnUpdate'; id: string; patch: Partial<WsConnector> } | { t: 'wsToQ'; id: string } | { t: 'wsToSignal'; id: string } | { t: 'wsShare'; id: string; personId: string } | { t: 'wsUnshare'; id: string; personId: string } | { t: 'wsBoardName'; fb: string; name: string } | { t: 'wsBoardDelete'; fb: string } | { t: 'wsBoardMove'; fb: string; dx: number; dy: number } | { t: 'wsBoardOrganize'; fb: string } | { t: 'wsJoinBoard'; id: string; fb: string } | { t: 'wsBoardPad'; fb: string; pad: number } | { t: 'wsAddConnected'; fromId: string; side: 'top'|'right'|'bottom'|'left'; kind: WsKind } | { t: 'publishTool'; appId: string; to?: string } | { t: 'unpublishTool'; appId: string }
  | { t: 'newCanvas' } | { t: 'loadCanvas'; id: string }
  | { t: 'wallpaper'; id: string } | { t: 'avatar'; seed: string | null } | { t: 'motionOff'; off: boolean } | { t: 'plain'; on: boolean } | { t: 'claimReimb'; title: string; category: Reimbursement['category']; amount: number; note?: string; receipt?: string }
  | { t: 'peel'; id: string | null } | { t: 'reset' }
  | { t: 'select'; id: string } | { t: 'clearSel' } | { t: 'dragging'; on: boolean } | { t: 'qHover'; level: 'none' | 'influence' | 'release' }
  | { t: 'clockIn' } | { t: 'clockOut' } | { t: 'breakStart' } | { t: 'breakEnd' }
  | { t: 'approve'; id: string } | { t: 'reject'; id: string } | { t: 'bulkApprove' }
  | { t: 'applyLeave'; kind: string; mode: LeaveMode; start: string; end: string; days: number; reason?: string; convertedFrom?: string }
  | { t: 'addLeaveFor'; personId: string; kind: string; mode: LeaveMode; start: string; end: string; days: number }
  | { t: 'addType'; label: string; days: number }
  | { t: 'overridePayroll'; id: string } | { t: 'ackDoc'; id: string } | { t: 'dismissCue'; id: string }
  | { t: 'hold'; id: string } | { t: 'resume'; id: string } | { t: 'delegate'; id: string | null } | { t: 'approveMany'; ids: string[] } | { t: 'rejectMany'; ids: string[] }
  | { t: 'tour'; on: boolean } | { t: 'legend'; on: boolean } | { t: 'onbTask'; id: string } | { t: 'assignBuddy'; candidateId: string; personId: string }
  | { t: 'goalCreate'; title: string; dueOn: string; owner: string; now: string } | { t: 'goalCascade'; id: string } | { t: 'goalProgress'; id: string; delta: number } | { t: 'goalArchive'; id: string }
  | { t: 'ooToggle'; ooId: string; actionId: string } | { t: 'ooAddAction'; ooId: string; text: string }
  | { t: 'reviewSelf'; id: string; text: string } | { t: 'reviewManager'; id: string; text: string } | { t: 'reviewNudge' }
  | { t: 'pulseSubmit'; score: number }
  | { t: 'compSet'; id: string; amount: number } | { t: 'compSubmit' } | { t: 'compReset' } | { t: 'compApprove' }
  | { t: 'setCoverage'; id: string; personId: string } | { t: 'autoCover' }
  | { t: 'entityCreate'; patch: Partial<Entity>; authorId: string; authorName: string; now: string } | { t: 'entityUpdate'; id: string; patch: Partial<Entity>; now: string } | { t: 'entityPublish'; id: string; now: string } | { t: 'entityArchive'; id: string; now: string } | { t: 'entityAck'; id: string; now: string } | { t: 'entityNudge'; id: string; now: string }
  | { t: 'intent'; text: string } | { t: 'qOpen'; open: boolean } | { t: 'ask'; text: string }
  | { t: 'explain'; kind: string; id: string }
  | { t: 'sim'; personId: string; lever: 'bonus' | 'project' | 'promo' } | { t: 'simClose' }
  | { t: 'toast'; toast: Toast } | { t: 'dropToast'; id: string }
  | { t: 'hide'; id: string } | { t: 'unhide'; id: string }
  | { t: 'spawn'; token: SynthToken } | { t: 'dismissSynth'; id: string }
  | { t: 'pulse'; pulse: Pulse } | { t: 'dropPulse'; id: string }
  | { t: 'sound'; on: boolean } | { t: 'cluster'; ids: string[] } | { t: 'combineStack'; ids: string[] } | { t: 'qMood'; mood: State['qMood'] } | { t: 'panel'; side: 'left' | 'right'; open: boolean };

// Orbit sphere keys — the only `hidden` entries that persist across sessions
// (transient token hides in the org graph / result cards are session-only).
const SPHERE_KEYS = new Set(['calendar', 'leave', 'pay', 'documents', 'growth', 'requests', 'focus', 'approvals', 'team', 'availability', 'insights', 'reviews', 'planning', 'org', 'payroll', 'onboarding', 'exit', 'timeadmin', 'policies']);

// Recompute flowboard membership as connected components over the connector graph.
function recomputeFlowboards(items: WorkspaceItem[], conns: WsConnector[]): WorkspaceItem[] {
  const adj = new Map<string, Set<string>>();
  for (const c of conns) { (adj.get(c.fromId) ?? adj.set(c.fromId, new Set()).get(c.fromId)!).add(c.toId); (adj.get(c.toId) ?? adj.set(c.toId, new Set()).get(c.toId)!).add(c.fromId); }
  const comp = new Map<string, string>();  // itemId -> flowboard id (the min member id)
  const seen = new Set<string>();
  for (const id of adj.keys()) {
    if (seen.has(id)) continue;
    const stack = [id], members: string[] = [];
    while (stack.length) { const n = stack.pop()!; if (seen.has(n)) continue; seen.add(n); members.push(n); for (const m of adj.get(n) ?? []) if (!seen.has(m)) stack.push(m); }
    const fbId = `fb-${members.sort()[0]}`;
    for (const m of members) comp.set(m, fbId);
  }
  return items.map(i => { const fb = comp.get(i.id); return fb ? { ...i, flowboardId: fb } : (i.flowboardId ? { ...i, flowboardId: undefined } : i); });
}


// Extract plain text from any workspace item for Q to read.
function wsItemText(item: WorkspaceItem): string {
  if (item.kind === 'note') return (item.noteHtml ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (item.kind === 'list') return (item.listItems ?? []).map(l => l.text).filter(Boolean).join('; ');
  if (item.kind === 'todo') return (item.todos ?? []).map(t => t.text + (t.subtasks.length ? ` (${t.subtasks.map(s => s.text).filter(Boolean).join(', ')})` : '')).filter(Boolean).join('; ');
  return '';
}

// Content-aware action items: scan the item's text for app-relevant intents and
// propose concrete next steps that use real app features (leave, calendar, docs, 1:1s).
function wsActionItems(item: WorkspaceItem): { text: string; action?: QMsg['action'] }[] {
  const t = wsItemText(item).toLowerCase();
  const out: { text: string; action?: QMsg['action'] }[] = [];
  if (/\bleave|time off|vacation|holiday|pto\b/.test(t))
    out.push({ text: 'This mentions time off — I can open the leave planner to book it.', action: { label: 'Open leave planner', kind: 'nav', arg: 'calendar' } });
  if (/\bmeet|1:1|one-on-one|sync|call|catch up|review\b/.test(t))
    out.push({ text: 'There\u2019s a meeting or 1:1 here — I can set up the agenda in Growth.', action: { label: 'Open Growth · 1:1s', kind: 'nav', arg: 'growth' } });
  if (/\bpolicy|document|handbook|sign|acknowledge|compliance\b/.test(t))
    out.push({ text: 'This references a document or policy — I can take you to Documents.', action: { label: 'Open Documents', kind: 'nav', arg: 'documents' } });
  if (/\bpay|salary|comp|payslip|bonus|raise\b/.test(t))
    out.push({ text: 'There\u2019s a pay or compensation item — I can open Payroll.', action: { label: 'Open Payroll', kind: 'nav', arg: 'payroll' } });
  if (/\bdeadline|due|by (mon|tue|wed|thu|fri|sat|sun|tomorrow|next)|\burgent\b/.test(t))
    out.push({ text: 'I spotted a deadline — consider adding it to a to-do with a date so it resurfaces.' });
  return out;
}
const initial: State = {
  lens: 'employee', region: 'home', overlay: null, docView: null,
  role: (typeof window !== 'undefined' && (localStorage.getItem('q_role') as Persona)) || 'hr',
  availableLenses: lensesFor((typeof window !== 'undefined' && (localStorage.getItem('q_role') as Persona)) || 'hr'),
  people: PEOPLE, leaves: LEAVES, payslips: PAYSLIPS, documents: DOCUMENTS, leaveTypes: INITIAL_LEAVE_TYPES,
  cues: CUES, toasts: [],
  entities: ENTITIES, activity: [],
  approvalDelegate: null,
  showTour: (typeof window !== 'undefined' && !localStorage.getItem('qbx_onboarded_v1')) || false,
  showLegend: false,
  onboardingTasks: ONBOARD_TASKS, onboardingBuddy: ONBOARD_BUDDY, candidates: ONBOARDING, leavers: OFFBOARDING,
  goals: GOALS, oneOnOnes: ONE_ON_ONES, reviews: REVIEWS,
  survey: { question: 'How has your week been?', count: 42, sum: 155, history: [3.4, 3.6, 3.5, 3.7, 3.9, 3.7], themes: ['Workload spikes before releases', 'Recognition is landing well', 'Wants clearer career paths'] },
  comp: { budget: COMP_BUDGET, plan: {}, status: 'draft' }, coverage: {},
  att: INITIAL_ATTENDANCE,
  peeledId: null, selection: [], dragging: false, qHover: 'none',
  highlight: null, intentEcho: null,
  qOpen: false, qLog: [], qMood: 'idle',
  sim: null,
  nonce: 0,
  hidden: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_closed_spheres') || 'null')) || [],
  floating: {},
  vibeOpen: false,
  vibeApps: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_vibeapps') || 'null')) || [],
  homeView: 'signal',
  wsItems: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_wsitems') || 'null')) || [],
  wsConnectors: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_wsconn') || 'null')) || [],
  wsZ: 10,
  wsBoards: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_wsboards') || 'null')) || {},
  sharedTools: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_sharedtools') || 'null')) || [],
  sharedHidden: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_sharedhidden') || 'null')) || [],
  showPay: false,
  holidays: INITIAL_HOLIDAYS,
  vibePinned: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_vibepins') || 'null')) || [],
  vibeInsights: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_vibeins') || 'null')) || [],
  vibeChat: [],
  canvasHistory: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_canvashist') || 'null')) || [],
  nowBoard: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('q_nowboard') || 'null')) || [],
  wallpaper: (typeof window !== 'undefined' && localStorage.getItem('q_wallpaper')) || 'none',
  avatarSeed: (typeof window !== 'undefined' && localStorage.getItem('q_avatar')) || null,
  motionOff: (typeof window !== 'undefined' && localStorage.getItem('q_motionoff') === '1') || false,
  plain: false,
  reimbursements: REIMBURSEMENTS,
  assets: ASSETS,
  synth: [],
  pulses: [],
  soundOn: true,
  panelLeft: false,
  panelRight: false,
};

let uid = 0;
const mk = (message: string, tone: Toast['tone'] = 'ok'): Toast => ({ id: `t${++uid}`, message, tone });
const push = (a: Toast[], m: string, tone: Toast['tone']) => [...a.slice(-3), mk(m, tone)];

const MON3 = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function parseDates(s: string): { start: string; end: string; days: number } | null {
  let m = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:\s*(?:[-\u2013\u2014]|to|until|till|through)\s*(\d{1,2}))?/i);
  if (m) { const mon = MONTHS[MON3.indexOf(m[1].slice(0, 3).toLowerCase())]; const d1 = +m[2]; const d2 = m[3] ? +m[3] : d1; return { start: `${mon} ${d1}`, end: `${mon} ${d2}`, days: Math.max(1, d2 - d1 + 1) }; }
  m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if (m) { const mon = MONTHS[MON3.indexOf(m[2].slice(0, 3).toLowerCase())]; return { start: `${mon} ${+m[1]}`, end: `${mon} ${+m[1]}`, days: 1 }; }
  if (/tomorrow/.test(s)) return { start: `${MONTHS[NOW.m]} ${NOW.d + 1}`, end: `${MONTHS[NOW.m]} ${NOW.d + 1}`, days: 1 };
  if (/today/.test(s)) return { start: `${MONTHS[NOW.m]} ${NOW.d}`, end: `${MONTHS[NOW.m]} ${NOW.d}`, days: 1 };
  return null;
}

// Public entry — enforces lens scope. answerRaw may propose a lens switch;
// we only honour it when the user explicitly asked to switch lenses. Any other
// cross-lens result is converted to an out-of-scope reply, so nothing spills
// between My World / My Team / The Org.
export function answer(text: string, state?: State): { reply: QMsg; region?: Region; lens?: Persona; highlight?: Highlight; board?: { kind: 'chart'; ref: string } } {
  const r = answerRaw(text, state);
  if (!state) return r;
  const cur = state.lens;
  const explicitSwitch = /\b(switch|change|go)\b.{0,16}\b(lens|view|mode|world|team|org|manager|employee|hr)\b|\bas (an? )?(employee|manager|hr)\b/i.test(text);
  if (r.lens && r.lens !== cur && !explicitSwitch) {
    const lensName: Record<Persona, string> = { employee: 'My World', manager: 'My Team', hr: 'The Org' };
    const canAccess = (state.availableLenses ?? ['employee', 'manager', 'hr']).includes(r.lens);
    const text = canAccess
      ? `That lives in ${lensName[r.lens]}, which is a different lens from ${lensName[cur]}. I keep each lens separate — switch to ${lensName[r.lens]} from the top bar (or press ${r.lens === 'employee' ? '1' : r.lens === 'manager' ? '2' : '3'}) and ask me again there.`
      : `That lives in ${lensName[r.lens]}, which your role doesn't have access to. I keep each lens separate and only surface what you're cleared to see.`;
    return { reply: { id: `q${++uid}`, role: 'q', text } };
  }
  return r;
}

function answerRaw(text: string, state?: State): { reply: QMsg; region?: Region; lens?: Persona; highlight?: Highlight; board?: { kind: 'chart'; ref: string } } {
  // qbrain first pass: typo-correct against the domain lexicon + people names, then try the NLU intent table.
  const fixed = fuzzyFix(text, (state?.people ?? []).flatMap(p => p.name.split(' ')));
  if (state) { const smart = understand(fixed, state); if (smart) return smart; }
  const s = fixed.toLowerCase(); const id = `q${++uid}`;
  // Reimbursements, assets and salary slips — keep Q in step with the payroll
  // and documents surfaces so what the UI can do, Q can also answer for.
  if (state) {
    if (/(reimburse|claim|expense|receipt)/.test(s)) {
      const rs = state.reimbursements;
      const pending = rs.filter(r => r.status === 'submitted');
      const paid = rs.filter(r => r.status === 'paid' || r.status === 'approved');
      const total = pending.reduce((n, r) => n + r.amount, 0);
      const text = rs.length === 0
        ? 'You have no reimbursement claims on record. You can raise one from Payroll → Reimbursements.'
        : `You have ${rs.length} claim${rs.length > 1 ? 's' : ''}: ${pending.length} awaiting action${total ? ` (₹${total.toLocaleString('en-IN')})` : ''}, ${paid.length} approved or paid. Raise a new one from Payroll → Reimbursements; a receipt is required.`;
      return { region: 'payroll', reply: { id, role: 'q', text, action: { label: 'Open payroll', kind: 'region', arg: 'payroll' } } };
    }
    if (/(asset|laptop|macbook|device|badge|monitor|hardware issued|equipment)/.test(s)) {
      const as = state.assets;
      const text = as.length === 0
        ? 'Nothing is currently allocated to you.'
        : `You have ${as.length} asset${as.length > 1 ? 's' : ''} allocated: ${as.map(a => a.name).join(', ')}. Serials and assignment dates are in Documents → Assets, and you can download the register there.`;
      return { region: 'documents', reply: { id, role: 'q', text, action: { label: 'Open documents', kind: 'region', arg: 'documents' } } };
    }
    if (/(payslip|salary slip|pay slip|download.*(slip|payslip)|slip.*download)/.test(s)) {
      const ps = state.payslips;
      const text = `Your last ${ps.length} slips are in Payroll → Salary slips (${ps.map(p => p.month).join(', ')}). Each row has a download button. Amounts stay masked until you reveal them.`;
      return { region: 'payroll', reply: { id, role: 'q', text, action: { label: 'Open payroll', kind: 'region', arg: 'payroll' } } };
    }
  }
  // Any document the current user can actually see is fully interactable in this lens.
  // If the query looks like it references such a document (by title words) and asks to
  // read/summarize/explain it, answer here — before lens-specific matchers can claim it.
  {
    const me = (state?.people ?? []).find(p => p.id === ME_ID);
    const lens = state?.lens ?? 'employee';
    const visibleDocs = (state?.entities ?? []).filter(e => e.status === 'published' && e.type === 'document' && (
      lens === 'hr' ? true
      : lens === 'manager' ? (e.audience.scope === 'org' || (e.audience.scope === 'team' && e.audience.targetId === 'm1') || e.authorId === 'm1')
      : (e.audience.scope === 'org' || (e.audience.scope === 'team' && me?.managerId === e.audience.targetId) || (e.audience.scope === 'person' && e.audience.targetId === ME_ID))
    ));
    const asksAboutDoc = /(summari|explain|what does|what.s in|tell me about|read|open|cover|about the|the .* (doc|document|policy|guide|handbook)|on-?call)/.test(s);
    if (visibleDocs.length && asksAboutDoc) {
      // match on distinctive title words (len>3), requiring at least one title-word hit
      const titleHit = visibleDocs.find(e => { const tw = e.title.toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 3); return tw.some(x => s.includes(x)); });
      if (titleHit) {
        const needAck = visibleDocs.filter(e => e.requiresAck && !(e.ackedBy ?? []).includes(ME_ID));
        const ackNote = needAck.length ? ` (${needAck.length} shared ${needAck.length > 1 ? 'documents' : 'document'} still ${needAck.length > 1 ? 'need' : 'needs'} your acknowledgment.)` : '';
        return { region: 'documents', reply: { id, role: 'q', text: `From “${titleHit.title}” (${titleHit.authorName}, v${titleHit.version}): ${titleHit.body}${ackNote}`, action: { label: 'Open documents', kind: 'region', arg: 'documents' } } };
      }
    }
  }
  // Phase 6.2 — add a viz card to the current lens's board (RBAC-scoped)
  {
    const wantsBoard = /\bboard\b/.test(s);
    const addVerb = /\b(add|put|pin|drop|place|stick)\b/.test(s);
    const lens = state?.lens ?? 'employee';
    let hit: { ref: string; label: string; roles: Persona[] } | undefined;
    if (/\bhours\b|hours worked|my time\b/.test(s)) hit = { ref: 'myHours', label: 'My hours', roles: ['employee'] };
    else if (/leave|time.?off|holiday|pto/.test(s)) hit = { ref: 'myLeave', label: 'My leave', roles: ['employee'] };
    else if (/\bgoal|okr|objective/.test(s)) hit = { ref: 'myGoals', label: 'My goals', roles: ['employee'] };
    else if (/payslip|my pay|take.?home|net pay|my salary/.test(s)) hit = { ref: 'myPay', label: 'My pay', roles: ['employee'] };
    else if (/head ?count/.test(s)) hit = { ref: 'headcount', label: 'Headcount', roles: ['manager', 'hr'] };
    else if (/attrition trend|turnover|churn/.test(s)) hit = { ref: 'attrition', label: 'Attrition trend', roles: ['manager', 'hr'] };
    else if (/heat ?map|engagement grid/.test(s)) hit = { ref: 'heatmap', label: 'Engagement heatmap', roles: ['manager', 'hr'] };
    else if (/leaderboard|recognition rank/.test(s)) hit = { ref: 'leaderboard', label: 'Recognition leaderboard', roles: ['manager', 'hr'] };
    else if (/hiring funnel|\bfunnel\b/.test(s)) hit = { ref: 'funnel', label: 'Hiring funnel', roles: ['manager', 'hr'] };
    else if (/band ladder|comp band|pay band/.test(s)) hit = { ref: 'bandladder', label: 'Comp band ladder', roles: ['manager', 'hr'] };
    else if (/attendance/.test(s)) hit = { ref: 'attendance', label: 'Attendance', roles: ['manager', 'hr'] };
    else if (/workload|capacity|utili[sz]ation/.test(s)) hit = { ref: 'workload', label: 'Workload', roles: ['manager', 'hr'] };
    else if (/\bcomp\b|compensation|salary|pay band/.test(s)) hit = { ref: 'comp', label: 'Compensation', roles: ['manager', 'hr'] };
    else if (/retention|flight risk/.test(s)) hit = { ref: 'retention', label: 'Retention', roles: ['manager'] };
    if ((wantsBoard || addVerb) && hit) {
      if (!hit.roles.includes(lens)) return { reply: { id, role: 'q', text: `${hit.label} is a ${hit.roles.join('/')} view \u2014 it isn\u2019t available on your board.` } };
      return { region: 'home', board: { kind: 'chart', ref: hit.ref }, reply: { id, role: 'q', text: `Done \u2014 I\u2019ve added ${hit.label} to your board.` } };
    }
    if (wantsBoard && !hit) {
      const opts = lens === 'employee' ? 'your hours or leave' : lens === 'manager' ? 'attendance, workload, compensation or retention' : 'attendance, compensation or workload';
      return { region: 'home', reply: { id, role: 'q', text: `What should I add to your board? Try \u201cadd ${lens === 'employee' ? 'my hours' : 'attendance'} to my board\u201d. Available: ${opts}.` } };
    }
  }
  // ---- direct prompt-to-action (typed commands, not in the suggestion list) ----
  // World · apply/book leave with a date
  if (/\b(apply|applying|book|take|request|file|schedule|plan)\b[^.]{0,20}\b(leave|day ?off|days ?off|time ?off|holiday|vacation|pto|off)\b/.test(s) || /\b(leave|day off|time off)\b[^.]{0,10}\bon\b/.test(s)) {
    const dt = parseDates(s); const kind = /sick/.test(s) ? 'sick' : 'casual';
    if (dt) { const range = dt.start + (dt.end !== dt.start ? ` \u2013 ${dt.end}` : ''); return { lens: 'employee', region: 'calendar', highlight: 'leave', reply: { id, role: 'q', text: `I\u2019ve drafted ${dt.days} day${dt.days > 1 ? 's' : ''} of ${kind} leave, ${range}. It fits team coverage \u2014 confirm to send to Marcus.`, action: { label: `Apply leave \u00b7 ${range}`, kind: 'applyLeaveOn', arg: JSON.stringify({ kind, start: dt.start, end: dt.end, days: dt.days }) } } }; }
    return { lens: 'employee', region: 'calendar', reply: { id, role: 'q', text: 'Happy to. Which date? For example \u201capply leave on July 15\u201d or \u201cbook leave Aug 3\u20135\u201d.' } };
  }
  // World · clock in / out / break
  if (/\bclock ?in\b|\bstart (my )?day\b|\bi\u2019?m (here|in)\b/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'Ready when you are \u2014 I\u2019ll start today\u2019s timer.', action: { label: 'Clock in now', kind: 'clockIn' } } };
  if (/\bclock ?out\b|\bend (my )?day\b|\bsign off\b|\blog ?off\b/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'I\u2019ll close out the day and stop the timer.', action: { label: 'Clock out', kind: 'clockOut' } } };
  if (/\btake a break\b|\bstart[^.]{0,8}break\b|\bgoing for (a )?(coffee|lunch)\b/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'Pausing the timer for your break.', action: { label: 'Start break', kind: 'break' } } };
  // World · sign documents / show payslip
  if (/\bsign\b[^.]{0,16}\b(doc|document|policy|handbook)\b|\backnowledge\b[^.]{0,16}\b(doc|policy|handbook)\b/.test(s)) return { lens: 'employee', region: 'documents', reply: { id, role: 'q', text: 'Two policies need your acknowledgment, including Handbook v4.0.', action: { label: 'Open documents to sign', kind: 'region', arg: 'documents' } } };
  if (/\b(show|open|get|see|my)\b[^.]{0,12}\bpayslip\b|\bsalary slip\b|\blatest pay\b/.test(s)) return { lens: 'employee', region: 'payroll', reply: { id, role: 'q', text: 'Opening your latest payslip.', action: { label: 'Open payslip', kind: 'region', arg: 'payroll' } } };
  // Team · approve a named person
  {
    const nm = s.match(/\bapprove\b\s+([a-z]+)(?:\u2019?s)?\b/);
    if (nm && !/\ball\b/.test(s)) {
      const person = (state?.people ?? []).find(p => p.name.toLowerCase().split(' ').some(w => w.startsWith(nm[1])));
      const lv = person ? (state?.leaves ?? []).find(l => l.personId === person.id && l.status === 'pending') : undefined;
      if (person && lv) { const fn = person.name.split(' ')[0]; return { lens: 'manager', region: 'approvals', reply: { id, role: 'q', text: `Approving ${fn}\u2019s pending leave (${lv.startDate}${lv.endDate !== lv.startDate ? `\u2013${lv.endDate}` : ''}).`, action: { label: `Approve ${fn}\u2019s leave`, kind: 'approveOne', arg: lv.id } } }; }
    }
  }
  // Team · nudge overdue timesheets
  if (/\bnudge\b|\bremind\b[^.]{0,18}\b(timesheet|submit|overdue|team|report)\b/.test(s)) return { lens: 'manager', region: 'approvals', reply: { id, role: 'q', text: 'I\u2019ll nudge everyone with an overdue timesheet.', action: { label: 'Nudge overdue (3)', kind: 'nudge' } } };
  // Team · simulate a retention move (optionally for a named person)
  if (/\bsimulate\b|\bretention move\b|\bwhat if.*(bonus|raise|retention)\b/.test(s)) {
    const nm = s.match(/\bfor\s+([a-z]+)\b/); const person = (nm && (state?.people ?? []).find(p => p.name.toLowerCase().split(' ').some(w => w.startsWith(nm[1])))) || (state?.people ?? []).find(p => p.status === 'flight_risk');
    if (person) { const fn = person.name.split(' ')[0]; return { lens: 'manager', region: 'team', highlight: 'risk', reply: { id, role: 'q', text: `Simulating a retention move for ${fn} \u2014 a spot bonus drops the risk materially.`, action: { label: `Simulate for ${fn}`, kind: 'sim', arg: person.id } } }; }
  }
  if (/(approve all|bulk|all pending)/.test(s)) return { lens: 'manager', region: 'approvals', reply: { id, role: 'q', text: 'I can clear the pending queue in one move — one breaches SLA in 2h.', action: { label: 'Approve all pending', kind: 'approveAll' } } };
  if (/(availability|matrix|who.?s (in|out|free)|capacity calendar)/.test(s)) return { lens: 'manager', region: 'approvals', reply: { id, role: 'q', text: "Here's the team availability matrix for the next two weeks.", action: { label: 'Open availability matrix', kind: 'matrix' } } };
  if (/(attendance|trend|consistency)/.test(s)) return { lens: 'manager', region: 'analytics', highlight: 'risk', reply: { id, role: 'q', text: "Sarah's 8-week attendance slid from 92% to 71% — the strongest signal in her flight-risk score.", viz: 'attendance', vizTarget: 'p2' } };
  if (/can we afford|afford .*(engineer|hire|head)|headcount|extra (hire|role)|budget for/.test(s)) return { lens: 'manager', region: 'analytics', reply: { id, role: 'q', text: 'On the current run-rate you can afford 2 more engineers this quarter within team budget; a 3rd would need about ₹6L reallocated from the contractor line.', viz: 'comp' } };
  // Phase 4 — self-review draft (employee)
  if (/(draft|write|help me with).{0,16}self.?review/.test(s)) {
    const top = (state?.goals ?? []).find(g => g.owner === ME_ID);
    return { lens: 'employee', region: 'growth', reply: { id, role: 'q', text: `Here\u2019s a starting point you can edit below: \u201cThis quarter I focused on ${top ? top.title.toLowerCase() : 'my goals'}, reaching ${top ? top.progress : 0}%. I grew in research rigour and cross-team collaboration; next quarter I\u2019d like more scope on strategy.\u201d` } };
  }
  // Phase 4 — employee 1:1 prep with Marcus
  if ((/(prep|brief|talking points).{0,20}(1:1|one.?on.?one)/.test(s) && /marcus|my /.test(s)) || /my (next )?1:1/.test(s)) {
    const oo = (state?.oneOnOnes ?? []).find(o => o.personId === ME_ID);
    const g = (state?.goals ?? []).find(x => x.owner === ME_ID);
    const open = oo?.actions.find(a => !a.done)?.text;
    return { lens: 'employee', region: 'growth', reply: { id, role: 'q', text: oo ? `For your 1:1 with Marcus (${oo.scheduledFor}): lead with progress on ${g ? g.title.toLowerCase() : 'your goals'}, flag the repository v2 timeline risk, and raise your path to Staff.${open ? ` Open action to close: ${open}.` : ''}` : 'Once a 1:1 is scheduled I\u2019ll prep a brief from your goals and recent work.' } };
  }
  // Phase 4 — goals (team roll-up or personal)
  if (/(goal|okr|objective|how am i (doing|tracking)|on track|tracking against)/.test(s)) {
    const mine = (state?.goals ?? []).filter(g => g.owner === ME_ID && !g.archived);
    const team = (state?.goals ?? []).filter(g => !g.parentId && !g.archived);
    if (/team|reports|everyone|cascade|my team/.test(s) && team.length) {
      const g = team[0]; const kids = (state?.goals ?? []).filter(k => k.parentId === g.id); const roll = kids.length ? Math.round(kids.reduce((a, k) => a + k.progress, 0) / kids.length) : g.progress;
      const risk = kids.filter(k => k.status === 'at_risk').map(k => (state?.people ?? []).find(p => p.id === k.owner)?.name.split(' ')[0]).filter(Boolean);
      return { lens: 'manager', region: 'growth', reply: { id, role: 'q', text: `Team goal \u201c${g.title}\u201d sits at ${roll}% roll-up.${risk.length ? ` At risk: ${risk.join(', ')}.` : ' Everyone is on track.'}` } };
    }
    if (mine.length) { const avg = Math.round(mine.reduce((a, g) => a + g.progress, 0) / mine.length); const risk = mine.filter(g => g.status === 'at_risk'); return { lens: 'employee', region: 'growth', reply: { id, role: 'q', text: `You have ${mine.length} goals this cycle, averaging ${avg}%.${risk.length ? ` \u201c${risk[0].title}\u201d is at risk (${risk[0].progress}%, due ${risk[0].dueOn}).` : ' All tracking well.'}`, action: { label: 'Open growth', kind: 'region', arg: 'growth' } } }; }
  }
  // Phase 6.2 — compensation planning
  if (/(plan|planning|allocate|budget|merit).{0,20}(comp|compensation|raise|pay|salary)|comp(ensation)? (plan|planning|budget)|who.{0,10}below band/.test(s)) {
    return { lens: 'manager', region: 'planning', reply: { id, role: 'q', text: 'Your merit budget is \u20b96.0L. Sarah is the one to prioritise — she sits below band, which is feeding her flight-risk score. Allocate raises here; anything above a band ceiling and the whole plan routes to HR as a draft, never applied directly.' } };
  }
  // Phase 6.2 — coverage / delegation
  if (/(cover|coverage|who.{0,10}cover|delegat|backfill|out of office|on leave).{0,20}(leave|out|away|absence)?|leave coverage|coverage gap/.test(s)) {
    const un = COVERAGE.filter(c => !state?.coverage[c.id]).length;
    return { lens: 'manager', region: 'planning', reply: { id, role: 'q', text: `${un} of ${COVERAGE.length} upcoming leave windows are uncovered. Elena is out now — David is the natural cover for the AI-features review. I can auto-assign all three from my suggestions; you keep the final say.` } };
  }
  // Phase 6 — pulse themes summary
  if (/pulse|\bsurvey\b|morale|sentiment|team themes|pulse themes/.test(s)) {
    const p = state?.survey; if (p) { const avg = (p.sum / p.count).toFixed(1); return { lens: state && state.lens !== 'employee' ? state.lens : 'manager', region: 'analytics', reply: { id, role: 'q', text: `Team pulse is ${avg}/5 across ${p.count} responses, up from ${p.history[0].toFixed(1)} six weeks ago. The themes I'm hearing: ${p.themes.join('; ')}. Recognition is a bright spot; workload around releases and career clarity are the two to act on.` } }; }
  }
  // Phase 4 — review cycle status (manager)
  if (/(review cycle|self.?reviews?|where.*review|outstanding review)/.test(s)) {
    const rs = state?.reviews ?? []; const inCount = rs.filter(r => r.status !== 'not_started').length;
    const out = rs.filter(r => r.status === 'not_started').map(r => (state?.people ?? []).find(p => p.id === r.personId)?.name.split(' ')[0]).filter(Boolean);
    return { lens: 'manager', region: 'growth', reply: { id, role: 'q', text: `Q2 cycle: ${inCount} of ${rs.length} self-reviews in.${out.length ? ` Outstanding: ${out.join(', ')}.` : ' All in.'}`, action: out.length ? { label: 'Open reviews', kind: 'region', arg: 'growth' } : null } };
  }
    if (/(prep|brief).*(1:1|one.?on.?one|review)|1:1 with|review prep|talking points/.test(s)) return { lens: 'manager', region: 'growth', reply: { id, role: 'q', text: 'For your 1:1 with Sarah: strengths are delivery quality and mentoring; watch-outs are attendance (down 22%) and a comp gap she may raise. She rates her own impact higher than the last review did — worth an alignment conversation.' } };
  if (/(comp|salary|distribution|band|equity)/.test(s)) return { lens: 'hr', region: 'analytics', reply: { id, role: 'q', text: '18% of the team sits below band — Sarah among them. Closing her gap costs ~₹2.1L/yr.', viz: 'comp' } };
  if (/(workload|capacity|busy|overload)/.test(s)) return { lens: 'manager', region: 'analytics', reply: { id, role: 'q', text: 'Sarah and Marcus carry the heaviest weeks. Priya has slack Thu–Fri to rebalance.', viz: 'workload' } };
  if (/(risk|flight|attrition|retention|sarah)/.test(s)) return { lens: 'manager', region: 'team', highlight: 'risk', reply: { id, role: 'q', text: 'Sarah Jenkins is the one elevated risk (0.78). Want me to simulate a retention move?', viz: 'retention', vizTarget: 'p2', action: { label: 'Simulate a retention bonus', kind: 'sim', arg: 'p2' }, rationale: {
    why: 'Sarah scores highest on the retention-risk model — attendance and engagement have declined together, the pattern that most often precedes an exit.',
    whyNow: 'Her risk rose to 0.78 as attendance fell 22% over six weeks; acting before a resignation is far cheaper than backfilling a Principal Architect.',
    whyNot: 'A high score isn\u2019t a decision — it points to a conversation and, if warranted, a targeted move. It can be wrong.',
    confidence: 'high',
    evidence: ['Risk score 0.78 (next highest 0.31)', 'Attendance ↓22% over six weeks', 'Backfill cost ~6\u20139 months of ramp'],
  } } };
  if (/(reconcil|payroll chang|pay chang|why did (payroll|pay)|run.?over.?run|vs last (run|month).*(pay|payroll)|changed since last (run|month))/.test(s)) return { lens: 'hr', region: 'payroll', reply: { id, role: 'q', text: 'Opening the reconciliation view. Five lines moved vs June: three merit increases, one bonus that isn\u2019t repeating, one leave-without-pay reversal, plus one new joiner on their first run. Everyone else matches last month — every delta traces to a reason.', action: { label: 'Open reconciliation', kind: 'region', arg: 'payroll' }, rationale: {
    why: 'I diffed this run against the previous one line by line and grouped the movers by cause.',
    whyNow: 'It\u2019s the pre-release check — you approve knowing exactly what changed and why.',
    confidence: 'high',
    evidence: ['3 merit increases', '1 non-repeating bonus', '1 LWP reversal', '1 new joiner (first run)'],
  } } };
  if (/(payroll|river|pay run|tds|tax)/.test(s)) return { lens: 'hr', region: 'payroll', highlight: 'payroll', reply: { id, role: 'q', text: "June is pooling on one node — Alex's relocation changed the state tax code. Needs a human sign-off.", action: { label: 'Open the pooled node', kind: 'region', arg: 'payroll' }, rationale: {
    why: 'One payslip was held back automatically because its computed withholding diverged from the expected band — the safeguard that stops a wrong amount reaching a bank.',
    whyNow: 'It surfaced this run because the state tax code changed mid-cycle after a Rajasthan→Karnataka relocation, so the delta only appeared now.',
    whyNot: 'Q recomputed the TDS but will not release on its own — payroll corrections always require a human sign-off.',
    confidence: 'high',
    evidence: ['1 of the run\u2019s payslips flagged', 'Withholding outside expected band', 'Trigger: mid-cycle state tax-code change'],
  } } };
  if (/(reimburs|expense|claim|spend)/.test(s)) return { lens: 'employee', region: 'payroll', reply: { id, role: 'q', text: 'Your June reimbursement of ₹4,200 is in review (submitted 2 days ago). Separately, ₹8,600 of older claims expire in 24 days — want me to draft those?', action: { label: 'Open payroll', kind: 'region', arg: 'payroll' } } };
  if (/(lapse|expire|carry ?forward|encash|will i lose)/.test(s)) return { lens: 'employee', region: 'calendar', highlight: 'leave', reply: { id, role: 'q', text: '4 of your 14 earned days will lapse on Dec 31 if unused. I can block two long weekends in Sep–Oct so none go to waste.', action: { label: 'Plan time off', kind: 'half' } } };
  if (/(wfh|work from home|work (remotely|from)|remote|hybrid)/.test(s)) return { lens: 'employee', region: 'calendar', reply: { id, role: 'q', text: 'Checked it against team coverage — no conflicts, and it stays within the 2-day hybrid charter. Want me to file the request with Marcus for you?', action: { label: 'File the request with Marcus', kind: 'fileLeave', arg: 'wfh' } } };
  if (state?.lens !== 'employee' && /(nudge|remind|chase|follow up).{0,30}(ack|acknowledg|sign|non-?ack|haven.t|everyone|those who|people who|pending)|(ack|acknowledg).{0,20}(nudge|remind|chase|reminder)|who hasn.t (ack|acknowledg|signed)/.test(s)) {
    const docs = (state?.entities ?? []).filter(e => e.status === 'published' && e.requiresAck);
    const totalPending = docs.reduce((sum, e) => { const exp = e.audience.scope === 'org' ? (state?.people.length ?? 0) : e.audience.scope === 'team' ? (state?.people.filter(p => p.managerId === e.audience.targetId).length ?? 0) : 1; return sum + Math.max(0, exp - (e.ackedBy ?? []).length); }, 0);
    if (!docs.length) return { lens: 'hr', region: 'documents', reply: { id, role: 'q', text: 'Nothing is awaiting acknowledgment right now — no published document requires it.', action: { label: 'Open documents', kind: 'region', arg: 'documents' } } };
    return { lens: 'hr', region: 'documents', reply: { id, role: 'q', text: `${docs.length} published ${docs.length === 1 ? 'document requires' : 'documents require'} acknowledgment, with about ${totalPending} ${totalPending === 1 ? 'person' : 'people'} still pending across them. I can nudge everyone who hasn't acknowledged — you stay in the loop and can see the count drop as they respond.`, action: { label: `Nudge all ${totalPending} pending`, kind: 'nudgeAll' } } };
  }
  if (/(policy|handbook|guideline|hybrid.?work|leave policy|expense|on-?call|acknowledge|what does .* (say|cover)|rules? (on|for)|am i allowed)/.test(s)) {
    const me = (state?.people ?? []).find(p => p.id === ME_ID);
    const pubs = (state?.entities ?? []).filter(e => e.status === 'published' && e.type === 'document' && (e.audience.scope === 'org' || (e.audience.scope === 'team' && me?.managerId === e.audience.targetId) || (e.audience.scope === 'person' && e.audience.targetId === ME_ID)));
    if (pubs.length) {
      const words = s.split(/\s+/).filter(x => x.length > 3);
      const hit = pubs.find(e => words.some(x => e.title.toLowerCase().includes(x) || e.body.toLowerCase().includes(x))) ?? pubs[0];
      const needAck = pubs.filter(e => e.requiresAck && !(e.ackedBy ?? []).includes(ME_ID));
      const ackNote = needAck.length ? ` By the way, ${needAck.length} shared ${needAck.length > 1 ? 'documents' : 'document'} still ${needAck.length > 1 ? 'need' : 'needs'} your acknowledgment.` : '';
      return { region: 'documents', reply: { id, role: 'q', text: `From “${hit.title}” (${hit.authorName}, v${hit.version}): ${hit.body}${ackNote}`, action: needAck.length ? { label: `Acknowledge “${needAck[0].title}”`, kind: 'ackEntity', arg: needAck[0].id } : { label: 'Open documents', kind: 'region', arg: 'documents' } } };
    }
  }
    if (/(summari|need.*action|pending|to.?do|waiting on me|my tasks)/.test(s)) return { lens: 'employee', region: 'documents', reply: { id, role: 'q', text: 'Four things are waiting on you: acknowledge Handbook v4.0 (today), submit June reimbursement ₹4,200 (2 days), declare investments (5 days left), and finish Security Awareness (1 week).', action: { label: 'Acknowledge documents', kind: 'region', arg: 'documents' } } };
  if (/(kudos|recogni|appreciat|shout.?out|praise)/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'Priya appreciated your research readout in the design review. You\u2019ve received 3 kudos this quarter and given 1 — want to recognise a teammate?' } };
  if (state?.lens === 'employee' && /(onboard|getting started|set ?up|first week|new (here|joiner)|what should i do first|my checklist)/.test(s)) {
    const tasks = state?.onboardingTasks ?? [];
    const remaining = tasks.filter(t => !t.done);
    if (remaining.length) { const next = remaining[0]; return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: `You’ve ${tasks.length - remaining.length} of ${tasks.length} setup steps done. Next up: ${next.label.toLowerCase()}${next.hint ? ` (${next.hint})` : ''}. Your buddy is ${state?.onboardingBuddy ?? 'assigned'} if you get stuck.`, action: next.label.toLowerCase().includes('handbook') ? { label: 'Open documents', kind: 'region', arg: 'documents' } : next.label.toLowerCase().includes('payroll') ? { label: 'Open payroll', kind: 'region', arg: 'payroll' } : null } }; }
    return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'You’re all set up — every onboarding step is done. Nice work.' } };
  }
    if (/(learn|training|course|module|upskill)/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'You\u2019re 40% through Security Awareness and it\u2019s due in a week. Two modules are assigned this quarter — I can block 30 minutes on Thursday.' } };
  if (/(invest|declaration|80c|tax saving)/.test(s)) return { lens: 'employee', region: 'payroll', reply: { id, role: 'q', text: 'Your investment-declaration window closes in 5 days. Based on last year, declaring your rent and 80C could lower monthly TDS by about ₹3,100.', action: { label: 'Open payroll', kind: 'region', arg: 'payroll' } } };
  if (/(goal|okr|performance|1.?1|one.?on.?one|how am i doing|growth)/.test(s)) return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'You\u2019re tracking on goal — velocity 85, attendance 93%. One growth conversation is due this quarter; I can prep a brief for your next 1:1 with Marcus.' } };
  if (/(my (hours|attendance|time)|hours.*(worked|chart|trend|history)|worked.*hours|show me my (hours|attendance))/.test(s)) {
    const csv = 'Week,Worked,Expected\n' + MY_HOURS.map(r => `${r.w},${r.worked},${r.expected}`).join('\n');
    return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'Your worked vs expected hours over the last four weeks — 158h against a 160h expectation, so you are almost exactly on plan. Raw data is available as CSV.', viz: 'myHours', csv: { name: 'my-hours.csv', content: csv } } };
  }
  if (/(leave (taken|used|usage|history|breakdown)|how much leave have i|my leave (this year|breakdown|usage))/.test(s)) {
    const csv = 'Type,Taken,Total\n' + MY_LEAVE.map(r => `${r.type},${r.taken},${r.total}`).join('\n');
    return { lens: 'employee', region: 'home', reply: { id, role: 'q', text: 'Your leave taken this year by type — 11 days used of 30. Earned is your largest bucket. CSV below.', viz: 'myLeave', csv: { name: 'my-leave.csv', content: csv } } };
  }
  if (/(policy|entitle|accru|how (many|much).*(leave|vacation|holiday|day)|leave rule|vacation rule)/.test(s)) {
    const bal = state ? state.leaveTypes.map(t => `${t.balance} ${t.label.toLowerCase()}`).join(', ') : '14 earned, 8 sick, 6 casual, 2 RH';
    return { lens: 'employee', region: 'documents', reply: { id, role: 'q', text: `Policy: earned leave accrues at 1.5 days a month and carries forward up to 5 days — anything above lapses on Dec 31. Your live balance right now is ${bal}.`, source: { title: 'Employee Handbook v4.0', section: 'Leave & Time Off' }, action: { label: 'Open the policy', kind: 'region', arg: 'documents' } } };
  }
  if (/(leave|time off|vacation|day off|holiday)/.test(s)) return { lens: 'employee', region: 'calendar', highlight: 'leave', reply: { id, role: 'q', text: 'Opening your calendar — 14 earned, 8 sick, 6 casual, 2 RH. Friday looks clear.', action: { label: 'Take Friday as a half-day', kind: 'half' } } };
  if (/(document|policy|acknowledg|handbook|sign)/.test(s)) return { lens: 'employee', region: 'documents', reply: { id, role: 'q', text: 'Three documents need acknowledgment, including Handbook v4.0.', action: { label: 'Open documents', kind: 'region', arg: 'documents' } } };
  if (/(break|rest|lunch)/.test(s)) return { reply: { id, role: 'q', text: 'You can take a break from the clock card on your home — I’ll pause the timer and resume when you’re back.', action: { label: 'Take a break', kind: 'break' } } };
  if (/(offboard|off-board|exit|leaver|resignation|departure|who.?s leaving|last day)/.test(s)) { const ls = state?.leavers ?? []; const next = [...ls].sort((a, b) => new Date(a.lastDay + ' 2026').getTime() - new Date(b.lastDay + ' 2026').getTime())[0]; return { lens: 'hr', region: 'exit', reply: { id, role: 'q', text: ls.length ? `${ls.length} ${ls.length === 1 ? 'person is' : 'people are'} offboarding${next ? `; ${next.name.split(' ')[0]} is next, last day ${next.lastDay}, ${next.progress}% through their exit checklist` : ''}. Access stays live until handover and assets are done.` : 'No one is offboarding right now.', action: { label: 'Open offboarding', kind: 'region', arg: 'exit' } } }; }
  if (/(team|report|who)/.test(s)) return { lens: 'manager', region: 'team', reply: { id, role: 'q', text: 'Your team constellation — your direct reports, presence and risk at a glance.' } };
  if (/(?<!off)(onboard|new hire|joiner)/.test(s) && !/offboard|off-board/.test(s)) { const cs = state?.candidates ?? []; const closest = [...cs].sort((a, b) => b.progress - a.progress)[0]; const noBuddy = cs.filter(c => !c.buddy).length; return { lens: 'hr', region: 'onboarding', reply: { id, role: 'q', text: `${cs.length} joiner${cs.length === 1 ? '' : 's'} in the pipeline${closest ? `; ${closest.name.split(' ')[0]} is furthest along at ${closest.progress}% of their day-one checklist` : ''}${noBuddy ? `. ${noBuddy} still need${noBuddy === 1 ? 's' : ''} a start buddy.` : '.'}`, action: { label: 'Open onboarding', kind: 'region', arg: 'onboarding' } } }; }
  const fb = (state?.lens ?? 'employee') === 'employee'
    ? 'Try “take leave next Friday”, “show my hours”, or just type a name, policy or holiday to look it up.'
    : (state?.lens === 'manager')
      ? 'Try “what needs my attention?”, “approve Sarah’s leave”, “show team attendance”, or “auto-assign coverage”.'
      : 'Try “what needs my attention?”, “open the pay run”, “show comp distribution”, or “who is on leave?”.';
  return { reply: { id, role: 'q', text: fb } };
}

function explain(state: State, kind: string, eid: string): QMsg {
  const id = `q${++uid}`;
  if (kind === 'person') { const p = state.people.find(x => x.id === eid);
    if (!p) return { id, role: 'q', text: 'I lost that token.' };
    const risk = p.status === 'flight_risk';
    return { id, role: 'q', text: `${p.name} · ${p.role} (${p.department}). Attendance ${Math.round((p.attendance ?? 0.9) * 100)}%, velocity ${Math.round((p.velocity ?? 0.5) * 100)}. ${risk ? 'Q flags an elevated flight risk (0.78).' : p.status === 'on_leave' ? 'Currently on leave.' : 'Tracking healthy.'}`,
      viz: risk ? 'retention' : undefined, vizTarget: p.id, action: risk ? { label: 'Simulate retention', kind: 'sim', arg: p.id } : null };
  }
  if (kind === 'leave_request') { const l = state.leaves.find(x => x.id === eid);
    if (!l) return { id, role: 'q', text: 'I lost that token.' };
    return { id, role: 'q', text: `${l.personName}: ${l.days}d ${l.kind} leave, ${l.startDate}→${l.endDate}, status ${l.status}.${l.conflictWith ? ` Overlaps ${l.conflictWith}.` : ''}${l.isSlaBreached ? ' SLA breaches in ~2h.' : ''}`,
      action: l.status === 'pending' ? { label: 'Approve this leave', kind: 'approveOne', arg: l.id } : null };
  }
  if (kind === 'payslip') { const p = state.payslips.find(x => x.id === eid);
    if (!p) return { id, role: 'q', text: 'I lost that token.' };
    return { id, role: 'q', text: `${p.month} · ₹${p.amount.toLocaleString('en-IN')} · ${p.status}.${p.anomalyReason ? ' ' + p.anomalyReason : ''}`,
      action: p.status === 'pooled' ? { label: 'Approve correction', kind: 'override', arg: p.id } : null };
  }
  if (kind === 'document') { const d = state.documents.find(x => x.id === eid);
    if (!d) return { id, role: 'q', text: 'I lost that document.' };
    return { id, role: 'q', text: `“${d.title}” ${d.version} · ${d.category}. ${d.mustAck ? (d.acked ? 'Acknowledged.' : 'Acknowledgment pending.') : 'No acknowledgment required.'} Updated ${d.updated}.`,
      action: d.mustAck && !d.acked ? { label: 'Acknowledge', kind: 'ackDoc', arg: d.id } : { label: 'Open documents', kind: 'region', arg: 'documents' } };
  }
  if (kind === 'cue') {
    if (eid === 'q-insight') return { id, role: 'q', text: '4 of your 14 earned-leave days will lapse on Dec 31 if unused. I can pre-block two long weekends in Sep and Oct so none go to waste — your calendar is clear on those Fridays.', action: { label: 'Plan time off', kind: 'region', arg: 'calendar' } };
    const c = state.cues.find(x => x.id === eid);
    if (!c) return { id, role: 'q', text: 'That signal has cleared.' };
    return { id, role: 'q', text: `Live signal — ${c.message}`, action: { label: c.actionText, kind: 'cue', arg: c.id } };
  }
  if (kind === 'kpi') {
    const detail: Record<string, { t: string; v?: 'attendance' | 'comp' | 'workload' | 'retention' }> = {
      'clock-today': { t: 'Today: 3h 49m of your 8h goal, one 18-min break, clocked in 09:04 from Jaipur (inside the office geofence). One attendance regularization is awaiting your manager.' },
      'agenda': { t: "Next up — Priya's birthday tomorrow, Elena on leave 25–28 Jul, then Independence Day on Aug 15. Nothing clashes with your focus blocks this week." },
      'team-today': { t: 'Team presence: Marcus, David and Priya are in; Sarah is in (elevated flight risk); Elena is on leave until 28 Jul. 4 of 5 available today.', v: 'workload' },
      'quick-actions': { t: 'Your most-used actions: apply for leave, view your latest payslip, sign the 2 pending documents, or ask me anything.' },
      'pending': { t: 'Three items waiting on you: submit June reimbursement of ₹4,200 (2 days), declare investments before the window closes (5 days left), and finish the Security Awareness module (1 week).' },
      'kudos': { t: 'Priya appreciated your research readout in the design review. You have 3 kudos this quarter and have given 1 — want to recognise a teammate?' },
    };
    if (detail[eid]) return { id, role: 'q', text: detail[eid].t, viz: detail[eid].v };
    const m = HR_METRICS.find(x => x.label === eid);
    return { id, role: 'q', text: m ? `${m.label}: ${m.value}. ${m.tone === 'ember' ? 'Flagged — trending the wrong way; Q can break it down by team.' : 'Within expected range over the last quarter.'}` : 'Metric unavailable.',
      viz: m && m.tone === 'ember' ? 'attendance' : 'comp' };
  }
  if (kind === 'onboarding') { const o = ONBOARDING.find(x => x.id === eid);
    return { id, role: 'q', text: o ? `${o.name} — ${o.stage}, ${o.progress}% through onboarding. ${o.progress >= 90 ? 'Almost ready; assign a start buddy.' : 'On track.'}` : 'Candidate unavailable.' };
  }
  if (kind === 'chart') {
    const map: Record<string, { t: string; v: any }> = {
      attendance: { t: "Sarah's attendance slid 92% → 71% over 8 weeks — the strongest flight-risk signal.", v: 'attendance' },
      comp: { t: '18% of the team sits below band; closing the gaps is the cheapest retention lever.', v: 'comp' },
      workload: { t: 'Sarah and Marcus carry the heaviest weeks; Priya has slack to absorb more.', v: 'workload' },
    };
    const e = map[eid] ?? { t: 'A Q-generated chart.', v: null };
    return { id, role: 'q', text: e.t, viz: e.v };
  }
  if (kind === 'nav') {
    const map: Record<string, { t: string; r: Region }> = {
      leave: { t: 'You have leave balances across earned, sick, casual and RH. Friday is light.', r: 'calendar' },
      payroll: { t: 'Your latest net is ₹1.45L; June is pooled pending a tax correction.', r: 'payroll' },
      documents: { t: `${state.documents.filter(d => d.mustAck && !d.acked).length} documents still need your acknowledgment.`, r: 'documents' },
      growth: { t: 'Velocity is tracking at 85; one growth conversation is due this quarter.', r: 'home' },
      exit: { t: 'The exit track is a guarded, multi-step flow — nothing is triggered casually.', r: 'home' },
    };
    const e = map[eid] ?? { t: 'A sphere of your world.', r: 'home' as Region };
    return { id, role: 'q', text: e.t, action: { label: 'Open', kind: 'region', arg: e.r } };
  }
  if (kind === 'synth') { const t = state.synth.find(x => x.id === eid);
    if (!t) return { id, role: 'q', text: 'That result has dissolved.' };
    return { id, role: 'q', text: `${t.title} — ${t.lines.join(' ')}`, viz: t.viz, action: t.action ?? null };
  }
  return { id, role: 'q', text: 'Dropped a token, but I can’t read it.' };
}

const now = () => Date.now();
function labelOf(state: State, id: string): string {
  return state.people.find(p => p.id === id)?.name
    ?? (state.leaves.find(l => l.id === id) ? state.leaves.find(l => l.id === id)!.personName + '’s leave' : undefined)
    ?? state.payslips.find(p => p.id === id)?.month
    ?? state.documents.find(d => d.id === id)?.title
    ?? id;
}

function reducer(state: State, a: Action): State {
  switch (a.t) {
    case 'lens': return { ...state, lens: a.lens, region: 'home', overlay: null, peeledId: null, selection: [], highlight: null, intentEcho: null, panelLeft: false, panelRight: false };
    case 'region': { const home = a.region === 'home'; return { ...state, region: a.region, overlay: null, peeledId: null, panelLeft: home ? false : state.panelLeft, panelRight: home ? false : state.panelRight }; }
    case 'overlay': return { ...state, overlay: a.overlay };
    case 'peel': return { ...state, peeledId: state.peeledId === a.id ? null : a.id };
    case 'docView': return { ...state, docView: a.id };
    case 'reset': return { ...state, region: 'home', homeView: 'signal', overlay: null, peeledId: null, selection: [], highlight: null, intentEcho: null, sim: null, hidden: [], synth: [], pulses: [], floating: {}, nowBoard: [], vibeOpen: false, vibeApps: [], vibePinned: [], vibeInsights: [], vibeChat: [], qOpen: false, panelLeft: false, panelRight: false, nonce: state.nonce + 1 };

    case 'select': { const has = state.selection.includes(a.id); return { ...state, selection: has ? state.selection.filter(x => x !== a.id) : [...state.selection, a.id] }; }
    case 'clearSel': return { ...state, selection: [] };
    case 'dragging': return { ...state, dragging: a.on, qHover: a.on ? state.qHover : 'none' };
    case 'qHover': return state.qHover === a.level ? state : { ...state, qHover: a.level };

    case 'clockIn': return state.att.status !== 'out' ? state : { ...state, att: { ...state.att, status: 'in', sessionStart: now() }, toasts: push(state.toasts, 'Clocked in — have a good one', 'ok') };
    case 'clockOut': { const w = state.att.status === 'in' && state.att.sessionStart ? now() - state.att.sessionStart : 0;
      const b = state.att.status === 'break' && state.att.breakStart ? now() - state.att.breakStart : 0;
      return { ...state, att: { ...state.att, status: 'out', sessionStart: null, breakStart: null, workedMs: state.att.workedMs + w, breakMs: state.att.breakMs + b }, toasts: push(state.toasts, 'Clocked out — see you tomorrow', 'info') }; }
    case 'breakStart': { if (state.att.status !== 'in') return state; const w = state.att.sessionStart ? now() - state.att.sessionStart : 0;
      return { ...state, att: { ...state.att, status: 'break', sessionStart: null, breakStart: now(), workedMs: state.att.workedMs + w, breaks: state.att.breaks + 1 }, toasts: push(state.toasts, 'On a break — timer paused', 'info') }; }
    case 'breakEnd': { if (state.att.status !== 'break') return state; const b = state.att.breakStart ? now() - state.att.breakStart : 0;
      return { ...state, att: { ...state.att, status: 'in', breakStart: null, sessionStart: now(), breakMs: state.att.breakMs + b }, toasts: push(state.toasts, 'Welcome back — timer resumed', 'ok') }; }

    case 'approve': { const l = state.leaves.find(x => x.id === a.id); return { ...state, leaves: state.leaves.map(x => x.id === a.id ? { ...x, status: 'approved' } : x), toasts: push(state.toasts, `Approved — ${l?.personName}`, 'ok') }; }
    case 'reject': { const l = state.leaves.find(x => x.id === a.id); return { ...state, leaves: state.leaves.map(x => x.id === a.id ? { ...x, status: 'rejected' } : x), toasts: push(state.toasts, `Declined — ${l?.personName}`, 'warn') }; }
    case 'bulkApprove': { const n = state.leaves.filter(l => l.status === 'pending').length; return { ...state, leaves: state.leaves.map(l => l.status === 'pending' ? { ...l, status: 'approved' } : l), toasts: push(state.toasts, `Approved ${n} request${n === 1 ? '' : 's'}`, 'ok') }; }
    case 'hold': { const l = state.leaves.find(x => x.id === a.id); return { ...state, leaves: state.leaves.map(x => x.id === a.id ? { ...x, status: 'held' } : x), toasts: push(state.toasts, `On hold — ${l?.personName}`, 'info') }; }
    case 'resume': return { ...state, leaves: state.leaves.map(x => x.id === a.id ? { ...x, status: 'pending' } : x) };
    case 'delegate': { const p = a.id ? state.people.find(x => x.id === a.id) : null; return { ...state, approvalDelegate: a.id, toasts: push(state.toasts, a.id ? `Approvals delegated to ${p?.name?.split(' ')[0] ?? 'a colleague'} while you\u2019re away` : 'Delegation turned off', a.id ? 'ok' : 'info') }; }
    case 'approveMany': { const set = new Set(a.ids); const n = a.ids.length; return { ...state, leaves: state.leaves.map(l => set.has(l.id) ? { ...l, status: 'approved' } : l), toasts: push(state.toasts, `Approved ${n} request${n === 1 ? '' : 's'}`, 'ok') }; }
    case 'rejectMany': { const set = new Set(a.ids); const n = a.ids.length; return { ...state, leaves: state.leaves.map(l => set.has(l.id) ? { ...l, status: 'rejected' } : l), toasts: push(state.toasts, `Declined ${n} request${n === 1 ? '' : 's'}`, 'warn') }; }
    case 'tour': return { ...state, showTour: a.on };
    case 'legend': return { ...state, showLegend: a.on };
    case 'onbTask': { const t = state.onboardingTasks.find(x => x.id === a.id); const nowDone = !(t?.done); return { ...state, onboardingTasks: state.onboardingTasks.map(x => x.id === a.id ? { ...x, done: nowDone } : x), toasts: nowDone && t ? push(state.toasts, `Done — ${t.label}`, 'ok') : state.toasts }; }
    case 'goalCreate': { const g: Goal = { id: `g${++uid}`, title: a.title, owner: a.owner, progress: 0, status: 'on_track', dueOn: a.dueOn, createdBy: a.owner }; return { ...state, goals: [g, ...state.goals], activity: [{ id: `act${++uid}`, text: `Created goal “${a.title}”`, at: a.now }, ...state.activity], toasts: push(state.toasts, 'Goal created', 'ok') }; }
    case 'goalCascade': { const parent = state.goals.find(g => g.id === a.id); if (!parent) return state; const reports = state.people.filter(p => p.managerId === 'm1'); const existing = new Set(state.goals.filter(g => g.parentId === a.id).map(g => g.owner)); const kids: Goal[] = reports.filter(p => !existing.has(p.id)).map(p => ({ id: `g${++uid}`, title: parent.title, owner: p.id, progress: 0, status: 'on_track', parentId: a.id, dueOn: parent.dueOn, createdBy: 'm1' })); return { ...state, goals: [...state.goals, ...kids], toasts: push(state.toasts, `Cascaded to ${kids.length} report${kids.length === 1 ? '' : 's'}`, 'ok') }; }
    case 'goalProgress': { return { ...state, goals: state.goals.map(g => { if (g.id !== a.id) return g; const progress = Math.max(0, Math.min(100, g.progress + a.delta)); const status: Goal['status'] = progress >= 100 ? 'done' : progress < 45 ? 'at_risk' : 'on_track'; return { ...g, progress, status }; }) }; }
    case 'goalArchive': return { ...state, goals: state.goals.map(g => g.id === a.id ? { ...g, archived: true } : g), toasts: push(state.toasts, 'Goal archived', 'info') };
    case 'ooToggle': return { ...state, oneOnOnes: state.oneOnOnes.map(o => o.id === a.ooId ? { ...o, actions: o.actions.map(x => x.id === a.actionId ? { ...x, done: !x.done } : x) } : o) };
    case 'ooAddAction': { if (!a.text.trim()) return state; return { ...state, oneOnOnes: state.oneOnOnes.map(o => o.id === a.ooId ? { ...o, actions: [...o.actions, { id: `ai${++uid}`, text: a.text.trim(), done: false }] } : o) }; }
    case 'reviewSelf': return { ...state, reviews: state.reviews.map(r => r.id === a.id ? { ...r, status: 'self_submitted', self: a.text } : r), toasts: push(state.toasts, 'Self-review submitted', 'ok') };
    case 'reviewManager': return { ...state, reviews: state.reviews.map(r => r.id === a.id ? { ...r, status: 'complete', manager: a.text } : r), toasts: push(state.toasts, 'Review saved', 'ok') };
    case 'pulseSubmit': { const first = state.survey.myScore === undefined; return { ...state, survey: { ...state.survey, myScore: a.score, count: first ? state.survey.count + 1 : state.survey.count, sum: first ? state.survey.sum + a.score : state.survey.sum - (state.survey.myScore ?? 0) + a.score }, toasts: push(state.toasts, 'Thanks — your pulse is in', 'ok') }; }
    case 'compSet': { if (state.comp.status !== 'draft') return state; const plan = { ...state.comp.plan }; if (a.amount <= 0) delete plan[a.id]; else plan[a.id] = a.amount; return { ...state, comp: { ...state.comp, plan } }; }
    case 'compSubmit': { const total = Object.values(state.comp.plan).reduce((x, y) => x + y, 0); if (total === 0 || total > state.comp.budget) return state; return { ...state, comp: { ...state.comp, status: 'submitted' }, activity: [{ id: `act${++uid}`, text: `Routed a compensation plan (${Object.keys(state.comp.plan).length} people, ₹${(total / 1000).toFixed(0)}k) to HR`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity], toasts: push(state.toasts, 'Comp plan routed to HR for approval', 'ok') }; }
    case 'compApprove': return { ...state, comp: { ...state.comp, status: 'approved' }, toasts: push(state.toasts, 'Compensation plan approved', 'ok') };
    case 'compReset': return { ...state, comp: { ...state.comp, plan: {}, status: 'draft' }, toasts: push(state.toasts, 'Comp plan cleared', 'info') };
    case 'setCoverage': { const coverage = { ...state.coverage }; if (!a.personId) delete coverage[a.id]; else coverage[a.id] = a.personId; return { ...state, coverage }; }
    case 'autoCover': { const coverage = { ...state.coverage }; COVERAGE.forEach(c => { if (!coverage[c.id]) coverage[c.id] = c.suggested; }); return { ...state, coverage, toasts: push(state.toasts, 'Coverage assigned from Q suggestions', 'ok') }; }
    case 'reviewNudge': { const out = state.reviews.filter(r => r.status === 'not_started').length; return { ...state, toasts: push(state.toasts, `Nudged ${out} outstanding self-review${out === 1 ? '' : 's'}`, 'ok') }; }
    case 'assignBuddy': { const c = state.candidates.find(x => x.id === a.candidateId); const pn = state.people.find(x => x.id === a.personId)?.name; return { ...state, candidates: state.candidates.map(x => { if (x.id !== a.candidateId) return x; const checklist = x.checklist?.map(k => /buddy/i.test(k.label) ? { ...k, done: true } : k); const progress = checklist ? Math.round((checklist.filter(k => k.done).length / checklist.length) * 100) : x.progress; return { ...x, buddy: pn, checklist, progress }; }), activity: [{ id: `act${++uid}`, text: `Assigned ${pn?.split(' ')[0] ?? 'a buddy'} to ${c?.name ?? 'a joiner'}`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity], toasts: push(state.toasts, `Buddy assigned to ${c?.name?.split(' ')[0] ?? 'joiner'}`, 'ok') }; }

    case 'applyLeave': { const lt = state.leaveTypes.find(t => t.id === a.kind); if (!lt) return state;
      if (a.kind !== 'rh' && lt.balance < a.days) return { ...state, toasts: push(state.toasts, `Not enough ${lt.label} balance (${lt.balance} left)`, 'warn') };
      const reasonText = a.reason?.trim() ? a.reason.trim() : lt.label;
      const lv: LeaveToken = { id: `lnew${++uid}`, type: 'leave_request', personId: ME_ID, personName: 'Alex Mercer', kind: a.kind, mode: a.mode, startDate: a.start, endDate: a.end, days: a.days, status: 'pending', reason: reasonText };
      const convNote = a.convertedFrom ? ` (auto-converted from ${a.convertedFrom} — over the 2-day casual limit)` : '';
      const balNote = a.kind === 'rh' ? '' : '';
      return { ...state, leaves: [...state.leaves, lv], leaveTypes: state.leaveTypes.map(t => t.id === a.kind ? { ...t, balance: +(t.balance - a.days).toFixed(1) } : t), toasts: push(state.toasts, `${a.days}d ${lt.label} leave sent to Marcus${convNote}${balNote}`, a.convertedFrom ? 'info' : 'ok') }; }
    case 'addLeaveFor': { const p = state.people.find(x => x.id === a.personId); const lt = state.leaveTypes.find(t => t.id === a.kind);
      const lv: LeaveToken = { id: `lnew${++uid}`, type: 'leave_request', personId: a.personId, personName: p?.name ?? '—', kind: a.kind, mode: a.mode, startDate: a.start, endDate: a.end, days: a.days, status: 'pending', reason: lt?.label };
      return { ...state, leaves: [...state.leaves, lv], overlay: null, toasts: push(state.toasts, `Leave added for ${p?.name}`, 'ok') }; }
    case 'addType': { const idr = a.label.toLowerCase().replace(/\s+/g, '_').slice(0, 16) || `t${++uid}`;
      if (state.leaveTypes.some(t => t.id === idr)) return { ...state, overlay: null, toasts: push(state.toasts, 'That type already exists', 'warn') };
      return { ...state, leaveTypes: [...state.leaveTypes, { id: idr, label: a.label, balance: a.days }], overlay: null, toasts: push(state.toasts, `Added “${a.label}” (${a.days}d)`, 'ok') }; }

    case 'overridePayroll': return { ...state, payslips: state.payslips.map(p => p.id === a.id ? { ...p, status: 'released' } : p), cues: state.cues.filter(c => c.kind !== 'payroll'), toasts: push(state.toasts, 'Correction approved — stream resumed', 'ok') };
    case 'ackDoc': { const d = state.documents.find(x => x.id === a.id); return { ...state, documents: state.documents.map(x => x.id === a.id ? { ...x, acked: true } : x), toasts: push(state.toasts, `Acknowledged — ${d?.title}`, 'ok') }; }
    case 'dismissCue': return { ...state, cues: state.cues.filter(c => c.id !== a.id) };
    case 'entityCreate': { const e: Entity = { id: `ent-${++uid}`, type: (a.patch.type ?? 'document'), title: a.patch.title || 'Untitled', body: a.patch.body || '', category: a.patch.category ?? 'Policy', audience: a.patch.audience ?? { scope: 'team', targetId: 'm1' }, status: 'draft', authorId: a.authorId, authorName: a.authorName, version: 1, updated: a.now, requiresAck: a.patch.requiresAck ?? false, ackedBy: [] }; return { ...state, entities: [e, ...state.entities], activity: [{ id: `act${++uid}`, text: `Created draft “${e.title}”`, at: a.now }, ...state.activity] }; }
    case 'entityUpdate': return { ...state, entities: state.entities.map(x => x.id === a.id ? { ...x, ...a.patch, version: x.version + 1, updated: a.now } : x), activity: [{ id: `act${++uid}`, text: `Edited “${state.entities.find(x => x.id === a.id)?.title ?? ''}”`, at: a.now }, ...state.activity] };
    case 'entityArchive': return { ...state, entities: state.entities.map(x => x.id === a.id ? { ...x, status: 'archived' as const, updated: a.now } : x), cues: state.cues.filter(c => c.entityId !== a.id), activity: [{ id: `act${++uid}`, text: `Archived “${state.entities.find(x => x.id === a.id)?.title ?? ''}”`, at: a.now }, ...state.activity], toasts: push(state.toasts, 'Archived — kept in history', 'info') };
    case 'entityPublish': {
      const e = state.entities.find(x => x.id === a.id); if (!e) return state;
      const pub = { ...e, status: 'published' as const, updated: a.now };
      const me = state.people.find(pp => pp.id === ME_ID);
      const visible = pub.audience.scope === 'org' || (pub.audience.scope === 'team' && me?.managerId === pub.audience.targetId) || (pub.audience.scope === 'person' && pub.audience.targetId === ME_ID);
      let cues = state.cues.filter(c => c.entityId !== e.id);
      if (visible) { const msg = pub.requiresAck ? `New ${(pub.category ?? 'document')}: “${pub.title}” needs your acknowledgment.` : `${pub.authorName} shared “${pub.title}” with you.`; cues = [{ id: `cue-${e.id}`, persona: 'employee', kind: 'doc', message: msg, actionText: pub.requiresAck ? 'Acknowledge' : 'Open documents', entityId: e.id }, ...cues]; }
      return { ...state, entities: state.entities.map(x => x.id === a.id ? pub : x), cues, activity: [{ id: `act${++uid}`, text: `Published “${pub.title}” to ${audienceLabel(pub.audience)}`, at: a.now }, ...state.activity], toasts: push(state.toasts, `Published — ${pub.title}`, 'ok') };
    }
    case 'entityNudge': {
      const e = state.entities.find(x => x.id === a.id); if (!e || e.status !== 'published' || !e.requiresAck) return state;
      // Expected audience size (demo: org = everyone, team = the manager's reports, person = 1)
      const expected = e.audience.scope === 'org' ? state.people.length : e.audience.scope === 'team' ? state.people.filter(p => p.managerId === e.audience.targetId).length : 1;
      const acked = (e.ackedBy ?? []).length;
      const pending = Math.max(0, expected - acked);
      if (pending === 0) return { ...state, toasts: push(state.toasts, `Everyone has acknowledged “${e.title}” — no one to nudge`, 'info') };
      // If the current viewer is a non-acker of a doc that targets them, re-surface the cue.
      const me = state.people.find(pp => pp.id === ME_ID);
      const targetsMe = e.audience.scope === 'org' || (e.audience.scope === 'team' && me?.managerId === e.audience.targetId) || (e.audience.scope === 'person' && e.audience.targetId === ME_ID);
      const iAmPending = targetsMe && !(e.ackedBy ?? []).includes(ME_ID);
      let cues = state.cues;
      if (iAmPending && !cues.some(c => c.entityId === e.id)) cues = [{ id: `cue-${e.id}`, persona: 'employee', kind: 'doc', message: `Reminder: “${e.title}” still needs your acknowledgment.`, actionText: 'Acknowledge', entityId: e.id }, ...cues];
      return { ...state, cues, activity: [{ id: `act${++uid}`, text: `Nudged ${pending} non-acknowledger${pending === 1 ? '' : 's'} of “${e.title}”`, at: a.now }, ...state.activity], toasts: push(state.toasts, `Nudge sent to ${pending} pending ${pending === 1 ? 'person' : 'people'} for “${e.title}”`, 'ok') };
    }
    case 'entityAck': { const e = state.entities.find(x => x.id === a.id); if (!e) return state; return { ...state, entities: state.entities.map(x => x.id === a.id ? { ...x, ackedBy: Array.from(new Set([...(x.ackedBy ?? []), ME_ID])) } : x), cues: state.cues.filter(c => c.entityId !== a.id), activity: [{ id: `act${++uid}`, text: `You acknowledged “${e.title}”`, at: a.now }, ...state.activity], toasts: push(state.toasts, `Acknowledged — ${e.title}`, 'ok') }; }

    case 'intent': { const r = answer(a.text, state); return { ...state, lens: r.lens ?? state.lens, region: r.region ?? state.region, highlight: r.highlight ?? null, intentEcho: r.reply.text.slice(0, 84) + (r.reply.text.length > 84 ? '…' : ''), qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: a.text }, r.reply], peeledId: null }; }
    case 'qOpen': return { ...state, qOpen: a.open };
    case 'ask': { const r = answer(a.text, state); const lens = r.lens ?? state.lens; let nowBoard = state.nowBoard, homeView = state.homeView; if (r.board) { const bid = `nb-${lens}-${r.board.kind}-${r.board.ref}`; if (!state.nowBoard.some(b => b.id === bid)) nowBoard = [...state.nowBoard, { id: bid, type: r.board.kind, ref: r.board.ref, lens }]; homeView = 'board'; } return { ...state, lens, region: r.region ?? state.region, highlight: r.highlight ?? state.highlight, nowBoard, homeView, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: a.text }, r.reply] }; }
    case 'explain': { const reply = explain(state, a.kind, a.id); return { ...state, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: 'Tell me about this' }, reply] }; }

    case 'sim': return { ...state, sim: { personId: a.personId, lever: a.lever } };
    case 'simClose': return { ...state, sim: null };

    case 'toast': return { ...state, toasts: [...state.toasts.slice(-3), a.toast] };
    case 'dropToast': return { ...state, toasts: state.toasts.filter(t => t.id !== a.id) };
    case 'hide': return { ...state, hidden: [...state.hidden, a.id], peeledId: state.peeledId === a.id ? null : state.peeledId };
    case 'float': return { ...state, floating: { ...state.floating, [a.id]: { x: a.x, y: a.y } } };
    case 'dock': { const f = { ...state.floating }; delete f[a.id]; return { ...state, floating: f }; }
    case 'vibeOpen': return { ...state, vibeOpen: a.open };
    case 'vibeCreate': {
      const apps = state.vibeApps.some(v => v.id === a.appId) ? state.vibeApps : [...state.vibeApps, { id: a.appId, template: a.template }];
      const turns = [...state.vibeChat, { id: `u${Date.now()}`, role: 'user' as const, text: a.prompt }, { id: `q${Date.now() + 1}`, role: 'q' as const, text: 'Here is a live tool built from your team data. Send it wherever it is useful.', appId: a.appId }];
      return { ...state, vibeApps: apps, vibeChat: turns };
    }
    case 'vibeSay': return { ...state, vibeChat: [...state.vibeChat, ...a.turns] };
    case 'vibeInsight': return { ...state, vibeInsights: a.on ? (state.vibeInsights.includes(a.id) ? state.vibeInsights : [...state.vibeInsights, a.id]) : state.vibeInsights.filter(x => x !== a.id) };
    case 'vibeClear': return { ...state, vibeChat: [] };
    case 'boardAdd': { if (state.nowBoard.some(b => b.type === a.kind && b.ref === a.ref && b.lens === a.lens)) return state; const n = state.nowBoard.filter(b => b.lens === a.lens).length; const pos = { x: 40 + (n % 4) * 300, y: 40 + Math.floor(n / 4) * 240 }; return { ...state, nowBoard: [...state.nowBoard, { id: `nb-${a.lens}-${a.kind}-${a.ref}`, type: a.kind, ref: a.ref, lens: a.lens, pos }] }; }
    case 'boardMove': return { ...state, nowBoard: state.nowBoard.map(b => b.id === a.id ? { ...b, pos: { x: a.x, y: a.y } } : b) };
    case 'boardToQ': {
      const b = state.nowBoard.find(x => x.id === a.id); if (!b) return state;
      const nameOf = (it: typeof b) => it.type === 'person' ? (state.people.find(p => p.id === it.ref)?.name ?? 'that person') : it.type === 'tool' ? (state.vibeApps.find(v => v.id === it.ref)?.title || 'that tool') : it.ref;
      const label = nameOf(b);
      const reply: QMsg = { id: `q${++uid}`, role: 'q', text: `Looking at “${label}” from your board. I can read the current figures, call out what stands out, and suggest a next step — what angle matters most to you (trend, outliers, or a recommendation)?`, rationale: { why: 'You sent a board card to me.', whyNow: 'Dragged onto the Q bar.', confidence: 'medium', evidence: [`${b.type} · ${label}`] } };
      return { ...state, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: `Analyze “${label}” from my board` }, reply] };
    }
    case 'boardCombine': {
      const A = state.nowBoard.find(x => x.id === a.idA), B = state.nowBoard.find(x => x.id === a.idB); if (!A || !B) return state;
      const nameOf = (it: typeof A) => it.type === 'person' ? (state.people.find(p => p.id === it.ref)?.name ?? 'that person') : it.type === 'tool' ? (state.vibeApps.find(v => v.id === it.ref)?.title || 'that tool') : it.ref;
      const la = nameOf(A), lb = nameOf(B);
      const reply: QMsg = { id: `q${++uid}`, role: 'q', text: `Combined view of “${la}” and “${lb}”: I\u2019ve cross-read both. Where they move together tells you the correlation; where they diverge is where to look. Want me to build a single combined card on your board, or just summarize the relationship here?`, action: { label: 'Build combined card in Canvas', kind: 'nav', arg: 'canvas' }, rationale: { why: 'You dropped one board card onto another.', whyNow: 'Card-on-card combine.', confidence: 'medium', evidence: [`${A.type} · ${la}`, `${B.type} · ${lb}`] } };
      return { ...state, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: `Combine “${la}” + “${lb}” and analyze` }, reply] };
    }
    case 'boardResize': return { ...state, nowBoard: state.nowBoard.map(b => b.id === a.id ? { ...b, size: { w: a.w, h: a.h } } : b) };
    case 'boardRemove': return { ...state, nowBoard: state.nowBoard.filter(b => b.id !== a.id) };
    case 'boardReorder': { const mine = state.nowBoard.filter(b => b.lens === a.lens); const others = state.nowBoard.filter(b => b.lens !== a.lens); const from = mine.findIndex(b => b.id === a.id); if (from < 0) return state; const [moved] = mine.splice(from, 1); const to = Math.max(0, Math.min(mine.length, a.toIndex)); mine.splice(to, 0, moved); return { ...state, nowBoard: [...others, ...mine] }; }
    case 'vibeRemove': return { ...state, vibeApps: state.vibeApps.filter(v => v.id !== a.id), vibePinned: state.vibePinned.filter(x => x !== a.id), vibeInsights: state.vibeInsights.filter(x => x !== a.id), vibeChat: state.vibeChat.filter(t => t.appId !== a.id) };
    case 'vibeRename': return { ...state, vibeApps: state.vibeApps.map(v => v.id === a.id ? { ...v, title: a.title } : v) };
    case 'vibeDuplicate': { const src = state.vibeApps.find(v => v.id === a.id); if (!src) return state; const copy = { ...src, id: a.newId, title: `${src.title ?? ''} copy`.trim() || undefined }; const turns = [...state.vibeChat, { id: `q${Date.now()}`, role: 'q' as const, text: 'Duplicated — tweak this copy freely.', appId: a.newId }]; return { ...state, vibeApps: [...state.vibeApps, copy], vibeChat: turns }; }
    case 'vibeRefine': { const turns = [...state.vibeChat, { id: `u${Date.now()}`, role: 'user' as const, text: a.note }, { id: `q${Date.now() + 1}`, role: 'q' as const, text: `Updated “${state.vibeApps.find(v => v.id === a.id)?.title ?? 'the tool'}” — applied: ${a.note}. The card is tagged with this refinement.`, appId: a.id }]; return { ...state, vibeApps: state.vibeApps.map(v => v.id === a.id ? { ...v, refine: a.note } : v), vibeChat: turns }; }
    case 'vibeCombine': { const copy = { id: a.newId, template: 'dashboard', title: a.title, parts: a.parts }; const turns = [...state.vibeChat, { id: `q${Date.now()}`, role: 'q' as const, text: `Combined ${a.parts.length} tools into a dashboard. Send it anywhere as one card.`, appId: a.newId }]; return { ...state, vibeApps: [...state.vibeApps, copy], vibeChat: turns }; }
    case 'vibeWidget': { const app = { id: a.newId, template: 'widget', title: a.config.label, config: a.config }; const turns = [...state.vibeChat, { id: `u${Date.now()}`, role: 'user' as const, text: a.prompt }, { id: `q${Date.now() + 1}`, role: 'q' as const, text: `Built a ${a.config.kind} widget for “${a.config.label}”. Switch its shape or send it anywhere.`, appId: a.newId }]; return { ...state, vibeApps: [...state.vibeApps, app], vibeChat: turns }; }
    case 'vibeWidgets': { const stamp = Date.now(); const apps = a.specs.map((sp, i) => ({ id: `vibe-w-${stamp}-${i}`, template: 'widget', title: sp.label, config: sp })); const live = a.specs.some(sp => sp.data); const turns: State['vibeChat'] = [{ id: `u${stamp}`, role: 'user' as const, text: a.prompt }, ...apps.map((app, i) => ({ id: `q${stamp + i + 1}`, role: 'q' as const, text: i === 0 ? (apps.length > 1 ? `Read that as ${apps.length} views${live ? ' of your data' : ''} — here they are.` : live ? `Built it from the numbers in your prompt — labelled “your data”.` : `Built a ${a.specs[0].kind} for “${a.specs[0].label}”. Switch its shape or send it anywhere.`) : `…and the ${a.specs[i].kind} view.`, appId: app.id }))]; return { ...state, vibeApps: [...state.vibeApps, ...apps], vibeChat: [...state.vibeChat, ...turns] }; }
    case 'hideShared': { const boardIds = state.nowBoard.filter(b => b.type === 'tool' && b.ref === a.appId).map(b => b.id); return { ...state, sharedHidden: state.sharedHidden.includes(a.appId) ? state.sharedHidden : [...state.sharedHidden, a.appId], nowBoard: state.nowBoard.filter(b => !boardIds.includes(b.id)), toasts: push(state.toasts, 'Removed from your list — ask them to reshare if you need it back', 'info') }; }
    case 'addHoliday': { const h: Holiday = { id: `h${Date.now()}`, label: a.label, date: a.date, kind: a.kind }; return { ...state, holidays: [...state.holidays, h], toasts: push(state.toasts, `${a.label} (${a.kind}) published to all calendars`, 'ok') }; }
    case 'removeHoliday': return { ...state, holidays: state.holidays.filter(h => h.id !== a.id), toasts: push(state.toasts, 'Holiday removed — calendars updated', 'info') };
    case 'setAllot': return { ...state, leaveTypes: state.leaveTypes.map(t => t.id === a.typeId ? { ...t, balance: a.days } : t), toasts: push(state.toasts, 'Allotment updated for the org', 'ok') };
    case 'addPerson': { const np = { id: `p${Date.now()}`, type: 'person' as const, name: a.name, role: a.role, department: a.department, status: 'active' as const, managerId: a.managerId, velocity: 0.5, attendance: 0.95 }; return { ...state, people: [...state.people, np], toasts: push(state.toasts, `${a.name} added to the org under ${state.people.find(p => p.id === a.managerId)?.name?.split(' ')[0] ?? 'their manager'}`, 'ok') }; }
    case 'addCandidate': { const c = { id: `c${Date.now()}`, name: a.name, stage: a.stage, progress: 0, checklist: makeChecklist(`c${Date.now()}`, 0) }; return { ...state, candidates: [...state.candidates, c], toasts: push(state.toasts, `${a.name} added to onboarding — day-one checklist created`, 'ok') }; }
    case 'toggleExitTask': { return { ...state, leavers: state.leavers.map(l => { if (l.id !== a.leaverId) return l; const checklist = l.checklist.map(k => k.id === a.taskId ? { ...k, done: !k.done } : k); const progress = Math.round(checklist.filter(k => k.done).length / checklist.length * 100); return { ...l, checklist, progress }; }) }; }
    case 'startOffboarding': { const p = state.people.find(x => x.id === a.personId); if (!p || state.leavers.some(l => l.name === p.name)) return state; const id = `x${Date.now()}`; const leaver: Leaver = { id, name: p.name, role: p.role, lastDay: a.lastDay, reason: a.reason, progress: 0, checklist: makeExitChecklist(id, 0) }; return { ...state, leavers: [leaver, ...state.leavers], activity: [{ id: `act${++uid}`, text: `Started offboarding for ${p.name} (${a.reason}, last day ${a.lastDay})`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity], toasts: push(state.toasts, `Offboarding started for ${p.name.split(' ')[0]} — exit checklist created`, 'ok') }; }
    case 'toggleJoinerTask': { return { ...state, candidates: state.candidates.map(c => { if (c.id !== a.candidateId || !c.checklist) return c; const checklist = c.checklist.map(k => k.id === a.taskId ? { ...k, done: !k.done } : k); const progress = Math.round((checklist.filter(k => k.done).length / checklist.length) * 100); return { ...c, checklist, progress }; }) }; }
    case 'togglePay': { const nv = !state.showPay; return { ...state, showPay: nv }; }
    case 'widgetKind': return { ...state, vibeApps: state.vibeApps.map(v => v.id === a.id && v.config ? { ...v, config: { ...v.config, kind: a.kind } } : v) };
    case 'homeView': return { ...state, homeView: a.view };
    case 'wsToCanvas': {
      const item = state.wsItems.find(i => i.id === a.id); if (!item) return state;
      const appId = `vibe-ws-${Date.now()}`;
      // seed a simple checklist/list widget from the card's content
      const labels = item.kind === 'todo' ? (item.todos ?? []).map(t => t.text).filter(Boolean)
        : item.kind === 'list' ? (item.listItems ?? []).map(l => l.text).filter(Boolean)
        : [item.title];
      const app = { id: appId, template: 'widget', title: item.title, config: { kind: 'checklist', label: item.title, data: { labels: labels.length ? labels : [item.title], values: labels.map(() => 1) } } };
      const turns = [...state.vibeChat,
        { id: `u${++uid}`, role: 'user' as const, text: `Turn my “${item.title}” ${item.kind} into a tool` },
        { id: `q${++uid}`, role: 'q' as const, text: `Seeded a tool from “${item.title}”. Refine it here, then send it to your board or share it with the team.`, appId }];
      return { ...state, vibeApps: [...state.vibeApps, app], vibeChat: turns, vibeOpen: true };
    }
    case 'wsAddTool': {
      const app = state.vibeApps.find(v => v.id === a.toolRef); if (!app) return state;
      if (state.wsItems.some(i => i.lens === state.lens && i.kind === 'tool' && i.toolRef === a.toolRef)) return { ...state, homeView: 'workspace', toasts: push(state.toasts, 'That tool is already on your workspace', 'info') };
      const z = state.wsZ + 1; const n = state.wsItems.filter(i => i.lens === state.lens).length; const px = 60 + (n % 5) * 28, py = 80 + (n % 5) * 28;
      const item: WorkspaceItem = { id: `ws${Date.now()}`, lens: state.lens, owner: ME_ID, kind: 'tool', title: app.title || 'Tool', color: '#6A3DFF', pos: { x: px, y: py }, size: { w: 340, h: 300 }, z, toolRef: a.toolRef };
      return { ...state, wsItems: [...state.wsItems, item], wsZ: z, homeView: 'workspace', toasts: push(state.toasts, `“${item.title}” added to your workspace`, 'ok') };
    }
    case 'wsAdd': { const z = state.wsZ + 1; const n = state.wsItems.filter(i => i.lens === state.lens).length; const px = a.x + (n % 5) * 28, py = a.y + (n % 5) * 28; const base = { id: `ws${Date.now()}`, lens: state.lens, owner: ME_ID, kind: a.kind, title: a.kind === 'note' ? 'Note' : a.kind === 'list' ? 'List' : 'To-do', color: a.kind === 'note' ? '#FFB454' : a.kind === 'list' ? '#52D0DD' : '#6A3DFF', pos: { x: px, y: py }, z }; const extra = a.kind === 'note' ? { noteHtml: '' } : a.kind === 'list' ? { listStyle: 'bulleted' as const, listItems: [{ id: 'l1', text: '', depth: 0 }] } : { todos: [] as WsTodoEntry[] }; return { ...state, wsItems: [...state.wsItems, { ...base, ...extra }], wsZ: z }; }
    case 'wsUpdate': return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, ...a.patch } : i) };
    case 'wsMove': return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, pos: { x: a.x, y: a.y } } : i) };
    case 'wsResize': return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, size: { w: a.w, h: a.h } } : i) };
    case 'wsDelete': { const conns = state.wsConnectors.filter(c => c.fromId !== a.id && c.toId !== a.id); const items = recomputeFlowboards(state.wsItems.filter(i => i.id !== a.id), conns); return { ...state, wsItems: items, wsConnectors: conns }; }
    case 'wsFront': { const z = state.wsZ + 1; return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, z } : i), wsZ: z }; }
    case 'wsConnect': {
      if (a.fromId === a.toId) return state;
      if (state.wsConnectors.some(c => (c.fromId === a.fromId && c.toId === a.toId) || (c.fromId === a.toId && c.toId === a.fromId))) return state;
      const from = state.wsItems.find(i => i.id === a.fromId), to = state.wsItems.find(i => i.id === a.toId);
      if (!from || !to) return state;
      const fb = from.flowboardId || to.flowboardId || `fb${Date.now()}`;
      const merge = new Set([from.flowboardId, to.flowboardId, fb].filter(Boolean) as string[]);
      const items = state.wsItems.map(i => (i.id === a.fromId || i.id === a.toId || (i.flowboardId && merge.has(i.flowboardId))) ? { ...i, flowboardId: fb } : i);
      const conn: WsConnector = { id: `c${Date.now()}`, fromId: a.fromId, toId: a.toId, color: from.color, fromSide: a.fromSide, toSide: a.toSide, arrowEnd: true };
      return { ...state, wsItems: items, wsConnectors: [...state.wsConnectors, conn] };
    }
    case 'wsDisconnect': {
      const conns = state.wsConnectors.filter(c => c.id !== a.id);
      // recompute flowboard membership from remaining connectors (connected components)
      const items = recomputeFlowboards(state.wsItems, conns);
      return { ...state, wsConnectors: conns, wsItems: items };
    }
    case 'wsConnUpdate': return { ...state, wsConnectors: state.wsConnectors.map(c => c.id === a.id ? { ...c, ...a.patch } : c) };
    case 'wsToQ': {
      const item = state.wsItems.find(i => i.id === a.id); if (!item) return state;
      const text = wsItemText(item);
      const actions = wsActionItems(item);
      const bodyLines = [
        `Here\u2019s what I found in \u201c${item.title}\u201d:`,
        text ? `\u201c${text.slice(0, 220)}${text.length > 220 ? '\u2026' : ''}\u201d` : '(this item is still empty)',
      ];
      if (actions.length) { bodyLines.push('', 'Suggested next steps:'); actions.forEach(x => bodyLines.push(`\u2022 ${x.text}`)); }
      else if (text) bodyLines.push('', 'No app actions jumped out, but I can help you turn this into a plan — tell me the goal.');
      const reply: QMsg = { id: `q${++uid}`, role: 'q', text: bodyLines.join('\n'), action: actions.find(x => x.action)?.action ?? null,
        rationale: { why: 'Generated from a workspace item you sent me.', whyNow: 'You asked Q to look at it.', confidence: 'medium', evidence: [`${item.kind} · ${text ? text.length + ' chars' : 'empty'}`] } };
      return { ...state, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: `Look at my “${item.title}” ${item.kind} and suggest actions` }, reply] };
    }
    case 'wsShare': {
      const item = state.wsItems.find(i => i.id === a.id); if (!item) return state;
      const p = state.people.find(x => x.id === a.personId);
      const nextShared = Array.from(new Set([...(item.sharedWith ?? []), a.personId]));
      return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, sharedWith: nextShared, sharedBy: ME_ID } : i),
        activity: [{ id: `act${++uid}`, text: `Shared “${item.title}” with ${p?.name ?? 'a teammate'}`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity],
        toasts: push(state.toasts, `“${item.title}” shared with ${p?.name?.split(' ')[0] ?? 'them'}`, 'ok') };
    }
    case 'wsUnshare': {
      const item = state.wsItems.find(i => i.id === a.id); if (!item) return state;
      const nextShared = (item.sharedWith ?? []).filter(x => x !== a.personId);
      return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, sharedWith: nextShared.length ? nextShared : undefined, sharedBy: nextShared.length ? i.sharedBy : undefined } : i) };
    }
    case 'wsToSignal': {
      const item = state.wsItems.find(i => i.id === a.id); if (!item) return state;
      if (item.flowboardId) return { ...state, toasts: push(state.toasts, 'A whole flowboard can\u2019t be sent — detach this card first, or send it alone', 'info') };
      const bid = `nb-${state.lens}-ws-${item.id}`;
      if (state.nowBoard.some(b => b.id === bid)) return { ...state, homeView: 'signal', toasts: push(state.toasts, 'Already on your Signal feed', 'info') };
      return { ...state, nowBoard: [...state.nowBoard, { id: bid, type: 'ws', ref: item.id, lens: state.lens }], homeView: 'signal', toasts: push(state.toasts, `\u201c${item.title}\u201d sent to Signal`, 'ok') };
    }
    case 'wsBoardName': return { ...state, wsBoards: { ...state.wsBoards, [a.fb]: { ...(state.wsBoards[a.fb] ?? { name: 'Flowboard' }), name: a.name } } };
    case 'wsBoardPad': return { ...state, wsBoards: { ...state.wsBoards, [a.fb]: { ...(state.wsBoards[a.fb] ?? { name: 'Flowboard' }), pad: Math.max(0, a.pad) } } };
    case 'wsBoardDelete': { const conns = state.wsConnectors.filter(c => { const f = state.wsItems.find(i => i.id === c.fromId); return f?.flowboardId !== a.fb; }); const boards = { ...state.wsBoards }; delete boards[a.fb]; return { ...state, wsItems: state.wsItems.filter(i => i.flowboardId !== a.fb), wsConnectors: conns, wsBoards: boards }; }
    case 'wsBoardMove': return { ...state, wsItems: state.wsItems.map(i => i.flowboardId === a.fb ? { ...i, pos: { x: i.pos.x + a.dx, y: i.pos.y + a.dy } } : i) };
    case 'wsBoardOrganize': {
      const members = state.wsItems.filter(i => i.flowboardId === a.fb); if (members.length < 2) return state;
      const ids = new Set(members.map(m => m.id));
      const memberConns = state.wsConnectors.filter(c => ids.has(c.fromId) && ids.has(c.toId));
      const DW: Record<string, { w: number; h: number }> = { note: { w: 272, h: 210 }, list: { w: 264, h: 180 }, todo: { w: 280, h: 200 } };
      const sizeOf = (m: WorkspaceItem) => m.size ?? DW[m.kind] ?? { w: 272, h: 200 };
      const out = new Map<string, string[]>(), indeg = new Map<string, number>();
      members.forEach(m => { out.set(m.id, []); indeg.set(m.id, 0); });
      memberConns.forEach(c => { out.get(c.fromId)!.push(c.toId); indeg.set(c.toId, (indeg.get(c.toId) ?? 0) + 1); });
      const layer = new Map<string, number>();
      const roots = members.filter(m => (indeg.get(m.id) ?? 0) === 0).map(m => m.id);
      const seed = roots.length ? roots : [members[0].id];
      seed.forEach(id => layer.set(id, 0));
      const queue = [...seed]; let guard = 0;
      while (queue.length && guard++ < 5000) { const n = queue.shift()!; const ln = layer.get(n) ?? 0; for (const nb of out.get(n) ?? []) { const cand = ln + 1; if (cand > (layer.get(nb) ?? -1)) { layer.set(nb, cand); queue.push(nb); } } }
      members.forEach(m => { if (!layer.has(m.id)) layer.set(m.id, 0); });
      const byLayer = new Map<number, WorkspaceItem[]>();
      members.forEach(m => { const l = layer.get(m.id)!; (byLayer.get(l) ?? byLayer.set(l, []).get(l)!).push(m); });
      const ox = Math.min(...members.map(m => m.pos.x)), oy = Math.min(...members.map(m => m.pos.y));
      const COLGAP = 90, ROWGAP = 40;
      const layers = [...byLayer.keys()].sort((x, y) => x - y);
      let cx = ox; const colX = new Map<number, number>();
      for (const l of layers) { colX.set(l, cx); const maxW = Math.max(...byLayer.get(l)!.map(m => sizeOf(m).w)); cx += maxW + COLGAP; }
      const posById = new Map<string, { x: number; y: number }>();
      for (const l of layers) { let cy = oy; for (const m of byLayer.get(l)!) { posById.set(m.id, { x: colX.get(l)!, y: cy }); cy += sizeOf(m).h + ROWGAP; } }
      return { ...state, wsItems: state.wsItems.map(i => posById.has(i.id) ? { ...i, pos: posById.get(i.id)! } : i) };
    }
    case 'wsJoinBoard': return { ...state, wsItems: state.wsItems.map(i => i.id === a.id ? { ...i, flowboardId: a.fb } : i) };
    case 'wsAddConnected': {
      const from = state.wsItems.find(i => i.id === a.fromId); if (!from) return state;
      const fw = from.size?.w ?? 272, fh = from.size?.h ?? 210, GAP = 90;
      const nw = a.kind === 'note' ? 272 : a.kind === 'list' ? 264 : 280, nh = a.kind === 'note' ? 210 : a.kind === 'list' ? 180 : 200;
      let x = from.pos.x, y = from.pos.y;
      if (a.side === 'right') { x = from.pos.x + fw + GAP; y = from.pos.y; }
      else if (a.side === 'left') { x = from.pos.x - nw - GAP; y = from.pos.y; }
      else if (a.side === 'bottom') { x = from.pos.x; y = from.pos.y + fh + GAP; }
      else { x = from.pos.x; y = from.pos.y - nh - GAP; }
      const z = state.wsZ + 1;
      const id = `ws${Date.now()}`;
      const base = { id, lens: state.lens, owner: ME_ID, kind: a.kind, title: a.kind === 'note' ? 'Note' : a.kind === 'list' ? 'List' : 'To-do', color: from.color, pos: { x: Math.round(x / 24) * 24, y: Math.round(y / 24) * 24 }, z };
      const extra = a.kind === 'note' ? { noteHtml: '' } : a.kind === 'list' ? { listStyle: 'bulleted' as const, listItems: [{ id: 'l1', text: '', depth: 0 }] } : { todos: [] as WsTodoEntry[] };
      const fb = from.flowboardId || `fb${Date.now()}`;
      const opp: Record<string, 'top' | 'right' | 'bottom' | 'left'> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      const items = state.wsItems.map(i => i.id === a.fromId ? { ...i, flowboardId: fb } : i).concat([{ ...base, ...extra, flowboardId: fb }]);
      const conn: WsConnector = { id: `c${Date.now()}`, fromId: a.fromId, toId: id, color: from.color, fromSide: a.side, toSide: opp[a.side], arrowEnd: true };
      return { ...state, wsItems: items, wsConnectors: [...state.wsConnectors, conn], wsZ: z };
    }
    case 'publishTool': { if (state.sharedTools.some(t => t.appId === a.appId && (t.to ?? 'team') === (a.to ?? 'team'))) return state; const app = state.vibeApps.find(v => v.id === a.appId); if (!app) return state; const from = state.lens === 'hr' ? 'HR' : (state.people.find(p => p.id === 'm1')?.name.split(' ')[0] ?? 'Your manager'); const title = app.title || app.template; const who = a.to && a.to !== 'team' ? (state.people.find(p => p.id === a.to)?.name.split(' ')[0] ?? 'them') : (state.lens === 'hr' ? 'everyone' : 'the team'); return { ...state, sharedTools: [...state.sharedTools, { id: `sh${++uid}`, appId: a.appId, title, from, at: `${MONTHS[NOW.m]} ${NOW.d}`, to: a.to ?? 'team' }], activity: [{ id: `act${++uid}`, text: `Shared “${title}” with ${who}`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity], toasts: push(state.toasts, `Shared with ${who}`, 'ok') }; }
    case 'newCanvas': { const title = state.vibeChat.find(m => m.role === 'user')?.text.slice(0, 42) || 'Untitled canvas'; const hist = state.vibeChat.length ? [{ id: `cv${++uid}`, title, chat: state.vibeChat }, ...state.canvasHistory].slice(0, 20) : state.canvasHistory; return { ...state, vibeChat: [], canvasHistory: hist }; }
    case 'loadCanvas': { const found = state.canvasHistory.find(c => c.id === a.id); if (!found) return state; const title = state.vibeChat.find(m => m.role === 'user')?.text.slice(0, 42) || 'Untitled canvas'; const rest = state.canvasHistory.filter(c => c.id !== a.id); const hist = state.vibeChat.length ? [{ id: `cv${++uid}`, title, chat: state.vibeChat }, ...rest].slice(0, 20) : rest; return { ...state, vibeChat: found.chat, canvasHistory: hist }; }
    case 'unpublishTool': return { ...state, sharedTools: state.sharedTools.filter(t => t.appId !== a.appId), toasts: push(state.toasts, 'Removed from team’s My World', 'info') };
    case 'vibePin': return { ...state, vibePinned: state.vibePinned.includes(a.id) ? state.vibePinned : [...state.vibePinned, a.id] };
    case 'vibeUnpin': return { ...state, vibePinned: state.vibePinned.filter(x => x !== a.id) };
    case 'wallpaper': return { ...state, wallpaper: a.id };
    case 'avatar': return { ...state, avatarSeed: a.seed };
    case 'motionOff': return { ...state, motionOff: a.off };
    case 'plain': return { ...state, plain: a.on };
    case 'claimReimb': {
      const r: Reimbursement = { id: `rb${++uid}`, personId: ME_ID, title: a.title, category: a.category, amount: a.amount, submitted: `${NOW.d} ${MONTHS[NOW.m]}`, status: 'submitted', note: a.note, receipt: a.receipt };
      return { ...state, reimbursements: [r, ...state.reimbursements],
        activity: [{ id: `act${++uid}`, text: `Claimed ₹${a.amount.toLocaleString('en-IN')} — ${a.title}`, at: `${MONTHS[NOW.m]} ${NOW.d}` }, ...state.activity],
        toasts: push(state.toasts, `Reimbursement claim sent — ₹${a.amount.toLocaleString('en-IN')}`, 'ok') };
    }
    case 'unhide': return { ...state, hidden: state.hidden.filter(h => h !== a.id) };
    case 'spawn': return { ...state, synth: [...state.synth.slice(-5), a.token] };
    case 'dismissSynth': return { ...state, synth: state.synth.filter(t => t.id !== a.id) };
    case 'pulse': return { ...state, pulses: [...state.pulses.slice(-8), a.pulse] };
    case 'dropPulse': return { ...state, pulses: state.pulses.filter(p => p.id !== a.id) };
    case 'sound': { setMuted(!a.on); return { ...state, soundOn: a.on }; }
    case 'qMood': return { ...state, qMood: a.mood };
    case 'panel': return a.side === 'left' ? { ...state, panelLeft: a.open } : { ...state, panelRight: a.open };
    case 'cluster': {
      const ppl = a.ids.map(id => state.people.find(p => p.id === id)).filter(Boolean) as PersonToken[];
      const allPeople = ppl.length === a.ids.length && ppl.length > 0;
      const names = a.ids.map(id => labelOf(state, id)).filter(Boolean);
      const risk = ppl.some(p => p.status === 'flight_risk');
      const reply: QMsg = { id: `q${++uid}`, role: 'q', viz: allPeople ? 'workload' : undefined,
        text: allPeople
          ? `Stack of ${a.ids.length}: ${names.join(', ')}. ${risk ? 'One member is an elevated flight risk.' : 'All tracking healthy.'} Combined load is balanced; Priya has the most slack.`
          : `Stack of ${a.ids.length} mixed tokens: ${names.join(', ')}. Q reads this as a working set and offers a multi-perspective view across people, time and pay.` };
      return { ...state, qOpen: true, qLog: [...state.qLog, { id: `u${++uid}`, role: 'user', text: 'Tell me about this stack' }, reply] };
    }
    case 'combineStack': {
      if (a.ids.length < 2) return state;
      const ppl = a.ids.map(id => state.people.find(p => p.id === id)).filter(Boolean) as PersonToken[];
      const allPeople = ppl.length === a.ids.length;
      const names = a.ids.map(id => labelOf(state, id));
      const W = typeof window !== 'undefined' ? window.innerWidth : 1400;
      const lines = allPeople
        ? [`${names.join(' · ')} — ${a.ids.length}-way comparison.`,
           `Avg attendance ${Math.round(ppl.reduce((s2, p) => s2 + (p.attendance ?? .9), 0) / ppl.length * 100)}%, avg velocity ${Math.round(ppl.reduce((s2, p) => s2 + (p.velocity ?? .5), 0) / ppl.length * 100)}.`,
           ppl.some(p => p.status === 'flight_risk') ? 'Contains an elevated flight risk — prioritise a retention move.' : 'No elevated risk; strong candidate cohort.']
        : [`Working set: ${names.join(' · ')}.`, 'Multi-perspective view assembled across the stacked token types.', 'Drag this result to Q for the full cross-analysis.'];
      const synth: SynthToken = { id: `syn${++uid}`, type: 'synth', title: allPeople ? `Comparison · ${a.ids.length} people` : `Working set · ${a.ids.length}`,
        lines, viz: allPeople ? 'comp' : null, verdict: 'combine', aColor: 'var(--color-lumen)', bColor: 'var(--color-halo)',
        action: ppl.some(p => p.status === 'flight_risk') ? { label: 'Simulate retention', kind: 'sim', arg: (ppl.find(p => p.status === 'flight_risk')!).id } : null,
        pos: { x: Math.min(W - 320, W / 2 - 134), y: 150 } };
      return { ...state, synth: [...state.synth.slice(-5), synth], selection: [], toasts: push(state.toasts, `Combined ${a.ids.length} into a result`, 'ok') };
    }
    default: return state;
  }
}

interface Ctx extends State {
  reduced: boolean;
  setLens: (l: Persona) => void; setRole: (r: Persona) => void; setRegion: (r: Region) => void; setOverlay: (o: Overlay) => void; openDoc: (id: string | null) => void;
  floatCard: (id: string, x: number, y: number) => void; dockCard: (id: string) => void;
  setVibe: (open: boolean) => void; createVibe: (template: string) => void; vibeAsk: (text: string) => void; clearVibeChat: () => void; removeVibe: (id: string) => void; pinVibe: (id: string) => void; unpinVibe: (id: string) => void; sendInsights: (id: string) => void; removeInsights: (id: string) => void; boardAdd: (kind: "person" | "chart" | "tool", ref: string) => void; boardRemove: (id: string) => void; boardReorder: (id: string, toIndex: number) => void; boardMove: (id: string, x: number, y: number) => void; boardResize: (id: string, w: number, h: number) => void; boardToQ: (id: string) => void; boardCombine: (idA: string, idB: string) => void; renameVibe: (id: string, title: string) => void; duplicateVibe: (id: string) => void; refineVibe: (id: string, note: string) => void; combineVibe: (parts: string[], title: string) => void; createWidget: (kind: string, label: string) => void; setWidgetKind: (id: string, kind: string) => void; setHomeView: (view: "signal" | "board" | "workspace") => void; wsAdd: (kind: WsKind, x: number, y: number) => void; wsAddTool: (toolRef: string) => void; wsToCanvas: (id: string) => void; wsUpdate: (id: string, patch: Partial<WorkspaceItem>) => void; wsMove: (id: string, x: number, y: number) => void; wsDelete: (id: string) => void; wsFront: (id: string) => void; wsConnect: (fromId: string, toId: string, fromSide?: 'top'|'right'|'bottom'|'left', toSide?: 'top'|'right'|'bottom'|'left') => void; wsResize: (id: string, w: number, h: number) => void; wsDisconnect: (id: string) => void; wsConnUpdate: (id: string, patch: Partial<WsConnector>) => void; wsToQ: (id: string) => void; wsToSignal: (id: string) => void; wsShare: (id: string, personId: string) => void; wsUnshare: (id: string, personId: string) => void; wsBoardName: (fb: string, name: string) => void; wsBoardDelete: (fb: string) => void; wsBoardMove: (fb: string, dx: number, dy: number) => void; wsBoardOrganize: (fb: string) => void; wsJoinBoard: (id: string, fb: string) => void; wsBoardPad: (fb: string, pad: number) => void; wsAddConnected: (fromId: string, side: 'top'|'right'|'bottom'|'left', kind: WsKind) => void; publishTool: (appId: string, to?: string) => void; unpublishTool: (appId: string) => void; hideShared: (appId: string) => void; togglePay: () => void; addHoliday: (label: string, date: string, kind: Holiday['kind']) => void; removeHoliday: (id: string) => void; setAllot: (typeId: string, days: number) => void; addPerson: (name: string, role: string, department: string, managerId: string) => void; addCandidate: (name: string, stage: string) => void; newCanvas: () => void; loadCanvas: (id: string) => void;
  setWallpaper: (id: string) => void; setAvatarSeed: (seed: string | null) => void; setMotionOff: (off: boolean) => void; setPlain: (on: boolean) => void; claimReimb: (title: string, category: Reimbursement['category'], amount: number, note?: string, receipt?: string) => void;
  peel: (id: string | null) => void; reset: () => void;
  toggleSelect: (id: string) => void; clearSel: () => void; setDragging: (on: boolean) => void; setQHover: (level: 'none' | 'influence' | 'release') => void;
  clockIn: () => void; clockOut: () => void; breakStart: () => void; breakEnd: () => void;
  approve: (id: string) => void; reject: (id: string) => void; bulkApprove: () => void;
  hold: (id: string) => void; resume: (id: string) => void; setDelegate: (id: string | null) => void; approveMany: (ids: string[]) => void; rejectMany: (ids: string[]) => void;
  setTour: (on: boolean) => void; setLegend: (on: boolean) => void; toggleOnboardingTask: (id: string) => void; assignBuddy: (candidateId: string, personId: string) => void; toggleJoinerTask: (candidateId: string, taskId: string) => void; toggleExitTask: (leaverId: string, taskId: string) => void; startOffboarding: (personId: string, reason: Leaver['reason'], lastDay: string) => void;
  createGoal: (title: string, dueOn: string) => void; cascadeGoal: (id: string) => void; updateGoalProgress: (id: string, delta: number) => void; archiveGoal: (id: string) => void;
  ooToggle: (ooId: string, actionId: string) => void; ooAddAction: (ooId: string, text: string) => void;
  submitSelfReview: (id: string, text: string) => void; saveManagerReview: (id: string, text: string) => void; nudgeReviews: () => void; submitPulse: (score: number) => void; compSet: (id: string, amount: number) => void; submitCompPlan: () => void; resetCompPlan: () => void; approveCompPlan: () => void; setCoverage: (id: string, personId: string) => void; autoCoverAll: () => void;
  applyLeave: (k: string, m: LeaveMode, s: string, e: string, d: number, reason?: string, convertedFrom?: string) => void;
  addLeaveFor: (pid: string, k: string, m: LeaveMode, s: string, e: string, d: number) => void;
  addType: (label: string, days: number) => void;
  overridePayroll: (id: string) => void; ackDoc: (id: string) => void; dismissCue: (id: string) => void;
  createEntity: (patch: Partial<Entity>) => void; updateEntity: (id: string, patch: Partial<Entity>) => void; publishEntity: (id: string) => void; archiveEntity: (id: string) => void; ackEntity: (id: string) => void; nudgeNonAckers: (id: string) => void;
  runIntent: (t: string) => void; setQ: (o: boolean) => void; ask: (t: string) => void; recallThread: () => MemoryThread | null; explainToken: (kind: string, id: string) => void;
  simulate: (p: string, l: 'bonus' | 'project' | 'promo') => void; closeSim: () => void;
  toast: (m: string, tone?: Toast['tone']) => void; dropToast: (id: string) => void;
  hide: (id: string) => void; unhide: (id: string) => void;
  spawnSynth: (token: SynthToken) => void; dismissSynth: (id: string) => void;
  pulse: (x: number, y: number, tone: Pulse['tone']) => void; dropPulse: (id: string) => void;
  setSound: (on: boolean) => void; explainCluster: (ids: string[]) => void; combineStack: (ids: string[]) => void; setMood: (m: State['qMood']) => void; setPanel: (side: 'left' | 'right', open: boolean) => void;
}

const C = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [s, dRaw] = useReducer(reducer, initial);
  // Telemetry choke-point (Phase B): every interaction flows through here.
  // emitTelemetry() does not transmit — see telemetry.ts. One line for a real
  // deployment to connect a funnel; honest no-op until then.
  const surfaceRef = useRef({ lens: s.lens, region: s.region });
  surfaceRef.current = { lens: s.lens, region: s.region };
  const d = useCallback((a: Action) => {
    emitTelemetry(a.t, `${surfaceRef.current.lens}:${surfaceRef.current.region}`);
    dRaw(a);
  }, [dRaw]);
  const reduced = !!useReducedMotion() || s.motionOff;
  useEffect(() => { try { localStorage.setItem('q_vibeapps', JSON.stringify(s.vibeApps)); localStorage.setItem('q_vibepins', JSON.stringify(s.vibePinned)); localStorage.setItem('q_vibeins', JSON.stringify(s.vibeInsights)); localStorage.setItem('q_nowboard', JSON.stringify(s.nowBoard)); localStorage.setItem('q_sharedtools', JSON.stringify(s.sharedTools)); localStorage.setItem('q_sharedhidden', JSON.stringify(s.sharedHidden)); localStorage.setItem('q_canvashist', JSON.stringify(s.canvasHistory)); } catch { /* ignore */ } }, [s.vibeApps, s.vibePinned, s.vibeInsights, s.nowBoard, s.sharedTools, s.canvasHistory, s.sharedHidden]);
  // Persist only closed orbit spheres (a known key set), not transient token hides.
  useEffect(() => { try { localStorage.setItem('q_closed_spheres', JSON.stringify(s.hidden.filter(id => SPHERE_KEYS.has(id)))); } catch { /* ignore */ } }, [s.hidden]);
  useEffect(() => { try { localStorage.setItem('q_wsitems', JSON.stringify(s.wsItems)); localStorage.setItem('q_wsconn', JSON.stringify(s.wsConnectors)); localStorage.setItem('q_wsboards', JSON.stringify(s.wsBoards)); } catch { /* ignore */ } }, [s.wsItems, s.wsConnectors]);
  const v = useMemo<Ctx>(() => ({
    ...s, reduced,
    setLens: l => d({ t: 'lens', lens: l }), setRole: r => d({ t: 'role', role: r }), setRegion: r => d({ t: 'region', region: r }), setOverlay: o => d({ t: 'overlay', overlay: o }), openDoc: id => d({ t: 'docView', id }),
    floatCard: (id, x, y) => d({ t: 'float', id, x, y }), dockCard: id => d({ t: 'dock', id }),
    setWallpaper: id => { try { localStorage.setItem('q_wallpaper', id); } catch {} d({ t: 'wallpaper', id }); },
    setAvatarSeed: seed => { try { seed ? localStorage.setItem('q_avatar', seed) : localStorage.removeItem('q_avatar'); } catch {} d({ t: 'avatar', seed }); },
    setMotionOff: off => { try { localStorage.setItem('q_motionoff', off ? '1' : '0'); } catch {} d({ t: 'motionOff', off }); },
    setPlain: on => d({ t: 'plain', on }),
    claimReimb: (title, category, amount, note, receipt) => { sfx.confirm(); d({ t: 'claimReimb', title, category, amount, note, receipt }); },
    setVibe: open => d({ t: 'vibeOpen', open }),
    createVibe: template => { const ex = s.vibeApps.find(v => v.template === template); const appId = ex ? ex.id : `vibe-${template}-${Date.now()}`; const prompt = VIBE_TEMPLATES.find(v => v.id === template)?.prompt ?? 'Build a tool'; sfx.confirm(); d({ t: 'vibeCreate', template, appId, prompt }); },
    vibeAsk: text => {
      const fixedT = fuzzyFix(text);
      const t = fixedT.toLowerCase();
      // Phase D: "trend/over time of <metric>" → a trend widget seeded with the real
      // snapshot series (before/after badge comes for free from WidgetView).
      if (/(trend|over time|over the|since|history|trajectory|week over week|month over month)/.test(t) && !/\d/.test(t)) {
        const metricMap: [RegExp, MetricKey, string][] = [
          [/attrition|turnover|churn/, 'attrition', 'Voluntary attrition'], [/head ?count/, 'headcount', 'Headcount'],
          [/tenure/, 'tenure', 'Average tenure'], [/engag|enps|sentiment/, 'engagement', 'Engagement (eNPS)'],
          [/attendance|presence/, 'attendance', 'Team attendance'], [/pending|approval|backlog/, 'pending', 'Pending approvals'],
          [/risk|flight/, 'risk', 'Team flight-risk score'],
        ];
        const mh = metricMap.find(([re]) => re.test(t));
        if (mh) { const ser = METRIC_SNAPSHOTS.find(m => m.key === mh[1]); if (ser) { sfx.confirm(); d({ t: 'vibeWidgets', specs: [{ kind: 'trend', label: mh[2], data: { labels: ser.periods, values: ser.values } }], prompt: text }); return; } }
      }
      const map: [RegExp, string][] = [
        [/head ?count|team size/, 'headcount'], [/attrition trend|turnover|churn|attrition over/, 'attrition'],
        [/band ladder|comp band|salary band|pay ladder|pay band/, 'bandladder'], [/heat ?map|engagement grid/, 'heatmap'],
        [/leaderboard|top performers|recognition rank|kudos/, 'leaderboard'], [/hiring funnel|recruit|hiring pipeline/, 'funnel'],
        [/kpi tiles|people kpi|headline (metrics|kpi)/, 'kpi'],
        [/risk|attrition|quit|flight/, 'flightrisk'], [/comp\b|salary|underpaid/, 'compperf'], [/coverage|availability|leave plan/, 'coverage'], [/1:1|one.?on.?one|check.?in|meeting/, 'oneonone'], [/absence|bradford|sick|pattern/, 'bradford'], [/skill|gap|matrix|capability/, 'skills'], [/stuck|onboarding|workflow|blocked/, 'workflow'], [/survey|pulse|enps|sentiment/, 'survey'], [/reporting|org chart|span|directory/, 'orgspan']];
      const hasInlineData = /\d/.test(t); // numbers in the prompt mean the person brought data — prefer the widget path
      const hit = !hasInlineData ? map.find(([re]) => re.test(t)) : undefined;
      if (hit) { const template = hit[1]; const ex = s.vibeApps.find(v => v.template === template); const appId = ex ? ex.id : `vibe-${template}-${Date.now()}`; sfx.confirm(); d({ t: 'vibeCreate', template, appId, prompt: text }); return; }
      const specs = parseVizPrompt(fixedT);
      if (specs && specs.length) { sfx.confirm(); d({ t: 'vibeWidgets', specs, prompt: text }); return; }
      const tmplHit = map.find(([re]) => re.test(t)); // data-less template fallback when the widget parse found nothing
      if (tmplHit) { const template = tmplHit[1]; const ex = s.vibeApps.find(v => v.template === template); const appId = ex ? ex.id : `vibe-${template}-${Date.now()}`; sfx.confirm(); d({ t: 'vibeCreate', template, appId, prompt: text }); return; }
      d({ t: 'vibeSay', turns: [{ id: `u${Date.now()}`, role: 'user', text }, { id: `q${Date.now() + 1}`, role: 'q', text: 'I can build ready-made tools (flight-risk, comp, coverage, headcount, attrition, heatmap, leaderboard, hiring funnel…) or draw a widget from your own numbers — try “bar chart design 12 engineering 18 product 9”, “trend 40, 52, 61, 58 for weekly output”, “gauge 75% for onboarding completion”, or “a KPI and a trend for attrition”.' }] });
    },
    clearVibeChat: () => d({ t: 'vibeClear' }),
    removeVibe: id => { sfx.close(); d({ t: 'vibeRemove', id }); }, pinVibe: id => { sfx.merge(); d({ t: 'vibePin', id }); }, unpinVibe: id => d({ t: 'vibeUnpin', id }),
    sendInsights: id => { sfx.merge(); d({ t: 'vibeInsight', id, on: true }); }, removeInsights: id => d({ t: 'vibeInsight', id, on: false }),
    boardAdd: (kind, ref) => { sfx.pickup(); d({ t: 'boardAdd', kind, ref, lens: s.lens }); }, boardRemove: id => d({ t: 'boardRemove', id }), boardReorder: (id, toIndex) => { sfx.pickup(); d({ t: 'boardReorder', id, toIndex, lens: s.lens }); }, boardMove: (id, x, y) => d({ t: 'boardMove', id, x, y }), boardResize: (id, w, h) => d({ t: 'boardResize', id, w, h }), boardToQ: id => { sfx.confirm(); d({ t: 'boardToQ', id }); }, boardCombine: (idA, idB) => { sfx.merge(); d({ t: 'boardCombine', idA, idB }); },
    renameVibe: (id, title) => d({ t: 'vibeRename', id, title }), duplicateVibe: id => { sfx.pickup(); d({ t: 'vibeDuplicate', id, newId: `vibe-copy-${Date.now()}` }); }, refineVibe: (id, note) => { sfx.confirm(); d({ t: 'vibeRefine', id, note }); }, combineVibe: (parts, title) => { sfx.merge(); d({ t: 'vibeCombine', newId: `vibe-dash-${Date.now()}`, parts, title }); }, createWidget: (kind, label) => { sfx.confirm(); d({ t: 'vibeWidget', newId: `vibe-w-${Date.now()}`, config: { kind, label }, prompt: `Build a ${kind} for ${label}` }); }, setWidgetKind: (id, kind) => { sfx.hover(); d({ t: 'widgetKind', id, kind }); }, setHomeView: view => { try { localStorage.setItem('q_homeview', view); } catch {} d({ t: 'homeView', view }); }, wsAdd: (kind, x, y) => { sfx.pickup(); d({ t: 'wsAdd', kind, x, y }); }, wsAddTool: toolRef => { sfx.merge(); d({ t: 'wsAddTool', toolRef }); }, wsToCanvas: id => { sfx.merge(); d({ t: 'wsToCanvas', id }); }, wsUpdate: (id, patch) => d({ t: 'wsUpdate', id, patch }), wsMove: (id, x, y) => d({ t: 'wsMove', id, x, y }), wsDelete: id => { sfx.close(); d({ t: 'wsDelete', id }); }, wsFront: id => d({ t: 'wsFront', id }), wsConnect: (fromId, toId, fromSide, toSide) => { sfx.merge(); d({ t: 'wsConnect', fromId, toId, fromSide, toSide }); }, wsResize: (id, w, h) => d({ t: 'wsResize', id, w, h }), wsDisconnect: id => { sfx.close(); d({ t: 'wsDisconnect', id }); }, wsConnUpdate: (id, patch) => d({ t: 'wsConnUpdate', id, patch }), wsToQ: id => { sfx.confirm(); d({ t: 'wsToQ', id }); }, wsToSignal: id => { sfx.pickup(); d({ t: 'wsToSignal', id }); }, wsShare: (id, personId) => { sfx.merge(); d({ t: 'wsShare', id, personId }); }, wsUnshare: (id, personId) => d({ t: 'wsUnshare', id, personId }), wsBoardName: (fb, name) => d({ t: 'wsBoardName', fb, name }), wsBoardDelete: fb => { sfx.close(); d({ t: 'wsBoardDelete', fb }); }, wsBoardMove: (fb, dx, dy) => d({ t: 'wsBoardMove', fb, dx, dy }), wsBoardOrganize: fb => { sfx.merge(); d({ t: 'wsBoardOrganize', fb }); }, wsJoinBoard: (id, fb) => d({ t: 'wsJoinBoard', id, fb }), wsBoardPad: (fb, pad) => d({ t: 'wsBoardPad', fb, pad }), wsAddConnected: (fromId, side, kind) => { sfx.pickup(); d({ t: 'wsAddConnected', fromId, side, kind }); }, publishTool: (appId, to) => { sfx.merge(); d({ t: 'publishTool', appId, to }); }, unpublishTool: appId => { sfx.close(); d({ t: 'unpublishTool', appId }); }, hideShared: appId => { sfx.close(); d({ t: 'hideShared', appId }); }, togglePay: () => d({ t: 'togglePay' }), addHoliday: (label, date, kind) => { sfx.confirm(); d({ t: 'addHoliday', label, date, kind }); }, removeHoliday: id => d({ t: 'removeHoliday', id }), setAllot: (typeId, days) => d({ t: 'setAllot', typeId, days }), addPerson: (name, role, department, managerId) => { sfx.confirm(); d({ t: 'addPerson', name, role, department, managerId }); }, addCandidate: (name, stage) => { sfx.confirm(); d({ t: 'addCandidate', name, stage }); }, newCanvas: () => { sfx.close(); d({ t: 'newCanvas' }); }, loadCanvas: id => { sfx.hover(); d({ t: 'loadCanvas', id }); },
    peel: id => d({ t: 'peel', id }), reset: () => d({ t: 'reset' }),
    toggleSelect: id => d({ t: 'select', id }), clearSel: () => d({ t: 'clearSel' }), setDragging: on => d({ t: 'dragging', on }), setQHover: level => d({ t: 'qHover', level }),
    clockIn: () => { sfx.confirm(); d({ t: 'clockIn' }); }, clockOut: () => { sfx.close(); d({ t: 'clockOut' }); }, breakStart: () => { sfx.close(); d({ t: 'breakStart' }); }, breakEnd: () => { sfx.confirm(); d({ t: 'breakEnd' }); },
    approve: id => { sfx.confirm(); d({ t: 'approve', id }); }, reject: id => { sfx.reject(); d({ t: 'reject', id }); }, bulkApprove: () => { sfx.confirm(); d({ t: 'bulkApprove' }); },
    hold: id => { sfx.close(); d({ t: 'hold', id }); }, resume: id => { sfx.hover(); d({ t: 'resume', id }); }, setDelegate: id => d({ t: 'delegate', id }), approveMany: ids => { sfx.confirm(); d({ t: 'approveMany', ids }); }, rejectMany: ids => { sfx.reject(); d({ t: 'rejectMany', ids }); },
    setLegend: on => d({ t: 'legend', on }), setTour: on => { if (!on) { try { localStorage.setItem('qbx_onboarded_v1', '1'); } catch {} } d({ t: 'tour', on }); }, toggleOnboardingTask: id => { sfx.confirm(); d({ t: 'onbTask', id }); }, assignBuddy: (candidateId, personId) => { sfx.merge(); d({ t: 'assignBuddy', candidateId, personId }); }, toggleJoinerTask: (candidateId, taskId) => { sfx.confirm(); d({ t: 'toggleJoinerTask', candidateId, taskId }); }, toggleExitTask: (leaverId, taskId) => { sfx.confirm(); d({ t: 'toggleExitTask', leaverId, taskId }); }, startOffboarding: (personId, reason, lastDay) => { sfx.confirm(); d({ t: 'startOffboarding', personId, reason, lastDay }); },
    createGoal: (title, dueOn) => { const owner = s.lens === 'employee' ? ME_ID : 'm1'; sfx.confirm(); d({ t: 'goalCreate', title, dueOn, owner, now: `${MONTHS[NOW.m]} ${NOW.d}` }); },
    cascadeGoal: id => { sfx.merge(); d({ t: 'goalCascade', id }); }, updateGoalProgress: (id, delta) => { sfx.hover(); d({ t: 'goalProgress', id, delta }); }, archiveGoal: id => { sfx.close(); d({ t: 'goalArchive', id }); },
    ooToggle: (ooId, actionId) => { sfx.confirm(); d({ t: 'ooToggle', ooId, actionId }); }, ooAddAction: (ooId, text) => { sfx.confirm(); d({ t: 'ooAddAction', ooId, text }); },
    submitSelfReview: (id, text) => { sfx.confirm(); d({ t: 'reviewSelf', id, text }); }, saveManagerReview: (id, text) => { sfx.confirm(); d({ t: 'reviewManager', id, text }); }, nudgeReviews: () => { sfx.confirm(); d({ t: 'reviewNudge' }); }, submitPulse: score => { sfx.confirm(); d({ t: 'pulseSubmit', score }); },
    compSet: (id, amount) => { sfx.hover(); d({ t: 'compSet', id, amount }); }, submitCompPlan: () => { sfx.merge(); d({ t: 'compSubmit' }); }, resetCompPlan: () => { sfx.close(); d({ t: 'compReset' }); }, approveCompPlan: () => { sfx.confirm(); d({ t: 'compApprove' }); },
    setCoverage: (id, personId) => { sfx.confirm(); d({ t: 'setCoverage', id, personId }); }, autoCoverAll: () => { sfx.merge(); d({ t: 'autoCover' }); },
    applyLeave: (k, m, st, e, dd, reason, convertedFrom) => { sfx.confirm(); d({ t: 'applyLeave', kind: k, mode: m, start: st, end: e, days: dd, reason, convertedFrom }); },
    addLeaveFor: (pid, k, m, st, e, dd) => d({ t: 'addLeaveFor', personId: pid, kind: k, mode: m, start: st, end: e, days: dd }),
    addType: (label, days) => d({ t: 'addType', label, days }),
    overridePayroll: id => d({ t: 'overridePayroll', id }), ackDoc: id => { sfx.confirm(); d({ t: 'ackDoc', id }); }, dismissCue: id => d({ t: 'dismissCue', id }),
    createEntity: patch => { const now = `${MONTHS[NOW.m]} ${NOW.d}`; const who = s.lens === 'hr' ? { id: 'hr', name: 'People Team' } : { id: 'm1', name: 'Marcus Vance' }; sfx.confirm(); d({ t: 'entityCreate', patch, authorId: who.id, authorName: who.name, now }); },
    updateEntity: (id, patch) => d({ t: 'entityUpdate', id, patch, now: `${MONTHS[NOW.m]} ${NOW.d}` }),
    publishEntity: id => { const now = `${MONTHS[NOW.m]} ${NOW.d}`; sfx.merge(); d({ t: 'entityPublish', id, now }); },
    nudgeNonAckers: id => { const now = `${MONTHS[NOW.m]} ${NOW.d}`; sfx.confirm(); d({ t: 'entityNudge', id, now }); },
    archiveEntity: id => { sfx.close(); d({ t: 'entityArchive', id, now: `${MONTHS[NOW.m]} ${NOW.d}` }); },
    ackEntity: id => { sfx.confirm(); d({ t: 'entityAck', id, now: `${MONTHS[NOW.m]} ${NOW.d}` }); },
    runIntent: t => { remember(s.lens, t); d({ t: 'qMood', mood: 'thinking' }); sfx.hover(); setTimeout(() => { d({ t: 'intent', text: t }); d({ t: 'qMood', mood: 'answering' }); sfx.confirm(); setTimeout(() => d({ t: 'qMood', mood: 'idle' }), 1100); }, 430); },
    setQ: o => d({ t: 'qOpen', open: o }),
    recallThread: () => lastThread(s.lens),
    ask: t => { remember(s.lens, t); d({ t: 'qMood', mood: 'thinking' }); sfx.hover(); setTimeout(() => { d({ t: 'ask', text: t }); d({ t: 'qMood', mood: 'answering' }); sfx.confirm(); setTimeout(() => d({ t: 'qMood', mood: 'idle' }), 1100); }, 430); },
    explainToken: (k, id) => d({ t: 'explain', kind: k, id }),
    simulate: (p, l) => d({ t: 'sim', personId: p, lever: l }), closeSim: () => d({ t: 'simClose' }),
    toast: (m, tone) => d({ t: 'toast', toast: mk(m, tone) }), dropToast: id => d({ t: 'dropToast', id }),
    hide: id => d({ t: 'hide', id }), unhide: id => d({ t: 'unhide', id }),
    spawnSynth: token => d({ t: 'spawn', token }), dismissSynth: id => d({ t: 'dismissSynth', id }),
    pulse: (x, y, tone) => d({ t: 'pulse', pulse: { id: `pu${++uid}`, x, y, tone } }), dropPulse: id => d({ t: 'dropPulse', id }),
    setSound: on => d({ t: 'sound', on }), explainCluster: ids => d({ t: 'cluster', ids }), combineStack: ids => d({ t: 'combineStack', ids }), setMood: m => d({ t: 'qMood', mood: m }), setPanel: (side, open) => d({ t: 'panel', side, open }),
  }), [s, reduced]);
  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useWorkspace(): Ctx { const c = useContext(C); if (!c) throw new Error('useWorkspace outside provider'); return c; }
