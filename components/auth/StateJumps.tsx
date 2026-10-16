'use client';

import { JUMPS, JUMP_LABEL, type Jump } from './states';

// Prototype-only chips that jump straight to a sign-in state.
export function StateJumps({ active, onPick }: { active: Jump | null; onPick: (j: Jump) => void }) {
  return (
    <div className="mt-auto flex flex-col items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">Prototype · jump to state</span>
      <div className="flex max-w-[760px] flex-wrap justify-center gap-1.5">
        {JUMPS.map((j) => (
          <button key={j} type="button" className="ds-chip" aria-pressed={active === j} onClick={() => onPick(j)}>
            {JUMP_LABEL[j]}
          </button>
        ))}
      </div>
    </div>
  );
}
