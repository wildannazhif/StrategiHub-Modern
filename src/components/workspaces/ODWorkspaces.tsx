'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Compass } from 'lucide-react';
import { getBasePath } from '@/lib/constants';
import { SankeyWorkspace } from '@/components/workspaces/SankeyWorkspace';

interface ODWorkspaceProps {
  isDarkMode?: boolean;
}

export const ODMapWorkspace: React.FC<ODWorkspaceProps> = ({ isDarkMode = false }) => {
  const [activeEngine, setActiveEngine] = useState<'echarts' | 'canvas'>('echarts');
  const [iframeHeight, setIframeHeight] = useState<number>(1050);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const basePath = getBasePath();

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'map_resize' && typeof e.data.height === 'number') {
        setIframeHeight(Math.max(1000, e.data.height + 20));
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Sync theme
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'theme_change', isDark: isDarkMode }, '*');
      try {
        iframeRef.current.contentDocument?.documentElement.classList.toggle('dark', isDarkMode);
      } catch (e) {}
    }
  }, [isDarkMode]);

  const handleLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'theme_change', isDark: isDarkMode }, '*');
      try {
        iframeRef.current.contentDocument?.documentElement.classList.toggle('dark', isDarkMode);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Peta Interaktif Arus Rute Penerbangan Domestik Indonesia (Origin - Destination)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi busur alir perpindahan penumpang antarkota berbasis bandara keberangkatan dan kedatangan nasional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">Engine:</span>
            <button
              onClick={() => setActiveEngine('echarts')}
              className={`px-3 py-1.5 rounded-lg font-semibold border ${
                activeEngine === 'echarts'
                  ? 'bg-sky-900 text-white border-sky-900 dark:bg-sky-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              ECharts WebGL
            </button>
            <button
              onClick={() => setActiveEngine('canvas')}
              className={`px-3 py-1.5 rounded-lg font-semibold border ${
                activeEngine === 'canvas'
                  ? 'bg-sky-900 text-white border-sky-900 dark:bg-sky-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Interactive Arc
            </button>
          </div>
        </div>
      </div>

      {/* MAP IFRAME CONTAINER (Isolated stacking context) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs relative isolate z-0">
        <iframe
          ref={iframeRef}
          src={
            activeEngine === 'echarts'
              ? `${basePath}/peta_rute_od_echarts.html?dark=${isDarkMode ? '1' : '0'}`
              : `${basePath}/peta_rute_od_interaktif.html?dark=${isDarkMode ? '1' : '0'}`
          }
          onLoad={handleLoad}
          style={{ height: `${iframeHeight}px` }}
          className="w-full border-none transition-all duration-150"
          title="Peta Rute OD Udara"
          scrolling="no"
        />
      </div>
    </div>
  );
};

// Seamless Native React Sankey Workspace (Zero iframe, 100% theme harmony, executive modern UI)
export const ODSankeyWorkspace: React.FC<ODWorkspaceProps> = ({ isDarkMode = false }) => {
  return <SankeyWorkspace isDarkMode={isDarkMode} />;
};
