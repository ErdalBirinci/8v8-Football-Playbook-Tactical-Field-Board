import { Play } from '../../types';
import { generateRoutePoints } from '../routeGenerator';

// Helper to build 8v8 Trips Pass plays (Finland University League)
function createTripsPassPlay(
  playNumber: string | number,
  isRight: boolean,
  r1: number | string,
  r2: number | string,
  r3: number | string,
  cilekRoute: number | string = 1,
  pumpkinRoute?: number | string,
  specialTag?: string,
  isScreen?: boolean
): Play {
  const dir = isRight ? 'RIGHT' : 'LEFT';
  const sideLabel = isRight ? 'Right' : 'Left';
  const code = `${playNumber}. TRIPS ${dir} ${r1} ${r2} ${r3}${specialTag ? ' ' + specialTag : ''}`;

  // 8v8 Positions on field:
  // Center: (50, 65)
  // QB: (50, 75)
  // RB: (isRight ? 42 : 58, 75)
  // Trips side (Z Outside, Y Mid Slot, W Inside Slot):
  // 8v8 Alignment with 3 O-Line (LG, C, RG):
  // Line of Scrimmage:
  // LG: x=44, y=65
  // C:  x=50, y=65
  // RG: x=56, y=65
  // QB: x=50, y=75
  // Trips Side 3 Receivers:
  // If Right: Z=88 (Outside), Y=76 (Middle Slot), H=64 (Inside Slot)
  // If Left:  Z=12 (Outside), Y=24 (Middle Slot), H=36 (Inside Slot)
  // Backside 1 Receiver:
  // If Right: X=14 (Backside Solo)
  // If Left:  X=86 (Backside Solo)
  const zX = isRight ? 88 : 12;
  const yX = isRight ? 76 : 24;
  const hX = isRight ? 64 : 36;
  const xX = isRight ? 14 : 86;

  const zRouteCode = isScreen ? 'BLOCK' : r1;
  const yRouteCode = isScreen ? 'BLOCK' : r2;
  const hRouteCode = isScreen ? 'SCREEN' : (pumpkinRoute !== undefined ? pumpkinRoute : r3);
  const cilekCode = cilekRoute;

  const zGen = generateRoutePoints(zX, 65, zRouteCode, { isRightSide: isRight });
  const yGen = generateRoutePoints(yX, 66, yRouteCode, { isRightSide: isRight });
  const hGen = generateRoutePoints(hX, 66, hRouteCode, { isRightSide: isRight });
  const xGen = generateRoutePoints(xX, 65, cilekCode, { isRightSide: !isRight });

  return {
    id: `trips-pass-${playNumber}-${dir.toLowerCase()}`,
    playNumber,
    code,
    originalTurkishCode: code,
    englishName: `Trips ${sideLabel} - [${r1}-${r2}-${r3}] ${specialTag ? `(${specialTag})` : ''}`,
    category: 'TRIPS PASS',
    playType: isScreen ? 'SCREEN' : 'PASS',
    direction: dir,
    formationName: `Trips ${sideLabel} (8v8 3-OL Spread)`,
    conceptName: isScreen ? '8v8 WR Screen Pass with Slot Blocks' : `8v8 Trips Route Concept (${r1}-${r2}-${r3})`,
    tags: ['Trips', isRight ? 'Right Side' : 'Left Side', isScreen ? 'Screen' : 'Pass Concept', '3 O-Line', '8v8'],
    description: `8v8 Trips ${sideLabel} pass play (Finland University League) protected by a 3-man offensive line (LG, C, RG). Trips side runs ${r1} (Z), ${r2} (Y), and ${r3} (H), with isolated backside X running ${cilekCode}.`,
    coachingPoints: [
      `1st Read: Work the 3-receiver trips concept (${r1} / ${r2} / ${r3}) against zone leverage.`,
      `2nd Read: Backside X on 1-on-1 isolated alert (${cilekCode}) against single-high or press man.`,
      `3 O-Line Pocket: Center and Guards anchor interior rush to provide clean passing platform.`,
    ],
    progressionReads: [
      { order: 1, playerId: 'Z', concept: `Primary Outside Route (${r1})`, cue: 'Check cornerback leverage and cushion' },
      { order: 2, playerId: 'Y', concept: `Middle Slot Route (${r2})`, cue: 'Target intermediate void behind linebackers' },
      { order: 3, playerId: 'H', concept: `Inside Slot Route (${r3})`, cue: 'Read middle safety and split coverage' },
      { order: 4, playerId: 'X', concept: `Backside Solo (${cilekCode})`, cue: 'Isolate 1-on-1 matchup' },
    ],
    qbDrop: isScreen ? 'Quick 1-Step' : 'Shotgun 3-Step',
    players: {
      QB: {
        id: 'QB',
        label: 'QB',
        positionName: 'Quarterback',
        initialPos: { x: 50, y: 75 },
        roleDescription: 'Shotgun dropback in 3-man pocket, read trips progression',
        route: {
          name: isScreen ? 'Quick Catch & Fire' : '3-Step Drop',
          points: [
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
        roleDescription: 'Snaps ball and anchors interior pocket',
        route: {
          name: 'Pass Protection',
          points: [
            { x: 50, y: 65, type: 'snap' },
            { x: 50, y: 64, type: 'block', label: 'PRO' },
          ],
          isBlocking: true,
        },
      },
      LG: {
        id: 'LG',
        label: 'LG',
        positionName: 'Left Guard (3 O-Line)',
        initialPos: { x: 44, y: 65 },
        roleDescription: 'Pass protection on left A/B-gap rushers',
        route: {
          name: 'Pass Protection',
          points: [
            { x: 44, y: 65, type: 'snap' },
            { x: 44, y: 64, type: 'block', label: 'PRO' },
          ],
          isBlocking: true,
        },
      },
      RG: {
        id: 'RG',
        label: 'RG',
        positionName: 'Right Guard (3 O-Line)',
        initialPos: { x: 56, y: 65 },
        roleDescription: 'Pass protection on right A/B-gap rushers',
        route: {
          name: 'Pass Protection',
          points: [
            { x: 56, y: 65, type: 'snap' },
            { x: 56, y: 64, type: 'block', label: 'PRO' },
          ],
          isBlocking: true,
        },
      },
      Z: {
        id: 'Z',
        label: isRight ? 'Z (WR-R)' : 'Z (WR-L)',
        positionName: 'Outside Trips WR',
        initialPos: { x: zX, y: 65 },
        roleDescription: `Runs route ${r1}`,
        route: {
          name: zGen.name,
          routeNumber: r1,
          points: zGen.points,
          isPrimary: true,
          color: '#38bdf8',
        },
      },
      Y: {
        id: 'Y',
        label: isRight ? 'Y (Slot-1)' : 'Y (Slot-1)',
        positionName: 'Middle Slot Receiver',
        initialPos: { x: yX, y: 66 },
        roleDescription: `Runs route ${r2}`,
        route: {
          name: yGen.name,
          routeNumber: r2,
          points: yGen.points,
          isSecondary: true,
          color: '#10b981',
        },
      },
      H: {
        id: 'H',
        label: isRight ? 'H (Slot-2)' : 'H (Slot-2)',
        positionName: 'Inside Slot Receiver',
        initialPos: { x: hX, y: 66 },
        roleDescription: `Runs route ${r3}`,
        route: {
          name: hGen.name,
          routeNumber: r3,
          points: hGen.points,
          color: '#f59e0b',
        },
      },
      X: {
        id: 'X',
        label: isRight ? 'X (WR-L)' : 'X (WR-R)',
        positionName: 'Backside Isolated Receiver (Solo)',
        initialPos: { x: xX, y: 65 },
        roleDescription: `Backside 1-on-1 route ${cilekCode}`,
        route: {
          name: xGen.name,
          routeNumber: cilekCode,
          points: xGen.points,
          color: '#ec4899',
        },
      },
    },
  };
}

export const TRIPS_PASS_PLAYS: Play[] = [
  // 97
  createTripsPassPlay('97', true, 1, 7, 8, 1),
  createTripsPassPlay('97', false, 8, 7, 1, 1),
  // 98
  createTripsPassPlay('98', true, 1, 3, 9, 1),
  createTripsPassPlay('98', false, 9, 3, 1, 1),
  // 99
  createTripsPassPlay('99', true, 1, 7, 2, 1),
  createTripsPassPlay('99', false, 2, 7, 1, 1),
  // 100
  createTripsPassPlay('100', true, 1, 2, 6, 1),
  createTripsPassPlay('100', false, 6, 2, 1, 1),
  // 101
  createTripsPassPlay('101', true, 7, 2, 4, 1),
  createTripsPassPlay('101', false, 4, 2, 7, 1),
  // 102
  createTripsPassPlay('102', true, 3, 8, 9, 1),
  createTripsPassPlay('102', false, 9, 8, 3, 1),
  // 103
  createTripsPassPlay('103', true, 1, 2, 5, 1),
  createTripsPassPlay('103', false, 5, 2, 1, 1),
  // 104
  createTripsPassPlay('104', true, 3, 8, 7, 1),
  createTripsPassPlay('104', false, 7, 8, 3, 1),
  // 105
  createTripsPassPlay('105', true, 1, 7, 4, 1, undefined, 'SOLO 1'),
  createTripsPassPlay('105', false, 4, 7, 1, 1, 1, 'SLOT 1'),
  // 134
  createTripsPassPlay('134', true, 5, 1, 9, 1, 'QUICK IN', 'SLOT QUICK IN'),
  createTripsPassPlay('134', false, 9, 1, 5, 'QUICK IN', 5, 'SOLO QUICK IN'),
  // 135
  createTripsPassPlay('135', true, 3, 2, 8, 1, 1, 'SOLO 1 SLOT 1'),
  createTripsPassPlay('135', false, 8, 2, 3, 1, 1, 'SLOT 1 SOLO 1'),
  // 136
  createTripsPassPlay('136', true, 'BLOCK', 'BLOCK', 'SCREEN', 1, undefined, 'WR SCREEN PASS (DOUBLE SR BLOCK)', true),
  createTripsPassPlay('136', false, 'SCREEN', 'BLOCK', 'BLOCK', 1, undefined, 'WR SCREEN PASS (DOUBLE SR BLOCK)', true),
];
