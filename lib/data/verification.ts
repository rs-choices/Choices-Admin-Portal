import { DUPLICATES, VERIFICATIONS } from '@/lib/mock/verification';
import type { Duplicate, Verification } from '@/lib/types';

// Mock fetch of the verification queue. Only business requests are listed,
// as in the design; branches and extra outlets come later.
export function getVerificationQueue(): Promise<{ items: Verification[]; dupes: Duplicate[] }> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          items: VERIFICATIONS.filter((v) => v.kind === 'business').map((v) => ({ ...v, history: [...v.history], flags: [] })),
          dupes: DUPLICATES.slice(),
        }),
      500,
    ),
  );
}
