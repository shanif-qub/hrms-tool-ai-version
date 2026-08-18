import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Grid3x3, CalendarPlus, UserPlus, FileUp, Search, ChevronLeft, ChevronRight, Undo2, Users, Layers, Wand2, LayoutGrid, Share2 } from 'lucide-react';
import { useWorkspace } from '../store';
import { ConceptIcon } from '../icons';
import { Avatar } from './Avatar';
import { BOARD_PALETTE } from '../boardPalette';
import { ME_ID } from '../data';

type View = 'root' | 'people' | 'restore';
type Cat = { label: string; icon: React.ReactNode; run?: () => void; go?: View; hint?: string };

export default function ContextualAdd() {
  const w = useWorkspace();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('root');
  const [q, setQ] = useState('');

  const close = () => { setOpen(false); setTimeout(() => { setView('root'); setQ(''); }, 200); };
  const SPHERE_LABEL: Record<string, string> = {
    calendar: 'Calendar', leave: 'Leave', pay: 'Pay', documents: 'Documents', growth: 'Growth',
    requests: 'Requests', focus: 'Focus', approvals: 'Approvals', team: 'Team', availability: 'Availability',
    insights: 'Insights', reviews: 'Growth', planning: 'Planning', org: 'Org', payroll: 'Payroll',
    onboarding: 'Onboarding', exit: 'Offboarding', timeadmin: 'Time & holidays', policies: 'Policies',
  };
  const SPHERE_CONCEPT: Record<string, string> = {
    calendar: 'calendar', leave: 'leave', pay: 'pay', documents: 'document', growth: 'growth',
    requests: 'requests', focus: 'focus', approvals: 'approval', team: 'team', availability: 'attendance',
    insights: 'analytics', reviews: 'growth', planning: 'planning', org: 'org', payroll: 'payroll',
    onboarding: 'onboarding', exit: 'offboarding', timeadmin: 'timeadmin', policies: 'policy',
  };
  const nameFor = (id: string) =>
    SPHERE_LABEL[id] ??
    w.people.find(p => p.id === id)?.name ??
    (w.leaves.find(l => l.id === id) ? w.leaves.find(l => l.id === id)!.personName + ' · leave' : undefined) ??
    w.payslips.find(p => p.id === id)?.month ??
    w.documents.find(d => d.id === id)?.title ?? id;

  const cats: Cat[] = [];
  // ── mode-aware options first when on the home region ──
  const onHome = w.region === 'home';
  // Home modes get an EXCLUSIVE, mode-specific menu (no general region cats leaking in).
  const modeMenu = onHome && (w.homeView === 'workspace' || w.homeView === 'board' || w.homeView === 'signal');
  if (onHome && w.homeView === 'workspace') {
    cats.push({ label: 'New note', icon: <ConceptIcon concept="note" size="inline" />, run: () => w.wsAdd('note', 40, 60) });
    cats.push({ label: 'New list', icon: <ConceptIcon concept="list" size="inline" />, run: () => w.wsAdd('list', 40, 60) });
    cats.push({ label: 'New to-do', icon: <ConceptIcon concept="todo" size="inline" />, run: () => w.wsAdd('todo', 40, 60) });
  } else if (onHome && w.homeView === 'board') {
    // exactly mirror the old Add-card pill: persona cards, + shared tools (employee), + Canvas (manager/hr)
    (BOARD_PALETTE[w.lens] ?? []).forEach(p => { const on = w.nowBoard.some(b => b.lens === w.lens && b.ref === p.ref && b.type === 'chart'); cats.push({ label: on ? `${p.label} · on board` : p.label, icon: <LayoutGrid className="w-4 h-4" />, hint: on ? 'remove' : undefined, run: () => { if (on) { const b = w.nowBoard.find(x => x.lens === w.lens && x.ref === p.ref && x.type === 'chart'); if (b) { w.boardRemove(b.id); w.toast(`${p.label} removed`, 'info'); } } else { w.boardAdd('chart', p.ref); w.toast(`${p.label} added`, 'ok'); } } }); });
    if (w.lens === 'employee') {
      w.sharedTools.filter(t => (!t.to || t.to === 'team' || t.to === ME_ID) && !w.sharedHidden.includes(t.appId)).forEach(t => { const on = w.nowBoard.some(b => b.type === 'tool' && b.ref === t.appId && b.lens === 'employee'); cats.push({ label: on ? `${t.title} · on board` : t.title, icon: <Share2 className="w-4 h-4" />, hint: on ? 'remove' : `from ${t.from}`, run: () => { if (on) { const b = w.nowBoard.find(x => x.lens === 'employee' && x.ref === t.appId && x.type === 'tool'); if (b) { w.boardRemove(b.id); w.toast(`${t.title} removed`, 'info'); } } else { w.boardAdd('tool', t.appId); w.toast(`${t.title} added`, 'ok'); } } }); });
    } else {
      cats.push({ label: 'Build a tool in Canvas', icon: <Wand2 className="w-4 h-4" />, run: () => w.setVibe(true) });
    }
  } else if (onHome && w.homeView === 'signal') {
    if (w.lens === 'employee') { cats.push({ label: 'Apply for leave', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setRegion('calendar') }); cats.push({ label: 'Compare people', icon: <Layers className="w-4 h-4" />, go: 'people', hint: `${w.people.length}` }); }
    else { cats.push({ label: 'Add leave for someone', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setOverlay('addLeave') }); cats.push({ label: 'Availability matrix', icon: <Grid3x3 className="w-4 h-4" />, run: () => w.setOverlay('matrix') }); }
  }
  if (!modeMenu) {
  if (w.lens === 'manager' || w.lens === 'hr') {
    // region-relevant options first — the button adds what THIS screen holds
    if (w.lens === 'hr' && (w.region === 'people' || w.region === 'home')) cats.push({ label: 'Add a person to the org', icon: <UserPlus className="w-4 h-4" />, run: () => w.setOverlay('addPerson') });
    if (w.lens === 'hr' && w.region === 'onboarding') cats.push({ label: 'Add a joiner to onboarding', icon: <UserPlus className="w-4 h-4" />, run: () => { const name = window.prompt('Joiner name'); if (name?.trim()) w.addCandidate(name.trim(), 'Offer accepted'); } });
    if (w.lens === 'hr' && w.region === 'exit') cats.push({ label: 'Start an offboarding', icon: <UserPlus className="w-4 h-4" />, run: () => w.setRegion('exit') });
    if (w.lens === 'hr' && w.region === 'payroll') { cats.push({ label: 'Reconcile vs last run', icon: <Plus className="w-4 h-4" />, run: () => w.ask('Why did payroll change this month?') }); cats.push({ label: 'Record off-cycle payment', icon: <Plus className="w-4 h-4" />, run: () => w.toast('Off-cycle payment drafted — routes to the next run', 'ok') }); cats.push({ label: 'Export pay register (CSV)', icon: <FileUp className="w-4 h-4" />, run: () => w.toast('Register exported — check downloads', 'ok') }); }
    if (w.lens === 'hr' && w.region === 'timeadmin') { cats.push({ label: 'New leave type', icon: <Plus className="w-4 h-4" />, run: () => w.setOverlay('addType') }); }
    cats.push({ label: 'Add leave for someone', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setOverlay('addLeave') });
    if (w.lens === 'hr' && w.region !== 'timeadmin') cats.push({ label: 'Leave types & holidays', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setRegion('timeadmin') });
    cats.push({ label: 'Availability matrix', icon: <Grid3x3 className="w-4 h-4" />, run: () => w.setOverlay('matrix') });
    cats.push({ label: 'Find people', icon: <Users className="w-4 h-4" />, go: 'people', hint: `${w.people.length}` });
    if (w.lens === 'hr' && w.region === 'documents') { cats.push({ label: 'Nudge non-acknowledgers', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.ask('Remind those who haven\u2019t acknowledged') }); cats.push({ label: 'Upload a policy', icon: <FileUp className="w-4 h-4" />, run: () => w.toast('Upload flow — connect storage to enable', 'info') }); }
  } else {
    cats.push({ label: 'Request leave', icon: <CalendarPlus className="w-4 h-4" />, run: () => w.setRegion('calendar') });
    cats.push({ label: 'Compare people', icon: <Layers className="w-4 h-4" />, go: 'people', hint: `${w.people.length}` });
  }
  }
  if (w.hidden.length) cats.push({ label: 'Closed cards', icon: <Undo2 className="w-4 h-4" />, go: 'restore', hint: `${w.hidden.length}` });

  const people = w.people.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  const hiddenList = w.hidden.filter(id => nameFor(id).toLowerCase().includes(q.toLowerCase())).slice(0, 8);

  const Row = ({ icon, label, sub, onClick, accent }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void; accent?: boolean }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left hover:bg-white/10 transition-colors text-[var(--color-vapor)]">
      <span className={accent ? 'text-[var(--color-lumen)]' : 'text-[var(--color-mist)]'}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {sub && <span className="text-[13px] font-mono text-[var(--color-trace)]">{sub}</span>}
    </button>
  );

  return (
    <div className="fixed bottom-7 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} className="glass-elevated p-2 w-72 shape-soft overflow-hidden">
            {view === 'root' && (
              <>
                <div className="px-3 py-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Add to this space</div>
                {cats.map((c, i) => <Row key={i} icon={c.icon} label={c.label} sub={c.hint} accent onClick={() => { if (c.go) { setView(c.go); setQ(''); } else { c.run?.(); close(); } }} />)}
              </>
            )}
            {(view === 'people' || view === 'restore') && (
              <>
                <button onClick={() => { setView('root'); setQ(''); }} className="flex items-center gap-1 px-2 py-2 text-[13px] text-[var(--color-mist)] hover:text-[var(--color-vapor)]"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div className="glass-soft flex items-center px-3 py-2 mx-1 mb-2"><Search className="w-3.5 h-3.5 text-[var(--color-mist)] mr-2" /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={view === 'people' ? 'Search people…' : 'Search hidden…'} className="flex-1 bg-transparent outline-none text-sm min-w-0" /></div>
                <div className="max-h-64 overflow-auto hide-scrollbar">
                  {view === 'people' && people.map(p => (
                    <Row key={p.id} icon={<Avatar seed={p.name} name={p.name} size={24} />}
                      label={p.name} sub={w.selection.includes(p.id) ? 'in stack' : p.role.split(' ')[0]} onClick={() => { w.toggleSelect(p.id); w.toast(`${p.name} added to stack`, 'ok'); }} />
                  ))}
                  {view === 'people' && people.length === 0 && <div className="px-3 py-3 text-[13px] text-[var(--color-trace)]">No matches.</div>}
                  {view === 'restore' && hiddenList.map(id => <Row key={id} icon={SPHERE_CONCEPT[id] ? <ConceptIcon concept={SPHERE_CONCEPT[id]} size="inline" /> : <Undo2 className="w-4 h-4" />} label={nameFor(id)} onClick={() => { w.unhide(id); close(); }} />)}
                  {view === 'restore' && hiddenList.length === 0 && <div className="px-3 py-3 text-[13px] text-[var(--color-trace)]">Nothing hidden.</div>}
                </div>
                {view === 'people' && <div className="px-3 py-2 text-[13px] text-[var(--color-trace)] flex items-center gap-1">Tip: stacked people can be combined <ChevronRight className="w-3 h-3" /> Stack tray</div>}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* action dock — Canvas + Add as one capsule (manager/HR); lone Add on My World */}
      {(w.lens === 'manager' || w.lens === 'hr') ? (
        <div className="flex items-center gap-1 p-2 glass-elevated ring-1 ring-white/10 shadow-[0_14px_34px_-12px_var(--color-halo)]" style={{ borderRadius: 9999 }}>
          <button onClick={() => w.setVibe(!w.vibeOpen)} aria-label="Open Canvas — build tools with Q" aria-expanded={w.vibeOpen}
            className={`h-11 pl-4 pr-4 rounded-full flex items-center gap-2 text-sm font-semibold transition-colors ${w.vibeOpen ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'text-[var(--color-vapor)] hover:bg-white/10'}`}>
            <Wand2 className="w-4 h-4 text-[var(--color-halo-text)]" /> Canvas
          </button>
          <button onClick={() => (open ? close() : setOpen(true))} aria-label={open ? 'Close add menu' : 'Add to this space'} aria-expanded={open}
            className={`w-11 h-11 rounded-full grid place-items-center brand-gradient-btn text-white ring-1 ring-white/20 hover:scale-105 active:scale-95 ${open ? 'rotate-45' : ''}`} style={{ transition: 'transform .22s cubic-bezier(.2,.8,.2,1)' }}><Plus className="w-5 h-5" /></button>
        </div>
      ) : (
        <button onClick={() => (open ? close() : setOpen(true))} aria-label={open ? 'Close add menu' : 'Add to this space'} aria-expanded={open}
          className={`w-14 h-14 rounded-full grid place-items-center brand-gradient-btn text-white shadow-[0_14px_34px_-8px_var(--color-halo)] ring-1 ring-white/20 hover:scale-105 active:scale-95 ${open ? 'rotate-45' : ''}`} style={{ transition: 'transform .22s cubic-bezier(.2,.8,.2,1)' }}><Plus className="w-6 h-6" /></button>
      )}
    </div>
  );
}
