import { Play } from '../../types';
import { generateRoutePoints } from '../routeGenerator';

function createTwinsPassPlay(
  playNumber: number | string,
  isRight: boolean,
  playCodeSuffix: string,
  englishAction: string,
  rightWR: number | string,
  rightSlot: number | string,
  leftSlot: number | string,
  leftWR: number | string,
  rbRoute: number | string = 1,
  isBoot: boolean = false,
  isPlayAction: boolean = false
): Play {
  const dir = isRight ? 'RIGHT' : 'LEFT';
  const sideLabel = isRight ? 'Right' : 'Left';
  const code = `${playNumber}. TWINS ${dir} ${playCodeSuffix}`;

  // 8v8 Twins Alignment with 3 O-Line (LG, C, RG) and 4 Receivers (X, H, Y, Z):
  // Line of Scrimmage: LG at 44, C at 50, RG at 56
  // QB at 50
  // Left: X at 14 (Outside WR), H at 28 (Slot)
  // Right: Y at 72 (Slot), Z at 86 (Outside WR)
  const xX = 14;
  const hX = 28;
  const yX = 72;
  const zX = 86;

  const zGen = generateRoutePoints(zX, 65, rightWR, { isRightSide: true });
  const yGen = generateRoutePoints(yX, 66, rightSlot, { isRightSide: true });
  const hGen = generateRoutePoints(hX, 66, leftSlot, { isRightSide: false });
  const xGen = generateRoutePoints(xX, 65, leftWR, { isRightSide: false });

  return {
    id: `twins-pass-${playNumber}-${dir.toLowerCase()}`,
    playNumber,
    code,
    originalTurkishCode: code,
    englishName: `Twins ${sideLabel} - ${englishAction}`,
    category: 'TWINS PASS',
    playType: isPlayAction ? 'PLAY_ACTION' : 'PASS',
    direction: dir,
    formationName: `Twins ${sideLabel} (8v8 3-OL Balanced)`,
    conceptName: `${englishAction}`,
    tags: ['Twins', '2x2', 'Pass Concept', isBoot ? 'Bootleg Rollout' : 'Pocket Pass', '3 O-Line', '8v8'],
    description: `8v8 Twins ${sideLabel} pass concept (Finland University League) featuring ${englishAction}. Protected by 3 offensive linemen (LG, C, RG) with a 4-receiver spread (X, H, Y, Z).`,
    coachingPoints: [
      isBoot ? `QB Play-Action fake, roll out to ${sideLabel} edge behind 3-man offensive line protection.` : `3-step shotgun rhythm drop inside the 3-man pocket.`,
      `Primary Read: Check ${sideLabel.toLowerCase()}-side combination (${isRight ? `${rightWR} / ${rightSlot}` : `${leftWR} / ${leftSlot}`}).`,
      `Secondary Read: Backside combination to exploit vacant soft spots against rotating safeties.`,
    ],
    progressionReads: [
      { order: 1, playerId: isRight ? 'Z' : 'X', concept: `Outside Route (${isRight ? rightWR : leftWR})`, cue: 'Corner cushion and boundary leverage' },
      { order: 2, playerId: isRight ? 'Y' : 'H', concept: `Slot Route (${isRight ? rightSlot : leftSlot})`, cue: 'Target seam or intermediate void' },
      { order: 3, playerId: isRight ? 'H' : 'Y', concept: `Backside Slot (${isRight ? leftSlot : rightSlot})`, cue: 'Weak side underneath window' },
      { order: 4, playerId: isRight ? 'X' : 'Z', concept: `Backside Outside (${isRight ? leftWR : rightWR})`, cue: 'Deep boundary alert' },
    ],
    qbDrop: isBoot ? (isRight ? 'Rollout Right' : 'Rollout Left') : (isPlayAction ? 'Play Action Mesh' : 'Shotgun 3-Step'),
    players: {
      QB: {
        id: 'QB',
        label: 'QB',
        positionName: 'Quarterback',
        initialPos: { x: 50, y: 75 },
        roleDescription: isBoot ? `Fake handoff and rollout ${sideLabel}` : '3-step shotgun drop',
        route: {
          name: isBoot ? `Bootleg Rollout ${sideLabel}` : '3-Step Drop',
          points: isBoot ? [
            { x: 50, y: 75, type: 'snap' },
            { x: isRight ? 46 : 54, y: 77, type: 'fake', label: 'PA' },
            { x: isRight ? 68 : 32, y: 74, type: 'stem' },
            { x: isRight ? 78 : 22, y: 70, type: 'target', label: 'THROW' },
          ] : [
            { x: 50, y: 75, type: 'snap' },
            { x: 50, y: 79, type: 'stem' },
          ],
        },
      },
      C: {
        id: 'C',
        label: 'C',
        positionName: 'Center (3 O-Line)',
        initialPos: { x: 50, y: 65 },
        roleDescription: 'Snap ball and anchor pass pocket',
        route: {
          name: 'Pass Protection',
          points: [{ x: 50, y: 65, type: 'snap' }, { x: 50, y: 64, type: 'block', label: 'PRO' }],
          isBlocking: true,
        },
      },
      LG: {
        id: 'LG',
        label: 'LG',
        positionName: 'Left Guard (3 O-Line)',
        initialPos: { x: 44, y: 65 },
        roleDescription: isBoot && isRight ? 'Slide protect frontside' : 'Pass protection',
        route: {
          name: 'Pass Protection',
          points: [{ x: 44, y: 65, type: 'snap' }, { x: isBoot && isRight ? 46 : 44, y: 64, type: 'block', label: 'PRO' }],
          isBlocking: true,
        },
      },
      RG: {
        id: 'RG',
        label: 'RG',
        positionName: 'Right Guard (3 O-Line)',
        initialPos: { x: 56, y: 65 },
        roleDescription: isBoot && !isRight ? 'Slide protect frontside' : 'Pass protection',
        route: {
          name: 'Pass Protection',
          points: [{ x: 56, y: 65, type: 'snap' }, { x: isBoot && !isRight ? 54 : 56, y: 64, type: 'block', label: 'PRO' }],
          isBlocking: true,
        },
      },
      X: {
        id: 'X',
        label: 'X (WR-L)',
        positionName: 'Outside Left WR',
        initialPos: { x: xX, y: 65 },
        roleDescription: `Runs route ${leftWR}`,
        route: { name: xGen.name, routeNumber: leftWR, points: xGen.points, isPrimary: !isRight, color: '#ec4899' },
      },
      H: {
        id: 'H',
        label: 'H (Slot-L)',
        positionName: 'Inside Left Slot',
        initialPos: { x: hX, y: 66 },
        roleDescription: `Runs route ${leftSlot}`,
        route: { name: hGen.name, routeNumber: leftSlot, points: hGen.points, isSecondary: !isRight, color: '#8b5cf6' },
      },
      Y: {
        id: 'Y',
        label: 'Y (Slot-R)',
        positionName: 'Inside Right Slot',
        initialPos: { x: yX, y: 66 },
        roleDescription: `Runs route ${rightSlot}`,
        route: { name: yGen.name, routeNumber: rightSlot, points: yGen.points, isSecondary: isRight, color: '#10b981' },
      },
      Z: {
        id: 'Z',
        label: 'Z (WR-R)',
        positionName: 'Outside Right WR',
        initialPos: { x: zX, y: 65 },
        roleDescription: `Runs route ${rightWR}`,
        route: { name: zGen.name, routeNumber: rightWR, points: zGen.points, isPrimary: isRight, color: '#38bdf8' },
      },
    },
  };
}

