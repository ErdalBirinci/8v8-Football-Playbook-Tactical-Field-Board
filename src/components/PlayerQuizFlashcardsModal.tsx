import React, { useState } from 'react';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import { Play } from '../types';
import {
  GraduationCap,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface PlayerQuizFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay?: (play: Play) => void;
}

type QuizPosition = 'QB' | 'X' | 'Z' | 'H' | 'Y' | 'RB' | 'C';

export const PlayerQuizFlashcardsModal: React.FC<PlayerQuizFlashcardsModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
}) => {
  const [selectedPos, setSelectedPos] = useState<QuizPosition>('X');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);

  if (!isOpen) return null;

  // Filter plays that have this player assignment
  const relevantPlays = ALL_PLAYBOOK_PLAYS.filter(
    (p) => p.players[selectedPos] !== undefined
  );
  const currentPlay = relevantPlays[currentIndex % Math.max(1, relevantPlays.length)];
  const currentAssignment = currentPlay?.players[selectedPos];

  // Generate 4 multiple-choice options (1 correct + 3 distractor routes)
  const correctAnswer = currentAssignment?.route.name || '9 - Go / Streak';
  const dummyAnswers = [
    'Quick Slant (3-step break at 45°)',
    '12yd Comeback to Boundary',
    'Corner / Flag into Cover 2 Honey Hole',
    '5yd Quick Out to Sideline',
    'Deep Post splitting Safeties',
    'Bubble Screen Behind Line',
    'Pass Protection: Slide Left & Scan A-Gap',
  ].filter((a) => a !== correctAnswer);

  // Consistent 4 choices
  const choices = [correctAnswer, ...dummyAnswers.slice(0, 3)].sort();

  const handleSelectAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);
    setTotalAnswered((prev) => prev + 1);
    if (ans === correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setTotalAnswered(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Position-Specific Flashcard & Quiz Lab
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  Rookie & Veteran Test
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Master your personal assignment, route stem, and blitz protection rule on every play
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

        {/* Position Selector Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-mono text-slate-400 mr-2 font-bold">SELECT POSITION:</span>
            {(['QB', 'X', 'Z', 'H', 'Y', 'RB', 'C'] as QuizPosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => {
                  setSelectedPos(pos);
                  handleReset();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPos === pos
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Score: {score} / {totalAnswered}</span>
            {totalAnswered > 0 && (
              <span className="text-slate-400">({Math.round((score / totalAnswered) * 100)}%)</span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Card Presentation */}
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold">
                PLAY CALL: {currentPlay?.code}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentPlay?.formationName} • {currentPlay?.playType}
              </span>
            </div>

            <div className="py-4 border-t border-b border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-slate-100">
                You are playing: <span className="text-emerald-400">{selectedPos} ({currentAssignment?.positionName || selectedPos})</span>
              </h3>
              <p className="text-sm text-slate-300">
                What is your exact assignment, route stem, or protection responsibility on this play?
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {choices.map((choice, i) => {
                const isSelected = selectedAnswer === choice;
                const isCorrect = choice === correctAnswer;
                let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-200';

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-850 opacity-40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAnswer(choice)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{choice}</span>
                    {selectedAnswer !== null && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {selectedAnswer !== null && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {selectedAnswer !== null && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Coaching Point:</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentAssignment?.roleDescription || currentAssignment?.route.notes || 'Execute stems at full speed and maintain outside leverage.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectPlay && currentPlay && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPlay(currentPlay);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      View on Board
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Next Play</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
