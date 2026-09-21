import React, { useState } from 'react';
import { Play } from '../types';
import { ALL_PLAYBOOK_PLAYS, getPlayById } from '../data/allPlays';
import {
  getPracticeScript,
  savePracticeScript,
  addPlayToScript,
  removePlayFromScript,
  reorderScriptItem,
} from '../utils/practiceScriptStorage';
import { ClipboardList, X, Plus, Trash2, ArrowUp, ArrowDown, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface PracticeScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay?: (play: Play) => void;
}

const PRACTICE_PERIODS = [
  '1st & 10 (Install)',
  '2nd & Medium',
  '2nd & Short',
  '3rd & Long (7+)',
  '3rd & Medium (4-6)',
  'Red Zone (15 Yd Line)',
  'Goal Line (3 Yd Line)',
  '2-Minute Drill',
  'Shotgun Overtime',
];

export const PracticeScriptModal: React.FC<PracticeScriptModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
}) => {
  const [script, setScript] = useState(() => getPracticeScript());
  const [selectedPlayIdToAdd, setSelectedPlayIdToAdd] = useState<string>(ALL_PLAYBOOK_PLAYS[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PRACTICE_PERIODS[0]);
  const [selectedHash, setSelectedHash] = useState<'LEFT' | 'MIDDLE' | 'RIGHT'>('MIDDLE');

  if (!isOpen) return null;

  const handleAddPlay = () => {
    if (!selectedPlayIdToAdd) return;
    const updated = addPlayToScript(selectedPlayIdToAdd, selectedPeriod, selectedHash);
    setScript(updated);
  };

  const handleRemove = (itemId: string) => {
    const updated = removePlayFromScript(itemId);
    setScript(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= script.items.length) return;
    const updated = reorderScriptItem(index, target);
    setScript(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="practice-script-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Practice Script &amp; Period Planner</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {script.items.length} Scripted Plays
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {script.title} • {script.gameWeek}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Script</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Play Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">SELECT PLAY</label>
            <select
              value={selectedPlayIdToAdd}
              onChange={(e) => setSelectedPlayIdToAdd(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
            >
              {ALL_PLAYBOOK_PLAYS.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.playNumber} • {p.code} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">PERIOD / SITUATION</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
            >
              {PRACTICE_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">HASH MARK</label>
            <select
              value={selectedHash}
              onChange={(e) => setSelectedHash(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
            >
              <option value="MIDDLE">Middle</option>
              <option value="LEFT">Left Hash</option>
              <option value="RIGHT">Right Hash</option>
            </select>
          </div>

          <div className="self-end">
            <button
              onClick={handleAddPlay}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rep</span>
            </button>
          </div>
        </div>

        {/* Scripted Plays List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          {script.items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No plays scripted yet. Use the bar above to add plays to this practice script.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {script.items.map((item, idx) => {
                const play = getPlayById(item.playId);
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    {/* Order & Play info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-100 font-mono font-bold text-slate-600 flex items-center justify-center shrink-0">
                        #{item.order}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold flex items-center justify-center shrink-0 border border-blue-200">
                        {play?.playNumber || '?'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {play?.code || item.playId}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {play?.englishName} • <span className="font-mono text-blue-600">{item.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hash & Notes & Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.hash} HASH
                      </span>

                      {/* Reorder Buttons */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === script.items.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Launch play on board */}
                      {onSelectPlay && play && (
                        <button
                          onClick={() => {
                            onSelectPlay(play);
                            onClose();
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-600 font-semibold text-[11px] cursor-pointer"
                        >
                          View
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove from script"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
            Scripts saved locally for practice periods and wristband prints
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
