import { useState } from 'react';
import { clearMemory } from '../memory';
import { AnimatePresence, motion } from 'motion/react';
import { X, Grid3x3, Plus, UserPlus, Image as ImageIcon, UserRound, Check, Sparkles } from 'lucide-react';
import { useWorkspace } from '../store';
import { useTheme } from '../theme';
import { MANAGER_ID, MONTHS } from '../data';
import { LeaveMode } from '../types';
import { Avatar } from './Avatar';
import { WALLPAPERS, WallpaperArt } from './Wallpaper';

function Modal({ title, icon, onClose, children, wide }: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} className={`glass-elevated p-6 ${wide ? 'w-[min(960px,96vw)]' : 'w-[min(560px,94vw)]'} max-h-[85vh] overflow-auto`}>
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2">{icon}<span className="font-display">{title}</span></div><button onClick={onClose} aria-label="Close"><X className="w-4 h-4 text-[var(--color-mist)]" /></button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const dayNum = (s: string) => parseInt(s) || 0;

export default function Overlays() {
  const w = useWorkspace();
  return (
    <AnimatePresence>
      {w.overlay === 'matrix' && <TeamMatrix key="m" />}
      {w.overlay === 'addType' && <AddType key="t" />}
      {w.overlay === 'addPerson' && <AddPerson key="ap" />}
      {w.overlay === 'addLeave' && <AddLeave key="l" />}
      {w.overlay === 'settings' && <SettingsPanel key="s" />}
    </AnimatePresence>
  );
}

function TeamMatrix() {
  const { people, leaves, setOverlay } = useWorkspace();
  const team = people.filter(p => p.managerId === MANAGER_ID);
  const days = Array.from({ length: 14 }, (_, i) => i + 1); // Jul 1..14
  const WD = ['W', 'T', 'F', 'S', 'S', 'M', 'T']; // Jul 1 2026 = Wed
  const dow = (d: number) => (d - 1) % 7;
  const isWeekend = (d: number) => dow(d) === 3 || dow(d) === 4; // Sat/Sun
  const onLeave = (pid: string, d: number) => leaves.some(l => l.personId === pid && l.status !== 'rejected' && l.startDate.includes('Jul') && d >= dayNum(l.startDate) && d <= dayNum(l.endDate));
  const remote: Record<string, number[]> = { p3: [2, 3, 9, 10], p5: [4, 11] }; // dummy remote days
  const isRemote = (pid: string, d: number) => (remote[pid] ?? []).includes(d);
  const kindOf = (pid: string, d: number) => isWeekend(d) ? 'weekend' : onLeave(pid, d) ? 'leave' : isRemote(pid, d) ? 'remote' : 'in';
  const COLOR: Record<string, string> = { in: 'var(--color-lumen-soft)', leave: 'var(--color-coral)', remote: 'var(--color-blue)', weekend: 'rgba(150,170,190,0.08)' };
  const availOn = (d: number) => isWeekend(d) ? 0 : team.filter(p => !onLeave(p.id, d)).length;
  const low = Math.ceil(team.length * 0.6);
  const cols = `170px repeat(14, minmax(30px, 1fr))`;

  return (
    <Modal wide title="Team availability · Jul 1–14" icon={<Grid3x3 className="w-4 h-4 text-[var(--color-lumen)]" />} onClose={() => setOverlay(null)}>
      <div className="text-[13px] text-[var(--color-mist)] mb-4">{team.length} reports · a coverage dip shows Jul 6–7 (weekend) and again where leave clusters. Cells are tappable in the full product.</div>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid gap-1 items-center min-w-max" style={{ gridTemplateColumns: cols }}>
          {/* header */}
          <span />
          {days.map(d => <div key={d} className="text-center"><div className="text-[12px] text-[var(--color-trace)]">{WD[dow(d)]}</div><div className="text-[13px] font-mono text-[var(--color-mist)]">{d}</div></div>)}
          {/* rows */}
          {team.map(p => (
            <div key={p.id} className="contents">
              <div className="flex items-center gap-2 pr-2 py-0.5"><Avatar seed={p.name} name={p.name} size={24} /><span className="text-[13px] text-[var(--color-vapor)] truncate">{p.name.split(' ')[0]}</span></div>
              {days.map(d => { const k = kindOf(p.id, d); return <span key={d} className="h-8 rounded-md transition-transform hover:scale-110" title={`${p.name.split(' ')[0]} · Jul ${d} · ${k}`} style={{ background: COLOR[k] }} />; })}
            </div>
          ))}
          {/* coverage summary */}
          <div className="text-[13px] uppercase tracking-wider text-[var(--color-trace)] pr-2 pt-2">Available</div>
          {days.map(d => { const a = availOn(d); const dip = !isWeekend(d) && a < low; return <div key={d} className="text-center pt-2"><span className="text-[13px] font-mono font-semibold" style={{ color: isWeekend(d) ? 'var(--color-trace)' : dip ? 'var(--color-ember)' : 'var(--color-lumen)' }}>{isWeekend(d) ? '–' : a}</span></div>; })}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-5 text-[13px] text-[var(--color-mist)]">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.in }} /> In office</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.remote }} /> Remote</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.leave }} /> On leave</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR.weekend }} /> Weekend</span>
        <span className="flex items-center gap-1 text-[var(--color-ember)]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-ember)]" /> Coverage dip</span>
      </div>
    </Modal>
  );
}


