import type { Metadata } from 'next';
import { Support, type Demo } from '@/components/support/Support';

export const metadata: Metadata = { title: 'Support' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?id=T-2291` opens a ticket; `?demo=loading|empty|error` forces a state.
export default async function SupportPage({ searchParams }: PageProps<'/support'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Support demo={d} />;
}
