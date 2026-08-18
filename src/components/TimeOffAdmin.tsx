// Time & Holidays — HR-only administration of the org's time-off system.
// Define leave types and their allotted days, manage the holiday calendar
// (national / company / restricted), and publish updates to everyone.

import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Plus, Minus, Trash2, Megaphone, Plane, Landmark, Building2, Star } from 'lucide-react';
import { useWorkspace } from '../store';
import { ConceptIcon } from '../icons';
import { Holiday } from '../types';

const KIND_META: Record<Holiday['kind'], { label: string; icon: React.ReactNode; color: string }> = {
  national: { label: 'National', icon: <Landmark className="w-3 h-3" />, color: 'var(--color-lumen)' },
  company: { label: 'Company', icon: <Building2 className="w-3 h-3" />, color: 'var(--color-halo-text)' },
  restricted: { label: 'Restricted', icon: <Star className="w-3 h-3" />, color: 'var(--color-ember)' },
};

export default function TimeOffAdmin() {
  const w = useWorkspace();
  const [nLabel, setNLabel] = useState('');
  const [nDays, setNDays] = useState(6);
  const [hLabel, setHLabel] = useState('');
  const [hDate, setHDate] = useState('');
  const [hKind, setHKind] = useState<Holiday['kind']>('company');

  const counts = (['national', 'company', 'restricted'] as Holiday['kind'][]).map(k => [k, w.holidays.filter(h => h.kind === k).length] as const);

  return (
    <div className="absolute inset-0 overflow-y-auto panel-scroll" style={{ paddingTop: 84, paddingBottom: 120 }}>
      <div className="mx-auto w-[min(920px,94vw)]">
        <header className="glass-panel shape-soft px-5 py-4 mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-[var(--color-lumen)]" />
            <div>
              <div className="font-display text-lg text-[var(--color-vapor)]">Time & Holidays</div>
              <div className="text-[13px] text-[var(--color-mist)]">Leave types, allotments and the holiday calendar — changes publish org-wide.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {counts.map(([k, n]) => (
              <span key={k} className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2" style={{ color: KIND_META[k].color }}>{KIND_META[k].icon} {n} {KIND_META[k].label.toLowerCase()}</span>
            ))}
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Leave types & allotments */}
          <section className="glass-panel shape-soft p-4">
            <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] font-semibold mb-3 flex items-center gap-2"><Plane className="w-3.5 h-3.5" /> Leave types · allotted days / year</div>
            <div className="flex flex-col gap-2">
              {w.leaveTypes.map(t => (
                <div key={t.id} className="flex items-center gap-3 glass-soft px-3 py-3">
                  <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-lumen) 12%, transparent)' }}><ConceptIcon concept="leave" size="card" /></span>
                  <span className="text-sm text-[var(--color-vapor)] flex-1 truncate">{t.label}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => w.setAllot(t.id, Math.max(0, +(t.balance - 1).toFixed(1)))} aria-label={`Decrease ${t.label} allotment`} className="w-6 h-6 rounded-full glass-soft grid place-items-center text-[var(--color-mist)] hover:text-[var(--color-vapor)] hover:bg-white/10"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-mono text-[var(--color-lumen)] w-10 text-center">{t.balance}d</span>
                    <button onClick={() => w.setAllot(t.id, +(t.balance + 1).toFixed(1))} aria-label={`Increase ${t.label} allotment`} className="w-6 h-6 rounded-full glass-soft grid place-items-center text-[var(--color-mist)] hover:text-[var(--color-vapor)] hover:bg-white/10"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--color-glass-edge)]">
              <div className="text-[13px] text-[var(--color-trace)] mb-2">Define a new leave type (HR only)</div>
              <div className="flex items-center gap-2">
                <input value={nLabel} onChange={e => setNLabel(e.target.value)} placeholder="e.g. Sabbatical" aria-label="New leave type name" className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm focus:border-[var(--color-lumen)] transition-colors" />
                <input type="number" min={0} max={60} value={nDays} onChange={e => setNDays(Math.max(0, Math.min(60, +e.target.value || 0)))} aria-label="Allotted days" className="w-16 px-2 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-center focus:border-[var(--color-lumen)] transition-colors" />
                <button onClick={() => { if (nLabel.trim()) { w.addType(nLabel.trim(), nDays); setNLabel(''); } }} disabled={!nLabel.trim()}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/25 transition-colors shrink-0">Add</button>
              </div>
            </div>
          </section>

          {/* Holiday calendar */}
          <section className="glass-panel shape-soft p-4">
            <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] font-semibold mb-3 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Holiday calendar · 2026</div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto panel-scroll pr-1">
              {w.holidays.map(h => (
                <motion.div key={h.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="group flex items-center gap-2 glass-soft px-3 py-2">
                  <span style={{ color: KIND_META[h.kind].color }}>{KIND_META[h.kind].icon}</span>
                  <span className="text-sm text-[var(--color-vapor)] flex-1 truncate">{h.label}</span>
                  <span className="text-[13px] font-mono text-[var(--color-mist)]">{h.date}</span>
                  <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: KIND_META[h.kind].color, background: 'color-mix(in srgb, currentColor 12%, transparent)' }}>{KIND_META[h.kind].label}</span>
                  <button onClick={() => w.removeHoliday(h.id)} aria-label={`Remove ${h.label}`} className="hover-reveal opacity-0 group-hover:opacity-100 text-[var(--color-trace)] hover:text-[var(--color-coral)] transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--color-glass-edge)]">
              <div className="text-[13px] text-[var(--color-trace)] mb-2">Add a holiday</div>
              <div className="flex items-center gap-2 flex-wrap">
                <input value={hLabel} onChange={e => setHLabel(e.target.value)} placeholder="Name" aria-label="Holiday name" className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm focus:border-[var(--color-lumen)] transition-colors" />
                <input value={hDate} onChange={e => setHDate(e.target.value)} placeholder="e.g. 25 Dec" aria-label="Holiday date" className="w-24 px-3 py-2 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm focus:border-[var(--color-lumen)] transition-colors" />
                <div className="flex items-center gap-1 glass-soft p-0.5 rounded-full">
                  {(['national', 'company', 'restricted'] as Holiday['kind'][]).map(k => (
                    <button key={k} onClick={() => setHKind(k)} className={`text-[12px] px-2 py-1 rounded-full transition-colors ${hKind === k ? 'bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`} style={hKind === k ? { color: KIND_META[k].color } : undefined}>{KIND_META[k].label}</button>
                  ))}
                </div>
                <button onClick={() => { if (hLabel.trim() && hDate.trim()) { w.addHoliday(hLabel.trim(), hDate.trim(), hKind); setHLabel(''); setHDate(''); } }} disabled={!hLabel.trim() || !hDate.trim()}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/25 transition-colors">Add</button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 glass-panel shape-soft px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[13px] text-[var(--color-mist)] flex items-center gap-2"><Megaphone className="w-3.5 h-3.5 text-[var(--color-lumen)]" /> Changes here apply org-wide: allotments refresh balances, holidays land on every calendar, restricted days appear in each person's RH picker.</div>
          <button onClick={() => w.toast('Calendar broadcast sent — everyone sees the update in The Now', 'ok')} className="text-[13px] px-3 py-2 rounded-full font-semibold glass-soft text-[var(--color-lumen)] hover:bg-white/10 transition-colors">Announce changes</button>
        </div>
      </div>
    </div>
  );
}