function AddPerson() {
  const { addPerson, setOverlay, people } = useWorkspace();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('Design');
  const [mgr, setMgr] = useState('m1');
  const leads = people.filter(p => people.some(q => q.managerId === p.id) || p.id === 'm1');
  const inputCls = "w-full px-3 py-3 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm focus:border-[var(--color-lumen)] transition-colors";
  return (
    <Modal title="Add a person to the org" icon={<UserPlus className="w-4 h-4" />} onClose={() => setOverlay(null)}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[13px] uppercase tracking-wider text-[var(--color-trace)]">Full name
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nadia Rahman" className={inputCls} /></label>
        <label className="flex flex-col gap-1 text-[13px] uppercase tracking-wider text-[var(--color-trace)]">Role
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product Analyst" className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-[13px] uppercase tracking-wider text-[var(--color-trace)]">Department
            <select value={dept} onChange={e => setDept(e.target.value)} className={inputCls}>
              {['Design', 'Engineering', 'Data', 'Product'].map(d => <option key={d} value={d}>{d}</option>)}
            </select></label>
          <label className="flex flex-col gap-1 text-[13px] uppercase tracking-wider text-[var(--color-trace)]">Reports to
            <select value={mgr} onChange={e => setMgr(e.target.value)} className={inputCls}>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select></label>
        </div>
        <button onClick={() => { if (name.trim() && role.trim()) { addPerson(name.trim(), role.trim(), dept, mgr); setOverlay(null); } }} disabled={!name.trim() || !role.trim()}
          className="w-full py-3 rounded-full text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/30 transition-colors">Add to the org</button>
        <p className="text-[13px] text-[var(--color-trace)]">They appear in the org graph and roster immediately; onboarding can start from the Onboarding screen.</p>
      </div>
    </Modal>
  );
}

function AddType() {
  const { addType, setOverlay } = useWorkspace();
  const [label, setLabel] = useState(''); const [days, setDays] = useState(5);
  return (
    <Modal title="Add a leave type" icon={<Plus className="w-4 h-4 text-[var(--color-lumen)]" />} onClose={() => setOverlay(null)}>
      <div className="space-y-4">
        <label className="block"><span className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Name</span>
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Sabbatical, Bereavement" className="mt-1 w-full glass-soft px-3 py-2 text-sm bg-transparent outline-none" /></label>
        <label className="block"><span className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Annual allowance (days)</span>
          <input type="number" min={0} value={days} onChange={e => setDays(+e.target.value)} className="mt-1 w-full glass-soft px-3 py-2 text-sm bg-transparent outline-none" /></label>
        <button onClick={() => label.trim() && addType(label.trim(), days)} disabled={!label.trim()} className="w-full py-3 rounded-full text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/30 transition-colors">Create type</button>
      </div>
    </Modal>
  );
}

