import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, PlayerAssignment, RosterPlayer, TimestampedCoachingCue, DefenseScheme } from '../types';
import { getPlayerAssignedToSlot, SAMPLE_ATHLETE_NAMES, getDefaultPositionNameForSlot } from '../data/rosterData';
import { getDrillsForPlay } from '../data/drillDatabase';
import { detectConceptsForPlay } from '../data/routeConceptsData';
import { getPlayAssignedCoverage, getDefenseSchemeById } from '../utils/defensiveScoutStorage';
import { PlayEffectivenessRadar } from './PlayEffectivenessRadar';
import { CoachingCuesSection } from './CoachingCuesSection';
import { analyzeTargetingHeatMap } from '../utils/targetingHeatmapAnalysis';
import {
  BookOpen,
  Target,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Download,
  Dumbbell,
  Clock,
  ArrowRight,
  Printer,
  Users,
  GraduationCap,
  Tv,
  Shield,
  Flame,
  Zap,
  TrendingUp,
  Layers,
  Activity,
  SlidersHorizontal,
  RotateCcw,
  Play as PlayIcon,
  Pause,
} from 'lucide-react';

interface TacticalDetailPanelProps {
  play: Play;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string | null) => void;
  onOpenRouteTree?: () => void;
  onOpenDrills?: () => void;
  onOpenPrintLayout?: () => void;
  roster?: RosterPlayer[];
  onOpenRoster?: () => void;
  onOpenCoachingTips?: () => void;
  onToggleCoachingOverlay?: () => void;
  isCoachingOverlayOpen?: boolean;
  currentProgress?: number;
  isPlaying?: boolean;
  onSeekProgress?: (progress: number) => void;
  onTogglePlay?: () => void;
  onUpdatePlayCues?: (cues: TimestampedCoachingCue[]) => void;
  onOpenDefensiveScout?: () => void;
  activeDefenseScheme?: DefenseScheme | null;
  showTargetingHeatmap?: boolean;
  onToggleTargetingHeatmap?: () => void;
  heatmapSensitivity?: number;
  onHeatmapSensitivityChange?: (sensitivity: number) => void;
  heatmapTimeTracking?: boolean;
  onToggleHeatmapTimeTracking?: () => void;
}

