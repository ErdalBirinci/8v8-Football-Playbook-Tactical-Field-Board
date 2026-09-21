import { Play, RoutePoint } from '../../types';
import { generateRoutePoints } from '../routeGenerator';

function createTwinsRunPlay(
  playNumber: number | string,
  isRight: boolean,
  playCodeSuffix: string,
  englishAction: string,
  runnerType: 'RB' | 'QB' | 'WR' | 'SR',
  runScheme: 'SWEEP_LEFT' | 'SWEEP_RIGHT' | 'TRAP_LEFT' | 'TRAP_RIGHT' | 'DIVE' | 'COUNTER_LEFT' | 'COUNTER_RIGHT' | 'MID_DRAW' | 'REVERSE' | 'PONCIK_LEFT' | 'PONCIK_RIGHT' | 'SCREEN',
  hasMotion: boolean = false,
  motionPlayer: 'WR' | 'SR' = 'WR',
  hasFake: boolean = false
): Play {
  const dir = isRight ? 'RIGHT' : 'LEFT';
  const sideLabel = isRight ? 'Right' : 'Left';
  const code = `${playNumber}. TWINS ${dir} ${playCodeSuffix}`;

  // 8v8 Twins Alignment with 3 O-Line (LG, C, RG) and RB:
  // Line of Scrimmage: LG at 44, C at 50, RG at 56
  // Backfield: QB at 50, RB at (isRight ? 42 : 58)
  // Left: X at 14 (WR), H at 28 (Slot)
  // Right: Z at 86 (WR)
  const xX = 14;
  const hX = 28;
  const zX = 86;
  const rbX = isRight ? 42 : 58;

  let rbPoints: RoutePoint[] = [{ x: rbX, y: 75, type: 'snap' }];
  let qbPoints: RoutePoint[] = [{ x: 50, y: 75, type: 'snap' }];
  let isRBCarrier = runnerType === 'RB';
  let isQBCarrier = runnerType === 'QB';

  if (runScheme === 'SWEEP_LEFT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'SWEEP_RUN_LEFT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'SWEEP_RUN_LEFT').points;
    }
  } else if (runScheme === 'SWEEP_RIGHT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'SWEEP_RUN_RIGHT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'SWEEP_RUN_RIGHT').points;
    }
  } else if (runScheme === 'DIVE') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'DIVE_RUN', { isRightSide: isRight }).points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'DIVE_RUN', { isRightSide: isRight }).points;
    }
  } else if (runScheme === 'TRAP_LEFT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'TRAP_RUN_LEFT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'TRAP_RUN_LEFT').points;
    }
  } else if (runScheme === 'TRAP_RIGHT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'TRAP_RUN_RIGHT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'TRAP_RUN_RIGHT').points;
    }
  } else if (runScheme === 'COUNTER_LEFT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'COUNTER_RUN_LEFT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'COUNTER_RUN_LEFT').points;
    }
  } else if (runScheme === 'COUNTER_RIGHT') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'COUNTER_RUN_RIGHT').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'COUNTER_RUN_RIGHT').points;
    }
  } else if (runScheme === 'MID_DRAW') {
    if (isRBCarrier) {
      rbPoints = generateRoutePoints(rbX, 75, 'MID_DRAW').points;
    } else if (isQBCarrier) {
      qbPoints = generateRoutePoints(50, 75, 'MID_DRAW').points;
    }
  }

  return {
    id: `twins-run-${playNumber}-${dir.toLowerCase()}`,
    playNumber,
    code,
    originalTurkishCode: code,
    englishName: `Twins ${sideLabel} - ${englishAction}`,
    category: 'TWINS RUN',
    playType: runScheme === 'SCREEN' ? 'SCREEN' : 'RUN',
    direction: dir,
    formationName: `Twins ${sideLabel} (8v8 3-OL Run)`,
    conceptName: `${englishAction} (${runnerType} Ball Carrier)`,
    tags: ['Twins', 'Run Play', `${runnerType} Run`, '3 O-Line', '8v8'],
    description: `8v8 Twins ${sideLabel} run play executing ${englishAction}. Powered by a 3-man offensive line front (LG, C, RG) with perimeter receiver stalk blocks.`,
    coachingPoints: [
      `Ball Carrier: ${runnerType}. Attack the designated perimeter/gap decisively behind 3 O-Line blocks.`,
      `3 O-Line: Guards and Center establish interior leverage and gap seal.`,
      `Perimeter receivers lock onto cornerbacks and safeties with aggressive stalk blocks.`,
    ],
    progressionReads: [
      { order: 1, playerId: runnerType === 'RB' ? 'RB' : 'QB', concept: `Primary Run Scheme (${runScheme})`, cue: 'Read lead block and edge leverage' },
    ],
    qbDrop: 'QB Keep',
    players: {
      QB: {
        id: 'QB',
        label: 'QB',
        positionName: 'Quarterback',
        initialPos: { x: 50, y: 75 },
        roleDescription: isQBCarrier ? 'Primary ball carrier' : (hasFake ? 'Mesh fake and boot away' : 'Handoff to running back'),
        route: {
          name: isQBCarrier ? 'QB Ball Carrier' : (hasFake ? 'Play Action Fake' : 'Handoff'),
          points: qbPoints,
          isBallCarrier: isQBCarrier,
          isFake: !isQBCarrier && hasFake,
          color: isQBCarrier ? '#ef4444' : '#64748b',
        },
      },
      C: {
        id: 'C',
        label: 'C',
        positionName: 'Center (3 O-Line)',
        initialPos: { x: 50, y: 65 },
        roleDescription: 'Snap ball and execute run block',
        route: {
          name: 'Interior Seal Block',
          points: [{ x: 50, y: 65, type: 'snap' }, { x: runScheme.includes('LEFT') ? 46 : 54, y: 60, type: 'block', label: 'SEAL' }],
          isBlocking: true,
          color: '#f59e0b',
        },
      },
      LG: {
        id: 'LG',
        label: 'LG',
        positionName: 'Left Guard (3 O-Line)',
        initialPos: { x: 44, y: 65 },
        roleDescription: runScheme.includes('LEFT') ? 'Lead drive block left gap' : 'Cutoff block',
        route: {
          name: runScheme.includes('LEFT') ? 'Drive Block' : 'Cutoff Block',
          points: [{ x: 44, y: 65, type: 'snap' }, { x: runScheme.includes('LEFT') ? 40 : 42, y: 58, type: 'block', label: 'BLOCK' }],
          isBlocking: true,
          color: '#f59e0b',
        },
      },
      RG: {
        id: 'RG',
        label: 'RG',
        positionName: 'Right Guard (3 O-Line)',
        initialPos: { x: 56, y: 65 },
        roleDescription: runScheme.includes('RIGHT') ? 'Lead drive block right gap' : 'Cutoff block',
        route: {
          name: runScheme.includes('RIGHT') ? 'Drive Block' : 'Cutoff Block',
          points: [{ x: 56, y: 65, type: 'snap' }, { x: runScheme.includes('RIGHT') ? 60 : 58, y: 58, type: 'block', label: 'BLOCK' }],
          isBlocking: true,
          color: '#f59e0b',
        },
      },
      RB: {
        id: 'RB',
        label: 'RB',
        positionName: 'Running Back',
        initialPos: { x: rbX, y: 75 },
        roleDescription: isRBCarrier ? 'Primary ball carrier' : 'Lead blocker or fake runner',
        route: {
          name: isRBCarrier ? 'RB Ball Carrier' : 'Lead Block',
          points: rbPoints,
          isBallCarrier: isRBCarrier,
          isBlocking: !isRBCarrier,
          color: isRBCarrier ? '#ef4444' : '#f59e0b',
        },
      },
      X: {
        id: 'X',
        label: 'X (WR-L)',
        positionName: 'Outside Left WR',
        initialPos: { x: xX, y: 65 },
        roleDescription: 'Stalk block left corner',
        route: {
          name: 'Stalk Block',
          points: [{ x: xX, y: 65, type: 'snap' }, { x: xX, y: 55, type: 'block', label: 'BLOCK' }],
          isBlocking: true,
          color: '#38bdf8',
        },
      },
      H: {
        id: 'H',
        label: 'H (Slot-L)',
        positionName: 'Inside Left Slot',
        initialPos: { x: hX, y: 66 },
        roleDescription: 'Stalk block linebacker or safety',
        route: {
          name: 'Stalk Block',
          points: [{ x: hX, y: 66, type: 'snap' }, { x: hX, y: 56, type: 'block', label: 'BLOCK' }],
          isBlocking: true,
          color: '#10b981',
        },
      },
      Z: {
        id: 'Z',
        label: 'Z (WR-R)',
        positionName: 'Outside Right WR',
        initialPos: { x: zX, y: 65 },
        roleDescription: 'Stalk block right corner',
        route: {
          name: 'Stalk Block',
          points: [{ x: zX, y: 65, type: 'snap' }, { x: zX, y: 55, type: 'block', label: 'BLOCK' }],
          isBlocking: true,
          color: '#ec4899',
        },
      },
    },
  };
}

