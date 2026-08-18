import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { Check, AlertTriangle, Info } from 'lucide-react';
import { useWorkspace } from '../store';

export default function Toasts() {
  const { toasts, dropToast } = useWorkspace();
  return (
    <div className="fixed top-[76px] left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => <ToastRow key={t.id} id={t.id} message={t.message} tone={t.tone} onDone={dropToast} />)}
      </AnimatePresence>
    </div>
  );
}

function ToastRow({ id, message, tone, onDone }:
  { id: string; message: string; tone: 'ok' | 'warn' | 'info'; onDone: (id: string) => void }) {
  useEffect(() => { const x = setTimeout(() => onDone(id), 3200); return () => clearTimeout(x); }, [id, onDone]);
  const color = tone === 'ok' ? 'var(--color-lumen)' : tone === 'warn' ? 'var(--color-ember)' : 'var(--color-halo)';
  const Icon = tone === 'ok' ? Check : tone === 'warn' ? AlertTriangle : Info;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="glass-elevated pl-3 pr-4 py-3 flex items-center gap-3 pointer-events-auto shadow-2xl rounded-xl overflow-hidden relative"
      role="status"
      style={{ boxShadow: `0 12px 34px -10px ${color}, 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1" style={{ background: color }} />
      <span className="w-6 h-6 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}><Icon className="w-3.5 h-3.5" style={{ color }} /></span>
      <span className="text-[13px] text-[var(--color-vapor)]">{message}</span>
    </motion.div>
  );
}
