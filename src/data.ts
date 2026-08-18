import {
  PersonToken, LeaveToken, PayslipToken, DocumentItem, CalendarEvent,
  Cue, OnboardingCandidate, OnbChecklistItem, Leaver, LeaveType, Attendance,
} from './types';

export const TENANT = { name: 'Qubryx', city: 'Jaipur, India', logo: 'Q' };
export const ME_ID = 'p1';
export const MANAGER_ID = 'm1';
export const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep'];

// Seeded attendance history so the calendar can show present/absent markers for
// past days. Deterministic from (m,d). 'weekend' every ~6th/7th ordinal, a couple
// of seeded 'leave' and 'absent' days, else 'present'. Future days → 'none'.
// A real deployment reads this from the attendance service.
export type DayStatus = 'present' | 'absent' | 'leave' | 'weekend' | 'none';
const SEEDED_LEAVE = new Set(['1:14', '1:15', '0:24']);   // m:d
const SEEDED_ABSENT = new Set(['1:8', '0:16']);
export function dayStatus(m: number, d: number): DayStatus {
  const now = (1 * 100) + 22;                 // NOW = Jul 22 → ordinal key
  const here = (m * 100) + d;
  if (here > now) return 'none';              // future
  // seeded leave/absent take priority over the weekend pattern
  if (SEEDED_LEAVE.has(`${m}:${d}`)) return 'leave';
  if (SEEDED_ABSENT.has(`${m}:${d}`)) return 'absent';
  const ord = (m * 31) + d;
  if (ord % 7 === 5 || ord % 7 === 6) return 'weekend';
  return 'present';
}
export const NOW = { m: 1, d: 22 }; // index into MONTHS → Jul 22

export const PEOPLE: PersonToken[] = [
  { id: 'm1', type: 'person', name: 'Marcus Vance',  role: 'VP of Design',         department: 'Design',      status: 'active',      velocity: 0.7,  attendance: 0.96 },
  { id: 'p1', type: 'person', name: 'Alex Mercer',   role: 'Senior UX Researcher', department: 'Design',      status: 'active',      managerId: 'm1', velocity: 0.85, attendance: 0.93 },
  { id: 'p2', type: 'person', name: 'Sarah Jenkins', role: 'Principal Architect',  department: 'Engineering', status: 'flight_risk', managerId: 'm1', velocity: 0.9,  attendance: 0.71,
    flightRiskReason: 'Attendance consistency down 22% over 6 weeks, comp 11% below band, zero internal-mobility activity. Confidence 0.78.' },
  { id: 'p3', type: 'person', name: 'David Cho',     role: 'Senior Designer',      department: 'Design',      status: 'active',      managerId: 'm1', velocity: 0.6,  attendance: 0.9 },
  { id: 'p4', type: 'person', name: 'Elena Rostova', role: 'Staff AI Engineer',    department: 'Engineering', status: 'on_leave',    managerId: 'm1', velocity: 0.75, attendance: 0.88 },
  { id: 'p5', type: 'person', name: 'Priya Nair',    role: 'Product Designer',     department: 'Design',      status: 'active',      managerId: 'm1', velocity: 0.5,  attendance: 0.82 },
  { id: 'p6',  type: 'person', name: 'Tomas Berg',      role: 'Frontend Engineer',    department: 'Engineering', status: 'active',   managerId: 'p2', velocity: 0.72, attendance: 0.94 },
  { id: 'p7',  type: 'person', name: 'Ravi Menon',      role: 'Backend Engineer',     department: 'Engineering', status: 'active',   managerId: 'p2', velocity: 0.68, attendance: 0.91 },
  { id: 'p8',  type: 'person', name: 'Chloe Dupont',    role: 'UX Researcher',        department: 'Design',      status: 'on_leave', managerId: 'p3', velocity: 0.6,  attendance: 0.89 },
  { id: 'p9',  type: 'person', name: 'Marco Rossi',     role: 'Data Analyst',         department: 'Data',        status: 'active',   managerId: 'p10', velocity: 0.77, attendance: 0.95 },
  { id: 'p10', type: 'person', name: 'Aisha Khan',      role: 'Product Manager',      department: 'Product',     status: 'active',   managerId: 'm1', velocity: 0.81, attendance: 0.9 },
  { id: 'p11', type: 'person', name: 'Ben Carter',      role: 'QA Engineer',          department: 'Engineering', status: 'active',   managerId: 'p2', velocity: 0.55, attendance: 0.87 },
  { id: 'p12', type: 'person', name: 'Lena Fischer',    role: 'Content Designer',     department: 'Design',      status: 'active',   managerId: 'p3', velocity: 0.63, attendance: 0.92 },
  { id: 'p13', type: 'person', name: 'Omar Haddad',     role: 'DevOps Engineer',      department: 'Engineering', status: 'active',   managerId: 'p2', velocity: 0.7,  attendance: 0.93 },
  { id: 'p14', type: 'person', name: 'Grace Liu',       role: 'Data Scientist',       department: 'Data',        status: 'flight_risk', managerId: 'p10', velocity: 0.86, attendance: 0.76,
    flightRiskReason: 'Comp 9% below band and two declined internal projects. Confidence 0.61.' },
  { id: 'p15', type: 'person', name: 'Noah Schmidt',    role: 'Frontend Engineer',    department: 'Engineering', status: 'active',   managerId: 'p2', velocity: 0.66, attendance: 0.9 },
  { id: 'p16', type: 'person', name: 'Sofia Reyes',     role: 'Design Ops',           department: 'Design',      status: 'active',   managerId: 'p3', velocity: 0.58, attendance: 0.94 },
  { id: 'p17', type: 'person', name: 'Ivan Petrov',     role: 'Backend Engineer',     department: 'Engineering', status: 'on_leave', managerId: 'p2', velocity: 0.74, attendance: 0.88 },
  { id: 'p18', type: 'person', name: 'Maya Okafor',     role: 'UX Writer',            department: 'Design',      status: 'active',   managerId: 'p3', velocity: 0.61, attendance: 0.91 },
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  { id: 'earned', label: 'Earned', balance: 14 },
  { id: 'sick', label: 'Sick', balance: 8 },
  { id: 'casual', label: 'Casual', balance: 6 },
  { id: 'rh', label: 'Restricted', balance: 2 },
];

