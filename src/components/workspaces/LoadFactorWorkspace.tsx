'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { COLOR, MODA_DISPLAY_NAME, formatDecimal, formatPercent } from '@/lib/constants';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LoadFactorWorkspaceProps {
  loadFactorStats: Record<string, any>;
  isDarkMode: boolean;
}

export const LoadFactorWorkspace: React.FC<LoadFactorWorkspaceProps> = ({
  loadFactorStats,
  isDarkMode,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  const provinces = useMemo(() => {
    const list = Object.keys(loadFactorStats.by_province || {}).sort();
    return ['ALL', ...list];
  }, [loadFactorStats]);

  // Current dataset to show based on province
  const currentStats = useMemo(() => {
    if (selectedProvince === 'ALL') {
      return {
        UDARA: loadFactorStats.UDARA || {},
        KA: loadFactorStats.KA || {},
        BUS: loadFactorStats.BUS || {},
        ASDP: loadFactorStats.ASDP || {},
        LAUT: loadFactorStats.LAUT || {},
      };
    }
    return (loadFactorStats.by_province || {})[selectedProvince] || {};
  }, [selectedProvince, loadFactorStats]);

  // EChart Options
  const chartOption = useMemo(() => {
    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const baselineData = modes.map((m) => currentStats[m]?.baseline_lf || 0);
    const mudikData = modes.map((m) => currentStats[m]?.mudik_lf || 0);
    const balikData = modes.map((m) => currentStats[m]?.balik_lf || 0);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) => `${formatDecimal(value)} pnp/armada`,
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
        bottom: 35,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: modes.map((m) => MODA_DISPLAY_NAME[m]),
        axisLabel: { color: textColor, fontSize: 11 },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: { color: textColor, fontSize: 10, formatter: '{value} pnp/arm' },
      },
      series: [
        {
          name: 'Baseline Normal (Februari)',
          type: 'bar',
          data: baselineData,
          itemStyle: { color: '#94a3b8' },
        },
        {
          name: 'Arus Mudik Lebaran',
          type: 'bar',
          data: mudikData,
          itemStyle: { color: '#f59e0b' },
        },
        {
          name: 'Arus Balik Lebaran (Puncak)',
          type: 'bar',
          data: balikData,
          itemStyle: { color: '#e11d48' },
        },
      ],
    };
  }, [currentStats, isDarkMode]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Kinerja Load Factor (Rasio Beban Penumpang per Trip Armada)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mengukur tingkat utilisasi dan kepadatan fisik sarana angkutan umum di hari normal vs periode puncak.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Wilayah:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? '🇮🇩 Nasional (Seluruh Provinsi)' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 MODA METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => {
            const stat = currentStats[m] || {};
            const isHighSurge = (stat.surge_lf_pct || 0) > 80;
            return (
              <div
                key={m}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>{MODA_DISPLAY_NAME[m]}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLOR[m] }}
                  />
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatDecimal(stat.peak_lf || stat.baseline_lf || 0)} <span className="text-[10px] font-normal text-slate-400">pnp/trip</span>
                </div>
                <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                  <span className="text-slate-400">Base: {formatDecimal(stat.baseline_lf || 0)}</span>
                  <span
                    className={`font-bold ${
                      isHighSurge ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatPercent(stat.surge_lf_pct || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHART ROW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Perbandingan Rasio Beban (Penumpang/Armada): Normal vs Mudik vs Balik ({selectedProvince === 'ALL' ? 'Nasional' : selectedProvince})
          </h4>
          <span className="text-[11px] font-mono text-slate-400">P/A Ratio</span>
        </div>
        <EChartWrapper options={chartOption} style={{ height: '360px', width: '100%' }} />
      </div>

      {/* TABEL STATISTIK & DETEKSI ANOMALI LOAD FACTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
          Tabel Komparasi Angka Beban Riil 5 Moda Transportasi
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 font-semibold">Moda Transportasi</th>
                <th className="py-2.5 font-semibold">Jenis Sarana Representatif</th>
                <th className="py-2.5 text-right font-semibold">Beban Hari Normal (Feb)</th>
                <th className="py-2.5 text-right font-semibold">Beban Arus Mudik (H-3)</th>
                <th className="py-2.5 text-right font-semibold">Beban Arus Balik (H+3)</th>
                <th className="py-2.5 text-right font-semibold">Lonjakan Beban Puncak %</th>
                <th className="py-2.5 font-semibold">Status Kepadatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {[
                {
                  moda: 'UDARA',
                  sarana: 'Pesawat Jet Narrow-Body (B737/A320)',
                  stat: currentStats.UDARA || {},
                },
                {
                  moda: 'KA',
                  sarana: 'Rangkaian Kereta Api Penumpang',
                  stat: currentStats.KA || {},
                },
                {
                  moda: 'BUS',
                  sarana: 'Bus AKAP & AKDP Antarkota',
                  stat: currentStats.BUS || {},
                },
                {
                  moda: 'ASDP',
                  sarana: 'Kapal Feri Ro-Ro Penyeberangan',
                  stat: currentStats.ASDP || {},
                },
                {
                  moda: 'LAUT',
                  sarana: 'Kapal Pelni & Perintis Laut',
                  stat: currentStats.LAUT || {},
                },
              ].map((row) => {
                const surge = row.stat.surge_lf_pct || 0;
                const status =
                  surge > 100
                    ? { text: 'Sangat Kritis', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' }
                    : surge > 50
                    ? { text: 'Padat Tinggi', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
                    : surge > 20
                    ? { text: 'Sibuk Terkendali', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' }
                    : { text: 'Stabil Normal', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };

                return (
                  <tr key={row.moda} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {MODA_DISPLAY_NAME[row.moda]}
                    </td>
                    <td className="py-2.5 font-sans text-slate-500">{row.sarana}</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatDecimal(row.stat.baseline_lf || 0)} pnp/arm
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatDecimal(row.stat.mudik_lf || 0)} pnp/arm
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatDecimal(row.stat.balik_lf || 0)} pnp/arm
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-rose-700 dark:text-rose-400">
                        {formatPercent(surge)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-sans font-semibold text-[10px] ${status.color}`}>
                        {status.text}
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
