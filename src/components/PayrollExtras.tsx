import { useState } from 'react';
import { Download, Receipt, Plus, Upload, X, FileCheck, IndianRupee } from 'lucide-react';
import { useWorkspace } from '../store';
import { Masked } from './Masked';
import type { Reimbursement } from '../types';

const CATS: Reimbursement['category'][] = ['Travel', 'Hardware', 'Wellness', 'Internet', 'Other'];

const STATUS_TONE: Record<Reimbursement['status'], string> = {
  draft: 'var(--color-trace)',
  submitted: 'var(--color-ember)',
  approved: 'var(--color-lumen)',
  paid: 'var(--color-lumen)',
  rejected: 'var(--color-coral)',
};

// POC: builds the slip client-side so the download genuinely works offline.
function downloadSlip(month: string, amount: number, name: string) {
  const body = [
    'QUBRYX — SALARY SLIP',
    '========================================',
    `Employee : ${name}`,
    `Period   : ${month}`,
    '----------------------------------------',
    `Net pay  : INR ${amount.toLocaleString('en-IN')}`,
    '----------------------------------------',
    'This is a system-generated statement from',
    'the Qubryx Continuum and needs no signature.',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = `payslip-${month.replace(/\s+/g, '-').toLowerCase()}.txt`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function PayslipLibrary() {
  const w = useWorkspace();
  return (
    <section className="glass-panel p-4" style={{ borderRadius: 'var(--r-soft)' }}>
      <div className="flex items-center gap-2 mb-3 text-[13px] uppercase tracking-widest text-[var(--color-trace)]">
        <Download className="w-4 h-4" /> Salary slips
      </div>
      <div className="grid gap-2">
        {w.payslips.map(p => (
          <div key={p.id} className="glass-soft rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-lumen) 14%, transparent)', color: 'var(--color-lumen)' }}><IndianRupee className="w-4 h-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-[var(--color-vapor)] truncate">{p.month}</span>
              <span className="block text-[12px] text-[var(--color-trace)]">{p.status === 'pooled' ? 'Held for review' : 'Released'}</span>
            </span>
            <Masked value={'₹' + p.amount.toLocaleString('en-IN')} className="text-[13px]" />
            <button onClick={() => downloadSlip(p.month, p.amount, p.personName)}
              aria-label={`Download payslip for ${p.month}`} title="Download slip"
              className="shrink-0 h-9 px-3 rounded-full glass-soft hover:bg-white/10 transition-colors flex items-center gap-2 text-[12px] text-[var(--color-lumen)]">
              <Download className="w-3.5 h-3.5" /> Slip
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Reimbursements() {
  const w = useWorkspace();
  const mine = w.reimbursements;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<Reimbursement['category']>('Travel');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const amt = Number(amount) || 0;
  const canSubmit = title.trim().length > 0 && amt > 0 && !!receipt;

  const submit = () => {
    if (!canSubmit) return;
    w.claimReimb(title.trim(), cat, amt, undefined, receipt ?? undefined);
    setTitle(''); setAmount(''); setReceipt(null); setCat('Travel'); setOpen(false);
  };

  return (
    <section className="glass-panel p-4" style={{ borderRadius: 'var(--r-soft)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]">
          <Receipt className="w-4 h-4" /> Reimbursements
        </div>
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          className="h-9 px-3 rounded-full brand-gradient-btn text-white text-[12px] font-semibold flex items-center gap-2 hover:brightness-110 transition">
          <Plus className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-45' : ''}`} /> Claim
        </button>
      </div>

      {open && (
        <div className="glass-soft rounded-xl p-4 mb-3 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What is this for?" aria-label="Claim description"
            className="w-full glass-soft rounded-lg px-3 py-3 text-[13px] text-[var(--color-vapor)] outline-none placeholder:text-[var(--color-trace)]" />
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                className={`px-3 py-2 rounded-full text-[12px] transition-colors ${cat === c ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[var(--color-trace)]">₹</span>
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Amount" inputMode="numeric" aria-label="Claim amount"
              className="flex-1 glass-soft rounded-lg px-3 py-3 text-[13px] font-mono text-[var(--color-vapor)] outline-none placeholder:text-[var(--color-trace)]" />
          </div>
          {receipt ? (
            <div className="glass-soft rounded-lg px-3 py-3 flex items-center gap-2 text-[13px]">
              <FileCheck className="w-4 h-4 text-[var(--color-lumen)] shrink-0" />
              <span className="flex-1 truncate text-[var(--color-vapor)]">{receipt}</span>
              <button onClick={() => setReceipt(null)} aria-label="Remove receipt" className="text-[var(--color-trace)] hover:text-[var(--color-coral)]"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="glass-soft rounded-lg px-3 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors text-[13px] text-[var(--color-mist)]">
              <Upload className="w-4 h-4 shrink-0" /> Attach receipt (required)
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setReceipt(f.name); }} />
            </label>
          )}
          <button onClick={submit} disabled={!canSubmit}
            className="w-full h-11 rounded-full text-[13px] font-semibold brand-gradient-btn text-white disabled:opacity-30 disabled:grayscale hover:brightness-110 transition-all">
            Submit claim
          </button>
        </div>
      )}

      <div className="grid gap-2">
        {mine.length === 0 && <p className="text-[13px] text-[var(--color-mist)]">No claims yet.</p>}
        {mine.map(r => (
          <div key={r.id} className="glass-soft rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] text-[var(--color-vapor)] truncate">{r.title}</span>
              <span className="block text-[12px] text-[var(--color-trace)]">{r.category} · {r.submitted}{r.receipt ? ` · ${r.receipt}` : ''}</span>
            </span>
            <Masked value={'₹' + r.amount.toLocaleString('en-IN')} className="text-[13px]" />
            <span className="text-[12px] font-mono shrink-0 capitalize" style={{ color: STATUS_TONE[r.status] }}>{r.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
