'use client';

import React from 'react';
import {
  Calendar,
  Flame,
  Activity,
  Anchor,
  Table,
  MapPin,
  TrendingUp,
  Sliders,
  HelpCircle,
  Share2,
  Compass,
} from 'lucide-react';

export type TabId =
  | 'timeline'
  | 'lebaran'
  | 'loadfactor'
  | 'tophubs'
  | 'matrix'
  | 'spatial'
  | 'forecasting'
  | 'simulator'
  | 'od_map'
  | 'sankey'
  | 'glossary';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isOpen: boolean;
}

interface NavItem {
  id: TabId;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, isOpen }) => {
  const navGroups: NavGroup[] = [
    {
      groupName: 'KRONOLOGI & OPERASIONAL',
      items: [
        { id: 'timeline', label: 'Kronologi Harian (286H)', icon: <Calendar className="w-4 h-4" /> },
        { id: 'lebaran', label: 'Puncak Lebaran 2026', badge: '17H', icon: <Flame className="w-4 h-4 text-rose-500" /> },
        { id: 'loadfactor', label: 'Beban Armada (Load Factor)', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
        { id: 'tophubs', label: 'Registri Simpul (Top 30)', icon: <Anchor className="w-4 h-4 text-blue-500" /> },
        { id: 'matrix', label: 'Matriks 13 Indikator', badge: 'Rekap', icon: <Table className="w-4 h-4" /> },
      ],
    },
    {
      groupName: 'GEOSPASIAL & RUTE',
      items: [
        { id: 'spatial', label: 'Peta Spasial Simpul (GIS)', badge: '1.214', icon: <MapPin className="w-4 h-4 text-red-500" /> },
        { id: 'od_map', label: 'Peta Rute OD Interaktif', icon: <Compass className="w-4 h-4 text-sky-500" /> },
        { id: 'sankey', label: 'Diagram Sankey OD Multimoda', icon: <Share2 className="w-4 h-4 text-indigo-500" /> },
      ],
    },
    {
      groupName: 'PREDIKSI & SIMULATOR',
      items: [
        { id: 'forecasting', label: 'Proyeksi Nataru 2026/2027', badge: '100H', icon: <TrendingUp className="w-4 h-4 text-amber-500" /> },
        { id: 'simulator', label: 'Simulator Kapasitas Armada', badge: '1.010', icon: <Sliders className="w-4 h-4 text-purple-500" /> },
      ],
    },
    {
      groupName: 'METODOLOGI & RUMUS',
      items: [
        { id: 'glossary', label: 'Tentang Data & Kamus Rumus', icon: <HelpCircle className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`fixed lg:static top-[57px] bottom-0 left-0 z-20 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out flex flex-col justify-between overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
      }`}
    >
      <div className="py-4 px-3 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {group.groupName}
            </h3>
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 font-semibold shadow-xs border border-sky-100 dark:border-sky-900'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                          isActive
                            ? 'bg-sky-200/80 text-sky-900 dark:bg-sky-900 dark:text-sky-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
        <p className="font-semibold text-slate-600 dark:text-slate-400">PUSDATIN Kemenhub 2026</p>
        <p className="text-[10px]">Verified 221.999 Baris Bersih</p>
      </div>
    </aside>
  );
};
