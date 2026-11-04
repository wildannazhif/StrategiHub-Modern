'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { COLOR, MODA_DISPLAY_NAME, formatNumber, formatDecimal, BPS_PROVINCE_POPULATION } from '@/lib/constants';
import { MapPin, Search, Layers, Flame, Info, Filter, Users } from 'lucide-react';
import { SpatialNode } from '@/types/mobility';
import provincesGeoJson from '@/data/indonesia_38_provinces.json';

function normalizeProvinceName(p: string): string {
  if (!p) return '';
  p = p.trim();
  if (p === 'D.I Aceh' || p === 'DI Aceh' || p === 'Aceh') return 'Aceh';
  if (
    p === 'D.I. Yogyakarta' ||
    p === 'DI Yogyakarta' ||
    p === 'D.I Yogyakarta' ||
    p === 'DIY' ||
    p === 'Daerah Istimewa Yogyakarta'
  ) {
    return 'Daerah Istimewa Yogyakarta';
  }
  if (p === 'Bangka Belitung' || p === 'Kep. Bangka Belitung' || p === 'Kepulauan Bangka Belitung') {
    return 'Kepulauan Bangka Belitung';
  }
  if (p === 'NTB' || p === 'Nusa Tenggara Barat') return 'Nusa Tenggara Barat';
  if (p === 'NTT' || p === 'Nusa Tenggara Timur') return 'Nusa Tenggara Timur';
  if (p === 'Kep. Riau' || p === 'Kepulauan Riau') return 'Kepulauan Riau';
  if (p.toUpperCase() === 'SULAWESI SELATAN') return 'Sulawesi Selatan';
  return p;
}

function getHeatmapColor(val: number, maxVal: number, isDark: boolean) {
  if (!val || val <= 0 || maxVal <= 0) {
    return { color: isDark ? '#334155' : '#cbd5e1', fillOpacity: isDark ? 0.25 : 0.20 };
  }
  const r = val / maxVal;
  // Sequential Heatmap Gradient: Sky -> Cyan -> Emerald -> Amber -> Red (Puncak)
  if (r < 0.05) {
    return { color: '#38bdf8', fillOpacity: isDark ? 0.45 : 0.40 };
  } else if (r < 0.15) {
    return { color: '#06b6d4', fillOpacity: isDark ? 0.52 : 0.48 };
  } else if (r < 0.35) {
    return { color: '#10b981', fillOpacity: isDark ? 0.60 : 0.55 };
  } else if (r < 0.65) {
    return { color: '#f59e0b', fillOpacity: isDark ? 0.70 : 0.65 };
  } else {
    return { color: '#ef4444', fillOpacity: isDark ? 0.82 : 0.78 };
  }
}

interface SpatialMapWorkspaceProps {
  nodes: any[];
  isDarkMode: boolean;
  globalMetric?: 'pnp' | 'arm';
  globalDirection?: 'brg' | 'dat' | 'tot';
}

