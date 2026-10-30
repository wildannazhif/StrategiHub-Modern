'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SpatialNode } from '@/types/mobility';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal } from '@/lib/constants';
import { MapPin, Search, Layers, Info, CheckCircle2 } from 'lucide-react';

interface SpatialMapWorkspaceProps {
  nodes: SpatialNode[];
  provinceGeojson?: any;
  isDarkMode: boolean;
}

export const SpatialMapWorkspace: React.FC<SpatialMapWorkspaceProps> = ({
  nodes,
  provinceGeojson,
  isDarkMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);

  const [selectedModa, setSelectedModa] = useState<string>('ALL');
  const [selectedMetric, setSelectedMetric] = useState<'pnp' | 'arm'>('pnp');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<SpatialNode | null>(null);
  const [showChoropleth, setShowChoropleth] = useState<boolean>(true);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    let list = nodes.filter((n) => n.lat !== null && n.lon !== null);

    if (selectedModa !== 'ALL') {
      list = list.filter((n) => n.moda === selectedModa);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (n) => n.name.toLowerCase().includes(term) || n.prov.toLowerCase().includes(term)
      );
    }

    return list;
  }, [nodes, selectedModa, searchTerm]);

  // Missing coordinate nodes (for audit tab)
  const emptyCoordNodes = useMemo(() => {
    return nodes.filter((n) => n.lat === null || n.lon === null);
  }, [nodes]);

  // Leaflet initialization
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    const init = async () => {
      L = (await import('leaflet')).default;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [-2.5, 118.0],
          zoom: 5,
          minZoom: 4,
          maxZoom: 13,
        });

        const tileUrl = isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      }

      // Render markers
      const map = mapInstanceRef.current;
      const group = layerGroupRef.current;
      if (!map || !group) return;

      group.clearLayers();

      filteredNodes.forEach((node) => {
        if (node.lat === null || node.lon === null) return;

        const rawVal = Number(selectedMetric === 'pnp' ? node.pnp_tot : node.arm_tot) || 0;
        const safeVal = Math.max(0, rawVal);
        const color = (COLOR as any)[node.moda] || '#475569';

        // Radius by volume
        const radius = Math.min(18, Math.max(5, Math.sqrt(safeVal) / 45));

        const circle = L.circleMarker([node.lat, node.lon], {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        });

        circle.bindTooltip(
          `<strong>${node.name}</strong><br/>${MODA_DISPLAY_NAME[node.moda] || node.moda} • ${node.prov}<br/>Volume: ${formatNumber(safeVal)}`,
          { direction: 'top', className: 'leaflet-custom-tooltip' }
        );

        circle.on('click', () => {
          setSelectedNode(node);
        });

        group.addLayer(circle);
      });
    };

    init();
  }, [filteredNodes, selectedMetric, isDarkMode]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Peta Spasial Simpul Transportasi Nasional (Leaflet GIS)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan <strong>{filteredNodes.length} simpul berkoordinat valid</strong> dari total 1.214 simpul terdaftar di 38 provinsi.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
              ✓ {filteredNodes.length} Plot Valid
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700">
              ⚠ {emptyCoordNodes.length} Koordinat Kosong
            </span>
          </div>
        </div>

        {/* MODA SELECTOR & METRIC SCALE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['ALL', 'UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModa(m)}
                className={`px-2.5 py-1 rounded-md font-medium border ${
                  selectedModa === m
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {MODA_DISPLAY_NAME[m]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedMetric('pnp')}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  selectedMetric === 'pnp' ? 'bg-white dark:bg-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Skala Penumpang
              </button>
              <button
                onClick={() => setSelectedMetric('arm')}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  selectedMetric === 'arm' ? 'bg-white dark:bg-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                }`}
              >
                Skala Armada
              </button>
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari simpul di peta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-7 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAP & INSPECTOR CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEAFLET MAP CANVAS */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs relative">
          <div ref={mapContainerRef} style={{ height: '520px', width: '100%' }} />

          {/* MAP LEGEND */}
          <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] shadow-sm space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Legenda Moda:</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR[m] }} />
                  <span className="text-slate-600 dark:text-slate-400">{MODA_DISPLAY_NAME[m]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NODE INSPECTOR SIDEBAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Info className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Inspektur Simpul</h4>
            </div>

            {selectedNode ? (
              <div className="mt-3 space-y-3 font-sans">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Nama Simpul</span>
                  <div className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-0.5">
                    {selectedNode.name}
                  </div>
                  <div className="text-xs text-slate-500">{selectedNode.prov}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans">Moda:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{MODA_DISPLAY_NAME[selectedNode.moda]}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans">Tipe:</span>
                    <div className="text-slate-600 dark:text-slate-400 truncate">{selectedNode.tipe || '-'}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Total Penumpang:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNumber(selectedNode.pnp_tot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Total Armada:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNumber(selectedNode.arm_tot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Rasio Beban (LF):</span>
                    <span className="font-bold text-sky-700 dark:text-sky-300">
                      {formatDecimal(selectedNode.load_factor || (selectedNode.arm_tot ? selectedNode.pnp_tot / selectedNode.arm_tot : 0))} pnp/trip
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Koordinat: {selectedNode.lat?.toFixed(4)}, {selectedNode.lon?.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                Klik salah satu titik simpul di peta untuk melihat profil operasional lengkap.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Sumber: SIASATI PUSDATIN Kemenhub
          </div>
        </div>
      </div>
    </div>
  );
};
