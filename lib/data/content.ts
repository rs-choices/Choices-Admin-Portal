import { GUIDES, TAG_GROUPS } from '@/lib/mock/content';
import type { Guide, TagGroups } from '@/lib/types';

// Mock fetch of the help articles and the tag and preference lists.
export function getContent(): Promise<{ docs: Guide[]; groups: TagGroups }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ docs: GUIDES.map((g) => ({ ...g })), groups: JSON.parse(JSON.stringify(TAG_GROUPS)) as TagGroups }), 400),
  );
}
