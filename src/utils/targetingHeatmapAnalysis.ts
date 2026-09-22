import { Play, DefenseScheme, RosterPlayer, TargetingHeatZone, TargetingHeatMapAnalysis, PlayerAssignment, DefensivePlayer } from '../types';
import { getPlayerAssignedToSlot, SAMPLE_ATHLETE_NAMES, getDefaultPositionNameForSlot } from '../data/rosterData';

/**
 * Calculates the current on-field position of an offensive player at a specific animation progress (0.0 to 1.0).
 */
export function getOffensivePlayerPositionAtProgress(
  player: PlayerAssignment,
  progress: number
): { x: number; y: number } {
  const { initialPos, motion, route } = player;

  // Phase 1: Pre-snap motion (progress 0 to 0.25)
  if (motion) {
    if (progress < 0.25) {
      const motionProgress = progress / 0.25;
      const curX = motion.startPos.x + (motion.endPos.x - motion.startPos.x) * motionProgress;
      const curY = motion.startPos.y + (motion.endPos.y - motion.startPos.y) * motionProgress;
      return { x: curX, y: curY };
    }
  }

  // Phase 2: Post-snap route execution (progress 0.25 to 1.0, or 0.0 to 1.0 if no motion)
  const playProgress = motion ? Math.max(0, (progress - 0.25) / 0.75) : progress;
  const points = route.points;

  if (!points || points.length <= 1) {
    return motion && progress >= 0.25 ? motion.endPos : initialPos;
  }

  let totalLength = 0;
  const segmentLengths: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return points[0];

  const targetDistance = totalLength * playProgress;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDistance) {
      const segProgress = segLen > 0 ? (targetDistance - accumulated) / segLen : 0;
      const p1 = points[i];
      const p2 = points[i + 1];
      return {
        x: p1.x + (p2.x - p1.x) * segProgress,
        y: p1.y + (p2.y - p1.y) * segProgress,
      };
    }
    accumulated += segLen;
  }

  return points[points.length - 1];
}

/**
 * Calculates the current on-field position of a defensive player at a specific animation progress (0.0 to 1.0),
 * reflecting realistic defensive reactions (blitz, zone drops, and man/bracket coverage shifts).
 */
export function getDefenderPositionAtProgress(
  defPlayer: DefensivePlayer,
  play: Play,
  progress: number,
  offensivePositions: Record<string, { x: number; y: number }>
): { x: number; y: number } {
  let defX = defPlayer.initialPos.x;
  let defY = defPlayer.initialPos.y;

  if (progress > 0.25) {
    const reactProgress = (progress - 0.25) / 0.75;
    if (defPlayer.coverageType === 'blitz') {
      defY = defPlayer.initialPos.y + (75 - defPlayer.initialPos.y) * reactProgress * 0.7;
      defX = defPlayer.initialPos.x + (50 - defPlayer.initialPos.x) * reactProgress * 0.7;
    } else if (
      defPlayer.coverageType === 'bracket' &&
      defPlayer.targetOffensivePlayerId &&
      offensivePositions[defPlayer.targetOffensivePlayerId]
    ) {
      const offPos = offensivePositions[defPlayer.targetOffensivePlayerId];
      const isHighSafety = defPlayer.initialPos.y < 40;
      const yOffset = isHighSafety ? -6 : -2;
      const xOffset = isHighSafety ? 1.5 : -1.5;
      defX = defPlayer.initialPos.x + (offPos.x + xOffset - defPlayer.initialPos.x) * reactProgress * 0.75;
      defY = defPlayer.initialPos.y + (offPos.y + yOffset - defPlayer.initialPos.y) * reactProgress * 0.75;
    } else if (
      defPlayer.coverageType === 'match' &&
      defPlayer.targetOffensivePlayerId &&
      offensivePositions[defPlayer.targetOffensivePlayerId]
    ) {
      const offPos = offensivePositions[defPlayer.targetOffensivePlayerId];
      defX = defPlayer.initialPos.x + (offPos.x - defPlayer.initialPos.x) * reactProgress * 0.65;
      defY = defPlayer.initialPos.y + (offPos.y - 3.5 - defPlayer.initialPos.y) * reactProgress * 0.65;
    } else if (
      defPlayer.targetOffensivePlayerId &&
      offensivePositions[defPlayer.targetOffensivePlayerId]
    ) {
      const offPos = offensivePositions[defPlayer.targetOffensivePlayerId];
      defX = defPlayer.initialPos.x + (offPos.x - defPlayer.initialPos.x) * reactProgress * 0.6;
      defY = defPlayer.initialPos.y + (offPos.y - 4 - defPlayer.initialPos.y) * reactProgress * 0.6;
    } else if (defPlayer.coverageType.includes('deep')) {
      defY = defPlayer.initialPos.y - 4.5 * reactProgress; // Deep safety backpedal
    } else if (defPlayer.zoneArea) {
      const dropDepth = defPlayer.zoneArea.y + defPlayer.zoneArea.height * 0.5;
      const dropX = defPlayer.zoneArea.x + defPlayer.zoneArea.width * 0.5;
      defX = defPlayer.initialPos.x + (dropX - defPlayer.initialPos.x) * Math.min(1, reactProgress * 1.15);
      defY = defPlayer.initialPos.y + (dropDepth - defPlayer.initialPos.y) * Math.min(1, reactProgress * 1.15);
    }
  }

  return { x: defX, y: defY };
}

