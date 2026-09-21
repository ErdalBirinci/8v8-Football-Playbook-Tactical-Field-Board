import React, { useState, useEffect } from 'react';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import { ROUTE_TREE } from '../data/routeTree';
import { PLAYBOOK_GLOSSARY } from '../data/glossary';
import { X, Award, CheckCircle, XCircle, RotateCcw, Zap, HelpCircle, Trophy } from 'lucide-react';

interface QuizQuestion {
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PlaybookQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaybookQuizModal: React.FC<PlaybookQuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate randomized quiz questions with English & Finnish terms
  const generateQuiz = () => {
    const generated: QuizQuestion[] = [
      {
        question: 'What is the Finnish football term for "Quarterback (QB)"?',
        category: 'English - Finnish Terminology',
        options: ['Pelinrakentaja', 'Keskushyökkääjä', 'Sentteri', 'Laitahyökkääjä'],
        correctIndex: 0,
        explanation: 'In Finnish football terminology, Quarterback is "Pelinrakentaja", the player who conducts the offense.',
      },
      {
        question: 'In play "97. TRIPS RIGHT 1 7 8", what route does outside WR (Z) run?',
        category: 'Trips Pass Concept',
        options: ['Route 1 (Flat / Sivurakukuvio)', 'Route 7 (Corner / Kulmalippukuvio)', 'Route 8 (Post / Maalitolppakuvio)', 'Route 4 (Curl / Koukkukuvio)'],
        correctIndex: 0,
        explanation: 'In the Trips 3-digit naming sequence (WR1, SR2, SR1), outside WR Z runs 1 (Flat), Y runs 7 (Corner), and inside H runs 8 (Post).',
      },
      {
        question: 'In the Finland University League 8v8 format, what is the core structural difference from 7v7?',
        category: '8v8 University League Rules',
        options: [
          'Addition of a 4th Wide Receiver (+1 WR: W Inside Slot) making 8 players total',
          'Two fullbacks added behind the quarterback',
          'Fields are shortened to 30 yards with 3 downs only',
          'Only running plays are permitted on first down',
        ],
        correctIndex: 0,
        explanation: 'In the Finnish University League, 8v8 adds an extra Wide Receiver (+1 WR, W Inside Slot) to create high-powered 4-receiver route distributions.',
      },
      {
        question: 'In standard 8v8 route numbering, what is Route 7 (Corner / Flag)?',
        category: 'Route Tree / Heittoreitit',
        options: [
          'Dig / In (10-12 yds square cut)',
          'Corner / Flag (10-12 yds cutting 45° towards sideline pylon)',
          'Post (12-15 yds towards goalposts)',
          'Flat (3-5 yds)',
        ],
        correctIndex: 1,
        explanation: 'Route 7 is the Corner (Flag) route, breaking at 10-12 yards at a 45-degree angle toward the back corner of the endzone.',
      },
      {
        question: 'What is "Heittosuojaus (Pass Protection)" in 8v8 offense?',
        category: 'Blocking & Protection',
        options: [
          'Center and RB blocking to seal rushers and keep the QB pocket clean',
          'Perimeter Bubble Screen with slot receivers',
          'Lead block out on the perimeter sweep',
          'Direct Dive run into the A-gap',
        ],
        correctIndex: 0,
        explanation: 'Heittosuojaus (Pass Protection) refers to assigning backfield/center blockers to protect the Quarterback against rushing defenders.',
      },
      {
        question: 'What does "Trips-muodostelma (Trips Formation)" mean?',
        category: 'Formations / Muodostelmat',
        options: [
          'Three receivers aligned on the same side of the field',
          'Two receivers on each side with an empty backfield',
          'Two running backs split behind the quarterback',
          'All receivers stacked in single file line',
        ],
        correctIndex: 0,
        explanation: 'Trips formation floods 3 receivers to one side of the formation with isolated receivers on the backside.',
      },
      {
        question: 'In 8v8 defense, which coverage divides deep field responsibilities between 2 safeties (each covering a deep half)?',
        category: 'Defensive Schemes / Aluepuolustus',
        options: ['Cover 0 (Pure Man)', 'Cover 1 (Single High)', 'Cover 2 Zone (Kahden syvän takamiehen aluepuolustus)', 'Cover 3 Deep Thirds'],
        correctIndex: 2,
        explanation: 'Cover 2 features two deep safeties defending deep halves, with underneath defenders in flat and hook-curl zones.',
      },
      {
        question: 'What is a "Sweep (Sivurajajuoksu / Ulkokiertojuoksu)" in 8v8 run concepts?',
        category: 'Run Game / Juoksupeli',
        options: [
          'An outside perimeter run stretching wide toward the sideline before turning upfield',
          'A direct sneak right up the center gap',
          'A deep hail mary pass to the endzone',
          'A quick slant across the middle',
        ],
        correctIndex: 0,
        explanation: 'A Sweep stretches the perimeter with lateral speed toward the sideline before cutting upfield.',
      },
      {
        question: 'What does "Empty Backfield (Tyhjä takakenttä)" signify in 8v8?',
        category: 'Formations / Muodostelmat',
        options: [
          'No running backs in the backfield; 6 eligible receivers spread out wide (+1 WR)',
          'Defense playing with no safeties in deep coverage',
          'Only one receiver on the line of scrimmage',
          'Direct center snap under center with full house backfield',
        ],
        correctIndex: 0,
        explanation: 'In 8v8 Empty Backfield, 6 eligible receivers spread across the line with zero runners behind the QB.',
      },
    ];

    setQuestions(generated.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateQuiz();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                8v8 Playbook &amp; Terminology Quiz
              </h3>
              <p className="text-xs text-slate-500">
                Test your mastery of 8v8 routes, reads, formations &amp; Finnish-English terms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500">Score:</span>
              <span className="font-bold text-blue-700">{score}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isFinished && currentQ ? (
          <div className="p-6 space-y-5 bg-white">
            {/* Progress & Category */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                {currentQ.category}
              </span>
              <span className="text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h4>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-2xs';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500/20';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500/20';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={`opt-${idx}`}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Coaching Breakdown:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                >
                  {currentIndex + 1 < questions.length ? 'Next Question →' : 'See Results →'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="p-8 text-center space-y-5 bg-white">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 font-display">
                Playbook Mastery: {score} / {questions.length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {score === questions.length
                  ? 'Outstanding! You have complete command of 8v8 formations, routes, and terminology.'
                  : score >= questions.length * 0.7
                  ? 'Great job! Strong tactical awareness on routes and assignments.'
                  : 'Review the Route Tree and EN-FI Glossary to sharpen your game-day execution!'}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={generateQuiz}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
              >
                Close Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
