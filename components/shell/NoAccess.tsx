'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ROLE_LABEL } from '@/lib/types';
import { useAdmin } from './AdminProvider';

export function NoAccess({ title, body }: { title?: string; body?: string }) {
  const { role } = useAdmin();
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-14 text-center shadow-card">
      <span className="grid size-14 place-items-center rounded-full bg-tint-purple text-brand-purple">
        <Icon name="lock" size={24} />
      </span>
      <span className="text-lg font-semibold">{title ?? "You don't have access to this page."}</span>
      <span className="max-w-[420px] text-sm text-muted">
        {body ?? `Your role is ${ROLE_LABEL[role]}. Ask a Super admin if you need it.`}
      </span>
      {!body && (
        <Button size="sm" href="/dashboard" className="mt-2">
          Go to the dashboard
        </Button>
      )}
    </div>
  );
}
