import { Play } from '../../types';
import { generateRoutePoints } from '../routeGenerator';

function createEmptyPassPlay(
  playNumber: number | string,
  isRight: boolean,
  r1: number | string,
  r2: number | string,
  r3: number | string,
  leftWR1: number | string = 1,
  leftWR2: number | string = 2,
  specialTag?: string
): Play {
  const dir = isRight ? 'RIGHT' : 'LEFT';
  const sideLabel = isRight ? 'Right' : 'Left';
  const code = `${playNumber}. EMPTY ${dir} ${r1} ${r2} ${r3}${specialTag ? ' ' + specialTag : ''}`;

  // 8v8 Empty Alignment with 3 O-Line (LG, C, RG) and 4 Receivers:
  // Empty backfield: QB alone in shotgun
  // Offensive Line: LG=44, C=50, RG=56
  // Left Receivers: X=14 (WR-L), H=30 (Slot-L)
  // Right Receivers: Y=70 (Slot-R), Z=86 (WR-R)
  const zX = 86;
  const yX = 70;
  const hX = 30;
  const xX = 14;

  const zGen = generateRoutePoints(zX, 65, isRight ? r1 : leftWR1, { isRightSide: true });
  const yGen = generateRoutePoints(yX, 66, isRight ? r2 : leftWR2, { isRightSide: true });
  const hGen = generateRoutePoints(hX, 66, isRight ? leftWR2 : r2, { isRightSide: false });
  const xGen = generateRoutePoints(xX, 65, isRight ? leftWR1 : r1, { isRightSide: false });

  return {
    id: `empty-pass-${playNumber}-${dir.toLowerCase()}`,
    playNumber,
    code,
    originalTurkishCode: code,
    englishName: `Empty ${sideLabel} - [${r1} / ${r2} / ${r3}] ${specialTag ? `(${specialTag})` : ''}`,
    category: 'EMPTY PASS',
    playType: 'PASS',
    direction: dir,
    formationName: `Empty ${sideLabel} (8v8 3-OL Spread)`,
    conceptName: `8v8 Empty Route Concept (${r1}-${r2}-${r3})`,
    tags: ['Empty', 'Pass Concept', isRight ? 'Right Side' : 'Left Side', '3 O-Line', '8v8'],
    description: `8v8 Empty ${sideLabel} pass play (Finland University League) with an empty backfield. Protected by 3 offensive linemen (LG, C, RG) with a 4-receiver spread horizontally challenging boundary and field coverage.`,
    coachingPoints: [
      `Quick 3-step rhythm drop from shotgun inside 3-man offensive line protection.`,
      `Primary read to the strength side (${isRight ? 'Right: Z/Y' : 'Left: X/H'}).`,
      `Backside 2-receiver combination acts as quick alert read against press man.`,
    ],
    progressionReads: [
      { order: 1, playerId: isRight ? 'Z' : 'X', concept: `Strength Outside Route (${r1})`, cue: 'Check safety depth and corner cushion' },
      { order: 2, playerId: isRight ? 'Y' : 'H', concept: `Strength Slot Route (${r2})`, cue: 'Target seam or intermediate void' },
      { order: 3, playerId: isRight ? 'H' : 'Y', concept: `Backside Slot Route (${leftWR2})`, cue: 'Underneath crossing or curl window' },
      { order: 4, playerId: isRight ? 'X' : 'Z', concept: `Backside Outside Matchup (${leftWR1})`, cue: '1-on-1 boundary isolate' },
    ],
    qbDrop: 'Shotgun 3-Step',
    players: {
      QB: {
        id: 'QB',
        label: 'QB',
        positionName: 'Quarterback',
        initialPos: { x: 50, y: 75 },
        roleDescription: 'Quick 3-step shotgun drop, fast progression scan',
        route: {
          name: '3-Step Drop',
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
        roleDescription: 'Snaps ball and seals interior pass rush',
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
        roleDescription: 'Pass protection against left rushers',
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
        roleDescription: 'Pass protection against right rushers',
        route: {
          name: 'Pass Protection',
          points: [
            { x: 56, y: 65, type: 'snap' },
            { x: 56, y: 64, type: 'block', label: 'PRO' },
          ],
          isBlocking: true,
        },
      },
      X: {
        id: 'X',
        label: 'X (WR-L)',
        positionName: 'Outside Left WR',
        initialPos: { x: xX, y: 65 },
        roleDescription: !isRight ? `Primary route ${r1}` : `Backside route ${leftWR1}`,
        route: {
          name: xGen.name,
          routeNumber: !isRight ? r1 : leftWR1,
          points: xGen.points,
          isPrimary: !isRight,
          color: '#ec4899',
        },
      },
      H: {
        id: 'H',
        label: 'H (Slot-L)',
        positionName: 'Inside Left Slot',
        initialPos: { x: hX, y: 66 },
        roleDescription: !isRight ? `Slot route ${r2}` : `Backside slot ${leftWR2}`,
        route: {
          name: hGen.name,
          routeNumber: !isRight ? r2 : leftWR2,
          points: hGen.points,
          isSecondary: !isRight,
          color: '#8b5cf6',
        },
      },
      Y: {
        id: 'Y',
        label: 'Y (Slot-R)',
        positionName: 'Inside Right Slot',
        initialPos: { x: yX, y: 66 },
        roleDescription: isRight ? `Slot route ${r2}` : `Backside slot ${leftWR2}`,
        route: {
          name: yGen.name,
          routeNumber: isRight ? r2 : leftWR2,
          points: yGen.points,
          isSecondary: isRight,
          color: '#10b981',
        },
      },
      Z: {
        id: 'Z',
        label: 'Z (WR-R)',
        positionName: 'Outside Right WR',
        initialPos: { x: zX, y: 65 },
        roleDescription: isRight ? `Primary route ${r1}` : `Backside route ${leftWR1}`,
        route: {
          name: zGen.name,
          routeNumber: isRight ? r1 : leftWR1,
          points: zGen.points,
          isPrimary: isRight,
          color: '#38bdf8',
        },
      },
    },
  };
}

export const EMPTY_PASS_PLAYS: Play[] = [
  // 137
  createEmptyPassPlay(137, true, 8, 3, 2, 1, 2),
  createEmptyPassPlay(137, false, 2, 3, 8, 1, 2),
  // 138
  createEmptyPassPlay(138, true, 9, 2, 6, 1, 4),
  createEmptyPassPlay(138, false, 6, 2, 9, 1, 4),
  // 139
  createEmptyPassPlay(139, true, 4, 1, 2, 1, 2),
  createEmptyPassPlay(139, false, 2, 1, 4, 1, 2),
  // 140
  createEmptyPassPlay(140, true, 2, 8, 4, 1, 2),
  createEmptyPassPlay(140, false, 4, 8, 2, 1, 2),
  // 141
  createEmptyPassPlay(141, true, 5, 5, 5, 5, 5),
  createEmptyPassPlay(141, false, 5, 5, 5, 5, 5),
  // 142
  createEmptyPassPlay(142, true, 2, 2, 9, 1, 2),
  createEmptyPassPlay(142, false, 9, 2, 2, 1, 2),
  // 143
  createEmptyPassPlay(143, true, 6, 4, 5, 1, 4),
  createEmptyPassPlay(143, false, 5, 4, 6, 1, 4),
  // 144
  createEmptyPassPlay(144, true, 2, 'WHEEL', 8, 1, 2),
  createEmptyPassPlay(144, false, 8, 'WHEEL', 2, 1, 2),
  // 145
  createEmptyPassPlay(145, true, 'QUICK SLANT', 3, 4, 1, 2),
  createEmptyPassPlay(145, false, 4, 3, 'QUICK SLANT', 1, 2),
  // 146
  createEmptyPassPlay(146, true, 5, 'QUICK SLANT', 'WHIP', 1, 4),
  createEmptyPassPlay(146, false, 'WHIP', 'QUICK SLANT', 5, 1, 4),
  // 147
  createEmptyPassPlay(147, true, 2, 'WHIP', 9, 1, 2),
  createEmptyPassPlay(147, false, 9, 'WHIP', 2, 1, 2),
  // 148
  createEmptyPassPlay(148, true, 'QUICK IN', 4, 8, 1, 4),
  createEmptyPassPlay(148, false, 8, 4, 'QUICK IN', 1, 4),
  // 149
  createEmptyPassPlay(149, true, 4, 2, 8, 1, 2, 'SOLO 1'),
  createEmptyPassPlay(149, false, 8, 2, 4, 1, 1, 'SLOT 1'),
  // 150
  createEmptyPassPlay(150, true, 2, 4, 9, 1, 1, 'SLOT 1'),
  createEmptyPassPlay(150, false, 9, 4, 2, 1, 2, 'SOLO 1'),
  // 151
  createEmptyPassPlay(151, true, 9, 3, 8, 'QUICK IN', 2, 'SLOT QUICK IN'),
  createEmptyPassPlay(151, false, 8, 3, 9, 1, 'QUICK IN', 'SOLO QUICK IN'),
];
