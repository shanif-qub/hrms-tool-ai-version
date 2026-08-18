import { motion } from 'motion/react';
import { LogIn, Star, ArrowLeftRight, TrendingUp, IndianRupee, Heart } from 'lucide-react';
import { ReactNode } from 'react';
import { useWorkspace } from '../store';
import { JOURNEY } from '../data';

const ICON: Record<string, ReactNode> = {
  join: <LogIn className="w-4 h-4" />, milestone: <Star className="w-4 h-4" />, transfer: <ArrowLeftRight className="w-4 h-4" />,
  promotion: <TrendingUp className="w-4 h-4" />, comp: <IndianRupee className="w-4 h-4" />, kudos: <Heart className="w-4 h-4" />,
};
const COLOR: Record<string, string> = {
  join: 'var(--color-lumen)', milestone: 'var(--color-blue)', transfer: 'var(--color-halo)',
  promotion: 'var(--color-lumen)', comp: 'var(--color-ember)', kudos: 'var(--color-coral)',
};

// Full timeline — used inside the Growth region's Journey tab
export function JourneyTimeline() {
  const { reduced } = useWorkspace();
  return (
    <div className="relative pl-8">
      <span className="absolute left-[13px] top-1 bottom-1 w-px bg-[var(--color-glass-edge)]" aria-hidden />
      <div className="space-y-6">
        {JOURNEY.map((e, i) => (
          <motion.div key={e.id} initial={reduced ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
            <span className="absolute -left-8 top-0 w-7 h-7 rounded-full grid place-items-center border border-[var(--color-glass-edge)] bg-[var(--color-abyss)]" style={{ color: COLOR[e.kind] }}>{ICON[e.kind]}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] font-semibold text-[var(--color-vapor)]">{e.title}</span>
              <span className="text-[13px] font-mono text-[var(--color-trace)]">{e.date}</span>
            </div>
            <p className="text-[13px] text-[var(--color-mist)] mt-1 leading-snug">{e.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Compact preview — used in the Growth node's peel layer
export function JourneyMini() {
  const recent = JOURNEY.slice(-3).reverse();
  return (
    <div className="space-y-3">
      {recent.map(e => (
        <div key={e.id} className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5" style={{ color: COLOR[e.kind], background: `color-mix(in srgb, ${COLOR[e.kind]} 14%, transparent)` }}>{ICON[e.kind]}</span>
          <div className="min-w-0">
            <div className="text-[13px] text-[var(--color-vapor)] leading-tight">{e.title}</div>
            <div className="text-[13px] font-mono text-[var(--color-trace)]">{e.date}</div>
          </div>
        </div>
      ))}
      <div className="text-[13px] text-[var(--color-trace)]">Open Growth → Journey for the full timeline.</div>
    </div>
  );
}
