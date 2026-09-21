import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  X,
  Search,
  Filter,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen,
  SlidersHorizontal,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  HelpCircle,
  BarChart2,
  Play as PlayIcon,
  Columns3,
  Scale,
} from 'lucide-react';
import { Play, PlayType, Direction } from '../types';
import {
  FORMATION_GALLERY_ITEMS,
  PERSONNEL_GROUPINGS,
  FormationGalleryItem,
  PersonnelGroupingId,
  detectPlayFormationFamily,
  detectPlayPersonnelGrouping,
} from '../data/formationGalleryData';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';

interface FormationGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay: (play: Play) => void;
  currentSelectedPlay?: Play;
  onApplyFormationFilterToPlaybook?: (formationId: string, category: string) => void;
}

export const FormationGalleryModal: React.FC<FormationGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
  currentSelectedPlay,
  onApplyFormationFilterToPlaybook,
}) => {
  // Navigation & Filtering State
  const [selectedFormationId, setSelectedFormationId] = useState<string>('trips');
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<PersonnelGroupingId>('ALL');
  const [playTypeFilter, setPlayTypeFilter] = useState<PlayType | 'ALL'>('ALL');
  const [directionFilter, setDirectionFilter] = useState<Direction | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareFormationId, setCompareFormationId] = useState<string>('spread_twins');

  // Sync initial formation with active play when modal opens
  useEffect(() => {
    if (isOpen && currentSelectedPlay) {
      const family = detectPlayFormationFamily(currentSelectedPlay);
      setSelectedFormationId(family);
    }
  }, [isOpen, currentSelectedPlay]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Active formation item
  const activeFormation = useMemo(() => {
    return FORMATION_GALLERY_ITEMS.find((f) => f.id === selectedFormationId) || FORMATION_GALLERY_ITEMS[0];
  }, [selectedFormationId]);

  // Comparison formation item
  const compareFormation = useMemo(() => {
    return FORMATION_GALLERY_ITEMS.find((f) => f.id === compareFormationId) || FORMATION_GALLERY_ITEMS[1];
  }, [compareFormationId]);

  // Count plays in each formation
  const formationPlayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FORMATION_GALLERY_ITEMS.forEach((f) => {
      counts[f.id] = 0;
    });

    ALL_PLAYBOOK_PLAYS.forEach((play) => {
      const fam = detectPlayFormationFamily(play);
      if (counts[fam] !== undefined) {
        counts[fam]++;
      }
    });

    return counts;
  }, []);

  // Filter plays based on active formation, personnel, type, direction & search
  const filteredPlaysForActiveFormation = useMemo(() => {
    return ALL_PLAYBOOK_PLAYS.filter((play) => {
      // Formation check
      const fam = detectPlayFormationFamily(play);
      if (fam !== selectedFormationId) {
        return false;
      }

      // Personnel filter
      if (selectedPersonnelId !== 'ALL') {
        const pGroup = detectPlayPersonnelGrouping(play);
        if (pGroup !== selectedPersonnelId) {
          return false;
        }
      }

      // Play Type filter
      if (playTypeFilter !== 'ALL' && play.playType !== playTypeFilter) {
        return false;
      }

      // Direction filter
      if (directionFilter !== 'ALL' && play.direction !== directionFilter && play.direction !== 'BALANCED') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = play.code.toLowerCase().includes(q);
        const matchName = play.englishName.toLowerCase().includes(q);
        const matchConcept = play.conceptName?.toLowerCase().includes(q) || false;
        const matchNumber = String(play.playNumber).includes(q);
        const matchTags = play.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchCode && !matchName && !matchConcept && !matchNumber && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [selectedFormationId, selectedPersonnelId, playTypeFilter, directionFilter, searchQuery]);

  // Plays for comparison formation
  const filteredPlaysForCompareFormation = useMemo(() => {
    if (!isCompareMode) return [];
    return ALL_PLAYBOOK_PLAYS.filter((play) => {
      const fam = detectPlayFormationFamily(play);
      return fam === compareFormationId;
    });
  }, [isCompareMode, compareFormationId]);

  if (!isOpen) return null;

  // Mini Alignment Field Renderer
  const renderAlignmentField = (item: FormationGalleryItem, height = 'h-48 sm:h-56') => {
    return (
      <div className={`relative w-full ${height} bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex flex-col justify-end p-2 select-none`}>
        {/* Field Markings & LOS */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Line of Scrimmage (LOS) */}
        <div className="absolute top-[35%] left-0 right-0 h-[1.5px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] flex items-center justify-between px-2">
          <span className="text-[9px] font-mono font-bold text-blue-400">LOS</span>
          <span className="text-[8px] font-mono text-blue-300/80">YARD 0 (BALL)</span>
          <span className="text-[9px] font-mono font-bold text-blue-400">LOS</span>
        </div>

        {/* 5-Yard Depth Mark */}
        <div className="absolute top-[65%] left-0 right-0 border-b border-dashed border-slate-700/60 flex items-center justify-between px-2 pointer-events-none">
          <span className="text-[8px] font-mono text-slate-500">-5 YDS</span>
          <span className="text-[8px] font-mono text-slate-500">-5 YDS</span>
        </div>

        {/* Player Alignment Tokens */}
        <div className="relative w-full h-full">
          {item.alignmentCoordinates.map((player) => {
            // Map percentage coordinates
            const posX = player.x;
            // Map field y (65 is LOS top 35%, 75 is 60%, 80 is 75%)
            const posY = ((player.y - 50) / 45) * 100;

            const isOL = player.posType === 'OL';
            const isQB = player.posType === 'QB';
            const isRB = player.posType === 'RB';
            const isWR = player.posType === 'WR';
            const isTE = player.posType === 'TE';

            let tokenBg = 'bg-blue-600 border-blue-300 text-white';
            if (isOL) tokenBg = 'bg-slate-700 border-slate-400 text-white';
            if (isQB) tokenBg = 'bg-amber-500 border-amber-300 text-slate-950 font-black';
            if (isRB) tokenBg = 'bg-emerald-600 border-emerald-300 text-white font-bold';
            if (isTE) tokenBg = 'bg-purple-600 border-purple-300 text-white font-bold';

            return (
              <div
                key={player.id}
                style={{
                  left: `${posX}%`,
                  top: `${Math.min(90, Math.max(10, posY))}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex flex-col items-center group cursor-pointer"
                title={`${player.label} (${player.role})`}
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold shadow-md border-2 transition-transform group-hover:scale-115 ${tokenBg}`}
                >
                  {player.label.split(' ')[0]}
                </div>
                <span className="text-[8px] font-mono text-slate-300 whitespace-nowrap mt-0.5 bg-slate-950/80 px-1 rounded opacity-80 group-hover:opacity-100">
                  {player.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-1 mt-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 border border-slate-400 inline-block"></span>OL</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-300 inline-block"></span>QB</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 border border-emerald-300 inline-block"></span>RB</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 border border-blue-300 inline-block"></span>WR</span>
          </div>
          <span className="font-bold text-slate-300">{item.personnelCode}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      id="formation-gallery-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  8v8 Formation Gallery &amp; Personnel Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {ALL_PLAYBOOK_PLAYS.length} TOTAL PLAYS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Explore offensive alignments, analyze personnel groupings (00, 10, 11, 20, 12), and filter plays by formation structure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Toggle */}
            <button
              id="formation-compare-toggle-btn"
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompareMode
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Compare two formations side-by-side"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompareMode ? 'Exit Compare' : 'Compare Formations'}</span>
            </button>

            {/* Close Button */}
            <button
              id="close-formation-gallery-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= TOP PERSONNEL GROUPING FILTER BAR ================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>PERSONNEL:</span>
            </span>
            {PERSONNEL_GROUPINGS.map((p) => {
              const isActive = selectedPersonnelId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonnelId(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                  title={p.description}
                >
                  {p.code}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px] max-w-xs flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plays in formation..."
              className="w-full bg-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ================= MAIN GALLERY BODY ================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Sidebar: Formation Family Tabs List */}
          <div className="w-full md:w-72 lg:w-80 bg-slate-50/70 border-r border-slate-200/90 flex flex-col shrink-0 overflow-y-auto p-3 space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1">
              8v8 Formations ({FORMATION_GALLERY_ITEMS.length})
            </div>

            {FORMATION_GALLERY_ITEMS.map((item) => {
              const isSelected = selectedFormationId === item.id;
              const count = formationPlayCounts[item.id] || 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFormationId(item.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                      : 'bg-white hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-xs sm:text-sm font-display text-slate-900 truncate">
                      {item.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {count} {count === 1 ? 'play' : 'plays'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.personnelCode}</span>
                    <span className="shrink-0 font-bold text-blue-600">{item.passRunRatio}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Center: Detailed Formation Overview & Plays Grid */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6 bg-slate-100/50">
            {/* If in Compare Mode, show side-by-side comparison cards */}
            {isCompareMode ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-purple-50 border border-purple-200 p-3 rounded-2xl text-purple-900 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <Scale className="w-4 h-4 text-purple-600" />
                    <span>Formation Comparison Mode Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">Comparing Against:</span>
                    <select
                      value={compareFormationId}
                      onChange={(e) => setCompareFormationId(e.target.value)}
                      className="bg-white border border-purple-300 rounded-lg px-2 py-1 font-bold text-xs focus:outline-none"
                    >
                      {FORMATION_GALLERY_ITEMS.map((f) => (
                        <option key={f.id} value={f.id} disabled={f.id === selectedFormationId}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left Formation in Comparison */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{activeFormation.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${activeFormation.colorScheme.badge}`}>
                        {activeFormation.personnelCode}
                      </span>
                    </div>
                    {renderAlignmentField(activeFormation, 'h-44')}
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="italic">{activeFormation.tagline}</p>
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        <span className="font-bold text-slate-800">Key Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {activeFormation.keyStrengths.slice(0, 3).map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <span className="font-bold text-slate-800">Best Against: </span>
                        <span>{activeFormation.bestVsCoverage.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Formation in Comparison */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{compareFormation.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${compareFormation.colorScheme.badge}`}>
                        {compareFormation.personnelCode}
                      </span>
                    </div>
                    {renderAlignmentField(compareFormation, 'h-44')}
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="italic">{compareFormation.tagline}</p>
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        <span className="font-bold text-slate-800">Key Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {compareFormation.keyStrengths.slice(0, 3).map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <span className="font-bold text-slate-800">Best Against: </span>
                        <span>{compareFormation.bestVsCoverage.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Single Formation Detailed View */
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-5">
                {/* Formation Banner Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black font-display text-slate-900">
                        {activeFormation.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${activeFormation.colorScheme.badge}`}>
                        {activeFormation.personnelCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {filteredPlaysForActiveFormation.length} Plays
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                      {activeFormation.tagline}
                    </p>
                  </div>

                  {/* Apply Filter to Playbook Button */}
                  {onApplyFormationFilterToPlaybook && (
                    <button
                      id="apply-formation-filter-to-playbook-btn"
                      onClick={() => {
                        onApplyFormationFilterToPlaybook(activeFormation.id, activeFormation.category);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 active:scale-95 cursor-pointer"
                      title="Filter main playbook explorer to this formation and close gallery"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter Playbook by {activeFormation.shortName}</span>
                    </button>
                  )}
                </div>

                {/* Two-Column Alignment & Tactical Breakdown Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Visual Mini-Field Alignment */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-600">
                      <span>8v8 PRE-SNAP ALIGNMENT</span>
                      <span className="text-blue-600 font-semibold">{activeFormation.alignmentCoordinates.length} Players</span>
                    </div>
                    {renderAlignmentField(activeFormation, 'h-52 sm:h-60')}
                    <p className="text-[11px] text-slate-500 font-mono italic">
                      {activeFormation.personnelDescription}
                    </p>
                  </div>

                  {/* Right Column: Tactical Philosophy, Strengths & Coverages */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Tactical Philosophy */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1">
                      <div className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tactical Philosophy</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {activeFormation.philosophy}
                      </p>
                    </div>

                    {/* Key Strengths Checklist */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wide">
                        Key Formation Strengths &amp; Advantages:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                        {activeFormation.keyStrengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Best Vs Coverages Badges & Vulnerability */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-slate-500">IDEAL VS:</span>
                        {activeFormation.bestVsCoverage.map((cov, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {cov}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] font-mono text-slate-500">
                        <span className="font-bold">RUN/PASS: </span>
                        <span className="font-bold text-slate-800">{activeFormation.passRunRatio}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= FORMATION PLAYS SUB-SECTION ================= */}
            <div className="space-y-4">
              {/* Filter controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 font-display">
                    {activeFormation.name} Plays ({filteredPlaysForActiveFormation.length})
                  </h4>
                </div>

                {/* Sub-filters: Type & Direction */}
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {/* Play Type Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    {(['ALL', 'PASS', 'RUN', 'SCREEN', 'PLAY_ACTION'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPlayTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                          playTypeFilter === type
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {type === 'ALL' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>

                  {/* Direction Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    {(['ALL', 'RIGHT', 'LEFT', 'BALANCED'] as const).map((dir) => (
                      <button
                        key={dir}
                        onClick={() => setDirectionFilter(dir)}
                        className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                          directionFilter === dir
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {dir === 'ALL' ? 'All Dir' : dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plays Grid */}
              {filteredPlaysForActiveFormation.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                  <p className="text-slate-500 text-sm font-medium">No plays matched the current filter criteria.</p>
                  <button
                    onClick={() => {
                      setPlayTypeFilter('ALL');
                      setDirectionFilter('ALL');
                      setSelectedPersonnelId('ALL');
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPlaysForActiveFormation.map((play) => {
                    const isSelected = currentSelectedPlay?.id === play.id;
                    const isPass = play.playType === 'PASS';
                    const isRun = play.playType === 'RUN';

                    return (
                      <div
                        key={play.id}
                        onClick={() => {
                          onSelectPlay(play);
                          onClose();
                        }}
                        className={`group bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer shadow-xs hover:shadow-md hover:border-blue-400 ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                            : 'border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Play Number, Code, & Badges */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                                #{play.playNumber}
                              </span>
                              <div>
                                <h5 className="font-bold text-xs sm:text-sm font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {play.code}
                                </h5>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {play.englishName}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                                isPass
                                  ? 'bg-blue-100 text-blue-800'
                                  : isRun
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {play.playType}
                            </span>
                          </div>

                          {/* Concept or Progression Read */}
                          {play.progressionReads && play.progressionReads.length > 0 && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                              <span className="font-bold text-blue-700">1st Read ({play.progressionReads[0].playerId}): </span>
                              {play.progressionReads[0].cue || play.progressionReads[0].concept}
                            </div>
                          )}

                          {/* Tags */}
                          {play.tags && play.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {play.tags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-slate-500">
                            {play.qbDrop || '3-Step Drop'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlay(play);
                              onClose();
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>Load &amp; Diagram</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
