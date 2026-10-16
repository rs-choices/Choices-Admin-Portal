'use client';

import { Icon } from '@/components/ui/Icon';
import { useAdmin } from './AdminProvider';

export function Toast() {
  const { toast, toastErr } = useAdmin();
  return (
    <div role="status" aria-live="polite" data-print="hide">
      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[120] flex min-h-12 max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-pill px-5 text-sm text-white shadow-toast ca-rise" style={{ background: toastErr ? 'var(--error-500)' : 'var(--color-brand-purple)' }}>
          <Icon name={toastErr ? 'circle-x' : 'check'} size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
