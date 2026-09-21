import { Play, TimestampedCoachingCue } from '../types';

const STORAGE_KEY = '8v8_playbook_coaching_cues_v1';
export const TOTAL_ANIMATION_DURATION_SECONDS = 4.0; // Standard 4.0s full duration

export interface CueCategoryMeta {
  name: string;
  badge: string;
  border: string;
  bg: string;
  text: string;
  dot: string;
}

export const CUE_CATEGORIES_META: Record<
  'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE',
  CueCategoryMeta
> = {
  READ: {
    name: 'QB Read & Key',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  LEVERAGE: {
    name: 'Defender Leverage',
    badge: 'bg-purple-50 text-purple-800 border-purple-300',
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  TIMING: {
    name: 'Rhythm & Timing',
    badge: 'bg-amber-50 text-amber-900 border-amber-300',
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  FOOTWORK: {
    name: 'Footwork & Drop',
    badge: 'bg-blue-50 text-blue-800 border-blue-300',
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  ROUTE: {
    name: 'Route Technique',
    badge: 'bg-rose-50 text-rose-800 border-rose-300',
    border: 'border-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  PROTECTION: {
    name: 'Protection & Blocking',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    border: 'border-slate-500',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-600',
  },
};

export const PHASE_PRESETS = [
  { label: 'PRE-SNAP', timeSeconds: 0.0, timestamp: 0.0, desc: 'Pre-snap alignment & safety count' },
  { label: 'DROP / MESH', timeSeconds: 1.0, timestamp: 0.25, desc: 'Top of 3-step drop or handoff mesh' },
  { label: 'READ & STEM', timeSeconds: 2.2, timestamp: 0.55, desc: 'Stem push & primary safety read' },
  { label: 'BREAK & THROW', timeSeconds: 3.1, timestamp: 0.775, desc: 'Route break cut & ball delivery' },
  { label: 'CATCH & YAC', timeSeconds: 3.8, timestamp: 0.95, desc: 'Catch point, tuck & run after catch' },
];

export const COMMON_CUE_TEMPLATES = [
  {
    title: 'Confirm Pre-Snap Safety Shell',
    category: 'LEVERAGE' as const,
    phase: 'PRE-SNAP',
    timeSeconds: 0.0,
    targetPlayerId: 'QB',
    description: 'Check deep safety depth. If MOFO (2-high), attack middle seam. If MOFC (1-high), work the boundary matchup.',
  },
  {
    title: 'Top of Drop Rhythm Plant',
    category: 'FOOTWORK' as const,
    phase: 'DROP / MESH',
    timeSeconds: 1.0,
    targetPlayerId: 'QB',
    description: 'Back foot plants firmly on the third step with shoulders aligned to the primary target.',
  },
  {
    title: 'Eyes on Primary Key Defender',
    category: 'READ' as const,
    phase: 'READ & STEM',
    timeSeconds: 2.2,
    targetPlayerId: 'QB',
    description: 'Hold the overhang linebacker with your eyes before committing to the second window.',
  },
  {
    title: 'Violent 90° Break Cut',
    category: 'ROUTE' as const,
    phase: 'BREAK & THROW',
    timeSeconds: 3.1,
    targetPlayerId: 'X',
    description: 'Drop hips, snap outside foot hard, and burst flat across the field into quarterback vision.',
  },
  {
    title: 'Secure Catch & Turn Upfield',
    category: 'TIMING' as const,
    phase: 'CATCH & YAC',
    timeSeconds: 3.8,
    targetPlayerId: 'Z',
    description: 'High point the football away from the defender frame and immediately head for the sideline alley.',
  },
];

/**
 * Generates initial baseline timestamped cues for a play based on its progression reads & assignments
 */
export function generateBaselineCuesForPlay(play: Play): TimestampedCoachingCue[] {
  const cues: TimestampedCoachingCue[] = [];
  const playId = play.id;

  // 1. Pre-Snap Cue (0.0s)
  cues.push({
    id: `cue-${playId}-presnap`,
    timestamp: 0.0,
    timeSeconds: 0.0,
    title: 'Pre-Snap Alignment & Count',
    description: `Check 8v8 defensive box count and safety alignment vs ${play.formationName || 'trips'}. Look for blitz tell from outside linebackers.`,
    targetPlayerId: 'QB',
    phaseLabel: 'PRE-SNAP',
    category: 'LEVERAGE',
    createdAt: Date.now() - 10000,
  });

  // 2. Drop / Mesh Cue (1.0s)
  cues.push({
    id: `cue-${playId}-drop`,
    timestamp: 0.25,
    timeSeconds: 1.0,
    title: `${play.qbDrop || '3-Step Drop'} & Rhythm`,
    description: `Snap footwork: deliver precise cadence. Ball held high at chest, eyes surveying the intermediate safety.`,
    targetPlayerId: 'QB',
    phaseLabel: 'DROP / MESH',
    category: 'FOOTWORK',
    createdAt: Date.now() - 8000,
  });

  // 3. Primary Read Cue (2.2s)
  if (play.progressionReads && play.progressionReads.length > 0) {
    const read1 = play.progressionReads[0];
    cues.push({
      id: `cue-${playId}-read1`,
      timestamp: 0.55,
      timeSeconds: 2.2,
      title: `Primary Read #${read1.order}: ${read1.playerId || 'WR'}`,
      description: read1.cue ? `Key: ${read1.cue}. (${read1.concept})` : `Evaluate target ${read1.playerId} on ${read1.concept}`,
      targetPlayerId: read1.playerId || 'QB',
      phaseLabel: 'READ & STEM',
      category: 'READ',
      createdAt: Date.now() - 6000,
    });
  } else {
    cues.push({
      id: `cue-${playId}-stem`,
      timestamp: 0.55,
      timeSeconds: 2.2,
      title: 'Stem Push & Leverage Read',
      description: 'Receivers push vertical stems to force defensive backs to flip hips before executing breaks.',
      targetPlayerId: 'ALL',
      phaseLabel: 'READ & STEM',
      category: 'ROUTE',
      createdAt: Date.now() - 6000,
    });
  }

  // 4. Break & Delivery Cue (3.1s)
  if (play.progressionReads && play.progressionReads.length > 1) {
    const read2 = play.progressionReads[1];
    cues.push({
      id: `cue-${playId}-read2`,
      timestamp: 0.775,
      timeSeconds: 3.1,
      title: `Secondary Progression: ${read2.playerId || 'Checkdown'}`,
      description: read2.cue ? `If primary is capped, hit ${read2.playerId}: ${read2.cue}` : `Trigger throw to ${read2.playerId} on break`,
      targetPlayerId: read2.playerId || 'QB',
      phaseLabel: 'BREAK & THROW',
      category: 'TIMING',
      createdAt: Date.now() - 4000,
    });
  } else {
    cues.push({
      id: `cue-${playId}-break`,
      timestamp: 0.775,
      timeSeconds: 3.1,
      title: 'Break Timing & Ball Out',
      description: 'Ball should be out at the top of the route break on time. Do not hold onto the football against blitz.',
      targetPlayerId: 'QB',
      phaseLabel: 'BREAK & THROW',
      category: 'TIMING',
      createdAt: Date.now() - 4000,
    });
  }

  // 5. Catch Point & YAC (3.8s)
  cues.push({
    id: `cue-${playId}-yac`,
    timestamp: 0.95,
    timeSeconds: 3.8,
    title: 'Catch Point & YAC Transition',
    description: 'Look the ball all the way into hands, secure with two points of pressure, and burst north-south.',
    targetPlayerId: 'ALL',
    phaseLabel: 'CATCH & YAC',
    category: 'ROUTE',
    createdAt: Date.now() - 2000,
  });

  return cues;
}

/**
 * Retrieves all stored cues map from localStorage
 */
function getAllStoredCuesMap(): Record<string, TimestampedCoachingCue[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored coaching cues from localStorage:', err);
    return {};
  }
}

/**
 * Saves all stored cues map into localStorage
 */
function setAllStoredCuesMap(map: Record<string, TimestampedCoachingCue[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('playbook_cues_updated'));
  } catch (err) {
    console.error('Failed to write coaching cues to localStorage:', err);
  }
}

/**
 * Gets coaching cues for a play, using stored custom cues or generating baseline cues
 */
export function getPlayCoachingCues(play: Play): TimestampedCoachingCue[] {
  if (!play) return [];

  // Check in-memory on play object
  if (play.coachingCues && play.coachingCues.length > 0) {
    return [...play.coachingCues].sort((a, b) => a.timestamp - b.timestamp);
  }

  // Check localStorage
  const map = getAllStoredCuesMap();
  if (map[play.id] && map[play.id].length > 0) {
    return [...map[play.id]].sort((a, b) => a.timestamp - b.timestamp);
  }

  // Generate baseline cues
  return generateBaselineCuesForPlay(play).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Saves coaching cues for a specific play
 */
export function savePlayCoachingCues(playId: string, cues: TimestampedCoachingCue[]): TimestampedCoachingCue[] {
  const sorted = [...cues].sort((a, b) => a.timestamp - b.timestamp);
  const map = getAllStoredCuesMap();
  map[playId] = sorted;
  setAllStoredCuesMap(map);
  return sorted;
}

/**
 * Adds a new cue to a play
 */
export function addPlayCoachingCue(
  play: Play,
  newCueData: {
    title: string;
    description: string;
    timestamp: number; // 0.0 to 1.0
    timeSeconds?: number;
    targetPlayerId?: string;
    phaseLabel?: string;
    category?: 'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE';
    color?: string;
  },
  existingCues: TimestampedCoachingCue[]
): TimestampedCoachingCue[] {
  const timeSeconds = newCueData.timeSeconds !== undefined
    ? Math.min(TOTAL_ANIMATION_DURATION_SECONDS, Math.max(0, newCueData.timeSeconds))
    : Number((newCueData.timestamp * TOTAL_ANIMATION_DURATION_SECONDS).toFixed(2));

  const normalizedTimestamp = Math.min(1.0, Math.max(0, newCueData.timestamp));

  const newCue: TimestampedCoachingCue = {
    id: `cue-${play.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: newCueData.title.trim() || 'Coaching Cue',
    description: newCueData.description.trim() || '',
    timestamp: normalizedTimestamp,
    timeSeconds: timeSeconds,
    targetPlayerId: newCueData.targetPlayerId || 'ALL',
    phaseLabel: newCueData.phaseLabel || 'STEM & READ',
    category: newCueData.category || 'READ',
    color: newCueData.color,
    createdAt: Date.now(),
  };

  const updated = [...existingCues, newCue].sort((a, b) => a.timestamp - b.timestamp);
  savePlayCoachingCues(play.id, updated);
  return updated;
}

/**
 * Updates an existing cue
 */
export function updatePlayCoachingCue(
  playId: string,
  updatedCue: TimestampedCoachingCue,
  existingCues: TimestampedCoachingCue[]
): TimestampedCoachingCue[] {
  const updated = existingCues.map((c) => (c.id === updatedCue.id ? updatedCue : c)).sort((a, b) => a.timestamp - b.timestamp);
  savePlayCoachingCues(playId, updated);
  return updated;
}

/**
 * Deletes a cue
 */
export function deletePlayCoachingCue(
  playId: string,
  cueId: string,
  existingCues: TimestampedCoachingCue[]
): TimestampedCoachingCue[] {
  const updated = existingCues.filter((c) => c.id !== cueId).sort((a, b) => a.timestamp - b.timestamp);
  savePlayCoachingCues(playId, updated);
  return updated;
}

/**
 * Resets a play's cues back to baseline
 */
export function resetPlayCoachingCues(play: Play): TimestampedCoachingCue[] {
  const baseline = generateBaselineCuesForPlay(play);
  savePlayCoachingCues(play.id, baseline);
  return baseline;
}
