import type { Metadata } from 'next';
import { Billing } from '@/components/billing/Billing';

export const metadata: Metadata = { title: 'Billing and revenue' };

export default function BillingPage() {
  return <Billing />;
}
