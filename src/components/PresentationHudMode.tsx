import React, { useState, useEffect } from 'react';
import { Play } from '../types';
import { Play as PlayIcon, Pause, RotateCcw, X, Volume2, Timer, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

interface PresentationHudModeProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
  progress: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (progress: number) => void;
  onPrevPlay?: () => void;
  onNextPlay?: () => void;
}

export const PresentationHudMode: React.FC<PresentationHudModeProps> = ({
  isOpen,
  onClose,
  play,
  progress,
  isPlaying,
  onTogglePlay,
  onSeek,
  onPrevPlay,
  onNextPlay,
}) => {
  const [cadenceText, setCadenceText] = useState<string>('BLUE 80! SET... HUT!');
  const [audibleActive, setAudibleActive] = useState<boolean>(false);

  if (!isOpen) return null;

  // QB Release time based on progress (0 to 3.5s)
  const qbReleaseSeconds = (progress * 3.5).toFixed(1);

  return (
    <div
      id="presentation-hud-mode"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between p-6 pointer-events-none animate-in fade-in duration-200"
    >
      {/* Top Floating HUD Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-mono font-black text-xl flex items-center justify-center shadow-lg border border-blue-400">
            #{play.playNumber}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-wide">{play.code}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                {play.category}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium">{play.englishName}</p>
          </div>
        </div>

        {/* Cadence & Close button */}
        <div className="flex items-center gap-3">
          {/* Live Cadence Call Box */}
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-amber-300 flex items-center gap-2 text-xs font-mono font-bold shadow-lg">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>CADENCE: &quot;{cadenceText}&quot;</span>
          </div>

          <button
            onClick={() => {
              setAudibleActive(!audibleActive);
              setCadenceText(audibleActive ? 'BLUE 80! SET... HUT!' : 'KILL! KILL! CHECK 31 SLANT!');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              audibleActive
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {audibleActive ? 'AUDIBLE CALLED' : 'AUDIBLE / CHECK'}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer shadow-lg transition-colors"
            title="Exit Presentation Mode (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Middle Center Info - Progression highlight */}
      <div className="flex justify-center pointer-events-none">
        <div className="px-6 py-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-md shadow-2xl flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Timer className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-400">QB RELEASE:</span>
            <span className="font-mono text-lg font-black text-emerald-400">{qbReleaseSeconds}s</span>
          </div>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Reads progression */}
          <div className="flex items-center gap-3 text-xs">
            {play.progressionReads.map((read) => {
              const isCurrent =
                (read.order === 1 && progress <= 0.35) ||
                (read.order === 2 && progress > 0.35 && progress <= 0.7) ||
                (read.order >= 3 && progress > 0.7);

              return (
                <div
                  key={read.order}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {read.order}. Read: {read.playerId}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Play Switchers */}
        <div className="flex items-center gap-2">
          {onPrevPlay && (
            <button
              onClick={onPrevPlay}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          )}
          {onNextPlay && (
            <button
              onClick={onNextPlay}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Central Playback Controls */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl">
          <button
            onClick={() => onSeek(0)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Reset to Snap"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          {/* Scrubber slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-48 sm:w-72 accent-blue-500 cursor-pointer"
          />

          <span className="text-xs font-mono font-bold text-slate-300 w-12">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Exit Presentation note */}
        <div className="text-xs text-slate-400 font-mono">
          Press <strong className="text-white">ESC</strong> or button to exit
        </div>
      </div>
    </div>
  );
};
