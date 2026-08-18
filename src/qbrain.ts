// qbrain — Q's lightweight natural-language understanding layer.
// Deterministic, on-device, zero-latency: token normalisation + typo correction
// (edit-distance against a domain lexicon), entity extraction (people, dates,
// regions, metrics), and a declarative intent table that runs BEFORE the legacy
// regex brain in store.answer(). Anything it can't confidently handle falls
// through, so nothing regresses.

import {
  Persona, Region, Highlight, QMsg,
  PersonToken, LeaveToken, PayslipToken, Goal, Review, CompState, Cue,
  PulseState, OnboardingCandidate, LeaveType,
} from './types';
import { computeDelta as anComputeDelta, narrate as anNarrate, whatChanged as anWhatChanged, fmtValue as anFmt } from './analytics';
import { threadsFor as memThreadsFor } from './memory';

// The minimal slice of store state the brain reads. store.State satisfies this structurally.
export interface BrainState {
  lens: Persona;
  people: PersonToken[];
  leaves: LeaveToken[];
  payslips: PayslipToken[];
  goals: Goal[];
  reviews: Review[];
  coverage: Record<string, string>;
  comp: CompState;
  cues: Cue[];
  survey: PulseState;
  candidates: OnboardingCandidate[];
  leaveTypes: LeaveType[];
  documents?: { id: string; title: string; category?: string; version?: string; mustAck?: boolean; acked?: boolean }[];
  holidays?: { id: string; label: string; date: string; kind: 'national' | 'company' | 'restricted' }[];
}

export interface BrainResult {
  reply: QMsg;
  region?: Region; lens?: Persona; highlight?: Highlight;
  board?: { kind: 'chart'; ref: string };
}

let uid = 9000;
const q = (text: string, extra?: Partial<QMsg>): QMsg => ({ id: `qb${++uid}`, role: 'q', text, ...extra });

/* ---------------- typo correction ---------------- */

// Domain lexicon — every keyword the intent layers (this file + legacy answer()) care about.
const LEXICON = [
  'approve', 'approved', 'reject', 'decline', 'deny', 'pending', 'leave', 'leaves', 'vacation', 'holiday', 'sick',
  'casual', 'earned', 'payslip', 'salary', 'payroll', 'reimbursement', 'expense', 'attendance', 'workload',
  'retention', 'flight', 'risk', 'coverage', 'cover', 'review', 'reviews', 'survey', 'pulse', 'sentiment',
  'goal', 'goals', 'objective', 'document', 'documents', 'handbook', 'policy', 'policies', 'acknowledge',
  'timesheet', 'nudge', 'remind', 'simulate', 'bonus', 'budget', 'compensation', 'headcount', 'attrition',
  'engagement', 'leaderboard', 'funnel', 'onboarding', 'offboarding', 'leaver', 'resignation', 'buddy', 'clock', 'break', 'focus', 'priority',
  'priorities', 'prioritise', 'prioritize', 'attention', 'urgent', 'tasks', 'board', 'planning', 'calendar', 'growth', 'analytics',
  'insights', 'approvals', 'team', 'people', 'manager', 'employee', 'tomorrow', 'today', 'friday',
  'available', 'availability', 'matrix', 'kudos', 'recognition', 'declaration', 'investment', 'heatmap',
  'dashboard', 'widget', 'gauge', 'trend', 'timeline', 'overdue', 'submit', 'balance', 'summary', 'summarize',
  'what', 'where', 'when', 'which', 'needs', 'show', 'take', 'open', 'give', 'tell', 'switch', 'create', 'assign', 'auto',
];

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    // restricted Damerau: adjacent transposition counts as a single edit ("waht" → "what")
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
  }
  return dp[a.length][b.length];
}

/** Corrects misspelled domain words token-by-token: "aprove sarahs leev" → "approve sarahs leave". */
export function fuzzyFix(text: string, extraWords: string[] = []): string {
  const vocab = [...LEXICON, ...extraWords.map(w => w.toLowerCase())];
  const vocabSet = new Set(vocab);
  return text.split(/(\s+)/).map(tok => {
    const w = tok.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length < 4 || vocabSet.has(w) || /\d/.test(tok)) return tok;
    const maxD = w.length >= 7 ? 2 : 1;
    let best: string | null = null; let bestD = maxD + 1;
    for (const v of vocab) {
      if (v[0] !== w[0]) continue; // anchor on first letter to keep corrections conservative
      const d = editDistance(w, v);
      if (d < bestD) { bestD = d; best = v; if (d === 0) break; }
    }
    return best && bestD <= maxD ? tok.toLowerCase().replace(w, best) : tok;
  }).join('');
}

