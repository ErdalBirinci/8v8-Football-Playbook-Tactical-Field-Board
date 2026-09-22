import { RosterPlayer } from '../types';

export const LOCAL_STORAGE_ROSTER_KEY = 'gridiron_8v8_team_roster_3ol';
export const LOCAL_STORAGE_TOKEN_MODE_KEY = 'gridiron_8v8_token_mode';
export const LOCAL_STORAGE_TEAM_INFO_KEY = 'gridiron_8v8_team_info';

export interface TeamInfo {
  teamName: string;
  headCoach: string;
  offensiveCoordinator: string;
  primaryColor: string;
  secondaryColor: string;
}

export const DEFAULT_TEAM_INFO: TeamInfo = {
  teamName: 'Aalto Predators',
  headCoach: 'Coach Predators',
  offensiveCoordinator: 'Coach Offense',
  primaryColor: '#E31B23',
  secondaryColor: '#FFF8E7',
};

// 8 Offensive Field Slots standard for 8v8 football with 3 O-Line (Finland University League)
export const OFFENSIVE_SLOTS: { id: string; name: string; shortDesc: string; recommendedPos: string[] }[] = [
  { id: 'QB', name: 'Quarterback', shortDesc: 'Field General & Distributor', recommendedPos: ['QB'] },
  { id: 'C', name: 'Center / Snapper (3 O-Line)', shortDesc: 'Interior Pocket Anchor & Snapper', recommendedPos: ['C', 'OL'] },
  { id: 'LG', name: 'Left Guard (3 O-Line)', shortDesc: 'Left Pocket Pass Pro & Pull Specialist', recommendedPos: ['LG', 'OL', 'OT', 'G'] },
  { id: 'RG', name: 'Right Guard (3 O-Line)', shortDesc: 'Right Pocket Pass Pro & Drive Blocker', recommendedPos: ['RG', 'OL', 'OT', 'G'] },
  { id: 'X', name: 'Outside Receiver (X / Solo)', shortDesc: 'Boundary / Iso Deep Threat', recommendedPos: ['WR'] },
  { id: 'Z', name: 'Outside Receiver (Z / Flanker)', shortDesc: 'Field / Motion Receiver', recommendedPos: ['WR', 'SLOT'] },
  { id: 'Y', name: 'Slot Receiver / TE (Y)', shortDesc: 'Seam / Crosser / Mismatch Target', recommendedPos: ['TE', 'SLOT', 'WR'] },
  { id: 'RB', name: 'Running Back / HB', shortDesc: 'Ball Carrier, Blitz Pickup & Checkdown', recommendedPos: ['RB', 'ATH'] },
];

export const SAMPLE_ATHLETE_NAMES = [
  'Patrick Mahomes',
  'Jason Kelce',
  'Quenton Nelson',
  'Zack Martin',
  'Justin Jefferson',
  'Tyreek Hill',
  'Travis Kelce',
  'Christian McCaffrey',
  "Ja'Marr Chase",
  'CeeDee Lamb',
  'Trent Williams',
  'Derrick Henry',
  'Lamar Jackson',
  'A.J. Brown',
  'Amon-Ra St. Brown',
  'Creed Humphrey',
  'Cam Ward',
  'Tyler Booker',
  'Travis Hunter',
  'Tetairoa McMillan',
  'Luther Burden III',
  'Ryan Williams',
  'Colston Loveland',
  'Ashton Jeanty',
  'Mason Davis',
  'Leo Chen',
  'Alex Johnson',
  'Jordan Brooks',
  'Sammy Miller',
  'Noah Clark',
  'Ethan Wright',
  'Carter Hayes',
];

