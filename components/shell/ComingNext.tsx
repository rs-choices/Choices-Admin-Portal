'use client';

import { sectionById, can } from '@/lib/permissions';
import type { SectionId } from '@/lib/types';
import { useAdmin } from './AdminProvider';
import { NoAccess } from './NoAccess';
import { PageHeader } from './PageHeader';

// What each section will hold, from the admin brief, so the placeholder page
// still says what is coming.
const PLANNED: Partial<Record<SectionId, string[]>> = {
  verification: [
    'Businesses and possible duplicates, with waiting time and assignee',
    'Detail: submitted fields, map, outlets, documents and history',
    'Approve, request changes, reject, assign to me, internal note',
  ],
  businesses: [
    'Every business with status, plan, type and emirate filters',
    'Detail tabs: overview, branches and outlets, listings, team, invoices, reviews, tickets, activity',
    'Suspend, unsuspend, extend trial, unpublish a listing, issue a refund',
  ],
  clients: [
    'Every client with sign-up method, joined date and status',
    'Detail: profile, preferences, bookings, reviews, reports and devices',
    'Suspend, unsuspend, export their data',
  ],
  reports: [
    'Reported reviews, reported listings and photos, offers waiting for review',
    'Keep, remove, warn the author, approve or reject an offer',
  ],
  support: [
    'One inbox for business tickets and client help messages',
    'Reply, internal note, saved replies, assign, priority, resolve and reopen',
  ],
  content: ['How-to guides and FAQ for the Business Portal', 'Listing tags and the food and activity preference lists'],
  billing: ['Subscriptions, plans and prices, invoices, failed payments and refunds', 'Boosts and campaigns, later'],
  announcements: ['Push to clients, email or banner to businesses', 'Audience, preview, schedule and send'],
  settings: ['My profile and security', 'Team, roles and permissions, legal versions'],
  'audit-log': ['Every admin action: who, what, on which record, when', 'Filters and CSV export'],
};

export function ComingNext({ id }: { id: SectionId }) {
  const { role } = useAdmin();
  const s = sectionById(id);
  if (!s) return null;
  if (!can(role, id)) return <NoAccess />;
  return (
    <>
      <PageHeader title={s.label} subtitle="This screen is coming in the next pass." />
      <section className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-card">
        <h2 className="m-0 font-display text-lg font-semibold">What this page will hold</h2>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm text-[var(--pure-black-variable-300)]">
          {(PLANNED[id] ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
