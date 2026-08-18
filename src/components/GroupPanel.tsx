import { AnimatePresence, motion } from 'motion/react';
import { X, Layers, Sparkles, Combine } from 'lucide-react';
import { useWorkspace } from '../store';

export default function GroupPanel() {
  const w = useWorkspace();
  const open = w.selection.length >= 1;
  const labelOf = (id: string) =>
    w.people.find(p => p.id === id)?.name?.split(' ')[0] ??
    (w.leaves.find(l => l.id === id) ? w.leaves.find(l => l.id === id)!.personName.split(' ')[0] + ' · leave' : undefined) ??
    w.payslips.find(p => p.id === id)?.month ??
    w.documents.find(d => d.id === id)?.title?.slice(0, 18) ??
    w.synth.find(sn => sn.id === id)?.title?.slice(0, 18) ?? id;
  const colorOf = (id: string) =>
    w.people.find(p => p.id === id) ? 'var(--color-lumen)' :
    w.leaves.find(l => l.id === id) ? 'var(--color-ember)' :
    w.payslips.find(p => p.id === id) ? 'var(--color-halo)' :
    w.documents.find(d => d.id === id) ? 'var(--color-mist)' : 'var(--color-halo)';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 70, opacity: 0 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 glass-elevated p-3 w-[min(620px,94vw)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-[var(--color-halo-text)]" /><span className="font-display">Stack · {w.selection.length}</span><span className="text-[13px] text-[var(--color-trace)] font-mono">stack tokens, then combine or ask Q</span></div>
            <button onClick={w.clearSel} aria-label="Clear stack"><X className="w-4 h-4 text-[var(--color-mist)] hover:text-[var(--color-vapor)]" /></button>
          </div>

          {/* stacked chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {w.selection.map(id => (
              <button key={id} onClick={() => w.toggleSelect(id)} className="group flex items-center gap-2 pl-2 pr-2 py-1 rounded-full glass-soft text-[13px] hover:bg-white/10 transition-colors">
                <span className="w-2 h-2 rounded-full" style={{ background: colorOf(id) }} />{labelOf(id)}
                <X className="w-3 h-3 text-[var(--color-trace)] group-hover:text-[var(--color-coral)]" />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => w.combineStack(w.selection)} disabled={w.selection.length < 2}
              className="flex-1 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2"><Combine className="w-3.5 h-3.5" /> Combine into result</button>
            <button onClick={() => w.explainCluster(w.selection)} disabled={w.selection.length < 1}
              className="flex-1 py-2 rounded-full text-[13px] font-semibold glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q about the stack</button>
          </div>
          <p className="text-[13px] text-[var(--color-trace)] mt-2">Add with the bottom-left stack tab on any card (or ⌘/Shift-click). Two+ people → comparison matrix; mixed types → a working-set view.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
