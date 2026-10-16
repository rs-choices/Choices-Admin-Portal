'use client';

type Tab<T extends string> = { id: T; label: string; count?: number };

// Underlined tab row with optional count pills, as on the admin list screens.
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: Tab<T>[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-subtle">
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={`-mb-px flex cursor-pointer items-center gap-2 whitespace-nowrap border-none bg-transparent px-3.5 py-3 text-sm ${
              on ? 'font-semibold text-brand-purple shadow-[inset_0_-2px_0_var(--color-brand-purple)]' : 'font-medium text-muted'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-surface-muted px-1.5 text-[11px] font-bold text-[var(--pure-black-variable-300)]">
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
