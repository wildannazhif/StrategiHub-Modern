'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal, formatPercent } from '@/lib/constants';
import { TrendingUp, Award, MapPin, BarChart3, Calendar } from 'lucide-react';

interface ForecastingWorkspaceProps {
  forecastData: any;
  benchmarkResults?: Record<string, any>;
  timeline2024?: any[];
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

export const ForecastingWorkspace: React.FC<ForecastingWorkspaceProps> = ({
  forecastData,
  timeline2024 = [],
  timeline2025 = [],
  timeline = [],
  isDarkMode,
}) => {
  // State
  const [selectedProv, setSelectedProv] = useState<string>('ALL');
  const [selectedModa, setSelectedModa] = useState<string>('TOTAL');
  const [selectedMetric, setSelectedMetric] = useState<'pnp' | 'arm'>('pnp');
  const [horizonView, setHorizonView] = useState<'all_train_plus_forecast' | 'train_2026_plus_forecast' | 'forecast_only'>('all_train_plus_forecast');
  const [tableRange, setTableRange] = useState<'nataru' | 'q4' | 'all'>('nataru');
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [isNataruBarMinimized, setIsNataruBarMinimized] = useState<boolean>(false);

  const isAllProv = selectedProv === 'ALL';
  const provData = useMemo(() => {
    if (isAllProv) return null;
    return forecastData?.by_province?.[selectedProv] || null;
  }, [forecastData, selectedProv, isAllProv]);

  // Active modes in province
  const activeModes = useMemo(() => {
    if (isAllProv) return ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
    return provData?.history_2026?.active_modes || ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];
  }, [isAllProv, provData]);

  const isOperating = selectedModa === 'TOTAL' || activeModes.includes(selectedModa);

  // Model Specs & Accuracy (Dynamically updates based on Province AND Moda)
  const championModel = useMemo(() => {
    if (isAllProv) {
      if (selectedModa !== 'TOTAL' && forecastData?.metrics?.[selectedModa]) {
        return forecastData.metrics[selectedModa];
      }
      return forecastData?.champion_model || {
        name: 'LightGBM Regressor (Machine Learning)',
        code: 'lightgbm',
        mape: 3.29,
        rmse: 59271,
        mae: 40241,
        wape: 3.24,
        dir_acc: 89.3,
      };
    }
    if (selectedModa !== 'TOTAL' && provData?.metrics?.[selectedModa]) {
      return provData.metrics[selectedModa];
    }
    return provData?.champion_model || forecastData?.champion_model;
  }, [isAllProv, provData, forecastData, selectedModa]);

  const benchmarkList = useMemo(() => {
    let list: any[] = [];
    if (isAllProv) {
      if (selectedModa !== 'TOTAL' && forecastData?.benchmarks_by_moda?.[selectedModa]) {
        list = forecastData.benchmarks_by_moda[selectedModa];
      } else {
        list = forecastData?.benchmarks || [];
      }
    } else {
      if (selectedModa !== 'TOTAL' && provData?.benchmarks_by_moda?.[selectedModa]) {
        list = provData.benchmarks_by_moda[selectedModa];
      } else {
        list = provData?.benchmarks || forecastData?.benchmarks || [];
      }
    }
    return (list || []).slice(0, 5);
  }, [isAllProv, provData, forecastData, selectedModa]);

  // Peak values for 2024 and 2025 Nataru
  const val24_peak = useMemo(() => {
    const row = (timeline2024 || []).find((r: any) => r.date === '2024-12-24');
    if (!row) return 0;
    return selectedMetric === 'pnp' ? (Number(row[selectedModa]) || 0) : (Number(row[`arm_${selectedModa}`]) || 0);
  }, [timeline2024, selectedModa, selectedMetric]);

  const val25_peak = useMemo(() => {
    const row = (timeline2025 || []).find((r: any) => r.date === '2025-12-28');
    if (!row) return 0;
    return selectedMetric === 'pnp' ? (Number(row[selectedModa]) || 0) : (Number(row[`arm_${selectedModa}`]) || 0);
  }, [timeline2025, selectedModa, selectedMetric]);

