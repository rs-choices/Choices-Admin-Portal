import { DUPLICATES, VERIFICATIONS } from '@/lib/mock/verification';
import type { Duplicate, Verification } from '@/lib/types';

// Mock fetch of the verification queue. Business, branch and extra outlet
// requests share one queue, as the EventStorming board says.
export function getVerificationQueue(): Promise<{ items: Verification[]; dupes: Duplicate[] }> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          items: VERIFICATIONS.map((v) => ({ ...v, history: [...v.history], flags: [] })),
          dupes: DUPLICATES.slice(),
        }),
      500,
    ),
  );
}
