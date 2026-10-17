// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
// Dashboard metrics. The prototype's clock reads 10:30 on Thursday 16 October 2026, Dubai time.
import type { Attention, Conversion, Kpis, Range, Series } from '@/lib/types';

export const NOW = '2026-10-16T10:30:00+04:00';

export const KPIS: Record<Range, Kpis> = {
  '7d': { newClients: 1284, newBusinesses: 37, queue: 9, tickets: 23, reports: 11, trials: 62, mrr: 184250, bookings: 3912, d: { newClients: 8.2, newBusinesses: -4.1, mrr: 3.6, bookings: 11.4 } },
  '30d': { newClients: 5210, newBusinesses: 141, queue: 9, tickets: 23, reports: 11, trials: 62, mrr: 184250, bookings: 15880, d: { newClients: 5.4, newBusinesses: 2.2, mrr: 9.8, bookings: 7.1 } },
  '90d': { newClients: 14930, newBusinesses: 402, queue: 9, tickets: 23, reports: 11, trials: 62, mrr: 184250, bookings: 44210, d: { newClients: 18.9, newBusinesses: 12.0, mrr: 27.5, bookings: 21.3 } },
};

export const SERIES: Record<Range, Series> = {
  '7d': { labels: ['10 Oct', '11 Oct', '12 Oct', '13 Oct', '14 Oct', '15 Oct', '16 Oct'], clients: [162, 171, 208, 196, 174, 188, 185], businesses: [4, 6, 7, 3, 5, 8, 4], bookings: [498, 522, 671, 640, 512, 548, 521] },
  '30d': { labels: ['W1', 'W2', 'W3', 'W4', 'W5'], clients: [1010, 1080, 1120, 990, 1010], businesses: [26, 31, 29, 27, 28], bookings: [3020, 3180, 3410, 3290, 2980] },
  '90d': { labels: ['Jul', 'Aug', 'Sep', 'Oct'], clients: [3620, 3890, 4410, 3010], businesses: [96, 104, 118, 84], bookings: [10120, 11050, 12900, 10140] },
};

export const CONVERSION: Conversion[] = [
  { month: 'May', rate: 31 }, { month: 'Jun', rate: 34 }, { month: 'Jul', rate: 33 },
  { month: 'Aug', rate: 38 }, { month: 'Sep', rate: 41 }, { month: 'Oct', rate: 39 },
];

export const ATTENTION: Attention[] = [
  { kind: 'verification', icon: 'badge-check', title: 'Saffron Grill House waiting 4 days', meta: 'Oldest pending verification · Business · Dubai', href: '/verification?id=v1', tone: 'warning' },
  { kind: 'report', icon: 'flag', title: '3 reported reviews over 24 h', meta: 'Oldest: review on Al Fanar Restaurant, 31 h', href: '/reports', tone: 'error' },
  { kind: 'payment', icon: 'credit-card', title: 'Payment failed · Bait Al Qahwa Café', meta: 'AED 499 · Growth plan · 2nd attempt', href: '/businesses?id=b3', tone: 'error' },
  { kind: 'payment', icon: 'credit-card', title: 'Payment failed · Wild Wadi Kayak Co.', meta: 'AED 199 · Starter plan · 1st attempt', href: '/businesses?id=b9', tone: 'error' },
  { kind: 'ticket', icon: 'life-buoy', title: 'T-2291 Invoice charged twice', meta: 'Urgent · Billing · waiting 3 h', href: '/support?id=T-2291', tone: 'error' },
];