export const INITIAL_ATTENDANCE: Attendance = {
  status: 'in', sessionStart: Date.now() - 3 * 3600_000 - 12 * 60_000,
  breakStart: null, workedMs: 0, breakMs: 18 * 60_000, breaks: 1,
};

export const LEAVES: LeaveToken[] = [
  { id: 'l1', type: 'leave_request', personId: 'p2', personName: 'Sarah Jenkins', kind: 'earned', mode: 'range', startDate: '01 Jul', endDate: '05 Jul', days: 5, reason: 'Family', status: 'pending', isSlaBreached: true, conflictWith: 'David Cho' },
  { id: 'l2', type: 'leave_request', personId: 'p4', personName: 'Elena Rostova', kind: 'earned', mode: 'range', startDate: '25 Jul', endDate: '28 Jul', days: 4, reason: 'Vacation', status: 'pending' },
  { id: 'l3', type: 'leave_request', personId: 'p3', personName: 'David Cho',     kind: 'sick',   mode: 'full',  startDate: '02 Jul', endDate: '02 Jul', days: 1, reason: 'Unwell', status: 'pending' },
];

export const PAYSLIPS: PayslipToken[] = [
  { id: 'pay_jun', type: 'payslip', personName: 'Alex Mercer', month: 'Jun 2026', amount: 145000, status: 'pooled', anomalyReason: 'Withholding anomalous after a Rajasthan→Karnataka relocation. State tax code changed mid-cycle; Q recomputed TDS and flagged the delta for human sign-off.' },
  { id: 'pay_may', type: 'payslip', personName: 'Alex Mercer', month: 'May 2026', amount: 145000, status: 'released' },
  { id: 'pay_apr', type: 'payslip', personName: 'Alex Mercer', month: 'Apr 2026', amount: 142000, status: 'released' },
];

export const INITIAL_HOLIDAYS = [
  { id: 'h1', label: 'Foundation Day', date: '4 Aug', kind: 'company' as const },
  { id: 'h2', label: 'Independence Day', date: '15 Aug', kind: 'national' as const },
  { id: 'h3', label: 'Raksha Bandhan', date: '28 Aug', kind: 'restricted' as const },
  { id: 'h4', label: 'Gandhi Jayanti', date: '2 Oct', kind: 'national' as const },
  { id: 'h5', label: 'Diwali', date: '8 Nov', kind: 'national' as const },
  { id: 'h6', label: 'Bhai Dooj', date: '10 Nov', kind: 'restricted' as const },
];

export const DOCUMENTS: DocumentItem[] = [
  { id: 'd1', title: 'Employee Handbook 2026', category: 'Handbook', version: 'v4.0', updated: '12 Jun', mustAck: true,  acked: false, summary: 'Code of conduct, working hours, and the new hybrid-work charter for all Qubryx staff.' },
  { id: 'd2', title: 'WFH Hardware Allowance',  category: 'Policy',   version: 'v2.1', updated: '08 Jun', mustAck: true,  acked: false, summary: '₹60,000 biennial allowance, eligible items, and the reimbursement flow through the Continuum.' },
  { id: 'd3', title: 'Leave & Holiday Policy',  category: 'Policy',   version: 'v3.2', updated: '20 May', mustAck: false, acked: true,  summary: 'Accrual rules, RH selection, encashment, and region-specific holiday calendars.' },
  { id: 'd4', title: 'Data Protection Standard',category: 'Compliance', version: 'v1.4', updated: '02 Jun', mustAck: true, acked: false, summary: 'Handling of employee PII, retention windows, and access-audit expectations.' },
  { id: 'd5', title: 'Health & Wellness Benefits', category: 'Benefits', version: 'v2.0', updated: '15 Apr', mustAck: false, acked: true, summary: 'Insurance, OPD, mental-health support, and the wellness half-day programme.' },
];

// m = index into MONTHS
export const CALENDAR: CalendarEvent[] = [
  { id: 'c1', m: 1, d: 4,  label: 'Foundation Day', kind: 'holiday' },
  { id: 'c2', m: 1, d: 11, label: 'Optional: Eid (RH)', kind: 'rh' },
  { id: 'c3', m: 1, d: 18, label: 'Design Review Offsite', kind: 'event' },
  { id: 'c4', m: 1, d: 23, label: "Priya's birthday", kind: 'birthday', person: 'Priya Nair' },
  { id: 'c5', m: 1, d: 1,  label: 'Sarah — leave (1–5)', kind: 'leave', person: 'Sarah Jenkins' },
  { id: 'c6', m: 1, d: 25, label: 'Elena — leave (25–28)', kind: 'leave', person: 'Elena Rostova' },
  { id: 'c7', m: 0, d: 16, label: 'Town Hall', kind: 'event' },
  { id: 'c8', m: 0, d: 9,  label: "David's birthday", kind: 'birthday', person: 'David Cho' },
  { id: 'c9', m: 2, d: 15, label: 'Independence Day', kind: 'holiday' },
  { id: 'c10', m: 2, d: 7, label: 'Product Launch', kind: 'event' },
  { id: 'c11', m: 3, d: 5, label: 'Optional: Onam (RH)', kind: 'rh' },
  { id: 'c12', m: 3, d: 20, label: 'Q3 Review', kind: 'event' },
];

