export type FormationCategory =
  | 'TRIPS PASS'
  | 'TRIPS RUN'
  | 'TWINS PASS'
  | 'TWINS RUN'
  | 'EMPTY PASS'
  | 'EMPTY RUN'
  | '2 LINE PASS'
  | '2 LINE RUN'
  | '1 LINE PASS'
  | '1 LINE RUN'
  | 'SPLIT PASS'
  | 'SPLIT RUN';

export type PlayType = 'PASS' | 'RUN' | 'SCREEN' | 'PLAY_ACTION' | 'RPO' | 'REVERSE';

export type Direction = 'RIGHT' | 'LEFT' | 'BALANCED';

export interface RoutePoint {
  x: number; // 0 (left sideline) to 100 (right sideline)
  y: number; // 0 (endzone top) to 100 (back of backfield). Line of Scrimmage is at y = 65
  type?: 'snap' | 'stem' | 'break' | 'target' | 'block' | 'motion' | 'handicap' | 'fake';
  label?: string;
}

export interface PlayerRoute {
  name: string; // e.g. "9 - Go / Streak", "Quick Slant", "Wheel", "Dual Slot Block", "Lead Block"
  routeNumber?: number | string;
  points: RoutePoint[];
  color?: string;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isCheckdown?: boolean;
  isBlocking?: boolean;
  isBallCarrier?: boolean;
  isFake?: boolean;
  notes?: string;
}

export interface PlayerAssignment {
  id: string; // 'QB', 'C', 'X', 'Z', 'H', 'Y', 'W', 'RB', 'HB'
  label: string; // e.g. 'QB', 'X (SOLO)', 'Z (WR)', 'H (SLOT)', 'Y (SLOT)', 'W (WR3)', 'RB'
  positionName: string; // 'Quarterback', 'Outside Receiver', 'Slot Receiver', 'Running Back'
  initialPos: { x: number; y: number };
  motion?: {
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    type: 'orbit' | 'jet' | 'across' | 'shift' | 'return';
    fakeAction?: string;
  };
  route: PlayerRoute;
  roleDescription: string;
}

export interface ProgressionRead {
  order: number; // 1, 2, 3, 4
  playerId: string;
  concept: string; // e.g. "Primary deep post read vs high safety"
  cue: string; // e.g. "If Corner bites on Flat, hit 8 Post behind him"
}

export type PlayTag =
  | 'RedZone'
  | 'LongDown'
  | 'QuickGame'
  | 'ShortYardage'
  | 'BlitzBeater'
  | 'DeepShot'
  | 'PlayAction'
  | 'ScreenGame'
  | 'TwoPoint'
  | 'MeshCrossers'
  | 'RunOption';

export interface PlayTagMeta {
  id: PlayTag | string;
  name: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
}

export interface TimestampedCoachingCue {
  id: string;
  timestamp: number; // 0.0 to 1.0 (normalized animation progress 0% to 100%)
  timeSeconds: number; // e.g. 0.00 to 4.00 seconds in animation timeline
  title: string;
  description: string; // Text-based coaching cue
  targetPlayerId?: string; // Player key e.g. 'QB', 'X', 'Z', 'H', 'RB', 'C', 'ALL'
  phaseLabel?: 'PRE-SNAP' | 'DROP / MESH' | 'READ & STEM' | 'BREAK & THROW' | 'CATCH & YAC' | string;
  category?: 'READ' | 'FOOTWORK' | 'LEVERAGE' | 'TIMING' | 'PROTECTION' | 'ROUTE';
  color?: string;
  createdAt?: number;
}

