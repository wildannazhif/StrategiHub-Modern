'use client';

import React, { useState } from 'react';
import { Compass, Share2 } from 'lucide-react';
import { getBasePath } from '@/lib/constants';

export const ODMapWorkspace: React.FC = () => {
  const [activeEngine, setActiveEngine] = useState<'echarts' | 'canvas'>('echarts');
  const basePath = getBasePath();

  return (
    <div className="space-y-4">
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs bg-slate-950">
        <iframe
          src={activeEngine === 'echarts' ? `${basePath}/peta_rute_od_echarts.html` : `${basePath}/peta_rute_od_interaktif.html`}
          className="w-full h-[680px] border-none"
          title="Peta Rute OD Udara"
        />
      </div>
    </div>
  );
};

export const ODSankeyWorkspace: React.FC = () => {
  const basePath = getBasePath();

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Diagram Sankey Multimoda & Aliran Arus Penumpang Antarpulau
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi proporsi perpindahan penumpang antarmoda dan koridor utama pergerakan nasional.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <iframe
          src={`${basePath}/sankey_diagram_od.html`}
          className="w-full h-[680px] border-none"
          title="Diagram Sankey OD Multimoda"
        />
      </div>
    </div>
  );
};
