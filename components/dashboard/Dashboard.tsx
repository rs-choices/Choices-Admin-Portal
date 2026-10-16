'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { PageHeader } from '@/components/shell/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { getDashboard } from '@/lib/data/dashboard';
import type { DashboardData, Range } from '@/lib/types';
import { BookingsChart, ConversionBars, SignupsChart } from './Charts';
import { ExportMenu, type ExportOption } from './ExportMenu';
import { KpiGrid } from './KpiGrid';
import { attentionFor, buildKpis, toCsv } from './kpis';
import { NeedsAttention } from './NeedsAttention';

export type Demo = 'live' | 'loading' | 'empty' | 'error';

const RANGES: { value: Range; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Dashboard({ demo }: { demo: Demo }) {
  const { role, flash } = useAdmin();
  const [data, setData] = useState<DashboardData | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<Range>('7d');

  const fetchData = useCallback(() => {
    getDashboard()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  useEffect(fetchData, [fetchData]);

  const retry = () => {
    setData(null);
    setFailed(false);
    fetchData();
  };

  const mod = role === 'moderator';
  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !data);
  const empty = demo === 'empty';

  const subtitle = mod
    ? 'Thursday 16 October 2026 · Your moderation and support queues'
    : 'Thursday 16 October 2026 · Dubai time';

  const ready = !isLoading && !isError && data;
  const kpis = ready ? buildKpis(data, range, role, empty) : [];
  const attention = ready ? attentionFor(data, role, empty) : [];
  const S = ready ? data.SERIES[range] : null;

  const days = range.replace('d', '');
  const file = (ext: string) => 'choices-dashboard-' + days + 'd-2026-10-16.' + ext;
  const exportOpts: ExportOption[] = [
    {
      label: 'CSV',
      desc: 'KPIs, daily sign-ups and bookings for the last ' + days + ' days',
      run: () => {
        if (!S) return;
        download(file('csv'), toCsv(kpis, S, attention, empty), 'text/csv');
        flash(file('csv') + ' downloaded.');
      },
    },
    {
      label: 'PDF',
      desc: 'This page as it looks now, for sharing',
      run: () => {
        window.print();
        flash('Print dialog opened. Choose “Save as PDF”.');
      },
    },
    {
      label: 'Email me a weekly copy',
      desc: 'Every Monday at 09:00 to johndoe@thechoicesapp.com',
      run: () => flash('Weekly dashboard email set up for Mondays at 09:00.'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          !mod && (
            <>
              <Segmented label="Date range" options={RANGES} value={range} onChange={setRange} />
              {ready && <ExportMenu options={exportOpts} />}
            </>
          )
        }
      />

      {isLoading && (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {Array.from({ length: mod ? 2 : 8 }, (_, i) => (
              <Skeleton key={i} className="h-[118px]" />
            ))}
          </div>
          <Skeleton className="h-[300px]" />
        </>
      )}

      {isError && (
        <ErrorState
          title="Couldn't load the dashboard."
          body="The metrics service didn't respond. Nothing was lost. Try again in a moment."
          onRetry={retry}
        />
      )}

      {ready && S && (
        <>
          <KpiGrid kpis={kpis} />
          {!mod && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
              <SignupsChart S={S} empty={empty} />
              <BookingsChart S={S} empty={empty} />
              <ConversionBars rows={data.CONVERSION} empty={empty} />
            </div>
          )}
          <NeedsAttention items={attention} />
        </>
      )}
    </>
  );
}