export const TWINS_PASS_PLAYS: Play[] = [
  // 79
  createTwinsPassPlay(79, true, 'BOOT SMASH PASS SR 1 WR WHIP', 'Boot Smash (SR 1 / WR Whip)', 'WHIP', 1, 1, 4, 1, true, true),
  createTwinsPassPlay(79, false, 'BOOT SMASH PASS SR 1 WR WHIP', 'Boot Smash (SR 1 / WR Whip)', 4, 1, 1, 'WHIP', 1, true, true),
  // 80
  createTwinsPassPlay(80, true, 'BOOT 5 6', 'Boot Out/Dig (5/6)', 5, 6, 1, 4, 1, true, true),
  createTwinsPassPlay(80, false, 'BOOT 6 5', 'Boot Dig/Out (6/5)', 4, 1, 5, 6, 1, true, true),
  // 81
  createTwinsPassPlay(81, true, 'BOOT WHEEL P RB 1 ( SR W - WR 8 )', 'Boot Wheel (SR Wheel / WR 8 Post)', 8, 'WHEEL', 1, 4, 1, true, true),
  createTwinsPassPlay(81, false, 'BOOT WHEEL P RB 1 ( SR W - WR 8 )', 'Boot Wheel (SR Wheel / WR 8 Post)', 4, 1, 'WHEEL', 8, 1, true, true),
  // 82
  createTwinsPassPlay(82, true, 'BOOT 5 6 RB BUBBLE', 'Boot 5/6 + RB Bubble Screen', 5, 6, 1, 4, 'BUBBLE', true, true),
  createTwinsPassPlay(82, false, 'BOOT 6 5 RB BUBBLE', 'Boot 6/5 + RB Bubble Screen', 4, 1, 5, 6, 'BUBBLE', true, true),
  // 83
  createTwinsPassPlay(83, true, 'WHEEL PASS ( SR WHEEL - WR 8 )', 'Wheel Pass (SR Wheel / WR 8 Post)', 8, 'WHEEL', 1, 4, 1),
  createTwinsPassPlay(83, false, 'WHEEL PASS ( SR WHEEL - WR 8 )', 'Wheel Pass (SR Wheel / WR 8 Post)', 4, 1, 'WHEEL', 8, 1),
  // 84
  createTwinsPassPlay(84, true, 'WHIP PASS ( SR WHIP - WR 4 )', 'Whip Pass (SR Whip / WR 4 Curl)', 4, 'WHIP', 1, 2, 1),
  createTwinsPassPlay(84, false, 'WHIP PASS ( SR WHIP - WR 4 )', 'Whip Pass (SR Whip / WR 4 Curl)', 2, 1, 'WHIP', 4, 1),
  // 85
  createTwinsPassPlay(85, true, '7 2 RB 1', 'Corner / Slant (7 / 2 / RB 1)', 7, 2, 1, 4, 1),
  createTwinsPassPlay(85, false, '2 7 RB 1', 'Slant / Corner (2 / 7 / RB 1)', 4, 1, 7, 2, 1),
  // 86
  createTwinsPassPlay(86, true, '2 8 RB 1', 'Slant / Post (2 / 8 / RB 1)', 2, 8, 1, 4, 1),
  createTwinsPassPlay(86, false, '8 2 RB 1', 'Post / Slant (8 / 2 / RB 1)', 4, 1, 2, 8, 1),
  // 87
  createTwinsPassPlay(87, true, '5 5', 'All-Out (5 / 5)', 5, 5, 5, 5, 1),
  createTwinsPassPlay(87, false, '5 5', 'All-Out (5 / 5)', 5, 5, 5, 5, 1),
  // 88
  createTwinsPassPlay(88, true, '7 4 RB 1', 'Corner / Curl (7 / 4 / RB 1)', 7, 4, 1, 4, 1),
  createTwinsPassPlay(88, false, '4 7 RB 1', 'Curl / Corner (4 / 7 / RB 1)', 4, 1, 4, 7, 1),
  // 89
  createTwinsPassPlay(89, true, '3 9', 'Comeback / Go (3 / 9)', 3, 9, 1, 4, 1),
  createTwinsPassPlay(89, false, '9 3', 'Go / Comeback (9 / 3)', 4, 1, 9, 3, 1),
  // 90
  createTwinsPassPlay(90, true, '1 4 SOLO 3 RB PRO', 'Flat / Curl / Solo 3 / RB Pro', 1, 4, 1, 3, 'PROTECT'),
  createTwinsPassPlay(90, false, '4 1 SLOT 3 RB PRO', 'Curl / Flat / Slot 3 / RB Pro', 3, 1, 4, 1, 'PROTECT'),
  // 91
  createTwinsPassPlay(91, true, 'WHEEL , 8 SLOT 1 RB 4', 'Wheel / 8 Post / Slot 1 / RB 4', 8, 'WHEEL', 1, 4, 4),
  createTwinsPassPlay(91, false, '8 , WHEEL SOLO 1 RB 4', '8 Post / Wheel / Solo 1 / RB 4', 4, 1, 'WHEEL', 8, 4),
  // 92
  createTwinsPassPlay(92, true, '7 4 RB BUBBLE SLOT QUICK IN', '7 / 4 / RB Bubble / Slot Quick In', 7, 4, 'QUICK IN', 4, 'BUBBLE'),
  createTwinsPassPlay(92, false, '4 7 RB BUBBLE SOLO QUICK IN', '4 / 7 / RB Bubble / Solo Quick In', 4, 'QUICK IN', 4, 7, 'BUBBLE'),
  // 93 Play Action Fakes
  createTwinsPassPlay(93, true, 'RB DIVE FAKE 2 9', 'PA Dive Fake -> Slant / Go (2 / 9)', 2, 9, 1, 4, 'DIVE_RUN', false, true),
  createTwinsPassPlay(93, false, 'RB DIVE FAKE 9 2', 'PA Dive Fake -> Go / Slant (9 / 2)', 4, 1, 9, 2, 'DIVE_RUN', false, true),
  // 94
  createTwinsPassPlay(94, true, 'RB DIVE FAKE 1 2', 'PA Dive Fake -> Flat / Slant (1 / 2)', 1, 2, 1, 4, 'DIVE_RUN', false, true),
  createTwinsPassPlay(94, false, 'RB DIVE FAKE 2 1', 'PA Dive Fake -> Slant / Flat (2 / 1)', 4, 1, 2, 1, 'DIVE_RUN', false, true),
  // 95
  createTwinsPassPlay(95, true, 'RB SWEEP RIGHT FAKE 2 5', 'PA Sweep Right Fake -> Slant / Out (2 / 5)', 2, 5, 1, 4, 'SWEEP_RUN_RIGHT', false, true),
  createTwinsPassPlay(95, false, 'RB SWEEP LEFT FAKE 5 2', 'PA Sweep Left Fake -> Out / Slant (5 / 2)', 4, 1, 5, 2, 'SWEEP_RUN_LEFT', false, true),
  // 96
  createTwinsPassPlay(96, true, 'RB MID DRAW FAKE 9 9', 'PA Draw Fake -> Double Go / Seam (9 / 9)', 9, 9, 1, 4, 'MID_DRAW', false, true),
  createTwinsPassPlay(96, false, 'RB MID DRAW FAKE 9 9', 'PA Draw Fake -> Double Go / Seam (9 / 9)', 4, 1, 9, 9, 'MID_DRAW', false, true),
];