// Single source of truth for holidays: parse a "4 Aug" string against MONTHS and
// project the live holidays[] state into CalendarEvent shape. RH (restricted) maps
// to the 'rh' kind so it renders as choose-carefully; national/company are 'holiday'.
export function holidaysToEvents(holidays: { id: string; label: string; date: string; kind: 'national' | 'company' | 'restricted' }[]): CalendarEvent[] {
  const monthIx = (mon: string) => MONTHS.findIndex(x => x.toLowerCase() === mon.slice(0, 3).toLowerCase());
  return holidays.map(h => {
    const m = h.date.match(/(\d{1,2})\s*([A-Za-z]{3,})/);
    if (!m) return null;
    const d = +m[1]; const mi = monthIx(m[2]);
    if (mi < 0) return null;   // outside the visible Jun–Sep window; skip silently
    return { id: `hol-${h.id}`, m: mi, d, label: h.kind === 'restricted' ? `Optional: ${h.label} (RH)` : h.label, kind: h.kind === 'restricted' ? 'rh' as const : 'holiday' as const } as CalendarEvent;
  }).filter((e): e is CalendarEvent => !!e);
}

export const CUES: Cue[] = [
  // My World (employee) — personal only
  { id: 'e1', persona: 'employee', kind: 'wellness', message: "You've worked late three nights running, and Friday's light. Want a wellness half-day on the books?", actionText: 'Open calendar' },
  { id: 'e2', persona: 'employee', kind: 'doc', message: '2 policies need your acknowledgment, including the new Handbook v4.0.', actionText: 'Open documents' },
  { id: 'e3', persona: 'employee', kind: 'wellness', message: 'Your timesheet for this period is due Friday — 14h of hours are still unsubmitted.', actionText: 'Review my hours' },
  { id: 'e4', persona: 'employee', kind: 'doc', message: 'I caught and corrected a mismatch in your recorded role title — it now reads “Senior UX Researcher”. Nothing needed from you.', actionText: 'See what changed' },
  { id: 'e5', persona: 'employee', kind: 'payroll', message: 'Your June pay is pooling — a relocation changed your tax code, so it needs a sign-off before release.', actionText: 'Open payroll' },
  { id: 'e6', persona: 'employee', kind: 'nudge', from: 'Marcus Vance', message: 'Marcus nudged you: your timesheet is due Friday — 14h still unsubmitted.', actionText: 'Submit hours' },
  // My Team (manager) — team only, never personal
  { id: 'm1', persona: 'manager', kind: 'sla', message: '3 leave approvals are pending on your desk — one breaches SLA in under 2h.', actionText: 'Review approvals' },
  { id: 'm2', persona: 'manager', kind: 'risk', message: "Sarah Jenkins' flight-risk rose to 0.78 — attendance down 22% over six weeks.", actionText: 'Open team' },
  { id: 'm3', persona: 'manager', kind: 'coverage', message: 'Design has a coverage gap Jul 25–28 — Elena on leave overlaps David’s pending request.', actionText: 'Open availability' },
  { id: 'm4', persona: 'manager', kind: 'review', message: 'Q2 review cycle: 2 of 5 self-reviews are still outstanding on your team.', actionText: 'Open insights' },
  { id: 'm5', persona: 'manager', kind: 'sla', message: 'Timesheet compliance is at 78% — 3 reports haven’t submitted this period.', actionText: 'Nudge them' },
  // The Org (HR) — org-wide
  { id: 'h1', persona: 'hr', kind: 'payroll', message: 'June payroll is pooling on one node — a relocation changed a state tax code.', actionText: 'Open payroll' },
  { id: 'h2', persona: 'hr', kind: 'onboarding', message: 'Aisha Khan is 90% through onboarding — time to assign a start buddy.', actionText: 'Open onboarding' },
  { id: 'h3', persona: 'hr', kind: 'doc', message: 'Policy acknowledgment sits at 72% org-wide — Handbook v4.0 is still pending for 34 people.', actionText: 'Open policies' },
  { id: 'h4', persona: 'hr', kind: 'headcount', message: '4 attendance anomalies were flagged this week across 2 teams.', actionText: 'Open insights' },
  { id: 'h5', persona: 'hr', kind: 'risk', message: '2 exits are pending in the next 30 days — knowledge transfer isn’t scheduled yet.', actionText: 'Open org' },
];

// Context-rich approvals — same-reason days booked in the last 12 months (personId:kind)
export const LEAVE_HISTORY: Record<string, number> = { 'p2:earned': 12, 'p4:earned': 9, 'p3:sick': 4, 'p5:casual': 3 };

// A standard day-one checklist every joiner gets. `owner` says who acts; progress
// is derived from how many are done, so there's no separate progress number to drift.
export const ONBOARD_TEMPLATE: { label: string; owner: string }[] = [
  { label: 'Offer signed & background check', owner: 'People Team' },
  { label: 'Device provisioned & shipped', owner: 'IT' },
  { label: 'Accounts & access granted', owner: 'IT' },
  { label: 'Start buddy assigned', owner: 'People Team' },
  { label: 'Payroll & tax declaration set up', owner: 'Joiner' },
  { label: 'Employee Handbook acknowledged', owner: 'Joiner' },
  { label: 'First 1:1 with manager booked', owner: 'Manager' },
  { label: 'Security Awareness training done', owner: 'Joiner' },
];
export function makeChecklist(prefix: string, doneCount: number): OnbChecklistItem[] {
  return ONBOARD_TEMPLATE.map((t, i) => ({ id: `${prefix}-k${i}`, label: t.label, owner: t.owner, done: i < doneCount }));
}

export const ONBOARDING: OnboardingCandidate[] = [
  { id: 'o1', name: 'James Gordon', role: 'Backend Engineer', startDate: '4 Aug', stage: 'Invite sent',       progress: 33, checklist: makeChecklist('o1', 2) },
  { id: 'o2', name: 'Liam Patel',   role: 'Product Designer',  startDate: '11 Aug', stage: 'Device provision',  progress: 66, checklist: makeChecklist('o2', 4) },
  { id: 'o3', name: 'Aisha Khan',   role: 'Data Analyst',      startDate: '18 Aug', stage: 'Policy assignment', progress: 90, checklist: makeChecklist('o3', 7) },
];

