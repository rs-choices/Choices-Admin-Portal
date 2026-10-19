import { REPORTED_CLIENTS, REPORTED_LISTINGS, REPORTED_REVIEWS } from '@/lib/mock/moderation';
import type { HistoryEntry } from '@/lib/types';

/**
 * `fixing`: the business was asked to fix a reported listing or photo. There is no deadline (Ralph, 2026-10-16).
 * `dismissed`, `warned`, `suspended`: outcomes of a client report.
 */
export type ModStatus = 'open' | 'fixing' | 'kept' | 'removed' | 'dismissed' | 'warned' | 'suspended';
// Offers go live without review (Ralph, 2026-10-16), so there is no offers queue.
export type ModTab = 'reviews' | 'listings' | 'clients';

/** One item in the moderation queue: a reported review, listing or photo. */
export type ModItem = {
  id: string;
  kind: 'review' | 'listing' | 'client';
  /** `Review`, `Photo` / `Listing` for reported listings, `Client` for client reports. */
  sub: string;
  status: ModStatus;
  business: string;
  history: HistoryEntry[];
  text: string;
  at: string;
  reason?: string;
  // reviews
  author?: string;
  authorWarnings?: number;
  rating?: number;
  posted?: string;
  note?: string;
  // listings
  reporter?: string;
  /** What a listing report is about: a place, an event or an activity, and which one. */
  target?: { kind: 'Place' | 'Event' | 'Activity'; name: string };
  // clients
  cid?: string;
  client?: string;
  booking?: string;
};

/** Who a message about a report can go to, by report kind. */
export function recipients(x: ModItem): { id: string; label: string }[] {
  // Messages go to businesses only. Clients get one-way notices (warnings,
  // outcomes, removal emails), never a conversation.
  if (x.kind === 'listing') return [{ id: 'business', label: x.business + ' (owns the listing)' }];
  return [{ id: 'business', label: x.business + ' (reported it)' }];
}

export const isActive = (x: ModItem) => x.status === 'open' || x.status === 'fixing';

// Mock fetch of the two moderation queues. Reported listings and photos also
// get the automatic "business notified" step. A report never hides anything:
// the content stays live until an admin removes it.
export function getModeration(): Promise<Record<ModTab, ModItem[]>> {
  const withRules = (x: ModItem): ModItem => {
    const auto: HistoryEntry[] = [];
    if (x.kind === 'listing') auto.push({ at: x.at, who: 'System', what: x.business + ' notified of the report' });
    return { ...x, history: [...x.history, ...auto] };
  };
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          reviews: REPORTED_REVIEWS.map((r) => withRules({ ...r, kind: 'review', sub: 'Review', status: 'open', at: r.reportedAt, history: [...r.history] })),
          listings: REPORTED_LISTINGS.map((l) => withRules({ ...l, kind: 'listing', sub: l.kind, status: 'open', at: l.reportedAt, history: [...l.history] })),
          clients: REPORTED_CLIENTS.map((c) => ({
            ...c,
            kind: 'client',
            sub: 'Client',
            status: 'open',
            at: c.reportedAt,
            authorWarnings: c.priorWarnings,
            history: [...c.history],
          })),
        }),
      500,
    ),
  );
}
