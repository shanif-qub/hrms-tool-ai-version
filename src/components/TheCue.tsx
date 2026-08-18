import { useRef, useState, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, ArrowUp } from 'lucide-react';
import { useWorkspace } from '../store';
import { SUGGESTION_GROUPS } from '../data';
import { registerZone, clearZone } from '../dropzone';
import { sfx } from '../sound';
import QOrb, { OrbMood } from './QOrb';
import { useSpeech } from '../useSpeech';

export default function TheCue() {
  const w = useWorkspace();
  const { runIntent, intentEcho, setQ, toast, dragging, qHover, qMood, people, payslips } = w;
  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const speech = useSpeech(
    (t, final) => { setText(t); if (final && t.trim()) { const v = t.trim(); runIntent(v); setTimeout(() => setText(''), 20); } },
    (m) => toast(m, 'warn'),
  );
  const barRef = useRef<HTMLDivElement>(null);
  const HINTS: Record<string, string[]> = {
    employee: ['Tell Q what you need…', 'Try “book leave Aug 3–5”', 'Try “show my hours this month”', 'Search: type a name or policy'],
    manager: ['Tell Q what you need…', 'Try “approve Sarah’s leave”', 'Try “what needs my attention?”', 'Search: type a teammate’s name', 'Try “auto-assign coverage”'],
    hr: ['Tell Q what you need…', 'Try “what needs my attention?”', 'Search: type anyone’s name', 'Try “open the pay run”'],
  };
  const [hintIx, setHintIx] = useState(0);
  useEffect(() => { const t = setInterval(() => setHintIx(i => i + 1), 4200); return () => clearInterval(t); }, []);
  const hints = HINTS[w.lens] ?? HINTS.employee;
  const placeholder = focus || text ? 'Tell Q what you need…' : hints[hintIx % hints.length];

  useEffect(() => {
    const reg = () => registerZone('cue', barRef.current, 'q');
    reg(); window.addEventListener('resize', reg);
    return () => { window.removeEventListener('resize', reg); clearZone('cue'); };
  }, []);
  useEffect(() => { if (!dragging) return; const reg = () => registerZone('cue', barRef.current, 'q'); reg(); const iv = setInterval(reg, 200); return () => clearInterval(iv); }, [dragging]);

  const anomalies = payslips.some(p => p.status === 'pooled') || people.some(p => p.status === 'flight_risk');
  const mood: OrbMood = speech.listening ? 'listen' : qMood === 'thinking' ? 'think' : qMood === 'answering' ? 'answer' : (anomalies ? 'alert' : 'idle');

  const submit = () => { if (text.trim()) { runIntent(text.trim()); setText(''); } };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') submit(); };
  const mic = () => { if (speech.listening) sfx.hover(); speech.toggle(); };

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-[min(660px,92vw)]">
      <AnimatePresence>
        {dragging && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-2 text-[13px] font-mono flex items-center gap-2 ${qHover === 'release' ? 'text-[var(--color-lumen)]' : 'text-[var(--color-mist)]'}`}><Sparkles className="w-3 h-3" /> {qHover === 'release' ? 'Release to ask Q' : 'Drag here to ask Q about it'}</motion.div>}
        {!dragging && intentEcho && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mb-2 text-[13px] font-mono text-[var(--color-lumen)] flex items-center gap-2 max-w-full truncate"><Sparkles className="w-3 h-3 shrink-0" /> {intentEcho}</motion.div>}
      </AnimatePresence>

      <div className="relative w-full">
        <AnimatePresence>
          {focus && !text && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full mb-2 left-0 right-0 glass-elevated p-3 max-h-[46vh] overflow-y-auto panel-scroll space-y-3">
              {(SUGGESTION_GROUPS[w.lens] ?? SUGGESTION_GROUPS.employee).map(g => (
                <div key={g.label}>
                  <div className="text-[13px] uppercase tracking-widest text-[var(--color-trace)] mb-2 px-0.5">{g.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map(s => <button key={s} onMouseDown={() => runIntent(s)} className="text-[13px] glass-soft px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-left">{s}</button>)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={barRef} id="q-cue-bar" className={`glass-panel flex items-center gap-1 pl-2 pr-2 py-2 transition-all duration-200 ${dragging ? (qHover === 'release' ? 'drop-release' : 'drop-ready') : ''}`} style={{ borderRadius: 999 }}>
          <button onClick={mic} aria-label="Speak intent" className={`w-9 h-9 grid place-items-center rounded-full shrink-0 transition-colors ${speech.listening ? 'text-[var(--color-halo-text)] bg-[var(--color-lumen-soft)]' : 'text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}><Mic className="w-4 h-4" /></button>
          <input id="cue-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder={placeholder} aria-label="The Cue" className="flex-1 bg-transparent outline-none font-display text-base placeholder:text-[var(--color-trace)] min-w-0 px-2" />
          <AnimatePresence>
            {text.trim() && <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} onClick={submit} aria-label="Send" className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors shrink-0"><ArrowUp className="w-4 h-4" /></motion.button>}
          </AnimatePresence>
          <span className="w-px h-6 bg-[var(--color-glass-edge)] mx-0.5" />
          {/* Q orb — docked on the right of the bar */}
          <QOrb mood={mood} size={48} onClick={() => setQ(!w.qOpen)} />
        </div>
      </div>
    </div>
  );
}
