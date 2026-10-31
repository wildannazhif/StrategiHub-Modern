'use client';

import React from 'react';
import { Users, Bus, ArrowUpRight, ArrowDownRight, RefreshCw, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export type MobilityMetric = 'pnp' | 'arm';
export type MobilityDirection = 'brg' | 'dat' | 'tot';

interface GlobalFilterBarProps {
  metric: MobilityMetric;
  direction: MobilityDirection;
  onChangeMetric: (m: MobilityMetric) => void;
  onChangeDirection: (d: MobilityDirection) => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  metric,
  direction,
  onChangeMetric,
  onChangeDirection,
}) => {
  // Label for active combination
  const getActiveLabel = () => {
    const mStr = metric === 'pnp' ? 'Penumpang' : 'Armada';
    const dStr = direction === 'brg' ? 'Keberangkatan' : direction === 'dat' ? 'Kedatangan' : 'Total (Dua Arah)';
    const icon = direction === 'brg' ? '🛫' : direction === 'dat' ? '🛬' : '🔄';
    return `${icon} ${mStr} ${dStr}`;
  };

  const isDefault = metric === 'pnp' && direction === 'brg';

  const resetToDefault = () => {
    onChangeMetric('pnp');
    onChangeDirection('brg');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* LEFT: TITLE & ACTIVE PILL */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Master Filter Analitik:</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{getActiveLabel()}</span>
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            • Sinkron otomatis lintas seluruh modul & chart
          </span>
        </div>

        {/* RIGHT: RESET BUTTON */}
        {!isDefault && (
          <button
            onClick={resetToDefault}
            className="self-start lg:self-auto inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset ke Penumpang Berangkat (Default)</span>
          </button>
        )}
      </div>

      {/* CONTROLS ROW */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* GROUP 1: METRIK (PENUMPANG VS ARMADA) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden xs:inline">
            Metrik:
          </span>
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeMetric('pnp')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                metric === 'pnp'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Penumpang</span>
            </button>
            <button
              onClick={() => onChangeMetric('arm')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                metric === 'arm'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Armada</span>
            </button>
          </div>
        </div>

        {/* GROUP 2: ARAH MOBILITAS (BERANGKAT VS DATANG VS TOTAL) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden xs:inline">
            Arah:
          </span>
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeDirection('brg')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
                direction === 'brg'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Berangkat</span>
            </button>
            <button
              onClick={() => onChangeDirection('dat')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
                direction === 'dat'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Datang</span>
            </button>
            <button
              onClick={() => onChangeDirection('tot')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
                direction === 'tot'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Total Dua Arah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
