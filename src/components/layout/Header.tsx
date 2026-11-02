'use client';

import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { MetaKpis } from '@/types/mobility';

interface HeaderProps {
  meta?: MetaKpis;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
  activeTabTitle,
}) => {
  return (
    <header className="sticky top-0 z-[1300] h-14 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors flex items-center">
      <div className="w-full flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
              isSidebarOpen
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800 shadow-2xs font-bold'
            }`}
            aria-label="Toggle Sidebar"
            title={isSidebarOpen ? 'Minimize / Sembunyikan Menu Sidebar' : 'Buka / Tampilkan Menu Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-900 text-white flex items-center justify-center font-bold text-sm shadow-sm tracking-tight">
              SH
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight block">
                StrategiHub Analytics
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block mt-0.5">
                Pusat Data dan Informasi • Kementerian Perhubungan RI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Modul Aktif:</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {activeTabTitle}
            </span>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
