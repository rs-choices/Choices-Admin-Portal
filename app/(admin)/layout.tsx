import { AdminProvider } from '@/components/shell/AdminProvider';
import { AdminShell } from '@/components/shell/AdminShell';

export default function AdminLayout({ children }: LayoutProps<'/'>) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
