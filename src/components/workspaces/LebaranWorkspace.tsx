'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { LebaranDailyEntry, SurgeSummary } from '@/types/mobility';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatPercent } from '@/lib/constants';
import { Flame } from 'lucide-react';

interface LebaranWorkspaceProps {
  lebaranDaily: LebaranDailyEntry[];
  surgeSummary: SurgeSummary;
  isDarkMode: boolean;
  globalMetric?: 'pnp' | 'arm';
  globalDirection?: 'brg' | 'dat' | 'tot';
}

export const LebaranWorkspace: React.FC<LebaranWorkspaceProps> = ({
  lebaranDaily,
  surgeSummary,
  isDarkMode,
  globalMetric,
  globalDirection,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(11); // H+3 default (Peak Day: 24 Mar 2026)
  const [chartMode, setChartMode] = useState<'modes' | 'total'>('modes');
  const [selectedMetric, setSelectedMetric] = useState<'pnp' | 'arm'>(globalMetric || 'pnp');
  const [selectedDirection, setSelectedDirection] = useState<'brg' | 'dat' | 'tot'>(globalDirection || 'brg'); // Default: Berangkat

  // React to Master Filter
  React.useEffect(() => {
    if (globalMetric) setSelectedMetric(globalMetric);
  }, [globalMetric]);

  React.useEffect(() => {
    if (globalDirection) setSelectedDirection(globalDirection);
  }, [globalDirection]);

  const selectedDay = lebaranDaily[selectedDayIdx] || lebaranDaily[0];

  // Helper to extract metric value for a mode on a given day
  const getLebaranValue = (d: any, m: string) => {
    if (selectedMetric === 'pnp') {
      const key = selectedDirection === 'brg' ? `pbrg_${m}` : selectedDirection === 'dat' ? `pdat_${m}` : m;
      return Number(d[key]) || Number(d[m]) || 0;
    } else {
      const key = selectedDirection === 'brg' ? `abrg_${m}` : selectedDirection === 'dat' ? `adat_${m}` : `arm_${m}`;
      return Number(d[key]) || Number(d[`arm_${m}`]) || 0;
    }
  };

  const getLebaranTotal = (d: any) => {
    if (selectedMetric === 'pnp') {
      const key = selectedDirection === 'brg' ? 'pbrg_TOTAL' : selectedDirection === 'dat' ? 'pdat_TOTAL' : 'TOTAL';
      return Number(d[key]) || Number(d.TOTAL) || 0;
    } else {
      const key = selectedDirection === 'brg' ? 'abrg_TOTAL' : selectedDirection === 'dat' ? 'adat_TOTAL' : 'arm_TOTAL';
      return Number(d[key]) || Number(d.arm_TOTAL) || 0;
    }
  };

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
      const dirLabel = selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Total';
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
        valueFormatter: (value: any) => `${formatNumber(value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip'}`,
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
  }, [lebaranDaily, isDarkMode, chartMode, selectedDirection]);

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
              Periode Operasional 17 Hari: <strong>13 – 29 Maret 2026</strong> (H-8 s/d H+8 • Hari H: 21 Maret 2026).
            </p>
          </div>
          <div className="text-xs font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900">
            Rekor Arus Balik: 2.415.296 Pnp (+103,2% Surge)
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

      {/* SELECTED DAY DETAIL CARD */}
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
              <span className="text-slate-400">Total Penumpang: </span>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {formatNumber((selectedDay as any).TOTAL || (selectedDay.TOTAL ? selectedDay.TOTAL.pnp_tot : 0))} orang
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => {
              const val = Number((selectedDay as any)[m]) || 0;
              const totalVal = Number((selectedDay as any).TOTAL) || 1;
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
                    {formatNumber(val)}
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

      {/* LEBARAN LINE CHART (1:1 Paritas V1) */}
      <div className="w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Grafik Fluktuasi H-8 s/d H+8 Lebaran 2026 {chartMode === 'modes' ? '(5 Moda Terpisah)' : '(Total Nasional)'}
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Satuan: Orang</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Direction Selector (Default: Berangkat) */}
              <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setSelectedDirection('brg')}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    selectedDirection === 'brg'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Berangkat
                </button>
                <button
                  onClick={() => setSelectedDirection('dat')}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    selectedDirection === 'dat'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Datang
                </button>
                <button
                  onClick={() => setSelectedDirection('tot')}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    selectedDirection === 'tot'
                      ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Total
                </button>
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
          </div>
          <EChartWrapper options={lebaranLineChartOption} style={{ height: '360px', width: '100%' }} />
        </div>
      </div>

      {/* HEATMAP LONJAKAN LEBARAN & TABEL KOMPARASI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Matriks Heatmap Lonjakan Volume (Surge Rate %) vs Hari Normal
            </h4>
            <p className="text-xs text-slate-500">
              Perbandingan terhadap baseline normal non-libur (Februari 2026: 1.188.900 orang/hari)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 font-semibold">Moda Transportasi</th>
                <th className="py-2.5 text-right font-semibold">Baseline Normal (Feb)</th>
                <th className="py-2.5 text-right font-semibold">Puncak Mudik (H-3)</th>
                <th className="py-2.5 text-right font-semibold">Surge Mudik %</th>
                <th className="py-2.5 text-right font-semibold">Puncak Balik 1 (H+3)</th>
                <th className="py-2.5 text-right font-semibold">Surge Balik 1 %</th>
                <th className="py-2.5 text-right font-semibold">Puncak Balik 2 (H+7)</th>
                <th className="py-2.5 text-right font-semibold">Surge Balik 2 %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {Object.entries(surgeSummary).map(([modaKey, stats]) => {
                const isTotal = modaKey === 'TOTAL';
                return (
                  <tr
                    key={modaKey}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isTotal ? 'font-bold bg-slate-50/70 dark:bg-slate-800/60' : ''
                    }`}
                  >
                    <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {MODA_DISPLAY_NAME[modaKey] || modaKey}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(stats.baseline)}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(stats.peak_mudik)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {formatPercent(stats.surge_mudik_pct)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(stats.peak_balik1)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {formatPercent(stats.surge_balik1_pct)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatNumber(stats.peak_balik2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {formatPercent(stats.surge_balik2_pct)}
                      </span>
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
