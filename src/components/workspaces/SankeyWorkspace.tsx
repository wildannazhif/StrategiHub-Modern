'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Plane, Flame, Activity, RotateCcw, Filter } from 'lucide-react';
import { HUB_FLOWS, ISLAND_FLOWS, SANKEY_COLOR_MAP, SankeyFlow } from '@/data/sankeyData';
import { formatNumber, formatDecimal } from '@/lib/constants';

interface SankeyWorkspaceProps {
  isDarkMode?: boolean;
}

interface NodeItem {
  name: string;
  x: number;
  y: number;
  height: number;
  value: number;
  isSource: boolean;
  color: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  badge?: string;
  pax: number;
  flights?: number;
  density?: string;
  share: number;
}

function cleanAirportName(name: string): string {
  if (['Jawa', 'Sumatera', 'Bali & Nusra', 'Kalimantan', 'Sulawesi', 'Maluku & Papua', 'Lainnya'].includes(name)) {
    return name;
  }
  if (name.startsWith('Lainnya')) return name;

  const map: Record<string, string> = {
    CGK: 'CGK (Jakarta)',
    SUB: 'SUB (Surabaya)',
    DPS: 'DPS (Bali)',
    UPG: 'UPG (Makassar)',
    KNO: 'KNO (Medan)',
    BPN: 'BPN (Balikpapan)',
    BTH: 'BTH (Batam)',
    YIA: 'YIA (Yogyakarta)',
    BDJ: 'BDJ (Banjarmasin)',
    LOP: 'LOP (Lombok)',
    PLM: 'PLM (Palembang)',
    SRG: 'SRG (Semarang)',
    PKU: 'PKU (Pekanbaru)',
    PDG: 'PDG (Padang)',
    DJJ: 'DJJ (Jayapura)',
    PNK: 'PNK (Pontianak)',
    MDC: 'MDC (Manado)',
    KOE: 'KOE (Kupang)',
    TRK: 'TRK (Tarakan)',
    TJQ: 'TJQ (Belitung)',
    AAP: 'AAP (Samarinda)',
    BTJ: 'BTJ (Banda Aceh)',
    DTB: 'DTB (Silangit)',
    PGK: 'PGK (Pangkalpinang)',
    BKS: 'BKS (Bengkulu)',
    TTE: 'TTE (Ternate)',
    AMQ: 'AMQ (Ambon)',
    PLW: 'PLW (Palu)',
    SOC: 'SOC (Solo)',
    DJB: 'DJB (Jambi)',
    HLP: 'HLP (Halim)',
    KDI: 'KDI (Kendari)',
    LBJ: 'LBJ (Labuan Bajo)',
  };

  const code = name.split(' ')[0].trim();
  if (map[code]) return map[code];

  const match = name.match(/^([A-Z0-9]{3})\s*\((.*?)\)/);
  if (match) {
    const cleanCity = match[2].split('-')[0].split(',')[0].trim();
    return `${match[1]} (${cleanCity})`;
  }
  return name;
}

