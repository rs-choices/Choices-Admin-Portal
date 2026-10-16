'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Timeline } from '@/components/ui/Timeline';
import { ago, fmtDateTime } from '@/lib/format';
import type { Verification } from '@/lib/types';
import { KIND_LABEL, ME, STATUS_LABEL, STATUS_TONE, activityFor, authorityFor, detailFields, historyDot, isOpen } from '@/lib/verification';

export type DetailAction = 'approve' | 'changes' | 'reject' | 'note';
/** Index into `v.history` of a note the signed-in admin wrote. */
export type NoteAction = { edit: number } | { del: number };

const CARD = 'flex flex-col rounded-xl bg-white p-5 shadow-card';
const H2 = 'm-0 font-display text-lg font-semibold';

function MapPreview({ v }: { v: Verification }) {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-lg bg-[rgb(236,240,238)]">
      <div className="absolute inset-x-0 top-[38%] h-2.5 bg-white" />
      <div className="absolute inset-x-0 top-[72%] h-1.5 bg-white" />
      <div className="absolute inset-y-0 left-[28%] w-2 bg-white" />
      <div className="absolute inset-y-0 left-[66%] w-3 bg-white" />
      <div className="absolute -bottom-[60px] -right-10 h-40 w-[220px] rounded-full bg-[var(--activities-blue-opacity-20)]" />
      <div className="absolute left-[8%] top-[8%] h-[60px] w-[90px] rounded-[14px] bg-[var(--activities-green-opacity-20)]" />
      <div
        className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
        style={{ left: v.location.x + '%', top: v.location.y + '%' }}
      >
        <span className="whitespace-nowrap rounded-pill bg-brand-purple px-2.5 py-1 text-xs font-semibold text-white shadow-card">
          {v.name.split(' · ')[0]}
        </span>
        <span className="mt-0.5 text-brand-peach">
          <Icon name="map-pin" size={28} />
        </span>
      </div>
      <span className="absolute bottom-2 left-2.5 text-[11px] text-muted">Map preview</span>
    </div>
  );
}

