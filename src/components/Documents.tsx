import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Download, Check, History, Sparkles, BookOpen } from 'lucide-react';
import { ConceptIcon, docConcept } from '../icons';
import { useWorkspace } from '../store';
import { TokenCard } from './Tokens';
import AssetsSection from './AssetsSection';
import { ME_ID } from '../data';
import { Avatar } from './Avatar';

export default function Documents() {
  const { documents, ackDoc, toast, hidden, ask, pulse, entities, ackEntity, people, openDoc, assets } = useWorkspace();
  const me = people.find(p => p.id === ME_ID);
  const shared = entities.filter(e => e.status === 'published' && (e.audience.scope === 'org' || (e.audience.scope === 'team' && me?.managerId === e.audience.targetId) || (e.audience.scope === 'person' && e.audience.targetId === ME_ID)));
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');
  const cats = ['All', 'Handbook', 'Policy', 'Benefits', 'Compliance', 'Assets'];
  const showAssets = cat === 'All' || cat === 'Assets';
  const showDocs = cat !== 'Assets';
  const list = documents.filter(d => !hidden.includes(d.id) && (cat === 'All' || d.category === cat) && (d.title.toLowerCase().includes(q.toLowerCase()) || d.summary.toLowerCase().includes(q.toLowerCase())));
  const pending = documents.filter(d => d.mustAck && !d.acked).length;

  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><FileText className="w-3.5 h-3.5" /> Documents, policies & assets</div>
          <div className="flex items-center gap-2">
            {pending > 0 && <span className="text-[13px] px-2 py-1 rounded-full bg-[var(--color-ember)]/15 text-[var(--color-ember)] border border-[var(--color-ember)]/30">{pending} need acknowledgment</span>}
            <button onClick={() => ask('What do I still need to acknowledge, and can you summarise the Handbook changes?')} className="px-3 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q</button>
          </div>
        </div>
        <div className="glass-panel flex items-center px-4 py-3 mb-3 rounded-full"><Search className="w-4 h-4 text-[var(--color-mist)] mr-2" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search policies…" className="flex-1 bg-transparent outline-none text-sm" aria-label="Search documents" /></div>
        <div className="flex gap-2 mb-4 flex-wrap">{cats.map(c => <button key={c} onClick={() => setCat(c)} className={`text-[13px] px-3 py-2 rounded-full transition-colors flex items-center gap-1.5 ${cat === c ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)]'}`}>{c}{c === 'Assets' && assets.length > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--color-halo)]/20 text-[var(--color-halo-text)] font-mono">{assets.length}</span>}</button>)}</div>

        {showDocs && shared.length > 0 && (
          <div className="mb-6">
            <div className="text-[12px] uppercase tracking-widest text-[var(--color-halo-text)] mb-2">Shared with you</div>
            <div className="space-y-3">
              {shared.map(e => { const acked = (e.ackedBy ?? []).includes(ME_ID); return (
                <div key={e.id} className="glass-panel p-4 flex items-start gap-3" style={{ borderRadius: 'var(--r-soft)' }}>
                  <Avatar seed={e.authorName} name={e.authorName} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><span className="text-[14px] text-[var(--color-vapor)] font-medium">{e.title}</span><span className="text-[11px] px-2 py-0.5 rounded-full bg-white/8 text-[var(--color-mist)]">{e.category}</span></div>
                    <div className="text-[12px] text-[var(--color-trace)] mt-0.5">{e.authorName} · v{e.version} · {e.updated}</div>
                    <p className="text-[13px] text-[var(--color-mist)] mt-2 leading-snug">{e.body}</p>
                    <div className="mt-3">
                      {e.requiresAck
                        ? (acked ? <span className="text-[13px] text-[var(--color-lumen)] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Acknowledged</span>
                          : <button onClick={() => ackEntity(e.id)} className="text-[13px] px-3 py-2 rounded-full font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Acknowledge</button>)
                        : <button onClick={() => ask(`Summarise “${e.title}” for me`)} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 transition-colors flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Ask Q to summarise</button>}
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        )}
        {showDocs && <div className="grid sm:grid-cols-2 gap-x-4 gap-y-5">
          {list.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <TokenCard id={d.id} kind="document" placement="flow" shape="soft" tint={d.mustAck && !d.acked ? 'ember' : 'lumen'} className="w-full flex flex-col" label={d.title}
                expand={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><p>{d.summary}</p><div className="text-[13px] text-[var(--color-trace)]">Drag onto a person to check their acknowledgment · onto a candidate to assign</div></div>}
                deep={<div className="text-[13px] text-[var(--color-mist)] space-y-2"><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Version history</span><span>{d.version} · prev v{(parseFloat(d.version.slice(1)) - 0.1).toFixed(1)}</span></div><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Acknowledged org-wide</span><span className="text-[var(--color-lumen)]">72%</span></div><div className="flex justify-between items-baseline gap-3"><span className="text-[var(--color-trace)] min-w-0">Retention window</span><span>7 years</span></div></div>}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: `color-mix(in srgb, ${d.mustAck && !d.acked ? 'var(--color-ember)' : 'var(--color-halo)'} 14%, transparent)` }}>
                    <ConceptIcon concept={docConcept(d.category)} size="card" tintOverride={d.mustAck && !d.acked ? 'ember' : 'halo'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5"><span className="text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full glass-soft text-[var(--color-mist)]">{d.category}</span><span className="text-[12px] font-mono text-[var(--color-trace)] flex items-center gap-1"><History className="w-3 h-3" />{d.version}</span></div>
                    <h3 className="font-display font-medium text-sm leading-tight">{d.title}</h3>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-mist)] leading-relaxed line-clamp-2">{d.summary}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={(e) => { e.stopPropagation(); openDoc(d.id); }} className="flex-1 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-lumen-soft)] text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/30 transition-colors flex items-center justify-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Read</button>
                  {d.mustAck && (d.acked
                    ? <span className="flex-1 py-2 rounded-full text-[13px] text-[var(--color-lumen)] flex items-center justify-center gap-2"><Check className="w-3.5 h-3.5" /> Acknowledged</span>
                    : <button onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); pulse(r.left + r.width / 2, r.top + r.height / 2, 'ok'); ackDoc(d.id); }} className="flex-1 py-2 rounded-full text-[13px] font-semibold bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 transition-colors">Acknowledge</button>)}
                </div>
              </TokenCard>
            </motion.div>
          ))}
        </div>}

        {/* Assets allocated — promoted to a first-class category so it's discoverable */}
        {showAssets && <AssetsSection topLevel={cat === 'Assets'} />}
      </div>
    </div>
  );
}
