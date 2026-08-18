import { motion, useDragControls } from 'motion/react';
import { IndianRupee, GripVertical } from 'lucide-react';
import { useWorkspace } from '../store';
import { hit } from '../dropzone';
import { sfx } from '../sound';
import { haptic } from '../haptics';

/** Friction Swipe — drag this budget token onto a person to simulate a retention move. */
export default function BudgetLever({ x, y }: { x: number; y: number }) {
  const { simulate, setDragging, toast, pulse } = useWorkspace();
  const controls = useDragControls();
  return (
    <motion.div className="group absolute z-30" style={{ left: x, top: y }}
      drag dragListener={false} dragControls={controls} dragMomentum={false}
      onDragStart={() => { setDragging(true); sfx.pickup(); }}
      onDragEnd={(_e, info) => {
        setDragging(false);
        const z = hit(info.point.x, info.point.y, 'token');
        if (z?.data?.kind === 'person') { const cx = z.rect.left + z.rect.width / 2, cy = z.rect.top + z.rect.height / 2; pulse(cx, cy, 'combine'); sfx.merge(); haptic('high'); simulate(z.data.id, 'bonus'); }
        else { sfx.reject(); toast('Drop the budget onto a person to simulate', 'info'); }
      }}
      whileDrag={{ scale: 1.08 }} whileHover={{ scale: 1.04 }}>
      <button onPointerDown={(e) => { e.stopPropagation(); controls.start(e); }} className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-2.5 -top-2.5 w-6 h-6 grid place-items-center rounded-xl glass-elevated cursor-grab active:cursor-grabbing text-[var(--color-mist)] z-[85]"><GripVertical className="w-3.5 h-3.5" /></button>
      <div className="glass-elevated shape-capsule tint-ember px-4 py-3 flex items-center gap-2 border border-[var(--color-ember)]/40 relative">
        <span className="w-8 h-8 rounded-full grid place-items-center bg-[var(--color-ember)]/15 text-[var(--color-ember)]"><IndianRupee className="w-4 h-4" /></span>
        <div className="leading-tight"><div className="text-[13px] font-semibold">Retention bonus</div><div className="text-[13px] font-mono text-[var(--color-mist)]">drag onto a person →</div></div>
      </div>
    </motion.div>
  );
}
