// Gentle haptics paired with sounds — calm, never buzzy. Intensity hints AI confidence.
export type Confidence = 'high' | 'med' | 'low';
export function haptic(c: Confidence) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    if (c === 'high') navigator.vibrate(16);
    else if (c === 'med') navigator.vibrate(10);
    else navigator.vibrate(5);
  } catch { /* no-op */ }
}