  // 1. Train Series (Dynamically supports 2024–2026 for Nasional, or 2026 for Province)
  const { trainDates, trainValues, trainLabel } = useMemo(() => {
    if (isAllProv) {
      if (horizonView === 'train_2026_plus_forecast') {
        const histPoints26 = (timeline || []).filter((d: any) => d.date <= '2026-09-29');
        const dates = histPoints26.map((d: any) => d.date);
        const values = histPoints26.map((d: any) => {
          if (!isOperating) return 0;
          return selectedMetric === 'pnp' ? (Number(d[selectedModa]) || 0) : (Number(d[`arm_${selectedModa}`]) || 0);
        });
        return {
          trainDates: dates,
          trainValues: values,
          trainLabel: 'Data Latih 2026 (1 Jan – 31 Okt 2026 • 304H)',
        };
      }

      // Default: Full continuous 2024–2026 (1.035 days)
      const allTrainPoints: any[] = [];
      (timeline2024 || []).forEach((d: any) => allTrainPoints.push(d));
      (timeline2025 || []).forEach((d: any) => allTrainPoints.push(d));
      (timeline || []).filter((d: any) => d.date <= '2026-10-31').forEach((d: any) => allTrainPoints.push(d));

      const dates = allTrainPoints.map((d: any) => d.date);
      const values = allTrainPoints.map((d: any) => {
        if (!isOperating) return 0;
        return selectedMetric === 'pnp' ? (Number(d[selectedModa]) || 0) : (Number(d[`arm_${selectedModa}`]) || 0);
      });

      return {
        trainDates: dates,
        trainValues: values,
        trainLabel: 'Data Latih Kontinu 2024–2026 (1 Jan 2024 – 31 Okt 2026 • 1.035H)',
      };
    }

    // Per-province (2024 not available, show available 2026 data)
    const h = provData?.history_2026;
    if (!h) return { trainDates: [], trainValues: [], trainLabel: 'Data Latih 2026' };

    const dates = h.dates || [];
    let values: number[] = [];
    if (!isOperating) {
      values = dates.map(() => 0);
    } else if (selectedMetric === 'pnp') {
      values = (h[selectedModa] || []).map((v: any) => Number(v) || 0);
    } else {
      values = (h[`arm_${selectedModa}`] || []).map((v: any) => Number(v) || 0);
    }
    return {
      trainDates: dates,
      trainValues: values,
      trainLabel: `Data Latih 2026 (${selectedProv} • 304H)`,
    };
  }, [isAllProv, provData, timeline2024, timeline2025, timeline, selectedMetric, selectedModa, isOperating, horizonView, selectedProv]);

  // 2. Future 100-Day Forecast Points (from official PUSDATIN precomputed model)
  const futurePoints: any[] = useMemo(() => {
    if (isAllProv) {
      return forecastData?.scenarios?.moderat || [];
    }
    return provData?.scenarios?.moderat || [];
  }, [isAllProv, provData, forecastData]);

  const futureDates: string[] = useMemo(() => {
    return futurePoints.map((p: any) => p.date);
  }, [futurePoints]);

  const futureValues: number[] = useMemo(() => {
    if (!isOperating) return futureDates.map(() => 0);
    return futurePoints.map((p: any) => {
      if (selectedMetric === 'pnp') {
        return Number(p[selectedModa]) || 0;
      } else {
        return Number(p[`arm_${selectedModa}`]) || 0;
      }
    });
  }, [futurePoints, futureDates, selectedMetric, selectedModa, isOperating]);

  // 3. 2025 Baseline Map
  const map2025 = useMemo(() => {
    const map: Record<string, number> = {};
    if (isAllProv) {
      (timeline2025 || []).forEach((r: any) => {
        const md = r.date.slice(5);
        if (selectedMetric === 'pnp') {
          map[md] = Number(r[selectedModa]) || Number(r[`pbrg_${selectedModa}`]) || 0;
        } else {
          map[md] = Number(r[`arm_${selectedModa}`]) || Number(r[`abrg_${selectedModa}`]) || 0;
        }
      });
    } else {
      // Province-level 2025 baseline
      futurePoints.forEach((p: any) => {
        const md = p.date.slice(5);
        if (selectedMetric === 'pnp') {
          map[md] = Number(p.TOTAL_2025) || 0;
        } else {
          map[md] = Number(p.arm_2025) || 0;
        }
      });
    }
    return map;
  }, [isAllProv, timeline2025, futurePoints, selectedMetric, selectedModa]);

