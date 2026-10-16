'use client';

// Design-system switch: teal track when on, grey when off.
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`flex h-[26px] w-11 shrink-0 cursor-pointer rounded-pill border-none p-[3px] transition-colors ${on ? 'justify-end bg-brand-teal' : 'justify-start bg-[var(--pure-black-variable-50)]'}`}
    >
      <span className="size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" />
    </button>
  );
}
