import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';

const USAGE_STORAGE_KEY = '8v8_playbook_play_usage_stats_v1';

export type PlayUsageMap = Record<string, number>;

/**
 * Default realistic usage stats for playbook plays
 * (Simulating game calls & practice reps for the University League season)
 */
export function getDefaultPlayUsageStats(): PlayUsageMap {
  const stats: PlayUsageMap = {};
  
  // High-frequency staple plays
  const staples: Record<string, number> = {
    'trips-pass-97-right': 18, // Trips Right Smash / 1-7-8
    'trips-run-101-right': 15, // Trips Right HB Power Sweep
    'twins-pass-31-right': 14, // Twins Right Quick Slants
    'twins-run-39-right': 12,  // Twins Right Jet Sweep
    'empty-pass-11-right': 11, // Empty Pass Four Verts
    'trips-pass-98-right': 10, // Trips Right 2-Minute Flood
    'empty-pass-12-right': 9,  // Empty Pass Quick In
    'two-line-pass-61-right': 9,
    'two-line-run-63-right': 8,
    'split-pass-81-right': 8,
    'trips-pass-100-right': 7,
    'twins-run-41-right': 7,
    'one-line-71-right': 6,
    'split-run-83-right': 6,
  };

  // Seed staples first
  Object.entries(staples).forEach(([id, count]) => {
    stats[id] = count;
  });

  // For remaining plays, distribute mild baseline calls (2-5 reps)
  ALL_PLAYBOOK_PLAYS.forEach((p, idx) => {
    if (stats[p.id] === undefined) {
      stats[p.id] = Math.max(1, (idx * 7) % 7 + 2);
    }
  });

  return stats;
}

/**
 * Load usage statistics from localStorage
 */
export function getPlayUsageStats(): PlayUsageMap {
  if (typeof window === 'undefined') return getDefaultPlayUsageStats();
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultPlayUsageStats();
      savePlayUsageStats(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return getDefaultPlayUsageStats();
  } catch (e) {
    console.warn('Failed to load usage stats, returning defaults', e);
    return getDefaultPlayUsageStats();
  }
}

/**
 * Save usage statistics to localStorage
 */
export function savePlayUsageStats(stats: PlayUsageMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('playbook_usage_updated', { detail: stats }));
  } catch (e) {
    console.error('Failed to save usage stats', e);
  }
}

/**
 * Increment or decrement usage count for a play
 */
export function recordPlayUsage(playId: string, delta = 1): PlayUsageMap {
  const current = getPlayUsageStats();
  const currentCount = current[playId] || 0;
  const newCount = Math.max(0, currentCount + delta);
  const updated: PlayUsageMap = {
    ...current,
    [playId]: newCount,
  };
  savePlayUsageStats(updated);
  return updated;
}

/**
 * Explicitly set call count for a play
 */
export function setPlayUsage(playId: string, count: number): PlayUsageMap {
  const current = getPlayUsageStats();
  const updated: PlayUsageMap = {
    ...current,
    [playId]: Math.max(0, count),
  };
  savePlayUsageStats(updated);
  return updated;
}

/**
 * Reset all usage statistics to factory defaults
 */
export function resetUsageStatsToDefaults(): PlayUsageMap {
  const defaults = getDefaultPlayUsageStats();
  savePlayUsageStats(defaults);
  return defaults;
}
