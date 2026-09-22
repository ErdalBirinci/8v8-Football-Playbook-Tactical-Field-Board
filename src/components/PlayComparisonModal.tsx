import React, { useState } from 'react';
import { Play, PlayerAssignment } from '../types';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import {
  Columns,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  Target,
  Users,
  Compass,
} from 'lucide-react';

interface PlayComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePlay: Play;
  onSelectPlay: (play: Play) => void;
}

export const PlayComparisonModal: React.FC<PlayComparisonModalProps> = ({
  isOpen,
  onClose,
  activePlay,
  onSelectPlay,
}) => {
  const [playAId, setPlayAId] = useState<string>(activePlay.id);
  const [playBId, setPlayBId] = useState<string>(
    ALL_PLAYBOOK_PLAYS.find((p) => p.id !== activePlay.id)?.id || ALL_PLAYBOOK_PLAYS[1].id
  );

  if (!isOpen) return null;

  const playA = ALL_PLAYBOOK_PLAYS.find((p) => p.id === playAId) || activePlay;
  const playB = ALL_PLAYBOOK_PLAYS.find((p) => p.id === playBId) || ALL_PLAYBOOK_PLAYS[1];

  const renderMiniField = (play: Play, colorAccent: string) => {
    return (
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Field Lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full border-t border-b border-dashed border-emerald-500/30 flex flex-col justify-between p-2">
            <div className="border-b border-slate-700 w-full" />
            <div className="border-b border-slate-700 w-full" />
            <div className="border-b border-amber-500/50 w-full" /> {/* Line of scrimmage */}
            <div className="border-b border-slate-700 w-full" />
          </div>
        </div>

        {/* SVG Route Mini Render */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          {/* Line of Scrimmage */}
          <line x1="0" y1="65" x2="100" y2="65" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2,2" />

          {/* Player Routes */}
          {Object.entries(play.players).map(([key, p]) => {
            if (p.route.points.length < 2) return null;
            const pointsStr = p.route.points.map((pt) => `${pt.x},${pt.y}`).join(' ');
            return (
              <polyline
                key={key}
                points={pointsStr}
                fill="none"
                stroke={colorAccent}
                strokeWidth={p.route.isPrimary ? "1.8" : "1.0"}
                strokeOpacity={p.route.isPrimary ? 1.0 : 0.6}
              />
            );
          })}

          {/* Player Starting Badges */}
          {Object.entries(play.players).map(([key, p]) => (
            <g key={key} transform={`translate(${p.initialPos.x}, ${p.initialPos.y})`}>
              <circle
                r="3"
                fill={p.route.isPrimary ? '#f59e0b' : colorAccent}
                stroke="#0f172a"
                strokeWidth="0.8"
              />
              <text
                y="1"
                textAnchor="middle"
                fontSize="2.2"
                fill="#0f172a"
                fontWeight="bold"
              >
                {key}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300">
          {play.formationName}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Concept Overlay & Play Comparison Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  Side-by-Side Analysis
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare route geometries, defensive conflict keys, and progression timing between two concepts
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

        {/* Dual Column Layout */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLAY A COLUMN */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-blue-500/40 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                CONCEPT A (ACTIVE)
              </span>
              <select
                value={playAId}
                onChange={(e) => setPlayAId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {ALL_PLAYBOOK_PLAYS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.formationName}
                  </option>
                ))}
              </select>
            </div>

            {renderMiniField(playA, '#3b82f6')}

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100">{playA.code}</h3>
              <p className="text-xs text-slate-400">{playA.englishName}</p>
            </div>

            {/* Spec Matrix A */}
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> Formation & Direction
                </span>
                <span className="font-semibold text-slate-300">{playA.formationName} ({playA.direction})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" /> Primary Target
                </span>
                <span className="font-semibold text-amber-300">
                  {(Object.entries(playA.players) as [string, PlayerAssignment][]).find(([_, p]) => p.route.isPrimary)?.[0] || 'X'} ({(Object.entries(playA.players) as [string, PlayerAssignment][]).find(([_, p]) => p.route.isPrimary)?.[1].route.name || 'Post'})
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Best vs Coverage
                </span>
                <span className="font-semibold text-emerald-400">{playA.tags.join(', ') || 'Cover 1 / Cover 3'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectPlay(playA);
                onClose();
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Load Concept A to Field Board
            </button>
          </div>

          {/* PLAY B COLUMN */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/40 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                CONCEPT B (COMPARISON)
              </span>
              <select
                value={playBId}
                onChange={(e) => setPlayBId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {ALL_PLAYBOOK_PLAYS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.formationName}
                  </option>
                ))}
              </select>
            </div>

            {renderMiniField(playB, '#10b981')}

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100">{playB.code}</h3>
              <p className="text-xs text-slate-400">{playB.englishName}</p>
            </div>

            {/* Spec Matrix B */}
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Formation & Direction
                </span>
                <span className="font-semibold text-slate-300">{playB.formationName} ({playB.direction})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" /> Primary Target
                </span>
                <span className="font-semibold text-amber-300">
                  {(Object.entries(playB.players) as [string, PlayerAssignment][]).find(([_, p]) => p.route.isPrimary)?.[0] || 'Z'} ({(Object.entries(playB.players) as [string, PlayerAssignment][]).find(([_, p]) => p.route.isPrimary)?.[1].route.name || 'Corner'})
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Best vs Coverage
                </span>
                <span className="font-semibold text-emerald-400">{playB.tags.join(', ') || 'Cover 2 / Quarters'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectPlay(playB);
                onClose();
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Load Concept B to Field Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
