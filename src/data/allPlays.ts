import { Play, FormationCategory, PlayType, Direction, PlayTagMeta } from '../types';
import { TRIPS_PASS_PLAYS } from './plays/tripsPass';
import { TRIPS_RUN_PLAYS } from './plays/tripsRun';
import { TWINS_PASS_PLAYS } from './plays/twinsPass';
import { TWINS_RUN_PLAYS } from './plays/twinsRun';
import { EMPTY_PASS_PLAYS } from './plays/emptyPass';
import { EMPTY_RUN_PLAYS } from './plays/emptyRun';
import { TWO_LINE_PASS_PLAYS } from './plays/twoLinePass';
import { TWO_LINE_RUN_PLAYS } from './plays/twoLineRun';
import { ONE_LINE_PLAYS } from './plays/oneLine';
import { SPLIT_PLAYS } from './plays/split';

export const PLAY_TAGS_META: PlayTagMeta[] = [
  {
    id: 'RedZone',
    name: 'Red Zone & Endzone',
    shortLabel: 'RedZone',
    description: 'Condensed spacing, high-percentage goal-line concepts, corner fades & rub routes.',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/90 ring-rose-500/20',
  },
  {
    id: 'LongDown',
    name: '3rd & Long / Deep Shot',
    shortLabel: 'LongDown',
    description: '15+ yard progression concepts, deep posts, corners, and vertical seam routes.',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 ring-indigo-500/20',
  },
  {
    id: 'QuickGame',
    name: 'Quick Game (1-Step / Rhythm)',
    shortLabel: 'QuickGame',
    description: 'Fast rhythm releases under 1.8s: Quick slants, hitches, speed outs & quick ins.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 ring-emerald-500/20',
  },
  {
    id: 'ShortYardage',
    name: 'Short Yardage (3rd & Short)',
    shortLabel: 'ShortYardage',
    description: 'Sticks-moving high-conversion plays, quick drags, sweeps & high percentage checkdowns.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/90 ring-amber-500/20',
  },
  {
    id: 'BlitzBeater',
    name: 'Blitz Beater & Hot Reads',
    shortLabel: 'BlitzBeater',
    description: 'Hot outlets and quick answer combinations against Cover 0 / Cover 1 blitzes.',
    badgeClass: 'bg-red-50 text-red-700 border-red-200/90 ring-red-500/20',
  },
  {
    id: 'DeepShot',
    name: 'Deep Shot & Seams',
    shortLabel: 'DeepShot',
    description: 'Four verticals, post-wheel combos, and deep boundary sideline shots.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/90 ring-blue-500/20',
  },
  {
    id: 'PlayAction',
    name: 'Play-Action & RPO',
    shortLabel: 'PlayAction',
    description: 'Run fakes, mesh actions, and bootleg rollouts freezing linebackers.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90 ring-purple-500/20',
  },
  {
    id: 'ScreenGame',
    name: 'Screen Game & Perimeter',
    shortLabel: 'ScreenGame',
    description: 'WR bubble/tunnel screens with dual slot blocking and RB slip screens.',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/90 ring-teal-500/20',
  },
  {
    id: 'TwoPoint',
    name: '2-Point & Goal Line',
    shortLabel: 'TwoPoint',
    description: 'Short-area separation, sprint-outs, and pick/rub designs in tight 5-yard territory.',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/90 ring-orange-500/20',
  },
  {
    id: 'MeshCrossers',
    name: 'Mesh & Crossers',
    shortLabel: 'MeshCrossers',
    description: 'Crossing routes and shallow drags creating natural traffic against man defense.',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/90 ring-cyan-500/20',
  },
  {
    id: 'RunOption',
    name: 'Run Game & Sweeps',
    shortLabel: 'RunOption',
    description: 'HB sweeps, jet motions, quarterback keeps, and misdirection options.',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-200/90 ring-lime-500/20',
  },
];

