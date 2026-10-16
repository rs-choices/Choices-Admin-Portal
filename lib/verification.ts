import type { BizType, Emirate, HistoryEntry, Tone, Verification, VerificationStatus } from '@/lib/types';

export const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending: 'Pending',
  changes: 'Changes requested',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const STATUS_TONE: Record<VerificationStatus, Tone> = {
  pending: 'warning',
  changes: 'info',
  resubmitted: 'brand',
  approved: 'success',
  rejected: 'error',
};

export const KIND_LABEL = { business: 'Business', branch: 'Branch', outlet: 'Extra outlet' } as const;

export const isOpen = (v: Verification) => v.status === 'pending' || v.status === 'changes' || v.status === 'resubmitted';

export type StatusFilter = 'open' | VerificationStatus | 'all' | 'mine';

export const STATUS_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'pending', label: 'Pending' },
  { id: 'changes', label: 'Changes requested' },
  { id: 'resubmitted', label: 'Resubmitted' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Assigned to me' },
];

export const REJECT_REASONS = [
  'Licence unreadable or invalid',
  'Licence expired',
  'Business not in the UAE',
  'Duplicate of an existing business',
  'Not a business we list',
  'Other',
];

/** The admin signed in to the prototype. */
export const ME = 'John Doe';

export function matchesStatus(v: Verification, f: StatusFilter) {
  if (f === 'all') return true;
  if (f === 'open') return isOpen(v);
  if (f === 'mine') return v.assignee === ME;
  return v.status === f;
}

/** Submitted details, in the order the design lists them. */
export function detailFields(v: Verification): [string, string][] {
  return [
    ['Company name', v.company],
    ['Trade licence number', v.licence],
    ['TRN', v.trn],
    ['Owner name', v.owner],
    ['Owner email', v.email],
    ['Phone and WhatsApp', v.phone],
    ['Branch location', v.location.area],
  ];
}

export function authorityFor(e: Emirate) {
  if (e === 'Dubai') return 'Department of Economy and Tourism · Dubai';
  if (e === 'Abu Dhabi') return 'Abu Dhabi Department of Economic Development';
  return 'Sharjah Economic Development Department';
}

export function activityFor(t: BizType) {
  return t === 'F&B' ? 'Restaurant' : t === 'Event' ? 'Event management' : 'Tourism activities';
}

export function historyDot(h: HistoryEntry) {
  if (/Approved/.test(h.what)) return 'var(--success-500)';
  if (/Rejected/.test(h.what)) return 'var(--error-500)';
  if (/changes/i.test(h.what)) return 'var(--activities-blue-500)';
  if (h.kind === 'note') return 'var(--warning-500)';
  return 'var(--color-brand-purple)';
}

export function logEntry(v: Verification, what: string, body?: string, kind?: HistoryEntry['kind']): HistoryEntry[] {
  return [...v.history, { at: new Date().toISOString(), who: ME, what, body, kind }];
}
