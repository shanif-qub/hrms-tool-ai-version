import { useState, useRef, useEffect, ReactNode } from 'react';
import { toPng } from 'html-to-image';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X, ArrowUp, PenSquare, Check, Trash2, Wand2, Plus, Image as ImageIcon, Paperclip, Mic, LayoutDashboard, BarChart3, Clock, MessageSquarePlus, Copy, Pencil, Download, Share2, Radio, UserPlus, ChevronDown, Gauge, Table, LayoutGrid, TrendingUp } from 'lucide-react';
import { useWorkspace } from '../store';
import { useSpeech } from '../useSpeech';
import { VIBE_TEMPLATES, CANVAS_MODULES, VIBE_FLIGHT, VIBE_COMPPERF, VIBE_ONEONONE, VIBE_BRADFORD, VIBE_SKILLS, VIBE_WORKFLOW, VIBE_SURVEY, DIRECTORY, KPI_TILES, ATTRITION_TREND, HEADCOUNT_TEAMS, BAND_LADDER, ENGAGEMENT_HEAT, LEADERBOARD, HIRING_FUNNEL } from '../data';
import { VibeApp, VIBE_ICON, vibeTitle } from './VibeApps';

const SEEDED_HISTORY = ['Who is over-allocated this sprint?', 'Attrition risk by team', 'Leave overlap next month'];
const WIDGET_KINDS: { kind: string; label: string; icon: ReactNode }[] = [
  { kind: 'kpi', label: 'KPI', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { kind: 'gauge', label: 'Gauge', icon: <Gauge className="w-3.5 h-3.5" /> },
  { kind: 'trend', label: 'Trend', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { kind: 'bars', label: 'Bars', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { kind: 'table', label: 'Table', icon: <Table className="w-3.5 h-3.5" /> },
  { kind: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
];

export default function Canvas() {
  const w = useWorkspace();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const speech = useSpeech((t) => setText(t), (m) => w.toast(m, 'warn'));

  useEffect(() => { if (w.vibeOpen && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [w.vibeChat.length, w.vibeOpen]);

  const submit = () => { const t = text.trim(); if (!t) return; if (lastAppId && REFINE.test(t)) w.refineVibe(lastAppId, t); else w.vibeAsk(t); setText(''); };
  const [renaming, setRenaming] = useState<string | null>(null);
  const [sendMenu, setSendMenu] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [sharePersonFor, setSharePersonFor] = useState<string | null>(null);
  const exportPng = (app: { id: string; template: string; title?: string }) => {
    const el = document.getElementById(`cap-${app.id}`); if (!el) { w.toast('Nothing to export', 'info'); return; }
    document.body.classList.add('png-capturing'); w.toast('Rendering PNG\u2026', 'info');
    toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: '#141a24' })
      .then(url => { const a = document.createElement('a'); a.href = url; a.download = `${(app.title || vibeTitle(app.template)).replace(/\s+/g, '-').toLowerCase()}.png`; a.click(); w.toast('Exported PNG', 'ok'); })
      .catch(() => w.toast('PNG export failed', 'warn'))
      .finally(() => document.body.classList.remove('png-capturing'));
  }
  const [renameText, setRenameText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const DATA_MAP: Record<string, any> = { flightrisk: VIBE_FLIGHT, compperf: VIBE_COMPPERF, oneonone: VIBE_ONEONONE, bradford: VIBE_BRADFORD, skills: VIBE_SKILLS, workflow: VIBE_WORKFLOW, survey: VIBE_SURVEY, orgspan: DIRECTORY, kpi: KPI_TILES, attrition: ATTRITION_TREND, headcount: HEADCOUNT_TEAMS, bandladder: BAND_LADDER, heatmap: ENGAGEMENT_HEAT, leaderboard: LEADERBOARD, funnel: HIRING_FUNNEL };
  const toCsv = (data: any): string => {
    if (Array.isArray(data)) { if (!data.length) return ''; if (typeof data[0] === 'object') { const keys = Object.keys(data[0]); return [keys.join(','), ...data.map((r: any) => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n'); } return data.join('\n'); }
    if (data && typeof data === 'object') return Object.entries(data).map(([k, v]) => `${k},${JSON.stringify(v)}`).join('\n');
    return String(data ?? '');
  };
  const exportCsv = (app: { id: string; template: string; title?: string }) => {
    const csv = toCsv(DATA_MAP[app.template]); if (!csv) { w.toast('Nothing to export for this tool', 'info'); return; }
    try { const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(app.title || vibeTitle(app.template)).replace(/\s+/g, '-').toLowerCase()}.csv`; a.click(); URL.revokeObjectURL(url); w.toast('Exported CSV', 'ok'); } catch { w.toast('Export failed', 'warn'); }
  };
  const buildFromFile = (fname: string) => { w.toast(`Building a view from ${fname}…`, 'info'); const key = /comp|pay|salary/i.test(fname) ? 'compperf' : /attend|absen/i.test(fname) ? 'bradford' : /skill/i.test(fname) ? 'skills' : /survey|pulse/i.test(fname) ? 'survey' : 'orgspan'; setTimeout(() => w.createVibe(key), 350); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) buildFromFile(f.name); };
  const REFINE = /\b(filter|only|just|exclude|group by|sort|add|remove|change to|now show|limit to|focus on|drill)\b/i;
  const lastAppId = [...w.vibeChat].reverse().find(m => m.appId)?.appId;
  const attach = () => w.toast('Attachments — connect storage to enable', 'info');

  return (
    <AnimatePresence>
      {w.vibeOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col bg-[var(--color-abyss)]/90 backdrop-blur-2xl" style={{ backdropFilter: 'blur(28px) saturate(140%)', WebkitBackdropFilter: 'blur(28px) saturate(140%)' }}>
          {/* header */}
          <div className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-[var(--color-glass-edge)]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl grid place-items-center brand-gradient-btn text-white"><Wand2 className="w-4 h-4" /></span>
              <div className="leading-tight"><div className="font-display text-[15px] text-[var(--color-vapor)]">Canvas</div><div className="text-[13px] text-[var(--color-mist)]">Describe a tool — Q builds it from your team’s data</div></div>
            </div>
            <button onClick={() => w.setVibe(false)} aria-label="Close Canvas" className="w-9 h-9 grid place-items-center rounded-full glass-soft hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-[var(--color-mist)]" /></button>
          </div>

          {/* body */}
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '248px 1fr 312px' }}>
            {/* LEFT — canvases + artifacts */}
            <aside className="min-h-0 flex flex-col border-r border-[var(--color-glass-edge)] p-3">
              <button onClick={() => w.newCanvas()} className="w-full mb-3 h-9 rounded-full brand-gradient-btn text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition"><MessageSquarePlus className="w-4 h-4" /> New canvas</button>
              <div className="panel-scroll flex-1 min-h-0 overflow-y-auto -mx-1 px-1 space-y-4">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-mist)] px-1 mb-2">Canvases</div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-lumen-soft)]">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-[var(--color-lumen)] shrink-0" /><span className="text-[13px] text-[var(--color-lumen)] flex-1 truncate">{w.vibeChat.find(m => m.role === 'user')?.text ?? 'Current canvas'}</span>
                  </div>
                  {w.canvasHistory.map(c => (
                    <button key={c.id} onClick={() => w.loadCanvas(c.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-trace)] shrink-0" /><span className="text-[13px] text-[var(--color-vapor)]/85 truncate">{c.title}</span>
                    </button>
                  ))}
                  {w.canvasHistory.length === 0 && <div className="text-[12px] text-[var(--color-trace)] px-3 py-1">Past canvases collect here when you start a new one.</div>}
                </div>
                {w.vibeApps.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-[var(--color-mist)] px-1 mb-2">Artifacts · {w.vibeApps.length}</div>
                    <div className="flex flex-wrap gap-2 px-1">
                      {w.vibeApps.map(app => { const live = w.vibePinned.includes(app.id) || w.vibeInsights.includes(app.id) || w.nowBoard.some(b => b.type === 'tool' && b.ref === app.id) || w.sharedTools.some(t => t.appId === app.id); return (
                        <button key={app.id} title={`${app.title || vibeTitle(app.template)}${live ? ' · live' : ''}`} onClick={() => document.getElementById(`cap-${app.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                          className="w-8 h-8 grid place-items-center rounded-lg glass-soft hover:bg-white/10 text-[var(--color-halo-text)] relative transition-colors">
                          {VIBE_ICON[app.template]}
                          {live && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-lumen)] ring-2 ring-[var(--color-abyss)]" />}
                        </button>
                      ); })}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* CENTER — conversation */}
            <section className="min-h-0 flex flex-col">
              <div ref={scrollRef} className="panel-scroll flex-1 min-h-0 overflow-y-auto px-6 py-6">
                <div className="max-w-[680px] mx-auto space-y-5">
                  {w.vibeChat.length === 0 && (
                    <div className="text-center py-10">
                      <span className="inline-grid place-items-center w-14 h-14 rounded-2xl glass-soft mb-4"><Sparkles className="w-6 h-6 text-[var(--color-halo-text)]" /></span>
                      <div className="font-display text-lg text-[var(--color-vapor)] mb-1">What should we build?</div>
                      <p className="text-sm text-[var(--color-vapor)]/80 max-w-sm mx-auto">Describe a view or pick a module. Q assembles it live, then you can send it to Now or Insights.</p>
                    </div>
                  )}
                  {w.vibeChat.map(m => m.role === 'user' ? (
                    <div key={m.id} className="flex justify-end"><div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md brand-gradient-btn text-white text-sm">{m.text}</div></div>
                  ) : (
                    <div key={m.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[12px] text-[var(--color-trace)]"><Sparkles className="w-3 h-3 text-[var(--color-halo-text)]" /> Q</div>
                      <div className="text-sm text-[var(--color-vapor)]">{m.text}</div>
                      {m.appId && (() => { const app = w.vibeApps.find(a => a.id === m.appId); if (!app) return null; const now = w.vibePinned.includes(app.id); const ins = w.vibeInsights.includes(app.id); const board = w.nowBoard.some(b => b.type === 'tool' && b.ref === app.id && b.lens === w.lens); const shared = w.sharedTools.some(t => t.appId === app.id); const nowLabel = w.lens === 'hr' ? 'The Org’s Now' : 'My Team’s Now'; return (
                        <div className="glass-panel tint-halo p-4 mt-1 relative">
                          {app.template !== 'dashboard' && (
                            <button onClick={() => setSelected(x => x.includes(app.id) ? x.filter(i => i !== app.id) : [...x, app.id])} title="Select to combine into a dashboard"
                              className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${selected.includes(app.id) ? 'bg-[var(--color-lumen)]/20 text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-trace)] hover:text-[var(--color-vapor)]'}`}>
                              <span className={`inline-block w-3 h-3 rounded-[4px] border grid place-items-center ${selected.includes(app.id) ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)]'}`}>{selected.includes(app.id) && <Check className="w-2.5 h-2.5 text-[var(--color-abyss)]" />}</span>
                              Combine
                            </button>
                          )}
                          <div id={`cap-${app.id}`} className="rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            {VIBE_ICON[app.template]}
                            {renaming === app.id ? (
                              <input autoFocus value={renameText} onChange={e => setRenameText(e.target.value)} onBlur={() => { if (renameText.trim()) w.renameVibe(app.id, renameText.trim()); setRenaming(null); }} onKeyDown={e => { if (e.key === 'Enter') { if (renameText.trim()) w.renameVibe(app.id, renameText.trim()); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }} className="text-[13px] font-semibold bg-white/10 rounded px-2 py-0.5 outline-none text-[var(--color-vapor)]" />
                            ) : (
                              <span className="text-[13px] font-semibold text-[var(--color-vapor)]">{app.title || vibeTitle(app.template)}</span>
                            )}
                            {app.refine && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-halo)]/15 text-[var(--color-halo-text)] max-w-[240px] truncate" title={app.refine}>Refined · {app.refine}</span>}
                          </div>
                          <VibeApp template={app.template} parts={app.parts} config={app.config} />
                          </div>
                          {app.template === 'widget' && app.config && (
                            <div className="flex flex-wrap items-center gap-1 mt-3">
                              <span className="text-[11px] uppercase tracking-wider text-[var(--color-trace)] mr-0.5">Shape</span>
                              {WIDGET_KINDS.map(k => (
                                <button key={k.kind} onClick={() => w.setWidgetKind(app.id, k.kind)} title={k.label} className={`w-6 h-6 grid place-items-center rounded-md transition-colors ${app.config!.kind === k.kind ? 'bg-[var(--color-lumen)]/20 text-[var(--color-lumen)]' : 'glass-soft text-[var(--color-mist)] hover:text-[var(--color-vapor)]'}`}>{k.icon}</button>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 pt-3 border-t border-[var(--color-glass-edge)]">
                            <div className="flex flex-wrap items-center gap-2">
                              <button onClick={() => setSendMenu(sendMenu === app.id ? null : app.id)} className={`text-[12px] px-3 py-2 rounded-full flex items-center gap-1 transition-colors ${(now || ins || board) ? 'bg-[var(--color-lumen)]/15 text-[var(--color-lumen)]' : 'glass-soft hover:bg-white/10 text-[var(--color-mist)]'}`}><Share2 className="w-3 h-3" /> Send to…{(now || ins || board) && <span className="ml-0.5 text-[11px]">{[now && 'Now', ins && 'Insights', board && 'Board', shared && 'Shared'].filter(Boolean).join(' · ')}</span>}</button>
                              <button onClick={() => { setRenaming(app.id); setRenameText(app.title || vibeTitle(app.template)); }} title="Rename" className="text-[12px] px-2 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><Pencil className="w-3 h-3" /></button>
                              <button onClick={() => w.duplicateVibe(app.id)} title="Duplicate" className="text-[12px] px-2 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><Copy className="w-3 h-3" /></button>
                              <button onClick={() => exportCsv(app)} title="Export CSV" className="text-[12px] px-2 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><Download className="w-3 h-3" /></button>
                              <button onClick={() => exportPng(app)} title="Export PNG" className="text-[12px] px-2 py-2 rounded-full glass-soft hover:bg-white/10 text-[var(--color-mist)]"><ImageIcon className="w-3 h-3" /></button>
                              <span className="flex-1" />
                              <button onClick={() => w.removeVibe(app.id)} aria-label="Delete tool" className="text-[var(--color-trace)] hover:text-[var(--color-coral)] p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            {sendMenu === app.id && (
                              <div className="mt-2 flex flex-col gap-1 glass-soft p-2 rounded-xl">
                                {([
                                  { on: now, toggle: () => now ? w.unpinVibe(app.id) : w.pinVibe(app.id), icon: <Radio className="w-3.5 h-3.5" />, label: nowLabel, desc: 'Live on the workspace rail' },
                                  { on: w.wsItems.some(i => i.lens === w.lens && i.kind === 'tool' && i.toolRef === app.id), toggle: () => w.wsAddTool(app.id), icon: <PenSquare className="w-3.5 h-3.5" />, label: 'Workspace', desc: 'A reference card on your canvas' },
                                  { on: ins, toggle: () => ins ? w.removeInsights(app.id) : w.sendInsights(app.id), icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Insights', desc: 'In the analytics view' },
                                  { on: board, toggle: () => board ? w.boardRemove(`nb-${w.lens}-tool-${app.id}`) : w.boardAdd('tool', app.id), icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Board', desc: 'A draggable card on the home board' },
                                  { on: shared, toggle: () => shared ? w.unpublishTool(app.id) : w.publishTool(app.id), icon: <Share2 className="w-3.5 h-3.5" />, label: w.lens === 'hr' ? 'Everyone’s My World' : 'Team’s My World', desc: 'Your people can add it to their own board' },
                                ]).map((dst, di) => (
                                  <button key={di} onClick={dst.toggle} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${dst.on ? 'bg-[var(--color-lumen)]/12' : 'hover:bg-white/8'}`}>
                                    <span className={dst.on ? 'text-[var(--color-lumen)]' : 'text-[var(--color-mist)]'}>{dst.icon}</span>
                                    <span className="flex-1 min-w-0"><span className="block text-[13px] text-[var(--color-vapor)]">{dst.label}</span><span className="block text-[11px] text-[var(--color-trace)]">{dst.desc}</span></span>
                                    <span className={`w-4 h-4 rounded-full border grid place-items-center ${dst.on ? 'bg-[var(--color-lumen)] border-[var(--color-lumen)]' : 'border-[var(--color-glass-edge)]'}`}>{dst.on && <Check className="w-3 h-3 text-[var(--color-abyss)]" />}</span>
                                  </button>
                                ))}
                                <button onClick={() => setSharePersonFor(sharePersonFor === app.id ? null : app.id)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/8 transition-colors">
                                  <span className="text-[var(--color-mist)]"><UserPlus className="w-3.5 h-3.5" /></span>
                                  <span className="flex-1 min-w-0"><span className="block text-[13px] text-[var(--color-vapor)]">Share to a person…</span><span className="block text-[11px] text-[var(--color-trace)]">Send it to one teammate's My World</span></span>
                                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-trace)] transition-transform ${sharePersonFor === app.id ? 'rotate-180' : ''}`} />
                                </button>
                                {sharePersonFor === app.id && (
                                  <div className="ml-2 pl-2 border-l border-[var(--color-glass-edge)] flex flex-col gap-0.5">
                                    {w.people.filter(pp => pp.managerId === 'm1').slice(0, 6).map(pp => { const onP = w.sharedTools.some(t => t.appId === app.id && t.to === pp.id); return (
                                      <button key={pp.id} onClick={() => onP ? w.unpublishTool(app.id) : w.publishTool(app.id, pp.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${onP ? 'bg-[var(--color-lumen)]/12' : 'hover:bg-white/8'}`}>
                                        <span className="text-[13px] text-[var(--color-vapor)] flex-1 truncate">{pp.name}</span>
                                        {onP && <Check className="w-3 h-3 text-[var(--color-lumen)]" />}
                                      </button>
                                    ); })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ); })()}
                    </div>
                  ))}
                </div>
              </div>

              {selected.length >= 2 && (
                <div className="shrink-0 px-6 pb-2 flex justify-center">
                  <div className="glass-elevated px-3 py-2 flex items-center gap-3" style={{ borderRadius: 9999 }}>
                    <span className="text-[13px] text-[var(--color-mist)]">{selected.length} selected</span>
                    <button onClick={() => { const parts = selected.map(id => w.vibeApps.find(v => v.id === id)?.template).filter(Boolean) as string[]; w.combineVibe(parts, `Dashboard · ${parts.length} views`); setSelected([]); }} className="text-[13px] px-3 py-2 rounded-full brand-gradient-btn text-white flex items-center gap-2"><LayoutDashboard className="w-3.5 h-3.5" /> Combine into dashboard</button>
                    <button onClick={() => setSelected([])} className="text-[13px] text-[var(--color-trace)] hover:text-[var(--color-vapor)]">Clear</button>
                  </div>
                </div>
              )}
              {/* composer */}
              <div className="shrink-0 px-6 pb-5 pt-2">
                <div className="max-w-[680px] mx-auto glass-elevated p-3" style={{ borderRadius: 22 }} onDrop={onDrop} onDragOver={e => e.preventDefault()}>
                  <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) buildFromFile(f.name); e.currentTarget.value = ""; }} />
                  <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    rows={2} placeholder="Describe a tool, refine the last one, or drop a file…" className="w-full bg-transparent outline-none resize-none text-sm text-[var(--color-vapor)] placeholder:text-[var(--color-trace)] px-2 pt-1" />
                  <div className="flex items-center gap-1 px-1">
                    <button onClick={attach} aria-label="Attach image" className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)] transition-colors"><ImageIcon className="w-4 h-4" /></button>
                    <button onClick={() => fileRef.current?.click()} aria-label="Attach file — build from a file" className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-[var(--color-mist)] transition-colors"><Paperclip className="w-4 h-4" /></button>
                    <button onClick={() => { if (!speech.supported) { w.toast('Voice input isn\u2019t supported in this browser', 'warn'); return; } speech.toggle(); }} aria-label="Voice" className={`w-8 h-8 grid place-items-center rounded-full transition-colors ${speech.listening ? 'text-[var(--color-halo-text)] bg-[var(--color-lumen-soft)] animate-pulse' : 'hover:bg-white/10 text-[var(--color-mist)]'}`}><Mic className="w-4 h-4" /></button>
                    <span className="flex-1" />
                    <button onClick={submit} disabled={!text.trim()} aria-label="Send" className="w-9 h-9 grid place-items-center rounded-full brand-gradient-btn text-white disabled:opacity-40 hover:brightness-110 transition"><ArrowUp className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT — predefined prompts + recipes */}
            <aside className="min-h-0 flex flex-col border-l border-[var(--color-glass-edge)] p-3">
              <div className="panel-scroll flex-1 min-h-0 overflow-y-auto -mx-1 px-1 space-y-5">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-mist)] mb-1">Build a tool</div>
                  <div className="text-[12px] text-[var(--color-trace)] mb-2">One click builds a ready tool from your data.</div>
                  <div className="flex flex-col gap-2">
                    {VIBE_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => w.createVibe(t.id)} title={t.blurb} className="text-left px-3 py-2 rounded-xl glass-soft hover:bg-white/10 transition-colors flex items-center gap-2">
                        <span className="text-[var(--color-halo-text)] shrink-0">{VIBE_ICON[t.id]}</span>
                        <span className="text-[13px] text-[var(--color-vapor)]">{t.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-mist)] mb-1">Recipes</div>
                  <div className="text-[12px] text-[var(--color-trace)] mb-2">Spin up a whole workspace — several tools at once.</div>
                  <div className="flex flex-col gap-2">
                    {CANVAS_MODULES.map(mod => (
                      <button key={mod.id} onClick={() => { mod.builds.forEach(b => w.createVibe(b)); w.toast(`${mod.label} — built ${mod.builds.length} tools`, 'ok'); }} className="text-left px-3 py-3 rounded-xl glass-soft hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-[13px] text-[var(--color-vapor)] font-medium"><Wand2 className="w-3 h-3 text-[var(--color-halo-text)]" /> {mod.label} <span className="text-[11px] text-[var(--color-trace)] font-normal">· {mod.builds.length} tools</span></div>
                        <div className="text-[12px] text-[var(--color-mist)] leading-snug mt-1">{mod.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-mist)] mb-1">Widgets</div>
                  <div className="text-[12px] text-[var(--color-trace)] mb-2">Freeform primitives — or name the metric in chat, e.g. “a gauge for goal completion”.</div>
                  <div className="grid grid-cols-2 gap-2">
                    {WIDGET_KINDS.map(k => (
                      <button key={k.kind} onClick={() => w.createWidget(k.kind, 'New metric')} className="text-left px-3 py-2 rounded-xl glass-soft hover:bg-white/10 transition-colors flex items-center gap-2 text-[var(--color-halo-text)]">
                        {k.icon}<span className="text-[13px] text-[var(--color-vapor)]">{k.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
