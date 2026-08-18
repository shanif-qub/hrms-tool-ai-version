import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Mic, Send, ArrowUpRight, Download, FileText, History } from 'lucide-react';
import { useWorkspace } from '../store';
import { SUGGESTION_GROUPS } from '../data';
import RationaleDisclosure from './RationaleDisclosure';
import { Viz } from './Viz';

function downloadCsv(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function QPanel() {
  const w = useWorkspace();
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<any>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: w.reduced ? 'auto' : 'smooth' }); }, [w.qLog.length, w.reduced]);
  useEffect(() => { if (w.qOpen) setTimeout(() => inputRef.current?.focus(), 240); }, [w.qOpen]);

  const send = (t: string) => { const v = t.trim(); if (v) { w.ask(v); setText(''); } };
  const recall = w.qOpen && w.qLog.length === 0 ? w.recallThread() : null;

  const mic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { w.toast('Voice input not supported in this browser', 'warn'); return; }
    const rec = new SR(); recRef.current = rec; rec.lang = 'en-IN'; rec.interimResults = false;
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setText(t); send(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); w.toast('Could not hear that', 'warn'); };
    setListening(true); rec.start();
  };

  const onAction = (act: any) => {
    if (!act) return;
    switch (act.kind) {
      case 'sim': w.simulate(act.arg, 'bonus'); break;
      case 'region': w.setRegion(act.arg); break;
      case 'half': w.applyLeave('casual', 'half', 'Fri 24 Jul', 'Fri 24 Jul', 0.5); w.setRegion('calendar'); break;
      case 'approveAll': w.bulkApprove(); break;
      case 'approveOne': w.approve(act.arg); break;
      case 'rejectOne': w.reject(act.arg); break;
      case 'autoCover': w.autoCoverAll(); break;
      case 'nudgeReviews': w.nudgeReviews(); break;
      case 'goalCreate': { try { const a = JSON.parse(act.arg); w.createGoal(a.title, a.dueOn); } catch { /* ignore */ } w.setRegion('growth'); break; }
      case 'chain': { try { const steps = JSON.parse(act.arg) as any[]; steps.forEach((s2, i) => setTimeout(() => onAction(s2), i * 450)); } catch { /* ignore */ } break; }
      case 'override': w.overridePayroll(act.arg); break;
      case 'matrix': w.setLens('manager'); w.setRegion('approvals'); w.setOverlay('matrix'); break;
      case 'break': w.breakStart(); break;
      case 'clockIn': w.clockIn(); break;
      case 'ackEntity': w.ackEntity(act.arg); break;
      case 'nudgeAll': { const docs = w.entities.filter(e => e.status === 'published' && e.requiresAck); if (!docs.length) { w.toast('No published documents are awaiting acknowledgment', 'info'); } else { docs.forEach(e => w.nudgeNonAckers(e.id)); w.setRegion('documents'); } break; }
      case 'clockOut': w.clockOut(); break;
      case 'nudge': w.toast('Nudged 3 reports to submit their timesheets', 'ok'); break;
      case 'applyLeaveOn': { try { const a = JSON.parse(act.arg); w.applyLeave(a.kind, 'full', a.start, a.end, a.days); } catch { w.applyLeave('casual', 'full', 'Jul 15', 'Jul 15', 1); } w.setRegion('calendar'); w.toast('Leave request sent to Marcus', 'ok'); break; }
      case 'fileLeave': w.setRegion('calendar'); w.toast('Request sent to Marcus — you’ll hear back shortly', 'ok'); break;
      default: break;
    }
  };

  return (
    <AnimatePresence>
      {w.qOpen && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
          transition={w.reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 280, damping: 30 }}
          className="fixed right-4 top-20 bottom-28 z-40 w-[22rem] glass-elevated flex flex-col overflow-hidden"
          aria-label="Q — ambient intelligence"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-glass-edge)]">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--color-lumen)]" /><span className="font-display text-sm">Q</span><span className="text-[13px] text-[var(--color-trace)] font-mono">ambient intelligence</span></div>
            <button onClick={() => w.setQ(false)} aria-label="Close Q"><X className="w-4 h-4 text-[var(--color-mist)] hover:text-[var(--color-vapor)]" /></button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {w.qLog.length === 0 && (
              <div className="space-y-3">
                {recall && (
                  <button onClick={() => send(recall.entity ? `Tell me about ${recall.entity}` : recall.lastText)}
                    className="w-full text-left glass-soft rounded-xl p-3 hover:bg-white/10 transition-colors border border-[var(--color-lumen)]/20 flex items-start gap-3">
                    <History className="w-4 h-4 text-[var(--color-lumen)] mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-[13px] text-[var(--color-lumen)]">Pick up where you left off</span>
                      <span className="block text-sm text-[var(--color-vapor)] truncate">Last time you were looking at {recall.topic}{recall.count > 1 ? ` · revisited ${recall.count}×` : ''}</span>
                    </span>
                  </button>
                )}
                <p className="text-sm text-[var(--color-mist)]">Ask me anything about your people, time, or pay. I reshape the workspace around the answer.</p>
                <div className="space-y-3">
                  {(SUGGESTION_GROUPS[w.lens] ?? SUGGESTION_GROUPS.employee).map(g => (
                    <div key={g.label}>
                      <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-2">{g.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {g.items.map(s => <button key={s} onClick={() => send(s)} className="text-[13px] glass-soft px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left">{s}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {w.qLog.map(m => m.role === 'user' ? (
              <div key={m.id} className="flex justify-end"><div className="glass-soft px-3 py-2 text-sm max-w-[80%]">{m.text}</div></div>
            ) : (
              <div key={m.id} className="flex flex-col gap-2">
                <div className="flex gap-2"><Sparkles className="w-3.5 h-3.5 text-[var(--color-lumen)] mt-1 shrink-0" /><p className="text-sm text-[var(--color-vapor)] leading-snug">{m.text}</p></div>
                {m.viz && <div className="glass-soft p-3 ml-6">{<Viz kind={m.viz} />}</div>}
                {m.csv && (
                  <button onClick={() => downloadCsv(m.csv!.name, m.csv!.content)} className="ml-6 self-start text-[13px] px-3 py-1 rounded-full text-[var(--color-mist)] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Download className="w-3 h-3" /> {m.csv.name}
                  </button>
                )}
                {m.rationale && <RationaleDisclosure rationale={m.rationale} />}
                {m.source && (
                  <button onClick={() => w.setRegion('documents')} className="ml-6 self-start text-[13px] px-3 py-1 rounded-full text-[var(--color-trace)] hover:text-[var(--color-lumen)] border border-[var(--color-glass-edge)] transition-colors flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Source: {m.source.title}{m.source.section ? ` · ${m.source.section}` : ''}
                  </button>
                )}
                {m.action && (
                  <button onClick={() => onAction(m.action!)} className="ml-6 self-start text-[13px] px-3 py-2 rounded-full font-semibold text-[var(--color-lumen)] glass-soft hover:bg-white/10 transition-colors flex items-center gap-2">
                    {m.action.label} <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-3 border-t border-[var(--color-glass-edge)] flex items-center gap-2">
            <button onClick={mic} aria-label="Speak to Q"
              className={`w-9 h-9 grid place-items-center rounded-xl glass-soft shrink-0 ${listening ? 'text-[var(--color-coral)]' : 'text-[var(--color-mist)]'} hover:text-[var(--color-vapor)] transition-colors`}>
              <Mic className="w-4 h-4" />
            </button>
            <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(text)}
              placeholder={listening ? 'Listening…' : 'Ask Q…'} aria-label="Ask Q"
              className="flex-1 bg-transparent outline-none text-sm min-w-0" />
            <button onClick={() => send(text)} disabled={!text.trim()} aria-label="Send"
              className="w-9 h-9 grid place-items-center rounded-xl bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] disabled:opacity-30 shrink-0"><Send className="w-4 h-4" /></button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
