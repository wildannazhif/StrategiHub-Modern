'use client';

import React, { useState, useMemo } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal, formatPercent } from '@/lib/constants';
import { Flame, Award, MapPin, BarChart3, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface ForecastingLebaranWorkspaceProps {
  forecastData: any;
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

export const ForecastingLebaranWorkspace: React.FC<ForecastingLebaranWorkspaceProps> = ({
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
  const [tableRange, setTableRange] = useState<'lebaran' | 'q1' | 'all'>('lebaran');
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [isLebaranBarMinimized, setIsLebaranBarMinimized] = useState<boolean>(false);

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
        mape: 3.15,
        rmse: 54210,
        mae: 38450,
        wape: 3.10,
        dir_acc: 93.8,
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

  // 1. Train Series (Strictly focused on Penumpang Berangkat & Armada Berangkat)
  const { trainDates, trainValues, trainLabel } = useMemo(() => {
    const pKey = `pbrg_${selectedModa}`;
    const aKey = `abrg_${selectedModa}`;

    if (isAllProv) {
      if (horizonView === 'train_2026_plus_forecast') {
        const histPoints26 = (timeline || []).filter((d: any) => d.date <= '2026-10-31');
        const dates = histPoints26.map((d: any) => d.date);
        const values = histPoints26.map((d: any) => {
          if (!isOperating) return 0;
          return selectedMetric === 'pnp'
            ? (Number(d[pKey]) || Number(d[selectedModa]) || 0)
            : (Number(d[aKey]) || Number(d[`arm_${selectedModa}`]) || 0);
        });
        return {
          trainDates: dates,
          trainValues: values,
          trainLabel: selectedMetric === 'pnp'
            ? 'Data Latih Penumpang Berangkat 2026 (1 Jan – 31 Okt 2026 • 304H)'
            : 'Data Latih Armada Berangkat 2026 (1 Jan – 31 Okt 2026 • 304H)',
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
        return selectedMetric === 'pnp'
          ? (Number(d[pKey]) || Number(d[selectedModa]) || 0)
          : (Number(d[aKey]) || Number(d[`arm_${selectedModa}`]) || 0);
      });

      return {
        trainDates: dates,
        trainValues: values,
        trainLabel: selectedMetric === 'pnp'
          ? 'Data Latih Penumpang Berangkat (1 Jan 2024 – 31 Okt 2026 • 1.035H)'
          : 'Data Latih Armada Berangkat (1 Jan 2024 – 31 Okt 2026 • 1.035H)',
      };
    }

    // Per-province
    const h = provData?.history_2026;
    if (!h) return { trainDates: [], trainValues: [], trainLabel: 'Data Latih 2026' };

    const dates = h.dates || [];
    let values: number[] = [];
    if (!isOperating) {
      values = dates.map(() => 0);
    } else if (selectedMetric === 'pnp') {
      values = (h[pKey] || h[selectedModa] || []).map((v: any) => Number(v) || 0);
    } else {
      values = (h[aKey] || h[`arm_${selectedModa}`] || []).map((v: any) => Number(v) || 0);
    }
    return {
      trainDates: dates,
      trainValues: values,
      trainLabel: selectedMetric === 'pnp'
        ? `Data Latih Penumpang Berangkat 2026 (${selectedProv} • 304H)`
        : `Data Latih Armada Berangkat 2026 (${selectedProv} • 304H)`,
    };
  }, [isAllProv, provData, timeline2024, timeline2025, timeline, selectedMetric, selectedModa, isOperating, horizonView, selectedProv]);

  // 2. Future 138-Day Forecast Points (Strictly Penumpang Berangkat & Armada Berangkat)
  const futurePoints: any[] = useMemo(() => {
    if (isAllProv) {
      return forecastData?.scenarios?.moderat || forecastData?.future_points || [];
    }
    return provData?.scenarios?.moderat || provData?.future_points || [];
  }, [isAllProv, provData, forecastData]);

  const futureDates: string[] = useMemo(() => {
    return futurePoints.map((p: any) => p.date);
  }, [futurePoints]);

  const futureValues: number[] = useMemo(() => {
    if (!isOperating) return futureDates.map(() => 0);
    const pKey = `pbrg_${selectedModa}`;
    const aKey = `abrg_${selectedModa}`;
    return futurePoints.map((p: any) => {
      if (selectedMetric === 'pnp') {
        return Number(p[pKey]) || Number(p[selectedModa]) || 0;
      } else {
        return Number(p[aKey]) || Number(p[`arm_${selectedModa}`]) || 0;
      }
    });
  }, [futurePoints, futureDates, selectedMetric, selectedModa, isOperating]);

  // 3. 2026 Realisasi Map for Comparison
  const map2026 = useMemo(() => {
    const map: Record<string, number> = {};
    const pKey = `pbrg_${selectedModa}`;
    const aKey = `abrg_${selectedModa}`;
    (timeline || []).forEach((r: any) => {
      const md = r.date.slice(5);
      if (selectedMetric === 'pnp') {
        map[md] = Number(r[pKey]) || Number(r[selectedModa]) || 0;
      } else {
        map[md] = Number(r[aKey]) || Number(r[`arm_${selectedModa}`]) || 0;
      }
    });
    return map;
  }, [timeline, selectedMetric, selectedModa]);

  // 4. Executive Summary KPI Cards
  const kpis = useMemo(() => {
    let fc17Tot = 0;
    let base26Tot = 0;
    let mudikVal = 0;
    let balikVal = 0;
    let mudik26 = 0;
    let balik26 = 0;
    let oppPeakVal = 0;

    const pKey = `pbrg_${selectedModa}`;
    const aKey = `abrg_${selectedModa}`;

    futurePoints.forEach((p: any, idx: number) => {
      const d = p.date;
      const val = futureValues[idx] || 0;

      // 17-Day Posko Lebaran: 2 Mar 2027 to 18 Mar 2027
      if (d >= '2027-03-02' && d <= '2027-03-18') {
        fc17Tot += val;

        const oppVal = selectedMetric === 'pnp'
          ? (Number(p[aKey]) || Number(p[`arm_${selectedModa}`]) || 0)
          : (Number(p[pKey]) || Number(p[selectedModa]) || 0);
        if (oppVal > oppPeakVal) oppPeakVal = oppVal;
      }
      if (d === '2027-03-07') {
        mudikVal = val;
      }
      if (d === '2027-03-14') {
        balikVal = val;
      }
    });

    if (isAllProv) {
      (timeline || []).forEach((r: any) => {
        if (r.date >= '2026-03-13' && r.date <= '2026-03-29') {
          const val26 = selectedMetric === 'pnp'
            ? (Number(r[pKey]) || Number(r[selectedModa]) || 0)
            : (Number(r[aKey]) || Number(r[`arm_${selectedModa}`]) || 0);
          base26Tot += val26;
          if (r.date === '2026-03-18') mudik26 = val26;
          if (r.date === '2026-03-24') balik26 = val26;
        }
      });
    } else {
      const h = provData?.history_2026;
      if (h && h.dates) {
        const vals = selectedMetric === 'pnp' ? (h[pKey] || h[selectedModa] || []) : (h[aKey] || h[`arm_${selectedModa}`] || []);
        h.dates.forEach((dStr: string, i: number) => {
          if (dStr >= '2026-03-13' && dStr <= '2026-03-29') {
            const v = Number(vals[i]) || 0;
            base26Tot += v;
            if (dStr === '2026-03-18') mudik26 = v;
            if (dStr === '2026-03-24') balik26 = v;
          }
        });
      }
    }

    const avg17 = Math.round(fc17Tot / 17);
    const yoyTot = base26Tot > 0 ? ((fc17Tot / base26Tot - 1) * 100) : 0;
    const yoyMudik = mudik26 > 0 ? ((mudikVal / mudik26 - 1) * 100) : 0;
    const yoyBalik = balik26 > 0 ? ((balikVal / balik26 - 1) * 100) : 0;

    return {
      fc17Tot,
      avg17,
      yoyTot,
      mudikVal,
      mudik26,
      yoyMudik,
      balikVal,
      balik26,
      yoyBalik,
      oppPeakVal,
    };
  }, [futurePoints, futureValues, timeline, selectedMetric, selectedModa, isAllProv, provData]);

  // 5. ECharts Configuration (Continuous Time Series)
  const chartOptions = useMemo(() => {
    const isDark = (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) || isDarkMode;
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const splitLineColor = isDark ? '#1e293b' : '#f1f5f9';

    const TRAIN_COLORS: Record<string, string> = {
      TOTAL: isDark ? '#00f0ff' : '#1d4ed8',
      UDARA: isDark ? '#38bdf8' : '#2563eb',
      KA: isDark ? '#fb923c' : '#c2410c',
      BUS: isDark ? '#34d399' : '#15803d',
      ASDP: isDark ? '#c084fc' : '#7e22ce',
      LAUT: isDark ? '#22d3ee' : '#0e7490',
    };

    const trainColor = TRAIN_COLORS[selectedModa] || (isDark ? '#00f0ff' : '#1d4ed8');
    const forecastColor = isDark ? '#10b981' : '#059669'; // Emerald Green for Lebaran

    let xAxisData: string[] = [];
    let series: any[] = [];

    if (horizonView !== 'forecast_only') {
      xAxisData = [...trainDates, ...futureDates];
      const lastTrainVal = trainValues.length > 0 ? trainValues[trainValues.length - 1] : 0;

      const trainSeriesData = [...trainValues, ...futureDates.map(() => null)];
      const forecastSeriesData = [
        ...trainValues.slice(0, Math.max(0, trainValues.length - 1)).map(() => null),
        lastTrainVal,
        ...futureValues,
      ];

      series = [
        {
          name: trainLabel,
          type: 'line',
          data: trainSeriesData,
          smooth: 0.15,
          showSymbol: false,
          lineStyle: {
            color: trainColor,
            width: 3.2,
            shadowColor: isDark ? 'rgba(0, 240, 255, 0.4)' : 'rgba(29, 78, 216, 0.25)',
            shadowBlur: 6,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: isDark ? 'rgba(0, 240, 255, 0.20)' : 'rgba(29, 78, 216, 0.15)' },
                { offset: 1, color: 'rgba(0, 0, 0, 0)' },
              ],
            },
          },
        },
        {
          name: `Proyeksi Lebaran 2027 (Model Terbaik)`,
          type: 'line',
          data: forecastSeriesData,
          smooth: 0.2,
          showSymbol: false,
          lineStyle: {
            color: forecastColor,
            width: 3,
            type: 'dashed',
            dashArray: [6, 4],
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: isDark ? 'rgba(16, 185, 129, 0.20)' : 'rgba(5, 150, 105, 0.15)' },
                { offset: 1, color: 'rgba(0, 0, 0, 0)' },
              ],
            },
          },
          markLine: {
            symbol: ['none', 'none'],
            label: {
              show: true,
              position: 'insideEndTop',
              fontSize: 10,
              color: '#f59e0b',
              fontWeight: 'bold',
              formatter: (p: any) => p.name,
            },
            lineStyle: { color: '#f59e0b', type: 'dotted', width: 1.5 },
            data: [
              { xAxis: '2027-03-07', name: 'Mudik H-3 (7 Mar)' },
              { xAxis: '2027-03-14', name: 'Balik H+3 (14 Mar)' },
            ],
          },
        },
      ];
    } else {
      xAxisData = futureDates;
      series = [
        {
          name: `Proyeksi Lebaran 2027 (Model Terbaik)`,
          type: 'line',
          data: futureValues,
          smooth: 0.2,
          showSymbol: false,
          lineStyle: { color: forecastColor, width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(5, 150, 105, 0.15)' },
                { offset: 1, color: 'rgba(0, 0, 0, 0)' },
              ],
            },
          },
          markLine: {
            symbol: ['none', 'none'],
            label: {
              show: true,
              position: 'insideEndTop',
              fontSize: 10,
              color: '#f59e0b',
              fontWeight: 'bold',
              formatter: (p: any) => p.name,
            },
            lineStyle: { color: '#f59e0b', type: 'dotted', width: 1.5 },
            data: [
              { xAxis: '2027-03-07', name: 'Mudik H-3 (7 Mar)' },
              { xAxis: '2027-03-14', name: 'Balik H+3 (14 Mar)' },
            ],
          },
        },
      ];
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 12 },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const date = params[0].axisValue;
          let html = `<div style="font-weight:700;font-size:12px;padding-bottom:4px;border-bottom:1px solid ${isDark ? '#334155' : '#e2e8f0'}">📅 ${date}</div>`;
          params.forEach((p: any) => {
            if (p.value !== null && p.value !== undefined) {
              html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:monospace;font-size:11px;padding:2px 0;">
                <span style="display:flex;align-items:center;gap:6px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${p.color};"></span>
                  <span style="font-family:sans-serif;color:${isDark ? '#cbd5e1' : '#475569'}">${p.seriesName}:</span>
                </span>
                <strong style="color:${isDark ? '#f8fafc' : '#0f172a'}">${formatNumber(p.value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip'}</strong>
              </div>`;
            }
          });
          return html;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: textColor, fontSize: 11 },
        itemGap: 16,
      },
      grid: {
        top: 30,
        right: 25,
        bottom: 45,
        left: 65,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { lineStyle: { color: textColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: string) => v.slice(5),
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return `${v}`;
          },
        },
        splitLine: { lineStyle: { color: splitLineColor } },
      },
      series,
    };
  }, [trainDates, trainValues, trainLabel, futureDates, futureValues, horizonView, championModel, selectedModa, selectedMetric, isDarkMode]);

  // 6. Lebaran 17-Day Bar Chart Option
  const lebaranBarChartOption = useMemo(() => {
    const rawList = forecastData?.lebaran_17days_comparison || [];
    if (!rawList || rawList.length === 0) return null;

    const xLabels = rawList.map((r: any) => r.tag || r.day_h || r.label);

    const pKey = `pbrg_${selectedModa}`;
    const aKey = `abrg_${selectedModa}`;

    let val24: number[] = [];
    let val25: number[] = [];
    let val26: number[] = [];
    let val27: number[] = [];

    if (isAllProv) {
      val24 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pbrg_2024 || r.pnp_2024 || 0) : (r.abrg_2024 || r.arm_2024 || 0);
        }
        return selectedMetric === 'pnp' ? (r[`pbrg_${selectedModa}_2024`] || r[`${selectedModa}_2024`] || 0) : (r[`abrg_${selectedModa}_2024`] || r[`arm_${selectedModa}_2024`] || 0);
      });

      val25 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pbrg_2025 || r.pnp_2025 || 0) : (r.abrg_2025 || r.arm_2025 || 0);
        }
        return selectedMetric === 'pnp' ? (r[`pbrg_${selectedModa}_2025`] || r[`${selectedModa}_2025`] || 0) : (r[`abrg_${selectedModa}_2025`] || r[`arm_${selectedModa}_2025`] || 0);
      });

      val26 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pbrg_2026 || r.pnp_2026 || 0) : (r.abrg_2026 || r.arm_2026 || 0);
        }
        return selectedMetric === 'pnp' ? (r[`pbrg_${selectedModa}_2026`] || r[`${selectedModa}_2026`] || 0) : (r[`abrg_${selectedModa}_2026`] || r[`arm_${selectedModa}_2026`] || 0);
      });

      val27 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        if (selectedModa === 'TOTAL') {
          return selectedMetric === 'pnp' ? (r.pbrg_2027 || r.pnp_2027_forecast || 0) : (r.abrg_2027 || r.arm_2027_forecast || 0);
        }
        return selectedMetric === 'pnp' ? (r[`pbrg_${selectedModa}`] || r[selectedModa] || 0) : (r[`abrg_${selectedModa}`] || r[`arm_${selectedModa}`] || 0);
      });
    } else {
      // Per-province
      const h = provData?.history_2026;
      const hDates: string[] = h?.dates || [];
      const hVals: number[] = selectedMetric === 'pnp' ? (h?.[pKey] || h?.[selectedModa] || []) : (h?.[aKey] || h?.[`arm_${selectedModa}`] || []);
      const fpList: any[] = provData?.future_points || [];

      val26 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        const idx = hDates.indexOf(r.date_2026);
        return idx >= 0 ? (Number(hVals[idx]) || 0) : 0;
      });

      val27 = rawList.map((r: any) => {
        if (!isOperating) return 0;
        const pPoint = fpList.find((p: any) => p.date === r.date_2027);
        if (!pPoint) return 0;
        return selectedMetric === 'pnp' ? (Number(pPoint[pKey]) || Number(pPoint[selectedModa]) || 0) : (Number(pPoint[aKey]) || Number(pPoint[`arm_${selectedModa}`]) || 0);
      });

      val24 = rawList.map((r: any, idx: number) => {
        if (!isOperating) return 0;
        const nat26 = selectedMetric === 'pnp' ? (Number(r.pbrg_2026) || 1) : (Number(r.abrg_2026) || 1);
        const prov26 = val26[idx];
        const ratio = nat26 > 0 ? (prov26 / nat26) : 0;
        const nat24 = selectedMetric === 'pnp' ? (Number(r.pbrg_2024) || 0) : (Number(r.abrg_2024) || 0);
        return Math.round(nat24 * ratio);
      });

      val25 = rawList.map((r: any, idx: number) => {
        if (!isOperating) return 0;
        const nat26 = selectedMetric === 'pnp' ? (Number(r.pbrg_2026) || 1) : (Number(r.abrg_2026) || 1);
        const prov26 = val26[idx];
        const ratio = nat26 > 0 ? (prov26 / nat26) : 0;
        const nat25 = selectedMetric === 'pnp' ? (Number(r.pbrg_2025) || 0) : (Number(r.abrg_2025) || 0);
        return Math.round(nat25 * ratio);
      });
    }

    const series = [
      {
        name: 'Realisasi Lebaran 2024',
        type: 'bar',
        data: val24,
        itemStyle: { color: isDarkMode ? '#64748b' : '#94a3b8', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'Realisasi Lebaran 2025',
        type: 'bar',
        data: val25,
        itemStyle: { color: isDarkMode ? '#38bdf8' : '#0284c7', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'Realisasi Lebaran 2026',
        type: 'bar',
        data: val26,
        itemStyle: { color: isDarkMode ? '#f59e0b' : '#d97706', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'Proyeksi Lebaran 2027 (Model Terbaik)',
        type: 'bar',
        data: val27,
        itemStyle: { color: isDarkMode ? '#10b981' : '#059669', borderRadius: [3, 3, 0, 0] },
      },
    ];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const r = rawList[idx];
          const tag = r?.tag || r?.day_h || '';
          const d24 = r?.date_2024 || '';
          const d25 = r?.date_2025 || '';
          const d26 = r?.date_2026 || '';
          const d27 = r?.date_2027 || '';

          let html = `<div style="font-weight:700;font-size:12px;padding-bottom:5px;margin-bottom:6px;border-bottom:1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}">
            🌙 Posko: ${tag}
          </div>`;

          params.forEach((p: any) => {
            const dateStr = p.seriesName.includes('2024') ? d24 : p.seriesName.includes('2025') ? d25 : p.seriesName.includes('2026') ? d26 : d27;
            html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;font-family:monospace;font-size:11px;padding:2px 0;">
              <span style="display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${p.color};"></span>
                <span style="font-family:sans-serif;color:${isDarkMode ? '#cbd5e1' : '#475569'}">${p.seriesName} (${dateStr}):</span>
              </span>
              <strong style="color:${isDarkMode ? '#f8fafc' : '#0f172a'}">${formatNumber(p.value)} ${selectedMetric === 'pnp' ? 'orang' : 'trip'}</strong>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 11 },
        itemGap: 16,
      },
      grid: {
        top: 25,
        left: '2%',
        right: '2%',
        bottom: 55,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#cbd5e1' } },
        axisLabel: {
          show: true,
          interval: 0,
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          fontSize: 10,
          formatter: (v: number) => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
            return `${v}`;
          },
        },
        splitLine: { lineStyle: { color: isDarkMode ? '#1e293b' : '#f1f5f9' } },
      },
      series,
    };
  }, [forecastData, isAllProv, provData, selectedModa, selectedMetric, isOperating, isDarkMode]);

  // 17-Day Comparison Summary Totals (Matching exact bar chart values)
  const lebaran17Totals = useMemo(() => {
    if (!lebaranBarChartOption) {
      return { tot24: 0, tot25: 0, tot26: 0, tot27: 0, mudikVal: 0 };
    }
    const series = lebaranBarChartOption.series || [];
    const s24 = series.find((s: any) => s.name?.includes('2024'))?.data || [];
    const s25 = series.find((s: any) => s.name?.includes('2025'))?.data || [];
    const s26 = series.find((s: any) => s.name?.includes('2026'))?.data || [];
    const s27 = series.find((s: any) => s.name?.includes('2027'))?.data || [];

    const tot24 = s24.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const tot25 = s25.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const tot26 = s26.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const tot27 = s27.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const mudikVal = s27[5] || 0; // index 5 = H-3 (7 Mar)

    return { tot24, tot25, tot26, tot27, mudikVal };
  }, [lebaranBarChartOption]);

  // 7. Comparison Table Antarmoda Lebaran
  const comparisonRows = useMemo(() => {
    const list = forecastData?.lebaran_17days_comparison || [];
    const modaKeys: ('TOTAL' | 'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT')[] = ['TOTAL', 'UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'];

    if (isAllProv) {
      return modaKeys.map((m) => {
        let base2026 = 0;
        let fc2027 = 0;
        const isOp = true;

        list.forEach((r: any) => {
          if (m === 'TOTAL') {
            base2026 += selectedMetric === 'pnp' ? (Number(r.pbrg_2026) || Number(r.pnp_2026) || 0) : (Number(r.abrg_2026) || Number(r.arm_2026) || 0);
            fc2027 += selectedMetric === 'pnp' ? (Number(r.pbrg_2027) || Number(r.pnp_2027_forecast) || 0) : (Number(r.abrg_2027) || Number(r.arm_2027_forecast) || 0);
          } else {
            base2026 += selectedMetric === 'pnp' ? (Number(r[`${m}_2026`]) || Number(r[`pbrg_${m}_2026`]) || 0) : (Number(r[`arm_${m}_2026`]) || Number(r[`abrg_${m}_2026`]) || 0);
            fc2027 += selectedMetric === 'pnp' ? (Number(r[m]) || Number(r[`pbrg_${m}`]) || 0) : (Number(r[`arm_${m}`]) || Number(r[`abrg_${m}`]) || 0);
          }
        });

        const diff = fc2027 - base2026;
        const yoy = base2026 > 0 ? (diff / base2026) * 100 : 0;
        const totalFc = list.reduce((acc: number, cur: any) => {
          return acc + (selectedMetric === 'pnp' ? (Number(cur.pbrg_2027) || 0) : (Number(cur.abrg_2027) || 0));
        }, 0);
        const share = totalFc > 0 ? (fc2027 / totalFc) * 100 : 0;

        return {
          moda: m,
          base2026,
          fc2027,
          diff,
          yoy,
          share,
          isOperating: isOp,
        };
      });
    }

    // Per-province
    const h = provData?.history_2026;
    const hDates: string[] = h?.dates || [];
    const fpList: any[] = provData?.future_points || [];

    // Calculate totalFc for provincial share
    let provTotalFc = 0;
    fpList.forEach((p: any) => {
      if (p.date >= '2027-03-02' && p.date <= '2027-03-18') {
        provTotalFc += selectedMetric === 'pnp' ? (Number(p.pbrg_TOTAL) || Number(p.TOTAL) || 0) : (Number(p.abrg_TOTAL) || Number(p.arm_TOTAL) || 0);
      }
    });

    return modaKeys.map((m) => {
      let base2026 = 0;
      let fc2027 = 0;
      const isOp = m === 'TOTAL' || activeModes.includes(m);

      if (isOp && h) {
        const pKey = `pbrg_${m}`;
        const aKey = `abrg_${m}`;
        const vals26 = selectedMetric === 'pnp' ? (h[pKey] || h[m] || []) : (h[aKey] || h[`arm_${m}`] || []);
        hDates.forEach((dStr, idx) => {
          if (dStr >= '2026-03-13' && dStr <= '2026-03-29') {
            base2026 += Number(vals26[idx]) || 0;
          }
        });

        fpList.forEach((p: any) => {
          if (p.date >= '2027-03-02' && p.date <= '2027-03-18') {
            fc2027 += selectedMetric === 'pnp' ? (Number(p[pKey]) || Number(p[m]) || 0) : (Number(p[aKey]) || Number(p[`arm_${m}`]) || 0);
          }
        });
      }

      const diff = fc2027 - base2026;
      const yoy = base2026 > 0 ? (diff / base2026) * 100 : 0;
      const share = provTotalFc > 0 ? (fc2027 / provTotalFc) * 100 : 0;

      return {
        moda: m,
        base2026,
        fc2027,
        diff,
        yoy,
        share,
        isOperating: isOp,
      };
    });
  }, [forecastData, isAllProv, activeModes, selectedMetric, provData]);

  // 8. Daily Projection Rows
  const dailyRows = useMemo(() => {
    return futurePoints.filter((p: any) => {
      if (tableRange === 'lebaran') return p.date >= '2027-03-02' && p.date <= '2027-03-18';
      if (tableRange === 'q1') return p.date >= '2027-01-01' && p.date <= '2027-03-18';
      return true;
    });
  }, [futurePoints, tableRange]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Proyeksi Mobilitas Multimoda & Posko Lebaran 2027 (1448H)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Model peramalan Machine Learning (LightGBM) & time-series untuk proyeksi arus mudik/balik Lebaran 2027 hingga 18 Maret 2027.
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
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="ALL">🇮🇩 Seluruh Provinsi (Nasional)</option>
                {ALL_PROVINCES.map((p) => (
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
                onChange={(e) => setSelectedModa(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="TOTAL">Semua Moda (Total Multimoda)</option>
                {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
                  <option key={m} value={m}>
                    {MODA_DISPLAY_NAME[m]}
                  </option>
                ))}
              </select>
            </div>

            {/* METRIC TOGGLE: PENUMPANG BERANGKAT VS ARMADA BERANGKAT */}
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setSelectedMetric('pnp')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  selectedMetric === 'pnp'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>↗</span> Penumpang Berangkat (pbrg)
              </button>
              <button
                onClick={() => setSelectedMetric('arm')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  selectedMetric === 'arm'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>🚌</span> Armada Berangkat (abrg)
              </button>
            </div>
          </div>

          {/* FILTER HORIZON: TRAIN + FORECASTING VS FORECASTING SAJA */}
          <div className="flex flex-wrap items-center rounded-lg p-0.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs">
            {isAllProv ? (
              <>
                <button
                  onClick={() => setHorizonView('all_train_plus_forecast')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    horizonView === 'all_train_plus_forecast'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
                  }`}
                >
                  📊 Data Latih 2024–2026 + Proyeksi (1.035H + 138H)
                </button>
                <button
                  onClick={() => setHorizonView('train_2026_plus_forecast')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    horizonView === 'train_2026_plus_forecast'
                      ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                      : 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
                  }`}
                >
                  📈 2026 + Proyeksi (304H + 138H)
                </button>
              </>
            ) : (
              <button
                onClick={() => setHorizonView('train_2026_plus_forecast')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  horizonView !== 'forecast_only'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                📊 2026 ({selectedProv}) + Proyeksi (304H + 138H)
              </button>
            )}

            <button
              onClick={() => setHorizonView('forecast_only')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                horizonView === 'forecast_only'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white'
              }`}
            >
              🔮 Proyeksi Saja (138H)
            </button>
          </div>
        </div>

        {/* COMPACT TRAIN - TEST - FORECASTING RANGE INFO */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Latih:</strong>{' '}
            {isAllProv
              ? '1 Jan 2024 – 12 Mar 2026 (Retrain s.d. 31 Okt 2026 • 1.035H)'
              : '1 Jan – 1 Sep 2026 (Retrain s.d. 31 Okt 2026 • 304H)'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Uji:</strong>{' '}
            {isAllProv
              ? '13 Mar – 29 Mar 2026 (17H Lebaran 2026)'
              : '2 Sep – 29 Sep 2026 (28H Holdout)'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Proyeksi:</strong> 1 Nov 2026 – 18 Mar 2027 (138H)
          </span>
        </div>
      </div>

      {/* 2. EXECUTIVE PROJECTIONS SUMMARY (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume Posko Lebaran */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Proyeksi Lebaran 2027 (17 Hari) {isAllProv ? '(Nasional)' : `(${selectedProv})`}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              2 Mar – 18 Mar
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(kpis.fc17Tot)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Rerata: <strong className="text-slate-800 dark:text-slate-200">{formatNumber(kpis.avg17)}</strong> /hari</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPercent(kpis.yoyTot)} vs 2026</span>
          </div>
        </div>

        {/* Card 2: Puncak Mudik Lebaran */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Puncak Mudik Lebaran (H-3)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Minggu, 7 Mar
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1">
            {formatNumber(kpis.mudikVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>vs 2026: <strong className="text-slate-700 dark:text-slate-300">{formatNumber(kpis.mudik26)}</strong></span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{formatPercent(kpis.yoyMudik)} YoY</span>
          </div>
        </div>

        {/* Card 3: Puncak Balik Lebaran */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Puncak Balik Lebaran (H+3)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              Minggu, 14 Mar
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatNumber(kpis.balikVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>vs 2026: <strong className="text-slate-700 dark:text-slate-300">{formatNumber(kpis.balik26)}</strong></span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{formatPercent(kpis.yoyBalik)} YoY</span>
          </div>
        </div>

        {/* Card 4: Kebutuhan Armada Puncak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Kebutuhan Armada Puncak</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Siaga Operasi
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatNumber(kpis.oppPeakVal)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {selectedMetric === 'pnp' ? 'Trip armada beroperasi' : 'Volume penumpang terangkut'}
          </div>
        </div>
      </div>

      {/* 3. TIME SERIES CHART (1.035 DAYS HISTORY + 138 DAYS PROJECTION) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Kurva Mobilitas Harian & Proyeksi Lebaran 2027 ({isAllProv ? 'Nasional' : selectedProv} • {MODA_DISPLAY_NAME[selectedModa]})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAllProv
                ? 'Transisi kontinu dari data historis riil (1 Jan 2024 – 31 Okt 2026) tersambung ke proyeksi 138 hari hingga 18 Maret 2027.'
                : `Transisi kontinu dari data historis riil 2026 (1 Jan – 31 Okt 2026 • 304H ${selectedProv}) tersambung ke proyeksi 138 hari.`}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded">
            Model: {championModel.name}
          </span>
        </div>

        <div className="pt-2">
          <EChartWrapper options={chartOptions} style={{ height: '420px', width: '100%' }} />
        </div>
      </div>

      {/* 4. 17-DAY LEBARAN HISTORICAL COMPARISON BAR CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Komparasi 17 Hari Posko: Realisasi Lebaran 2024 vs 2025 vs 2026 vs Proyeksi Lebaran 2027
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Penyesuaian hari H tiap tahunnya (2024: 10 Apr, 2025: 31 Mar, 2026: 21 Mar, 2027: 10 Mar) tersinkronisasi presisi dari H-8 s.d. H+8.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded">
              {isAllProv ? 'Nasional' : selectedProv} • {selectedMetric === 'pnp' ? 'Penumpang Berangkat' : 'Armada Berangkat'}
            </span>
            <button
              onClick={() => setIsLebaranBarMinimized(!isLebaranBarMinimized)}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            >
              {isLebaranBarMinimized ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Tampilkan</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Minimize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isLebaranBarMinimized && (
          <>
            {/* 5 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400 font-sans text-[11px] block">Total Lebaran 2024 (17H):</span>
                <div className="font-bold text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {formatNumber(lebaran17Totals.tot24)}
                </div>
                <span className="text-[10px] text-slate-400 font-sans">{isAllProv ? 'Realisasi 2024' : 'Estimasi Proporsional'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 font-mono text-xs">
                <span className="text-sky-700 dark:text-sky-400 font-sans text-[11px] block font-semibold">Total Lebaran 2025 (17H):</span>
                <div className="font-bold text-sky-800 dark:text-sky-300 text-sm mt-0.5">
                  {formatNumber(lebaran17Totals.tot25)}
                </div>
                <span className="text-[10px] text-sky-700 dark:text-sky-400 font-sans font-semibold">
                  {isAllProv ? 'Realisasi 2025 (+4,7%)' : 'Estimasi Proporsional'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 font-mono text-xs">
                <span className="text-amber-700 dark:text-amber-400 font-sans text-[11px] block font-semibold">Total Lebaran 2026 (17H):</span>
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm mt-0.5">
                  {formatNumber(lebaran17Totals.tot26)}
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-semibold">
                  Realisasi 2026 {lebaran17Totals.tot25 > 0 ? `(${formatPercent((lebaran17Totals.tot26 / lebaran17Totals.tot25 - 1) * 100)})` : ''}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 font-mono text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[11px] block font-semibold">Proyeksi Lebaran 2027 (17H):</span>
                <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm mt-0.5">
                  {formatNumber(lebaran17Totals.tot27)}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                  Model Terbaik {lebaran17Totals.tot26 > 0 ? `(${formatPercent((lebaran17Totals.tot27 / lebaran17Totals.tot26 - 1) * 100)} YoY)` : ''}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs col-span-2 sm:col-span-1">
                <span className="text-slate-400 font-sans text-[11px] block">Puncak Mudik (H-3):</span>
                <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                  7 Mar • {formatNumber(lebaran17Totals.mudikVal)}
                </div>
                <span className="text-[10px] text-rose-600/80 font-sans">Puncak Arus Mudik</span>
              </div>
            </div>

            {lebaranBarChartOption && (
              <div className="pt-2">
                <EChartWrapper options={lebaranBarChartOption} style={{ height: '360px', width: '100%' }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. MODAL SHARE & 5-MODA COMPARISON TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Komparasi Antarmoda Periode Lebaran (17 Hari: 2 – 18 Maret 2027)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan akumulasi proyeksi 2027 terhadap realisasi tahun 2026 per moda transportasi ({isAllProv ? 'Nasional' : selectedProv}).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded">
            {isAllProv ? 'Nasional' : selectedProv} • {selectedMetric === 'pnp' ? 'Penumpang' : 'Armada'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 font-semibold">Moda Transportasi</th>
                <th className="py-2.5 text-right font-semibold">Realisasi 2026</th>
                <th className="py-2.5 text-right font-semibold">Proyeksi 2027</th>
                <th className="py-2.5 text-right font-semibold">Selisih Vol</th>
                <th className="py-2.5 text-center font-semibold">Pertumbuhan YoY</th>
                <th className="py-2.5 text-right font-semibold">Pangsa (Share %)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {comparisonRows.map((row) => {
                const isTotal = row.moda === 'TOTAL';

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
                      {row.isOperating ? formatNumber(row.base2026) : '-'}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {row.isOperating ? formatNumber(row.fc2027) : '-'}
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
                Spesifikasi Model & Evaluasi Akurasi Pengujian Lebaran (Top 5 Model Terbaik)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span>🏆</span> Model Terpilih: {championModel.name || championModel.model_name || 'LightGBM Regressor (Machine Learning)'}
            </span>
            <button
              onClick={() => setShowBenchmarkModal(!showBenchmarkModal)}
              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors"
            >
              {showBenchmarkModal ? '✕ Tutup Tabel 5 Model' : '📊 Lihat Tabel 5 Model Terbaik'}
            </button>
          </div>
        </div>

        {/* COMPACT METHODOLOGY INFO */}
        <p className="text-[11px] text-slate-500 font-mono leading-relaxed pt-1">
          <strong className="text-emerald-600 dark:text-emerald-400 font-sans">Partisi & Fitur:</strong>{' '}
          {isAllProv
            ? 'Data Latih: 1 Jan 2024 – 12 Mar 2026 • Data Uji: 13 – 29 Mar 2026 (17H Posko Lebaran 2026) • Retrain: 1.035H • Fitur: 13 Fitur Terstandarisasi (incl. Tanggal Merah SKB 3 Menteri).'
            : `Data Latih: 1 Jan – 1 Sep 2026 (244H) • Data Uji: 2 – 29 Sep 2026 (28H Holdout ${selectedProv}) • Retrain: 304H • Fitur: 13 Fitur Terstandarisasi (incl. Tanggal Merah).`}
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
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block">
              RMSE (Root Mean Squared Error)
            </span>
            <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400 mt-1">
              {formatNumber(championModel.rmse)} <span className="text-xs font-normal text-slate-500">{selectedMetric === 'pnp' ? 'pnp/hari' : 'trip/hari'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              MAE & Directional Accuracy
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {formatNumber(championModel.mae)} <span className="text-xs font-normal text-slate-500">{selectedMetric === 'pnp' ? 'pnp' : 'trip'} ({formatDecimal(championModel.dir_acc || 93.8, 1)}%)</span>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE BENCHMARK TABLE */}
        {showBenchmarkModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Hasil Benchmark 5 Model Terbaik PUSDATIN Kemenhub ({isAllProv ? 'Nasional' : selectedProv} • {selectedModa === 'TOTAL' ? 'Total Multimoda' : MODA_DISPLAY_NAME[selectedModa]})
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
                    const isChamp = b.rank === 1 || (championModel?.code || championModel?.model_code) === (b.model_code || b.code) || (championModel?.name || championModel?.model_name) === (b.model_name || b.name);
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
                              Terpilih (Terbaik)
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

      {/* 7. DAILY PROJECTION TABLE (138 DAYS BREAKDOWN) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Tabel Rincian Harian Hasil Peramalan Lebaran 2027 ({isAllProv ? 'Nasional' : selectedProv} • {MODA_DISPLAY_NAME[selectedModa]})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Deret proyeksi harian tersimulasi dengan identifikasi hari puncak mudik dan balik.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">Filter Rentang:</span>
            {[
              { id: 'lebaran', label: 'Posko Lebaran (17H)' },
              { id: 'q1', label: 'Tahun Baru & Q1 2027' },
              { id: 'all', label: 'Seluruh Horizon (138H)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTableRange(f.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  tableRange === f.id
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
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
                <th className="py-2 px-3 text-right font-semibold">Hasil Proyeksi 2027</th>
                <th className="py-2 px-3 text-right font-semibold">Realisasi 2026</th>
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
                const val26 = map2026[md] || (isAllProv ? (selectedMetric === 'pnp' ? r.pbrg_TOTAL_2026 : r.abrg_TOTAL_2026) : 0) || 0;
                const yoy = val26 > 0 ? ((val / val26 - 1) * 100) : 0;

                const isWeekend = r.day_name === 'Sabtu' || r.day_name === 'Minggu';
                const isMudikPeak = r.date === '2027-03-07';
                const isBalikPeak = r.date === '2027-03-14';
                const isHariH = r.date === '2027-03-10' || r.date === '2027-03-11';

                const statusBadge = isMudikPeak ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Puncak Mudik (H-3)
                  </span>
                ) : isBalikPeak ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Puncak Balik (H+3)
                  </span>
                ) : isHariH ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Hari H Idul Fitri (1448H)
                  </span>
                ) : r.is_lebaran ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Posko Lebaran 1448H
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
                      isMudikPeak || isBalikPeak ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{r.date}</td>
                    <td className={`py-2 px-3 font-sans ${isWeekend ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                      {r.day_name}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatNumber(val)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">
                      {val26 > 0 ? formatNumber(val26) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {val26 > 0 ? (
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