export interface Play {
  id: string;
  playNumber: string | number;
  code: string; // Original code from playbook, e.g. "97. TRIPS RIGHT 1 7 8"
  englishName: string; // e.g. "Trips Right - Out / Corner / Post (Smash-Post Concept)"
  originalTurkishCode: string;
  category: FormationCategory;
  playType: PlayType;
  direction: Direction;
  formationName: string;
  conceptName: string;
  tags: string[];
  description: string;
  coachingPoints: string[];
  progressionReads: ProgressionRead[];
  qbDrop: 'Shotgun 3-Step' | 'Shotgun 5-Step' | 'Quick 1-Step' | 'Rollout Right' | 'Rollout Left' | 'Play Action Mesh' | 'QB Keep';
  players: Record<string, PlayerAssignment>;
  coachingCues?: TimestampedCoachingCue[];
  defensiveCoverageId?: string;
  defensiveScoutData?: PlayDefensiveScout;
  drillData?: {
    drillId: string;
    cones: DrillCone[];
    repTarget?: number;
    coachingCue?: string;
    isDrill?: boolean;
  };
}

export interface DefensivePlayer {
  id: string;
  label: string;
  name: string;
  initialPos: { x: number; y: number };
  coverageType: 'man' | 'deep_third' | 'deep_half' | 'deep_quarter' | 'flat' | 'hook_curl' | 'blitz' | 'spy' | 'match' | 'bracket';
  targetOffensivePlayerId?: string;
  zoneArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
}

export interface DefenseScheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  weakness: string;
  strength: string;
  players: DefensivePlayer[];
  isCustom?: boolean;
  assignedPlayIds?: string[];
  coachingNotes?: string;
  createdAt?: number;
}

export interface PlayDefensiveScout {
  playId: string;
  primarySchemeId: string;
  secondarySchemeId?: string;
  notes?: string;
  scoutKeys?: string[];
  recommendedConceptCounter?: string;
  updatedAt?: number;
}

export interface FormationTemplatePlayerPosition {
  id: string;
  label: string;
  positionName: string;
  initialPos: { x: number; y: number };
  roleDescription?: string;
  defaultRouteNumber?: number | string;
}

export interface FormationTemplate {
  id: string;
  name: string;
  category?: FormationCategory | string;
  direction?: Direction;
  isBuiltIn?: boolean;
  description?: string;
  playerPositions: Record<string, FormationTemplatePlayerPosition>;
}

export type FolderColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan';

export interface PlayFolder {
  id: string;
  name: string;
  color: FolderColor;
  playIds: string[];
  createdAt: string;
  isDefault?: boolean;
  description?: string;
}

export type TokenDisplayMode = 'jersey' | 'position' | 'both' | 'name';

export interface TeamBrandingConfig {
  teamName: string;
  abbreviation: string;
  primaryJerseyColor: string; // e.g. '#1e3a8a' (Navy Blue)
  secondaryJerseyColor: string; // e.g. '#f59e0b' (Gold / Amber)
  numberTextColor: string; // '#ffffff'
  helmetColor: string; // '#1e293b'
  accentColor: string; // '#3b82f6'
  fieldGrassTone: 'classic' | 'emerald' | 'dark-stadium' | 'collegiate';
}

export interface PassProtectionScheme {
  id: string;
  name: string;
  code: string;
  type: 'BOB' | 'SLIDE_LEFT' | 'SLIDE_RIGHT' | 'HALF_SLIDE' | 'MAX_PROTECT' | 'FIVE_MAN_EMPTY';
  description: string;
  centerCall: string;
  guardResponsibility: string;
  rbResponsibility: string;
  qbHotRead: string;
  diagramNotes: string[];
}

export interface PracticeScriptItem {
  id: string;
  playId: string;
  order: number;
  period: string; // e.g. "1st & 10", "3rd & Medium", "Red Zone", "2-Minute"
  hash: 'LEFT' | 'MIDDLE' | 'RIGHT';
  targetDefenseId?: string;
  coachNote?: string;
}

export interface PracticeScript {
  id: string;
  title: string;
  date: string;
  gameWeek: string;
  items: PracticeScriptItem[];
}

export type PlayGameResult = 'COMPLETION' | 'INCOMPLETE' | 'TOUCHDOWN' | 'INTERCEPTION' | 'SACK' | 'RUSH_GAIN' | 'RUSH_LOSS' | 'PENALTY';

