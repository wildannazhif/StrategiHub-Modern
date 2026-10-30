'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { DailyTimelineEntry, MonthlySummaryEntry, DOWSummaryEntry } from '@/types/mobility';
import { COLOR, MODA_DISPLAY_NAME, getMetricValue, formatNumber } from '@/lib/constants';

interface TimelineWorkspaceProps {
  timeline: DailyTimelineEntry[];
  monthly: MonthlySummaryEntry[];
  dow: DOWSummaryEntry[];
  provinceGrowthData?: any;
  isDarkMode: boolean;
}

export const TimelineWorkspace: React.FC<TimelineWorkspaceProps> = ({
  timeline,
  monthly,
  dow,
  isDarkMode,
}) => {
  // State
  const [selectedMetric, setSelectedMetric] = useState<'pnp' | 'arm'>('pnp');
  const [selectedDirection, setSelectedDirection] = useState<'tot' | 'dat' | 'brg'>('tot');
  const [chartViewMode, setChartViewMode] = useState<'modes' | 'total'>('modes');
  const [timeRange, setTimeRange] = useState<'all' | 't1' | 't2' | 't3' | 'lebaran' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('2026-03-01');
  const [customEnd, setCustomEnd] = useState('2026-03-31');

  // Filtered timeline data
  const filteredTimeline = useMemo(() => {
    let list = timeline;
    if (timeRange === 't1') {
      list = timeline.filter((d) => d.date >= '2026-01-01' && d.date <= '2026-04-30');
    } else if (timeRange === 't2') {
      list = timeline.filter((d) => d.date >= '2026-05-01' && d.date <= '2026-08-31');
    } else if (timeRange === 't3') {
      list = timeline.filter((d) => d.date >= '2026-09-01' && d.date <= '2026-10-13');
    } else if (timeRange === 'lebaran') {
      list = timeline.filter((d) => d.date >= '2026-03-13' && d.date <= '2026-03-29');
    } else if (timeRange === 'custom') {
      list = timeline.filter((d) => d.date >= customStart && d.date <= customEnd);
    }
    return list;
  }, [timeline, timeRange, customStart, customEnd]);

  // EChart Options for Timeline
  const timelineChartOption = useMemo(() => {
    const dates = filteredTimeline.map((d) => d.date);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];

    let series: any[] = [];

    if (chartViewMode === 'modes') {
      // Show ONLY the 5 distinct transport modes (No Total to avoid scale squashing)
      series = modes.map((m) => {
        const data = filteredTimeline.map((d) => getMetricValue(d, m, selectedMetric, selectedDirection));
        return {
          name: MODA_DISPLAY_NAME[m],
          type: 'line',
          smooth: 0.25,
          showSymbol: filteredTimeline.length <= 35,
          symbolSize: 6,
          data,
          lineStyle: { width: 2.5, color: COLOR[m] },
          itemStyle: { color: COLOR[m] },
        };
      });
    } else {
      // Show ONLY Total Multimoda (scaled to national volume with subtle gradient)
      const totalData = filteredTimeline.map((d) => getMetricValue(d, 'TOTAL', selectedMetric, selectedDirection));
      series = [
        {
          name: 'Total Multimoda Nasional',
          type: 'line',
          smooth: 0.25,
          showSymbol: filteredTimeline.length <= 35,
          symbolSize: 6,
          data: totalData,
          lineStyle: { width: 3.5, color: isDarkMode ? '#38bdf8' : '#0284c7' },
          itemStyle: { color: isDarkMode ? '#38bdf8' : '#0284c7' },
          areaStyle: {
            color: isDarkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)',
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
        icon: 'circle',
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
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
        axisLabel: { color: textColor, fontSize: 10, rotate: filteredTimeline.length > 50 ? 45 : 0 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${Math.round(v / 1000)}k`;
            return `${v}`;
          },
        },
      },
      series,
    };
  }, [filteredTimeline, isDarkMode, selectedMetric, selectedDirection, chartViewMode]);

  // EChart Options for DOW
  const dowChartOption = useMemo(() => {
    const days = dow.map((d: any) => d.dow || d.day_name);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    const series = modes.map((m) => ({
      name: MODA_DISPLAY_NAME[m],
      type: 'bar',
      stack: 'total',
      data: dow.map((d) => getMetricValue(d, m, selectedMetric, selectedDirection)),
      itemStyle: { color: COLOR[m] },
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) => `${formatNumber(value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip'}`,
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
        itemGap: 12,
      },
      grid: {
        top: 20,
        left: '2%',
        right: '2%',
        bottom: 35,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLabel: { color: textColor, fontSize: 11 },
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
  }, [dow, isDarkMode, selectedMetric, selectedDirection]);

  return (
    <div className="space-y-6">
      {/* TOOLBAR CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Metrik & Direction */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setSelectedMetric('pnp')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedMetric === 'pnp'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Penumpang
              </button>
              <button
                onClick={() => setSelectedMetric('arm')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedMetric === 'arm'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Armada
              </button>
            </div>

            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setSelectedDirection('tot')}
                className={`px-2.5 py-1.5 rounded-md font-medium ${
                  selectedDirection === 'tot'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Total
              </button>
              <button
                onClick={() => setSelectedDirection('dat')}
                className={`px-2.5 py-1.5 rounded-md font-medium ${
                  selectedDirection === 'dat'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Datang
              </button>
              <button
                onClick={() => setSelectedDirection('brg')}
                className={`px-2.5 py-1.5 rounded-md font-medium ${
                  selectedDirection === 'brg'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Berangkat
              </button>
            </div>

            {/* View Mode: 5 Moda vs Total Multimoda */}
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setChartViewMode('modes')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  chartViewMode === 'modes'
                    ? 'bg-sky-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                📊 5 Moda (Detail)
              </button>
              <button
                onClick={() => setChartViewMode('total')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  chartViewMode === 'total'
                    ? 'bg-sky-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                📈 Total Multimoda
              </button>
            </div>
          </div>

          {/* Preset Rentang Tanggal */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">Rentang:</span>
            {[
              { id: 'all', label: 'All (286H)' },
              { id: 't1', label: 'T1' },
              { id: 't2', label: 'T2' },
              { id: 't3', label: 'T3' },
              { id: 'lebaran', label: 'Lebaran' },
              { id: 'custom', label: 'Custom' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
                  timeRange === r.id
                    ? 'bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800 font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Mulai:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 font-mono"
            />
            <span className="text-slate-500">Sampai:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
        )}
      </div>

      {/* 1. KRONOLOGI HARIAN CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Tren Harian Deret Waktu Multimoda 2026 {chartViewMode === 'modes' ? '(5 Moda Terpisah)' : '(Agregat Total)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan {filteredTimeline.length} observasi harian ({selectedMetric === 'pnp' ? 'Penumpang' : 'Armada'} •{' '}
              {selectedDirection === 'tot' ? 'Total Dua Arah' : selectedDirection === 'dat' ? 'Kedatangan' : 'Keberangkatan'})
              {chartViewMode === 'modes' && ' — Skala Y-axis optimal untuk melihat dinamika masing-masing moda tanpa tertutup angka total.'}
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Sumber: SIASATI PUSDATIN
          </div>
        </div>

        <EChartWrapper options={timelineChartOption} style={{ height: '400px', width: '100%' }} />
      </div>

      {/* 2. TABEL RINGKASAN BULANAN (10 BULAN) & POLA HARI MINGGUAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TABEL BULANAN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Ringkasan Agregasi Bulanan (Jan – Okt 2026)
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Satuan: {selectedMetric === 'pnp' ? 'Org' : 'Trip'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 font-semibold">Bulan</th>
                    <th className="py-2 text-right font-semibold">Udara</th>
                    <th className="py-2 text-right font-semibold">KA</th>
                    <th className="py-2 text-right font-semibold">Bus</th>
                    <th className="py-2 text-right font-semibold">ASDP</th>
                    <th className="py-2 text-right font-semibold">Laut</th>
                    <th className="py-2 text-right font-semibold text-slate-900 dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {monthly.map((m: any) => (
                    <tr key={m.bulan || m.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 font-sans font-medium text-slate-700 dark:text-slate-300">
                        {m.label || m.bulan}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(getMetricValue(m, 'UDARA', selectedMetric, selectedDirection))}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(getMetricValue(m, 'KA', selectedMetric, selectedDirection))}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(getMetricValue(m, 'BUS', selectedMetric, selectedDirection))}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(getMetricValue(m, 'ASDP', selectedMetric, selectedDirection))}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(getMetricValue(m, 'LAUT', selectedMetric, selectedDirection))}
                      </td>
                      <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                        {formatNumber(getMetricValue(m, 'TOTAL', selectedMetric, selectedDirection))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* POLA HARI MINGGUAN (DOW) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Distribusi Pola Hari Mingguan (Day-of-Week Effect)
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Komposisi 5 Moda</span>
            </div>
            <EChartWrapper options={dowChartOption} style={{ height: '310px', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
            💡 <em>Jumat dan Minggu mencatat lonjakan mobilitas tertinggi pada moda Udara dan Kereta Api.</em>
          </div>
        </div>
      </div>
    </div>
  );
};
