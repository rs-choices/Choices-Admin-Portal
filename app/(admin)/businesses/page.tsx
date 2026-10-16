import type { Metadata } from 'next';
import { Businesses, type Demo } from '@/components/businesses/Businesses';

export const metadata: Metadata = { title: 'Businesses' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?id=b1` opens a business, `&tab=team` a detail tab; `?demo=` forces a state.
export default async function BusinessesPage({ searchParams }: PageProps<'/businesses'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Businesses demo={d} />;
}
