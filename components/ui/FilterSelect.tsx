'use client';

// Native select styled like the design's list filters; tinted when not "all".
export function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  const on = value !== 'all';
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 cursor-pointer rounded-[14px] border-none px-3 text-[13px] font-medium text-ink ${
        on ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--color-brand-purple)]' : 'bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]'
      }`}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