export const TWINS_RUN_PLAYS: Play[] = [
  // 52
  createTwinsRunPlay(52, true, 'RB SWEEP LEFT', 'RB Sweep Left', 'RB', 'SWEEP_LEFT'),
  createTwinsRunPlay(52, false, 'RB SWEEP RIGHT', 'RB Sweep Right', 'RB', 'SWEEP_RIGHT'),
  // 53
  createTwinsRunPlay(53, true, 'RB SWEEP RIGHT FAKE QB SWEEP LEFT', 'RB Fake Sweep Right -> QB Sweep Left', 'QB', 'SWEEP_LEFT', false, 'WR', true),
  createTwinsRunPlay(53, false, 'RB SWEEP LEFT FAKE QB SWEEP RIGHT', 'RB Fake Sweep Left -> QB Sweep Right', 'QB', 'SWEEP_RIGHT', false, 'WR', true),
  // 54
  createTwinsRunPlay(54, true, 'WR MOTION SWEEP LEFT', 'WR Motion Sweep Left', 'WR', 'SWEEP_LEFT', true, 'WR'),
  createTwinsRunPlay(54, false, 'WR MOTION SWEEP RIGHT', 'WR Motion Sweep Right', 'WR', 'SWEEP_RIGHT', true, 'WR'),
  // 55
  createTwinsRunPlay(55, true, 'WR MOTION FAKE RB SWEEP LEFT', 'WR Motion Fake -> RB Sweep Left', 'RB', 'SWEEP_LEFT', true, 'WR', true),
  createTwinsRunPlay(55, false, 'WR MOTION FAKE RB SWEEP RIGHT', 'WR Motion Fake -> RB Sweep Right', 'RB', 'SWEEP_RIGHT', true, 'WR', true),
  // 56
  createTwinsRunPlay(56, true, 'RB TRAP LEFT', 'RB Trap Left', 'RB', 'TRAP_LEFT'),
  createTwinsRunPlay(56, false, 'RB TRAP RIGHT', 'RB Trap Right', 'RB', 'TRAP_RIGHT'),
  // 57
  createTwinsRunPlay(57, true, 'WR MOTION FAKE RB TRAP LEFT', 'WR Motion Fake -> RB Trap Left', 'RB', 'TRAP_LEFT', true, 'WR', true),
  createTwinsRunPlay(57, false, 'WR MOTION FAKE RB TRAP RIGHT', 'WR Motion Fake -> RB Trap Right', 'RB', 'TRAP_RIGHT', true, 'WR', true),
  // 58
  createTwinsRunPlay(58, true, 'WR MOTION TRAP LEFT', 'WR Motion Trap Left', 'WR', 'TRAP_LEFT', true, 'WR'),
  createTwinsRunPlay(58, false, 'WR MOTION TRAP RIGHT', 'WR Motion Trap Right', 'WR', 'TRAP_RIGHT', true, 'WR'),
  // 59
  createTwinsRunPlay(59, true, 'RB DIVE', 'RB Direct Dive', 'RB', 'DIVE'),
  createTwinsRunPlay(59, false, 'RB DIVE', 'RB Direct Dive', 'RB', 'DIVE'),
  // 60
  createTwinsRunPlay(60, true, 'WR MOTION DIVE', 'WR Motion Direct Dive', 'WR', 'DIVE', true, 'WR'),
  createTwinsRunPlay(60, false, 'WR MOTION DIVE', 'WR Motion Direct Dive', 'WR', 'DIVE', true, 'WR'),
  // 61
  createTwinsRunPlay(61, true, 'WR MOTION FAKE RB DIVE', 'WR Motion Fake -> RB Dive', 'RB', 'DIVE', true, 'WR', true),
  createTwinsRunPlay(61, false, 'WR MOTION FAKE RB DIVE', 'WR Motion Fake -> RB Dive', 'RB', 'DIVE', true, 'WR', true),
  // 62
  createTwinsRunPlay(62, true, 'WR MOTION FAKE QB DIVE (RB L)', 'WR Motion Fake -> QB Dive (RB Lead)', 'QB', 'DIVE', true, 'WR', true),
  createTwinsRunPlay(62, false, 'WR MOTION FAKE QB DIVE (RB L)', 'WR Motion Fake -> QB Dive (RB Lead)', 'QB', 'DIVE', true, 'WR', true),
  // 63
  createTwinsRunPlay(63, true, 'PICK', 'Perimeter Pick / Screen Play', 'WR', 'SWEEP_RIGHT'),
  createTwinsRunPlay(63, false, 'PICK', 'Perimeter Pick / Screen Play', 'WR', 'SWEEP_LEFT'),
  // 64
  createTwinsRunPlay(64, true, 'QB COUNTER LEFT ( RB LEAD )', 'QB Counter Left (RB Lead Block)', 'QB', 'COUNTER_LEFT'),
  createTwinsRunPlay(64, false, 'QB COUNTER RIGHT ( RB LEAD )', 'QB Counter Right (RB Lead Block)', 'QB', 'COUNTER_RIGHT'),
  // 65
  createTwinsRunPlay(65, true, 'RB COUNTER LEFT', 'RB Counter Left', 'RB', 'COUNTER_LEFT'),
  createTwinsRunPlay(65, false, 'RB COUNTER RIGHT', 'RB Counter Right', 'RB', 'COUNTER_RIGHT'),
  // 66
  createTwinsRunPlay(66, true, 'RB SWEEP RIGHT FAKE QB COUNTER LEFT', 'RB Fake Sweep Right -> QB Counter Left', 'QB', 'COUNTER_LEFT', false, 'WR', true),
  createTwinsRunPlay(66, false, 'RB SWEEP LEFT FAKE QB COUNTER RIGHT', 'RB Fake Sweep Left -> QB Counter Right', 'QB', 'COUNTER_RIGHT', false, 'WR', true),
  // 67
  createTwinsRunPlay(67, true, 'RB MID DRAW', 'RB Middle Draw', 'RB', 'MID_DRAW'),
  createTwinsRunPlay(67, false, 'RB MID DRAW', 'RB Middle Draw', 'RB', 'MID_DRAW'),
  // 68
  createTwinsRunPlay(68, true, 'QB MID DRAW ( RB LEAD )', 'QB Middle Draw (RB Lead Block)', 'QB', 'MID_DRAW'),
  createTwinsRunPlay(68, false, 'QB MID DRAW ( RB LEAD )', 'QB Middle Draw (RB Lead Block)', 'QB', 'MID_DRAW'),
  // 69
  createTwinsRunPlay(69, true, 'RB SWEEP RIGHT SR REVERSE', 'RB Sweep Right + Slot Receiver Reverse Left', 'SR', 'REVERSE'),
  createTwinsRunPlay(69, false, 'RB SWEEP LEFT SR REVERSE', 'RB Sweep Left + Slot Receiver Reverse Right', 'SR', 'REVERSE'),
  // 70
  createTwinsRunPlay(70, true, 'ORBIT JET SWEEP LEFT', 'Orbit Jet Sweep Left', 'SR', 'PONCIK_LEFT'),
  createTwinsRunPlay(70, false, 'ORBIT JET SWEEP RIGHT', 'Orbit Jet Sweep Right', 'SR', 'PONCIK_RIGHT'),
  // 71
  createTwinsRunPlay(71, true, 'MIDDLE SCREEN', 'Middle TE / Slot Screen', 'SR', 'SCREEN'),
  createTwinsRunPlay(71, false, 'MIDDLE SCREEN', 'Middle TE / Slot Screen', 'SR', 'SCREEN'),
  // 72
  createTwinsRunPlay(72, true, 'LINE SCREEN LEFT', 'Offensive Line Tunnel Screen Left', 'WR', 'SCREEN'),
  createTwinsRunPlay(72, false, 'LINE SCREEN RIGHT', 'Offensive Line Tunnel Screen Right', 'WR', 'SCREEN'),
];
