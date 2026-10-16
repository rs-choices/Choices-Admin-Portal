// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { AuditEntry } from '@/lib/types';

export const AUDIT: AuditEntry[] = [
  { at: '2026-10-16T09:58:00+04:00', who: 'John Doe', action: 'Approved verification', target: 'Marina Jazz Nights', kind: 'Business' },
  { at: '2026-10-16T09:40:00+04:00', who: 'Sara Al Mansoori', action: 'Requested changes', target: 'Qasr Al Bahr Seafood', kind: 'Business' },
  { at: '2026-10-16T09:12:00+04:00', who: 'Rami Haddad', action: 'Replied to ticket', target: 'T-2290 · Layla Hassan', kind: 'Client' },
  { at: '2026-10-16T08:50:00+04:00', who: 'Noura Khalifa', action: 'Removed review', target: 'Corniche Comedy Club', kind: 'Business' },
  { at: '2026-10-15T18:22:00+04:00', who: 'Ahmad Karimi', action: 'Changed role', target: 'Rami Haddad → Moderator', kind: 'Team' },
  { at: '2026-10-15T17:05:00+04:00', who: 'John Doe', action: 'Suspended client', target: 'Anonymous client', kind: 'Client' },
  { at: '2026-10-15T15:40:00+04:00', who: 'Sara Al Mansoori', action: 'Extended trial', target: 'Shawarma Al Reem · 14 days', kind: 'Business' },
  { at: '2026-10-15T11:30:00+04:00', who: 'Ahmad Karimi', action: 'Published legal version', target: 'Terms of use 4.2', kind: 'Platform' },
  { at: '2026-10-14T16:10:00+04:00', who: 'John Doe', action: 'Issued refund', target: 'INV-24-05118 · AED 199', kind: 'Business' },
  { at: '2026-10-14T14:00:00+04:00', who: 'Sara Al Mansoori', action: 'Unpublished listing', target: 'Mleiha Stargazing Camp', kind: 'Business' },
  { at: '2026-10-14T10:20:00+04:00', who: 'Ahmad Karimi', action: 'Invited admin', target: 'layan@thechoicesapp.com · Moderator', kind: 'Team' },
  { at: '2026-10-13T12:00:00+04:00', who: 'John Doe', action: 'Changed platform setting', target: 'Trial length 30 → 30 days', kind: 'Platform' },
  { at: '2026-10-12T19:30:00+04:00', who: 'Rami Haddad', action: 'Warned author', target: 'Ben Walker', kind: 'Client' },
  { at: '2026-10-12T10:15:00+04:00', who: 'John Doe', action: 'Approved verification', target: 'Marina Jazz Nights', kind: 'Business' },
];
