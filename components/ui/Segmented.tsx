'use client';

type Option<T extends string> = { value: T; label: string };

// Pill switcher used for the date range and the prototype role switcher.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  label: string;
}) {
  const pad = size === 'sm' ? 'px-3 py-[7px] text-xs' : 'px-4 py-2 text-[13px]';
  return (
    <div role="group" aria-label={label} className="flex rounded-[34px] bg-surface-muted p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`cursor-pointer whitespace-nowrap rounded-[34px] border-none ${pad} ${
              on ? 'bg-white font-semibold text-brand-purple shadow-seg' : 'bg-transparent text-muted'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
