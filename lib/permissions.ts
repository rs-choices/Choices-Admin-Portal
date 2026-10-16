import type { Role, Section, SectionId } from '@/lib/types';

const ALL: Role[] = ['super', 'admin', 'moderator'];
const STAFF: Role[] = ['super', 'admin'];

// The sidebar sections and who may open them. Super admin sees everything,
// Admin everything but the audit log, Moderator only moderation and support.
export const SECTIONS: Section[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: '/dashboard', roles: ALL },
  { id: 'verification', label: 'Verification queue', icon: 'badge-check', href: '/verification', roles: STAFF, countKey: 'queue' },
  { id: 'businesses', label: 'Businesses', icon: 'store', href: '/businesses', roles: STAFF },
  { id: 'clients', label: 'Clients', icon: 'users', href: '/clients', roles: STAFF },
  { id: 'reports', label: 'Reports and moderation', icon: 'flag', href: '/reports', roles: ALL, countKey: 'reports' },
  { id: 'support', label: 'Support', icon: 'life-buoy', href: '/support', roles: ALL, countKey: 'tickets' },
  { id: 'content', label: 'Content', icon: 'book-open', href: '/content', roles: STAFF },
  { id: 'billing', label: 'Billing and revenue', icon: 'receipt', href: '/billing', roles: STAFF, later: true },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone', href: '/announcements', roles: STAFF, later: true },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings', roles: ALL },
  { id: 'audit-log', label: 'Audit log', icon: 'scroll-text', href: '/audit-log', roles: ['super'] },
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

export const can = (role: Role, id: SectionId) => sectionById(id)?.roles.includes(role) ?? false;
