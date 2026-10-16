'use client';

type Chip<T extends string> = { id: T; label: string };

// A row of design-system filter chips with one selected.
export function ChipGroup<T extends string>({ chips, value, onChange, label }: { chips: Chip<T>[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button key={c.id} type="button" className="ds-chip ds-chip-sm" aria-pressed={c.id === value} onClick={() => onChange(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
