import type { Metadata } from 'next';
import { VerificationQueue, type Demo } from '@/components/verification/VerificationQueue';

export const metadata: Metadata = { title: 'Verification queue' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?id=v1` opens a request; `?demo=loading|empty|error` forces a state.
export default async function VerificationPage({ searchParams }: PageProps<'/verification'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <VerificationQueue demo={d} />;
}