  // 4. Summary KPI Cards
  const kpis = useMemo(() => {
    let fc18Tot = 0;
    let base25Tot = 0;
    let xmasVal = 0;
    let nyVal = 0;
    let xmas25 = 0;
    let ny25 = 0;
    let oppPeakVal = 0;

    futurePoints.forEach((p: any, idx: number) => {
      const d = p.date;
      const val = futureValues[idx] || 0;
      const md = d.slice(5);
      const val25 = map2025[md] || 0;

      if (d >= '2026-12-18' && d <= '2027-01-04') {
        fc18Tot += val;
        base25Tot += val25;

        // Opposing metric for this specific moda
        const oppVal = selectedMetric === 'pnp'
          ? (Number(p[`arm_${selectedModa}`]) || 0)
          : (Number(p[selectedModa]) || 0);
        if (oppVal > oppPeakVal) oppPeakVal = oppVal;
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
  }, [futurePoints, futureValues, map2025, selectedMetric, selectedModa]);

  // 5. ECharts Configuration (Zero CI bounds, explicit Data Latih vs Hasil Forecasting)
  const chartOptions = useMemo(() => {
    const isDark = (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) || isDarkMode;
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const splitLineColor = isDark ? '#1e293b' : '#f1f5f9';

    // High-contrast, vivid colors tailored for BOTH Light and Dark backgrounds
    const TRAIN_COLORS: Record<string, string> = {
      TOTAL: isDark ? '#00f0ff' : '#1d4ed8', // Radiant Neon Cyan in Dark, Deep Sapphire Blue in Light
      UDARA: isDark ? '#38bdf8' : '#2563eb', // Vivid Blue
      KA: isDark ? '#fb923c' : '#c2410c',    // Deep Amber / Orange
      BUS: isDark ? '#34d399' : '#15803d',   // Deep Emerald Green
      ASDP: isDark ? '#c084fc' : '#7e22ce',  // Deep Violet / Purple
      LAUT: isDark ? '#22d3ee' : '#0e7490',  // Deep Cyan / Teal
    };

    const trainColor = TRAIN_COLORS[selectedModa] || (isDark ? '#00f0ff' : '#1d4ed8');
    const forecastColor = isDark ? '#facc15' : '#d97706'; // Vibrant Gold/Amber with high contrast on both

    let xAxisData: string[] = [];
    let series: any[] = [];

    if (horizonView !== 'forecast_only') {
      xAxisData = [...trainDates, ...futureDates];
      const lastTrainVal = trainValues.length > 0 ? trainValues[trainValues.length - 1] : 0;

      // Train line (solid, thick 3.5px with translucent area fill)
      const trainSeriesData = [...trainValues, ...futureDates.map(() => null)];

      // Forecast line (dashed, seamlessly joined from last train date)
      const forecastSeriesData = [
        ...trainValues.slice(0, Math.max(0, trainValues.length - 1)).map(() => null),
        lastTrainVal,
        ...futureValues,
      ];

      const markPointsList: any[] = [];
      if (isAllProv && horizonView === 'all_train_plus_forecast') {
        if (val24_peak > 0) {
          markPointsList.push({ name: 'Puncak Natal 2024', coord: ['2024-12-24', val24_peak], value: 'Natal 24' });
        }
        if (val25_peak > 0) {
          markPointsList.push({ name: 'Puncak Nataru 2025', coord: ['2025-12-28', val25_peak], value: 'Nataru 25' });
        }
      }
      markPointsList.push({ name: 'Puncak Mudik Natal', coord: ['2026-12-24', kpis.xmasVal], value: 'Natal 26' });
      markPointsList.push({ name: 'Puncak Balik', coord: ['2027-01-03', kpis.nyVal], value: 'Balik 27' });

      series = [
        {
          name: trainLabel,
          type: 'line',
          smooth: 0.15,
          showSymbol: false,
          data: trainSeriesData,
          color: trainColor,
          lineStyle: { width: 3.5, color: trainColor },
          itemStyle: { color: trainColor },
          areaStyle: {
            color: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(37, 99, 235, 0.12)',
          },
        },
        {
          name: 'Data Hasil Forecasting (1 Nov 2026 – 8 Feb 2027)',
          type: 'line',
          smooth: 0.2,
          showSymbol: false,
          data: forecastSeriesData,
          color: forecastColor,
          lineStyle: { width: 3.8, color: forecastColor, type: 'dashed' },
          itemStyle: { color: forecastColor },
          areaStyle: {
            color: isDark ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.12)',
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 42,
            itemStyle: { color: '#ef4444' },
            label: { fontSize: 8.5, color: '#ffffff', fontWeight: 'bold' },
            data: markPointsList,
          },
        },
      ];
    } else {
      // Forecast Only (100 Days Zoom-in)
      xAxisData = futureDates;

      series = [
        {
          name: 'Data Hasil Forecasting (1 Nov 2026 – 8 Feb 2027)',
          type: 'line',
          smooth: 0.2,
          showSymbol: false,
          data: futureValues,
          color: forecastColor,
          lineStyle: { width: 3.5, color: forecastColor },
          itemStyle: { color: forecastColor },
          areaStyle: {
            color: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(217, 119, 6, 0.08)',
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 44,
            itemStyle: { color: '#ef4444' },
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
          let shockTag = '';
          if (dateStr === '2024-12-24') shockTag = ' 🎄 Puncak Natal 2024';
          else if (dateStr === '2025-12-28') shockTag = ' 🌟 Puncak Nataru 2025';
          else if (dateStr === '2026-12-24') shockTag = ' 🔥 Puncak Mudik Natal 2026 (H-1)';
          else if (dateStr === '2027-01-03') shockTag = ' 🚀 Puncak Balik Tahun Baru 2027';

          let html = `<div class="font-bold text-xs pb-1 mb-1 border-b border-slate-200 dark:border-slate-700">${dateStr}${shockTag}</div>`;
          params.forEach((p) => {
            if (p.value !== null && p.value !== undefined) {
              html += `<div class="flex items-center justify-between gap-4 text-xs">
                <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:${p.color}"></span>${p.seriesName}</span>
                <span class="font-bold font-mono">${formatNumber(p.value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip armada'}</span>
              </div>`;
            }
          });
          return html;
        },
      },
      legend: {
        top: 0,
        right: 10,
        textStyle: { color: textColor, fontSize: 10 },
        icon: 'circle',
        itemGap: 14,
      },
      grid: {
        top: 32,
        left: '2%',
        right: '2%',
        bottom: xAxisData.length > 150 ? 60 : 45,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          fontSize: 10,
          rotate: xAxisData.length > 500 ? 0 : xAxisData.length > 50 ? 40 : 0,
          interval: xAxisData.length > 500 ? 60 : xAxisData.length > 150 ? 14 : xAxisData.length > 50 ? 7 : 2,
          showMaxLabel: true,
          showMinLabel: true,
          formatter: (val: string) => {
            if (!val) return '';
            if (xAxisData.length > 500) {
              return val.slice(0, 7);
            }
            return val.length >= 10 ? val.slice(5) : val;
          },
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
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          show: xAxisData.length > 150,
          bottom: 2,
          height: 18,
          borderColor: isDarkMode ? '#334155' : '#cbd5e1',
          fillerColor: isDarkMode ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.15)',
          handleStyle: { color: isDarkMode ? '#818cf8' : '#4f46e5' },
          textStyle: { color: textColor, fontSize: 9 },
        },
      ],
      series,
    };
  }, [horizonView, trainDates, trainValues, trainLabel, futureDates, futureValues, selectedModa, selectedMetric, isDarkMode, kpis, isAllProv, val24_peak, val25_peak]);

  // 6. Multimodal Comparison Rows (18 Days Nataru)
  const comparisonRows = useMemo(() => {
    const modes: Array<'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT' | 'TOTAL'> = ['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT', 'TOTAL'];

    let total2026Sum = 0;
    futurePoints.forEach((p: any) => {
      if (p.date >= '2026-12-18' && p.date <= '2027-01-04') {
        total2026Sum += selectedMetric === 'pnp' ? (Number(p.TOTAL) || 0) : (Number(p.arm_TOTAL) || 0);
      }
    });

    return modes.map((m) => {
      const isModeOperating = m === 'TOTAL' || activeModes.includes(m);
      let fcSum = 0;
      let base25Sum = 0;

      futurePoints.forEach((p: any) => {
        if (p.date >= '2026-12-18' && p.date <= '2027-01-04') {
          const val = selectedMetric === 'pnp' ? (Number(p[m]) || 0) : (Number(p[`arm_${m}`]) || 0);
          fcSum += val;

          const md = p.date.slice(5);
          if (isAllProv) {
            const r25 = (timeline2025 || []).find((r: any) => r.date.slice(5) === md);
            if (r25) {
              base25Sum += selectedMetric === 'pnp'
                ? (Number(r25[m]) || Number(r25[`pbrg_${m}`]) || 0)
                : (Number(r25[`arm_${m}`]) || Number(r25[`abrg_${m}`]) || 0);
            }
          } else {
            base25Sum += selectedMetric === 'pnp' ? (Number(p.TOTAL_2025) || 0) : (Number(p.arm_2025) || 0);
          }
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
  }, [futurePoints, activeModes, selectedMetric, isAllProv, timeline2025]);

  // 7. 100-Day Daily Breakdown Table Rows
  const dailyRows = useMemo(() => {
    let list = futurePoints;
    if (tableRange === 'nataru') {
      list = futurePoints.filter((p: any) => p.date >= '2026-12-18' && p.date <= '2027-01-04');
    } else if (tableRange === 'q4') {
      list = futurePoints.filter((p: any) => p.date <= '2026-12-31');
    }
    return list;
  }, [futurePoints, tableRange]);

  // 8. Dedicated 18-Day Nataru Bar Chart Option (2024 vs 2025 vs Proyeksi 2026)
  const nataruBarChartOption = useMemo(() => {
    const rawList = forecastData?.nataru_18days_comparison || [];
    if (rawList.length === 0) return null;

    const labels = rawList.map((r: any) => r.short_label || r.tag);
    const textColor = isDarkMode ? '#cbd5e1' : '#475569';
    const splitLineColor = isDarkMode ? '#1e293b' : '#f1f5f9';

    const val24 = rawList.map((r: any) => {
      if (!isAllProv || !isOperating) return 0;
      if (selectedModa === 'TOTAL') {
        return selectedMetric === 'pnp' ? (r.pnp_2024 || 0) : (r.arm_2024 || 0);
      }
      return selectedMetric === 'pnp' ? (r[`${selectedModa}_2024`] || 0) : Math.round((r[`${selectedModa}_2024`] || 0) / 28);
    });

    const val25 = rawList.map((r: any) => {
      if (!isOperating) return 0;
      if (isAllProv) {
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pnp_2025 || 0) : (r.arm_2025 || 0);
        }
        return selectedMetric === 'pnp' ? (r[`${selectedModa}_2025`] || 0) : Math.round((r[`${selectedModa}_2025`] || 0) / 28);
      }
      const pPoint = (provData?.scenarios?.moderat || []).find((p: any) => p.date === r.date_2026);
      if (pPoint) {
        return selectedMetric === 'pnp' ? (Number(pPoint.TOTAL_2025) || 0) : (Number(pPoint.arm_2025) || 0);
      }
      return 0;
    });

    const val26 = rawList.map((r: any) => {
      if (!isOperating) return 0;
      if (isAllProv) {
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pnp_2026_forecast || 0) : (r.arm_2026_forecast || 0);
        }
        return selectedMetric === 'pnp' ? (r[selectedModa] || 0) : (r[`arm_${selectedModa}`] || 0);
      }
      const pPoint = (provData?.scenarios?.moderat || []).find((p: any) => p.date === r.date_2026);
      if (pPoint) {
        return selectedMetric === 'pnp' ? (Number(pPoint[selectedModa]) || 0) : (Number(pPoint[`arm_${selectedModa}`]) || 0);
      }
      return 0;
    });

    const series: any[] = [];
    if (isAllProv) {
      series.push({
        name: 'Realisasi Nataru 2024',
        type: 'bar',
        data: val24,
        itemStyle: { color: isDarkMode ? '#64748b' : '#94a3b8', borderRadius: [3, 3, 0, 0] },
      });
    }
    series.push({
      name: 'Realisasi Nataru 2025',
      type: 'bar',
      data: val25,
      itemStyle: { color: isDarkMode ? '#f59e0b' : '#d97706', borderRadius: [3, 3, 0, 0] },
    });
    series.push({
      name: 'Proyeksi Nataru 2026 (Model Champion)',
      type: 'bar',
      data: val26,
      itemStyle: { color: isDarkMode ? '#818cf8' : '#4f46e5', borderRadius: [3, 3, 0, 0] },
    });

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
        itemGap: 16,
      },
      grid: {
        top: 25,
        left: '2%',
        right: '2%',
        bottom: 50,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: textColor, fontSize: 10, rotate: 25 },
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
  }, [forecastData, isDarkMode, isAllProv, isOperating, selectedModa, selectedMetric, provData]);

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
              Simulasi peramalan horizon 100 hari (1 Nov 2026 – 8 Feb 2027) mengantisipasi lonjakan kapasitas angkutan Natal 2026 & Tahun Baru 2027.
            </p>
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
            onChange={(e) => setSelectedProv(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="ALL">🇮🇩 Seluruh Provinsi (Nasional)</option>
            {ALL_PROVINCES.filter((p) => p !== 'ALL').map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          </div>

          {/* DROPDOWN MODA (5 MODA) */}
          <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Moda:</span>
          <select
            value={selectedModa}
            onChange={(e) => setSelectedModa(e.target.value as any)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="TOTAL">Semua Moda (Total Multimoda)</option>
            {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
              <option key={m} value={m}>
                {MODA_DISPLAY_NAME[m]}
              </option>
            ))}
          </select>
          </div>

          {/* METRIC TOGGLE */}
          <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setSelectedMetric('pnp')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedMetric === 'pnp'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Penumpang
          </button>
          <button
            onClick={() => setSelectedMetric('arm')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedMetric === 'arm'
                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Armada
          </button>
          </div>
          </div>

          {/* FILTER HORIZON: TRAIN + FORECASTING VS FORECASTING SAJA */}
          <div className="flex flex-wrap items-center rounded-lg p-0.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs">
          {isAllProv ? (
          <>
            <button
              onClick={() => setHorizonView('all_train_plus_forecast')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                horizonView === 'all_train_plus_forecast'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
              }`}
            >
              📊 Data Latih 2024–2026 + Proyeksi (1.035H + 100H)
            </button>
            <button
              onClick={() => setHorizonView('train_2026_plus_forecast')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                horizonView === 'train_2026_plus_forecast'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
              }`}
            >
              📊 2026 + Proyeksi (304H + 100H)
            </button>
          </>
          ) : (
          <button
            onClick={() => setHorizonView('train_2026_plus_forecast')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              horizonView !== 'forecast_only'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
            }`}
          >
            📊 Data Latih 2026 + Proyeksi ({selectedProv} • 304H + 100H)
          </button>
          )}
          <button
          onClick={() => setHorizonView('forecast_only')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
            horizonView === 'forecast_only'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
          }`}
          >
          📈 Proyeksi Saja (100H)
          </button>
          </div>
          </div>

          {/* COMPACT TRAIN - TEST - FORECASTING RANGE INFO */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Latih:</strong>{' '}
          {isAllProv ? '1 Jan 2024 – 17 Des 2025 (Retrain s.d. 31 Okt 2026 • 1.035H)' : '1 Jan – 1 Sep 2026 (Retrain s.d. 31 Okt 2026 • 304H)'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Uji:</strong>{' '}
          {isAllProv ? '18 Des 2025 – 4 Jan 2026 (18H Nataru)' : '2 Sep – 29 Sep 2026 (28H Holdout)'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          <strong className="text-slate-700 dark:text-slate-300 font-sans">Proyeksi:</strong> 1 Nov 2026 – 8 Feb 2027 (100H)
          </span>
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
            {selectedMetric === 'pnp' ? `Trip armada ${MODA_DISPLAY_NAME[selectedModa]} beroperasi` : `Total pergerakan ${MODA_DISPLAY_NAME[selectedModa]}`}
          </div>
        </div>
      </div>

      {/* 3. MAIN FORECASTING CHART CARD (ZERO CI BOUNDS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Forecasting 2026
            </h4>
            <p className="text-xs text-slate-500">
              {horizonView === 'forecast_only'
                ? `Kurva peramalan horizon 100 hari (1 Nov 2026 – 8 Feb 2027) model champion (${isAllProv ? 'Nasional' : selectedProv} • ${MODA_DISPLAY_NAME[selectedModa]}).`
                : isAllProv && horizonView === 'all_train_plus_forecast'
                ? `Data Latih Kontinu 2024–2026 (1 Jan 2024 – 31 Okt 2026 • 1.035 hari) tersambung ke Garis Proyeksi Nataru 2026/2027 (${isAllProv ? 'Nasional' : selectedProv} • ${MODA_DISPLAY_NAME[selectedModa]}).`
                : `Data Latih 2026 (1 Jan – 31 Okt 2026 • 304 hari) tersambung ke Garis Proyeksi Nataru 2026/2027 (${isAllProv ? 'Nasional' : selectedProv} • ${MODA_DISPLAY_NAME[selectedModa]}).`}
              {!isOperating && ' ⚠️ Catatan: Moda ini tidak beroperasi di wilayah terpilih (nilai 0).'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Model: {championModel.name}
            </span>
          </div>
        </div>

        <EChartWrapper options={chartOptions} style={{ height: '400px', width: '100%' }} />
      </div>

      {/* 4. DEDICATED 18-DAY NATARU BAR CHART (2024 vs 2025 vs PROYEKSI 2026) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Grafik Batang Komparasi Volume Harian Posko Nataru (18 Hari: 18 Des – 4 Jan)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan tren harian 3 tahun kalender: Realisasi 2024, Realisasi 2025, dan Hasil Proyeksi 2026 ({isAllProv ? 'Nasional' : selectedProv} • {selectedModa === 'TOTAL' ? 'Semua Moda' : MODA_DISPLAY_NAME[selectedModa]}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800">
              {isAllProv ? 'Nasional (3 Tahun: 2024, 2025, 2026)' : `${selectedProv} (2 Tahun: 2025, 2026)`} • {selectedMetric === 'pnp' ? 'Penumpang' : 'Armada'}
            </span>
            <button
              onClick={() => setIsNataruBarMinimized(!isNataruBarMinimized)}
              className="text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
              title={isNataruBarMinimized ? 'Tampilkan Grafik Batang' : 'Minimize / Sembunyikan'}
            >
              {isNataruBarMinimized ? '▼ Tampilkan' : '▲ Minimize'}
            </button>
          </div>
        </div>

        {!isNataruBarMinimized && (
          <>
            {/* NATARU SUMMARY CALLOUT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400 font-sans text-[11px] block">Total Nataru 2024 (18H):</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                  {isAllProv ? (selectedMetric === 'pnp' ? '22.522.872' : '765.410') : '-'}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">{isAllProv ? 'Realisasi Penuh' : 'Khusus Nasional'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400 font-sans text-[11px] block">Total Nataru 2025 (18H):</span>
                <div className="font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                  {isAllProv ? (selectedMetric === 'pnp' ? '31.718.505' : '823.140') : formatNumber(comparisonRows.find(r => r.moda === selectedModa)?.base2025 || 0)}
                </div>
                <span className="text-[10px] text-amber-600/80 font-sans">Ground Truth Pembanding</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 font-mono text-xs">
                <span className="text-indigo-600 dark:text-indigo-400 font-sans text-[11px] block font-semibold">Proyeksi Nataru 2026 (18H):</span>
                <div className="font-bold text-indigo-700 dark:text-indigo-300 text-sm mt-0.5">
                  {isAllProv ? (selectedMetric === 'pnp' ? '30.716.688' : '812.590') : formatNumber(comparisonRows.find(r => r.moda === selectedModa)?.fc2026 || 0)}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans font-semibold">Model Champion</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400 font-sans text-[11px] block">Puncak Mudik Natal (H-1):</span>
                <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                  24 Des • {isAllProv ? (selectedMetric === 'pnp' ? '1.933.690' : '46.942') : formatNumber(Math.round((comparisonRows.find(r => r.moda === selectedModa)?.fc2026 || 0) / 15.5))}
                </div>
                <span className="text-[10px] text-rose-600/80 font-sans">Puncak Arus Berangkat</span>
              </div>
            </div>

            {nataruBarChartOption && (
              <div className="pt-2">
                <EChartWrapper options={nataruBarChartOption} style={{ height: '360px', width: '100%' }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. MODAL SHARE & 5-MODA COMPARISON TABLE (NATARU 18 DAYS) */}
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

      {/* 6. MODEL SPECIFICATION & TOP 5 BENCHMARK RANKING TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Spesifikasi Model & Evaluasi Akurasi Pengujian (Top 5 Model Terbaik)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAllProv
                ? 'Model champion terpilih berbasis evaluasi MAPE terendah pada Data Uji 18 Hari Libur Nataru (18 Des 2025 – 4 Jan 2026) setelah dilatih 717 hari (2024–2025), lalu di-retrain 1.035 hari (2024–2026).'
                : `Model champion wilayah ${selectedProv} terpilih berbasis evaluasi MAPE terendah pada Data Uji 28 Hari Temporal Holdout (2 – 29 Sep 2026) dari 304 hari data manifest riil 2026 (bebas bias sirkular rekonstruksi).`}
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
              {showBenchmarkModal ? '✕ Tutup Tabel 5 Model' : '📊 Lihat Tabel 5 Model Terbaik (+LightGBM Juara 1)'}
            </button>
          </div>
        </div>

        {/* COMPACT METHODOLOGY INFO (NO CARD, SMALL & CLEAN) */}
        <p className="text-[11px] text-slate-500 font-mono leading-relaxed pt-1">
          <strong className="text-indigo-600 dark:text-indigo-400 font-sans">Partisi Evaluasi Akurasi:</strong>{' '}
          {isAllProv
            ? 'Data Latih: 1 Jan 2024 – 17 Des 2025 • Data Uji: 18 Des 2025 – 4 Jan 2026 (18H Posko Nataru) • Retrain Penuh: 1.035H s.d. 31 Okt 2026.'
            : `Data Latih: 1 Jan – 1 Sep 2026 (244H) • Data Uji: 2 – 29 Sep 2026 (28H Holdout ${selectedProv}) • Retrain Penuh: 304H.`}
        </p>

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
              {isAllProv
                ? 'Diuji pada 18 Hari Masa Posko Nataru 2025/2026 (18 Des – 4 Jan). Model juara menangkap shock puncak liburan dengan deviasi minimal.'
                : `Diuji pada 28 Hari Holdout September 2026 (2 – 29 Sep) di wilayah ${selectedProv} murni dari data observasi nyata.`}
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
              Standar deviasi galat proyeksi dalam satuan riil {selectedMetric === 'pnp' ? 'orang' : 'trip'}/hari. WAPE terbobot: {formatDecimal(championModel.wape || 3.24, 2)}%.
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
              {isAllProv
                ? 'Akurasi arah 89,3% pada fase fluktuasi libur akhir tahun. Data latih awal: 1 Jan 2024 – 17 Des 2025.'
                : `Akurasi arah ${formatDecimal(championModel.dir_acc || 75.0, 1)}% memprediksi pola mingguan. Data latih awal: 1 Jan – 1 Sep 2026.`}
            </p>
          </div>
        </div>

        {/* COLLAPSIBLE BENCHMARK TABLE */}
        {showBenchmarkModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Hasil Benchmark 5 Model Terbaik PUSDATIN Kemenhub (+LightGBM Juara 1) ({isAllProv ? 'Nasional' : selectedProv} • {selectedModa === 'TOTAL' ? 'Total Multimoda' : MODA_DISPLAY_NAME[selectedModa]})
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
              {dailyRows.map((r: any) => {
                const val = !isOperating
                  ? 0
                  : selectedMetric === 'pnp'
                  ? (Number(r[selectedModa]) || 0)
                  : (Number(r[`arm_${selectedModa}`]) || 0);

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
