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
  PanelLeftClose,
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
  onClose?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, isOpen, onClose }) => {
  const navGroups: NavGroup[] = [
    {
      groupName: 'OPERASIONAL',
      items: [
        { id: 'timeline', label: 'Kronologi Harian', icon: <Calendar className="w-4 h-4 text-sky-500" /> },
        { id: 'lebaran', label: 'Lebaran 2026', icon: <Flame className="w-4 h-4 text-rose-500" /> },
        { id: 'loadfactor', label: 'Load Factor', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
        { id: 'tophubs', label: 'Top 30 Simpul', icon: <Anchor className="w-4 h-4 text-blue-500" /> },
        { id: 'matrix', label: 'Matriks Kinerja', icon: <Table className="w-4 h-4 text-amber-500" /> },
      ],
    },
    {
      groupName: 'GEOSPASIAL',
      items: [
        { id: 'spatial', label: 'Peta Spasial', icon: <MapPin className="w-4 h-4 text-red-500" /> },
        { id: 'od_map', label: 'Peta Rute OD', icon: <Compass className="w-4 h-4 text-sky-500" /> },
        { id: 'sankey', label: 'Diagram Sankey', icon: <Share2 className="w-4 h-4 text-indigo-500" /> },
      ],
    },
    {
      groupName: 'PREDIKSI & SIMULASI',
      items: [
        { id: 'forecasting', label: 'Proyeksi Nataru 26/27', icon: <TrendingUp className="w-4 h-4 text-amber-500" /> },
        { id: 'simulator', label: 'Simulator Armada', icon: <Sliders className="w-4 h-4 text-purple-500" /> },
      ],
    },
    {
      groupName: 'METODOLOGI',
      items: [
        { id: 'glossary', label: 'Data & Rumus', icon: <HelpCircle className="w-4 h-4 text-slate-400" /> },
      ],
    },
  ];

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY (Closes sidebar on click, sits above any map) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-14 bg-slate-950/70 backdrop-blur-xs z-[1150] lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR DRAWER (z-[1200] so it ALWAYS sits on top of Leaflet maps and canvas, but below Header z-[1300]) */}
      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 z-[1200] h-[calc(100vh-3.5rem)] lg:h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto overflow-x-hidden shadow-2xl lg:shadow-none shrink-0 ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : '-translate-x-full w-64 lg:w-0 lg:translate-x-0 lg:opacity-0 lg:border-r-0 pointer-events-none'
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

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-400">PUSDATIN Kemenhub 2026</p>
            <p className="text-[10px]">Data Terverifikasi 235.219 Baris</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title="Minimize / Sembunyikan Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-[10px]">Minimize</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
