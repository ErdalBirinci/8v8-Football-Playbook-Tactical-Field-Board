import { Play, RoutePoint } from '../../types';
import { generateRoutePoints } from '../routeGenerator';

function createEmptyRunPlay(
  playNumber: number | string,
  isRight: boolean,
  playCodeSuffix: string,
  englishAction: string,
  runnerType: 'QB' | 'WR' | 'SR',
  runScheme: 'SWEEP_LEFT' | 'SWEEP_RIGHT' | 'REVERSE_RIGHT' | 'REVERSE_LEFT' | 'TRAP_LEFT' | 'TRAP_RIGHT' | 'DIVE' | 'COUNTER_LEFT' | 'COUNTER_RIGHT',
  hasMotion: boolean = false,
  motionPlayer: 'WR' | 'SR' = 'WR',
  motionFake: boolean = false
): Play {
  const dir = isRight ? 'RIGHT' : 'LEFT';
  const sideLabel = isRight ? 'Right' : 'Left';
  const code = `${playNumber}. EMPTY ${dir} ${playCodeSuffix}`;

  // 8v8 In Empty with 3 O-Line (LG, C, RG) and 4 Receivers (X, H, Y, Z):
  // Line of Scrimmage: LG at 44, C at 50, RG at 56
  // Backfield: QB alone at 50
  // Left Receivers: X at 14 (WR), H at 30 (Slot)
  // Right Receivers: Y at 70 (Slot), Z at 86 (WR)
  const xX = 14;
  const hX = 30;
  const yX = 70;
  const zX = 86;

  const motionStartX = isRight ? zX : xX;
  const motionEndX = isRight ? 35 : 65;

  let qbRouteName = 'QB Run Action';
  let qbPoints: RoutePoint[] = [{ x: 50, y: 75, type: 'snap' }];
  let qbIsCarrier = runnerType === 'QB';

  if (runScheme === 'SWEEP_LEFT') {
    qbPoints = generateRoutePoints(50, 75, 'SWEEP_RUN_LEFT').points;
    qbRouteName = 'QB Sweep Left';
  } else if (runScheme === 'SWEEP_RIGHT') {
    qbPoints = generateRoutePoints(50, 75, 'SWEEP_RUN_RIGHT').points;
    qbRouteName = 'QB Sweep Right';
  } else if (runScheme === 'DIVE') {
    qbPoints = generateRoutePoints(50, 75, 'DIVE_RUN', { isRightSide: isRight }).points;
    qbRouteName = 'QB Direct Dive';
  } else if (runScheme === 'TRAP_LEFT') {
    qbPoints = generateRoutePoints(50, 75, 'TRAP_RUN_LEFT').points;
    qbRouteName = 'QB Trap Left';
  } else if (runScheme === 'TRAP_RIGHT') {
    qbPoints = generateRoutePoints(50, 75, 'TRAP_RUN_RIGHT').points;
    qbRouteName = 'QB Trap Right';
  } else if (runScheme === 'COUNTER_LEFT') {
    qbPoints = generateRoutePoints(50, 75, 'COUNTER_RUN_LEFT').points;
    qbRouteName = 'QB Counter Left';
  } else if (runScheme === 'COUNTER_RIGHT') {
    qbPoints = generateRoutePoints(50, 75, 'COUNTER_RUN_RIGHT').points;
    qbRouteName = 'QB Counter Right';
  } else if (runScheme === 'REVERSE_RIGHT' || runScheme === 'REVERSE_LEFT') {
    qbPoints = [
      { x: 50, y: 75, type: 'snap' },
      { x: runScheme === 'REVERSE_RIGHT' ? 44 : 56, y: 77, type: 'fake' },
      { x: runScheme === 'REVERSE_RIGHT' ? 70 : 30, y: 74, type: 'stem' },
      { x: runScheme === 'REVERSE_RIGHT' ? 85 : 15, y: 40, type: 'target', label: 'REV' },
    ];
    qbRouteName = runScheme === 'REVERSE_RIGHT' ? 'QB Reverse Right' : 'QB Reverse Left';
  }

  return {
    id: `empty-run-${playNumber}-${dir.toLowerCase()}-${playCodeSuffix.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    playNumber,
    code,
    originalTurkishCode: code,
    englishName: `Empty ${sideLabel} - ${englishAction}`,
    category: 'EMPTY RUN',
    playType: 'RUN',
    direction: dir,
    formationName: `Empty ${sideLabel} (8v8 3-OL Run)`,
    conceptName: `${englishAction} (${runnerType} Ball Carrier)`,
    tags: ['Empty', 'Run Play', runnerType === 'QB' ? 'QB Run' : 'Motion Sweep', hasMotion ? 'Pre-Snap Motion' : 'Static', '3 O-Line', '8v8'],
    description: `8v8 Empty ${sideLabel} run concept (Finland University League) featuring ${englishAction}. Powered by a 3-man offensive line front (LG, C, RG) with perimeter blocking on vacated boxes.`,
    coachingPoints: [
      `Ball Carrier: ${runnerType}. Attack the designated gap/perimeter with decisive acceleration.`,
      `3 O-Line: Guards and Center establish inside-out leverage and seal interior linebackers.`,
      hasMotion ? `Motion Timing: ${motionPlayer} goes in pre-snap motion across the formation.` : `Direct snap execution.`,
      `Perimeter Blocking: Receivers stalk-block defensive backs on the edge to spring the run.`,
    ],
    progressionReads: [
      { order: 1, playerId: runnerType === 'QB' ? 'QB' : (isRight ? 'Z' : 'X'), concept: `Primary Run Track (${runScheme})`, cue: 'Read defensive end / edge contain leverage' },
      { order: 2, playerId: 'C', concept: '3 O-Line Interior Seal', cue: 'Seal interior linebacker' },
    ],
    qbDrop: 'QB Keep',
    players: {
      QB: {
        id: 'QB',
        label: 'QB',
        positionName: 'Quarterback',
        initialPos: { x: 50, y: 75 },
        roleDescription: qbIsCarrier ? `Primary ball carrier executing ${qbRouteName}` : (motionFake ? 'Mesh fake with motion man, roll away' : 'Handoff/pitch to motion runner'),
        route: {
          name: qbRouteName,
          points: qbPoints,
          isBallCarrier: qbIsCarrier,
          isFake: !qbIsCarrier,
          color: qbIsCarrier ? '#ef4444' : '#64748b',
        },
      },
      C: {
        id: 'C',
        label: 'C',
        positionName: 'Center (3 O-Line)',
        initialPos: { x: 50, y: 65 },
        roleDescription: 'Snap ball and execute run block',
        route: {
          name: 'Run Seal Block',
          points: [
            { x: 50, y: 65, type: 'snap' },
            { x: runScheme.includes('LEFT') ? 46 : 54, y: 60, type: 'block', label: 'SEAL' },
          ],
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
          points: [
            { x: 44, y: 65, type: 'snap' },
            { x: runScheme.includes('LEFT') ? 40 : 42, y: 58, type: 'block', label: 'BLOCK' },
          ],
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
          points: [
            { x: 56, y: 65, type: 'snap' },
            { x: runScheme.includes('RIGHT') ? 60 : 58, y: 58, type: 'block', label: 'BLOCK' },
          ],
          isBlocking: true,
          color: '#f59e0b',
        },
      },
      X: {
        id: 'X',
        label: 'X (WR-L)',
        positionName: 'Outside Left Receiver',
        initialPos: { x: xX, y: 65 },
        roleDescription: (!isRight && hasMotion && motionPlayer === 'WR') ? (runnerType === 'WR' ? 'Motion across and take handoff' : 'Motion fake across') : 'Stalk block left boundary corner',
        motion: (!isRight && hasMotion && motionPlayer === 'WR') ? {
          startPos: { x: xX, y: 65 },
          endPos: { x: 52, y: 74 },
          type: 'across',
        } : undefined,
        route: {
          name: (!isRight && runnerType === 'WR') ? 'Motion Sweep Carrier' : 'Perimeter Stalk Block',
          points: (!isRight && runnerType === 'WR') ? [
            { x: xX, y: 65, type: 'motion' },
            { x: 52, y: 74, type: 'snap' },
            { x: 74, y: 70, type: 'stem' },
            { x: 88, y: 45, type: 'target', label: 'RUN' },
          ] : [
            { x: xX, y: 65, type: 'snap' },
            { x: xX, y: 55, type: 'block', label: 'BLOCK' },
          ],
          isBallCarrier: !isRight && runnerType === 'WR',
          isBlocking: !(!isRight && runnerType === 'WR'),
          color: (!isRight && runnerType === 'WR') ? '#ef4444' : '#38bdf8',
        },
      },
      H: {
        id: 'H',
        label: 'H (Slot-L)',
        positionName: 'Inside Left Slot',
        initialPos: { x: hX, y: 66 },
        roleDescription: 'Stalk block nickel defender or crack safety',
        route: {
          name: 'Stalk / Crack Block',
          points: [
            { x: hX, y: 66, type: 'snap' },
            { x: hX + (runScheme.includes('LEFT') ? -4 : 4), y: 56, type: 'block', label: 'BLOCK' },
          ],
          isBlocking: true,
          color: '#10b981',
        },
      },
      Y: {
        id: 'Y',
        label: 'Y (Slot-R)',
        positionName: 'Inside Right Slot',
        initialPos: { x: yX, y: 66 },
        roleDescription: 'Stalk block linebacker or safety',
        route: {
          name: 'Stalk Block',
          points: [
            { x: yX, y: 66, type: 'snap' },
            { x: yX + (runScheme.includes('RIGHT') ? 4 : -4), y: 56, type: 'block', label: 'BLOCK' },
          ],
          isBlocking: true,
          color: '#f59e0b',
        },
      },
      Z: {
        id: 'Z',
        label: 'Z (WR-R)',
        positionName: 'Outside Right Receiver',
        initialPos: { x: zX, y: 65 },
        roleDescription: (isRight && hasMotion && motionPlayer === 'WR') ? (runnerType === 'WR' ? 'Motion sweep ball carrier' : 'Motion fake across') : 'Stalk block right boundary corner',
        motion: (isRight && hasMotion && motionPlayer === 'WR') ? {
          startPos: { x: zX, y: 65 },
          endPos: { x: 48, y: 74 },
          type: 'across',
        } : undefined,
        route: {
          name: (isRight && runnerType === 'WR') ? 'Motion Sweep Carrier' : 'Perimeter Stalk Block',
          points: (isRight && runnerType === 'WR') ? [
            { x: zX, y: 65, type: 'motion' },
            { x: 48, y: 74, type: 'snap' },
            { x: 26, y: 70, type: 'stem' },
            { x: 12, y: 45, type: 'target', label: 'RUN' },
          ] : [
            { x: zX, y: 65, type: 'snap' },
            { x: zX, y: 55, type: 'block', label: 'BLOCK' },
          ],
          isBallCarrier: isRight && runnerType === 'WR',
          isBlocking: !(isRight && runnerType === 'WR'),
          color: (isRight && runnerType === 'WR') ? '#ef4444' : '#ec4899',
        },
      },
    },
  };
}

export const EMPTY_RUN_PLAYS: Play[] = [
  // 115
  createEmptyRunPlay(115, true, 'QB SOL ACIK KOSU', 'QB Sweep Left', 'QB', 'SWEEP_LEFT'),
  createEmptyRunPlay(115, false, 'QB SAG ACIK KOSU', 'QB Sweep Right', 'QB', 'SWEEP_RIGHT'),
  // 116
  createEmptyRunPlay(116, true, 'QB SAG ACIK KOSU REVERSE', 'QB Sweep Right Reverse', 'QB', 'REVERSE_RIGHT'),
  createEmptyRunPlay(116, false, 'QB SOL ACIK KOSU REVERSE', 'QB Sweep Left Reverse', 'QB', 'REVERSE_LEFT'),
  // 117
  createEmptyRunPlay(117, true, 'WR MOTION SOL ACIK KOSU', 'WR Motion Sweep Left', 'WR', 'SWEEP_LEFT', true, 'WR'),
  createEmptyRunPlay(117, false, 'WR MOTION SAG ACIK KOSU', 'WR Motion Sweep Right', 'WR', 'SWEEP_RIGHT', true, 'WR'),
  // 118
  createEmptyRunPlay(118, true, 'WR MOTION FAKE QB SOL ACIK KOSU', 'WR Motion Fake -> QB Sweep Left', 'QB', 'SWEEP_LEFT', true, 'WR', true),
  createEmptyRunPlay(118, false, 'WR MOTION FAKE QB SAG ACIK KOSU', 'WR Motion Fake -> QB Sweep Right', 'QB', 'SWEEP_RIGHT', true, 'WR', true),
  // 119
  createEmptyRunPlay(119, true, 'WR MOTION TRAP LEFT', 'WR Motion Trap Left', 'WR', 'TRAP_LEFT', true, 'WR'),
  createEmptyRunPlay(119, false, 'WR MOTION TRAP RIGHT', 'WR Motion Trap Right', 'WR', 'TRAP_RIGHT', true, 'WR'),
  // 120
  createEmptyRunPlay(120, true, 'WR MOTION FAKE QB TRAP LEFT', 'WR Motion Fake -> QB Trap Left', 'QB', 'TRAP_LEFT', true, 'WR', true),
  createEmptyRunPlay(120, false, 'WR MOTION FAKE QB TRAP RIGHT', 'WR Motion Fake -> QB Trap Right', 'QB', 'TRAP_RIGHT', true, 'WR', true),
  // 121
  createEmptyRunPlay(121, true, 'QB TRAP LEFT', 'QB Direct Trap Left', 'QB', 'TRAP_LEFT'),
  createEmptyRunPlay(121, false, 'QB TRAP RIGHT', 'QB Direct Trap Right', 'QB', 'TRAP_RIGHT'),
  // 122
  createEmptyRunPlay(122, true, 'QB SOL ACIK KOSU REVERSE', 'QB Sweep Left Reverse', 'QB', 'REVERSE_LEFT'),
  createEmptyRunPlay(122, false, 'QB SAG ACIK KOSU REVERSE', 'QB Sweep Right Reverse', 'QB', 'REVERSE_RIGHT'),
  // 123
  createEmptyRunPlay(123, true, 'QB DIVE', 'QB Direct Dive', 'QB', 'DIVE'),
  createEmptyRunPlay(123, false, 'QB DIVE', 'QB Direct Dive', 'QB', 'DIVE'),
  // 124
  createEmptyRunPlay(124, true, 'WR MOTION FAKE QB DIVE', 'WR Motion Fake -> QB Dive', 'QB', 'DIVE', true, 'WR', true),
  createEmptyRunPlay(124, false, 'WR MOTION FAKE QB DIVE', 'WR Motion Fake -> QB Dive', 'QB', 'DIVE', true, 'WR', true),
  // 125
  createEmptyRunPlay(125, true, 'WR MOTION DIVE', 'WR Motion Direct Dive', 'WR', 'DIVE', true, 'WR'),
  createEmptyRunPlay(125, false, 'WR MOTION DIVE', 'WR Motion Direct Dive', 'WR', 'DIVE', true, 'WR'),
  // 126
  createEmptyRunPlay(126, true, 'QB COUNTER LEFT', 'QB Counter Left', 'QB', 'COUNTER_LEFT'),
  createEmptyRunPlay(126, false, 'QB COUNTER RIGHT', 'QB Counter Right', 'QB', 'COUNTER_RIGHT'),
  // 127
  createEmptyRunPlay(127, true, 'WR MOTION FAKE QB COUNTER LEFT', 'WR Motion Fake -> QB Counter Left', 'QB', 'COUNTER_LEFT', true, 'WR', true),
  createEmptyRunPlay(127, false, 'WR MOTION FAKE QB COUNTER RIGHT', 'WR Motion Fake -> QB Counter Right', 'QB', 'COUNTER_RIGHT', true, 'WR', true),
  // 128
  createEmptyRunPlay(128, true, 'SR MOTION COUNTER LEFT', 'Slot Receiver Motion Counter Left', 'SR', 'COUNTER_LEFT', true, 'SR'),
  createEmptyRunPlay(128, false, 'SR MOTION COUNTER RIGHT', 'Slot Receiver Motion Counter Right', 'SR', 'COUNTER_RIGHT', true, 'SR'),
];