export interface InGameDrivePlay {
  id: string;
  playId: string;
  playCode: string;
  playType: PlayType;
  quarter: number; // 1, 2, 3, 4
  down: number; // 1, 2, 3, 4
  distance: number;
  result: PlayGameResult;
  yardsGained: number;
  isFirstDown: boolean;
  notes?: string;
  timestamp: string;
}

export interface PlayVideoLink {
  playId: string;
  url: string;
  title: string;
  platform: 'youtube' | 'hudl' | 'vimeo' | 'other';
  notes?: string;
  embedUrl?: string;
}

export interface RosterPlayer {
  id: string;
  name: string;
  jerseyNumber: string; // e.g. "15", "87", "1", "10", "7", "23"
  primaryPosition: 'QB' | 'WR' | 'SLOT' | 'RB' | 'C' | 'OL' | 'LG' | 'RG' | 'OT' | 'G' | 'TE' | 'ATH';
  assignedSlot: string | null; // 'QB' | 'C' | 'LG' | 'RG' | 'X' | 'Z' | 'H' | 'Y' | 'W' | 'RB' | 'HB' | null
  status: 'starter' | 'substitute' | 'injured' | 'bench';
  speedRating?: number; // 1-99
  handsRating?: number; // 1-99
  notes?: string;
  avatarColor?: string;
}

export interface DrillCone {
  id: string;
  x: number; // 0 to 100 on field SVG
  y: number; // 0 to 100 on field SVG
  label: string;
  color?: string;
  type?: 'cone' | 'shield' | 'marker';
}

export interface DrillTrainingSession {
  drillId: string;
  drillName: string;
  drillCategory: string;
  currentRep: number;
  targetReps: number; // 0 for infinite loop
  isAutoLoop: boolean;
  cadenceDelayMs: number; // e.g. 1000ms
  isResettingRep: boolean;
  coachingCue: string;
  cones: DrillCone[];
}

export interface TargetingHeatZone {
  id: string;
  readOrder: number; // 1, 2, 3, etc.
  playerId: string; // 'X', 'Z', 'Y', 'H', 'RB', etc.
  playerLabel: string;
  positionName: string;
  routeName: string;
  cx: number; // 0 - 100 on field SVG
  cy: number; // 0 - 100 on field SVG (Line of Scrimmage is 65)
  rx: number; // horizontal spread
  ry: number; // vertical depth
  depthYards: number; // yards from Line of Scrimmage
  successProbability: number; // 0 - 100 percentage
  epaTier: 'PRIMARY_RHYTHM' | 'INTERMEDIATE_CHAIN_MOVER' | 'SAFETY_VALVE' | 'EXPLOSIVE_SHOT';
  tierLabel: string;
  tacticalNote: string;
  coverageAdvantage: string;
  color: string;
  gradientId: string;
  // Dynamic play timeline tracking metrics
  liveSeparationYards?: number;
  coverageStatus?: string;
  targetPhase?: 'STEM' | 'BREAK' | 'OPEN_WINDOW' | 'SQUEEZED' | 'CHECKDOWN';
  receiverLivePos?: { x: number; y: number };
  nearestDefenderName?: string;
  nearestDefenderDist?: number;
}

export interface TargetingHeatMapAnalysis {
  playId: string;
  playCode: string;
  overallRating: number; // 0 - 100 overall passing progression efficiency
  primaryWindowSuccess: number; // e.g. 84%
  checkdownSafetyRating: number; // e.g. 89%
  deepShotPotential: number; // e.g. 68%
  bestCoverageMismatch: string;
  timingCues: string[];
  zones: TargetingHeatZone[];
  sensitivity?: number; // e.g. 1.0 (range: 0.5 to 1.5)
  highThreshold?: number; // threshold for Red (e.g. 78%)
  moderateThreshold?: number; // threshold for Yellow (e.g. 65%)
  isTimeTrackingActive?: boolean;
  timelineProgress?: number; // 0.0 - 1.0
  playTimeSeconds?: number; // e.g. 1.8s
  timelinePhaseDescription?: string;
  coverageShiftSummary?: string;
}