/* ---------------- entity extraction ---------------- */

function findPerson(s: string, people: PersonToken[]): PersonToken | undefined {
  const toks = s.split(/[^a-z]+/).filter(t => t.length >= 3);
  for (const p of people) {
    const names = p.name.toLowerCase().split(' ');
    if (toks.some(t => names.some(n => n === t || (t.length >= 4 && n.startsWith(t))))) return p;
  }
  // fuzzy pass — tolerate one typo in a name ("sara" handled above; "sarha" here)
  for (const p of people) {
    const first = p.name.toLowerCase().split(' ')[0];
    if (toks.some(t => t.length >= 4 && editDistance(t, first) <= 1)) return p;
  }
  return undefined;
}

/* ---------------- navigation map ---------------- */

const NAV: { re: RegExp; region: Region; label: string; roles: Persona[] }[] = [
  { re: /\bfocus\b|priorit|action items|attention/, region: 'focus', label: 'Focus', roles: ['manager', 'hr'] },
  { re: /\bplanning\b|comp plan/, region: 'planning', label: 'Planning', roles: ['manager', 'hr'] },
  { re: /holiday|leave types?|time.?off admin|time admin|allotment/, region: 'timeadmin', label: 'Time & Holidays', roles: ['hr'] },
  { re: /offboard|off-board|exit|leaver|resignation|departure|last day/, region: 'exit', label: 'Offboarding', roles: ['hr'] },
  { re: /\bapprovals?\b/, region: 'approvals', label: 'Approvals', roles: ['manager'] },
  { re: /\bcalendar\b/, region: 'calendar', label: 'Calendar', roles: ['employee'] },
  { re: /\bdocuments?\b|\bpolicies\b/, region: 'documents', label: 'Documents', roles: ['employee', 'manager', 'hr'] },
  { re: /\bpayroll\b/, region: 'payroll', label: 'Payroll', roles: ['employee', 'hr'] },
  { re: /\binsights?\b|\banalytics\b/, region: 'analytics', label: 'Insights', roles: ['manager', 'hr'] },
  { re: /\bgrowth\b/, region: 'growth', label: 'Growth', roles: ['employee', 'manager'] },
  { re: /\bonboarding\b/, region: 'onboarding', label: 'Onboarding', roles: ['hr'] },
  { re: /\bmy team\b|\bteam\b/, region: 'team', label: 'Team', roles: ['manager'] },
  { re: /\bthe org\b|\borg\b|\bpeople\b/, region: 'people', label: 'Org', roles: ['hr'] },
  { re: /\bhome\b|\bnow\b/, region: 'home', label: 'Home', roles: ['employee', 'manager', 'hr'] },
];

/* ---------------- universal search ---------------- */

const LENS_NAME: Record<Persona, string> = { employee: 'My World', manager: 'My Team', hr: 'The Org' };

