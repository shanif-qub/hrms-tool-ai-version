// Realistic stock portrait photos, deterministic per person. A few named people are
// pinned to a specific portrait so identity/gender reads correctly; everyone else is
// seeded by name via pravatar. Rendered at runtime; falls back to the initial letter.
const PINNED: Record<string, string> = {
  'Alex Mercer': 'https://randomuser.me/api/portraits/men/32.jpg',
};
export function avatarUrl(seed: string, size = 128) {
  return PINNED[seed] ?? `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`;
}
