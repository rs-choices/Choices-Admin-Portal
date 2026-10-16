import { ADMINS } from '@/lib/mock/admins';
import { SAVED_REPLIES, TICKETS } from '@/lib/mock/support';
import type { Admin, SavedReply, Ticket } from '@/lib/types';

// Mock fetch of the support inbox, the saved replies and the admins who can be assigned.
export function getSupport(): Promise<{ tickets: Ticket[]; saved: SavedReply[]; admins: Admin[] }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ tickets: TICKETS.map((t) => ({ ...t, thread: [...t.thread] })), saved: SAVED_REPLIES, admins: ADMINS }), 500),
  );
}
