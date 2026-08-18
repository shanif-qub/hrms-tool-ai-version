import { AnimatePresence, motion } from 'motion/react';
import { X, Wand2 } from 'lucide-react';
import { useWorkspace } from '../store';
import { RetentionGauge } from './Viz';

const LEVERS = [
  { id: 'bonus', label: 'Retention bonus (₹2.1L)', after: 0.41, budget: '₹2.1L / yr', morale: '+8%' },
  { id: 'project', label: 'High-visibility project', after: 0.52, budget: '₹0', morale: '+5%' },
  { id: 'promo', label: 'Promotion to Staff', after: 0.3, budget: '₹3.4L / yr', morale: '+12%' },
] as const;

export default function SimulateOverlay() {
  const { sim, people, closeSim, simulate, toast } = useWorkspace();
  const person = sim && people.find(p => p.id === sim.personId);
  const lever = sim && LEVERS.find(l => l.id === sim.lever)!;
  return (
    <AnimatePresence>
      {sim && person && lever && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSim}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            className="glass-panel p-6 w-[min(440px,92vw)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Wand2 className="w-4 h-4 text-[var(--color-lumen)]" /><span className="font-display">Retention simulation · {person.name}</span></div>
              <button onClick={closeSim} aria-label="Close"><X className="w-4 h-4 text-[var(--color-mist)]" /></button>
            </div>
            <div className="glass-soft p-4 mb-4 flex justify-center"><RetentionGauge before={0.78} after={lever.after} /></div>
            <div className="grid grid-cols-2 gap-3 text-[13px] mb-4">
              <div className="glass-soft p-3"><div className="text-[var(--color-trace)] mb-1">Budget impact</div><div className="font-mono text-[var(--color-ember)]">{lever.budget}</div></div>
              <div className="glass-soft p-3"><div className="text-[var(--color-trace)] mb-1">Team morale</div><div className="font-mono text-[var(--color-lumen)]">{lever.morale}</div></div>
            </div>
            <div className="space-y-2">
              <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Try another lever</div>
              <div className="flex flex-wrap gap-2">
                {LEVERS.map(l => <button key={l.id} onClick={() => simulate(person.id, l.id)} className={`text-[13px] px-3 py-2 rounded-xl transition-colors ${l.id === lever.id ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft'}`}>{l.label}</button>)}
              </div>
            </div>
            <button onClick={() => { toast(`Drafted: ${lever.label} for ${person.name} — sent for approval`, 'ok'); closeSim(); }}
              className="mt-5 w-full py-3 rounded-full text-sm font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors">Draft this move for approval</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
