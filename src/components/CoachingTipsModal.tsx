import React, { useState, useEffect, useRef } from 'react';
import { Play } from '../types';
import {
  RouteConceptDefinition,
  ROUTE_CONCEPTS_DATABASE,
  detectConceptsForPlay,
} from '../data/routeConceptsData';
import {
  GraduationCap,
  Play as PlayIcon,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  X,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Eye,
  Tv,
  Layers,
  Dumbbell,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface CoachingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  play?: Play;
  selectedPlay?: Play;
  isOverlayActive: boolean;
  onToggleOverlay: (val: boolean) => void;
  selectedConceptId?: string;
  onSelectConceptId?: (id: string) => void;
}

export const CoachingTipsModal: React.FC<CoachingTipsModalProps> = ({
  isOpen,
  onClose,
  play,
  selectedPlay,
  isOverlayActive,
  onToggleOverlay,
  selectedConceptId,
  onSelectConceptId,
}) => {
  const currentPlay = play || selectedPlay;
  // Detect concepts matched for the current play
  const matchedConcepts = detectConceptsForPlay(currentPlay);

  // Selected concept state (defaults to first matched concept)
  const [activeConcept, setActiveConcept] = useState<RouteConceptDefinition>(() => {
    if (selectedConceptId) {
      const found = ROUTE_CONCEPTS_DATABASE.find((c) => c.id === selectedConceptId);
      if (found) return found;
    }
    return matchedConcepts[0] || ROUTE_CONCEPTS_DATABASE[0];
  });

  const [activeTab, setActiveTab] = useState<'video' | 'qb_reads' | 'wr_technique' | 'defense_counters' | 'mistakes'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const durationSec = activeConcept.videoDurationSec || 40;

  // Sync active concept if selectedConceptId changes from outside
  useEffect(() => {
    if (selectedConceptId) {
      const found = ROUTE_CONCEPTS_DATABASE.find((c) => c.id === selectedConceptId);
      if (found) {
        setActiveConcept(found);
        setCurrentTimeSec(0);
      }
    }
  }, [selectedConceptId]);

  // Sync when play changes
  useEffect(() => {
    if (currentPlay) {
      const playConcepts = detectConceptsForPlay(currentPlay);
      if (playConcepts.length > 0 && !playConcepts.some((c) => c.id === activeConcept.id)) {
        setActiveConcept(playConcepts[0]);
        setCurrentTimeSec(0);
      }
    }
  }, [currentPlay]);

  // Current chapter
  const currentChapter = [...activeConcept.videoChapters]
    .reverse()
    .find((c) => currentTimeSec >= c.timeSec) || activeConcept.videoChapters[0];

  // Video render loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;

    const renderLoop = (time: number) => {
      const deltaSec = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        setCurrentTimeSec((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= durationSec) {
            return 0; // loop
          }
          return next;
        });
      }

      drawVideoCanvas();
      animId = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(renderLoop);
    animFrameRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying, playbackSpeed, activeConcept, durationSec]);

  // Canvas drawing routine
  const drawVideoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Field Grid Lines & Yard lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Line of Scrimmage (LOS)
    const losY = height * 0.65;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, losY);
    ctx.lineTo(width, losY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('LINE OF SCRIMMAGE (0 YDS)', 12, losY - 6);

    const progress = Math.min(1, Math.max(0, currentTimeSec / durationSec));

    const {
      primaryReceiverPath,
      secondaryReceiverPath,
      qbPath,
      defenders,
      ballReleaseSec,
      ballCatchSec,
      targetPos,
    } = activeConcept.canvasAnimation;

    // Helper path interpolation
    const getPosAlongPath = (path: { x: number; y: number }[], t: number) => {
      if (!path || path.length === 0) return { x: width / 2, y: height / 2 };
      if (path.length === 1) return { x: (path[0].x / 100) * width, y: (path[0].y / 100) * height };

      const totalSegments = path.length - 1;
      const segIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
      const segT = (t * totalSegments) - segIndex;

      const p1 = path[segIndex];
      const p2 = path[segIndex + 1];

      return {
        x: ((p1.x + (p2.x - p1.x) * segT) / 100) * width,
        y: ((p1.y + (p2.y - p1.y) * segT) / 100) * height,
      };
    };

    // Primary route line
    if (primaryReceiverPath && primaryReceiverPath.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      primaryReceiverPath.forEach((p, idx) => {
        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Route arrow tip
      const last = primaryReceiverPath[primaryReceiverPath.length - 1];
      const lx = (last.x / 100) * width;
      const ly = (last.y / 100) * height;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Secondary route line
    if (secondaryReceiverPath && secondaryReceiverPath.length > 1) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      secondaryReceiverPath.forEach((p, idx) => {
        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Target Catch Window Ring
    if (targetPos) {
      const tx = (targetPos.x / 100) * width;
      const ty = (targetPos.y / 100) * height;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(tx, ty, 14 + Math.sin(currentTimeSec * 5) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('TARGET WINDOW', tx - 36, ty + 24);
    }

    // Primary Receiver
    const recPos = getPosAlongPath(primaryReceiverPath, Math.min(progress * 1.3, 1));
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(recPos.x, recPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WR', recPos.x, recPos.y + 3.5);

    // Secondary Receiver
    if (secondaryReceiverPath) {
      const secPos = getPosAlongPath(secondaryReceiverPath, Math.min(progress * 1.2, 1));
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(secPos.x, secPos.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('SLOT', secPos.x, secPos.y + 3);
    }

    // QB
    const qbPos = getPosAlongPath(qbPath, Math.min(progress * 0.8, 1));
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(qbPos.x, qbPos.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('QB', qbPos.x, qbPos.y + 3.5);

    // Defenders
    if (defenders && defenders.length > 0) {
      defenders.forEach((def) => {
        const startX = (def.x / 100) * width;
        const startY = (def.y / 100) * height;
        let defX = startX;
        let defY = startY;

        if (def.moveTarget && progress > 0.2) {
          const moveT = Math.min(1, (progress - 0.2) * 1.6);
          const targetX = (def.moveTarget.x / 100) * width;
          const targetY = (def.moveTarget.y / 100) * height;
          defX = startX + (targetX - startX) * moveT;
          defY = startY + (targetY - startY) * moveT;
        }

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(defX, defY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(def.label, defX, defY + 3);
      });
    }

    // Ball Flight
    const relNorm = ballReleaseSec / (durationSec || 40);
    const catchNorm = ballCatchSec / (durationSec || 40);

    if (progress >= relNorm && progress <= catchNorm + 0.15) {
      const flightT = Math.min(1, Math.max(0, (progress - relNorm) / (catchNorm - relNorm)));
      const startX = qbPos.x;
      const startY = qbPos.y;
      const endX = (targetPos.x / 100) * width;
      const endY = (targetPos.y / 100) * height;

      const ballX = startX + (endX - startX) * flightT;
      const ballY = startY + (endY - startY) * flightT - Math.sin(flightT * Math.PI) * 20;

      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ballX, ballY, 5, 3.5, flightT * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Timestamp
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 10, 70, 20);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 70, 20);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    const minutes = Math.floor(currentTimeSec / 60);
    const seconds = Math.floor(currentTimeSec % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    ctx.fillText(`▶ ${timeStr}`, 18, 24);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTimeSec(pct * durationSec);
  };

  // Filter concepts for sidebar/picker
  const filteredConcepts = ROUTE_CONCEPTS_DATABASE.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (!isOpen) return null;

  return (
    <div
      id="coaching-tips-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="coaching-tips-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Coaching Tips &amp; Video Tutorials
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-900/80 text-blue-300 border border-blue-700">
                  Concept Clinic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tactical breakdowns, high-low read rules, and video walkthroughs for 8v8 route concepts (Finland University League).
              </p>
            </div>
          </div>

          {/* Quick FieldBoard Overlay Toggle & Close Button */}
          <div className="flex items-center gap-2.5">
            <button
              id="modal-toggle-overlay-btn"
              onClick={() => onToggleOverlay(!isOverlayActive)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border shadow-sm cursor-pointer ${
                isOverlayActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-950/40'
              }`}
              title="Toggle floating video tutorial HUD directly on the FieldBoard"
            >
              <Tv className="w-4 h-4" />
              <span>{isOverlayActive ? 'FieldBoard HUD (Active)' : 'Show HUD on FieldBoard'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Grid Layout: Concept Library Left, Video/Details Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Concept Selector & Active Play Matched Concepts (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-950/70 border-r border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto max-h-[40vh] lg:max-h-full">
            {/* Active Play Banner */}
            {currentPlay && (
              <div className="bg-blue-950/50 border border-blue-800/60 rounded-xl p-3">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Active Play: {currentPlay.code || 'Selected Play'}</span>
                </div>
                <div className="text-xs font-extrabold text-white mt-0.5 truncate">
                  {currentPlay.englishName || 'Tactical Scheme'}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Detected Concepts in this formation:
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {matchedConcepts.map((mc) => (
                    <button
                      key={`mc-btn-${mc.id}`}
                      onClick={() => {
                        setActiveConcept(mc);
                        setCurrentTimeSec(0);
                        onSelectConceptId?.(mc.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeConcept.id === mc.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ★ {mc.name.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Category Filter */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search route concepts (Smash, Mesh...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {['ALL', 'Pass Concept', 'Quick Game', 'Deep Shot'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Concepts List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {filteredConcepts.map((concept) => {
                const isSelected = activeConcept.id === concept.id;
                const isMatchedToPlay = matchedConcepts.some((m) => m.id === concept.id);

                return (
                  <div
                    key={`concept-card-${concept.id}`}
                    onClick={() => {
                      setActiveConcept(concept);
                      setCurrentTimeSec(0);
                      onSelectConceptId?.(concept.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900/30 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-xs flex items-center gap-1.5">
                        {isMatchedToPlay && <span className="text-amber-400 font-black">★</span>}
                        <span>{concept.name.split('(')[0].trim()}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {concept.videoDurationFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {concept.shortSummary}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-300">
                      <span className="font-mono bg-slate-800/90 px-1.5 py-0.5 rounded">
                        {concept.category}
                      </span>
                      <span>• {concept.keyRoutes.length} Key Routes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Video Tutorial Canvas & Deep-Dive Tabs (8 Cols) */}
          <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Concept Title & Badges */}
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">{activeConcept.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700">
                    {activeConcept.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {activeConcept.shortSummary}
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => onToggleOverlay(true)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pin Video on Field</span>
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              {/* Canvas Viewport */}
              <div className="relative w-full aspect-video sm:aspect-[21/9] bg-black flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={280}
                  className="w-full h-full object-cover"
                />

                {/* Subtitle Coaching Callout (Bottom center) */}
                <div className="absolute bottom-3 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300 mr-2">{currentChapter?.title}:</span>
                    <span className="text-slate-200">{currentChapter?.focusPoint || currentChapter?.subtitle}</span>
                  </div>
                </div>
              </div>

              {/* Video Scrub Bar */}
              <div
                onClick={handleSeek}
                className="h-2 bg-slate-800 hover:h-3 transition-all cursor-pointer relative group"
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 relative"
                  style={{ width: `${(currentTimeSec / durationSec) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Player Controls Bar */}
              <div className="p-3 bg-slate-900 flex items-center justify-between flex-wrap gap-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setCurrentTimeSec(0)}
                    title="Restart"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentTimeSec(Math.max(0, currentTimeSec - 5))}
                    title="Rewind 5s"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentTimeSec(Math.min(durationSec, currentTimeSec + 5))}
                    title="Forward 5s"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-slate-300 ml-2">
                    {Math.floor(currentTimeSec)}s / {activeConcept.videoDurationFormatted}
                  </span>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[0.5, 0.75, 1, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Timestamped Chapters Bar */}
              <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-500 font-mono font-bold shrink-0 mr-1">Chapters:</span>
                {activeConcept.videoChapters.map((ch) => {
                  const isCurrent = currentChapter?.timeSec === ch.timeSec;
                  return (
                    <button
                      key={`ch-${ch.timeSec}`}
                      onClick={() => setCurrentTimeSec(ch.timeSec)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-700 text-white font-bold shadow-xs'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-blue-300 mr-1">{ch.timeFormatted}</span>
                      <span>{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs for In-Depth Coaching Guide */}
            <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('video')}
                className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Concept Architecture &amp; Keys
              </button>
              <button
                onClick={() => setActiveTab('qb_reads')}
                className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'qb_reads'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                QB Read Progression ({activeConcept.qbReadProgression.length} Steps)
              </button>
              <button
                onClick={() => setActiveTab('wr_technique')}
                className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'wr_technique'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                WR Stem &amp; Break Technique
              </button>
              <button
                onClick={() => setActiveTab('defense_counters')}
                className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'defense_counters'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Defensive Counters &amp; Weaknesses
              </button>
              <button
                onClick={() => setActiveTab('mistakes')}
                className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'mistakes'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Common Pitfalls &amp; Fixes
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3 text-xs">
              {/* Tab 1: Architecture & Keys */}
              {activeTab === 'video' && (
                <div className="space-y-3">
                  {/* Golden Rule Banner */}
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-amber-300 text-xs uppercase tracking-wider">
                        Coach's Golden Rule
                      </div>
                      <div className="text-amber-100 text-xs mt-1 leading-relaxed font-medium">
                        "{activeConcept.goldenRule}"
                      </div>
                    </div>
                  </div>

                  {/* Key Routes and Coverage Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <div className="font-bold text-blue-300 mb-2 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        <span>Key Routes Involved</span>
                      </div>
                      <ul className="space-y-1 text-slate-300">
                        {activeConcept.keyRoutes.map((r, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span className="font-mono">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <div className="font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Best Against Coverages</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {activeConcept.idealVs}
                      </p>
                      <div className="mt-2 text-rose-300 text-[11px] font-medium">
                        <span className="font-bold">Caution Vs: </span>
                        {activeConcept.vulnerableVs}
                      </div>
                    </div>
                  </div>

                  {/* Core Coaching Bullet Points */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                    <div className="font-bold text-white mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span>Key Teaching Points</span>
                    </div>
                    <div className="space-y-2">
                      {activeConcept.coachingPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-slate-300 leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: QB Reads */}
              {activeTab === 'qb_reads' && (
                <div className="space-y-3">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <tr>
                          <th className="p-3 w-16">Read #</th>
                          <th className="p-3">Target / Key Defender</th>
                          <th className="p-3">Drop Timing</th>
                          <th className="p-3">Trigger / Decision Cue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {activeConcept.qbReadProgression.map((prog) => (
                          <tr key={prog.step} className="hover:bg-slate-900/50">
                            <td className="p-3 font-mono font-bold text-blue-400">
                              Step {prog.step}
                            </td>
                            <td className="p-3 font-bold text-white">
                              {prog.target}
                            </td>
                            <td className="p-3 font-mono text-amber-300 text-[11px]">
                              {prog.timing}
                            </td>
                            <td className="p-3 text-slate-300 leading-relaxed">
                              {prog.readCue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: WR Technique */}
              {activeTab === 'wr_technique' && (
                <div className="space-y-3">
                  {activeConcept.receiverTechnique.map((tech, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="font-extrabold text-blue-300 text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{tech.position}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-bold text-sky-300 block mb-1">1. The Stem:</span>
                          <span className="text-slate-300">{tech.stem}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-bold text-amber-300 block mb-1">2. Breakpoint:</span>
                          <span className="text-slate-300">{tech.breakpoint}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-bold text-emerald-300 block mb-1">3. Catch &amp; RAC:</span>
                          <span className="text-slate-300">{tech.catchAndYAC}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Defensive Counters */}
              {activeTab === 'defense_counters' && (
                <div className="space-y-3">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>How Defenses Attempt to Stop this Concept</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {activeConcept.vulnerableVs}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Common Pitfalls */}
              {activeTab === 'mistakes' && (
                <div className="space-y-2">
                  {activeConcept.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-rose-200 leading-relaxed">{mistake}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