// Resolve a bare entity to a rich profile. Returns null if nothing matches, so the
// caller falls through to normal intents. Lens rules: employees may only look up
// themselves, their own manager, and non-people entities (docs, leave types) — never
// arbitrary colleagues' HR data. Managers see their reports + leads; HR sees everyone.
function searchEntities(s: string, state: BrainState): BrainResult | null {
  const lens = state.lens;

  // --- people ---
  const person = findPerson(s, state.people);
  if (person) {
    const me = state.people.find(p => p.id === 'p1');
    const isSelf = person.id === 'p1';
    const isMyManager = me && person.id === me.managerId;
    const visibleToEmployee = isSelf || isMyManager;
    if (lens === 'employee' && !visibleToEmployee) {
      return { reply: q(`I can find ${person.name.split(' ')[0]} in the directory, but their attendance, pay and risk live in ${LENS_NAME.manager}/${LENS_NAME.hr} — My World only shows your own record and your manager. Ask their manager, or switch lenses if you have access.`) };
    }
    // reporting line up to the root
    const chain: string[] = []; let cur: string | undefined = person.managerId; let guard = 0;
    while (cur && guard++ < 12) { const m = state.people.find(p => p.id === cur); if (!m) break; chain.push(m.name.split(' ')[0]); cur = m.managerId; }
    const directs = state.people.filter(p => p.managerId === person.id).length;
    const att = Math.round((person.attendance ?? 0.9) * 100);
    const vel = Math.round((person.velocity ?? 0.5) * 100);
    const risk = person.status === 'flight_risk';
    const pendingLeave = state.leaves.find(l => l.personId === person.id && l.status === 'pending');
    const bits = [
      `${person.role} · ${person.department}`,
      chain.length ? `Reports up through ${chain.join(' → ')}` : 'At the top of the tree',
      directs ? `${directs} direct report${directs === 1 ? '' : 's'}` : '',
      lens !== 'employee' || isSelf ? `Attendance ${att}% · velocity ${vel}` : '',
      person.status === 'on_leave' ? 'Currently on leave' : risk ? 'Flagged flight risk' : 'Status: active',
      pendingLeave ? `Pending leave: ${pendingLeave.days}d ${pendingLeave.kind}` : '',
    ].filter(Boolean);
    // context-appropriate jump action
    let action: QMsg['action'] | undefined;
    if (lens === 'hr') action = { label: `Find ${person.name.split(' ')[0]} in the org graph`, kind: 'region', arg: 'people' };
    else if (lens === 'manager' && risk) action = { label: `Simulate retention for ${person.name.split(' ')[0]}`, kind: 'sim', arg: person.id };
    else if (lens === 'manager') action = { label: 'Open team', kind: 'region', arg: 'team' };
    // entity-scoped memory: did we look into this person before? (demo-grade, device-local)
    const priorRaw = memThreadsFor(person.name.split(' ')[0], lens).filter(th => Date.now() - th.at > 60_000);
    const priorNote = priorRaw.length ? ` (You looked into ${person.name.split(' ')[0]} before — ${priorRaw[0].topic}.)` : '';
    return { reply: q(`${person.name} — ${bits.join(' · ')}.${priorNote}`, { action }) };
  }

  // --- documents / policies ---
  const docs = state.documents ?? [];
  const doc = docs.find(d => d.title.toLowerCase().includes(s) || s.includes(d.title.toLowerCase().split(' ')[0]));
  if (doc && s.length >= 3) {
    const status = doc.mustAck ? (doc.acked ? 'acknowledged' : 'awaiting your acknowledgment') : 'reference only';
    return { reply: q(`${doc.title}${doc.version ? ` (${doc.version})` : ''}${doc.category ? ` · ${doc.category}` : ''} — ${status}.`, { action: { label: 'Open documents', kind: 'region', arg: 'documents' }, source: { title: doc.title } }) };
  }

  // --- leave types ---
  const lt = state.leaveTypes.find(t => t.label.toLowerCase().split(' ')[0] === s || t.label.toLowerCase() === s || t.id === s);
  if (lt) return { reply: q(`${lt.label} leave — you have ${lt.balance} day${lt.balance === 1 ? '' : 's'} available.`, { action: lens === 'employee' ? { label: 'Plan time off', kind: 'region', arg: 'calendar' } : { label: 'Leave types & holidays', kind: 'region', arg: 'timeadmin' } }) };

  // --- holidays / months ---
  const hols = state.holidays ?? [];
  const hol = hols.find(h => h.label.toLowerCase().includes(s) || h.date.toLowerCase().includes(s));
  if (hol && s.length >= 3) return { reply: q(`${hol.label} — ${hol.date} (${hol.kind} holiday).`, { action: lens === 'hr' ? { label: 'Manage holidays', kind: 'region', arg: 'timeadmin' } : { label: 'Open calendar', kind: 'region', arg: 'calendar' } }) };

  return null;
}

/* ---------------- the understanding pass ---------------- */

