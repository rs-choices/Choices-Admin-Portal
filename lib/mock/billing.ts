// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { FailedPayment, Invoice, Plan, Refund, Subscription } from '@/lib/types';

export const PLANS: Plan[] = [
  { id: 'starter', name: 'Starter', price: 199, outlets: '1 outlet', features: ['1 listing', 'Bookings', 'Basic insights'], subs: 148 },
  { id: 'growth', name: 'Growth', price: 499, outlets: 'Up to 5 outlets', features: ['Offers and events', 'Review replies', 'Full insights'], subs: 214 },
  { id: 'enterprise', name: 'Enterprise', price: 1499, outlets: 'Unlimited outlets', features: ['Account manager', 'API access', 'Priority support'], subs: 31 },
];

export const SUBSCRIPTIONS: Subscription[] = [
  { business: 'Al Fanar Restaurant', plan: 'Enterprise', status: 'Active', since: '2024-03-04', next: '2026-11-01', amount: 1499 },
  { business: 'Zaatar w Zeit Kitchen', plan: 'Growth', status: 'Active', since: '2024-12-21', next: '2026-11-01', amount: 499 },
  { business: 'Bait Al Qahwa Café', plan: 'Growth', status: 'Past due', since: '2025-03-14', next: '2026-10-18', amount: 499 },
  { business: 'Desert Rush Safaris', plan: 'Growth', status: 'Active', since: '2025-02-19', next: '2026-11-01', amount: 499 },
  { business: 'Marina Jazz Nights', plan: 'Growth', status: 'Trial', since: '2026-10-12', next: '2026-11-11', amount: 0 },
  { business: 'Wild Wadi Kayak Co.', plan: 'Starter', status: 'Past due', since: '2025-06-22', next: '2026-10-17', amount: 199 },
  { business: 'Corniche Comedy Club', plan: 'Starter', status: 'Active', since: '2025-12-11', next: '2026-11-01', amount: 199 },
  { business: 'Mleiha Stargazing Camp', plan: 'Starter', status: 'Paused', since: '2025-09-03', next: '—', amount: 199 },
];

export const INVOICES: Invoice[] = [
  { id: 'INV-24-10031', business: 'Al Fanar Restaurant', date: '2026-10-01', amount: 1499, status: 'Paid' },
  { id: 'INV-24-10029', business: 'Zaatar w Zeit Kitchen', date: '2026-10-01', amount: 499, status: 'Paid' },
  { id: 'INV-24-10027', business: 'Bait Al Qahwa Café', date: '2026-10-01', amount: 499, status: 'Failed' },
  { id: 'INV-24-10026', business: 'Desert Rush Safaris', date: '2026-10-01', amount: 499, status: 'Paid' },
  { id: 'INV-24-10022', business: 'Wild Wadi Kayak Co.', date: '2026-10-01', amount: 199, status: 'Failed' },
  { id: 'INV-24-10021', business: 'Corniche Comedy Club', date: '2026-10-01', amount: 199, status: 'Paid' },
  { id: 'INV-24-09030', business: 'Bait Al Qahwa Café', date: '2026-09-01', amount: 499, status: 'Paid' },
];

export const FAILED: FailedPayment[] = [
  { id: 'INV-24-10027', business: 'Bait Al Qahwa Café', amount: 499, attempts: 2, last: '2026-10-15', reason: 'Card declined: insufficient funds', contact: 'mohammed@baitalqahwa.ae' },
  { id: 'INV-24-10022', business: 'Wild Wadi Kayak Co.', amount: 199, attempts: 1, last: '2026-10-14', reason: 'Card expired', contact: 'priya@wildwadikayak.ae' },
];

export const REFUNDS: Refund[] = [
  { id: 'RF-0042', invoice: 'INV-24-07002', business: 'Al Fanar Restaurant', amount: 1499, date: '2026-07-04', by: 'Ahmad Karimi', reason: 'Charged during outage' },
  { id: 'RF-0039', invoice: 'INV-24-05118', business: 'Corniche Comedy Club', amount: 199, date: '2026-05-20', by: 'John Doe', reason: 'Duplicate charge' },
];
