import { useMemo, useRef, useState, PointerEvent } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Check, Send, ChevronLeft, ChevronRight, LayoutGrid, Waves, Cake, Plane, Star, Sparkles, Wand2, FileCheck, Upload, X, Thermometer, Coffee, Search } from 'lucide-react';
import { useWorkspace } from '../store';
import { ConceptIcon } from '../icons';
import { CALENDAR, MONTHS, NOW, holidaysToEvents, dayStatus, ME_ID } from '../data';

// Distinct visual identity per leave type (icon + accent) — one icon for all
// four defeated the purpose of iconography.
const LEAVE_META: Record<string, { icon: any; color: string }> = {
  earned: { icon: Plane, color: 'var(--color-lumen)' },
  sick: { icon: Thermometer, color: 'var(--color-coral)' },
  casual: { icon: Coffee, color: 'var(--color-ember)' },
  rh: { icon: Star, color: 'var(--color-halo-text)' },
};
import { LeaveMode, CalendarEvent } from '../types';

const DIM = [30, 31, 31, 30]; // Jun..Sep
const evColor: Record<string, string> = { holiday: 'var(--color-ember)', rh: 'var(--color-halo)', event: 'var(--color-lumen)', birthday: 'var(--color-halo)', leave: 'var(--color-coral)' };
const evIcon: Record<string, any> = { holiday: Star, rh: Star, event: Star, birthday: Cake, leave: Plane };

interface Cell { m: number; d: number; ord: number; }

