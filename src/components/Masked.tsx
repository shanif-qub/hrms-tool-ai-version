import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useWorkspace } from '../store';

// Sensitive value shown masked (•••) until either the global pay visibility is on,
// or the person clicks the inline eye to reveal this specific value.
export function Masked({ value, className = '' }: { value: string; className?: string }) {
  const w = useWorkspace();
  const [local, setLocal] = useState(false);
  const shown = w.showPay || local;
  const len = Math.min(10, Math.max(4, value.replace(/\s/g, '').length));
  return (
    <span data-handle className="inline-flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
      <span className={`font-mono tabular-nums ${className}`}>{shown ? value : '•'.repeat(len)}</span>
      <button onClick={(e) => { e.stopPropagation(); setLocal(s => !s); }} onPointerDown={(e) => e.stopPropagation()} aria-label={shown ? 'Hide value' : 'Reveal value'}
        className="text-[var(--color-trace)] hover:text-[var(--color-lumen)] transition-colors shrink-0">
        {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
}
