import type { Conversion, Series } from '@/lib/types';

const CARD = 'flex min-w-0 flex-col gap-4 rounded-xl bg-white p-5 shadow-card';
const H2 = 'm-0 font-display text-lg font-semibold text-ink';

function Labels({ labels }: { labels: string[] }) {
  return (
    <div className="flex justify-between text-xs text-muted">
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

// Sign-ups: client and business lines on one scale (businesses ×20 so both read).
export function SignupsChart({ S, empty }: { S: Series; empty: boolean }) {
  const max = Math.max(...S.clients, ...S.businesses.map((b) => b * 20)) * 1.1 || 1;
  const pts = (arr: number[], mul = 1) =>
    arr
      .map((x) => (empty ? 0 : x) * mul)
      .map((y, i, v) => (i / (v.length - 1)) * 600 + ',' + (200 - (y / max) * 190).toFixed(1))
      .join(' ');
  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={H2}>Sign-ups</h2>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-3 rounded-sm bg-brand-purple" />
            Clients
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-3 rounded-sm bg-brand-teal" />
            Businesses (×20)
          </span>
        </div>
      </div>
      <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="block h-[200px] w-full" role="img" aria-label="Client and business sign-ups">
        {[50, 100, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(0,0,0,.05)" />
        ))}
        <polyline points={pts(S.clients)} fill="none" stroke="var(--color-brand-purple)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <polyline points={pts(S.businesses, 20)} fill="none" stroke="var(--color-brand-teal)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <Labels labels={S.labels} />
    </section>
  );
}

export function BookingsChart({ S, empty }: { S: Series; empty: boolean }) {
  const bmax = Math.max(...S.bookings);
  const total = empty ? '0' : S.bookings.reduce((a, b) => a + b, 0).toLocaleString('en-AE');
  return (
    <section className={CARD}>
      <div className="flex items-baseline justify-between">
        <h2 className={H2}>Bookings</h2>
        <span className="text-xs text-muted">{total} in range</span>
      </div>
      <div className="flex h-[200px] items-end gap-2.5">
        {S.bookings.map((b, i) => (
          <div
            key={S.labels[i]}
            title={S.labels[i] + ': ' + b.toLocaleString('en-AE') + ' bookings'}
            className="flex-1 rounded-[8px_8px_4px_4px] bg-[var(--primary-purple-opacity-20)] hover:bg-brand-purple"
            style={{ height: (empty ? 2 : Math.max(4, (b / bmax) * 100)) + '%' }}
          />
        ))}
      </div>
      <Labels labels={S.labels} />
    </section>
  );
}

export function ConversionBars({ rows, empty }: { rows: Conversion[]; empty: boolean }) {
  return (
    <section className={CARD}>
      <div className="flex items-baseline justify-between">
        <h2 className={H2}>Trial to paid</h2>
        <span className="text-xs text-muted">Last 6 months</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {rows.map((c) => {
          const rate = empty ? 0 : c.rate;
          return (
            <div key={c.month} className="grid grid-cols-[36px_minmax(0,1fr)_40px] items-center gap-3 text-xs text-muted">
              <span>{c.month}</span>
              <div className="h-2.5 overflow-hidden rounded-pill bg-surface-muted">
                <div className="h-full rounded-pill bg-brand-teal" style={{ width: (rate / 50) * 100 + '%' }} />
              </div>
              <span className="text-right font-semibold text-ink">{rate}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
