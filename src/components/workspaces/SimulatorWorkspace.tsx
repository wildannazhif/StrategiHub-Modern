'use client';

import React, { useState, useMemo } from 'react';
import { SimpulRecommendation, TransportModa } from '@/types/mobility';
import { MODA_DISPLAY_NAME, MODA_BADGE_CLASS, formatNumber, formatDecimal } from '@/lib/constants';
import { Sliders, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SimulatorWorkspaceProps {
  simpulList: SimpulRecommendation[];
}

export const SimulatorWorkspace: React.FC<SimulatorWorkspaceProps> = ({ simpulList }) => {
  const [selectedModa, setSelectedModa] = useState<TransportModa>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'pctTambah' | 'pnpPuncak' | 'addArm' | 'loadRatio'>('pnpPuncak');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    let list = [...simpulList];

    if (selectedModa !== 'ALL') {
      list = list.filter((s) => s.moda === selectedModa);
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter((s) => s.statusText === selectedStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.prov.toLowerCase().includes(term)
      );
    }

    // Sort
    list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

    return list;
  }, [simpulList, selectedModa, selectedStatus, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Rekomendasi Kebutuhan Penambahan Armada Prasarana & Simpul Nasional
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menghitung rekomendasi penambahan armada angkutan agar rasio beban hari puncak setara dengan hari normal (Total: <strong>1.010 Simpul</strong>).
            </p>
          </div>
        </div>

        {/* CONTROLS: MODA, STATUS, SEARCH, SORT */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['ALL', 'UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedModa(m);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  selectedModa === m
                    ? 'bg-purple-900 text-white border-purple-900 dark:bg-purple-700 font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {MODA_DISPLAY_NAME[m]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Status Kepadatan</option>
              <option value="Sangat Kritis">🔴 Sangat Kritis (95-99%)</option>
              <option value="Padat Tinggi">🟠 Padat Tinggi (85-94%)</option>
              <option value="Sibuk Terkendali">🟡 Sibuk Terkendali (65-84%)</option>
              <option value="Stabil/Normal">🟢 Stabil/Normal (&lt;65%)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="pnpPuncak">Urut: Volume Puncak (Tertinggi)</option>
              <option value="pctTambah">Urut: % Tambah Armada (Tertinggi)</option>
              <option value="addArm">Urut: Jumlah Trip Tambahan</option>
              <option value="loadRatio">Urut: Rasio Kenaikan Beban</option>
            </select>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari simpul atau provinsi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE (Cleaned: No Kapal Feri / Pelni text & No Rekomendasi Aksi Lapangan column) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan {(currentPage - 1) * pageSize + 1} –{' '}
            {Math.min(currentPage * pageSize, filteredList.length)} dari {filteredList.length} simpul
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5">Simpul & Wilayah</th>
                <th className="py-2.5">Moda Transportasi</th>
                <th className="py-2.5 text-right">Beban Hari Normal</th>
                <th className="py-2.5 text-right">Beban Hari Puncak</th>
                <th className="py-2.5 text-right text-purple-700 dark:text-purple-300">Simulasi % Tambah</th>
                <th className="py-2.5 text-right">Kebutuhan Armada Tambahan</th>
                <th className="py-2.5 text-right">Total Armada Operasi</th>
                <th className="py-2.5 text-center">Status Kepadatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {paginatedList.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                    <div className="text-[10px] text-slate-400">{row.prov}</div>
                  </td>
                  <td className="py-2.5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${MODA_BADGE_CLASS[row.moda] || ''}`}>
                      {row.modaLabel || row.moda}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                    {formatDecimal(row.lfBiasa)} <span className="text-[10px] font-sans">pnp/trip</span>
                    <div className="text-[10px] text-slate-400">({formatNumber(row.armBiasa)} trip)</div>
                  </td>
                  <td className="py-2.5 text-right text-slate-800 dark:text-slate-200 font-semibold">
                    {formatDecimal(row.lfPuncak)} <span className="text-[10px] font-sans">pnp/trip</span>
                    <div className="text-[10px] text-slate-400">({formatNumber(row.pnpPuncak)} pnp)</div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-purple-700 dark:text-purple-400 text-sm">
                    +{row.pctTambah}%
                  </td>
                  <td className="py-2.5 text-right font-bold text-indigo-700 dark:text-indigo-400">
                    +{formatNumber(row.addArm)} <span className="text-[10px] font-normal text-slate-400">trip/hari</span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(row.totalArm)} <span className="text-[10px] font-normal text-slate-400">trip/hari</span>
                  </td>
                  <td className="py-2.5 text-center font-sans">
                    <span className={`px-2.5 py-0.5 rounded font-semibold text-[10px] ${row.statusBadge}`}>
                      {row.statusText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
