'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { DailyTimelineEntry, MonthlySummaryEntry, DOWSummaryEntry } from '@/types/mobility';
import { COLOR, MODA_DISPLAY_NAME, getMetricValue, formatNumber, formatPercent } from '@/lib/constants';
import { MapPin, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface TimelineWorkspaceProps {
  timeline: DailyTimelineEntry[];
  monthly: MonthlySummaryEntry[];
  dow: DOWSummaryEntry[];
  provinceGrowthData?: any;
  isDarkMode: boolean;
  globalMetric?: 'pnp' | 'arm';
  globalDirection?: 'brg' | 'dat' | 'tot';
}

export const TimelineWorkspace: React.FC<TimelineWorkspaceProps> = ({
  timeline,
  monthly,
  dow,
  provinceGrowthData = {},
  isDarkMode,
  globalMetric = 'pnp',
  globalDirection = 'brg',
}) => {
  // Direct use of active Filter (Single source of truth, zero state delay)
  const selectedMetric = globalMetric;
  const selectedDirection = globalDirection;

  const [chartViewMode, setChartViewMode] = useState<'modes' | 'total'>('modes');
  const [timeRange, setTimeRange] = useState<'all' | 't1' | 't2' | 't3' | 'lebaran' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('2026-03-01');
  const [customEnd, setCustomEnd] = useState('2026-03-31');

  // Province Trend State
  const [selectedProv, setSelectedProv] = useState<string>('Jawa Timur');
  const [selectedProvModa, setSelectedProvModa] = useState<string>('ALL');

  const provincesList = useMemo(() => {
    const comboKey = `${selectedMetric}_${selectedDirection}`;
    const activePmd = provinceGrowthData?.[comboKey] || provinceGrowthData;
    const list = Object.keys(activePmd?.by_province || {}).sort();
    return list.length > 0 ? list : ['Jawa Timur', 'Jawa Barat', 'Jawa Tengah', 'DKI Jakarta', 'Banten', 'Sumatera Utara', 'Bali'];
  }, [provinceGrowthData, selectedMetric, selectedDirection]);

  // Current Province Data (Dynamic to active Filter: Penumpang/Armada x Berangkat/Datang/Total)
  const currentProvData = useMemo(() => {
    const comboKey = `${selectedMetric}_${selectedDirection}`;
    const activePmd = provinceGrowthData?.[comboKey] || provinceGrowthData;
    return (activePmd?.by_province || {})[selectedProv] || null;
  }, [provinceGrowthData, selectedProv, selectedMetric, selectedDirection]);

  // Filtered timeline data
  const filteredTimeline = useMemo(() => {
    let list = timeline;
    if (timeRange === 't1') {
      list = timeline.filter((d) => d.date >= '2026-01-01' && d.date <= '2026-04-30');
    } else if (timeRange === 't2') {
      list = timeline.filter((d) => d.date >= '2026-05-01' && d.date <= '2026-08-31');
    } else if (timeRange === 't3') {
      list = timeline.filter((d) => d.date >= '2026-09-01' && d.date <= '2026-10-31');
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
      // 5 MODA ONLY (scaled to 0 - 700k without total squashing)
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
      // Total Multimoda (National macro peak 0 - 2.5M)
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

  // EChart Options for Province Monthly Trend (V1 1:1 Parity)
  const provGrowthChartOption = useMemo(() => {
    const monthlyArr = currentProvData?.monthly || [];
    const labels = monthlyArr.map((m: any) => m.short || m.name);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];

    let series: any[] = [];
    if (selectedProvModa === 'ALL') {
      series = modes.map((m) => ({
        name: MODA_DISPLAY_NAME[m],
        type: 'bar',
        stack: 'provStack',
        data: monthlyArr.map((item: any) => (item.modas && item.modas[m]) || 0),
        itemStyle: { color: COLOR[m] },
      }));
    } else {
      series = [
        {
          name: MODA_DISPLAY_NAME[selectedProvModa] || selectedProvModa,
          type: 'bar',
          data: monthlyArr.map((item: any) => (item.modas && item.modas[selectedProvModa]) || item.val || 0),
          itemStyle: { color: (COLOR as any)[selectedProvModa] || '#1e3a8a' },
        },
      ];
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) => `${formatNumber(value)} orang`,
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 10 },
        itemGap: 8,
      },
      grid: {
        top: 20,
        left: '2%',
        right: '2%',
        bottom: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: textColor, fontSize: 10, rotate: 20 },
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
  }, [currentProvData, selectedProvModa, isDarkMode]);

  return (
    <div className="space-y-6">
      {/* TOOLBAR CONTROLS (Clean, no duplicate Filter buttons) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode: 5 Moda vs Total Multimoda */}
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setChartViewMode('modes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                chartViewMode === 'modes'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📊 5 Moda (Detail)
            </button>
            <button
              onClick={() => setChartViewMode('total')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                chartViewMode === 'total'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📈 Total Multimoda
            </button>
          </div>

          {/* Preset Rentang Tanggal */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">Rentang:</span>
            {[
              { id: 'all', label: 'All (304H)' },
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
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Sumber: SIASATI PUSDATIN
          </div>
        </div>

        <EChartWrapper options={timelineChartOption} style={{ height: '400px', width: '100%' }} />
      </div>

      {/* 2. TREN & PERTUMBUHAN PROVINSI WORKSPACE (V1 1:1 Parity) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Tren & Lonjakan Bulanan per Wilayah Provinsi (10 Bulan)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi mobilitas bulanan per provinsi dengan perbandingan lonjakan terhadap baseline normal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedProv}
              onChange={(e) => setSelectedProv(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              {provincesList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={selectedProvModa}
              onChange={(e) => setSelectedProvModa(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Moda (Stacked)</option>
              <option value="UDARA">✈ Udara</option>
              <option value="KA">🚆 Kereta Api</option>
              <option value="BUS">🚌 Bus</option>
              <option value="ASDP">⛴ ASDP</option>
              <option value="LAUT">🚢 Laut</option>
            </select>
          </div>
        </div>

        {/* PROVINCE SUMMARY BADGES */}
        {currentProvData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
              <span className="text-slate-400 font-sans text-[11px]">Total YTD Provinsi:</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {formatNumber(currentProvData.total || currentProvData.total_brg || 0)} {selectedMetric === 'pnp' ? 'orang' : 'trip'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
              <span className="text-slate-400 font-sans text-[11px]">Bulan Puncak:</span>
              <div className="font-bold text-rose-700 dark:text-rose-400 text-sm mt-0.5">
                {currentProvData.peak_month} • {formatNumber(currentProvData.peak_vol)} {selectedMetric === 'pnp' ? 'orang' : 'trip'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
              <span className="text-slate-400 font-sans text-[11px]">Lonjakan vs Median:</span>
              <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                {formatPercent(currentProvData.max_jump_vs_median_pct || currentProvData.max_jump_pct || 0)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
              <span className="text-slate-400 font-sans text-[11px]">Baseline Median Pra-Lebaran:</span>
              <div className="font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5">
                {formatNumber(currentProvData.median_vol || currentProvData.baseline_vol || 0)} /bln
              </div>
            </div>
          </div>
        )}

        <EChartWrapper options={provGrowthChartOption} style={{ height: '320px', width: '100%' }} />
      </div>

      {/* 3. TABEL RINGKASAN AKUMULASI BULANAN PER MODA (Jan – Okt 2026 • 1:1 Paritas V1) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Akumulasi Bulanan per Moda Transportasi
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Volume pergerakan dari Januari sampai dengan Oktober 2026 ({selectedMetric === 'pnp' ? 'Penumpang' : 'Armada'} •{' '}
              {selectedDirection === 'brg' ? 'Keberangkatan' : selectedDirection === 'dat' ? 'Kedatangan' : 'Total Dua Arah'})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
              10 Bulan (Jan - Okt)
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 sm:hidden">
              <span>Geser ke samping</span>
              <span>→</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/60">
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right text-blue-900 dark:text-blue-300 font-bold">✈ Udara</th>
                <th className="py-2.5 px-3 text-right text-amber-700 dark:text-amber-400 font-bold">🚆 Perkeretaapian</th>
                <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">🚌 Jalan</th>
                <th className="py-2.5 px-3 text-right text-purple-700 dark:text-purple-400 font-bold">⛴ Penyebrangan</th>
                <th className="py-2.5 px-3 text-right text-cyan-700 dark:text-cyan-400 font-bold">🚢 Laut</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {monthly.map((m: any) => (
                <tr key={m.bulan || m.label} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    {m.label || m.bulan}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(getMetricValue(m, 'UDARA', selectedMetric, selectedDirection))}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(getMetricValue(m, 'KA', selectedMetric, selectedDirection))}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(getMetricValue(m, 'BUS', selectedMetric, selectedDirection))}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(getMetricValue(m, 'ASDP', selectedMetric, selectedDirection))}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatNumber(getMetricValue(m, 'LAUT', selectedMetric, selectedDirection))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50">
                    {formatNumber(getMetricValue(m, 'TOTAL', selectedMetric, selectedDirection))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
