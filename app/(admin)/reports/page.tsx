import type { Metadata } from 'next';
import { Reports, type Demo } from '@/components/reports/Reports';

export const metadata: Metadata = { title: 'Reports and moderation' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?demo=loading|empty|error` forces a state.
export default async function ReportsPage({ searchParams }: PageProps<'/reports'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Reports demo={d} />;
}
