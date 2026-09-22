import React, { useState } from 'react';
import { Play } from '../types';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import {
  FileText,
  X,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  BookmarkPlus,
  Play as PlayIcon,
  CheckCircle2,
} from 'lucide-react';

interface CallSheetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay: (play: Play) => void;
}

interface SituationalBucket {
  id: string;
  title: string;
  description: string;
  tagColor: string;
  playIds: string[];
}

const DEFAULT_BUCKETS: SituationalBucket[] = [
  {
    id: 'first_ten',
    title: '1st & 10 (Base & Play Action)',
    description: 'Establish tempo, balanced run/pass split, intermediate play-action',
    tagColor: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    playIds: ['play_97', 'play_98', 'play_107', 'play_111'],
  },
  {
    id: 'second_short',
    title: '2nd & Short (1-3 YDS)',
    description: 'Aggressive deep shots, power option, quick play action',
    tagColor: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    playIds: ['play_101', 'play_110', 'play_113'],
  },
  {
    id: 'third_short',
    title: '3rd & Short (1-3 YDS - Must Have)',
    description: 'High completion quick game, power runs, rub routes',
    tagColor: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    playIds: ['play_102', 'play_109', 'play_112'],
  },
  {
    id: 'third_long',
    title: '3rd & Long (7+ YDS - Sticks)',
    description: 'Deep flood, sail, double post, pass protection slide',
    tagColor: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
    playIds: ['play_99', 'play_100', 'play_108'],
  },
  {
    id: 'red_zone',
    title: 'Red Zone (Inside 20 YD)',
    description: 'Compressed space, boundary fades, whip routes, high-low stretch',
    tagColor: 'border-red-500/50 bg-red-500/10 text-red-400',
    playIds: ['play_103', 'play_104', 'play_106'],
  },
  {
    id: 'two_minute',
    title: '2-Minute Drill & Clock Savers',
    description: 'Sideline boundary out routes, deep shots, empty spread',
    tagColor: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    playIds: ['play_105', 'play_97', 'play_114'],
  },
];

export const CallSheetBuilderModal: React.FC<CallSheetBuilderModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
}) => {
  const [buckets, setBuckets] = useState<SituationalBucket[]>(() => {
    const saved = localStorage.getItem('aalto_predators_call_sheet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_BUCKETS;
      }
    }
    return DEFAULT_BUCKETS;
  });

  const [activeBucketId, setActiveBucketId] = useState<string>('first_ten');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const saveBuckets = (updated: SituationalBucket[]) => {
    setBuckets(updated);
    localStorage.setItem('aalto_predators_call_sheet', JSON.stringify(updated));
  };

  const handleAddPlayToBucket = (bucketId: string, playId: string) => {
    const updated = buckets.map((b) => {
      if (b.id === bucketId && !b.playIds.includes(playId)) {
        return { ...b, playIds: [...b.playIds, playId] };
      }
      return b;
    });
    saveBuckets(updated);
  };

  const handleRemovePlayFromBucket = (bucketId: string, playId: string) => {
    const updated = buckets.map((b) => {
      if (b.id === bucketId) {
        return { ...b, playIds: b.playIds.filter((id) => id !== playId) };
      }
      return b;
    });
    saveBuckets(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentBucket = buckets.find((b) => b.id === activeBucketId) || buckets[0];
  const bucketPlays = currentBucket.playIds
    .map((id) => ALL_PLAYBOOK_PLAYS.find((p) => p.id === id || String(p.playNumber) === id))
    .filter(Boolean) as Play[];

  const availablePlays = ALL_PLAYBOOK_PLAYS.filter(
    (p) =>
      !currentBucket.playIds.includes(p.id) &&
      (p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.englishName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.formationName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Game-Day Call Sheet Builder
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  8v8 Situational Bins
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organize 8v8 concepts into high-pressure situational categories for immediate sideline calling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar + Main Bucket View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Situational Bins Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/50 p-4 overflow-y-auto space-y-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">
              SITUATIONAL BINS
            </span>
            {buckets.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBucketId(b.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  activeBucketId === b.id
                    ? 'bg-slate-800 border-amber-500/80 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{b.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {b.playIds.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{b.description}</p>
              </button>
            ))}
          </div>

          {/* Active Bucket & Play Picker */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Active Bucket Header */}
            <div className="p-4 rounded-xl border border-slate-700/80 bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-400">{currentBucket.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{currentBucket.description}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {bucketPlays.length} Plays in Bucket
                </span>
              </div>
            </div>

            {/* Current Bucket Plays */}
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">
                ASSIGNED PLAYS ({bucketPlays.length})
              </span>
              {bucketPlays.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No plays assigned to this situational bucket yet. Select from the library below.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {bucketPlays.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100 truncate">{p.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            {p.playType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{p.englishName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPlay(p);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                          title="Call This Play on Field Board"
                        >
                          <PlayIcon className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayFromBucket(currentBucket.id, p.id)}
                          className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                          title="Remove from Bucket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add More Plays from Library */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  ADD FROM PLAYBOOK LIBRARY
                </span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter playbook..."
                  className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {availablePlays.slice(0, 18).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddPlayToBucket(currentBucket.id, p.id)}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-amber-300">
                        {p.code}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {p.formationName} • {p.playType}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