// Offboarding — the mirror of onboarding. A standard exit checklist; `owner` says
// who acts; progress derives from completed items. The ordering matters for a clean
// exit: knowledge transfer and asset return before access is finally revoked.
export const OFFBOARD_TEMPLATE: { label: string; owner: string }[] = [
  { label: 'Resignation acknowledged & last day set', owner: 'People Team' },
  { label: 'Knowledge transfer & handover plan', owner: 'Manager' },
  { label: 'Reassign open work & ownership', owner: 'Manager' },
  { label: 'Company assets returned (laptop, badge)', owner: 'IT' },
  { label: 'Exit interview completed', owner: 'People Team' },
  { label: 'Final settlement & full-and-final pay', owner: 'Finance' },
  { label: 'Access & accounts revoked', owner: 'IT' },
  { label: 'Alumni record & references noted', owner: 'People Team' },
];
export function makeExitChecklist(prefix: string, doneCount: number): OnbChecklistItem[] {
  return OFFBOARD_TEMPLATE.map((t, i) => ({ id: `${prefix}-x${i}`, label: t.label, owner: t.owner, done: i < doneCount }));
}
export const OFFBOARDING: Leaver[] = ([
  { id: 'x1', name: 'Tomas Berg',  role: 'Frontend Engineer', lastDay: '29 Aug', reason: 'Resigned' as const,     checklist: makeExitChecklist('x1', 2) },
  { id: 'x2', name: 'Chloe Dupont', role: 'UX Researcher',    lastDay: '12 Sep', reason: 'Contract end' as const, checklist: makeExitChecklist('x2', 5) },
]).map(l => ({ ...l, progress: Math.round(l.checklist.filter(k => k.done).length / l.checklist.length * 100) }));

export const HR_METRICS = [
  { label: 'Active headcount', value: '124', tone: 'normal' as const },
  { label: 'Attendance anomalies', value: '4', tone: 'ember' as const },
  { label: 'Policy acknowledged', value: '72%', tone: 'normal' as const },
  { label: 'Pending exits', value: '2', tone: 'normal' as const },
];

export const ATTENDANCE_TIMELINE = [
  { t: '09:02', label: 'Clock in', state: 'ok' as const },
  { t: '11:30', label: 'Geofence ok', state: 'ok' as const },
  { t: '13:15', label: 'Missing punch', state: 'gap' as const },
  { t: '18:40', label: 'Clock out', state: 'ok' as const },
];

export const ATTENDANCE_SERIES = [92, 94, 90, 88, 84, 79, 74, 71];
export const TEAM_ATTENDANCE = [96, 93, 71, 90, 88, 82];
export const COMP_BANDS = [
  { band: 'Below band', pct: 18, tone: 'ember' as const },
  { band: 'In band', pct: 67, tone: 'lumen' as const },
  { band: 'Above band', pct: 15, tone: 'halo' as const },
];
export const WORKLOAD = [[2,3,3,2,1],[1,2,2,1,1],[3,3,3,3,2],[2,2,1,2,1],[1,1,2,1,0],[2,3,2,2,2]];


// --- Employee self-service extras (My World) ---
export const TODOS = [
  { id: 'todo1', label: 'Submit June reimbursement (₹4,200)', due: '2 days', kind: 'money' as const },
  { id: 'todo2', label: 'Declare investments before the window closes', due: '5 days', kind: 'tax' as const },
  { id: 'todo3', label: 'Finish the Security Awareness module', due: '1 week', kind: 'learning' as const },
];
export const KUDOS = { from: 'Priya Nair', message: 'appreciated your research readout in the design review', received: 3, given: 1 };
export const REIMBURSEMENT = { pendingAmount: 4200, submitted: 1, status: 'In review', expiringAmount: 8600, expiringIn: '24 days' };
export const LEARNING = { assigned: 2, due: 'Security Awareness due in 1 week', progress: 40 };

// Worked-vs-expected for the clock + on-demand chart series
export const PERIOD = { label: 'This period · Jul', worked: 118, expected: 160, daysLeft: 3 };
export const MY_HOURS = [{ w: 'Wk 1', worked: 41, expected: 40 }, { w: 'Wk 2', worked: 38, expected: 40 }, { w: 'Wk 3', worked: 44, expected: 40 }, { w: 'Wk 4', worked: 35, expected: 40 }];
export const MY_LEAVE = [{ type: 'Earned', taken: 6, total: 14 }, { type: 'Sick', taken: 2, total: 8 }, { type: 'Casual', taken: 3, total: 6 }, { type: 'RH', taken: 0, total: 2 }];

// Employee Journey timeline (personal history ribbon)
export const JOURNEY = [
  { id: 'j1', date: 'Feb 2022', title: 'Joined Lumen Labs', detail: 'UX Researcher on the Design team, Jaipur.', kind: 'join' as const },
  { id: 'j2', date: 'Aug 2022', title: 'First research shipped', detail: 'Led discovery for the onboarding redesign.', kind: 'milestone' as const },
  { id: 'j3', date: 'May 2023', title: 'Moved to core Design', detail: 'Transferred from Product Research into the core Design team.', kind: 'transfer' as const },
  { id: 'j4', date: 'Jan 2024', title: 'Promoted to Senior UX Researcher', detail: 'Recognised for research leadership and mentoring.', kind: 'promotion' as const },
  { id: 'j5', date: 'Apr 2025', title: 'Compensation revised +12%', detail: 'Adjusted at the annual cycle; now 62nd percentile in band.', kind: 'comp' as const },
  { id: 'j6', date: 'Sep 2025', title: 'Led the research-ops guild', detail: 'Founded the cross-team research-ops practice; now 9 members.', kind: 'milestone' as const },
  { id: 'j7', date: 'Feb 2026', title: 'Certified — Advanced UX Research', detail: 'Completed the NN/g advanced research certification.', kind: 'milestone' as const },
  { id: 'j8', date: 'Jun 2026', title: 'Kudos milestone', detail: 'Reached 3 kudos this quarter — recognised by Priya Nair.', kind: 'kudos' as const },
];

