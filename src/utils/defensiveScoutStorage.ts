import { DefenseScheme, DefensivePlayer, Play, PlayDefensiveScout } from '../types';
import { DEFENSIVE_SCHEMES } from '../data/defenseSchemes';

const STORAGE_KEY_CUSTOM_SCHEMES = '8v8_custom_defense_schemes_v1';
const STORAGE_KEY_PLAY_COVERAGES = '8v8_play_defense_scout_map_v1';

export const DEFENSIVE_ROLE_TYPES: {
  value: DefensivePlayer['coverageType'];
  label: string;
  category: 'zone' | 'man' | 'rush_spy';
  badgeClass: string;
  description: string;
}[] = [
  {
    value: 'man',
    label: 'Man-to-Man (Underneath / Lock)',
    category: 'man',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    description: 'Locks onto assigned offensive receiver route everywhere.',
  },
  {
    value: 'bracket',
    label: 'Bracket / Double Team (High-Low)',
    category: 'man',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-300',
    description: 'Double teams primary receiver with high-low / inside-out leverage.',
  },
  {
    value: 'match',
    label: 'Pattern-Match (Read Stem / Seam)',
    category: 'man',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
    description: 'Matches vertical releases of slot/boundary receivers.',
  },
  {
    value: 'flat',
    label: 'Hard / Curl Flat Zone',
    category: 'zone',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    description: 'Defends boundary flat and underneath out routes.',
  },
  {
    value: 'hook_curl',
    label: 'Hook / Intermediate Curl Zone',
    category: 'zone',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    description: 'Defends intermediate hashes and quarterback passing lane.',
  },
  {
    value: 'deep_third',
    label: 'Deep 1/3 (Cover 3 Sky/Cloud)',
    category: 'zone',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
    description: 'Defends 1/3 of the deep field (sideline or middle seam).',
  },
  {
    value: 'deep_half',
    label: 'Deep 1/2 (Cover 2 Shell)',
    category: 'zone',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    description: 'Defends half the deep field over top of cornerbacks.',
  },
  {
    value: 'deep_quarter',
    label: 'Deep 1/4 (Cover 4 / Quarters)',
    category: 'zone',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-300',
    description: 'Defends 1/4 perimeter and vertical stems.',
  },
  {
    value: 'blitz',
    label: 'Blitz / Pass Rusher',
    category: 'rush_spy',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    description: 'Rushes straight into the pocket to disrupt QB timing.',
  },
  {
    value: 'spy',
    label: 'QB Spy / Checkdown Robber',
    category: 'rush_spy',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Mirrors the quarterback and RB checkdown release.',
  },
];

