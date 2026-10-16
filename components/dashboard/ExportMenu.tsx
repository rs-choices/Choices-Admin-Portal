'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

export type ExportOption = { label: string; desc: string; run: () => void };

// Outline "Export" button with a three-option menu. Each option shows
// "Exporting" for 600 ms before it runs, as in the prototype.
export function ExportMenu({ options }: { options: ExportOption[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer.current);
    };
  }, []);

  const pick = (o: ExportOption) => {
    setOpen(false);
    setBusy(true);
    timer.current = setTimeout(() => {
      o.run();
      setBusy(false);
    }, 600);
  };

  return (
    <div ref={ref} className="relative" data-print="hide">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        {busy ? 'Exporting' : 'Export'}
      </Button>
      {open && (
        <div className="absolute right-0 top-[46px] z-30 flex w-[280px] flex-col gap-0.5 rounded-lg bg-white p-1.5 shadow-pop">
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => pick(o)}
              className="flex cursor-pointer flex-col gap-0.5 rounded-[10px] border-none bg-transparent px-3 py-2.5 text-left hover:bg-page"
            >
              <span className="text-sm font-semibold text-ink">{o.label}</span>
              <span className="text-xs text-muted">{o.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
