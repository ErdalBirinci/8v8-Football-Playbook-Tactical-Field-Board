import React from 'react';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import {
  BarChart3,
  X,
  PieChart as PieIcon,
  Compass,
  Target,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';

interface OffensiveTendencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OffensiveTendencyModal: React.FC<OffensiveTendencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalPlays = ALL_PLAYBOOK_PLAYS.length;

  // Run vs Pass
  const passPlays = ALL_PLAYBOOK_PLAYS.filter((p) => p.playType === 'PASS').length;
  const runPlays = ALL_PLAYBOOK_PLAYS.filter((p) => p.playType === 'RUN').length;
  const passPercent = Math.round((passPlays / totalPlays) * 100);
  const runPercent = Math.round((runPlays / totalPlays) * 100);

  // Directional Balance
  const rightPlays = ALL_PLAYBOOK_PLAYS.filter((p) => p.direction === 'RIGHT').length;
  const leftPlays = ALL_PLAYBOOK_PLAYS.filter((p) => p.direction === 'LEFT').length;
  const balancedPlays = ALL_PLAYBOOK_PLAYS.filter((p) => p.direction === 'BALANCED').length;

  // Formation Breakdown
  const tripsCount = ALL_PLAYBOOK_PLAYS.filter((p) => p.formationName.includes('Trips')).length;
  const spreadCount = ALL_PLAYBOOK_PLAYS.filter((p) => p.formationName.includes('Twins') || p.formationName.includes('Spread')).length;
  const emptyCount = ALL_PLAYBOOK_PLAYS.filter((p) => p.formationName.includes('Empty')).length;
  const twoLineCount = ALL_PLAYBOOK_PLAYS.filter((p) => p.formationName.includes('2 Line')).length;
  const splitCount = ALL_PLAYBOOK_PLAYS.filter((p) => p.formationName.includes('Split')).length;

  // Target Distribution
  let targetCounts: Record<string, number> = { X: 0, Z: 0, H: 0, Y: 0, RB: 0 };
  ALL_PLAYBOOK_PLAYS.forEach((p) => {
    Object.entries(p.players).forEach(([slot, player]) => {
      if (player.route.isPrimary) {
        targetCounts[slot] = (targetCounts[slot] || 0) + 1;
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Offensive Tendency & Balance Analytics Radar
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  {totalPlays} Total Plays
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Self-scout tendency radar analyzing run/pass balance, formation distribution, and target share
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Top Row: Run vs Pass + Directional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Run vs Pass Balance */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-blue-400" />
                  PLAY CALL RATIO (PASS vs RUN)
                </span>
                <span className="text-xs text-slate-400">{passPlays} Pass / {runPlays} Run</span>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  style={{ width: `${passPercent}%` }}
                >
                  {passPercent}%
                </div>
                <div
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                  style={{ width: `${runPercent}%` }}
                >
                  {runPercent}%
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-300">Passing Concepts ({passPercent}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Run Schemes ({runPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Directional Balance (Boundary vs Field) */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  DIRECTIONAL STRENGTH (RIGHT vs LEFT)
                </span>
                <span className="text-xs text-slate-400">Hash Alignment</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold text-amber-400">{leftPlays}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Left Overload</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold text-cyan-400">{balancedPlays}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Balanced</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold text-blue-400">{rightPlays}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Right Overload</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Share per Receiver Position */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-400" />
                PRIMARY TARGET SHARE (WHO GETS THE FIRST LOOK?)
              </span>
              <span className="text-xs text-slate-400">Progression Read #1</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(targetCounts).map(([pos, count]) => {
                const pct = Math.round((count / Math.max(1, passPlays)) * 100);
                return (
                  <div
                    key={pos}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-1.5"
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs border border-slate-700">
                      {pos}
                    </span>
                    <span className="text-base font-extrabold text-slate-100">{pct}%</span>
                    <span className="text-[10px] text-slate-400">{count} Primary Reads</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formation Category Distribution */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              FORMATION FREQUENCY BREAKDOWN
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-base font-bold text-slate-100">{tripsCount}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Trips 3x1</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-base font-bold text-slate-100">{spreadCount}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Spread / Twins</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-base font-bold text-slate-100">{emptyCount}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Empty 00</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-base font-bold text-slate-100">{twoLineCount}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">2-Line Heavy</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-base font-bold text-slate-100">{splitCount}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Split Backs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
