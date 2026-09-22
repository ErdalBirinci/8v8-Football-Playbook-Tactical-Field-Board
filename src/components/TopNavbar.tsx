import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Shield,
  Users,
  GraduationCap,
  BookOpen,
  Languages,
  Zap,
  Dumbbell,
  PenTool,
  Sparkles,
  BarChart3,
  Printer,
  FileDown,
  ClipboardList,
  Columns,
  PieChart,
  HelpCircle,
  Radio,
  ChevronDown,
  Compass,
  Trophy,
  SlidersHorizontal,
  Flame,
  Search,
} from 'lucide-react';
import { DefenseScheme, RosterPlayer } from '../types';

interface TopNavbarProps {
  roster: RosterPlayer[];
  defenseScheme: DefenseScheme | null;
  totalPlaysCount: number;
  isAudibleBarOpen: boolean;
  onToggleAudibles: () => void;
  // Modals openers
  onOpenFormationGallery: () => void;
  onOpenDefensiveScout: () => void;
  onOpenRoster: () => void;
  onOpenCoachingTips: () => void;
  onOpenRouteTree: () => void;
  onOpenGlossary: () => void;
  onOpenQuiz: () => void;
  onOpenDrills: () => void;
  onOpenWhiteboard: () => void;
  onOpenDesigner: () => void;
  onOpenGamePlanStats: () => void;
  onOpenPrintLayout: () => void;
  onOpenWristband: () => void;
  onOpenCallSheet: () => void;
  onOpenComparison: () => void;
  onOpenTendency: () => void;
  onOpenFlashcardsQuiz: () => void;
}

type MenuCategoryId = 'tactics' | 'gameplan' | 'training' | 'playdesign';