export const DEFAULT_ROSTER: RosterPlayer[] = [
  {
    id: 'p-qb-12',
    name: 'Quarterback',
    jerseyNumber: '12',
    primaryPosition: 'QB',
    assignedSlot: 'QB',
    status: 'starter',
    speedRating: 88,
    handsRating: 95,
    notes: 'Field general, dropback timing, and progression reads behind 3 O-Line.',
    avatarColor: '#dc2626',
  },
  {
    id: 'p-c-50',
    name: 'Center',
    jerseyNumber: '50',
    primaryPosition: 'C',
    assignedSlot: 'C',
    status: 'starter',
    speedRating: 84,
    handsRating: 88,
    notes: '3 O-Line Anchor. Shotgun snap accuracy and interior A-gap pass protection.',
    avatarColor: '#334155',
  },
  {
    id: 'p-lg-64',
    name: 'Left Guard',
    jerseyNumber: '64',
    primaryPosition: 'OL',
    assignedSlot: 'LG',
    status: 'starter',
    speedRating: 82,
    handsRating: 80,
    notes: '3 O-Line Left Guard. Pass protection anchor on left B-gap rushers.',
    avatarColor: '#475569',
  },
  {
    id: 'p-rg-65',
    name: 'Right Guard',
    jerseyNumber: '65',
    primaryPosition: 'OL',
    assignedSlot: 'RG',
    status: 'starter',
    speedRating: 81,
    handsRating: 82,
    notes: '3 O-Line Right Guard. Pass protection anchor on right B-gap rushers.',
    avatarColor: '#475569',
  },
  {
    id: 'p-x-11',
    name: 'Wide Receiver (X)',
    jerseyNumber: '11',
    primaryPosition: 'WR',
    assignedSlot: 'X',
    status: 'starter',
    speedRating: 95,
    handsRating: 98,
    notes: 'Boundary split end. Isolated 1-on-1 matchups and boundary routes.',
    avatarColor: '#7c3aed',
  },
  {
    id: 'p-z-17',
    name: 'Wide Receiver (Z)',
    jerseyNumber: '17',
    primaryPosition: 'WR',
    assignedSlot: 'Z',
    status: 'starter',
    speedRating: 99,
    handsRating: 93,
    notes: 'Field flanker. Deep vertical routes, speed outs, and motion receiver.',
    avatarColor: '#0284c7',
  },
  {
    id: 'p-y-80',
    name: 'Slot Receiver (Y)',
    jerseyNumber: '80',
    primaryPosition: 'TE',
    assignedSlot: 'Y',
    status: 'starter',
    speedRating: 89,
    handsRating: 98,
    notes: 'Inside slot / tight end hybrid. Seam routes, corner routes, and intermediate crossers.',
    avatarColor: '#ea580c',
  },
  {
    id: 'p-h-84',
    name: 'Slot Receiver (H)',
    jerseyNumber: '84',
    primaryPosition: 'SLOT',
    assignedSlot: 'H',
    status: 'starter',
    speedRating: 93,
    handsRating: 94,
    notes: 'Second inside slot receiver. Quick underneath options, drags, and mesh crossing routes.',
    avatarColor: '#059669',
  },
  {
    id: 'p-rb-28',
    name: 'Running Back',
    jerseyNumber: '28',
    primaryPosition: 'RB',
    assignedSlot: 'RB',
    status: 'starter',
    speedRating: 95,
    handsRating: 94,
    notes: 'Dual-threat back. Ball carrier, blitz pickup, and checkdown outlet.',
    avatarColor: '#9333ea',
  },
  // High quality reserves
  {
    id: 'p-slot-backup',
    name: 'Backup Slot Receiver',
    jerseyNumber: '1',
    primaryPosition: 'SLOT',
    assignedSlot: null,
    status: 'bench',
    speedRating: 96,
    handsRating: 97,
    notes: 'Physical slot separator. Excels on quick slants, drags, and whip routes.',
    avatarColor: '#059669',
  },
  {
    id: 'p-wr-backup-2',
    name: 'Backup Wide Receiver',
    jerseyNumber: '88',
    primaryPosition: 'WR',
    assignedSlot: null,
    status: 'bench',
    speedRating: 95,
    handsRating: 97,
    notes: 'Versatile slot & boundary weapon on choice routes.',
    avatarColor: '#f59e0b',
  },
  {
    id: 'p-ol-backup',
    name: 'Backup Offensive Lineman',
    jerseyNumber: '71',
    primaryPosition: 'OL',
    assignedSlot: null,
    status: 'bench',
    speedRating: 83,
    handsRating: 80,
    notes: 'Power backup offensive lineman for 3 O-Line rotations.',
    avatarColor: '#64748b',
  },
  {
    id: 'p-rb-backup',
    name: 'Backup Running Back',
    jerseyNumber: '22',
    primaryPosition: 'RB',
    assignedSlot: null,
    status: 'bench',
    speedRating: 92,
    handsRating: 86,
    notes: 'Power back for short yardage, goal-line, and dive concepts.',
    avatarColor: '#b45309',
  },
  // Reserves / Backups
  {
    id: 'p-qb-backup',
    name: 'Backup Quarterback',
    jerseyNumber: '8',
    primaryPosition: 'QB',
    assignedSlot: null,
    status: 'substitute',
    speedRating: 97,
    handsRating: 90,
    notes: 'Dynamic rollout mobility and sudden sideline darts.',
    avatarColor: '#1d4ed8',
  },
  {
    id: 'p-wr-backup-3',
    name: 'Reserve Wide Receiver',
    jerseyNumber: '14',
    primaryPosition: 'WR',
    assignedSlot: null,
    status: 'substitute',
    speedRating: 94,
    handsRating: 95,
    notes: 'Intermediate route technician on mesh drags and quick slants.',
    avatarColor: '#0d9488',
  },
  {
    id: 'p-c-backup',
    name: 'Backup Center',
    jerseyNumber: '77',
    primaryPosition: 'C',
    assignedSlot: null,
    status: 'substitute',
    speedRating: 82,
    handsRating: 86,
    notes: 'Flawless snap accuracy and immediate pass pro anchor.',
    avatarColor: '#64748b',
  },
];

