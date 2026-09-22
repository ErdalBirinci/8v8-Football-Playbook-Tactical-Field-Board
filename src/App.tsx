import React, { useState, useEffect, useRef } from 'react';
import { Play, DefenseScheme, RosterPlayer, TokenDisplayMode, DrillTrainingSession, TimestampedCoachingCue } from './types';
import { ALL_PLAYBOOK_PLAYS, getPlayById } from './data/allPlays';
import { DEFENSE_SCHEMES } from './data/defenseSchemes';
import { createPlayFromDrill } from './data/drillPlayGenerator';
import { PracticeDrill } from './data/drillDatabase';
import {
  loadRosterFromStorage,
  saveRosterToStorage,
  loadTokenModeFromStorage,
  saveTokenModeToStorage,
  loadTeamInfoFromStorage,
  saveTeamInfoToStorage,
  TeamInfo,
} from './data/rosterData';
import { detectConceptsForPlay } from './data/routeConceptsData';
import { FieldBoard } from './components/FieldBoard';
import { AnimationController } from './components/AnimationController';
import { TacticalDetailPanel } from './components/TacticalDetailPanel';
import { PlaySelector } from './components/PlaySelector';
import { RouteTreeModal } from './components/RouteTreeModal';
import { GlossaryModal } from './components/GlossaryModal';
import { PlaybookQuizModal } from './components/PlaybookQuizModal';
import { WristbandExportModal } from './components/WristbandExportModal';
import { CustomPlayDesigner } from './components/CustomPlayDesigner';
import { CoachWhiteboard } from './components/CoachWhiteboard';
import { DrillGeneratorModal } from './components/DrillGeneratorModal';
import { PrintLayoutModal } from './components/PrintLayoutModal';
import { RosterManagementModal } from './components/RosterManagementModal';
import { CoachingTipsModal } from './components/CoachingTipsModal';
import { GamePlanStatsModal } from './components/GamePlanStatsModal';
import { DefensiveScoutModal } from './components/DefensiveScoutModal';
import { FormationGalleryModal } from './components/FormationGalleryModal';
import { BroadcastScorebug } from './components/BroadcastScorebug';
import { PreSnapAudibleBar } from './components/PreSnapAudibleBar';
import { CallSheetBuilderModal } from './components/CallSheetBuilderModal';
import { PlayComparisonModal } from './components/PlayComparisonModal';
import { OffensiveTendencyModal } from './components/OffensiveTendencyModal';
import { PlayerQuizFlashcardsModal } from './components/PlayerQuizFlashcardsModal';
import { TopNavbar } from './components/TopNavbar';
import { footballAudio } from './utils/audioSynthesizer';
import { getPlayAssignedCoverage, getDefenseSchemeById } from './utils/defensiveScoutStorage';
import { getSavedFolders } from './utils/folderStorage';

