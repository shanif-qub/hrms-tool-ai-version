import { PersonToken, LeaveToken, PayslipToken, DocumentItem } from './types';

export type Verdict = 'combine' | 'relate' | 'reject';
export interface ComboData { people: PersonToken[]; leaves: LeaveToken[]; payslips: PayslipToken[]; documents: DocumentItem[]; }
export interface Ref { kind: string; id: string; }
export interface ComboResult {
  verdict: Verdict; title: string; lines: string[];
  viz?: 'attendance' | 'comp' | 'workload' | 'retention' | null;
  action?: { label: string; kind: string; arg?: string } | null;
  aColor: string; bColor: string;
}

export const kindColor: Record<string, string> = {
  person: 'var(--color-lumen)', leave_request: 'var(--color-ember)', payslip: 'var(--color-halo)',
  document: 'var(--color-mist)', budget: 'var(--color-ember)', synth: 'var(--color-halo)',
  cue: 'var(--color-lumen)', kpi: 'var(--color-halo)', nav: 'var(--color-lumen)', onboarding: 'var(--color-lumen)', chart: 'var(--color-halo)',
};
export const kindLabel: Record<string, string> = {
  person: 'Person', leave_request: 'Leave', payslip: 'Payslip', document: 'Document', budget: 'Budget', synth: 'Result',
  cue: 'Signal', kpi: 'Metric', nav: 'Sphere', onboarding: 'Candidate', chart: 'Chart',
};

const dayNum = (s: string) => parseInt(s) || 0;
const overlaps = (a: LeaveToken, b: LeaveToken) => a.startDate.includes('Jul') && b.startDate.includes('Jul') && dayNum(a.startDate) <= dayNum(b.endDate) && dayNum(b.startDate) <= dayNum(a.endDate);

const navColor: Record<string, string> = { calendar: 'var(--color-lumen)', leave: 'var(--color-halo)', pay: 'var(--color-ember)', documents: 'var(--color-mist)', growth: 'var(--color-halo)', requests: 'var(--color-blue)' };

function navCombo(a: string, b: string): ComboResult {
  const [x, y] = [a, b].sort();
  const key = `${x}+${y}`;
  const base = { aColor: navColor[a] ?? 'var(--color-lumen)', bColor: navColor[b] ?? 'var(--color-lumen)' };
  const C = (title: string, lines: string[], viz?: ComboResult['viz'], action?: ComboResult['action']): ComboResult => ({ ...base, verdict: 'combine', title, lines, viz: viz ?? null, action: action ?? null });
  const R = (title: string, lines: string[]): ComboResult => ({ ...base, verdict: 'relate', title, lines, viz: null, action: null });
  switch (key) {
    case 'calendar+leave': return C('Best days to take leave', ['Bridging Fri Sep 4 + Mon Sep 7 gives a 4-day break for just 2 days of leave.', 'Team leave density is low that week — low coverage risk.', 'Q can pre-fill the request.'], null, { label: 'Plan this leave', kind: 'region', arg: 'calendar' });
    case 'leave+pay': return C('Leave-without-pay impact', ['3 unpaid days ≈ ₹19,800 off your next net.', 'Your paid balances cover most of the year — LWP rarely needed.', 'TDS is recomputed automatically on release.']);
    case 'growth+pay': return C('Comp vs performance', ['Velocity 85 and 93% attendance support a band move.', 'A 12% adjustment ≈ +₹17.4k/mo, ₹2.1L/yr.', 'Q can draft talking points for your appraisal.'], 'comp');
    case 'calendar+pay': return R('Payday & holidays', ['Payday lands on the last working day — Jul 31.', 'Aug has one holiday (15th); no payroll impact.']);
    case 'documents+growth': return R('Policies for your growth', ['Your growth track is governed by the Promotion & L&D policy.', 'Two learning modules count toward this cycle.']);
    case 'documents+leave': return R('Leave policy', ['This is governed by Leave & Holiday Policy v3.2 — accrual, RH and encashment rules.']);
    case 'documents+pay': return R('Comp & tax policy', ['Your payslip follows the regional TDS schedule and the Data Protection standard for PII.']);
    case 'calendar+requests': case 'leave+requests': case 'pay+requests': case 'documents+requests': case 'growth+requests':
      return R('Raise a request', ['Q can open a helpdesk ticket linked to this sphere — IT, facilities or HR.']);
    default: return R('Loose relation', ['Q linked these spheres, but there is no strong combined view.', 'Drag either onto Q for a full report.']);
  }
}