export const ROSTER_PRESETS: { name: string; description: string; roster: RosterPlayer[] }[] = [
  {
    name: 'NFL All-Pro 8v8',
    description: 'Premier pro stars with specialized route archetypes and attributes for 8v8.',
    roster: DEFAULT_ROSTER,
  },
  {
    name: 'College Showcase Squad (8v8)',
    description: 'High-octane collegiate 8v8 roster emphasizing vertical speed and 4-receiver spacing.',
    roster: [
      {
        id: 'c-qb-7',
        name: 'Cam Ward',
        jerseyNumber: '7',
        primaryPosition: 'QB',
        assignedSlot: 'QB',
        status: 'starter',
        speedRating: 91,
        handsRating: 92,
        notes: 'Gunslinger arm with quick pocket escape.',
        avatarColor: '#dc2626',
      },
      {
        id: 'c-c-55',
        name: 'Tyler Booker',
        jerseyNumber: '55',
        primaryPosition: 'C',
        assignedSlot: 'C',
        status: 'starter',
        speedRating: 80,
        handsRating: 85,
        notes: 'Reliable pivot snap and quick check.',
        avatarColor: '#475569',
      },
      {
        id: 'c-x-2',
        name: 'Travis Hunter',
        jerseyNumber: '2',
        primaryPosition: 'WR',
        assignedSlot: 'X',
        status: 'starter',
        speedRating: 97,
        handsRating: 99,
        notes: 'Unstoppable 50/50 ball winner on boundary fades.',
        avatarColor: '#7c3aed',
      },
      {
        id: 'c-z-4',
        name: 'Tetairoa McMillan',
        jerseyNumber: '4',
        primaryPosition: 'WR',
        assignedSlot: 'Z',
        status: 'starter',
        speedRating: 93,
        handsRating: 97,
        notes: 'High-point catch radius on 8-post routes.',
        avatarColor: '#0284c7',
      },
      {
        id: 'c-h-3',
        name: 'Luther Burden III',
        jerseyNumber: '3',
        primaryPosition: 'SLOT',
        assignedSlot: 'H',
        status: 'starter',
        speedRating: 96,
        handsRating: 95,
        notes: 'Explosive separation off the line on tunnel screens and option routes.',
        avatarColor: '#059669',
      },
      {
        id: 'c-w-1',
        name: 'Ryan Williams',
        jerseyNumber: '1',
        primaryPosition: 'WR',
        assignedSlot: 'W',
        status: 'starter',
        speedRating: 98,
        handsRating: 96,
        notes: 'Dynamic 8v8 slot receiver (+1 WR). Deep threat on inside posts.',
        avatarColor: '#f59e0b',
      },
      {
        id: 'c-y-6',
        name: 'Colston Loveland',
        jerseyNumber: '6',
        primaryPosition: 'TE',
        assignedSlot: 'Y',
        status: 'starter',
        speedRating: 90,
        handsRating: 96,
        notes: 'Seam splitter with soft hands over linebackers.',
        avatarColor: '#ea580c',
      },
      {
        id: 'c-rb-0',
        name: 'Ashton Jeanty',
        jerseyNumber: '0',
        primaryPosition: 'RB',
        assignedSlot: 'RB',
        status: 'starter',
        speedRating: 96,
        handsRating: 94,
        notes: 'Unbelievable contact balance and wheel route acceleration.',
        avatarColor: '#9333ea',
      },
    ],
  },
  {
    name: 'Youth Flag Football Academy (8v8)',
    description: 'Youth developmental 8v8 squad with simple numbering and balanced skillsets.',
    roster: [
      {
        id: 'y-qb-12',
        name: 'Mason Davis',
        jerseyNumber: '12',
        primaryPosition: 'QB',
        assignedSlot: 'QB',
        status: 'starter',
        speedRating: 85,
        handsRating: 88,
        notes: 'Consistent 1-step drops and quick delivery.',
        avatarColor: '#dc2626',
      },
      {
        id: 'y-c-50',
        name: 'Leo Chen',
        jerseyNumber: '50',
        primaryPosition: 'C',
        assignedSlot: 'C',
        status: 'starter',
        speedRating: 80,
        handsRating: 85,
        notes: 'Great snapping technique and immediate heads-up awareness.',
        avatarColor: '#475569',
      },
      {
        id: 'y-x-81',
        name: 'Alex Johnson',
        jerseyNumber: '81',
        primaryPosition: 'WR',
        assignedSlot: 'X',
        status: 'starter',
        speedRating: 90,
        handsRating: 89,
        notes: 'Runs crisp 5-yard out routes and comeback stems.',
        avatarColor: '#7c3aed',
      },
      {
        id: 'y-z-88',
        name: 'Jordan Brooks',
        jerseyNumber: '88',
        primaryPosition: 'WR',
        assignedSlot: 'Z',
        status: 'starter',
        speedRating: 92,
        handsRating: 88,
        notes: 'Go-route speed down the right sideline.',
        avatarColor: '#0284c7',
      },
      {
        id: 'y-h-13',
        name: 'Sammy Miller',
        jerseyNumber: '13',
        primaryPosition: 'SLOT',
        assignedSlot: 'H',
        status: 'starter',
        speedRating: 91,
        handsRating: 92,
        notes: 'Quick feet on shallow cross and drag routes.',
        avatarColor: '#059669',
      },
      {
        id: 'y-w-85',
        name: 'Noah Clark',
        jerseyNumber: '85',
        primaryPosition: 'WR',
        assignedSlot: 'W',
        status: 'starter',
        speedRating: 90,
        handsRating: 91,
        notes: '8v8 +1 WR inside slot route runner and reliable outlet.',
        avatarColor: '#f59e0b',
      },
      {
        id: 'y-y-84',
        name: 'Ethan Wright',
        jerseyNumber: '84',
        primaryPosition: 'TE',
        assignedSlot: 'Y',
        status: 'starter',
        speedRating: 87,
        handsRating: 90,
        notes: 'Reliable target on curl routes over the middle.',
        avatarColor: '#ea580c',
      },
      {
        id: 'y-rb-22',
        name: 'Carter Hayes',
        jerseyNumber: '22',
        primaryPosition: 'RB',
        assignedSlot: 'RB',
        status: 'starter',
        speedRating: 91,
        handsRating: 89,
        notes: 'Quick swing and flat release out of backfield.',
        avatarColor: '#9333ea',
      },
    ],
  },
];