function DocumentViewer({ v, onDownload }: { v: Verification; onDownload: (name: string) => void }) {
  const [i, setI] = useState(0);
  const doc = v.docs[Math.min(i, v.docs.length - 1)];
  const flags = v.flags ?? [];
  const sheet: [string, string][] = [
    ['Licence no.', v.licence],
    ['Trade name', v.company],
    ['Legal form', 'Limited Liability Company'],
    ['Licensee', v.owner],
    ['Issue date', '14 Mar 2025'],
    ['Expiry date', '13 Mar 2027'],
    ['Activity', activityFor(v.type)],
  ];
  return (
    <section className={`${CARD} gap-3.5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={H2}>Documents</h2>
        <Button variant="text" onClick={() => onDownload(doc.name)}>
          Download
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {v.docs.map((x, k) => {
          const on = x === doc;
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setI(k)}
              aria-pressed={on}
              className={`flex h-9 cursor-pointer items-center gap-2 rounded-[12px] border-none px-3 text-[13px] font-medium ${
                on ? 'bg-tint-purple text-brand-purple shadow-[inset_0_0_0_1px_var(--color-brand-purple)]' : 'bg-surface-muted text-ink'
              }`}
            >
              <Icon name="file-text" size={16} />
              {x.name}
              <span className="font-normal opacity-70">{x.size}</span>
              {flags.includes(x.name) && <span className="size-1.5 rounded-full bg-[var(--activities-blue-500)]" />}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center rounded-lg bg-surface-muted p-6">
        <div className="flex aspect-[1/1.32] w-full max-w-[420px] flex-col gap-3 rounded-[4px] bg-white px-[26px] py-7 text-[11px] text-[var(--pure-black-variable-300)] shadow-card">
          <div className="flex items-start justify-between gap-3">
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-ink">{authorityFor(v.emirate)}</span>
              <span>{doc.name.replace(/\.(pdf|jpg)$/, '')}</span>
            </span>
            <span className="size-10 shrink-0 rounded-full shadow-[inset_0_0_0_2px_var(--primary-purple-opacity-20)]" />
          </div>
          <div className="h-px bg-[var(--color-border-subtle)]" />
          {sheet.map(([k, val]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
              <span>{k}</span>
              <span className="font-medium text-ink">{val}</span>
            </div>
          ))}
          <div className="mt-auto flex flex-col gap-1.5">
            {[92, 84, 60].map((w) => (
              <div key={w} className="h-1.5 rounded bg-surface-muted" style={{ width: w + '%' }} />
            ))}
          </div>
        </div>
      </div>
      <span className="text-center text-xs text-muted">Page 1 of {doc.pages} · Preview</span>
    </section>
  );
}

export function VerificationDetail({
  v,
  onAction,
  onAssign,
  onUnassign,
  canUnassign,
  onNote,
  onDownload,
}: {
  v: Verification;
  onAction: (a: DetailAction) => void;
  onAssign: () => void;
  onUnassign: () => void;
  /** Super admins can unassign anyone, including themselves. */
  canUnassign: boolean;
  onNote: (a: NoteAction) => void;
  onDownload: (name: string) => void;
}) {
  const open = isOpen(v);
  const flags = v.flags ?? [];
  return (
    <>
      <Link href="/verification" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium no-underline">
        <Icon name="arrow-left" size={16} />
        Verification queue
      </Link>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">{v.name}</h1>
            <Badge tone={STATUS_TONE[v.status]} dot>
              {STATUS_LABEL[v.status]}
            </Badge>
          </div>
          <span className="text-sm text-muted">
            {KIND_LABEL[v.kind]} · {v.type} · {v.emirate} · Submitted {fmtDateTime(v.submitted)} · Waiting {open ? ago(v.submitted) : '—'} ·
            Assignee: {v.assignee || 'Unassigned'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {v.assignee !== ME && (
            <Button variant="text" onClick={onAssign} className="px-2">
              Assign to me
            </Button>
          )}
          {v.assignee && canUnassign && (
            <Button variant="text" onClick={onUnassign} className="px-2">
              Unassign
            </Button>
          )}
          <Button variant="text" onClick={() => onAction('note')} className="px-2">
            Add internal note
          </Button>
          {open && (
            <>
              <button
                type="button"
                onClick={() => onAction('reject')}
                className="h-[38px] cursor-pointer rounded-pill border-none bg-transparent px-4 font-button text-sm font-bold text-error shadow-[inset_0_0_0_1px_var(--error-500)] hover:bg-[var(--error-opacity-10)]"
              >
                Reject
              </button>
              <Button variant="outline" size="sm" onClick={() => onAction('changes')}>
                Request changes
              </Button>
              <Button size="sm" onClick={() => onAction('approve')}>
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
      {v.status === 'changes' && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--activities-blue-opacity-10)] px-4 py-3 text-sm text-[var(--activities-blue-variable-700)]">
          <Icon name="info" size={18} />
          Waiting on the business to fix the flagged items. You can still approve or reject.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-start gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <section className={`${CARD} gap-1`}>
            <h2 className={`${H2} mb-2`}>Submitted details</h2>
            {detailFields(v).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[minmax(110px,170px)_minmax(0,1fr)] gap-3 border-t border-subtle py-2.5 text-sm">
                <span className="text-muted">{label}</span>
                <span className="flex flex-wrap items-center gap-2 break-words font-medium">
                  {value}
                  {flags.includes(label) && (
                    <span className="inline-flex h-5 items-center rounded-pill bg-[var(--activities-blue-opacity-10)] px-2 text-[11px] font-semibold text-[var(--activities-blue-variable-700)]">
                      Needs fixing
                    </span>
                  )}
                </span>
              </div>
            ))}
          </section>
          <section className={`${CARD} gap-3`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className={H2}>Branch location</h2>
              <span className="text-[13px] text-muted">{v.location.area}</span>
            </div>
            <MapPreview v={v} />
          </section>
          <section className={`${CARD} gap-1`}>
            <h2 className={`${H2} mb-2`}>Outlets</h2>
            {v.outlets.map((o) => (
              <div key={o.name} className="flex items-center justify-between gap-3 border-t border-subtle py-2.5 text-sm">
                <span className="font-medium">{o.name}</span>
                <span className="inline-flex h-[22px] items-center rounded-pill bg-tint-purple px-2.5 text-xs font-semibold text-brand-purple">
                  {o.type}
                </span>
              </div>
            ))}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <DocumentViewer key={v.id} v={v} onDownload={onDownload} />
          <section className={`${CARD} gap-3`}>
            <h2 className={H2}>History</h2>
            <Timeline
              items={v.history
                .map((h, i) => ({ h, i }))
                .reverse()
                .map(({ h, i }) => ({
                  key: h.at + i,
                  what: h.what,
                  meta: h.who + ' · ' + fmtDateTime(h.at),
                  dot: historyDot(h),
                  body: h.body,
                  bodyBg: h.kind === 'note' ? 'var(--warning-opacity-10)' : 'var(--color-surface-muted)',
                  // Only the author of a note can edit or delete it.
                  actions:
                    h.kind === 'note' && h.who === ME ? (
                      <>
                        <button type="button" onClick={() => onNote({ edit: i })} className="cursor-pointer border-none bg-transparent p-0 font-button text-xs font-bold text-brand-peach">
                          Edit
                        </button>
                        <button type="button" onClick={() => onNote({ del: i })} className="cursor-pointer border-none bg-transparent p-0 font-button text-xs font-bold text-error">
                          Delete
                        </button>
                      </>
                    ) : undefined,
                }))}
            />
          </section>
        </div>
      </div>
    </>
  );
}
