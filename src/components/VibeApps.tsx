import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp, CalendarDays, MessageSquare, Activity, Grid3x3, ListChecks, ClipboardList, Network, LayoutDashboard, BarChart3, Trophy, Filter, TrendingDown, LayoutGrid, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { Avatar } from './Avatar';
import { PEOPLE, VIBE_FLIGHT, VIBE_COMPPERF, VIBE_ONEONONE, VIBE_BRADFORD, VIBE_SKILLS, VIBE_TEMPLATES, TIMEOFF_GRID, VIBE_WORKFLOW, VIBE_SURVEY, DIRECTORY, KPI_TILES, ATTRITION_TREND, HEADCOUNT_TEAMS, BAND_LADDER, ENGAGEMENT_HEAT, LEADERBOARD, HIRING_FUNNEL } from '../data';

const name = (id: string) => PEOPLE.find(p => p.id === id)?.name.split(' ')[0] ?? id;
const full = (id: string) => PEOPLE.find(p => p.id === id)?.name ?? id;

export const VIBE_ICON: Record<string, ReactNode> = {
  flightrisk: <AlertTriangle className="w-3.5 h-3.5" />, compperf: <TrendingUp className="w-3.5 h-3.5" />,
  coverage: <CalendarDays className="w-3.5 h-3.5" />, oneonone: <MessageSquare className="w-3.5 h-3.5" />,
  bradford: <Activity className="w-3.5 h-3.5" />, skills: <Grid3x3 className="w-3.5 h-3.5" />,
  workflow: <ListChecks className="w-3.5 h-3.5" />, survey: <ClipboardList className="w-3.5 h-3.5" />, orgspan: <Network className="w-3.5 h-3.5" />, dashboard: <LayoutDashboard className="w-3.5 h-3.5" />,
  kpi: <LayoutGrid className="w-3.5 h-3.5" />, attrition: <TrendingDown className="w-3.5 h-3.5" />, headcount: <BarChart3 className="w-3.5 h-3.5" />, bandladder: <Users className="w-3.5 h-3.5" />, heatmap: <Grid3x3 className="w-3.5 h-3.5" />, leaderboard: <Trophy className="w-3.5 h-3.5" />, funnel: <Filter className="w-3.5 h-3.5" />,
};
export const vibeTitle = (t: string) => t === 'dashboard' ? 'Dashboard' : (VIBE_TEMPLATES.find(v => v.id === t)?.title ?? 'App');

