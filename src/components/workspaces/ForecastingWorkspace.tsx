'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal, formatPercent } from '@/lib/constants';
import { TrendingUp, Award, MapPin } from 'lucide-react';

interface ForecastingWorkspaceProps {
  forecastData: any;
  benchmarkResults?: Record<string, any>;
  timeline2025?: any[];
  timeline?: any[];
  isDarkMode: boolean;
}

const ALL_PROVINCES = [
  'Bali', 'Banten', 'Bengkulu', 'D.I Aceh', 'D.I Yogyakarta', 'DKI Jakarta',
  'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
  'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara',
  'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Papua Barat Daya',
  'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah', 'Riau',
  'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
  'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'
];

const NATARU_SHOCKS: Record<string, number> = {
  '12-18': 1.1196, '12-19': 1.3565, '12-20': 1.2709,
  '12-21': 1.5626, '12-22': 1.7465, '12-23': 1.6903,
  '12-24': 1.6839, '12-25': 1.4234, '12-26': 1.4458,
  '12-27': 1.3030, '12-28': 1.6995, '12-29': 1.6913,
  '12-30': 1.5773, '12-31': 1.3690, '01-01': 1.0902,
  '01-02': 1.2845, '01-03': 1.1538, '01-04': 1.3091
};

// V1 Pure Mathematical Time-Series Forecasting Engine (Holt-Winters Damped with 7-day Seasonality)
function computeTimeSeriesForecast(hist: number[], futureDates: string[]): number[] {
  const n = hist.length;
  if (!n || hist.every((v) => v === 0)) {
    return futureDates.map(() => 0);
  }

  const mean_s = hist.reduce((a, b) => a + b, 0) / n;
  const floor = Math.max(1, 0.2 * mean_s);
  const last7 = hist.slice(-7);
  const mean7 = last7.reduce((a, b) => a + b, 0) / 7;
  const n_fc = futureDates.length;

  const s_period = 7;
  const s_factors = Array(s_period).fill(1.0);
  for (let i = 0; i < s_period; i++) {
    let sum_r = 0;
    let cnt = 0;
    for (let k = i; k < n; k += s_period) {
      sum_r += hist[k];
      cnt++;
    }
    s_factors[i] = (sum_r / (cnt || 1)) / (mean7 || 1);
  }

  const phi = 0.98;
  let l_hw = hist[0] / (s_factors[0] || 1);
  let b_hw = 0;
  const a_hw = 0.25;
  const b_hw_param = 0.05;
  const g_hw = 0.1;

  for (let i = 0; i < n; i++) {
    const s_idx = i % s_period;
    const l_prev = l_hw;
    const s_prev = s_factors[s_idx] || 1.0;
    l_hw = a_hw * (hist[i] / s_prev) + (1 - a_hw) * (l_hw + phi * b_hw);
    b_hw = b_hw_param * (l_hw - l_prev) + (1 - b_hw_param) * (phi * b_hw);
    s_factors[s_idx] = g_hw * (hist[i] / l_hw) + (1 - g_hw) * s_prev;
  }

  return futureDates.map((dateStr, h) => {
    const step = h + 1;
    const s_idx = (n + h) % s_period;
    let trendComp = 0;
    for (let k = 0; k < step; k++) {
      trendComp += Math.pow(phi, k + 1) * b_hw;
    }
    const base = Math.max(floor, (l_hw + trendComp) * (s_factors[s_idx] || 1.0));
    const md = dateStr.slice(5);
    const shock = NATARU_SHOCKS[md] || 1.0;
    return Math.round(base * shock);
  });
}