export const DEFENSIVE_TEMPLATE_PRESETS: Partial<DefenseScheme>[] = [
  {
    id: 'template-cover-0-blitz',
    name: 'Cover 0 (Double A-Gap Blitz - 8v8)',
    shortName: 'Cover 0 Blitz',
    description: 'Ultra-aggressive zero-safety blitz sending two linebackers through the interior gaps with lock-man outside.',
    strength: 'Stops short yardage, forces instant throw, overwhelms 2-man pass pro.',
    weakness: 'Vulnerable to quick slants, fades, and double moves with zero safety help.',
    players: [
      { id: 'CB1', label: 'CB1', name: 'Boundary CB (X)', initialPos: { x: 18, y: 55 }, coverageType: 'man', targetOffensivePlayerId: 'X' },
      { id: 'CB2', label: 'CB2', name: 'Field CB (Z)', initialPos: { x: 82, y: 55 }, coverageType: 'man', targetOffensivePlayerId: 'Z' },
      { id: 'NC1', label: 'NC1', name: 'Slot CB (H)', initialPos: { x: 32, y: 55 }, coverageType: 'man', targetOffensivePlayerId: 'H' },
      { id: 'NC2', label: 'NC2', name: 'Slot CB (Y)', initialPos: { x: 68, y: 55 }, coverageType: 'man', targetOffensivePlayerId: 'Y' },
      { id: 'NC3', label: 'NC3', name: 'Dime CB (W)', initialPos: { x: 54, y: 54 }, coverageType: 'man', targetOffensivePlayerId: 'W' },
      { id: 'RUSH1', label: 'R1', name: 'Center Rusher', initialPos: { x: 46, y: 58 }, coverageType: 'blitz' },
      { id: 'RUSH2', label: 'R2', name: 'A-Gap Blitz LB', initialPos: { x: 54, y: 58 }, coverageType: 'blitz' },
      { id: 'SS', label: 'SS', name: 'Strong Safety (Creep LB)', initialPos: { x: 42, y: 56 }, coverageType: 'man', targetOffensivePlayerId: 'RB' },
    ],
  },
  {
    id: 'template-bracket-slot',
    name: 'Bracket Slot H (Cone 2-on-1 - 8v8)',
    shortName: 'Bracket Slot',
    description: 'High-low bracket double team on the inside slot weapon (H) to eliminate intermediate seam and crossers.',
    strength: 'Double teams the best slot receiver and forces QB to third read.',
    weakness: 'Single coverage on boundary receivers X and Z.',
    players: [
      { id: 'CB1', label: 'CB1', name: 'Left CB (X Solo)', initialPos: { x: 18, y: 52 }, coverageType: 'man', targetOffensivePlayerId: 'X' },
      { id: 'NC1', label: 'NC1', name: 'Underneath Bracket (H)', initialPos: { x: 30, y: 54 }, coverageType: 'bracket', targetOffensivePlayerId: 'H', zoneArea: { x: 22, y: 44, width: 22, height: 18, label: 'Low Bracket (H)' } },
      { id: 'FS', label: 'FS', name: 'High Safety Bracket (H)', initialPos: { x: 36, y: 32 }, coverageType: 'bracket', targetOffensivePlayerId: 'H', zoneArea: { x: 20, y: 15, width: 30, height: 28, label: 'High Bracket (H)' } },
      { id: 'SS', label: 'SS', name: 'Deep Right Safety', initialPos: { x: 68, y: 32 }, coverageType: 'deep_half', zoneArea: { x: 50, y: 15, width: 45, height: 30, label: 'Deep Half R' } },
      { id: 'NC2', label: 'NC2', name: 'Right Slot CB', initialPos: { x: 68, y: 55 }, coverageType: 'man', targetOffensivePlayerId: 'Y' },
      { id: 'CB2', label: 'CB2', name: 'Right CB (Z Solo)', initialPos: { x: 82, y: 52 }, coverageType: 'man', targetOffensivePlayerId: 'Z' },
      { id: 'MLB', label: 'MLB', name: 'Middle LB (Spy RB)', initialPos: { x: 48, y: 56 }, coverageType: 'spy', targetOffensivePlayerId: 'RB', zoneArea: { x: 40, y: 46, width: 20, height: 18, label: 'Spy / Hole' } },
      { id: 'RUSH', label: 'RUSH', name: 'Pass Rusher', initialPos: { x: 50, y: 58 }, coverageType: 'blitz' },
    ],
  },
  {
    id: 'template-tampa-2',
    name: 'Tampa 2 (Middle Hole Drop Safety - 8v8)',
    shortName: 'Tampa 2',
    description: 'Cover 2 variant where the middle linebacker carries deep middle vertical routes, allowing safeties to stay wider in the halves.',
    strength: 'Protects both deep middle seam and outside flats.',
    weakness: 'Vulnerable in underneath middle hole vacated by MLB and RB checkdowns.',
    players: [
      { id: 'CB1', label: 'CB1', name: 'Left Flat CB', initialPos: { x: 18, y: 57 }, coverageType: 'flat', zoneArea: { x: 10, y: 48, width: 22, height: 16, label: 'L Flat' } },
      { id: 'CB2', label: 'CB2', name: 'Right Flat CB', initialPos: { x: 82, y: 57 }, coverageType: 'flat', zoneArea: { x: 68, y: 48, width: 22, height: 16, label: 'R Flat' } },
      { id: 'FS', label: 'FS', name: 'Deep Left Safety', initialPos: { x: 26, y: 32 }, coverageType: 'deep_half', zoneArea: { x: 5, y: 15, width: 45, height: 28, label: 'Deep Left 1/2' } },
      { id: 'SS', label: 'SS', name: 'Deep Right Safety', initialPos: { x: 74, y: 32 }, coverageType: 'deep_half', zoneArea: { x: 50, y: 15, width: 45, height: 28, label: 'Deep Right 1/2' } },
      { id: 'MLB', label: 'MLB', name: 'Tampa Mike (Deep Hole)', initialPos: { x: 50, y: 54 }, coverageType: 'deep_third', zoneArea: { x: 40, y: 25, width: 20, height: 25, label: 'Tampa Mid Hole' } },
      { id: 'WLB', label: 'WLB', name: 'Will LB (Hook)', initialPos: { x: 36, y: 56 }, coverageType: 'hook_curl', zoneArea: { x: 26, y: 46, width: 20, height: 16, label: 'L Hook' } },
      { id: 'SLB', label: 'SLB', name: 'Sam LB (Hook)', initialPos: { x: 64, y: 56 }, coverageType: 'hook_curl', zoneArea: { x: 54, y: 46, width: 20, height: 16, label: 'R Hook' } },
      { id: 'RUSH', label: 'RUSH', name: 'Pass Rusher', initialPos: { x: 50, y: 58 }, coverageType: 'blitz' },
    ],
  },
  {
    id: 'template-goal-line-lock',
    name: 'Red Zone Goal-Line Jump (8v8)',
    shortName: 'Goal-Line Lock',
    description: 'Compressed 8v8 red-zone goal line defense with 4 rushers/spies and 4 tight press-jam defenders on the goal line.',
    strength: 'Stops power runs, QB sneaks, and quick flat routes inside the 5-yard line.',
    weakness: 'Vulnerable to fade corner jump balls and back-shoulder throws.',
    players: [
      { id: 'CB1', label: 'CB1', name: 'Press Corner (X)', initialPos: { x: 18, y: 58 }, coverageType: 'man', targetOffensivePlayerId: 'X' },
      { id: 'CB2', label: 'CB2', name: 'Press Corner (Z)', initialPos: { x: 82, y: 58 }, coverageType: 'man', targetOffensivePlayerId: 'Z' },
      { id: 'NC1', label: 'NC1', name: 'Press Nickel (H)', initialPos: { x: 32, y: 58 }, coverageType: 'man', targetOffensivePlayerId: 'H' },
      { id: 'NC2', label: 'NC2', name: 'Press Nickel (Y)', initialPos: { x: 68, y: 58 }, coverageType: 'man', targetOffensivePlayerId: 'Y' },
      { id: 'MLB', label: 'MLB', name: 'Goal Line Plugger', initialPos: { x: 44, y: 59 }, coverageType: 'blitz' },
      { id: 'RUSH1', label: 'R1', name: 'Edge Rusher L', initialPos: { x: 38, y: 60 }, coverageType: 'blitz' },
      { id: 'RUSH2', label: 'R2', name: 'Edge Rusher R', initialPos: { x: 62, y: 60 }, coverageType: 'blitz' },
      { id: 'FS', label: 'FS', name: 'Goal-Line Robber / Spy', initialPos: { x: 50, y: 52 }, coverageType: 'spy', targetOffensivePlayerId: 'RB' },
    ],
  },
];

