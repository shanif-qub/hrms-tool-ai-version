import { motion } from 'motion/react';
import { Masked } from './Masked';
import { useWorkspace } from '../store';
import { ATTENDANCE_SERIES, COMP_BANDS, WORKLOAD, PEOPLE, MY_HOURS, MY_LEAVE, TALENT, TIMEOFF_GRID, MY_PAY, ME_ID } from '../data';

/* My hours — worked vs expected, grouped bars */
export function MyHoursViz() {
  const max = Math.max(...MY_HOURS.map(r => Math.max(r.worked, r.expected)));
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-3 h-24">
        {MY_HOURS.map((r, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1 h-20">
              <motion.span initial={{ height: 0 }} animate={{ height: `${(r.worked / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                className="w-2.5 rounded-t" style={{ background: 'var(--color-lumen)' }} />
              <motion.span initial={{ height: 0 }} animate={{ height: `${(r.expected / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 + 0.05 }}
                className="w-2.5 rounded-t" style={{ background: 'var(--color-glass-edge)' }} />
            </div>
            <span className="text-[12px] font-mono text-[var(--color-trace)]">{r.w}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[13px] text-[var(--color-mist)]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-lumen)' }} /> Worked</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-glass-edge)' }} /> Expected</span>
      </div>
    </div>
  );
}

/* My leave — taken vs total, per type */
export function MyLeaveViz() {
  return (
    <div className="space-y-2">
      {MY_LEAVE.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-[13px] text-[var(--color-mist)]"><span>{r.type}</span><span className="font-mono text-[var(--color-trace)]">{r.taken}/{r.total}d</span></div>
          <div className="h-2 rounded-full bg-[var(--color-glass-edge)] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(r.taken / r.total) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.06 }}
              className="h-full rounded-full" style={{ background: 'var(--color-halo)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Attendance trend — area + line sparkline */
export function AttendanceViz() {
  const data = ATTENDANCE_SERIES;
  const W = 280, H = 90, max = 100, min = 60;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs><linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ember)" stopOpacity="0.35" /><stop offset="100%" stopColor="var(--color-ember)" stopOpacity="0" />
        </linearGradient></defs>
        <motion.path d={area} fill="url(#att)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.path d={line} fill="none" stroke="var(--color-ember)" strokeWidth="2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="3.5" fill="var(--color-ember)" />
      </svg>
      <div className="flex justify-between text-[13px] font-mono text-[var(--color-trace)]"><span>8 wks ago · 92%</span><span>now · 71%</span></div>
    </div>
  );
}

/* Comp distribution — stacked band bar */
export function CompViz() {
  const tone = (t: string) => t === 'ember' ? 'var(--color-ember)' : t === 'halo' ? 'var(--color-halo)' : 'var(--color-lumen)';
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden">
        {COMP_BANDS.map(b => (
          <motion.div key={b.band} initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.7 }}
            style={{ background: tone(b.tone) }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 text-[13px] text-[var(--color-mist)]">
        {COMP_BANDS.map(b => <span key={b.band} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: tone(b.tone) }} />{b.band} · {b.pct}%</span>)}
      </div>
    </div>
  );
}

/* Team workload heatmap */
export function WorkloadViz() {
  const days = ['M', 'T', 'W', 'T', 'F'];
  const cell = (v: number) => `rgba(63,224,200,${0.12 + v * 0.26})`;
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 items-center">
        <span />
        {days.map((d, i) => <span key={i} className="text-[13px] text-center text-[var(--color-trace)] font-mono">{d}</span>)}
        {WORKLOAD.map((row, r) => (
          <div key={r} className="contents">
            <span className="text-[13px] text-[var(--color-mist)] truncate">{PEOPLE[r]?.name.split(' ')[0]}</span>
            {row.map((v, c) => (
              <motion.span key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (r * 5 + c) * 0.01 }}
                className="h-5 rounded" style={{ background: cell(v) }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Retention gauge — projected risk after a lever */
export function RetentionGauge({ before, after }: { before: number; after: number }) {
  const R = 46, C = 2 * Math.PI * R;
  const arc = (v: number) => C * (1 - v);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-glass-edge)" strokeWidth="10" />
        <motion.circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-lumen)" strokeWidth="10" strokeLinecap="round"
          transform="rotate(-90 60 60)" strokeDasharray={C}
          initial={{ strokeDashoffset: arc(before) }} animate={{ strokeDashoffset: arc(after) }} transition={{ duration: 1 }} />
        <text x="60" y="58" textAnchor="middle" className="fill-[var(--color-vapor)]" style={{ fontSize: 22, fontFamily: 'Outfit' }}>{Math.round(after * 100)}%</text>
        <text x="60" y="76" textAnchor="middle" className="fill-[var(--color-mist)]" style={{ fontSize: 9 }}>risk</text>
      </svg>
      <div className="text-[13px] text-[var(--color-mist)]">
        <div className="text-[var(--color-coral)]">Before · {Math.round(before * 100)}%</div>
        <div className="text-[var(--color-lumen)] mt-1">After · {Math.round(after * 100)}%</div>
      </div>
    </div>
  );
}

export function Viz({ kind }: { kind: string | null | undefined }) {
  if (kind === 'attendance') return <AttendanceViz />;
  if (kind === 'comp') return <CompViz />;
  if (kind === 'workload') return <WorkloadViz />;
  if (kind === 'retention') return <RetentionGauge before={0.78} after={0.41} />;
  if (kind === 'myHours') return <MyHoursViz />;
  if (kind === 'myLeave') return <MyLeaveViz />;
  if (kind === 'myGoals') return <MyGoalsViz />;
  if (kind === 'myPay') return <MyPayViz />;
  return null;
}

/* Talent distribution — 2×2 performance × potential */
export function TalentMap() {
  const w = useWorkspace();
  const label: Record<string, string> = { star: 'Star', 'high-performer': 'High performer', 'high-potential': 'High potential', inconsistent: 'Inconsistent' };
  const color: Record<string, string> = { star: 'var(--color-lumen)', 'high-performer': 'var(--color-blue-text)', 'high-potential': 'var(--color-halo-text)', inconsistent: 'var(--color-ember)' };
  const order: Array<'high-potential' | 'star' | 'inconsistent' | 'high-performer'> = ['high-potential', 'star', 'inconsistent', 'high-performer'];
  const nameOf = (id: string) => PEOPLE.find(p => p.id === id)?.name.split(' ')[0] ?? id;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {order.map(q => { const cell = TALENT.find(t => t.quadrant === q)!; return (
          <div key={q} className="rounded-xl p-3 min-h-[64px]" style={{ background: `color-mix(in srgb, ${color[q]} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color[q]} 22%, transparent)` }}>
            <div className="text-[12px] uppercase tracking-wider mb-1" style={{ color: color[q] }}>{label[q]}</div>
            <div className="flex flex-wrap gap-1">{cell.ids.map(id => <button key={id} onClick={(e) => { e.stopPropagation(); w.explainToken('person', id); }} className="text-[13px] px-2 py-0.5 rounded-full bg-[var(--color-glass-2)] text-[var(--color-vapor)] hover:bg-white/15 transition-colors">{nameOf(id)}</button>)}</div>
          </div>
        ); })}
      </div>
      <div className="flex justify-between text-[12px] text-[var(--color-trace)] mt-2 px-1"><span>← lower performance</span><span>higher →</span></div>
    </div>
  );
}

/* Team time-off heatmap — report × week */
export function TimeOffHeatmap() {
  const shade = (v: number) => v === 2 ? 'var(--color-ember)' : v === 1 ? 'color-mix(in srgb, var(--color-ember) 45%, transparent)' : 'var(--color-lumen-soft)';
  const nameOf = (id: string) => PEOPLE.find(p => p.id === id)?.name.split(' ')[0] ?? id;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[70px_repeat(4,1fr)] gap-1 text-[12px] text-[var(--color-trace)] px-0.5"><span /><span className="text-center">Wk1</span><span className="text-center">Wk2</span><span className="text-center">Wk3</span><span className="text-center">Wk4</span></div>
      {TIMEOFF_GRID.map(row => (
        <div key={row.id} className="grid grid-cols-[70px_repeat(4,1fr)] gap-1 items-center">
          <span className="text-[13px] text-[var(--color-mist)] truncate">{nameOf(row.id)}</span>
          {row.weeks.map((v, i) => <span key={i} className="h-4 rounded-sm" style={{ background: shade(v) }} />)}
        </div>
      ))}
      <div className="flex items-center gap-3 text-[12px] text-[var(--color-trace)] mt-1"><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-lumen-soft)' }} /> clear</span><span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-ember)' }} /> heavy leave</span></div>
    </div>
  );
}

export function MyGoalsViz() {
  const w = useWorkspace();
  const mine = w.goals.filter(g => g.owner === ME_ID && !g.archived);
  const avg = mine.length ? Math.round(mine.reduce((a, g) => a + g.progress, 0) / mine.length) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2"><span className="text-2xl font-display text-[var(--color-vapor)]">{avg}%</span><span className="text-[12px] text-[var(--color-trace)]">avg across {mine.length} goal{mine.length === 1 ? '' : 's'}</span></div>
      <div className="space-y-2">
        {mine.slice(0, 4).map((g, i) => { const c = g.status === 'at_risk' ? 'var(--color-ember)' : 'var(--color-lumen)'; return (
          <div key={g.id} className="space-y-0.5">
            <div className="flex justify-between text-[12px]"><span className="text-[var(--color-mist)] truncate pr-2">{g.title}</span><span className="font-mono text-[var(--color-trace)]">{g.progress}%</span></div>
            <div className="h-1.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="h-full rounded-full" style={{ background: c }} /></div>
          </div>
        ); })}
        {mine.length === 0 && <div className="text-[13px] text-[var(--color-trace)]">No active goals.</div>}
      </div>
    </div>
  );
}

export function MyPayViz() {
  const max = Math.max(...MY_PAY.map(r => r.net));
  const latest = MY_PAY[MY_PAY.length - 1];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2"><span className="text-2xl font-display text-[var(--color-vapor)]"><Masked value={`₹${latest.net}k`} /></span><span className="text-[12px] text-[var(--color-trace)]">net · {latest.m}</span></div>
      <div className="flex items-end gap-2 h-16">
        {MY_PAY.map((r, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.span initial={{ height: 0 }} animate={{ height: `${(r.net / max) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="w-full rounded-t" style={{ background: i === MY_PAY.length - 1 ? 'var(--color-lumen)' : 'var(--color-glass-edge)' }} />
            <span className="text-[11px] font-mono text-[var(--color-trace)]">{r.m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
