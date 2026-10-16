import { CLIENTS } from '@/lib/mock/clients';
import type { Client } from '@/lib/types';

// Mock fetch of the client list.
export function getClients(): Promise<Client[]> {
  return new Promise((resolve) => setTimeout(() => resolve(CLIENTS.map((c) => ({ ...c }))), 500));
}
