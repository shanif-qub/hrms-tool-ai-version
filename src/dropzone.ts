// Registry of live token + Q rects so any dragged token can hit-test against
// any other token (token-on-token) or the Cue/Q bar (drag-to-Q).
export type ZoneKind = 'q' | 'token' | 'panel';
export interface Zone { id: string; rect: DOMRect; kind: ZoneKind; data?: any; }
const zones = new Map<string, Zone>();

export function registerZone(id: string, el: HTMLElement | null, kind: ZoneKind, data?: any) {
  if (!el) { zones.delete(id); return; }
  zones.set(id, { id, rect: el.getBoundingClientRect(), kind, data });
}
export function clearZone(id: string) { zones.delete(id); }

// Live Q-bar rect (registered zone preferred, live DOM as fallback so a stale
// registration can never swallow a drop).
function qBarRect(): DOMRect | null {
  const z = zones.get('cue');
  if (z) return z.rect;
  const el = typeof document !== 'undefined' ? document.getElementById('q-cue-bar') : null;
  return el ? el.getBoundingClientRect() : null;
}

// Graded proximity to the Q bar, for frictionless drag-to-Q. Tests the DRAGGED
// CARD'S RECTANGLE against the Q bar's rect inflated by `margin` (24px in every
// direction) — so the moment any edge of the card (typically its bottom border)
// enters the zone, it counts. Point-based tests felt broken because the pointer
// sits near the card's top, far above its bottom edge.
export type QProximity = 'none' | 'influence' | 'release';
const rectsOverlap = (a: DOMRect, b: { left: number; top: number; right: number; bottom: number }, m: number) =>
  a.left <= b.right + m && a.right >= b.left - m && a.top <= b.bottom + m && a.bottom >= b.top - m;

export function qProximityRect(card: { left: number; top: number; right: number; bottom: number }, margin = 24): QProximity {
  const r = qBarRect(); if (!r) return 'none';
  // release = card actually overlaps/touches the bar; influence = within `margin`
  if (rectsOverlap(r, card, 0)) return 'release';
  if (rectsOverlap(r, card, margin)) return 'influence';
  return 'none';
}
export function hitQBarRect(card: { left: number; top: number; right: number; bottom: number }, margin = 24): boolean {
  return qProximityRect(card, margin) !== 'none';
}

// Point-based variants kept for the token drag path (Motion gives a point).
export function qProximity(x: number, y: number, influence = 24, release = 6): QProximity {
  const r = qBarRect(); if (!r) return 'none';
  const within = (m: number) => x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
  if (within(release)) return 'release';
  if (within(influence)) return 'influence';
  return 'none';
}
export function hitQBar(x: number, y: number): boolean {
  return qProximity(x, y) !== 'none';
}
// Center of the Q bar in viewport coords (for the confirm pulse).
export function qBarCenter(): { cx: number; cy: number } | null {
  const r = qBarRect(); return r ? { cx: r.left + r.width / 2, cy: r.top + r.height / 2 } : null;
}

// Returns the topmost matching zone under (x,y); skips excludeId (the dragged token).
export function hit(x: number, y: number, kind: ZoneKind, excludeId?: string): Zone | null {
  let best: Zone | null = null; let bestArea = Infinity;
  for (const z of zones.values()) {
    if (z.kind !== kind || z.id === excludeId) continue;
    const r = z.rect;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      const area = r.width * r.height;            // prefer the smaller (more specific) target
      if (area < bestArea) { best = z; bestArea = area; }
    }
  }
  return best;
}
