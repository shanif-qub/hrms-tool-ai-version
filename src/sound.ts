// Calm, natural "water" sound palette via Web Audio — soft, low, never harsh.
// Everything runs through a gentle low-pass so nothing is electronic or high-pitched,
// with slow envelopes and a faint watery tail. Each cue also fires a matching haptic.
import { haptic, type Confidence } from './haptics';

let ctx: AudioContext | null = null;
let bus: BiquadFilterNode | null = null;   // master low-pass — keeps everything soft
let master: GainNode | null = null;
let muted = false;
export const isMuted = () => muted;
export const setMuted = (m: boolean) => { muted = m; };

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.9;
      bus = ctx.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 1100; bus.Q.value = 0.4;
      bus.connect(master); master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

// one soft voice: gentle glide, slow attack/release, warm sine/triangle
function voice(f0: number, f1: number, dur: number, { type = 'sine' as OscillatorType, vol = 0.05, attack = 0.03, delay = 0 } = {}) {
  const c = ac(); if (!c || !bus) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(bus); osc.start(t); osc.stop(t + dur + 0.05);
}

// soft water droplet: a rounded pitch-drop with a faint low body
function droplet() {
  const c = ac(); if (!c || !bus) return;
  const t = c.currentTime;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = 'sine';
  // soft bubble pop: a quick rounded rise that settles — no low drone
  osc.frequency.setValueAtTime(240, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(470, t + 0.11);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.045, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(g); g.connect(bus); osc.start(t); osc.stop(t + 0.2);
}

const h = (c: Confidence) => { try { haptic(c); } catch { /* no-op */ } };

export const sfx = {
  pickup:  () => { voice(196, 262, 0.16, { vol: 0.045, attack: 0.025 }); h('med'); },                                   // token lifts (calm rise)
  hover:   () => { voice(330, 330, 0.06, { vol: 0.02, attack: 0.02 }); h('low'); },                                     // soft tick
  merge:   () => { voice(262, 330, 0.22, { vol: 0.06, attack: 0.025 }); voice(392, 494, 0.24, { type: 'triangle', vol: 0.03, attack: 0.04, delay: 0.05 }); voice(523, 659, 0.20, { vol: 0.02, attack: 0.05, delay: 0.10 }); h('high'); }, // gentle upward resolve + shimmer
  relate:  () => { voice(294, 349, 0.18, { vol: 0.038, attack: 0.03 }); h('med'); },                                    // soft relation
  ripple:  () => { droplet(); h('low'); },
  confirm: () => { voice(330, 440, 0.20, { vol: 0.045, attack: 0.03 }); voice(440, 587, 0.20, { type: 'triangle', vol: 0.02, attack: 0.04, delay: 0.04 }); h('high'); }, // accepted (warm)
  reject:  () => { voice(240, 190, 0.22, { type: 'sine', vol: 0.04, attack: 0.02 }); h('low'); },                       // soft, low, settles down — no buzz
  close:   () => { voice(262, 208, 0.14, { vol: 0.032, attack: 0.02 }); h('low'); },
  peel:    () => { voice(392, 523, 0.20, { vol: 0.036, attack: 0.035 }); h('med'); },   // reveal deeper layer
  droplet: () => { droplet(); h('low'); },                                                                              // empty-canvas water click
};
