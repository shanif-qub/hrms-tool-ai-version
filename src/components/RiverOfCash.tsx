// Pay Run Command Center — replaces the decorative "river of cash".
// One screen to run payroll: stage rail, run totals (masked until revealed),
// an actionable anomaly queue, the full register, and export.

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Eye, EyeOff, Download, AlertTriangle, Check, Sparkles, PlayCircle, History, GitCompare, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../store';
import { Avatar } from './Avatar';

const seed = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const netFor = (name: string, role: string) => {
  const base = /vp/i.test(role) ? 320000 : /principal|staff/i.test(role) ? 250000 : /senior|architect|manager/i.test(role) ? 175000 : /engineer|designer|scientist|analyst|researcher/i.test(role) ? 120000 : 100000;
  return base + (seed(name) % 40) * 1000;
};
// Previous run, reconstructed deterministically so run-over-run deltas are stable.
// A few people changed since last month: some got a merit raise, one had a one-off
// bonus that isn't repeating, one is a new joiner (no prior), one had a leave-without-pay
// deduction reverse out. Everyone else is unchanged.
const RAISE = new Set(['p3', 'p7', 'p12']);         // merit / promotion since last run
const BONUS_LAST = new Set(['p5', 'p16']);          // one-off last month, not repeating
const NEW_JOINER = new Set(['p9']);                 // no prior run
const LWP_REVERSED = new Set(['p11']);              // last month had an LWP deduction
const prevNetFor = (id: string, curNet: number): number | null => {
  if (NEW_JOINER.has(id)) return null;              // first run — nothing to compare
  if (RAISE.has(id)) return Math.round(curNet / 1.08 / 1000) * 1000;   // was ~8% lower
  if (BONUS_LAST.has(id)) return curNet + 25000;    // last month included a +25k bonus
  if (LWP_REVERSED.has(id)) return curNet - 12000;  // last month was 12k lighter (LWP)
  return curNet;
};
const reasonFor = (id: string): string =>
  NEW_JOINER.has(id) ? 'First pay run — new joiner' :
  RAISE.has(id) ? 'Merit increase applied this cycle' :
  BONUS_LAST.has(id) ? 'One-off bonus last month, not repeating' :
  LWP_REVERSED.has(id) ? 'Leave-without-pay deduction reversed' : 'No change';
const inr = (n: number) => '\u20b9' + n.toLocaleString('en-IN');

