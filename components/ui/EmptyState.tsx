import type { LucideName } from '@/lib/types';
import { Icon } from './Icon';

export function EmptyState({ icon = 'check', title, body }: { icon?: LucideName; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[var(--success-opacity-10)] text-success">
        <Icon name={icon} size={22} />
      </span>
      <span className="text-[15px] font-semibold">{title}</span>
      <span className="text-[13px] text-muted">{body}</span>
    </div>
  );
}
