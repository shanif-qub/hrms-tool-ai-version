import { Persona, PersonToken, Pos } from './types';
import { MANAGER_ID } from './data';

export interface Link { from: Pos; to: Pos; risk: boolean; d?: string; fromId?: string; toId?: string; }
export interface Area { x: number; y: number; w: number; h: number; }
export interface Layout { people: Record<string, Pos>; links: Link[]; }

const TW = 210;                 // card width
const CW = TW + 8, CH = 72;     // collision box (card + breathing room)
const CARD_MID_Y = 30;          // link anchor
const SQUASH = 0.78;            // vertical ellipse ratio


/** Deterministic collision relaxation: overlapping card boxes push apart along
 *  their axis of least overlap; frozen indices never move; everything clamps. */
function relax(seats: Pos[], area: Area, frozen: Set<number> = new Set()) {
  const minX = area.x + 8, maxX = area.x + area.w - TW - 8;
  const minY = area.y + 8, maxY = area.y + area.h - 70;
  for (let iter = 0; iter < 160; iter++) {
    let moved = false;
    for (let i = 0; i < seats.length; i++) for (let j = i + 1; j < seats.length; j++) {
      const p1 = seats[i], p2 = seats[j];
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const ox = CW - Math.abs(dx), oy = CH - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      moved = true;
      const f1 = frozen.has(i), f2 = frozen.has(j);
      if (ox / CW < oy / CH) { const push = ox / 2 + 1, s = dx >= 0 ? 1 : -1; if (!f1) p1.x -= s * push * (f2 ? 2 : 1); if (!f2) p2.x += s * push * (f1 ? 2 : 1); }
      else { const push = oy / 2 + 1, s = dy >= 0 ? 1 : -1; if (!f1) p1.y -= s * push * (f2 ? 2 : 1); if (!f2) p2.y += s * push * (f1 ? 2 : 1); }
    }
    seats.forEach((p, i) => { if (!frozen.has(i)) { p.x = Math.min(maxX, Math.max(minX, p.x)); p.y = Math.min(maxY, Math.max(minY, p.y)); } });
    if (!moved) break;
  }
}

/** Ramanujan approximation of ellipse circumference. */
const circ = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

/**
 * Radial constellation that scales with headcount.
 * 1) Seed people across concentric rings, each holding only what its
 *    circumference fits (arc spacing ≈ one card width), alternate rings
 *    angle-offset so cards interleave.
 * 2) Run a deterministic relaxation pass: overlapping card boxes push apart
 *    along their axis of least overlap, everything clamps to the viewport and
 *    keeps clear of the centre card. Links are computed from final positions.
 */
export function computeLayout(_lens: Persona, people: PersonToken[], area: Area): Layout {
  const cx = area.x + area.w / 2 - TW / 2;
  const cy = area.y + area.h / 2 - 60;
  const out: Layout = { people: {}, links: [] };

  const centre = people.find(p => p.id === MANAGER_ID);
  const reports = people.filter(p => p.managerId === MANAGER_ID);
  if (!centre) { people.forEach((p, i) => { out.people[p.id] = { x: cx, y: cy + i * 10 }; }); return out; }

  out.people[centre.id] = { x: cx, y: cy };

  const maxRx = Math.max(230, area.w / 2 - TW / 2 - 20);
  const maxRy = Math.max(170, area.h / 2 - 92);
  const baseR = Math.min(300, Math.max(210, Math.min(area.w, area.h) * 0.30));

  // --- 1 · ring seeding ---
  const seats: Pos[] = [];
  let remaining = reports.length; let r = baseR; let ring = 0;
  while (remaining > 0 && ring < 5) {
    const a = Math.min(r, maxRx), b = Math.min(r * SQUASH, maxRy);
    const cap = ring === 4 ? remaining : Math.min(remaining, Math.max(4, Math.floor(circ(a, b) / (TW * 1.02))));
    const offset = ring % 2 === 1 ? Math.PI / Math.max(cap, 1) : 0;
    for (let k = 0; k < cap; k++) seats.push({ x: cx + Math.cos(-Math.PI / 2 + offset + (k * 2 * Math.PI) / cap) * a, y: cy + Math.sin(-Math.PI / 2 + offset + (k * 2 * Math.PI) / cap) * b });
    remaining -= cap; r += 132; ring++;
  }

  // --- 2 · collision relaxation (shared helper; centre frozen at index 0) ---
  const allSeats = [out.people[centre.id], ...seats];
  relax(allSeats, area, new Set([0]));

  // --- 3 · assign + links from final positions ---
  reports.forEach((p, i) => {
    const pos = seats[i] ?? { x: cx, y: cy + 90 + i * 10 };
    out.people[p.id] = pos;
    out.links.push({ from: { x: cx + TW / 2, y: cy + CARD_MID_Y }, to: { x: pos.x + TW / 2, y: pos.y + CARD_MID_Y }, risk: p.status === 'flight_risk' });
  });
  return out;
}

