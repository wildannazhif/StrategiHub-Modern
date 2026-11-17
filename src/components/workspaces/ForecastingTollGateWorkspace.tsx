'use client';

import React, { useMemo, useState } from 'react';
import { EChartWrapper } from '@/components/charts/EChartWrapper';
import { formatDateIndo, formatDecimal, formatNumber, formatPercent } from '@/lib/constants';
import {
  TollGateData,
  TollGateForecastData,
  TollGateForecastPoint,
  TollGateHistoryPoint,
  TollGateNataruComparisonPoint,
} from '@/types/tollGateForecast';
import { Award, BarChart3, CalendarDays, CarFront, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface ForecastingTollGateWorkspaceProps {
  forecastData: TollGateForecastData;
  isDarkMode: boolean;
}

type HorizonView = 'all_history' | 'history_2026' | 'forecast_only';
type TableRange = 'nataru' | 'all';

type AggregateHistoryPoint = Pick<TollGateHistoryPoint, 'date' | 'day' | 'value' | 'is_holiday' | 'holiday_name' | 'role'>;
type AggregateForecastPoint = TollGateForecastPoint;
interface AxisTooltipParam {
  axisValue?: string;
  marker?: string;
  seriesName?: string;
  value?: number | null;
}


const GATE_COLORS: Record<number, string> = {
  24: '#2563eb',
  33: '#7c3aed',
  39: '#0891b2',
  45: '#0d9488',
  60: '#16a34a',
  63: '#65a30d',
  66: '#d97706',
  69: '#e11d48',
};

function aggregateHistory(gates: TollGateData[]): AggregateHistoryPoint[] {
  const byDate = new Map<string, AggregateHistoryPoint>();
  gates.forEach((gate) => {
    gate.history.forEach((point) => {
      const current = byDate.get(point.date);
      if (current) {
        current.value += point.value;
        current.is_holiday = current.is_holiday || point.is_holiday;
      } else {
        byDate.set(point.date, {
          date: point.date,
          day: point.day,
          value: point.value,
          is_holiday: point.is_holiday,
          holiday_name: point.holiday_name,
          role: point.role,
        });
      }
    });
  });
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateForecast(gates: TollGateData[]): AggregateForecastPoint[] {
  const byDate = new Map<string, AggregateForecastPoint>();
  gates.forEach((gate) => {
    gate.forecast.forEach((point) => {
      const current = byDate.get(point.date);
      if (current) {
        current.value += point.value;
        current.is_holiday = current.is_holiday || point.is_holiday;
        current.is_long_weekend = current.is_long_weekend || point.is_long_weekend;
      } else {
        byDate.set(point.date, { ...point });
      }
    });
  });
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateNataruComparison(gates: TollGateData[]): TollGateNataruComparisonPoint[] {
  const template = gates[0]?.nataru_daily_comparison || [];
  return template.map((point, index) => {
    const rows = gates.map((gate) => gate.nataru_daily_comparison[index]).filter(Boolean);
    const actual2024 = rows.reduce((sum, row) => sum + row.actual_2024, 0);
    const actual2025 = rows.reduce((sum, row) => sum + row.actual_2025, 0);
    const ensemble = rows.reduce((sum, row) => sum + row.ensemble, 0);
    return {
      ...point,
      actual_2024: actual2024,
      actual_2025: actual2025,
      yoy_pct: actual2024 > 0 ? ((actual2025 / actual2024) - 1) * 100 : 0,
      model_16: rows.reduce((sum, row) => sum + row.model_16, 0),
      model_16_ape: 0,
      model_15: rows.reduce((sum, row) => sum + row.model_15, 0),
      model_15_ape: 0,
      ensemble,
      ensemble_ape: actual2025 > 0 ? (Math.abs(ensemble - actual2025) / actual2025) * 100 : 0,
      best_model: 'Model 12% (Ensemble)',
    };
  });
}

export const ForecastingTollGateWorkspace: React.FC<ForecastingTollGateWorkspaceProps> = ({
  forecastData,
  isDarkMode,
}) => {
  const [selectedGateId, setSelectedGateId] = useState<string>('ALL');
  const [horizonView, setHorizonView] = useState<HorizonView>('all_history');
  const [tableRange, setTableRange] = useState<TableRange>('nataru');
  const [showBenchmarkTable, setShowBenchmarkTable] = useState<boolean>(false);
  const [isComparisonMinimized, setIsComparisonMinimized] = useState<boolean>(false);

  const selectedGate = useMemo(
    () => forecastData.gates.find((gate) => String(gate.id) === selectedGateId) || null,
    [forecastData.gates, selectedGateId],
  );
  const activeGates = useMemo(
    () => selectedGate ? [selectedGate] : forecastData.gates,
    [forecastData.gates, selectedGate],
  );
  const scopeLabel = selectedGate ? selectedGate.name : 'Total 8 Gerbang Tol';
  const directionLabel = selectedGate ? selectedGate.direction : 'MASUK + KELUAR';

  const history = useMemo(
    () => selectedGate ? selectedGate.history : aggregateHistory(activeGates),
    [activeGates, selectedGate],
  );
  const forecast = useMemo(
    () => selectedGate ? selectedGate.forecast : aggregateForecast(activeGates),
    [activeGates, selectedGate],
  );
  const nataruComparison = useMemo(
    () => selectedGate ? selectedGate.nataru_daily_comparison : aggregateNataruComparison(activeGates),
    [activeGates, selectedGate],
  );

  const performance = selectedGate?.performance || {
    mape: forecastData.meta.mape,
    accuracy: forecastData.meta.accuracy,
    status: 'SANGAT OPTIMAL',
    note: 'Model ensemble terbaik untuk agregat delapan gerbang tol.',
  };

  const audit = useMemo(() => {
    const totalDays = activeGates.reduce((sum, gate) => sum + gate.audit.total_days, 0);
    const originalValid = activeGates.reduce((sum, gate) => sum + gate.audit.original_valid, 0);
    return {
      totalDays,
      originalValid,
      localImputation: activeGates.reduce((sum, gate) => sum + gate.audit.local_imputation, 0),
      monthlyImputation: activeGates.reduce((sum, gate) => sum + gate.audit.monthly_imputation, 0),
      oneWayValid: activeGates.reduce((sum, gate) => sum + gate.audit.one_way_valid, 0),
      originalPct: totalDays > 0 ? (originalValid / totalDays) * 100 : 0,
    };
  }, [activeGates]);

  const kpis = useMemo(() => {
    const totalForecast = forecast.reduce((sum, point) => sum + point.value, 0);
    const nataruPoints = forecast.filter(
      (point) => point.date >= forecastData.meta.nataru_start && point.date <= forecastData.meta.nataru_end,
    );
    const nataruTotal = nataruPoints.reduce((sum, point) => sum + point.value, 0);
    const actual2025 = activeGates.reduce((sum, gate) => sum + gate.nataru.actual_2025, 0);
    const peak = forecast.reduce<TollGateForecastPoint | null>(
      (current, point) => !current || point.value > current.value ? point : current,
      null,
    );
    return {
      totalForecast,
      average: forecast.length > 0 ? totalForecast / forecast.length : 0,
      nataruTotal,
      nataruAverage: nataruPoints.length > 0 ? nataruTotal / nataruPoints.length : 0,
      actual2025,
      nataruYoy: actual2025 > 0 ? ((nataruTotal / actual2025) - 1) * 100 : 0,
      peak,
    };
  }, [activeGates, forecast, forecastData.meta.nataru_end, forecastData.meta.nataru_start]);

  const chartHistory = useMemo(() => {
    if (horizonView === 'forecast_only') return [];
    if (horizonView === 'history_2026') return history.filter((point) => point.date >= '2026-01-01');
    return history;
  }, [history, horizonView]);

  const timeSeriesOptions = useMemo(() => {
    const historicalDates = chartHistory.map((point) => point.date);
    const forecastDates = forecast.map((point) => point.date);
    const dates = [...historicalDates, ...forecastDates];
    const historicalValues: Array<number | null> = chartHistory.map((point) => point.value);
    const forecastValues: Array<number | null> = [];

    if (chartHistory.length > 0) {
      forecastValues.push(...Array(Math.max(chartHistory.length - 1, 0)).fill(null));
      forecastValues.push(chartHistory[chartHistory.length - 1].value);
    }
    forecastValues.push(...forecast.map((point) => point.value));
    historicalValues.push(...Array(forecastDates.length).fill(null));

    const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
    const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';
    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 11 },
        formatter: (params: AxisTooltipParam[]) => {
          const date = params[0]?.axisValue || '';
          const rows = params
            .filter((item) => item.value !== null && item.value !== undefined)
            .map((item) => `${item.marker} ${item.seriesName}: <strong>${formatNumber(item.value)}</strong> kendaraan`)
            .join('<br/>');
          return `<strong>${formatDateIndo(date)}</strong><br/>${rows}`;
        },
      },
      legend: { top: 0, right: 0, textStyle: { color: labelColor, fontSize: 10 } },
      grid: { top: 48, left: 62, right: 24, bottom: 62 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: { color: labelColor, fontSize: 9, hideOverlap: true },
        axisLine: { lineStyle: { color: gridColor } },
      },
      yAxis: {
        type: 'value',
        name: 'Kendaraan / hari',
        nameTextStyle: { color: labelColor, fontSize: 10 },
        axisLabel: { color: labelColor, fontSize: 9, formatter: (value: number) => formatNumber(value) },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
      },
      dataZoom: [
        { type: 'inside', start: horizonView === 'all_history' ? 72 : 0, end: 100 },
        { type: 'slider', height: 18, bottom: 12, borderColor: gridColor, textStyle: { color: labelColor } },
      ],
      series: [
        {
          name: 'Data Historis Bersih',
          type: 'line',
          data: historicalValues,
          showSymbol: false,
          smooth: 0.12,
          lineStyle: { color: isDarkMode ? '#38bdf8' : '#0284c7', width: 1.7 },
          itemStyle: { color: isDarkMode ? '#38bdf8' : '#0284c7' },
        },
        {
          name: 'Proyeksi Gerbang Tol 2027',
          type: 'line',
          data: forecastValues,
          showSymbol: false,
          smooth: 0.12,
          lineStyle: { color: isDarkMode ? '#a78bfa' : '#7c3aed', width: 2.4 },
          areaStyle: { color: isDarkMode ? 'rgba(167,139,250,0.10)' : 'rgba(124,58,237,0.08)' },
          itemStyle: { color: isDarkMode ? '#a78bfa' : '#7c3aed' },
          markLine: {
            symbol: 'none',
            label: { formatter: 'Mulai Proyeksi', color: labelColor, fontSize: 9 },
            lineStyle: { color: '#a855f7', type: 'dashed' },
            data: [{ xAxis: forecastData.meta.forecast_start }],
          },
          markArea: {
            silent: true,
            itemStyle: { color: isDarkMode ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.10)' },
            label: { color: '#d97706', fontSize: 9, formatter: 'Posko Nataru 21H' },
            data: [[{ xAxis: forecastData.meta.nataru_start }, { xAxis: forecastData.meta.nataru_end }]],
          },
        },
      ],
    };
  }, [chartHistory, forecast, forecastData.meta.forecast_start, forecastData.meta.nataru_end, forecastData.meta.nataru_start, horizonView, isDarkMode]);

  const nataruBarOptions = useMemo(() => {
    const futureNataru = forecast.filter(
      (point) => point.date >= forecastData.meta.nataru_start && point.date <= forecastData.meta.nataru_end,
    );
    const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
    const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';
    return {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 11 },
        valueFormatter: (value: number) => `${formatNumber(value)} kendaraan`,
      },
      legend: { top: 0, textStyle: { color: labelColor, fontSize: 10 } },
      grid: { top: 48, left: 60, right: 20, bottom: 40 },
      xAxis: {
        type: 'category',
        data: nataruComparison.map((point) => point.label),
        axisLabel: { color: labelColor, fontSize: 9, interval: 0, rotate: 35 },
        axisLine: { lineStyle: { color: gridColor } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: labelColor, fontSize: 9, formatter: (value: number) => formatNumber(value) },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
      },
      series: [
        {
          name: 'Realisasi Nataru 2024/2025',
          type: 'bar',
          data: nataruComparison.map((point) => point.actual_2024),
          itemStyle: { color: '#64748b', borderRadius: [2, 2, 0, 0] },
        },
        {
          name: 'Realisasi Nataru 2025/2026',
          type: 'bar',
          data: nataruComparison.map((point) => point.actual_2025),
          itemStyle: { color: '#0ea5e9', borderRadius: [2, 2, 0, 0] },
        },
        {
          name: 'Proyeksi Nataru 2026/2027',
          type: 'bar',
          data: futureNataru.map((point) => point.value),
          itemStyle: { color: '#7c3aed', borderRadius: [2, 2, 0, 0] },
        },
      ],
    };
  }, [forecast, forecastData.meta.nataru_end, forecastData.meta.nataru_start, isDarkMode, nataruComparison]);

  const gateComparisonRows = useMemo(() => forecastData.gates.map((gate) => ({
    ...gate,
    nataruYoy: gate.nataru.actual_2025 > 0
      ? ((gate.summary.nataru_total / gate.nataru.actual_2025) - 1) * 100
      : 0,
  })), [forecastData.gates]);

  const dailyRows = useMemo(() => tableRange === 'nataru'
    ? forecast.filter((point) => point.date >= forecastData.meta.nataru_start && point.date <= forecastData.meta.nataru_end)
    : forecast,
  [forecast, forecastData.meta.nataru_end, forecastData.meta.nataru_start, tableRange]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <CarFront className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Proyeksi Gerbang Tol 2027</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Model LightGBM Tuned Ensemble untuk proyeksi volume kendaraan harian delapan gerbang tol hingga 10 Februari 2027.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Gerbang Tol:</span>
              <select
                value={selectedGateId}
                onChange={(event) => setSelectedGateId(event.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-2xs"
              >
                <option value="ALL">Semua Gerbang (Total 8 GT)</option>
                {forecastData.gates.map((gate) => (
                  <option key={gate.id} value={gate.id}>{gate.name} • {gate.direction}</option>
                ))}
              </select>
            </div>
            <span className="px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
              Arah: {directionLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center rounded-lg p-0.5 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 text-xs">
            {[
              { id: 'all_history', label: 'Data 2024–2026 + Proyeksi' },
              { id: 'history_2026', label: '2026 + Proyeksi' },
              { id: 'forecast_only', label: 'Proyeksi Saja (87H)' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setHorizonView(option.id as HorizonView)}
                className={`px-3 py-1.5 rounded-md transition-colors ${horizonView === option.id
                  ? 'bg-violet-600 text-white shadow-2xs font-semibold'
                  : 'text-violet-800 dark:text-violet-300 hover:text-violet-950 dark:hover:text-white'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Historis:</strong> 1 Jan 2024 – 15 Nov 2026 (1.050H/GT)
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Data Uji:</strong> 17 Des 2025 – 6 Jan 2026 (21H • 168 observasi)
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <strong className="text-slate-700 dark:text-slate-300 font-sans">Proyeksi:</strong> 16 Nov 2026 – 10 Feb 2027 (87H • 696 observasi)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Proyeksi 87 Hari</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">{scopeLabel}</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{formatNumber(kpis.totalForecast)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Rerata <strong className="text-slate-800 dark:text-slate-200">{formatNumber(kpis.average)}</strong> kendaraan/hari</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Proyeksi Posko Nataru 21 Hari</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">17 Des – 6 Jan</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1">{formatNumber(kpis.nataruTotal)}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Rerata {formatNumber(kpis.nataruAverage)}/hari</span>
            <span className={kpis.nataruYoy >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>{formatPercent(kpis.nataruYoy)} vs 2025</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Puncak Volume Proyeksi</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">Siaga Operasi</span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">{formatNumber(kpis.peak?.value)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{kpis.peak ? `${kpis.peak.day}, ${formatDateIndo(kpis.peak.date)}` : '-'}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Kualitas Data Sensor</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Audit {formatNumber(audit.totalDays)} baris</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">{formatDecimal(audit.originalPct, 2)}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{formatNumber(audit.originalValid)} data asli sensor • {formatNumber(audit.localImputation + audit.monthlyImputation)} imputasi</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Kurva Volume Harian & Proyeksi Gerbang Tol 2027 ({scopeLabel})</h4>
            <p className="text-xs text-slate-500 mt-0.5">Transisi kontinu data historis bersih menuju proyeksi 87 hari LightGBM Tuned Ensemble.</p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2.5 py-1 rounded">Model: {forecastData.meta.model_name}</span>
        </div>
        <div className="pt-2"><EChartWrapper options={timeSeriesOptions} style={{ height: '420px', width: '100%' }} /></div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Komparasi Posko Nataru: Realisasi 2024/2025, Realisasi 2025/2026, dan Proyeksi 2026/2027</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Perbandingan 21 hari operasional pada {scopeLabel} (Historis 2 Tahun vs Proyeksi Model 12% Ensemble).</p>
          </div>
          <button
            onClick={() => setIsComparisonMinimized((value) => !value)}
            className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
          >
            {isComparisonMinimized ? <><ChevronDown className="w-3.5 h-3.5" /> Tampilkan</> : <><ChevronUp className="w-3.5 h-3.5" /> Minimize</>}
          </button>
        </div>
        {!isComparisonMinimized && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-400 font-sans text-[11px] block">Realisasi Nataru 2024/2025:</span>
                <div className="font-bold text-slate-600 dark:text-slate-300 text-sm mt-0.5">{formatNumber(nataruComparison.reduce((sum, point) => sum + point.actual_2024, 0))}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 font-mono text-xs">
                <span className="text-sky-700 dark:text-sky-400 font-sans text-[11px] block font-semibold">Realisasi Nataru 2025/2026:</span>
                <div className="font-bold text-sky-800 dark:text-sky-300 text-sm mt-0.5">{formatNumber(kpis.actual2025)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 font-mono text-xs">
                <span className="text-violet-700 dark:text-violet-400 font-sans text-[11px] block font-semibold">Proyeksi Nataru 2026/2027:</span>
                <div className="font-bold text-violet-800 dark:text-violet-300 text-sm mt-0.5">{formatNumber(kpis.nataruTotal)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 font-mono text-xs">
                <span className="text-amber-700 dark:text-amber-400 font-sans text-[11px] block font-semibold">Buffer Kapasitas Operasional:</span>
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm mt-0.5">+{formatDecimal(forecastData.meta.capacity_buffer_recommendation_pct, 0)}%</div>
              </div>
            </div>
            <div className="pt-2"><EChartWrapper options={nataruBarOptions} style={{ height: '360px', width: '100%' }} /></div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Tabel Komparasi Delapan Gerbang Tol</h4>
            <p className="text-xs text-slate-500 mt-0.5">Volume Posko Nataru, akurasi model, arah pergerakan, dan kualitas sensor per gerbang.</p>
          </div>
          <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2.5 py-1 rounded">21 Hari Posko</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5">Gerbang Tol</th>
                <th className="py-2.5 text-center">Arah</th>
                <th className="py-2.5 text-right">Realisasi 2025/26</th>
                <th className="py-2.5 text-right">Proyeksi 2026/27</th>
                <th className="py-2.5 text-center">YoY</th>
                <th className="py-2.5 text-center">MAPE</th>
                <th className="py-2.5 text-center">Data Asli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {gateComparisonRows.map((gate) => (
                <tr key={gate.id} className={`${selectedGateId === String(gate.id) ? 'bg-violet-50/70 dark:bg-violet-950/25' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <td className="py-2.5 font-sans font-semibold text-slate-900 dark:text-white">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: GATE_COLORS[gate.id] }} />
                    {gate.name}
                  </td>
                  <td className="py-2.5 text-center text-slate-500">{gate.direction}</td>
                  <td className="py-2.5 text-right text-slate-500">{formatNumber(gate.nataru.actual_2025)}</td>
                  <td className="py-2.5 text-right font-bold text-violet-700 dark:text-violet-400">{formatNumber(gate.summary.nataru_total)}</td>
                  <td className="py-2.5 text-center font-bold"><span className={gate.nataruYoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatPercent(gate.nataruYoy)}</span></td>
                  <td className="py-2.5 text-center font-bold text-amber-600">{formatDecimal(gate.performance.mape, 2)}%</td>
                  <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">{formatDecimal(gate.audit.original_sensor_pct, 2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Spesifikasi Model & Evaluasi Akurasi Pengujian</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">Model Terpilih: Top-3 Tuned Ensemble</span>
            <button
              onClick={() => setShowBenchmarkTable((value) => !value)}
              className="px-2.5 py-1 rounded bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold text-xs hover:bg-violet-100 transition-colors"
            >
              {showBenchmarkTable ? 'Tutup Tabel Model' : 'Lihat Tabel 12 Model'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
          <strong className="text-violet-600 dark:text-violet-400 font-sans">Partisi & Fitur:</strong>{' '}
          Data latih 1 Jan 2024 – 16 Des 2025 ({formatNumber(forecastData.meta.training_rows)} observasi) • Data uji 17 Des 2025 – 6 Jan 2026 ({formatNumber(forecastData.meta.testing_rows)} observasi) • 13 fitur kalender, lag, rolling statistics, pertumbuhan YoY, dan fase Nataru. Imputasi memakai median hari sejenis lokal, bulanan, lalu global tanpa mengubah tiga nol valid skema one-way.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">MAPE (Mean Absolute % Error)</span>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">{formatDecimal(performance.mape, 2)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block">R² Score (Kualitas Fit Nasional)</span>
            <div className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400 mt-1">{formatDecimal(forecastData.meta.r2, 4)}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">MAE & Tingkat Akurasi</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{formatNumber(forecastData.meta.mae)} <span className="text-xs font-normal text-slate-500">kend/hari ({formatDecimal(performance.accuracy, 2)}%)</span></div>
          </div>
        </div>

        {showBenchmarkTable && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-violet-200 dark:border-violet-800 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Hasil Hyperparameter Tuning LightGBM ({scopeLabel})</h5>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-center">Rank</th>
                    <th className="py-2 px-3 font-sans">Strategi Model</th>
                    <th className="py-2 px-3 text-right">MAPE</th>
                    <th className="py-2 px-3 text-right">Akurasi</th>
                    <th className="py-2 px-3 text-right">MAE</th>
                    <th className="py-2 px-3 text-right">R²</th>
                    <th className="py-2 px-3 font-sans">Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {forecastData.benchmarks.map((model) => (
                    <tr key={model.rank} className={model.rank === 1 ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold border-l-4 border-l-emerald-600' : 'hover:bg-white dark:hover:bg-slate-900/50'}>
                      <td className="py-2 px-3 text-center">{model.rank}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">{model.rank === 1 ? '🏆 ' : ''}{model.name}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">{formatDecimal(model.mape, 2)}%</td>
                      <td className="py-2 px-3 text-right">{formatDecimal(model.accuracy, 2)}%</td>
                      <td className="py-2 px-3 text-right">{formatNumber(model.mae)}</td>
                      <td className="py-2 px-3 text-right">{formatDecimal(model.r2, 4)}</td>
                      <td className="py-2 px-3 font-sans text-slate-500">{model.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Tabel Rincian Harian Proyeksi Gerbang Tol 2027 ({scopeLabel})</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Deret proyeksi harian dengan penanda tanggal merah, long weekend, dan fase operasional lalu lintas.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">Filter Rentang:</span>
            {[
              { id: 'nataru', label: 'Posko Nataru (21H)' },
              { id: 'all', label: 'Seluruh Horizon (87H)' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTableRange(option.id as TableRange)}
                className={`px-2.5 py-1 rounded-md font-medium border ${tableRange === option.id
                  ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Hari</th>
                <th className="py-2 px-3 text-right">Proyeksi Kendaraan</th>
                <th className="py-2 px-3 text-center">Tanggal Merah</th>
                <th className="py-2 px-3">Fase Operasional</th>
                <th className="py-2 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyRows.map((point) => (
                <tr key={point.date} className={`${point.is_holiday || point.is_long_weekend ? 'bg-amber-50/40 dark:bg-amber-950/15' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{point.date}</td>
                  <td className={`py-2 px-3 font-sans ${point.day === 'Sabtu' || point.day === 'Minggu' ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{point.day}</td>
                  <td className="py-2 px-3 text-right font-bold text-violet-700 dark:text-violet-400">{formatNumber(point.value)}</td>
                  <td className="py-2 px-3 text-center font-sans">
                    {point.is_holiday ? <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Libur Nasional</span>
                      : point.is_long_weekend ? <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Long Weekend</span>
                      : <span className="text-slate-400 text-[10px]">Reguler</span>}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-300">{point.phase}</td>
                  <td className="py-2 px-3 font-sans text-slate-500">{point.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
