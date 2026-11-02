'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { LebaranDailyEntry, SurgeSummary, MonthlySummaryEntry } from '@/types/mobility';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatPercent } from '@/lib/constants';
import { Flame } from 'lucide-react';

interface LebaranWorkspaceProps {
  lebaranDaily: LebaranDailyEntry[];
  surgeSummary: SurgeSummary;
  monthlySummary?: MonthlySummaryEntry[];
  metricsSummary?: Record<string, any>;
  isDarkMode: boolean;
  globalMetric?: 'pnp' | 'arm';
  globalDirection?: 'brg' | 'dat' | 'tot';
}

export const LebaranWorkspace: React.FC<LebaranWorkspaceProps> = ({
  lebaranDaily,
  surgeSummary,
  monthlySummary = [],
  metricsSummary,
  isDarkMode,
  globalMetric = 'pnp',
  globalDirection = 'brg',
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(11); // H+3 default (Peak Day: 24 Mar 2026)
  const [chartMode, setChartMode] = useState<'modes' | 'total'>('modes');
  const selectedMetric = globalMetric;
  const selectedDirection = globalDirection;

  const isPnp = selectedMetric === 'pnp';
  const selectedDay = lebaranDaily[selectedDayIdx] || lebaranDaily[0];

  // Helper to extract metric value for a mode on a given day
  const getLebaranValue = (d: any, m: string) => {
    if (!d) return 0;
    if (selectedMetric === 'pnp') {
      const key = selectedDirection === 'brg' ? `pbrg_${m}` : selectedDirection === 'dat' ? `pdat_${m}` : m;
      return Number(d[key]) || Number(d[m]) || 0;
    } else {
      const key = selectedDirection === 'brg' ? `abrg_${m}` : selectedDirection === 'dat' ? `adat_${m}` : `arm_${m}`;
      return Number(d[key]) || Number(d[`arm_${m}`]) || 0;
    }
  };

  const getLebaranTotal = (d: any) => {
    if (!d) return 0;
    if (selectedMetric === 'pnp') {
      const key = selectedDirection === 'brg' ? 'pbrg_TOTAL' : selectedDirection === 'dat' ? 'pdat_TOTAL' : 'TOTAL';
      return Number(d[key]) || Number(d.TOTAL) || 0;
    } else {
      const key = selectedDirection === 'brg' ? 'abrg_TOTAL' : selectedDirection === 'dat' ? 'adat_TOTAL' : 'arm_TOTAL';
      return Number(d[key]) || Number(d.arm_TOTAL) || 0;
    }
  };

  // Dynamic banner stats based on active Filter
  const comboKey = `${selectedMetric}_${selectedDirection}`;
  const bannerStats = metricsSummary?.[comboKey];
  const balikDay = useMemo(() => lebaranDaily.find((d) => d.date === '2026-03-24') || lebaranDaily[0], [lebaranDaily]);
  const peakBalikVal = bannerStats?.peak_val ?? getLebaranTotal(balikDay);
  const peakBalikSurge = bannerStats?.peak_surge_pct ?? 103.2;

  // 17-day line chart
  const lebaranLineChartOption = useMemo(() => {
    const dates = lebaranDaily.map((d: any) => `${d.tag || d.h_tag} (${d.date.slice(5)})`);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    let series: any[] = [];

    if (chartMode === 'modes') {
      // 5 MODA ONLY (scaled to visible details)
      series = modes.map((m) => {
        return {
          name: MODA_DISPLAY_NAME[m],
          type: 'line',
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 6,
          data: lebaranDaily.map((d: any) => getLebaranValue(d, m)),
          lineStyle: { width: 2.5, color: COLOR[m] },
          itemStyle: { color: COLOR[m] },
        };
      });
    } else {
      // SEMUA MODA ONLY (National macro peak)
      const dirLabel = selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Dua Arah';
      const metLabel = selectedMetric === 'pnp' ? 'Penumpang' : 'Armada';
      series = [
        {
          name: `Semua Moda (${metLabel} • ${dirLabel})`,
          type: 'line',
          smooth: 0.3,
          symbol: 'diamond',
          symbolSize: 8,
          data: lebaranDaily.map((d: any) => getLebaranTotal(d)),
          lineStyle: { width: 3.5, color: isDarkMode ? '#f43f5e' : '#e11d48' },
          itemStyle: { color: isDarkMode ? '#f43f5e' : '#e11d48' },
          areaStyle: {
            color: isDarkMode ? 'rgba(244, 63, 94, 0.12)' : 'rgba(225, 29, 72, 0.1)',
          },
        },
      ];
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) => `${formatNumber(value)} ${isPnp ? 'orang' : 'trip'}`,
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
        itemGap: 14,
      },
      grid: {
        top: 24,
        left: '2%',
        right: '2%',
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: textColor, fontSize: 10, rotate: 30 },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${Math.round(v / 1000)}k`),
        },
      },
      series,
    };
  }, [lebaranDaily, isDarkMode, chartMode, selectedMetric, selectedDirection]);

  // Dynamic surge calculations for the heatmap table
  const dynamicSurgeData = useMemo(() => {
    const feb = monthlySummary?.[1] as any;
    const d_mudik = lebaranDaily.find((d) => d.date === '2026-03-18');
    const d_balik1 = lebaranDaily.find((d) => d.date === '2026-03-24');
    const d_balik2 = lebaranDaily.find((d) => d.date === '2026-03-29');

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT' | 'TOTAL'> = [
      'UDARA',
      'KA',
      'BUS',
      'ASDP',
      'LAUT',
      'TOTAL',
    ];

    return modes.map((m) => {
      let baseline = 0;
      if (feb) {
        if (m === 'TOTAL') {
          if (selectedMetric === 'pnp') {
            const key = selectedDirection === 'brg' ? 'pbrg_TOTAL' : selectedDirection === 'dat' ? 'pdat_TOTAL' : 'TOTAL';
            baseline = Math.round((Number(feb[key]) || Number(feb.TOTAL) || 0) / 28);
          } else {
            const key = selectedDirection === 'brg' ? 'abrg_TOTAL' : selectedDirection === 'dat' ? 'adat_TOTAL' : 'arm_TOTAL';
            baseline = Math.round((Number(feb[key]) || Number(feb.arm_TOTAL) || 0) / 28);
          }
        } else {
          if (selectedMetric === 'pnp') {
            const key = selectedDirection === 'brg' ? `pbrg_${m}` : selectedDirection === 'dat' ? `pdat_${m}` : m;
            baseline = Math.round((Number(feb[key]) || Number(feb[m]) || 0) / 28);
          } else {
            const key = selectedDirection === 'brg' ? `abrg_${m}` : selectedDirection === 'dat' ? `adat_${m}` : `arm_${m}`;
            baseline = Math.round((Number(feb[key]) || Number(feb[`arm_${m}`]) || 0) / 28);
          }
        }
      } else {
        baseline = surgeSummary[m]?.baseline || 1;
      }

      const mudikVal = m === 'TOTAL' ? (d_mudik ? getLebaranTotal(d_mudik) : 0) : (d_mudik ? getLebaranValue(d_mudik, m) : 0);
      const balik1Val = m === 'TOTAL' ? (d_balik1 ? getLebaranTotal(d_balik1) : 0) : (d_balik1 ? getLebaranValue(d_balik1, m) : 0);
      const balik2Val = m === 'TOTAL' ? (d_balik2 ? getLebaranTotal(d_balik2) : 0) : (d_balik2 ? getLebaranValue(d_balik2, m) : 0);

      const surgeMudik = baseline > 0 ? ((mudikVal - baseline) / baseline) * 100 : 0;
      const surgeBalik1 = baseline > 0 ? ((balik1Val - baseline) / baseline) * 100 : 0;
      const surgeBalik2 = baseline > 0 ? ((balik2Val - baseline) / baseline) * 100 : 0;

      return {
        modaKey: m,
        baseline,
        mudikVal,
        surgeMudik,
        balik1Val,
        surgeBalik1,
        balik2Val,
        surgeBalik2,
      };
    });
  }, [lebaranDaily, monthlySummary, surgeSummary, selectedMetric, selectedDirection]);

  // Heatmap styling calculation (interpolates color based on surge percentage)
  const getHeatmapStyle = (percent: number) => {
    const min = 0;
    const max = 260;
    const pos = Math.max(0, Math.min(1, (percent - min) / (max - min)));

    if (isDarkMode) {
      const r = Math.round(76 + (225 - 76) * pos);
      const g = Math.round(5 + (29 - 5) * pos);
      const b = Math.round(25 + (72 - 25) * pos);
      const textColor = pos > 0.35 ? '#ffffff' : '#fecdd3';
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        color: textColor,
      };
    } else {
      const r = Math.round(255 + (153 - 255) * pos);
      const g = Math.round(228 + (27 - 228) * pos);
      const b = Math.round(230 + (27 - 230) * pos);
      const textColor = pos > 0.45 ? '#ffffff' : '#881337';
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        color: textColor,
      };
    }
  };

  const sortedHeatmapRows = useMemo(() => {
    const rows = dynamicSurgeData.filter((r) => r.modaKey !== 'TOTAL');
    rows.sort((a, b) => {
      const maxA = Math.max(a.surgeMudik, a.surgeBalik1, a.surgeBalik2);
      const maxB = Math.max(b.surgeMudik, b.surgeBalik1, b.surgeBalik2);
      return maxB - maxA;
    });
    const totalRow = dynamicSurgeData.find((r) => r.modaKey === 'TOTAL');
    return { modesRows: rows, totalRow };
  }, [dynamicSurgeData, isDarkMode]);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-rose-900/10 via-amber-900/10 to-transparent dark:from-rose-950/30 dark:via-amber-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Monitoring Khusus Periode Angkutan Lebaran 2026 (1447H)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Periode Operasional 17 Hari: <strong>13 – 29 Maret 2026</strong> (H-8 s/d H+8 • Hari H: 21 Maret 2026) —{' '}
              {isPnp ? 'Mobilitas Penumpang' : 'Operasional Armada'}{' '}
              ({selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Dua Arah'}).
            </p>
          </div>
          <div className="text-xs font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 whitespace-nowrap">
            Rekor Arus Balik: {formatNumber(peakBalikVal)} {isPnp ? 'Pnp' : 'Armada'} (+{formatPercent(peakBalikSurge)} Surge)
          </div>
        </div>

        {/* 17-DAY INTERACTIVE TIMELINE SELECTOR */}
        <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-[700px]">
            {lebaranDaily.map((d: any, idx) => {
              const isSelected = selectedDayIdx === idx;
              const isPeak = d.date === '2026-03-24';
              const isHariH = d.date === '2026-03-21';

              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`flex-1 py-1.5 px-1 rounded text-center transition-all border ${
                    isSelected
                      ? 'bg-rose-600 text-white font-bold border-rose-700 shadow-xs'
                      : isPeak
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold'
                      : isHariH
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] leading-none">{d.tag || d.h_tag}</div>
                  <div className="text-[11px] font-mono mt-0.5">{d.date.slice(8)} Mar</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SELECTED DAY DETAIL CARD (Dynamic to active Filter) */}
      {selectedDay && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {(selectedDay as any).tag || selectedDay.h_tag}
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedDay.date}
              </span>
            </div>
            <div className="text-xs font-mono">
              <span className="text-slate-400">Total {isPnp ? 'Penumpang' : 'Armada'} ({selectedDirection === 'brg' ? 'Berangkat' : selectedDirection === 'dat' ? 'Datang' : 'Total'}): </span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {formatNumber(getLebaranTotal(selectedDay))} {isPnp ? 'orang' : 'trip'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => {
              const val = getLebaranValue(selectedDay, m);
              const totalVal = getLebaranTotal(selectedDay) || 1;
              return (
                <div
                  key={m}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{MODA_DISPLAY_NAME[m]}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLOR[m] }}
                    />
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                    {formatNumber(val)} {isPnp ? 'org' : 'trip'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {((val / totalVal) * 100).toFixed(1)}% pangsa
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-COLUMN ROW: LINE CHART (LEFT) + SURGE HEATMAP PANEL (RIGHT) (Exact V1 Parity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (lg:col-span-6): DINAMIKA HARIAN 5 MODA ANGKUTAN LEBARAN 2026 */}
        <div className="lg:col-span-6 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
                  Dinamika Harian 5 Moda Angkutan Lebaran 2026
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Dua Arah'} • {isPnp ? 'Penumpang' : 'Armada'}
                </span>
              </div>

              {/* Mode Selector: 5 Moda vs Total */}
              <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setChartMode('modes')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    chartMode === 'modes'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  5 Moda
                </button>
                <button
                  onClick={() => setChartMode('total')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    chartMode === 'total'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Total Nasional
                </button>
              </div>
            </div>

            <div className="mt-2">
              <EChartWrapper options={lebaranLineChartOption} style={{ height: '320px', width: '100%' }} />
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            ℹ️ Garis Total dapat di-toggle melalui tombol di kanan atas untuk menjaga proporsi kurva 5 moda.
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-6): PERSENTASE LONJAKAN (%) TERHADAP BASELINE NORMAL (MEDIAN 1 JAN - 12 MAR 2026) */}
        <section className="lg:col-span-6 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
                Persentase Lonjakan (%) terhadap Baseline Normal (Median 1 Jan - 12 Mar 2026)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Heatmap lonjakan volume per moda pada tiga puncak masa Lebaran terhadap baseline normal pra-Lebaran.
              </p>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full table-fixed border-separate text-xs" style={{ borderSpacing: '3px' }}>
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400" style={{ width: '28%' }}>
                      Moda
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="block font-bold">Mudik</span>
                      <span className="block text-[10px] text-slate-400 font-normal">18 Mar (H-3)</span>
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="block font-bold">Balik 1</span>
                      <span className="block text-[10px] text-slate-400 font-normal">24 Mar (H+3)</span>
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="block font-bold">Balik 2</span>
                      <span className="block text-[10px] text-slate-400 font-normal">29 Mar (H+8)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHeatmapRows.modesRows.map((row) => (
                    <tr key={row.modaKey}>
                      <th scope="row" className="px-2 py-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {MODA_DISPLAY_NAME[row.modaKey] || row.modaKey}
                      </th>
                      <td
                        style={getHeatmapStyle(row.surgeMudik)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-bold text-xs"
                        title={`${MODA_DISPLAY_NAME[row.modaKey]}; Puncak Mudik: ${formatNumber(row.mudikVal)}; Baseline: ${formatNumber(row.baseline)}`}
                      >
                        +{row.surgeMudik.toFixed(1)}%
                      </td>
                      <td
                        style={getHeatmapStyle(row.surgeBalik1)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-bold text-xs"
                        title={`${MODA_DISPLAY_NAME[row.modaKey]}; Puncak Balik 1: ${formatNumber(row.balik1Val)}; Baseline: ${formatNumber(row.baseline)}`}
                      >
                        +{row.surgeBalik1.toFixed(1)}%
                      </td>
                      <td
                        style={getHeatmapStyle(row.surgeBalik2)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-bold text-xs"
                        title={`${MODA_DISPLAY_NAME[row.modaKey]}; Puncak Balik 2: ${formatNumber(row.balik2Val)}; Baseline: ${formatNumber(row.baseline)}`}
                      >
                        +{row.surgeBalik2.toFixed(1)}%
                      </td>
                    </tr>
                  ))}

                  {sortedHeatmapRows.totalRow && (
                    <tr className="border-t-2 border-slate-300 dark:border-slate-700">
                      <th scope="row" className="px-2 py-2.5 text-left text-xs font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                        Semua Moda
                      </th>
                      <td
                        style={getHeatmapStyle(sortedHeatmapRows.totalRow.surgeMudik)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-black text-xs border-t-2 border-slate-300 dark:border-slate-700"
                        title={`Semua Moda; Puncak Mudik: ${formatNumber(sortedHeatmapRows.totalRow.mudikVal)}; Baseline: ${formatNumber(sortedHeatmapRows.totalRow.baseline)}`}
                      >
                        +{sortedHeatmapRows.totalRow.surgeMudik.toFixed(1)}%
                      </td>
                      <td
                        style={getHeatmapStyle(sortedHeatmapRows.totalRow.surgeBalik1)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-black text-xs border-t-2 border-slate-300 dark:border-slate-700"
                        title={`Semua Moda; Puncak Balik 1: ${formatNumber(sortedHeatmapRows.totalRow.balik1Val)}; Baseline: ${formatNumber(sortedHeatmapRows.totalRow.baseline)}`}
                      >
                        +{sortedHeatmapRows.totalRow.surgeBalik1.toFixed(1)}%
                      </td>
                      <td
                        style={getHeatmapStyle(sortedHeatmapRows.totalRow.surgeBalik2)}
                        className="rounded-md px-1 py-2.5 text-center font-mono font-black text-xs border-t-2 border-slate-300 dark:border-slate-700"
                        title={`Semua Moda; Puncak Balik 2: ${formatNumber(sortedHeatmapRows.totalRow.balik2Val)}; Baseline: ${formatNumber(sortedHeatmapRows.totalRow.baseline)}`}
                      >
                        +{sortedHeatmapRows.totalRow.surgeBalik2.toFixed(1)}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
            <span>Moda diurutkan menurut lonjakan tertinggi. 0% = setara baseline normal.</span>
            <span>Arahkan kursor ke sel untuk melihat volume riil.</span>
          </div>
        </section>
      </div>

      {/* FULL-WIDTH DENSE SURGE DATA TABLE (Exact V1 Parity) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
              Tabel Komparasi Angka Lonjakan Puncak Lebaran
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan baseline harian normal (Median 1 Jan - 12 Mar 2026) dengan volume puncak arus mudik dan arus balik — {isPnp ? 'Penumpang' : 'Armada'} ({selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Dua Arah'})
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Unit: {isPnp ? 'Penumpang' : 'Trip Armada'}
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Moda Transportasi</th>
                <th className="py-2.5 px-3 text-right font-semibold">Baseline Normal (1 Jan - 12 Mar)</th>
                <th className="py-2.5 px-3 text-right font-semibold text-purple-700 dark:text-purple-400">Puncak Mudik (18 Mar / H-3)</th>
                <th className="py-2.5 px-3 text-right font-semibold text-purple-700 dark:text-purple-400">Lonjakan (%)</th>
                <th className="py-2.5 px-3 text-right font-semibold text-rose-700 dark:text-rose-400">Puncak Balik 1 (24 Mar / H+3)</th>
                <th className="py-2.5 px-3 text-right font-semibold text-rose-700 dark:text-rose-400">Lonjakan (%)</th>
                <th className="py-2.5 px-3 text-right font-semibold">Puncak Balik 2 (29 Mar / H+8)</th>
                <th className="py-2.5 px-3 text-right font-semibold">Lonjakan (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {dynamicSurgeData.map((item) => {
                const isTotal = item.modaKey === 'TOTAL';
                return (
                  <tr
                    key={item.modaKey}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isTotal ? 'font-bold bg-slate-50/70 dark:bg-slate-800/60' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {MODA_DISPLAY_NAME[item.modaKey] || item.modaKey}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(item.baseline)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-700 dark:text-purple-400">
                      {formatNumber(item.mudikVal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-700 dark:text-purple-400">
                      +{item.surgeMudik.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                      {formatNumber(item.balik1Val)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                      +{item.surgeBalik1.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(item.balik2Val)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      +{item.surgeBalik2.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
