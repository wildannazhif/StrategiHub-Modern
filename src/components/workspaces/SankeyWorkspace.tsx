'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Share2, Plane, Users, Flame, Activity, RotateCcw, Filter, Compass } from 'lucide-react';
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

export const SankeyWorkspace: React.FC<SankeyWorkspaceProps> = ({ isDarkMode = false }) => {
  const [viewMode, setViewMode] = useState<'hub' | 'island'>('hub');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('ALL');
  const [minPaxThreshold, setMinPaxThreshold] = useState<number>(10000);
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

  // Filtered dataset
  const currentDataset = useMemo(() => {
    if (isIsland) {
      return ISLAND_FLOWS;
    }
    return HUB_FLOWS.filter((flow) => {
      const matchOrigin = selectedOrigin === 'ALL' || flow.source.startsWith(selectedOrigin);
      const matchPax = flow.value >= minPaxThreshold;
      return matchOrigin && matchPax;
    });
  }, [isIsland, selectedOrigin, minPaxThreshold]);

  // Aggregate KPI stats
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

  // Bipartite Sankey Layout Calculations (Generous vertical spacing to prevent crowding on mobile)
  const layout = useMemo(() => {
    if (!currentDataset || currentDataset.length === 0) {
      return { nodes: [], links: [], width: 1000, height: 600, totalValue: 0, padX: 190 };
    }

    const sourceMap: Record<string, number> = {};
    const targetMap: Record<string, number> = {};
    let totalValue = 0;

    currentDataset.forEach((l) => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + l.value;
      targetMap[l.target] = (targetMap[l.target] || 0) + l.value;
      totalValue += l.value;
    });

    const sources = Object.keys(sourceMap).sort((a, b) => sourceMap[b] - sourceMap[a]);
    const targets = Object.keys(targetMap).sort((a, b) => targetMap[b] - targetMap[a]);

    const minNodeH = isIsland ? 30 : 22;
    const nodeWidth = 24;
    const gap = isIsland ? 22 : 15;
    const padY = 55;
    const padX = isIsland ? 170 : 190;
    const width = 1000;

    // Minimum required height based on target nodes count to guarantee zero text overlap
    const minRequiredH = Math.max(
      sources.length * (minNodeH + gap) + padY * 2,
      targets.length * (minNodeH + gap) + padY * 2
    );

    const baseFlowHeight = Math.max(isIsland ? 720 : 860, minRequiredH - padY * 2);
    const height = Math.max(900, Math.ceil(baseFlowHeight + padY * 2 + 50));

    // Usable height
    const usableHeightS = height - 2 * padY - (sources.length - 1) * gap;
    const usableHeightT = height - 2 * padY - (targets.length - 1) * gap;

    const scaleS = Math.max(0.00001, usableHeightS / (totalValue || 1));
    const scaleT = Math.max(0.00001, usableHeightT / (totalValue || 1));

    const sourceNodes: Record<string, NodeItem> = {};
    let currY = padY;
    sources.forEach((s) => {
      const h = Math.max(sourceMap[s] * scaleS, minNodeH);
      const color = SANKEY_COLOR_MAP[s] || '#2563eb';
      sourceNodes[s] = { name: s, x: padX, y: currY, height: h, value: sourceMap[s], isSource: true, color };
      currY += h + gap;
    });

    const targetNodes: Record<string, NodeItem> = {};
    currY = padY;
    targets.forEach((t) => {
      const h = Math.max(targetMap[t] * scaleT, minNodeH);
      const color = SANKEY_COLOR_MAP[t] || '#10b981';
      targetNodes[t] = { name: t, x: width - padX - nodeWidth, y: currY, height: h, value: targetMap[t], isSource: false, color };
      currY += h + gap;
    });

    const sOffsets: Record<string, number> = {};
    const tOffsets: Record<string, number> = {};
    sources.forEach((s) => (sOffsets[s] = 0));
    targets.forEach((t) => (tOffsets[t] = 0));

    // Sort links descending so larger ribbons render cleanly
    const sortedLinks = [...currentDataset].sort((a, b) => b.value - a.value);

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

        const cSource = SANKEY_COLOR_MAP[l.source] || '#3b82f6';
        const cTarget = SANKEY_COLOR_MAP[l.target] || '#10b981';

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
    };
  }, [currentDataset, isIsland]);

  // Tooltip tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let left = e.clientX - rect.left + 15;
    let top = e.clientY - rect.top + 15;

    if (left + 260 > rect.width) {
      left = e.clientX - rect.left - 270;
    }
    if (top + 160 > rect.height) {
      top = e.clientY - rect.top - 150;
    }

    setTooltip((prev) => ({ ...prev, x: Math.max(10, left), y: Math.max(10, top) }));
  };

  const handleLinkMouseEnter = (e: React.MouseEvent, item: any) => {
    setHoveredLink(item.flow);
    handleMouseMove(e);
    setTooltip({
      visible: true,
      x: 0,
      y: 0,
      title: `${item.flow.source} ➔ ${item.flow.target}`,
      badge: 'Rute Langsung',
      pax: item.flow.value,
      flights: item.flow.flights,
      density: item.flow.flights > 0 ? (item.flow.value / item.flow.flights).toFixed(1) : '0',
      share: Number(item.sharePct),
    });
  };

  const handleNodeMouseEnter = (e: React.MouseEvent, node: NodeItem) => {
    setHoveredNode(node.name);
    handleMouseMove(e);
    setTooltip({
      visible: true,
      x: 0,
      y: 0,
      title: `${node.isSource ? '🛫 Titik Asal' : '🛬 Titik Tujuan'}: ${node.name}`,
      badge: node.isSource ? 'Origin Hub' : 'Destination',
      pax: node.value,
      share: Number(((node.value / (layout.totalValue || 1)) * 100).toFixed(1)),
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
    setSelectedNode(null);
    setSelectedOrigin('ALL');
    setMinPaxThreshold(10000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & VIEW MODE SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                SIASATI OD Udara Kemenhub
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Domestic 100%
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Diagram Alir Sankey: Arus Koridor Mobilitas Udara Nasional
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualisasi proporsional volume penumpang antarmoda dan konektivitas koridor udara antarpulau nusantara.
            </p>
          </div>

          {/* VIEW SWITCHER: AIRPORT HUBS VS INTER-ISLAND */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                setViewMode('hub');
                setSelectedNode(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'hub'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Arus Hub Bandara</span>
            </button>
            <button
              onClick={() => {
                setViewMode('island');
                setSelectedNode(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'island'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Arus Antar-Pulau</span>
            </button>
          </div>
        </div>

        {/* 2. EXECUTIVE METRIC STRIP (4 CARDS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Penumpang</span>
              <Users className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatNumber(kpiStats.totalPax)}
            </div>
            <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium mt-0.5">
              {isIsland ? 'Akumulasi Antarpulau' : 'Orang / Bulan Terpantau'}
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
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 mr-1 hidden sm:inline">Min. Pax:</span>
                {[
                  { val: 10000, label: 'Semua (≥ 10k)' },
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
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
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

      {/* 4. SANKEY DIAGRAM SVG CANVAS */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-5 shadow-2xs relative overflow-hidden"
      >
        <div className="w-full overflow-hidden rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-4">
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
              y={28}
              fontSize="12"
              fontWeight="bold"
              fill={isDarkMode ? '#60a5fa' : '#2563eb'}
              className="font-sans"
            >
              {isIsland ? '🛫 PULAU / WILAYAH ASAL' : '🛫 BANDARA ASAL (ORIGIN HUB)'}
            </text>

            <text
              x={layout.width - layout.padX}
              y={28}
              textAnchor="end"
              fontSize="12"
              fontWeight="bold"
              fill={isDarkMode ? '#34d399' : '#059669'}
              className="font-sans"
            >
              {isIsland ? '🛬 PULAU / WILAYAH TUJUAN' : '🛬 BANDARA TUJUAN (DESTINATION)'}
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

                let opacity = isDarkMode ? 0.58 : 0.50;
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

            {/* NODE BARS & LABELS (High readability, zero vertical overlap) */}
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
                      width={24}
                      height={node.height}
                      rx={5}
                      fill={node.color}
                      stroke={isNodeActive ? '#f59e0b' : '#ffffff'}
                      strokeWidth={isNodeActive ? 3 : 0.8}
                      className="hover:brightness-125 transition-all"
                    />

                    {/* Node Text Label (Single line if tight, two lines if tall) */}
                    {node.height >= 34 ? (
                      <>
                        <text
                          x={node.isSource ? node.x - 12 : node.x + 24 + 12}
                          y={node.y + node.height / 2 - 2}
                          textAnchor={node.isSource ? 'end' : 'start'}
                          fontSize="13"
                          fontWeight="700"
                          fill={textColor}
                          className="font-sans"
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.isSource ? node.x - 12 : node.x + 24 + 12}
                          y={node.y + node.height / 2 + 14}
                          textAnchor={node.isSource ? 'end' : 'start'}
                          fontSize="11"
                          fill={subColor}
                          className="font-mono font-medium"
                        >
                          {paxStr} pax
                        </text>
                      </>
                    ) : (
                      <text
                        x={node.isSource ? node.x - 12 : node.x + 24 + 12}
                        y={node.y + node.height / 2 + 4}
                        textAnchor={node.isSource ? 'end' : 'start'}
                        fontSize="12"
                        fontWeight="600"
                        fill={textColor}
                        className="font-sans"
                      >
                        {node.name}{' '}
                        <tspan fill={subColor} fontSize="11" fontWeight="normal" className="font-mono">
                          ({paxStr})
                        </tspan>
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