// Self-review AI summary (Growth)
export const SELF_REVIEW = {
  cycle: 'Q2 2026 · Self-review',
  strengths: ['Research depth and rigour', 'Cross-team collaboration', 'Mentoring junior designers'],
  blindspots: ['Communicating impact upward', 'Declining low-value requests'],
  alignment: { gap: 'medium' as const, note: 'You rate your communication higher than Marcus does — worth an alignment chat before the review.' },
  goals: [
    { label: 'Ship the research-ops playbook', progress: 70 },
    { label: 'Present findings to leadership monthly', progress: 40 },
    { label: 'Grow one mentee to independent research', progress: 55 },
  ],
};

// Week ahead + anniversaries
export const WEEK_AHEAD = [
  { id: 'wa1', date: 'Tomorrow', label: "Priya's birthday", kind: 'birthday' as const },
  { id: 'wa2', date: '25–28 Jul', label: 'Elena on leave', kind: 'leave' as const },
  { id: 'wa3', date: '4 Aug', label: 'Foundation Day', kind: 'holiday' as const },
  { id: 'wa4', date: '12 Aug', label: '2 years at Lumen Labs', kind: 'anniversary' as const },
  { id: 'wa5', date: '15 Aug', label: 'Independence Day', kind: 'holiday' as const },
];

export const SUGGESTIONS = [
  'Show team attendance trend',
  'Why is Sarah a flight risk?',
  'Open the pay run',
  'Show comp distribution',
  'I want to take leave',
  'Approve all pending leave',
  'Show team availability',
  'What needs my acknowledgment?',
  'What is my reimbursement status?',
  'How much leave will lapse this year?',
  'Can I work remotely on Friday?',
  "What's my leave policy?",
  'Show my hours this month',
  'Summarize everything that needs my action',
  'When is my next holiday?',
];

// Same prompts, organised for a calmer picker
export const SUGGESTION_GROUPS: Record<'employee' | 'manager' | 'hr', { label: string; items: string[] }[]> = {
  employee: [
    { label: 'Time & leave', items: ['I want to take leave', "What's my leave policy?", 'How much leave will lapse this year?', 'Can I work remotely on Friday?', 'Show my hours this month', 'When is my next holiday?'] },
    { label: 'Pay', items: ['Show my latest payslip', 'What is my reimbursement status?', 'When does my investment declaration close?'] },
    { label: 'Documents & growth', items: ['What needs my acknowledgment?', 'How am I tracking on my goals?', 'Prep my next 1:1 with Marcus', 'Help me draft my self-review'] },
    { label: 'Get organised', items: ['Summarize everything that needs my action'] },
  ],
  manager: [
    { label: 'My desk', items: ['What needs my attention?', 'Approve all pending and nudge the team', 'Auto-assign leave coverage', 'Show team availability'] },
    { label: 'People', items: ['Why is Sarah a flight risk?', 'Prep my 1:1 with Sarah', 'Where is the review cycle?', 'Simulate a retention move for Sarah'] },
    { label: 'Insights & planning', items: ['What changed this week?', 'How is attendance trending?', 'Team flight-risk trend', 'Can we afford 2 more engineers?', 'Help me plan compensation'] },
  ],
  hr: [
    { label: 'My desk', items: ['What needs my attention?', 'Open the pay run', 'Why did payroll change this month?', 'Which onboarding needs a buddy?', 'Who is offboarding?'] },
    { label: 'Org insights', items: ['What changed this quarter?', 'How is attrition trending?', 'Headcount over the last quarter', 'Show comp distribution', 'Remind those who haven\u2019t acknowledged'] },
    { label: 'Planning', items: ['Review comp drafts from managers', 'Show org-wide coverage'] },
  ],
};


// ---- My Team (manager) insight data ----
// Talent distribution — performance (x) × potential (y)
export const TALENT: { quadrant: 'star' | 'high-performer' | 'high-potential' | 'inconsistent'; ids: string[] }[] = [
  { quadrant: 'star', ids: ['p5'] },
  { quadrant: 'high-performer', ids: ['p3'] },
  { quadrant: 'high-potential', ids: ['p4'] },
  { quadrant: 'inconsistent', ids: ['p2'] },
];
// Team time-off heatmap — load per report per week (0 none · 1 some · 2 heavy)
export const TIMEOFF_GRID: { id: string; weeks: number[] }[] = [
  { id: 'p2', weeks: [0, 0, 1, 0] },
  { id: 'p3', weeks: [1, 0, 0, 0] },
  { id: 'p4', weeks: [0, 0, 2, 2] },
  { id: 'p5', weeks: [0, 1, 0, 0] },
];
// Manager directory — span of control
export const DIRECTORY = [
  { name: 'Marcus Vance', role: 'Engineering Manager', direct: 5, indirect: 0, total: 5 },
  { name: 'David Cho', role: 'Senior Engineer · tech lead', direct: 2, indirect: 0, total: 2 },
  { name: 'Priya Nair', role: 'Design lead', direct: 1, indirect: 0, total: 1 },
];

