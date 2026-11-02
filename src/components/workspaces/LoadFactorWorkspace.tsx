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

    const provRaw = selectedProvince === 'ALL' ? null : (loadFactorStats.by_province || {})[selectedProvince];
    const provLfs = provRaw ? (provRaw[globalDirection] || provRaw['brg'] || provRaw) : null;

    modes.forEach((m) => {
      // If a specific province is selected, use its exact verified operational numbers
      if (provLfs) {
        const mData = provLfs[m];
        if (!mData || !mData.is_operating) {
          res[m] = {
            isOperating: false,
            baseline: 0,
            mudik: 0,
            balik: 0,
            peak: 0,
            surge: 0,
            surgeMudik: 0,
            surgeBalik: 0,
          };
          return;
        }

        if (isPnp) {
          res[m] = {
            isOperating: true,
            baseline: mData.baseline_lf,
            mudik: mData.mudik_lf,
            balik: mData.balik_lf,
            peak: mData.peak_lf,
            surge: mData.surge_lf_pct,
            surgeMudik: mData.surge_lf_pct,
            surgeBalik: mData.surge_lf_pct,
          };
        } else {
          res[m] = {
            isOperating: true,
            baseline: mData.baseline_arm,
            mudik: mData.mudik_arm,
            balik: mData.balik_arm,
            peak: mData.peak_arm,
            surge: mData.surge_arm_pct,
            surgeMudik: mData.surge_arm_pct,
            surgeBalik: mData.surge_arm_pct,
          };
        }
        return;
      }

      // Default: Nasional (Seluruh Provinsi)
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

        const peakLF = Math.max(mudikLF, balikLF);
        const surge = baseLF > 0 ? ((peakLF - baseLF) / baseLF) * 100 : 0;
        const surgeMudik = baseLF > 0 ? ((mudikLF - baseLF) / baseLF) * 100 : 0;
        const surgeBalik = baseLF > 0 ? ((balikLF - baseLF) / baseLF) * 100 : 0;

        res[m] = {
          isOperating: true,
          baseline: baseLF,
          mudik: mudikLF,
          balik: balikLF,
          peak: peakLF,
          surge,
          surgeMudik,
          surgeBalik,
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

        const peakArm = Math.max(mudikArm, balikArm);
        const surge = baseArm > 0 ? ((peakArm - baseArm) / baseArm) * 100 : 0;
        const surgeMudik = baseArm > 0 ? ((mudikArm - baseArm) / baseArm) * 100 : 0;
        const surgeBalik = baseArm > 0 ? ((balikArm - baseArm) / baseArm) * 100 : 0;

        res[m] = {
          isOperating: true,
          baseline: baseArm,
          mudik: mudikArm,
          balik: balikArm,
          peak: peakArm,
          surge,
          surgeMudik,
          surgeBalik,
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
                  {stat.isOperating === false ? (
                    <span className="text-xs font-normal text-slate-400 italic">Tidak Beroperasi</span>
                  ) : isPnp ? (
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
                    Base:{' '}
                    {stat.isOperating === false
                      ? '-'
                      : isPnp
                      ? formatDecimal(stat.baseline || 0)
                      : formatNumber(stat.baseline || 0)}
                  </span>
                  {stat.isOperating !== false && (
                    <span
                      className={`font-bold ${
                        isHighSurge ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatPercent(stat.surge || 0)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN ROW: CHART (LEFT) + TABEL EVALUASI UTILISASI ARMADA (RIGHT) (Exact V1 Parity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (lg:col-span-6): RASIO KEPADATAN PENUMPANG PER ARMADA (CHART) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
                  {isPnp ? 'Rasio Kepadatan Penumpang per Armada' : 'Kapasitas Operasional & Volume Armada'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPnp
                    ? 'Penumpang per trip armada pada kondisi Normal vs Puncak Arus Mudik vs Puncak Arus Balik'
                    : 'Trip armada per hari pada kondisi Normal vs Puncak Arus Mudik vs Puncak Arus Balik'}
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {isPnp ? 'Pnp / Armada' : 'Trip / Hari'}
              </span>
            </div>

            <div className="mt-2">
              <EChartWrapper options={chartOption} style={{ height: '320px', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-6): TABEL EVALUASI UTILISASI ARMADA (EXACT V1) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
                Tabel Evaluasi Utilisasi Armada
              </h4>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {selectedProvince === 'ALL' ? 'Nasional' : selectedProvince}
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left table-fixed">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 text-[10px]">
                  <tr>
                    <th className="py-2 px-1 w-[26%]">Moda</th>
                    <th className="py-2 px-1 text-right w-[16%]">Normal</th>
                    <th className="py-2 px-0.5 text-right text-purple-700 dark:text-purple-400 w-[12%]">Mudik</th>
                    <th className="py-2 px-0.5 text-right text-rose-700 dark:text-rose-400 w-[12%]">Balik</th>
                    <th className="py-2 px-1 text-right font-bold text-purple-700 dark:text-purple-400 w-[17%]">
                      <span className="block leading-tight">Lonjakan</span>
                      <span className="block leading-tight text-[9px] font-normal">Mudik %</span>
                    </th>
                    <th className="py-2 px-1 text-right font-bold text-rose-700 dark:text-rose-400 w-[17%]">
                      <span className="block leading-tight">Lonjakan</span>
                      <span className="block leading-tight text-[9px] font-normal">Balik %</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[10.5px] text-slate-800 dark:text-slate-200">
                  {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => {
                    const stat = computedStats[m] || { baseline: 0, mudik: 0, balik: 0, surgeMudik: 0, surgeBalik: 0 };
                    const hasData = (stat.baseline || 0) > 0;
                    return (
                      <tr key={m} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-1 font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {MODA_DISPLAY_NAME[m]}
                        </td>
                        <td className="py-2 px-1 text-right whitespace-nowrap">
                          {hasData ? `${Math.ceil(stat.baseline)} ${isPnp ? 'pnp/arm' : 'trip'}` : '-'}
                        </td>
                        <td className="py-2 px-0.5 text-right text-purple-700 dark:text-purple-400 font-semibold">
                          {hasData ? formatNumber(Math.ceil(stat.mudik)) : '-'}
                        </td>
                        <td className="py-2 px-0.5 text-right text-rose-700 dark:text-rose-400 font-semibold">
                          {hasData ? formatNumber(Math.ceil(stat.balik)) : '-'}
                        </td>
                        <td className="py-2 px-1 text-right font-semibold">
                          {hasData ? (
                            stat.surgeMudik > 0 ? (
                              <span className="text-purple-700 dark:text-purple-400 font-bold">
                                +{stat.surgeMudik.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-500">{stat.surgeMudik.toFixed(1)}%</span>
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-1 text-right font-semibold">
                          {hasData ? (
                            stat.surgeBalik > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">
                                +{stat.surgeBalik.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-500">{stat.surgeBalik.toFixed(1)}%</span>
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
            <span>* Normal dihitung dari median periode pra-Lebaran (1 Jan - 12 Mar 2026)</span>
            <span>Mudik: 18 Mar • Balik: 24 Mar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