export function resolveCombo(a: Ref, b: Ref, d: ComboData): ComboResult {
  if (a.kind === 'nav' && b.kind === 'nav') return navCombo(a.id, b.id);
  // normalize so the pair order is stable (alphabetical by kind)
  let [x, y] = [a, b];
  if (a.kind > b.kind) [x, y] = [b, a];
  const key = `${x.kind}+${y.kind}`;
  const col = (k: string) => kindColor[k] ?? 'var(--color-mist)';
  const base = { aColor: col(x.kind), bColor: col(y.kind) };

  const P = (id: string) => d.people.find(p => p.id === id);
  const L = (id: string) => d.leaves.find(l => l.id === id);
  const S = (id: string) => d.payslips.find(p => p.id === id);
  const D = (id: string) => d.documents.find(doc => doc.id === id);

  switch (key) {
    case 'person+person': {
      const p1 = P(x.id)!, p2 = P(y.id)!;
      return { ...base, verdict: 'combine', title: 'Collaboration & comparison', viz: 'comp',
        lines: [
          `${p1.name.split(' ')[0]} vs ${p2.name.split(' ')[0]} — same manager, ${p1.department === p2.department ? 'same' : 'cross'}-department.`,
          `Attendance ${Math.round((p1.attendance ?? .9) * 100)}% vs ${Math.round((p2.attendance ?? .9) * 100)}%; velocity ${Math.round((p1.velocity ?? .5) * 100)} vs ${Math.round((p2.velocity ?? .5) * 100)}.`,
          (p1.status === 'flight_risk' || p2.status === 'flight_risk') ? 'One of the pair is an elevated flight risk — consider a retention move.' : 'Both tracking healthy; high collaboration frequency.',
        ] };
    }
    case 'leave_request+person': {
      const l = L(y.kind === 'leave_request' ? y.id : x.id)!; const p = P(x.kind === 'person' ? x.id : y.id)!;
      const own = l.personId === p.id;
      return { ...base, verdict: 'combine', title: own ? 'Leave detail & coverage' : 'Coverage check',
        lines: own
          ? [`${p.name}'s ${l.kind} leave, ${l.startDate}→${l.endDate} (${l.days}d).`, l.conflictWith ? `Overlaps ${l.conflictWith}; coverage gap on Design.` : 'No conflicts — coverage holds.', l.isSlaBreached ? 'Approval SLA breaches in ~2h.' : 'Within SLA.']
          : [`Would ${p.name} cover while ${l.personName} is out ${l.startDate}→${l.endDate}?`, `${p.name} is at ${Math.round((p.attendance ?? .9) * 100)}% capacity this period.`, 'Q estimates a manageable load with one deadline shift.'] };
    }
    case 'payslip+person': {
      const s = S(x.kind === 'payslip' ? x.id : y.id)!; const p = P(x.kind === 'person' ? x.id : y.id)!;
      return { ...base, verdict: 'combine', title: 'Comp footprint',
        lines: [`${p.name} · ${s.month} net ₹${s.amount.toLocaleString('en-IN')}.`, p.status === 'flight_risk' ? 'Sits ~11% below band — a known retention lever.' : 'In band for role and region.', s.status === 'pooled' ? 'This run is pooled pending a tax correction.' : 'Released and reconciled.'] };
    }
    case 'document+person': {
      const doc = D(x.kind === 'document' ? x.id : y.id)!; const p = P(x.kind === 'person' ? x.id : y.id)!;
      return { ...base, verdict: 'combine', title: 'Policy acknowledgment',
        lines: [`${p.name} × “${doc.title}” (${doc.version}).`, doc.mustAck ? (doc.acked ? 'Acknowledged and on file.' : 'Acknowledgment still pending — nudge can be sent.') : 'No acknowledgment required.', 'Assign, remind, or view audit trail from here.'] };
    }
    case 'budget+person': {
      const p = P(x.kind === 'person' ? x.id : y.id)!;
      return { ...base, verdict: 'combine', title: 'Retention simulation', viz: 'retention',
        action: { label: `Simulate for ${p.name.split(' ')[0]}`, kind: 'sim', arg: p.id },
        lines: [`Drop budget on ${p.name} → model a retention move.`, p.status === 'flight_risk' ? 'Projected risk 0.78 → 0.41 with a ₹2.1L bonus.' : 'Low baseline risk; impact mostly on morale.', 'Friction Swipe — the constellation re-simulates morale and runway.'] };
    }
    case 'leave_request+leave_request': {
      const l1 = L(x.id)!, l2 = L(y.id)!; const clash = overlaps(l1, l2);
      return { ...base, verdict: 'combine', title: 'Overlap & coverage gap',
        lines: [`${l1.personName} (${l1.startDate}–${l1.endDate}) vs ${l2.personName} (${l2.startDate}–${l2.endDate}).`, clash ? 'Dates overlap — simultaneous absence risk.' : 'No date overlap; staggered coverage is fine.', clash ? 'Q suggests shifting one by two days to keep Design staffed.' : 'No action needed.'] };
    }
    case 'leave_request+payslip': {
      const l = L(x.kind === 'leave_request' ? x.id : y.id)!; const s = S(x.kind === 'payslip' ? x.id : y.id)!;
      return { ...base, verdict: 'combine', title: 'Pay impact of leave',
        lines: [`${l.days}d ${l.kind} leave against ${s.month}.`, l.kind === 'sick' || l.kind === 'earned' ? 'Paid leave — no deduction.' : 'If unpaid, est. ₹' + Math.round(s.amount / 22 * l.days).toLocaleString('en-IN') + ' pro-rata impact.', 'TDS recomputed automatically on release.'] };
    }
    case 'document+leave_request': {
      const l = L(x.kind === 'leave_request' ? x.id : y.id)!;
      return { ...base, verdict: 'relate', title: 'Governing policy',
        lines: [`This ${l.kind} request is governed by “Leave & Holiday Policy v3.2”.`, 'Accrual, RH rules and encashment apply.', 'Open the policy for the exact clause.'] };
    }
    case 'budget+leave_request': {
      const l = L(x.kind === 'leave_request' ? x.id : y.id)!;
      return { ...base, verdict: 'relate', title: 'Backfill cost estimate',
        lines: [`Covering ${l.personName}'s ${l.days}d absence.`, 'Contractor backfill ≈ ₹' + (l.days * 9000).toLocaleString('en-IN') + ' for the window.', 'Often cheaper to redistribute internally.'] };
    }
    case 'payslip+payslip': {
      const s1 = S(x.id)!, s2 = S(y.id)!; const delta = s1.amount - s2.amount;
      return { ...base, verdict: 'combine', title: 'Month-over-month delta',
        lines: [`${s2.month} ₹${s2.amount.toLocaleString('en-IN')} → ${s1.month} ₹${s1.amount.toLocaleString('en-IN')}.`, delta === 0 ? 'No change in net pay.' : `Net change ₹${Math.abs(delta).toLocaleString('en-IN')} (${delta > 0 ? '+' : '−'}).`, 'Driver: relocation tax-code change.'] };
    }
    case 'document+payslip': {
      return { ...base, verdict: 'relate', title: 'Applicable comp/tax policy',
        lines: ['This payslip is shaped by the Data Protection Standard (PII) and regional TDS rules.', 'Withholding follows the Karnataka schedule post-relocation.', 'Open the standard for retention windows.'] };
    }
    case 'budget+payslip': {
      const s = S(x.kind === 'payslip' ? x.id : y.id)!; const raise = Math.round(s.amount * 0.12);
      return { ...base, verdict: 'combine', title: 'Raise projection',
        lines: [`Apply a 12% adjustment to ${s.month}.`, `New net ≈ ₹${(s.amount + raise).toLocaleString('en-IN')} (+₹${raise.toLocaleString('en-IN')}/mo).`, 'Annual cost ₹' + (raise * 12).toLocaleString('en-IN') + '; moves Sarah into band.'] };
    }
    case 'document+document': {
      const d1 = D(x.id)!, d2 = D(y.id)!;
      return { ...base, verdict: 'relate', title: 'Shared category & ack needs',
        lines: [`“${d1.title}” and “${d2.title}”.`, d1.category === d2.category ? `Both are ${d1.category} documents.` : 'Different categories — bundle for a single acknowledgment campaign.', `${[d1, d2].filter(d => d.mustAck && !d.acked).length} of these still need acknowledgment.`] };
    }
    case 'cue+person': case 'cue+leave_request': case 'cue+payslip': {
      return { ...base, verdict: 'combine', title: 'Signal in context',
        lines: ['This live signal is about the token you dropped it on.', 'Q ties the nudge to the underlying record and proposes the next step.', 'Act on it here, or drag to Q for the full chain.'] };
    }
    case 'cue+cue': return { ...base, verdict: 'relate', title: 'Signal correlation', lines: ['Two live signals — Q checks whether they share a root cause.', 'Often a single fix clears both.'] };
    case 'kpi+kpi': return { ...base, verdict: 'relate', title: 'Metric correlation', lines: ['Q correlates the two metrics over the last 8 weeks.', 'Attendance anomalies track loosely with below-band comp.'] };
    case 'chart+person': {
      const person = d.people.find(p => p.id === (x.kind === 'person' ? x.id : y.id));
      const chart = x.kind === 'chart' ? x.id : y.id;
      const nm = person?.name.split(' ')[0] ?? 'This person';
      const metric = chart === 'attendance' ? 'attendance' : chart === 'comp' ? 'compensation' : chart === 'workload' ? 'workload' : 'this metric';
      const viz = (chart === 'attendance' || chart === 'comp' || chart === 'workload') ? (chart as ComboResult['viz']) : null;
      return { ...base, verdict: 'combine', title: `${nm} · ${metric}`, viz, action: { label: `Ask Q about ${nm}`, kind: 'region', arg: 'analytics' }, lines: [`Placed ${nm} against ${metric} — where they sit versus the team.`, person?.status === 'flight_risk' ? `${nm} is an elevated flight risk; ${metric} is a contributing signal.` : `${nm} tracks close to the team median on ${metric}.`, 'Drag onto Q for the full breakdown.'] };
    }
    case 'kpi+person': return { ...base, verdict: 'combine', title: 'Who drives this metric', lines: ['Q decomposes the org metric to the people behind it.', 'This person contributes measurably to the headline number.', 'Drill into their record or simulate a change.'] };
    case 'document+onboarding': return { ...base, verdict: 'combine', title: 'Assign policy to candidate', lines: ['Attach this policy to the candidate’s onboarding checklist.', 'Acknowledgment is requested automatically on day one.', 'Tracked in the ignition pipeline.'] };
    case 'onboarding+person': return { ...base, verdict: 'relate', title: 'Buddy match', lines: ['Pair the new joiner with this team member as an onboarding buddy.', 'Same department raises ramp speed.'] };
    case 'nav+person': case 'nav+leave_request': case 'nav+payslip': case 'document+nav': case 'budget+nav':
      return { ...base, verdict: 'relate', title: 'Open in this sphere', lines: ['Q would surface this record inside the chosen sphere.', 'Use drag-to-Q for a full report instead.'] };
    case 'budget+document': return { ...base, verdict: 'reject', title: 'Nothing to combine', lines: ['A budget lever and a policy document have no shared operation.'] };
    case 'budget+budget': return { ...base, verdict: 'reject', title: 'Nothing to combine', lines: ['One budget lever is enough — drop it on a person instead.'] };
    case 'cue+kpi': return { ...base, verdict: 'relate', title: 'Signal vs metric', lines: ['Q checks whether this live signal is moving the metric.', 'Often the nudge explains the number.', 'No combined action — drag either to Q for detail.'] };
    case 'kpi+nav': case 'cue+nav': return { ...base, verdict: 'relate', title: 'Open in this sphere', lines: ['Q would surface this inside the chosen sphere.', 'Drag to Q for a full report instead.'] };
    default:
      // synth or unforeseen pairs → soft relate
      return { ...base, verdict: 'relate', title: 'Loose relation', lines: ['Q linked these, but there is no strong combined view.', 'Drag either onto Q for a deeper report.'] };
  }
}

