import { useEffect, useRef } from 'react';
import { ClipboardCheck, Users, AlertTriangle, CalendarDays, BarChart3, ChevronLeft, PanelRightClose, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../store';
import { TokenCard } from './Tokens';
import { Avatar } from './Avatar';
import { registerZone, clearZone } from '../dropzone';
import { VibeApp, VIBE_ICON, vibeTitle } from './VibeApps';

const PRESENCE: Record<string, { t: string; c: string }> = {
  m1: { t: 'In', c: 'var(--color-lumen)' },
  p2: { t: 'In · at risk', c: 'var(--color-ember)' },
  p3: { t: 'Remote', c: 'var(--color-blue)' },
  p4: { t: 'On leave', c: 'var(--color-halo-text)' },
  p5: { t: 'In', c: 'var(--color-lumen)' },
};
const Stat = ({ items }: { items: [string, string][] }) => (
  <div className="space-y-2 text-[13px]">{items.map(([k, v]) => <div key={k} className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">{k}</span><span className="text-[var(--color-vapor)] font-mono text-right whitespace-nowrap shrink-0">{v}</span></div>)}</div>
);

export default function ManagerToday() {
  const w = useWorkspace();
  const reports = w.people.filter(p => p.managerId === 'm1');
  const inCount = reports.filter(p => p.status === 'active').length;
  const leaveCount = reports.filter(p => p.status === 'on_leave').length;
  const riskCount = reports.filter(p => p.status === 'flight_risk').length;
  const pending = w.leaves.filter(l => l.status === 'pending');
  const sla = pending.find(l => l.isSlaBreached);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = () => registerZone('panel-mgr', w.panelRight ? panelRef.current : null, 'panel'); r(); window.addEventListener('resize', r); return () => { window.removeEventListener('resize', r); clearZone('panel-mgr'); }; });

  const collapsed = !w.panelRight;
  const capsule = (
    <button onClick={() => w.setPanel('right', true)} aria-label="Expand team panel" className="fixed right-3 top-[76px] z-20 w-12 glass-panel shape-soft flex flex-col items-center gap-3 py-3 hover:bg-white/10 transition-colors">
      <ChevronLeft className="w-4 h-4 text-[var(--color-trace)]" />
      <ClipboardCheck className="w-4 h-4 text-[var(--color-ember)]" />
      <span className="text-[13px] font-mono text-[var(--color-mist)]">{pending.length}</span>
      <Users className="w-4 h-4 text-[var(--color-mist)] mt-1" />
    </button>
  );

  return (
    <>
      {collapsed && capsule}
      <div ref={panelRef} className="fixed right-3 z-20 w-[21rem] flex flex-col" style={{ top: 76, bottom: 96, visibility: collapsed ? 'hidden' : 'visible', pointerEvents: collapsed ? 'none' : undefined }} aria-hidden={collapsed}>
      <div className="px-1 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <div className="text-lg font-display brand-text field-title leading-tight">Your team</div>
          <div className="text-[13px] font-mono field-sub">{reports.length} reports · Design, Eng, Data & Product</div>
        </div>
        <button onClick={() => w.setPanel('right', false)} aria-label="Collapse panel" className="text-[var(--color-trace)] hover:text-[var(--color-vapor)] mt-1"><PanelRightClose className="w-4 h-4" /></button>
      </div>

      <div className={`panel-scroll flex-1 min-h-0 flex flex-col gap-3 px-3 pt-3 -mx-1 ${w.dragging ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        {/* pinned Vibe Studio apps */}
        {w.vibePinned.map(id => { const app = w.vibeApps.find(v => v.id === id); if (!app) return null; return (
          <TokenCard key={id} id={id} kind="kpi" placement="flow" shape="soft" tint="halo" label={vibeTitle(app.template)} onActivate={() => {}} onClose={() => w.unpinVibe(id)}
            expand={<div className="text-[13px] text-[var(--color-mist)]">Built in Vibe Studio. Drag the handle to pop it onto the canvas, or close to remove from Now.</div>}>
            <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3">{VIBE_ICON[app.template]} {vibeTitle(app.template)} <span className="ml-auto text-[12px] text-[var(--color-halo-text)]">Vibe</span></div>
            <VibeApp template={app.template} parts={app.parts} config={app.config} />
          </TokenCard>
        ); })}
        {/* approvals queue */}
        <TokenCard id="mgr-approvals" kind="kpi" placement="flow" shape="soft" tint="ember" label="Approvals" onActivate={() => {}} deep={<Stat items={[['Pending', String(pending.length)], ['Breaching SLA', sla ? '1 (<2h)' : 'none'], ['Avg decision', '4.2h']]} />} className="w-full border border-[var(--color-ember)]/25"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Requests waiting on your decision. Drag onto Q to clear the queue.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><ClipboardCheck className="w-3 h-3" /> Approvals</div>
          <div className="flex items-baseline gap-2"><span className="text-2xl font-mono font-medium text-[var(--color-vapor)]">{pending.length}</span><span className="text-[13px] text-[var(--color-mist)]">pending</span></div>
          {sla && <div className="mt-2 text-[13px] text-[var(--color-ember)] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {sla.personName}'s request breaches SLA in ~2h</div>}
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('approvals'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors flex items-center justify-center gap-2">Review approvals <ArrowRight className="w-3 h-3" /></button>
        </TokenCard>

        {/* team presence */}
        <TokenCard id="mgr-presence" kind="kpi" placement="flow" shape="soft" tint="mist" label="Team presence" onActivate={() => {}} deep={<Stat items={[['Available today', `${inCount} / ${reports.length}`], ['On leave', `${leaveCount}`], ['At risk', `${riskCount}`]]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Live presence across your reports. Open My Team for the full roster.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><Users className="w-3 h-3" /> Team presence <span className="ml-auto normal-case tracking-normal text-[var(--color-mist)]">{reports.length}</span></div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-[13px] px-2 py-0.5 rounded-full glass-soft flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-lumen)' }} /> {inCount} in</span>
            <span className="text-[13px] px-2 py-0.5 rounded-full glass-soft flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-coral)' }} /> {leaveCount} leave</span>
            <span className="text-[13px] px-2 py-0.5 rounded-full glass-soft flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-ember)' }} /> {riskCount} risk</span>
          </div>
          <div className="space-y-2">
            {reports.slice(0, 6).map(p => { const st = PRESENCE[p.id] ?? { t: p.status === 'on_leave' ? 'On leave' : p.status === 'flight_risk' ? 'In · at risk' : 'In', c: p.status === 'on_leave' ? 'var(--color-coral)' : p.status === 'flight_risk' ? 'var(--color-ember)' : 'var(--color-lumen)' }; return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="relative w-7 h-7 shrink-0"><Avatar seed={p.name} name={p.name} size={28} /><span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-abyss)]" style={{ background: st.c }} /></span>
                <span className="text-[14px] text-[var(--color-vapor)] flex-1 truncate">{p.name}</span>
                <span className="text-[13px] font-mono" style={{ color: st.c }}>{st.t}</span>
              </div>
            ); })}
          </div>
          {reports.length > 6 && <button onClick={(e) => { e.stopPropagation(); w.setRegion('team'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">View all {reports.length} in My Team</button>}
        </TokenCard>

        {/* flight risk */}
        <TokenCard id="mgr-risk" kind="kpi" placement="flow" shape="soft" tint="coral" label="Attention" onActivate={() => {}} deep={<Stat items={[['Risk score', '0.78'], ['Attendance', '↓ 22% / 6 wks'], ['Comp vs band', '11% below']]} />} className="w-full border border-[var(--color-coral)]/25"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Q's strongest retention signal on your team.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><AlertTriangle className="w-3 h-3" /> Needs attention</div>
          <div className="text-[14px] text-[var(--color-vapor)]">Sarah Jenkins · flight risk <span className="font-mono text-[var(--color-coral)]">0.78</span></div>
          <button onClick={(e) => { e.stopPropagation(); w.simulate('p2', 'bonus'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-coral)]/12 text-[var(--color-coral)] hover:bg-[var(--color-coral)]/20 transition-colors">Simulate a retention move</button>
        </TokenCard>

        {/* coverage */}
        <TokenCard id="mgr-coverage" kind="kpi" placement="flow" shape="soft" tint="halo" label="Coverage" onActivate={() => {}} deep={<Stat items={[['Gap', 'Jul 25–28'], ['Cause', 'Elena leave + David req'], ['Options', 'shift David → Aug']]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Where the team thins out over the next two weeks.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><CalendarDays className="w-3 h-3" /> Coverage</div>
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('approvals'); w.setOverlay('matrix'); }} className="w-full mb-3 grid grid-cols-7 gap-1 hover:opacity-80 transition-opacity" aria-label="Open availability matrix">{Array.from({ length: 21 }).map((_, i) => <span key={i} className="h-3.5 rounded-sm" style={{ background: i % 7 === 5 || i % 7 === 6 ? 'rgba(180,210,235,0.05)' : i % 5 === 0 ? 'var(--color-ember)' : 'var(--color-lumen-soft)' }} />)}</button>
          <div className="text-[13px] text-[var(--color-vapor)] leading-snug">A gap Jul 25–28 — Elena's leave overlaps David's pending request.</div>
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('approvals'); w.setOverlay('matrix'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Open availability</button>
        </TokenCard>

        {/* team pulse */}
        <TokenCard id="mgr-pulse" kind="kpi" placement="flow" shape="soft" tint="lumen" label="Team pulse" onActivate={() => {}} deep={<Stat items={[['Velocity', '72'], ['Attendance', '86%'], ['Review cycle', '3 / 5 in']]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Aggregate signals — drag onto Q for a breakdown.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><BarChart3 className="w-3 h-3" /> Team pulse</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-mono text-[var(--color-vapor)]">72</div><div className="text-[12px] text-[var(--color-trace)] uppercase">Velocity</div></div>
            <div><div className="text-lg font-mono text-[var(--color-vapor)]">86%</div><div className="text-[12px] text-[var(--color-trace)] uppercase">Attend.</div></div>
            <div><div className="text-lg font-mono text-[var(--color-vapor)]">3/5</div><div className="text-[12px] text-[var(--color-trace)] uppercase">Reviews</div></div>
          </div>
        </TokenCard>
      </div>
    </div>
    </>
  );
}
