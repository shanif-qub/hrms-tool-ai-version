export type Persona = 'employee' | 'manager' | 'hr';

// ── Workspace ─────────────────────────────────────────────────────────────
// A spatial, authored surface. One unifying item type with a kind discriminator.
export type WsKind = 'note' | 'list' | 'todo' | 'tool';

export interface WsSubtask { id: string; text: string; done: boolean; }
export interface WsTodoEntry {
  id: string; text: string; done: boolean;
  deadline?: string;          // ISO date
  timerMs?: number;           // optional countdown duration
  timerStartedAt?: number;    // epoch ms when timer was started (null = not running)
  subtasks: WsSubtask[];
  ordered?: boolean;          // sub-tasks numbered vs bulleted
}
export interface WsListItem { id: string; text: string; depth: number; }  // depth drives nesting
export interface WorkspaceItem {
  id: string;
  lens: Persona;              // whose workspace this lives in
  owner: string;             // person id who created it
  kind: WsKind;
  title: string;
  color: string;             // custom hex accent
  pos: { x: number; y: number };
  size?: { w: number; h: number };
  z: number;
  // kind-specific content:
  noteHtml?: string;         // rich text (note)
  listStyle?: 'bulleted' | 'numbered';   // list
  listItems?: WsListItem[];              // list
  todos?: WsTodoEntry[];                 // todo
  // flowboard + sharing (later phases):
  flowboardId?: string;
  light?: boolean;           // per-card light mode (accessibility)
  sharedWith?: string[];
  sharedBy?: string;
  toolRef?: string;          // vibeApp id when kind === 'tool' (Canvas → Workspace reference card)
}
export interface WsConnector { id: string; fromId: string; toId: string; label?: string; color?: string; fromSide?: 'top' | 'right' | 'bottom' | 'left'; toSide?: 'top' | 'right' | 'bottom' | 'left'; arrowStart?: boolean; arrowEnd?: boolean; }

export type Theme = 'dark' | 'light';
export type Highlight = 'leave' | 'risk' | 'payroll' | 'team' | null;
export type Overlay = null | 'matrix' | 'addType' | 'addLeave' | 'settings' | 'addPerson';

export type Region =
  | 'home' | 'calendar' | 'documents' | 'payroll' | 'people' | 'team'
  | 'approvals' | 'attendance' | 'analytics' | 'onboarding' | 'exit' | 'journey' | 'growth' | 'planning' | 'focus' | 'timeadmin';

export type LeaveKind = string; // dynamic (earned/sick/casual/rh + custom)
export type LeaveMode = 'full' | 'half' | 'range';

export interface LeaveType { id: string; label: string; balance: number; }

export interface Pos { x: number; y: number; }

export interface PersonToken {
  id: string; type: 'person';
  name: string; role: string; department: string;
  managerId?: string;
  status: 'active' | 'on_leave' | 'flight_risk';
  flightRiskReason?: string;
  velocity?: number; attendance?: number;
}

export interface LeaveToken {
  id: string; type: 'leave_request';
  personId: string; personName: string;
  kind: LeaveKind; mode: LeaveMode;
  startDate: string; endDate: string; days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'held';
  isSlaBreached?: boolean; conflictWith?: string;
}

export interface PayslipToken {
  id: string; type: 'payslip';
  personName: string; month: string; amount: number;
  status: 'processing' | 'pooled' | 'released';
  anomalyReason?: string;
}

export interface DocumentItem {
  id: string; title: string; category: 'Handbook' | 'Policy' | 'Benefits' | 'Compliance';
  version: string; updated: string; mustAck: boolean; acked: boolean; summary: string;
}

// --- Phase 0: generic authored entity (documents, goals, notes, announcements) ---
export type EntityType = 'document' | 'goal' | 'announcement' | 'note';
export type EntityStatus = 'draft' | 'published' | 'archived';
export interface Audience { scope: 'org' | 'team' | 'person'; targetId?: string; }
export interface Entity {
  id: string; type: EntityType; title: string; body: string;
  category?: 'Handbook' | 'Policy' | 'Benefits' | 'Compliance';
  audience: Audience; status: EntityStatus;
  authorId: string; authorName: string;
  version: number; updated: string;
  requiresAck?: boolean; ackedBy?: string[];
}
export interface Activity { id: string; text: string; at: string; }

