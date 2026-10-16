// Top bar search index and notifications, from the prototype's AdminTopbar.
import type { AdminNotification, SearchItem } from '@/lib/types';

export const SEARCH_INDEX: SearchItem[] = [
  { name: 'Al Fanar Restaurant', kind: 'Business', meta: 'Dubai · F&B', icon: 'store', href: '/businesses?id=b1' },
  { name: 'Zaatar w Zeit Kitchen', kind: 'Business', meta: 'Sharjah · F&B', icon: 'store', href: '/businesses?id=b2' },
  { name: 'Bait Al Qahwa Café', kind: 'Business', meta: 'Abu Dhabi · F&B', icon: 'store', href: '/businesses?id=b3' },
  { name: 'Desert Rush Safaris', kind: 'Business', meta: 'Dubai · Activity', icon: 'store', href: '/businesses?id=b4' },
  { name: 'Saadiyat Padel Club', kind: 'Business', meta: 'Abu Dhabi · Activity', icon: 'store', href: '/businesses?id=b5' },
  { name: 'Layla Hassan', kind: 'Client', meta: 'layla.h@gmail.com', icon: 'user', href: '/clients?id=c1' },
  { name: 'Omar Al Suwaidi', kind: 'Client', meta: '+971 50 214 8830', icon: 'user', href: '/clients?id=c2' },
  { name: 'T-2291 Invoice charged twice', kind: 'Ticket', meta: 'Billing · Urgent', icon: 'life-buoy', href: '/support?id=T-2291' },
  { name: 'T-2288 Licence upload keeps failing', kind: 'Ticket', meta: 'Verification', icon: 'life-buoy', href: '/support?id=T-2288' },
];

export const NOTIFICATIONS: AdminNotification[] = [
  { icon: 'badge-check', text: 'Saadiyat Padel Club resubmitted for verification', time: '6 min ago', href: '/verification' },
  { icon: 'flag', text: 'New review report from Al Fanar Restaurant', time: '22 min ago', href: '/reports' },
  { icon: 'credit-card', text: 'Payment failed for Bait Al Qahwa Café · AED 499', time: '1 h ago', href: '/businesses?id=b3' },
  { icon: 'life-buoy', text: 'Urgent ticket T-2291 waiting 3 h', time: '3 h ago', href: '/support?id=T-2291' },
];
