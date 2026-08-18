import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, ReactNode } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { WallpaperArt } from './Wallpaper';
import logo from '../assets/qub-logo.png';

/** Original Qubryx One product mark — an orbit: one centre, everything revolving around you. */
function QubryxOneMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="q1-grad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#52D0DD" /><stop offset="52%" stopColor="#3575C7" /><stop offset="100%" stopColor="#6A3DFF" />
        </linearGradient>
        <radialGradient id="q1-core" cx="40%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8fe3ec" /><stop offset="55%" stopColor="#52D0DD" /><stop offset="100%" stopColor="#3575C7" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="32" rx="29" ry="29" stroke="url(#q1-grad)" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="url(#q1-grad)" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="118 20" transform="rotate(-32 32 32)" />
      <g style={typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? { transformOrigin: '32px 32px' } : { transformOrigin: '32px 32px', animation: 'hubSpin 16s linear infinite' }}><circle cx="54" cy="32" r="4.2" fill="url(#q1-grad)" /></g>
      <circle cx="32" cy="32" r="11.5" fill="url(#q1-core)" />
      <circle cx="28" cy="28" r="3.4" fill="#ffffff" fillOpacity="0.55" />
    </svg>
  );
}

/* --- in-product showcase visuals (original, on-brand — no stock photos), sized 300x172 --- */
const ART_DEFS = (
  <defs>
    <linearGradient id="lg-brand" x1="0" y1="0" x2="300" y2="172" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#52D0DD" /><stop offset="100%" stopColor="#6A3DFF" />
    </linearGradient>
    <linearGradient id="lg-bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#3575C7" /><stop offset="100%" stopColor="#52D0DD" /></linearGradient>
    <linearGradient id="lg-ember" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#B4453F" /><stop offset="100%" stopColor="#FF6B6B" /></linearGradient>
    <radialGradient id="lg-node" cx="35%" cy="30%" r="80%"><stop offset="0%" stopColor="rgba(143,227,236,0.55)" /><stop offset="100%" stopColor="rgba(82,208,221,0.08)" /></radialGradient>
    <radialGradient id="lg-halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(106,61,255,0.5)" /><stop offset="100%" stopColor="rgba(106,61,255,0)" /></radialGradient>
  </defs>
);
const INITIALS = ['SJ', 'DC', 'ER', 'PN', 'AM', 'MV'];

// Respect reduced-motion for the SVG scenes: SMIL <animate> and CSS ring spins
// are only emitted when the OS setting allows motion.
const MOTION = typeof window === 'undefined' ? true : !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const spin = (dur: string, reverse = false) => MOTION ? { transformOrigin: '150px 86px', animation: `hubSpin ${dur} linear infinite${reverse ? ' reverse' : ''}` } : { transformOrigin: '150px 86px' };
function A(props: React.SVGProps<SVGAnimateElement>) { return MOTION ? <animate {...props} /> : null; }

