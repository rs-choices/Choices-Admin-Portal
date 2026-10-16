import type { Metadata } from 'next';
import { Dashboard, type Demo } from '@/components/dashboard/Dashboard';

export const metadata: Metadata = { title: 'Dashboard' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?demo=loading|empty|error` forces a state, like the prototype's demoState.
export default async function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Dashboard demo={d} />;
}
