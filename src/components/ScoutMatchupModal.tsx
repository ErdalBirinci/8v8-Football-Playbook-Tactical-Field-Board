import React from 'react';
import { Play } from '../types';
import { evaluatePlayVsCoverages } from '../data/scoutMatchups';
import { ShieldAlert, X, Star, CheckCircle2, AlertTriangle, Crosshair, ArrowRight } from 'lucide-react';

interface ScoutMatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
}

export const ScoutMatchupModal: React.FC<ScoutMatchupModalProps> = ({
  isOpen,
  onClose,
  play,
}) => {
  if (!isOpen) return null;

  const matchups = evaluatePlayVsCoverages(play);

  return (
    <div
      id="scout-matchup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Scout Matchup Simulator</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  8v8 Coverage Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {play.code} • {play.englishName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Crosshair className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Defensive Read Engine: </span>
              Evaluates route depth, spacing, and QB drops against Cover 1 Man, Cover 2 Zone, Cover 3 Sky, and Cover 0 Blitz to identify mismatches and hot reads.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchups.map((m) => {
              const isA = m.grade === 'A+' || m.grade === 'A';
              const isDanger = m.grade === 'C' || m.grade === 'D';

              return (
                <div
                  key={m.schemeId}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isA
                      ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-500/20'
                      : isDanger
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Scheme & Grade */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{m.schemeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Stars */}
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < m.ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Grade badge */}
                        <span
                          className={`w-8 h-8 rounded-lg font-mono font-extrabold flex items-center justify-center text-xs shadow-2xs ${
                            isA
                              ? 'bg-emerald-600 text-white'
                              : isDanger
                              ? 'bg-rose-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {m.grade}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-700 leading-relaxed">{m.summary}</p>

                    {/* Key Mismatch Box */}
                    <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200 text-xs space-y-1">
                      <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-blue-600" />
                        <span>TACTICAL MISMATCH / VOID</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-[11px]">{m.keyMismatch}</div>
                    </div>
                  </div>

                  {/* Coaching Recommendation */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <span className="font-bold text-blue-700 shrink-0">Coach Call:</span>
                    <span>{m.coachingRecommendation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Finland University 8v8 League Scout Simulator
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
