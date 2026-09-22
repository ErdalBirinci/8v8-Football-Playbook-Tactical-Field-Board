import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, DefensivePlayer, DefenseScheme, PlayerAssignment, RosterPlayer, TokenDisplayMode, DrillTrainingSession, DrillCone } from '../types';
import { getPlayerAssignedToSlot, SAMPLE_ATHLETE_NAMES } from '../data/rosterData';
import { getPlayCoachingCues } from '../utils/coachingCuesStorage';
import {
  detectConceptsForPlay,
  ROUTE_CONCEPTS_DATABASE,
  RouteConceptDefinition,
} from '../data/routeConceptsData';
import { CoachingVideoOverlay } from './CoachingVideoOverlay';
import {
  Maximize2,
  Minimize2,
  Play as PlayIcon,
  Pause,
  RotateCcw,
  PenTool,
  Users,
  GraduationCap,
  Tv,
  ZoomIn,
  ZoomOut,
  Expand,
  Compass,
  Flame,
  Volume2,
  Timer,
  Eye,
  Repeat,
  Target,
  CheckCircle2,
  Zap,
  Grid,
  CloudSnow,
  CloudRain,
  Sun,
  Ruler,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getTeamBranding } from '../utils/teamBranding';
import { footballAudio } from '../utils/audioSynthesizer';
import { TelestratorCanvas } from './TelestratorCanvas';
import { MeasurementCaliper, CaliperPoint } from './MeasurementCaliper';

interface FieldBoardProps {
  play: Play;
  progress: number; // 0 to 1
  isPlaying: boolean;
  defenseScheme?: DefenseScheme | null;
  showDefense: boolean;
  showFullRoutes: boolean;
  showLabels: boolean;
  showZones: boolean;
  showFieldGrid?: boolean;
  onToggleFieldGrid?: () => void;
  selectedPlayerId?: string | null;
  onSelectPlayer?: (playerId: string | null) => void;
  fieldTheme: 'turf' | 'tactical' | 'chalkboard' | 'stadium-night';
  onTogglePlay?: () => void;
  onSeek?: (progress: number) => void;
  onOpenWhiteboard?: () => void;
  roster?: RosterPlayer[];
  tokenDisplayMode?: TokenDisplayMode;
  onToggleTokenMode?: () => void;
  onOpenRoster?: () => void;
  isCoachingOverlayOpen?: boolean;
  onToggleCoachingOverlay?: (val: boolean) => void;
  onOpenCoachingModal?: () => void;
  activeRouteConceptId?: string;
  onSelectRouteConceptId?: (id: string) => void;
  onOpenFormationGallery?: () => void;
  boardScale?: '1.0x' | '1.5x' | 'theater';
  onToggleBoardScale?: (scale: '1.0x' | '1.5x' | 'theater') => void;
  // Drill Training & Auto-Loop Props
  drillTrainingState?: DrillTrainingSession | null;
  onToggleDrillAutoLoop?: () => void;
  onIncrementDrillRep?: () => void;
  onDecrementDrillRep?: () => void;
  onResetDrillReps?: () => void;
  onChangeDrillTargetReps?: (reps: number) => void;
  onChangeDrillCadenceDelay?: (delayMs: number) => void;
  onExitDrillTraining?: () => void;
  showDrillCones?: boolean;
  onToggleShowDrillCones?: () => void;
}

