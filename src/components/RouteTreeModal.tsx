import React, { useState } from 'react';
import { ROUTE_TREE, RouteDefinition } from '../data/routeTree';
import { X, BookOpen, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { generateRoutePoints } from '../data/routeGenerator';

interface RouteTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteTreeModal: React.FC<RouteTreeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteDefinition>(ROUTE_TREE[2]); // Default 2 - Slant

  if (!isOpen) return null;

  // Generate visual route path for the selected route on a mini-field
  const routePoints = generateRoutePoints(50, 65, selectedRoute.number, { isRightSide: true }).points;

  // Build SVG path
  let pathD = '';
  if (routePoints.length > 0) {
    pathD = `M ${routePoints[0].x} ${routePoints[0].y}`;
    for (let i = 1; i < routePoints.length; i++) {
      pathD += ` L ${routePoints[i].x} ${routePoints[i].y}`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <span>Official 8v8 Route Tree (0 - 9 System)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  Heittoreitit 0 - 9
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Standard route numbering, depths, break angles &amp; Finnish-English coaching specifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/40">
          {/* Left Column: Route Numbers Selector 0-9 & Specials */}
          <div className="md:col-span-5 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Route / Valitse reitti
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ROUTE_TREE.map((route) => {
                const isSelected = selectedRoute.number === route.number;
                return (
                  <button
                    key={`route-tree-${route.number}`}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 text-blue-950 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        #{route.number}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {route.depth}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      {route.name}
                    </div>
                    <div className="text-[10px] text-amber-700 font-sans mt-0.5 truncate font-medium">
                      {route.nameFi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Route Runner & Technical Specs */}
          <div className="md:col-span-7 space-y-4">
            {/* Visual Mini Field Display */}
            <div className="relative aspect-[16/11] bg-slate-900 rounded-2xl border border-slate-300 overflow-hidden shadow-sm flex items-center justify-center p-3">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <marker
                    id="route-tree-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>

                {/* Field Grid */}
                {[20, 35, 50, 65, 80].map((y) => (
                  <line
                    key={`mini-yard-${y}`}
                    x1="10"
                    y1={y}
                    x2="90"
                    y2={y}
                    stroke={y === 65 ? '#0284c7' : 'rgba(255,255,255,0.12)'}
                    strokeWidth={y === 65 ? '0.8' : '0.4'}
                    strokeDasharray={y === 65 ? undefined : '2,2'}
                  />
                ))}
                <text x="12" y="64" fontSize="2.8" fill="#38bdf8" fontWeight="bold" className="font-mono">
                  LOS (0 YDS / Aloituslinja)
                </text>
                <text x="12" y="49" fontSize="2.5" fill="rgba(255,255,255,0.4)" className="font-mono">
                  +5 YDS
                </text>
                <text x="12" y="34" fontSize="2.5" fill="rgba(255,255,255,0.4)" className="font-mono">
                  +10 YDS
                </text>
                <text x="12" y="19" fontSize="2.5" fill="rgba(255,255,255,0.4)" className="font-mono">
                  +15 YDS
                </text>

                {/* Receiver Alignment Token */}
                <circle cx="50" cy="65" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                <text x="50" y="66" textAnchor="middle" fontSize="2.4" fontWeight="bold" fill="#ffffff" className="font-mono">
                  WR
                </text>

                {/* Route Vector Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#route-tree-arrow)"
                />

                {/* Break point ring */}
                {routePoints.length >= 2 && (
                  <circle
                    cx={routePoints[routePoints.length - 1].x}
                    cy={routePoints[routePoints.length - 1].y}
                    r="3.5"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.5"
                    strokeDasharray="1,1"
                  />
                )}
              </svg>

              <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] font-mono text-sky-400 flex items-center gap-1.5 shadow-sm">
                <span>Route #{selectedRoute.number}:</span>
                <span className="font-bold text-white">{selectedRoute.name}</span>
                <span className="text-amber-400">({selectedRoute.nameFi})</span>
              </div>
            </div>

            {/* Technical Detail Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-2xs">
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{selectedRoute.name}</span>
                    <span className="text-amber-700 font-normal">({selectedRoute.nameFi})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                    Depth: {selectedRoute.depth}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                  {selectedRoute.description}
                </p>
                <p className="text-[11px] text-slate-500 italic mt-1 border-l-2 border-slate-300 pl-2">
                  {selectedRoute.descriptionFi}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Break Direction / Suunta</span>
                  <span className="font-semibold text-slate-800">{selectedRoute.breakDirection}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Coverage Beater / Tehokas vastaan</span>
                  <span className="font-semibold text-emerald-700">{selectedRoute.beaterAgainst}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