export const TopNavbar: React.FC<TopNavbarProps> = ({
  roster,
  defenseScheme,
  totalPlaysCount,
  isAudibleBarOpen,
  onToggleAudibles,
  onOpenFormationGallery,
  onOpenDefensiveScout,
  onOpenRoster,
  onOpenCoachingTips,
  onOpenRouteTree,
  onOpenGlossary,
  onOpenQuiz,
  onOpenDrills,
  onOpenWhiteboard,
  onOpenDesigner,
  onOpenGamePlanStats,
  onOpenPrintLayout,
  onOpenWristband,
  onOpenCallSheet,
  onOpenComparison,
  onOpenTendency,
  onOpenFlashcardsQuiz,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<MenuCategoryId | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (cat: MenuCategoryId) => {
    setActiveDropdown((prev) => (prev === cat ? null : cat));
  };

  const closeDropdown = () => setActiveDropdown(null);

  const activeRosterCount = roster.filter((p) => p.assignedSlot).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs" ref={navRef}>
      <div className="max-w-[1720px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer">
            <img
              src="/aalto-predators-logo.svg"
              alt="Aalto Predators Helmet Logo"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain drop-shadow-md border border-red-600/30 bg-black p-0.5 transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight font-display text-slate-900 leading-tight">
                AALTO PREDATORS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                8v8 PLAYBOOK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden md:block">
              Finland University League • {totalPlaysCount} Tactical Plays
            </p>
          </div>
        </div>

        {/* Center / Right: Categorized, Organized Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Group 1: Tactics & Strategy Dropdown */}
          <div className="relative">
            <button
              id="top-nav-tactics-btn"
              type="button"
              onClick={() => toggleDropdown('tactics')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeDropdown === 'tactics'
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Formations, Scouting, Matchups & Play Comparison"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-600" />
              <span>Tactics &amp; Schemes</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === 'tactics' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'tactics' && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Schemes &amp; Formations
                </div>

                <button
                  id="top-formation-gallery-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenFormationGallery();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Formation Gallery</span>
                    <span className="text-[11px] text-slate-500 block">Empty, Trips, Spread, 2-Line</span>
                  </div>
                </button>

                <button
                  id="top-defense-scout-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenDefensiveScout();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">Defensive Scout</span>
                      {defenseScheme && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-100 text-rose-700 font-bold">
                          {defenseScheme.shortName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">Cover 0-6, Match &amp; Bracket</span>
                  </div>
                </button>

                <button
                  id="top-play-comparison-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenComparison();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Columns className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Play Comparison Matrix</span>
                    <span className="text-[11px] text-slate-500 block">Side-by-side play analyzer</span>
                  </div>
                </button>

                <button
                  id="top-offensive-tendency-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenTendency();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer border-t border-slate-100"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Offensive Tendencies</span>
                    <span className="text-[11px] text-slate-500 block">Run/Pass &amp; directional distribution</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: Game-Day & Scouting Dropdown */}
          <div className="relative">
            <button
              id="top-nav-gameday-btn"
              type="button"
              onClick={() => toggleDropdown('gameplan')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeDropdown === 'gameplan'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Game-day Call Sheets, Wristbands, Print Layouts & Game Plan Stats"
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
              <span>Game Day</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === 'gameplan' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'gameplan' && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Field &amp; Game Operations
                </div>

                <button
                  id="top-call-sheet-builder-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenCallSheet();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Call Sheet Builder</span>
                    <span className="text-[11px] text-slate-500 block">1st &amp; 10, 3rd Down, Red Zone</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeDropdown();
                    onOpenWristband();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Wristband Call Sheet</span>
                    <span className="text-[11px] text-slate-500 block">Wristband card PDF &amp; print format</span>
                  </div>
                </button>

                <button
                  id="top-game-plan-stats-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenGamePlanStats();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Game Plan Stats</span>
                    <span className="text-[11px] text-slate-500 block">Play distribution &amp; usage charts</span>
                  </div>
                </button>

                <button
                  id="top-print-layout-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenPrintLayout();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer border-t border-slate-100"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Print Layout (A4)</span>
                    <span className="text-[11px] text-slate-500 block">Clean, print-ready playbook</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: Training & Development Dropdown */}
          <div className="relative">
            <button
              id="top-nav-training-btn"
              type="button"
              onClick={() => toggleDropdown('training')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeDropdown === 'training'
                  ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Drills, Quizzes, Flashcards, Video Coaching Tips & Glossary"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Training &amp; Academy</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === 'training' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'training' && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Player Development &amp; Practice
                </div>

                <button
                  id="top-coaching-tips-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenCoachingTips();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Coaching Tips &amp; Video</span>
                    <span className="text-[11px] text-slate-500 block">Video breakdowns &amp; coaching notes</span>
                  </div>
                </button>

                <button
                  id="top-drill-generator-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenDrills();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Drill Generator</span>
                    <span className="text-[11px] text-slate-500 block">Cone &amp; station practice drills</span>
                  </div>
                </button>

                <button
                  id="top-flashcards-quiz-btn"
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenFlashcardsQuiz();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Position Flashcards</span>
                    <span className="text-[11px] text-slate-500 block">Position-specific route flashcards</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeDropdown();
                    onOpenQuiz();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Quiz Mode</span>
                    <span className="text-[11px] text-slate-500 block">Playbook mastery exam &amp; score</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeDropdown();
                    onOpenRouteTree();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer border-t border-slate-100"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Route Tree (0-9)</span>
                    <span className="text-[11px] text-slate-500 block">Classic numbered route tree</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeDropdown();
                    onOpenGlossary();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">EN-FI Glossary</span>
                    <span className="text-[11px] text-slate-500 block">English - Finnish football terminology</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Group 4: Drawing & Designer Tools */}
          <div className="relative">
            <button
              id="top-nav-design-btn"
              type="button"
              onClick={() => toggleDropdown('playdesign')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeDropdown === 'playdesign'
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              title="Whiteboard Drawing and Custom Play Designer"
            >
              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
              <span>Design &amp; Draw</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === 'playdesign' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'playdesign' && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Custom Plays &amp; Board
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenWhiteboard();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Coach Whiteboard</span>
                    <span className="text-[11px] text-slate-500 block">Freehand tactical chalkboard</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    onOpenDesigner();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Custom Play Designer</span>
                    <span className="text-[11px] text-slate-500 block">Create and test custom 8v8 plays</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-0.5" />

          {/* Primary Direct Action Buttons (Highlighted & High Utility) */}
          {/* Roster & Personnel */}
          <button
            id="top-roster-management-btn"
            type="button"
            onClick={onOpenRoster}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold border border-blue-500 flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 active:scale-95 cursor-pointer text-xs"
            title="Manage roster, jersey numbers, and depth chart"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Roster &amp; Depth Chart</span>
            <span className="sm:hidden">Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-800 text-blue-100">
              {activeRosterCount}/8
            </span>
          </button>

          {/* Quick Pre-Snap Audible Toggle */}
          <button
            id="top-pre-snap-audible-toggle-btn"
            type="button"
            onClick={onToggleAudibles}
            className={`px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 text-xs ${
              isAudibleBarOpen
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
            }`}
            title="Toggle pre-snap quick audible and hot-route switch bar"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audible HUD</span>
            <span className="sm:hidden">Audibles</span>
          </button>
        </div>
      </div>
    </header>
  );
};
