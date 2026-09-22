import React, { useState, useEffect } from 'react';
import { Play } from '../types';
import { footballAudio } from '../utils/audioSynthesizer';
import {
  Volume2,
  VolumeX,
  Clock,
  Shield,
  Zap,
  Radio,
  Flame,
} from 'lucide-react';

interface BroadcastScorebugProps {
  play: Play;
  isPlaying: boolean;
  progress: number;
  onTogglePlay?: () => void;
  onReset?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onAudibleTrigger?: () => void;
}

export const BroadcastScorebug: React.FC<BroadcastScorebugProps> = ({
  play,
  isPlaying,
  progress,
  onTogglePlay,
  onReset,
  isMuted = false,
  onToggleMute,
  onAudibleTrigger,
}) => {
  const [down, setDown] = useState<number>(1);
  const [distance, setDistance] = useState<number>(10);
  const [yardLine, setYardLine] = useState<string>('OPP 32');
  const [playClock, setPlayClock] = useState<number>(25);

  // Play clock countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayClock((prev) => (prev <= 1 ? 25 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      footballAudio.toggleMute();
    }
  };

  // Pocket collapse calculation (typically ~2.4s standard 3-man slide, progress: 0 to 1 over ~4s)
  const currentTime = progress * 4.0;
  const maxPocketTime = 2.4;
  const pocketElapsed = Math.min(currentTime, maxPocketTime);
  const pocketPercent = Math.max(0, 100 - (pocketElapsed / maxPocketTime) * 100);

  const getPocketColor = () => {
    if (pocketPercent > 50) return 'bg-emerald-500';
    if (pocketPercent > 20) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  const currentPlay = play;

  return (
    <div className="w-full bg-slate-950/95 border-b border-slate-800 shadow-xl px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none">
      {/* Left: Team Crest & Down/Distance Badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-700 to-red-950 px-2.5 py-1 rounded-lg border border-red-500/50 shadow-sm">
          <span className="font-extrabold text-white tracking-wider text-xs font-sans">
            AALTO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
        </div>

        {/* Down & Distance Box */}
        <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden">
          <div className="px-2 py-1 bg-amber-500/20 text-amber-300 font-bold border-r border-slate-700/80 flex items-center gap-1">
            <span>{down}st & {distance}</span>
          </div>
          <div className="px-2 py-1 text-slate-300 font-semibold bg-slate-800/80">
            {yardLine}
          </div>
        </div>

        {/* Formation & Play */}
        {currentPlay && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span className="text-cyan-400 font-bold">{currentPlay.formationName || 'FORMATION'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-200 truncate max-w-[200px]" title={currentPlay.code}>
              {currentPlay.code || 'PLAY'}
            </span>
          </div>
        )}
      </div>

      {/* Center: Pocket Collapse Timer (Functional #4) */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>POCKET INTEGRITY</span>
        </div>
        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-100 ${getPocketColor()}`}
            style={{ width: `${pocketPercent}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-bold ${
            pocketPercent <= 20 ? 'text-rose-400' : 'text-slate-300'
          }`}
        >
          {Math.max(0, maxPocketTime - pocketElapsed).toFixed(1)}s
        </span>
      </div>

      {/* Right: Play Clock, Audible Button & Audio Toggle */}
      <div className="flex items-center gap-2">
        {/* Play Clock */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-bold ${
            playClock <= 5
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-amber-400'
          }`}
          title="Play Clock"
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>:{playClock < 10 ? `0${playClock}` : playClock}</span>
        </div>

        {/* Quick Audible Button (Functional #3) */}
        {(onAudibleTrigger) && (
          <button
            type="button"
            onClick={onAudibleTrigger}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold rounded-lg border border-amber-400 flex items-center gap-1 transition-all cursor-pointer text-xs"
            title="Pre-Snap Audible & Hot Route Bar"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">AUDIBLE</span>
          </button>
        )}

        {/* Audio Synthesizer Toggle (Functional #10) */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
          }`}
          title={isMuted ? 'Unmute Stadium Audio' : 'Mute Stadium Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