export interface CalendarEvent {
  id: string; m: number; d: number; label: string;
  kind: 'holiday' | 'rh' | 'event' | 'birthday' | 'leave';
  person?: string;
}

export interface Cue { id: string; message: string; actionText: string; persona: Persona; kind: 'wellness' | 'sla' | 'payroll' | 'doc' | 'risk' | 'review' | 'onboarding' | 'headcount' | 'coverage' | 'nudge'; from?: string; entityId?: string; }

export interface QMsg {
  id: string; role: 'user' | 'q'; text: string;
  viz?: 'attendance' | 'comp' | 'workload' | 'retention' | 'myHours' | 'myLeave' | null;
  vizTarget?: string;
  source?: { title: string; section?: string } | null;   // policy Q&A citation
  csv?: { name: string; content: string } | null;         // charts-on-demand export
  action?: { label: string; kind: string; arg?: string } | null;
  rationale?: {                                            // Phase A: explainability scaffold
    why: string;                                           // the core reason
    whyNow?: string;                                       // why it's surfacing at this moment
    whyNot?: string;                                       // the tradeoff / what it isn't
    confidence?: 'high' | 'medium' | 'low';                // MUST trace to real signal, never fabricated
    evidence?: string[];                                   // concrete data points behind it
  } | null;
}

export interface Attendance {
  status: 'in' | 'out' | 'break';
  sessionStart: number | null; breakStart: number | null;
  workedMs: number; breakMs: number; breaks: number;
}

export interface Toast { id: string; message: string; tone: 'ok' | 'warn' | 'info'; }
export interface OnbChecklistItem { id: string; label: string; owner: string; done: boolean; }
export interface OnboardingCandidate { id: string; name: string; stage: string; progress: number; buddy?: string; role?: string; startDate?: string; checklist?: OnbChecklistItem[]; }
export interface Leaver { id: string; name: string; role: string; lastDay: string; reason: 'Resigned' | 'Contract end' | 'Retirement' | 'Involuntary'; progress: number; checklist: OnbChecklistItem[]; }
export interface Holiday { id: string; label: string; date: string; kind: 'national' | 'company' | 'restricted'; }
export interface OnbTask { id: string; label: string; hint?: string; done: boolean; owner: string; }

export interface SynthToken {
  id: string; type: 'synth';
  title: string; lines: string[];
  viz?: 'attendance' | 'comp' | 'workload' | 'retention' | null;
  verdict: 'combine' | 'relate';
  aColor: string; bColor: string;
  action?: { label: string; kind: string; arg?: string } | null;
  pos: { x: number; y: number };
}
export interface Pulse { id: string; x: number; y: number; tone: 'combine' | 'relate' | 'reject' | 'q' | 'ok'; }

// --- Phase 4: goals, 1:1s, reviews ---
export interface Goal { id: string; title: string; owner: string; progress: number; status: 'on_track' | 'at_risk' | 'done'; parentId?: string; dueOn: string; createdBy: string; archived?: boolean; }
export interface ActionItem { id: string; text: string; done: boolean; }
export interface OneOnOne { id: string; personId: string; managerId: string; scheduledFor: string; agenda: string[]; actions: ActionItem[]; }
export interface Review { id: string; personId: string; cycle: string; status: 'not_started' | 'self_submitted' | 'complete'; self?: string; manager?: string; }

// --- Phase 6: pulse surveys ---
export interface PulseState { question: string; myScore?: number; count: number; sum: number; history: number[]; themes: string[]; }

// --- Phase 6.2: compensation planning + coverage ---
export interface CompRow { id: string; salary: number; min: number; mid: number; max: number; }
export interface CompState { budget: number; plan: Record<string, number>; status: 'draft' | 'submitted' | 'approved'; }
export interface CoverageEntry { id: string; personId: string; dates: string; risk: string; suggested: string; }

export interface Reimbursement {
  id: string;
  personId: string;
  title: string;
  category: 'Travel' | 'Hardware' | 'Wellness' | 'Internet' | 'Other';
  amount: number;
  submitted: string;          // display date
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected';
  note?: string;
  receipt?: string;           // filename of the attached receipt
}

export interface AssetItem {
  id: string;
  personId: string;
  name: string;
  category: 'Laptop' | 'Phone' | 'Peripheral' | 'Access' | 'Furniture';
  serial: string;
  assigned: string;           // display date
  condition: 'new' | 'good' | 'fair';
  returnable: boolean;
}
