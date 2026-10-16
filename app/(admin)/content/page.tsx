import type { Metadata } from 'next';
import { Content, type Demo } from '@/components/content/Content';

export const metadata: Metadata = { title: 'Content' };

const DEMOS: Demo[] = ['live', 'loading', 'empty'];

// `?demo=loading|empty` forces a state.
export default async function ContentPage({ searchParams }: PageProps<'/content'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Content demo={d} />;
}
