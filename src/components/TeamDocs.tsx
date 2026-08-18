import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Send, Archive, Pencil, Users, Building2, User as UserIcon, Check, History, Clock, Bell } from 'lucide-react';
import { useWorkspace } from '../store';
import type { Entity, Audience } from '../types';

const CATS: Entity['category'][] = ['Handbook', 'Policy', 'Benefits', 'Compliance'];
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-white/8 text-[var(--color-mist)]',
  published: 'bg-[var(--color-lumen)]/15 text-[var(--color-lumen)]',
  archived: 'bg-white/5 text-[var(--color-trace)]',
};

function audText(a: Audience, name?: string) {
  return a.scope === 'org' ? 'Whole org' : a.scope === 'team' ? 'My team' : `${name ?? 'One person'}`;
}

export default function TeamDocs() {
  const w = useWorkspace();
  const isHr = w.lens === 'hr';
  const mine = w.entities.filter(e => isHr || e.authorId === 'm1');
  const reports = w.people.filter(p => p.managerId === 'm1');

  const [editing, setEditing] = useState<null | 'new' | string>(null);
  const [form, setForm] = useState<Partial<Entity>>({});

  const openNew = () => { setForm({ title: '', body: '', category: 'Policy', audience: { scope: 'team', targetId: 'm1' }, requiresAck: false }); setEditing('new'); };
  const openEdit = (e: Entity) => { setForm({ ...e }); setEditing(e.id); };
  const save = () => {
    if (!form.title?.trim()) { w.toast('Give the document a title first', 'warn'); return; }
    if (editing === 'new') w.createEntity(form);
    else if (editing) w.updateEntity(editing, form);
    setEditing(null);
  };

  const nameFor = (id?: string) => w.people.find(p => p.id === id)?.name;

  return (
    <div className="absolute inset-x-0 top-20 bottom-32 px-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-widest text-[var(--color-trace)]"><FileText className="w-3.5 h-3.5" /> {isHr ? 'Org documents' : 'Team documents'}</div>
          <button onClick={openNew} className="px-3 py-2 rounded-full text-[13px] font-semibold brand-gradient-btn text-white flex items-center gap-2 hover:brightness-110 transition"><Plus className="w-3.5 h-3.5" /> New document</button>
        </div>
        <p className="text-[13px] text-[var(--color-mist)] mb-4">Author once, choose who sees it, and publish. Publishing surfaces it in the right people’s My World and lets Q cite it. Nothing is ever deleted — archive keeps a record.</p>

        {/* editor */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
              <div className="glass-panel p-4 space-y-3" style={{ borderRadius: 'var(--r-soft)' }}>
                <input autoFocus value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Document title"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] focus:border-[var(--color-lumen)]" />
                <textarea value={form.body ?? ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="What does this cover?"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-sm text-[var(--color-vapor)] resize-none focus:border-[var(--color-lumen)]" />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Type</span>
                    {CATS.map(c => <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className={`text-[13px] px-3 py-1 rounded-full transition-colors ${form.category === c ? 'bg-[var(--color-lumen-soft)] text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)]'}`}>{c}</button>)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[12px] uppercase tracking-wider text-[var(--color-trace)]">Audience</span>
                  {([['org', 'Whole org', Building2], ['team', 'My team', Users], ['person', 'A person', UserIcon]] as const).map(([sc, label, Icon]) => (
                    (!isHr && sc === 'org') ? null : (
                    <button key={sc} onClick={() => setForm(f => ({ ...f, audience: { scope: sc, targetId: sc === 'team' ? 'm1' : sc === 'person' ? (reports[0]?.id) : undefined } }))}
                      className={`text-[13px] px-3 py-1 rounded-full flex items-center gap-2 transition-colors ${form.audience?.scope === sc ? 'bg-[var(--color-halo)]/20 text-[var(--color-halo-text)]' : 'glass-soft text-[var(--color-mist)]'}`}><Icon className="w-3 h-3" /> {label}</button>
                  )))}
                  {form.audience?.scope === 'person' && (
                    <select value={form.audience.targetId} onChange={e => setForm(f => ({ ...f, audience: { scope: 'person', targetId: e.target.value } }))}
                      className="text-[13px] px-2 py-1 rounded-full bg-white/[0.06] border border-[var(--color-glass-edge)] outline-none text-[var(--color-vapor)]">
                      {reports.map(p => <option key={p.id} value={p.id} className="bg-[var(--color-abyss)]">{p.name}</option>)}
                    </select>
                  )}
                </div>
                <label className="flex items-center gap-2 text-[13px] text-[var(--color-mist)] cursor-pointer">
                  <input type="checkbox" checked={!!form.requiresAck} onChange={e => setForm(f => ({ ...f, requiresAck: e.target.checked }))} className="accent-[var(--color-lumen)]" /> Require acknowledgment
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={save} className="px-4 py-2 rounded-full text-sm font-semibold brand-gradient-btn text-white hover:brightness-110 transition">{editing === 'new' ? 'Create draft' : 'Save changes'}</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full text-sm text-[var(--color-mist)] glass-soft hover:bg-white/10 transition">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* list */}
        <div className="space-y-3">
          {mine.length === 0 && <div className="glass-soft p-4 text-sm text-[var(--color-mist)] rounded-2xl">No documents yet. Create one to share with your team.</div>}
          {mine.map(e => {
            const ackCount = (e.ackedBy ?? []).length;
            const expected = e.audience.scope === 'org' ? w.people.length : e.audience.scope === 'team' ? w.people.filter(p => p.managerId === e.audience.targetId).length : 1;
            const pending = Math.max(0, expected - ackCount);
            return (
              <div key={e.id} className={`glass-panel p-4 ${e.status === 'archived' ? 'opacity-60' : ''}`} style={{ borderRadius: 'var(--r-soft)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] text-[var(--color-vapor)] font-medium">{e.title}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[e.status]}`}>{e.status}</span>
                      {e.requiresAck && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-ember)]/15 text-[var(--color-ember)]">needs ack</span>}
                    </div>
                    <div className="text-[13px] text-[var(--color-trace)] mt-1 flex items-center gap-2 flex-wrap">
                      <span>{e.category}</span><span>·</span><span>{audText(e.audience, nameFor(e.audience.targetId))}</span><span>·</span><span>v{e.version}</span><span>·</span><span>{e.updated}</span>
                      {e.status === 'published' && e.requiresAck && <><span>·</span><span className="text-[var(--color-lumen)]">{ackCount} of {expected} acknowledged</span></>}
                    </div>
                    <p className="text-[13px] text-[var(--color-mist)] mt-2 leading-snug line-clamp-2">{e.body}</p>
                  </div>
                </div>
                {e.status !== 'archived' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-glass-edge)]">
                    <button onClick={() => openEdit(e)} className="text-[13px] px-3 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)] flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                    <button onClick={() => w.publishEntity(e.id)} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-lumen)]/15 text-[var(--color-lumen)] hover:bg-[var(--color-lumen)]/25 flex items-center gap-1"><Send className="w-3 h-3" /> {e.status === 'published' ? 'Re-publish' : 'Publish'}</button>
                    {e.status === 'published' && e.requiresAck && pending > 0 && (
                      <button onClick={() => w.nudgeNonAckers(e.id)} className="text-[13px] px-3 py-2 rounded-full bg-[var(--color-ember)]/15 text-[var(--color-ember)] hover:bg-[var(--color-ember)]/25 flex items-center gap-1"><Bell className="w-3 h-3" /> Nudge {pending} pending</button>
                    )}
                    <span className="flex-1" />
                    <button onClick={() => w.archiveEntity(e.id)} className="text-[13px] px-3 py-2 rounded-full text-[var(--color-trace)] hover:text-[var(--color-coral)] flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* activity log */}
        {w.activity.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-[var(--color-trace)] mb-2"><History className="w-3.5 h-3.5" /> Recent activity</div>
            <div className="space-y-2">
              {w.activity.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-center gap-2 text-[13px] text-[var(--color-mist)]"><Clock className="w-3 h-3 text-[var(--color-trace)] shrink-0" /><span className="flex-1 truncate">{a.text}</span><span className="text-[var(--color-trace)]">{a.at}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
