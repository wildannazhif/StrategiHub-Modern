'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, TabId } from '@/components/layout/Sidebar';
import { OverviewKpiCards } from '@/components/kpi/OverviewKpiCards';
import { TimelineWorkspace } from '@/components/workspaces/TimelineWorkspace';
import { LebaranWorkspace } from '@/components/workspaces/LebaranWorkspace';
import { LoadFactorWorkspace } from '@/components/workspaces/LoadFactorWorkspace';
import { TopHubsWorkspace } from '@/components/workspaces/TopHubsWorkspace';
import { MatrixWorkspace } from '@/components/workspaces/MatrixWorkspace';
import { SpatialMapWorkspace } from '@/components/workspaces/SpatialMapWorkspace';
import { ForecastingWorkspace } from '@/components/workspaces/ForecastingWorkspace';
import { SimulatorWorkspace } from '@/components/workspaces/SimulatorWorkspace';
import { ODMapWorkspace, ODSankeyWorkspace } from '@/components/workspaces/ODWorkspaces';
import { GlossaryWorkspace } from '@/components/workspaces/GlossaryWorkspace';
import { MobilityDataBundle } from '@/types/mobility';
import { getBasePath } from '@/lib/constants';

export default function Home() {
  const [data, setData] = useState<MobilityDataBundle | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load Data Bundle & Benchmarks
  useEffect(() => {
    async function loadData() {
      try {
        const base = getBasePath();
        const [bundleRes, benchRes] = await Promise.all([
          fetch(`${base}/data/mobility_data_bundle.json`),
          fetch(`${base}/data/benchmark_forecast_results.json`),
        ]);

        if (bundleRes.ok) {
          const bundleJson = await bundleRes.json();
          setData(bundleJson);
        }

        if (benchRes.ok) {
          const benchJson = await benchRes.json();
          setBenchmarkResults(benchJson);
        }
      } catch (err) {
        console.error('Failed to load mobility data bundle:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Sync theme class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-xl bg-sky-900 text-white flex items-center justify-center font-bold text-lg mb-4 animate-pulse">
          SH
        </div>
        <h2 className="text-base font-bold tracking-tight">Memuat StrategiHub Analytics 2026 V2...</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">Verifikasi 221.999 Baris Bersih & Model Peramalan Nataru</p>
      </div>
    );
  }

  const tabTitles: Record<TabId, string> = {
    timeline: 'Kronologi Harian (286H)',
    lebaran: 'Puncak Lebaran 2026',
    loadfactor: 'Beban Armada (Load Factor)',
    tophubs: 'Registri Simpul (Top 30)',
    matrix: 'Matriks 13 Indikator Operasional',
    spatial: 'Peta Spasial Simpul (Leaflet GIS)',
    forecasting: 'Proyeksi Nataru 2026/2027',
    simulator: 'Simulator Kapasitas Armada',
    od_map: 'Peta Rute OD Interaktif',
    sankey: 'Diagram Sankey OD Multimoda',
    glossary: 'Tentang Data & Kamus Rumus',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* HEADER */}
      <Header
        meta={data.meta}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeTabTitle={tabTitles[activeTab]}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* OVERVIEW KPI CARDS (Always visible) */}
          <OverviewKpiCards meta={data.meta} />

          {/* ACTIVE TAB CONTENT */}
          <div className="transition-all duration-150">
            {activeTab === 'timeline' && (
              <TimelineWorkspace
                timeline={data.daily_timeline}
                monthly={data.monthly_summary}
                dow={data.dow_summary}
                provinceGrowthData={data.province_monthly_data}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'lebaran' && (
              <LebaranWorkspace
                lebaranDaily={data.lebaran_daily}
                surgeSummary={data.surge_summary}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'loadfactor' && (
              <LoadFactorWorkspace
                loadFactorStats={data.load_factor_stats}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'tophubs' && (
              <TopHubsWorkspace
                topHubsPeak={data.top_hubs_peak}
                topHubsYtd={data.top_hubs_ytd}
              />
            )}

            {activeTab === 'matrix' && (
              <MatrixWorkspace
                meta={data.meta}
                monthly={data.monthly_summary}
              />
            )}

            {activeTab === 'spatial' && (
              <SpatialMapWorkspace
                nodes={data.spatial_nodes}
                provinceGeojson={data.province_geojson}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'forecasting' && (
              <ForecastingWorkspace
                forecastData={data.forecast_nataru}
                benchmarkResults={benchmarkResults}
                timeline2025={data.timeline_2025}
                timeline={data.daily_timeline}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'simulator' && (
              <SimulatorWorkspace
                simpulList={data.simpul_recommendations}
              />
            )}

            {activeTab === 'od_map' && <ODMapWorkspace />}

            {activeTab === 'sankey' && <ODSankeyWorkspace />}

            {activeTab === 'glossary' && <GlossaryWorkspace />}
          </div>
        </main>
      </div>
    </div>
  );
}
