import React, { useState } from 'react';
import { Play, PlayGameResult } from '../types';
import { getInGamePlays, logInGamePlay, clearInGamePlays } from '../utils/inGameTracker';
import { Activity, X, Plus, RotateCcw, TrendingUp, CheckCircle2, ShieldAlert, Award } from 'lucide-react';

interface InGameTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlay: Play;
}

export const InGameTrackerModal: React.FC<InGameTrackerModalProps> = ({
  isOpen,
  onClose,
  currentPlay,
}) => {
  const [plays, setPlays] = useState(() => getInGamePlays());
  const [quarter, setQuarter] = useState<number>(1);
  const [down, setDown] = useState<number>(1);
  const [distance, setDistance] = useState<number>(10);
  const [result, setResult] = useState<PlayGameResult>('COMPLETION');
  const [yardsGained, setYardsGained] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleLogPlay = () => {
    const isFirstDown = yardsGained >= distance || result === 'TOUCHDOWN';
    const updated = logInGamePlay({
      playId: currentPlay.id,
      playCode: currentPlay.code,
      playType: currentPlay.playType,
      quarter,
      down,
      distance,
      result,
      yardsGained,
      isFirstDown,
      notes,
    });
    setPlays(updated);
    setNotes('');

    // Auto advance down/distance logic
    if (result === 'TOUCHDOWN' || isFirstDown) {
      setDown(1);
      setDistance(10);
    } else if (result === 'INCOMPLETE') {
      setDown((d) => (d < 4 ? d + 1 : 1));
    } else {
      const remaining = distance - yardsGained;
      if (remaining <= 0) {
        setDown(1);
        setDistance(10);
      } else {
        setDown((d) => (d < 4 ? d + 1 : 1));
        setDistance(remaining);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all in-game logs for this game?')) {
      clearInGamePlays();
      setPlays([]);
    }
  };

  // Stats calculation
  const totalCalls = plays.length;
  const totalYards = plays.reduce((sum, p) => sum + p.yardsGained, 0);
  const touchdowns = plays.filter((p) => p.result === 'TOUCHDOWN').length;
  const passPlays = plays.filter((p) => p.playType === 'PASS' || p.playType === 'PLAY_ACTION');
  const completions = passPlays.filter((p) => p.result === 'COMPLETION' || p.result === 'TOUCHDOWN').length;
  const compPct = passPlays.length > 0 ? Math.round((completions / passPlays.length) * 100) : 0;
  const firstDowns = plays.filter((p) => p.isFirstDown).length;

  return (
    <div
      id="ingame-tracker-modal"
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Live In-Game Play Calling &amp; Drive Tracker</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Game Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Log completions, yards gained &amp; drive efficiency in real-time
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

        {/* Live Drive Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-200">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-mono font-bold text-slate-400">TOTAL YARDS</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {totalYards} <span className="text-xs text-slate-500 font-normal">yds</span>
            </div>
            <div className="text-[10px] text-slate-500">{totalCalls} play calls</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-mono font-bold text-slate-400">PASS COMP %</div>
            <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">{compPct}%</div>
            <div className="text-[10px] text-slate-500">{completions}/{passPlays.length} passes</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-mono font-bold text-slate-400">TOUCHDOWNS</div>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{touchdowns}</div>
            <div className="text-[10px] text-slate-500">{firstDowns} first downs</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] font-mono font-bold text-slate-400">YARDS / PLAY</div>
            <div className="text-xl font-bold font-mono text-purple-600 mt-0.5">
              {totalCalls > 0 ? (totalYards / totalCalls).toFixed(1) : '0.0'}
            </div>
            <div className="text-[10px] text-slate-500">Average gain</div>
          </div>
        </div>

        {/* Quick Log Action Bar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Log Current Play: <strong className="text-blue-600">{currentPlay.code}</strong></span>
            <span className="font-mono text-[11px] text-slate-500">Q{quarter} • {down}&amp;{distance}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">DOWN</label>
              <select
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value={1}>1st Down</option>
                <option value={2}>2nd Down</option>
                <option value={3}>3rd Down</option>
                <option value={4}>4th Down</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">DISTANCE (YDS)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">RESULT</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as PlayGameResult)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value="COMPLETION">Completion</option>
                <option value="TOUCHDOWN">Touchdown (TD)</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="RUSH_GAIN">Rush Gain</option>
                <option value="RUSH_LOSS">Rush Loss</option>
                <option value="SACK">Sack</option>
                <option value="INTERCEPTION">Interception (INT)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">YARDS GAINED</label>
              <input
                type="number"
                value={yardsGained}
                onChange={(e) => setYardsGained(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional coach note (e.g. 'Targeted Slot seam vs Cover 2')"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
            <button
              onClick={handleLogPlay}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Play Call</span>
            </button>
          </div>
        </div>

        {/* Game Log History Table */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-mono font-bold text-slate-500">PLAY-BY-PLAY DRIVE LOG</span>
            {plays.length > 0 && (
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Game</span>
              </button>
            )}
          </div>

          {plays.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No plays logged yet. Use the panel above to record live game/scrimmage calls.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {plays.map((p) => {
                const isPositive = p.yardsGained > 0;
                const isTD = p.result === 'TOUCHDOWN';

                return (
                  <div key={p.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] text-slate-400">{p.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                        {p.down}&amp;{p.distance}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{p.playCode}</div>
                        {p.notes && <div className="text-[10px] text-slate-500 truncate">{p.notes}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isTD
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : p.result === 'COMPLETION'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : p.result === 'INCOMPLETE'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.result}
                      </span>
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          isTD
                            ? 'text-amber-600'
                            : isPositive
                            ? 'text-emerald-600'
                            : p.yardsGained < 0
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {p.yardsGained > 0 ? `+${p.yardsGained}` : p.yardsGained} yds
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Real-time sideline play calling assistant
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
