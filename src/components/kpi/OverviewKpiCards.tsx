'use client';

import React from 'react';
import { Users, Bus, Calendar, Flame, Activity } from 'lucide-react';
import { formatNumber, formatPercent } from '@/lib/constants';
import { MetaKpis } from '@/types/mobility';

interface OverviewKpiCardsProps {
  meta: MetaKpis;
  metricsSummary?: Record<string, any>;
  metric?: 'pnp' | 'arm';
  direction?: 'brg' | 'dat' | 'tot';
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  meta,
  metricsSummary,
  metric = 'pnp',
  direction = 'brg',
}) => {
  const isPnp = metric === 'pnp';
  const combo = `${metric}_${direction}`;
  const s = metricsSummary?.[combo];

  // Complementary opposing metric (e.g. if looking at pnp_brg, opp is arm_brg)
  const oppCombo = (isPnp ? 'arm_' : 'pnp_') + direction;
  const oppS = metricsSummary?.[oppCombo];

  const dirLabel = direction === 'brg' ? 'Berangkat' : direction === 'dat' ? 'Datang' : 'Dua Arah';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 transition-all">
      {/* 1. Primary Active Metric YTD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            {isPnp ? 'Total Penumpang' : 'Total Armada'} ({dirLabel})
          </span>
          {isPnp ? (
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          ) : (
            <Bus className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          )}
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
          {formatNumber(s?.ytd ?? (isPnp ? meta.total_passengers_ytd : meta.total_armada_ytd))}
        </div>
        <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{isPnp ? 'Datang: ' + formatNumber(meta.total_pnp_dat_ytd) : 'Datang: ' + formatNumber(meta.total_arm_dat_ytd)}</span>
          <span>{isPnp ? 'Pergi: ' + formatNumber(meta.total_pnp_brg_ytd) : 'Pergi: ' + formatNumber(meta.total_arm_brg_ytd)}</span>
        </div>
      </div>

      {/* 2. Complementary Opposing Metric YTD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            {!isPnp ? 'Total Penumpang' : 'Total Armada'} ({dirLabel})
          </span>
          {!isPnp ? (
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
          {formatNumber(oppS?.ytd ?? (!isPnp ? meta.total_passengers_ytd : meta.total_armada_ytd))}
        </div>
        <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Rata-rata: {formatNumber(oppS?.avg ?? Math.round(meta.total_armada_ytd / meta.days_count))} {!isPnp ? 'pnp' : 'trip'}/hari</span>
        </div>
      </div>

      {/* 3. Daily Average */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            Rata-rata Harian ({isPnp ? 'Pnp' : 'Trip'})
          </span>
          <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
          {formatNumber(s?.avg ?? Math.round(meta.total_passengers_ytd / meta.days_count))}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>Baseline Normal: {formatNumber(s?.baseline_feb ?? meta.baseline_feb_avg)} /hari</span>
        </div>
      </div>

      {/* 4. Peak Mudik */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            Puncak Mudik ({isPnp ? 'Pnp' : 'Arm'})
          </span>
          <Flame className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
          {formatNumber(s?.mudik_val ?? meta.peak_mudik_val)}
        </div>
        <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between">
          <span>{s?.mudik_tag ? s.mudik_tag.split('(')[0].trim() : '18 Mar 2026'}</span>
          <span>{formatPercent(s?.mudik_surge_pct ?? meta.peak_mudik_surge_pct)} surge</span>
        </div>
      </div>

      {/* 5. All-Time Peak / Return Peak */}
      <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            Puncak Balik / Rekor ({isPnp ? 'Pnp' : 'Arm'})
          </span>
          <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-rose-700 dark:text-rose-400">
          {formatNumber(s?.peak_val ?? meta.all_time_peak_val)}
        </div>
        <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
          <span>{s?.peak_tag ? s.peak_tag.split('(')[0].trim() : '24 Mar 2026 (H+3)'}</span>
          <span>{formatPercent(s?.peak_surge_pct ?? meta.all_time_peak_surge_pct)} surge</span>
        </div>
      </div>
    </div>
  );
};