export function understand(raw: string, state: BrainState): BrainResult | null {
  const s = raw.toLowerCase().trim();
  const lens = state.lens;

  // 0 · greeting / capabilities — friendly, lens-aware onramp
  if (/^(hi|hello|hey|yo|namaste)\b[\s!.]*$/.test(s) || /^(help|what can you do|how do you work)\??$/.test(s)) {
    const per = lens === 'employee'
      ? 'apply leave in plain words ("book leave Aug 3–5"), clock in or out, check your pay, hours or goals, or sign documents'
      : lens === 'manager'
        ? 'clear approvals ("approve Sarah\u2019s leave", "approve all and nudge the team"), open your Focus queue, simulate retention moves, plan comp, or build tools on Canvas'
        : 'review payroll anomalies, comp drafts and onboarding, open your Focus queue, or ask for any org metric';
    return { reply: q(`Hi — I\u2019m Q. Just tell me what you need in your own words: you can ${per}. I\u2019ll confirm before I act on anything.`) };
  }

  // 0.5 · Universal search — a bare entity (person / document / leave type / month /
  // holiday) surfaces everything about it instead of asking "what did you mean?".
  // Only fires when NO actionable verb is present, so "approve Sarah's leave" still
  // routes to the approve intent. Lens-scoped: employees don't get org-wide people data.
  {
    const hasVerb = /\b(approve|reject|decline|deny|apply|book|take|open|go|show|switch|change|create|add|assign|nudge|remind|simulate|plan|clock|break|acknowledge|ack|summar|draft|reveal|hide|export|remove|delete|prep|compare|combine)\b/.test(s);
    const isQuestion = /\b(how|why|what|when|where|which|can i|should i|do i|is my|are there|how many|who is|who's|tell me|walk me)\b/.test(s);
    const wc = s.split(/\s+/).filter(Boolean).length;
    if (!hasVerb && !isQuestion && wc <= 4 && s.length >= 2) {
      const sr = searchEntities(s, state);
      if (sr) return sr;
    }
  }

  // 1 · Focus / "what needs my attention" — manager & HR get the prioritised queue
  if (lens !== 'employee' && /(what needs my attention|what should i (do|tackle)|priorit|\bfocus\b|action items|\burgent\b|what.?s (pending|next|waiting)|my queue|triage)/.test(s) && !/comp|salary|\bpay\b|raise|merit/.test(s)) {
    const pend = state.leaves.filter(l => l.status === 'pending');
    const sla = pend.filter(l => l.isSlaBreached).length;
    const risk = state.people.filter(p => p.status === 'flight_risk').length;
    const pooled = state.payslips.filter(p => p.status === 'pooled').length;
    const bits = lens === 'manager'
      ? [pend.length ? `${pend.length} approvals${sla ? ` (${sla} breaching SLA)` : ''}` : '', risk ? `${risk} flight risk` : ''].filter(Boolean)
      : [pooled ? `${pooled} payroll anomaly` : '', risk ? `${risk} flight risk` : ''].filter(Boolean);
    return { region: 'focus', reply: q(`Opening your Focus queue — every open item, sorted by priority.${bits.length ? ` Top of the list: ${bits.join(', ')}.` : ''} Work through them one by one, or tell me to act: \u201capprove Sarah\u2019s leave\u201d, \u201cauto-assign coverage\u201d.`) };
  }
  // Next holiday — reads the live holidays list (reflects anything HR just added).
  if (/(next holiday|upcoming holiday|when.{0,6}holiday|holidays? (coming|left|this|remaining))/.test(s)) {
    const hs = state.holidays ?? [];
    if (hs.length) {
      const first = hs[0];
      const restricted = hs.filter(h => h.kind === 'restricted').length;
      return { region: 'calendar', reply: q(`Your next holiday is ${first.label} on ${first.date} (${first.kind}). There ${hs.length === 1 ? 'is' : 'are'} ${hs.length} on the calendar${restricted ? `, including ${restricted} restricted day${restricted === 1 ? '' : 's'} you choose from` : ''}.`, { action: { label: 'Open calendar', kind: 'region', arg: 'calendar' } }) };
    }
  }

  // Employee equivalent — a plain to-do summary, kept inside My World.
  if (lens === 'employee' && /(what needs my attention|what should i (do|tackle)|priorit|action items|\burgent\b|what.?s (pending|next|waiting)|my to.?do|my tasks)/.test(s)) {
    return { region: 'home', reply: q('Waiting on you: acknowledge Handbook v4.0 (today), submit your June reimbursement of \u20b94,200 (2 days), declare investments (5 days left), and finish Security Awareness (1 week).', { action: { label: 'Acknowledge documents', kind: 'region', arg: 'documents' } }) };
  }

  // 1.7 · change detection & timeline reasoning (Phase D) — reason over time, not
  // just current values. "What changed this week?", "how is attrition trending?",
  // "before/after Sarah's attendance". Manager sees team metrics, HR sees org.
  if (lens !== 'employee') {
    const wantsChange = /(what.?s changed|what changed|what.?s moved|what moved|any changes|what.?s different|what shifted)/.test(s);
    const wantsTrend = /(trend|trending|over time|over the (last|past)|since (last|dec|jan|q1|the quarter)|vs last|compared to last|before.?after|week over week|month over month|how (is|are|has)|how.?s)/.test(s);
    // which metric is named?
    const metricMap: [RegExp, import('./analytics').Delta['series']['key']][] = [
      [/attrition|turnover|churn|quit/, 'attrition'], [/head ?count|team size|hiring/, 'headcount'],
      [/tenure/, 'tenure'], [/engag|enps|sentiment|morale/, 'engagement'],
      [/attendance|presence|showing up/, 'attendance'], [/pending|approval|backlog|queue/, 'pending'],
      [/risk|flight|attrition risk/, 'risk'],
    ];
    const named = metricMap.find(([re]) => re.test(s));
    const backMatch = /quarter|q1|3 ?months|since dec/.test(s) ? 3 : /month|since (jan|last month)/.test(s) ? 1 : 1;

    if (wantsChange && !named) {
      const scope = lens === 'manager' ? 'team' : 'org';
      const deltas = anWhatChanged(scope, backMatch).slice(0, 3);
      if (deltas.length) {
        const lines = deltas.map(anNarrate);
        const top = deltas[0];
        return { reply: q(`Here's what moved${scope === 'team' ? ' on your team' : ' across the org'} recently:\n\n• ${lines.join('\n• ')}`, {
          rationale: {
            why: `I compared each tracked metric's latest reading against ${backMatch === 3 ? 'a quarter ago' : 'the prior period'} and surfaced the biggest movers first.`,
            whyNow: `${top.series.label} moved most — ${Math.abs(top.pct)}% ${top.abs > 0 ? 'up' : 'down'}.`,
            confidence: 'high',
            evidence: deltas.map(d => `${d.series.label}: ${d.fromLabel} ${d.from} → ${d.toLabel} ${d.to}`),
          },
        }) };
      }
    }
    if ((wantsTrend || wantsChange) && named) {
      const d = anComputeDelta(named[1], backMatch);
      if (d) {
        const chartRef = named[1] === 'attrition' ? 'attrition' : named[1] === 'attendance' ? 'attendance' : named[1] === 'engagement' ? 'engagement' : named[1] === 'headcount' ? 'headcount' : undefined;
        return { region: lens === 'manager' ? 'analytics' : 'analytics', board: chartRef ? { kind: 'chart', ref: chartRef } : undefined, reply: q(anNarrate(d), {
          rationale: {
            why: `Read from ${d.series.periods.length} periods of ${d.series.label.toLowerCase()} history; ${d.improved ? 'the direction is favourable' : d.flat ? 'it\u2019s essentially flat' : 'the direction is worth watching'}.`,
            whyNow: `Latest reading ${anFmt(d.to, d.series.unit)} vs ${anFmt(d.from, d.series.unit)} at ${d.fromLabel}.`,
            whyNot: d.improved ? undefined : 'A trend line isn\u2019t a cause — it flags where to look, not why it moved.',
            confidence: d.flat ? 'low' : 'medium',
            evidence: d.series.periods.map((p, i) => `${p}: ${anFmt(d.series.values[i], d.series.unit)}`),
          },
        }) };
      }
    }
  }

  // 2 · plain navigation — "open X", "take me to X", "go to X"
  {
    const nav = s.match(/\b(open|go to|take me to|jump to|navigate to)\b/) && !/\bboard\b/.test(s) ? NAV.find(n => n.re.test(s)) : undefined;
    if (nav) {
      if (nav.roles.includes(lens)) return { region: nav.region, reply: q(`Opening ${nav.label}.`) };
      const to = nav.roles[0]; const ln: Record<Persona, string> = { employee: 'My World', manager: 'My Team', hr: 'The Org' };
      return { reply: q(`${nav.label} isn't part of ${ln[lens]} — it lives in ${ln[to]}. Switch lenses from the top bar (press ${to === 'employee' ? '1' : to === 'manager' ? '2' : '3'}) if you have access, then ask again.`) };
    }
  }

  // 3 · switch lens by name
  {
    const m = s.match(/\b(switch|change|go)\b.{0,12}\b(employee|my world|manager|my team|hr|the org|org)\b (view|lens|mode)?|\bas (an? )?(employee|manager|hr)\b/);
    if (m && /\b(switch|change|view|lens|mode|as)\b/.test(s)) {
      const to: Persona = /manager|my team/.test(s) ? 'manager' : /\bhr\b|the org/.test(s) ? 'hr' : 'employee';
      if (to === lens) return { reply: q(`You\u2019re already in the ${to === 'employee' ? 'My World' : to === 'manager' ? 'My Team' : 'The Org'} lens.`) };
      return { lens: to, region: 'home', reply: q(`Switched to ${to === 'employee' ? 'My World' : to === 'manager' ? 'My Team' : 'The Org'}.`) };
    }
  }

  // 4 · multi-step chains — "approve all pending and nudge the team"
  if (lens !== 'employee' && (/\b(approve all|clear (the )?(queue|pending))\b.{0,28}\b(and|then)\b.{0,28}\bnudge\b/.test(s) || /\bnudge\b.{0,28}\b(and|then)\b.{0,28}\bapprove all\b/.test(s))) {
    const n = state.leaves.filter(l => l.status === 'pending').length;
    return { region: 'approvals', reply: q(`Two steps: approve the ${n} pending request${n === 1 ? '' : 's'}, then nudge everyone with an overdue timesheet. I\u2019ll run them in order when you confirm.`, { action: { label: 'Run both steps', kind: 'chain', arg: JSON.stringify([{ kind: 'approveAll' }, { kind: 'nudge' }]) } }) };
  }

  // 5 · reject / decline a named person's leave
  {
    const m = s.match(/\b(reject|decline|deny)\b/);
    if (m && lens !== 'employee') {
      const person = findPerson(s, state.people);
      const lv = person ? state.leaves.find(l => l.personId === person.id && l.status === 'pending') : undefined;
      if (person && lv) {
        const fn = person.name.split(' ')[0];
        return { region: 'approvals', reply: q(`Declining ${fn}\u2019s pending ${lv.kind} leave (${lv.startDate}${lv.endDate !== lv.startDate ? `\u2013${lv.endDate}` : ''}). They\u2019ll be notified with a note from you.`, { action: { label: `Decline ${fn}\u2019s leave`, kind: 'rejectOne', arg: lv.id } }) };
      }
      if (person) return { reply: q(`${person.name.split(' ')[0]} has no pending request to decline right now.`) };
    }
  }

  // 6 · auto-assign coverage
  if (lens !== 'employee' && /(auto.?(assign|cover)|assign (all )?coverage|cover (all|the) (gaps|windows)|fill the coverage)/.test(s)) {
    const un = 3 - Object.keys(state.coverage).length;
    if (un <= 0) return { region: 'planning', reply: q('Every upcoming leave window already has cover assigned. Nothing to do.') };
    return { region: 'planning', reply: q(`${un} leave window${un === 1 ? ' is' : 's are'} uncovered. I\u2019ll assign my suggested cover for each — you keep the final say and can swap anyone.`, { action: { label: `Auto-assign ${un} window${un === 1 ? '' : 's'}`, kind: 'autoCover' }, rationale: {
      why: 'Each uncovered window has at least one teammate who is free, has the right skills, and isn\u2019t already stretched — I match on those three before suggesting cover.',
      whyNow: 'These windows fall within the next two weeks, so cover needs locking before the leave starts.',
      whyNot: 'I only suggest — I never reassign silently. Every pick is yours to swap.',
      confidence: 'medium',
      evidence: [`${un} window${un === 1 ? '' : 's'} with a viable cover match`, 'Matched on availability, skill overlap and current workload'],
    } }) };
  }

  // 7 · nudge outstanding reviews
  if (lens !== 'employee' && /\b(nudge|chase|remind)\b.{0,24}\breview/.test(s)) {
    const out = state.reviews.filter(r => r.status === 'not_started').length;
    if (!out) return { region: 'growth', reply: q('All self-reviews are in — nobody to nudge.') };
    return { region: 'growth', reply: q(`${out} self-review${out === 1 ? ' is' : 's are'} still outstanding. I\u2019ll send a gentle nudge to each.`, { action: { label: `Nudge ${out} outstanding`, kind: 'nudgeReviews' } }) };
  }

  // 8 · create a goal in plain words — "create a goal to ship repository v2 by Aug 30"
  {
    const m = s.match(/\b(create|add|set|make|new)\b.{0,10}\bgoal\b(?:\s*(?:to|:|called|for|about)?\s*)(.+)/);
    if (m && m[2]) {
      let rest = m[2];
      let dueOn = 'Sep 30';
      const dm = rest.match(/\b(?:by|before|due)\s+((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2})/i);
      if (dm) { const mon = dm[2][0].toUpperCase() + dm[2].slice(1, 3); dueOn = `${mon} ${dm[1].match(/\d{1,2}/)![0]}`; rest = rest.replace(dm[0], '').trim(); }
      const title = rest.replace(/\s+/g, ' ').replace(/[.?!]+$/, '').trim();
      if (title.length >= 3) {
        const t = title.charAt(0).toUpperCase() + title.slice(1);
        return { region: 'growth', reply: q(`Drafted a goal: \u201c${t}\u201d, due ${dueOn}. Confirm and it goes on your Growth board at 0%.`, { action: { label: `Create \u201c${t.slice(0, 28)}${t.length > 28 ? '\u2026' : ''}\u201d`, kind: 'goalCreate', arg: JSON.stringify({ title: t, dueOn }) } }) };
      }
    }
  }

  // 9 · quick computed answers — counts and rosters
  if (/(how many|number of).{0,24}(pending|approval)/.test(s) && lens !== 'employee') {
    const pend = state.leaves.filter(l => l.status === 'pending');
    const sla = pend.filter(l => l.isSlaBreached).length;
    return { reply: q(`${pend.length} request${pend.length === 1 ? '' : 's'} pending${sla ? ` — ${sla} breach${sla === 1 ? 'es' : ''} SLA soon` : ''}: ${pend.map(l => l.personName.split(' ')[0]).join(', ') || 'none'}.`, pend.length ? { action: { label: 'Open approvals', kind: 'region', arg: 'approvals' } } : undefined) };
  }
  if (lens !== 'employee' && /\bwho( is|.?s)? (out|away|on leave)\b/.test(s)) {
    const out = state.people.filter(p => p.status === 'on_leave');
    return { reply: q(out.length ? `On leave right now: ${out.map(p => p.name).join(', ')}.` : 'Nobody is on leave right now — full house.') };
  }

  // 10 · person lookup — "who is Priya", "tell me about David" (team/org context only)
  {
    const m = s.match(/\b(who is|who.?s|tell me about|what about)\b/);
    if (m && lens !== 'employee') {
      const person = findPerson(s, state.people);
      if (person) {
        const risk = person.status === 'flight_risk';
        const att = Math.round((person.attendance ?? 0.9) * 100);
        const vel = Math.round((person.velocity ?? 0.5) * 100);
        const rationale = risk ? {
          why: `${person.name.split(' ')[0]}'s signals crossed the retention-risk threshold: attendance and engagement are both trending down together, which historically precedes a resignation.`,
          whyNow: att < 80 ? `Attendance has fallen to ${att}% — the sharpest drop on the team this quarter.` : 'The decline has been steady over the last six weeks rather than a one-off dip.',
          whyNot: 'This is a signal, not a verdict — it flags a conversation worth having, not a certainty they will leave.',
          confidence: (att < 78 && vel < 60 ? 'high' : att < 85 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          evidence: [`Attendance ${att}% (team median ~92%)`, `Velocity ${vel}`, 'Both metrics trending down in tandem'],
        } : undefined;
        return { reply: q(`${person.name} \u00b7 ${person.role} (${person.department}). Attendance ${att}%, velocity ${vel}. ${risk ? 'Elevated flight risk \u2014 worth a retention conversation.' : person.status === 'on_leave' ? 'Currently on leave.' : 'Tracking healthy.'}`, { rationale, ...(risk ? { action: { label: `Simulate retention for ${person.name.split(' ')[0]}`, kind: 'sim', arg: person.id } } : {}) }) };
      }
    }
  }

  return null; // fall through to the legacy regex brain
}

/* ---------------- Canvas viz brain ---------------- */
// Understands free-form visualization prompts: infers chart shape from rich synonyms,
// extracts inline data ("headcount design 12 engineering 18", "trend 40, 52, 61, 58"),
// reads percentages for gauges, comparisons ("X vs Y"), and multi-widget asks
// ("a KPI and a trend for attrition"). Returns null when it isn't a viz prompt.

export interface WidgetSpec { kind: string; label: string; data?: { labels?: string[]; values?: number[] } }

const VIZ_KINDS: [RegExp, string][] = [
  [/gauge|dial|progress|percent|completion|utili[sz]ation/, 'gauge'],
  [/timeline|milestone|roadmap|phases|schedule|plan of/, 'timeline'],
  [/\btable\b|breakdown|list of|\brows\b/, 'table'],
  [/\btrend\b|over time|sparkline|line chart|history|trajectory|month over month|week over week/, 'trend'],
  [/\bbars?\b|column|\bcompare\b|comparison|versus|\bvs\.?\b|\bby (team|month|week|department|dept|region)\b|distribution|\bpie\b|donut|split/, 'bars'],
  [/\bkpi\b|\bstat\b|\bmetric\b|\bnumber\b|\bscore\b|\bcount\b|\btotal\b|headline/, 'kpi'],
];

const VIZ_STOP = new Set(['for', 'of', 'on', 'with', 'at', 'to', 'a', 'an', 'the', 'last', 'past', 'next', 'top', 'over', 'and', 'vs', 'versus', 'by', 'per', 'show', 'build', 'make', 'create', 'chart', 'graph', 'plot', 'widget', 'give', 'me', 'track', 'tracking', 'from', 'in', 'as', 'is', 'are', 'my', 'our', 'compare', 'comparing', 'between']);
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const deStop = (x: string) => x.split(/\s+/).filter(w => w && !VIZ_STOP.has(w)).join(' ');

function extractVizData(t: string): { labels?: string[]; values?: number[] } | undefined {
  // A · label-number pairs: "design 12 engineering 18 product 9"
  const pairRe = /([a-z][a-z0-9]{1,14})\s+(\d+(?:\.\d+)?)\b/g;
  const labels: string[] = []; const values: number[] = []; let m: RegExpExecArray | null;
  while ((m = pairRe.exec(t))) if (!VIZ_STOP.has(m[1])) { labels.push(cap(m[1])); values.push(parseFloat(m[2])); }
  if (values.length >= 2) return { labels, values };
  // B · bare separated number runs: "40, 52, 61" / "12 vs 18" / "12 and 18"
  const run = t.match(/\d+(?:\.\d+)?(?:\s*(?:,|;|vs\.?|and)\s*\d+(?:\.\d+)?)+/);
  if (run) return { values: run[0].split(/[^\d.]+/).filter(Boolean).map(Number) };
  // C · a single percentage: "75% complete"
  const pct = t.match(/(\d{1,3})\s*%/);
  if (pct) return { values: [Math.min(100, +pct[1])] };
  // D · labels-only comparison: "design vs engineering"
  const vs = t.match(/([a-z][\w ]{1,20}?)\s+(?:vs\.?|versus)\s+([a-z][\w ]{1,16})/);
  if (vs) { const a = deStop(vs[1].trim()), b = deStop(vs[2].trim()); if (a && b) return { labels: [cap(a), cap(b)] }; }
  // E · a comma list of words → labels (timeline steps, category lists): "discovery, build, pilot, rollout"
  const wl = t.match(/([a-z][\w -]{1,18}(?:\s*,\s*[a-z][\w -]{1,18}){2,})/);
  if (wl && !/\d/.test(wl[1])) { const items = wl[1].split(/\s*,\s*/).map(x => x.trim().replace(/^(a|an|the)\s+/, '')).filter(Boolean); if (items.length >= 3) return { labels: items.map(cap) }; }
  return undefined;
}

export function parseVizPrompt(raw: string): WidgetSpec[] | null {
  const t = raw.toLowerCase().trim();
  const kinds: string[] = [];
  for (const [re, k] of VIZ_KINDS) if (re.test(t) && !kinds.includes(k)) kinds.push(k);
  const data = extractVizData(t);
  if (!kinds.length && !data) return null;
  if (!kinds.length && data) kinds.push((data.values && data.values.length > 1) || data.labels ? 'bars' : 'kpi');

  // label: prefer "for/of/about X" tail; else strip filler + data tokens
  let label = '';
  const tail = t.match(/(?:for|of|on|about|showing|tracking|comparing|track)\s+(.+?)[.?!]?$/);
  if (tail) label = tail[1];
  else label = t.replace(/\d+(?:\.\d+)?%?/g, ' ').split(/\s+/).filter(x => x && !VIZ_STOP.has(x) && !VIZ_KINDS.some(([re]) => re.test(x))).join(' ');
  label = label.split(':')[0]; // "the migration: discovery, build…" → "the migration"
  label = label.replace(/\b(kpi|gauge|trend|bars?|table|timeline|chart|graph|widget|please)\b/g, ' ').replace(/\d+(?:\.\d+)?%?/g, ' ').replace(/\s+/g, ' ').trim();
  if (data?.labels?.length) { // strip residue of extracted labels ("q1 40 q2 55" → "q q"), fall back to the labels themselves
    const lset = new Set(data.labels.map(l => l.toLowerCase()));
    const cleaned = label.split(' ').filter(wd => wd.length > 1 && !lset.has(wd.toLowerCase())).join(' ').trim();
    label = cleaned.length >= 3 ? cleaned : data.labels.length <= 4 ? data.labels.join(' · ') : `${data.labels.length} items`;
  }
  if (!label && data?.labels?.length) label = data.labels.join(' vs ');
  label = label ? cap(label) : 'Metric';

  // multi-widget prompts share the label; data attaches to every shape that can use it
  return kinds.slice(0, 3).map(kind => ({ kind, label, data }));
}
