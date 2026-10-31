'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal, formatPercent } from '@/lib/constants';
import { Activity } from 'lucide-react';
import { MonthlySummaryEntry, LebaranDailyEntry } from '@/types/mobility';

interface LoadFactorWorkspaceProps {
  loadFactorStats: Record<string, any>;
  monthlySummary?: MonthlySummaryEntry[];
  lebaranDaily?: LebaranDailyEntry[];
  isDarkMode: boolean;
  globalMetric?: 'pnp' | 'arm';
  globalDirection?: 'brg' | 'dat' | 'tot';
}

export const LoadFactorWorkspace: React.FC<LoadFactorWorkspaceProps> = ({
  loadFactorStats,
  monthlySummary = [],
  lebaranDaily = [],
  isDarkMode,
  globalMetric = 'pnp',
  globalDirection = 'brg',
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  const provinces = useMemo(() => {
    const list = Object.keys(loadFactorStats.by_province || {}).sort();
    return ['ALL', ...list];
  }, [loadFactorStats]);

  const isPnp = globalMetric === 'pnp';
  const dirLabel =
    globalDirection === 'brg' ? 'Keberangkatan' : globalDirection === 'dat' ? 'Kedatangan' : 'Total (Dua Arah)';

  // Calculate dynamic statistics based on active Filter
  const computedStats = useMemo(() => {
    const feb = monthlySummary?.[1] as any; // Februari 2026 (28 hari)
    const mudik = (lebaranDaily.find((d) => d.date === '2026-03-18') || lebaranDaily[0]) as any;
    const balik = (lebaranDaily.find((d) => d.date === '2026-03-24') || lebaranDaily[0]) as any;

    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    const res: Record<string, any> = {};

    const provLfs = selectedProvince === 'ALL' ? null : (loadFactorStats.by_province || {})[selectedProvince];

    modes.forEach((m) => {
      if (isPnp) {
        // LOAD FACTOR: PENUMPANG PER TRIP ARMADA
        let baseLF = 0;
        let mudikLF = 0;
        let balikLF = 0;

        if (feb && mudik && balik) {
          if (globalDirection === 'brg') {
            const pBase = Number(feb[`pbrg_${m}`]) || 0;
            const aBase = Number(feb[`abrg_${m}`]) || 1;
            baseLF = pBase / aBase;

            const pMudik = Number(mudik[`pbrg_${m}`]) || 0;
            const aMudik = Number(mudik[`abrg_${m}`]) || 1;
            mudikLF = pMudik / aMudik;

            const pBalik = Number(balik[`pbrg_${m}`]) || 0;
            const aBalik = Number(balik[`abrg_${m}`]) || 1;
            balikLF = pBalik / aBalik;
          } else if (globalDirection === 'dat') {
            const pBase = Number(feb[`pdat_${m}`]) || 0;
            const aBase = Number(feb[`adat_${m}`]) || 1;
            baseLF = aBase > 0 ? pBase / aBase : 0;

            const pMudik = Number(mudik[`pdat_${m}`]) || 0;
            const aMudik = Number(mudik[`adat_${m}`]) || 1;
            mudikLF = aMudik > 0 ? pMudik / aMudik : 0;

            const pBalik = Number(balik[`pdat_${m}`]) || 0;
            const aBalik = Number(balik[`adat_${m}`]) || 1;
            balikLF = aBalik > 0 ? pBalik / aBalik : 0;
          } else {
            const pBase = Number(feb[m]) || 0;
            const aBase = Number(feb[`arm_${m}`]) || 1;
            baseLF = pBase / aBase;

            const pMudik = Number(mudik[m]) || 0;
            const aMudik = Number(mudik[`arm_${m}`]) || 1;
            mudikLF = pMudik / aMudik;

            const pBalik = Number(balik[m]) || 0;
            const aBalik = Number(balik[`arm_${m}`]) || 1;
            balikLF = pBalik / aBalik;
          }
        } else {
          baseLF = loadFactorStats[m]?.baseline_lf || 0;
          mudikLF = loadFactorStats[m]?.mudik_lf || 0;
          balikLF = loadFactorStats[m]?.balik_lf || 0;
        }

        // Apply regional province adjustment if a province is selected
        if (provLfs && provLfs[m] && provLfs[m].baseline_lf > 0) {
          const ratio = provLfs[m].baseline_lf / (loadFactorStats[m]?.baseline_lf || 1);
          baseLF = baseLF * ratio;
          mudikLF = mudikLF * ratio;
          balikLF = balikLF * ratio;
        }

        const peakLF = Math.max(mudikLF, balikLF);
        const surge = baseLF > 0 ? ((peakLF - baseLF) / baseLF) * 100 : 0;

        res[m] = {
          baseline: baseLF,
          mudik: mudikLF,
          balik: balikLF,
          peak: peakLF,
          surge,
        };
      } else {
        // ARMADA VOLUME: TRIP PER HARI
        let baseArm = 0;
        let mudikArm = 0;
        let balikArm = 0;

        if (feb && mudik && balik) {
          if (globalDirection === 'brg') {
            baseArm = Math.round((Number(feb[`abrg_${m}`]) || 0) / 28);
            mudikArm = Number(mudik[`abrg_${m}`]) || 0;
            balikArm = Number(balik[`abrg_${m}`]) || 0;
          } else if (globalDirection === 'dat') {
            baseArm = Math.round((Number(feb[`adat_${m}`]) || 0) / 28);
            mudikArm = Number(mudik[`adat_${m}`]) || 0;
            balikArm = Number(balik[`adat_${m}`]) || 0;
          } else {
            baseArm = Math.round((Number(feb[`arm_${m}`]) || 0) / 28);
            mudikArm = Number(mudik[`arm_${m}`]) || 0;
            balikArm = Number(balik[`arm_${m}`]) || 0;
          }
        }

        // Apply regional province adjustment
        if (provLfs && provLfs[m] && provLfs[m].baseline_lf > 0) {
          const ratio = provLfs[m].baseline_lf / (loadFactorStats[m]?.baseline_lf || 1);
          baseArm = Math.round(baseArm * Math.min(1.5, Math.max(0.1, ratio)));
          mudikArm = Math.round(mudikArm * Math.min(1.5, Math.max(0.1, ratio)));
          balikArm = Math.round(balikArm * Math.min(1.5, Math.max(0.1, ratio)));
        }

        const peakArm = Math.max(mudikArm, balikArm);
        const surge = baseArm > 0 ? ((peakArm - baseArm) / baseArm) * 100 : 0;

        res[m] = {
          baseline: baseArm,
          mudik: mudikArm,
          balik: balikArm,
          peak: peakArm,
          surge,
        };
      }
    });

    return res;
  }, [monthlySummary, lebaranDaily, loadFactorStats, selectedProvince, isPnp, globalDirection]);

  // EChart Options
  const chartOption = useMemo(() => {
    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const baselineData = modes.map((m) =>
      isPnp ? Number((computedStats[m]?.baseline || 0).toFixed(1)) : Math.round(computedStats[m]?.baseline || 0)
    );
    const mudikData = modes.map((m) =>
      isPnp ? Number((computedStats[m]?.mudik || 0).toFixed(1)) : Math.round(computedStats[m]?.mudik || 0)
    );
    const balikData = modes.map((m) =>
      isPnp ? Number((computedStats[m]?.balik || 0).toFixed(1)) : Math.round(computedStats[m]?.balik || 0)
    );

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        valueFormatter: (value: any) =>
          isPnp ? `${formatDecimal(value)} pnp/armada` : `${formatNumber(value)} trip/hari`,
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 10 },
        itemGap: 10,
      },
      grid: {
        top: 24,
        left: '2%',
        right: '2%',
        bottom: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: modes.map((m) => MODA_DISPLAY_NAME[m]),
        axisLabel: { color: textColor, fontSize: 10, interval: 0, rotate: 15 },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => (isPnp ? `${v} pnp/arm` : v >= 1000 ? `${Math.round(v / 1000)}k trip` : `${v}`),
        },
      },
      series: [
        {
          name: 'Baseline Normal (Februari)',
          type: 'bar',
          data: baselineData,
          itemStyle: { color: '#94a3b8' },
        },
        {
          name: 'Arus Mudik Lebaran (H-3)',
          type: 'bar',
          data: mudikData,
          itemStyle: { color: '#f59e0b' },
        },
        {
          name: 'Arus Balik Lebaran (Puncak H+3)',
          type: 'bar',
          data: balikData,
          itemStyle: { color: '#e11d48' },
        },
      ],
    };
  }, [computedStats, isDarkMode, isPnp]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isPnp
                  ? `Kinerja Load Factor (Rasio Beban Penumpang per Trip Armada) • ${dirLabel}`
                  : `Kapasitas Operasional & Volume Armada (Trip per Hari) • ${dirLabel}`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isPnp
                ? `Tingkat kepadatan fisik penumpang per sarana (${dirLabel}) di hari normal vs periode puncak.`
                : `Total trip armada beroperasi (${dirLabel}) di hari normal vs periode puncak.`}
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
            const stat = computedStats[m] || {};
            const isHighSurge = (stat.surge || 0) > 60;
            return (
              <div
                key={m}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>{MODA_DISPLAY_NAME[m]}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR[m] }} />
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {isPnp ? (
                    <>
                      {formatDecimal(stat.peak || stat.baseline || 0)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">pnp/trip</span>
                    </>
                  ) : (
                    <>
                      {formatNumber(stat.peak || stat.baseline || 0)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">trip/hari</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] font-mono mt-1 flex items-center justify-between">
                  <span className="text-slate-400">
                    Base: {isPnp ? formatDecimal(stat.baseline || 0) : formatNumber(stat.baseline || 0)}
                  </span>
                  <span
                    className={`font-bold ${
                      isHighSurge ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    +{formatPercent(stat.surge || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHART ROW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            {isPnp
              ? `Perbandingan Rasio Beban (Penumpang/Armada): Normal vs Mudik vs Balik (${selectedProvince === 'ALL' ? 'Nasional' : selectedProvince})`
              : `Perbandingan Volume Operasi Armada (Trip/Hari): Normal vs Mudik vs Balik (${selectedProvince === 'ALL' ? 'Nasional' : selectedProvince})`}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {isPnp ? 'P/A Ratio' : 'Trip/Day'} • {dirLabel}
          </span>
        </div>
        <EChartWrapper options={chartOption} style={{ height: '360px', width: '100%' }} />
      </div>

      {/* TABEL STATISTIK & DETEKSI ANOMALI LOAD FACTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
          {isPnp ? 'Tabel Komparasi Angka Beban Riil 5 Moda Transportasi' : 'Tabel Komparasi Utilisasi Armada 5 Moda Transportasi'}
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
                <th className="py-2.5 text-right font-semibold">Lonjakan Puncak %</th>
                <th className="py-2.5 font-semibold">Status Utilisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {[
                {
                  moda: 'UDARA',
                  sarana: 'Pesawat Jet Narrow-Body (B737/A320)',
                  stat: computedStats.UDARA || {},
                },
                {
                  moda: 'KA',
                  sarana: 'Rangkaian Kereta Api Penumpang',
                  stat: computedStats.KA || {},
                },
                {
                  moda: 'BUS',
                  sarana: 'Bus AKAP & AKDP Antarkota',
                  stat: computedStats.BUS || {},
                },
                {
                  moda: 'ASDP',
                  sarana: 'Kapal Feri Ro-Ro Penyeberangan',
                  stat: computedStats.ASDP || {},
                },
                {
                  moda: 'LAUT',
                  sarana: 'Kapal Pelni & Perintis Laut',
                  stat: computedStats.LAUT || {},
                },
              ].map((row) => {
                const surge = row.stat.surge || 0;
                const status =
                  surge > 80
                    ? { text: 'Sangat Kritis', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' }
                    : surge > 40
                    ? { text: 'Padat Tinggi', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
                    : surge > 15
                    ? { text: 'Sibuk Terkendali', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' }
                    : { text: 'Stabil Normal', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };

                return (
                  <tr key={row.moda} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {MODA_DISPLAY_NAME[row.moda]}
                    </td>
                    <td className="py-2.5 font-sans text-slate-500">{row.sarana}</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {isPnp ? `${formatDecimal(row.stat.baseline || 0)} pnp/arm` : `${formatNumber(row.stat.baseline || 0)} trip`}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {isPnp ? `${formatDecimal(row.stat.mudik || 0)} pnp/arm` : `${formatNumber(row.stat.mudik || 0)} trip`}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {isPnp ? `${formatDecimal(row.stat.balik || 0)} pnp/arm` : `${formatNumber(row.stat.balik || 0)} trip`}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-rose-700 dark:text-rose-400">
                        +{formatPercent(surge)}
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
