'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { Timeline } from '@/components/ui/Timeline';
import { BIZ_LABEL, BIZ_TONE, BRANCH_TONE, DETAIL_TABS, INVOICE_TONE, LISTING_TONE, PRICE_BAND_LABEL, activityDot, initials, type BizRow, type DetailTab } from '@/lib/businesses';
import { aed, fmtDate, fmtDateTime, fmtNum } from '@/lib/format';
import type { BusinessDetail as Detail, ListingStatus, Member, Role } from '@/lib/types';
import { ME } from '@/lib/verification';

const CARD = 'rounded-xl bg-white shadow-card';
const ROW = 'border-t border-subtle text-sm';

function Stat({ label, value, size = 24 }: { label: string; value: string; size?: number }) {
  return (
    <div className={`${CARD} flex flex-col gap-1.5 px-5 py-[18px]`}>
      <span className="text-[13px] text-muted">{label}</span>
      <span className="font-display font-bold" style={{ fontSize: size }}>
        {value}
      </span>
    </div>
  );
}

export function BusinessDetail({
  b,
  det,
  members,
  tab,
  role,
  onTab,
  onSuspend,
  onUnsuspend,
  onUnpublish,
  onRepublish,
  onRefund,
}: {
  b: BizRow;
  det: Detail;
  members: Member[];
  tab: DetailTab;
  role: Role;
  onTab: (t: DetailTab) => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onUnpublish: (outletId: string) => void;
  onRepublish: (outletId: string) => void;
  onRefund: (invoiceId: string) => void;
}) {
  const trial = b.status === 'trial';
  const suspended = b.status === 'suspended';
  // A branch with one outlet is just the branch; a big branch's outlets are each a place.
  const places = det.branches.flatMap((br) => br.outlets.map((o) => ({ ...o, branch: br.name + ' branch', single: br.outlets.length === 1 })));
  const team = members.filter((m) => m.bid === b.id);

  return (
    <>
      <Link href="/businesses" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium no-underline">
        <Icon name="arrow-left" size={16} />
        Businesses
      </Link>
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-tint-purple font-button text-lg font-bold text-brand-purple">{initials(b.name)}</span>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">{b.name}</h1>
            <Badge tone={BIZ_TONE[b.status]} dot>
              {BIZ_LABEL[b.status]}
            </Badge>
          </div>
          <span className="text-sm text-muted">
            {b.types.join(', ')} · {b.emirate} · {b.plan} plan · Joined {fmtDate(b.joined)} · {b.licence}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {!suspended && b.status !== 'pending' && (
            <button
              type="button"
              onClick={onSuspend}
              className="h-[38px] cursor-pointer rounded-pill border-none bg-transparent px-4 font-button text-sm font-bold text-error shadow-[inset_0_0_0_1px_var(--error-500)] hover:bg-[var(--error-opacity-10)]"
            >
              Suspend
            </button>
          )}
          {suspended && (
            <Button size="sm" onClick={onUnsuspend}>
              Unsuspend
            </Button>
          )}
        </div>
      </div>
      {suspended && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--error-opacity-10)] px-4 py-3 text-sm text-error">
          <Icon name="ban" size={18} />
          Suspended: {b.suspendReason}. Listings are hidden from clients and the team can&apos;t sign in.
        </div>
      )}
      {b.paymentFailed && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--warning-opacity-10)] px-4 py-3 text-sm text-[var(--warning-variable-700)]">
          <Icon name="credit-card" size={18} />
          Last payment failed. Retry it from Billing once the business updates its card.
        </div>
      )}

      <Tabs tabs={DETAIL_TABS} value={tab} onChange={onTab} />

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <Stat label="MRR" value={b.mrr ? aed(b.mrr) : '—'} />
            <Stat label="Bookings, 30 days" value={fmtNum(b.bookings30)} />
            <Stat label="Rating" value={b.reviews ? b.rating + ' ★' : '—'} />
            <Stat label={trial ? 'Trial ends' : 'Outlets'} value={trial && b.trialEnds ? fmtDate(b.trialEnds) : String(b.outlets)} />
          </div>
          <section className={`${CARD} flex flex-col p-5`}>
            <h2 className="m-0 mb-2 font-display text-lg font-semibold">Company</h2>
            {(
              [
                ['Owner', b.owner],
                ['Email', b.email],
                ['Phone', b.phone],
                ['Trade licence', b.licence],
                ['TRN', b.trn],
                ['Emirate', b.emirate],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className={`${ROW} grid grid-cols-[minmax(110px,180px)_minmax(0,1fr)] gap-3 py-2.5`}>
                <span className="text-muted">{k}</span>
                <span className="break-words font-medium">{v}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === 'branches' && (
        <div className="flex flex-col gap-4">
          {det.branches.map((br) => (
            <section key={br.name} className={`${CARD} flex flex-col p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <span className="flex flex-col gap-0.5">
                  <h2 className="m-0 font-display text-[17px] font-semibold">{br.name} branch</h2>
                  <span className="text-[13px] text-muted">{br.area}</span>
                </span>
                <Badge tone={BRANCH_TONE[br.status]} dot>
                  {br.status}
                </Badge>
              </div>
              {br.outlets.length > 1 && <span className="pb-1 text-xs text-muted">{br.outlets.length} places at this branch</span>}
              {br.outlets.map((o) => (
                <div key={o.id} className={`${ROW} flex flex-wrap items-center gap-3 py-2.5`}>
                  <span className="flex-1 font-medium">{br.outlets.length === 1 ? 'Shown in the app as one place' : o.name}</span>
                  <Badge tone="brand">{o.type}</Badge>
                  <span className="text-[13px] text-muted" title={PRICE_BAND_LABEL[o.priceBand] + ' per person'}>
                    {o.priceBand}
                  </span>
                  <Badge tone={LISTING_TONE[o.listing]}>{o.listing}</Badge>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {tab === 'listings' && (
        <div className="flex flex-col gap-4">
          {places.map((o) => (
            <section key={o.id} className={`${CARD} px-5 py-2`}>
              <div className="flex min-h-16 flex-wrap items-center gap-3.5 text-sm">
                <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-surface-muted text-muted">
                  <Icon name="image" size={20} />
                </span>
                <span className="flex flex-[1_1_200px] flex-col gap-0.5">
                  <span className="font-semibold">{o.name}</span>
                  <span className="text-xs text-muted">
                    Place · {o.type} · {o.priceBand} · {o.branch}
                  </span>
                </span>
                <ListingActions status={o.listing} unpublishedBy={o.unpublishedBy} onUnpublish={() => onUnpublish(o.id)} onRepublish={() => onRepublish(o.id)} />
              </div>
              {o.listings.map((l) => (
                <div key={l.id} className="flex min-h-14 flex-wrap items-center gap-3.5 border-t border-subtle pl-[62px] text-sm">
                  <span className="flex flex-[1_1_200px] flex-col gap-0.5">
                    <span className="font-semibold">{l.title}</span>
                    <span className="text-xs text-muted">
                      {l.kind} at {o.single ? o.branch : o.name} · {l.when}
                    </span>
                  </span>
                  <ListingActions status={l.listing} unpublishedBy={l.unpublishedBy} onUnpublish={() => onUnpublish(l.id)} onRepublish={() => onRepublish(l.id)} />
                </div>
              ))}
              {o.listings.length === 0 && <div className="border-t border-subtle py-3 pl-[62px] text-xs text-muted">No events or activities listed on this place.</div>}
            </section>
          ))}
        </div>
      )}

      {tab === 'team' && (
        <section className={`${CARD} px-5 py-2`}>
          {team.map((m, i) => (
            <div key={m.email} className={`grid min-h-[60px] grid-cols-[minmax(0,1fr)_90px_120px] items-center gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px] ${i ? 'border-t border-subtle' : ''}`}>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">{m.name}</span>
                <span className="truncate text-xs text-muted">{m.email}</span>
              </span>
              <span className="text-[var(--pure-black-variable-300)]">{m.role}</span>
              <span className="text-[13px] text-muted">{m.status === 'Invited' ? 'Invite pending' : 'Active ' + m.last}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'billing' && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <Stat label="Plan" value={b.plan} size={20} />
            <Stat label="Monthly price" value={b.mrr ? aed(b.mrr) : trial ? 'Free trial' : '—'} size={20} />
            <Stat
              label={trial ? 'Trial ends' : 'Next invoice'}
              value={trial && b.trialEnds ? fmtDate(b.trialEnds) : b.mrr ? '1 Nov 2026' : '—'}
              size={20}
            />
          </div>
          <section className={`${CARD} px-5 py-2`}>
            {role === 'admin' && det.invoices.length > 0 && (
              <div className="py-3 text-[13px] text-muted">Refunds need a Super admin. Ask Ahmad Karimi or John Doe.</div>
            )}
            {det.invoices.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">No invoices yet. The first one is issued when the trial ends.</div>
            )}
            <div className="overflow-x-auto">
              {det.invoices.map((inv) => (
                <div key={inv.id} className={`${ROW} grid min-h-[60px] min-w-[560px] grid-cols-[minmax(0,1fr)_120px_120px_110px_130px] items-center gap-3`}>
                  <span className="font-semibold">{inv.id}</span>
                  <span className="text-[var(--pure-black-variable-300)]">{fmtDate(inv.date)}</span>
                  <span className="font-medium">{aed(inv.amount)}</span>
                  <span>
                    <Badge tone={INVOICE_TONE[inv.status]}>{inv.status}</Badge>
                  </span>
                  <span className="flex justify-end">
                    {role === 'super' && inv.status === 'Paid' && (
                      <Button variant="text" onClick={() => onRefund(inv.id)}>
                        Issue refund
                      </Button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'reviews' && (
        <section className={`${CARD} px-5 py-2`}>
          {det.reviews.length === 0 && <div className="py-8 text-center text-sm text-muted">No reviews yet.</div>}
          {det.reviews.map((r, i) => (
            <div key={r.author + r.date} className={`flex flex-col gap-1.5 py-3.5 ${i ? 'border-t border-subtle' : ''}`}>
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-semibold">{r.author}</span>
                <span className="tracking-[1px] text-[var(--warning-500)]">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
                <span className="text-xs text-muted">{fmtDate(r.date)}</span>
                <Badge tone={r.status === 'Reported' ? 'warning' : 'neutral'}>{r.status}</Badge>
              </div>
              <span className="text-sm leading-normal text-[var(--pure-black-variable-400)]">{r.text}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'tickets' && (
        <section className={`${CARD} overflow-x-auto px-5 py-2`}>
          {det.tickets.map((t, i) => (
            <Link
              key={t.id}
              href={'/support?id=' + t.id}
              className={`grid min-h-14 min-w-[480px] grid-cols-[90px_minmax(0,1fr)_120px_110px] items-center gap-3 text-sm text-ink no-underline hover:text-ink ${i ? 'border-t border-subtle' : ''}`}
            >
              <span className="font-semibold text-brand-purple">{t.id}</span>
              <span>{t.subject}</span>
              <span className="text-[var(--pure-black-variable-300)]">{fmtDate(t.date)}</span>
              <span className="text-[var(--pure-black-variable-300)]">{t.status}</span>
            </Link>
          ))}
        </section>
      )}

      {tab === 'activity' && (
        <section className={`${CARD} p-5`}>
          <Timeline items={det.activity.map((h, k) => ({ key: h.at + k, what: h.what, meta: h.who + ' · ' + fmtDateTime(h.at), dot: activityDot(h) }))} />
        </section>
      )}
    </>
  );
}

/** Status badge, plus unpublish or publish again for one listing (place, event or activity). */
function ListingActions({ status, unpublishedBy, onUnpublish, onRepublish }: { status: ListingStatus; unpublishedBy?: string; onUnpublish: () => void; onRepublish: () => void }) {
  return (
    <>
      <Badge tone={LISTING_TONE[status]}>{status}</Badge>
      {status === 'Published' && (
        <Button variant="outline" size="sm" onClick={onUnpublish}>
          Unpublish
        </Button>
      )}
      {status === 'Unpublished' && unpublishedBy === ME && (
        <Button size="sm" onClick={onRepublish}>
          Publish again
        </Button>
      )}
    </>
  );
}
