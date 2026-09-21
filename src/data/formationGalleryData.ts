import { Play, FormationCategory, Direction } from '../types';

export type PersonnelGroupingId = 'ALL' | '00_EMPTY' | '10_SPREAD' | '11_BALANCED' | '20_SPLIT' | '12_HEAVY' | 'CUSTOM';

export interface PersonnelGroupingMeta {
  id: PersonnelGroupingId;
  code: string;
  name: string;
  description: string;
  composition: string;
  badgeClass: string;
}

export const PERSONNEL_GROUPINGS: PersonnelGroupingMeta[] = [
  {
    id: 'ALL',
    code: 'ALL',
    name: 'All Personnel Groupings',
    description: 'Show plays across every offensive personnel package and alignment in the playbook.',
    composition: 'Full 8v8 Roster',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  {
    id: '00_EMPTY',
    code: '00 Personnel',
    name: '00 Personnel (Empty Backfield)',
    description: '0 Running Backs, 4 Wide Receivers / Pass Catchers (0 RB, 0 TE, 4 WR). Five-man protection with 5 immediate passing outlets.',
    composition: '3 OL • 1 QB • 0 RB • 4 WR',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  },
  {
    id: '10_SPREAD',
    code: '10 Personnel',
    name: '10 Personnel (1-Back Spread)',
    description: '1 Running Back, 0 Tight Ends, 3 Wide Receivers (1 RB, 0 TE, 3 WR). Standard 8v8 spread passing and zone read foundation.',
    composition: '3 OL • 1 QB • 1 RB • 3 WR',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  {
    id: '11_BALANCED',
    code: '11 Personnel',
    name: '11 Personnel (1-Back 1-Tight/Slot)',
    description: '1 Running Back, 1 Tight End / Inline Wing, 2 Wide Receivers (1 RB, 1 TE, 2 WR). Hybrid package for versatile run/pass execution.',
    composition: '3 OL • 1 QB • 1 RB • 1 TE • 2 WR',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    id: '20_SPLIT',
    code: '20 Personnel',
    name: '20 Personnel (2-Back Split Pro)',
    description: '2 Running Backs (RB + HB), 0 Tight Ends, 2 Wide Receivers (2 RB, 0 TE, 2 WR). Heavy backfield presence for sweeps, options, and lead power.',
    composition: '3 OL • 1 QB • 2 RB • 2 WR',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
  },
  {
    id: '12_HEAVY',
    code: '12 Personnel',
    name: '12 Personnel (2-Line Heavy / Goal Line)',
    description: '1 Running Back, 2 Tight Ends / Compact Inline, 1 Wide Receiver (1 RB, 2 TE, 1 WR). Max protection, condensed splits, and short-yardage drive blocks.',
    composition: '3 OL • 1 QB • 1 RB • 2 TE • 1 WR',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
  },
];

export interface FormationGalleryItem {
  id: string;
  name: string;
  shortName: string;
  category: FormationCategory | string;
  aliases: string[];
  personnelId: PersonnelGroupingId;
  personnelCode: string;
  personnelDescription: string;
  tagline: string;
  philosophy: string;
  keyStrengths: string[];
  bestVsCoverage: string[];
  vulnerability: string;
  passRunRatio: string;
  colorScheme: {
    badge: string;
    border: string;
    cardBg: string;
    accent: string;
    text: string;
  };
  alignmentCoordinates: {
    id: string;
    label: string;
    role: string;
    posType: 'OL' | 'QB' | 'RB' | 'WR' | 'TE';
    x: number;
    y: number;
  }[];
}

export const FORMATION_GALLERY_ITEMS: FormationGalleryItem[] = [
  {
    id: 'trips',
    name: 'Trips (3x1 Overload / Flood)',
    shortName: 'Trips 3x1',
    category: 'TRIPS PASS',
    aliases: ['Trips', 'Trips Right', 'Trips Left', 'TRIPS PASS', 'TRIPS RUN', 'Trips Bunch'],
    personnelId: '10_SPREAD',
    personnelCode: '10 Personnel (1 RB, 3 WR)',
    personnelDescription: '3 Offensive Linemen (LG, C, RG), 1 Shotgun QB, 1 Offset Running Back, 3 Flood Receivers (Z, Y, W) and 1 Boundary Solo (X).',
    tagline: 'Floods single-high zones and creates 3-on-2 perimeter overloads',
    philosophy:
      'The foundational 8v8 formation. By aligning three receivers on one side of the center, the offense forces the defense to declare safety rotation and creates instant numerical leverage on the field side while isolating the boundary receiver 1-on-1.',
    keyStrengths: [
      'Overloads Cover 3 deep-third and flat defenders',
      'Provides clear pre-snap coverage declaration based on safety shade',
      'Creates easy high-low and hi-lo triangle reads for the QB',
      'Protects the quarterback with a 6-man pass protection pocket (3 OL + RB)',
    ],
    bestVsCoverage: ['Cover 3 Zone', 'Cover 1 Man-Free', 'Single-High Safety', 'Cover 0 (Quick Outlets)'],
    vulnerability: 'Can be vulnerable to backside boundary corner blitzes if RB does not scan the isolated side.',
    passRunRatio: '75% Pass / 25% Run',
    colorScheme: {
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      border: 'border-blue-200 hover:border-blue-400',
      cardBg: 'bg-white',
      accent: '#2563eb',
      text: 'text-blue-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'RB', label: 'RB', role: 'Running Back', posType: 'RB', x: 40, y: 75 },
      { id: 'X', label: 'X', role: 'Solo Boundary WR', posType: 'WR', x: 14, y: 65 },
      { id: 'Y', label: 'Y', role: 'Inside Slot', posType: 'WR', x: 72, y: 66 },
      { id: 'Z', label: 'Z', role: 'Outside Flanker', posType: 'WR', x: 88, y: 65 },
    ],
  },
  {
    id: 'spread_twins',
    name: 'Spread & Twins (2x2 Balanced Spread)',
    shortName: 'Spread 2x2',
    category: 'TWINS PASS',
    aliases: ['Twins', 'Twins Pass', 'Twins Run', 'TWINS PASS', 'TWINS RUN', '2x2 Spread', 'Spread'],
    personnelId: '10_SPREAD',
    personnelCode: '10 / 00 Personnel (2x2 Balanced)',
    personnelDescription: '3 Offensive Linemen, 1 Quarterback, 1 Running Back / Slot, and 4 Wide Receivers balanced with 2 on the left and 2 on the right.',
    tagline: 'Horizontally stretches 2-high safeties and opens interior seams',
    philosophy:
      'Forces the defense into horizontal conflict across the entire 53.3-yard width of the field. Symmetrically stresses two-high safeties, opening inside seam routes, quick slant-bubble combinations, and dual curl-flat concepts.',
    keyStrengths: [
      'Even distribution of pass threats prevents defensive defensive roll',
      'Opens interior running lanes for draw and quarterback read-option',
      'High efficiency on quick-game hitches, slants, and speed outs (< 1.8s)',
      'Allows mirrored concepts with symmetrical progression reads',
    ],
    bestVsCoverage: ['Cover 2 Zone', 'Cover 4 Quarters', 'Cover 2 Man Under', 'Tampa 2'],
    vulnerability: 'Boundary cornerbacks with tight press leverage can disrupt timing if receivers fail release.',
    passRunRatio: '70% Pass / 30% Run',
    colorScheme: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      border: 'border-emerald-200 hover:border-emerald-400',
      cardBg: 'bg-white',
      accent: '#059669',
      text: 'text-emerald-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'X', label: 'X', role: 'Far Left WR', posType: 'WR', x: 12, y: 65 },
      { id: 'H', label: 'H', role: 'Left Slot', posType: 'WR', x: 28, y: 66 },
      { id: 'Y', label: 'Y', role: 'Right Slot', posType: 'WR', x: 72, y: 66 },
      { id: 'Z', label: 'Z', role: 'Far Right WR', posType: 'WR', x: 88, y: 65 },
    ],
  },
  {
    id: 'empty',
    name: 'Empty (5-Out / 0-Back Quick Strike)',
    shortName: 'Empty 4/5W',
    category: 'EMPTY PASS',
    aliases: ['Empty', 'Empty Pass', 'Empty Run', 'EMPTY PASS', 'EMPTY RUN', '5-Wide', 'Empty 4-Wide'],
    personnelId: '00_EMPTY',
    personnelCode: '00 Personnel (0 RB, 4 WR)',
    personnelDescription: '3 Offensive Linemen (LG, C, RG) in strict 3-man slide protection, 1 Shotgun QB, and all 4 receivers detached into open space.',
    tagline: 'Maximum space creation, fast reads, and instant hot-route Blitz Beaters',
    philosophy:
      'Empties the backfield to immediately reveal defensive intentions. If the defense blitzes 4 or 5 defenders, the QB has guaranteed hot outlets with uncovered grass. Demands crisp route timing and rapid throw triggers.',
    keyStrengths: [
      'Unmasks defensive coverage (man vs zone) instantaneously pre-snap',
      'Provides 4 immediate eligible routes attacking all field quadrants',
      'Deadly on quarterback draw / keep runs against spread out box',
      'Forces linebackers into mismatched space against agile slot receivers',
    ],
    bestVsCoverage: ['Cover 0 Blitz', 'Zone Blitz', 'Soft Cover 3 Off-Coverage', 'Bracket Coverages'],
    vulnerability: '3-man offensive line protection gives QB only 2.2 seconds before interior pass rush arrives.',
    passRunRatio: '85% Pass / 15% Run (QB Draw)',
    colorScheme: {
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      border: 'border-cyan-200 hover:border-cyan-400',
      cardBg: 'bg-white',
      accent: '#0891b2',
      text: 'text-cyan-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'X', label: 'X', role: 'Outside WR 1', posType: 'WR', x: 10, y: 65 },
      { id: 'H', label: 'H', role: 'Slot Receiver 1', posType: 'WR', x: 26, y: 66 },
      { id: 'Y', label: 'Y', role: 'Slot Receiver 2', posType: 'WR', x: 74, y: 66 },
      { id: 'Z', label: 'Z', role: 'Outside WR 2', posType: 'WR', x: 90, y: 65 },
    ],
  },
  {
    id: 'split_backs',
    name: 'Split Backs & Pro Sets (2-Back Power)',
    shortName: 'Split Backs',
    category: 'SPLIT RUN',
    aliases: ['Split', 'Split Pass', 'Split Run', 'SPLIT PASS', 'SPLIT RUN', 'Pro Set', '2-Back'],
    personnelId: '20_SPLIT',
    personnelCode: '20 Personnel (2 RB, 2 WR)',
    personnelDescription: '3 Offensive Linemen, 1 QB in pistol/shotgun, 2 split running backs (RB & HB) flanking the pocket, and 2 boundary perimeter WRs.',
    tagline: 'Dual-threat backfield power, deceptive sweeps, and play-action bootlegs',
    philosophy:
      'Creates uncertainty for defensive interior linebackers. The dual-back backfield allows either back to take the handoff, lead block for the other, release on wheel routes, or execute devastating play-action bootleg mesh fakes.',
    keyStrengths: [
      'Superior 7-man maximum pass protection against all-out blitzes',
      'Dual-threat ground game: HB lead blocks, counter sweeps, and QB options',
      'Freezes inside linebackers on play-action fakes to unlock deep crossing routes',
      'Running backs leaking into flat/wheel routes create severe mismatches',
    ],
    bestVsCoverage: ['Cover 0 All-Out Blitz', 'Over-Aggressive Box Run Defenses', 'Man Coverage (RB vs LB)', 'Cover 1 Hole'],
    vulnerability: 'Only 2 pure wide receivers on the field limits horizontal 4-vertical downfield flood options.',
    passRunRatio: '50% Pass / 50% Run',
    colorScheme: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      border: 'border-amber-200 hover:border-amber-400',
      cardBg: 'bg-white',
      accent: '#d97706',
      text: 'text-amber-800',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'RB', label: 'RB', role: 'Left Back', posType: 'RB', x: 40, y: 77 },
      { id: 'HB', label: 'HB', role: 'Right Back', posType: 'RB', x: 60, y: 77 },
      { id: 'X', label: 'X', role: 'Left WR', posType: 'WR', x: 16, y: 65 },
      { id: 'Z', label: 'Z', role: 'Right WR', posType: 'WR', x: 84, y: 65 },
    ],
  },
  {
    id: 'tight_2line',
    name: '2-Line Tight (Heavy 12 / Compact Wings)',
    shortName: '2-Line Tight',
    category: '2 LINE PASS',
    aliases: ['2 Line', '2 Line Pass', '2 Line Run', '2 LINE PASS', '2 LINE RUN', 'Tight', '12 Heavy'],
    personnelId: '12_HEAVY',
    personnelCode: '12 / 11 Personnel (1 RB, 1-2 TE/Wings)',
    personnelDescription: '3 Offensive Linemen, 1 QB in pistol/shotgun, 1 deep Pistol Running Back, and tight compressed wing receivers/TEs (Y, Z, X).',
    tagline: 'Condensed blocking surface, heavy power running, and tight-window seam strikes',
    philosophy:
      'Compresses the defensive formation inward, creating massive green space on the boundary sidelines. Built for punishing interior off-tackle power, play-action deep shots, and tight-end seam drags.',
    keyStrengths: [
      'Massive downhill blocking angles on off-tackle and power counters',
      'Pulls defensive safeties into the box, leaving 1-on-1 boundary opportunities',
      'Exceptional in Goal-Line and 3rd & Short conversion scenarios',
      'Compact releases create natural rubs and crossing traffic against man defense',
    ],
    bestVsCoverage: ['Cover 1 Man', 'Cover 3 Sky', 'Goal Line / Heavy Box Defenses', 'Soft Quarter Defenses'],
    vulnerability: 'Compressed field spacing makes perimeter screen passes difficult without fast lead blocks.',
    passRunRatio: '45% Pass / 55% Run',
    colorScheme: {
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      border: 'border-purple-200 hover:border-purple-400',
      cardBg: 'bg-white',
      accent: '#9333ea',
      text: 'text-purple-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'RB', label: 'RB', role: 'Pistol RB', posType: 'RB', x: 50, y: 81 },
      { id: 'X', label: 'X', role: 'Tight Left WR', posType: 'WR', x: 22, y: 65 },
      { id: 'Y', label: 'Y', role: 'Wing TE Right', posType: 'TE', x: 64, y: 66 },
      { id: 'Z', label: 'Z', role: 'Tight Right WR', posType: 'WR', x: 80, y: 65 },
    ],
  },
  {
    id: 'one_line',
    name: '1-Line Compressed (Single Wing / Goal Line)',
    shortName: '1-Line Set',
    category: '1 LINE PASS',
    aliases: ['1 Line', '1 Line Pass', '1 Line Run', '1 LINE PASS', '1 LINE RUN', 'Single Line', 'Goal Line'],
    personnelId: '12_HEAVY',
    personnelCode: '12 / 20 Personnel (Goal Line Heavy)',
    personnelDescription: '3 Offensive Linemen with all skill players lined up close to the line of scrimmage in a single continuous offensive line formation.',
    tagline: 'Condensed line of scrimmage power, unbalanced overloads, and goal-line execution',
    philosophy:
      'Maximizes point-of-attack physicality. Perfect for 4th-and-inches, goal line plunges, QB sneaks, and sudden play-action pop passes over crashing defensive linebackers.',
    keyStrengths: [
      'Unmatched short-yardage push and gap conversion percentage',
      'Unbalanced fronts force defensive alignment confusion at the goal line',
      'Disguises ball carrier on deceptive handoffs and reverse action',
      'Sudden play-action pop passes to tight ends caught wide open in the endzone',
    ],
    bestVsCoverage: ['Goal Line 5-3 Defense', 'Gap Blitzes', 'Aggressive Linebacker Run-Fills'],
    vulnerability: 'Zero boundary spacing makes dropback passing in long-down scenarios virtually impossible.',
    passRunRatio: '30% Pass / 70% Run',
    colorScheme: {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      border: 'border-rose-200 hover:border-rose-400',
      cardBg: 'bg-white',
      accent: '#e11d48',
      text: 'text-rose-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback Under Center', posType: 'QB', x: 50, y: 70 },
      { id: 'RB', label: 'RB', role: 'Fullback Plunge', posType: 'RB', x: 50, y: 78 },
      { id: 'X', label: 'X', role: 'Tight Left Wing', posType: 'WR', x: 34, y: 65 },
      { id: 'Y', label: 'Y', role: 'Inline Right TE', posType: 'TE', x: 66, y: 65 },
      { id: 'Z', label: 'Z', role: 'Right Wing End', posType: 'WR', x: 76, y: 65 },
    ],
  },
  {
    id: 'bunch',
    name: 'Bunch & Cluster (Condensed 3-Man Trips)',
    shortName: 'Bunch Cluster',
    category: 'TRIPS PASS',
    aliases: ['Bunch', 'Bunch Right', 'Bunch Left', 'Cluster', 'Bunch 3-Man', 'Trips Bunch'],
    personnelId: '10_SPREAD',
    personnelCode: '10 Personnel (Bunch)',
    personnelDescription: '3 Offensive Linemen, 1 QB, 1 RB in backfield, 1 Backside Solo WR, and a 3-man condensed cluster aligned within 4 yards of each other.',
    tagline: 'Natural rubs, pick concepts, and defensive communication breakdowns',
    philosophy:
      'Creates impossible traffic for man-to-man defenders. Receivers crisscross on mesh, snag, and wheel paths, creating legal rub routes and wide-open perimeter raceways for bubble screens.',
    keyStrengths: [
      'Destroys press-man coverage through immediate stacked route releases',
      'Forces defense into difficult switch/banjo communication calls',
      'Deadly screen blocking angles with 2 immediate lead blockers on the perimeter',
      'Provides quick checkdown access for the QB with minimal sack risk',
    ],
    bestVsCoverage: ['Cover 1 Press Man', 'Cover 0 Blitz', 'Match Coverage', 'Bracket Defenses'],
    vulnerability: 'Aggressive zone defenses with rolled-up squat corners can trap flat routes if not disciplined.',
    passRunRatio: '80% Pass / 20% Run',
    colorScheme: {
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      border: 'border-indigo-200 hover:border-indigo-400',
      cardBg: 'bg-white',
      accent: '#4f46e5',
      text: 'text-indigo-700',
    },
    alignmentCoordinates: [
      { id: 'LG', label: 'LG', role: 'Left Guard', posType: 'OL', x: 44, y: 65 },
      { id: 'C', label: 'C', role: 'Center', posType: 'OL', x: 50, y: 65 },
      { id: 'RG', label: 'RG', role: 'Right Guard', posType: 'OL', x: 56, y: 65 },
      { id: 'QB', label: 'QB', role: 'Quarterback', posType: 'QB', x: 50, y: 75 },
      { id: 'RB', label: 'RB', role: 'Running Back', posType: 'RB', x: 40, y: 75 },
      { id: 'X', label: 'X', role: 'Backside Solo WR', posType: 'WR', x: 14, y: 65 },
      { id: 'Z', label: 'Z', role: 'Point Receiver', posType: 'WR', x: 78, y: 65 },
      { id: 'Y', label: 'Y', role: 'Outside Bunch Wing', posType: 'WR', x: 86, y: 67 },
    ],
  },
];