// Helper: get clean position name for slot or position
export function getDefaultPositionNameForSlot(slot: string | null | undefined, primaryPosition: string): string {
  if (slot === 'QB') return 'Quarterback';
  if (slot === 'C') return 'Center';
  if (slot === 'LG') return 'Left Guard';
  if (slot === 'RG') return 'Right Guard';
  if (slot === 'X') return 'Wide Receiver (X)';
  if (slot === 'Z') return 'Wide Receiver (Z)';
  if (slot === 'Y') return 'Slot Receiver (Y)';
  if (slot === 'H') return 'Slot Receiver (H)';
  if (slot === 'W') return 'Wide Receiver (W)';
  if (slot === 'RB' || slot === 'HB') return 'Running Back';
  if (primaryPosition === 'QB') return 'Quarterback';
  if (primaryPosition === 'C') return 'Center';
  if (primaryPosition === 'OL') return 'Offensive Lineman';
  if (primaryPosition === 'WR') return 'Wide Receiver';
  if (primaryPosition === 'SLOT' || primaryPosition === 'TE') return 'Slot Receiver';
  if (primaryPosition === 'RB') return 'Running Back';
  return 'Player';
}

// Helper: load roster from localStorage or fallback to default
export function loadRosterFromStorage(): RosterPlayer[] {
  if (typeof window === 'undefined') return DEFAULT_ROSTER;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ROSTER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasLG = parsed.some((p: RosterPlayer) => p.assignedSlot === 'LG');
        const hasRG = parsed.some((p: RosterPlayer) => p.assignedSlot === 'RG');
        if (hasLG && hasRG) {
          // If stored roster has sample celebrity names, replace them with position names
          let sanitized = false;
          const cleaned = parsed.map((p: RosterPlayer) => {
            if (SAMPLE_ATHLETE_NAMES.includes(p.name)) {
              sanitized = true;
              return {
                ...p,
                name: getDefaultPositionNameForSlot(p.assignedSlot, p.primaryPosition),
              };
            }
            return p;
          });
          if (sanitized) {
            saveRosterToStorage(cleaned);
          }
          return cleaned;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load roster from storage', err);
  }
  return DEFAULT_ROSTER;
}

