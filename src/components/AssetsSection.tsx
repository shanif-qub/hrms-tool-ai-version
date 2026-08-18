import { Laptop, Smartphone, Monitor, KeyRound, Armchair, Download } from 'lucide-react';
import { useWorkspace } from '../store';
import type { AssetItem } from '../types';

const ICON: Record<AssetItem['category'], any> = {
  Laptop, Phone: Smartphone, Peripheral: Monitor, Access: KeyRound, Furniture: Armchair,
};
const COND: Record<AssetItem['condition'], string> = {
  new: 'var(--color-lumen)', good: 'var(--color-lumen)', fair: 'var(--color-ember)',
};

function downloadRegister(assets: AssetItem[]) {
  const body = ['QUBRYX — ASSET REGISTER', '========================================',
    ...assets.map(a => `${a.name}\n  Category : ${a.category}\n  Serial   : ${a.serial}\n  Assigned : ${a.assigned}\n  Condition: ${a.condition}\n  Return   : ${a.returnable ? 'required on exit' : 'not returnable'}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'asset-register.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AssetsSection({ topLevel = false }: { topLevel?: boolean }) {
  const w = useWorkspace();
  const assets = w.assets;
  if (assets.length === 0) return null;
  return (
    <section className={topLevel ? '' : 'mt-6'}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[13px] uppercase tracking-widest text-[var(--color-trace)]">Assets allocated to you</h2>
        <button onClick={() => downloadRegister(assets)} aria-label="Download asset register"
          className="h-9 px-3 rounded-full glass-soft hover:bg-white/10 transition-colors flex items-center gap-2 text-[12px] text-[var(--color-lumen)]">
          <Download className="w-3.5 h-3.5" /> Register
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map(a => { const Icon = ICON[a.category] ?? Laptop; return (
          <div key={a.id} className="glass-panel p-4 flex items-start gap-3" style={{ borderRadius: 'var(--r-soft)' }}>
            <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-halo) 16%, transparent)', color: 'var(--color-halo-text)' }}><Icon className="w-4 h-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[var(--color-vapor)] truncate">{a.name}</div>
              <div className="text-[12px] text-[var(--color-trace)] font-mono truncate">{a.serial}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[12px] text-[var(--color-mist)]">{a.assigned}</span>
                <span className="text-[12px] capitalize" style={{ color: COND[a.condition] }}>· {a.condition}</span>
              </div>
            </div>
          </div>
        ); })}
      </div>
    </section>
  );
}
