import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useWorkspace } from '../store';
import { Viz } from './Viz';
import { TokenFrame } from './Tokens';
import { SynthToken } from '../types';

export function SynthTokenView({ data }: { data: SynthToken }) {
  const w = useWorkspace();
  const onAction = (a: any) => { if (!a) return; if (a.kind === 'sim') w.simulate(a.arg, 'bonus'); else if (a.kind === 'region') w.setRegion(a.arg); };
  return (
    <TokenFrame id={data.id} kind="synth" placement="free" reposition spawn pos={data.pos} shape="soft" tint="halo" className="w-[268px] solid-card"
      label={data.title} onClose={() => w.dismissSynth(data.id)}>
      <div>
        <div className="flex items-center gap-2 mb-1"><Sparkles className="w-3 h-3 text-[var(--color-lumen)]" /><span className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">{data.verdict === 'combine' ? 'Combined' : 'Related'} · Q</span></div>
        <div className="font-display text-sm mb-2">{data.title}</div>
        {/* provenance seam — the two source colours, bleeding together (no overflow clip) */}
        <div className="h-1 w-full rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${data.aColor}, ${data.bColor})` }} />
        <ul className="space-y-1 text-[13px] text-[var(--color-mist)] leading-snug">{data.lines.map((l, i) => <li key={i} className="flex gap-2"><span className="text-[var(--color-trace)]">·</span>{l}</li>)}</ul>
        {data.viz && <div className="glass-soft p-3 mt-3"><Viz kind={data.viz} /></div>}
        {data.action && <button onClick={(e) => { e.stopPropagation(); onAction(data.action); }} className="mt-3 w-full py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2">{data.action.label} <ArrowUpRight className="w-3 h-3" /></button>}
        <div className="text-[13px] text-[var(--color-trace)] mt-2">Drag to Q for a full report · drag onto another token to keep combining</div>
      </div>
    </TokenFrame>
  );
}

export function PulseLayer() {
  const { pulses, dropPulse, reduced } = useWorkspace();
  const toneVar: Record<string, string> = { combine: 'lumen', relate: 'halo', reject: 'coral', q: 'lumen', ok: 'lumen' };
  const colorOf = (t: string) => `var(--color-${toneVar[t] || 'lumen'})`;
  const PARTS = [0, 1, 2, 3, 4, 5];
  return (
    <div className="fixed inset-0 pointer-events-none z-[85]">
      <AnimatePresence>
        {pulses.map(p => {
          const c = colorOf(p.tone);
          return (
            <span key={p.id} className="absolute" style={{ left: p.x, top: p.y }}>
              {/* soft flash — fades in, no sharp edge */}
              <motion.span initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: reduced ? 1 : 2.4, opacity: [0, 0.4, 0] }}
                transition={{ duration: reduced ? 0.25 : 0.5, ease: 'easeOut', times: [0, 0.25, 1] }} onAnimationComplete={() => dropPulse(p.id)}
                className="absolute rounded-full" style={{ left: -34, top: -34, width: 68, height: 68, background: `radial-gradient(circle, ${c} 0%, transparent 68%)` }} />
              {/* ring 1 */}
              <motion.span initial={{ scale: 0.15, opacity: 0 }} animate={{ scale: reduced ? 1 : 3, opacity: [0, 0.7, 0] }}
                transition={{ duration: reduced ? 0.25 : 0.6, ease: 'easeOut', times: [0, 0.2, 1] }}
                className="absolute rounded-full" style={{ left: -24, top: -24, width: 48, height: 48, border: `2px solid ${c}` }} />
              {/* ring 2, delayed */}
              {!reduced && <motion.span initial={{ scale: 0.15, opacity: 0 }} animate={{ scale: 2.2, opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.09, times: [0, 0.2, 1] }}
                className="absolute rounded-full" style={{ left: -16, top: -16, width: 32, height: 32, border: `1.5px solid ${c}` }} />}
              {/* particles fly outward */}
              {!reduced && PARTS.map(i => { const a = (Math.PI * 2 / PARTS.length) * i - 0.4; const d = 30 + (i % 2) * 8; return (
                <motion.span key={i} initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.35 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute rounded-full" style={{ left: -2.5, top: -2.5, width: 5, height: 5, background: c }} />); })}
            </span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
