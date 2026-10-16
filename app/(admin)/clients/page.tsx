import type { Metadata } from 'next';
import { Clients, type Demo } from '@/components/clients/Clients';

export const metadata: Metadata = { title: 'Clients' };

const DEMOS: Demo[] = ['live', 'loading', 'empty', 'error'];

// `?id=c1` opens a client; `?demo=loading|empty|error` forces a state.
export default async function ClientsPage({ searchParams }: PageProps<'/clients'>) {
  const { demo } = await searchParams;
  const d = typeof demo === 'string' && (DEMOS as string[]).includes(demo) ? (demo as Demo) : 'live';
  return <Clients demo={d} />;
}
