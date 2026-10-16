import type { Metadata } from 'next';
import { Settings, type SettingsTab } from '@/components/settings/Settings';

export const metadata: Metadata = { title: 'Settings' };

const TABS: SettingsTab[] = ['profile', 'security', 'team', 'roles', 'legal'];

// `?tab=team` opens a section directly (the prototype used `#team`).
export default async function SettingsPage({ searchParams }: PageProps<'/settings'>) {
  const { tab } = await searchParams;
  const t = typeof tab === 'string' && (TABS as string[]).includes(tab) ? (tab as SettingsTab) : 'profile';
  return <Settings tab={t} />;
}