export const ForecastingWorkspace: React.FC<ForecastingWorkspaceProps> = ({
  forecastData,
  timeline2025 = [],
  timeline = [],
  isDarkMode,
}) => {
  // State
  const [selectedProv, setSelectedProv] = useState<string>('ALL');
  const [selectedModa, setSelectedModa] = useState<string>('TOTAL');
  const [selectedMetric, setSelectedMetric] = useState<'pnp' | 'arm'>('pnp');
  const [horizonView, setHorizonView] = useState<'train_plus_forecast' | 'forecast_only'>('train_plus_forecast');
  const [tableRange, setTableRange] = useState<'nataru' | 'q4' | 'all'>('nataru');
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);

  const isAllProv = selectedProv === 'ALL';
  const provData = useMemo(() => {
    if (isAllProv) return null;
    return forecastData.by_province?.[selectedProv] || null;
  }, [forecastData, selectedProv, isAllProv]);

  // Active modes in province
  const activeModes = useMemo(() => {
    if (isAllProv) return ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    return provData?.history_2026?.active_modes || ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
  }, [isAllProv, provData]);

  const isOperating = selectedModa === 'TOTAL' || activeModes.includes(selectedModa);

  // Model Specs & Accuracy
  const championModel = useMemo(() => {
    if (isAllProv) {
      return forecastData.champion_model || {
        name: 'Holt-Winters Mul Damped (phi=0.98)',
        code: 'hw_mul_damped',
        mape: 4.10,
        rmse: 62051,
        mae: 49146,
        wape: 4.02,
        dir_acc: 89.3,
      };
    }
    return provData?.champion_model || forecastData.champion_model;
  }, [isAllProv, provData, forecastData]);

  const benchmarkList = useMemo(() => {
    if (isAllProv) return forecastData.benchmarks || [];
    return provData?.benchmarks || forecastData.benchmarks || [];
  }, [isAllProv, provData, forecastData]);

  // Future 100 Dates
  const futureDates = useMemo(() => {
    const pts = forecastData.scenarios?.moderat || [];
    return pts.map((p: any) => p.date);
  }, [forecastData]);

  // 1. Train Series (272 Days: 2026-01-01 to 2026-09-29)
  const { trainDates, trainValues } = useMemo(() => {
    if (isAllProv) {
      const histPoints = timeline.filter((d: any) => d.date <= '2026-09-29');
      const dates = histPoints.map((d: any) => d.date);
      const values = histPoints.map((d: any) => {
        if (selectedMetric === 'pnp') {
          return Number(d[selectedModa]) || 0;
        } else {
          return Number(d[`arm_${selectedModa}`]) || 0;
        }
      });
      return { trainDates: dates, trainValues: values };
    }

    const h = provData?.history_2026;
    if (!h) return { trainDates: [], trainValues: [] };

    const dates = h.dates || [];
    let values: number[] = [];
    if (selectedMetric === 'pnp') {
      values = (h[selectedModa] || []).map((v: any) => Number(v) || 0);
    } else {
      values = (h[`arm_${selectedModa}`] || []).map((v: any) => Number(v) || 0);
    }
    return { trainDates: dates, trainValues: values };
  }, [isAllProv, provData, timeline, selectedMetric, selectedModa]);

  // 2. Forecast Series (100 Days: 2026-09-30 to 2027-01-07)
  const futureValues = useMemo(() => {
    if (!isOperating) return futureDates.map(() => 0);

    // If national and total, use bundle benchmark numbers
    if (isAllProv && selectedModa === 'TOTAL') {
      const pts = forecastData.scenarios?.moderat || [];
      return pts.map((p: any) => (selectedMetric === 'pnp' ? Number(p.TOTAL) : Number(p.arm_TOTAL)) || 0);
    }

    // Run dynamic Holt-Winters Damped time-series engine with 7-day seasonality
    if (trainValues.length > 0 && !trainValues.every((v) => v === 0)) {
      return computeTimeSeriesForecast(trainValues, futureDates);
    }

    // Fallback to pre-indexed points
    const pts = (!isAllProv ? provData?.scenarios?.moderat : null) || forecastData.scenarios?.moderat || [];
    return pts.map((p: any) => {
      if (selectedMetric === 'pnp') {
        return Number(p[selectedModa]) || 0;
      } else {
        return Number(p[`arm_${selectedModa}`]) || 0;
      }
    });
  }, [isOperating, isAllProv, selectedModa, selectedMetric, forecastData, provData, trainValues, futureDates]);

  // 2025 Baseline Map
  const map2025 = useMemo(() => {
    const map: Record<string, number> = {};
    if (isAllProv) {
      timeline2025.forEach((r: any) => {
        const md = r.date.slice(5);
        map[md] = selectedMetric === 'pnp' ? (Number(r.pbrg_TOTAL) || 0) : (Number(r.abrg_TOTAL) || 0);
      });
    } else {
      const map25Md = provData?.history_2025_md || {};
      Object.entries(map25Md).forEach(([md, val]: [string, any]) => {
        const num = Number(val) || 0;
        map[md] = selectedMetric === 'pnp' ? Math.round(num * 0.58) : Math.round(num * 0.016);
      });
    }
    return map;
  }, [isAllProv, timeline2025, provData, selectedMetric]);

  // 4 Summary KPI Cards
  const kpis = useMemo(() => {
    let fc18Tot = 0;
    let base25Tot = 0;
    let xmasVal = 0;
    let nyVal = 0;
    let xmas25 = 0;
    let ny25 = 0;

    futureDates.forEach((d: string, idx: number) => {
      const val = futureValues[idx] || 0;
      const md = d.slice(5);
      const val25 = map2025[md] || 0;

      if (d >= '2026-12-18' && d <= '2027-01-04') {
        fc18Tot += val;
        base25Tot += val25;
      }
      if (d === '2026-12-24') {
        xmasVal = val;
        xmas25 = val25;
      }
      if (d === '2027-01-03') {
        nyVal = val;
        ny25 = val25;
      }
    });

    const avg18 = Math.round(fc18Tot / 18);
    const yoyTot = base25Tot > 0 ? ((fc18Tot / base25Tot - 1) * 100) : 0;
    const yoyXmas = xmas25 > 0 ? ((xmasVal / xmas25 - 1) * 100) : 0;
    const yoyNy = ny25 > 0 ? ((nyVal / ny25 - 1) * 100) : 0;

    // Peak Opposing Metric (Armada if pnp, Penumpang if arm)
    let oppPeakVal = 0;
    const pts = (!isAllProv ? provData?.scenarios?.moderat : null) || forecastData.scenarios?.moderat || [];
    pts.forEach((p: any) => {
      if (p.date >= '2026-12-18' && p.date <= '2027-01-04') {
        const val = selectedMetric === 'pnp' ? (Number(p.arm_TOTAL) || 0) : (Number(p.TOTAL) || 0);
        if (val > oppPeakVal) oppPeakVal = val;
      }
    });

    return {
      fc18Tot,
      avg18,
      yoyTot,
      xmasVal,
      xmas25,
      yoyXmas,
      nyVal,
      ny25,
      yoyNy,
      oppPeakVal,
    };
  }, [futureDates, futureValues, map2025, isAllProv, provData, forecastData, selectedMetric]);

  // ECharts Options (Zero CI bounds, clean continuous line)
  const chartOptions = useMemo(() => {
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const modaColor = (COLOR as any)[selectedModa] || (isDarkMode ? '#38bdf8' : '#0284c7');
    const forecastColor = '#6366f1'; // Indigo 500

    let xAxisData: string[] = [];
    let series: any[] = [];

    if (horizonView === 'train_plus_forecast') {
      xAxisData = [...trainDates, ...futureDates];
      const lastTrainVal = trainValues.length > 0 ? trainValues[trainValues.length - 1] : 0;

      // Train line (solid)
      const trainSeriesData = [...trainValues, ...futureDates.map(() => null)];

      // Forecast line (dashed, joined from last train date)
      const forecastSeriesData = [
        ...trainValues.slice(0, Math.max(0, trainValues.length - 1)).map(() => null),
        lastTrainVal,
        ...futureValues,
      ];

      series = [
        {
          name: `Realisasi Historis 2026 (${selectedMetric === 'pnp' ? 'Pnp' : 'Armada'})`,
          type: 'line',
          smooth: 0.15,
          showSymbol: false,
          data: trainSeriesData,
          lineStyle: { width: 2, color: modaColor },
          itemStyle: { color: modaColor },
        },
        {
          name: `Hasil Peramalan 2026/2027 (${selectedMetric === 'pnp' ? 'Pnp' : 'Armada'})`,
          type: 'line',
          smooth: 0.2,
          showSymbol: false,
          data: forecastSeriesData,
          lineStyle: { width: 2.5, color: forecastColor, type: 'dashed' },
          itemStyle: { color: forecastColor },
          markPoint: {
            symbol: 'pin',
            symbolSize: 40,
            itemStyle: { color: '#f59e0b' },
            label: { fontSize: 9, color: '#ffffff', fontWeight: 'bold' },
            data: [
              { name: 'Puncak Natal', coord: ['2026-12-24', kpis.xmasVal], value: 'Natal' },
              { name: 'Puncak Balik', coord: ['2027-01-03', kpis.nyVal], value: 'Balik' },
            ],
          },
        },
      ];
    } else {
      // Forecast Only (100 Days Zoom-in)
      xAxisData = futureDates;

      series = [
        {
          name: `Hasil Peramalan Nataru 2026/2027 (${selectedMetric === 'pnp' ? 'Pnp' : 'Armada'})`,
          type: 'line',
          smooth: 0.2,
          showSymbol: false,
          data: futureValues,
          lineStyle: { width: 3, color: forecastColor },
          itemStyle: { color: forecastColor },
          areaStyle: {
            color: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 42,
            itemStyle: { color: '#f59e0b' },
            label: { fontSize: 9, color: '#ffffff', fontWeight: 'bold' },
            data: [
              { name: 'Puncak Mudik Natal', coord: ['2026-12-24', kpis.xmasVal], value: 'Natal' },
              { name: 'Puncak Balik Tahun Baru', coord: ['2027-01-03', kpis.nyVal], value: 'Balik' },
            ],
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
        formatter: (params: any[]) => {
          if (!params || !params.length) return '';
          const dateStr = params[0].axisValue;
          const md = dateStr.slice(5);
          const shock = NATARU_SHOCKS[md];
          let shockTag = '';
          if (dateStr === '2026-12-24') shockTag = ' 🔥 Puncak Mudik Natal (H-1)';
          else if (dateStr === '2027-01-03') shockTag = ' 🚀 Puncak Balik Tahun Baru';
          else if (shock) shockTag = ` ⚡ Shock Nataru (+${Math.round((shock - 1) * 100)}%)`;

          let html = `<div class="font-bold text-xs pb-1 mb-1 border-b border-slate-200 dark:border-slate-700">${dateStr}${shockTag}</div>`;
          params.forEach((p) => {
            if (p.value !== null && p.value !== undefined) {
              html += `<div class="flex items-center justify-between gap-4 text-xs">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:${p.color}"></span>${p.seriesName}</span>
                <span class="font-bold font-mono">${formatNumber(p.value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip'}</span>
              </div>`;
            }
          });
          return html;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
        icon: 'circle',
        itemGap: 16,
      },
      grid: {
        top: 28,
        left: '2%',
        right: '2%',
        bottom: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          color: isDarkMode ? '#e2e8f0' : '#334155',
          fontSize: 10,
          fontWeight: 500,
          rotate: xAxisData.length > 50 ? 40 : 0,
          interval: xAxisData.length > 150 ? 14 : xAxisData.length > 50 ? 7 : 2,
          showMaxLabel: true,
          showMinLabel: true,
          formatter: (val: string) => (val && val.length >= 10 ? val.slice(5) : val),
        },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
        axisTick: { show: true },
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
  }, [horizonView, trainDates, trainValues, futureDates, futureValues, selectedModa, selectedMetric, isDarkMode, kpis]);

  // Multimodal Comparison Rows (18 Days Nataru)
  const comparisonRows = useMemo(() => {
    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT' | 'TOTAL'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT', 'TOTAL'];

    let total2026Sum = 0;
    const pts = (!isAllProv ? provData?.scenarios?.moderat : null) || forecastData.scenarios?.moderat || [];
    pts.forEach((p: any) => {
      if (p.date >= '2026-12-18' && p.date <= '2027-01-04') {
        total2026Sum += selectedMetric === 'pnp' ? (Number(p.TOTAL) || 0) : (Number(p.arm_TOTAL) || 0);
      }
    });

    return modes.map((m) => {
      const isModeOperating = m === 'TOTAL' || activeModes.includes(m);
      let fcSum = 0;
      let base25Sum = 0;

      pts.forEach((p: any) => {
        if (p.date >= '2026-12-18' && p.date <= '2027-01-04') {
          const val = selectedMetric === 'pnp' ? (Number(p[m]) || 0) : (Number(p[`arm_${m}`]) || 0);
          fcSum += val;

          const md = p.date.slice(5);
          const val25 = isAllProv
            ? (selectedMetric === 'pnp' ? (Number(p.TOTAL_2025) || 0) : (Number(p.arm_2025) || 0))
            : (map2025[md] || 0);
          base25Sum += val25;
        }
      });

      const yoy = base25Sum > 0 ? ((fcSum / base25Sum - 1) * 100) : 0;
      const share = total2026Sum > 0 ? ((fcSum / total2026Sum) * 100) : 0;

      return {
        moda: m,
        isOperating: isModeOperating,
        fc2026: fcSum,
        base2025: base25Sum,
        diff: fcSum - base25Sum,
        yoy,
        share,
      };
    });
  }, [isAllProv, provData, forecastData, selectedMetric, activeModes, map2025]);

  // 100-Day Daily Breakdown Table Rows
  const dailyRows = useMemo(() => {
    const pts = (!isAllProv ? provData?.scenarios?.moderat : null) || forecastData.scenarios?.moderat || [];
    let list = pts;
    if (tableRange === 'nataru') {
      list = pts.filter((p: any) => p.date >= '2026-12-18' && p.date <= '2027-01-04');
    } else if (tableRange === 'q4') {
      list = pts.filter((p: any) => p.date <= '2026-12-31');
    }
    return list;
  }, [isAllProv, provData, forecastData, tableRange]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER & INTERACTIVE CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Proyeksi Mobilitas Multimoda Q4 & Libur Nataru 2026/2027
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Simulasi peramalan horizon 100 hari (30 Sep 2026 – 7 Jan 2027) mengantisipasi lonjakan kapasitas angkutan Natal 2026 & Tahun Baru 2027.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
              Basis Latih 2026: 272H (1 Jan – 29 Sep)
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
              Horizon Prediksi: 100H (30 Sep – 7 Jan)
            </span>
          </div>
        </div>

        {/* CONTROLS: PROVINCE, MODA, METRIC, HORIZON VIEW */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* DROPDOWN PROVINSI (38 PROVINSI LENGKAP) */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Provinsi:</span>
              <select
                value={selectedProv}
                onChange={(e) => {
                  setSelectedProv(e.target.value);
                  setSelectedModa('TOTAL');
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Seluruh Provinsi (Nasional)</option>
                {ALL_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* DROPDOWN MODA TRANSPORTASI */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Moda:</span>
              <select
                value={selectedModa}
                onChange={(e) => setSelectedModa(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="TOTAL">Total Multimoda (Semua Moda)</option>
                {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => {
                  const operating = activeModes.includes(m);
                  return (
                    <option key={m} value={m} disabled={!operating}>
                      {MODA_DISPLAY_NAME[m]} {!operating ? '(Tidak Beroperasi)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* METRIC TOGGLE */}
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedMetric('pnp')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedMetric === 'pnp' ? 'bg-white dark:bg-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Penumpang
              </button>
              <button
                onClick={() => setSelectedMetric('arm')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedMetric === 'arm' ? 'bg-white dark:bg-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Armada
              </button>
            </div>
          </div>

          {/* FILTER HORIZON: TRAIN + FORECASTING VS FORECASTING SAJA */}
          <div className="flex items-center rounded-lg p-0.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <button
              onClick={() => setHorizonView('train_plus_forecast')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                horizonView === 'train_plus_forecast'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950'
              }`}
            >
              📊 Train + Forecasting (272H + 100H)
            </button>
            <button
              onClick={() => setHorizonView('forecast_only')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                horizonView === 'forecast_only'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950'
              }`}
            >
              📈 Forecasting Saja (100H)
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE PROJECTIONS SUMMARY (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume Nataru */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Proyeksi Nataru (18 Hari) {isAllProv ? '(Nasional)' : `(${selectedProv})`}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              18 Des – 4 Jan
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(kpis.fc18Tot)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Rerata: <strong className="text-slate-800 dark:text-slate-200">{formatNumber(kpis.avg18)}</strong> /hari</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPercent(kpis.yoyTot)} vs 2025</span>
          </div>
        </div>

        {/* Card 2: Puncak Mudik Natal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Puncak Mudik Natal (H-1)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Kamis, 24 Des
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1">
            {formatNumber(kpis.xmasVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>vs 2025: {formatNumber(kpis.xmas25)}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{formatPercent(kpis.yoyXmas)} YoY</span>
          </div>
        </div>

        {/* Card 3: Puncak Balik Tahun Baru */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Puncak Balik Tahun Baru</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              Minggu, 3 Jan
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700 dark:text-rose-400 mt-1">
            {formatNumber(kpis.nyVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>vs 2025: {formatNumber(kpis.ny25)}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{formatPercent(kpis.yoyNy)} YoY</span>
          </div>
        </div>

        {/* Card 4: Kebutuhan Armada Puncak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{selectedMetric === 'pnp' ? 'Kebutuhan Armada Puncak' : 'Penumpang Hari Puncak'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Siaga Operasi
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(kpis.oppPeakVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {selectedMetric === 'pnp' ? 'Trip armada beroperasi harian' : 'Total penumpang pergerakan harian'}
          </div>
        </div>
      </div>

      {/* 3. MAIN FORECASTING CHART CARD (ZERO CI BOUNDS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {horizonView === 'train_plus_forecast'
                ? `Tren Berkelanjutan: Data Historis 2026 Tersambung ke Garis Proyeksi Nataru 2026/2027 (${isAllProv ? 'Nasional' : selectedProv} • ${MODA_DISPLAY_NAME[selectedModa]})`
                : `Horizon Proyeksi Nataru 2026/2027 (100 Hari: 30 Sep 2026 – 7 Jan 2027) (${isAllProv ? 'Nasional' : selectedProv} • ${MODA_DISPLAY_NAME[selectedModa]})`}
            </h4>
            <p className="text-xs text-slate-500">
              {horizonView === 'train_plus_forecast'
                ? 'Garis solid mewakili realisasi historis (1 Jan – 29 Sep 2026), tersambung ke garis putus-putus ungu proyeksi model champion (30 Sep 2026 – 7 Jan 2027).'
                : 'Menampilkan kurva prediksi harian model champion dengan penyesuaian event shock liburan Natal dan Tahun Baru.'}
              {!isOperating && ' ⚠️ Catatan: Moda ini tidak beroperasi di wilayah terpilih (nilai 0).'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Model: {championModel.name.split(' ')[0]}
            </span>
          </div>
        </div>

        <EChartWrapper options={chartOptions} style={{ height: '400px', width: '100%' }} />
      </div>

      {/* 4. MODAL SHARE & 5-MODA COMPARISON TABLE (NATARU 18 DAYS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Komparasi Antarmoda Periode Nataru (18 Hari: 18 Des 2026 – 4 Jan 2027)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan akumulasi proyeksi 2026 terhadap realisasi tahun 2025 per moda transportasi ({isAllProv ? 'Nasional' : selectedProv}).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">
            {isAllProv ? 'Nasional' : selectedProv} • {selectedMetric === 'pnp' ? 'Penumpang' : 'Armada'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 font-semibold">Moda Transportasi</th>
                <th className="py-2.5 text-right font-semibold">Realisasi 2025</th>
                <th className="py-2.5 text-right font-semibold">Proyeksi 2026</th>
                <th className="py-2.5 text-right font-semibold">Selisih Vol</th>
                <th className="py-2.5 text-center font-semibold">Pertumbuhan YoY</th>
                <th className="py-2.5 text-right font-semibold">Pangsa (Share %)</th>
                <th className="py-2.5 font-semibold">Catatan Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {comparisonRows.map((row) => {
                const isTotal = row.moda === 'TOTAL';
                const notes: Record<string, string> = {
                  UDARA: 'Kapasitas armada optimal; kuota tiket dinamis memfilter demand.',
                  KA: 'Tingkat isian stabil tinggi (LF 90%+); rel Trans-Jawa primadona.',
                  BUS: 'Jalan tol Trans-Jawa & Sumatra menjadi koridor utama armada reguler.',
                  ASDP: 'Lonjakan kendaraan pribadi dan logistik di lintasan Merak–Bakauheni & Ketapang.',
                  LAUT: 'Pertumbuhan pergerakan antarpulau & rute perintis Indonesia Timur.',
                  TOTAL: 'Agregasi seluruh pergerakan mobilitas penumpang antarmoda nasional.',
                };

                return (
                  <tr
                    key={row.moda}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isTotal ? 'font-bold bg-slate-50/70 dark:bg-slate-800/50' : ''
                    }`}
                  >
                    <td className="py-2.5 font-sans font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: (COLOR as any)[row.moda] || '#0284c7' }}
                      />
                      <span>{MODA_DISPLAY_NAME[row.moda] || row.moda}</span>
                      {!row.isOperating && <span className="text-[10px] text-slate-400 font-normal italic">(Tidak Beroperasi)</span>}
                    </td>
                    <td className="py-2.5 text-right text-slate-500">
                      {row.isOperating ? formatNumber(row.base2025) : '-'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-indigo-700 dark:text-indigo-400">
                      {row.isOperating ? formatNumber(row.fc2026) : '-'}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {row.isOperating ? formatNumber(row.diff) : '-'}
                    </td>
                    <td className="py-2.5 text-center font-bold">
                      {row.isOperating ? (
                        <span className={row.yoy >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                          {formatPercent(row.yoy)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                      {row.isOperating && !isTotal ? `${formatDecimal(row.share)}%` : isTotal ? '100%' : '-'}
                    </td>
                    <td className="py-2.5 font-sans text-slate-500 text-[11px]">
                      {row.isOperating ? notes[row.moda] : 'Moda tidak aktif di wilayah provinsi ini.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODEL SPECIFICATION & 11-MODEL BENCHMARK RANKING TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Spesifikasi Model & Evaluasi Akurasi Pengujian (Backtest Holdout)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Model champion terpilih secara otomatis berbasis evaluasi MAPE terendah dan stabilitas horizon 100 hari.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span>🏆</span> Model Terpilih: {championModel.name}
            </span>
            <button
              onClick={() => setShowBenchmarkModal(!showBenchmarkModal)}
              className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs hover:bg-indigo-100 transition-colors"
            >
              {showBenchmarkModal ? '✕ Tutup Tabel 11 Model' : '📊 Lihat Tabel 11 Model Peramalan'}
            </button>
          </div>
        </div>

        {/* 3 Metric Cards: MAPE, RMSE, MAE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
              MAPE (Mean Absolute % Error)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {formatDecimal(championModel.mape, 2)}%
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Akurasi sangat tinggi (&lt;5%). Menangkap pola musiman mingguan dan lonjakan libur dengan deviasi sangat minim.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block">
              RMSE (Root Mean Squared Error)
            </span>
            <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400 mt-1">
              {formatNumber(championModel.rmse)} <span className="text-xs font-normal text-slate-500">pnp/hari</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Standar deviasi galat proyeksi dalam satuan riil. WAPE terbobot: {formatDecimal(championModel.wape || 4.02, 2)}%.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              MAE & Directional Accuracy
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {formatNumber(championModel.mae)} <span className="text-xs font-normal text-slate-500">pnp ({formatDecimal(championModel.dir_acc || 89.3, 1)}%)</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Rata-rata kesalahan absolut harian dan akurasi prediksi arah fluktuasi pergerakan armada/penumpang.
            </p>
          </div>
        </div>

        {/* COLLAPSIBLE BENCHMARK TABLE */}
        {showBenchmarkModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Hasil Benchmark 11 Model Acuan PUSDATIN Kemenhub ({isAllProv ? 'Nasional' : selectedProv})
              </h5>
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-center w-12">Rank</th>
                    <th className="py-2 px-3 font-sans">Model Peramalan</th>
                    <th className="py-2 px-3 text-right">MAPE (%)</th>
                    <th className="py-2 px-3 text-right">WAPE (%)</th>
                    <th className="py-2 px-3 text-right">RMSE</th>
                    <th className="py-2 px-3 text-right">MAE</th>
                    <th className="py-2 px-3 text-center">Akurasi Arah</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {benchmarkList.map((b: any, idx: number) => {
                    const isChamp = championModel.code === b.model_code || championModel.name === b.model_name;
                    return (
                      <tr
                        key={b.model_code || idx}
                        className={
                          isChamp
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold border-l-4 border-l-emerald-600'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }
                      >
                        <td className="py-2 px-3 text-center">{idx + 1}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {isChamp && <span>🏆</span>}
                          <span>{b.model_name}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatDecimal(b.mape, 2)}%
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatDecimal(b.wape, 2)}%</td>
                        <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">{formatNumber(b.rmse)}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatNumber(b.mae)}</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">{formatDecimal(b.dir_acc, 1)}%</td>
                        <td className="py-2 px-3 text-center font-sans">
                          {isChamp ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Terpilih (Champion)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Kandidat Alternatif</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. DAILY PROJECTION TABLE (100 DAYS BREAKDOWN) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Rincian Harian Hasil Peramalan ({isAllProv ? 'Nasional' : selectedProv} • {MODA_DISPLAY_NAME[selectedModa]})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Deret proyeksi harian tersimulasi dengan identifikasi hari puncak operasional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">Filter Rentang:</span>
            {[
              { id: 'nataru', label: 'Libur Nataru (18H)' },
              { id: 'q4', label: 'Kuartal IV (Q4)' },
              { id: 'all', label: 'Seluruh Horizon (100H)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTableRange(f.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  tableRange === f.id
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2 px-3 font-semibold">Tanggal</th>
                <th className="py-2 px-3 font-semibold">Hari</th>
                <th className="py-2 px-3 text-right font-semibold">Hasil Proyeksi 2026</th>
                <th className="py-2 px-3 text-right font-semibold">Realisasi 2025</th>
                <th className="py-2 px-3 text-center font-semibold">Pertumbuhan YoY</th>
                <th className="py-2 px-3 text-center font-semibold">Status Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyRows.map((r: any, idx: number) => {
                const val = futureValues[idx] || (selectedMetric === 'pnp' ? (Number(r[selectedModa]) || 0) : (Number(r[`arm_${selectedModa}`]) || 0));
                const md = r.date.slice(5);
                const val25 = map2025[md] || (isAllProv ? (selectedMetric === 'pnp' ? r.TOTAL_2025 : r.arm_2025) : 0) || 0;
                const yoy = val25 > 0 ? ((val / val25 - 1) * 100) : 0;

                const isWeekend = r.day_name === 'Sabtu' || r.day_name === 'Minggu';
                const isXmasPeak = r.date === '2026-12-24';
                const isNyPeak = r.date === '2027-01-03';

                const statusBadge = isXmasPeak ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Puncak Mudik Natal (H-1)
                  </span>
                ) : isNyPeak ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Puncak Balik Tahun Baru
                  </span>
                ) : r.is_nataru ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Periode Siaga Nataru
                  </span>
                ) : isWeekend ? (
                  <span className="text-slate-400 text-[10px]">Libur Akhir Pekan</span>
                ) : (
                  <span className="text-slate-400 text-[10px]">Hari Kerja Normal</span>
                );

                return (
                  <tr
                    key={r.date}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isXmasPeak || isNyPeak ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.date}</td>
                    <td className={`py-2 px-3 font-sans ${isWeekend ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                      {r.day_name}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-indigo-700 dark:text-indigo-400">
                      {formatNumber(val)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">
                      {val25 > 0 ? formatNumber(val25) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {val25 > 0 ? (
                        <span className={yoy >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                          {formatPercent(yoy)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">{statusBadge}</td>
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
