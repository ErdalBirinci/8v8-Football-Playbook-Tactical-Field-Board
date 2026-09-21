import { Play, PlayerAssignment, DrillCone, ProgressionRead } from '../types';
import { PracticeDrill } from './drillDatabase';
import { generateRoutePoints } from './routeGenerator';

/**
 * Creates an animated 8v8 FieldBoard Play object specifically designed for
 * the selected Practice Drill, including field agility cones, exact route stems,
 * QB mechanics, and defender reactions.
 */
export function createPlayFromDrill(drill: PracticeDrill, basePlay?: Play): Play {
  switch (drill.id) {
    case 'drill-slant-drive-plant':
      return createSlantDrillPlay(drill);
    case 'drill-smash-hi-lo-timing':
      return createSmashDrillPlay(drill);
    case 'drill-post-safety-split':
      return createPostDrillPlay(drill);
    case 'drill-speed-out-sideline':
      return createSpeedOutDrillPlay(drill);
    case 'drill-mesh-shallow-crossers':
      return createMeshDrillPlay(drill);
    case 'drill-screen-blocking-train':
      return createScreenDrillPlay(drill);
    case 'drill-rpo-mesh-quick-trigger':
      return createRpoDrillPlay(drill);
    case 'drill-qb-dropback-clock-rhythm':
      return createQbDropDrillPlay(drill);
    case 'drill-dig-square-in-window':
      return createDigDrillPlay(drill);
    case 'drill-flood-sail-3level':
      return createFloodDrillPlay(drill);
    default:
      return createGenericDrillPlay(drill, basePlay);
  }
}

function createSlantDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-los', x: 82, y: 65, label: 'LOS Cone', color: '#f97316' },
    { id: 'cone-stem', x: 82, y: 55, label: '3-Step Stem (4y)', color: '#eab308' },
    { id: 'cone-plant', x: 82, y: 53, label: '45° Cleat Plant', color: '#ef4444' },
    { id: 'cone-catch', x: 62, y: 39, label: 'Catch in Stride Window', color: '#10b981' },
    { id: 'cone-qb-drop', x: 50, y: 81, label: '3-Step QB Plant', color: '#38bdf8' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C (50)',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: {
        name: 'Snap & Anchor',
        points: [
          { x: 50, y: 65, type: 'snap' },
          { x: 50, y: 66, type: 'block' },
        ],
        isBlocking: true,
      },
      roleDescription: 'Snap ball and anchor interior rush line.',
    },
    QB: {
      id: 'QB',
      label: 'QB (12)',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Rhythm Drop & Slant Drive',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: 'Plant' },
          { x: 50, y: 80, type: 'target', label: 'Fire' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Take 3-step shotgun drop, plant back foot firm, drive ball on receiver upfield chest.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Z)',
      positionName: 'Outside Receiver',
      initialPos: { x: 82, y: 65 },
      route: {
        name: '3-Step Slant (Violent 45° Plant)',
        routeNumber: 2,
        points: [
          { x: 82, y: 65, type: 'snap' },
          { x: 82, y: 54, type: 'stem', label: 'Step 1-2-3' },
          { x: 82, y: 53, type: 'break', label: 'Hard Plant' },
          { x: 60, y: 36, type: 'target', label: 'Accelerate' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Fire off LOS with low pads, stick outside cleat at step 3, rip inside arm, catch in stride.',
    },
    H: {
      id: 'H',
      label: 'H (SLOT)',
      positionName: 'Slot Receiver',
      initialPos: { x: 68, y: 66 },
      route: {
        name: 'Seam Clear-Out',
        routeNumber: 9,
        points: [
          { x: 68, y: 66, type: 'snap' },
          { x: 68, y: 30, type: 'target', label: 'Seam' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Push vertical seam to hold safety out of the slant window.',
    },
    X: {
      id: 'X',
      label: 'X (SOLO)',
      positionName: 'Backside Receiver',
      initialPos: { x: 18, y: 65 },
      route: {
        name: 'Backside Quick Slant',
        routeNumber: 2,
        points: [
          { x: 18, y: 65, type: 'snap' },
          { x: 18, y: 54, type: 'stem' },
          { x: 38, y: 38, type: 'target' },
        ],
        isCheckdown: true,
      },
      roleDescription: 'Run mirror slant on backside for dual-rep drill capability.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: '3-Step Slant Break', cue: 'Hit outside cleat at step 3 and drive football before LB sinks' },
    { order: 2, playerId: 'H', concept: 'Seam Clear-Out', cue: 'Check safety rotation' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createSmashDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-hitch', x: 88, y: 52, label: '5yd Hitch Cone', color: '#eab308' },
    { id: 'cone-corner-stem', x: 74, y: 44, label: '10yd Break Cone', color: '#f97316' },
    { id: 'cone-corner-pylon', x: 96, y: 24, label: 'Corner Pylon Target', color: '#10b981' },
    { id: 'cone-cb-read', x: 88, y: 53, label: 'CB Read Shadow', color: '#ef4444', type: 'shield' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Drop & Hi-Lo Read',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: 'Read CB' },
          { x: 50, y: 80, type: 'target', label: 'Release' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Read boundary CB hips. If CB bails deep -> Rip Hitch. If CB squats -> Touch pass over to Corner.',
    },
    Z: {
      id: 'Z',
      label: 'Z (WR)',
      positionName: 'Outside Receiver',
      initialPos: { x: 88, y: 65 },
      route: {
        name: '5-Yard Hitch (Low Read)',
        routeNumber: 0,
        points: [
          { x: 88, y: 65, type: 'snap' },
          { x: 88, y: 52, type: 'stem', label: '5 yds' },
          { x: 86, y: 54, type: 'target', label: 'Work Back' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Push to 5 yards, snap back to football, show open numbers to QB.',
    },
    Y: {
      id: 'Y',
      label: 'Y (SLOT)',
      positionName: 'Slot Receiver',
      initialPos: { x: 74, y: 66 },
      route: {
        name: '10-Yard Corner (High Read)',
        routeNumber: 7,
        points: [
          { x: 74, y: 66, type: 'snap' },
          { x: 74, y: 44, type: 'stem', label: '10 yds' },
          { x: 96, y: 24, type: 'target', label: 'Pylon 45°' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Sell post stem to 10 yards, snap violently 45° to corner pylon.',
    },
    X: {
      id: 'X',
      label: 'X (SOLO)',
      positionName: 'Backside Receiver',
      initialPos: { x: 14, y: 65 },
      route: {
        name: 'Backside Dig Check',
        routeNumber: 6,
        points: [
          { x: 14, y: 65, type: 'snap' },
          { x: 14, y: 45, type: 'stem' },
          { x: 38, y: 45, type: 'target' },
        ],
        isCheckdown: true,
      },
      roleDescription: 'Dig route underneath safety.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: 'Low: 5-Yard Hitch', cue: 'If CB bails deep, throw hitch on rhythm' },
    { order: 2, playerId: 'Y', concept: 'High: 10-Yard Corner', cue: 'If CB squats on hitch, lob over his helmet to pylon' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createPostDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-post-stem', x: 84, y: 41, label: '12yd Vertical Stem Cone', color: '#f97316' },
    { id: 'cone-post-target', x: 50, y: 12, label: 'Goalpost Uprights Aim', color: '#10b981' },
    { id: 'cone-safety-split', x: 50, y: 26, label: 'Deep Safety Leverage', color: '#ef4444', type: 'shield' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '5-Step Deep Anticipation Drop',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 84, type: 'stem', label: '5-Step' },
          { x: 50, y: 82, type: 'target', label: 'Drive Deep' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Hit 5th step, hitch up, deliver anticipation ball to 25 yards downfield before break.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Z)',
      positionName: 'Outside Receiver',
      initialPos: { x: 84, y: 65 },
      route: {
        name: '8 - Post (Late Hands & Goalpost Split)',
        routeNumber: 8,
        points: [
          { x: 84, y: 65, type: 'snap' },
          { x: 84, y: 41, type: 'stem', label: '12 yds' },
          { x: 84, y: 39, type: 'break', label: 'Plant' },
          { x: 50, y: 12, type: 'target', label: 'Goalpost' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Full speed vertical to 12 yards, aggressive outside foot plant, angle to goalposts with late hands.',
    },
    Y: {
      id: 'Y',
      label: 'Y (SLOT)',
      positionName: 'Slot Receiver',
      initialPos: { x: 72, y: 66 },
      route: {
        name: 'Intermediate Out / Hold',
        routeNumber: 5,
        points: [
          { x: 72, y: 66, type: 'snap' },
          { x: 72, y: 48, type: 'stem' },
          { x: 92, y: 48, type: 'target' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Intermediate out route holding underneath flat defenders.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: 'Post Route Split', cue: 'Air the ball out into the safety split' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 5-Step');
}

function createSpeedOutDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-out-break', x: 82, y: 45, label: '10yd Break Cone', color: '#f97316' },
    { id: 'cone-out-sideline', x: 96, y: 45, label: 'Sideline Toe-Tap Zone', color: '#10b981' },
    { id: 'cone-los-out', x: 82, y: 65, label: 'LOS Cone', color: '#eab308' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Rhythm Release',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: 'Plant' },
          { x: 50, y: 80, type: 'target', label: 'Rhythm Throw' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Deliver throw as receiver inside foot hits turf, targeting outside shoulder.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Z)',
      positionName: 'Outside Receiver',
      initialPos: { x: 82, y: 65 },
      route: {
        name: '5 - Speed Out (90° Violent Break)',
        routeNumber: 5,
        points: [
          { x: 82, y: 65, type: 'snap' },
          { x: 82, y: 45, type: 'stem', label: '10 yds' },
          { x: 96, y: 46, type: 'target', label: 'Toe-Tap' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Explode vertical to 10 yards, snap hips 90° directly to sideline, drag trailing toe.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: 'Speed Out Break', cue: 'Throw before the break on the sideline shoulder' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createMeshDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-mesh-center', x: 50, y: 54, label: '6-Inch Rub Cone', color: '#ef4444' },
    { id: 'cone-mesh-right', x: 66, y: 55, label: 'Right Stem (5y)', color: '#f97316' },
    { id: 'cone-mesh-left', x: 34, y: 53, label: 'Left Stem (6y)', color: '#eab308' },
    { id: 'cone-exit-left', x: 18, y: 54, label: 'Under Exit Alley', color: '#10b981' },
    { id: 'cone-exit-right', x: 82, y: 52, label: 'Over Exit Alley', color: '#10b981' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Drop & Mesh Progression',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: '1st Crosser' },
          { x: 50, y: 80, type: 'target', label: '2nd Crosser' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Lead crossing receiver in stride so he accelerates without breaking pace.',
    },
    H: {
      id: 'H',
      label: 'H (Under)',
      positionName: 'Right Slot Receiver',
      initialPos: { x: 66, y: 66 },
      route: {
        name: 'Under Crosser (5-Yard Depth)',
        points: [
          { x: 66, y: 66, type: 'snap' },
          { x: 66, y: 55, type: 'stem', label: '5 yds' },
          { x: 50, y: 54, type: 'break', label: 'Rub' },
          { x: 18, y: 54, type: 'target', label: 'Accelerate' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Under crosser: stem to 5 yards, rub shoulders with over-crosser, sprint to opposite sideline.',
    },
    Y: {
      id: 'Y',
      label: 'Y (Over)',
      positionName: 'Left Slot Receiver',
      initialPos: { x: 34, y: 66 },
      route: {
        name: 'Over Crosser (6-Yard Depth)',
        points: [
          { x: 34, y: 66, type: 'snap' },
          { x: 34, y: 53, type: 'stem', label: '6 yds' },
          { x: 50, y: 52, type: 'break', label: 'High-Five' },
          { x: 82, y: 52, type: 'target', label: 'Accelerate' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Over crosser: stem to 6 yards, pass within 6 inches of H, clear rub against man.',
    },
    Z: {
      id: 'Z',
      label: 'Z',
      positionName: 'Outside Receiver',
      initialPos: { x: 88, y: 65 },
      route: {
        name: 'Wheel Clear-Out',
        points: [{ x: 88, y: 65 }, { x: 88, y: 22 }],
      },
      roleDescription: 'Clear deep corner.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'H', concept: 'Under Crosser', cue: 'Check man separation across middle' },
    { order: 2, playerId: 'Y', concept: 'Over Crosser', cue: 'Hit 2nd crosser if 1st is covered' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createScreenDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-screen-catch', x: 84, y: 68, label: 'Screen Catch Point', color: '#10b981' },
    { id: 'cone-crack-block', x: 88, y: 56, label: 'Force Block Cone', color: '#ef4444', type: 'shield' },
    { id: 'cone-alley-burst', x: 80, y: 32, label: 'Alley Seam Burst', color: '#f97316' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: 'Catch & Quick 0.8s Fire',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 52, y: 75, type: 'target', label: 'Rocket Pass' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Catch and fire the ball directly into receiver chest in under 0.8 seconds.',
    },
    H: {
      id: 'H',
      label: 'WR (Screen)',
      positionName: 'Outside Receiver',
      initialPos: { x: 84, y: 65 },
      route: {
        name: 'Screen Catch & Burst',
        points: [
          { x: 84, y: 65, type: 'snap' },
          { x: 84, y: 68, type: 'stem', label: '2 Steps Back' },
          { x: 81, y: 48, type: 'break', label: 'Cut off Block' },
          { x: 80, y: 25, type: 'target', label: 'North-South' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Catch with both eyes on ball, tuck, wait for block to engage, cut vertical.',
    },
    Y: {
      id: 'Y',
      label: 'Slot 1 (Lead)',
      positionName: 'Lead Blocker 1',
      initialPos: { x: 74, y: 66 },
      route: {
        name: 'Crack Block on Force DB',
        points: [
          { x: 74, y: 66, type: 'snap' },
          { x: 88, y: 56, type: 'block', label: 'Crack Block' },
        ],
        isBlocking: true,
      },
      roleDescription: 'Fire out with wide base and active feet to crack block cornerback.',
    },
    W: {
      id: 'W',
      label: 'Slot 2 (Seal)',
      positionName: 'Lead Blocker 2',
      initialPos: { x: 64, y: 66 },
      route: {
        name: 'Climb to 2nd Level Seal',
        points: [
          { x: 64, y: 66, type: 'snap' },
          { x: 78, y: 45, type: 'block', label: 'Seal LB' },
        ],
        isBlocking: true,
      },
      roleDescription: 'Climb to second level and seal inside scraping linebacker.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'H', concept: 'Tunnel Screen Execution', cue: 'Quick trigger pass to screen receiver in under 0.8s' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Quick 1-Step');
}

function createRpoDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-rpo-mesh', x: 48, y: 73, label: 'Mesh Ride Pocket', color: '#f97316' },
    { id: 'cone-conflict-lb', x: 64, y: 56, label: 'Conflict LB Apex', color: '#ef4444', type: 'shield' },
    { id: 'cone-glance-window', x: 62, y: 44, label: 'Glance Slant Window', color: '#10b981' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Run Block', points: [{ x: 50, y: 65 }, { x: 50, y: 63 }] },
      roleDescription: 'Run block.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: 'Mesh Ride & Rapid Trigger',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 48, y: 73, type: 'stem', label: 'Ride Mesh' },
          { x: 48, y: 72, type: 'target', label: 'Pull & Fire' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Seat ball into RB pocket, read conflict LB shoulders. If LB bites on run, pull and throw slant.',
    },
    RB: {
      id: 'RB',
      label: 'RB',
      positionName: 'Running Back',
      initialPos: { x: 44, y: 75 },
      route: {
        name: 'Interior Zone Mesh Track',
        points: [
          { x: 44, y: 75, type: 'snap' },
          { x: 48, y: 73, type: 'stem', label: 'Mesh Pocket' },
          { x: 48, y: 60, type: 'target', label: 'B-Gap Run' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Clamp soft pocket, ready for give or clean pull.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Glance)',
      positionName: 'Outside Receiver',
      initialPos: { x: 84, y: 65 },
      route: {
        name: 'Glance Slant (RPO Tag)',
        points: [
          { x: 84, y: 65, type: 'snap' },
          { x: 84, y: 55, type: 'stem' },
          { x: 62, y: 44, type: 'target', label: 'Glance' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Run full tempo glance slant behind the conflict linebacker.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'QB', concept: 'Read Conflict LB', cue: 'If LB steps down to run, pull and fire glance slant' },
    { order: 2, playerId: 'RB', concept: 'Interior Zone Give', cue: 'If LB sinks into pass window, hand off to RB' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Play Action Mesh');
}

function createQbDropDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-los-drop', x: 50, y: 65, label: 'LOS (Center Cone)', color: '#f97316' },
    { id: 'cone-step-1', x: 50, y: 79, label: 'Step 1: Push-Off', color: '#eab308' },
    { id: 'cone-step-3', x: 50, y: 85, label: 'Step 3: Firm Plant', color: '#ef4444' },
    { id: 'cone-hitch-throw', x: 50, y: 82, label: 'Hitch Step & Throw (1.8s)', color: '#10b981' },
    { id: 'cone-wr-target', x: 84, y: 48, label: 'Receiver Timing Break', color: '#38bdf8' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: {
        name: 'High Spiral Shotgun Snap',
        points: [
          { x: 50, y: 65, type: 'snap' },
          { x: 50, y: 66, type: 'block' },
        ],
        isBlocking: true,
      },
      roleDescription: 'Execute clean, consistent shotgun spiral snap to chest.',
    },
    QB: {
      id: 'QB',
      label: 'QB (Mechanics)',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: 'Shotgun 3-Step + Hitch Footwork',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 79, type: 'stem', label: 'Step 1' },
          { x: 50, y: 82, type: 'stem', label: 'Step 2 Cross' },
          { x: 50, y: 85, type: 'break', label: 'Step 3 Plant' },
          { x: 50, y: 82, type: 'target', label: 'Hitch & Fire' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Step 1 push-off, Step 2 crossover, Step 3 firm back foot plant, hitch step into throw at 1.8s.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Target)',
      positionName: 'Outside Receiver',
      initialPos: { x: 84, y: 65 },
      route: {
        name: 'Timed Out Route Target',
        points: [
          { x: 84, y: 65, type: 'snap' },
          { x: 84, y: 48, type: 'stem', label: 'Match QB Hitch' },
          { x: 96, y: 48, type: 'target', label: 'Catch' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Synchronize final break step to QB back foot plant.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'QB', concept: 'Footwork Cadence', cue: 'Back foot hits turf at 1.8s - drive ball without double-clutch' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createDigDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-dig-stem', x: 84, y: 41, label: '12yd Vertical Break Cone', color: '#f97316' },
    { id: 'cone-dig-window', x: 48, y: 41, label: 'Seam Window Penetration', color: '#10b981' },
    { id: 'cone-hook-lb', x: 54, y: 52, label: 'Hook LB Void Marker', color: '#ef4444', type: 'shield' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '5-Step Drop & Seam Fire',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 84, type: 'stem' },
          { x: 50, y: 82, type: 'target' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Throw dig with velocity into second window between linebackers and dropping safety.',
    },
    Z: {
      id: 'Z',
      label: 'WR (Dig)',
      positionName: 'Outside Receiver',
      initialPos: { x: 84, y: 65 },
      route: {
        name: '6 - 10/12-Yard Dig (Square In)',
        routeNumber: 6,
        points: [
          { x: 84, y: 65, type: 'snap' },
          { x: 84, y: 41, type: 'stem', label: '12 yds' },
          { x: 84, y: 40, type: 'break', label: 'Plant' },
          { x: 45, y: 41, type: 'target', label: 'Flat Across Hashes' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Push to 12 yards, sharp 90° plant, run flat across hashes without drifting upfield.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: '12-Yard Dig Window', cue: 'Drive ball into seam between linebackers' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 5-Step');
}

function createFloodDrillPlay(drill: PracticeDrill): Play {
  const cones: DrillCone[] = [
    { id: 'cone-sail-break', x: 74, y: 44, label: '10yd Sail Break', color: '#f97316' },
    { id: 'cone-flat-target', x: 92, y: 58, label: '3yd Flat Target', color: '#10b981' },
    { id: 'cone-clearout', x: 88, y: 22, label: 'Deep Clear-Out Marker', color: '#eab308' },
    { id: 'cone-flat-defender', x: 84, y: 54, label: 'Conflict Flat DB', color: '#ef4444', type: 'shield' },
  ];

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Drop & High-to-Low Read',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: 'Read Flat DB' },
          { x: 50, y: 80, type: 'target', label: 'Release' },
        ],
        isPrimary: true,
      },
      roleDescription: 'Read Flat Defender: If he drops deep with Sail -> Hit Flat. If he bites Flat -> Hit Sail.',
    },
    Z: {
      id: 'Z',
      label: 'Z (Deep)',
      positionName: 'Outside Receiver',
      initialPos: { x: 88, y: 65 },
      route: {
        name: '9 - Go (Clear-Out)',
        routeNumber: 9,
        points: [
          { x: 88, y: 65, type: 'snap' },
          { x: 88, y: 15, type: 'target', label: 'Clear Deep CB' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Sprint 100% speed to pull deep cornerback out of intermediate window.',
    },
    Y: {
      id: 'Y',
      label: 'Y (Sail)',
      positionName: 'Slot Receiver',
      initialPos: { x: 74, y: 66 },
      route: {
        name: '7 - Sail (10-Yard Out)',
        routeNumber: 7,
        points: [
          { x: 74, y: 66, type: 'snap' },
          { x: 74, y: 44, type: 'stem', label: '10 yds' },
          { x: 94, y: 44, type: 'target', label: 'Sail Out' },
        ],
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: 'Push to 10 yards, cut 90° toward sideline.',
    },
    RB: {
      id: 'RB',
      label: 'RB (Flat)',
      positionName: 'Running Back',
      initialPos: { x: 58, y: 75 },
      route: {
        name: '1 - Flat (3-Yard Underneath)',
        routeNumber: 1,
        points: [
          { x: 58, y: 75, type: 'snap' },
          { x: 92, y: 58, type: 'target', label: 'Flat' },
        ],
        isSecondary: true,
      },
      roleDescription: 'Release immediately to flat at 3 yards depth.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Y', concept: 'Sail (10 yds)', cue: 'Throw if flat defender stays shallow' },
    { order: 2, playerId: 'RB', concept: 'Flat (3 yds)', cue: 'Take quick positive yards if defender drops with sail' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function createGenericDrillPlay(drill: PracticeDrill, basePlay?: Play): Play {
  const cones: DrillCone[] = [
    { id: 'cone-los', x: 82, y: 65, label: 'LOS Cone', color: '#f97316' },
    { id: 'cone-break', x: 82, y: 48, label: 'Break Point Cone', color: '#eab308' },
    { id: 'cone-target', x: 70, y: 35, label: 'Target Window', color: '#10b981' },
  ];

  const primaryRouteCode = drill.targetRoutes[0] || '2';
  const genRoute = generateRoutePoints(82, 65, primaryRouteCode, { isRightSide: true });

  const players: Record<string, PlayerAssignment> = {
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      route: { name: 'Pass Set', points: [{ x: 50, y: 65 }, { x: 50, y: 66 }] },
      roleDescription: 'Pass set.',
    },
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      route: {
        name: '3-Step Rhythm Release',
        points: [
          { x: 50, y: 75, type: 'snap' },
          { x: 50, y: 81, type: 'stem', label: 'Plant' },
          { x: 50, y: 80, type: 'target', label: 'Fire' },
        ],
        isPrimary: true,
      },
      roleDescription: drill.qbCoachingKey || 'Rhythm throw on receiver break.',
    },
    Z: {
      id: 'Z',
      label: 'WR',
      positionName: 'Drill Target Receiver',
      initialPos: { x: 82, y: 65 },
      route: {
        name: genRoute.name,
        points: genRoute.points,
        isPrimary: true,
        isBallCarrier: true,
      },
      roleDescription: drill.receiverCoachingKey || 'Execute sharp break angle and catch in stride.',
    },
  };

  const progressionReads: ProgressionRead[] = [
    { order: 1, playerId: 'Z', concept: drill.name, cue: drill.receiverCoachingKey || 'Target receiver on rhythm' },
  ];

  return buildPlayShell(drill, cones, players, progressionReads, 'Shotgun 3-Step');
}

function buildPlayShell(
  drill: PracticeDrill,
  cones: DrillCone[],
  players: Record<string, PlayerAssignment>,
  progressionReads: ProgressionRead[],
  qbDrop: 'Shotgun 3-Step' | 'Shotgun 5-Step' | 'Quick 1-Step' | 'Rollout Right' | 'Rollout Left' | 'Play Action Mesh' | 'QB Keep'
): Play {
  return {
    id: drill.id,
    playNumber: `DRILL-${drill.id.replace('drill-', '')}`,
    code: `DRILL: ${drill.name}`,
    originalTurkishCode: `DRILL: ${drill.name}`,
    englishName: drill.name,
    category: 'TRIPS PASS',
    playType: drill.category === 'SCREEN_RUN' ? 'SCREEN' : 'PASS',
    direction: 'RIGHT',
    formationName: `Training Drill: ${drill.category.replace('_', ' ')}`,
    conceptName: drill.name,
    tags: ['Drill', drill.category, drill.difficulty, 'Training Reps', 'Cones'],
    description: `${drill.objective} | Setup: ${drill.fieldSetup} | Reps: ${drill.repCount}`,
    coachingPoints: [
      `QB Focus: ${drill.qbCoachingKey}`,
      `Receiver Focus: ${drill.receiverCoachingKey}`,
      ...drill.stepByStep.slice(0, 2),
    ],
    progressionReads,
    qbDrop,
    players,
    drillData: {
      drillId: drill.id,
      cones,
      repTarget: extractRepCountNumber(drill.repCount),
      coachingCue: drill.receiverCoachingKey || drill.qbCoachingKey,
      isDrill: true,
    },
  };
}

function extractRepCountNumber(repStr: string): number {
  const match = repStr.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : 6;
}
