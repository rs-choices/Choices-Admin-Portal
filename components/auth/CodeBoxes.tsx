'use client';

// Six digit boxes over one transparent input, so typing, deleting, pasting and
// one-time-code autofill all work like a normal field. Non-digits are dropped,
// so "123 456" pastes as 123456.
export function CodeBoxes({
  code,
  bad,
  locked,
  onChange,
  onEnter,
}: {
  code: string;
  bad: boolean;
  locked: boolean;
  onChange: (code: string) => void;
  onEnter: () => void;
}) {
  const focusAt = Math.min(code.length, 5);
  return (
    <label className="relative grid cursor-text grid-cols-6 gap-2">
      {Array.from({ length: 6 }, (_, i) => {
        const ch = code[i] ?? '';
        const focus = !locked && i === focusAt && code.length < 6;
        const ring = bad
          ? 'inset 0 0 0 1px var(--error-500)'
          : focus
            ? 'inset 0 0 0 1px var(--color-brand-purple)'
            : ch
              ? 'inset 0 0 0 1px rgba(0,0,0,.14)'
              : 'none';
        return (
          <span
            key={i}
            aria-hidden="true"
            className="grid h-14 place-items-center rounded-[14px] font-display text-[22px] font-bold text-ink"
            style={{ background: !locked && ch ? '#fff' : 'var(--color-surface-muted)', boxShadow: ring }}
          >
            {ch}
            {focus && !ch && <span className="ca-blink h-6 w-0.5 bg-brand-purple" />}
          </span>
        );
      })}
      <input
        value={code}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="6-digit code"
        autoFocus
        disabled={locked}
        className="absolute inset-0 cursor-text border-none text-base opacity-0"
      />
    </label>
  );
}
