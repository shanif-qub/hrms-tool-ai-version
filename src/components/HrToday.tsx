import { useEffect, useRef } from 'react';
import { IndianRupee, UserPlus, FileText, BarChart3, ChevronLeft, PanelRightClose, ArrowRight, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../store';
import { TokenCard } from './Tokens';
import { Avatar } from './Avatar';
import { registerZone, clearZone } from '../dropzone';
import { ONBOARDING } from '../data';

const Stat = ({ items }: { items: [string, string][] }) => (
  <div className="space-y-2 text-[13px]">{items.map(([k, v]) => <div key={k} className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">{k}</span><span className="text-[var(--color-vapor)] font-mono text-right whitespace-nowrap shrink-0">{v}</span></div>)}</div>
);

export default function HrToday() {
  const w = useWorkspace();
  const pooled = w.payslips.filter(p => p.status === 'pooled').length;
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = () => registerZone('panel-hr', w.panelRight ? panelRef.current : null, 'panel'); r(); window.addEventListener('resize', r); return () => { window.removeEventListener('resize', r); clearZone('panel-hr'); }; });

  const collapsed = !w.panelRight;
  const capsule = (
    <button onClick={() => w.setPanel('right', true)} aria-label="Expand org panel" className="fixed right-3 top-[76px] z-20 w-12 glass-panel shape-soft flex flex-col items-center gap-3 py-3 hover:bg-white/10 transition-colors">
      <ChevronLeft className="w-4 h-4 text-[var(--color-trace)]" />
      <IndianRupee className="w-4 h-4 text-[var(--color-ember)]" />
      <span className="text-[13px] font-mono text-[var(--color-mist)]">{pooled}</span>
      <UserPlus className="w-4 h-4 text-[var(--color-mist)] mt-1" />
    </button>
  );

  return (
    <>
      {collapsed && capsule}
      <div ref={panelRef} className="fixed right-3 z-20 w-[21rem] flex flex-col" style={{ top: 76, bottom: 96, visibility: collapsed ? 'hidden' : 'visible', pointerEvents: collapsed ? 'none' : undefined }} aria-hidden={collapsed}>
      <div className="px-1 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <div className="text-lg font-display brand-text field-title leading-tight">The org</div>
          <div className="text-[13px] font-mono field-sub">124 people · 8 departments</div>
        </div>
        <button onClick={() => w.setPanel('right', false)} aria-label="Collapse panel" className="text-[var(--color-trace)] hover:text-[var(--color-vapor)] mt-1"><PanelRightClose className="w-4 h-4" /></button>
      </div>

      <div className={`panel-scroll flex-1 min-h-0 flex flex-col gap-3 px-3 pt-3 -mx-1 ${w.dragging ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        {/* payroll run */}
        <TokenCard id="hr-payroll" kind="kpi" placement="flow" shape="soft" tint="ember" label="Payroll run" onActivate={() => {}} deep={<Stat items={[['Net this month', '₹1.9 Cr'], ['Pooled nodes', String(pooled)], ['Effective tax', '18%']]} />} className="w-full border border-[var(--color-ember)]/25"
          expand={<div className="text-[13px] text-[var(--color-mist)]">This month's pay run and any anomalies awaiting sign-off.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><IndianRupee className="w-3 h-3" /> Payroll run</div>
          <div className="text-[13px] text-[var(--color-vapor)] leading-snug">{pooled} node pooling — a relocation changed a state tax code.</div>
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('payroll'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors flex items-center justify-center gap-2">Open payroll <ArrowRight className="w-3 h-3" /></button>
        </TokenCard>

        {/* onboarding */}
        <TokenCard id="hr-onboarding" kind="kpi" placement="flow" shape="soft" tint="halo" label="Onboarding" onActivate={() => {}} deep={<Stat items={[['In pipeline', String(ONBOARDING.length)], ['Closest', 'Aisha · 90%'], ['Avg time-to-productive', '31 d']]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Candidates mid-flight through onboarding.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><UserPlus className="w-3 h-3" /> Onboarding</div>
          <div className="space-y-2">
            {ONBOARDING.map(o => (
              <div key={o.id} className="flex items-center gap-3">
                <Avatar seed={o.name} name={o.name} size={26} />
                <div className="flex-1 min-w-0"><div className="text-[13px] text-[var(--color-vapor)] truncate">{o.name}</div><div className="text-[13px] text-[var(--color-trace)]">{o.stage}</div></div>
                <span className="text-[13px] font-mono text-[var(--color-lumen)]">{o.progress}%</span>
              </div>
            ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('onboarding'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Open onboarding</button>
        </TokenCard>

        {/* policy compliance */}
        <TokenCard id="hr-policy" kind="kpi" placement="flow" shape="soft" tint="coral" label="Policy compliance" onActivate={() => {}} deep={<Stat items={[['Org acknowledged', '72%'], ['Pending', '34 people'], ['Latest', 'Handbook v4.0']]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Acknowledgment coverage across the org.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><FileText className="w-3 h-3" /> Policy compliance</div>
          <div className="flex items-baseline gap-2"><span className="text-2xl font-mono font-medium text-[var(--color-vapor)]">72%</span><span className="text-[13px] text-[var(--color-mist)]">acknowledged</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--color-glass-edge)] overflow-hidden"><div className="h-full rounded-full" style={{ width: '72%', background: 'var(--color-coral)' }} /></div>
        </TokenCard>

        {/* org health */}
        <TokenCard id="hr-health" kind="kpi" placement="flow" shape="soft" tint="mist" label="Org health" onActivate={() => {}} deep={<Stat items={[['Attendance anomalies', '4'], ['Below comp band', '18%'], ['Attrition (LTM)', '9%']]} />} className="w-full"
          expand={<div className="text-[13px] text-[var(--color-mist)]">Signals worth watching — drag onto Q for a breakdown.</div>}>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><BarChart3 className="w-3 h-3" /> Org health</div>
          <div className="text-[13px] text-[var(--color-vapor)] flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-[var(--color-ember)]" /> 4 attendance anomalies · 2 pending exits</div>
          <button onClick={(e) => { e.stopPropagation(); w.setRegion('analytics'); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Open insights</button>
        </TokenCard>
      </div>
    </div>
    </>
  );
}
