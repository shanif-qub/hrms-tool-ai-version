import { useState } from 'react';
import { avatarUrl } from '../avatar';

// Circular display-picture with a graceful initial-letter fallback.
export function Avatar({ seed, name, size = 28, className = '' }: { seed: string; name: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const dims = { width: size, height: size } as const;
  if (failed) {
    return (
      <span style={{ ...dims, fontSize: Math.round(size * 0.42) }}
        className={`rounded-full grid place-items-center bg-[var(--color-fathom)] border border-[var(--color-glass-edge)] font-bold text-[var(--color-vapor)] shrink-0 ${className}`}>
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <img src={avatarUrl(seed, size * 2)} alt={name} loading="lazy" onError={() => setFailed(true)}
      style={dims} className={`rounded-full object-cover shrink-0 bg-[var(--color-glass-2)] ${className}`} />
  );
}
