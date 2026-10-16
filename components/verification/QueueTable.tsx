'use client';

import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { ago, fmtDateTime, hoursSince } from '@/lib/format';
import type { Verification } from '@/lib/types';
import { STATUS_LABEL, STATUS_TONE, isOpen } from '@/lib/verification';

const COLS = 'grid grid-cols-[minmax(220px,2.2fr)_90px_150px_100px_140px_170px_36px] items-center';

export function QueueTable({
  rows,
  loading,
  error,
  emptyTitle,
  emptyBody,
  onOpen,
  onRetry,
}: {
  rows: Verification[];
  loading: boolean;
  error: boolean;
  emptyTitle: string;
  emptyBody: string;
  onOpen: (id: string) => void;
  onRetry: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-card">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className={`${COLS} h-11 text-xs font-semibold uppercase tracking-[.06em] text-muted`}>
            <span className="px-5">Name</span>
            <span className="px-3">Type</span>
            <span className="px-3">Submitted</span>
            <span className="px-3">Waiting</span>
            <span className="px-3">Assignee</span>
            <span className="px-3">Status</span>
            <span />
          </div>
          {loading &&
            [70, 55, 80, 62, 74].map((w) => (
              <div key={w} className="flex h-[52px] items-center border-t border-subtle px-5">
                <div className="ca-pulse h-3.5 rounded-pill bg-surface-muted" style={{ width: w + '%' }} />
              </div>
            ))}
          {!loading &&
            !error &&
            rows.map((v) => {
              const late = isOpen(v) && hoursSince(v.submitted) > 72;
              return (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(v.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(v.id)}
                  className={`${COLS} min-h-14 cursor-pointer border-t border-subtle text-sm hover:bg-page`}
                >
                  <span className="flex min-w-0 flex-col gap-0.5 px-5 py-2">
                    <span className="font-semibold">{v.name}</span>
                    <span className="text-xs text-muted">{v.parent ? 'Part of ' + v.parent : v.licence + ' · ' + v.emirate}</span>
                  </span>
                  <span className="px-3 text-[var(--pure-black-variable-300)]">{v.type}</span>
                  <span className="whitespace-nowrap px-3 text-[var(--pure-black-variable-300)]">{fmtDateTime(v.submitted)}</span>
                  <span className={`whitespace-nowrap px-3 ${late ? 'font-semibold text-error' : 'text-[var(--pure-black-variable-300)]'}`}>
                    {isOpen(v) ? ago(v.submitted) : '—'}
                  </span>
                  <span className="whitespace-nowrap px-3 text-[var(--pure-black-variable-300)]">{v.assignee || 'Unassigned'}</span>
                  <span className="px-3">
                    <Badge tone={STATUS_TONE[v.status]} dot>
                      {STATUS_LABEL[v.status]}
                    </Badge>
                  </span>
                  <span className="text-muted">
                    <Icon name="chevron-right" size={16} />
                  </span>
                </div>
              );
            })}
        </div>
      </div>
      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 border-t border-subtle px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[var(--success-opacity-10)] text-success">
            <Icon name="check" size={22} />
          </span>
          <span className="text-[15px] font-semibold">{emptyTitle}</span>
          <span className="text-[13px] text-muted">{emptyBody}</span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2.5 border-t border-subtle px-6 py-12 text-center">
          <span className="text-[15px] font-semibold">Couldn&apos;t load the queue.</span>
          <span className="text-[13px] text-muted">The verification service timed out. Nothing was changed.</span>
          <button type="button" className="ds-button ds-button-sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
