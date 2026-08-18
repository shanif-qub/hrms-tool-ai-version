// analytics — Phase D. Reasoning over the metric snapshots: period-to-period and
// span deltas, direction-of-good awareness, and plain-language narration. Kept
// framework-free so both qbrain (narration) and WidgetView (delta badges, round 2)
// can share it. No new subsystem — it reads the seeded MetricSeries.

import { METRIC_SNAPSHOTS, MetricSeries, MetricKey } from './data';

export interface Delta {
  series: MetricSeries;
  from: number; to: number;
  fromLabel: string; toLabel: string;
  abs: number;               // to - from
  pct: number;               // % change vs `from`
  improved: boolean;         // accounts for goodDown
  flat: boolean;             // within a small epsilon
}

const fmt = (v: number, unit: string) => unit === '%' ? `${v.toFixed(1)}%` : unit === 'y' ? `${v.toFixed(1)}y` : Number.isInteger(v) ? `${v}` : v.toFixed(2);

export function getSeries(key: MetricKey): MetricSeries | undefined {
  return METRIC_SNAPSHOTS.find(m => m.key === key);
}

/** Delta over a span: `back` periods ago → latest (default: previous → latest). */
export function computeDelta(key: MetricKey, back = 1): Delta | null {
  const s = getSeries(key);
  if (!s || s.values.length < 2) return null;
  const n = s.values.length;
  const iFrom = Math.max(0, n - 1 - back);
  const from = s.values[iFrom], to = s.values[n - 1];
  const abs = +(to - from).toFixed(2);
  const pct = from !== 0 ? +(((to - from) / Math.abs(from)) * 100).toFixed(1) : 0;
  const flat = Math.abs(abs) < (s.unit === '%' ? 0.05 : Math.max(0.01, Math.abs(from) * 0.005));
  const rising = abs > 0;
  const improved = flat ? false : s.goodDown ? !rising : rising;
  return { series: s, from, to, fromLabel: s.periods[iFrom], toLabel: s.periods[n - 1], abs, pct, improved, flat };
}

/** One-line human narration of a delta, e.g. "Voluntary attrition is down 0.5pts
 *  since Dec — improving." Uses "pts" for %/score, plain deltas otherwise. */
export function narrate(d: Delta): string {
  const { series: s, abs, pct, improved, flat, from, to, fromLabel, toLabel } = d;
  if (flat) return `${s.label} is flat at ${fmt(to, s.unit)} since ${fromLabel} — no meaningful change.`;
  const dir = abs > 0 ? 'up' : 'down';
  const mag = s.unit === '%' ? `${Math.abs(abs).toFixed(1)}pts` : s.unit === 'y' ? `${Math.abs(abs).toFixed(1)}y` : s.key === 'risk' ? `${Math.abs(abs).toFixed(2)}` : `${Math.abs(abs)}`;
  const tail = improved ? 'improving' : 'worth watching';
  return `${s.label} is ${dir} ${mag} since ${fromLabel} (${fmt(from, s.unit)} → ${fmt(to, s.unit)}${Math.abs(pct) >= 1 ? `, ${pct > 0 ? '+' : ''}${pct}%` : ''}) — ${tail}.`;
}

/** Snapshot of every series' latest delta, sorted by which moved most (by |pct|).
 *  Powers "what changed this week/quarter?". */
export function whatChanged(scope: 'org' | 'team' | 'all' = 'all', back = 1): Delta[] {
  return METRIC_SNAPSHOTS
    .filter(s => scope === 'all' || s.scope === scope)
    .map(s => computeDelta(s.key, back))
    .filter((d): d is Delta => !!d && !d.flat)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
}

export const fmtValue = fmt;