// The generated mini-app body, rendered by template id
function wseed(str: string) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function wrng(seed: number) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function VibeApp({ template, parts, config }: { template: string; parts?: string[]; config?: { kind: string; label: string; data?: { labels?: string[]; values?: number[] } } }) {
  if (template === 'widget' && config) return <WidgetView kind={config.kind} label={config.label} data={config.data} />;
  if (template === 'dashboard') return (<div className="space-y-3">{(parts ?? []).map((pt, i) => (<div key={i} className="rounded-xl glass-soft p-3"><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mb-2">{vibeTitle(pt)}</div><VibeApp template={pt} /></div>))}{(!parts || parts.length === 0) && <div className="text-[13px] text-[var(--color-trace)]">Empty dashboard.</div>}</div>);
  if (template === 'flightrisk') return (
    <div className="space-y-2">
      {VIBE_FLIGHT.map(r => (
        <div key={r.id} className="flex items-center gap-2">
          <Avatar seed={full(r.id)} name={full(r.id)} size={22} />
          <span className="text-[13px] text-[var(--color-vapor)] w-14 truncate">{name(r.id)}</span>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${r.score * 100}%` }} className="h-full rounded-full" style={{ background: r.score > 0.6 ? 'var(--color-coral)' : 'var(--color-lumen)' }} /></div>
          <span className="text-[13px] font-mono w-8 text-right" style={{ color: r.score > 0.6 ? 'var(--color-coral)' : 'var(--color-mist)' }}>{r.score.toFixed(2)}</span>
        </div>
      ))}
      <div className="text-[13px] text-[var(--color-trace)] pt-1">Top driver — Sarah: attendance ↓22% over 6 weeks.</div>
    </div>
  );
  if (template === 'compperf') return (
    <div>
      <div className="relative h-28 rounded-lg glass-soft overflow-hidden">
        <span className="absolute left-1 top-1 text-[12px] text-[var(--color-trace)]">perf →</span>
        {VIBE_COMPPERF.map(p => { const x = p.perf; const y = 50 + p.comp * 2.2; return (
          <span key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${100 - y}%` }} title={`${name(p.id)} · ${p.comp}% vs band`}>
            <Avatar seed={full(p.id)} name={full(p.id)} size={20} className={p.comp < -5 ? 'ring-2 ring-[var(--color-coral)]' : ''} />
          </span>
        ); })}
      </div>
      <div className="text-[13px] text-[var(--color-trace)] mt-2">High performer, underpaid: <span className="text-[var(--color-coral)]">Sarah (−11% vs band)</span>.</div>
    </div>
  );
  if (template === 'coverage') return (
    <div className="space-y-2">
      <div className="grid grid-cols-[54px_repeat(4,1fr)] gap-1 text-[12px] text-[var(--color-trace)]"><span /><span className="text-center">W1</span><span className="text-center">W2</span><span className="text-center">W3</span><span className="text-center">W4</span></div>
      {TIMEOFF_GRID.map(row => (
        <div key={row.id} className="grid grid-cols-[54px_repeat(4,1fr)] gap-1 items-center">
          <span className="text-[13px] text-[var(--color-mist)] truncate">{name(row.id)}</span>
          {row.weeks.map((v, i) => <span key={i} className="h-3.5 rounded-sm" style={{ background: v === 2 ? 'var(--color-ember)' : v === 1 ? 'color-mix(in srgb, var(--color-ember) 45%, transparent)' : 'var(--color-lumen-soft)' }} />)}
        </div>
      ))}
      <div className="text-[13px] text-[var(--color-ember)] pt-0.5">Thin cover in W3–W4 (Jul 25–28).</div>
    </div>
  );
  if (template === 'oneonone') return (
    <div className="space-y-2">
      {VIBE_ONEONONE.map(r => (
        <div key={r.id} className="flex items-center gap-2">
          <Avatar seed={full(r.id)} name={full(r.id)} size={22} />
          <span className="text-[13px] text-[var(--color-vapor)] flex-1 truncate">{name(r.id)}</span>
          <span className="text-[13px] font-mono" style={{ color: r.due ? 'var(--color-ember)' : 'var(--color-trace)' }}>{r.last}</span>
          {r.due && <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--color-ember)]/15 text-[var(--color-ember)]">due</span>}
        </div>
      ))}
    </div>
  );
  if (template === 'bradford') return (
    <div className="space-y-2">
      {VIBE_BRADFORD.map(r => (
        <div key={r.id} className="flex items-center gap-2">
          <Avatar seed={full(r.id)} name={full(r.id)} size={22} />
          <span className="text-[13px] text-[var(--color-vapor)] flex-1 truncate">{name(r.id)}</span>
          <span className="text-[13px] font-mono" style={{ color: r.flag ? 'var(--color-coral)' : 'var(--color-mist)' }}>{r.score}</span>
          {r.flag && <AlertTriangle className="w-3 h-3 text-[var(--color-coral)]" />}
        </div>
      ))}
      <div className="text-[13px] text-[var(--color-trace)] pt-0.5">Score &gt; 100 warrants a check-in — Sarah at 128.</div>
    </div>
  );
  if (template === 'skills') { const ids = ['p2', 'p3', 'p4', 'p5']; const dot = (l: number) => l >= 3 ? 'var(--color-lumen)' : l === 2 ? 'color-mix(in srgb, var(--color-lumen) 55%, transparent)' : l === 1 ? 'var(--color-glass-edge)' : 'transparent';
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-[70px_repeat(4,1fr)] gap-1 items-center"><span />{ids.map(id => <span key={id} className="text-[12px] text-center text-[var(--color-trace)] truncate">{name(id)}</span>)}</div>
        {VIBE_SKILLS.map(row => (
          <div key={row.skill} className="grid grid-cols-[70px_repeat(4,1fr)] gap-1 items-center">
            <span className="text-[13px] text-[var(--color-mist)] truncate">{row.skill}</span>
            {ids.map(id => <span key={id} className="h-4 rounded-sm mx-auto w-4/5" style={{ background: dot((row.levels as any)[id]) }} />)}
          </div>
        ))}
        <div className="text-[13px] text-[var(--color-trace)] pt-0.5">Gap: only one strong Frontend (David).</div>
      </div>
    );
  }
  if (template === 'workflow') return (
    <div className="space-y-2">
      {VIBE_WORKFLOW.map(r => (
        <div key={r.id} className="flex items-center gap-2">
          <Avatar seed={full(r.id)} name={full(r.id)} size={22} />
          <span className="text-[13px] text-[var(--color-vapor)] w-16 truncate">{name(r.id)}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-glass-2)] text-[var(--color-mist)]">{r.stage}</span>
          <span className="flex-1" />
          <span className="text-[12px] font-mono" style={{ color: parseInt(r.stuck) >= 5 ? 'var(--color-coral)' : 'var(--color-mist)' }}>{r.stuck}</span>
          <span className="text-[11px] text-[var(--color-trace)]">{r.owner}</span>
        </div>
      ))}
      <div className="text-[11px] text-[var(--color-trace)] pt-0.5">2 items with you are past 4 days — worth a nudge.</div>
    </div>
  );
  if (template === 'survey') return (
    <div className="space-y-3">
      <div className="space-y-1">{VIBE_SURVEY.questions.map((q, i) => <div key={i} className="text-[13px] text-[var(--color-vapor)] flex gap-2"><span className="text-[var(--color-trace)]">{i + 1}.</span>{q}</div>)}</div>
      <div className="pt-1">
        <div className="flex h-3 rounded-full overflow-hidden">
          {VIBE_SURVEY.results.map((r, i) => <span key={i} style={{ width: `${r.pct}%`, background: i === 0 ? 'var(--color-lumen)' : i === 1 ? 'var(--color-glass-edge)' : 'var(--color-coral)' }} />)}
        </div>
        <div className="flex justify-between text-[11px] text-[var(--color-trace)] mt-1">{VIBE_SURVEY.results.map((r, i) => <span key={i}>{r.label} {r.pct}%</span>)}</div>
      </div>
    </div>
  );
  if (template === 'orgspan') return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_repeat(3,40px)] gap-1 text-[11px] uppercase tracking-wider text-[var(--color-trace)]"><span /><span className="text-center">Dir</span><span className="text-center">Ind</span><span className="text-center">Tot</span></div>
      {DIRECTORY.map(d => (
        <div key={d.name} className="grid grid-cols-[1fr_repeat(3,40px)] gap-1 items-center">
          <span className="text-[13px] text-[var(--color-vapor)] truncate">{d.name}</span>
          <span className="text-center text-[13px] font-mono text-[var(--color-vapor)]">{d.direct}</span>
          <span className="text-center text-[13px] font-mono text-[var(--color-mist)]">{d.indirect}</span>
          <span className="text-center text-[13px] font-mono text-[var(--color-lumen)]">{d.total}</span>
        </div>
      ))}
    </div>
  );
  if (template === 'kpi') return (
    <div className="grid grid-cols-2 gap-2">
      {KPI_TILES.map(k => (
        <div key={k.label} className="glass-soft rounded-xl p-3">
          <div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] truncate">{k.label}</div>
          <div className="flex items-baseline gap-2"><span className="text-lg font-display text-[var(--color-vapor)]">{k.value}</span>{k.delta && <span className="text-[11px]" style={{ color: k.up ? 'var(--color-lumen)' : 'var(--color-coral)' }}>{k.delta}</span>}</div>
        </div>
      ))}
    </div>
  );
  if (template === 'attrition') { const max = Math.max(...ATTRITION_TREND); const pts = ATTRITION_TREND.map((v, i) => `${(i / (ATTRITION_TREND.length - 1)) * 100},${30 - (v / max) * 26}`).join(' '); return (
    <div>
      <div className="flex items-baseline gap-2 mb-1"><span className="text-lg font-display text-[var(--color-vapor)]">{ATTRITION_TREND[ATTRITION_TREND.length - 1].toFixed(1)}%</span><span className="text-[12px] text-[var(--color-lumen)] flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> last 8 months</span></div>
      <svg viewBox="0 0 100 32" className="w-full h-16" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="var(--color-lumen)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>
    </div>
  ); }
  if (template === 'headcount') { const max = Math.max(...HEADCOUNT_TEAMS.map(t => t.n)); return (
    <div className="space-y-2">
      {HEADCOUNT_TEAMS.map(t => (
        <div key={t.team} className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--color-mist)] w-24 truncate">{t.team}</span>
          <div className="flex-1 h-4 rounded bg-[var(--color-glass-edge)] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(t.n / max) * 100}%` }} className="h-full rounded bg-[var(--color-lumen)]" /></div>
          <span className="text-[12px] font-mono text-[var(--color-vapor)] w-6 text-right">{t.n}</span>
        </div>
      ))}
    </div>
  ); }
  if (template === 'bandladder') { const lo = Math.min(...BAND_LADDER.map(b => b.min)); const hi = Math.max(...BAND_LADDER.map(b => b.max)); return (
    <div className="space-y-2">
      {BAND_LADDER.map(b => (
        <div key={b.level} className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-[var(--color-vapor)] w-7">{b.level}</span>
          <div className="flex-1 relative h-4"><div className="absolute inset-y-0 rounded bg-[var(--color-lumen)]/30" style={{ left: `${((b.min - lo) / (hi - lo)) * 100}%`, right: `${100 - ((b.max - lo) / (hi - lo)) * 100}%` }} /></div>
          <span className="text-[11px] text-[var(--color-trace)] w-16 text-right">\u20b9{b.min}\u2013{b.max}L</span>
          <span className="text-[11px] text-[var(--color-halo-text)] w-10 text-right">{b.here} here</span>
        </div>
      ))}
    </div>
  ); }
  if (template === 'heatmap') { const color = (v: number) => ['transparent', 'var(--color-coral)', 'color-mix(in srgb, var(--color-ember) 70%, transparent)', 'var(--color-glass-edge)', 'color-mix(in srgb, var(--color-lumen) 55%, transparent)', 'var(--color-lumen)'][v]; return (
    <div className="space-y-1">
      <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-1 text-[11px] text-[var(--color-trace)]"><span />{['W1', 'W2', 'W3', 'W4', 'W5'].map(x => <span key={x} className="text-center">{x}</span>)}</div>
      {ENGAGEMENT_HEAT.map(r => (
        <div key={r.team} className="grid grid-cols-[48px_repeat(5,1fr)] gap-1 items-center">
          <span className="text-[12px] text-[var(--color-mist)]">{r.team}</span>
          {r.wk.map((v, i) => <span key={i} className="h-5 rounded" style={{ background: color(v) }} />)}
        </div>
      ))}
    </div>
  ); }
  if (template === 'leaderboard') { const max = Math.max(...LEADERBOARD.map(l => l.pts)); return (
    <div className="space-y-2">
      {LEADERBOARD.map((l, i) => (
        <div key={l.name} className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-[var(--color-trace)] w-4">{i + 1}</span>
          <Avatar seed={l.name} name={l.name} size={22} />
          <span className="text-[13px] text-[var(--color-vapor)] flex-1 truncate">{l.name}</span>
          <div className="w-20 h-2 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><div className="h-full rounded-full bg-[var(--color-lumen)]" style={{ width: `${(l.pts / max) * 100}%` }} /></div>
          <span className="text-[12px] font-mono text-[var(--color-vapor)] w-6 text-right">{l.pts}</span>
        </div>
      ))}
    </div>
  ); }
  if (template === 'funnel') { const max = HIRING_FUNNEL[0].n; return (
    <div className="space-y-2">
      {HIRING_FUNNEL.map(f => (
        <div key={f.stage} className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--color-mist)] w-20">{f.stage}</span>
          <div className="flex-1 h-5 rounded bg-[var(--color-glass-edge)] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(f.n / max) * 100}%` }} className="h-full rounded" style={{ background: 'linear-gradient(90deg, var(--color-halo), var(--color-lumen))' }} /></div>
          <span className="text-[12px] font-mono text-[var(--color-vapor)] w-10 text-right">{f.n}</span>
        </div>
      ))}
    </div>
  ); }
  return <div className="text-[13px] text-[var(--color-mist)]">Generating\u2026</div>;
}

