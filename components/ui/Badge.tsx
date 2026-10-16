import type { ReactNode } from 'react';
import { tone as toneOf } from '@/lib/format';
import type { Tone } from '@/lib/types';

export function Badge({ tone, dot, children }: { tone: Tone; dot?: boolean; children: ReactNode }) {
  const t = toneOf(tone);
  return (
    <span
      className="inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 text-xs font-semibold"
      style={{ background: t.bg, color: t.fg }}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