// One compact, full-width wave per month. Days are laid out as a fraction of the
// month so the whole month fits the column with no horizontal scroll; stacking a
// row per month fills the vertical space instead of leaving a void under one strip.
function MonthRibbon({ m, mn, cells, events, start, end, inRange, pick, reduced, setHover }: {
  m: number; mn: string; cells: Cell[];
  events: CalendarEvent[]; start: Cell | null; end: Cell | null;
  inRange: (c: Cell) => boolean | null | undefined; pick: (c: Cell) => void; reduced: boolean;
  setHover: (h: { x: number; y: number; m: number; d: number } | null) => void;
}) {
  const VB = 1000, H = 76, PAD = 28;
  const n = cells.length;
  const xAt = (i: number) => PAD + (i / (n - 1)) * (VB - PAD * 2);
  const yAt = (i: number) => H / 2 + Math.sin(i / 2.4) * 12;
  const evOn = (c: Cell) => events.find(e => e.m === c.m && e.d === c.d);
  const path = cells.map((c, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(i).toFixed(1)}`).join(' ');
  const selPath = (start && end) ? cells.filter(c => c.ord >= start.ord && c.ord <= end.ord)
    .map((c, k) => { const i = cells.indexOf(c); return `${k ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(i).toFixed(1)}`; }).join(' ') : '';
  return (
    <div className="glass-panel tint-lumen px-2 py-1.5" style={{ borderRadius: 'var(--r-soft)' }}>
      <div className="flex items-center gap-2 px-2 pt-1">
        <span className="text-[13px] font-display text-[var(--color-vapor)]">{mn}</span>
        <span className="text-[12px] text-[var(--color-trace)]">2026</span>
      </div>
      <svg viewBox={`0 0 ${VB} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="overflow-visible">
        <path d={path} fill="none" stroke="var(--color-glass-edge)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {selPath && <path d={selPath} fill="none" stroke="var(--color-lumen)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
        {cells.map((c, i) => {
          const ev = evOn(c); const weekend = c.ord % 7 === 5 || c.ord % 7 === 6;
          const sel = (start?.ord === c.ord && end?.ord === c.ord) || inRange(c); const today = c.m === NOW.m && c.d === NOW.d;
          const att = dayStatus(c.m, c.d);
          const attColor = att === 'present' ? 'var(--color-lumen)' : att === 'absent' ? 'var(--color-coral)' : att === 'leave' ? 'var(--color-halo)' : '';
          return (
            <g key={c.d} onClick={() => pick(c)} onPointerEnter={(e) => ev && setHover({ x: e.clientX, y: e.clientY, m: c.m, d: c.d })} onPointerLeave={() => setHover(null)}
              className="cursor-pointer" role="button" aria-label={`${mn} ${c.d}${ev ? ', ' + ev.label : ''}`}>
              {attColor && !sel && <circle cx={xAt(i)} cy={yAt(i)} r={ev ? 10 : 7.5} fill="none" stroke={attColor} strokeWidth={att === 'absent' ? 2 : 1.5} opacity={0.9} vectorEffect="non-scaling-stroke" />}
              <motion.circle cx={xAt(i)} cy={yAt(i)} r={sel ? 9 : ev ? 7 : 4} fill={sel ? 'var(--color-lumen)' : ev ? evColor[ev.kind] : weekend ? 'var(--color-trace)' : 'var(--color-mist)'} opacity={weekend && !ev && !sel ? 0.4 : 1} whileHover={reduced ? undefined : { r: 9 }} />
              {today && <circle cx={xAt(i)} cy={yAt(i)} r="13" fill="none" stroke="var(--color-lumen)" strokeWidth="1.5" className={reduced ? '' : 'animate-pulse'} vectorEffect="non-scaling-stroke" />}
              {(c.d === 1 || c.d % 5 === 0) && <text x={xAt(i)} y={yAt(i) + (i % 2 ? 22 : -14)} textAnchor="middle" className="fill-[var(--color-trace)]" style={{ fontSize: 11, fontFamily: 'Outfit' }}>{c.d}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Calendar() {
  const { leaveTypes, applyLeave, reduced, ask, pulse, holidays, leaves } = useWorkspace();
  // Single source of truth: static non-holiday events + holidays projected from state.
  const events = useMemo<CalendarEvent[]>(() => [...CALENDAR.filter(e => e.kind !== 'holiday' && e.kind !== 'rh'), ...holidaysToEvents(holidays)], [holidays]);
  const eventsOn = (m: number, d: number) => events.filter(e => e.m === m && e.d === d);
  const [view, setView] = useState<'ribbon' | 'detail'>('ribbon');
  const [focusM, setFocusM] = useState(NOW.m);
  const [kind, setKind] = useState(leaveTypes[0]?.id ?? 'earned');
  const [mode, setMode] = useState<LeaveMode>('full');
  const [half, setHalf] = useState<'first' | 'second'>('first');
  const [start, setStart] = useState<Cell | null>(null);
  const [end, setEnd] = useState<Cell | null>(null);
  const [reason, setReason] = useState('');
  const [medDoc, setMedDoc] = useState<string | null>(null);
  const [rhPick, setRhPick] = useState<string | null>(null);
  const [rhQuery, setRhQuery] = useState('');
  const [ctxTab, setCtxTab] = useState<'month' | 'year'>('month');
  const REASON_MAX = 240;
  const [hover, setHover] = useState<{ x: number; y: number; m: number; d: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<any>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  // flat ordinal list across all months
  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = []; let ord = 0;
    MONTHS.forEach((_, m) => { for (let d = 1; d <= DIM[m]; d++) out.push({ m, d, ord: ord++ }); });
    return out;
  }, []);
  const ordOf = (m: number, d: number) => cells.find(c => c.m === m && c.d === d)?.ord ?? 0;
  const isoOf = (c: Cell | null) => c ? `2026-${String(c.m + 6).padStart(2, '0')}-${String(c.d).padStart(2, '0')}` : '';
  const cellFromISO = (iso: string): Cell | null => { if (!iso) return null; const [y, mo, dy] = iso.split('-').map(Number); const m = mo - 6; if (y !== 2026 || m < 0 || m > 3 || dy < 1 || dy > DIM[m]) return null; return cells.find(c => c.m === m && c.d === dy) ?? null; };

  const pick = (c: Cell) => {
    if (mode === 'range') {
      if (!start || (start && end)) { setStart(c); setEnd(null); }
      else { if (c.ord >= start.ord) setEnd(c); else { setEnd(start); setStart(c); } }
    } else { setStart(c); setEnd(c); }
  };
  const inRange = (c: Cell) => start && end && c.ord >= start.ord && c.ord <= end.ord;
  const days = mode === 'half' ? 0.5 : (start && end ? end.ord - start.ord + 1 : start ? 1 : 0);
  const fmt = (c: Cell | null) => c ? `${String(c.d).padStart(2, '0')} ${MONTHS[c.m]}` : '—';

  // ── Leave policy (defaults; would be sourced from the Leave Policy document) ──
  const restrictedHolidays = useMemo(() => holidays.filter(h => h.kind === 'restricted'), [holidays]);
  // RH quota: how many restricted holidays the person may still take this year.
  const rhTotal = leaveTypes.find(t => t.id === 'rh')?.balance ?? 0;
  const rhLeft = rhTotal;
  const rhFiltered = useMemo(() => {
    const q = rhQuery.trim().toLowerCase();
    return q ? restrictedHolidays.filter(h => h.label.toLowerCase().includes(q) || String(h.date).toLowerCase().includes(q)) : restrictedHolidays;
  }, [restrictedHolidays, rhQuery]);
  const isRestricted = kind === 'rh';
  const isCasual = kind === 'casual';
  const isSick = kind === 'sick';
  // Casual: at most 2 at a time — beyond that it auto-converts to Earned.
  const casualConverts = isCasual && days > 2;
  const effectiveKind = casualConverts ? 'earned' : kind;
  // Sick: >2 days needs a medical document.
  const sickNeedsDoc = isSick && days > 2;
  // Reason required for everything except Restricted.
  const reasonRequired = !isRestricted;
  const reasonOk = !reasonRequired || reason.trim().length > 0;
  const effBalance = leaveTypes.find(t => t.id === effectiveKind)?.balance ?? 0;
  const balanceOk = isRestricted ? true : effBalance >= days;
  const restrictedOk = !isRestricted || !!rhPick;
  const docOk = !sickNeedsDoc || !!medDoc;
  const canSubmit = (isRestricted ? !!rhPick : (!!start && days > 0)) && balanceOk && reasonOk && restrictedOk && docOk;
  const submit = (e?: React.MouseEvent) => {
    if (!canSubmit) return;
    if (e) { const r = e.currentTarget.getBoundingClientRect(); pulse(r.left + r.width / 2, r.top + r.height / 2, 'ok'); }
    if (isRestricted) {
      const rh = restrictedHolidays.find(h => h.id === rhPick); if (!rh) return;
      applyLeave('rh', 'full', rh.label, rh.label, 1);
    } else {
      const startLabel = mode === 'half' ? `${fmt(start)} (${half === 'first' ? '1st half' : '2nd half'})` : fmt(start);
      const note = medDoc ? ` [medical proof: ${medDoc}]` : '';
      applyLeave(effectiveKind, mode, startLabel, fmt(end ?? start), days, reason.trim() + note, casualConverts ? 'Casual' : undefined);
    }
    setStart(null); setEnd(null); setReason(''); setMedDoc(null); setRhPick(null);
  };

  // drag-to-pan the ribbon
  const onDown = (e: PointerEvent) => { if (!scrollRef.current) return; setIsInteracting(true); drag.current = { x: e.clientX, left: scrollRef.current.scrollLeft }; (e.target as Element).setPointerCapture?.(e.pointerId); };
  const onMove = (e: PointerEvent) => { if (drag.current && scrollRef.current) scrollRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current = null; setIsInteracting(false); };
  const handleScroll = () => {
    setIsInteracting(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { if (!drag.current) setIsInteracting(false); }, 250);
  };

  // ribbon geometry
  const COLW = 30, H = 150;
  const W = cells.length * COLW + 40;
  const xAt = (ord: number) => 24 + ord * COLW;
  const yAt = (ord: number) => H / 2 + Math.sin(ord / 6) * 26;

  const monthLeaves = events.filter(e => e.m === focusM);
  // Your own leave for the whole calendar year — taken + approved/pending upcoming.
  const myLeaves = useMemo(() => leaves.filter(l => l.personId === ME_ID), [leaves]);

  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 overflow-hidden flex flex-col items-center">
      <div className="flex items-center justify-between w-[min(960px,96vw)] mb-3">
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><CalendarDays className="w-3.5 h-3.5" /> Continuum calendar · 2026</div>
        <div className="flex items-center gap-2">
          <button onClick={() => ask('When are the best days for me to take leave this quarter?')} className="px-3 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q</button>
          <div className="glass-soft flex items-center p-0.5 rounded-full">
            <button onClick={() => setView('ribbon')} className={`px-3 py-1 rounded-full text-[13px] flex items-center gap-1 transition-colors ${view === 'ribbon' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)]'}`}><Waves className="w-3.5 h-3.5" /> Ribbon</button>
            <button onClick={() => setView('detail')} className={`px-3 py-1 rounded-full text-[13px] flex items-center gap-1 transition-colors ${view === 'detail' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)]'}`}><LayoutGrid className="w-3.5 h-3.5" /> Detail</button>
          </div>
        </div>
      </div>

      <div className="w-[min(1200px,96vw)] flex-1 min-h-0 grid lg:grid-cols-[1fr_360px] gap-4">
        {/* left: calendar + context, scrolls independently */}
        <div className="min-w-0 min-h-0 flex flex-col gap-4">
          <div className="min-w-0 min-h-0 flex-1 panel-scroll overflow-y-auto overflow-x-hidden pr-1">
{view === 'ribbon' ? (
          <div className="flex flex-col gap-3">
            {MONTHS.map((mn, m) => (
              <MonthRibbon key={mn} m={m} mn={mn} cells={cells.filter(c => c.m === m)}
                events={events} start={start} end={end} inRange={inRange} pick={pick}
                reduced={reduced} setHover={setHover} />
            ))}
            <div className="flex flex-wrap gap-3 px-1 pt-1 text-[13px] text-[var(--color-mist)]">
               {Object.entries(evColor).map(([k, c]) => <span key={k} className="flex items-center gap-1 capitalize"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{k}</span>)}
               <span className="text-[var(--color-trace)] ml-auto">Tap a day to pick it, or use the date field →</span>
            </div>
          </div>
        ) : (
          <DetailGrid focusM={focusM} setFocusM={setFocusM} pick={pick} start={start} end={end} inRange={(m, d) => { const c = cells.find(x => x.m === m && x.d === d); return !!(c && inRange(c)); }} cells={cells} setHover={setHover} eventsOn={eventsOn} />
        )}

          </div>

        {/* contextual “this month” — its own scroll region so it never drags the calendar */}
        <div className="glass-panel tint-halo p-4 shrink-0 min-w-0 flex flex-col" style={{ maxHeight: 232 }}>
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-1 glass-soft p-1 rounded-full shrink-0">
              {(['month', 'year'] as const).map(t => (
                <button key={t} onClick={() => setCtxTab(t)} aria-pressed={ctxTab === t}
                  className={`px-3 py-2 rounded-full text-[12px] font-medium transition-colors ${ctxTab === t ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}>
                  {t === 'month' ? `${MONTHS[focusM]} context` : 'My leave · year'}
                </button>
              ))}
            </div>
            <div className="flex gap-1"><button onClick={() => setFocusM(m => Math.max(0, m - 1))} className="w-7 h-7 grid place-items-center rounded-full glass-soft hover:bg-white/10 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button><button onClick={() => setFocusM(m => Math.min(MONTHS.length - 1, m + 1))} className="w-7 h-7 grid place-items-center rounded-full glass-soft hover:bg-white/10 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button></div>
          </div>
          {ctxTab === 'year' ? (
            myLeaves.length === 0
              ? <p className="text-[13px] text-[var(--color-mist)]">No leave booked this year yet.</p>
              : <div className="grid sm:grid-cols-2 gap-2 overflow-y-auto panel-scroll pr-1 min-h-0">
                  {myLeaves.map(l => { const M = LEAVE_META[l.kind] ?? LEAVE_META.earned; const LIcon = M.icon;
                    const tone = l.status === 'approved' ? 'var(--color-lumen)' : l.status === 'pending' ? 'var(--color-ember)' : 'var(--color-trace)';
                    return (
                      <div key={l.id} className="flex items-center gap-3 text-[13px] glass-soft px-3 py-3 rounded-lg">
                        <LIcon className="w-4 h-4 shrink-0" style={{ color: M.color }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[var(--color-vapor)]">{l.startDate}{l.endDate && l.endDate !== l.startDate ? ` → ${l.endDate}` : ''}</span>
                          <span className="block text-[12px] text-[var(--color-trace)] truncate">{l.days}d · {l.reason || l.kind}</span>
                        </span>
                        <span className="text-[12px] font-mono shrink-0 capitalize" style={{ color: tone }}>{l.status}</span>
                      </div>
                    ); })}
                </div>
          ) : monthLeaves.length === 0 ? <p className="text-[13px] text-[var(--color-mist)]">Nothing scheduled.</p> : (
            <div className="grid sm:grid-cols-2 gap-2 overflow-y-auto panel-scroll pr-1 min-h-0">
              {monthLeaves.map(e => { const Icon = evIcon[e.kind]; return (
                <div key={e.id} className="flex items-center gap-2 text-[13px] glass-soft px-3 py-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: evColor[e.kind] }} />
                  <span className="text-[var(--color-vapor)]">{e.label}</span>
                  <span className="ml-auto font-mono text-[var(--color-trace)]">{e.d} {MONTHS[e.m]}</span>
                </div>); })}
            </div>
          )}
        </div>
        </div>

      {/* composer — apply for leave (sticky right rail on wide screens) */}
      <div className="glass-elevated tint-ember p-4 min-h-0 h-full flex flex-col" style={{ borderRadius: 'var(--r-soft)' }}>
        <div className="flex items-center gap-2 mb-3 shrink-0 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><CalendarDays className="w-3.5 h-3.5" /> Apply for leave</div>

        <div className="space-y-5 flex-1 min-h-0 overflow-y-auto panel-scroll pr-1">
          {/* step 1 — type */}
          <div>
            <div className="text-[13px] text-[var(--color-mist)] mb-2"><span className="text-[var(--color-lumen)] font-semibold">1</span> · Leave type</div>
            <div className="grid grid-cols-2 gap-3">
              {leaveTypes.map(k => { const M = LEAVE_META[k.id] ?? LEAVE_META.earned; const KIcon = M.icon; const on = kind === k.id; return (
                <button key={k.id} onClick={() => setKind(k.id)} aria-pressed={on}
                  className={`px-3 py-3 rounded-xl text-left transition-colors flex items-center gap-3 border ${on ? 'border-[var(--color-lumen)]/50 bg-[var(--color-lumen-soft)]' : 'border-transparent glass-soft hover:bg-white/10'}`}>
                  <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in srgb, ${M.color} 16%, transparent)`, color: M.color }}><KIcon className="w-4 h-4" /></span>
                  <span className="min-w-0"><div className="text-[13px] font-medium truncate text-[var(--color-vapor)]">{k.label}</div><div className="text-[13px] font-mono text-[var(--color-mist)]">{k.balance}d left</div></span>
                </button>
              ); })}
            </div>
          </div>
          {/* step 2 — duration */}
          {!isRestricted && <>
          <div>
            <div className="text-[13px] text-[var(--color-mist)] mb-2"><span className="text-[var(--color-lumen)] font-semibold">2</span> · Duration</div>
            <div className="flex gap-2 mb-2">{(['full', 'half', 'range'] as LeaveMode[]).map(m => <button key={m} onClick={() => { setMode(m); if (m !== 'range') setEnd(start); else setEnd(null); }} className={`flex-1 py-2 rounded-full text-[13px] transition-colors ${mode === m ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft hover:bg-white/10'}`}>{m === 'full' ? 'Full day' : m === 'half' ? 'Half day' : 'Range'}</button>)}</div>
            {/* half-day: which half */}
            {mode === 'half' && (
              <div className="flex gap-2 mb-2">
                {(['first', 'second'] as const).map(h => <button key={h} onClick={() => setHalf(h)} className={`flex-1 py-2 rounded-full text-[12px] transition-colors ${half === h ? 'bg-[var(--color-halo)]/20 text-[var(--color-halo-text)] ring-1 ring-[var(--color-halo)]/40' : 'glass-soft hover:bg-white/10 text-[var(--color-mist)]'}`}>{h === 'first' ? '1st half (AM)' : '2nd half (PM)'}</button>)}
              </div>
            )}
          </div>
          {/* step 3 — dates */}
          <div>
            <div className="text-[13px] text-[var(--color-mist)] mb-2"><span className="text-[var(--color-lumen)] font-semibold">3</span> · {mode === 'range' ? 'Dates' : 'Date'}</div>
            <div className="flex items-center gap-2">
              <label className="flex-1 glass-soft rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer">
                <CalendarDays className="w-3.5 h-3.5 text-[var(--color-mist)] shrink-0" />
                <input type="date" min="2026-06-01" max="2026-09-30" value={isoOf(start)} style={{ colorScheme: 'dark' }}
                  onChange={e => { const c = cellFromISO(e.target.value); if (c) { setStart(c); if (mode !== 'range') setEnd(c); else if (end && c.ord > end.ord) setEnd(c); } }}
                  className="bg-transparent outline-none text-[13px] text-[var(--color-vapor)] w-full" aria-label="Start date" />
              </label>
              {mode === 'range' && <>
                <span className="text-[var(--color-trace)] text-[13px]">→</span>
                <label className="flex-1 glass-soft rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--color-mist)] shrink-0" />
                  <input type="date" min={isoOf(start) || '2026-06-01'} max="2026-09-30" value={isoOf(end)} style={{ colorScheme: 'dark' }}
                    onChange={e => { const c = cellFromISO(e.target.value); if (c && (!start || c.ord >= start.ord)) setEnd(c); }}
                    className="bg-transparent outline-none text-[13px] text-[var(--color-vapor)] w-full" aria-label="End date" />
                </label>
              </>}
            </div>
            <p className="text-[12px] text-[var(--color-trace)] mt-2">Or pick directly on the {view} to the left.</p>
          </div>
          </>}
          {/* step 4 — policy details */}
          {isRestricted ? (
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="text-[13px] text-[var(--color-mist)]"><span className="text-[var(--color-lumen)] font-semibold">2</span> · Choose a restricted holiday</div>
                <span className={`text-[13px] font-mono shrink-0 ${rhLeft > 0 ? 'text-[var(--color-lumen)]' : 'text-[var(--color-coral)]'}`}>{rhLeft} of {rhTotal} left</span>
              </div>
              <p className="text-[13px] text-[var(--color-trace)] mb-3">{rhLeft > 0 ? 'Pick one pre-defined regional holiday.' : 'You have used your restricted-holiday quota for this year.'}</p>
              {restrictedHolidays.length > 6 && (
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-trace)]" />
                  <input value={rhQuery} onChange={e => setRhQuery(e.target.value)} placeholder="Search holidays…" aria-label="Search restricted holidays"
                    className="w-full glass-soft rounded-lg pl-9 pr-3 py-2 text-[13px] text-[var(--color-vapor)] outline-none placeholder:text-[var(--color-trace)]" />
                </div>
              )}
              <div className="grid gap-2 overflow-y-auto panel-scroll pr-1" style={{ height: 176 }}>
                {restrictedHolidays.length === 0 && <div className="text-[13px] text-[var(--color-trace)] glass-soft rounded-lg px-3 py-3">No restricted holidays configured. HR can add them in the Org calendar.</div>}
                {rhFiltered.length === 0 && restrictedHolidays.length > 0 && <div className="text-[13px] text-[var(--color-trace)] glass-soft rounded-lg px-3 py-3">No holiday matches “{rhQuery}”.</div>}
                {rhFiltered.map(h => { const on = rhPick === h.id; return (
                  <button key={h.id} onClick={() => setRhPick(h.id)} disabled={rhLeft <= 0} aria-pressed={on}
                    className={`px-3 py-3 rounded-lg text-left flex items-center gap-3 transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${on ? 'border-[var(--color-halo)]/55 bg-[var(--color-halo)]/18' : 'border-transparent glass-soft hover:bg-white/10'}`}>
                    <Star className="w-4 h-4 shrink-0" style={{ color: on ? 'var(--color-halo-text)' : 'var(--color-trace)' }} />
                    <span className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate text-[var(--color-vapor)]">{h.label}</div><div className="text-[13px] font-mono text-[var(--color-trace)]">{h.date}</div></span>
                    {on && <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--color-halo-text)' }} />}
                  </button>
                ); })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* casual → earned auto-conversion notice */}
              {casualConverts && (
                <div className="rounded-xl px-3 py-3 text-[12px] flex items-start gap-2" style={{ background: 'color-mix(in srgb, var(--color-ember) 12%, transparent)', color: 'var(--color-ember)' }}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Casual is capped at 2 days — this will be submitted as <b>Earned</b>.</span>
                </div>
              )}
              {/* reason (required for all non-restricted) */}
              <div>
                <div className="text-[13px] text-[var(--color-mist)] mb-2 flex items-center justify-between"><span><span className="text-[var(--color-lumen)] font-semibold">4</span> · Reason</span><span className={`text-[11px] font-mono ${reason.length > REASON_MAX - 30 ? 'text-[var(--color-ember)]' : 'text-[var(--color-trace)]'}`}>{reason.length}/{REASON_MAX}</span></div>
                <textarea value={reason} onChange={e => setReason(e.target.value.slice(0, REASON_MAX))} placeholder="Briefly, what's this leave for?" rows={2}
                  className="w-full glass-soft rounded-xl px-3 py-2 text-[13px] text-[var(--color-vapor)] outline-none resize-none placeholder:text-[var(--color-trace)]" />
              </div>
              {/* sick > 2 days → medical document */}
              {sickNeedsDoc && (
                <div>
                  <div className="text-[13px] text-[var(--color-mist)] mb-2"><span className="text-[var(--color-lumen)] font-semibold">5</span> · Medical document <span className="text-[var(--color-coral)]">*</span></div>
                  <p className="text-[12px] text-[var(--color-trace)] mb-2">Sick over 2 days needs a medical document.</p>
                  {medDoc ? (
                    <div className="glass-soft rounded-xl px-3 py-2 flex items-center gap-2 text-[13px]">
                      <FileCheck className="w-4 h-4 text-[var(--color-lumen)] shrink-0" />
                      <span className="flex-1 truncate text-[var(--color-vapor)]">{medDoc}</span>
                      <button onClick={() => setMedDoc(null)} className="text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="glass-soft rounded-xl px-3 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors text-[13px] text-[var(--color-mist)]">
                      <Upload className="w-4 h-4 shrink-0" /> Upload prescription / certificate
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setMedDoc(f.name); }} />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

          {/* review + actions — always visible, never scrolled out of reach */}
          <div className="pt-4 mt-4 border-t border-[var(--color-glass-edge)] space-y-3 shrink-0">
            <div className="glass-soft rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] text-[var(--color-trace)]">Requesting</div>
                <div className="text-[13px] font-mono text-[var(--color-vapor)] truncate">{isRestricted ? (restrictedHolidays.find(h => h.id === rhPick)?.label ?? '—') : mode === 'range' ? `${fmt(start)} → ${fmt(end)}` : mode === 'half' ? `${fmt(start)} · ${half === 'first' ? 'AM' : 'PM'}` : fmt(start)}</div>
              </div>
              <div className="font-mono text-right shrink-0"><span className="text-[var(--color-lumen)] text-[15px]">{isRestricted ? (rhPick ? 1 : 0) : (days || 0)}d</span></div>
            </div>
            <button onClick={submit} disabled={!canSubmit} className="w-full h-12 px-5 rounded-full text-[14px] font-semibold brand-gradient-btn text-white disabled:opacity-30 disabled:grayscale hover:brightness-110 transition-all flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send to Marcus</button>
            <button onClick={() => ask('Suggest the best days for me to take leave next month')} className="w-full h-10 px-4 rounded-full text-[13px] font-medium glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Wand2 className="w-4 h-4 text-[var(--color-lumen)]" /> Ask Q to suggest dates</button>
          </div>
      </div>
      </div>

      {hover && <Tooltip x={hover.x} y={hover.y} events={eventsOn(hover.m, hover.d)} label={`${hover.d} ${MONTHS[hover.m]}`} />}
    </div>
  );
}

function Tooltip({ x, y, events, label }: { x: number; y: number; events: CalendarEvent[]; label: string }) {
  return (
    <div className="fixed z-[90] glass-elevated px-3 py-2 pointer-events-none text-[13px]" style={{ left: x + 12, top: y + 12, maxWidth: 220 }}>
      <div className="font-mono text-[13px] text-[var(--color-trace)] mb-1">{label}</div>
      {events.map(e => { const Icon = evIcon[e.kind]; return <div key={e.id} className="flex items-center gap-2 py-0.5"><Icon className="w-3 h-3" style={{ color: evColor[e.kind] }} /><span>{e.label}</span></div>; })}
    </div>
  );
}

function DetailGrid({ focusM, setFocusM, pick, start, end, inRange, cells, setHover, eventsOn }: any) {
  const dim = DIM[focusM];
  const cellsM = cells.filter((c: Cell) => c.m === focusM);
  const first = cellsM.find((c: Cell) => c.d === 1)!;
  const blanks = first ? first.ord % 7 : 0;
  return (
    <div className="glass-panel tint-lumen p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setFocusM((m: number) => Math.max(0, m - 1))} aria-label="Previous month" className="w-8 h-8 grid place-items-center rounded-full glass-soft hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <div className="font-display text-lg">{MONTHS[focusM]} 2026</div>
        <button onClick={() => setFocusM((m: number) => Math.min(MONTHS.length - 1, m + 1))} aria-label="Next month" className="w-8 h-8 grid place-items-center rounded-full glass-soft hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <div key={i} className="text-center text-[13px] uppercase tracking-wider text-[var(--color-trace)] pb-1">{d.charAt(0)}</div>)}
        {Array.from({ length: blanks }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: dim }).map((_, i) => {
          const d = i + 1; const evs = eventsOn(focusM, d); const ev = evs[0];
          const c = cellsM.find((x: Cell) => x.d === d)!;
          const weekend = c.ord % 7 === 0 || c.ord % 7 === 6;
          const sel = (start?.ord === c.ord && end?.ord === c.ord) || inRange(focusM, d);
          const today = focusM === NOW.m && d === NOW.d;
          const Icon = ev ? evIcon[ev.kind] : null;
          const att = dayStatus(focusM, d);
          const ATT_COLOR: Record<string, string> = { present: 'var(--color-lumen)', absent: 'var(--color-coral)', leave: 'var(--color-halo)', weekend: 'var(--color-trace)', none: '' };
          const ATT_LABEL: Record<string, string> = { present: 'Present', absent: 'Absent', leave: 'On leave', weekend: 'Weekend', none: '' };
          return (
            <button key={d} onClick={() => pick(c)}
              onPointerEnter={(e) => ev && setHover({ x: e.clientX, y: e.clientY, m: focusM, d })} onPointerLeave={() => setHover(null)}
              className={`relative rounded-xl min-h-[76px] p-2 flex flex-col text-left transition-all ${sel ? 'bg-[var(--color-lumen-soft)] ring-1 ring-[var(--color-lumen)]' : today ? 'glass-soft ring-1 ring-[var(--color-lumen)]/60' : 'glass-soft hover:bg-white/10'}`}
              title={[ev?.label, ATT_LABEL[att]].filter(Boolean).join(' · ')} aria-label={`${d} ${MONTHS[focusM]}${ev ? ', ' + ev.label : ''}${att !== 'none' ? ', ' + ATT_LABEL[att] : ''}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${sel ? 'text-[var(--color-lumen)]' : weekend ? 'text-[var(--color-trace)]' : 'text-[var(--color-vapor)]'}`}>{d}</span>
                {today ? <span className="text-[12px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Today</span>
                  : att !== 'none' && att !== 'weekend' && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ATT_COLOR[att], boxShadow: att === 'absent' ? '0 0 6px var(--color-coral)' : undefined }} title={ATT_LABEL[att]} />}
              </div>
              {ev && Icon && (
                <div className="mt-auto space-y-1 min-w-0">
                  <span className="flex items-center gap-1 text-[13px] rounded-full px-2 py-0.5 max-w-full" style={{ background: `color-mix(in srgb, ${evColor[ev.kind]} 16%, transparent)`, color: evColor[ev.kind] }}>
                    <Icon className="w-2.5 h-2.5 shrink-0" /><span className="truncate">{ev.label}</span>
                  </span>
                  {evs.length > 1 && <span className="block text-[12px] text-[var(--color-trace)] pl-1">+{evs.length - 1} more</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-[var(--color-glass-edge)] text-[13px] text-[var(--color-mist)]">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-lumen)' }} />Present</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-coral)' }} />Absent</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-halo)' }} />On leave</span>
        <span className="text-[var(--color-trace)]">·</span>
        {Object.entries(evColor).map(([k, c]) => <span key={k} className="flex items-center gap-2 capitalize"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{k}</span>)}
      </div>
    </div>
  );
}