/* ================= Hierarchical org tree ("galaxy") ================= */
// An org isn't a solar system — it's teams under leads under managers, possibly
// several disconnected roots. This lays out a tidy top-down chart:
//   · roots side by side; each subtree's width computed bottom-up
//   · leaf reports stack into short columns (2–3 tall) so wide pods stay compact
//   · branch children (people who lead others) recurse as their own blocks
//   · links are cubic béziers parent → child head
// If the forest exceeds the viewport width, x-positions compress uniformly.

const LEAF_COL_GAP = 16, BLOCK_GAP = 40, LEVEL_GAP = 118, STACK_GAP = 84;

interface TreeNode { p: PersonToken; kids: TreeNode[]; leafKids: TreeNode[]; branchKids: TreeNode[]; w: number }

export function computeOrgTree(people: PersonToken[], area: Area): Layout {
  const out: Layout = { people: {}, links: [] };
  const byId = new Map(people.map(p => [p.id, p]));
  const kidsOf = new Map<string, PersonToken[]>();
  people.forEach(p => { if (p.managerId && byId.has(p.managerId)) { const arr = kidsOf.get(p.managerId) ?? []; arr.push(p); kidsOf.set(p.managerId, arr); } });
  const roots = people.filter(p => !p.managerId || !byId.has(p.managerId));
  const availW = area.w - 32;

  // Try increasing leaf-stack heights until the forest fits the stage width.
  const attempt = (forceStack: number | null) => {
    const stackFor = (nLeaf: number) => forceStack ?? (nLeaf >= 5 ? 3 : 2);
    const build = (p: PersonToken): TreeNode => {
      const kids = (kidsOf.get(p.id) ?? []).map(build);
      const leafKids = kids.filter(k => k.kids.length === 0);
      const branchKids = kids.filter(k => k.kids.length > 0);
      const sh = stackFor(leafKids.length);
      const leafCols = Math.ceil(leafKids.length / sh);
      const leafW = leafCols > 0 ? leafCols * TW + (leafCols - 1) * LEAF_COL_GAP : 0;
      const branchW = branchKids.reduce((a, b) => a + b.w, 0) + (branchKids.length > 0 ? (branchKids.length - 1) * BLOCK_GAP : 0);
      const childW = leafW + branchW + (leafW > 0 && branchW > 0 ? BLOCK_GAP : 0);
      return { p, kids, leafKids, branchKids, w: Math.max(TW, childW) };
    };
    const trees = roots.map(build);
    const totalW = trees.reduce((a, t) => a + t.w, 0) + Math.max(0, trees.length - 1) * BLOCK_GAP * 1.5;
    return { trees, totalW, stackFor };
  };
  let plan = attempt(null);
  for (const s of [3, 4]) { if (plan.totalW <= availW) break; plan = attempt(s); }
  const overflow = plan.totalW > availW;

  const link = (fx: number, fy: number, tx: number, ty: number, risk: boolean, fromId?: string, toId?: string) => {
    const midY = (fy + ty) / 2;
    out.links.push({ from: { x: fx, y: fy }, to: { x: tx, y: ty }, risk, fromId, toId, d: `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}` });
  };
  const linkSpecs: { from: string; to: string; risk: boolean }[] = [];

  const place = (n: TreeNode, cxCenter: number, y: number) => {
    out.people[n.p.id] = { x: cxCenter - TW / 2, y };
    if (n.kids.length === 0) return;
    const sh = plan.stackFor(n.leafKids.length);
    const leafCols = Math.ceil(n.leafKids.length / sh);
    const leafW = leafCols > 0 ? leafCols * TW + (leafCols - 1) * LEAF_COL_GAP : 0;
    const branchW = n.branchKids.reduce((a, b) => a + b.w, 0) + (n.branchKids.length > 0 ? (n.branchKids.length - 1) * BLOCK_GAP : 0);
    const childW = leafW + branchW + (leafW > 0 && branchW > 0 ? BLOCK_GAP : 0);
    let x = cxCenter - childW / 2;
    const childY = y + LEVEL_GAP;
    for (let c = 0; c < leafCols; c++) {
      const colCX = x + TW / 2;
      for (let r = 0; r < sh; r++) {
        const idx = c * sh + r; if (idx >= n.leafKids.length) break;
        const kid = n.leafKids[idx];
        out.people[kid.p.id] = { x: colCX - TW / 2, y: childY + r * STACK_GAP };
        linkSpecs.push({ from: n.p.id, to: kid.p.id, risk: kid.p.status === 'flight_risk' });
      }
      x += TW + LEAF_COL_GAP;
    }
    if (leafCols > 0 && n.branchKids.length > 0) x += BLOCK_GAP - LEAF_COL_GAP;
    n.branchKids.forEach(b => {
      const bCX = x + b.w / 2;
      linkSpecs.push({ from: n.p.id, to: b.p.id, risk: b.p.status === 'flight_risk' });
      place(b, bCX, childY);
      x += b.w + BLOCK_GAP;
    });
  };

  let rx = area.x + Math.max(16, (area.w - plan.totalW) / 2);
  const topY = area.y + 16;
  plan.trees.forEach(t => { place(t, rx + t.w / 2, topY); rx += t.w + BLOCK_GAP * 1.5; });

  // Narrow-viewport guarantee: if the forest still overflows, relax + clamp.
  // Tidiness degrades gracefully; overlaps never ship.
  if (overflow) {
    const ids = Object.keys(out.people);
    const seats = ids.map(id => out.people[id]);
    relax(seats, area);
    // If relaxation couldn't converge (very small stages), snap to a clean flow
    // grid — hierarchy reads through the links; overlap never ships.
    let bad = false;
    for (let i = 0; i < seats.length && !bad; i++) for (let j = i + 1; j < seats.length; j++) {
      if (Math.abs(seats[i].x - seats[j].x) < TW - 6 && Math.abs(seats[i].y - seats[j].y) < 60) { bad = true; break; }
    }
    if (bad) {
      const cols = Math.max(2, Math.floor((area.w - 32) / (TW + 16)));
      const gw = cols * TW + (cols - 1) * 16;
      const gx = area.x + (area.w - gw) / 2;
      ids.forEach((id, i) => { out.people[id] = { x: gx + (i % cols) * (TW + 16), y: area.y + 16 + Math.floor(i / cols) * STACK_GAP }; });
    }
  }

  // links from FINAL positions (top-centre of child, bottom-centre of parent)
  linkSpecs.forEach(ls => {
    const f = out.people[ls.from], t = out.people[ls.to];
    if (f && t) link(f.x + TW / 2, f.y + 62, t.x + TW / 2, t.y, ls.risk, ls.from, ls.to);
  });
  return out;
}