export const SpatialMapWorkspace: React.FC<SpatialMapWorkspaceProps> = ({
  nodes,
  isDarkMode,
  globalMetric = 'pnp',
  globalDirection = 'brg',
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerGroupRef = useRef<any>(null);
    const choroplethGroupRef = useRef<any>(null);

    const [selectedModa, setSelectedModa] = useState<string>('ALL');
    const selectedMetric = globalMetric;
    const selectedDirection = globalDirection;
    const [selectedScale, setSelectedScale] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<any | null>(null);

    const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
    const [heatmapIndicator, setHeatmapIndicator] = useState<'volume' | 'per_capita'>('volume');
    const [showNodes, setShowNodes] = useState<boolean>(true);
    const [mapReady, setMapReady] = useState<boolean>(false);
    const geoJsonData = provincesGeoJson;

  // Helper to extract node volume based on metric & direction
  const getNodeVol = (n: any) => {
    if (selectedMetric === 'pnp') {
      return selectedDirection === 'brg' ? (n.p_brg ?? n.pnp) : selectedDirection === 'dat' ? (n.p_dat ?? n.pnp) : (n.pnp ?? n.pnp_tot);
    } else {
      return selectedDirection === 'brg' ? (n.a_brg ?? n.arm) : selectedDirection === 'dat' ? (n.a_dat ?? n.arm) : (n.arm ?? n.arm_tot);
    }
  };

  // Filter & rank nodes according to scale (Titik tidak membesar: min 3.2px, max 7.5px)
  const { filteredNodes, totalPoolVol } = useMemo(() => {
    // Candidates with valid coordinates
    const pool = nodes.filter(
      (n) => n.lat !== null && n.lon !== null && n.lat !== undefined && n.lon !== undefined && !isNaN(Number(n.lat))
    );

    let list = pool;
    if (selectedModa !== 'ALL') {
      list = list.filter((n) => (n.m || n.moda) === selectedModa);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (n) =>
          (n.nama || n.name || '').toLowerCase().includes(term) ||
          (n.p || n.prov || '').toLowerCase().includes(term)
      );
    }

    // Sort descending by volume
    list.sort((a, b) => {
      const vA = Number(getNodeVol(a)) || 0;
      const vB = Number(getNodeVol(b)) || 0;
      return vB - vA;
    });

    const poolVol = list.reduce(
      (sum, n) => sum + (Number(getNodeVol(n)) || 0),
      0
    );

    // Filter by Scale / Ranking
    let finalNodes = list;
    if (selectedScale === 'top10') {
      finalNodes = list.slice(0, 10);
    } else if (selectedScale === 'top20') {
      finalNodes = list.slice(0, 20);
    } else if (selectedScale === 'top30') {
      finalNodes = list.slice(0, 30);
    } else if (selectedScale === 'top50') {
      finalNodes = list.slice(0, 50);
    } else if (selectedScale === 'pareto80') {
      let cum = 0;
      const threshold = poolVol * 0.8;
      finalNodes = [];
      for (const n of list) {
        finalNodes.push(n);
        cum += Number(getNodeVol(n)) || 0;
        if (cum >= threshold) break;
      }
    }

    return { filteredNodes: finalNodes, totalPoolVol: poolVol };
  }, [nodes, selectedModa, selectedMetric, selectedDirection, selectedScale, searchTerm]);

  // Aggregate Province Statistics for Choropleth Heatmap (Volume & Rasio per Kapita BPS)
  const { provStats, maxProvVol, nationalVol, maxProvRatio } = useMemo(() => {
    const stats: Record<
      string,
      {
        vol: number;
        pbrg: number;
        pop: number;
        ratio: number;
        count: number;
        modas: Record<string, number>;
      }
    > = {};
    let maxVol = 0;
    let maxRatio = 0;
    let natVol = 0;

    nodes.forEach((n) => {
      const moda = n.m || n.moda;
      if (selectedModa !== 'ALL' && moda !== selectedModa) return;
      const pNorm = normalizeProvinceName(n.p || n.prov);
      if (!pNorm) return;

      if (!stats[pNorm]) {
        const pop = BPS_PROVINCE_POPULATION[pNorm] || 0;
        stats[pNorm] = { vol: 0, pbrg: 0, pop, ratio: 0, count: 0, modas: {} };
      }
      const val = Number(getNodeVol(n)) || 0;
      const pbrgVal = Number(n.p_brg ?? n.pnp ?? 0) || 0;
      stats[pNorm].vol += val;
      stats[pNorm].pbrg += pbrgVal;
      stats[pNorm].count += 1;
      stats[pNorm].modas[moda] = (stats[pNorm].modas[moda] || 0) + val;
      natVol += val;
    });

    Object.values(stats).forEach((s) => {
      if (s.vol > maxVol) maxVol = s.vol;
      if (s.pop > 0) {
        s.ratio = s.pbrg / s.pop;
        if (s.ratio > maxRatio) maxRatio = s.ratio;
      }
    });

    return { provStats: stats, maxProvVol: maxVol, nationalVol: natVol, maxProvRatio: maxRatio };
  }, [nodes, selectedModa, selectedMetric, selectedDirection]);

  // Leaflet Map Initialization and Layer Management
  // 1. LEAFLET MAP INITIALIZATION (Runs once on mount, persistent lifecycle)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    const initMap = async () => {
      L = (await import('leaflet')).default;
      if (isCancelled || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [-2.2, 117.5],
          zoom: 5,
          minZoom: 4,
          maxZoom: 18,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Standard OpenStreetMap Tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Persistent layer groups: Choropleth (bottom) -> Markers (top)
        choroplethGroupRef.current = L.layerGroup().addTo(map);
        markerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        setMapReady(true);
      }

      const map = mapInstanceRef.current;
      if (map) {
        map.invalidateSize();
      }
    };

    initMap();

    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 400);

    const t3 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 800);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. CHOROPLETH HEATMAP LAYER (Permanently maintained, updates only on data/metric/theme/indicator change)
  useEffect(() => {
    if (!mapReady || typeof window === 'undefined' || !mapInstanceRef.current || !choroplethGroupRef.current) return;

    let L: any;
    let isCancelled = false;

    const renderChoropleth = async () => {
      L = (await import('leaflet')).default;
      if (isCancelled || !choroplethGroupRef.current) return;

      const choroGroup = choroplethGroupRef.current;
      choroGroup.clearLayers();

      if (showHeatmap) {
        const unit = selectedMetric === 'pnp' ? 'penumpang' : 'trip armada';

        const geoLayer = L.geoJSON(provincesGeoJson, {
          style: (feature: any) => {
            const provName = normalizeProvinceName(feature.properties?.PROVINSI);
            const stat = provStats[provName] || { vol: 0, ratio: 0 };
            const c =
              heatmapIndicator === 'per_capita'
                ? getHeatmapColor(stat.ratio, maxProvRatio, isDarkMode)
                : getHeatmapColor(stat.vol, maxProvVol, isDarkMode);

            return {
              fillColor: c.color,
              fillOpacity: c.fillOpacity,
              color: isDarkMode ? '#1e293b' : '#ffffff',
              weight: 1.2,
              opacity: 0.9,
              dashArray: '',
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            const provName = normalizeProvinceName(feature.properties?.PROVINSI);
            const stat = provStats[provName] || {
              vol: 0,
              pbrg: 0,
              pop: BPS_PROVINCE_POPULATION[provName] || 0,
              ratio: 0,
              count: 0,
              modas: {},
            };
            const sharePct = nationalVol > 0 ? ((stat.vol / nationalVol) * 100).toFixed(1) : '0';

            let domModa = '-';
            let maxMVal = 0;
            if (stat.modas) {
              Object.entries(stat.modas).forEach(([m, v]) => {
                if (v > maxMVal) {
                  maxMVal = v;
                  domModa = m;
                }
              });
            }

            layer.on('mouseover', function (this: any) {
              this.setStyle({
                weight: 2.5,
                color: '#1d4ed8',
                fillOpacity: Math.min(0.92, (this.options.fillOpacity || 0.5) + 0.18),
              });
            });

            layer.on('mouseout', function (this: any) {
              geoLayer.resetStyle(this);
            });

            const tooltipHtml =
              heatmapIndicator === 'per_capita'
                ? `
              <div class="p-1.5 text-xs font-sans space-y-1 min-w-[210px]">
                <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center">
                  <span>${feature.properties?.PROVINSI}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">BPS</span>
                </div>
                <div class="text-[11px] text-slate-800">
                  Rasio Mobilitas: <strong class="text-indigo-600 font-mono font-bold">${formatDecimal(stat.ratio, 3)}</strong> trip/jiwa
                </div>
                <div class="text-[10.5px] text-slate-600 flex justify-between">
                  <span>Penumpang Berangkat:</span>
                  <strong class="font-mono text-slate-800">${formatNumber(stat.pbrg)}</strong>
                </div>
                <div class="text-[10.5px] text-slate-600 flex justify-between">
                  <span>Jumlah Penduduk (BPS):</span>
                  <strong class="font-mono text-slate-800">${formatNumber(stat.pop)}</strong>
                </div>
                <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                  <span>Simpul Operasional:</span>
                  <span><strong>${stat.count} titik</strong> • ${MODA_DISPLAY_NAME[domModa] || domModa}</span>
                </div>
              </div>
            `
                : `
              <div class="p-1 text-xs font-sans space-y-1">
                <div class="font-bold text-slate-900 border-b border-slate-200 pb-0.5">${feature.properties?.PROVINSI}</div>
                <div class="text-[11px] text-slate-700">
                  Intensitas: <strong class="text-indigo-600 font-mono">${formatNumber(stat.vol)}</strong> ${unit} (${sharePct}%)
                </div>
                <div class="text-[10px] text-slate-500">
                  Simpul: <strong>${stat.count} titik</strong> • Moda Utama: <strong>${MODA_DISPLAY_NAME[domModa] || domModa}</strong>
                </div>
              </div>
            `;
            layer.bindTooltip(tooltipHtml, { sticky: true, opacity: 0.96 });
          },
        });

        choroGroup.addLayer(geoLayer);
      }

      // Keep markers above the choropleth polygon fills
      if (markerGroupRef.current) {
        markerGroupRef.current.bringToFront();
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    renderChoropleth();

    return () => {
      isCancelled = true;
    };
  }, [
    mapReady,
    provStats,
    maxProvVol,
    maxProvRatio,
    nationalVol,
    selectedMetric,
    isDarkMode,
    showHeatmap,
    heatmapIndicator,
  ]);

  // 3. SIMPUL MARKERS LAYER (Updates on filtered nodes / scale / search)
  useEffect(() => {
    if (!mapReady || typeof window === 'undefined' || !mapInstanceRef.current || !markerGroupRef.current) return;

    let L: any;
    let isCancelled = false;

    const renderMarkers = async () => {
      L = (await import('leaflet')).default;
      if (isCancelled || !markerGroupRef.current) return;

      const markerGroup = markerGroupRef.current;
      markerGroup.clearLayers();

      if (showNodes) {
        const maxMetricVal = filteredNodes.reduce((max, node) => {
          const v = Number(getNodeVol(node)) || 0;
          return Math.max(max, v);
        }, 1);

        filteredNodes.forEach((node, rankIdx) => {
          const lat = Number(node.lat);
          const lon = Number(node.lon);
          if (isNaN(lat) || isNaN(lon)) return;

          const modaKey = node.m || node.moda || 'UDARA';
          const nodeName = node.nama || node.name || 'Simpul';
          const nodeProv = node.p || node.prov || '';
          const nodeVal = Number(getNodeVol(node)) || 0;
          const color = (COLOR as any)[modaKey] || '#1a5287';
          const isTop10 = rankIdx < 10;

          // V1 FORMULA: minR = 3.2, maxR = 7.5 (Titik TIDAK membesar!)
          const ratio = Math.min(1, Math.max(0, nodeVal / maxMetricVal));
          const minR = 3.2;
          const maxR = 7.5;
          const radius = nodeVal > 0 ? minR + Math.pow(ratio, 0.45) * (maxR - minR) : 2.5;

          const circle = L.circleMarker([lat, lon], {
            radius: radius,
            fillColor: color,
            color: isTop10 ? '#f59e0b' : '#ffffff',
            weight: isTop10 ? 1.5 : 0.8,
            opacity: 1.0,
            fillOpacity: 0.92,
          });

          // Interactive hover (grows subtly by 2px, does not blow up)
          circle.on('mouseover', function (this: any) {
            this.setStyle({ weight: 2.2, fillOpacity: 1.0, radius: radius + 2.0 });
            this.bringToFront();
          });
          circle.on('mouseout', function (this: any) {
            this.setStyle({ weight: isTop10 ? 1.5 : 0.8, fillOpacity: 0.92, radius: radius });
          });

          circle.on('click', () => {
            setSelectedNode({ ...node, rank: rankIdx + 1 });
          });

          const rankBadge = isTop10
            ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Top #${
                rankIdx + 1
              }</span>`
            : `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">Peringkat #${rankIdx + 1}</span>`;

          const shareOfTotal =
            totalPoolVol > 0 ? `${((nodeVal / totalPoolVol) * 100).toFixed(2)}%` : '0%';

          const popupHtml = `
            <div class="p-1 space-y-1.5 max-w-[220px]">
              <div class="flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
                <strong class="text-slate-900 font-sans text-xs">${nodeName}</strong>
              </div>
              <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>${nodeProv} • Tipe: ${node.tipe || '-'}</span>
                ${rankBadge}
              </div>
              <div class="p-2 rounded bg-slate-50 space-y-1 text-[11px] font-mono">
                <div class="flex justify-between font-bold text-indigo-700">
                  <span>${selectedMetric === 'pnp' ? 'Total Penumpang:' : 'Total Armada:'}</span>
                  <span>${formatNumber(nodeVal)}</span>
                </div>
                <div class="text-[10px] text-slate-500 flex justify-between">
                  <span>↳ Datang: ${formatNumber(selectedMetric === 'pnp' ? node.p_dat : node.a_dat)}</span>
                  <span>↳ Berangkat: ${formatNumber(selectedMetric === 'pnp' ? node.p_brg : node.a_brg)}</span>
                </div>
                <div class="border-t border-slate-200 pt-1 flex justify-between font-semibold text-emerald-600">
                  <span>Pangsa Pasar:</span>
                  <span>${shareOfTotal}</span>
                </div>
              </div>
            </div>
          `;

          circle.bindPopup(popupHtml);
          markerGroup.addLayer(circle);
        });
      }

      // Ensure markers remain strictly on top of choropleth
      markerGroup.bringToFront();
    };

    renderMarkers();

    return () => {
      isCancelled = true;
    };
  }, [mapReady, filteredNodes, showNodes, selectedMetric, totalPoolVol]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Peta Spasial Simpul & Heatmap Wilayah Nasional (Leaflet GIS)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan sebaran <strong>{filteredNodes.length} simpul berkoordinat valid</strong> dengan layer Choropleth Heatmap 38 Provinsi.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 font-semibold">
              ✓ {filteredNodes.length} Simpul Terpetakan
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 font-semibold">
              {heatmapIndicator === 'per_capita'
                ? '👥 Rasio Pnp / Penduduk BPS (38 Prov)'
                : '🔥 Heatmap 38 Provinsi'}
            </span>
          </div>
        </div>

        {/* MODA SELECTOR, LAYER TOGGLES, METRIC, AND SCALE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Moda Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
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

          {/* Controls: Heatmap Toggle, Heatmap Indicator Mode, Nodes Toggle, Scale, Metric, Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* LAYER TOGGLES & HEATMAP INDICATOR FILTER */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                    showHeatmap
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Heatmap Wilayah</span>
                </button>
                <button
                  onClick={() => setShowNodes(!showNodes)}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                    showNodes
                      ? 'bg-sky-700 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Titik Simpul</span>
                </button>
              </div>

              {/* HEATMAP INDICATOR (Volume vs Pnp Berangkat / Penduduk BPS) */}
              {showHeatmap && (
                <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setHeatmapIndicator('volume')}
                    className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                      heatmapIndicator === 'volume'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Heatmap berdasarkan volume total"
                  >
                    <span>Volume Total</span>
                  </button>
                  <button
                    onClick={() => setHeatmapIndicator('per_capita')}
                    className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                      heatmapIndicator === 'per_capita'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Heatmap rasio penumpang berangkat terhadap jumlah penduduk provinsi (BPS)"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Pnp Berangkat / Penduduk</span>
                  </button>
                </div>
              )}
            </div>

            {/* Scale Filter Dropdown (V1 Feature) */}
            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="all">Semua Simpul Terpetakan</option>
              <option value="top10">Top 10 Simpul Terpadat</option>
              <option value="top20">Top 20 Simpul Terpadat</option>
              <option value="top30">Top 30 Simpul Terpadat</option>
              <option value="top50">Top 50 Simpul Terpadat</option>
              <option value="pareto80">Pareto 80% Volume</option>
            </select>

            {/* Search */}
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari simpul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-7 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAP & NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEAFLET CANVAS (Isolated stacking context so Leaflet controls never bleed through sidebar) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs relative isolate z-0">
          <div ref={mapContainerRef} style={{ height: '580px', width: '100%' }} />

          {/* V1 EXACT INTERACTIVE MAP LEGEND (HEATMAP BAR + SIMPUL DOTS) */}
          <div className="absolute bottom-3 left-3 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] shadow-lg space-y-2.5 max-w-[240px]">
            {/* Heatmap Gradient Bar (Always visible) */}
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-500" />
                <span>
                  {heatmapIndicator === 'per_capita' ? 'Heatmap per Kapita:' : 'Heatmap Wilayah:'}
                </span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>
                    {heatmapIndicator === 'per_capita' ? 'Pnp Berangkat / Penduduk' : 'Intensitas:'}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Rendah ➔ Puncak</span>
                </div>
                <div className="h-2 w-full rounded-sm bg-gradient-to-r from-sky-400 via-cyan-400 via-emerald-400 via-amber-400 to-rose-600" />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  {heatmapIndicator === 'per_capita' ? (
                    <>
                      <span>&lt;0,3</span>
                      <span>0,6</span>
                      <span>1,2</span>
                      <span>2,5+</span>
                    </>
                  ) : (
                    <>
                      <span>&lt;5%</span>
                      <span>15%</span>
                      <span>35%</span>
                      <span>65%+</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Simpul Dots Legend (Neat, tiny GIS dots) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-[11px]">
                <span className="w-2 rounded-full bg-emerald-500" />
                <span>Titik Simpul per Moda:</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                {(['UDARA', 'KA', 'BUS', 'ASDP', 'LAUT'] as const).map((m) => (
                  <div key={m} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white dark:border-slate-800"
                      style={{ backgroundColor: COLOR[m] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {MODA_DISPLAY_NAME[m]} ({nodes.filter((n) => (n.m || n.moda) === m).length})
                    </span>
                  </div>
                ))}
              </div>
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
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    {selectedNode.rank ? `Peringkat #${selectedNode.rank}` : 'Simpul'}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-0.5">
                    {selectedNode.nama || selectedNode.name}
                  </div>
                  <div className="text-xs text-slate-500">{selectedNode.p || selectedNode.prov}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans">Moda:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {MODA_DISPLAY_NAME[selectedNode.m || selectedNode.moda] || selectedNode.m}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans">Tipe:</span>
                    <div className="text-slate-600 dark:text-slate-400 truncate">{selectedNode.tipe || '-'}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Total Penumpang:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNumber(selectedNode.pnp ?? selectedNode.pnp_tot)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Total Armada:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatNumber(selectedNode.arm ?? selectedNode.arm_tot)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Rasio Beban (LF):</span>
                    <span className="font-bold text-sky-700 dark:text-sky-300">
                      {formatDecimal(
                        (selectedNode.pnp ?? selectedNode.pnp_tot) / ((selectedNode.arm ?? selectedNode.arm_tot) || 1)
                      )} pnp/trip
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 text-[11px] flex justify-between text-slate-500">
                    <span>Datang: {formatNumber(selectedNode.p_dat || 0)}</span>
                    <span>Berangkat: {formatNumber(selectedNode.p_brg || 0)}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Koordinat: {Number(selectedNode.lat)?.toFixed(4)}, {Number(selectedNode.lon)?.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                Klik salah satu titik simpul di peta untuk melihat profil operasional lengkap.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
