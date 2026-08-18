// GestureLegend — Phase B. An on-demand cheat-sheet that names the interaction
// grammar in ONE place, so the vocabulary is learnable without shrinking it.
// Reached with "?" or the help affordance. Not a modal wall — a dismissible card.
// The verb names here are the canonical labels; surfaces should match them.

import { AnimatePresence, motion } from 'motion/react';
import { X, Hand, Layers, Copy, Send, Maximize2, Radio, LayoutGrid, Wand2, Sparkles, Keyboard } from 'lucide-react';
import { useWorkspace } from '../store';

interface Gesture { name: string; icon: React.ReactNode; def: string; how: string }

const GESTURES: Gesture[] = [
  { name: 'Ask Q', icon: <Sparkles className="w-4 h-4" />, def: 'Tell Q what you need in plain words.', how: 'Type in the Cue bar, or press /' },
  { name: 'Peel', icon: <Hand className="w-4 h-4" />, def: 'Lift a card to see the detail behind it.', how: 'Tap a token or sphere' },
  { name: 'Stack', icon: <Layers className="w-4 h-4" />, def: 'Gather people or cards into a set.', how: 'Add from the + menu, or select several' },
  { name: 'Combine', icon: <Copy className="w-4 h-4" />, def: 'Merge a stack into one comparison.', how: 'Open the stack tray and combine' },
  { name: 'Send to', icon: <Send className="w-4 h-4" />, def: 'Move a tool to the Board, Now, or a teammate.', how: 'Use a card’s ⋯ menu' },
  { name: 'Expand', icon: <Maximize2 className="w-4 h-4" />, def: 'Open a card full-screen.', how: 'Tap the expand control on a card' },
  { name: 'Signal / Board', icon: <Radio className="w-4 h-4" />, def: 'Two home views: a live feed, or your pinned tools.', how: 'Toggle bottom-left, or press b' },
  { name: 'Canvas', icon: <Wand2 className="w-4 h-4" />, def: 'Describe a tool or chart; Q builds it live.', how: 'Open Canvas from the action dock' },
  { name: 'Board', icon: <LayoutGrid className="w-4 h-4" />, def: 'Your pinned tools, arranged your way.', how: 'Add cards with the + menu' },
];

export default function GestureLegend() {
  const w = useWorkspace();
  return (
    <AnimatePresence>
      {w.showLegend && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--color-abyss)]/70 backdrop-blur-[2px]" onClick={() => w.setLegend(false)} />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="relative w-[min(680px,94vw)] max-h-[82vh] overflow-y-auto panel-scroll glass-elevated p-5" style={{ borderRadius: 22 }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-xl grid place-items-center brand-gradient-btn text-white"><Hand className="w-4 h-4" /></span>
              <div>
                <h3 className="text-lg font-display font-semibold tracking-tight text-[var(--color-vapor)]">The gestures</h3>
                <p className="text-[13px] text-[var(--color-mist)]">One vocabulary, everywhere. Nothing to memorise — this is here whenever you want it.</p>
              </div>
              <button onClick={() => w.setLegend(false)} aria-label="Close" className="ml-auto w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)]"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {GESTURES.filter(g => g.name !== 'Canvas' || w.lens === 'manager' || w.lens === 'hr').map(g => (
                <div key={g.name} className="glass-soft rounded-xl px-3 py-3 flex items-start gap-3">
                  <span className="text-[var(--color-lumen)] mt-0.5">{g.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--color-vapor)] font-medium">{g.name}</div>
                    <div className="text-[13px] text-[var(--color-mist)] leading-snug">{g.def}</div>
                    <div className="text-[12px] text-[var(--color-trace)] mt-0.5">{g.how}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 glass-soft rounded-xl px-3 py-3 flex items-center gap-2 text-[13px] text-[var(--color-mist)]">
              <Keyboard className="w-4 h-4 text-[var(--color-lumen)] shrink-0" />
              <span><b className="text-[var(--color-vapor)]">Keys:</b> <kbd className="font-mono">/</kbd> ask Q · <kbd className="font-mono">1·2·3</kbd> switch lenses · <kbd className="font-mono">b</kbd> Signal/Board · <kbd className="font-mono">f</kbd> Focus · <kbd className="font-mono">Esc</kbd> back · <kbd className="font-mono">?</kbd> this legend</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