// Helper: save roster to localStorage
export function saveRosterToStorage(roster: RosterPlayer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ROSTER_KEY, JSON.stringify(roster));
  } catch (err) {
    console.error('Failed to save roster to storage', err);
  }
}

// Helper: load team info
export function loadTeamInfoFromStorage(): TeamInfo {
  if (typeof window === 'undefined') return DEFAULT_TEAM_INFO;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TEAM_INFO_KEY);
    if (saved) {
      return { ...DEFAULT_TEAM_INFO, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_TEAM_INFO;
}

export function saveTeamInfoToStorage(info: TeamInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_TEAM_INFO_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
}

// Helper: load token display mode
export function loadTokenModeFromStorage(): 'jersey' | 'name' | 'both' | 'position' {
  if (typeof window === 'undefined') return 'jersey';
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TOKEN_MODE_KEY);
    if (saved && ['jersey', 'name', 'both', 'position'].includes(saved)) {
      return saved as 'jersey' | 'name' | 'both' | 'position';
    }
  } catch {
    // fallback
  }
  return 'jersey';
}

export function saveTokenModeToStorage(mode: 'jersey' | 'name' | 'both' | 'position'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

// Helper: map slot key (e.g. 'QB', 'X', 'Z', 'H', 'Y', 'C', 'RB') to assigned player
export function getPlayerAssignedToSlot(
  slotKey: string,
  roster: RosterPlayer[]
): RosterPlayer | undefined {
  // Normalize slotKey (e.g., 'HB' -> 'RB')
  const normalizedKey = slotKey === 'HB' ? 'RB' : slotKey;

  // 1. Direct match on assignedSlot
  const directMatch = roster.find((p) => p.assignedSlot === normalizedKey || p.assignedSlot === slotKey);
  if (directMatch) return directMatch;

  // 2. Fallback by position if starter
  const positionMatch = roster.find(
    (p) =>
      p.status === 'starter' &&
      ((normalizedKey === 'QB' && p.primaryPosition === 'QB') ||
        (normalizedKey === 'C' && (p.primaryPosition === 'C' || p.primaryPosition === 'OL')) ||
        (normalizedKey === 'LG' && (p.primaryPosition === 'LG' || p.primaryPosition === 'OL' || p.primaryPosition === 'OT' || p.primaryPosition === 'G')) ||
        (normalizedKey === 'RG' && (p.primaryPosition === 'RG' || p.primaryPosition === 'OL' || p.primaryPosition === 'OT' || p.primaryPosition === 'G')) ||
        (normalizedKey === 'RB' && p.primaryPosition === 'RB') ||
        (normalizedKey === 'X' && p.primaryPosition === 'WR') ||
        (normalizedKey === 'Z' && p.primaryPosition === 'WR') ||
        (normalizedKey === 'H' && p.primaryPosition === 'SLOT') ||
        (normalizedKey === 'Y' && (p.primaryPosition === 'TE' || p.primaryPosition === 'SLOT')))
  );

  return positionMatch;
}