/**
 * Analyzes the selected play's routes, progression reads, and defensive matchup
 * to compute the highest success probability targeting zones on the tactical field.
 *
 * When dynamicTimeTracking is enabled, success probabilities and heat colors update
 * in real-time as the animation progresses, directly accounting for live receiver separation,
 * route break timing windows, and shifting defender coverage leverage.
 */
export function analyzeTargetingHeatMap(
  play: Play,
  defenseScheme?: DefenseScheme | null,
  roster: RosterPlayer[] = [],
  sensitivity: number = 1.0,
  progress: number = 0,
  dynamicTimeTracking: boolean = false
): TargetingHeatMapAnalysis {
  const LINE_OF_SCRIMMAGE_Y = 65;
  const YARDS_PER_Y_UNIT = 0.85; // ~1.18 Y units per yard

  // Sensitivity adjusts the thresholds of the success probability colors (Red-Yellow-Blue):
  // Baseline (1.0x / 100%): Red >= 78%, Yellow 65% - 77%, Blue < 65%
  // Increasing sensitivity (e.g. 1.25x) shifts the gradient towards aggressive/vibrant (lower threshold for Red & Yellow)
  // Decreasing sensitivity (e.g. 0.75x) shifts the gradient towards strict/conservative (higher hurdle for Red & Yellow)
  const sens = Math.max(0.5, Math.min(1.5, sensitivity));
  const highThreshold = Math.max(55, Math.min(92, Math.round(78 - (sens - 1.0) * 30)));
  const moderateThreshold = Math.max(40, Math.min(highThreshold - 5, Math.round(65 - (sens - 1.0) * 25)));

  const playTimeSeconds = Math.round(progress * 3.5 * 10) / 10;

  // Pre-calculate offensive player positions if dynamic tracking is active
  const offensivePositions: Record<string, { x: number; y: number }> = {};
  Object.keys(play.players).forEach((pk) => {
    offensivePositions[pk] = getOffensivePlayerPositionAtProgress(play.players[pk], progress);
  });

  // Pre-calculate defensive player positions if dynamic tracking is active and defense scheme exists
  const defenderPositions: Array<{ defPlayer: DefensivePlayer; pos: { x: number; y: number } }> = [];
  if (defenseScheme && defenseScheme.players) {
    defenseScheme.players.forEach((dp) => {
      defenderPositions.push({
        defPlayer: dp,
        pos: getDefenderPositionAtProgress(dp, play, progress, offensivePositions),
      });
    });
  }

  const eligibleKeys = Object.keys(play.players).filter((pk) => {
    // Skip QB and interior offensive linemen
    const norm = pk.toUpperCase();
    return norm !== 'QB' && norm !== 'C' && norm !== 'LG' && norm !== 'RG' && norm !== 'OL';
  });

  const rawZones: TargetingHeatZone[] = [];

  // Match progression reads if present
  const progressionMap = new Map<string, { order: number; concept: string; cue: string }>();
  if (play.progressionReads && play.progressionReads.length > 0) {
    play.progressionReads.forEach((pr) => {
      if (pr.playerId) {
        progressionMap.set(pr.playerId.toUpperCase(), {
          order: pr.order,
          concept: pr.concept,
          cue: pr.cue,
        });
      }
    });
  }

  eligibleKeys.forEach((pk, idx) => {
    const player = play.players[pk];
    if (!player || !player.route || !player.route.points || player.route.points.length === 0) {
      return;
    }

    const normKey = pk.toUpperCase();
    const assignedPlayer = getPlayerAssignedToSlot(pk, roster);
    const assignedName = assignedPlayer && !SAMPLE_ATHLETE_NAMES.includes(assignedPlayer.name)
      ? assignedPlayer.name
      : (player.positionName || getDefaultPositionNameForSlot(pk, player.label));

    // Determine target location (optimal catch / break point)
    const points = player.route.points;
    let targetPt = points[points.length - 1]; // default to route endpoint

    // If an explicit 'target' or 'break' point is designated, prefer it
    const explicitTarget = points.slice().reverse().find((pt) => pt.type === 'target');
    const explicitBreak = points.slice().reverse().find((pt) => pt.type === 'break');
    if (explicitTarget) {
      targetPt = explicitTarget;
    } else if (explicitBreak && points.length > 2) {
      // Often the catch window is right at or 1-2 steps after break
      const breakIdx = points.indexOf(explicitBreak);
      if (breakIdx >= 0 && breakIdx < points.length - 1) {
        targetPt = points[breakIdx + 1];
      } else {
        targetPt = explicitBreak;
      }
    }

    const cx = Math.max(8, Math.min(92, targetPt.x));
    const cy = Math.max(14, Math.min(80, targetPt.y));
    const depthYards = Math.max(0, Math.round((LINE_OF_SCRIMMAGE_Y - cy) * YARDS_PER_Y_UNIT * 10) / 10);

    // Progression Order Determination
    let readOrder = idx + 1;
    let conceptCue = '';
    let readConcept = '';

    if (progressionMap.has(normKey)) {
      const pr = progressionMap.get(normKey)!;
      readOrder = pr.order;
      conceptCue = pr.cue;
      readConcept = pr.concept;
    } else if (player.route.isPrimary) {
      readOrder = 1;
    } else if (player.route.isSecondary) {
      readOrder = 2;
    } else if (player.route.isCheckdown || normKey === 'RB' || normKey === 'HB') {
      readOrder = 3;
    } else {
      // Infer from depth: deeper routes earlier, flats later
      if (depthYards > 15) readOrder = 1;
      else if (depthYards > 8) readOrder = 2;
      else readOrder = 3;
    }

    // Baseline Success Probability Calculation
    let baseProb = 75;

    // Progression Timing Advantage
    if (readOrder === 1) {
      baseProb = 84; // Primary read has highest designed rhythm success
    } else if (readOrder === 2) {
      baseProb = 76; // Secondary read behind linebackers
    } else if (readOrder === 3) {
      baseProb = 82; // High-percentage safety outlet / checkdown
    } else {
      baseProb = 68;
    }

    // Depth & Route Type Adjustments
    const routeLower = player.route.name.toLowerCase();
    let rx = 14;
    let ry = 9;

    if (depthYards <= 4) {
      // Underneath Flat / Screen / Quick Hit
      baseProb += 6;
      rx = 16;
      ry = 7;
    } else if (depthYards > 18) {
      // Deep vertical shot (>18 yds) - lower completion rate, but explosive EPA
      baseProb -= 12;
      rx = 12;
      ry = 15;
    } else if (routeLower.includes('cross') || routeLower.includes('slant') || routeLower.includes('mesh')) {
      // In-breaking / crossing route
      baseProb += 4;
      rx = 18;
      ry = 8;
    } else if (routeLower.includes('out') || routeLower.includes('corner') || routeLower.includes('comeback')) {
      // Out-breaking to boundary
      if (cx < 25 || cx > 75) {
        baseProb -= 3; // Tight boundary window
      }
      rx = 13;
      ry = 10;
    } else if (routeLower.includes('seam') || routeLower.includes('post') || routeLower.includes('curl')) {
      rx = 13;
      ry = 11;
    }

    // Defensive Coverage Baseline Interactions
    let coverageAdvantage = 'Standard zone spacing advantage';
    if (defenseScheme) {
      const defId = defenseScheme.id.toLowerCase();
      if (defId.includes('cover2')) {
        if (depthYards > 14 && cx >= 35 && cx <= 65) {
          baseProb += 9;
          coverageAdvantage = 'Attacks Tampa 2 deep middle void between safeties';
        } else if (depthYards >= 10 && depthYards <= 18 && (cx <= 22 || cx >= 78)) {
          baseProb += 8;
          coverageAdvantage = 'Hole-shot window over boundary CB & outside half safety';
        } else if (depthYards <= 5) {
          baseProb -= 4;
          coverageAdvantage = 'Contested by squatting Cover 2 cornerback';
        }
      } else if (defId.includes('cover3')) {
        if ((cx >= 28 && cx <= 42) || (cx >= 58 && cx <= 72)) {
          if (depthYards >= 10 && depthYards <= 18) {
            baseProb += 8;
            coverageAdvantage = 'Splits deep 1/3 boundary & middle safety in seam void';
          }
        } else if (depthYards <= 6 && (cx <= 22 || cx >= 78)) {
          baseProb += 7;
          coverageAdvantage = 'Outflanks curl-flat defender to sideline';
        } else if (depthYards > 18 && cx >= 40 && cx <= 60) {
          baseProb -= 10;
          coverageAdvantage = 'Directly into middle third free safety patrol';
        }
      } else if (defId.includes('cover1') || defId.includes('man') || defId.includes('cover0')) {
        if (routeLower.includes('cross') || routeLower.includes('slant') || routeLower.includes('mesh')) {
          baseProb += 10;
          coverageAdvantage = 'Picks up natural separation vs trail man leverage';
        } else if (normKey === 'RB' || normKey === 'HB') {
          baseProb += 11;
          coverageAdvantage = 'Running back athletic mismatch vs interior linebacker';
        }
      } else if (defId.includes('cover4') || defId.includes('quarters')) {
        if (depthYards >= 6 && depthYards <= 12) {
          baseProb += 6;
          coverageAdvantage = 'Attacks intermediate void underneath 4 deep safeties';
        } else if (depthYards > 20) {
          baseProb -= 8;
          coverageAdvantage = 'Double coverage over top by quarter safety';
        }
      }
    }

    // Roster Rating micro-influence
    if (assignedPlayer?.handsRating) {
      if (assignedPlayer.handsRating >= 94) baseProb += 3;
      else if (assignedPlayer.handsRating < 80) baseProb -= 2;
    }

    // Dynamic Play Timeline & Coverage Shift Calculations
    let finalProb = Math.min(94, Math.max(45, Math.round(baseProb)));
    let liveSeparationYards: number | undefined = undefined;
    let coverageStatus: string | undefined = undefined;
    let targetPhase: TargetingHeatZone['targetPhase'] = 'OPEN_WINDOW';
    let nearestDefenderName: string | undefined = undefined;
    let nearestDefenderDist: number | undefined = undefined;
    const receiverLivePos = offensivePositions[pk] || { x: cx, y: cy };

    if (dynamicTimeTracking) {
      // Find closest defender to receiver and to the target window
      let minRecDist = 999;
      let minDefLabel = '';
      let minTargetWindowDist = 999;

      defenderPositions.forEach(({ defPlayer, pos }) => {
        const dRec = Math.hypot(receiverLivePos.x - pos.x, receiverLivePos.y - pos.y);
        if (dRec < minRecDist) {
          minRecDist = dRec;
          minDefLabel = defPlayer.label || defPlayer.name || defPlayer.id;
        }

        const dTarget = Math.hypot(cx - pos.x, cy - pos.y);
        if (dTarget < minTargetWindowDist) {
          minTargetWindowDist = dTarget;
        }
      });

      if (minRecDist < 900) {
        liveSeparationYards = Math.round(minRecDist * YARDS_PER_Y_UNIT * 10) / 10;
        nearestDefenderName = minDefLabel;
        nearestDefenderDist = liveSeparationYards;
      } else {
        // Fallback separation if no defense scheme is loaded
        liveSeparationYards = 3.6;
        nearestDefenderName = 'Coverage Shell';
        nearestDefenderDist = 3.6;
      }

      const windowClearanceYds = minTargetWindowDist < 900
        ? Math.round(minTargetWindowDist * YARDS_PER_Y_UNIT * 10) / 10
        : 4.0;

      // Define ideal progression timing window for this route archetype
      let windowStart = 0.35;
      let windowPeak = 0.55;
      let windowEnd = 0.75;

      if (depthYards <= 4 || player.route.isCheckdown || normKey === 'RB') {
        windowStart = 0.18;
        windowPeak = 0.38;
        windowEnd = 0.62;
      } else if (depthYards >= 16) {
        windowStart = 0.52;
        windowPeak = 0.72;
        windowEnd = 0.90;
      } else {
        windowStart = 0.35;
        windowPeak = 0.55;
        windowEnd = 0.75;
      }

      // Timing factor: Early stem vs Peak Break vs Late Squeeze
      let timingBonus = 0;
      if (progress < windowStart) {
        targetPhase = 'STEM';
        const remainingTime = Math.max(0.1, (windowStart - progress) * 3.5).toFixed(1);
        coverageStatus = `Stem Phase (${remainingTime}s to break) • Window Developing`;
        timingBonus = -14 + Math.round((progress / windowStart) * 9);
      } else if (progress <= windowEnd) {
        const peakFactor = 1 - Math.abs(progress - windowPeak) / (windowEnd - windowStart);
        timingBonus = Math.round(11 * Math.max(0, peakFactor));

        if (liveSeparationYards >= 4.2) {
          targetPhase = 'OPEN_WINDOW';
          coverageStatus = `Peak Window (+${liveSeparationYards}y Sep vs ${nearestDefenderName}) • Wide Open`;
        } else if (liveSeparationYards >= 2.4) {
          targetPhase = 'OPEN_WINDOW';
          coverageStatus = `In Rhythm (+${liveSeparationYards}y Sep vs ${nearestDefenderName})`;
        } else {
          targetPhase = 'SQUEEZED';
          coverageStatus = `Contested (${liveSeparationYards}y cushion vs ${nearestDefenderName})`;
        }
      } else {
        // Late play phase (> windowEnd)
        if (player.route.isCheckdown || normKey === 'RB') {
          targetPhase = 'CHECKDOWN';
          timingBonus = 13;
          coverageStatus = `Safety Valve Open • Underneath Checkdown (+${liveSeparationYards}y)`;
        } else {
          targetPhase = 'SQUEEZED';
          timingBonus = -15;
          coverageStatus = `Window Closing • Coverage Squeezed by ${nearestDefenderName}`;
        }
      }

      // Separation factor based on shifting defender positions
      let separationAdj = 0;
      if (liveSeparationYards >= 5.0) {
        separationAdj = +15;
      } else if (liveSeparationYards >= 3.2) {
        separationAdj = +8;
      } else if (liveSeparationYards >= 2.0) {
        separationAdj = 0;
      } else if (liveSeparationYards >= 1.2) {
        separationAdj = -14;
      } else {
        separationAdj = -24; // Blanket coverage
      }

      // Target window clearance impact (e.g. zone defender dropping into path)
      if (windowClearanceYds < 2.0 && progress >= 0.35) {
        separationAdj -= 9;
      }

      const dynamicProb = baseProb + timingBonus + separationAdj;
      finalProb = Math.min(95, Math.max(38, Math.round(dynamicProb)));
    }

    // Categorize EPA & Functional Tier
    let epaTier: TargetingHeatZone['epaTier'] = 'INTERMEDIATE_CHAIN_MOVER';
    let tierLabel = `READ #${readOrder}: SECONDARY`;

    if (depthYards <= 5 || player.route.isCheckdown || normKey === 'RB') {
      epaTier = 'SAFETY_VALVE';
      tierLabel = `CHECKDOWN (${depthYards} YD OUTLET)`;
    } else if (depthYards >= 16) {
      epaTier = 'EXPLOSIVE_SHOT';
      tierLabel = `DEEP SHOT (${depthYards} YDS)`;
    } else if (readOrder === 1) {
      epaTier = 'PRIMARY_RHYTHM';
      tierLabel = 'READ #1: PRIMARY WINDOW';
    } else if (finalProb >= highThreshold) {
      epaTier = 'PRIMARY_RHYTHM';
      tierLabel = `READ #${readOrder}: HIGH PROBABILITY`;
    }

    // Color Intensity scale based on success probability:
    // Red = High Success (>= highThreshold)
    // Yellow = Moderate (moderateThreshold to highThreshold - 1)
    // Blue = Low (< moderateThreshold)
    let color = '#eab308'; // Yellow = Moderate
    let gradientId = 'heat-gradient-amber';

    if (finalProb >= highThreshold) {
      color = '#ef4444'; // Red = High Success
      gradientId = 'heat-gradient-crimson';
    } else if (finalProb < moderateThreshold) {
      color = '#38bdf8'; // Blue = Low
      gradientId = 'heat-gradient-blue';
    }

    let tacticalNote = readConcept || conceptCue;
    if (!tacticalNote) {
      if (dynamicTimeTracking && coverageStatus) {
        tacticalNote = coverageStatus;
      } else if (epaTier === 'PRIMARY_RHYTHM') {
        tacticalNote = `High-rhythm ${depthYards} yd target window with ${finalProb}% completion expectation.`;
      } else if (epaTier === 'SAFETY_VALVE') {
        tacticalNote = `High-efficiency checkdown underneath (${finalProb}% catch rate) for reliable positive yardage.`;
      } else if (epaTier === 'EXPLOSIVE_SHOT') {
        tacticalNote = `Vertical shot window with explosive EPA against high safety leverage.`;
      } else {
        tacticalNote = `Intermediate progression window timed with secondary break (${depthYards} yds).`;
      }
    }

    rawZones.push({
      id: `heat-zone-${pk}`,
      readOrder,
      playerId: pk,
      playerLabel: player.label,
      positionName: assignedName,
      routeName: player.route.name,
      cx,
      cy,
      rx,
      ry,
      depthYards,
      successProbability: finalProb,
      epaTier,
      tierLabel,
      tacticalNote,
      coverageAdvantage,
      color,
      gradientId,
      liveSeparationYards,
      coverageStatus,
      targetPhase,
      receiverLivePos,
      nearestDefenderName,
      nearestDefenderDist,
    });
  });

  // Sort zones by progression order (Read 1 first, then 2, 3...)
  rawZones.sort((a, b) => a.readOrder - b.readOrder);

  // Overall metrics calculation
  const primaryZone = rawZones.find((z) => z.readOrder === 1) || rawZones[0];
  const checkdownZone = rawZones.find((z) => z.epaTier === 'SAFETY_VALVE') || rawZones[rawZones.length - 1];
  const deepZone = rawZones.find((z) => z.epaTier === 'EXPLOSIVE_SHOT') || rawZones.reduce((max, z) => z.depthYards > max.depthYards ? z : max, rawZones[0]);

  const primaryWindowSuccess = primaryZone ? primaryZone.successProbability : 82;
  const checkdownSafetyRating = checkdownZone ? checkdownZone.successProbability : 88;
  const deepShotPotential = deepZone ? deepZone.successProbability : 62;

  const avgProb = rawZones.length > 0
    ? Math.round(rawZones.reduce((acc, z) => acc + z.successProbability, 0) / rawZones.length)
    : 78;

  let bestCoverageMismatch = 'Balanced route distribution creates high-low conflicts against both 2-High and 3-Deep schemes.';
  if (defenseScheme) {
    const dName = defenseScheme.shortName || defenseScheme.name;
    bestCoverageMismatch = `Targeting windows calibrated against ${dName} — primary reads stress boundary corners and open underneath seams.`;
  } else if (play.conceptName) {
    bestCoverageMismatch = `${play.conceptName} concept stretches defensive spacing horizontally and vertically for defined windows.`;
  }

  // Dynamic phase and coverage summary descriptions
  let timelinePhaseDescription: string | undefined = undefined;
  let coverageShiftSummary: string | undefined = undefined;

  if (dynamicTimeTracking) {
    if (progress < 0.20) {
      timelinePhaseDescription = `Pre-Snap & Release Stem (${playTimeSeconds}s)`;
    } else if (progress < 0.45) {
      timelinePhaseDescription = `Route Break & Initial Separation (${playTimeSeconds}s)`;
    } else if (progress < 0.70) {
      timelinePhaseDescription = `Peak Throw Rhythm Window (${playTimeSeconds}s)`;
    } else if (progress < 0.88) {
      timelinePhaseDescription = `Coverage Squeeze & Progression Slide (${playTimeSeconds}s)`;
    } else {
      timelinePhaseDescription = `Pocket Collapse & Checkdown Scramble (${playTimeSeconds}s)`;
    }

    if (defenseScheme) {
      const defId = defenseScheme.id.toLowerCase();
      if (defId.includes('cover2')) {
        if (progress < 0.40) coverageShiftSummary = 'Cover 2: Safeties backpedaling to deep halves; CBs squatting in flats.';
        else if (progress < 0.72) coverageShiftSummary = 'Cover 2 Shift: Safeties widening to sideline hole-shots — Tampa 2 deep middle void expands open (RED)!';
        else coverageShiftSummary = 'Cover 2 Shift: Safeties converging on boundary; underneath linebackers rally.';
      } else if (defId.includes('cover3')) {
        if (progress < 0.40) coverageShiftSummary = 'Cover 3: Cornerbacks bailing to deep thirds; Free Safety tracking center field.';
        else if (progress < 0.72) coverageShiftSummary = 'Cover 3 Shift: Seam voids open between deep thirds (RED); curl-flat defender stretched horizontally.';
        else coverageShiftSummary = 'Cover 3 Shift: Deep safety closes middle third; flat checkdown completely vacates (RED).';
      } else if (defId.includes('cover1') || defId.includes('man')) {
        if (progress < 0.40) coverageShiftSummary = 'Man Coverage: Defenders in tight trail leverage.';
        else if (progress < 0.72) coverageShiftSummary = 'Man Shift: In/out route cuts creating peak horizontal separation (+3.5y)!';
        else coverageShiftSummary = 'Man Shift: Trail defenders recovering; RB checkdown out of backfield is primary open outlet.';
      } else if (defId.includes('cover4') || defId.includes('quarters')) {
        if (progress < 0.40) coverageShiftSummary = 'Quarters: 4-deep shell dropping to protect deep boundary and seams.';
        else if (progress < 0.72) coverageShiftSummary = 'Quarters Shift: Intermediate voids open between second-level LBs and deep safeties (RED)!';
        else coverageShiftSummary = 'Quarters Shift: Deep shots blanketed; underneath checkdown wide open.';
      } else {
        coverageShiftSummary = `Defensive shift active at ${playTimeSeconds}s: Zones adjusting leverage based on route distribution.`;
      }
    } else {
      coverageShiftSummary = `Timeline Tracking Active: Target probabilities reflect real-time separation at ${playTimeSeconds}s.`;
    }
  }

  const timingCues: string[] = [
    `Rhythm Read (0.8s - 1.4s): Hit Read #1 at the top of the route stem before zone constriction.`,
    `Second Window (1.8s - 2.4s): If Read #1 is bracketed, slide eyes immediately to intermediate seam/crosser.`,
    `Protection Checkdown (2.8s+): Dump to backfield outlet if blitz rush penetrates A/B-gap.`,
  ];

  return {
    playId: play.id,
    playCode: play.code,
    overallRating: avgProb,
    primaryWindowSuccess,
    checkdownSafetyRating,
    deepShotPotential,
    bestCoverageMismatch,
    timingCues,
    zones: rawZones,
    sensitivity: sens,
    highThreshold,
    moderateThreshold,
    isTimeTrackingActive: dynamicTimeTracking,
    timelineProgress: progress,
    playTimeSeconds,
    timelinePhaseDescription,
    coverageShiftSummary,
  };
}