export default function RiverOfCash() {
  const w = useWorkspace();
  const [tab, setTab] = useState<'register' | 'reconcile'>('register');
  const pooled = w.payslips.filter(p => p.status === 'pooled');
  const anomalies = pooled.length;
  const rows = useMemo(() => w.people.filter(p => !w.hidden.includes(p.id)).map(p => {
    const pool = pooled.find(ps => ps.personName === p.name);
    const net = pool ? pool.amount : netFor(p.name, p.role);
    const prev = prevNetFor(p.id, net);
    return { id: p.id, name: p.name, role: p.role, dept: p.department, net, prev, delta: prev == null ? null : net - prev, reason: reasonFor(p.id), status: pool ? 'pooled' as const : 'ready' as const };
  }), [w.people, w.hidden, pooled]);
  const total = rows.reduce((a, r) => a + r.net, 0);
  const prevTotal = rows.reduce((a, r) => a + (r.prev ?? r.net), 0);
  const runDelta = total - prevTotal;
  const changed = rows.filter(r => r.delta !== null && r.delta !== 0);
  const stage = anomalies > 0 ? 1 : 2;
  const STAGES = ['Calculated', 'Anomaly review', 'Approval', 'Release'];
  const mask = (v: string) => w.showPay ? v : '\u20b9 \u2022\u2022\u2022\u2022\u2022';
  const maskDelta = (v: number) => w.showPay ? `${v >= 0 ? '+' : '\u2212'}${inr(Math.abs(v))}` : (v >= 0 ? '+\u20b9 \u2022\u2022\u2022' : '\u2212\u20b9 \u2022\u2022\u2022');

  const exportCsv = () => {
    const head = 'Name,Role,Department,Net (INR),Status\n';
    const body = rows.map(r => `"${r.name}","${r.role}",${r.dept},${w.showPay ? r.net : 'MASKED'},${r.status}`).join('\n');
    const url = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'pay-register-jul-2026.csv'; a.click();
    URL.revokeObjectURL(url);
    w.toast(w.showPay ? 'Register exported with amounts' : 'Register exported — amounts masked (reveal first to include them)', 'ok');
  };

  return (
    <div className="absolute inset-0 overflow-y-auto panel-scroll" style={{ paddingTop: 84, paddingBottom: 120 }}>
      <div className="mx-auto w-[min(940px,94vw)]">
        {/* header: run identity + totals + stage rail */}
        <header className="glass-panel shape-soft px-5 py-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <IndianRupee className="w-5 h-5 text-[var(--color-lumen)]" />
              <div>
                <div className="font-display text-lg text-[var(--color-vapor)]">July 2026 pay run</div>
                <div className="text-[13px] text-[var(--color-mist)]">{rows.length} people \u00b7 pay day Jul 31 \u00b7 3 banks</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] px-3 py-1 rounded-full glass-soft text-[var(--color-vapor)] flex items-center gap-2">Total net <span className="font-mono text-[var(--color-lumen)]">{mask(inr(total))}</span>
                <button onClick={w.togglePay} aria-label={w.showPay ? 'Hide amounts' : 'Reveal amounts'} className="text-[var(--color-trace)] hover:text-[var(--color-lumen)]">{w.showPay ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</button>
              </span>
              <span className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2" style={{ color: anomalies ? 'var(--color-coral)' : 'var(--color-lumen)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor', boxShadow: '0 0 6px currentColor' }} />{anomalies ? `${anomalies} anomaly` : 'no anomalies'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-0">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] ${i < stage ? 'bg-[var(--color-lumen)] text-[#06222b]' : i === stage ? 'bg-[var(--color-ember)]/20 text-[var(--color-ember)] ring-1 ring-[var(--color-ember)]' : 'glass-soft text-[var(--color-trace)]'}`}>{i < stage ? <Check className="w-3 h-3" /> : i + 1}</span>
                  <span className={`text-[13px] ${i === stage ? 'text-[var(--color-ember)] font-semibold' : i < stage ? 'text-[var(--color-vapor)]' : 'text-[var(--color-trace)]'}`}>{s}</span>
                </div>
                {i < STAGES.length - 1 && <span className={`flex-1 h-px mx-2 ${i < stage ? 'bg-[var(--color-lumen)]/50' : 'bg-[var(--color-glass-edge)]'}`} />}
              </div>
            ))}
          </div>
        </header>

        {/* anomaly queue */}
        {pooled.map(p => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel shape-soft relative overflow-hidden mb-4">
            <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--color-coral)', boxShadow: '0 0 10px var(--color-coral)' }} />
            <div className="pl-5 pr-4 py-4">
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest font-semibold text-[var(--color-coral)]"><AlertTriangle className="w-4 h-4" /> Pooled \u00b7 needs a human</div>
              <div className="mt-2 text-sm text-[var(--color-vapor)] font-medium">{p.personName} \u00b7 {p.month} \u00b7 {mask(inr(p.amount))} held</div>
              <p className="mt-0.5 text-[13px] text-[var(--color-mist)] leading-snug max-w-2xl">{p.anomalyReason}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button onClick={() => w.overridePayroll(p.id)} className="text-[13px] px-3 py-2 rounded-full font-semibold glass-soft text-[var(--color-coral)] hover:bg-white/10 transition-colors flex items-center gap-2"><Check className="w-3 h-3" /> Approve correction & release</button>
                <button onClick={() => w.ask(`Why is ${p.personName.split(' ')[0]}'s ${p.month} pay pooled?`)} className="text-[13px] px-3 py-2 rounded-full text-[var(--color-lumen)] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2"><Sparkles className="w-3 h-3" /> Ask Q</button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* register + reconciliation */}
        <section className="glass-panel shape-soft overflow-hidden mb-4">
          <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-glass-edge)]">
            <div className="flex items-center gap-1 glass-soft p-0.5 rounded-full">
              <button onClick={() => setTab('register')} className={`text-[13px] px-3 py-1 rounded-full transition-colors flex items-center gap-2 ${tab === 'register' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><IndianRupee className="w-3 h-3" /> Register</button>
              <button onClick={() => setTab('reconcile')} className={`text-[13px] px-3 py-1 rounded-full transition-colors flex items-center gap-2 ${tab === 'reconcile' ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><GitCompare className="w-3 h-3" /> Reconcile{changed.length ? ` \u00b7 ${changed.length}` : ''}</button>
            </div>
            <span className="text-[13px] text-[var(--color-trace)]">{tab === 'register' ? `${rows.filter(r => r.status === 'ready').length} ready \u00b7 ${anomalies} pooled` : 'vs Jun 2026'}</span>
          </div>

          {tab === 'register' && (
            <div className="max-h-[340px] overflow-y-auto panel-scroll">
              {rows.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2 border-b border-[var(--color-glass-edge)]/50 last:border-0 hover:bg-white/[0.03] transition-colors">
                  <Avatar seed={r.name} name={r.name} size={26} />
                  <div className="min-w-0 flex-1"><div className="text-[13px] text-[var(--color-vapor)] truncate">{r.name}</div><div className="text-[12px] text-[var(--color-trace)] truncate">{r.role} \u00b7 {r.dept}</div></div>
                  <span className="text-[13px] font-mono text-[var(--color-mist)]">{mask(inr(r.net))}</span>
                  <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${r.status === 'pooled' ? 'text-[var(--color-coral)] bg-[var(--color-coral)]/12' : 'text-[var(--color-lumen)] bg-[var(--color-lumen)]/12'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'reconcile' && (
            <div>
              <div className="px-4 py-3 flex items-center gap-4 flex-wrap border-b border-[var(--color-glass-edge)]">
                <div className="flex items-center gap-2 text-[13px]"><span className="text-[var(--color-trace)]">Jun</span><span className="font-mono text-[var(--color-mist)]">{mask(inr(prevTotal))}</span><ArrowRight className="w-3.5 h-3.5 text-[var(--color-trace)]" /><span className="text-[var(--color-trace)]">Jul</span><span className="font-mono text-[var(--color-vapor)]">{mask(inr(total))}</span></div>
                <span className="text-[13px] px-3 py-1 rounded-full flex items-center gap-2" style={{ color: runDelta >= 0 ? 'var(--color-ember)' : 'var(--color-lumen)', background: 'color-mix(in srgb, currentColor 12%, transparent)' }}>{maskDelta(runDelta)} run-over-run</span>
                <span className="text-[13px] text-[var(--color-trace)] ml-auto">{changed.length} line{changed.length === 1 ? '' : 's'} changed \u00b7 {rows.length - changed.length} steady</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto panel-scroll">
                {changed.length === 0 && <div className="px-4 py-8 text-center text-sm text-[var(--color-mist)]">Nothing changed since last run \u2014 every line matches Jun.</div>}
                {changed.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-glass-edge)]/50 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <Avatar seed={r.name} name={r.name} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-[var(--color-vapor)] truncate">{r.name}</div>
                      <div className="text-[12px] text-[var(--color-mist)] truncate">{r.reason}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-mono" style={{ color: (r.delta ?? 0) >= 0 ? 'var(--color-ember)' : 'var(--color-lumen)' }}>{maskDelta(r.delta ?? 0)}</div>
                      <div className="text-[11px] font-mono text-[var(--color-trace)]">{mask(inr(r.prev ?? 0))} \u2192 {mask(inr(r.net))}</div>
                    </div>
                  </div>
                ))}
                {rows.filter(r => r.prev === null).map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-glass-edge)]/50 last:border-0 bg-[var(--color-lumen)]/[0.04]">
                    <Avatar seed={r.name} name={r.name} size={26} />
                    <div className="min-w-0 flex-1"><div className="text-[13px] text-[var(--color-vapor)] truncate">{r.name}</div><div className="text-[12px] text-[var(--color-lumen)] truncate">First pay run \u2014 new joiner</div></div>
                    <span className="text-[13px] font-mono text-[var(--color-vapor)]">{mask(inr(r.net))}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-[var(--color-glass-edge)] flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-trace)] flex items-center gap-2"><GitCompare className="w-3.5 h-3.5 text-[var(--color-lumen)]" /> Every delta traces to a reason \u2014 nothing changes silently.</span>
                <button onClick={() => w.ask('Why did payroll change this month?')} className="text-[13px] px-3 py-2 rounded-full text-[var(--color-lumen)] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2"><Sparkles className="w-3 h-3" /> Ask Q</button>
              </div>
            </div>
          )}
        </section>

        {/* actions + history */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => anomalies ? w.toast('Clear the pooled anomaly first \u2014 it needs a human sign-off', 'info') : w.toast('Run approved \u2014 releasing to banks on Jul 31', 'ok')}
              className={`text-[13px] px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 ${anomalies ? 'glass-soft text-[var(--color-trace)]' : 'brand-gradient-btn text-white'}`}>
              <PlayCircle className="w-3.5 h-3.5" /> {anomalies ? 'Approve run (blocked by anomaly)' : 'Approve & schedule release'}
            </button>
            <button onClick={exportCsv} className="text-[13px] px-3 py-2 rounded-full glass-soft text-[var(--color-lumen)] hover:bg-white/10 transition-colors flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export register</button>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-trace)]"><History className="w-3.5 h-3.5" />
            {w.payslips.filter(p => p.status === 'released').map(p => <span key={p.id} className="px-2 py-0.5 rounded-full glass-soft text-[var(--color-mist)]">{p.month} \u2713</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
