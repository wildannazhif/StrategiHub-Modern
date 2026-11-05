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
import { ForecastingLebaranWorkspace } from '@/components/workspaces/ForecastingLebaranWorkspace';
import { SimulatorWorkspace } from '@/components/workspaces/SimulatorWorkspace';
import { ODMapWorkspace, ODSankeyWorkspace } from '@/components/workspaces/ODWorkspaces';
import { GlossaryWorkspace } from '@/components/workspaces/GlossaryWorkspace';
import { GlobalFilterBar, MobilityMetric, MobilityDirection } from '@/components/dashboard/GlobalFilterBar';
import { MobilityDataBundle } from '@/types/mobility';
import { getBasePath } from '@/lib/constants';

export default function Home() {
  const [data, setData] = useState<MobilityDataBundle | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to Dark Mode matching user preference

  // Master Filter State (Default: Penumpang Berangkat)
  const [globalMetric, setGlobalMetric] = useState<MobilityMetric>('pnp');
  const [globalDirection, setGlobalDirection] = useState<MobilityDirection>('brg');

  // Responsive sidebar & Theme initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
    const saved = localStorage.getItem('sh_theme');
    if (saved) {
      setIsDarkMode(saved === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

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
    timeline: 'Kronologi Harian',
    lebaran: 'Lebaran 2026',
    loadfactor: 'Load Factor',
    tophubs: 'Top 30 Simpul',
    matrix: 'Matriks Kinerja',
    spatial: 'Peta Spasial',
    od_map: 'Peta Rute OD',
    sankey: 'Diagram Sankey',
    forecasting_lebaran: 'Proyeksi Lebaran 2027',
    forecasting: 'Proyeksi Nataru 26/27',
    simulator: 'Simulator Armada',
    glossary: 'Data & Rumus',
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors overflow-hidden">
      {/* HEADER (Fixed top, highest z-index) */}
      <Header
        meta={data.meta}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        activeTabTitle={tabTitles[activeTab]}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* SIDEBAR (Independent scroll, never clashes with header) */}
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

        {/* MAIN WORKSPACE CONTENT (Independent scroll container) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">
          {/* OVERVIEW KPI CARDS (Always visible, dynamic to active Filter) */}
          <OverviewKpiCards
            meta={data.meta}
            metricsSummary={data.metrics_summary}
            metric={globalMetric}
            direction={globalDirection}
          />

          {/* FILTER UTAMA ANALITIK (Disembunyikan di Tab OD karena data OD spesifik koridor penerbangan) */}
          {activeTab !== 'od_map' && activeTab !== 'sankey' && (
            <GlobalFilterBar
              metric={globalMetric}
              direction={globalDirection}
              onChangeMetric={setGlobalMetric}
              onChangeDirection={setGlobalDirection}
            />
          )}

          {/* ACTIVE TAB CONTENT */}
          <div className="transition-all duration-150">
            {activeTab === 'timeline' && (
              <TimelineWorkspace
                timeline={data.daily_timeline}
                monthly={data.monthly_summary}
                dow={data.dow_summary}
                provinceGrowthData={data.province_monthly_data}
                isDarkMode={isDarkMode}
                globalMetric={globalMetric}
                globalDirection={globalDirection}
              />
            )}

            {activeTab === 'lebaran' && (
              <LebaranWorkspace
                lebaranDaily={data.lebaran_daily}
                surgeSummary={data.surge_summary}
                monthlySummary={data.monthly_summary}
                metricsSummary={data.metrics_summary}
                isDarkMode={isDarkMode}
                globalMetric={globalMetric}
                globalDirection={globalDirection}
              />
            )}

            {activeTab === 'loadfactor' && (
              <LoadFactorWorkspace
                loadFactorStats={data.load_factor_stats}
                monthlySummary={data.monthly_summary}
                lebaranDaily={data.lebaran_daily}
                isDarkMode={isDarkMode}
                globalMetric={globalMetric}
                globalDirection={globalDirection}
              />
            )}

            {activeTab === 'tophubs' && (
              <TopHubsWorkspace
                topHubsPeak={data.top_hubs_peak}
                topHubsYtd={data.top_hubs_ytd}
                globalMetric={globalMetric}
                globalDirection={globalDirection}
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
                isDarkMode={isDarkMode}
                globalMetric={globalMetric}
                globalDirection={globalDirection}
              />
            )}

            {activeTab === 'forecasting_lebaran' && (
              <ForecastingLebaranWorkspace
                forecastData={(data as any).forecast_lebaran}
                timeline2024={(data as any).timeline_2024 || []}
                timeline2025={data.timeline_2025}
                timeline={data.daily_timeline}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'forecasting' && (
              <ForecastingWorkspace
                forecastData={data.forecast_nataru}
                benchmarkResults={benchmarkResults}
                timeline2024={(data as any).timeline_2024 || []}
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

            {activeTab === 'od_map' && <ODMapWorkspace isDarkMode={isDarkMode} />}

            {activeTab === 'sankey' && <ODSankeyWorkspace isDarkMode={isDarkMode} />}

            {activeTab === 'glossary' && <GlossaryWorkspace />}
          </div>
        </main>
      </div>
    </div>
  );
}
