import { useState } from 'react';
import { Search, Users, LayoutDashboard } from 'lucide-react';
import { PersonToken } from '../types';
import { Area } from '../layout';
import { Avatar } from './Avatar';
import { useWorkspace } from '../store';

const STATUS: Record<string, { label: string; c: string }> = {
  active: { label: 'In', c: 'var(--color-lumen)' },
  flight_risk: { label: 'At risk', c: 'var(--color-coral)' },
  on_leave: { label: 'On leave', c: 'var(--color-halo)' },
};

export default function Roster({ people, title, area }: { people: PersonToken[]; title: string; area: Area }) {
  const w = useWorkspace();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState<string | null>(null);

  const inCount = people.filter(p => p.status === 'active').length;
  const leaveCount = people.filter(p => p.status === 'on_leave').length;
  const riskCount = people.filter(p => p.status === 'flight_risk').length;
  const depts = Array.from(new Set(people.map(p => p.department).filter(Boolean))) as string[];

  const filtered = people.filter(p =>
    (!dept || p.department === dept) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || (p.role ?? '').toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="absolute flex flex-col" style={{ left: area.x, top: area.y, width: area.w, height: area.h }}>
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[var(--color-mist)]" />
          <span className="font-display text-[var(--color-vapor)]">{title}</span>
          <span className="text-[13px] text-[var(--color-trace)]">{people.length} people</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: STATUS.active.c }} /> {inCount} in</span>
          <span className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: STATUS.on_leave.c }} /> {leaveCount} on leave</span>
          <span className="text-[13px] px-3 py-1 rounded-full glass-soft flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: STATUS.flight_risk.c }} /> {riskCount} at risk</span>
          <div className="glass-soft flex items-center gap-2 px-3 py-1 ml-auto" style={{ borderRadius: 999 }}>
            <Search className="w-3.5 h-3.5 text-[var(--color-trace)]" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search team…" className="bg-transparent outline-none text-[13px] w-32 placeholder:text-[var(--color-trace)]" />
          </div>
        </div>
        {depts.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={() => setDept(null)} className={`text-[13px] px-2 py-0.5 rounded-full transition-colors ${!dept ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)] hover:bg-white/10'}`}>All</button>
            {depts.map(d => <button key={d} onClick={() => setDept(d)} className={`text-[13px] px-2 py-0.5 rounded-full transition-colors ${dept === d ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)] hover:bg-white/10'}`}>{d}</button>)}
          </div>
        )}
      </div>

      <div className="panel-scroll flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
          {filtered.map(p => { const st = STATUS[p.status ?? 'active'] ?? STATUS.active; return (
            <div key={p.id} role="button" tabIndex={0} onClick={() => w.explainToken('person', p.id)} className="glass-panel p-3 text-left hover:bg-white/[0.04] transition-colors relative group cursor-pointer" style={{ borderRadius: 'var(--r-soft)', borderLeft: p.status === 'flight_risk' ? '2px solid var(--color-coral)' : undefined }}>
              <button onClick={(e) => { e.stopPropagation(); w.boardAdd('person', p.id); w.toast(`${p.name.split(' ')[0]} sent to Now`, 'ok'); }} aria-label="Send to Now" className="absolute top-2 right-2 w-6 h-6 grid place-items-center rounded-full glass-soft text-[var(--color-mist)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-lumen)] transition-all"><LayoutDashboard className="w-3.5 h-3.5" /></button>
              <div className="flex items-center gap-3">
                <span className="relative shrink-0"><Avatar seed={p.name} name={p.name} size={36} /><span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-abyss)]" style={{ background: st.c }} /></span>
                <div className="min-w-0">
                  <div className="text-[14px] text-[var(--color-vapor)] truncate">{p.name}</div>
                  <div className="text-[13px] text-[var(--color-trace)] truncate">{p.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[13px] px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${st.c} 14%, transparent)`, color: st.c }}>{st.label}</span>
                <span className="text-[12px] text-[var(--color-trace)]">{p.department}</span>
              </div>
            </div>
          ); })}
          {filtered.length === 0 && <div className="text-[13px] text-[var(--color-trace)] py-6">No one matches “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}
