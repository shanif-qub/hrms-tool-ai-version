import { ReactNode } from 'react';
import { RotateCcw, Settings, User, Users, Building2, Activity, CalendarDays, FileText, IndianRupee, ClipboardCheck, BarChart3, UserPlus, TrendingUp, HelpCircle, UserMinus } from 'lucide-react';
import { useWorkspace } from '../store';
import { TENANT } from '../data';
import logo from '../assets/qub-logo.png';
import { Persona, Region } from '../types';

const LENSES: { id: Persona; label: string; icon: ReactNode }[] = [
  { id: 'employee', label: 'My world', icon: <User className="w-4 h-4" /> },
  { id: 'manager', label: 'My team', icon: <Users className="w-4 h-4" /> },
  { id: 'hr', label: 'The org', icon: <Building2 className="w-4 h-4" /> },
];

const REGIONS: Record<Persona, { id: Region; label: string; icon: ReactNode }[]> = {
  employee: [
    { id: 'home', label: 'Now', icon: <Activity className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'payroll', label: 'Payroll', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'growth', label: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
  ],
  manager: [
    { id: 'home', label: 'Now', icon: <Activity className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'approvals', label: 'Approvals', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'Insights', icon: <BarChart3 className="w-4 h-4" /> },
  ],
  hr: [
    { id: 'home', label: 'Now', icon: <Activity className="w-4 h-4" /> },
    { id: 'timeadmin', label: 'Time', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'exit', label: 'Exits', icon: <UserMinus className="w-4 h-4" /> },
    { id: 'people', label: 'Org', icon: <Users className="w-4 h-4" /> },
    { id: 'payroll', label: 'Payroll', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'onboarding', label: 'Onboarding', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'documents', label: 'Policies', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Insights', icon: <BarChart3 className="w-4 h-4" /> },
  ],
};

// icon that expands to reveal its label on hover (or when active)
function Pill({ icon, label, active, accent, onClick, ariaLabel }: { icon: ReactNode; label: string; active?: boolean; accent?: boolean; onClick: () => void; ariaLabel?: string }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel ?? label} title={label}
      className={`nav-pill group/nav flex items-center h-9 rounded-full overflow-hidden transition-colors ${active ? (accent ? 'bg-[var(--color-lumen-soft)] text-[var(--color-vapor)]' : 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]') : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}
      style={{ paddingLeft: 10, paddingRight: active ? 12 : 10 }}>
      <span className="grid place-items-center shrink-0">{icon}</span>
      <span className={`whitespace-nowrap text-[13px] font-medium overflow-hidden [transition:max-width_.26s_ease,margin_.26s_ease] ${active ? 'max-w-[120px] ml-2' : 'max-w-0 ml-0 group-hover/nav:max-w-[120px] group-hover/nav:ml-2'}`}>{label}</span>
    </button>
  );
}

export default function TopChrome() {
  const { lens, region, setLens, setRegion, reset, setOverlay, setLegend, availableLenses } = useWorkspace();
  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-[96vw]">
      <div className="island flex items-center gap-1 pl-2 pr-2 py-2 max-w-full overflow-x-auto hide-scrollbar">
        {/* brand */}
        <div className="flex items-center gap-2 pl-0.5 pr-1 shrink-0" title={TENANT.name}>
          <span className="logo-badge w-9 h-9 rounded-full grid place-items-center shrink-0 overflow-hidden">
            <img src={logo} alt="Qubryx logo" className="w-6 h-6 object-contain" />
          </span>
          <span className="brand-text font-accent font-semibold text-sm hidden md:block tracking-tight">{TENANT.name}</span>
        </div>

        <span className="w-px h-6 bg-[var(--color-glass-edge)] mx-0.5" />

        {/* lens (persona) */}
        <nav className="flex items-center gap-0.5" aria-label="Lens">
          {LENSES.filter(l => availableLenses.includes(l.id)).map(l => <Pill key={l.id} icon={l.icon} label={l.label} active={lens === l.id} accent onClick={() => setLens(l.id)} />)}
        </nav>

        <span className="w-px h-6 bg-[var(--color-glass-edge)] mx-0.5" />

        {/* region nav */}
        <nav className="flex items-center gap-0.5" aria-label="Regions">
          {REGIONS[lens].map(r => <Pill key={r.id} icon={r.icon} label={r.label} active={region === r.id} onClick={() => setRegion(r.id)} />)}
        </nav>

        <span className="w-px h-6 bg-[var(--color-glass-edge)] mx-0.5" />

        {/* utilities */}
        <div className="flex items-center gap-0.5" aria-label="Utilities">
          <Pill icon={<HelpCircle className="w-4 h-4" />} label="Gestures" onClick={() => setLegend(true)} />
          <Pill icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => setOverlay('settings')} />
          <Pill icon={<RotateCcw className="w-4 h-4" />} label="Reset" onClick={reset} />
        </div>
      </div>
    </header>
  );
}
