import { useWorkspace } from '../store';

// Self-contained SVG wallpapers under the fluid gradient. Theme-neutral colours and
// moderate opacity so each reads on BOTH light and dark. All are subtly animated
// (aurora glow, drifting waves, falling rain, breathing warm mesh); animation only
// runs when the container has `.wp-animate` (added when motion is on).

export const WALLPAPERS: { id: string; label: string; warm?: boolean }[] = [
  { id: 'none', label: 'None' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'waves', label: 'Waves' },
  { id: 'rain', label: 'Rainfall' },
  { id: 'dawn', label: 'Dawn', warm: true },
  { id: 'ember', label: 'Ember', warm: true },
];

// deterministic pseudo-random for rain streaks
const rnd = (i: number, m: number) => ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1 * m;

export function WallpaperArt({ id }: { id: string }) {
  if (id === 'none' || !id) return null;
  const box = { className: 'absolute inset-0 w-full h-full', preserveAspectRatio: 'xMidYMid slice' as const, viewBox: '0 0 1200 800', xmlns: 'http://www.w3.org/2000/svg' };

  if (id === 'aurora') return (
    <svg {...box}>
      <defs>
        <linearGradient id="wp-au-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3575C7" stopOpacity="0.16" /><stop offset="100%" stopColor="#6A3DFF" stopOpacity="0.05" /></linearGradient>
        <linearGradient id="wp-au1" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0%" stopColor="#52D0DD" stopOpacity="0" /><stop offset="50%" stopColor="#52D0DD" stopOpacity="0.55" /><stop offset="100%" stopColor="#6A3DFF" stopOpacity="0" /></linearGradient>
        <linearGradient id="wp-au2" x1="0" y1="0" x2="1" y2="-0.3"><stop offset="0%" stopColor="#6A3DFF" stopOpacity="0" /><stop offset="55%" stopColor="#6A3DFF" stopOpacity="0.5" /><stop offset="100%" stopColor="#3575C7" stopOpacity="0" /></linearGradient>
        <filter id="wp-au-blur"><feGaussianBlur stdDeviation="34" /></filter>
      </defs>
      <rect width="1200" height="800" fill="url(#wp-au-base)" />
      <g filter="url(#wp-au-blur)">
        <path className="wp-drift wp-glow" d="M-100 300 Q 300 180 600 300 T 1300 300 L1300 430 Q 900 320 600 430 T -100 430 Z" fill="url(#wp-au1)" />
        <path className="wp-drift-2 wp-glow-2" d="M-100 460 Q 350 360 700 470 T 1300 450 L1300 560 Q 800 470 400 560 T -100 540 Z" fill="url(#wp-au2)" />
      </g>
    </svg>
  );

  if (id === 'waves') return (
    <svg {...box}>
      <defs><linearGradient id="wp-wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#52D0DD" stopOpacity="0.14" /><stop offset="100%" stopColor="#3575C7" stopOpacity="0.06" /></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#wp-wv)" />
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i} className={`wp-sway wp-sway-${i % 3}`} d={`M-100 ${300 + i * 95} Q 300 ${250 + i * 95} 600 ${300 + i * 95} T 1300 ${300 + i * 95} L1300 900 L-100 900 Z`}
          fill="#52D0DD" opacity={0.05 + i * 0.025} />
      ))}
    </svg>
  );

  if (id === 'rain') return (
    <svg {...box}>
      <defs><linearGradient id="wp-rn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3575C7" stopOpacity="0.12" /><stop offset="100%" stopColor="#124a54" stopOpacity="0.06" /></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#wp-rn)" />
      <g className="wp-rain" stroke="#7fdce6" strokeWidth="1.3" strokeLinecap="round" opacity="0.16">
        {Array.from({ length: 24 }).map((_, i) => { const x = rnd(i + 1, 1200); const y = rnd(i + 9, 1600) - 800; const len = 16 + rnd(i + 3, 26); return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + len} />; })}
      </g>
      <g className="wp-ripple" fill="none" stroke="#7fdce6" strokeOpacity="0.16">
        {[[300, 640], [860, 560], [620, 700]].map(([cx, cy], i) => <circle key={i} className={`wp-ripple-${i}`} cx={cx} cy={cy} r="10" />)}
      </g>
    </svg>
  );

  if (id === 'dawn') return (
    <svg {...box}>
      <defs>
        <linearGradient id="wp-dw-base" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0%" stopColor="#FFD9A8" stopOpacity="0.28" /><stop offset="55%" stopColor="#FFB0C4" stopOpacity="0.14" /><stop offset="100%" stopColor="#C79BE0" stopOpacity="0.1" /></linearGradient>
        <filter id="wp-dw-blur"><feGaussianBlur stdDeviation="70" /></filter>
      </defs>
      <rect width="1200" height="800" fill="url(#wp-dw-base)" />
      <g filter="url(#wp-dw-blur)">
        <circle className="wp-breathe wp-drift" cx="260" cy="220" r="300" fill="#FFC48A" opacity="0.5" />
        <circle className="wp-breathe-2 wp-drift-2" cx="920" cy="300" r="320" fill="#FF9FB6" opacity="0.42" />
        <circle className="wp-breathe wp-drift-2" cx="640" cy="720" r="300" fill="#E4A9E0" opacity="0.34" />
      </g>
    </svg>
  );

  if (id === 'ember') return (
    <svg {...box}>
      <defs>
        <linearGradient id="wp-em-base" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#F2C879" stopOpacity="0.24" /><stop offset="60%" stopColor="#E09E6A" stopOpacity="0.14" /><stop offset="100%" stopColor="#C96F53" stopOpacity="0.1" /></linearGradient>
        <filter id="wp-em-blur"><feGaussianBlur stdDeviation="72" /></filter>
      </defs>
      <rect width="1200" height="800" fill="url(#wp-em-base)" />
      <g filter="url(#wp-em-blur)">
        <circle className="wp-breathe wp-drift-2" cx="300" cy="620" r="320" fill="#E9A05E" opacity="0.46" />
        <circle className="wp-breathe-2 wp-drift" cx="900" cy="240" r="300" fill="#D97757" opacity="0.4" />
        <circle className="wp-breathe wp-drift" cx="640" cy="440" r="260" fill="#F2C879" opacity="0.3" />
      </g>
    </svg>
  );

  return null;
}

export default function Wallpaper({ id }: { id: string }) {
  const { reduced } = useWorkspace();
  if (id === 'none' || !id) return null;
  return (
    <div className={`fixed inset-0 -z-10 pointer-events-none ${reduced ? '' : 'wp-animate'}`} aria-hidden>
      <WallpaperArt id={id} />
    </div>
  );
}
