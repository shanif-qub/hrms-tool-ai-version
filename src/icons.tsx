// ICONOGRAPHY REGISTRY — the single source of truth for the visual token language.
//
// One concept maps to exactly one glyph, one default size role, and one semantic
// tint. Every surface (orbit spheres, side-panel tokens, secondary-page rows,
// chips) draws from here so the same idea always looks the same. This is the
// portable core of the visual paradigm: to retarget the system at another domain,
// swap the CONCEPT entries — the size roles and tint binding stay.

import {
  User, Users, Building2, Plane, CalendarDays, Star, IndianRupee, FileText,
  ShieldCheck, ClipboardCheck, Clock, TrendingUp, Target, MessagesSquare,
  UserPlus, UserMinus, TriangleAlert, LifeBuoy, Sparkles, HeartPulse, Timer,
  Bell, GaugeCircle, BarChart3, LineChart, Table, ListChecks, Cake, PartyPopper,
  Wallet, Network, Coffee, Award, Layers, CalendarClock, FileCheck2, UserCog,
  Briefcase, BookOpen, HeartHandshake, Scale, Megaphone, StickyNote, type LucideIcon,
} from 'lucide-react';

export type SizeRole = 'hero' | 'card' | 'inline';
export type Tint = 'lumen' | 'halo' | 'ember' | 'coral' | 'mist';

// Pixel size per role. The more spatial/glanceable the context, the larger the
// icon and the more text recedes. `hero` leads (orbit, empty states); `card`
// leads a row (side panels, list rows); `inline` is a meta glyph (chips, hints).
export const ICON_SIZE: Record<SizeRole, number> = { hero: 30, card: 20, inline: 14 };

export interface IconSpec { icon: LucideIcon; tint: Tint; }

// The canonical concept vocabulary. Keys are stable concept names, not UI labels.
export const CONCEPT: Record<string, IconSpec> = {
  // people & org
  person: { icon: User, tint: 'halo' },
  people: { icon: Users, tint: 'halo' },
  team: { icon: Users, tint: 'halo' },
  org: { icon: Building2, tint: 'halo' },
  manager: { icon: UserCog, tint: 'halo' },

  // time & leave
  leave: { icon: Plane, tint: 'lumen' },
  calendar: { icon: CalendarDays, tint: 'lumen' },
  holiday: { icon: Star, tint: 'ember' },
  attendance: { icon: Clock, tint: 'lumen' },
  timeadmin: { icon: CalendarClock, tint: 'lumen' },
  break: { icon: Coffee, tint: 'mist' },

  // pay
  pay: { icon: IndianRupee, tint: 'lumen' },
  payslip: { icon: Wallet, tint: 'lumen' },
  payroll: { icon: IndianRupee, tint: 'lumen' },
  budget: { icon: Wallet, tint: 'ember' },

  // documents & policy
  document: { icon: FileText, tint: 'halo' },
  policy: { icon: ShieldCheck, tint: 'halo' },
  'doc.Handbook': { icon: BookOpen, tint: 'halo' },
  'doc.Policy': { icon: ShieldCheck, tint: 'halo' },
  'doc.Benefits': { icon: HeartHandshake, tint: 'lumen' },
  'doc.Compliance': { icon: Scale, tint: 'ember' },
  'doc.announcement': { icon: Megaphone, tint: 'lumen' },
  'doc.note': { icon: StickyNote, tint: 'mist' },
  'doc.goal': { icon: Target, tint: 'halo' },
  acknowledged: { icon: FileCheck2, tint: 'lumen' },
  approval: { icon: ClipboardCheck, tint: 'ember' },

  // growth
  growth: { icon: TrendingUp, tint: 'halo' },
  goal: { icon: Target, tint: 'halo' },
  review: { icon: Award, tint: 'halo' },
  journey: { icon: Briefcase, tint: 'halo' },

  // lifecycle
  onboarding: { icon: UserPlus, tint: 'halo' },
  offboarding: { icon: UserMinus, tint: 'ember' },

  // assistant & signals
  q: { icon: Sparkles, tint: 'lumen' },
  cue: { icon: Bell, tint: 'ember' },
  wellness: { icon: HeartPulse, tint: 'lumen' },
  sla: { icon: Timer, tint: 'coral' },
  risk: { icon: TriangleAlert, tint: 'coral' },
  coverage: { icon: LifeBuoy, tint: 'ember' },
  headcount: { icon: Users, tint: 'lumen' },
  nudge: { icon: Bell, tint: 'ember' },
  requests: { icon: LifeBuoy, tint: 'lumen' },
  birthday: { icon: Cake, tint: 'halo' },
  event: { icon: PartyPopper, tint: 'halo' },

  // analytics & canvas widgets
  analytics: { icon: BarChart3, tint: 'lumen' },
  kpi: { icon: GaugeCircle, tint: 'lumen' },
  bars: { icon: BarChart3, tint: 'lumen' },
  trend: { icon: LineChart, tint: 'lumen' },
  gauge: { icon: GaugeCircle, tint: 'lumen' },
  timeline: { icon: ListChecks, tint: 'lumen' },
  table: { icon: Table, tint: 'lumen' },
  planning: { icon: Layers, tint: 'ember' },
  focus: { icon: Target, tint: 'coral' },
  orgchart: { icon: Network, tint: 'halo' },
};

const TINT_VAR: Record<Tint, string> = {
  lumen: 'var(--color-lumen)',
  halo: 'var(--color-halo-text)',
  ember: 'var(--color-ember)',
  coral: 'var(--color-coral)',
  mist: 'var(--color-mist)',
};

export function iconFor(concept: string): IconSpec | null {
  return CONCEPT[concept] ?? null;
}

/** Resolve a document category (or entity type) to its registry concept key. */
export function docConcept(category?: string): string {
  if (!category) return 'document';
  return CONCEPT[`doc.${category}`] ? `doc.${category}` : 'document';
}

/**
 * ConceptIcon — the one component every surface uses to render a concept glyph.
 * `size` picks a scale role; `tintOverride` lets a state (e.g. a person at risk)
 * override the concept's default tint while keeping the same glyph.
 */
export function ConceptIcon({ concept, size = 'card', tintOverride, className = '', strokeWidth = 2 }: {
  concept: string; size?: SizeRole; tintOverride?: Tint; className?: string; strokeWidth?: number;
}) {
  const spec = CONCEPT[concept];
  if (!spec) return null;
  const Glyph = spec.icon;
  const px = ICON_SIZE[size];
  const color = TINT_VAR[tintOverride ?? spec.tint];
  return <Glyph width={px} height={px} strokeWidth={strokeWidth} className={className} style={{ color }} aria-hidden />;
}