// ---- Vibe Studio: describe-a-tool → mini-app (Shapes "Vibe Views") ----
export const VIBE_TEMPLATES = [
  { id: 'flightrisk', title: 'Flight-risk board', prompt: 'Build a flight-risk board for my team', blurb: 'Ranks reports by attrition risk with the top driver.' },
  { id: 'compperf', title: 'Comp vs performance', prompt: 'Show comp against performance for my reports', blurb: 'Spots people underpaid relative to output.' },
  { id: 'coverage', title: 'Coverage planner', prompt: 'Make a two-week coverage planner', blurb: 'Where the team thins out, week by week.' },
  { id: 'oneonone', title: '1:1 tracker', prompt: 'Track my 1:1s and who is overdue', blurb: 'Last 1:1 per report and who is due.' },
  { id: 'bradford', title: 'Bradford absence score', prompt: 'Flag absence patterns with a Bradford score', blurb: 'Highlights frequent short absences.' },
  { id: 'skills', title: 'Skills matrix', prompt: "Map my team's skills and gaps", blurb: 'Skill coverage and gaps across the team.' },
  { id: 'workflow', title: 'Workflow board', prompt: 'Build a board of who is stuck in review or onboarding', blurb: 'Who is blocked, and for how long.' },
  { id: 'survey', title: 'Pulse survey', prompt: 'Draft a 3-question pulse survey and a results view', blurb: 'A quick pulse plus a live results read.' },
  { id: 'orgspan', title: 'Org & span', prompt: 'Map my team’s reporting lines and span of control', blurb: 'Direct, indirect and total reports.' },
  { id: 'kpi', title: 'KPI tiles', prompt: 'Show me headline people KPIs', blurb: 'Headcount, attrition, tenure and eNPS at a glance.' },
  { id: 'attrition', title: 'Attrition trend', prompt: 'Chart attrition over the last 8 months', blurb: 'Monthly voluntary attrition, trending down.' },
  { id: 'headcount', title: 'Headcount by team', prompt: 'Break headcount down by team', blurb: 'Where the people are, team by team.' },
  { id: 'bandladder', title: 'Comp band ladder', prompt: 'Show the compensation band ladder', blurb: 'Band ranges by level and who sits where.' },
  { id: 'heatmap', title: 'Engagement heatmap', prompt: 'Build an engagement heatmap by team and week', blurb: 'Weekly engagement across teams.' },
  { id: 'leaderboard', title: 'Recognition leaderboard', prompt: 'Who has the most recognition this quarter?', blurb: 'Top people by kudos points.' },
  { id: 'funnel', title: 'Hiring funnel', prompt: 'Show the hiring funnel', blurb: 'Applied to hired, stage by stage.' },
];
export const VIBE_FLIGHT = [{ id: 'p2', score: 0.78, driver: 'attendance ↓22%' }, { id: 'p5', score: 0.31, driver: 'engaged' }, { id: 'p4', score: 0.28, driver: 'on leave' }, { id: 'p3', score: 0.19, driver: 'stable' }];
export const VIBE_COMPPERF = [{ id: 'p2', perf: 82, comp: -11 }, { id: 'p3', perf: 74, comp: 3 }, { id: 'p4', perf: 68, comp: -4 }, { id: 'p5', perf: 90, comp: 6 }];
export const VIBE_ONEONONE = [{ id: 'p2', last: '12 days ago', due: true }, { id: 'p3', last: '4 days ago', due: false }, { id: 'p4', last: 'on leave', due: false }, { id: 'p5', last: '6 days ago', due: false }];
export const VIBE_BRADFORD = [{ id: 'p2', score: 128, flag: true }, { id: 'p5', score: 40, flag: false }, { id: 'p3', score: 18, flag: false }, { id: 'p4', score: 9, flag: false }];
export const VIBE_SKILLS = [
  { skill: 'Research', levels: { p2: 3, p3: 1, p4: 2, p5: 3 } },
  { skill: 'Design', levels: { p2: 2, p3: 1, p4: 3, p5: 3 } },
  { skill: 'Frontend', levels: { p2: 1, p3: 3, p4: 2, p5: 1 } },
  { skill: 'Data', levels: { p2: 2, p3: 3, p4: 1, p5: 2 } },
];

// Canvas module catalogue (Shapes-style building blocks). Clicking one seeds a prompt.
export const CANVAS_MODULES: { id: string; label: string; desc: string; builds: string[] }[] = [
  { id: 'retention', label: 'Retention war-room', desc: 'Flight-risk, comp-vs-performance and coverage — the full picture on who might leave.', builds: ['flightrisk', 'compperf', 'coverage'] },
  { id: 'quarter', label: 'Quarter kickoff', desc: 'Skills matrix, workflow board and a fresh pulse survey to open the quarter.', builds: ['skills', 'workflow', 'survey'] },
  { id: 'people', label: 'People overview', desc: 'Reporting lines and span of control alongside a 1:1 tracker.', builds: ['orgspan', 'oneonone'] },
  { id: 'absence', label: 'Attendance review', desc: 'Bradford absence scoring paired with a two-week coverage planner.', builds: ['bradford', 'coverage'] },
]

export const VIBE_WORKFLOW = [
  { id: 'p2', stage: 'Review', stuck: '4d', owner: 'you' },
  { id: 'p8', stage: 'Onboarding', stuck: '2d', owner: 'IT' },
  { id: 'p4', stage: 'Review', stuck: '6d', owner: 'you' },
  { id: 'p14', stage: 'Comp change', stuck: '1d', owner: 'HR' },
];
export const VIBE_SURVEY = {
  questions: ['How sustainable is your workload?', 'Do you feel recognised?', 'Clarity on goals this quarter?'],
  results: [{ label: 'Positive', pct: 62 }, { label: 'Neutral', pct: 26 }, { label: 'Negative', pct: 12 }],
};

// --- Phase 0/2: manager/HR authored entities (seed) ---
import type { Reimbursement, AssetItem, Entity } from './types';
export const ENTITIES: Entity[] = [
  { id: 'ent-1', type: 'document', title: 'Employee Handbook v4.0', body: 'The updated handbook covers the refreshed hybrid-work charter (2 days in-office), the new expense limits, and the revised leave encashment rules. Please read and acknowledge.', category: 'Handbook', audience: { scope: 'org' }, status: 'published', authorId: 'hr', authorName: 'People Team', version: 4, updated: 'Jul 1', requiresAck: true, ackedBy: [] },
  { id: 'ent-2', type: 'document', title: 'Design team — on-call & coverage', body: 'How we cover design reviews when someone is on leave: buddy pairs, the shared inbox rota, and escalation to Marcus for anything blocking a release.', category: 'Policy', audience: { scope: 'team', targetId: 'm1' }, status: 'published', authorId: 'm1', authorName: 'Marcus Vance', version: 1, updated: 'Jun 28', requiresAck: false, ackedBy: [] },
  { id: 'ent-3', type: 'document', title: 'Q3 research priorities (draft)', body: 'Draft priorities for the coming quarter — not yet shared with the team.', category: 'Policy', audience: { scope: 'team', targetId: 'm1' }, status: 'draft', authorId: 'm1', authorName: 'Marcus Vance', version: 1, updated: 'Jul 2', requiresAck: false, ackedBy: [] },
];

