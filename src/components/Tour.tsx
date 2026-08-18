import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useWorkspace } from '../store';

type Place = 'center' | 'bottom' | 'bottomLeft' | 'top';
interface Step { title: string; body: string; place: Place; spot?: { x: number; y: number } }

const STEPS: Record<string, Step[]> = {
  employee: [
    { title: 'Welcome to Qubryx One', body: 'This is your workspace — everything you need orbits around you. Here’s a 20-second tour.', place: 'center' },
    { title: 'Ask Q anything', body: 'Tap the glowing centre to ask Q about your day, or get a quick read in plain language.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'Your spheres', body: 'Each orb opens a part of your world — time, pay, documents, growth. Tap to dive in.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'The Now', body: 'Signals gather on the left — nudges, approvals, things that need you. They surface; you don’t hunt.', place: 'bottomLeft', spot: { x: 15, y: 42 } },
    { title: 'The Cue', body: 'Type or speak at the bar below. Try “apply for leave on Friday” — Q understands and acts.', place: 'bottom', spot: { x: 50, y: 92 } },
  ],
  manager: [
    { title: 'Welcome to Qubryx One', body: 'Your team, in one calm surface. A quick 20-second tour of My Team.', place: 'center' },
    { title: 'Ask Q about your team', body: 'Tap the centre for a read on risk, coverage and what needs you today.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'Approvals as an inbox', body: 'The Approvals sphere is a real inbox — batch-approve, hold for later, or delegate while you’re away.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'Canvas', body: 'Describe a tool and Q builds it live from your team’s data — then send it to Now or Insights.', place: 'bottom', spot: { x: 50, y: 88 } },
    { title: 'The Cue', body: 'Type or speak below. Try “approve Sarah’s leave” or “simulate a retention move”.', place: 'bottom', spot: { x: 50, y: 92 } },
  ],
  hr: [
    { title: 'Welcome to Qubryx One', body: 'The whole org at a glance. A quick 20-second tour of The Org.', place: 'center' },
    { title: 'Ask Q about the org', body: 'Tap the centre for a read on payroll, onboarding and org-wide signals.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'Policies & documents', body: 'Author once, choose the audience, publish — it lands in the right people’s world and Q can cite it.', place: 'center', spot: { x: 50, y: 47 } },
    { title: 'The Cue', body: 'Type or speak below to ask Q anything across the org.', place: 'bottom', spot: { x: 50, y: 92 } },
  ],
};

const PLACE_CLASS: Record<Place, string> = {
  center: 'items-center justify-center',
  bottom: 'items-end justify-center pb-28',
  bottomLeft: 'items-end justify-start pb-28 pl-8',
  top: 'items-start justify-center pt-24',
};

export default function Tour() {
  const w = useWorkspace();
  const steps = STEPS[w.lens] ?? STEPS.employee;
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;
  const finish = () => w.setTour(false);

  return (
    <AnimatePresence>
      {w.showTour && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90]">
          {/* dim */}
          <div className="absolute inset-0 bg-[var(--color-abyss)]/72 backdrop-blur-[2px]" onClick={finish} />
          {/* spotlight ring */}
          {step.spot && (
            <motion.div key={`spot${i}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute pointer-events-none"
              style={{ left: `${step.spot.x}%`, top: `${step.spot.y}%`, transform: 'translate(-50%,-50%)' }}>
              <span className="block w-24 h-24 rounded-full" style={{ boxShadow: '0 0 0 3px var(--color-lumen), 0 0 40px 8px color-mix(in srgb, var(--color-lumen) 55%, transparent)' }} />
              <span className="absolute inset-0 rounded-full animate-ping" style={{ boxShadow: '0 0 0 2px var(--color-lumen)' }} />
            </motion.div>
          )}
          {/* card */}
          <div className={`absolute inset-0 flex ${PLACE_CLASS[step.place]} pointer-events-none`}>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                className="pointer-events-auto w-[min(400px,92vw)] glass-elevated p-5" style={{ borderRadius: 22 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl grid place-items-center brand-gradient-btn text-white"><Sparkles className="w-4 h-4" /></span>
                  <span className="text-[12px] uppercase tracking-widest text-[var(--color-trace)]">Tour · {i + 1} of {steps.length}</span>
                  <button onClick={finish} aria-label="Skip tour" className="ml-auto w-7 h-7 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)]"><X className="w-4 h-4" /></button>
                </div>
                <h3 className="text-lg font-display font-semibold tracking-tight text-[var(--color-vapor)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-mist)] mt-2 leading-relaxed">{step.body}</p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    {steps.map((_, k) => <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 18 : 6, background: k === i ? 'var(--color-lumen)' : 'rgba(255,255,255,0.2)' }} />)}
                  </div>
                  <span className="flex-1" />
                  {i > 0 && <button onClick={() => setI(v => v - 1)} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>}
                  {last
                    ? <button onClick={() => { finish(); w.setLegend(true); }} className="text-[13px] px-4 py-2 rounded-full font-semibold brand-gradient-btn text-white hover:brightness-110 transition">See all gestures</button>
                    : <button onClick={() => setI(v => v + 1)} className="text-[13px] px-4 py-2 rounded-full font-semibold brand-gradient-btn text-white hover:brightness-110 transition flex items-center gap-1">Next <ArrowRight className="w-3.5 h-3.5" /></button>}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