// Intelligently classify any play into its primary formation family
export function detectPlayFormationFamily(play: Play): string {
  const cat = (play.category || '').toUpperCase();
  const formName = (play.formationName || '').toUpperCase();
  const code = (play.code || '').toUpperCase();
  const name = (play.englishName || '').toUpperCase();
  const desc = (play.description || '').toUpperCase();
  const tags = (play.tags || []).map((t) => t.toUpperCase());

  // Check custom first
  if (play.id.startsWith('custom-') || tags.includes('CUSTOM PLAY') || tags.includes('WHITEBOARD DESIGNED')) {
    // If it matches a standard name, group it under that, otherwise custom
    if (formName.includes('TRIPS') || cat.includes('TRIPS')) return 'trips';
    if (formName.includes('TWINS') || formName.includes('SPREAD') || cat.includes('TWINS')) return 'spread_twins';
    if (formName.includes('EMPTY') || cat.includes('EMPTY')) return 'empty';
    if (formName.includes('SPLIT') || cat.includes('SPLIT')) return 'split_backs';
    if (formName.includes('2 LINE') || formName.includes('2-LINE') || cat.includes('2 LINE')) return 'tight_2line';
    if (formName.includes('1 LINE') || formName.includes('1-LINE') || cat.includes('1 LINE')) return 'one_line';
    if (formName.includes('BUNCH') || code.includes('BUNCH')) return 'bunch';
  }

  // Bunch detection
  if (formName.includes('BUNCH') || code.includes('BUNCH') || name.includes('BUNCH') || desc.includes('BUNCH')) {
    return 'bunch';
  }

  // Trips detection
  if (cat.includes('TRIPS') || formName.includes('TRIPS') || code.includes('TRIPS') || name.includes('TRIPS')) {
    return 'trips';
  }

  // Spread & Twins detection
  if (
    cat.includes('TWINS') ||
    formName.includes('TWINS') ||
    formName.includes('SPREAD') ||
    code.includes('TWINS') ||
    code.includes('SPREAD') ||
    name.includes('SPREAD') ||
    name.includes('2X2')
  ) {
    return 'spread_twins';
  }

  // Empty detection
  if (cat.includes('EMPTY') || formName.includes('EMPTY') || code.includes('EMPTY') || name.includes('EMPTY')) {
    return 'empty';
  }

  // Split Backs detection
  if (cat.includes('SPLIT') || formName.includes('SPLIT') || code.includes('SPLIT') || name.includes('SPLIT') || name.includes('2-BACK')) {
    return 'split_backs';
  }

  // 2-Line Tight detection
  if (cat.includes('2 LINE') || formName.includes('2 LINE') || formName.includes('2-LINE') || code.includes('2 LINE') || name.includes('2-LINE') || name.includes('TIGHT')) {
    return 'tight_2line';
  }

  // 1-Line detection
  if (cat.includes('1 LINE') || formName.includes('1 LINE') || formName.includes('1-LINE') || code.includes('1 LINE') || name.includes('1-LINE') || name.includes('GOAL LINE')) {
    return 'one_line';
  }

  return 'trips'; // Default fallback
}

// Detect specific personnel grouping for any play based on its player roster keys
export function detectPlayPersonnelGrouping(play: Play): PersonnelGroupingId {
  const formFamily = detectPlayFormationFamily(play);

  if (formFamily === 'empty') return '00_EMPTY';
  if (formFamily === 'split_backs') return '20_SPLIT';
  if (formFamily === 'tight_2line' || formFamily === 'one_line') return '12_HEAVY';

  // Count player roles in player assignments if available
  if (play.players) {
    const playersList = Object.values(play.players);
    const rbCount = playersList.filter((p) => p.id === 'RB' || p.id === 'HB' || p.positionName?.toLowerCase().includes('running back')).length;
    const teCount = playersList.filter((p) => p.id === 'TE' || p.id === 'Y' && p.positionName?.toLowerCase().includes('tight end')).length;

    if (rbCount === 0) return '00_EMPTY';
    if (rbCount >= 2) return '20_SPLIT';
    if (teCount >= 1 && rbCount >= 1) return '11_BALANCED';
    if (rbCount === 1) return '10_SPREAD';
  }

  if (formFamily === 'trips' || formFamily === 'spread_twins' || formFamily === 'bunch') {
    return '10_SPREAD';
  }

  return '10_SPREAD';
}
