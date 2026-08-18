import { useEffect, useState } from 'react';
import { useWorkspace } from '../store';
import { sfx } from '../sound';

// Living background: a soft 3-colour fluid (a→c gradient, colour b drifting TL⇄BR),
// given a wavy texture by SVG turbulence. Sits BELOW content. Clicking empty surface
// makes one soft water ripple (+ a gentle drop sound). When a wallpaper is chosen the
// fluid steps back so the wallpaper reads through it.
export default function FluidField() {
  const { reduced, wallpaper } = useWorkspace();
  const [rips, setRips] = useState<{ id: number; x: number; y: number }[]>([]);
  const hasWall = wallpaper && wallpaper !== 'none';

  useEffect(() => {
    let last = 0;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('button, a, input, textarea, select, [role="button"], .glass-panel, .glass-elevated, .glass-soft, .island, .hub-disc')) return;
      const now = Date.now(); if (now - last < 160) return; last = now;
      sfx.droplet();
      if (reduced) return;
      const id = now + Math.random();
      setRips(r => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRips(r => r.filter(p => p.id !== id)), 1400);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [reduced]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-[5]">
      <svg className="fluid-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden style={hasWall ? { opacity: 0.3 } : undefined}>
        <defs>
          <linearGradient id="fA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--fluid-a)" />
            <stop offset="100%" stopColor="var(--fluid-c)" />
          </linearGradient>
          <radialGradient id="fB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--fluid-b)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--fluid-b)" stopOpacity="0" />
          </radialGradient>
          <filter id="fWarp" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013 0.017" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#fWarp)">
          <rect x="-12" y="-12" width="124" height="124" fill="url(#fA)" />
          <ellipse rx="48" ry="48" fill="url(#fB)" cx={reduced ? 50 : undefined} cy={reduced ? 50 : undefined}>
            {!reduced && <>
              <animate attributeName="cx" dur="28s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" values="26;76;26" />
              <animate attributeName="cy" dur="28s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" values="24;80;24" />
            </>}
          </ellipse>
        </g>
      </svg>
      {rips.map(r => (
        <span key={r.id} className="water-ring" style={{ left: r.x - 130, top: r.y - 130, width: 260, height: 260, animation: 'waterRing 1.4s ease-out forwards' }} />
      ))}
    </div>
  );
}
