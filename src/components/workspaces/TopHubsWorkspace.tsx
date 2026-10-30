'use client';

import React, { useState, useMemo } from 'react';
import { TransportModa } from '@/types/mobility';
import { MODA_DISPLAY_NAME, MODA_BADGE_CLASS, formatNumber, formatDecimal } from '@/lib/constants';
import { Anchor, Search } from 'lucide-react';

interface TopHubsWorkspaceProps {
  topHubsPeak: Record<string, any[]>;
  topHubsYtd: Record<string, any[]>;
}

export const TopHubsWorkspace: React.FC<TopHubsWorkspaceProps> = ({
  topHubsPeak,
  topHubsYtd,
}) => {
  const [period, setPeriod] = useState<'peak' | 'ytd'>('peak');
  const [selectedModa, setSelectedModa] = useState<TransportModa>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentDataset = period === 'peak' ? topHubsPeak : topHubsYtd;

  const hubsList = useMemo(() => {
    let list: any[] = [];
    if (selectedModa === 'ALL') {
      const allLists: any[] = [];
      Object.entries(currentDataset).forEach(([mKey, arr]) => {
        (arr || []).forEach((item) => {
          allLists.push({ ...item, moda: mKey });
        });
      });
      // Sort by total penumpang descending
      allLists.sort((a, b) => (Number(b.pnp ?? b.pnp_tot) || 0) - (Number(a.pnp ?? a.pnp_tot) || 0));
      list = allLists.slice(0, 30).map((item, idx) => ({ ...item, rank: idx + 1 }));
    } else {
      const arr = currentDataset[selectedModa] || [];
      list = arr.map((item, idx) => ({ ...item, moda: selectedModa, rank: idx + 1 }));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((h) => {
        const name = (h.nama_prasarana || h.name || '').toLowerCase();
        const prov = (h.provinsi || h.prov || '').toLowerCase();
        return name.includes(term) || prov.includes(term);
      });
    }
    return list;
  }, [currentDataset, selectedModa, searchTerm]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Registri Simpul Transportasi Terpadat (Top 30 Hubs Nasional)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Peringkat pelabuhan, bandara, stasiun, dan terminal dengan volume pergerakan tertinggi di Indonesia.
            </p>
          </div>

          {/* PERIOD TOGGLE */}
          <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setPeriod('peak')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period === 'peak'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Puncak Lebaran 2026
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                period === 'ytd'
                  ? 'bg-sky-900 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Akumulasi Tahunan (YTD)
            </button>
          </div>
        </div>

        {/* MODA FILTER & SEARCH BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['ALL', 'UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModa(m)}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  selectedModa === m
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {MODA_DISPLAY_NAME[m]}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari simpul, kota, provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* TOP 30 TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 w-12 font-semibold text-center">Rank</th>
                <th className="py-2.5 font-semibold">Nama Simpul Prasarana</th>
                <th className="py-2.5 font-semibold">Provinsi</th>
                <th className="py-2.5 font-semibold">Moda</th>
                <th className="py-2.5 text-right font-semibold">Total Penumpang</th>
                <th className="py-2.5 text-right font-semibold">Total Armada</th>
                <th className="py-2.5 text-right font-semibold">Beban per Trip (LF)</th>
                <th className="py-2.5 text-center font-semibold">Status Kepadatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {hubsList.length > 0 ? (
                hubsList.map((h, idx) => {
                  const pnpVal = Number(h.pnp ?? h.pnp_tot) || 0;
                  const armVal = Number(h.arm ?? h.arm_tot) || 0;
                  const lf = armVal ? pnpVal / armVal : 0;
                  const hubName = h.nama_prasarana || h.name || 'Simpul';
                  const hubProv = h.provinsi || h.prov || '-';

                  const statusBadge =
                    lf > 250
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : lf > 100
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : lf > 30
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

                  const statusText =
                    lf > 250
                      ? 'Sangat Kritis'
                      : lf > 100
                      ? 'Padat Tinggi'
                      : lf > 30
                      ? 'Sibuk Terkendali'
                      : 'Stabil Normal';

                  return (
                    <tr key={`${hubName}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 text-center font-bold text-slate-400">
                        #{h.rank || idx + 1}
                      </td>
                      <td className="py-2.5 font-sans font-bold text-slate-900 dark:text-white">
                        {hubName}
                      </td>
                      <td className="py-2.5 font-sans text-slate-500">{hubProv}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                            MODA_BADGE_CLASS[h.moda] || ''
                          }`}
                        >
                          {MODA_DISPLAY_NAME[h.moda] || h.moda}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {formatNumber(pnpVal)}
                      </td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                        {formatNumber(armVal)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-sky-800 dark:text-sky-300">
                        {formatDecimal(lf)} pnp/trip
                      </td>
                      <td className="py-2.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${statusBadge}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    Tidak ada simpul yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