export const FieldBoard: React.FC<FieldBoardProps> = ({
  play,
  progress,
  isPlaying,
  defenseScheme,
  showDefense,
  showFullRoutes,
  showLabels,
  showZones,
  showFieldGrid = false,
  onToggleFieldGrid,
  selectedPlayerId,
  onSelectPlayer,
  fieldTheme,
  onTogglePlay,
  onSeek,
  onOpenWhiteboard,
  roster = [],
  tokenDisplayMode = 'jersey',
  onToggleTokenMode,
  onOpenRoster,
  isCoachingOverlayOpen = false,
  onToggleCoachingOverlay,
  onOpenCoachingModal,
  activeRouteConceptId,
  onSelectRouteConceptId,
  onOpenFormationGallery,
  boardScale: controlledScale,
  onToggleBoardScale,
  drillTrainingState,
  onToggleDrillAutoLoop,
  onIncrementDrillRep,
  onDecrementDrillRep,
  onResetDrillReps,
  onChangeDrillTargetReps,
  onChangeDrillCadenceDelay,
  onExitDrillTraining,
  showDrillCones = true,
  onToggleShowDrillCones,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalScale, setInternalScale] = useState<'1.0x' | '1.5x' | 'theater'>('1.5x');
  const [showCoachingFieldHighlights, setShowCoachingFieldHighlights] = useState(true);

  // Advanced Visual & Functional State
  const [is3DAngle, setIs3DAngle] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGhostTrails, setShowGhostTrails] = useState(true);
  const [audibleActive, setAudibleActive] = useState(false);
  const [teamBranding, setTeamBranding] = useState(() => getTeamBranding());

  // 20 System Improvements Enhancements (Functional & Visual)
  const [showVisionCone, setShowVisionCone] = useState(true);
  const [isAdaptiveDefenseActive, setIsAdaptiveDefenseActive] = useState(true);
  const [weather, setWeather] = useState<'clear' | 'dome' | 'snow' | 'rain'>('clear');
  const [isTelestratorActive, setIsTelestratorActive] = useState(false);
  const [isCaliperActive, setIsCaliperActive] = useState(false);
  const [caliperPoints, setCaliperPoints] = useState<CaliperPoint[]>([]);
  const [lastAudioProgress, setLastAudioProgress] = useState<number>(0);

  // Audio synthesizer synchronization during playback (Functional #10)
  useEffect(() => {
    if (!isPlaying) {
      setLastAudioProgress(progress);
      return;
    }

    // Cadence / Snap at play start
    if (lastAudioProgress <= 0.04 && progress > 0.04) {
      footballAudio.playSnap();
    }
    // QB throw release
    if (lastAudioProgress <= 0.45 && progress > 0.45) {
      footballAudio.playThrow();
    }
    // Receiver catch
    if (lastAudioProgress <= 0.85 && progress > 0.85) {
      footballAudio.playCatch();
    }
    // Play end whistle
    if (lastAudioProgress <= 0.98 && progress >= 0.98) {
      footballAudio.playWhistle();
    }

    setLastAudioProgress(progress);
  }, [isPlaying, progress, lastAudioProgress]);

  useEffect(() => {
    const handleBranding = (e: any) => {
      if (e.detail) setTeamBranding(e.detail);
      else setTeamBranding(getTeamBranding());
    };
    window.addEventListener('playbook_branding_updated', handleBranding);
    return () => window.removeEventListener('playbook_branding_updated', handleBranding);
  }, []);

  const currentScale = controlledScale || internalScale;
  const setScale = (scale: '1.0x' | '1.5x' | 'theater') => {
    setInternalScale(scale);
    onToggleBoardScale?.(scale);
  };

  // Available concepts for active play
  const matchedConcepts = detectConceptsForPlay(play);
  const activeConcept =
    ROUTE_CONCEPTS_DATABASE.find((c) => c.id === activeRouteConceptId) ||
    matchedConcepts[0] ||
    ROUTE_CONCEPTS_DATABASE[0];

  // Active timestamped coaching cue for on-field display
  const currentSeconds = progress * 4.0;
  const playCues = useMemo(() => getPlayCoachingCues(play), [play]);
  const activeCoachingCue = useMemo(() => {
    if (!playCues || playCues.length === 0) return null;
    const matches = playCues.filter((c) => Math.abs(c.timeSeconds - currentSeconds) <= 0.35);
    if (matches.length > 0) {
      return matches.reduce((prev, curr) =>
        Math.abs(curr.timeSeconds - currentSeconds) < Math.abs(prev.timeSeconds - currentSeconds) ? curr : prev
      );
    }
    return null;
  }, [playCues, currentSeconds]);

  // Synchronize fullscreen state with browser events and keydown (ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore error
        }
      }
      setIsFullscreen(false);
    } else {
      if (containerRef.current?.requestFullscreen) {
        try {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch {
          // Fallback to CSS fixed full-screen modal mode if sandboxed iframe blocks requestFullscreen
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
    }
  };

  // Field dimensions in SVG units
  // Field coordinate system: 0-100 X (width), 0-100 Y (length)
  // End Zone: Y 0 to 15 (15 yds deep / goal line at 15)
  // LOS is at Y = 65 (50 yard line marker)
  // Backfield is Y 65 to 90

  // Calculate current animated position of an offensive player based on timeline progress (0 to 1)
  const getPlayerCurrentPosition = (playerKey: string) => {
    const player = play.players[playerKey];
    if (!player) return { x: 50, y: 75 };

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

    // Phase 2: Post-snap route execution (progress 0.25 to 1.0)
    const playProgress = motion ? Math.max(0, (progress - 0.25) / 0.75) : progress;
    const points = route.points;

    if (!points || points.length <= 1) {
      return motion && progress >= 0.25 ? motion.endPos : initialPos;
    }

    // Total route path length approximation
    let totalLength = 0;
    const segmentLengths: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
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
  };

  // Convert route points to smooth SVG path 'd' string
  const getRouteSvgPath = (points: { x: number; y: number }[]) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    // Smooth spline
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      d += ` L ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Calculate ball position during play animation
  const getBallPosition = () => {
    const qbPos = getPlayerCurrentPosition('QB');
    // If progress is early (0 to 0.45), QB holds ball
    if (progress < 0.45) {
      return { x: qbPos.x, y: qbPos.y - 1.5 };
    }

    // If it's a run play or ball carrier exists
    const ballCarrierKey = Object.keys(play.players).find(
      (k) => play.players[k].route.isBallCarrier
    );
    if (ballCarrierKey) {
      const carrierPos = getPlayerCurrentPosition(ballCarrierKey);
      return { x: carrierPos.x, y: carrierPos.y - 1.5 };
    }

    // If it's a pass play, ball travels from QB to primary receiver between progress 0.45 and 0.85
    const primaryKey = Object.keys(play.players).find(
      (k) => play.players[k].route.isPrimary
    ) || 'Z';
    const targetPlayer = play.players[primaryKey];
    if (targetPlayer) {
      const targetPos = getPlayerCurrentPosition(primaryKey);
      const throwProgress = Math.min(1, Math.max(0, (progress - 0.45) / 0.4));
      // Parabolic throw arc effect
      const arcHeight = Math.sin(throwProgress * Math.PI) * 8;
      return {
        x: qbPos.x + (targetPos.x - qbPos.x) * throwProgress,
        y: qbPos.y + (targetPos.y - qbPos.y) * throwProgress - arcHeight,
      };
    }

    return { x: qbPos.x, y: qbPos.y - 1.5 };
  };

  const ballPos = getBallPosition();

  // Background styling based on theme
  const getThemeBg = () => {
    switch (fieldTheme) {
      case 'turf':
        return 'bg-gradient-to-b from-[#14532d] via-[#166534] to-[#14532d]';
      case 'stadium-night':
        return 'bg-gradient-to-b from-[#021810] via-[#052b1b] to-[#01120b]';
      case 'chalkboard':
        return 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800';
      case 'tactical':
      default:
        return 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]';
    }
  };

  const getLineColor = () => {
    switch (fieldTheme) {
      case 'turf':
        return 'stroke-emerald-200/50';
      case 'stadium-night':
        return 'stroke-emerald-300/70';
      case 'chalkboard':
        return 'stroke-slate-200/50';
      case 'tactical':
      default:
        return 'stroke-sky-300/40';
    }
  };

  const lineStroke = getLineColor();

  // QB Vision Cone & Read Progression (Functional #1)
  const visionConeData = useMemo(() => {
    if (!showVisionCone) return null;
    const qbPos = getPlayerCurrentPosition('QB');
    const primaryKey = Object.keys(play.players).find((k) => play.players[k].route.isPrimary) || 'Z';
    const secondaryKey = Object.keys(play.players).find((k) => play.players[k].route.isSecondary) || 'X';
    const checkdownKey = Object.keys(play.players).find((k) => k.includes('RB') || play.players[k].route.routeType === 'flat') || 'H';

    let currentTargetKey = primaryKey;
    let readIndex = 1;
    let readLabel = 'READ 1';
    let coneColor = '#10b981';

    if (progress >= 0.35 && progress < 0.65) {
      currentTargetKey = secondaryKey;
      readIndex = 2;
      readLabel = 'READ 2';
      coneColor = '#06b6d4';
    } else if (progress >= 0.65) {
      currentTargetKey = checkdownKey;
      readIndex = 3;
      readLabel = 'CHECKDOWN';
      coneColor = '#f59e0b';
    }

    const targetPos = getPlayerCurrentPosition(currentTargetKey);
    const dx = targetPos.x - qbPos.x;
    const dy = targetPos.y - qbPos.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.max(12, Math.sqrt(dx * dx + dy * dy));
    const spreadAngle = 0.32;

    const p1 = {
      x: qbPos.x + Math.cos(angle - spreadAngle) * (distance + 6),
      y: qbPos.y + Math.sin(angle - spreadAngle) * (distance + 6),
    };
    const p2 = {
      x: qbPos.x + Math.cos(angle + spreadAngle) * (distance + 6),
      y: qbPos.y + Math.sin(angle + spreadAngle) * (distance + 6),
    };

    return {
      qbPos,
      targetPos,
      targetKey: currentTargetKey,
      readIndex,
      readLabel,
      coneColor,
      pointsStr: `${qbPos.x},${qbPos.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`,
    };
  }, [showVisionCone, progress, play]);

  // Defensive Zone Overload Detection (Visual #5)
  const zoneOverloads = useMemo(() => {
    if (!showZones) return [];
    const zones = [
      { name: 'DEEP RIGHT', x: 75, y: 30, rx: 16, ry: 12 },
      { name: 'DEEP MIDDLE', x: 50, y: 25, rx: 16, ry: 12 },
      { name: 'DEEP LEFT', x: 25, y: 30, rx: 16, ry: 12 },
      { name: 'RIGHT FLAT', x: 80, y: 55, rx: 14, ry: 8 },
      { name: 'LEFT FLAT', x: 20, y: 55, rx: 14, ry: 8 },
      { name: 'HOOK / CURL', x: 50, y: 52, rx: 18, ry: 9 },
    ];

    return zones.map((z) => {
      let offCount = 0;
      Object.keys(play.players).forEach((pk) => {
        if (pk === 'QB' || pk === 'C') return;
        const pos = getPlayerCurrentPosition(pk);
        if (Math.abs(pos.x - z.x) <= z.rx && Math.abs(pos.y - z.y) <= z.ry) {
          offCount++;
        }
      });
      return { ...z, offCount, isOverloaded: offCount >= 2 };
    });
  }, [showZones, play, progress]);

  // Click handler on SVG for Measurement Caliper (Visual #9)
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCaliperActive) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setCaliperPoints((prev) => {
      if (prev.length >= 2) return [{ x: clickX, y: clickY }];
      return [...prev, { x: clickX, y: clickY }];
    });
  };

  // Compute container aspect ratio and responsive height based on scale mode (1.5x active default)
  const getContainerScaleClasses = () => {
    if (isFullscreen) {
      return 'max-h-[calc(100vh-90px)] max-w-[calc((100vh-90px)*16/9)] aspect-[16/9] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80';
    }
    switch (currentScale) {
      case '1.0x':
        return 'w-full aspect-[16/10] max-h-[480px] rounded-2xl overflow-hidden shadow-md border border-slate-300';
      case 'theater':
        return 'w-full aspect-[16/10] sm:aspect-[4/3] max-h-[82vh] rounded-2xl overflow-hidden shadow-xl border border-slate-400 ring-2 ring-blue-500/30';
      case '1.5x':
      default:
        // 1.5x Scaled View: Fluid, full width, perfectly responsive without pixel overflow
        return 'w-full aspect-[4/3] sm:aspect-[4/3] md:aspect-[16/11] lg:aspect-[4/3] max-h-[74vh] rounded-2xl overflow-hidden shadow-lg border-2 border-slate-400/80 ring-1 ring-slate-900/10';
    }
  };

  const fieldBoardContent = (
    <div
      className={`relative w-full max-w-full ${getContainerScaleClasses()} select-none transition-all duration-300 ${getThemeBg()}`}
      style={
        is3DAngle
          ? {
              transform: 'perspective(1100px) rotateX(22deg) scale(0.96) translateY(-8px)',
              transformOrigin: 'bottom center',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }
          : { transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }
      }
    >
      <svg
        id="fieldboard-svg-canvas"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-full block ${isCaliperActive ? 'cursor-crosshair' : ''}`}
        onClick={handleSvgClick}
      >
        <defs>
          {/* QB Vision Cone Gradients (Functional #1) */}
          <linearGradient id="qb-vision-cone-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>

          {/* Dome Stadium Spotlight (Visual #3) */}
          <radialGradient id="dome-spotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
          </radialGradient>

          {/* Arrowhead Markers */}
          <marker
            id="arrow-primary"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker
            id="arrow-secondary"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-amber"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-pink"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
          </marker>
          <marker
            id="arrow-purple"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
          </marker>
          <marker
            id="arrow-runner"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker
            id="arrow-motion"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="3.5"
            markerHeight="3.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb923c" />
          </marker>

          {/* Glow Filters */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Route Heatmap Radial Gradients */}
          <radialGradient id="heat-deep-middle" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-boundary-left" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-boundary-right" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-flat-underneath" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Canvas Field Background for Export and Rendering */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={
            fieldTheme === 'turf'
              ? '#14532d'
              : fieldTheme === 'stadium-night'
              ? '#031f13'
              : fieldTheme === 'chalkboard'
              ? '#1e293b'
              : '#0f172a'
          }
        />

        {/* Dynamic Route Heatmap Overlay */}
        {showHeatmap && (
          <g id="route-heatmap-overlay" opacity="0.55" className="pointer-events-none transition-opacity duration-300">
            <ellipse cx="50" cy="28" rx="38" ry="16" fill="url(#heat-deep-middle)" />
            <ellipse cx="22" cy="40" rx="18" ry="14" fill="url(#heat-boundary-left)" />
            <ellipse cx="78" cy="40" rx="18" ry="14" fill="url(#heat-boundary-right)" />
            <ellipse cx="50" cy="55" rx="44" ry="9" fill="url(#heat-flat-underneath)" />
          </g>
        )}

        {/* Defensive Coverage Zone Shadows */}
        {showZones && defenseScheme && (
          <g id="coverage-zone-shadows" opacity="0.22" className="pointer-events-none">
            {defenseScheme.id === 'cover2' && (
              <>
                <rect x="2" y="12" width="47" height="34" fill="#3b82f6" rx="4" />
                <rect x="51" y="12" width="47" height="34" fill="#3b82f6" rx="4" />
                <ellipse cx="14" cy="55" rx="12" ry="7" fill="#10b981" />
                <ellipse cx="38" cy="54" rx="11" ry="8" fill="#eab308" />
                <ellipse cx="62" cy="54" rx="11" ry="8" fill="#eab308" />
                <ellipse cx="86" cy="55" rx="12" ry="7" fill="#10b981" />
              </>
            )}
            {defenseScheme.id === 'cover3' && (
              <>
                <rect x="2" y="12" width="31" height="35" fill="#8b5cf6" rx="4" />
                <rect x="34.5" y="12" width="31" height="35" fill="#8b5cf6" rx="4" />
                <rect x="67" y="12" width="31" height="35" fill="#8b5cf6" rx="4" />
                <ellipse cx="15" cy="55" rx="13" ry="7" fill="#06b6d4" />
                <ellipse cx="42" cy="55" rx="11" ry="7" fill="#eab308" />
                <ellipse cx="58" cy="55" rx="11" ry="7" fill="#eab308" />
                <ellipse cx="85" cy="55" rx="13" ry="7" fill="#06b6d4" />
              </>
            )}
            {defenseScheme.id === 'cover1' && (
              <>
                <rect x="25" y="12" width="50" height="30" fill="#ec4899" rx="6" />
              </>
            )}
          </g>
        )}

        {/* ================= Field Markings ================= */}
        {/* Endzone */}
        <rect
          x="0"
          y="0"
          width="100"
          height="12"
          fill={fieldTheme === 'turf' ? '#064e3b' : '#0f172a'}
          opacity="0.8"
        />
        {/* Endzone Diagonal Stripes */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`ez-stripe-${i}`}
            x1={i * 12}
            y1="0"
            x2={i * 12 + 15}
            y2="12"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.8"
          />
        ))}
        <text
          x="50"
          y="8"
          textAnchor="middle"
          fontSize="4.5"
          fontWeight="bold"
          fill="rgba(255,255,255,0.25)"
          letterSpacing="0.4em"
          className="font-display uppercase"
        >
          END ZONE
        </text>

        {/* Goal Line */}
        <line x1="0" y1="12" x2="100" y2="12" stroke="#ffffff" strokeWidth="0.8" />

        {/* Yard Lines (every 10 yards: 12, 22.6, 33.2, 43.8, 54.4, 65, 75.6, 86.2, 96.8) */}
        {[
          { y: 22, yard: '10' },
          { y: 32, yard: '20' },
          { y: 42, yard: '30' },
          { y: 52, yard: '40' },
          { y: 65, yard: '50' }, // Line of Scrimmage
          { y: 76, yard: '40' },
          { y: 88, yard: '30' },
        ].map((line, idx) => (
          <g key={`yardline-${idx}`}>
            <line
              x1="0"
              y1={line.y}
              x2="100"
              y2={line.y}
              className={lineStroke}
              strokeWidth={line.y === 65 ? '0.7' : '0.35'}
              strokeDasharray={line.y === 65 ? undefined : '1.5,1.5'}
            />
            {/* Yard Numbers on Left and Right */}
            {line.y !== 65 && (
              <>
                <text
                  x="8"
                  y={line.y + 1.2}
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="rgba(255,255,255,0.22)"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {line.yard}
                </text>
                <text
                  x="92"
                  y={line.y + 1.2}
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="rgba(255,255,255,0.22)"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {line.yard}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Aalto Predators Midfield Watermark Crest */}
        <image
          href="/aalto-predators-logo.svg"
          x="42"
          y="32"
          width="16"
          height="16"
          opacity="0.18"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none select-none"
        />

        {/* College / Pro Hash Marks */}
        {Array.from({ length: 30 }).map((_, i) => {
          const yPos = 14 + i * 2.8;
          if (yPos > 96) return null;
          return (
            <g key={`hash-${i}`} opacity="0.3">
              <line x1="38" y1={yPos} x2="40" y2={yPos} stroke="#ffffff" strokeWidth="0.3" />
              <line x1="60" y1={yPos} x2="62" y2={yPos} stroke="#ffffff" strokeWidth="0.3" />
              <line x1="2" y1={yPos} x2="4" y2={yPos} stroke="#ffffff" strokeWidth="0.3" />
              <line x1="96" y1={yPos} x2="98" y2={yPos} stroke="#ffffff" strokeWidth="0.3" />
            </g>
          );
        })}

        {/* Line of Scrimmage (LOS) Indicator Bar (Blue) */}
        <line
          x1="0"
          y1="65"
          x2="100"
          y2="65"
          stroke="#0284c7"
          strokeWidth="0.9"
          opacity="0.85"
        />
        <text
          x="3"
          y="64.2"
          fontSize="2.2"
          fontWeight="bold"
          fill="#38bdf8"
          className="font-mono"
        >
          LOS (Line of Scrimmage)
        </text>

        {/* First Down Line Indicator (Yellow - 10 yds downfield at y=52) */}
        <line
          x1="0"
          y1="52"
          x2="100"
          y2="52"
          stroke="#eab308"
          strokeWidth="0.6"
          strokeDasharray="2,1"
          opacity="0.65"
        />
        <text
          x="97"
          y="51.2"
          fontSize="2"
          fontWeight="bold"
          fill="#facc15"
          textAnchor="end"
          className="font-mono"
        >
          1st Down (Line to Gain)
        </text>

        {/* ================= 5-YARD FIELD GRID & HASHMARK OVERLAY ================= */}
        {showFieldGrid && (
          <g id="five-yard-field-grid-overlay" className="pointer-events-none select-none transition-opacity duration-300">
            {/* 5-Yard Horizontal Lines from Goal Line (y=12) to Deep Backfield (y=91.5) */}
            {[
              { y: 12.0, relYards: '+50 YD', isMajor: true },
              { y: 17.3, relYards: '+45 YD', isMajor: false },
              { y: 22.6, relYards: '+40 YD', isMajor: true },
              { y: 27.9, relYards: '+35 YD', isMajor: false },
              { y: 33.2, relYards: '+30 YD', isMajor: true },
              { y: 38.5, relYards: '+25 YD', isMajor: false },
              { y: 43.8, relYards: '+20 YD', isMajor: true },
              { y: 49.1, relYards: '+15 YD', isMajor: false },
              { y: 54.4, relYards: '+10 YD', isMajor: true },
              { y: 59.7, relYards: '+5 YD', isMajor: false },
              { y: 65.0, relYards: 'LOS (0)', isMajor: true },
              { y: 70.3, relYards: '-5 YD', isMajor: false },
              { y: 75.6, relYards: '-10 YD', isMajor: true },
              { y: 80.9, relYards: '-15 YD', isMajor: false },
              { y: 86.2, relYards: '-20 YD', isMajor: true },
              { y: 91.5, relYards: '-25 YD', isMajor: false },
            ].map((gLine, i) => (
              <g key={`grid-h-line-${i}`}>
                {/* 5-Yard Line Spanning Field */}
                <line
                  x1="0"
                  y1={gLine.y}
                  x2="100"
                  y2={gLine.y}
                  stroke={gLine.y === 65 ? '#38bdf8' : gLine.isMajor ? 'rgba(56, 189, 248, 0.55)' : 'rgba(56, 189, 248, 0.28)'}
                  strokeWidth={gLine.y === 65 ? '0.7' : gLine.isMajor ? '0.35' : '0.22'}
                  strokeDasharray={gLine.y === 65 ? undefined : gLine.isMajor ? '2, 1.5' : '0.8, 1.2'}
                />

                {/* 5-Yard Alignment Crosshairs (+) at key tactical columns */}
                {[10, 20, 30, 38, 50, 62, 70, 80, 90].map((cx) => (
                  <g key={`cross-${i}-${cx}`} opacity="0.65">
                    <line x1={cx - 0.75} y1={gLine.y} x2={cx + 0.75} y2={gLine.y} stroke="#38bdf8" strokeWidth="0.32" />
                    <line x1={cx} y1={gLine.y - 0.75} x2={cx} y2={gLine.y + 0.75} stroke="#38bdf8" strokeWidth="0.32" />
                  </g>
                ))}

                {/* Relative Yardage Depth Badges on Left and Right boundary */}
                {gLine.y !== 65 && gLine.y > 13 && (
                  <>
                    <text
                      x="2"
                      y={gLine.y + 0.8}
                      fontSize="1.6"
                      fontWeight="bold"
                      fill={gLine.isMajor ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)'}
                      textAnchor="start"
                      className="font-mono"
                    >
                      {gLine.relYards}
                    </text>
                    <text
                      x="98"
                      y={gLine.y + 0.8}
                      fontSize="1.6"
                      fontWeight="bold"
                      fill={gLine.isMajor ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)'}
                      textAnchor="end"
                      className="font-mono"
                    >
                      {gLine.relYards}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* Vertical Formation & Spacing Grid Lines */}
            {[
              { x: 10, label: 'L BND' },
              { x: 20, label: 'L NUM' },
              { x: 30, label: 'L SLOT' },
              { x: 38, label: 'L HASH', isHash: true },
              { x: 50, label: 'CENTER', isCenter: true },
              { x: 62, label: 'R HASH', isHash: true },
              { x: 70, label: 'R SLOT' },
              { x: 80, label: 'R NUM' },
              { x: 90, label: 'R BND' },
            ].map((vLine, i) => (
              <g key={`grid-v-line-${i}`}>
                <line
                  x1={vLine.x}
                  y1="12"
                  x2={vLine.x}
                  y2="95.5"
                  stroke={vLine.isCenter ? 'rgba(56, 189, 248, 0.45)' : vLine.isHash ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.18)'}
                  strokeWidth={vLine.isCenter ? '0.4' : '0.24'}
                  strokeDasharray={vLine.isCenter ? '2, 2' : '1, 2'}
                />
                <text
                  x={vLine.x}
                  y="97.2"
                  fontSize="1.35"
                  fontWeight="bold"
                  fill="rgba(56, 189, 248, 0.75)"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {vLine.label}
                </text>
              </g>
            ))}

            {/* Tactical Grid Status Indicator HUD Pill */}
            <g transform="translate(3, 14)">
              <rect x="0" y="0" width="35" height="4.5" rx="1.2" fill="rgba(15, 23, 42, 0.88)" stroke="#0284c7" strokeWidth="0.3" />
              <circle cx="2.5" cy="2.25" r="0.8" fill="#38bdf8" />
              <text x="4.4" y="2.9" fontSize="1.7" fontWeight="bold" fill="#38bdf8" className="font-mono">
                5-YD SPACING GRID ACTIVE
              </text>
            </g>
          </g>
        )}

        {/* ================= Sideline 1st Down Chains & Officials Marker (Visual #10) ================= */}
        <g id="sideline-chains-officials" className="pointer-events-none select-none">
          {/* Orange LOS Stake */}
          <rect x="0.8" y="63.8" width="4.4" height="2.4" rx="0.6" fill="#ea580c" stroke="#ffffff" strokeWidth="0.3" />
          <text x="3.0" y="65.5" fontSize="1.4" fontWeight="bold" fill="#ffffff" textAnchor="middle" className="font-mono">
            LOS
          </text>
          {/* Connecting Chain Line */}
          <line x1="3.0" y1="65" x2="3.0" y2="52" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.2,1.2" />
          {/* Yellow 1st Down Stake */}
          <rect x="0.8" y="50.8" width="4.4" height="2.4" rx="0.6" fill="#facc15" stroke="#000000" strokeWidth="0.3" />
          <text x="3.0" y="52.5" fontSize="1.4" fontWeight="bold" fill="#000000" textAnchor="middle" className="font-mono">
            1ST
          </text>
        </g>

        {/* ================= Weather & Environmental Atmosphere Layer (Visual #3) ================= */}
        {weather === 'snow' && (
          <g id="snow-weather-layer" className="pointer-events-none select-none">
            {Array.from({ length: 32 }).map((_, i) => {
              const sx = (i * 37) % 100;
              const sy = ((i * 41) + progress * 240) % 100;
              return (
                <circle
                  key={`snow-${i}`}
                  cx={sx}
                  cy={sy}
                  r={0.4 + (i % 3) * 0.25}
                  fill="#ffffff"
                  opacity={0.7 + (i % 4) * 0.1}
                />
              );
            })}
          </g>
        )}
        {weather === 'rain' && (
          <g id="rain-weather-layer" className="pointer-events-none select-none">
            {Array.from({ length: 45 }).map((_, i) => {
              const rx = (i * 29) % 100;
              const ry = ((i * 53) + progress * 400) % 100;
              return (
                <line
                  key={`rain-${i}`}
                  x1={rx}
                  y1={ry}
                  x2={rx - 1}
                  y2={ry + 3.5}
                  stroke="#38bdf8"
                  strokeWidth="0.3"
                  opacity="0.55"
                />
              );
            })}
          </g>
        )}
        {weather === 'dome' && (
          <g id="dome-lighting-layer" className="pointer-events-none select-none">
            <ellipse cx="50" cy="50" rx="46" ry="42" fill="url(#dome-spotlight)" opacity="0.35" />
          </g>
        )}

        {/* ================= Interactive QB Vision Cone & Read Progression (Functional #1) ================= */}
        {showVisionCone && visionConeData && (
          <g id="qb-vision-cone-layer" className="pointer-events-none select-none animate-in fade-in duration-300">
            {/* Projected Vision Cone Polygon */}
            <polygon
              points={visionConeData.pointsStr}
              fill="url(#qb-vision-cone-gradient)"
              stroke={visionConeData.coneColor}
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.75"
            />
            {/* Targeting Reticle at Target Receiver */}
            <g transform={`translate(${visionConeData.targetPos.x}, ${visionConeData.targetPos.y})`}>
              <circle
                r="4.8"
                fill="none"
                stroke={visionConeData.coneColor}
                strokeWidth="0.7"
                strokeDasharray="2,1"
                className="animate-spin"
              />
              <circle
                r="2.2"
                fill="none"
                stroke={visionConeData.coneColor}
                strokeWidth="0.5"
              />
              {/* Read Stage Badge */}
              <g transform="translate(0, -5.5)">
                <rect
                  x="-7"
                  y="-1.8"
                  width="14"
                  height="3.6"
                  rx="1"
                  fill="rgba(15, 23, 42, 0.92)"
                  stroke={visionConeData.coneColor}
                  strokeWidth="0.4"
                />
                <text
                  x="0"
                  y="0.7"
                  fontSize="1.6"
                  fontWeight="bold"
                  fill={visionConeData.coneColor}
                  textAnchor="middle"
                  className="font-mono tracking-tighter"
                >
                  {visionConeData.readLabel}
                </text>
              </g>
            </g>
          </g>
        )}

        {/* ================= Defensive Zone Overload & Flood Indicators (Visual #5) ================= */}
        {showZones && zoneOverloads.map((z, idx) => (
          <g key={`zone-overload-${idx}`} className="pointer-events-none select-none">
            <ellipse
              cx={z.x}
              cy={z.y}
              rx={z.rx}
              ry={z.ry}
              fill={z.isOverloaded ? 'rgba(239, 68, 68, 0.18)' : 'rgba(56, 189, 248, 0.06)'}
              stroke={z.isOverloaded ? '#ef4444' : 'rgba(56, 189, 248, 0.3)'}
              strokeWidth={z.isOverloaded ? '0.75' : '0.35'}
              strokeDasharray={z.isOverloaded ? 'none' : '2,2'}
            />
            {z.isOverloaded && (
              <g transform={`translate(${z.x}, ${z.y})`}>
                <rect
                  x="-10"
                  y="-2"
                  width="20"
                  height="4"
                  rx="1"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#ef4444"
                  strokeWidth="0.4"
                />
                <text
                  x="0"
                  y="0.8"
                  fontSize="1.6"
                  fontWeight="bold"
                  fill="#f87171"
                  textAnchor="middle"
                  className="font-mono"
                >
                  OVERLOAD (+{z.offCount})
                </text>
              </g>
            )}
          </g>
        ))}

        {/* ================= Defensive Zones & Coverage Overlay ================= */}
        {showDefense && defenseScheme && (
          <g id="defensive-scheme-overlay">
            {/* Zone Shading Areas */}
            {showZones &&
              defenseScheme.players
                .filter((p) => p.zoneArea)
                .map((defPlayer) => {
                  const zone = defPlayer.zoneArea!;
                  return (
                    <g key={`zone-${defPlayer.id}`}>
                      <rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        rx="2"
                        fill="rgba(244, 63, 94, 0.08)"
                        stroke="rgba(244, 63, 94, 0.35)"
                        strokeWidth="0.4"
                        strokeDasharray="1.5,1.5"
                      />
                      <text
                        x={zone.x + zone.width / 2}
                        y={zone.y + zone.height / 2 + 1}
                        textAnchor="middle"
                        fontSize="2.2"
                        fontWeight="600"
                        fill="rgba(251, 113, 133, 0.6)"
                        className="font-mono uppercase tracking-wider"
                      >
                        {zone.label}
                      </text>
                    </g>
                  );
                })}

            {/* Man / Match / Bracket Coverage Tether Lines */}
            {defenseScheme.players
              .filter((p) => (p.coverageType === 'man' || p.coverageType === 'match' || p.coverageType === 'bracket') && p.targetOffensivePlayerId)
              .map((defPlayer) => {
                const offPlayer = play.players[defPlayer.targetOffensivePlayerId!];
                if (!offPlayer) return null;
                const offPos = getPlayerCurrentPosition(defPlayer.targetOffensivePlayerId!);
                const isBracket = defPlayer.coverageType === 'bracket';
                const isMatch = defPlayer.coverageType === 'match';
                return (
                  <line
                    key={`tether-${defPlayer.id}`}
                    x1={defPlayer.initialPos.x}
                    y1={defPlayer.initialPos.y}
                    x2={offPos.x}
                    y2={offPos.y}
                    stroke={isBracket ? 'rgba(234, 88, 12, 0.4)' : isMatch ? 'rgba(168, 85, 247, 0.35)' : 'rgba(244, 63, 94, 0.25)'}
                    strokeWidth={isBracket ? '0.6' : '0.4'}
                    strokeDasharray={isBracket ? '2,1.5' : isMatch ? '2,2' : '1,1'}
                  />
                );
              })}

            {/* Defensive Player Tokens */}
            {defenseScheme.players.map((defPlayer) => {
              // Calculate reaction towards ball, zone drop, or receiver assignment
              let defX = defPlayer.initialPos.x;
              let defY = defPlayer.initialPos.y;

              // Adaptive Defensive AI Auto-Shade (Functional #2)
              if (isAdaptiveDefenseActive) {
                if (play.direction === 'RIGHT') {
                  if (defPlayer.position.includes('FS') || defPlayer.position.includes('S')) defX += 3.5;
                  if (defPlayer.position.includes('CB') && defPlayer.initialPos.x > 50) defX += 2.5;
                } else if (play.direction === 'LEFT') {
                  if (defPlayer.position.includes('FS') || defPlayer.position.includes('S')) defX -= 3.5;
                  if (defPlayer.position.includes('CB') && defPlayer.initialPos.x < 50) defX -= 2.5;
                }
                if (play.formationName.includes('Empty') && defPlayer.position.includes('LB')) {
                  defY -= 2.5;
                }
              }

              if (progress > 0.3) {
                const reactProgress = (progress - 0.3) / 0.7;
                if (defPlayer.coverageType === 'blitz') {
                  defY = defPlayer.initialPos.y + (75 - defPlayer.initialPos.y) * reactProgress * 0.7;
                  defX = defPlayer.initialPos.x + (50 - defPlayer.initialPos.x) * reactProgress * 0.7;
                } else if (defPlayer.coverageType === 'bracket' && defPlayer.targetOffensivePlayerId && play.players[defPlayer.targetOffensivePlayerId]) {
                  const offPos = getPlayerCurrentPosition(defPlayer.targetOffensivePlayerId);
                  // Underneath vs over-top leverage positioning
                  const isHighSafety = defPlayer.initialPos.y < 40;
                  const yOffset = isHighSafety ? -6 : -2;
                  const xOffset = isHighSafety ? 1.5 : -1.5;
                  defX = defPlayer.initialPos.x + (offPos.x + xOffset - defPlayer.initialPos.x) * reactProgress * 0.75;
                  defY = defPlayer.initialPos.y + (offPos.y + yOffset - defPlayer.initialPos.y) * reactProgress * 0.75;
                } else if (defPlayer.coverageType === 'match' && defPlayer.targetOffensivePlayerId && play.players[defPlayer.targetOffensivePlayerId]) {
                  const offPos = getPlayerCurrentPosition(defPlayer.targetOffensivePlayerId);
                  defX = defPlayer.initialPos.x + (offPos.x - defPlayer.initialPos.x) * reactProgress * 0.65;
                  defY = defPlayer.initialPos.y + (offPos.y - 3.5 - defPlayer.initialPos.y) * reactProgress * 0.65;
                } else if (defPlayer.targetOffensivePlayerId && play.players[defPlayer.targetOffensivePlayerId]) {
                  const offPos = getPlayerCurrentPosition(defPlayer.targetOffensivePlayerId);
                  defX = defPlayer.initialPos.x + (offPos.x - defPlayer.initialPos.x) * reactProgress * 0.6;
                  defY = defPlayer.initialPos.y + (offPos.y - 4 - defPlayer.initialPos.y) * reactProgress * 0.6;
                } else if (defPlayer.coverageType.includes('deep')) {
                  defY = defPlayer.initialPos.y - 4 * reactProgress; // Backpedal
                }
              }

              return (
                <g key={`def-${defPlayer.id}`} className="touch-manipulation">
                  {/* Invisible Enlarged Hit Target Area (r=5.5 for touch-friendliness) */}
                  <circle
                    cx={defX}
                    cy={defY}
                    r="5.5"
                    fill="transparent"
                    stroke="none"
                    style={{ pointerEvents: 'all' }}
                  />
                  {/* Defender Circle */}
                  <circle
                    cx={defX}
                    cy={defY}
                    r="2.4"
                    fill="#be123c"
                    stroke="#fda4af"
                    strokeWidth="0.55"
                    className="transition-all duration-75 pointer-events-none"
                  />
                  <text
                    x={defX}
                    y={defY + 0.9}
                    textAnchor="middle"
                    fontSize="1.9"
                    fontWeight="bold"
                    fill="#ffffff"
                    className="font-mono select-none pointer-events-none"
                  >
                    {defPlayer.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ================= Offensive Routes & Paths ================= */}
        {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
          const isSelected = selectedPlayerId === key;
          const isPrimary = player.route.isPrimary;
          const isBallCarrier = player.route.isBallCarrier;
          const isBlocking = player.route.isBlocking;

          // Route color logic
          let strokeColor = player.route.color || '#38bdf8';
          let markerEnd = 'url(#arrow-primary)';
          if (isBallCarrier) {
            strokeColor = '#ef4444';
            markerEnd = 'url(#arrow-runner)';
          } else if (isPrimary) {
            strokeColor = '#38bdf8';
            markerEnd = 'url(#arrow-primary)';
          } else if (player.route.isSecondary) {
            strokeColor = '#10b981';
            markerEnd = 'url(#arrow-secondary)';
          } else if (strokeColor === '#f59e0b') {
            markerEnd = 'url(#arrow-amber)';
          } else if (strokeColor === '#ec4899') {
            markerEnd = 'url(#arrow-pink)';
          } else if (strokeColor === '#a855f7') {
            markerEnd = 'url(#arrow-purple)';
          }

          const routeSvg = getRouteSvgPath(player.route.points);

          return (
            <g key={`route-group-${key}`}>
              {/* Pre-Snap Motion Path (Dashed Orange) */}
              {player.motion && (
                <g>
                  <line
                    x1={player.motion.startPos.x}
                    y1={player.motion.startPos.y}
                    x2={player.motion.endPos.x}
                    y2={player.motion.endPos.y}
                    stroke="#fb923c"
                    strokeWidth="0.75"
                    strokeDasharray="1.5,1.5"
                    markerEnd="url(#arrow-motion)"
                  />
                  <circle
                    cx={player.motion.startPos.x}
                    cy={player.motion.startPos.y}
                    r="1.4"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="0.5"
                    strokeDasharray="1,1"
                  />
                  {showLabels && (
                    <text
                      x={(player.motion.startPos.x + player.motion.endPos.x) / 2}
                      y={(player.motion.startPos.y + player.motion.endPos.y) / 2 - 1.5}
                      textAnchor="middle"
                      fontSize="1.7"
                      fontWeight="bold"
                      fill="#fb923c"
                      className="font-mono"
                    >
                      MOTION
                    </text>
                  )}
                </g>
              )}

              {/* Full Route Line (If enabled or selected) */}
              {(showFullRoutes || isSelected) && (
                <g>
                  {/* Outer glow on selected/primary */}
                  {(isSelected || isPrimary || isBallCarrier) && (
                    <path
                      d={routeSvg}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Route Vector Path */}
                  <path
                    d={routeSvg}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isBallCarrier ? '1.2' : (isBlocking ? '0.7' : (isSelected ? '1.1' : '0.85'))}
                    strokeDasharray={player.route.isFake ? '2,1.5' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={isBlocking ? undefined : markerEnd}
                    opacity={selectedPlayerId && !isSelected ? 0.35 : 0.95}
                  />

                  {/* Blocking T-Bar Cap for blocking assignments */}
                  {isBlocking && player.route.points.length >= 2 && (
                    (() => {
                      const lastPt = player.route.points[player.route.points.length - 1];
                      const prevPt = player.route.points[player.route.points.length - 2];
                      const dx = lastPt.x - prevPt.x;
                      const dy = lastPt.y - prevPt.y;
                      const angle = Math.atan2(dy, dx);
                      const perpAngle = angle + Math.PI / 2;
                      const barLen = 1.8;
                      return (
                        <line
                          x1={lastPt.x - Math.cos(perpAngle) * barLen}
                          y1={lastPt.y - Math.sin(perpAngle) * barLen}
                          x2={lastPt.x + Math.cos(perpAngle) * barLen}
                          y2={lastPt.y + Math.sin(perpAngle) * barLen}
                          stroke={strokeColor}
                          strokeWidth="1.1"
                          strokeLinecap="square"
                        />
                      );
                    })()
                  )}

                  {/* Route Number / Concept Label at break/target point */}
                  {showLabels && player.route.routeNumber !== undefined && (
                    (() => {
                      const targetPt = player.route.points[player.route.points.length - 1];
                      return (
                        <g>
                          <rect
                            x={targetPt.x - 2.8}
                            y={targetPt.y - 3.8}
                            width="5.6"
                            height="3.2"
                            rx="1"
                            fill="#0f172a"
                            stroke={strokeColor}
                            strokeWidth="0.4"
                            opacity="0.9"
                          />
                          <text
                            x={targetPt.x}
                            y={targetPt.y - 1.6}
                            textAnchor="middle"
                            fontSize="2"
                            fontWeight="bold"
                            fill="#ffffff"
                            className="font-mono"
                          >
                            {player.route.routeNumber}
                          </text>
                        </g>
                      );
                    })()
                  )}

                  {/* Plant & Cut Kinetic Indicators (Visual #4) */}
                  {player.route.points.map((pt, pIdx) => {
                    if (pt.type !== 'break') return null;
                    return (
                      <g key={`cut-ind-${pIdx}`} className="pointer-events-none">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="2.8"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="0.6"
                          strokeDasharray="1.5,1.5"
                          className="animate-ping"
                          opacity="0.8"
                        />
                        <polygon
                          points={`${pt.x},${pt.y - 1.2} ${pt.x + 1.2},${pt.y} ${pt.x},${pt.y + 1.2} ${pt.x - 1.2},${pt.y}`}
                          fill="#facc15"
                          stroke="#0f172a"
                          strokeWidth="0.3"
                        />
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* ================= 3D Parabolic Ball Flight & Physics Arc (Visual #1) ================= */}
        {isPlaying && progress > 0.04 && (
          <g id="parabolic-ball-flight" className="pointer-events-none select-none">
            {/* Ground Shadow on Field Grass */}
            <ellipse
              cx={ballPos.x}
              cy={ballPos.y + (progress >= 0.45 && progress <= 0.85 ? Math.sin(((progress - 0.45) / 0.4) * Math.PI) * 9 : 0.8)}
              rx={1.5}
              ry={0.7}
              fill="rgba(0,0,0,0.42)"
            />

            {/* Elevated 3D Football with Parabolic Scale & Spin */}
            <g
              transform={`translate(${ballPos.x}, ${ballPos.y}) scale(${
                progress >= 0.45 && progress <= 0.85
                  ? 1.0 + Math.sin(((progress - 0.45) / 0.4) * Math.PI) * 0.7
                  : 1.0
              })`}
            >
              {/* Spiral Golden Glow Trail in Flight */}
              {progress >= 0.48 && progress <= 0.82 && (
                <circle
                  r="2.8"
                  fill="rgba(250, 204, 21, 0.2)"
                  className="animate-ping"
                />
              )}

              {/* Collegiate Pro Leather Ball Body */}
              <ellipse
                cx="0"
                cy="0"
                rx="1.5"
                ry="0.9"
                fill="#78350f"
                stroke="#fef3c7"
                strokeWidth="0.25"
                transform={`rotate(${(progress * 720) % 360} 0 0)`}
              />
              {/* White Laces */}
              <line x1="-0.6" y1="0" x2="0.6" y2="0" stroke="#ffffff" strokeWidth="0.25" />
              <line x1="-0.3" y1="-0.25" x2="-0.3" y2="0.25" stroke="#ffffff" strokeWidth="0.2" />
              <line x1="0" y1="-0.25" x2="0" y2="0.25" stroke="#ffffff" strokeWidth="0.2" />
              <line x1="0.3" y1="-0.25" x2="0.3" y2="0.25" stroke="#ffffff" strokeWidth="0.2" />
            </g>
          </g>
        )}

        {/* ================= Measurement Caliper Laser Overlay (Visual #9) ================= */}
        {isCaliperActive && caliperPoints.length > 0 && (
          <g id="caliper-laser-overlay" className="pointer-events-none select-none">
            {caliperPoints.map((pt, idx) => (
              <g key={`caliper-pt-${idx}`}>
                <circle cx={pt.x} cy={pt.y} r="1.6" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.4" />
                <circle cx={pt.x} cy={pt.y} r="3.2" fill="none" stroke="#06b6d4" strokeWidth="0.4" className="animate-ping" />
                <text x={pt.x} y={pt.y - 2.5} fontSize="1.8" fontWeight="bold" fill="#06b6d4" textAnchor="middle">
                  {idx === 0 ? 'POINT A' : 'POINT B'}
                </text>
              </g>
            ))}
            {caliperPoints.length === 2 && (
              <line
                x1={caliperPoints[0].x}
                y1={caliperPoints[0].y}
                x2={caliperPoints[1].x}
                y2={caliperPoints[1].y}
                stroke="#06b6d4"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
            )}
          </g>
        )}

        {/* ================= Coaching Highlights (When Video Overlay Active) ================= */}
        {isCoachingOverlayOpen && showCoachingFieldHighlights && activeConcept.fieldHighlightZones && (
          <g className="animate-in fade-in duration-300">
            {activeConcept.fieldHighlightZones.map((zone, idx) => {
              const isConflict = zone.type === 'conflict_zone';
              const isRead = zone.type === 'read_window';
              const ringColor = isConflict ? '#ef4444' : isRead ? '#22c55e' : '#38bdf8';
              const fillBg = isConflict ? 'rgba(239, 68, 68, 0.15)' : isRead ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';

              return (
                <g key={`coaching-zone-${idx}`}>
                  {/* Outer Pulsing Zone Ring */}
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={zone.radius}
                    fill={fillBg}
                    stroke={ringColor}
                    strokeWidth="0.6"
                    strokeDasharray={isConflict ? '2,2' : '3,2'}
                  />
                  {/* Center Dot Landmark */}
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r="1.2"
                    fill={ringColor}
                  />
                  {/* Zone Label Badge */}
                  <g>
                    <rect
                      x={zone.x - 12}
                      y={zone.y + zone.radius + 1.2}
                      width="24"
                      height="3.6"
                      rx="1"
                      fill="#0f172a"
                      stroke={ringColor}
                      strokeWidth="0.3"
                      opacity="0.95"
                    />
                    <text
                      x={zone.x}
                      y={zone.y + zone.radius + 3.8}
                      textAnchor="middle"
                      fontSize="1.6"
                      fontWeight="bold"
                      fill={ringColor}
                      className="font-sans pointer-events-none select-none"
                    >
                      {zone.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* ================= Player Motion Ghosting Trails ================= */}
        {showGhostTrails && isPlaying && progress > 0.06 && (
          <g id="motion-ghost-trails" className="pointer-events-none">
            {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
              if (key === 'C') return null;
              const cur = getPlayerCurrentPosition(key);
              const t1 = {
                x: cur.x + (player.initialPos.x - cur.x) * 0.22,
                y: cur.y + (player.initialPos.y - cur.y) * 0.22,
              };
              const t2 = {
                x: cur.x + (player.initialPos.x - cur.x) * 0.44,
                y: cur.y + (player.initialPos.y - cur.y) * 0.44,
              };

              return (
                <g key={`ghost-trail-${key}`}>
                  <circle
                    cx={t1.x}
                    cy={t1.y}
                    r="2.2"
                    fill={teamBranding?.primaryJerseyColor || '#38bdf8'}
                    opacity="0.35"
                  />
                  <circle
                    cx={t2.x}
                    cy={t2.y}
                    r="1.6"
                    fill={teamBranding?.secondaryJerseyColor || '#94a3b8'}
                    opacity="0.2"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ================= Drill Field Cones & Agility Markers ================= */}
        {showDrillCones && play.drillData?.cones && play.drillData.cones.length > 0 && (
          <g id="drill-field-cones-layer" className="pointer-events-none select-none">
            {play.drillData.cones.map((cone: DrillCone) => {
              const coneColor = cone.color || '#f97316';
              const isShield = cone.type === 'shield';

              return (
                <g key={cone.id} id={`drill-cone-${cone.id}`} className="transition-all">
                  {isShield ? (
                    // Contact / Shield Dummy marker
                    <g transform={`translate(${cone.x}, ${cone.y})`}>
                      <ellipse cx="0" cy="1.6" rx="2.4" ry="1.0" fill="rgba(0,0,0,0.4)" />
                      <rect
                        x="-2.2"
                        y="-3.4"
                        width="4.4"
                        height="4.6"
                        rx="1.2"
                        fill={coneColor}
                        stroke="#991b1b"
                        strokeWidth="0.4"
                      />
                      <path
                        d="M -1.2 -1.8 L 1.2 -1.8 M 0 -2.6 L 0 -0.8"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                      />
                      <g transform="translate(0, 3.2)">
                        <rect
                          x={-Math.max(10, cone.label.length * 1.0) / 2}
                          y="-1.6"
                          width={Math.max(10, cone.label.length * 1.0)}
                          height="2.5"
                          rx="0.8"
                          fill="rgba(15, 23, 42, 0.9)"
                          stroke="#ef4444"
                          strokeWidth="0.3"
                        />
                        <text
                          x="0"
                          y="0.1"
                          textAnchor="middle"
                          fontSize="1.5"
                          fontWeight="bold"
                          fill="#fecaca"
                        >
                          {cone.label}
                        </text>
                      </g>
                    </g>
                  ) : (
                    // Athletic Agility Pylon / Field Cone
                    <g transform={`translate(${cone.x}, ${cone.y})`}>
                      {/* Ground drop shadow */}
                      <ellipse cx="0" cy="1.2" rx="2.5" ry="0.8" fill="rgba(0,0,0,0.45)" />
                      {/* Square Cone Base Plate */}
                      <path d="M -2.2 0.7 L 2.2 0.7 L 1.7 1.4 L -1.7 1.4 Z" fill="#c2410c" />
                      {/* Cone Body (Pylon Cone) */}
                      <polygon
                        points="0,-4.2 -2.0,0.7 2.0,0.7"
                        fill={coneColor}
                        stroke="#9a3412"
                        strokeWidth="0.3"
                      />
                      {/* Reflective White Collar Stripe */}
                      <polygon
                        points="0,-2.2 -1.1,-0.3 1.1,-0.3"
                        fill="#ffffff"
                        opacity="0.85"
                      />
                      {/* Top Tip */}
                      <circle cx="0" cy="-4.2" r="0.4" fill="#ffedd5" />
                      {/* Cone Yardage / Step Label Pill */}
                      <g transform="translate(0, 3.8)">
                        <rect
                          x={-Math.max(12, cone.label.length * 1.05) / 2}
                          y="-1.8"
                          width={Math.max(12, cone.label.length * 1.05)}
                          height="2.8"
                          rx="1.0"
                          fill="rgba(15, 23, 42, 0.88)"
                          stroke={coneColor}
                          strokeWidth="0.3"
                        />
                        <text
                          x="0"
                          y="0.1"
                          textAnchor="middle"
                          fontSize="1.6"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {cone.label}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ================= Offensive Player Tokens ================= */}
        {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
          const currentPos = getPlayerCurrentPosition(key);
          const isSelected = selectedPlayerId === key;
          const isPrimary = player.route.isPrimary;
          const isBallCarrier = player.route.isBallCarrier;

          // Lookup assigned player from roster
          const rosterPlayer = getPlayerAssignedToSlot(key, roster);
          const jerseyNum = rosterPlayer ? rosterPlayer.jerseyNumber : null;

          // Determine token text based on tokenDisplayMode and roster assignment
          let tokenMainText = key;
          let isJerseyRendered = false;

          if (tokenDisplayMode === 'jersey' && jerseyNum) {
            tokenMainText = `${jerseyNum}`;
            isJerseyRendered = true;
          } else if (tokenDisplayMode === 'both' && jerseyNum) {
            tokenMainText = `${jerseyNum}`;
            isJerseyRendered = true;
          } else if (tokenDisplayMode === 'name' && rosterPlayer) {
            const lastName = rosterPlayer.name.split(' ').pop() || rosterPlayer.name;
            tokenMainText = lastName.slice(0, 4).toUpperCase();
          } else if (jerseyNum) {
            // Default: if jersey number exists, show key or jersey based on mode
            tokenMainText = key;
          }

          // Subtitle / Tooltip text
          let subLabelText = player.label.split(' ')[0];
          if (rosterPlayer) {
            const lastName = rosterPlayer.name.split(' ').pop() || rosterPlayer.name;
            if (tokenDisplayMode === 'jersey' || tokenDisplayMode === 'both') {
              subLabelText = `${lastName} (${key})`;
            } else if (tokenDisplayMode === 'position') {
              subLabelText = `#${rosterPlayer.jerseyNumber} ${lastName}`;
            } else {
              subLabelText = `#${rosterPlayer.jerseyNumber} ${key}`;
            }
          }

          // Color token based on position or custom player avatar color
          let tokenBg = rosterPlayer?.avatarColor || '#1e293b';
          let tokenBorder = '#94a3b8';
          let textColor = teamBranding?.numberTextColor || '#ffffff';

          if (key === 'QB') {
            tokenBg = rosterPlayer?.avatarColor || '#dc2626'; // Red for QB
            tokenBorder = '#fca5a5';
          } else if (key === 'C') {
            tokenBg = rosterPlayer?.avatarColor || '#475569'; // Slate for Center
            tokenBorder = '#cbd5e1';
          } else if (isBallCarrier) {
            tokenBg = '#ea580c'; // Orange for carrier
            tokenBorder = '#fdba74';
          } else if (isPrimary) {
            tokenBg = rosterPlayer?.avatarColor || '#0284c7'; // Sky for Primary
            tokenBorder = '#7dd3fc';
          } else if (player.route.isSecondary) {
            tokenBg = rosterPlayer?.avatarColor || '#059669'; // Emerald for Secondary
            tokenBorder = '#6ee7b7';
          } else if (key.includes('RB') || key.includes('HB')) {
            tokenBg = rosterPlayer?.avatarColor || '#7c3aed'; // Purple for Backs
            tokenBorder = '#c4b5fd';
          } else {
            tokenBg = rosterPlayer?.avatarColor || teamBranding?.primaryJerseyColor || '#0f172a';
            tokenBorder = teamBranding?.secondaryJerseyColor || '#38bdf8';
          }

          if (isSelected) {
            tokenBorder = '#facc15'; // Bright yellow border on selected
          }

          return (
            <g
              key={`player-token-${key}`}
              className="cursor-pointer group touch-manipulation"
              onClick={() => onSelectPlayer?.(isSelected ? null : key)}
              role="button"
              tabIndex={0}
              aria-label={`Select player ${key}`}
            >
              {/* Invisible Enlarged Touch Hit Target Area (r=6.5 in 100x100 space, giving 48px+ touch hit box) */}
              <circle
                cx={currentPos.x}
                cy={currentPos.y}
                r="6.5"
                fill="transparent"
                stroke="none"
                style={{ pointerEvents: 'all' }}
                className="cursor-pointer"
              />

              {/* Highlight Aura if Selected or Primary */}
              {(isSelected || isPrimary || isBallCarrier) && (
                <circle
                  cx={currentPos.x}
                  cy={currentPos.y}
                  r="4.4"
                  fill={isSelected ? '#facc15' : (isBallCarrier ? '#ef4444' : '#38bdf8')}
                  opacity="0.3"
                  className="animate-pulse pointer-events-none"
                />
              )}

              {/* Player Token Circle */}
              <circle
                cx={currentPos.x}
                cy={currentPos.y}
                r="2.8"
                fill={tokenBg}
                stroke={tokenBorder}
                strokeWidth={isSelected ? '0.9' : '0.6'}
                className="transition-all duration-75 group-hover:scale-110 group-active:scale-95 pointer-events-none"
              />

              {/* Player Position / Jersey # Label Text */}
              <text
                x={currentPos.x}
                y={currentPos.y + (tokenMainText.length > 2 ? 0.7 : 0.95)}
                textAnchor="middle"
                fontSize={tokenMainText.length > 2 ? '1.6' : '2.0'}
                fontWeight="900"
                fill={textColor}
                className="font-mono pointer-events-none select-none tracking-tighter"
              >
                {tokenMainText}
              </text>

              {/* Small '#' badge indicator in top right if jersey number is shown */}
              {isJerseyRendered && (
                <text
                  x={currentPos.x + 2.2}
                  y={currentPos.y - 1.5}
                  textAnchor="middle"
                  fontSize="1.1"
                  fontWeight="800"
                  fill="#facc15"
                  className="font-mono pointer-events-none select-none"
                >
                  #
                </text>
              )}

              {/* Tag tooltip label below player if active */}
              {showLabels && (
                <text
                  x={currentPos.x}
                  y={currentPos.y + 5.1}
                  textAnchor="middle"
                  fontSize="1.55"
                  fontWeight="700"
                  fill="#f8fafc"
                  className="font-sans pointer-events-none select-none drop-shadow"
                >
                  {subLabelText}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Field HUD Overlay: Formation info & strength */}
      {onOpenFormationGallery ? (
        <button
          id="fieldboard-formation-hud-btn"
          onClick={onOpenFormationGallery}
          title={`Formation: ${play.formationName} (${play.playType}) - Click to open Formation Gallery`}
          className="absolute top-3 left-3 bg-slate-900/90 hover:bg-slate-800/95 active:scale-95 backdrop-blur-md border border-slate-700/70 hover:border-cyan-500/60 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 z-20 transition-all cursor-pointer group text-left touch-manipulation"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs sm:text-sm flex items-center">
            <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{play.formationName}</span>
            <span className="mx-1.5 text-slate-500">•</span>
            <span className="text-amber-400 font-mono font-bold">{play.playType}</span>
          </div>
        </button>
      ) : (
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3.5 py-2 shadow-xl flex items-center gap-2.5 pointer-events-none z-20">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-slate-100">{play.formationName}</span>
            <span className="mx-1.5 text-slate-500">•</span>
            <span className="text-amber-400 font-mono font-bold">{play.playType}</span>
          </div>
        </div>
      )}

      {/* Fullscreen, Whiteboard, Roster, Scale & Coaching Mode Toggle Buttons (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        {/* Scale Selector Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-1 shadow-lg flex items-center text-[11px] font-mono font-bold touch-manipulation">
          <button
            onClick={() => setScale('1.0x')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg transition-all cursor-pointer touch-manipulation active:scale-95 ${
              currentScale === '1.0x'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard Board View (1.0x)"
          >
            1.0x
          </button>
          <button
            onClick={() => setScale('1.5x')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg transition-all cursor-pointer touch-manipulation active:scale-95 ${
              currentScale === '1.5x'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Enlarged Tactical Board View (1.5x - Active Default)"
          >
            1.5x
          </button>
          <button
            onClick={() => setScale('theater')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg transition-all cursor-pointer hidden md:inline-flex items-center gap-1 touch-manipulation active:scale-95 ${
              currentScale === 'theater'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Stadium Theater View (Maximum Stage)"
          >
            <Expand className="w-3 h-3" />
            <span>Theater</span>
          </button>
        </div>

        {/* 3D Perspective Toggle Button */}
        <button
          id="fieldboard-3d-toggle-btn"
          onClick={() => setIs3DAngle(!is3DAngle)}
          title={is3DAngle ? 'Switch to Top-Down 2D View' : 'Switch to 2.5D Stadium Perspective Angle'}
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            is3DAngle
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">3D</span>
        </button>

        {/* 5-Yard Spacing Grid Overlay Toggle Button */}
        {onToggleFieldGrid && (
          <button
            id="fieldboard-grid-toggle-btn"
            onClick={onToggleFieldGrid}
            title={showFieldGrid ? 'Hide 5-Yard Hashmark Field Grid' : 'Show 5-Yard Hashmark Field Grid for precise spacing'}
            className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
              showFieldGrid
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-950/40'
                : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        )}

        {/* Heatmap Overlay Toggle Button */}
        <button
          id="fieldboard-heatmap-toggle-btn"
          onClick={() => setShowHeatmap(!showHeatmap)}
          title="Toggle Target Route Heatmap Density Overlay"
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            showHeatmap
              ? 'bg-amber-600 text-white border-amber-400 shadow-amber-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Heatmap</span>
        </button>

        {/* Audible / Cadence Trigger Button */}
        <button
          id="fieldboard-audible-toggle-btn"
          onClick={() => setAudibleActive(!audibleActive)}
          title="Call Live Audible at the Line of Scrimmage"
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            audibleActive
              ? 'bg-rose-600 text-white border-rose-400 shadow-rose-950/40 animate-pulse'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Audible</span>
        </button>

        {/* QB Vision Cone & Progression Read Toggle (Functional #1) */}
        <button
          id="fieldboard-vision-cone-btn"
          onClick={() => setShowVisionCone(!showVisionCone)}
          title={showVisionCone ? 'Hide QB Vision Cone & Read Progression' : 'Show QB Vision Cone & Read Progression'}
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            showVisionCone
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Vision</span>
        </button>

        {/* Adaptive AI Defense Auto-Shade (Functional #2) */}
        <button
          id="fieldboard-adaptive-ai-btn"
          onClick={() => setIsAdaptiveDefenseActive(!isAdaptiveDefenseActive)}
          title={isAdaptiveDefenseActive ? 'Disable Adaptive Defense AI Auto-Shade' : 'Enable Adaptive Defensive AI Auto-Shade'}
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            isAdaptiveDefenseActive
              ? 'bg-purple-600 text-white border-purple-400 shadow-purple-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Auto-Shade</span>
        </button>

        {/* Weather & Turf Conditions Engine (Visual #3) */}
        <button
          id="fieldboard-weather-btn"
          onClick={() => {
            const next = weather === 'clear' ? 'dome' : weather === 'dome' ? 'snow' : weather === 'snow' ? 'rain' : 'clear';
            setWeather(next);
          }}
          title={`Weather: ${weather.toUpperCase()} - Click to cycle (Clear / Dome / Snow / Rain)`}
          className="backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60 shadow-slate-950/40 cursor-pointer touch-manipulation"
        >
          {weather === 'snow' ? (
            <CloudSnow className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
          ) : weather === 'rain' ? (
            <CloudRain className="w-3.5 h-3.5 text-blue-300" />
          ) : weather === 'dome' ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline capitalize">{weather}</span>
        </button>

        {/* Live Telestrator Chalk Tool (Functional #8) */}
        <button
          id="fieldboard-telestrator-btn"
          onClick={() => setIsTelestratorActive(!isTelestratorActive)}
          title={isTelestratorActive ? 'Close Live Telestrator' : 'Open Live Coach Telestrator & Freehand Chalk'}
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            isTelestratorActive
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-amber-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-amber-400 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telestrator</span>
        </button>

        {/* Tactical Caliper & Split Ruler (Visual #9) */}
        <button
          id="fieldboard-caliper-btn"
          onClick={() => {
            setIsCaliperActive(!isCaliperActive);
            if (isCaliperActive) setCaliperPoints([]);
          }}
          title={isCaliperActive ? 'Close Caliper Ruler' : 'Measure Exact Receiver Splits & Depth with Caliper'}
          className={`backdrop-blur-md min-h-[36px] px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            isCaliperActive
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-950/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-cyan-300 hover:text-white border-slate-700/60 shadow-slate-950/40'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Caliper</span>
        </button>

        {onToggleCoachingOverlay && (
          <button
            id="fieldboard-coaching-tips-btn"
            onClick={() => onToggleCoachingOverlay(!isCoachingOverlayOpen)}
            title="Toggle Video Tutorial HUD & Coaching Tips Overlay on Field"
            className={`backdrop-blur-md min-h-[36px] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
              isCoachingOverlayOpen
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-950/40'
                : 'bg-slate-900/85 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/50 shadow-slate-950/40'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tips HUD</span>
            {isCoachingOverlayOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
        )}

        {onOpenRoster && (
          <button
            id="fieldboard-open-roster-btn"
            onClick={onOpenRoster}
            title="Open Roster & Jersey Numbers Management"
            className="backdrop-blur-md min-h-[36px] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border bg-blue-600/90 hover:bg-blue-600 text-white border-blue-400/50 shadow-blue-950/40 cursor-pointer touch-manipulation"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Roster (#{tokenDisplayMode.toUpperCase()})</span>
          </button>
        )}

        {onOpenWhiteboard && (
          <button
            id="fieldboard-draw-whiteboard-btn"
            onClick={onOpenWhiteboard}
            title="Draw Play on Tactical Whiteboard (Tablet / Touch Pen Mode)"
            className="backdrop-blur-md min-h-[36px] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-950/40 cursor-pointer touch-manipulation"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Whiteboard</span>
          </button>
        )}

        <button
          id="fieldboard-fullscreen-toggle-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Full Screen (ESC)' : 'Full Screen'}
          className={`backdrop-blur-md min-h-[36px] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 border cursor-pointer touch-manipulation ${
            isFullscreen
              ? 'bg-red-600/90 hover:bg-red-600 text-white border-red-400/50 shadow-red-600/30'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/60 hover:border-slate-500 shadow-slate-950/40'
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Full Screen (ESC)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Screen</span>
            </>
          )}
        </button>
      </div>

      {/* Floating QB Drop / Release Stopwatch Overlay */}
      {(isPlaying || progress > 0) && (
        <div className="absolute top-14 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-2.5 py-1 shadow-lg flex items-center gap-1.5 text-xs font-mono font-bold z-20 pointer-events-none">
          <Timer className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="text-slate-400 text-[10px]">QB TIME:</span>
          <span
            className={`${
              progress * 3.5 <= 2.2
                ? 'text-emerald-400'
                : progress * 3.5 <= 3.0
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {(progress * 3.5).toFixed(1)}s
          </span>
        </div>
      )}

      {/* Audible Alert Banner */}
      {audibleActive && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-rose-600/95 backdrop-blur-md border border-rose-300/80 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2 text-white font-mono font-bold text-xs animate-bounce z-30">
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>AUDIBLE CALLED: &quot;KILL! KILL! CHECK SLANT!&quot;</span>
          <button
            onClick={() => setAudibleActive(false)}
            className="ml-2 text-rose-200 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Player Detail Badge (Bottom Center) */}
      {selectedPlayerId && play.players[selectedPlayerId] && (
        (() => {
          const selPlayer = play.players[selectedPlayerId];
          const assignedRosterPlayer = getPlayerAssignedToSlot(selectedPlayerId, roster);

          return (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-amber-500/50 rounded-xl px-4 py-2 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in zoom-in-95 duration-150 z-20">
              <div
                className="w-7 h-7 rounded-lg text-white font-mono font-black flex items-center justify-center shadow-xs"
                style={{ backgroundColor: assignedRosterPlayer?.avatarColor || '#ea580c' }}
              >
                {assignedRosterPlayer ? `#${assignedRosterPlayer.jerseyNumber}` : selectedPlayerId}
              </div>
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="text-amber-300 font-extrabold">
                    {assignedRosterPlayer && !SAMPLE_ATHLETE_NAMES.includes(assignedRosterPlayer.name)
                      ? assignedRosterPlayer.name
                      : (selPlayer.positionName || selPlayer.label)}
                  </span>
                  <span>({selPlayer.label})</span>
                  {assignedRosterPlayer && !SAMPLE_ATHLETE_NAMES.includes(assignedRosterPlayer.name) && (
                    <span className="text-slate-400 text-[11px] font-normal">
                      {selPlayer.positionName}
                    </span>
                  )}
                </div>
                <div className="text-sky-400 font-medium font-mono text-[11px]">
                  Route: {selPlayer.route.name}
                  {selPlayer.route.routeNumber !== undefined && ` [Route #${selPlayer.route.routeNumber}]`}
                </div>
              </div>
              <button
                onClick={() => onSelectPlayer?.(null)}
                className="ml-2 text-slate-400 hover:text-slate-200 text-xs underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          );
        })()
      )}

      {/* ================= Drill Repeat Training Bar & Auto-Loop HUD ================= */}
      {drillTrainingState && (
        <div
          id="fieldboard-drill-training-bar"
          className="absolute top-14 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-2xl bg-slate-950/95 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl p-3 shadow-2xl z-30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Drill Title & Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Repeat
                  className={`w-3 h-3 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '6s' }}
                />
                Drill Reps
              </span>
              <h4
                className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs"
                title={drillTrainingState.drillName}
              >
                {drillTrainingState.drillName}
              </h4>
            </div>

            {/* Action Buttons: Exit & Cones */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onToggleShowDrillCones && (
                <button
                  onClick={onToggleShowDrillCones}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    showDrillCones
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Agility Cones on Field"
                >
                  <span>Cones</span>
                  <span className="text-[10px]">{showDrillCones ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {onExitDrillTraining && (
                <button
                  onClick={onExitDrillTraining}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Exit Drill and return to Playbook"
                >
                  <span>✕ Exit Drill</span>
                </button>
              )}
            </div>
          </div>

          {/* Drill Rep Controls & Auto-Loop Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Rep Stepper Counter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 font-bold">REPS:</span>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden p-0.5">
                <button
                  onClick={onDecrementDrillRep}
                  disabled={drillTrainingState.currentRep <= 1}
                  className="px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Previous Rep"
                >
                  -
                </button>
                <div className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 font-mono font-black text-xs min-w-[56px] text-center border-x border-slate-800">
                  {drillTrainingState.currentRep} /{' '}
                  {drillTrainingState.targetReps > 0 ? drillTrainingState.targetReps : '∞'}
                </div>
                <button
                  onClick={onIncrementDrillRep}
                  className="px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  title="Next Rep"
                >
                  +
                </button>
              </div>

              {/* Rep Dots preview */}
              {drillTrainingState.targetReps > 0 && drillTrainingState.targetReps <= 12 && (
                <div className="hidden sm:flex items-center gap-1 ml-1">
                  {Array.from({ length: drillTrainingState.targetReps }).map((_, idx) => (
                    <div
                      key={`rep-dot-${idx}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx < drillTrainingState.currentRep
                          ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              )}

              {onResetDrillReps && (
                <button
                  onClick={onResetDrillReps}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                  title="Reset Reps to 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Auto-Loop Toggle and Cadence selector */}
            <div className="flex items-center gap-2">
              {onToggleDrillAutoLoop && (
                <button
                  onClick={onToggleDrillAutoLoop}
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    drillTrainingState.isAutoLoop
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30 ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Repeat
                    className={`w-3.5 h-3.5 ${drillTrainingState.isAutoLoop && isPlaying ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '4s' }}
                  />
                  <span>Auto-Loop: {drillTrainingState.isAutoLoop ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Cadence Delay quick picker */}
              {onChangeDrillCadenceDelay && (
                <select
                  value={drillTrainingState.cadenceDelayMs}
                  onChange={(e) => onChangeDrillCadenceDelay(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 rounded-lg px-2 py-1 outline-hidden cursor-pointer"
                  title="Cadence reset delay between reps"
                >
                  <option value={500}>Cadence: 0.5s</option>
                  <option value={1000}>Cadence: 1.0s</option>
                  <option value={1500}>Cadence: 1.5s</option>
                  <option value={2000}>Cadence: 2.0s</option>
                </select>
              )}
            </div>
          </div>

          {/* Coaching Key Ticker */}
          {drillTrainingState.coachingCue && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl px-2.5 py-1 flex items-center gap-1.5 leading-snug">
              <span className="font-mono font-bold text-amber-400 uppercase text-[10px] shrink-0">
                Key:
              </span>
              <span className="truncate">{drillTrainingState.coachingCue}</span>
            </div>
          )}
        </div>
      )}

      {/* Auto-Loop Resetting Cadence Alert Banner */}
      {drillTrainingState?.isResettingRep && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-slate-950/95 border-2 border-emerald-400 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-3 text-emerald-300 font-mono font-bold text-xs z-30 animate-pulse pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>RESETTING TO LOS... &quot;DOWN, SET, HUT!&quot;</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            Starting Rep {drillTrainingState.currentRep}{' '}
            {drillTrainingState.targetReps > 0 ? `of ${drillTrainingState.targetReps}` : ''}
          </span>
        </div>
      )}

      {/* Target Reps Completed Banner */}
      {drillTrainingState &&
        drillTrainingState.targetReps > 0 &&
        drillTrainingState.currentRep >= drillTrainingState.targetReps &&
        progress >= 0.98 &&
        !isPlaying &&
        !drillTrainingState.isResettingRep && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-slate-950/95 border-2 border-amber-400 rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-2.5 z-30 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>
                DRILL SET COMPLETED ({drillTrainingState.targetReps} / {drillTrainingState.targetReps}{' '}
                REPS)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 text-center max-w-sm">
              Target repetitions achieved! Run another repeat block or continue looping.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  onResetDrillReps?.();
                  if (onTogglePlay) onTogglePlay();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Repeat Drill (+{drillTrainingState.targetReps} Reps)</span>
              </button>
              <button
                onClick={() => onChangeDrillTargetReps?.(0)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700"
              >
                <span>Infinite Loop (∞)</span>
              </button>
            </div>
          </div>
      )}

      {/* ================= Floating Coaching Video Tutorial Overlay (HUD) ================= */}
      {isCoachingOverlayOpen && (
        <CoachingVideoOverlay
          concept={activeConcept}
          allAvailableConcepts={matchedConcepts.length > 0 ? matchedConcepts : ROUTE_CONCEPTS_DATABASE}
          onSelectConcept={(c) => onSelectRouteConceptId?.(c.id)}
          onOpenFullModal={() => onOpenCoachingModal?.()}
          onClose={() => onToggleCoachingOverlay?.(false)}
          showFieldHighlights={showCoachingFieldHighlights}
          onToggleFieldHighlights={(val) => setShowCoachingFieldHighlights(val)}
        />
      )}

      {/* ================= Live On-Field Active Coaching Cue Pill ================= */}
      {activeCoachingCue && (
        <div
          id="field-active-coaching-cue-hud"
          className="absolute bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 z-25 max-w-[92%] sm:max-w-md bg-slate-950/90 border border-blue-400/80 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-start gap-3 pointer-events-auto"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping shrink-0 mt-1" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-black text-amber-300">
                {activeCoachingCue.timeSeconds.toFixed(1)}s
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-200 border border-blue-700/60">
                {activeCoachingCue.phaseLabel || 'CUE'}
              </span>
              {activeCoachingCue.targetPlayerId && activeCoachingCue.targetPlayerId !== 'ALL' && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Target: {activeCoachingCue.targetPlayerId}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-white leading-tight mt-0.5 truncate">
              {activeCoachingCue.title}
            </div>
            <div className="text-[11px] text-slate-300 font-sans line-clamp-1 mt-0.5">
              {activeCoachingCue.description}
            </div>
          </div>
        </div>
      )}

      {/* Live Coach Telestrator Canvas (Functional #8) */}
      <TelestratorCanvas
        isActive={isTelestratorActive}
        onClose={() => setIsTelestratorActive(false)}
      />

      {/* Tactical Caliper & Receiver Split Measurement Ruler (Visual #9) */}
      <MeasurementCaliper
        isActive={isCaliperActive}
        points={caliperPoints}
        onClear={() => setCaliperPoints([])}
        onClose={() => {
          setIsCaliperActive(false);
          setCaliperPoints([]);
        }}
      />

    </div>
  );

  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        id="tactical-field-board-fullscreen"
        className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/98 backdrop-blur-md p-3 sm:p-5 flex flex-col justify-between items-center select-none overflow-hidden"
      >
        {/* Fullscreen Top Header Info Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {play.category}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {play.code}
            </h3>
            <span className="hidden md:inline text-xs text-slate-400 truncate max-w-md">
              {play.englishName}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 text-xs font-semibold shadow-lg transition-all"
          >
            <Minimize2 className="w-4 h-4 text-rose-400" />
            <span>Close (ESC)</span>
          </button>
        </div>

        {/* Center SVG Board in Fullscreen */}
        <div className="flex-1 w-full flex items-center justify-center my-auto min-h-0">
          {fieldBoardContent}
        </div>

        {/* Fullscreen Floating Playback Bar */}
        <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 sm:gap-4 mt-2">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              title={isPlaying ? 'Durdur (Pause)' : 'Oynat (Play)'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
          )}

          {onSeek && (
            <button
              onClick={() => onSeek(0)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Timeline slider in fullscreen */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400 hidden sm:inline">Timeline</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onChange={(e) => onSeek?.(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-xs font-mono font-bold text-emerald-400 min-w-[3rem] text-right">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} id="tactical-field-board" className="relative w-full">
      {fieldBoardContent}
    </div>
  );
};
