import { BUSINESSES, MEMBERS } from '@/lib/mock/businesses';
import type { Business, Member } from '@/lib/types';

// Mock fetch of the business directory and every Business Portal member.
export function getBusinesses(): Promise<{ list: Business[]; members: Member[] }> {
  return new Promise((resolve) => setTimeout(() => resolve({ list: BUSINESSES.map((b) => ({ ...b })), members: MEMBERS }), 500));
}
