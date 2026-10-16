import { aed, fmtNum } from '@/lib/format';
import type { Attention, DashboardData, LucideName, Range, Role, Series } from '@/lib/types';

export type KpiCard = {
  id: string;
  icon: LucideName;
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
  href: string | null;
};

const MUTED = 'var(--color-text-secondary)';
const DAYS: Record<Range, string> = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };

// The eight dashboard cards, ported from the prototype's renderVals().
export function buildKpis(data: DashboardData, range: Range, role: Role, empty: boolean): KpiCard[] {
  const K = data.KPIS[range];
  const fmt = (n: number) => (empty ? '0' : fmtNum(n));
  const dl = (v: number) => (empty ? 'No change' : (v >= 0 ? '↑ ' : '↓ ') + Math.abs(v) + '% vs previous ' + DAYS[range]);
  const dc = (v: number) => (empty ? MUTED : v >= 0 ? 'var(--success-500)' : 'var(--error-500)');
  const alert = empty ? MUTED : 'var(--error-500)';

  const cards: KpiCard[] = [
    { id: 'clients', icon: 'user-plus', label: 'New clients', value: fmt(K.newClients), delta: dl(K.d.newClients), deltaColor: dc(K.d.newClients), href: '/clients' },
    { id: 'biz', icon: 'store', label: 'New businesses', value: fmt(K.newBusinesses), delta: dl(K.d.newBusinesses), deltaColor: dc(K.d.newBusinesses), href: '/businesses' },
    { id: 'queue', icon: 'badge-check', label: 'Verification queue', value: fmt(K.queue), delta: empty ? 'Queue clear' : 'Oldest waiting 4 d 1 h', deltaColor: MUTED, href: '/verification' },
    { id: 'tickets', icon: 'life-buoy', label: 'Open tickets', value: fmt(K.tickets), delta: empty ? 'Inbox clear' : '1 urgent · 4 high', deltaColor: alert, href: '/support' },
    { id: 'reports', icon: 'flag', label: 'Open reports', value: fmt(K.reports), delta: empty ? 'Nothing reported' : '3 over 24 h', deltaColor: alert, href: '/reports' },
    { id: 'trials', icon: 'hourglass', label: 'Active trials', value: fmt(K.trials), delta: empty ? 'No trials' : '11 end this week', deltaColor: MUTED, href: '/businesses' },
    { id: 'mrr', icon: 'banknote', label: 'MRR', value: empty ? 'AED 0' : aed(K.mrr), delta: dl(K.d.mrr), deltaColor: dc(K.d.mrr), href: role === 'admin' ? null : '/billing' },
    { id: 'bookings', icon: 'calendar-check', label: range === '7d' ? 'Bookings this week' : 'Bookings', value: fmt(K.bookings), delta: dl(K.d.bookings), deltaColor: dc(K.d.bookings), href: null },
  ];
  return role === 'moderator' ? cards.filter((k) => k.id === 'tickets' || k.id === 'reports') : cards;
}

export const ATTENTION_BADGE: Record<Attention['kind'], string> = {
  verification: 'Waiting',
  report: 'Over 24 h',
  payment: 'Failed',
  ticket: 'Urgent',
};

export function attentionFor(data: DashboardData, role: Role, empty: boolean): Attention[] {
  if (empty) return [];
  return role === 'moderator' ? data.ATTENTION.filter((a) => a.kind === 'report' || a.kind === 'ticket') : data.ATTENTION;
}

// Same rows and quoting as the prototype's CSV export.
export function toCsv(kpis: KpiCard[], S: Series, attention: Attention[], empty: boolean): string {
  const q = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
  const z = (n: number) => (empty ? 0 : n);
  return [
    'Section,Metric,Value,Note',
    ...kpis.map((k) => ['KPI', k.label, k.value, k.delta].map(q).join(',')),
    '',
    'Date,Client sign-ups,Business sign-ups,Bookings',
    ...S.labels.map((l, i) => [l, z(S.clients[i]), z(S.businesses[i]), z(S.bookings[i])].map(q).join(',')),
    '',
    'Needs attention,Detail',
    ...attention.map((a) => [a.title, a.meta].map(q).join(',')),
  ].join('\n');
}
