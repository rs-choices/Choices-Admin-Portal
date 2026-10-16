import type { ReactNode } from 'react';

export type TimelineItem = { key: string; what: string; meta: string; dot: string; body?: string; bodyBg?: string; actions?: ReactNode };

// Vertical history with coloured dots, newest first, as on the detail pages.
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((h) => (
        <div key={h.key} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-[5px] size-2.5 rounded-full" style={{ background: h.dot, boxShadow: `0 0 0 3px #fff, 0 0 0 4px ${h.dot}` }} />
            <span className="my-1 w-0.5 flex-1 bg-[var(--color-border-subtle)]" />
          </div>
          <div className="flex flex-col gap-0.5 pb-4">
            <span className="text-sm font-medium">{h.what}</span>
            <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
              {h.meta}
              {h.actions}
            </span>
            {h.body && (
              <span className="mt-1.5 whitespace-pre-wrap rounded-[12px] px-3 py-2.5 text-[13px] leading-[1.45]" style={{ background: h.bodyBg }}>
                {h.body}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
