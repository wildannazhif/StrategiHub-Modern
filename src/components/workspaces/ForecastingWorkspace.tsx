'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { ForecastNataruData } from '@/types/mobility';
import { formatNumber, formatDecimal } from '@/lib/constants';
import { TrendingUp, HelpCircle, X } from 'lucide-react';

interface ForecastingWorkspaceProps {
  forecastData: any;
  benchmarkResults?: Record<string, any>;
  timeline2025?: any[];
  isDarkMode: boolean;
}

export const ForecastingWorkspace: React.FC<ForecastingWorkspaceProps> = ({
  forecastData,
  benchmarkResults = {},
  isDarkMode,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'moderat' | 'optimis' | 'konservatif'>('moderat');
  const [tableFilter, setTableFilter] = useState<'all' | 'q4' | 'nataru'>('nataru');
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);

  // Daily points are located in forecastData.scenarios[selectedScenario]
  const scenarios = forecastData.scenarios || {};
  const currentScenarioPoints: any[] = useMemo(() => {
    return scenarios[selectedScenario] || scenarios.moderat || [];
  }, [scenarios, selectedScenario]);

  const summary = (forecastData.summaries || {})[selectedScenario] || {};

  const metrics = forecastData.metrics?.TOTAL || {
    model_name: 'Holt-Winters Mul Damped (phi=0.98)',
    mape: 4.1,
    rmse: 62051,
    mae: 49146,
    wape: 4.02,
    dir_acc: 89.3,
  };

  // Filtered daily points for table
  const filteredDailyPoints = useMemo(() => {
    if (tableFilter === 'q4') {
      return currentScenarioPoints.filter((p) => p.date <= '2026-12-31');
    } else if (tableFilter === 'nataru') {
      return currentScenarioPoints.filter((p) => p.date >= '2026-12-18' && p.date <= '2027-01-04');
    }
    return currentScenarioPoints;
  }, [currentScenarioPoints, tableFilter]);

  // EChart Options
  const forecastChartOption = useMemo(() => {
    const dates = currentScenarioPoints.map((p) => p.date);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const moderatPoints = scenarios.moderat || [];
    const optimisPoints = scenarios.optimis || [];
    const konservatifPoints = scenarios.konservatif || [];

    const moderatVals = moderatPoints.map((p: any) => p.TOTAL);
    const optimisVals = optimisPoints.map((p: any) => p.TOTAL);
    const konservatifVals = konservatifPoints.map((p: any) => p.TOTAL);

    const ciUpper = currentScenarioPoints.map((p) => p.ci_upper);
    const ciLower = currentScenarioPoints.map((p) => p.ci_lower);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) => `${formatNumber(value)} orang`,
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
        axisLabel: { color: textColor, fontSize: 10, rotate: 35 },
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
      series: [
        {
          name: 'Proyeksi Moderat (Baseline)',
          type: 'line',
          smooth: 0.2,
          data: moderatVals,
          lineStyle: { width: 3, color: '#0284c7' },
          itemStyle: { color: '#0284c7' },
        },
        {
          name: 'Proyeksi Optimis (+12% Animo)',
          type: 'line',
          smooth: 0.2,
          data: optimisVals,
          lineStyle: { width: 2, color: '#16a34a', type: 'dashed' },
          itemStyle: { color: '#16a34a' },
        },
        {
          name: 'Proyeksi Konservatif (Cuaca Ekstrem)',
          type: 'line',
          smooth: 0.2,
          data: konservatifVals,
          lineStyle: { width: 2, color: '#dc2626', type: 'dashed' },
          itemStyle: { color: '#dc2626' },
        },
        {
          name: 'Batas Atas (95% CI)',
          type: 'line',
          data: ciUpper,
          lineStyle: { opacity: 0 },
          stack: 'confidence-band',
          symbol: 'none',
        },
        {
          name: 'Batas Bawah (95% CI)',
          type: 'line',
          data: ciLower,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(2, 132, 199, 0.12)' },
          stack: 'confidence-band',
          symbol: 'none',
        },
      ],
    };
  }, [currentScenarioPoints, scenarios, isDarkMode]);

  return (
    <div className="space-y-6">
      {/* HEADER & SCENARIO TOGGLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Proyeksi Mobilitas Multimoda Q4 & Libur Nataru 2026/2027 (Horizon 100 Hari)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Model Terpilih: <strong>Holt-Winters Multiplicative Damped Trend ($\phi=0,98$) + Weekly Seasonality ($s=7$) + Nataru Calendar Shock</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBenchmarkModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Benchmark 11 Model</span>
            </button>
          </div>
        </div>

        {/* 3 SCENARIO BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Skenario:</span>
            {[
              { id: 'moderat', label: 'Moderat (Baseline 1.00x)', color: 'text-sky-700 border-sky-300 bg-sky-50 dark:bg-sky-950 dark:text-sky-300' },
              { id: 'optimis', label: 'Optimis (+12% Animo 1.07x)', color: 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300' },
              { id: 'konservatif', label: 'Konservatif (Cuaca 0.95x)', color: 'text-rose-700 border-rose-300 bg-rose-50 dark:bg-rose-950 dark:text-rose-300' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all border ${
                  selectedScenario === sc.id
                    ? sc.color + ' shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
            Puncak Natal 2026: <strong>{summary.xmas_peak_date || '24 Des 2026'}</strong> ({formatNumber(summary.xmas_peak_val || 1922912)} pnp)
          </div>
        </div>
      </div>

      {/* METRIC ACCURACY BADGES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">MAPE (Mean Abs Pct Error)</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatDecimal(metrics.mape)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sangat Akurat (&lt; 10%)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">WAPE (Weighted APE)</div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatDecimal(metrics.wape)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Toleransi Volume Nasional</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">RMSE (Root Mean Sq Err)</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(metrics.rmse)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Std Deviasi Residual</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">MAE (Mean Absolute Error)</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(metrics.mae)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Deviasi Rata-rata Riil</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">Directional Accuracy</div>
          <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatDecimal(metrics.dir_acc)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ketepatan Arah Tren</div>
        </div>
      </div>

      {/* FORECAST CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Kurva Proyeksi 100 Hari Time Series (30 Sep 2026 s/d 7 Jan 2027)
          </h4>
          <span className="text-[11px] font-mono text-slate-400">Confidence Band 95% CI</span>
        </div>
        <EChartWrapper options={forecastChartOption} style={{ height: '420px', width: '100%' }} />
      </div>

      {/* FORECAST DAILY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Angka Proyeksi Harian ({filteredDailyPoints.length} Hari)
            </h4>
            <p className="text-xs text-slate-500">Nilai proyeksi moderat, optimis, dan konservatif per tanggal.</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">Filter:</span>
            {[
              { id: 'nataru', label: 'Fokus Nataru (18H)' },
              { id: 'q4', label: 'Q4 2026' },
              { id: 'all', label: 'Semua 100 Hari' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTableFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  tableFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 font-semibold">Tanggal</th>
                <th className="py-2.5 font-semibold">Hari</th>
                <th className="py-2.5 text-right font-semibold text-sky-700 dark:text-sky-300">Total Proyeksi</th>
                <th className="py-2.5 text-right font-semibold">Udara</th>
                <th className="py-2.5 text-right font-semibold">KA</th>
                <th className="py-2.5 text-right font-semibold">Bus</th>
                <th className="py-2.5 text-right font-semibold">ASDP</th>
                <th className="py-2.5 text-right font-semibold">Laut</th>
                <th className="py-2.5 text-right font-semibold">Batas 95% CI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredDailyPoints.map((pt) => {
                const isPeakNataru = pt.date === '2026-12-24';
                return (
                  <tr
                    key={pt.date}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isPeakNataru ? 'bg-amber-50/60 dark:bg-amber-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                      {pt.date} {isPeakNataru && <span className="ml-1 text-[10px] text-amber-600 font-bold">★ PEAK XMAS</span>}
                    </td>
                    <td className="py-2 font-sans text-slate-500">{pt.day_name}</td>
                    <td className="py-2 text-right font-semibold text-sky-800 dark:text-sky-300">{formatNumber(pt.TOTAL)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(pt.UDARA)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(pt.KA)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(pt.BUS)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(pt.ASDP)}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatNumber(pt.LAUT)}</td>
                    <td className="py-2 text-right text-slate-400">
                      {formatNumber(pt.ci_lower)} – {formatNumber(pt.ci_upper)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BENCHMARK MODAL */}
      {showBenchmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Benchmark 11 Model Peramalan Time Series Nasional
                </h3>
                <p className="text-xs text-slate-500">
                  Uji komparasi 11 algoritma statistik & machine learning (Data Uji 28 Hari Terakhir).
                </p>
              </div>
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 font-semibold">Model Time Series</th>
                    <th className="py-2 text-right font-semibold">MAPE (%)</th>
                    <th className="py-2 text-right font-semibold">WAPE (%)</th>
                    <th className="py-2 text-right font-semibold">RMSE</th>
                    <th className="py-2 text-right font-semibold">MAE</th>
                    <th className="py-2 text-right font-semibold">Direction Acc (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {Object.entries(benchmarkResults).map(([modelName, res]: [string, any], idx) => {
                    const isSelected = idx === 0;
                    return (
                      <tr
                        key={modelName}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          isSelected ? 'bg-sky-50 dark:bg-sky-950/50 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                          {modelName} {isSelected && <span className="ml-1 text-[10px] text-sky-600 uppercase font-bold">(Model Terpilih)</span>}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-emerald-600">{res['MAPE (%)']}%</td>
                        <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{res['WAPE (%)']}%</td>
                        <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{formatNumber(res['RMSE'])}</td>
                        <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{formatNumber(res['MAE'])}</td>
                        <td className="py-2.5 text-right font-semibold text-sky-700 dark:text-sky-300">{res['Direction Acc (%)']}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