/**
 * Retrieve custom defense schemes from localStorage
 */
export function getCustomDefenseSchemes(): DefenseScheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SCHEMES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse custom defense schemes:', err);
    return [];
  }
}

/**
 * Save or update custom defense scheme
 */
export function saveCustomDefenseScheme(scheme: DefenseScheme): DefenseScheme[] {
  const existing = getCustomDefenseSchemes();
  const updatedScheme: DefenseScheme = {
    ...scheme,
    isCustom: true,
    createdAt: scheme.createdAt || Date.now(),
  };

  const idx = existing.findIndex((s) => s.id === updatedScheme.id);
  let result: DefenseScheme[];
  if (idx !== -1) {
    existing[idx] = updatedScheme;
    result = existing;
  } else {
    result = [...existing, updatedScheme];
  }

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCHEMES, JSON.stringify(result));
    window.dispatchEvent(new CustomEvent('playbook_defense_updated'));
  } catch (err) {
    console.error('Failed to save custom defense scheme:', err);
  }

  return result;
}

/**
 * Delete custom defense scheme
 */
export function deleteCustomDefenseScheme(schemeId: string): DefenseScheme[] {
  const existing = getCustomDefenseSchemes();
  const result = existing.filter((s) => s.id !== schemeId);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCHEMES, JSON.stringify(result));
    window.dispatchEvent(new CustomEvent('playbook_defense_updated'));
  } catch (err) {
    console.error('Failed to delete custom defense scheme:', err);
  }
  return result;
}

/**
 * Get all defense schemes (built-in + custom)
 */
export function getAllDefenseSchemes(): DefenseScheme[] {
  const custom = getCustomDefenseSchemes();
  return [...DEFENSIVE_SCHEMES, ...custom];
}

/**
 * Get defense scheme by ID
 */
export function getDefenseSchemeById(id: string): DefenseScheme | undefined {
  const all = getAllDefenseSchemes();
  return all.find((s) => s.id === id);
}

/**
 * Retrieve all play-defense scout associations
 */
function getAllPlayDefensiveScoutMap(): Record<string, PlayDefensiveScout> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAY_COVERAGES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse play defensive scout map:', err);
    return {};
  }
}

/**
 * Get assigned defensive coverage for a specific play
 */
export function getPlayAssignedCoverage(playId: string): PlayDefensiveScout | null {
  if (!playId) return null;
  const map = getAllPlayDefensiveScoutMap();
  return map[playId] || null;
}