// Helper to intelligently enrich any play with standardized situational tags
function enrichPlayWithTags(play: Play): Play {
  const tagsSet = new Set<string>(play.tags || []);

  const routeNumbersOrNames: string[] = [];
  if (play.players) {
    Object.values(play.players).forEach((p) => {
      if (p.route) {
        if (p.route.routeNumber !== undefined) {
          routeNumbersOrNames.push(String(p.route.routeNumber));
        }
        if (p.route.name) {
          routeNumbersOrNames.push(p.route.name.toUpperCase());
        }
      }
    });
  }

  const combinedText = `${play.code} ${play.englishName} ${play.conceptName} ${play.description} ${routeNumbersOrNames.join(' ')}`.toUpperCase();

  // Run & Screen classification
  if (play.playType === 'RUN') {
    tagsSet.add('RunOption');
    tagsSet.add('ShortYardage');
    if (combinedText.includes('SWEEP') || combinedText.includes('REVERSE') || combinedText.includes('OPTION')) {
      tagsSet.add('RedZone');
    }
  }

  if (play.playType === 'SCREEN' || combinedText.includes('SCREEN')) {
    tagsSet.add('ScreenGame');
    tagsSet.add('QuickGame');
    tagsSet.add('BlitzBeater');
    tagsSet.add('ShortYardage');
  }

  // Play action & bootleg classification
  if (play.playType === 'PLAY_ACTION' || combinedText.includes('BOOT') || combinedText.includes('PLAY ACTION') || combinedText.includes('ROLLOUT')) {
    tagsSet.add('PlayAction');
    tagsSet.add('RedZone');
  }

  // Deep shot & Long down classification
  const hasDeepRoutes =
    routeNumbersOrNames.some((r) => ['8', '9', '7', '4', '6'].includes(r)) ||
    combinedText.includes('POST') ||
    combinedText.includes('STREAK') ||
    combinedText.includes('GO') ||
    combinedText.includes('CORNER') ||
    combinedText.includes('WHEEL') ||
    combinedText.includes('DEEP');

  if (hasDeepRoutes) {
    tagsSet.add('DeepShot');
    tagsSet.add('LongDown');
  }

  // Quick Game & Short Yardage classification
  const hasQuickRoutes =
    routeNumbersOrNames.some((r) => ['1', '2', '3', '5'].includes(r)) ||
    combinedText.includes('QUICK') ||
    combinedText.includes('SLANT') ||
    combinedText.includes('HITCH') ||
    combinedText.includes('OUT') ||
    combinedText.includes('FLAT') ||
    combinedText.includes('STICK');

  if (hasQuickRoutes || play.qbDrop === 'Quick 1-Step') {
    tagsSet.add('QuickGame');
    tagsSet.add('ShortYardage');
    tagsSet.add('BlitzBeater');
  }

  // Mesh & Crossers
  if (combinedText.includes('CROSS') || combinedText.includes('MESH') || combinedText.includes('DRAG') || routeNumbersOrNames.some((r) => r === '2')) {
    tagsSet.add('MeshCrossers');
    tagsSet.add('BlitzBeater');
  }

  // Red Zone & Two-Point conversions
  const isRedZoneCandidate =
    combinedText.includes('SMASH') ||
    combinedText.includes('FADE') ||
    combinedText.includes('CORNER') ||
    combinedText.includes('RUB') ||
    combinedText.includes('SLANT') ||
    combinedText.includes('QUICK IN') ||
    combinedText.includes('GOAL') ||
    combinedText.includes('2-POINT') ||
    combinedText.includes('SCREEN') ||
    hasQuickRoutes;

  if (isRedZoneCandidate) {
    tagsSet.add('RedZone');
  }

  if (
    combinedText.includes('2-POINT') ||
    combinedText.includes('ROLLOUT') ||
    combinedText.includes('QUICK') ||
    combinedText.includes('SLANT') ||
    combinedText.includes('FLAT') ||
    combinedText.includes('SWEEP') ||
    play.qbDrop === 'Quick 1-Step'
  ) {
    tagsSet.add('TwoPoint');
  }

  return {
    ...play,
    tags: Array.from(tagsSet),
  };
}

const RAW_PLAYBOOK_PLAYS: Play[] = [
  ...TRIPS_PASS_PLAYS,
  ...TRIPS_RUN_PLAYS,
  ...TWINS_PASS_PLAYS,
  ...TWINS_RUN_PLAYS,
  ...EMPTY_PASS_PLAYS,
  ...EMPTY_RUN_PLAYS,
  ...TWO_LINE_PASS_PLAYS,
  ...TWO_LINE_RUN_PLAYS,
  ...ONE_LINE_PLAYS,
  ...SPLIT_PLAYS,
];

export const ALL_PLAYBOOK_PLAYS: Play[] = RAW_PLAYBOOK_PLAYS.map(enrichPlayWithTags);

export const CATEGORIES: FormationCategory[] = [
  'TRIPS PASS',
  'TRIPS RUN',
  'TWINS PASS',
  'TWINS RUN',
  'EMPTY PASS',
  'EMPTY RUN',
  '2 LINE PASS',
  '2 LINE RUN',
  '1 LINE PASS',
  '1 LINE RUN',
  'SPLIT PASS',
  'SPLIT RUN',
];

export function getPlayById(id: string): Play | undefined {
  return ALL_PLAYBOOK_PLAYS.find((p) => p.id === id);
}

export function searchPlays(
  query: string,
  options: {
    category?: string;
    tag?: string;
    playType?: PlayType | 'ALL';
    direction?: Direction | 'ALL';
  } = {}
): Play[] {
  const cleanQ = query.toLowerCase().trim();

  return ALL_PLAYBOOK_PLAYS.filter((play) => {
    // Filter by category
    if (options.category && options.category !== 'ALL' && play.category !== options.category) {
      return false;
    }

    // Filter by situational tag
    if (options.tag && options.tag !== 'ALL') {
      const hasTag = play.tags.some((t) => t.toLowerCase() === options.tag!.toLowerCase());
      if (!hasTag) {
        return false;
      }
    }

    // Filter by play type
    if (options.playType && options.playType !== 'ALL' && play.playType !== options.playType) {
      return false;
    }

    // Filter by direction
    if (options.direction && options.direction !== 'ALL' && play.direction !== options.direction && play.direction !== 'BALANCED') {
      return false;
    }

    if (!cleanQ) return true;

    // Match code, playNumber, englishName, originalTurkishCode, tags, concept
    const matchNumber = String(play.playNumber).toLowerCase().includes(cleanQ);
    const matchCode = play.code.toLowerCase().includes(cleanQ);
    const matchEnglish = play.englishName.toLowerCase().includes(cleanQ);
    const matchTurkish = play.originalTurkishCode.toLowerCase().includes(cleanQ);
    const matchTags = play.tags.some((t) => t.toLowerCase().includes(cleanQ));
    const matchConcept = play.conceptName.toLowerCase().includes(cleanQ);
    const matchCategory = play.category.toLowerCase().includes(cleanQ);

    return matchNumber || matchCode || matchEnglish || matchTurkish || matchTags || matchConcept || matchCategory;
  });
}

