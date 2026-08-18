import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Coffee, LogIn, LogOut, MapPin } from 'lucide-react';
import { useWorkspace } from '../store';
import { PERIOD } from '../data';

const GOAL = 8 * 3600_000;
const fmt = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`; };
const fmtShort = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h}h ${String(m).padStart(2, '0')}m`; };

export default function ClockWidget({ bare }: { bare?: boolean } = {}) {
  const { att, clockIn, clockOut, breakStart, breakEnd, reduced, pulse } = useWorkspace();
  const burst = (e: React.MouseEvent, run: () => void) => { const r = e.currentTarget.getBoundingClientRect(); pulse(r.left + r.width / 2, r.top + r.height / 2, 'ok'); run(); };
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick(t => t + 1), 1000); return () => clearInterval(i); }, []);

  const now = Date.now();
  const worked = att.workedMs + (att.status === 'in' && att.sessionStart ? now - att.sessionStart : 0);
  const breakNow = att.breakMs + (att.status === 'break' && att.breakStart ? now - att.breakStart : 0);
  const pct = Math.min(1, worked / GOAL);
  const R = 52, C = 2 * Math.PI * R;
  const statusColor = att.status === 'in' ? 'var(--color-lumen)' : att.status === 'break' ? 'var(--color-ember)' : 'var(--color-trace)';
  const statusLabel = att.status === 'in' ? 'Working' : att.status === 'break' ? 'On a break' : 'Clocked out';

  const inner = (
    <div className={bare ? "" : "glass-elevated p-5 w-[300px]"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><Clock className="w-3.5 h-3.5" /> Today</div>
        <span className="text-[13px] px-2 py-0.5 rounded-full font-mono" style={{ background: 'color-mix(in srgb, ' + statusColor + ' 16%, transparent)', color: statusColor }}>{statusLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative grid place-items-center">
          <svg viewBox="0 0 130 130" className="w-32 h-32 -rotate-90">
            <defs><linearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-blue)" /><stop offset="100%" stopColor="var(--color-lumen)" /></linearGradient></defs>
            <circle cx="65" cy="65" r={R} fill="none" stroke="var(--color-glass-edge)" strokeWidth="9" />
            <motion.circle cx="65" cy="65" r={R} fill="none" stroke={att.status === 'break' ? 'var(--color-ember)' : 'url(#clockGrad)'} strokeWidth="9" strokeLinecap="round" strokeDasharray={C} className="clock-arc" animate={{ strokeDashoffset: C * (1 - pct) }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 18 }} />
          </svg>
          <div className="absolute text-center">
            <div className={`font-mono font-semibold tabular-nums ${att.status === 'break' ? 'text-[var(--color-ember)]' : 'text-[var(--color-lumen)]'}`} style={{ fontSize: 19, letterSpacing: '-0.02em' }}>{fmtShort(worked)}</div>
            <div className="text-[13px] text-[var(--color-trace)] mt-0.5 uppercase tracking-wider">of 8h</div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-[13px]">
          <div className="font-mono text-[var(--color-vapor)]">{fmt(worked)}</div>
          <div className="flex items-center gap-2 text-[var(--color-mist)]"><Coffee className="w-3.5 h-3.5" /> {fmtShort(breakNow)} · {att.breaks} break{att.breaks === 1 ? '' : 's'}</div>
          <div className="flex items-center gap-2 text-[var(--color-lumen)]"><span className="relative grid place-items-center"><span className="absolute inset-0 rounded-full bg-[var(--color-lumen)] opacity-20 animate-ping" /><MapPin className="w-3 h-3" /></span> In zone · Jaipur</div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {att.status === 'out' ? (
          <button onClick={(e) => burst(e, clockIn)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Clock in</button>
        ) : (
          <>
            {att.status === 'in'
              ? <button onClick={(e) => burst(e, breakStart)} className="flex-1 py-3 rounded-full text-sm font-semibold glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Coffee className="w-4 h-4" /> Take a break</button>
              : <button onClick={(e) => burst(e, breakEnd)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Resume</button>}
            <button onClick={(e) => burst(e, clockOut)} className="flex-1 py-3 rounded-full text-sm font-semibold glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Clock out</button>
          </>
        )}
      </div>
    </div>
  );
  return inner;
}

// Worked-vs-expected for the current pay period — lives in the clock's peel layer.
export function PeriodBar() {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-2">
        <span className="text-[var(--color-trace)]">{PERIOD.label}</span>
        <span className="font-mono text-[var(--color-mist)]">{PERIOD.worked}h / {PERIOD.expected}h</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (PERIOD.worked / PERIOD.expected) * 100)}%` }} transition={{ duration: 0.7 }}
          className="h-full rounded-full" style={{ background: 'var(--color-lumen)' }} />
      </div>
      <div className="text-[13px] text-[var(--color-trace)] mt-2">{PERIOD.expected - PERIOD.worked}h to expected · timesheet due in {PERIOD.daysLeft} days</div>
    </div>
  );
}
