import { BUSINESS_DETAIL } from '@/lib/mock/businesses';
import type { BizType, Business, BusinessDetail, BusinessStatus, BranchStatus, HistoryEntry, InvoiceStatus, ListingStatus, PlaceSubListing, PriceBand, Tone } from '@/lib/types';

export const BIZ_LABEL: Record<BusinessStatus, string> = { active: 'Active', trial: 'Trial', suspended: 'Suspended', pending: 'Pending' };
export const BIZ_TONE: Record<BusinessStatus, Tone> = { active: 'success', trial: 'info', suspended: 'error', pending: 'warning' };
export const LISTING_TONE: Record<ListingStatus, Tone> = { Published: 'success', Draft: 'neutral', Unpublished: 'error' };
export const INVOICE_TONE: Record<InvoiceStatus, Tone> = { Paid: 'success', Refunded: 'neutral', Failed: 'error' };
export const MEMBER_TONE = { Active: 'success', Invited: 'info', Suspended: 'error' } as const;
export const BRANCH_TONE: Record<BranchStatus, Tone> = { Verified: 'success', 'Waiting for verification': 'warning' };
export const PRICE_BAND_LABEL: Record<PriceBand, string> = { $: 'Under AED 50', $$: 'AED 50–150', $$$: 'AED 150+' };

/** A directory row, plus the status it had before a suspension. */
export type BizRow = Business & { prevStatus?: BusinessStatus };

export type DetailTab = 'overview' | 'branches' | 'listings' | 'team' | 'billing' | 'reviews' | 'tickets' | 'activity';
export const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'branches', label: 'Branches and outlets' },
  { id: 'listings', label: 'Listings' },
  { id: 'team', label: 'Team' },
  { id: 'billing', label: 'Subscription and invoices' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'activity', label: 'Activity' },
];

export type BizFilters = { status: 'all' | BusinessStatus; plan: string; type: 'all' | BizType; emirate: string };
export const NO_FILTERS: BizFilters = { status: 'all', plan: 'all', type: 'all', emirate: 'all' };

export const FILTER_DEFS: { key: keyof BizFilters; label: string; options: [string, string][] }[] = [
  { key: 'status', label: 'Status', options: [['all', 'All statuses'], ['active', 'Active'], ['trial', 'Trial'], ['suspended', 'Suspended'], ['pending', 'Pending']] },
  { key: 'plan', label: 'Plan', options: [['all', 'All plans'], ['Starter', 'Starter'], ['Growth', 'Growth'], ['Enterprise', 'Enterprise']] },
  { key: 'type', label: 'Place type', options: [['all', 'All place types'], ['F&B', 'F&B'], ['Activity', 'Activity'], ['Event', 'Event']] },
  { key: 'emirate', label: 'Emirate', options: [['all', 'All emirates'], ['Dubai', 'Dubai'], ['Abu Dhabi', 'Abu Dhabi'], ['Sharjah', 'Sharjah']] },
];

export const initials = (n: string) =>
  n
    .replace(/&|\./g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/**
 * The prototype only has full detail for Al Fanar Restaurant (b1). For every
 * other business it derives believable branches, team, invoices, reviews and
 * activity from that one record, as the design does.
 */
export function buildDetail(b: Business): BusinessDetail {
  const D = BUSINESS_DETAIL;
  const short = b.name.replace(/ (Restaurant|Kitchen|Café|Club|Co\.|Safaris|Camp|Bistro|Seafood|Nights|Adventures)$/, '');
  const sw = (s: string) => s.replace(/Al Fanar/g, short);
  return {
    branches:
      b.id === 'b1'
        ? D.branches
        : [
            {
              name: 'Main',
              area: b.emirate,
              status: b.status === 'pending' ? 'Waiting for verification' : 'Verified',
              outlets: Array.from({ length: b.outlets }, (_, i) => {
                const type = b.types[i % b.types.length];
                const live: ListingStatus = b.status === 'pending' ? 'Draft' : 'Published';
                return {
                  id: b.id + 'o' + i,
                  name: short + (i ? ' · Place ' + (i + 1) : ''),
                  type,
                  priceBand: type === 'F&B' ? '$$' : '$$$',
                  listing: live,
                  listings: i === 0 ? sampleListings(b.id, type, live) : [],
                };
              }),
            },
          ],
    team: D.team,
    invoices:
      b.status === 'trial' || b.status === 'pending'
        ? []
        : D.invoices.map((i) => ({ ...i, amount: b.mrr || 199, status: b.paymentFailed && i.id.endsWith('10031') ? 'Failed' : i.status })),
    reviews: b.reviews ? D.reviews.map((r) => ({ ...r, text: sw(r.text) })) : [],
    tickets: D.tickets,
    activity: D.activity.map((a) => ({ ...a, what: sw(a.what), who: a.who === 'Rashid Bin Saeed' ? b.owner : a.who })),
  };
}

/** Name of a place, event or activity listing, by id. */
export function listingName(d: BusinessDetail, id: string): string {
  for (const br of d.branches)
    for (const o of br.outlets) {
      if (o.id === id) return o.name;
      const sub = o.listings.find((l) => l.id === id);
      if (sub) return sub.title;
    }
  return '';
}

/** Sets the status of a place, event or activity listing, by id. */
export function withListing(d: BusinessDetail, id: string, listing: ListingStatus, unpublishedBy?: string): BusinessDetail['branches'] {
  return d.branches.map((br) => ({
    ...br,
    outlets: br.outlets.map((o) =>
      o.id === id
        ? { ...o, listing, unpublishedBy }
        : { ...o, listings: o.listings.map((l) => (l.id === id ? { ...l, listing, unpublishedBy } : l)) },
    ),
  }));
}

/** A believable event or activity on a derived business's first place. */
function sampleListings(id: string, type: BizType, listing: ListingStatus): PlaceSubListing[] {
  if (type === 'Event') return [{ id: id + 'e0', kind: 'Event', title: 'Friday night show', when: 'Every Friday · 9 PM', listing }];
  if (type === 'Activity') return [{ id: id + 'a0', kind: 'Activity', title: 'Guided session', when: '90 minutes', listing }];
  return [];
}

export const activityDot = (h: HistoryEntry) =>
  /Suspend/.test(h.what) ? 'var(--error-500)' : /Refund/.test(h.what) ? 'var(--warning-500)' : 'var(--color-brand-purple)';

/** `2026-10-30` plus `days`, as a date-only ISO string. */
export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