export const TacticalDetailPanel: React.FC<TacticalDetailPanelProps> = ({
  play,
  selectedPlayerId,
  onSelectPlayer,
  onOpenRouteTree,
  onOpenDrills,
  onOpenPrintLayout,
  roster = [],
  onOpenRoster,
  onOpenCoachingTips,
  onToggleCoachingOverlay,
  isCoachingOverlayOpen = false,
  currentProgress = 0,
  isPlaying = false,
  onSeekProgress,
  onTogglePlay,
  onUpdatePlayCues,
  onOpenDefensiveScout,
  activeDefenseScheme,
  showTargetingHeatmap,
  onToggleTargetingHeatmap,
  heatmapSensitivity,
  onHeatmapSensitivityChange,
  heatmapTimeTracking,
  onToggleHeatmapTimeTracking,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [internalHeatmap, setInternalHeatmap] = useState(false);
  const isHeatmapActive = showTargetingHeatmap !== undefined ? showTargetingHeatmap : internalHeatmap;

  const [internalSensitivity, setInternalSensitivity] = useState(1.0);
  const currentSensitivity = heatmapSensitivity !== undefined ? heatmapSensitivity : internalSensitivity;

  const [internalTimeTracking, setInternalTimeTracking] = useState(true);
  const isHeatmapTimeTracking = heatmapTimeTracking !== undefined ? heatmapTimeTracking : internalTimeTracking;

  const handleSensitivityChange = (val: number) => {
    const clamped = Math.max(0.5, Math.min(1.5, Math.round(val * 100) / 100));
    if (onHeatmapSensitivityChange) {
      onHeatmapSensitivityChange(clamped);
    } else {
      setInternalSensitivity(clamped);
    }
  };

  const handleToggleHeatmap = () => {
    if (onToggleTargetingHeatmap) {
      onToggleTargetingHeatmap();
    } else {
      setInternalHeatmap(!internalHeatmap);
    }
  };

  const handleToggleTimeTracking = () => {
    if (onToggleHeatmapTimeTracking) {
      onToggleHeatmapTimeTracking();
    } else {
      setInternalTimeTracking(!internalTimeTracking);
    }
  };

  // Assigned defensive coverage scout data
  const assignedScout = useMemo(() => getPlayAssignedCoverage(play.id), [play.id]);
  const assignedScheme = useMemo(() => {
    if (assignedScout?.primarySchemeId) {
      return getDefenseSchemeById(assignedScout.primarySchemeId);
    }
    return null;
  }, [assignedScout]);

  // Dynamic Targeting Heat Map Analysis (Route progression success probability zones)
  // When isHeatmapTimeTracking is enabled, success probabilities and heat colors update
  // continuously as currentProgress animates, reflecting shifting coverage and receiver breaks.
  const targetingAnalysis = useMemo(() => {
    return analyzeTargetingHeatMap(
      play,
      activeDefenseScheme || assignedScheme,
      roster,
      currentSensitivity,
      currentProgress,
      isHeatmapTimeTracking
    );
  }, [play, activeDefenseScheme, assignedScheme, roster, currentSensitivity, currentProgress, isHeatmapTimeTracking]);

  // Detect applicable route concepts
  const matchedConcepts = useMemo(() => {
    return detectConceptsForPlay(play);
  }, [play]);

  // Get matched drills for this play
  const { primaryDrills, analysis } = useMemo(() => {
    return getDrillsForPlay(play);
  }, [play]);

  // Convert SVG to Canvas and export PNG image using canvas.toBlob
  const handleExportPNG = () => {
    const svgElement = document.getElementById('fieldboard-svg-canvas');
    if (!svgElement) return;

    setIsExporting(true);

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

      img.onload = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            setIsExporting(false);
            return;
          }

          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanCode = (play.code || 'play').replace(/[^a-zA-Z0-9_-]/g, '_');
          a.download = `${cleanCode}_8v8_diagram.png`;
          a.href = blobUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);

          setIsExporting(false);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 2500);
        }, 'image/png');
      };

      img.onerror = (err) => {
        console.error('Failed to render SVG to canvas image', err);
        setIsExporting(false);
      };
    } catch (err) {
      console.error('Error exporting play diagram PNG:', err);
      setIsExporting(false);
    }
  };

  return (
    <div
      id="tactical-detail-panel"
      className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-6"
    >
      {/* Header Info & Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {play.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {play.direction}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
              {play.playType}
            </span>
            {play.qbDrop && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                Drop: {play.qbDrop}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            {play.code}
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            {play.englishName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Targeting Heat Map Overlay Toggle Button */}
          <button
            id="panel-targeting-heatmap-toggle-btn"
            onClick={handleToggleHeatmap}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer border ${
              isHeatmapActive
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 text-white border-amber-300 shadow-amber-600/30 ring-2 ring-amber-400/40'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
            }`}
            title="Toggle Targeting Heat Map overlay analyzing progression success probability zones"
          >
            <Flame className={`w-4 h-4 ${isHeatmapActive ? 'text-amber-200 animate-pulse' : 'text-amber-600'}`} />
            <span>Targeting Heat Map</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                isHeatmapActive
                  ? 'bg-amber-900/50 text-amber-200 border border-amber-300/40'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isHeatmapActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {onOpenPrintLayout && (
            <button
              id="print-play-sheet-btn"
              onClick={onOpenPrintLayout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Open clean, printer-friendly A4 / Letter installation layout"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print Layout (A4/Letter)</span>
            </button>
          )}

          <button
            id="download-play-diagram-btn"
            onClick={handleExportPNG}
            disabled={isExporting}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              downloadSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
            title="Download current play diagram as high-resolution PNG image"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Diagram Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Diagram (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Concept & Description */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tactical Concept</span>
          </div>

          {onOpenCoachingTips && (
            <button
              id="open-coaching-tips-detail-btn"
              onClick={onOpenCoachingTips}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Coaching Video &amp; Tips</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          {play.description}
        </p>

        {/* Matched Concept Badges & Quick HUD Overlay Toggle */}
        {matchedConcepts.length > 0 && (
          <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 font-medium">Concept:</span>
              {matchedConcepts.map((concept) => (
                <button
                  key={`panel-concept-${concept.id}`}
                  onClick={onOpenCoachingTips}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 transition-all cursor-pointer flex items-center gap-1"
                  title={`View ${concept.name} video tutorial & coach breakdown`}
                >
                  <span>{concept.name}</span>
                  <Tv className="w-2.5 h-2.5 opacity-70" />
                </button>
              ))}
            </div>

            {onToggleCoachingOverlay && (
              <button
                id="panel-toggle-overlay-hud-btn"
                onClick={onToggleCoachingOverlay}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  isCoachingOverlayOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>{isCoachingOverlayOpen ? 'HUD Overlay (ON)' : 'Field Video HUD'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Play Effectiveness Radar Profile (Recharts) */}
      <PlayEffectivenessRadar play={play} />

      {/* Defensive Coverage Scout Quick Banner */}
      <div
        id="tactical-panel-defensive-scout-box"
        className="bg-rose-50/60 border border-rose-200/90 rounded-2xl p-3.5 sm:p-4 space-y-2.5 transition-all"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900">
                  Defensive Scout &amp; Coverage Matchup
                </h4>
                {assignedScheme && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Default: {assignedScheme.shortName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                {assignedScheme
                  ? `Configured: ${assignedScheme.name}`
                  : 'No specific defense pinned to this play yet (Click to scout)'}
              </p>
            </div>
          </div>

          {onOpenDefensiveScout && (
            <button
              id="tactical-panel-launch-defense-scout-btn"
              onClick={onOpenDefensiveScout}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/20 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Scout Coverages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {assignedScout?.notes && (
          <div className="bg-white/80 rounded-xl p-2.5 border border-rose-200/60 text-xs font-mono text-slate-700">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Scout Keys &amp; Alerts:</span>
            <p className="text-[11px] text-slate-600 whitespace-pre-line mt-0.5">{assignedScout.notes}</p>
          </div>
        )}
      </div>

      {/* Timestamped Coaching Cues (Interactive Animation Timeline Cues) */}
      <CoachingCuesSection
        play={play}
        currentProgress={currentProgress}
        isPlaying={isPlaying}
        onSeekProgress={onSeekProgress}
        onTogglePlay={onTogglePlay}
        roster={roster}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={onSelectPlayer}
        onUpdatePlayCues={onUpdatePlayCues}
      />

      {/* QB Progression Reads */}
      {play.progressionReads && play.progressionReads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>QB Progression Reads</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="panel-progression-heatmap-toggle-link"
                onClick={handleToggleHeatmap}
                className={`text-[11px] font-mono font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isHeatmapActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                }`}
                title="Toggle Success Probability Heat Map overlay on field"
              >
                <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'text-slate-950' : 'text-amber-600'}`} />
                <span>{isHeatmapActive ? 'Heat Map: ON' : 'Overlay Success Zones'}</span>
              </button>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Rhythm Timing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {play.progressionReads.map((read) => (
              <div
                key={`read-${read.order}`}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedPlayerId === read.playerId
                    ? 'bg-emerald-50/80 border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
                onClick={() => onSelectPlayer(read.playerId || null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                    READ #{read.order}
                  </span>
                  {read.playerId && (
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Target: <span className="text-slate-900 font-black">{read.playerId}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800">{read.concept}</div>
                {read.cue && (
                  <div className="text-[11px] text-slate-600 mt-1 italic">
                    Key: &ldquo;{read.cue}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targeting Heat Map Overlay & Route Progression Success Analysis Section */}
      <AnimatePresence>
        {isHeatmapActive && (
          <motion.div
            key="tactical-targeting-heatmap-panel"
            id="tactical-targeting-heatmap-panel"
            initial={{ opacity: 0, y: -10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 text-white shadow-2xl space-y-4 transition-all duration-300 ease-in-out"
          >
            {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                <Flame className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider font-mono">
                    Targeting Heat Map • Success Probability
                  </h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/60 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE ON FIELD
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Target zones calculated via receiver separation, route leverage &amp; defensive coverage voids.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleHeatmap}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              Hide Heatmap
            </button>
          </div>

          {/* Gradient Sensitivity & Intensity Slider Control */}
          <div
            id="panel-targeting-heatmap-sensitivity-control"
            className="bg-slate-900/90 rounded-xl p-3.5 border border-amber-500/40 shadow-sm space-y-2.5 font-mono"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Gradient Sensitivity
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-amber-500/40 font-bold">
                  {Math.round(currentSensitivity * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {currentSensitivity > 1.1
                    ? '(Aggressive / High Sensitivity)'
                    : currentSensitivity < 0.9
                    ? '(Strict / Conservative)'
                    : '(Standard / Balanced)'}
                </span>
              </div>

              {/* Sensitivity Preset Buttons */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSensitivityChange(0.7)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    Math.abs(currentSensitivity - 0.7) < 0.04
                      ? 'bg-sky-600 text-white border border-sky-400 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Conservative threshold calibration: High success requires higher completion rate"
                >
                  Strict (70%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSensitivityChange(1.0)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    Math.abs(currentSensitivity - 1.0) < 0.04
                      ? 'bg-amber-600 text-white border border-amber-400 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Standard default threshold calibration (Red ≥ 78%, Yellow 65%–77%)"
                >
                  Standard (100%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSensitivityChange(1.3)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    Math.abs(currentSensitivity - 1.3) < 0.04
                      ? 'bg-rose-600 text-white border border-rose-400 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Aggressive sensitivity: Lowers hurdles for Red and Yellow probability zones"
                >
                  High (130%)
                </button>
                {Math.abs(currentSensitivity - 1.0) >= 0.04 && (
                  <button
                    type="button"
                    onClick={() => handleSensitivityChange(1.0)}
                    className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer ml-0.5"
                    title="Reset sensitivity to 100%"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Slider Track and Range Input */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">Strict (50%)</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  id="heatmap-intensity-slider"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={currentSensitivity}
                  onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400/60"
                  aria-label="Targeting heat map gradient sensitivity slider"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold shrink-0">Aggressive (150%)</span>
            </div>

            <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
              Adjusts the gradient sensitivity of the success probability colors (Red-Yellow-Blue). Higher sensitivity lowers the threshold for high-confidence (Red) targeting windows.
            </p>
          </div>

          {/* Dynamic Play Timeline Animation Setting & Shifting Coverage Tracking */}
          <div
            id="panel-targeting-heatmap-animation-setting"
            className="bg-slate-900/90 rounded-xl p-3.5 border border-emerald-500/40 shadow-sm space-y-3 font-mono"
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isHeatmapTimeTracking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Heatmap Animation Setting
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                  isHeatmapTimeTracking
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isHeatmapTimeTracking ? 'LIVE TIMELINE SYNC (ON)' : 'STATIC OVERALL (OFF)'}
                </span>
              </div>

              {/* Toggle Animation Setting Button */}
              <button
                type="button"
                id="toggle-heatmap-timeline-animation-btn"
                onClick={handleToggleTimeTracking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isHeatmapTimeTracking
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
                title="Toggle real-time heatmap probability and color updates along the play timeline"
              >
                <span>{isHeatmapTimeTracking ? 'Animation Tracking: ON' : 'Enable Animation Sync'}</span>
              </button>
            </div>

            <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed">
              Dynamically updates success probability colors (Red-Yellow-Blue) as the play animation progresses through time, showing how receiver route breaks and coverage shifts open or constrict target zones.
            </p>

            {isHeatmapTimeTracking && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {/* Active Play Timestamp & Phase */}
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">Play Time:</span>
                    <span className="font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      {(currentProgress * 3.5).toFixed(1)}s / 3.5s
                    </span>
                    <span className="text-[11px] text-amber-300 font-sans">
                      {targetingAnalysis.timelinePhaseDescription}
                    </span>
                  </div>

                  {/* Play / Pause sync control */}
                  {onTogglePlay && (
                    <button
                      type="button"
                      onClick={onTogglePlay}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-3 h-3 text-emerald-400" />
                          <span>Play Animation</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Quick Timeline Scrub Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 mr-0.5">Jump To:</span>
                  {[
                    { label: 'Snap (0.0s)', progress: 0.0 },
                    { label: 'Stem (0.7s)', progress: 0.20 },
                    { label: 'Break (1.4s)', progress: 0.40 },
                    { label: 'Peak Window (2.0s)', progress: 0.58 },
                    { label: 'Late Squeeze (2.8s)', progress: 0.80 },
                    { label: 'Checkdown (3.3s)', progress: 0.95 },
                  ].map((phase) => (
                    <button
                      key={`phase-${phase.label}`}
                      type="button"
                      onClick={() => onSeekProgress?.(phase.progress)}
                      className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                        Math.abs(currentProgress - phase.progress) < 0.08
                          ? 'bg-emerald-600 text-white font-bold border border-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>

                {/* Live Defensive Coverage Shift Status Banner */}
                {targetingAnalysis.coverageShiftSummary && (
                  <div className="bg-slate-950/90 rounded-lg p-2.5 border border-emerald-500/30 flex items-start gap-2 text-xs">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                        Live Coverage Shift Dynamics:
                      </span>
                      <p className="text-[11px] text-slate-300 leading-snug font-sans mt-0.5">
                        {targetingAnalysis.coverageShiftSummary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Color Intensity Legend Strip */}
          <div
            id="panel-targeting-heatmap-legend"
            className="bg-slate-900/90 rounded-xl px-3.5 py-2 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono"
          >
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              Heatmap Color Intensity:
            </span>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5" title={`High success probability (≥${targetingAnalysis.highThreshold ?? 78}%)`}>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs ring-1 ring-rose-400/80 inline-block shrink-0" />
                <span className="text-slate-200">
                  <strong className="text-rose-400 font-bold">Red</strong> = High Success <span className="text-slate-400 text-[10px]">(≥{targetingAnalysis.highThreshold ?? 78}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5" title={`Moderate success probability (${targetingAnalysis.moderateThreshold ?? 65}%–${(targetingAnalysis.highThreshold ?? 78) - 1}%)`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs ring-1 ring-amber-300/80 inline-block shrink-0" />
                <span className="text-slate-200">
                  <strong className="text-amber-400 font-bold">Yellow</strong> = Moderate <span className="text-slate-400 text-[10px]">({targetingAnalysis.moderateThreshold ?? 65}%–{(targetingAnalysis.highThreshold ?? 78) - 1}%)</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5" title={`Lower / contested completion probability (<${targetingAnalysis.moderateThreshold ?? 65}%)`}>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs ring-1 ring-sky-300/80 inline-block shrink-0" />
                <span className="text-slate-200">
                  <strong className="text-sky-400 font-bold">Blue</strong> = Low <span className="text-slate-400 text-[10px]">(&lt;{targetingAnalysis.moderateThreshold ?? 65}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 rounded-xl p-3 border border-rose-500/40">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-rose-400" />
                <span>Primary Window (Read #1)</span>
              </div>
              <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                {targetingAnalysis.primaryWindowSuccess}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                First rhythm window (0.8s - 1.4s)
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-emerald-500/40">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Checkdown Safety Valve</span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {targetingAnalysis.checkdownSafetyRating}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                High-percentage outlet option
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-purple-500/40">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>Deep Shot / Explosive</span>
              </div>
              <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                {targetingAnalysis.deepShotPotential}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Vertical seam / post explosive leverage
              </div>
            </div>
          </div>

          {/* Coverage Insight Box */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-amber-500/30 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-mono font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                Defensive Coverage Matchup Read:
              </span>
              <p className="text-slate-200 leading-relaxed">
                {targetingAnalysis.bestCoverageMismatch}
              </p>
            </div>
          </div>

          {/* Targeted Receivers Progression Hierarchy */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Targeting Zones &amp; Route Leverage</span>
              <span className="text-[10px] text-slate-400">Click card to select receiver on field</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {targetingAnalysis.zones.map((zone) => {
                const isSelected = selectedPlayerId === zone.playerId;
                const assignedRosterPlayer = getPlayerAssignedToSlot(zone.playerId, roster);
                const isCustomPlayerName = assignedRosterPlayer && !SAMPLE_ATHLETE_NAMES.includes(assignedRosterPlayer.name);
                const displayName = isCustomPlayerName ? assignedRosterPlayer.name : zone.playerLabel;

                return (
                  <div
                    key={`targeting-zone-card-${zone.id}`}
                    onClick={() => onSelectPlayer(zone.playerId)}
                    className={`rounded-xl p-3 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-black border"
                          style={{
                            backgroundColor: `${zone.color}25`,
                            color: zone.color,
                            borderColor: `${zone.color}60`,
                          }}
                        >
                          READ #{zone.readOrder}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {displayName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ({zone.playerId})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-black" style={{ color: zone.color }}>
                        <span>{zone.successProbability}%</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">PROB</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${zone.successProbability}%`,
                          backgroundColor: zone.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
                      <span className="font-semibold text-slate-200">
                        {zone.routeName}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        Target Depth: <strong className="text-white font-bold">{zone.depthYards} yds</strong>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {zone.tacticalNote}
                    </p>

                    {/* Live Play Separation & Window Status (when dynamic timeline tracking is active) */}
                    {isHeatmapTimeTracking && zone.liveSeparationYards !== undefined && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              zone.targetPhase === 'OPEN_WINDOW'
                                ? 'bg-emerald-400 animate-pulse'
                                : zone.targetPhase === 'CHECKDOWN'
                                ? 'bg-amber-400'
                                : zone.targetPhase === 'STEM'
                                ? 'bg-sky-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="text-slate-300">Live Cushion:</span>
                          <strong className="text-emerald-400 font-bold">
                            +{zone.liveSeparationYards}y
                          </strong>
                          {zone.nearestDefenderName && (
                            <span className="text-slate-400">
                              (vs {zone.nearestDefenderName})
                            </span>
                          )}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            zone.targetPhase === 'OPEN_WINDOW'
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                              : zone.targetPhase === 'CHECKDOWN'
                              ? 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                              : zone.targetPhase === 'STEM'
                              ? 'bg-sky-950/90 text-sky-300 border border-sky-500/40'
                              : 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {zone.targetPhase === 'OPEN_WINDOW'
                            ? 'WINDOW OPEN'
                            : zone.targetPhase === 'CHECKDOWN'
                            ? 'SAFETY VALVE'
                            : zone.targetPhase === 'STEM'
                            ? 'STEM ROUTE'
                            : 'CONTESTED'}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">
                        {zone.coverageAdvantage}
                      </span>
                      <span className="text-slate-400 uppercase">
                        {zone.epaTier} EPA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Player Route & Assignment Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Player Assignments &amp; Routes</span>
          </div>
          <div className="flex items-center gap-3">
            {onOpenRoster && (
              <button
                id="panel-manage-roster-btn"
                onClick={onOpenRoster}
                className="text-[11px] font-mono text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Users className="w-3 h-3" />
                Manage Roster
              </button>
            )}
            {onOpenRouteTree && (
              <button
                onClick={onOpenRouteTree}
                className="text-[11px] font-mono text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                Route Tree (0-9)
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-500">
                <th className="py-2 px-2.5">Slot</th>
                <th className="py-2 px-2.5">Position / Assignment</th>
                <th className="py-2 px-2.5">Route / Action</th>
                <th className="py-2 px-2.5">Role Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
                const isSelected = selectedPlayerId === key;
                const assignedRosterPlayer = getPlayerAssignedToSlot(key, roster);

                const getPositionTitle = () => {
                  const normKey = key.toUpperCase();
                  if (normKey === 'QB') return 'Quarterback';
                  if (normKey === 'C') return 'Center';
                  if (normKey === 'LG') return 'Left Guard';
                  if (normKey === 'RG') return 'Right Guard';
                  if (normKey === 'X') return 'Wide Receiver (X)';
                  if (normKey === 'Z') return 'Wide Receiver (Z)';
                  if (normKey === 'Y') return 'Slot Receiver (Y)';
                  if (normKey === 'H') return 'Slot Receiver (H)';
                  if (normKey === 'W') return 'Wide Receiver (W)';
                  if (normKey === 'RB' || normKey === 'HB') return 'Running Back';
                  if (player?.positionName && player.positionName !== 'Player') return player.positionName;
                  return getDefaultPositionNameForSlot(key, player.label || key);
                };

                const posTitle = getPositionTitle();
                const isSampleName = assignedRosterPlayer && SAMPLE_ATHLETE_NAMES.includes(assignedRosterPlayer.name);
                const displayName = assignedRosterPlayer && !isSampleName ? assignedRosterPlayer.name : posTitle;

                return (
                  <tr
                    key={`table-pos-${key}`}
                    onClick={() => onSelectPlayer(isSelected ? null : key)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2 px-2.5 font-mono font-bold">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
                        {key}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="flex items-center gap-2">
                        {assignedRosterPlayer ? (
                          <>
                            <span
                              className="w-5 h-5 rounded-md font-mono text-[11px] font-black text-white flex items-center justify-center shadow-2xs shrink-0"
                              style={{ backgroundColor: assignedRosterPlayer.avatarColor || '#3b82f6' }}
                            >
                              #{assignedRosterPlayer.jerseyNumber}
                            </span>
                            <div>
                              <div className="text-slate-900 font-bold text-xs leading-none">
                                {displayName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {player.label}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {key}
                            </span>
                            <div>
                              <div className="text-slate-900 font-bold text-xs leading-none">
                                {posTitle}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {player.label}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2.5">
                      <span
                        className="font-mono font-bold"
                        style={{ color: player.route.color || '#2563eb' }}
                      >
                        {player.route.name}
                      </span>
                      {player.route.routeNumber !== undefined && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          #{player.route.routeNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                      {player.roleDescription}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Practice Drill Generator Recommendations */}
      {onOpenDrills && (
        <div className="bg-gradient-to-r from-amber-50/90 to-amber-100/60 rounded-xl p-4 border border-amber-300/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Suggested Practice Drills ({primaryDrills.length} Matched)
                </h4>
                <p className="text-[11px] text-amber-800">
                  Translate {play.code} routes into on-field practice periods
                </p>
              </div>
            </div>

            <button
              id="open-drills-from-detail-btn"
              onClick={onOpenDrills}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <span>Launch Drill Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {primaryDrills.slice(0, 3).map((drill) => (
              <div
                key={`mini-drill-${drill.id}`}
                onClick={onOpenDrills}
                className="p-2.5 rounded-lg bg-white/90 border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-800 font-bold">
                  <span className="truncate">{drill.category.replace('_', ' ')}</span>
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    {drill.estimatedMinutes}m
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {drill.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {drill.targetPositions.join(', ')} • {drill.difficulty.split('/')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Points */}
      {play.coachingPoints && play.coachingPoints.length > 0 && (
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Coaching Keys &amp; Technique</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 font-sans list-disc list-inside">
            {play.coachingPoints.map((pt, i) => (
              <li key={`coach-pt-${i}`} className="leading-relaxed">
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
