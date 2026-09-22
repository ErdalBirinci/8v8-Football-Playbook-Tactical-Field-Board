import React, { useState, useMemo } from 'react';
import { Play, PlayerAssignment, RosterPlayer, TimestampedCoachingCue, DefenseScheme } from '../types';
import { getPlayerAssignedToSlot, SAMPLE_ATHLETE_NAMES, getDefaultPositionNameForSlot } from '../data/rosterData';
import { getDrillsForPlay } from '../data/drillDatabase';
import { detectConceptsForPlay } from '../data/routeConceptsData';
import { getPlayAssignedCoverage, getDefenseSchemeById } from '../utils/defensiveScoutStorage';
import { PlayEffectivenessRadar } from './PlayEffectivenessRadar';
import { CoachingCuesSection } from './CoachingCuesSection';
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
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Assigned defensive coverage scout data
  const assignedScout = useMemo(() => getPlayAssignedCoverage(play.id), [play.id]);
  const assignedScheme = useMemo(() => {
    if (assignedScout?.primarySchemeId) {
      return getDefenseSchemeById(assignedScout.primarySchemeId);
    }
    return null;
  }, [assignedScout]);

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
            <span className="text-[11px] font-mono text-slate-400">Rhythm Timing</span>
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
