// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { Invite, LegalDoc, Session } from '@/lib/types';

export const SESSIONS: Session[] = [
  { id: 's1', device: 'MacBook Pro · Chrome 131', location: 'Dubai, UAE', ip: '94.200.12.41', last: 'Active now', current: true },
  { id: 's2', device: 'iPhone 15 Pro · Safari', location: 'Dubai, UAE', ip: '5.30.188.7', last: '2 h ago' },
  { id: 's3', device: 'Windows · Edge 130', location: 'Abu Dhabi, UAE', ip: '86.98.4.220', last: '3 days ago' },
];

export const INVITES: Invite[] = [
  { email: 'layan@thechoicesapp.com', role: 'moderator', sent: '2026-10-14', by: 'Ahmad Karimi', expires: '2026-10-21' },
  { email: 'yusuf@thechoicesapp.com', role: 'admin', sent: '2026-10-05', by: 'John Doe', expires: '2026-10-12', expired: true },
];

export const LEGAL: LegalDoc[] = [
  { id: 'terms', name: 'Terms of use', version: '4.2', published: '2026-06-01', accepted: 91, history: [{ v: '4.2', date: '2026-06-01', by: 'Ahmad Karimi' }, { v: '4.1', date: '2025-11-15', by: 'Ahmad Karimi' }, { v: '4.0', date: '2025-03-02', by: 'John Doe' }] },
  { id: 'privacy', name: 'Privacy policy', version: '3.0', published: '2026-03-10', accepted: 96, history: [{ v: '3.0', date: '2026-03-10', by: 'John Doe' }, { v: '2.4', date: '2025-08-20', by: 'Ahmad Karimi' }] },
];
