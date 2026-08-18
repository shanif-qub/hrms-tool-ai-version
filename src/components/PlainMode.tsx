import { useWorkspace } from '../store';
import { Masked } from './Masked';
import { IndianRupee } from 'lucide-react';

export default function PlainMode({ onExit }: { onExit: () => void }) {
  const w = useWorkspace();
  return (
    <div className="fixed inset-0 overflow-auto bg-[var(--color-abyss)] p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="flex justify-between items-center pb-4 border-b border-[var(--color-glass-edge)]">
          <h1 className="text-xl font-display">Workspace · accessible view</h1>
          <button onClick={onExit} className="glass-soft px-4 py-2 text-sm text-[var(--color-lumen)]">Return to Continuum</button>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-lg">The Now</h2>
          {w.cues.length === 0 && <p className="text-sm text-[var(--color-mist)]">All caught up.</p>}
          {w.cues.map(c => <div key={c.id} className="glass-soft p-3 flex justify-between items-center gap-3"><span className="text-sm">{c.message}</span><button className="glass-soft px-3 py-2 text-[13px] text-[var(--color-lumen)] shrink-0" onClick={() => w.dismissCue(c.id)}>{c.actionText}</button></div>)}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg">People</h2>
          {w.people.map(p => (
            <div key={p.id} className="glass-soft p-3 flex justify-between items-center">
              <div><div className="font-semibold text-sm">{p.name}</div><div className="text-[13px] text-[var(--color-mist)]">{p.role} · {p.department}</div></div>
              <span className={`text-[13px] px-3 py-1 rounded-full capitalize ${p.status === 'flight_risk' ? 'bg-[var(--color-ember)]/15 text-[var(--color-ember)]' : 'bg-[var(--color-lumen)]/15 text-[var(--color-lumen)]'}`}>{p.status.replace('_', ' ')}</span>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg">Leave balances</h2>
          <div className="grid grid-cols-4 gap-3">
            {w.leaveTypes.map(t => <div key={t.id} className="glass-soft p-3"><div className="text-[13px] text-[var(--color-mist)]">{t.label}</div><div className="font-mono text-[var(--color-lumen)]">{t.balance}d</div></div>)}
          </div>
          <h3 className="font-display pt-2">Requests</h3>
          {w.leaves.map(l => (
            <div key={l.id} className="glass-soft p-3 flex justify-between items-center">
              <div><div className="text-sm">{l.personName} · <span className="capitalize">{l.kind}</span></div><div className="text-[13px] font-mono text-[var(--color-mist)]">{l.startDate} → {l.endDate} · {l.days}d</div></div>
              {l.status === 'pending' ? <div className="flex gap-2"><button onClick={() => w.approve(l.id)} className="text-[13px] px-3 py-2 rounded bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Approve</button><button onClick={() => w.reject(l.id)} className="text-[13px] px-3 py-2 rounded glass-soft">Decline</button></div> : <span className="text-[13px] text-[var(--color-mist)] capitalize">{l.status}</span>}
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Payroll</h2>
          {w.payslips.map(p => (
            <div key={p.id} className="glass-soft p-3 flex justify-between items-center">
              <div><div className="text-sm"><Masked value={'₹' + p.amount.toLocaleString('en-IN')} /></div><div className="text-[13px] text-[var(--color-mist)]">{p.month}</div></div>
              {p.status === 'pooled' ? <button onClick={() => w.overridePayroll(p.id)} className="text-[13px] px-3 py-2 rounded bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Approve correction</button> : <span className="text-[13px] text-[var(--color-lumen)] capitalize">{p.status}</span>}
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg">Documents</h2>
          {w.documents.map(d => (
            <div key={d.id} className="glass-soft p-3 flex justify-between items-center">
              <div><div className="text-sm">{d.title}</div><div className="text-[13px] text-[var(--color-mist)]">{d.category} · {d.version}</div></div>
              {d.mustAck && !d.acked ? <button onClick={() => w.ackDoc(d.id)} className="text-[13px] px-3 py-2 rounded bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]">Acknowledge</button> : <span className="text-[13px] text-[var(--color-mist)]">{d.acked ? 'acknowledged' : '—'}</span>}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
