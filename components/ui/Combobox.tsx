'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

type Option = { value: string; label: string; count?: number };

// Searchable select, as on the Audit log: type to filter, Enter picks the
// first match, Escape closes, the x clears back to "all".
export function Combobox({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setTyped(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const chosen = value !== 'all';
  const text = typed ?? (chosen ? (options.find((o) => o.value === value)?.label ?? value) : '');
  const q = (typed ?? '').trim().toLowerCase();
  const list = [{ value: 'all', label: allLabel } as Option, ...options].filter((o) => !q || o.value === 'all' || o.label.toLowerCase().includes(q));
  const pick = (v: string) => {
    onChange(v);
    setTyped(null);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative min-w-[180px] flex-[0_1_240px]">
      <label
        className={`flex h-10 cursor-text items-center gap-2 rounded-[14px] px-3 text-muted ${
          chosen ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--color-brand-purple)]' : 'bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]'
        }`}
      >
        <Icon name="search" size={15} />
        <input
          value={text}
          onChange={(e) => {
            setTyped(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setTyped('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              setTyped(null);
            }
            if (e.key === 'Enter') pick(list.find((o) => o.value !== 'all')?.value ?? 'all');
          }}
          placeholder={allLabel}
          aria-label={label}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-ink outline-none"
        />
        {(chosen || !!typed) && (
          <button
            type="button"
            aria-label={'Clear ' + label.toLowerCase()}
            onMouseDown={(e) => {
              e.preventDefault();
              pick('all');
            }}
            className="grid cursor-pointer place-items-center border-none bg-transparent p-0 text-muted"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </label>
      {open && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-[46px] z-30 flex max-h-[260px] flex-col gap-0.5 overflow-y-auto rounded-lg bg-white p-1.5 shadow-pop">
          {list.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o.value);
              }}
              className={`flex cursor-pointer justify-between gap-2 rounded-[10px] border-none px-2.5 py-[9px] text-left text-[13px] text-ink hover:bg-page ${
                o.value === value ? 'bg-tint-purple font-semibold' : 'bg-transparent'
              }`}
            >
              {o.label}
              {o.count !== undefined && <span className="font-normal text-muted">{o.count}</span>}
            </button>
          ))}
          {list.length <= 1 && !!q && <span className="p-2.5 text-[13px] text-muted">No match for “{typed}”.</span>}
        </div>
      )}
    </div>
  );
}
