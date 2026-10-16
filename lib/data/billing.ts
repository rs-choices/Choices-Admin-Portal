import { FAILED, INVOICES, PLANS, REFUNDS, SUBSCRIPTIONS } from '@/lib/mock/billing';
import type { FailedPayment, Invoice, Plan, Refund, Subscription } from '@/lib/types';

export type FailedRow = FailedPayment & { status: 'failed' | 'paid' };

// Mock fetch of everything on the Billing and revenue page.
export function getBilling(): Promise<{ plans: Plan[]; subs: Subscription[]; invoices: Invoice[]; failed: FailedRow[]; refunds: Refund[] }> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          plans: PLANS.map((p) => ({ ...p })),
          subs: SUBSCRIPTIONS.map((s) => ({ ...s })),
          invoices: INVOICES.map((i) => ({ ...i })),
          failed: FAILED.map((f) => ({ ...f, status: 'failed' })),
          refunds: REFUNDS,
        }),
      300,
    ),
  );
}
