import type { Metadata } from 'next';
import { SignIn } from '@/components/auth/SignIn';
import { JUMPS, type Jump } from '@/components/auth/states';

export const metadata: Metadata = { title: 'Sign in' };

// `?state=` opens one sign-in state directly (see components/auth/states.ts).
export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const { state } = await searchParams;
  const initial: Jump = typeof state === 'string' && (JUMPS as readonly string[]).includes(state) ? (state as Jump) : 'signin';
  return <SignIn key={initial} initial={initial} />;
}