function AddLeave() {
  const { people, leaveTypes, addLeaveFor, setOverlay } = useWorkspace();
  const team = people.filter(p => p.managerId === MANAGER_ID);
  const [step, setStep] = useState<0 | 1>(0);
  const [pid, setPid] = useState('');
  const [kind, setKind] = useState(leaveTypes[0]?.id ?? 'earned');
  const [mode, setMode] = useState<LeaveMode>('full');
  const [s, setS] = useState(1); const [e, setE] = useState(1);
  const days = mode === 'half' ? 0.5 : mode === 'range' ? Math.max(1, e - s + 1) : 1;
  const person = people.find(p => p.id === pid);
  return (
    <Modal title="Add leave for an employee" icon={<UserPlus className="w-4 h-4 text-[var(--color-lumen)]" />} onClose={() => setOverlay(null)}>
      {step === 0 ? (
        <div className="space-y-2">
          <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-1">Select employee</div>
          {team.map(p => <button key={p.id} onClick={() => { setPid(p.id); setStep(1); }} className="w-full glass-soft p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left">
            <Avatar seed={p.name} name={p.name} size={32} />
            <span><span className="text-sm font-medium block">{p.name}</span><span className="text-[13px] text-[var(--color-mist)]">{p.role}</span></span></button>)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm">For <span className="text-[var(--color-lumen)]">{person?.name}</span> <button onClick={() => setStep(0)} className="text-[13px] text-[var(--color-trace)] underline ml-2">change</button></div>
          <div><div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-2">Type</div>
            <div className="flex flex-wrap gap-2">{leaveTypes.map(t => <button key={t.id} onClick={() => setKind(t.id)} className={`text-[13px] px-3 py-2 rounded-xl ${kind === t.id ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft'}`}>{t.label}</button>)}</div></div>
          <div><div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-2">Duration</div>
            <div className="flex gap-2 mb-2">{(['full', 'half', 'range'] as LeaveMode[]).map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-xl text-[13px] capitalize ${mode === m ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft'}`}>{m}</button>)}</div>
            <div className="flex items-center gap-2 text-[13px]"><span className="text-[var(--color-trace)]">Jul</span>
              <input type="number" min={1} max={31} value={s} onChange={ev => setS(+ev.target.value)} className="w-16 glass-soft px-2 py-2 bg-transparent outline-none" />
              {mode === 'range' && <>→<input type="number" min={1} max={31} value={e} onChange={ev => setE(+ev.target.value)} className="w-16 glass-soft px-2 py-2 bg-transparent outline-none" /></>}
              <span className="ml-auto font-mono text-[var(--color-lumen)]">{days}d</span></div>
          </div>
          <button onClick={() => addLeaveFor(pid, kind, mode, `${s} Jul`, `${mode === 'range' ? e : s} Jul`, days)} className="w-full py-3 rounded-full text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Add leave</button>
        </div>
      )}
    </Modal>
  );
}


const AVATAR_SEEDS = ['nova', 'sol', 'vega', 'iris', 'atlas', 'wren'];

function Toggle({ on, onToggle, label, hint }: { on: boolean; onToggle: () => void; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <button role="switch" aria-checked={on} onClick={onToggle} className="relative w-11 h-6 rounded-full transition-colors shrink-0" style={{ background: on ? 'var(--color-lumen)' : 'var(--color-glass-edge)' }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow" style={{ left: on ? 22 : 2 }} />
      </button>
      <span className="text-sm text-[var(--color-vapor)]">{label}<span className="block text-[12px] text-[var(--color-trace)]">{hint}</span></span>
    </div>
  );
}

function SettingsPanel() {
  const { setOverlay, wallpaper, setWallpaper, avatarSeed, setAvatarSeed, reduced, motionOff, setMotionOff, soundOn, setSound, plain, setPlain, setTour, role, setRole } = useWorkspace();
  const { theme, toggle } = useTheme();
  return (
    <Modal wide title="Personalise your workspace" icon={<Sparkles className="w-4 h-4 text-[var(--color-halo-text)]" />} onClose={() => setOverlay(null)}>
      <div className="space-y-6">
        {/* wallpaper */}
        <section>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><ImageIcon className="w-3.5 h-3.5" /> Wallpaper</div>
          <p className="text-[13px] text-[var(--color-mist)] mb-3">Sits beneath the living gradient. Pick something calm — cards stay glassy on top.</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {WALLPAPERS.map(wp => { const active = wallpaper === wp.id; return (
              <button key={wp.id} onClick={() => setWallpaper(wp.id)} className="text-left group" aria-pressed={active}>
                <div className="relative h-16 rounded-xl overflow-hidden glass-soft" style={{ outline: active ? '2px solid var(--color-lumen)' : '1px solid var(--color-glass-edge)', outlineOffset: active ? 1 : 0, background: 'var(--field)' }}>
                  {wp.id === 'none' ? <span className="absolute inset-0 grid place-items-center text-[12px] text-[var(--color-trace)]">Gradient only</span> : <WallpaperArt id={wp.id} />}
                  {active && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-lumen)] grid place-items-center"><Check className="w-2.5 h-2.5 text-[var(--color-abyss)]" /></span>}
                </div>
                <div className="text-[12px] mt-2 text-center" style={{ color: active ? 'var(--color-lumen)' : 'var(--color-mist)' }}>{wp.label}</div>
              </button>
            ); })}
          </div>
        </section>

        {/* avatar */}
        <section>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3"><UserRound className="w-3.5 h-3.5" /> Your avatar</div>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={() => setAvatarSeed(null)} className="flex flex-col items-center gap-2" aria-pressed={!avatarSeed}>
              <span className="rounded-full" style={{ outline: !avatarSeed ? '2px solid var(--color-lumen)' : '1px solid var(--color-glass-edge)', outlineOffset: 2 }}><Avatar seed="Alex Mercer" name="Alex Mercer" size={48} /></span>
              <span className="text-[12px]" style={{ color: !avatarSeed ? 'var(--color-lumen)' : 'var(--color-mist)' }}>Default</span>
            </button>
            {AVATAR_SEEDS.map(seed => { const active = avatarSeed === seed; return (
              <button key={seed} onClick={() => setAvatarSeed(seed)} className="flex flex-col items-center gap-2" aria-pressed={active}>
                <span className="rounded-full" style={{ outline: active ? '2px solid var(--color-lumen)' : '1px solid var(--color-glass-edge)', outlineOffset: 2 }}><Avatar seed={seed} name={seed} size={48} /></span>
                <span className="text-[12px] capitalize" style={{ color: active ? 'var(--color-lumen)' : 'var(--color-mist)' }}>{seed}</span>
              </button>
            ); })}
          </div>
        </section>

        {/* role & access (RBAC) */}
        <section>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3">Role &amp; access</div>
          <p className="text-[13px] text-[var(--color-mist)] mb-2">Your role decides which lenses you can enter. In a real deployment this comes from your identity provider; here you can preview each.</p>
          <div className="flex items-center gap-2">
            {([['employee', 'Employee', 'My World only'], ['manager', 'Manager', 'My World + My Team'], ['hr', 'HR / Admin', 'All three lenses']] as const).map(([r, label, hint]) => (
              <button key={r} onClick={() => setRole(r)} className={`flex-1 px-3 py-3 rounded-xl text-left transition-colors ${role === r ? 'bg-[var(--color-lumen-soft)] ring-1 ring-[var(--color-lumen)]/40' : 'glass-soft hover:bg-white/10'}`}>
                <span className={`block text-[13px] ${role === r ? 'text-[var(--color-lumen)]' : 'text-[var(--color-vapor)]'}`}>{label}</span>
                <span className="block text-[12px] text-[var(--color-trace)]">{hint}</span>
              </button>
            ))}
          </div>
        </section>

        {/* system */}
        <section>
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-3">System</div>
          <div className="space-y-1">
            <Toggle on={theme === 'light'} onToggle={toggle} label="Light appearance" hint="Switch between the dusk and daylight palettes." />
            <Toggle on={soundOn} onToggle={() => setSound(!soundOn)} label="Sound" hint="Soft water tones on interactions." />
            <Toggle on={!motionOff} onToggle={() => setMotionOff(!motionOff)} label="Ambient motion" hint="Fluid drift, wallpaper animation and ripples." />
            <Toggle on={plain} onToggle={() => { setPlain(!plain); setOverlay(null); }} label="Plain mode" hint="A calm, high-contrast layout with no ambient motion." />
            <button onClick={() => { setOverlay(null); setTour(true); }} className="w-full mt-1 px-3 py-3 rounded-xl glass-soft hover:bg-white/10 transition-colors text-left flex items-center justify-between"><span><span className="text-[13px] text-[var(--color-vapor)]">Replay product tour</span><span className="block text-[12px] text-[var(--color-trace)]">Walk through the workspace again.</span></span><span className="text-[var(--color-lumen)] text-[13px]">Start →</span></button>
            <button onClick={() => { clearMemory(); setOverlay(null); }} className="w-full mt-2 px-3 py-3 rounded-xl glass-soft hover:bg-white/10 transition-colors text-left flex items-center justify-between"><span><span className="text-[13px] text-[var(--color-vapor)]">Clear Q's memory</span><span className="block text-[12px] text-[var(--color-trace)]">Forget the threads Q offers to resume. Stored only on this device.</span></span><span className="text-[var(--color-coral)] text-[13px]">Clear</span></button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
