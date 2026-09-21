import { Play, PlayerAssignment } from '../types';

export interface PlayMetricCategory {
  key: string;
  category: string;
  shortLabel: string;
  score: number; // 0 - 100
  fullMark: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
  description: string;
  tacticalFactor: string;
}

export interface PlayRadarProfileData {
  metrics: PlayMetricCategory[];
  overallRating: number;
  archetype: string;
  primaryStrength: string;
  bestAgainstDefense: string;
  cautionAgainstDefense: string;
}

/**
 * Calculates effectiveness metrics across key categories for an 8v8 football play:
 * - Speed (Quick game, release timing, snap-to-throw rhythm)
 * - Route Complexity (Tree layering, read progression depth, motion)
 * - Vertical Threat (Deep boundary & seam stretching, y-depth pressure)
 * - Man-Beater Capability (Separation on breaks, crosses, rubs, whips)
 * - Zone Exploitation (High-low brackets, void sit-downs, horizontal floods)
 * - Red Zone Viability (Compact spacing, goal line & tight window execution)
 */
export function calculatePlayRadarProfile(play: Play): PlayRadarProfileData {
  if (!play || !play.players) {
    return {
      metrics: [
        { key: 'speed', category: 'Speed & Timing', shortLabel: 'Speed', score: 75, fullMark: 100, grade: 'B+', description: 'Quick snap-to-throw rhythm', tacticalFactor: 'Standard drop' },
        { key: 'complexity', category: 'Route Complexity', shortLabel: 'Complexity', score: 70, fullMark: 100, grade: 'B', description: 'Multi-layer concept', tacticalFactor: 'Standard progression' },
        { key: 'vertical', category: 'Vertical Threat', shortLabel: 'Vertical Threat', score: 70, fullMark: 100, grade: 'B', description: 'Downfield field stretch', tacticalFactor: 'Medium depth' },
        { key: 'manBeater', category: 'Man-Beater Capability', shortLabel: 'Man-Beater', score: 75, fullMark: 100, grade: 'B+', description: 'Sharp break separation', tacticalFactor: 'Individual cuts' },
        { key: 'zoneExploitation', category: 'Zone Exploitation', shortLabel: 'Zone Attack', score: 75, fullMark: 100, grade: 'B+', description: 'High-low bracket stretch', tacticalFactor: 'Space manipulation' },
        { key: 'redZone', category: 'Red Zone Viability', shortLabel: 'Red Zone', score: 70, fullMark: 100, grade: 'B', description: 'Tight window efficiency', tacticalFactor: 'Goal line spacing' },
      ],
      overallRating: 73,
      archetype: 'Balanced Scheme',
      primaryStrength: 'Versatile baseline execution',
      bestAgainstDefense: 'Cover 2 Zone',
      cautionAgainstDefense: 'Press Man',
    };
  }

  const players = Object.values(play.players) as PlayerAssignment[];
  const playStr = `${play.code || ''} ${play.englishName || ''} ${play.conceptName || ''} ${(play.tags || []).join(' ')} ${play.description || ''}`.toLowerCase();

  const routeNumbers: (number | string)[] = [];
  const routeNames: string[] = [];
  let hasDeepRoute = false;
  let hasCrosser = false;
  let hasOutBreaking = false;
  let hasInBreaking = false;
  let hasMotion = false;
  let hasRubOrPick = false;
  let minTargetY = 100; // lower y means deeper downfield (y=65 is LOS, y=0 is endzone)

  players.forEach((p) => {
    if (p.motion) hasMotion = true;
    if (p.route) {
      if (p.route.routeNumber !== undefined && p.route.routeNumber !== null) {
        routeNumbers.push(p.route.routeNumber);
      }
      if (p.route.name) {
        const nameLower = p.route.name.toLowerCase();
        routeNames.push(nameLower);
        if (nameLower.includes('cross') || nameLower.includes('mesh') || nameLower.includes('drag') || nameLower.includes('drive')) {
          hasCrosser = true;
        }
        if (nameLower.includes('out') || nameLower.includes('corner') || nameLower.includes('flat') || nameLower.includes('wheel')) {
          hasOutBreaking = true;
        }
        if (nameLower.includes('in') || nameLower.includes('dig') || nameLower.includes('post') || nameLower.includes('slant')) {
          hasInBreaking = true;
        }
        if (nameLower.includes('pick') || nameLower.includes('rub') || nameLower.includes('mesh')) {
          hasRubOrPick = true;
        }
      }
      if (p.route.points && p.route.points.length > 0) {
        p.route.points.forEach((pt) => {
          if (pt.y < minTargetY) minTargetY = pt.y;
        });
      }
    }
  });

  // 1. SPEED & TIMING (0 - 100)
  // Higher if Quick 1-step, screens, hitches, quick slants, bubble, RPO
  let speedScore = 70;
  if (play.qbDrop === 'Quick 1-Step') speedScore += 22;
  else if (play.qbDrop === 'Shotgun 3-Step') speedScore += 10;
  else if (play.qbDrop === 'Shotgun 5-Step') speedScore -= 12;
  else if (play.qbDrop === 'Play Action Mesh' || play.qbDrop === 'Rollout Right' || play.qbDrop === 'Rollout Left') speedScore -= 6;

  if (play.playType === 'SCREEN') speedScore += 18;
  if (play.playType === 'RPO') speedScore += 14;
  if (play.playType === 'RUN') speedScore += 10;

  if (playStr.includes('smoke') || playStr.includes('hitch') || playStr.includes('bubble') || playStr.includes('flat') || playStr.includes('quick')) {
    speedScore += 10;
  }
  if (playStr.includes('double move') || playStr.includes('post corner') || playStr.includes('pump')) {
    speedScore -= 14;
  }
  speedScore = Math.max(45, Math.min(98, speedScore));

  // 2. ROUTE COMPLEXITY (0 - 100)
  // Higher if multiple reads, complex concepts (Mesh, Flood, Levels, Smash-Post), motion, option routes
  let complexityScore = 65;
  if (play.progressionReads && play.progressionReads.length >= 4) complexityScore += 15;
  else if (play.progressionReads && play.progressionReads.length === 3) complexityScore += 10;
  else if (play.progressionReads && play.progressionReads.length <= 1) complexityScore -= 12;

  if (hasMotion) complexityScore += 8;
  if (hasRubOrPick || playStr.includes('mesh') || playStr.includes('flood') || playStr.includes('levels') || playStr.includes('dagger')) {
    complexityScore += 14;
  }
  if (play.playType === 'RPO' || play.playType === 'PLAY_ACTION') complexityScore += 10;
  if (play.category.includes('TRIPS') || play.category.includes('EMPTY')) complexityScore += 6;
  if (playStr.includes('choice') || playStr.includes('option') || playStr.includes('read')) complexityScore += 8;
  complexityScore = Math.max(40, Math.min(96, complexityScore));

  // 3. VERTICAL THREAT (0 - 100)
  // Higher if deep routes (8, 9, 7), minTargetY <= 25 (deep downfield), 4 verts, post, seam
  let verticalScore = 60;
  const deepRouteCount = routeNumbers.filter((n) => n === 8 || n === 9 || n === 7 || n === '8' || n === '9' || n === '7').length;
  verticalScore += deepRouteCount * 12;

  if (minTargetY <= 20) verticalScore += 18;
  else if (minTargetY <= 30) verticalScore += 10;
  else if (minTargetY >= 50) verticalScore -= 16;

  if (playStr.includes('vert') || playStr.includes('streak') || playStr.includes('go') || playStr.includes('post') || playStr.includes('seam') || playStr.includes('bomb') || playStr.includes('deep')) {
    verticalScore += 12;
  }
  if (play.playType === 'SCREEN' || playStr.includes('short') || playStr.includes('underneath') || playStr.includes('hitch')) {
    verticalScore -= 10;
  }
  verticalScore = Math.max(35, Math.min(99, verticalScore));

  // 4. MAN-BEATER CAPABILITY (0 - 100)
  // Higher if crossers, slants (2), whips, double moves, rubs, pivot routes, option routes, wheels
  let manBeaterScore = 68;
  if (hasCrosser) manBeaterScore += 16;
  if (hasRubOrPick) manBeaterScore += 14;
  if (routeNumbers.some((n) => n === 2 || n === '2')) manBeaterScore += 12; // Slant
  if (routeNumbers.some((n) => n === 4 || n === '4' || n === 5 || n === '5')) manBeaterScore += 8; // In/Out cuts
  if (playStr.includes('mesh') || playStr.includes('slant') || playStr.includes('whip') || playStr.includes('pivot') || playStr.includes('wheel') || playStr.includes('cross')) {
    manBeaterScore += 12;
  }
  if (playStr.includes('zone sit') || playStr.includes('spot') || (playStr.includes('hitch') && !playStr.includes('slant'))) {
    manBeaterScore -= 8;
  }
  manBeaterScore = Math.max(45, Math.min(98, manBeaterScore));

  // 5. ZONE EXPLOITATION (0 - 100)
  // Higher if Smash, Flood, Stick, Levels, Dagger, high-low brackets, curl-flat
  let zoneScore = 70;
  if (playStr.includes('flood') || playStr.includes('levels') || playStr.includes('smash') || playStr.includes('stick') || playStr.includes('dagger') || playStr.includes('hi-lo') || playStr.includes('high low')) {
    zoneScore += 20;
  }
  if (hasOutBreaking && hasInBreaking) zoneScore += 10; // Multi-directional stress
  if (playStr.includes('curl') || playStr.includes('hitch') || playStr.includes('spacing') || playStr.includes('snag')) {
    zoneScore += 12;
  }
  if (play.category.includes('TRIPS') || play.category.includes('TWINS')) zoneScore += 6;
  zoneScore = Math.max(50, Math.min(97, zoneScore));

  // 6. RED ZONE VIABILITY (0 - 100)
  // Higher for quick slants, fades, quick screens, rub routes, compact spacing, tight windows
  let redZoneScore = 65;
  if (speedScore > 80) redZoneScore += 12;
  if (hasRubOrPick || playStr.includes('slant') || playStr.includes('fade') || playStr.includes('stick') || playStr.includes('whip') || playStr.includes('flat')) {
    redZoneScore += 14;
  }
  if (verticalScore > 85) redZoneScore -= 12; // Long vertical routes suffer in shortened field
  if (play.category.includes('EMPTY') || play.category.includes('TRIPS')) redZoneScore += 6;
  redZoneScore = Math.max(45, Math.min(95, redZoneScore));

  const getGrade = (val: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' => {
    if (val >= 92) return 'A+';
    if (val >= 84) return 'A';
    if (val >= 76) return 'B+';
    if (val >= 68) return 'B';
    if (val >= 60) return 'C+';
    return 'C';
  };

  const metrics: PlayMetricCategory[] = [
    {
      key: 'speed',
      category: 'Speed & Timing',
      shortLabel: 'Speed',
      score: speedScore,
      fullMark: 100,
      grade: getGrade(speedScore),
      description: speedScore >= 80 ? 'Rapid snap-to-release rhythm; defeats blitz easily' : 'Medium-to-long developing routes requiring solid pocket protection',
      tacticalFactor: play.qbDrop,
    },
    {
      key: 'complexity',
      category: 'Route Complexity',
      shortLabel: 'Complexity',
      score: complexityScore,
      fullMark: 100,
      grade: getGrade(complexityScore),
      description: complexityScore >= 80 ? 'Multi-layered progression with sophisticated defender conflicts' : 'Clean, high-percentage primary read with minimal clutter',
      tacticalFactor: `${play.progressionReads?.length || 0} progression reads`,
    },
    {
      key: 'vertical',
      category: 'Vertical Threat',
      shortLabel: 'Vertical Threat',
      score: verticalScore,
      fullMark: 100,
      grade: getGrade(verticalScore),
      description: verticalScore >= 80 ? 'High-caliber deep field stretch forcing safeties deep' : 'Underneath/intermediate focal area with disciplined catch-and-run leverage',
      tacticalFactor: `Deepest stem: ${(65 - minTargetY) * 0.75 > 0 ? ((65 - minTargetY) * 0.75).toFixed(0) : '5'} yds downfield`,
    },
    {
      key: 'manBeater',
      category: 'Man-Beater Capability',
      shortLabel: 'Man-Beater',
      score: manBeaterScore,
      fullMark: 100,
      grade: getGrade(manBeaterScore),
      description: manBeaterScore >= 80 ? 'Natural pick/rub rubs and sharp leverage cuts create immediate 1v1 separation' : 'Relies heavily on defensive spacing and zone hole sit-downs',
      tacticalFactor: hasRubOrPick ? 'Rub/Cross separation' : hasCrosser ? 'Horizontal speed mismatch' : 'Individual cut leverage',
    },
    {
      key: 'zoneExploitation',
      category: 'Zone Exploitation',
      shortLabel: 'Zone Attack',
      score: zoneScore,
      fullMark: 100,
      grade: getGrade(zoneScore),
      description: zoneScore >= 80 ? 'High-low bracket stretch creates impossible defender 2-on-1 binds' : 'Single-level spacing; requires pinpoint ball placement into contested windows',
      tacticalFactor: 'High-Low multi-level stress',
    },
    {
      key: 'redZone',
      category: 'Red Zone Viability',
      shortLabel: 'Red Zone',
      score: redZoneScore,
      fullMark: 100,
      grade: getGrade(redZoneScore),
      description: redZoneScore >= 80 ? 'Excels in compressed fields (inside the 10) with sharp goal-line angles' : 'Needs deep field space to fully unfold and breathe',
      tacticalFactor: 'Compressed boundary spacing',
    },
  ];

  const overallRating = Math.round(
    (speedScore * 0.18 + complexityScore * 0.15 + verticalScore * 0.22 + manBeaterScore * 0.22 + zoneScore * 0.15 + redZoneScore * 0.08)
  );

  // Determine Archetype
  let archetype = 'Balanced Tactical Concept';
  if (verticalScore >= 86 && speedScore < 75) archetype = 'Deep Vertical Shot';
  else if (speedScore >= 88 && verticalScore < 65) archetype = 'Quick-Game Rhythm Strike';
  else if (manBeaterScore >= 88) archetype = 'Man-Coverage Eraser';
  else if (zoneScore >= 88) archetype = 'Hi-Lo Zone Stretcher';
  else if (complexityScore >= 88) archetype = 'Multi-Layer Read Concept';

  // Determine Best/Caution Defense
  let bestAgainstDefense = 'Cover 2 Zone';
  let cautionAgainstDefense = 'Cover 0 All-Out Blitz';

  if (manBeaterScore >= zoneScore && manBeaterScore >= 80) {
    bestAgainstDefense = 'Tight Man-to-Man (Cover 1 / Cover 0)';
    cautionAgainstDefense = 'Cover 3 Match (Drop 8)';
  } else if (zoneScore > manBeaterScore && zoneScore >= 80) {
    bestAgainstDefense = 'Cover 2 / Cover 3 Soft Zone';
    cautionAgainstDefense = 'Aggressive Press-Man';
  } else if (verticalScore >= 85) {
    bestAgainstDefense = 'Single-High Safeties (Cover 1 / Cover 3)';
    cautionAgainstDefense = 'Cover 4 Quarters / Deep 2-High Shell';
  } else if (speedScore >= 85) {
    bestAgainstDefense = 'Heavy Blitz & Aggressive Fronts';
    cautionAgainstDefense = 'Sitting Cloud Corners / Bracket Coverage';
  }

  // Primary Strength
  const highestMetric = [...metrics].sort((a, b) => b.score - a.score)[0];
  const primaryStrength = `${highestMetric.category} (${highestMetric.grade} - ${highestMetric.score}/100)`;

  return {
    metrics,
    overallRating,
    archetype,
    primaryStrength,
    bestAgainstDefense,
    cautionAgainstDefense,
  };
}
