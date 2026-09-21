import { Play } from '../types';

export interface CoverageMatchupEvaluation {
  schemeName: string;
  schemeId: string;
  ratingStars: number; // 1 to 5
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  advantage: 'OFFENSE' | 'NEUTRAL' | 'DEFENSE';
  summary: string;
  keyMismatch: string;
  coachingRecommendation: string;
}

export function evaluatePlayVsCoverages(play: Play): CoverageMatchupEvaluation[] {
  const isPass = play.playType === 'PASS' || play.playType === 'PLAY_ACTION' || play.playType === 'SCREEN';
  const hasCorner = play.conceptName.toLowerCase().includes('smash') || play.conceptName.toLowerCase().includes('corner');
  const hasSlant = play.conceptName.toLowerCase().includes('slant') || play.conceptName.toLowerCase().includes('cross');
  const hasVerts = play.conceptName.toLowerCase().includes('vert') || play.conceptName.toLowerCase().includes('seam');
  const hasFlood = play.conceptName.toLowerCase().includes('flood') || play.conceptName.toLowerCase().includes('sail');
  const isRun = play.playType === 'RUN';

  // Cover 2 Evaluation
  let cover2Rating = 3;
  let cover2Grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
  let cover2Summary = 'Standard zone spacing against 2 deep safeties.';
  let cover2Mismatch = 'Middle Hole & Deep Sideline Hole';

  if (hasCorner) {
    cover2Rating = 5;
    cover2Grade = 'A+';
    cover2Summary = 'Elite Cover 2 Beater! High-low stretch on flat corner puts safety in conflict between deep half and corner route.';
    cover2Mismatch = 'Boundary Cornerback trapped between Flat route and deep 7-Corner.';
  } else if (hasVerts) {
    cover2Rating = 4;
    cover2Grade = 'A';
    cover2Summary = 'Four Verticals splits the 2 deep safeties down the middle seam (Tampa 2 void).';
    cover2Mismatch = 'Inside Slot seam routes attack the deep middle hole between two safeties.';
  } else if (isRun) {
    cover2Rating = 4;
    cover2Grade = 'A';
    cover2Summary = 'Light defensive box! 2 safeties are deep (split field), leaving only 4 defenders in the box.';
    cover2Mismatch = 'Center and Guards get clean climbing blocks onto lone Mike LB.';
  }

  // Cover 3 Evaluation
  let cover3Rating = 3;
  let cover3Grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
  let cover3Summary = 'Defense has 3 deep defenders with single high safety.';
  let cover3Mismatch = 'Seams and Flat Underneath';

  if (hasFlood) {
    cover3Rating = 5;
    cover3Grade = 'A+';
    cover3Summary = 'Perfection against Cover 3! 3-level flood (Go, Out, Flat) overloads the single outside third defender.';
    cover3Mismatch = 'Outside Cornerback cannot cover intermediate 12-yard out and deep streak simultaneously.';
  } else if (hasSlant) {
    cover3Rating = 4;
    cover3Grade = 'A';
    cover3Summary = 'Quick slants attack the soft seam window between hook/curl linebacker and outside corner.';
    cover3Mismatch = 'Slot receiver wins inside position on curl defender.';
  } else if (hasVerts) {
    cover3Rating = 2;
    cover3Grade = 'C';
    cover3Summary = 'Tougher deep shot: 3 deep defenders divide field into thirds, limiting pure vertical separation.';
    cover3Mismatch = 'Must hit underneath checkdown if safeties backpedal deep.';
  }

  // Cover 1 Man Evaluation
  let cover1Rating = 3;
  let cover1Grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
  let cover1Summary = 'Single high safety with aggressive man-to-man coverage underneath.';
  let cover1Mismatch = '1-on-1 Route Separation';

  if (hasSlant || play.conceptName.toLowerCase().includes('mesh') || play.conceptName.toLowerCase().includes('wheel')) {
    cover1Rating = 5;
    cover1Grade = 'A+';
    cover1Summary = 'Man Coverage Destroyer! Crossing routes create natural rub / pick concepts that shake trailing defenders.';
    cover1Mismatch = 'Speed mismatch on crosser or RB wheel route against linebacker.';
  } else if (isRun) {
    cover1Rating = 3;
    cover1Grade = 'B';
    cover1Summary = 'Defenders are locked man-to-man with backs turned to the ball, opening cutback lanes for RB.';
    cover1Mismatch = 'If front-side seal block holds, running back has green grass.';
  }

  // Cover 0 / All-Out Blitz Evaluation
  let blitzRating = 2;
  let blitzGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'C';
  let blitzSummary = 'Heavy 4-man or 5-man blitz with zero deep safeties.';
  let blitzMismatch = 'Unblocked Rusher vs Hot Route';

  if (play.tags.includes('BlitzBeater') || play.conceptName.toLowerCase().includes('quick') || play.conceptName.toLowerCase().includes('slant') || play.conceptName.toLowerCase().includes('screen')) {
    blitzRating = 5;
    blitzGrade = 'A+';
    blitzSummary = 'Devastating Blitz Beater! Quick release ball out before edge rush can arrive, catching defense with no safety help.';
    blitzMismatch = 'Receiver catches in stride with empty secondary behind him for touchdown!';
  } else if (play.qbDrop === 'Shotgun 5-Step') {
    blitzRating = 1;
    blitzGrade = 'D';
    blitzSummary = 'Danger vs Blitz: Long developing 5-step route tree risks pocket collapse before WRs break.';
    blitzMismatch = 'Edge blitzer will arrive in 2.1s; QB must audible to quick hot slant or screen.';
  }

  return [
    {
      schemeName: 'Cover 2 (Two-High Zone)',
      schemeId: 'cover2',
      ratingStars: cover2Rating,
      grade: cover2Grade,
      advantage: cover2Rating >= 4 ? 'OFFENSE' : cover2Rating === 3 ? 'NEUTRAL' : 'DEFENSE',
      summary: cover2Summary,
      keyMismatch: cover2Mismatch,
      coachingRecommendation: hasCorner ? 'Target primary Corner route on 5-step hitch read.' : 'Check down to RB in flat if safeties stay deep.',
    },
    {
      schemeName: 'Cover 3 (Single-High Sky Zone)',
      schemeId: 'cover3',
      ratingStars: cover3Rating,
      grade: cover3Grade,
      advantage: cover3Rating >= 4 ? 'OFFENSE' : cover3Rating === 3 ? 'NEUTRAL' : 'DEFENSE',
      summary: cover3Summary,
      keyMismatch: cover3Mismatch,
      coachingRecommendation: hasFlood ? 'Read Cornerback: If deep, fire intermediate Out route at 12 yards.' : 'Attack seam window between hash and numbers.',
    },
    {
      schemeName: 'Cover 1 (Man-Free Underneath)',
      schemeId: 'cover1',
      ratingStars: cover1Rating,
      grade: cover1Grade,
      advantage: cover1Rating >= 4 ? 'OFFENSE' : cover1Rating === 3 ? 'NEUTRAL' : 'DEFENSE',
      summary: cover1Summary,
      keyMismatch: cover1Mismatch,
      coachingRecommendation: 'Isolate best route runner on 1-on-1 matchup. Deliver on break.',
    },
    {
      schemeName: 'Cover 0 (All-Out Blitz)',
      schemeId: 'cover0',
      ratingStars: blitzRating,
      grade: blitzGrade,
      advantage: blitzRating >= 4 ? 'OFFENSE' : blitzRating === 3 ? 'NEUTRAL' : 'DEFENSE',
      summary: blitzSummary,
      keyMismatch: blitzMismatch,
      coachingRecommendation: blitzRating >= 4 ? 'Rhythm throw on 1st step! Let receiver run after catch.' : 'Audible to Quick Slant or max protect.',
    },
  ];
}
