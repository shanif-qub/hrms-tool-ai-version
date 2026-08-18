import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Check, History, Sparkles } from 'lucide-react';
import { useWorkspace } from '../store';
import { ConceptIcon, docConcept } from '../icons';

// Long-form body is not seeded per document, so we synthesize a readable,
// policy-styled body from the summary. A real deployment renders the stored
// document (PDF/HTML) from the object store here.
function synthBody(title: string, summary: string, category: string): { heading: string; paras: string[] }[] {
  const intro = summary;
  const common = [
    { heading: 'Purpose & scope', paras: [intro, 'This document applies to all employees unless a local addendum states otherwise. Where local law is more favourable to the employee, local law prevails.'] },
    { heading: 'Policy', paras: ['The company is committed to applying this policy consistently and fairly. Managers are responsible for applying it within their teams; People Operations owns interpretation and exceptions.', 'Requests for exceptions must be made in writing and are reviewed case by case.'] },
    { heading: 'Your responsibilities', paras: ['Read this document in full, raise any questions with your manager or People Operations, and acknowledge it where acknowledgment is requested. Acknowledgment records that you have read and understood the policy; it does not waive any statutory right.'] },
    { heading: 'Review & version history', paras: ['This document is reviewed at least annually. Material changes are re-issued for acknowledgment. The version and last-updated date shown above are authoritative.'] },
  ];
  return common;
}

export default function DocumentViewer() {
  const w = useWorkspace();
  const id = w.docView;
  const doc = id ? w.documents.find(d => d.id === id) : null;
  const close = () => w.openDoc(null);
  const concept = docConcept(doc?.category);
  const body = doc ? synthBody(doc.title, doc.summary, doc.category) : [];

  return (
    <AnimatePresence>
      {doc && (
        <motion.div className="fixed inset-0 z-[120] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[var(--color-abyss)]/70 backdrop-blur-sm" onClick={close} />
          <motion.div role="dialog" aria-modal="true" aria-label={doc.title}
            className="relative glass-elevated shape-soft w-full max-w-[760px] max-h-[86vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
            {/* header */}
            <div className="flex items-start gap-4 p-5 border-b border-[var(--color-glass-edge)]">
              <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-halo) 14%, transparent)' }}>
                <ConceptIcon concept={concept} size="hero" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full glass-soft text-[var(--color-mist)]">{doc.category}</span>
                  <span className="text-[12px] font-mono text-[var(--color-trace)] flex items-center gap-1"><History className="w-3 h-3" />{doc.version} · {doc.updated}</span>
                  {doc.mustAck && (doc.acked
                    ? <span className="text-[12px] text-[var(--color-lumen)] flex items-center gap-1"><Check className="w-3 h-3" /> Acknowledged</span>
                    : <span className="text-[12px] text-[var(--color-ember)]">Acknowledgment required</span>)}
                </div>
                <h2 className="font-display text-lg text-[var(--color-vapor)] leading-tight">{doc.title}</h2>
              </div>
              <button onClick={close} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-full glass-soft text-[var(--color-mist)] hover:text-[var(--color-vapor)] hover:bg-white/10 transition-colors shrink-0"><X className="w-4 h-4" /></button>
            </div>

            {/* body */}
            <div className="overflow-y-auto panel-scroll px-6 py-5 flex-1">
              <p className="text-sm text-[var(--color-mist)] leading-relaxed mb-5 italic">{doc.summary}</p>
              {body.map((sec, i) => (
                <section key={i} className="mb-5">
                  <h3 className="font-display text-[15px] text-[var(--color-vapor)] mb-2">{sec.heading}</h3>
                  {sec.paras.map((para, j) => <p key={j} className="text-[13px] text-[var(--color-mist)] leading-relaxed mb-3">{para}</p>)}
                </section>
              ))}
            </div>

            {/* footer actions */}
            <div className="flex items-center gap-2 p-4 border-t border-[var(--color-glass-edge)]">
              <button onClick={() => w.ask(`Summarise “${doc.title}” for me`)} className="px-4 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q to summarise</button>
              <button onClick={() => w.toast(`Downloading ${doc.title}`, 'info')} className="px-4 py-2 rounded-full text-[13px] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Download</button>
              <span className="flex-1" />
              {doc.mustAck && !doc.acked && (
                <button onClick={() => { w.ackDoc(doc.id); close(); }} className="px-4 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Acknowledge</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
