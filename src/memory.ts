// memory — Phase E. Demo-grade conversation memory. Persists a small set of
// "threads" (what you were looking into) to localStorage so Q can offer to pick
// things back up. HONEST SCOPE: this is device-local only. It is NOT cross-device,
// not a server-backed profile, and not the "colleague who remembers everything"
// a real deployment would build on a backend. Named accordingly everywhere.

import { Persona } from './types';

export interface MemoryThread {
  id: string;
  lens: Persona;
  topic: string;      // short human label, e.g. "Sarah's flight risk"
  entity?: string;    // resolved subject if any, e.g. "Sarah Jenkins"
  lastText: string;   // the user's phrasing, for the recall chip
  at: number;         // epoch ms
  count: number;      // times revisited
}

const KEY = 'q_memory_threads_v1';
const MAX = 12;

function load(): MemoryThread[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(t: MemoryThread[]) {
  try { localStorage.setItem(KEY, JSON.stringify(t.slice(0, MAX))); } catch { /* ignore */ }
}

// Very small topic extractor: pulls a subject from the user's phrasing. Deliberately
// conservative — only remembers turns that look like a real line of inquiry, not
// every "hi" or one-word nav.
const TOPIC_HINTS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/(?:about|on|for|is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/, m => m[1]],
  [/\b(flight risk|attrition|retention|coverage|comp|compensation|payroll|onboarding|attendance|engagement|headcount|leave|workload|reviews?)\b/i, m => m[1].toLowerCase()],
];

export function extractTopic(text: string): { topic: string; entity?: string } | null {
  const t = text.trim();
  if (t.length < 6) return null;                       // too terse to be a thread
  if (/^(hi|hello|hey|thanks|ok|yes|no|open|show|go)\b/i.test(t)) return null;
  const properName = t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  for (const [re, pick] of TOPIC_HINTS) {
    const m = t.match(re);
    if (m) { const topic = pick(m).trim(); if (topic.length >= 3) return { topic, entity: properName?.[1] }; }
  }
  // fall back to the first meaningful clause, capped
  const clause = t.replace(/[?.!]+$/, '').split(/\s+/).slice(0, 6).join(' ');
  return clause.length >= 6 ? { topic: clause, entity: properName?.[1] } : null;
}

/** Record a user turn as a thread (or bump an existing one on the same topic). */
export function remember(lens: Persona, userText: string): void {
  const ex = extractTopic(userText);
  if (!ex) return;
  const threads = load();
  const key = ex.topic.toLowerCase();
  const existing = threads.find(x => x.lens === lens && x.topic.toLowerCase() === key);
  if (existing) {
    existing.at = Date.now(); existing.count += 1; existing.lastText = userText;
    save([existing, ...threads.filter(x => x !== existing)]);
  } else {
    save([{ id: `th${Date.now()}`, lens, topic: ex.topic, entity: ex.entity, lastText: userText, at: Date.now(), count: 1 }, ...threads]);
  }
}

/** The most recent thread for this lens from a PRIOR session (not the current one).
 *  Returns null if nothing worth resurfacing. `sinceMs` guards against echoing a
 *  thread the user is mid-conversation on. */
export function lastThread(lens: Persona, olderThanMs = 60_000): MemoryThread | null {
  const now = Date.now();
  const t = load().filter(x => x.lens === lens && now - x.at > olderThanMs).sort((a, b) => b.at - a.at);
  return t[0] ?? null;
}

/** Threads mentioning a given entity — powers "you flagged her last visit". */
export function threadsFor(entity: string, lens: Persona): MemoryThread[] {
  const e = entity.toLowerCase();
  return load().filter(x => x.lens === lens && (x.entity?.toLowerCase().includes(e) || x.topic.toLowerCase().includes(e)));
}

export function clearMemory(): void { save([]); }
export function allThreads(): MemoryThread[] { return load(); }