export default function App() {
  // Current active play
  const [selectedPlay, setSelectedPlay] = useState<Play>(() => {
    // Default to Trips Pass Play 97 (Smash / 1 7 8)
    return getPlayById('trips-pass-97-right') || ALL_PLAYBOOK_PLAYS[0];
  });

  // Roster & Jersey Numbers state
  const [roster, setRoster] = useState<RosterPlayer[]>(() => loadRosterFromStorage());
  const [tokenDisplayMode, setTokenDisplayMode] = useState<TokenDisplayMode>(() => loadTokenModeFromStorage());
  const [teamInfo, setTeamInfo] = useState<TeamInfo>(() => loadTeamInfoFromStorage());

  // Animation timeline state
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 1.5, 2

  // Tactical overlay toggles
  const [showDefense, setShowDefense] = useState(false);
  const [defenseScheme, setDefenseScheme] = useState<DefenseScheme | null>(DEFENSE_SCHEMES[2]); // Cover 2
  const [showFullRoutes, setShowFullRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showFieldGrid, setShowFieldGrid] = useState(false);
  const [fieldTheme, setFieldTheme] = useState<'turf' | 'tactical' | 'chalkboard' | 'stadium-night'>('tactical');

  // New Feature Modals & Broadcast Overlays
  const [isCallSheetOpen, setIsCallSheetOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isTendencyOpen, setIsTendencyOpen] = useState(false);
  const [isFlashcardsQuizOpen, setIsFlashcardsQuizOpen] = useState(false);
  const [isAudibleBarOpen, setIsAudibleBarOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Coaching tips & Video overlay state
  const [isCoachingTipsOpen, setIsCoachingTipsOpen] = useState(false);
  const [isCoachingOverlayOpen, setIsCoachingOverlayOpen] = useState(false);
  const [activeRouteConceptId, setActiveRouteConceptId] = useState<string | undefined>(undefined);
  const [boardScale, setBoardScale] = useState<'1.0x' | '1.5x' | 'theater'>('1.5x');

  // Interactive selected player on field
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Modals state
  const [isRouteTreeOpen, setIsRouteTreeOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isWristbandOpen, setIsWristbandOpen] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isDrillsOpen, setIsDrillsOpen] = useState(false);
  const [isPrintLayoutOpen, setIsPrintLayoutOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isGamePlanStatsOpen, setIsGamePlanStatsOpen] = useState(false);
  const [isDefensiveScoutOpen, setIsDefensiveScoutOpen] = useState(false);
  const [isFormationGalleryOpen, setIsFormationGalleryOpen] = useState(false);
  const [appFolders, setAppFolders] = useState(() => getSavedFolders());

  // Drill Training Session state & auto-loop
  const [drillTraining, setDrillTraining] = useState<DrillTrainingSession | null>(null);
  const [showDrillCones, setShowDrillCones] = useState(true);
  const [savedPreDrillPlay, setSavedPreDrillPlay] = useState<Play | null>(null);
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const drillTrainingRef = useRef<DrillTrainingSession | null>(null);
  drillTrainingRef.current = drillTraining;
  const isAutoLoopRef = useRef(isAutoLoop);
  isAutoLoopRef.current = isAutoLoop;
  const resetCadenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to folder updates
  useEffect(() => {
    const handleFoldersUpdate = () => {
      setAppFolders(getSavedFolders());
    };
    window.addEventListener('playbook_folders_updated', handleFoldersUpdate);
    return () => window.removeEventListener('playbook_folders_updated', handleFoldersUpdate);
  }, []);

  // Centralized Play/Pause toggle
  const handleTogglePlay = () => {
    if (!isPlaying) {
      if (progress >= 1) {
        setProgress(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleResetAnimation = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Animation loop ref
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Play animation loop with auto-loop drill support
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const duration = 4000 / speed; // 4 seconds standard duration

    const updateLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        const next = prev + deltaTime / duration;
        if (next >= 1) {
          const dt = drillTrainingRef.current;
          const shouldLoop = (dt && dt.isAutoLoop) || isAutoLoopRef.current;

          if (shouldLoop) {
            // Check if drill reached target reps
            if (dt && dt.targetReps > 0 && dt.currentRep >= dt.targetReps) {
              setIsPlaying(false);
              return 1;
            }

            // Temporarily cancel animation frame while in cadence transition
            if (animFrameRef.current) {
              cancelAnimationFrame(animFrameRef.current);
              animFrameRef.current = null;
            }

            if (dt) {
              setDrillTraining((prevDt) =>
                prevDt
                  ? {
                      ...prevDt,
                      currentRep: prevDt.currentRep + 1,
                      isResettingRep: true,
                    }
                  : null
              );
            }

            const cadenceDelay = dt?.cadenceDelayMs || 1000;

            if (resetCadenceTimeoutRef.current) {
              clearTimeout(resetCadenceTimeoutRef.current);
            }

            resetCadenceTimeoutRef.current = setTimeout(() => {
              setProgress(0);
              lastTimeRef.current = performance.now();
              if (dt) {
                setDrillTraining((prevDt) => (prevDt ? { ...prevDt, isResettingRep: false } : null));
              }
              animFrameRef.current = requestAnimationFrame(updateLoop);
            }, cadenceDelay);

            return 1;
          }

          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (resetCadenceTimeoutRef.current) {
        clearTimeout(resetCadenceTimeoutRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Launch drill directly on FieldBoard
  const handlePlayDrillOnField = (
    drill: PracticeDrill,
    options?: { targetReps?: number; isAutoLoop?: boolean; initialSpeed?: number }
  ) => {
    if (!drillTraining) {
      setSavedPreDrillPlay(selectedPlay);
    }

    const drillPlay = createPlayFromDrill(drill, selectedPlay);
    setSelectedPlay(drillPlay);

    const targetReps = options?.targetReps !== undefined ? options.targetReps : (drillPlay.drillData?.repTarget || 6);
    const loopEnabled = options?.isAutoLoop !== undefined ? options.isAutoLoop : true;

    setDrillTraining({
      drillId: drill.id,
      drillName: drill.name,
      drillCategory: drill.category,
      currentRep: 1,
      targetReps,
      isAutoLoop: loopEnabled,
      cadenceDelayMs: 1000,
      isResettingRep: false,
      coachingCue: drill.receiverCoachingKey || drill.qbCoachingKey || drill.objective,
      cones: drillPlay.drillData?.cones || [],
    });

    if (options?.initialSpeed) {
      setSpeed(options.initialSpeed);
    }

    setProgress(0);
    setIsPlaying(true);
    setIsDrillsOpen(false);
  };

  const handleExitDrillTraining = () => {
    if (resetCadenceTimeoutRef.current) {
      clearTimeout(resetCadenceTimeoutRef.current);
    }
    setDrillTraining(null);
    if (savedPreDrillPlay) {
      setSelectedPlay(savedPreDrillPlay);
      setSavedPreDrillPlay(null);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const handleToggleDrillAutoLoop = () => {
    setDrillTraining((prev) => (prev ? { ...prev, isAutoLoop: !prev.isAutoLoop } : null));
    setIsAutoLoop((prev) => !prev);
  };

  const handleIncrementDrillRep = () => {
    setDrillTraining((prev) => (prev ? { ...prev, currentRep: prev.currentRep + 1 } : null));
  };

  const handleDecrementDrillRep = () => {
    setDrillTraining((prev) => (prev ? { ...prev, currentRep: Math.max(1, prev.currentRep - 1) } : null));
  };

  const handleResetDrillReps = () => {
    setDrillTraining((prev) => (prev ? { ...prev, currentRep: 1, isResettingRep: false } : null));
    setProgress(0);
  };

  const handleChangeDrillTargetReps = (reps: number) => {
    setDrillTraining((prev) => (prev ? { ...prev, targetReps: reps } : null));
  };

  const handleChangeDrillCadenceDelay = (delayMs: number) => {
    setDrillTraining((prev) => (prev ? { ...prev, cadenceDelayMs: delayMs } : null));
  };

  // When selected play changes, reset animation and load assigned defense if present
  const handleSelectPlay = (play: Play) => {
    setSelectedPlay(play);
    setProgress(0);
    setIsPlaying(false);
    setSelectedPlayerId(null);

    // If play has an assigned defensive coverage, load it
    const assignedScout = getPlayAssignedCoverage(play.id);
    if (assignedScout?.primarySchemeId) {
      const scheme = getDefenseSchemeById(assignedScout.primarySchemeId);
      if (scheme) {
        setDefenseScheme(scheme);
      }
    }
  };

  // Apply defensive scheme to active field view with optional automatic overlay activation
  const handleApplyDefenseScheme = (scheme: DefenseScheme, enableOverlay: boolean = true) => {
    setDefenseScheme(scheme);
    if (enableOverlay) {
      setShowDefense(true);
      setShowZones(true);
    }
  };

  // Save newly created custom whiteboard play
  const handleSaveCustomPlay = (newPlay: Play) => {
    ALL_PLAYBOOK_PLAYS.unshift(newPlay);
    handleSelectPlay(newPlay);
  };

  // Update Roster & Persist
  const handleUpdateRoster = (newRoster: RosterPlayer[]) => {
    setRoster(newRoster);
    saveRosterToStorage(newRoster);
  };

  // Update Token Mode & Persist
  const handleUpdateTokenMode = (mode: TokenDisplayMode) => {
    setTokenDisplayMode(mode);
    saveTokenModeToStorage(mode);
  };

  // Update Team Info & Persist
  const handleUpdateTeamInfo = (newInfo: TeamInfo) => {
    setTeamInfo(newInfo);
    saveTeamInfoToStorage(newInfo);
  };

  const handleToggleTokenMode = () => {
    const modes: TokenDisplayMode[] = ['jersey', 'position', 'both', 'name'];
    const nextIdx = (modes.indexOf(tokenDisplayMode) + 1) % modes.length;
    handleUpdateTokenMode(modes[nextIdx]);
  };

  // Update Coaching Cues & Persist
  const handleUpdatePlayCues = (updatedCues: TimestampedCoachingCue[]) => {
    setSelectedPlay((prev) => {
      const updated: Play = {
        ...prev,
        coachingCues: updatedCues,
      };
      const idx = ALL_PLAYBOOK_PLAYS.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        ALL_PLAYBOOK_PLAYS[idx] = updated;
      }
      return updated;
    });
  };

  // Keyboard shortcuts (Space to toggle play, Left/Right arrows to scrub, R to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setProgress((p) => Math.min(1, p + 0.05));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setProgress((p) => Math.max(0, p - 0.05));
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleResetAnimation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, progress]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Modern, Categorized & Responsive Top Navigation Bar */}
      <TopNavbar
        roster={roster}
        defenseScheme={defenseScheme}
        totalPlaysCount={ALL_PLAYBOOK_PLAYS.length}
        isAudibleBarOpen={isAudibleBarOpen}
        onToggleAudibles={() => setIsAudibleBarOpen(!isAudibleBarOpen)}
        onOpenFormationGallery={() => setIsFormationGalleryOpen(true)}
        onOpenDefensiveScout={() => setIsDefensiveScoutOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onOpenCoachingTips={() => setIsCoachingTipsOpen(true)}
        onOpenRouteTree={() => setIsRouteTreeOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenDrills={() => setIsDrillsOpen(true)}
        onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
        onOpenDesigner={() => setIsDesignerOpen(true)}
        onOpenGamePlanStats={() => setIsGamePlanStatsOpen(true)}
        onOpenPrintLayout={() => setIsPrintLayoutOpen(true)}
        onOpenWristband={() => setIsWristbandOpen(true)}
        onOpenCallSheet={() => setIsCallSheetOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenTendency={() => setIsTendencyOpen(true)}
        onOpenFlashcardsQuiz={() => setIsFlashcardsQuizOpen(true)}
      />

      {/* Main Content Workspace (1.5x Scaled Layout & Wide View, 100% Responsive) */}
      <main className={`flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 md:p-6 lg:p-7 min-w-0 ${
        boardScale === 'theater'
          ? 'space-y-6'
          : 'grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 min-w-0'
      }`}>
        {/* Left / Center Column: Field Board & Controller (7 cols on lg, 7-8 cols on xl) */}
        <div className={`${boardScale === 'theater' ? 'w-full' : 'lg:col-span-7 xl:col-span-7 2xl:col-span-8'} space-y-5 min-w-0 w-full`}>
          {/* ESPN / Sunday Night Football Style Broadcast Scorebug & Live Telemetry HUD */}
          <BroadcastScorebug
            play={selectedPlay}
            progress={progress}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleResetAnimation}
            isMuted={isSoundMuted}
            onToggleMute={() => {
              const next = !isSoundMuted;
              setIsSoundMuted(next);
              footballAudio.setMuted(next);
            }}
            onAudibleTrigger={() => setIsAudibleBarOpen(true)}
          />

          {/* Interactive Tactical Field Board */}
          <FieldBoard
            play={selectedPlay}
            progress={progress}
            isPlaying={isPlaying}
            defenseScheme={defenseScheme}
            showDefense={showDefense}
            showFullRoutes={showFullRoutes}
            showLabels={showLabels}
            showZones={showZones}
            showFieldGrid={showFieldGrid}
            onToggleFieldGrid={() => setShowFieldGrid(!showFieldGrid)}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            fieldTheme={fieldTheme}
            onTogglePlay={handleTogglePlay}
            onSeek={(p) => {
              setIsPlaying(false);
              setProgress(p);
            }}
            onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
            roster={roster}
            tokenDisplayMode={tokenDisplayMode}
            onToggleTokenMode={handleToggleTokenMode}
            onOpenRoster={() => setIsRosterOpen(true)}
            isCoachingOverlayOpen={isCoachingOverlayOpen}
            onToggleCoachingOverlay={(open) => setIsCoachingOverlayOpen(open)}
            onOpenCoachingModal={() => setIsCoachingTipsOpen(true)}
            activeRouteConceptId={activeRouteConceptId}
            onSelectRouteConceptId={(id) => setActiveRouteConceptId(id)}
            boardScale={boardScale}
            onToggleBoardScale={setBoardScale}
            onOpenFormationGallery={() => setIsFormationGalleryOpen(true)}
            drillTrainingState={drillTraining}
            onToggleDrillAutoLoop={handleToggleDrillAutoLoop}
            onIncrementDrillRep={handleIncrementDrillRep}
            onDecrementDrillRep={handleDecrementDrillRep}
            onResetDrillReps={handleResetDrillReps}
            onChangeDrillTargetReps={handleChangeDrillTargetReps}
            onChangeDrillCadenceDelay={handleChangeDrillCadenceDelay}
            onExitDrillTraining={handleExitDrillTraining}
            showDrillCones={showDrillCones}
            onToggleShowDrillCones={() => setShowDrillCones(!showDrillCones)}
          />

          {/* Pre-Snap Audible & Hot-Route Switch Bar */}
          {isAudibleBarOpen && (
            <PreSnapAudibleBar
              activePlay={selectedPlay}
              onSelectAudiblePlay={(audiblePlay) => {
                handleSelectPlay(audiblePlay);
                setIsAudibleBarOpen(false);
              }}
              onClose={() => setIsAudibleBarOpen(false)}
            />
          )}

          {/* Interactive Animation Controller */}
          <AnimationController
            progress={progress}
            setProgress={setProgress}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            speed={speed}
            setSpeed={setSpeed}
            showDefense={showDefense}
            setShowDefense={setShowDefense}
            defenseScheme={defenseScheme}
            setDefenseScheme={setDefenseScheme}
            showFullRoutes={showFullRoutes}
            setShowFullRoutes={setShowFullRoutes}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            showZones={showZones}
            setShowZones={setShowZones}
            showFieldGrid={showFieldGrid}
            setShowFieldGrid={setShowFieldGrid}
            fieldTheme={fieldTheme}
            setFieldTheme={setFieldTheme}
            isAutoLoop={drillTraining ? drillTraining.isAutoLoop : isAutoLoop}
            onToggleAutoLoop={handleToggleDrillAutoLoop}
            drillTraining={drillTraining}
            onExitDrill={handleExitDrillTraining}
            onOpenDefensiveScout={() => setIsDefensiveScoutOpen(true)}
          />

          {/* Detailed Tactical Progression & Assignment Analysis */}
          <TacticalDetailPanel
            play={selectedPlay}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onOpenRouteTree={() => setIsRouteTreeOpen(true)}
            onOpenDrills={() => setIsDrillsOpen(true)}
            onOpenPrintLayout={() => setIsPrintLayoutOpen(true)}
            roster={roster}
            onOpenRoster={() => setIsRosterOpen(true)}
            onOpenCoachingTips={() => setIsCoachingTipsOpen(true)}
            onToggleCoachingOverlay={() => setIsCoachingOverlayOpen(!isCoachingOverlayOpen)}
            isCoachingOverlayOpen={isCoachingOverlayOpen}
            currentProgress={progress}
            isPlaying={isPlaying}
            onSeekProgress={setProgress}
            onTogglePlay={handleTogglePlay}
            onUpdatePlayCues={handleUpdatePlayCues}
            onOpenDefensiveScout={() => setIsDefensiveScoutOpen(true)}
            activeDefenseScheme={defenseScheme}
          />
        </div>

        {/* Right Column: Play Selector & Playbook Explorer (5 cols on lg, 5 cols on xl, 4 cols on 2xl) */}
        <div className={`${boardScale === 'theater' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'lg:col-span-5 xl:col-span-5 2xl:col-span-4'} space-y-5 min-w-0 w-full`}>
          <PlaySelector
            selectedPlay={selectedPlay}
            onSelectPlay={handleSelectPlay}
            onDuplicatePlay={handleSaveCustomPlay}
            onOpenFormationGallery={() => setIsFormationGalleryOpen(true)}
          />

          {/* Quick Shortcuts & Playbook Quick Facts */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-800 font-bold border-b border-slate-100 pb-2">
              <span>KEYBOARD CONTROLS</span>
              <span className="text-blue-600 font-semibold">1.5X STADIUM VIEW</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">Space</kbd>
                <span>Play / Pause</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">R</kbd>
                <span>Reset to Snap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">← / →</kbd>
                <span>Step Timeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">Click Token</kbd>
                <span>Inspect Player</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        Official Aalto Predators 8v8 Playbook Engine • Aalto University American Football (Finland University League) • Offline Ready
      </footer>

      {/* Modals */}
      <RouteTreeModal
        isOpen={isRouteTreeOpen}
        onClose={() => setIsRouteTreeOpen(false)}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <PlaybookQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      <WristbandExportModal
        isOpen={isWristbandOpen}
        onClose={() => setIsWristbandOpen(false)}
      />

      <CustomPlayDesigner
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        onSaveCustomPlay={handleSaveCustomPlay}
      />

      <CoachWhiteboard
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        currentPlay={selectedPlay}
        onSaveAsCustomPlay={handleSaveCustomPlay}
      />

      <DrillGeneratorModal
        isOpen={isDrillsOpen}
        onClose={() => setIsDrillsOpen(false)}
        currentPlay={selectedPlay}
        onPlayDrillOnField={handlePlayDrillOnField}
      />

      <PrintLayoutModal
        isOpen={isPrintLayoutOpen}
        onClose={() => setIsPrintLayoutOpen(false)}
        play={selectedPlay}
        roster={roster}
        tokenDisplayMode={tokenDisplayMode}
      />

      <RosterManagementModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        roster={roster}
        onUpdateRoster={handleUpdateRoster}
        teamInfo={teamInfo}
        onUpdateTeamInfo={handleUpdateTeamInfo}
        tokenDisplayMode={tokenDisplayMode}
        onUpdateTokenMode={handleUpdateTokenMode}
        onUpdateTokenDisplayMode={handleUpdateTokenMode}
      />

      <CoachingTipsModal
        isOpen={isCoachingTipsOpen}
        onClose={() => setIsCoachingTipsOpen(false)}
        play={selectedPlay}
        selectedPlay={selectedPlay}
        isOverlayActive={isCoachingOverlayOpen}
        onToggleOverlay={(val) => setIsCoachingOverlayOpen(val)}
        selectedConceptId={activeRouteConceptId}
        onSelectConceptId={(id) => setActiveRouteConceptId(id)}
      />

      <GamePlanStatsModal
        isOpen={isGamePlanStatsOpen}
        onClose={() => setIsGamePlanStatsOpen(false)}
        folders={appFolders}
        onSelectPlay={(play) => setSelectedPlay(play)}
      />

      <DefensiveScoutModal
        isOpen={isDefensiveScoutOpen}
        onClose={() => setIsDefensiveScoutOpen(false)}
        currentPlay={selectedPlay}
        activeDefenseScheme={defenseScheme}
        onApplyDefenseToField={handleApplyDefenseScheme}
        onUpdatePlayDefense={(scoutData) => {
          const scheme = getDefenseSchemeById(scoutData.primarySchemeId);
          if (scheme) {
            handleApplyDefenseScheme(scheme, true);
          }
        }}
      />

      <FormationGalleryModal
        isOpen={isFormationGalleryOpen}
        onClose={() => setIsFormationGalleryOpen(false)}
        onSelectPlay={(play) => setSelectedPlay(play)}
        currentSelectedPlay={selectedPlay}
      />

      <CallSheetBuilderModal
        isOpen={isCallSheetOpen}
        onClose={() => setIsCallSheetOpen(false)}
        onSelectPlay={(play) => handleSelectPlay(play)}
      />

      <PlayComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        activePlay={selectedPlay}
        onSelectPlay={(play) => handleSelectPlay(play)}
      />

      <OffensiveTendencyModal
        isOpen={isTendencyOpen}
        onClose={() => setIsTendencyOpen(false)}
        onSelectPlay={(play) => handleSelectPlay(play)}
      />

      <PlayerQuizFlashcardsModal
        isOpen={isFlashcardsQuizOpen}
        onClose={() => setIsFlashcardsQuizOpen(false)}
      />
    </div>
  );
}
