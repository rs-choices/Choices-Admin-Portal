import { ATTENTION, CONVERSION, KPIS, SERIES } from '@/lib/mock/dashboard';
import type { DashboardData } from '@/lib/types';

// Mock fetch with a short delay so the loading state shows. Swap this body for
// an API call later; the screen only depends on DashboardData.
export function getDashboard(): Promise<DashboardData> {
  return new Promise((resolve) => setTimeout(() => resolve({ KPIS, SERIES, CONVERSION, ATTENTION }), 500));
}