// --- Phase 3: new-joiner checklist (employee My World) ---
import type { OnbTask } from './types';
export const ONBOARD_TASKS: OnbTask[] = [
  { id: 't1', label: 'Complete your profile', hint: 'Photo, pronouns, working hours', done: true, owner: 'You' },
  { id: 't2', label: 'Acknowledge Employee Handbook v4.0', hint: 'Required in your first week', done: false, owner: 'People Team' },
  { id: 't3', label: 'Meet your onboarding buddy', hint: '30 min intro — Priya Nair', done: false, owner: 'Priya Nair' },
  { id: 't4', label: 'Set up payroll & tax declaration', hint: 'Bank details and 80C', done: false, owner: 'You' },
  { id: 't5', label: 'Book your first 1:1 with Marcus', hint: 'Week one', done: false, owner: 'Marcus Vance' },
  { id: 't6', label: 'Finish Security Awareness training', hint: '~30 min module', done: false, owner: 'You' },
];
export const ONBOARD_BUDDY = 'Priya Nair';

// --- Phase 4 seeds: goals, 1:1s, reviews ---
import type { Goal, OneOnOne, Review } from './types';
export const GOALS: Goal[] = [
  { id: 'g0', title: 'Ship the research-ops revamp this quarter', owner: 'm1', progress: 58, status: 'on_track', dueOn: 'Sep 30', createdBy: 'm1' },
  { id: 'g1', title: 'Run 6 generative studies for the revamp', owner: 'p1', progress: 60, status: 'on_track', parentId: 'g0', dueOn: 'Sep 30', createdBy: 'm1' },
  { id: 'g2', title: 'Publish the research repository v2', owner: 'p1', progress: 35, status: 'at_risk', dueOn: 'Aug 31', createdBy: 'p1' },
  { id: 'g3', title: 'Design system tokens for the new flows', owner: 'p3', progress: 72, status: 'on_track', parentId: 'g0', dueOn: 'Sep 15', createdBy: 'm1' },
  { id: 'g4', title: 'Architecture spike for realtime sync', owner: 'p2', progress: 40, status: 'at_risk', parentId: 'g0', dueOn: 'Sep 30', createdBy: 'm1' },
];
export const ONE_ON_ONES: OneOnOne[] = [
  { id: 'oo1', personId: 'p1', managerId: 'm1', scheduledFor: 'Thu, Jul 24 · 3:00 PM', agenda: ['Research-ops revamp progress', 'Repository v2 timeline risk', 'Growth: path to Staff'], actions: [{ id: 'a1', text: 'Marcus to unblock analytics access', done: false }, { id: 'a2', text: 'Alex to share study plan draft', done: true }] },
  { id: 'oo2', personId: 'p2', managerId: 'm1', scheduledFor: 'Fri, Jul 25 · 11:00 AM', agenda: ['Workload & on-call', 'Retention conversation'], actions: [{ id: 'a3', text: 'Discuss spot bonus', done: false }] },
  { id: 'oo3', personId: 'p3', managerId: 'm1', scheduledFor: 'Mon, Jul 28 · 2:00 PM', agenda: ['Design tokens rollout'], actions: [] },
];
export const REVIEWS: Review[] = [
  { id: 'r1', personId: 'p1', cycle: 'Q2 2026', status: 'not_started' },
  { id: 'r2', personId: 'p2', cycle: 'Q2 2026', status: 'self_submitted', self: 'Delivered the architecture spike; attendance dipped due to a family matter.' },
  { id: 'r3', personId: 'p3', cycle: 'Q2 2026', status: 'self_submitted', self: 'Shipped tokens ahead of schedule; want more scope next quarter.' },
  { id: 'r4', personId: 'p4', cycle: 'Q2 2026', status: 'complete', self: 'Strong quarter on the AI features.', manager: 'Agreed — promotion case to be prepared.' },
  { id: 'r5', personId: 'p5', cycle: 'Q2 2026', status: 'not_started' },
];

// --- Phase 6.2 seeds ---
import type { CompRow, CoverageEntry } from './types';
export const COMP_ROWS: CompRow[] = [
  { id: 'p1', salary: 1800000, min: 1600000, mid: 2000000, max: 2400000 },
  { id: 'p2', salary: 1500000, min: 1600000, mid: 2000000, max: 2400000 },
  { id: 'p3', salary: 2100000, min: 1800000, mid: 2200000, max: 2600000 },
  { id: 'p4', salary: 1950000, min: 1700000, mid: 2100000, max: 2500000 },
  { id: 'p5', salary: 1700000, min: 1600000, mid: 2000000, max: 2400000 },
];
export const COMP_BUDGET = 600000;
export const COVERAGE: CoverageEntry[] = [
  { id: 'c1', personId: 'p4', dates: 'On leave now \u2192 Jul 18', risk: 'AI features review', suggested: 'p3' },
  { id: 'c2', personId: 'p2', dates: 'Jul 25 \u2013 28', risk: 'Realtime sync spike', suggested: 'p1' },
  { id: 'c3', personId: 'p5', dates: 'Aug 1 \u2013 5', risk: 'Design tokens rollout', suggested: 'p3' },
];

// --- personal pay mini-series (thousands INR, net) ---
export const MY_PAY = [{ m: 'Mar', net: 142 }, { m: 'Apr', net: 145 }, { m: 'May', net: 145 }, { m: 'Jun', net: 145 }];

