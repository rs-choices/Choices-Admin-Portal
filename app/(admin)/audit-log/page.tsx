import type { Metadata } from 'next';
import { AuditLog } from '@/components/audit/AuditLog';

export const metadata: Metadata = { title: 'Audit log' };

export default function AuditLogPage() {
  return <AuditLog />;
}