function WidgetView({ kind, label, data }: { kind: string; label: string; data?: { labels?: string[]; values?: number[] } }) {
  const r = wrng(wseed(label + kind));
  // Provided values win; labels without values get stable synthesized values per label.
  const given = data?.values?.length ? data.values : data?.labels?.length ? data.labels.map(l => 20 + Math.round(wrng(wseed(l))() * 75)) : null;
  const series = given && given.length >= 2 ? given : given && given.length === 1 ? [given[0]] : Array.from({ length: 8 }, () => 30 + Math.round(r() * 60));
  const live = !!given;
  const tag = live ? <span className="ml-2 text-[11px] normal-case tracking-normal px-1 py-px rounded bg-[var(--color-lumen)]/15 text-[var(--color-lumen)]">your data</span> : null;
  if (kind === 'kpi') { const val = series[series.length - 1]; const delta = series.length > 1 ? ((series[series.length - 1] - series[series.length - 2]) / (series[series.length - 2] || 1)) * 100 : (r() * 8 - 3); const max = Math.max(...series); const pts = series.length > 1 ? series.map((v, i) => `${(i / (series.length - 1)) * 100},${30 - (v / max) * 26}`).join(' ') : ''; return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] truncate">{label}{tag}</div>
      <div className="flex items-baseline gap-2"><span className="text-2xl font-display text-[var(--color-vapor)]">{val}</span><span className="text-[12px]" style={{ color: delta >= 0 ? 'var(--color-lumen)' : 'var(--color-coral)' }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span></div>
      {pts && <svg viewBox="0 0 100 32" className="w-full h-10 mt-1" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="var(--color-lumen)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>}
    </div>
  ); }
  if (kind === 'gauge') { const val = live ? Math.min(100, Math.max(0, Math.round(series[0]))) : 30 + Math.round(r() * 65); const a = Math.PI * (1 - val / 100); const x = 50 + 40 * Math.cos(a), y = 50 - 40 * Math.sin(a); return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 58" className="w-40 h-24"><path d="M10 50 A40 40 0 0 1 90 50" stroke="var(--color-glass-edge)" strokeWidth="8" fill="none" strokeLinecap="round" /><path d={`M10 50 A40 40 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} stroke="var(--color-lumen)" strokeWidth="8" fill="none" strokeLinecap="round" /></svg>
      <div className="-mt-6 text-center"><div className="text-2xl font-display text-[var(--color-vapor)]">{val}{live ? '%' : ''}</div><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] truncate max-w-[160px]">{label}{tag}</div></div>
    </div>
  ); }
  if (kind === 'trend') { const s2 = series.length > 1 ? series : [...series, series[0]]; const max = Math.max(...s2), min = Math.min(...s2); const pts = s2.map((v, i) => `${(i / (s2.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(' '); const first = s2[0], last = s2[s2.length - 1]; const dPct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0; const rising = last >= first; return (
    <div><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mb-1 truncate">{label}{tag}</div><svg viewBox="0 0 100 32" className="w-full h-16" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="var(--color-lumen)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>{live && data?.labels?.length ? <div className="flex justify-between text-[11px] text-[var(--color-trace)] mt-0.5">{data.labels.slice(0, 8).map((l, i) => <span key={i} className="truncate max-w-[3.5rem]">{l}</span>)}</div> : null}{live && s2.length > 1 && <div className="flex items-center gap-2 mt-2 text-[12px]"><span className="text-[var(--color-trace)]">{first}</span><span className="text-[var(--color-trace)]">→</span><span className="text-[var(--color-vapor)] font-medium">{last}</span><span className="ml-1 px-2 py-px rounded-full text-[11px]" style={{ color: rising ? 'var(--color-lumen)' : 'var(--color-coral)', background: rising ? 'var(--color-lumen)' : 'var(--color-coral)', backgroundColor: 'color-mix(in srgb, currentColor 14%, transparent)' }}>{rising ? '▲' : '▼'} {Math.abs(dPct).toFixed(0)}% over period</span></div>}</div>
  ); }
  if (kind === 'bars') { const bars = live ? series.slice(0, 8) : Array.from({ length: 5 }, () => 20 + Math.round(r() * 75)); const bl = data?.labels?.slice(0, 8); const max = Math.max(...bars); return (
    <div><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mb-2 truncate">{label}{tag}</div><div className="flex items-end gap-2 h-20">{bars.map((v, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0"><span className="text-[11px] font-mono text-[var(--color-mist)]">{live ? v : ''}</span><motion.span initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: i * 0.05 }} className="w-full rounded-t bg-[var(--color-lumen)]" /><span className="text-[11px] text-[var(--color-trace)] truncate max-w-full">{bl?.[i] ?? String.fromCharCode(65 + i)}</span></div>))}</div></div>
  ); }
  if (kind === 'table') { const rows: [string, string][] = live ? series.slice(0, 6).map((v, i) => [data?.labels?.[i] ?? `Row ${i + 1}`, String(v)] as [string, string]) : ['This week', 'Last week', 'Month to date', 'Quarter to date'].map(k => [k, (20 + r() * 80).toFixed(0)] as [string, string]); return (
    <div><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mb-1 truncate">{label}{tag}</div><div className="space-y-1">{rows.map(([k, v]) => (<div key={k} className="flex justify-between text-[13px] border-b border-[var(--color-glass-edge)] py-1"><span className="text-[var(--color-mist)]">{k}</span><span className="font-mono text-[var(--color-vapor)]">{v}</span></div>))}</div></div>
  ); }
  if (kind === 'timeline') { const steps = data?.labels?.length ? data.labels.slice(0, 6) : ['Kickoff', 'Build', 'Review', 'Launch']; const eta = ['Now', '+2w', '+5w', '+8w', '+11w', '+14w']; return (
    <div><div className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mb-2 truncate">{label}{tag}</div><div className="space-y-2">{steps.map((st, i) => (<div key={st + i} className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[var(--color-lumen)]' : 'bg-[var(--color-glass-edge)]'}`} /><span className="text-[13px] text-[var(--color-vapor)] flex-1">{st}</span><span className="text-[11px] text-[var(--color-trace)]">{eta[i] ?? ''}</span></div>))}</div></div>
  ); }
  return <div className="text-[13px] text-[var(--color-mist)]">{label}</div>;
}