function ArtOrbit() {
  const nodes: [number, number, string][] = [[54, 86, 'SJ'], [150, 26, 'DC'], [246, 86, 'ER'], [150, 146, 'PN'], [88, 136, 'AM'], [212, 36, 'MV']];
  return (
    <svg viewBox="0 0 300 172" className="w-full h-full" aria-hidden>
      {ART_DEFS}
      <circle cx="150" cy="86" r="70" fill="url(#lg-halo)" opacity="0.6" />
      <g style={spin('30s')}>
        <ellipse cx="150" cy="86" rx="112" ry="66" fill="none" stroke="#52D0DD" strokeOpacity="0.3" strokeDasharray="2 8" strokeLinecap="round" />
      </g>
      <g style={spin('44s', true)}>
        <ellipse cx="150" cy="86" rx="88" ry="50" fill="none" stroke="#6A3DFF" strokeOpacity="0.24" strokeDasharray="1 10" strokeLinecap="round" />
      </g>
      {nodes.map(([x, y, ini], k) => (
        <g key={k}>
          <line x1="150" y1="86" x2={x} y2={y} stroke="url(#lg-brand)" strokeOpacity="0.18" />
          <circle cx={x} cy={y} r="15" fill="url(#lg-node)" stroke="#52D0DD" strokeOpacity="0.55" />
          <text x={x} y={y + 3.5} textAnchor="middle" fill="#c9e9ef" fontSize="9" fontFamily="Outfit" fontWeight="600">{ini}</text>
        </g>
      ))}
      <circle cx="150" cy="86" r="30" fill="none" stroke="#8fe3ec" strokeOpacity="0.35">
        <A attributeName="r" values="27;33;27" dur="4s" repeatCount="indefinite" /><A attributeName="stroke-opacity" values="0.35;0.1;0.35" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="86" r="25" fill="url(#q1-core)" />
      <circle cx="142" cy="78" r="6" fill="#fff" fillOpacity="0.5" />
      <text x="150" y="90" textAnchor="middle" fill="#06222b" fontSize="11" fontFamily="Outfit" fontWeight="700">you</text>
    </svg>
  );
}
function ArtCopilot() {
  return (
    <svg viewBox="0 0 300 172" className="w-full h-full" aria-hidden>
      {ART_DEFS}
      <rect x="22" y="20" width="188" height="32" rx="16" fill="rgba(255,255,255,0.07)" stroke="#52D0DD" strokeOpacity="0.35" />
      {[0, 1, 2, 3, 4].map(k => (
        <rect key={k} x={34 + k * 5} y={30} width="2.5" rx="1.25" height="12" fill="#52D0DD" opacity="0.8">
          <A attributeName="height" values={`${5 + (k % 3) * 3};14;${5 + (k % 3) * 3}`} dur={`${0.9 + k * 0.12}s`} repeatCount="indefinite" />
          <A attributeName="y" values={`${41 - (5 + (k % 3) * 3)};28;${41 - (5 + (k % 3) * 3)}`} dur={`${0.9 + k * 0.12}s`} repeatCount="indefinite" />
        </rect>
      ))}
      <text x="68" y="40" fill="#c9d6e5" fontSize="12.5" fontFamily="Outfit">“Book leave Aug 3–5”</text>
      <rect x="70" y="66" width="208" height="62" rx="16" fill="rgba(106,61,255,0.15)" stroke="url(#lg-brand)" strokeOpacity="0.5" />
      <text x="86" y="88" fill="#e7ecf3" fontSize="12" fontFamily="Outfit">Drafted 3 days of casual leave.</text>
      <text x="86" y="105" fill="#9fb0c4" fontSize="11" fontFamily="Outfit">Fits team coverage — no conflicts.</text>
      <rect x="86" y="112" width="118" height="1.5" rx="0.75" fill="#52D0DD" opacity="0.35" />
      <rect x="130" y="138" width="150" height="24" rx="12" fill="rgba(82,208,221,0.16)" stroke="#52D0DD" strokeOpacity="0.5" />
      <text x="205" y="154" fill="#8fe3ec" fontSize="11" fontFamily="Outfit" textAnchor="middle">Confirm → send to Marcus</text>
      <circle cx="42" cy="150" r="13" fill="url(#q1-core)">
        <A attributeName="r" values="13;14.2;13" dur="2.6s" repeatCount="indefinite" />
      </circle>
      {[0, 1, 2].map(k => (
        <circle key={k} cx={66 + k * 10} cy="150" r="2.6" fill="#8fe3ec">
          <A attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${k * 0.22}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
function ArtCanvas() {
  const bars = [58, 92, 74, 40, 66];
  return (
    <svg viewBox="0 0 300 172" className="w-full h-full" aria-hidden>
      {ART_DEFS}
      <rect x="18" y="14" width="264" height="144" rx="16" fill="rgba(255,255,255,0.04)" stroke="#52D0DD" strokeOpacity="0.25" />
      <text x="34" y="38" fill="#8fe3ec" fontSize="11" fontFamily="Outfit">“bar chart design 12 · eng 18 · product 9”</text>
      <rect x="216" y="46" width="54" height="15" rx="7.5" fill="rgba(82,208,221,0.15)" stroke="#52D0DD" strokeOpacity="0.4" />
      <text x="224" y="57" fill="#8fe3ec" fontSize="8.5" fontFamily="Outfit">your data</text>
      {bars.map((h, k) => (
        <g key={k}>
          <rect x={36 + k * 30} y={140 - h} width="18" height={h} rx="4" fill={k === 1 ? 'url(#lg-ember)' : 'url(#lg-bar)'} opacity="0.92">
            <A attributeName="height" values={`0;${h}`} dur="0.9s" begin={`${0.15 + k * 0.12}s`} fill="freeze" keySplines="0.2 0.8 0.2 1" calcMode="spline" keyTimes="0;1" />
            <A attributeName="y" values={`140;${140 - h}`} dur="0.9s" begin={`${0.15 + k * 0.12}s`} fill="freeze" keySplines="0.2 0.8 0.2 1" calcMode="spline" keyTimes="0;1" />
          </rect>
        </g>
      ))}
      <line x1="34" y1="140" x2="196" y2="140" stroke="#52D0DD" strokeOpacity="0.3" />
      <path d="M216 128 A26 26 0 0 1 268 128" stroke="rgba(255,255,255,0.12)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M216 128 A26 26 0 0 1 258 106" stroke="url(#lg-brand)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <text x="242" y="126" textAnchor="middle" fill="#e7ecf3" fontSize="13" fontFamily="Outfit" fontWeight="600">75%</text>
      <polyline points="216,88 228,80 238,84 250,72 262,76 272,64" fill="none" stroke="#52D0DD" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
function ArtTeam() {
  return (
    <svg viewBox="0 0 300 172" className="w-full h-full" aria-hidden>
      {ART_DEFS}
      {INITIALS.map((ini, k) => (
        <g key={k}>
          <circle cx={42 + k * 30} cy="38" r="14" fill="url(#lg-node)" stroke="#52D0DD" strokeOpacity="0.5" />
          <text x={42 + k * 30} y="42" textAnchor="middle" fill="#c9e9ef" fontSize="9" fontFamily="Outfit" fontWeight="600">{ini}</text>
          <circle cx={52 + k * 30} cy="28" r="3" fill={k === 0 ? '#FF6B6B' : k === 2 ? '#FFB454' : '#52D0DD'} stroke="rgba(6,10,20,0.8)" strokeWidth="1.2" />
        </g>
      ))}
      <rect x="28" y="70" width="122" height="80" rx="14" fill="rgba(255,255,255,0.05)" stroke="#52D0DD" strokeOpacity="0.25" />
      <text x="44" y="92" fill="#8fe3ec" fontSize="10.5" fontFamily="Outfit">PRESENT TODAY</text>
      <text x="44" y="118" fill="#e7ecf3" fontSize="22" fontFamily="Outfit" fontWeight="600">4 / 5</text>
      <polyline points="44,138 58,132 72,136 86,128 100,131 114,124 132,127" fill="none" stroke="#52D0DD" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <rect x="162" y="70" width="112" height="80" rx="14" fill="rgba(106,61,255,0.13)" stroke="#6A3DFF" strokeOpacity="0.35" />
      <text x="178" y="92" fill="#b9a6ff" fontSize="10.5" fontFamily="Outfit">APPROVALS</text>
      <text x="178" y="118" fill="#e7ecf3" fontSize="22" fontFamily="Outfit" fontWeight="600">3</text>
      <circle cx="252" cy="112" r="5" fill="#FF6B6B"><A attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" /></circle>
      <text x="178" y="138" fill="#FFB454" fontSize="10.5" fontFamily="Outfit">1 breaches SLA in 2h</text>
    </svg>
  );
}

const SLIDES = [
  { art: <ArtOrbit />, accent: '#52D0DD', kicker: 'Ambient workspace', title: 'Your day, in orbit', sub: 'Everything that matters revolves around you — no menus, no digging.' },
  { art: <ArtCopilot />, accent: '#6A3DFF', kicker: 'Q, your copilot', title: 'Ask, and it’s done', sub: 'Type or speak in plain language. Q understands the intent and acts.' },
  { art: <ArtCanvas />, accent: '#3575C7', kicker: 'Canvas', title: 'Describe a tool, see it built', sub: 'Turn a sentence into a live view of your team’s data in seconds.' },
  { art: <ArtTeam />, accent: '#52D0DD', kicker: 'My Team', title: 'Lead with foresight', sub: 'Risk, coverage and approvals — surfaced before you think to ask.' },
];

function Frame({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-8 blur-3xl opacity-50 pointer-events-none" style={{ background: `radial-gradient(58% 58% at 50% 42%, ${accent}, transparent 72%)` }} />
      <motion.div animate={{ y: [0, -7, 0] }} whileHover={{ scale: 1.015 }} transition={{ y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 260, damping: 20 } }}
        className="relative p-px shadow-[0_34px_80px_-24px_rgba(0,0,0,0.65)]" style={{ borderRadius: 21, background: `linear-gradient(140deg, ${accent}66, rgba(255,255,255,0.10) 40%, rgba(106,61,255,0.35))` }}>
        <div className="glass-elevated p-3 relative overflow-hidden" style={{ borderRadius: 20 }}>
          <div className="absolute inset-x-6 top-0 h-px pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${accent}99, transparent)` }} />
          <div className="flex gap-2 mb-2 px-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#FF6B6B99' }} /><span className="w-2 h-2 rounded-full" style={{ background: '#FFB45499' }} /><span className="w-2 h-2 rounded-full" style={{ background: '#52D0DD99' }} />
            <span className="ml-auto text-[11px] font-mono text-white/25 pr-1">qubryx.one</span>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ height: 196, background: 'rgba(6,10,20,0.4)' }}>{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthGateway({ onLogin }: { onLogin: () => void; key?: string }) {
  const [email, setEmail] = useState('alex@qubryx.com');
  const [password, setPassword] = useState('orbit-demo-2026');
  const [showPw, setShowPw] = useState(false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setI(v => (v + 1) % SLIDES.length), 5200);
    return () => clearInterval(t);
  }, [paused, reduced]);

  const slide = SLIDES[i];

  return (
    <motion.div exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }} transition={{ duration: 0.5 }}
      className="fixed inset-0 grid place-items-center overflow-hidden p-4" style={{ background: 'radial-gradient(120% 120% at 30% 10%, #17123a 0%, #0b0913 55%, #0a1420 100%)' }}>
      <div className="absolute inset-0 pointer-events-none wp-animate opacity-70"><WallpaperArt id="aurora" /></div>
      <svg width="0" height="0" className="absolute"><defs><radialGradient id="q1-core" cx="40%" cy="34%" r="70%"><stop offset="0%" stopColor="#8fe3ec" /><stop offset="55%" stopColor="#52D0DD" /><stop offset="100%" stopColor="#3575C7" /></radialGradient></defs></svg>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-[min(1060px,96vw)] h-[min(640px,92vh)] glass-elevated overflow-hidden flex" style={{ borderRadius: 28 }}>

        {/* LEFT — showcase */}
        <div className="hidden md:flex flex-col w-[55%] p-9 relative overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <motion.div key={`bg${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(150deg, ${slide.accent}1f, transparent 55%), linear-gradient(320deg, #6A3DFF14, transparent 60%)` }} />
          <div className="absolute inset-0 pointer-events-none wp-animate opacity-30"><WallpaperArt id="waves" /></div>

          <div className="relative flex items-center gap-2">
            <QubryxOneMark size={30} />
            <span className="font-display text-[15px] tracking-tight">Qubryx <span style={{ background: 'linear-gradient(100deg,#52D0DD,#6A3DFF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One</span></span>
          </div>

          <div className="relative flex-1 flex flex-col justify-center min-h-0 py-4">
            <div className="mb-6 px-2">
              <AnimatePresence mode="wait">
                <motion.div key={`art${i}`} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>
                  <Frame accent={slide.accent}>{slide.art}</Frame>
                </motion.div>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={`txt${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="px-2 min-w-0">
                <div className="text-[12px] font-semibold uppercase tracking-[0.16em] mb-2 truncate" style={{ color: slide.accent }}>{slide.kicker}</div>
                <h2 className="text-[clamp(20px,2.2vw,26px)] font-display font-semibold tracking-tight leading-tight break-words">{slide.title}</h2>
                <p className="text-sm text-[var(--color-mist)] mt-2 max-w-[34ch] leading-relaxed break-words">{slide.sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* animated progress segments */}
          <div className="relative flex items-center gap-2">
            {SLIDES.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.16)' }}>
                {k === i && (reduced
                  ? <span className="block h-full w-full" style={{ background: 'var(--color-lumen)' }} />
                  : <motion.span key={`p${i}-${paused}`} initial={{ width: '0%' }} animate={{ width: paused ? '35%' : '100%' }} transition={{ duration: paused ? 0.4 : 5.2, ease: 'linear' }} className="block h-full" style={{ background: 'var(--color-lumen)' }} />)}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-11 py-10">
          <div className="md:hidden flex items-center gap-2 mb-6"><QubryxOneMark size={30} /><span className="font-display text-[15px]">Qubryx One</span></div>
          <h1 className="text-[27px] font-display font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[var(--color-mist)] mt-2 mb-7">Sign in — everything picks up where you left off.</p>

          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <Labeled label="Work email">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-trace)] pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)] focus:bg-white/[0.1] focus:shadow-[0_0_0_3px_var(--color-lumen-soft)] transition-all" />
              </div>
            </Labeled>
            <Labeled label="Password" link="Forgot?">
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-trace)] pointer-events-none" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)] focus:bg-white/[0.1] focus:shadow-[0_0_0_3px_var(--color-lumen-soft)] transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-trace)] hover:text-[var(--color-vapor)] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Labeled>
            <label className="flex items-center gap-2 -mt-1 select-none cursor-pointer text-[13px] text-[var(--color-mist)]">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded accent-[var(--color-lumen)]" /> Keep me signed in on this device
            </label>
            <button type="submit"
              className="mt-2 py-4 rounded-2xl font-semibold text-sm text-white brand-gradient-btn shadow-[0_8px_24px_-10px_rgba(53,117,199,0.55)] hover:brightness-[1.07] hover:shadow-[0_10px_30px_-10px_rgba(53,117,199,0.65)] active:scale-[0.985] transition-all flex items-center justify-center gap-2">
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5"><span className="flex-1 h-px bg-[var(--color-glass-edge)]" /><span className="text-[12px] text-[var(--color-trace)]">or</span><span className="flex-1 h-px bg-[var(--color-glass-edge)]" /></div>
          <button onClick={onLogin} className="py-3 rounded-2xl text-sm font-medium text-[var(--color-vapor)] glass-soft hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><KeyRound className="w-4 h-4 text-[var(--color-mist)]" /> Continue with SSO</button>
          <button onClick={onLogin} className="mt-3 group/demo flex items-center gap-3 p-3 rounded-2xl border border-[var(--color-glass-edge)] hover:border-[var(--color-lumen)]/50 hover:bg-white/[0.04] transition-all text-left">
            <span className="w-9 h-9 rounded-xl grid place-items-center shrink-0 bg-[var(--color-lumen-soft)]"><Sparkles className="w-4 h-4 text-[var(--color-lumen)]" /></span>
            <span className="min-w-0"><span className="block text-[13px] font-medium text-[var(--color-vapor)]">New here? Explore the demo workspace</span><span className="block text-[12px] text-[var(--color-mist)]">Seeded people, live signals, Q ready to talk</span></span>
            <ArrowRight className="w-4 h-4 ml-auto shrink-0 text-[var(--color-trace)] group-hover/demo:text-[var(--color-lumen)] group-hover/demo:translate-x-0.5 transition-all" />
          </button>

          <div className="flex items-center gap-2 mt-8 opacity-70">
            <img src={logo} alt="Qubryx" className="w-4 h-4 object-contain" />
            <span className="text-[12px] text-[var(--color-trace)] flex items-center gap-2">by Qubryx <span className="w-0.5 h-0.5 rounded-full bg-[var(--color-trace)]" /> <ShieldCheck className="w-3 h-3" /> MFA enforced · SOC 2</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Labeled({ label, link, children }: { label: string; link?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-trace)] flex justify-between">
        {label}{link && <a href="#" className="normal-case tracking-normal text-[var(--color-lumen)] hover:text-white transition-colors">{link}</a>}
      </span>
      {children}
    </label>
  );
}
