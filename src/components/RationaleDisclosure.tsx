// RationaleDisclosure — Phase A explainability. A quiet "Why this?" chevron that
// expands the Why / why now / why not / evidence behind a Q recommendation, with
// a confidence dot in the semantic color language. Reused by QPanel and Focus.

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { QMsg } from '../types';

type Rationale = NonNullable<QMsg['rationale']>;

const CONF: Record<'high' | 'medium' | 'low', { label: string; color: string }> = {
  high: { label: 'High confidence', color: 'var(--color-lumen)' },
  medium: { label: 'Medium confidence', color: 'var(--color-ember)' },
  low: { label: 'Low confidence', color: 'var(--color-coral)' },
};

export default function RationaleDisclosure({ rationale, indent = true }: { rationale: Rationale; indent?: boolean }) {
  const [open, setOpen] = useState(false);
  const conf = rationale.confidence ? CONF[rationale.confidence] : null;

  return (
    <div className={indent ? 'ml-6' : ''}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Hide reasoning' : 'Show reasoning'}
        className="self-start text-[13px] px-3 py-1 rounded-full text-[var(--color-trace)] hover:text-[var(--color-lumen)] border border-[var(--color-glass-edge)] hover:border-[var(--color-lumen)]/40 transition-colors flex items-center gap-2">
        <HelpCircle className="w-3 h-3" /> Why this?
        {conf && <span className="w-1.5 h-1.5 rounded-full" style={{ background: conf.color, boxShadow: `0 0 5px ${conf.color}` }} />}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="mt-2 glass-soft rounded-xl p-3 flex flex-col gap-2 text-[13px] leading-relaxed">
              <Row label="Why" text={rationale.why} />
              {rationale.whyNow && <Row label="Why now" text={rationale.whyNow} />}
              {rationale.whyNot && <Row label="Worth noting" text={rationale.whyNot} />}
              {rationale.evidence && rationale.evidence.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-trace)] mb-1">Evidence</div>
                  <div className="flex flex-col gap-1">
                    {rationale.evidence.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-[var(--color-mist)]">
                        <span className="mt-1 w-1 h-1 rounded-full bg-[var(--color-lumen)] shrink-0" />{e}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {conf && (
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-glass-edge)]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: conf.color, boxShadow: `0 0 5px ${conf.color}` }} />
                  <span className="text-[12px]" style={{ color: conf.color }}>{conf.label}</span>
                  <span className="text-[12px] text-[var(--color-trace)]">— based on the signals above, not a guarantee</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-widest text-[var(--color-trace)]">{label}</span>
      <p className="text-[var(--color-vapor)] mt-0.5">{text}</p>
    </div>
  );
}
