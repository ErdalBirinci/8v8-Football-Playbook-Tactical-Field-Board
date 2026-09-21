import React, { useState, useEffect } from 'react';
import { Play, TimestampedCoachingCue, RosterPlayer } from '../types';
import {
  CUE_CATEGORIES_META,
  PHASE_PRESETS,
  COMMON_CUE_TEMPLATES,
  TOTAL_ANIMATION_DURATION_SECONDS,
} from '../utils/coachingCuesStorage';
import { getPlayerAssignedToSlot } from '../data/rosterData';
import {
  X,
  Clock,
  Sparkles,
  Check,
  Target,
  Zap,
  Tag,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AddCoachingCueModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
  cueToEdit?: TimestampedCoachingCue | null;
  currentAnimationProgress?: number; // 0 to 1
  onSaveCue: (cueData: {
    id?: string;
    title: string;
    description: string;
    timestamp: number;
    timeSeconds: number;
    targetPlayerId: string;
    phaseLabel: string;
    category: 'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE';
  }) => void;
  roster?: RosterPlayer[];
}

export const AddCoachingCueModal: React.FC<AddCoachingCueModalProps> = ({
  isOpen,
  onClose,
  play,
  cueToEdit,
  currentAnimationProgress = 0,
  onSaveCue,
  roster = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeSeconds, setTimeSeconds] = useState(0.0);
  const [targetPlayerId, setTargetPlayerId] = useState('ALL');
  const [phaseLabel, setPhaseLabel] = useState('READ & STEM');
  const [category, setCategory] = useState<'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE'>('READ');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Available player keys from play
  const playerSlots = Object.keys(play.players || {});

  // Reset or populate fields on open
  useEffect(() => {
    if (!isOpen) return;

    if (cueToEdit) {
      setTitle(cueToEdit.title);
      setDescription(cueToEdit.description);
      setTimeSeconds(Number(cueToEdit.timeSeconds.toFixed(2)));
      setTargetPlayerId(cueToEdit.targetPlayerId || 'ALL');
      setPhaseLabel(cueToEdit.phaseLabel || 'READ & STEM');
      setCategory(cueToEdit.category || 'READ');
    } else {
      // Default to current animation progress if provided
      const initialSeconds = Number((currentAnimationProgress * TOTAL_ANIMATION_DURATION_SECONDS).toFixed(2));
      setTimeSeconds(initialSeconds);
      setTitle('');
      setDescription('');
      setTargetPlayerId('ALL');
      setCategory('READ');

      // Auto pick appropriate phase
      if (initialSeconds <= 0.3) setPhaseLabel('PRE-SNAP');
      else if (initialSeconds <= 1.4) setPhaseLabel('DROP / MESH');
      else if (initialSeconds <= 2.6) setPhaseLabel('READ & STEM');
      else if (initialSeconds <= 3.4) setPhaseLabel('BREAK & THROW');
      else setPhaseLabel('CATCH & YAC');
    }

    setValidationError(null);
  }, [isOpen, cueToEdit, currentAnimationProgress]);

  if (!isOpen) return null;

  const handleCaptureCurrentFrame = () => {
    const sec = Number((currentAnimationProgress * TOTAL_ANIMATION_DURATION_SECONDS).toFixed(2));
    setTimeSeconds(sec);
    // Suggest matching phase
    if (sec <= 0.3) setPhaseLabel('PRE-SNAP');
    else if (sec <= 1.4) setPhaseLabel('DROP / MESH');
    else if (sec <= 2.6) setPhaseLabel('READ & STEM');
    else if (sec <= 3.4) setPhaseLabel('BREAK & THROW');
    else setPhaseLabel('CATCH & YAC');
  };

  const handleSelectPhasePreset = (preset: typeof PHASE_PRESETS[0]) => {
    setTimeSeconds(preset.timeSeconds);
    setPhaseLabel(preset.label);
  };

  const handleApplyTemplate = (template: typeof COMMON_CUE_TEMPLATES[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setPhaseLabel(template.phase);
    setTimeSeconds(template.timeSeconds);
    if (template.targetPlayerId && (playerSlots.includes(template.targetPlayerId) || template.targetPlayerId === 'ALL')) {
      setTargetPlayerId(template.targetPlayerId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a title for the coaching cue.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please enter the coaching text/cue instructions.');
      return;
    }

    const clampedSeconds = Math.max(0, Math.min(TOTAL_ANIMATION_DURATION_SECONDS, timeSeconds));
    const normalizedTimestamp = Number((clampedSeconds / TOTAL_ANIMATION_DURATION_SECONDS).toFixed(4));

    onSaveCue({
      id: cueToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      timestamp: normalizedTimestamp,
      timeSeconds: clampedSeconds,
      targetPlayerId,
      phaseLabel,
      category,
    });

    onClose();
  };

  const currentSecondsFormatted = (currentAnimationProgress * TOTAL_ANIMATION_DURATION_SECONDS).toFixed(2);
  const selectedCatMeta = CUE_CATEGORIES_META[category] || CUE_CATEGORIES_META.READ;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {cueToEdit ? 'Edit Timestamped Coaching Cue' : 'Add Coaching Cue at Timestamp'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {play.code} • 8v8 Tactical Cue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {validationError}
            </div>
          )}

          {/* Quick Common Templates */}
          {!cueToEdit && (
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Football Template Presets:</span>
                </div>
                <span className="text-[10px] font-mono text-blue-600">Click to Autofill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_CUE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={`cue-tmpl-${idx}`}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-blue-900 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer shadow-2xs text-left"
                  >
                    {tmpl.title} ({tmpl.timeSeconds}s)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp Controls */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Animation Timestamp</span>
              </label>

              <button
                type="button"
                onClick={handleCaptureCurrentFrame}
                className="text-[11px] font-mono font-bold text-blue-600 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                title="Capture currently active frame timestamp from the field animation"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Sync with Current Frame ({currentSecondsFormatted}s)</span>
              </button>
            </div>

            {/* Slider & Exact Seconds Input */}
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={TOTAL_ANIMATION_DURATION_SECONDS}
                step="0.05"
                value={timeSeconds}
                onChange={(e) => setTimeSeconds(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                <input
                  type="number"
                  min="0"
                  max={TOTAL_ANIMATION_DURATION_SECONDS}
                  step="0.1"
                  value={timeSeconds}
                  onChange={(e) => setTimeSeconds(parseFloat(e.target.value) || 0)}
                  className="w-12 font-mono font-black text-sm text-slate-900 text-center focus:outline-none"
                />
                <span className="text-xs font-mono font-bold text-slate-500">sec</span>
              </div>
            </div>

            {/* Phase Preset Chips */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-mono text-slate-500">Jump to standard 8v8 play phase:</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {PHASE_PRESETS.map((p) => {
                  const isMatch = Math.abs(timeSeconds - p.timeSeconds) < 0.2;
                  return (
                    <button
                      key={`phase-${p.label}`}
                      type="button"
                      onClick={() => handleSelectPhasePreset(p)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 text-xs'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-black truncate">{p.label}</div>
                      <div className={`text-[10px] font-mono ${isMatch ? 'text-blue-100' : 'text-slate-400'}`}>
                        {p.timeSeconds.toFixed(1)}s
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cue Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>CUE TITLE / KEY PHRASE *</span>
              <span className="text-[10px] font-mono text-slate-400">e.g. Safety Rotation Key, Stem Cut, Checkdown</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Confirm 2-High Safety Rotation &amp; Trigger Deep Post"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Target Athlete / Position & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Target Player */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>TARGET ATHLETE / POSITION</span>
              </label>
              <select
                value={targetPlayerId}
                onChange={(e) => setTargetPlayerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">ALL (Entire Unit / Team)</option>
                {playerSlots.map((slotKey) => {
                  const assignment = play.players[slotKey];
                  const athlete = getPlayerAssignedToSlot(slotKey, roster);
                  const athleteName = athlete ? ` - #${athlete.jerseyNumber} ${athlete.name}` : '';
                  return (
                    <option key={`opt-slot-${slotKey}`} value={slotKey}>
                      {slotKey} ({assignment?.positionName || assignment?.label || slotKey}){athleteName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span>TACTICAL CATEGORY</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {Object.entries(CUE_CATEGORIES_META).map(([catKey, meta]) => (
                  <option key={`opt-cat-${catKey}`} value={catKey}>
                    {catKey}: {meta.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Coaching Cue Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                COACHING CUE INSTRUCTIONS &amp; DETAILS *
              </label>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${selectedCatMeta.badge}`}>
                {category}
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear, actionable coaching instructions for this exact moment of the play (e.g. 'If Corner bites down on flat route, QB must commit throw to 8 Post immediately behind his ear...')"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-500">
            Cue will fire at <span className="font-bold text-slate-900">{timeSeconds.toFixed(2)}s</span> ({Math.round((timeSeconds / TOTAL_ANIMATION_DURATION_SECONDS) * 100)}%)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{cueToEdit ? 'Update Cue' : 'Save Coaching Cue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
