// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { Announcement } from '@/lib/types';

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'n1', channel: 'Push', audience: 'All clients in Dubai', title: 'Diwali dinners near you', body: '12 spots have Diwali menus this weekend.', status: 'Sent', when: '2026-10-14T18:00:00+04:00', reach: 48210, by: 'Sara Al Mansoori' },
  { id: 'n2', channel: 'Email', audience: 'Businesses on trial', title: 'Your trial ends soon', body: 'Pick a plan to keep your listing live.', status: 'Scheduled', when: '2026-10-20T10:00:00+04:00', reach: 62, by: 'John Doe' },
  { id: 'n3', channel: 'Banner', audience: 'All businesses', title: 'New: reply to reviews from the app', body: 'You can now reply to reviews from your phone.', status: 'Sent', when: '2026-10-01T09:00:00+04:00', reach: 393, by: 'Ahmad Karimi' },
  { id: 'n4', channel: 'Push', audience: 'Clients · Abu Dhabi', title: 'F1 weekend plans', body: 'Spots near Yas open late this weekend.', status: 'Draft', when: null, reach: 0, by: 'Sara Al Mansoori' },
];