// --- Phase: expanded Canvas library ---
export const KPI_TILES = [
  { label: 'Headcount', value: '124', delta: '+6', up: true },
  { label: 'Attrition · 12m', value: '8.2%', delta: '-1.1', up: true },
  { label: 'Avg tenure', value: '3.4y', delta: '+0.2', up: true },
  { label: 'eNPS', value: '+38', delta: '+5', up: true },
];
export const ATTRITION_TREND = [1.2, 1.0, 1.4, 0.9, 1.1, 0.8, 1.0, 0.7];
export const HEADCOUNT_TEAMS = [
  { team: 'Engineering', n: 48 }, { team: 'Operations', n: 22 }, { team: 'Sales', n: 18 },
  { team: 'Design', n: 14 }, { team: 'Product', n: 12 }, { team: 'Data', n: 10 },
];
export const BAND_LADDER = [
  { level: 'L3', min: 12, max: 18, here: 2 }, { level: 'L4', min: 16, max: 24, here: 5 },
  { level: 'L5', min: 22, max: 32, here: 3 }, { level: 'L6', min: 30, max: 44, here: 1 },
];
export const ENGAGEMENT_HEAT = [
  { team: 'Eng', wk: [3, 4, 3, 4, 5] }, { team: 'Design', wk: [4, 4, 5, 4, 4] },
  { team: 'Product', wk: [3, 3, 2, 3, 4] }, { team: 'Data', wk: [5, 4, 4, 5, 5] },
];
export const LEADERBOARD = [
  { name: 'Priya Nair', pts: 48 }, { name: 'David Cho', pts: 41 }, { name: 'Alex Mercer', pts: 37 }, { name: 'Sarah Jenkins', pts: 29 },
];
export const HIRING_FUNNEL = [
  { stage: 'Applied', n: 320 }, { stage: 'Screened', n: 120 }, { stage: 'Interviewed', n: 44 }, { stage: 'Offered', n: 12 }, { stage: 'Hired', n: 8 },
];
export const KPI_SPARK = [42, 44, 41, 46, 48, 47, 50, 52];

/* ================= Phase D: metric snapshots =================
 * Seeded history so Q can reason over TIME, not just current values.
 * Each metric carries period-labelled points (oldest → newest); `goodDown`
 * marks metrics where a decrease is the improvement (attrition, risk).
 * `unit` and `fmt` drive narration and the delta badges (round 2). */
export type MetricKey = 'attrition' | 'headcount' | 'attendance' | 'engagement' | 'pending' | 'risk' | 'tenure';
export interface MetricSeries {
  key: MetricKey; label: string; unit: string; goodDown: boolean;
  periods: string[];            // aligned with values
  values: number[];            // oldest → newest
  scope: 'org' | 'team';
}
export const PERIODS_MONTH = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
export const PERIODS_WEEK = ['6w ago', '5w', '4w', '3w', '2w', 'Last wk', 'This wk'];

export const METRIC_SNAPSHOTS: MetricSeries[] = [
  { key: 'attrition', label: 'Voluntary attrition', unit: '%', goodDown: true, scope: 'org', periods: PERIODS_MONTH, values: [1.2, 1.0, 1.4, 0.9, 1.1, 0.8, 1.0, 0.7] },
  { key: 'headcount', label: 'Headcount', unit: '', goodDown: false, scope: 'org', periods: PERIODS_MONTH, values: [112, 114, 116, 118, 119, 121, 122, 124] },
  { key: 'tenure', label: 'Average tenure', unit: 'y', goodDown: false, scope: 'org', periods: PERIODS_MONTH, values: [3.0, 3.1, 3.1, 3.2, 3.2, 3.3, 3.3, 3.4] },
  { key: 'engagement', label: 'Engagement (eNPS)', unit: '', goodDown: false, scope: 'org', periods: PERIODS_MONTH, values: [30, 31, 29, 33, 34, 35, 36, 38] },
  { key: 'attendance', label: 'Team attendance', unit: '%', goodDown: false, scope: 'team', periods: PERIODS_WEEK, values: [94, 93, 92, 90, 89, 88, 86] },
  { key: 'pending', label: 'Pending approvals', unit: '', goodDown: true, scope: 'team', periods: PERIODS_WEEK, values: [2, 3, 1, 4, 2, 3, 5] },
  { key: 'risk', label: 'Team flight-risk score', unit: '', goodDown: true, scope: 'team', periods: PERIODS_WEEK, values: [0.30, 0.34, 0.41, 0.52, 0.61, 0.70, 0.78] },
];

export const REIMBURSEMENTS: Reimbursement[] = [
  { id: 'rb1', personId: ME_ID, title: 'Client visit — cab fares', category: 'Travel', amount: 4200, submitted: '18 Jun', status: 'submitted', receipt: 'cab-receipts-jun.pdf' },
  { id: 'rb2', personId: ME_ID, title: 'Mechanical keyboard', category: 'Hardware', amount: 8900, submitted: '02 Jun', status: 'approved', receipt: 'keyboard-invoice.pdf' },
  { id: 'rb3', personId: ME_ID, title: 'Broadband — May', category: 'Internet', amount: 1500, submitted: '05 May', status: 'paid', receipt: 'isp-may.pdf' },
];

export const ASSETS: AssetItem[] = [
  { id: 'as1', personId: ME_ID, name: 'MacBook Pro 14" M3', category: 'Laptop', serial: 'QBX-MBP-4471', assigned: '12 Jan 2026', condition: 'good', returnable: true },
  { id: 'as2', personId: ME_ID, name: 'Dell U2723QE monitor', category: 'Peripheral', serial: 'QBX-MON-1180', assigned: '12 Jan 2026', condition: 'good', returnable: true },
  { id: 'as3', personId: ME_ID, name: 'Office access badge', category: 'Access', serial: 'QBX-BDG-0912', assigned: '08 Jan 2026', condition: 'new', returnable: true },
];