/**
 * Save assigned defensive coverage for a play
 */
export function savePlayAssignedCoverage(scoutData: PlayDefensiveScout): void {
  try {
    const map = getAllPlayDefensiveScoutMap();
    map[scoutData.playId] = {
      ...scoutData,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PLAY_COVERAGES, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('playbook_defense_updated'));
  } catch (err) {
    console.error('Failed to save play defensive coverage:', err);
  }
}

/**
 * Remove assigned defensive coverage for a play
 */
export function removePlayAssignedCoverage(playId: string): void {
  try {
    const map = getAllPlayDefensiveScoutMap();
    delete map[playId];
    localStorage.setItem(STORAGE_KEY_PLAY_COVERAGES, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('playbook_defense_updated'));
  } catch (err) {
    console.error('Failed to remove play defensive coverage:', err);
  }
}

/**
 * Intelligent tactical recommendations for defenses based on offensive concepts in the play
 */
export function getRecommendedDefensesForPlay(play: Play): {
  scheme: DefenseScheme;
  reason: string;
  matchupVerdict: 'favorable_for_offense' | 'challenging_for_offense' | 'neutral';
}[] {
  const all = getAllDefenseSchemes();
  const playText = `${play.code} ${play.englishName} ${play.description} ${play.tags.join(' ')}`.toLowerCase();

  return all.map((scheme) => {
    let reason = '';
    let matchupVerdict: 'favorable_for_offense' | 'challenging_for_offense' | 'neutral' = 'neutral';

    if (scheme.id === 'cover-0') {
      if (playText.includes('slant') || playText.includes('go') || playText.includes('fade') || playText.includes('mesh')) {
        reason = 'Offense is highly favorable against zero safety help with quick slants / mesh picks.';
        matchupVerdict = 'favorable_for_offense';
      } else if (playText.includes('screen') || playText.includes('dive') || playText.includes('power')) {
        reason = 'Heavy 8-man box blitz stops short runs and slow screen setups in backfield.';
        matchupVerdict = 'challenging_for_offense';
      } else {
        reason = 'Forces fast delivery before blitz penetration reaches QB.';
      }
    } else if (scheme.id === 'cover-2') {
      if (playText.includes('smash') || playText.includes('corner') || playText.includes('post') || playText.includes('middle')) {
        reason = 'Smash corner-route & deep post split the 2-high safeties in deep hole.';
        matchupVerdict = 'favorable_for_offense';
      } else if (playText.includes('out') || playText.includes('bubble') || playText.includes('hitch')) {
        reason = 'Two hard boundary corners clamp down instantly on quick flats.';
        matchupVerdict = 'challenging_for_offense';
      } else {
        reason = 'Balanced 2-deep zone look against standard spreads.';
      }
    } else if (scheme.id === 'cover-3') {
      if (playText.includes('verticals') || playText.includes('seam') || playText.includes('flood') || playText.includes('curl')) {
        reason = 'Four Verticals seam pushes and 3-level flood overload deep third cushions.';
        matchupVerdict = 'favorable_for_offense';
      } else if (playText.includes('deep') || playText.includes('post') || playText.includes('bomb')) {
        reason = 'Center field Free Safety provides deep middle roof over deep shots.';
        matchupVerdict = 'challenging_for_offense';
      } else {
        reason = 'Standard single-high 3-deep perimeter coverage.';
      }
    } else if (scheme.id === 'cover-4') {
      if (playText.includes('slant') || playText.includes('mesh') || playText.includes('shallow') || playText.includes('under')) {
        reason = 'Deep quarter defenders backpedal early, surrendering underneath intermediate drag windows.';
        matchupVerdict = 'favorable_for_offense';
      } else if (playText.includes('verticals') || playText.includes('post-wheel') || playText.includes('deep')) {
        reason = 'Four deep quarter DBs cap all vertical streaks downfield.';
        matchupVerdict = 'challenging_for_offense';
      } else {
        reason = 'Quarters coverage defending against deep passing explosions.';
      }
    } else if (scheme.id === 'bracket') {
      reason = 'Double teams primary receiver with high-low leverage while playing man elsewhere.';
      matchupVerdict = 'challenging_for_offense';
    } else if (scheme.id === 'man-match') {
      reason = 'Hybrid pattern matching reacts directly to receiver route release angles.';
      matchupVerdict = 'neutral';
    } else {
      reason = 'Custom scout look designed for this tactical matchup.';
      matchupVerdict = 'neutral';
    }

    return {
      scheme,
      reason,
      matchupVerdict,
    };
  });
}
