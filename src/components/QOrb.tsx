import { motion } from 'motion/react';
import { useWorkspace } from '../store';

export type OrbMood = 'idle' | 'listen' | 'think' | 'answer' | 'alert';

// flowing sine wave path, 2x width so it loops seamlessly when translated by -100
function wavePath(amp: number, midY: number, cycles: number) {
  const w = 200, steps = 48, pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = midY + amp * Math.sin((i / steps) * cycles * 2 * Math.PI);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

const DUR: Record<OrbMood, number> = { idle: 4.2, listen: 1.1, think: 0.85, answer: 1.0, alert: 2.4 };
const AMP: Record<OrbMood, number> = { idle: 7, listen: 13, think: 11, answer: 12, alert: 9 };

export default function QOrb({ mood = 'idle', size = 48, onClick }: { mood?: OrbMood; size?: number; onClick?: () => void }) {
  const { reduced } = useWorkspace();
  const amp = AMP[mood];
  const front = wavePath(amp, 50, 4);
  const back = wavePath(amp * 0.7, 54, 4);

  return (
    <button onClick={onClick} aria-label="Open Q assistant" className="relative grid place-items-center rounded-full shrink-0" style={{ width: size, height: size }}>
      {!reduced && <span aria-hidden className="brand-ring absolute rounded-full" style={{ inset: -2, animation: 'orbRingSpin 5s linear infinite', filter: 'blur(0.5px)' }} />}
      <span aria-hidden className="absolute rounded-full" style={{ inset: -5, background: `radial-gradient(circle, ${mood === 'alert' ? 'var(--color-ember)' : 'var(--color-lumen)'}, transparent 70%)`, opacity: 0.5, filter: 'blur(7px)' }} />
      {/* gradient body (2-stop, brand) */}
      <span className="relative rounded-full grid place-items-center overflow-hidden" style={{ width: size, height: size, background: 'linear-gradient(140deg, var(--color-blue), var(--color-halo))', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -7px 14px rgba(0,0,0,0.4)' }}>
        <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 32%, rgba(82,208,221,0.55), transparent 60%)' }} />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <motion.g animate={reduced ? undefined : { x: [0, -100] }} transition={{ duration: DUR[mood], repeat: Infinity, ease: 'linear' }}>
            <path d={back} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3.5" strokeLinecap="round" />
            <path d={front} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="3.5" strokeLinecap="round" />
          </motion.g>
        </svg>
      </span>
    </button>
  );
}
