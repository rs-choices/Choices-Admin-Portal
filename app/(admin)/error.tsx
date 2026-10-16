'use client';

import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="Something went wrong." body="This page did not load. Nothing was lost." onRetry={reset} />;
}
