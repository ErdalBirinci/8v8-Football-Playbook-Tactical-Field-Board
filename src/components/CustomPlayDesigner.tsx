import React, { useState, useRef, useEffect } from 'react';
import { Play, PlayerAssignment, FormationTemplate, FormationTemplatePlayerPosition } from '../types';
import { ROUTE_TREE } from '../data/routeTree';
import { generateRoutePoints } from '../data/routeGenerator';
import {
  getStoredFormationTemplates,
  saveCustomFormationTemplate,
  deleteCustomFormationTemplate,
  BUILT_IN_FORMATION_TEMPLATES,
} from '../data/formationTemplates';
import {
  X,
  Plus,
  Play as PlayIcon,
  RotateCcw,
  Download,
  Save,
  Trash2,
  Sparkles,
  Move,
  LayoutTemplate,
  Check,
  BookmarkPlus,
  Info,
} from 'lucide-react';

interface CustomPlayDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomPlay: (play: Play) => void;
}

export const CustomPlayDesigner: React.FC<CustomPlayDesignerProps> = ({
  isOpen,
  onClose,
  onSaveCustomPlay,
}) => {
  const [playName, setPlayName] = useState('CUSTOM 8v8 PLAY');
  const [playCode, setPlayCode] = useState('CUSTOM 1 7 8');
  const [formation, setFormation] = useState('Trips Right');
  const [direction, setDirection] = useState<'RIGHT' | 'LEFT' | 'BALANCED'>('RIGHT');
  const [playType, setPlayType] = useState<'PASS' | 'RUN' | 'SCREEN'>('PASS');

  // Formation templates state
  const [templates, setTemplates] = useState<FormationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('builtin-trips-right');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom players state
  const [players, setPlayers] = useState<Record<string, PlayerAssignment>>({
    QB: {
      id: 'QB',
      label: 'QB',
      positionName: 'Quarterback',
      initialPos: { x: 50, y: 75 },
      roleDescription: 'Passer / Handoff',
      route: { name: '3-Step Drop', points: [{ x: 50, y: 75, type: 'snap' }, { x: 50, y: 79, type: 'stem' }] },
    },
    C: {
      id: 'C',
      label: 'C',
      positionName: 'Center',
      initialPos: { x: 50, y: 65 },
      roleDescription: 'Snap & Pass Pro',
      route: { name: 'Pass Pro', points: [{ x: 50, y: 65, type: 'snap' }, { x: 50, y: 64, type: 'block' }], isBlocking: true },
    },
    X: {
      id: 'X',
      label: 'X (WR-L)',
      positionName: 'Outside Left WR',
      initialPos: { x: 16, y: 65 },
      roleDescription: 'Route 1',
      route: { name: '1 - Flat', routeNumber: 1, points: generateRoutePoints(16, 65, 1, { isRightSide: false }).points, color: '#ec4899' },
    },
    H: {
      id: 'H',
      label: 'H (Slot)',
      positionName: 'Inside Slot',
      initialPos: { x: 66, y: 66 },
      roleDescription: 'Route 8',
      route: { name: '8 - Post', routeNumber: 8, points: generateRoutePoints(66, 66, 8, { isRightSide: true }).points, color: '#f59e0b' },
    },
    Y: {
      id: 'Y',
      label: 'Y (Slot)',
      positionName: 'Middle Slot',
      initialPos: { x: 74, y: 66 },
      roleDescription: 'Route 7',
      route: { name: '7 - Corner', routeNumber: 7, points: generateRoutePoints(74, 66, 7, { isRightSide: true }).points, isSecondary: true, color: '#10b981' },
    },
    W: {
      id: 'W',
      label: 'W (Slot-2)',
      positionName: 'Inside Slot (+1 WR)',
      initialPos: { x: 80, y: 66 },
      roleDescription: 'Route 2',
      route: { name: '2 - Slant', routeNumber: 2, points: generateRoutePoints(80, 66, 2, { isRightSide: true }).points, color: '#3b82f6' },
    },
    Z: {
      id: 'Z',
      label: 'Z (WR-R)',
      positionName: 'Outside Right WR',
      initialPos: { x: 88, y: 65 },
      roleDescription: 'Route 1',
      route: { name: '1 - Flat', routeNumber: 1, points: generateRoutePoints(88, 65, 1, { isRightSide: true }).points, isPrimary: true, color: '#38bdf8' },
    },
    RB: {
      id: 'RB',
      label: 'RB',
      positionName: 'Running Back',
      initialPos: { x: 42, y: 75 },
      roleDescription: 'Pass Pro Check',
      route: { name: 'Pass Pro', points: [{ x: 42, y: 75, type: 'snap' }, { x: 42, y: 70, type: 'block' }], isBlocking: true, color: '#a855f7' },
    },
  });

  const [selectedPlayerKey, setSelectedPlayerKey] = useState<string>('Z');
  const [draggingPlayerKey, setDraggingPlayerKey] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load formation templates from storage on mount
  useEffect(() => {
    if (isOpen) {
      setTemplates(getStoredFormationTemplates());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Apply a formation template to current players
  const applyFormationTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;

    setSelectedTemplateId(templateId);
    setFormation(target.name);
    if (target.direction) {
      setDirection(target.direction);
    }

    const updatedPlayers = { ...players };

    (Object.entries(target.playerPositions) as [string, FormationTemplatePlayerPosition][]).forEach(([key, posData]) => {
      const existing = updatedPlayers[key] || {
        id: key,
        label: posData.label || key,
        positionName: posData.positionName || 'Player',
        initialPos: posData.initialPos,
        roleDescription: posData.roleDescription || 'Assigned',
        route: { name: 'Pass Pro', points: [{ x: posData.initialPos.x, y: posData.initialPos.y, type: 'snap' }] },
      };

      const newInitPos = { x: posData.initialPos.x, y: posData.initialPos.y };
      const isRight = newInitPos.x >= 50;

      // If player has an assigned route number, regenerate from new initial position
      let newRoute = existing.route;
      if (existing.route.routeNumber !== undefined) {
        const gen = generateRoutePoints(newInitPos.x, newInitPos.y, existing.route.routeNumber, { isRightSide: isRight });
        newRoute = {
          ...existing.route,
          name: gen.name,
          points: gen.points,
        };
      } else if (existing.route.points && existing.route.points.length > 0) {
        // Shift existing route points relative to movement delta
        const deltaX = newInitPos.x - existing.initialPos.x;
        const deltaY = newInitPos.y - existing.initialPos.y;
        newRoute = {
          ...existing.route,
          points: existing.route.points.map((pt) => ({
            ...pt,
            x: Math.max(2, Math.min(98, pt.x + deltaX)),
            y: Math.max(5, Math.min(95, pt.y + deltaY)),
          })),
        };
      }

      updatedPlayers[key] = {
        ...existing,
        label: posData.label || existing.label,
        positionName: posData.positionName || existing.positionName,
        initialPos: newInitPos,
        roleDescription: posData.roleDescription || existing.roleDescription,
        route: newRoute,
      };
    });

    setPlayers(updatedPlayers);
    showToast(`Applied "${target.name}" template`);
  };

  // Save current player alignment as a new formation template
  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) {
      showToast('Please enter a template name');
      return;
    }

    const templatePlayerPositions: Record<string, FormationTemplatePlayerPosition> = {};
    (Object.entries(players) as [string, PlayerAssignment][]).forEach(([key, p]) => {
      templatePlayerPositions[key] = {
        id: p.id,
        label: p.label,
        positionName: p.positionName,
        initialPos: { x: p.initialPos.x, y: p.initialPos.y },
        roleDescription: p.roleDescription,
        defaultRouteNumber: p.route?.routeNumber,
      };
    });

    const newTemplate: FormationTemplate = {
      id: `custom-tmpl-${Date.now()}`,
      name: newTemplateName.trim(),
      category: 'CUSTOM FORMATION',
      direction: direction,
      isBuiltIn: false,
      description: newTemplateDesc.trim() || 'Custom user saved formation template preset',
      playerPositions: templatePlayerPositions,
    };

    const updated = saveCustomFormationTemplate(newTemplate);
    setTemplates(updated);
    setSelectedTemplateId(newTemplate.id);
    setFormation(newTemplate.name);
    setIsSavingTemplate(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    showToast(`Template "${newTemplate.name}" saved to presets!`);
  };

  // Delete a custom formation template
  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomFormationTemplate(templateId);
    setTemplates(updated);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId('builtin-trips-right');
    }
    showToast('Custom template deleted');
  };

  // SVG coordinate transformation for drag and drop
  const getSVGCoordinates = (event: React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.max(5, Math.min(95, Math.round(svgPt.x * 10) / 10)),
      y: Math.max(40, Math.min(88, Math.round(svgPt.y * 10) / 10)),
    };
  };

  const handlePointerDown = (playerKey: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setSelectedPlayerKey(playerKey);
    setDraggingPlayerKey(playerKey);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingPlayerKey || !players[draggingPlayerKey]) return;
    const coords = getSVGCoordinates(e);
    if (!coords) return;

    const p = players[draggingPlayerKey];
    const isRight = coords.x >= 50;

    // Update position and regenerate route if routeNumber is assigned
    let updatedRoute = p.route;
    if (p.route.routeNumber !== undefined) {
      const gen = generateRoutePoints(coords.x, coords.y, p.route.routeNumber, { isRightSide: isRight });
      updatedRoute = {
        ...p.route,
        name: gen.name,
        points: gen.points,
      };
    } else if (p.route.points && p.route.points.length > 0) {
      const deltaX = coords.x - p.initialPos.x;
      const deltaY = coords.y - p.initialPos.y;
      updatedRoute = {
        ...p.route,
        points: p.route.points.map((pt) => ({
          ...pt,
          x: Math.max(2, Math.min(98, Math.round((pt.x + deltaX) * 10) / 10)),
          y: Math.max(5, Math.min(95, Math.round((pt.y + deltaY) * 10) / 10)),
        })),
      };
    }

    setPlayers((prev) => ({
      ...prev,
      [draggingPlayerKey]: {
        ...p,
        initialPos: coords,
        route: updatedRoute,
      },
    }));
  };

  const handlePointerUp = () => {
    setDraggingPlayerKey(null);
  };

  const handleRouteSelect = (routeNum: number | string) => {
    if (!selectedPlayerKey || !players[selectedPlayerKey]) return;
    const p = players[selectedPlayerKey];
    const isRight = p.initialPos.x >= 50;
    const generated = generateRoutePoints(p.initialPos.x, p.initialPos.y, routeNum, { isRightSide: isRight });

    setPlayers({
      ...players,
      [selectedPlayerKey]: {
        ...p,
        roleDescription: `Runs route ${routeNum}`,
        route: {
          ...p.route,
          name: generated.name,
          routeNumber: routeNum,
          points: generated.points,
        },
      },
    });
  };

  const handleSave = () => {
    const newPlay: Play = {
      id: `custom-${Date.now()}`,
      playNumber: '★',
      code: playCode,
      originalTurkishCode: playCode,
      englishName: playName,
      category: 'TRIPS PASS',
      playType: playType,
      direction: direction,
      formationName: formation,
      conceptName: playName,
      tags: ['Custom Play', 'Whiteboard Designed', formation, '8v8'],
      description: `Custom coach-designed 8v8 play created in the tactical whiteboard designer with ${formation} alignment.`,
      progressionReads: [
        {
          order: 1,
          playerId: selectedPlayerKey || 'Z',
          concept: 'Primary assigned route',
          cue: 'Read safety leverage and release timing',
        },
        {
          order: 2,
          playerId: 'Y',
          concept: 'Secondary intermediate read',
          cue: 'Hit soft spot behind dropping linebacker',
        },
      ],
      coachingPoints: [
        `Align precisely in ${formation} set before snap.`,
        'Execute assigned stem depths and break angles sharply.',
      ],
      qbDrop: 'Shotgun 3-Step',
      players,
    };
    onSaveCustomPlay(newPlay);
    onClose();
  };

  // Convert SVG to Canvas and export PNG image
  const handleExportPNG = () => {
    const svgElement = document.getElementById('designer-svg-canvas');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

    img.onload = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `${playCode.replace(/[^a-z0-9]/gi, '_')}_diagram.png`;
        a.href = pngUrl;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                8v8 Tactical Whiteboard Designer
              </h3>
              <p className="text-xs text-slate-500">
                Drag tokens to align 8v8 formations (+1 WR), save template presets, assign routes &amp; export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Export PNG
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Play
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Designer Content Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50/50">
          {/* Left Column: Interactive SVG Gridiron Board */}
          <div className="md:col-span-7 space-y-3">
            {/* Alignment Drag Instructions */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-blue-50/70 border border-blue-200/60 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 font-medium">
                <Move className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Drag any offensive token directly on the board to customize pre-snap alignment.</span>
              </div>
              {selectedPlayerKey && players[selectedPlayerKey] && (
                <span className="font-mono font-bold text-blue-700 shrink-0">
                  {selectedPlayerKey}: ({players[selectedPlayerKey].initialPos.x}, {players[selectedPlayerKey].initialPos.y})
                </span>
              )}
            </div>

            <div className="relative aspect-[4/3] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl border border-slate-300 overflow-hidden shadow-md p-2 select-none">
              <svg
                ref={svgRef}
                id="designer-svg-canvas"
                viewBox="0 0 100 100"
                className="w-full h-full cursor-crosshair"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <defs>
                  <marker
                    id="designer-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <filter id="des-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Base Field Background */}
                <rect x="0" y="0" width="100" height="100" fill="#0f172a" />

                {/* Yardlines */}
                {[20, 35, 50, 65, 80].map((y) => (
                  <g key={`des-yard-${y}`}>
                    <line
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke={y === 65 ? '#0284c7' : 'rgba(56, 189, 248, 0.25)'}
                      strokeWidth={y === 65 ? '0.9' : '0.35'}
                      strokeDasharray={y === 65 ? undefined : '2,2'}
                    />
                    <text
                      x="97"
                      y={y - 1}
                      textAnchor="end"
                      fontSize="2.2"
                      fill="rgba(148, 163, 184, 0.6)"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {y === 65 ? 'LOS' : y === 50 ? '1st Down' : `${y}`}
                    </text>
                  </g>
                ))}

                <text x="3" y="64" fontSize="2.4" fill="#38bdf8" fontWeight="bold" className="font-mono">
                  LOS (65)
                </text>

                {/* Drawn Routes */}
                {(Object.entries(players) as [string, PlayerAssignment][]).map(([key, player]) => {
                  const pts = player.route?.points;
                  if (!pts || pts.length < 2) return null;
                  let d = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 1; i < pts.length; i++) {
                    d += ` L ${pts[i].x} ${pts[i].y}`;
                  }
                  return (
                    <path
                      key={`des-route-${key}`}
                      d={d}
                      fill="none"
                      stroke={player.route.color || '#38bdf8'}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      markerEnd="url(#designer-arrow)"
                    />
                  );
                })}

                {/* Player Tokens (Draggable & Selectable) */}
                {(Object.entries(players) as [string, PlayerAssignment][]).map(([key, player]) => {
                  const isSelected = selectedPlayerKey === key;
                  const isDragging = draggingPlayerKey === key;
                  const isQb = key === 'QB';
                  const isCenter = key === 'C';
                  const isRb = key === 'RB';

                  const fillColor = isQb ? '#dc2626' : isCenter ? '#475569' : isRb ? '#7c3aed' : '#0284c7';

                  return (
                    <g
                      key={`des-token-${key}`}
                      className="cursor-grab active:cursor-grabbing transition-transform"
                      onPointerDown={(e) => handlePointerDown(key, e)}
                    >
                      {/* Selection / Drag halo */}
                      {(isSelected || isDragging) && (
                        <circle
                          cx={player.initialPos.x}
                          cy={player.initialPos.y}
                          r={isDragging ? '4.8' : '4.2'}
                          fill="#facc15"
                          opacity={isDragging ? '0.45' : '0.3'}
                          className={isDragging ? '' : 'animate-pulse'}
                        />
                      )}

                      {/* Main Player Circle */}
                      <circle
                        cx={player.initialPos.x}
                        cy={player.initialPos.y}
                        r="3"
                        fill={fillColor}
                        stroke={isSelected ? '#facc15' : '#ffffff'}
                        strokeWidth={isSelected ? '1' : '0.6'}
                        filter={isSelected ? 'url(#des-glow)' : undefined}
                      />

                      {/* Token Label */}
                      <text
                        x={player.initialPos.x}
                        y={player.initialPos.y + 1}
                        textAnchor="middle"
                        fontSize="2.2"
                        fontWeight="bold"
                        fill="#ffffff"
                        className="font-mono select-none pointer-events-none"
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Position Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {Object.keys(players).map((key) => {
                const isSelected = selectedPlayerKey === key;
                return (
                  <button
                    key={`pos-select-badge-${key}`}
                    onClick={() => setSelectedPlayerKey(key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Formation Presets & Route Assignments */}
          <div className="md:col-span-5 space-y-4">
            {/* Formation Templates Manager Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <LayoutTemplate className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-black text-slate-900 font-display">Formation Templates</label>
                </div>
                <button
                  onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 transition-all"
                  title="Save current 7-player positions as a formation template"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save as Preset</span>
                </button>
              </div>

              {/* Template Dropdown Selector */}
              <div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyFormationTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <optgroup label="Standard Formations">
                    {templates
                      .filter((t) => t.isBuiltIn)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                  {templates.some((t) => !t.isBuiltIn) && (
                    <optgroup label="Custom User Saved Presets">
                      {templates
                        .filter((t) => !t.isBuiltIn)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            ★ {t.name} (Custom)
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Save Template Inline Modal */}
              {isSavingTemplate && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950">Save Current Alignment as Preset</span>
                    <button
                      onClick={() => setIsSavingTemplate(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-semibold text-slate-600 block mb-0.5">
                      Template Preset Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Heavy Bunch Right, Pistol Diamond..."
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-semibold text-slate-600 block mb-0.5">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 3-receiver stack overload for quick screens"
                      value={newTemplateDesc}
                      onChange={(e) => setNewTemplateDesc(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsSavingTemplate(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCurrentAsTemplate}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1 shadow-xs"
                    >
                      <Save className="w-3 h-3" /> Save Preset
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Custom Presets List with Delete options */}
              {templates.some((t) => !t.isBuiltIn) && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Your Saved Formation Templates
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {templates
                      .filter((t) => !t.isBuiltIn)
                      .map((t) => (
                        <div
                          key={`saved-tmpl-${t.id}`}
                          onClick={() => applyFormationTemplate(t.id)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                            selectedTemplateId === t.id
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold'
                              : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          <button
                            onClick={(e) => handleDeleteTemplate(t.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete this custom preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Play Metadata Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div>
                <label className="text-[11px] font-mono text-slate-600 block mb-1">Play Code / Call</label>
                <input
                  type="text"
                  value={playCode}
                  onChange={(e) => setPlayCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                  >
                    <option value="RIGHT">RIGHT</option>
                    <option value="LEFT">LEFT</option>
                    <option value="BALANCED">BALANCED</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-600 block mb-1">Play Type</label>
                  <select
                    value={playType}
                    onChange={(e) => setPlayType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                  >
                    <option value="PASS">PASS</option>
                    <option value="RUN">RUN</option>
                    <option value="SCREEN">SCREEN</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Player Route Assignment */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Assign Route: <span className="text-amber-700 font-mono font-bold">[{selectedPlayerKey}]</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                  {players[selectedPlayerKey]?.route.name}
                </span>
              </div>

              {/* 0-9 Route Grid Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={`route-btn-${num}`}
                    onClick={() => handleRouteSelect(num)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-blue-700 border border-slate-200 font-mono font-bold text-xs transition-all text-center"
                  >
                    #{num}
                  </button>
                ))}
              </div>

              {/* Special Routes */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {['WHEEL', 'WHIP', 'BUBBLE', 'QUICK SLANT', 'QUICK IN', 'SMASH', 'SEAM', 'CORNER POST'].map((spec) => (
                  <button
                    key={`spec-route-${spec}`}
                    onClick={() => handleRouteSelect(spec)}
                    className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-mono transition-all font-semibold"
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
