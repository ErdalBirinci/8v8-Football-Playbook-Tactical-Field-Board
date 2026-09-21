import React, { useState, useMemo } from 'react';
import { Play, PlayerAssignment, DefenseScheme, RosterPlayer, TokenDisplayMode } from '../types';
import { getPlayerAssignedToSlot } from '../data/rosterData';
import { DEFENSIVE_SCHEMES } from '../data/defenseSchemes';
import { getDrillsForPlay } from '../data/drillDatabase';
import {
  Printer,
  X,
  FileText,
  Check,
  Copy,
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  Shield,
  HelpCircle,
  Dumbbell,
  Compass,
  ArrowRight,
  Eye,
  Info,
  Users,
} from 'lucide-react';

interface PrintLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
  roster?: RosterPlayer[];
  tokenDisplayMode?: TokenDisplayMode;
}

export const PrintLayoutModal: React.FC<PrintLayoutModalProps> = ({
  isOpen,
  onClose,
  play,
  roster = [],
  tokenDisplayMode = 'jersey',
}) => {
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [colorMode, setColorMode] = useState<'monochrome' | 'color' | 'chalkboard'>('monochrome');
  const [includeAssignments, setIncludeAssignments] = useState(true);
  const [includeQBReads, setIncludeQBReads] = useState(true);
  const [includeCoachingPoints, setIncludeCoachingPoints] = useState(true);
  const [includeNotesBox, setIncludeNotesBox] = useState(true);
  const [includeDefense, setIncludeDefense] = useState(false);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string>('cover-2');
  const [includeDrills, setIncludeDrills] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Selected defense scheme
  const selectedDefense: DefenseScheme | undefined = useMemo(() => {
    if (!includeDefense) return undefined;
    return DEFENSIVE_SCHEMES.find((d) => d.id === selectedDefenseId) || DEFENSIVE_SCHEMES[0];
  }, [includeDefense, selectedDefenseId]);

  // Associated drills
  const { primaryDrills } = useMemo(() => {
    return getDrillsForPlay(play);
  }, [play]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert route points to SVG path string
  const getRouteSvgPath = (points: { x: number; y: number }[]) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  // Generate plain text / markdown install sheet to copy
  const handleCopyText = () => {
    const lines = [
      `==================================================`,
      `PLAY INSTALLATION SHEET: ${play.code}`,
      `English: ${play.englishName}`,
      `Concept: ${play.conceptName}`,
      `Formation: ${play.formationName} | Category: ${play.category}`,
      `Play Type: ${play.playType} | Strength: ${play.direction} | QB Drop: ${play.qbDrop || '3-Step Gun'}`,
      `==================================================`,
      ``,
      `[PLAYER ASSIGNMENTS & ROUTES]`,
      ...(Object.entries(play.players) as [string, PlayerAssignment][]).map(([pos, p]) => {
        return `• ${pos} (${p.label}): ${p.route.name}${p.route.routeNumber !== undefined ? ` [Route #${p.route.routeNumber}]` : ''} - ${p.roleDescription || p.route.notes || ''}`;
      }),
      ``,
      `[QB PROGRESSION READS]`,
      ...play.progressionReads.map((read) => `  ${read.order}. ${read.playerId} - ${read.concept}: ${read.cue}`),
      ``,
      `[COACHING POINTS]`,
      ...(play.coachingPoints || []).map((cp) => `  * ${cp}`),
      ``,
      `==================================================`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Styling helpers based on colorMode
  const isMono = colorMode === 'monochrome';
  const isDark = colorMode === 'chalkboard';

  const fieldBgColor = isMono ? '#ffffff' : isDark ? '#0f172a' : '#f8fafc';
  const fieldLineColor = isMono ? '#0f172a' : isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
  const fieldYardTextColor = isMono ? '#334155' : isDark ? 'rgba(255,255,255,0.4)' : '#64748b';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-7xl max-h-[96vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none print:bg-white print:overflow-visible">
        
        {/* ================= MODAL HEADER (Hidden in Print) ================= */}
        <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-white print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-display">
                  Print Layout Mode
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {paperSize.toUpperCase()} • {orientation.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Printer-friendly installation card formatted for standard paper
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs border border-slate-600 active:scale-95"
              title="Copy text breakdown to clipboard"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              id="trigger-print-btn"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= CONTROLS TOOLBAR (Hidden in Print) ================= */}
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 print:hidden shrink-0">
          {/* Paper Settings */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Paper Size */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Size:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                <button
                  onClick={() => setPaperSize('a4')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    paperSize === 'a4'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  A4 (210×297mm)
                </button>
                <button
                  onClick={() => setPaperSize('letter')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    paperSize === 'letter'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  US Letter (8.5×11")
                </button>
              </div>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Orientation:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    orientation === 'portrait'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Portrait (Single Column)
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    orientation === 'landscape'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Landscape (Wide Board)
                </button>
              </div>
            </div>

            {/* Ink Style */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Color Style:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                <button
                  onClick={() => setColorMode('monochrome')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    colorMode === 'monochrome'
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Crisp high-contrast black & white (saves printer ink)"
                >
                  B&amp;W Ink Saver
                </button>
                <button
                  onClick={() => setColorMode('color')}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                    colorMode === 'color'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vibrant high-contrast color lines"
                >
                  Tactical Color
                </button>
              </div>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeAssignments}
                onChange={(e) => setIncludeAssignments(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Route Matrix</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeQBReads}
                onChange={(e) => setIncludeQBReads(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>QB Progression</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeCoachingPoints}
                onChange={(e) => setIncludeCoachingPoints(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Coaching Keys</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeNotesBox}
                onChange={(e) => setIncludeNotesBox(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Coach Notes Lines</span>
            </label>

            {/* Defense Shell Toggle */}
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeDefense}
                  onChange={(e) => setIncludeDefense(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Defense Overlay:</span>
              </label>
              {includeDefense && (
                <select
                  value={selectedDefenseId}
                  onChange={(e) => setSelectedDefenseId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
                >
                  {DEFENSIVE_SCHEMES.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.shortName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* ================= PRINTABLE CANVAS PREVIEW CONTAINER ================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/90 flex justify-center print:p-0 print:bg-white print:overflow-visible print:block">
          {/* Standard Sheet Container */}
          <div
            id="printable-play-sheet"
            className={`w-full bg-white text-slate-900 transition-all shadow-xl print:shadow-none print:border-none print:w-full print:p-0 print:m-0 ${
              paperSize === 'a4'
                ? orientation === 'portrait'
                  ? 'max-w-[210mm] min-h-[297mm] p-6 sm:p-8 rounded-lg'
                  : 'max-w-[297mm] min-h-[210mm] p-6 sm:p-8 rounded-lg'
                : orientation === 'portrait'
                ? 'max-w-[8.5in] min-h-[11in] p-6 sm:p-8 rounded-lg'
                : 'max-w-[11in] min-h-[8.5in] p-6 sm:p-8 rounded-lg'
            }`}
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            {/* ================= OFFICIAL PLAYBOOK HEADER ================= */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src="/aalto-predators-logo.svg"
                    alt="Aalto Predators Logo"
                    className="w-12 h-12 object-contain shrink-0 mt-0.5 rounded-lg bg-black p-0.5 border border-red-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider">
                        AALTO PREDATORS 8v8 INSTALL
                      </span>
                      <span className="px-2 py-0.5 rounded border border-slate-900 font-mono font-bold text-[10px] text-slate-900">
                        {play.category}
                      </span>
                    <span className="px-2 py-0.5 rounded border border-slate-400 font-mono text-[10px] text-slate-700">
                      DIR: {play.direction}
                    </span>
                    <span className="px-2 py-0.5 rounded border border-slate-400 font-mono text-[10px] text-slate-700">
                      TYPE: {play.playType}
                    </span>
                    {play.qbDrop && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-[10px] text-slate-900">
                        DROP: {play.qbDrop}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase font-display leading-none mt-1">
                    {play.code}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-700 font-semibold">
                    <span>{play.englishName}</span>
                    {play.conceptName && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 italic">{play.conceptName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    PLAYBOOK REF
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900">
                    #{play.playNumber || play.id.replace('play-', '')}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    FORMATION: {play.formationName}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= MAIN CONTENT LAYOUT (Portrait vs Landscape) ================= */}
            {orientation === 'landscape' ? (
              /* LANDSCAPE LAYOUT: 2 Columns (Field Diagram Left, Detail Columns Right) */
              <div className="grid grid-cols-12 gap-5 items-start">
                {/* Left: Vector Field Diagram (7 cols) */}
                <div className="col-span-7 space-y-3">
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-white shadow-2xs">
                    {renderFieldSvg()}
                  </div>

                  {/* Diagram Legend */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 px-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Primary Read
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span> 2nd Read
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span> Slot Route
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-slate-900 border-b border-dashed border-slate-900 inline-block"></span> Motion
                      </span>
                    </div>
                    <span className="font-bold">LOS: 50 YARD LINE</span>
                  </div>

                  {/* Coaching Points in Landscape */}
                  {includeCoachingPoints && play.coachingPoints && play.coachingPoints.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1 text-xs">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 font-mono">
                        COACHING EXECUTION KEYS:
                      </h4>
                      <ul className="space-y-1 text-[11px] text-slate-800 list-disc list-inside">
                        {play.coachingPoints.map((pt, idx) => (
                          <li key={`ls-cp-${idx}`}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: Assignments, QB Reads, Coach Notes (5 cols) */}
                <div className="col-span-5 space-y-3">
                  {/* QB Progression Reads */}
                  {includeQBReads && (
                    <div className="border border-slate-900 rounded-lg p-3 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 font-mono">
                          QB PROGRESSION READS
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded">
                          {play.qbDrop || '3-STEP GUN'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {play.progressionReads.map((read) => (
                          <div
                            key={`ls-read-${read.order}`}
                            className="flex items-start gap-2 text-[11px]"
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {read.order}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900">
                                {read.playerId}: {read.concept}
                              </span>
                              <p className="text-[10px] text-slate-600 leading-tight">
                                {read.cue}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Route Assignments Table */}
                  {includeAssignments && (
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                      <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 font-mono">
                        PLAYER ASSIGNMENT MATRIX
                      </div>
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 font-mono text-[9px] text-slate-700">
                            <th className="p-1.5 font-bold">POS</th>
                            <th className="p-1.5 font-bold">ROUTE &amp; DEPTH</th>
                            <th className="p-1.5 font-bold">ASSIGNMENT / CUE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([posKey, p]) => (
                            <tr key={`ls-table-${posKey}`} className="hover:bg-slate-50">
                              <td className="p-1.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {posKey}
                              </td>
                              <td className="p-1.5 font-semibold text-slate-800">
                                {p.route.name}
                                {p.route.routeNumber !== undefined && (
                                  <span className="ml-1 text-[9px] font-mono px-1 py-0.2 bg-slate-200 rounded">
                                    #{p.route.routeNumber}
                                  </span>
                                )}
                              </td>
                              <td className="p-1.5 text-slate-600 text-[9px]">
                                {p.roleDescription || p.route.notes || 'Execute route'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Coach Notes Box */}
                  {includeNotesBox && (
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-white space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700">
                        <span>COACH PRACTICE / GAMEDAY NOTES:</span>
                        <span className="text-[9px] text-slate-400">CALL #: ____</span>
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="border-b border-slate-300 h-4"></div>
                        <div className="border-b border-slate-300 h-4"></div>
                        <div className="border-b border-slate-300 h-4"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* PORTRAIT LAYOUT: Vertical Flow (Field Top, Matrix & Reads Below) */
              <div className="space-y-4">
                {/* 1. Field Schematic */}
                <div className="border border-slate-900 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <div className="aspect-[16/10] w-full">
                    {renderFieldSvg()}
                  </div>
                </div>

                {/* Field Legend */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 px-1 border-b border-slate-200 pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Primary Read
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span> 2nd Read
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span> Slot Route
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <span className="w-2.5 h-0.5 bg-slate-900 border-b border-dashed border-slate-900 inline-block"></span> Motion
                    </span>
                  </div>
                  <span className="font-bold text-slate-800">LINE OF SCRIMMAGE: 50 YARDS</span>
                </div>

                {/* 2. Grid of Details: Route Matrix + QB Progression Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Player Assignment Matrix (7 cols) */}
                  {includeAssignments && (
                    <div className="col-span-1 md:col-span-7 border border-slate-900 rounded-lg overflow-hidden">
                      <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 font-mono flex items-center justify-between">
                        <span>PLAYER ROUTE &amp; ALIGNMENT MATRIX</span>
                        <span className="text-[9px] text-slate-300 font-normal">8-PLAYER ROSTER (8v8)</span>
                      </div>
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 font-mono text-[9px] text-slate-700">
                            <th className="p-1.5 font-bold w-12">POS</th>
                            <th className="p-1.5 font-bold">PLAYER / JERSEY</th>
                            <th className="p-1.5 font-bold">ROUTE</th>
                            <th className="p-1.5 font-bold">ASSIGNMENT &amp; BREAK CUES</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([posKey, p]) => {
                            const rosterPlayer = getPlayerAssignedToSlot(posKey, roster);

                            return (
                              <tr key={`pt-table-${posKey}`} className="hover:bg-slate-50">
                                <td className="p-1.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                    posKey === 'QB'
                                      ? 'bg-red-100 text-red-900 border border-red-300'
                                      : p.route.isPrimary
                                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {posKey}
                                  </span>
                                </td>
                                <td className="p-1.5 font-bold text-slate-900 text-[10px]">
                                  {rosterPlayer ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="font-mono bg-slate-200 px-1 py-0.2 rounded text-[9px] text-slate-800">
                                        #{rosterPlayer.jerseyNumber}
                                      </span>
                                      <span>{rosterPlayer.name}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 font-normal">{p.label}</span>
                                  )}
                                </td>
                                <td className="p-1.5 font-bold text-slate-900 text-[10px]">
                                  {p.route.name}
                                  {p.route.routeNumber !== undefined && (
                                    <span className="ml-1 text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-800 rounded">
                                      #{p.route.routeNumber}
                                    </span>
                                  )}
                                </td>
                                <td className="p-1.5 text-slate-700 text-[10px]">
                                  {p.roleDescription || p.route.notes || 'Run assigned route with separation'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* QB Progression Reads (5 cols) */}
                  {includeQBReads && (
                    <div className="col-span-1 md:col-span-5 border border-slate-900 rounded-lg p-3 bg-slate-50 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 font-mono">
                          QB READ &amp; PROGRESSION
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                          {play.qbDrop || '3-STEP GUN'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {play.progressionReads.map((read) => (
                          <div
                            key={`pt-read-${read.order}`}
                            className="flex items-start gap-2 text-[11px]"
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {read.order}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">
                                {read.playerId}: {read.concept}
                              </div>
                              <p className="text-[10px] text-slate-600 leading-tight">
                                {read.cue}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Coaching Points & Coach Handwritten Notes */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                  {/* Coaching Points (7 cols) */}
                  {includeCoachingPoints && play.coachingPoints && play.coachingPoints.length > 0 && (
                    <div className="col-span-1 md:col-span-7 p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1.5">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                        <span>TACTICAL COACHING KEYS:</span>
                      </h4>
                      <ul className="space-y-1 text-[11px] text-slate-800 list-disc list-inside">
                        {play.coachingPoints.map((pt, idx) => (
                          <li key={`pt-cp-${idx}`} className="leading-snug">
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Coach Practice Notes (5 cols) */}
                  {includeNotesBox && (
                    <div className="col-span-1 md:col-span-5 border border-slate-300 rounded-lg p-3 bg-white space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800">
                        <span>GAMEDAY / PRACTICE NOTES:</span>
                        <span className="text-[10px] text-slate-400">WRISTBAND #: ____</span>
                      </div>
                      <div className="space-y-2.5 pt-1">
                        <div className="border-b border-slate-300 h-3.5"></div>
                        <div className="border-b border-slate-300 h-3.5"></div>
                        <div className="border-b border-slate-300 h-3.5"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= PRINT FOOTER ================= */}
            <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>8v8 Flag &amp; Tackle Football Playbook System (Finland University League) • {play.code}</span>
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Function to render the vector SVG field diagram
  function renderFieldSvg() {
    return (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          {/* Arrowhead Markers for Print */}
          <marker
            id="print-arrow-mono"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#0f172a' : '#2563eb'} />
          </marker>
          <marker
            id="print-arrow-secondary"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#475569' : '#059669'} />
          </marker>
          <marker
            id="print-arrow-amber"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#334155' : '#d97706'} />
          </marker>
          <marker
            id="print-arrow-pink"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#334155' : '#db2777'} />
          </marker>
          <marker
            id="print-arrow-purple"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#334155' : '#9333ea'} />
          </marker>
          <marker
            id="print-arrow-motion"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="3.5"
            markerHeight="3.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isMono ? '#0f172a' : '#ea580c'} />
          </marker>
        </defs>

        {/* Field Background */}
        <rect x="0" y="0" width="100" height="100" fill={fieldBgColor} />

        {/* End Zone */}
        <rect
          x="0"
          y="0"
          width="100"
          height="12"
          fill={isMono ? '#f1f5f9' : isDark ? '#1e293b' : '#e2e8f0'}
          stroke={fieldLineColor}
          strokeWidth="0.5"
        />
        <text
          x="50"
          y="8"
          textAnchor="middle"
          fontSize="4"
          fontWeight="bold"
          fill={fieldYardTextColor}
          letterSpacing="0.4em"
          fontFamily="monospace"
        >
          END ZONE
        </text>

        {/* Goal Line */}
        <line x1="0" y1="12" x2="100" y2="12" stroke={fieldLineColor} strokeWidth="0.8" />

        {/* Yardlines */}
        {[
          { y: 22, yard: '10' },
          { y: 32, yard: '20' },
          { y: 42, yard: '30' },
          { y: 52, yard: '40' },
          { y: 65, yard: '50' }, // Line of Scrimmage
          { y: 76, yard: '40' },
          { y: 88, yard: '30' },
        ].map((line, idx) => (
          <g key={`print-yard-${idx}`}>
            <line
              x1="0"
              y1={line.y}
              x2="100"
              y2={line.y}
              stroke={line.y === 65 ? (isMono ? '#0f172a' : '#2563eb') : fieldLineColor}
              strokeWidth={line.y === 65 ? '0.8' : '0.35'}
              strokeDasharray={line.y === 65 ? undefined : '1.5,1.5'}
            />
            {line.y !== 65 && (
              <>
                <text
                  x="6"
                  y={line.y + 1.2}
                  fontSize="2.4"
                  fontWeight="bold"
                  fill={fieldYardTextColor}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {line.yard}
                </text>
                <text
                  x="94"
                  y={line.y + 1.2}
                  fontSize="2.4"
                  fontWeight="bold"
                  fill={fieldYardTextColor}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {line.yard}
                </text>
              </>
            )}
            {line.y === 65 && (
              <text
                x="94"
                y={line.y - 1.2}
                fontSize="2"
                fontWeight="bold"
                fill={isMono ? '#0f172a' : '#2563eb'}
                textAnchor="end"
                fontFamily="monospace"
              >
                LOS (50)
              </text>
            )}
          </g>
        ))}

        {/* Hash Marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const yPos = 16 + i * 3.2;
          if (yPos > 94) return null;
          return (
            <g key={`print-hash-${i}`} opacity="0.4">
              <line x1="38" y1={yPos} x2="40" y2={yPos} stroke={fieldLineColor} strokeWidth="0.3" />
              <line x1="60" y1={yPos} x2="62" y2={yPos} stroke={fieldLineColor} strokeWidth="0.3" />
            </g>
          );
        })}

        {/* ================= DEFENSIVE PLAYERS (If enabled) ================= */}
        {selectedDefense && (
          <g>
            {selectedDefense.players.map((defPlayer) => (
              <g key={`print-def-${defPlayer.id}`}>
                <circle
                  cx={defPlayer.initialPos.x}
                  cy={defPlayer.initialPos.y}
                  r="2.2"
                  fill="#ffffff"
                  stroke="#be123c"
                  strokeWidth="0.6"
                  strokeDasharray="1,0.5"
                />
                <text
                  x={defPlayer.initialPos.x}
                  y={defPlayer.initialPos.y + 0.8}
                  textAnchor="middle"
                  fontSize="1.7"
                  fontWeight="bold"
                  fill="#be123c"
                  fontFamily="monospace"
                >
                  {defPlayer.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* ================= OFFENSIVE ROUTES ================= */}
        {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
          const isPrimary = player.route.isPrimary;
          const isBallCarrier = player.route.isBallCarrier;
          const isBlocking = player.route.isBlocking;

          let strokeColor = '#0f172a';
          let markerEnd = 'url(#print-arrow-mono)';

          if (!isMono) {
            strokeColor = player.route.color || '#2563eb';
            if (isBallCarrier) {
              strokeColor = '#dc2626';
            } else if (isPrimary) {
              strokeColor = '#2563eb';
              markerEnd = 'url(#print-arrow-mono)';
            } else if (player.route.isSecondary) {
              strokeColor = '#059669';
              markerEnd = 'url(#print-arrow-secondary)';
            } else if (strokeColor === '#f59e0b' || strokeColor === '#d97706') {
              markerEnd = 'url(#print-arrow-amber)';
            } else if (strokeColor === '#ec4899' || strokeColor === '#db2777') {
              markerEnd = 'url(#print-arrow-pink)';
            } else if (strokeColor === '#a855f7' || strokeColor === '#9333ea') {
              markerEnd = 'url(#print-arrow-purple)';
            }
          } else {
            // Monochrome differentiation
            if (isPrimary) {
              strokeColor = '#0f172a';
            } else if (player.route.isSecondary) {
              strokeColor = '#334155';
            } else {
              strokeColor = '#475569';
            }
          }

          const routeSvg = getRouteSvgPath(player.route.points);

          return (
            <g key={`print-route-${key}`}>
              {/* Pre-Snap Motion */}
              {player.motion && (
                <g>
                  <line
                    x1={player.motion.startPos.x}
                    y1={player.motion.startPos.y}
                    x2={player.motion.endPos.x}
                    y2={player.motion.endPos.y}
                    stroke={isMono ? '#0f172a' : '#ea580c'}
                    strokeWidth="0.7"
                    strokeDasharray="1.5,1.5"
                    markerEnd="url(#print-arrow-motion)"
                  />
                  <circle
                    cx={player.motion.startPos.x}
                    cy={player.motion.startPos.y}
                    r="1.3"
                    fill="none"
                    stroke={isMono ? '#0f172a' : '#ea580c'}
                    strokeWidth="0.5"
                    strokeDasharray="1,1"
                  />
                  <text
                    x={(player.motion.startPos.x + player.motion.endPos.x) / 2}
                    y={(player.motion.startPos.y + player.motion.endPos.y) / 2 - 1.2}
                    textAnchor="middle"
                    fontSize="1.6"
                    fontWeight="bold"
                    fill={isMono ? '#0f172a' : '#ea580c'}
                    fontFamily="monospace"
                  >
                    MOTION
                  </text>
                </g>
              )}

              {/* Route Vector Path */}
              <path
                d={routeSvg}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isPrimary ? '1.2' : isBallCarrier ? '1.3' : '0.85'}
                strokeDasharray={player.route.isFake ? '2,1.5' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={isBlocking ? undefined : markerEnd}
              />

              {/* Blocking T-Bar */}
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

              {/* Route Number Badge at target endpoint */}
              {player.route.routeNumber !== undefined && (
                (() => {
                  const targetPt = player.route.points[player.route.points.length - 1];
                  return (
                    <g>
                      <rect
                        x={targetPt.x - 2.6}
                        y={targetPt.y - 3.4}
                        width="5.2"
                        height="3"
                        rx="0.8"
                        fill="#ffffff"
                        stroke={strokeColor}
                        strokeWidth="0.5"
                      />
                      <text
                        x={targetPt.x}
                        y={targetPt.y - 1.4}
                        textAnchor="middle"
                        fontSize="1.9"
                        fontWeight="bold"
                        fill={strokeColor}
                        fontFamily="monospace"
                      >
                        {player.route.routeNumber}
                      </text>
                    </g>
                  );
                })()
              )}
            </g>
          );
        })}

        {/* ================= OFFENSIVE PLAYER TOKENS ================= */}
        {(Object.entries(play.players) as [string, PlayerAssignment][]).map(([key, player]) => {
          const pos = player.initialPos;
          const isPrimary = player.route.isPrimary;
          const isBallCarrier = player.route.isBallCarrier;

          const rosterPlayer = getPlayerAssignedToSlot(key, roster);
          const jerseyNum = rosterPlayer ? rosterPlayer.jerseyNumber : null;

          let tokenMainText = key;
          if (tokenDisplayMode === 'jersey' && jerseyNum) {
            tokenMainText = `${jerseyNum}`;
          } else if (tokenDisplayMode === 'both' && jerseyNum) {
            tokenMainText = `${jerseyNum}`;
          } else if (tokenDisplayMode === 'name' && rosterPlayer) {
            const lastName = rosterPlayer.name.split(' ').pop() || rosterPlayer.name;
            tokenMainText = lastName.slice(0, 4).toUpperCase();
          }

          let fill = '#ffffff';
          let stroke = '#0f172a';
          let textColor = '#0f172a';

          if (!isMono) {
            if (key === 'QB') {
              fill = '#dc2626';
              stroke = '#991b1b';
              textColor = '#ffffff';
            } else if (key === 'C') {
              fill = '#475569';
              stroke = '#1e293b';
              textColor = '#ffffff';
            } else if (isBallCarrier) {
              fill = '#ea580c';
              stroke = '#9a3412';
              textColor = '#ffffff';
            } else if (isPrimary) {
              fill = '#2563eb';
              stroke = '#1e40af';
              textColor = '#ffffff';
            } else if (player.route.isSecondary) {
              fill = '#059669';
              stroke = '#065f46';
              textColor = '#ffffff';
            } else if (key.includes('RB')) {
              fill = '#7c3aed';
              stroke = '#5b21b6';
              textColor = '#ffffff';
            } else {
              fill = '#0f172a';
              stroke = '#0284c7';
              textColor = '#ffffff';
            }
          } else {
            // High contrast monochrome
            if (key === 'QB') {
              fill = '#0f172a';
              stroke = '#0f172a';
              textColor = '#ffffff';
            } else if (isPrimary) {
              fill = '#e2e8f0';
              stroke = '#0f172a';
              textColor = '#0f172a';
            } else {
              fill = '#ffffff';
              stroke = '#0f172a';
              textColor = '#0f172a';
            }
          }

          return (
            <g key={`print-player-${key}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="2.5"
                fill={fill}
                stroke={stroke}
                strokeWidth="0.6"
              />
              <text
                x={pos.x}
                y={pos.y + 0.85}
                textAnchor="middle"
                fontSize={tokenMainText.length > 2 ? '1.5' : '1.9'}
                fontWeight="bold"
                fill={textColor}
                fontFamily="monospace"
              >
                {tokenMainText}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
};
