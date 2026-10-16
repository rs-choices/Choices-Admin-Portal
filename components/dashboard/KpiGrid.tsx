import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { KpiCard } from './kpis';

const CARD =
  'flex flex-col gap-2.5 rounded-xl bg-white px-5 py-[18px] text-ink no-underline shadow-card';
const HOVER = 'hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--primary-purple-opacity-20),0px_4px_12px_0px_rgba(0,0,0,0.08)]';

export function KpiGrid({ kpis }: { kpis: KpiCard[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {kpis.map((k) => {
        const body = (
          <>
            <span className="flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-muted">
              <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-tint-purple text-brand-purple">
                <Icon name={k.icon} size={16} />
              </span>
              {k.label}
            </span>
            <span className="font-display text-[28px] font-bold leading-[1.1] tabular-nums">{k.value}</span>
            <span className="text-xs" style={{ color: k.deltaColor }}>
              {k.delta}
            </span>
          </>
        );
        return k.href ? (
          <Link key={k.id} href={k.href} className={`${CARD} ${HOVER}`}>
            {body}
          </Link>
        ) : (
          <div key={k.id} className={CARD}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