// Static description used by the in-app legend and the exported matrix doc.
export const COMBO_MATRIX: { a: string; b: string; verdict: Verdict; outcome: string }[] = [
  { a: 'person', b: 'person', verdict: 'combine', outcome: 'Collaboration & comparison matrix' },
  { a: 'person', b: 'leave_request', verdict: 'combine', outcome: 'Leave detail / coverage check' },
  { a: 'person', b: 'payslip', verdict: 'combine', outcome: 'Comp footprint vs band' },
  { a: 'person', b: 'document', verdict: 'combine', outcome: 'Policy acknowledgment status' },
  { a: 'person', b: 'budget', verdict: 'combine', outcome: 'Retention simulation (Friction Swipe)' },
  { a: 'leave_request', b: 'leave_request', verdict: 'combine', outcome: 'Overlap & coverage gap' },
  { a: 'leave_request', b: 'payslip', verdict: 'combine', outcome: 'Pay impact of leave' },
  { a: 'leave_request', b: 'document', verdict: 'relate', outcome: 'Governing leave policy' },
  { a: 'leave_request', b: 'budget', verdict: 'relate', outcome: 'Backfill cost estimate' },
  { a: 'payslip', b: 'payslip', verdict: 'combine', outcome: 'Month-over-month delta' },
  { a: 'payslip', b: 'document', verdict: 'relate', outcome: 'Applicable comp/tax policy' },
  { a: 'payslip', b: 'budget', verdict: 'combine', outcome: 'Raise projection' },
  { a: 'document', b: 'document', verdict: 'relate', outcome: 'Shared category & ack needs' },
  { a: 'document', b: 'budget', verdict: 'reject', outcome: 'No shared operation' },
  { a: 'budget', b: 'budget', verdict: 'reject', outcome: 'One lever is enough' },
  { a: 'cue', b: 'person', verdict: 'combine', outcome: 'Signal in context of a record' },
  { a: 'kpi', b: 'person', verdict: 'combine', outcome: 'Who drives this metric' },
  { a: 'kpi', b: 'kpi', verdict: 'relate', outcome: 'Metric correlation' },
  { a: 'document', b: 'onboarding', verdict: 'combine', outcome: 'Assign policy to candidate' },
  { a: 'onboarding', b: 'person', verdict: 'relate', outcome: 'Onboarding buddy match' },
];
