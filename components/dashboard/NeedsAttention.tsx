import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { Attention } from '@/lib/types';
import { ATTENTION_BADGE } from './kpis';

export function NeedsAttention({ items }: { items: Attention[] }) {
  return (
    <section className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between pb-2">
        <h2 className="m-0 font-display text-lg font-semibold text-ink">Needs attention</h2>
        <span className="text-xs text-muted">{items.length} items</span>
      </div>
      {items.length === 0 && (
        <EmptyState title="Nothing needs attention." body="Queues are inside their targets. New items show up here as they age." />
      )}
      {items.map((a) => (
        <Link
          key={a.title}
          href={a.href}
          className="flex min-h-[60px] items-center gap-3.5 rounded-[14px] px-3 py-2 text-ink no-underline hover:bg-page hover:text-ink"
        >
          <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-tint-purple text-brand-purple">
            <Icon name={a.icon} size={17} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-sm font-semibold">{a.title}</span>
            <span className="text-xs text-muted">{a.meta}</span>
          </span>
          <Badge tone={a.tone} dot>
            {ATTENTION_BADGE[a.kind]}
          </Badge>
          <span className="hidden text-muted sm:inline">
            <Icon name="chevron-right" size={16} />
          </span>
        </Link>
      ))}
    </section>
  );
}
