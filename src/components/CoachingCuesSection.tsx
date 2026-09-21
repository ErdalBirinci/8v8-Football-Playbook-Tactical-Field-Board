import React, { useState, useEffect, useMemo } from 'react';
import { Play, TimestampedCoachingCue, RosterPlayer } from '../types';
import {
  getPlayCoachingCues,
  addPlayCoachingCue,
  updatePlayCoachingCue,
  deletePlayCoachingCue,
  resetPlayCoachingCues,
  CUE_CATEGORIES_META,
  TOTAL_ANIMATION_DURATION_SECONDS,
} from '../utils/coachingCuesStorage';
import { getPlayerAssignedToSlot } from '../data/rosterData';
import { AddCoachingCueModal } from './AddCoachingCueModal';
import {
  Clock,
  Plus,
  Zap,
  Play as PlayIcon,
  Pause,
  Edit2,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Target,
  Users,
  Filter,
  Volume2,
  Flame,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CoachingCuesSectionProps {
  play: Play;
  currentProgress?: number; // 0.0 to 1.0 from animation timeline
  isPlaying?: boolean;
  onSeekProgress?: (progress: number) => void;
  onTogglePlay?: () => void;
  roster?: RosterPlayer[];
  selectedPlayerId?: string | null;
  onSelectPlayer?: (id: string | null) => void;
  onUpdatePlayCues?: (cues: TimestampedCoachingCue[]) => void;
}

export const CoachingCuesSection: React.FC<CoachingCuesSectionProps> = ({
  play,
  currentProgress = 0,
  isPlaying = false,
  onSeekProgress,
  onTogglePlay,
  roster = [],
  selectedPlayerId,
  onSelectPlayer,
  onUpdatePlayCues,
}) => {
  const [cues, setCues] = useState<TimestampedCoachingCue[]>(() => getPlayCoachingCues(play));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cueToEdit, setCueToEdit] = useState<TimestampedCoachingCue | null>(null);
  const [filterPlayer, setFilterPlayer] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cues when play changes
  useEffect(() => {
    setCues(getPlayCoachingCues(play));
  }, [play.id]);

  // Listen to external cues updates
  useEffect(() => {
    const handleCuesUpdated = () => {
      setCues(getPlayCoachingCues(play));
    };
    window.addEventListener('playbook_cues_updated', handleCuesUpdated);
    return () => window.removeEventListener('playbook_cues_updated', handleCuesUpdated);
  }, [play.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentSeconds = currentProgress * TOTAL_ANIMATION_DURATION_SECONDS;

  // Identify active cue at current progress
  const activeCue = useMemo(() => {
    if (cues.length === 0) return null;
    // Find closest cue within 0.35s window
    const matches = cues.filter((c) => Math.abs(c.timeSeconds - currentSeconds) <= 0.35);
    if (matches.length > 0) {
      return matches.reduce((prev, curr) =>
        Math.abs(curr.timeSeconds - currentSeconds) < Math.abs(prev.timeSeconds - currentSeconds) ? curr : prev
      );
    }
    return null;
  }, [cues, currentSeconds]);

  // Filtered cues list
  const filteredCues = useMemo(() => {
    return cues.filter((c) => {
      const matchPlayer =
        filterPlayer === 'ALL' || c.targetPlayerId === 'ALL' || c.targetPlayerId === filterPlayer;
      const matchCat = filterCategory === 'ALL' || c.category === filterCategory;
      return matchPlayer && matchCat;
    });
  }, [cues, filterPlayer, filterCategory]);

  // Add / Edit save handler
  const handleSaveCue = (cueData: {
    id?: string;
    title: string;
    description: string;
    timestamp: number;
    timeSeconds: number;
    targetPlayerId: string;
    phaseLabel: string;
    category: 'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE';
  }) => {
    let updated: TimestampedCoachingCue[];
    if (cueData.id) {
      const existing = cues.find((c) => c.id === cueData.id);
      if (existing) {
        const toUpdate: TimestampedCoachingCue = {
          ...existing,
          title: cueData.title,
          description: cueData.description,
          timestamp: cueData.timestamp,
          timeSeconds: cueData.timeSeconds,
          targetPlayerId: cueData.targetPlayerId,
          phaseLabel: cueData.phaseLabel,
          category: cueData.category,
        };
        updated = updatePlayCoachingCue(play.id, toUpdate, cues);
        showToast(`Updated coaching cue "${cueData.title}"`);
      } else {
        updated = cues;
      }
    } else {
      updated = addPlayCoachingCue(play, cueData, cues);
      showToast(`Added new coaching cue at ${cueData.timeSeconds.toFixed(2)}s!`);
    }

    setCues(updated);
    if (onUpdatePlayCues) onUpdatePlayCues(updated);
  };

  const handleDeleteCue = (cue: TimestampedCoachingCue, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete coaching cue "${cue.title}" at ${cue.timeSeconds.toFixed(2)}s?`)) {
      const updated = deletePlayCoachingCue(play.id, cue.id, cues);
      setCues(updated);
      if (onUpdatePlayCues) onUpdatePlayCues(updated);
      showToast('Coaching cue deleted.');
    }
  };

  const handleResetCues = () => {
    if (window.confirm('Reset all coaching cues for this play to recommended baseline defaults?')) {
      const baseline = resetPlayCoachingCues(play);
      setCues(baseline);
      if (onUpdatePlayCues) onUpdatePlayCues(baseline);
      showToast('Reset to default coaching cues.');
    }
  };

  const handleSeek = (timeSeconds: number, targetPlayerId?: string) => {
    const targetProgress = Math.min(1.0, Math.max(0, timeSeconds / TOTAL_ANIMATION_DURATION_SECONDS));
    if (onSeekProgress) {
      onSeekProgress(targetProgress);
    }
    if (targetPlayerId && targetPlayerId !== 'ALL' && onSelectPlayer) {
      onSelectPlayer(targetPlayerId);
    }
  };

  // Copy all cues to formatted text
  const handleCopyInstallSheet = () => {
    if (cues.length === 0) return;
    const text = [
      `=== 8v8 COACHING CUES & TIMESTAMPS: ${play.code} ===`,
      `Concept: ${play.englishName}`,
      `Formation: ${play.formationName || play.category} | Drop: ${play.qbDrop || '3-Step'}`,
      `--------------------------------------------------`,
      ...cues.map(
        (c) =>
          `[${c.timeSeconds.toFixed(2)}s / ${Math.round(c.timestamp * 100)}%] [${c.phaseLabel || 'PHASE'}] [${c.category || 'READ'}] [Target: ${c.targetPlayerId || 'ALL'}]\n• ${c.title}: "${c.description}"\n`
      ),
      `--------------------------------------------------`,
      `Aalto Predators 8v8 Playbook Engine`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
    showToast('Coaching cues copied to clipboard!');
  };

  // Player keys from play
  const playerSlots = Object.keys(play.players || {});

  return (
    <div
      id="timestamped-coaching-cues-section"
      className="bg-slate-50/90 rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4"
    >
      {/* Toast notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md animate-in fade-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Timestamped Coaching Cues</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {cues.length} {cues.length === 1 ? 'cue' : 'cues'}
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Add key teaching points &amp; read checks locked to exact animation timestamps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Add at Current Frame */}
          <button
            id="add-cue-at-current-frame-btn"
            type="button"
            onClick={() => {
              setCueToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
            title="Add a coaching cue at current frame timestamp"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Add Cue ({currentSeconds.toFixed(1)}s)</span>
          </button>

          {/* Copy cues */}
          <button
            type="button"
            onClick={handleCopyInstallSheet}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            title="Copy all coaching cues to clipboard for practice sheet"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Copy Sheet</span>
              </>
            )}
          </button>

          {/* Reset Cues */}
          <button
            type="button"
            onClick={handleResetCues}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all shadow-2xs cursor-pointer"
            title="Reset coaching cues to default recommendations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Timeline Bar with Cue Pins */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">TIMELINE:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {currentSeconds.toFixed(2)}s / {TOTAL_ANIMATION_DURATION_SECONDS.toFixed(1)}s
            </span>
            {isPlaying && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PLAYING
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onTogglePlay && (
              <button
                type="button"
                onClick={onTogglePlay}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <PlayIcon className="w-3 h-3 text-blue-600" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}
            <span className="text-[10px] text-slate-400">Click marker to scrub</span>
          </div>
        </div>

        {/* Timeline Visual Track */}
        <div className="relative pt-3 pb-2 select-none">
          {/* Scrubber slider track */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              if (onSeekProgress) onSeekProgress(ratio);
            }}
            className="h-3 bg-slate-100 rounded-full border border-slate-300 relative cursor-pointer overflow-visible"
          >
            {/* Progress fill */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, Math.max(0, currentProgress * 100))}%` }}
            />

            {/* Playhead marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md pointer-events-none z-20 transition-all duration-75"
              style={{ left: `${Math.min(100, Math.max(0, currentProgress * 100))}%` }}
            />

            {/* Cue Pins on Timeline */}
            {cues.map((cue) => {
              const leftPercent = Math.min(99, Math.max(1, cue.timestamp * 100));
              const isCueActive = Math.abs(cue.timeSeconds - currentSeconds) <= 0.35;
              const catMeta = CUE_CATEGORIES_META[cue.category || 'READ'] || CUE_CATEGORIES_META.READ;

              return (
                <button
                  key={`pin-${cue.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeek(cue.timeSeconds, cue.targetPlayerId);
                  }}
                  title={`[${cue.timeSeconds.toFixed(2)}s] ${cue.title} (${cue.targetPlayerId || 'ALL'})`}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-150 cursor-pointer group flex flex-col items-center ${
                    isCueActive ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                  style={{ left: `${leftPercent}%` }}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all ${
                      isCueActive
                        ? `${catMeta.dot} ring-3 ring-blue-500/40 animate-pulse`
                        : `${catMeta.dot} opacity-90 group-hover:opacity-100`
                    }`}
                  />

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-5 bg-slate-900 text-white text-[10px] font-sans font-semibold px-2 py-1 rounded-md whitespace-nowrap shadow-xl z-40">
                    <span className="font-mono text-amber-300 font-bold">{cue.timeSeconds.toFixed(1)}s</span> • {cue.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Phase labels below track */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 px-0.5">
            <span>0.0s Pre-Snap</span>
            <span>1.0s Drop</span>
            <span>2.0s Stem</span>
            <span>3.0s Break</span>
            <span>4.0s YAC</span>
          </div>
        </div>

        {/* Live Active Cue Focus Bar */}
        {activeCue && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-300 text-slate-900 animate-in fade-in zoom-in-95 duration-100 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[10px] font-mono font-black text-blue-700 uppercase tracking-wider">
                  ACTIVE TEACHING CUE ({activeCue.timeSeconds.toFixed(2)}s)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-200 text-blue-900">
                  {activeCue.phaseLabel || 'STEM & READ'}
                </span>
                {activeCue.targetPlayerId && activeCue.targetPlayerId !== 'ALL' && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-white">
                    Target: {activeCue.targetPlayerId}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-900">{activeCue.title}</div>
            <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
              {activeCue.description}
            </p>
          </div>
        )}
      </div>

      {/* Filters (Target Athlete & Category) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filter:
          </span>

          {/* Filter by Target Athlete */}
          <select
            value={filterPlayer}
            onChange={(e) => setFilterPlayer(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-mono font-semibold bg-white text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Athletes</option>
            {playerSlots.map((slot) => (
              <option key={`filter-slot-${slot}`} value={slot}>
                {slot} ({play.players[slot]?.label || slot})
              </option>
            ))}
          </select>

          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-mono font-semibold bg-white text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CUE_CATEGORIES_META).map(([catKey, meta]) => (
              <option key={`filter-cat-${catKey}`} value={catKey}>
                {meta.name}
              </option>
            ))}
          </select>
        </div>

        {(filterPlayer !== 'ALL' || filterCategory !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setFilterPlayer('ALL');
              setFilterCategory('ALL');
            }}
            className="text-[10px] font-mono text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Cues List */}
      <div className="space-y-2.5">
        {filteredCues.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-300 bg-white/60 space-y-2">
            <Clock className="w-6 h-6 text-slate-400 mx-auto opacity-70" />
            <div className="text-xs font-bold text-slate-700">No coaching cues matched filter</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Add your first timestamped coaching cue to teach specific reads, footwork, and route breaks.
            </p>
            <button
              type="button"
              onClick={() => {
                setCueToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Cue</span>
            </button>
          </div>
        ) : (
          filteredCues.map((cue) => {
            const isSelected = activeCue?.id === cue.id;
            const catMeta = CUE_CATEGORIES_META[cue.category || 'READ'] || CUE_CATEGORIES_META.READ;
            const assignedPlayer = cue.targetPlayerId && cue.targetPlayerId !== 'ALL'
              ? getPlayerAssignedToSlot(cue.targetPlayerId, roster)
              : null;

            return (
              <div
                key={`cue-card-${cue.id}`}
                onClick={() => handleSeek(cue.timeSeconds, cue.targetPlayerId)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Timestamp badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeek(cue.timeSeconds, cue.targetPlayerId);
                      }}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center gap-1 shadow-2xs"
                      title="Jump animation to this exact timestamp"
                    >
                      <PlayIcon className="w-2.5 h-2.5 fill-current" />
                      <span>{cue.timeSeconds.toFixed(2)}s</span>
                    </button>

                    {/* Phase Badge */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {cue.phaseLabel || 'READ & STEM'}
                    </span>

                    {/* Category Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${catMeta.badge}`}>
                      {catMeta.name}
                    </span>

                    {/* Target Player Badge */}
                    {cue.targetPlayerId && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5 text-blue-600" />
                        <span>{cue.targetPlayerId === 'ALL' ? 'UNIT (ALL)' : `Pos: ${cue.targetPlayerId}`}</span>
                        {assignedPlayer && (
                          <span className="text-slate-500 font-sans">
                            (#{assignedPlayer.jerseyNumber} {assignedPlayer.name.split(' ')[0]})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCueToEdit(cue);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit coaching cue"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCue(cue, e)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete coaching cue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {cue.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                  {cue.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Coaching Cue Modal */}
      <AddCoachingCueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCueToEdit(null);
        }}
        play={play}
        cueToEdit={cueToEdit}
        currentAnimationProgress={currentProgress}
        onSaveCue={handleSaveCue}
        roster={roster}
      />
    </div>
  );
};
