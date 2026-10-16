import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComingNext } from '@/components/shell/ComingNext';
import { SECTIONS, sectionById } from '@/lib/permissions';

// One route for every section that is not built yet. Built sections have
// their own folder and are listed in BUILT. Unknown sections 404.
export const dynamicParams = false;

const BUILT = ['dashboard', 'verification', 'businesses', 'clients', 'reports', 'support', 'content', 'announcements', 'billing', 'settings', 'audit-log'];

export function generateStaticParams() {
  return SECTIONS.filter((s) => !BUILT.includes(s.id)).map((s) => ({ section: s.id }));
}

export async function generateMetadata({ params }: PageProps<'/[section]'>): Promise<Metadata> {
  const { section } = await params;
  return { title: sectionById(section)?.label };
}

export default async function SectionPage({ params }: PageProps<'/[section]'>) {
  const { section } = await params;
  const s = sectionById(section);
  if (!s || BUILT.includes(s.id)) notFound();
  return <ComingNext id={s.id} />;
}