function getNodeColor(name: string): string {
  if (SANKEY_COLOR_MAP[name]) return SANKEY_COLOR_MAP[name];
  if (name === 'Lainnya') return '#94a3b8';
  const palette = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
    '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#0ea5e9', '#d946ef', '#e11d48', '#22c55e', '#a855f7'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export const SankeyWorkspace: React.FC<SankeyWorkspaceProps> = ({ isDarkMode = false }) => {
  const [viewMode, setViewMode] = useState<'hub' | 'island'>('hub');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('ALL');
  const [minPaxThreshold, setMinPaxThreshold] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<SankeyFlow | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    pax: 0,
    share: 0,
  });

  const isIsland = viewMode === 'island';

  // Filtered dataset (Supports "Semua" threshold = 0)
  const currentDataset = useMemo(() => {
    if (isIsland) {
      return ISLAND_FLOWS;
    }
    return HUB_FLOWS.filter((flow) => {
      const matchOrigin = selectedOrigin === 'ALL' || flow.source.startsWith(selectedOrigin);
      const matchPax = minPaxThreshold === 0 ? true : flow.value >= minPaxThreshold;
      return matchOrigin && matchPax;
    });
  }, [isIsland, selectedOrigin, minPaxThreshold]);

  // Aggregate KPI stats (Calculated on full filtered flows)
  const kpiStats = useMemo(() => {
    let totalPax = 0;
    let totalFlights = 0;
    let topCorridor = { name: '-', pax: 0 };

    currentDataset.forEach((f) => {
      totalPax += f.value;
      totalFlights += f.flights || 0;
      if (f.value > topCorridor.pax) {
        topCorridor = { name: `${f.source.split(' ')[0]} ⇄ ${f.target.split(' ')[0]}`, pax: f.value };
      }
    });

    const avgDensity = totalFlights > 0 ? totalPax / totalFlights : 0;

    return {
      totalPax,
      totalFlights,
      topCorridor: isIsland ? 'Jawa ⇄ Sumatera' : 'DPS ⇄ CGK',
      topCorridorPax: isIsland ? '968.795 Pax 2-Arah' : '266.263 Pax Gabungan',
      avgDensity,
    };
  }, [currentDataset, isIsland]);

  // Bipartite Sankey Layout Calculations (Max 25 Destinations + 'Lainnya' Consolidation)
  const layout = useMemo(() => {
    if (!currentDataset || currentDataset.length === 0) {
      return {
        nodes: [],
        links: [],
        width: 620,
        height: 600,
        totalValue: 0,
        padX: 135,
        totalDestinationsCount: 0,
        displayedTargetsCount: 0,
        otherDestinationsCount: 0,
      };
    }

    // 1. Group targets to find top destinations (Max 25 total targets with 'Lainnya')
    const rawTargetTotals: Record<string, number> = {};
    currentDataset.forEach((l) => {
      rawTargetTotals[l.target] = (rawTargetTotals[l.target] || 0) + l.value;
    });

    const allSortedTargets = Object.keys(rawTargetTotals).sort((a, b) => rawTargetTotals[b] - rawTargetTotals[a]);
    const totalDestinationsCount = allSortedTargets.length;
    const MAX_TARGETS = 25;

    let effectiveDataset: SankeyFlow[] = [];
    let otherDestinationsCount = 0;

    if (!isIsland && totalDestinationsCount > MAX_TARGETS) {
      // Pick top 24 targets, remaining destinations become 'Lainnya' (giving exactly 25 targets)
      const top24Targets = allSortedTargets.slice(0, 24);
      const topTargetsSet = new Set(top24Targets);
      otherDestinationsCount = totalDestinationsCount - 24;

      const consolidatedMap = new Map<string, SankeyFlow>();
      currentDataset.forEach((flow) => {
        const target = topTargetsSet.has(flow.target) ? flow.target : 'Lainnya';
        const key = `${flow.source}__${target}`;
        if (!consolidatedMap.has(key)) {
          consolidatedMap.set(key, {
            source: flow.source,
            target,
            value: flow.value,
            flights: flow.flights || 0,
          });
        } else {
          const existing = consolidatedMap.get(key)!;
          existing.value += flow.value;
          existing.flights = (existing.flights || 0) + (flow.flights || 0);
        }
      });
      effectiveDataset = Array.from(consolidatedMap.values());
    } else {
      effectiveDataset = currentDataset;
    }

    const sourceMap: Record<string, number> = {};
    const targetMap: Record<string, number> = {};
    let totalValue = 0;

    effectiveDataset.forEach((l) => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + l.value;
      targetMap[l.target] = (targetMap[l.target] || 0) + l.value;
      totalValue += l.value;
    });

    const sources = Object.keys(sourceMap).sort((a, b) => sourceMap[b] - sourceMap[a]);
    // Ensure 'Lainnya' sits gracefully at the bottom of destination nodes
    const targets = Object.keys(targetMap).sort((a, b) => {
      if (a === 'Lainnya') return 1;
      if (b === 'Lainnya') return -1;
      return targetMap[b] - targetMap[a];
    });

    const displayedTargetsCount = targets.length;

    const minNodeH = isIsland ? 28 : 18;
    const nodeWidth = 14;
    const gap = isIsland ? 18 : 11;
    const padY = 40;
    const padX = isIsland ? 120 : 135;
    const width = 620;

    // Flow scaling factor
    const targetFlowSpan = Math.max(isIsland ? 500 : 700, targets.length * 22);
    const scaleS = targetFlowSpan / (totalValue || 1);
    const scaleT = targetFlowSpan / (totalValue || 1);

    const sourceNodes: Record<string, NodeItem> = {};
    let currYS = padY;
    sources.forEach((s) => {
      const h = Math.max(sourceMap[s] * scaleS, minNodeH);
      const color = getNodeColor(s);
      sourceNodes[s] = { name: s, x: padX, y: currYS, height: h, value: sourceMap[s], isSource: true, color };
      currYS += h + gap;
    });

    const targetNodes: Record<string, NodeItem> = {};
    let currYT = padY;
    targets.forEach((t) => {
      const h = Math.max(targetMap[t] * scaleT, minNodeH);
      const color = getNodeColor(t);
      targetNodes[t] = { name: t, x: width - padX - nodeWidth, y: currYT, height: h, value: targetMap[t], isSource: false, color };
      currYT += h + gap;
    });

    // GUARANTEED SAFE HEIGHT: Sized to the exact lowest node + padY (Zero vertical cut-off)
    const height = Math.max(currYS, currYT) + padY;

    const sOffsets: Record<string, number> = {};
    const tOffsets: Record<string, number> = {};
    sources.forEach((s) => (sOffsets[s] = 0));
    targets.forEach((t) => (tOffsets[t] = 0));

    // Sort links descending so larger ribbons render cleanly, with 'Lainnya' ribbons at bottom
    const sortedLinks = [...effectiveDataset].sort((a, b) => {
      if (a.target === 'Lainnya') return 1;
      if (b.target === 'Lainnya') return -1;
      return b.value - a.value;
    });

    const renderedLinks = sortedLinks
      .map((l, idx) => {
        const sn = sourceNodes[l.source];
        const tn = targetNodes[l.target];
        if (!sn || !tn) return null;

        const linkHS = (l.value / sn.value) * sn.height;
        const linkHT = (l.value / tn.value) * tn.height;

        const y1 = sn.y + sOffsets[l.source];
        const y2 = tn.y + tOffsets[l.target];

        sOffsets[l.source] += linkHS;
        tOffsets[l.target] += linkHT;

        const x1 = sn.x + nodeWidth;
        const x2 = tn.x;
        const cx1 = x1 + (x2 - x1) * 0.45;
        const cx2 = x2 - (x2 - x1) * 0.45;

        const gradId = `sankey-grad-${idx}`;
        const pathD = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2} L ${x2} ${y2 + linkHT} C ${cx2} ${y2 + linkHT}, ${cx1} ${y1 + linkHS}, ${x1} ${y1 + linkHS} Z`;

        const cSource = getNodeColor(l.source);
        const cTarget = getNodeColor(l.target);

        return {
          id: gradId,
          pathD,
          cSource,
          cTarget,
          x1,
          x2,
          flow: l,
          sharePct: ((l.value / (totalValue || 1)) * 100).toFixed(1),
        };
      })
      .filter(Boolean);

    const allNodes = [...Object.values(sourceNodes), ...Object.values(targetNodes)];

    return {
      nodes: allNodes,
      links: renderedLinks,
      width,
      height,
      totalValue,
      padX,
      totalDestinationsCount,
      displayedTargetsCount,
      otherDestinationsCount,
    };
  }, [currentDataset, isIsland]);

  // Tooltip tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let left = e.clientX - rect.left + 12;
    let top = e.clientY - rect.top + 12;

    if (left + 240 > rect.width) {
      left = e.clientX - rect.left - 250;
    }
    if (top + 150 > rect.height) {
      top = e.clientY - rect.top - 140;
    }

    setTooltip((prev) => ({ ...prev, x: Math.max(10, left), y: Math.max(10, top) }));
  };

  const handleLinkMouseEnter = (e: React.MouseEvent, item: any) => {
    setHoveredLink(item.flow);
    handleMouseMove(e);
    const isOther = item.flow.target === 'Lainnya';
    setTooltip({
      visible: true,
      x: 0,
      y: 0,
      title: `${cleanAirportName(item.flow.source)} ➔ ${
        isOther ? `Lainnya (${layout.otherDestinationsCount} Destinasi)` : cleanAirportName(item.flow.target)
      }`,
      badge: isOther ? 'Rute Gabungan' : 'Rute Langsung',
      pax: item.flow.value,
      flights: item.flow.flights,
      density: item.flow.flights > 0 ? (item.flow.value / item.flow.flights).toFixed(1) : '0',
      share: Number(item.sharePct),
    });
  };

  const handleNodeMouseEnter = (e: React.MouseEvent, node: NodeItem) => {
    setHoveredNode(node.name);
    handleMouseMove(e);
    const pct = ((node.value / (layout.totalValue || 1)) * 100).toFixed(1);
    const isOther = node.name === 'Lainnya';
    setTooltip({
      visible: true,
      x: 0,
      y: 0,
      title: isOther ? `Lainnya (${layout.otherDestinationsCount} Destinasi Gabungan)` : cleanAirportName(node.name),
      badge: isOther
        ? 'Destinasi Gabungan'
        : node.isSource
        ? 'Hub Asal (Origin)'
        : 'Tujuan (Destination)',
      pax: node.value,
      share: Number(pct),
    });
  };

  const handleMouseLeave = () => {
    setHoveredLink(null);
    setHoveredNode(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleNodeClick = (nodeName: string) => {
    if (selectedNode === nodeName) {
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeName);
    }
  };

  const resetAll = () => {
    setSelectedOrigin('ALL');
    setMinPaxThreshold(0);
    setSelectedNode(null);
    setHoveredLink(null);
    setHoveredNode(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & VIEW SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Diagram Alir Sankey: Arus Koridor Mobilitas Udara Nasional
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi proporsional volume penumpang antarmoda dan konektivitas koridor udara antarpulau nusantara.
            </p>
          </div>

          {/* Hub vs Island Toggle */}
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                setViewMode('hub');
                resetAll();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'hub'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Arus Hub Bandara</span>
            </button>
            <button
              onClick={() => {
                setViewMode('island');
                resetAll();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'island'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🧭 Arus Antar-Pulau</span>
            </button>
          </div>
        </div>

        {/* 2. EXECUTIVE KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Penumpang</span>
              <Plane className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatNumber(kpiStats.totalPax)}
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-0.5">
              Orang / Bulan Terpantau
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Frekuensi Penerbangan</span>
              <Plane className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatNumber(kpiStats.totalFlights)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Flights Komersial Berjadwal
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Koridor Terpadat #1</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 truncate">
              {kpiStats.topCorridor}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-0.5">
              {kpiStats.topCorridorPax}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Kepadatan Rata-rata</span>
              <Activity className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatDecimal(kpiStats.avgDensity, 1)}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
              Pax / Penerbangan Beroperasi
            </div>
          </div>
        </div>

        {/* 3. TOOLBAR FILTERS & CONTROLS */}
        {!isIsland && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Origin Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Filter Asal:</span>
                <select
                  value={selectedOrigin}
                  onChange={(e) => {
                    setSelectedOrigin(e.target.value);
                    setSelectedNode(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">Semua Titik Asal</option>
                  <option value="CGK">CGK (Jakarta)</option>
                  <option value="SUB">SUB (Surabaya)</option>
                  <option value="DPS">DPS (Bali)</option>
                  <option value="UPG">UPG (Makassar)</option>
                  <option value="KNO">KNO (Medan)</option>
                  <option value="BPN">BPN (Balikpapan)</option>
                </select>
              </div>

              {/* Threshold Pill Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 mr-1 hidden sm:inline">Min. Pax:</span>
                {[
                  { val: 0, label: 'Semua' },
                  { val: 10000, label: '≥ 10k' },
                  { val: 20000, label: '≥ 20k' },
                  { val: 40000, label: '≥ 40k' },
                  { val: 60000, label: '≥ 60k (Koridor Utama)' },
                ].map((th) => (
                  <button
                    key={th.val}
                    onClick={() => setMinPaxThreshold(th.val)}
                    className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                      minPaxThreshold === th.val
                        ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              {/* Destination Count Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Tujuan: <strong>{layout.displayedTargetsCount}</strong> ditampilkan dari total{' '}
                  <strong>{layout.totalDestinationsCount}</strong> destinasi
                  {layout.otherDestinationsCount > 0 && (
                    <span className="text-emerald-700 dark:text-emerald-400 ml-1">
                      (Top 24 + {layout.otherDestinationsCount} di 'Lainnya')
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sorotan</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Asal
                </span>
                <span>➔</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tujuan
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. SANKEY DIAGRAM SVG CANVAS (Adaptive, Fits screen seamlessly, Zero Cut-off) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-5 shadow-2xs relative"
      >
        <div className="w-full rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-4">
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="w-full h-auto select-none"
            onClick={() => setSelectedNode(null)}
          >
            {/* GRADIENT DEFINITIONS */}
            <defs>
              {layout.links.map((link: any) => (
                <linearGradient
                  key={link.id}
                  id={link.id}
                  gradientUnits="userSpaceOnUse"
                  x1={link.x1}
                  y1={0}
                  x2={link.x2}
                  y2={0}
                >
                  <stop offset="0%" stopColor={link.cSource} />
                  <stop offset="100%" stopColor={link.cTarget} />
                </linearGradient>
              ))}
            </defs>

            {/* COLUMN HEADERS */}
            <text
              x={layout.padX}
              y={22}
              fontSize="10"
              fontWeight="bold"
              fill={isDarkMode ? '#60a5fa' : '#2563eb'}
              className="font-sans"
            >
              {isIsland ? '🛫 ASAL' : '🛫 ASAL (HUB)'}
            </text>

            <text
              x={layout.width - layout.padX}
              y={22}
              textAnchor="end"
              fontSize="10"
              fontWeight="bold"
              fill={isDarkMode ? '#34d399' : '#059669'}
              className="font-sans"
            >
              {isIsland
                ? '🛬 TUJUAN'
                : `🛬 TUJUAN (${layout.displayedTargetsCount} dari ${layout.totalDestinationsCount} Destinasi)`}
            </text>

            {/* FLOW RIBBONS */}
            <g className="ribbons-group">
              {layout.links.map((link: any) => {
                const isSelected = selectedNode
                  ? link.flow.source === selectedNode || link.flow.target === selectedNode
                  : false;
                const isHovered = hoveredLink === link.flow;
                const isNodeHovered = hoveredNode
                  ? link.flow.source === hoveredNode || link.flow.target === hoveredNode
                  : false;

                let opacity = isDarkMode ? 0.58 : 0.5;
                let stroke = 'none';
                let strokeWidth = 0;

                if (selectedNode) {
                  if (isSelected) {
                    opacity = 0.95;
                    stroke = isDarkMode ? '#ffffff' : '#0f172a';
                    strokeWidth = 1;
                  } else {
                    opacity = 0.08;
                  }
                } else if (hoveredLink) {
                  if (isHovered) {
                    opacity = 0.95;
                    stroke = isDarkMode ? '#ffffff' : '#0f172a';
                    strokeWidth = 1;
                  } else {
                    opacity = 0.12;
                  }
                } else if (hoveredNode) {
                  if (isNodeHovered) {
                    opacity = 0.95;
                    stroke = isDarkMode ? '#ffffff' : '#0f172a';
                    strokeWidth = 0.8;
                  } else {
                    opacity = 0.12;
                  }
                }

                return (
                  <path
                    key={link.id}
                    d={link.pathD}
                    fill={`url(#${link.id})`}
                    opacity={opacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={(e) => handleLinkMouseEnter(e, link)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(link.flow.source);
                    }}
                  />
                );
              })}
            </g>

            {/* NODE BARS & LABELS (High readability, single line, 100% immune to cut-off) */}
            <g className="nodes-group">
              {layout.nodes.map((node) => {
                const isNodeActive = selectedNode === node.name;
                const isConnected = selectedNode
                  ? layout.links.some(
                      (l: any) =>
                        (l.flow.source === selectedNode && l.flow.target === node.name) ||
                        (l.flow.target === selectedNode && l.flow.source === node.name)
                    )
                  : true;

                const opacity = selectedNode ? (isNodeActive || isConnected ? 1 : 0.35) : 1;
                const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
                const subColor = isDarkMode ? '#94a3b8' : '#64748b';

                const paxStr = `${formatDecimal(node.value / 1000, 1)}k`;
                const cleanName = cleanAirportName(node.name);

                return (
                  <g
                    key={`${node.name}-${node.isSource ? 'src' : 'dst'}`}
                    opacity={opacity}
                    className="cursor-pointer transition-opacity duration-150"
                    onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node.name);
                    }}
                  >
                    {/* Node Rectangle */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={14}
                      height={node.height}
                      rx={3}
                      fill={node.color}
                      stroke={isNodeActive ? '#f59e0b' : '#ffffff'}
                      strokeWidth={isNodeActive ? 2 : 0.5}
                      className="hover:brightness-125 transition-all"
                    />

                    {/* Clean unclipped typography with ample margin */}
                    {node.height >= 30 ? (
                      <>
                        <text
                          x={node.isSource ? node.x - 7 : node.x + 14 + 7}
                          y={node.y + node.height / 2 - 2}
                          textAnchor={node.isSource ? 'end' : 'start'}
                          fontSize="9.5"
                          fontWeight="700"
                          fill={textColor}
                          className="font-sans"
                        >
                          {cleanName}
                        </text>
                        <text
                          x={node.isSource ? node.x - 7 : node.x + 14 + 7}
                          y={node.y + node.height / 2 + 10}
                          textAnchor={node.isSource ? 'end' : 'start'}
                          fontSize="8"
                          fill={subColor}
                          className="font-mono font-medium"
                        >
                          {paxStr} pax
                        </text>
                      </>
                    ) : (
                      <text
                        x={node.isSource ? node.x - 7 : node.x + 14 + 7}
                        y={node.y + node.height / 2 + 3.5}
                        textAnchor={node.isSource ? 'end' : 'start'}
                        fontSize="9.5"
                        fontWeight="600"
                        fill={textColor}
                        className="font-sans"
                      >
                        {cleanName}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* FLOATING FROSTED GLASS TOOLTIP */}
        {tooltip.visible && (
          <div
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            className="absolute z-50 pointer-events-none backdrop-blur-md bg-slate-900/95 text-white border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-w-xs space-y-1.5 transition-all duration-75"
          >
            <div className="font-bold text-sm border-b border-slate-700/80 pb-1 flex items-center justify-between gap-3">
              <span className="truncate">{tooltip.title}</span>
              {tooltip.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-700/60 font-semibold shrink-0">
                  {tooltip.badge}
                </span>
              )}
            </div>

            <div className="space-y-1 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-sans">Volume Penumpang:</span>
                <span className="font-bold text-white">{formatNumber(tooltip.pax)} pax</span>
              </div>
              {tooltip.flights !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-sans">Frekuensi Terbang:</span>
                  <span className="font-semibold text-emerald-400">{formatNumber(tooltip.flights)} flight</span>
                </div>
              )}
              {tooltip.density !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-sans">Kepadatan Rata-rata:</span>
                  <span className="font-semibold text-purple-300">{tooltip.density} pax/flight</span>
                </div>
              )}
              <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-sans">Pangsa dari Total:</span>
                <span className="font-bold text-sky-400">{tooltip.share}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. STRATEGIC ANALYSIS CALLOUT BOX */}
        <div className="mt-4 p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">💡</span>
            <h4 className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
              {isIsland
                ? 'Analisis Konektivitas Wilayah Antar-Pulau Nusantara'
                : 'Analisis Koridor Penumpang (Arus Hub Terbesar)'}
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {isIsland
              ? 'Koridor Jawa ⇄ Sumatera merupakan jembatan udara terpadat di Indonesia dengan mendekati 1 juta penumpang (968.795 pax), diikuti Jawa ⇄ Bali-Nusra (648k pax) dan Jawa ⇄ Kalimantan (616k pax). Arus intra-Jawa sendiri mencapai 527k pax dengan rute utama Surabaya, Semarang, dan Solo.'
              : 'Koridor Jakarta (CGK) memegang peranan sebagai megahub sentral Indonesia dengan menyerap lebih dari 62% pergerakan penumpang domestik. Aliran terbesar terjadi pada poros segitiga emas: Jakarta ⇄ Denpasar (266k pax), Jakarta ⇄ Surabaya (202k pax), dan Jakarta ⇄ Medan (195k pax).'}
          </p>
        </div>
      </div>
    </div>
  );
};
