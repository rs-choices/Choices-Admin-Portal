import { BUSINESS_DETAIL } from '@/lib/mock/businesses';
import type { BizType, Business, BusinessDetail, BusinessStatus, HistoryEntry, InvoiceStatus, ListingStatus, Tone } from '@/lib/types';

export const BIZ_LABEL: Record<BusinessStatus, string> = { active: 'Active', trial: 'Trial', suspended: 'Suspended', pending: 'Pending' };
export const BIZ_TONE: Record<BusinessStatus, Tone> = { active: 'success', trial: 'info', suspended: 'error', pending: 'warning' };
export const LISTING_TONE: Record<ListingStatus, Tone> = { Published: 'success', Draft: 'neutral', Unpublished: 'error' };
export const INVOICE_TONE: Record<InvoiceStatus, Tone> = { Paid: 'success', Refunded: 'neutral', Failed: 'error' };
export const MEMBER_TONE = { Active: 'success', Invited: 'info', Suspended: 'error' } as const;

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
  { key: 'type', label: 'Type', options: [['all', 'All types'], ['F&B', 'F&B'], ['Activity', 'Activity'], ['Event', 'Event']] },
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
              outlets: Array.from({ length: b.outlets }, (_, i) => ({
                id: b.id + 'o' + i,
                name: short + (i ? ' · Outlet ' + (i + 1) : ''),
                type: b.type,
                listing: b.status === 'pending' ? 'Draft' : 'Published',
              })),
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

export const activityDot = (h: HistoryEntry) =>
  /Suspend/.test(h.what) ? 'var(--error-500)' : /Refund/.test(h.what) ? 'var(--warning-500)' : 'var(--color-brand-purple)';

/** `2026-10-30` plus `days`, as a date-only ISO string. */
export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
