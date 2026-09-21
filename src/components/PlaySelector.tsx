import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, FormationCategory, PlayType, Direction, PlayFolder } from '../types';
import { CATEGORIES, ALL_PLAYBOOK_PLAYS, PLAY_TAGS_META, searchPlays } from '../data/allPlays';
import {
  getSavedFolders,
  togglePlayInFolder,
  FOLDER_COLORS_META,
} from '../utils/folderStorage';
import { FolderManageModal } from './FolderManageModal';
import { GamePlanStatsModal } from './GamePlanStatsModal';
import {
  Search,
  Filter,
  Dices,
  ChevronRight,
  Tag,
  RotateCcw,
  Folder,
  FolderPlus,
  FolderCheck,
  Settings2,
  Check,
  Plus,
  Layers,
  X,
  BarChart3,
  Copy,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

interface PlaySelectorProps {
  selectedPlay: Play;
  onSelectPlay: (play: Play) => void;
  onDuplicatePlay?: (duplicatedPlay: Play) => void;
  activeFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  onOpenFormationGallery?: () => void;
}

export const PlaySelector: React.FC<PlaySelectorProps> = ({
  selectedPlay,
  onSelectPlay,
  onDuplicatePlay,
  activeFolderId: externalActiveFolderId,
  onSelectFolder: externalOnSelectFolder,
  onOpenFormationGallery,
}) => {
  // Folder state
  const [folders, setFolders] = useState<PlayFolder[]>(() => getSavedFolders());
  const [internalActiveFolderId, setInternalActiveFolderId] = useState<string | null>(null);

  const activeFolderId = externalActiveFolderId !== undefined ? externalActiveFolderId : internalActiveFolderId;
  const setActiveFolderId = (id: string | null) => {
    if (externalOnSelectFolder) {
      externalOnSelectFolder(id);
    }
    setInternalActiveFolderId(id);
  };

  // Folder modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalInitialId, setFolderModalInitialId] = useState<string | null>(null);

  // Usage Stats modal state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Play card folder popover state (which play currently has its folder popover open)
  const [popoverPlayId, setPopoverPlayId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Standard filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<Direction | 'ALL'>('ALL');
  const [selectedPlayType, setSelectedPlayType] = useState<PlayType | 'ALL'>('ALL');

  // Listen for storage updates across components
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlayFolder[]>;
      if (customEvent.detail) {
        setFolders(customEvent.detail);
      } else {
        setFolders(getSavedFolders());
      }
    };
    window.addEventListener('playbook_folders_updated', handleUpdate);
    return () => window.removeEventListener('playbook_folders_updated', handleUpdate);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverPlayId(null);
      }
    };
    if (popoverPlayId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverPlayId]);

  // Active folder object
  const activeFolder = useMemo(() => {
    return folders.find((f) => f.id === activeFolderId) || null;
  }, [folders, activeFolderId]);

  // Filtered plays list (incorporates folder filtering + search + situational filters)
  const filteredPlays = useMemo(() => {
    let plays = searchPlays(searchQuery, {
      category: selectedCategory,
      tag: selectedTag,
      direction: selectedDirection,
      playType: selectedPlayType,
    });

    if (activeFolder) {
      plays = plays.filter((p) => activeFolder.playIds.includes(p.id));
    }

    return plays;
  }, [searchQuery, selectedCategory, selectedTag, selectedDirection, selectedPlayType, activeFolder]);

  // Duplicate a play into a custom variation
  const handleDuplicatePlay = (playToDuplicate: Play) => {
    const clonedPlayers = JSON.parse(JSON.stringify(playToDuplicate.players || {}));
    const clonedReads = playToDuplicate.progressionReads ? JSON.parse(JSON.stringify(playToDuplicate.progressionReads)) : [];
    const clonedCoachingPoints = playToDuplicate.coachingPoints ? [...playToDuplicate.coachingPoints] : [];

    const timestamp = Date.now();
    const baseCode = playToDuplicate.code.replace(/\s*\((Copy|Varyasyon|Variation)(\s*\d+)?\)$/i, '');
    const newCode = `${baseCode} (Copy)`;
    const newNumber = playToDuplicate.playNumber ? `${playToDuplicate.playNumber}+` : '★';

    const duplicatedPlay: Play = {
      ...playToDuplicate,
      id: `custom-dup-${timestamp}`,
      playNumber: newNumber,
      code: newCode,
      originalTurkishCode: `${playToDuplicate.originalTurkishCode || playToDuplicate.code} (Varyasyon)`,
      englishName: `${playToDuplicate.englishName} (Variation)`,
      conceptName: playToDuplicate.conceptName ? `${playToDuplicate.conceptName} (Variation)` : `${playToDuplicate.englishName} Variation`,
      description: `Variation of #${playToDuplicate.playNumber || ''} ${playToDuplicate.code} (${playToDuplicate.englishName}). Custom variation created by coach.`,
      tags: Array.from(new Set([...(playToDuplicate.tags || []), 'Custom Play', 'Variation'])),
      players: clonedPlayers,
      progressionReads: clonedReads,
      coachingPoints: clonedCoachingPoints,
    };

    // Unshift to ALL_PLAYBOOK_PLAYS if not already present
    if (!ALL_PLAYBOOK_PLAYS.some((p) => p.id === duplicatedPlay.id)) {
      ALL_PLAYBOOK_PLAYS.unshift(duplicatedPlay);
    }

    // If currently inside a folder, also assign the duplicated play to that folder
    if (activeFolderId) {
      const updated = togglePlayInFolder(activeFolderId, duplicatedPlay.id);
      setFolders(updated);
    }

    if (onDuplicatePlay) {
      onDuplicatePlay(duplicatedPlay);
    }
    onSelectPlay(duplicatedPlay);

    showToast(`Duplicated "${playToDuplicate.code}" as "${newCode}"! Ready to customize.`);
  };

  // Roll a random play from currently filtered subset
  const handleRandomPlay = () => {
    if (filteredPlays.length === 0) return;
    const randomIdx = Math.floor(Math.random() * filteredPlays.length);
    onSelectPlay(filteredPlays[randomIdx]);
  };

  // Reset all filters (including folder filter)
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedTag('ALL');
    setSelectedDirection('ALL');
    setSelectedPlayType('ALL');
    setActiveFolderId(null);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedTag !== 'ALL' ||
    selectedDirection !== 'ALL' ||
    selectedPlayType !== 'ALL' ||
    activeFolderId !== null;

  // Toggle play in a folder directly from card popover
  const handleTogglePlayFolder = (folderId: string, playId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = togglePlayInFolder(folderId, playId);
    setFolders(updated);
  };

  // Quick tag helper for badge styling
  const getTagMeta = (tagId: string) => {
    return PLAY_TAGS_META.find(
      (m) => m.id.toLowerCase() === tagId.toLowerCase() || m.shortLabel.toLowerCase() === tagId.toLowerCase()
    );
  };

  // Get list of folders a play belongs to
  const getFoldersForPlay = (playId: string) => {
    return folders.filter((f) => f.playIds.includes(playId));
  };

  return (
    <div
      id="play-selector-panel"
      className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4"
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-md cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top: Search Input, Duplicate Play & Random Play */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search play #, code (e.g. 97, Smash, Quick In, RedZone)..."
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-10 pr-10 min-h-[44px] py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-xs sm:text-sm font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 active:bg-slate-200/70 touch-manipulation cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Duplicate Play Button */}
        <button
          id="duplicate-selected-play-btn"
          onClick={() => handleDuplicatePlay(selectedPlay)}
          title={`Duplicate active play "${selectedPlay.code}" to create a variation`}
          className="min-h-[44px] px-3 sm:px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100/90 active:bg-blue-200 text-blue-900 border border-blue-300/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs touch-manipulation active:scale-95 cursor-pointer shrink-0"
        >
          <Copy className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Duplicate Play</span>
          <span className="sm:hidden">Duplicate</span>
        </button>

        {/* Pick Random Play Button */}
        <button
          onClick={handleRandomPlay}
          title="Pick Random Play"
          className="min-h-[44px] px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100/90 active:bg-amber-200 text-amber-900 border border-amber-300/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs touch-manipulation active:scale-95 cursor-pointer shrink-0"
        >
          <Dices className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">Random</span>
        </button>
      </div>

      {/* 📁 CUSTOM FOLDERS & GAME PLANS BAR */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-blue-600" />
            <span>GAME PLANS &amp; FOLDERS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="game-plan-stats-btn"
              onClick={() => setIsStatsModalOpen(true)}
              className="text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/90 px-2.5 py-1 rounded-lg border border-blue-200/90 flex items-center gap-1 font-sans font-bold cursor-pointer transition-all shadow-2xs"
              title="Visualize Usage Statistics for Game Plan Plays (Bar Chart)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Usage Stats</span>
            </button>

            <button
              id="manage-folders-btn"
              onClick={() => {
                setFolderModalInitialId(null);
                setIsFolderModalOpen(true);
              }}
              className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-sans font-semibold cursor-pointer transition-colors"
              title="Manage Folders & Custom Categories"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage</span>
            </button>
          </div>
        </div>

        {/* Scrollable Folder Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {/* All Plays Tab */}
          <button
            onClick={() => setActiveFolderId(null)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border touch-manipulation active:scale-95 cursor-pointer text-[11px] flex items-center gap-1.5 ${
              activeFolderId === null
                ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Plays</span>
            <span className="text-[10px] opacity-75 font-mono">({ALL_PLAYBOOK_PLAYS.length})</span>
          </button>

          {/* Render Saved Folders ('Game Plan A', 'Game Plan B', 'Scout Team', etc.) */}
          {folders.map((folder) => {
            const isSelected = activeFolderId === folder.id;
            const colorMeta = FOLDER_COLORS_META[folder.color] || FOLDER_COLORS_META.blue;

            return (
              <button
                key={`folder-tab-${folder.id}`}
                onClick={() => setActiveFolderId(isSelected ? null : folder.id)}
                title={folder.description || folder.name}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border touch-manipulation active:scale-95 cursor-pointer text-[11px] font-bold flex items-center gap-1.5 ${
                  isSelected
                    ? `${colorMeta.activeTab} ring-2 ${colorMeta.ring}/30`
                    : `${colorMeta.badge} hover:opacity-90`
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{folder.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-700'
                  }`}
                >
                  {folder.playIds.length}
                </span>
              </button>
            );
          })}

          {/* Quick Create New Folder Button */}
          <button
            id="quick-create-folder-btn"
            onClick={() => {
              setFolderModalInitialId(null);
              setIsFolderModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
            title="Create Custom Folder"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Active Folder Banner (Context & Quick Edit) */}
        {activeFolder && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full ${FOLDER_COLORS_META[activeFolder.color]?.dot || 'bg-blue-500'} shrink-0`} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs truncate">
                  <span>Folder: {activeFolder.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                    ({activeFolder.playIds.length} {activeFolder.playIds.length === 1 ? 'play' : 'plays'})
                  </span>
                </div>
                {activeFolder.description && (
                  <div className="text-[10px] text-slate-500 truncate">{activeFolder.description}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsStatsModalOpen(true)}
                className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer bg-purple-50/70 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200/80"
                title="View Bar Chart Usage Statistics for this Folder"
              >
                <BarChart3 className="w-3 h-3" />
                <span>Stats</span>
              </button>
              <button
                onClick={() => {
                  setFolderModalInitialId(activeFolder.id);
                  setIsFolderModalOpen(true);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
              >
                Assign / Edit Plays
              </button>
              <button
                onClick={() => setActiveFolderId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer"
                title="Exit folder view (Show all plays)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Dropdowns Row: Formation Category & Situational Tag Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Category Filter Dropdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>FORMATION CATEGORY</span>
            </label>
            {onOpenFormationGallery && (
              <button
                id="play-selector-formation-gallery-btn"
                onClick={onOpenFormationGallery}
                className="text-[11px] text-cyan-700 hover:text-cyan-800 bg-cyan-50/80 hover:bg-cyan-100 px-2 py-0.5 rounded-lg border border-cyan-200/90 flex items-center gap-1 font-sans font-bold cursor-pointer transition-all shadow-2xs"
                title="Open 8v8 Formation Gallery & Personnel Lab"
              >
                <LayoutGrid className="w-3 h-3 text-cyan-600" />
                <span>Gallery</span>
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Formations ({ALL_PLAYBOOK_PLAYS.length} Plays)</option>
            <optgroup label="Spread & Passing Formations">
              {CATEGORIES.filter((c) => c.includes('PASS')).map((cat) => {
                const count = ALL_PLAYBOOK_PLAYS.filter((p) => p.category === cat).length;
                return (
                  <option key={`cat-select-${cat}`} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="Run & Short Yardage Formations">
              {CATEGORIES.filter((c) => c.includes('RUN')).map((cat) => {
                const count = ALL_PLAYBOOK_PLAYS.filter((p) => p.category === cat).length;
                return (
                  <option key={`cat-select-${cat}`} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </optgroup>
          </select>
        </div>

        {/* Situational Tag Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-rose-600" />
            <span>SITUATIONAL TAG</span>
          </label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Situations / Tags</option>
            {PLAY_TAGS_META.map((meta) => {
              const count = ALL_PLAYBOOK_PLAYS.filter((p) =>
                p.tags.some((t) => t.toLowerCase() === meta.id.toLowerCase() || t.toLowerCase() === meta.shortLabel.toLowerCase())
              ).length;
              return (
                <option key={`tag-select-${meta.id}`} value={meta.id}>
                  {meta.shortLabel} — {meta.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Quick Situational Tag Filter Chips Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-400">
          <span>QUICK SITUATIONS:</span>
          {selectedTag !== 'ALL' && (
            <button
              onClick={() => setSelectedTag('ALL')}
              className="text-blue-600 hover:text-blue-700 underline text-[10px] cursor-pointer"
            >
              Clear Tag
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border touch-manipulation active:scale-95 cursor-pointer text-[11px] ${
              selectedTag === 'ALL'
                ? 'bg-slate-800 text-white font-bold border-slate-800 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Situations
          </button>
          {PLAY_TAGS_META.map((meta) => {
            const isSelected = selectedTag === meta.id;
            return (
              <button
                key={`tag-chip-${meta.id}`}
                onClick={() => setSelectedTag(isSelected ? 'ALL' : meta.id)}
                title={meta.description}
                className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all border touch-manipulation active:scale-95 cursor-pointer text-[11px] font-semibold flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs shadow-blue-500/20 ring-2 ring-blue-500/30'
                    : `${meta.badgeClass} hover:opacity-90`
                }`}
              >
                <span>{meta.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direction & Play Type Sub-filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Direction Toggle */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-mono mr-1">DIR:</span>
          {(['ALL', 'RIGHT', 'LEFT'] as const).map((dir) => (
            <button
              key={`dir-${dir}`}
              onClick={() => setSelectedDirection(dir)}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all touch-manipulation active:scale-95 cursor-pointer flex items-center ${
                selectedDirection === dir
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Play Type Toggle */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 font-mono mr-1">TYPE:</span>
          {(['ALL', 'PASS', 'RUN', 'SCREEN', 'PLAY_ACTION'] as const).map((t) => (
            <button
              key={`type-${t}`}
              onClick={() => setSelectedPlayType(t)}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all touch-manipulation active:scale-95 cursor-pointer flex items-center ${
                selectedPlayType === t
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 border-b border-slate-100 pb-2">
        <span className="font-mono text-[11px]">
          Showing <strong className="text-slate-800">{filteredPlays.length}</strong> plays
          {activeFolder && (
            <span>
              {' '}
              in <strong className="text-blue-600">{activeFolder.name}</strong>
            </span>
          )}
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Play Cards List */}
      <div className="max-h-[390px] overflow-y-auto space-y-2 pr-1 focus:outline-none relative">
        {filteredPlays.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-3">
            <div>
              {activeFolder ? (
                <>
                  No plays assigned to <strong>{activeFolder.name}</strong> matching these filters.
                </>
              ) : (
                'No plays matching current criteria.'
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              {activeFolder && (
                <button
                  onClick={() => {
                    setFolderModalInitialId(activeFolder.id);
                    setIsFolderModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
                >
                  + Add Plays to {activeFolder.name}
                </button>
              )}
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          filteredPlays.map((play) => {
            const isSelected = selectedPlay.id === play.id;
            const playFolders = getFoldersForPlay(play.id);
            const isPopoverOpen = popoverPlayId === play.id;

            // Primary display tags (max 2 if folders present)
            const displayTags = play.tags.filter((t) =>
              PLAY_TAGS_META.some((m) => m.id.toLowerCase() === t.toLowerCase() || m.shortLabel.toLowerCase() === t.toLowerCase())
            );

            return (
              <div
                key={`play-card-${play.id}`}
                className={`relative w-full rounded-xl border transition-all cursor-pointer min-h-[62px] ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500/90 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPlay(play)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPlay(play);
                    }
                  }}
                  className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 focus:outline-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Play Number Badge */}
                    <div
                      className={`w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/90'
                      }`}
                    >
                      {play.playNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate font-display tracking-tight">
                          {play.code}
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                        {play.englishName}
                      </div>

                      {/* Folder Badges & Situational Tag Badges */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {/* Render Folder tags */}
                        {playFolders.map((f) => {
                          const fMeta = FOLDER_COLORS_META[f.color] || FOLDER_COLORS_META.blue;
                          return (
                            <span
                              key={`f-badge-${play.id}-${f.id}`}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border flex items-center gap-1 ${fMeta.badge}`}
                              title={`In folder: ${f.name}`}
                            >
                              <Folder className="w-2.5 h-2.5" />
                              <span>{f.name}</span>
                            </span>
                          );
                        })}

                        {/* Situational tags */}
                        {displayTags.slice(0, playFolders.length > 0 ? 2 : 3).map((tagStr) => {
                          const meta = getTagMeta(tagStr);
                          return (
                            <span
                              key={`badge-${play.id}-${tagStr}`}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                                meta ? meta.badgeClass : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {meta ? meta.shortLabel : tagStr}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Duplicate Play Quick Action */}
                    <button
                      type="button"
                      title={`Duplicate "${play.code}" to create variation`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePlay(play);
                      }}
                      className="p-1.5 rounded-lg border bg-slate-50 text-slate-400 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 border-slate-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Folder Quick Action Button */}
                    <button
                      type="button"
                      title="Add to / Remove from Custom Folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverPlayId(isPopoverOpen ? null : play.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        playFolders.length > 0
                          ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {playFolders.length > 0 ? (
                        <FolderCheck className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <FolderPlus className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                        play.direction === 'RIGHT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : play.direction === 'LEFT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {play.direction}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Inline Folder Quick Assign Popover */}
                {isPopoverOpen && (
                  <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-3 top-14 z-30 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 space-y-2 animate-in zoom-in-95 duration-100 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-blue-600" />
                        <span>Group into Folders:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopoverPlayId(null)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {folders.map((f) => {
                        const isInThisFolder = f.playIds.includes(play.id);
                        const fMeta = FOLDER_COLORS_META[f.color] || FOLDER_COLORS_META.blue;

                        return (
                          <button
                            key={`popover-folder-${f.id}`}
                            type="button"
                            onClick={(e) => handleTogglePlayFolder(f.id, play.id, e)}
                            className={`w-full p-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isInThisFolder ? 'bg-blue-50/80 font-bold text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full ${fMeta.dot} shrink-0`} />
                              <span className="truncate text-xs">{f.name}</span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isInThisFolder
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isInThisFolder && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setPopoverPlayId(null);
                          setFolderModalInitialId(null);
                          setIsFolderModalOpen(true);
                        }}
                        className="w-full py-1 text-center text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create New Folder</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Custom Folder Management Modal */}
      <FolderManageModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderModalInitialId(null);
        }}
        folders={folders}
        onFoldersChange={(updated) => setFolders(updated)}
        activeFolderId={activeFolderId}
        onSelectFolder={(id) => setActiveFolderId(id)}
        initialEditingFolderId={folderModalInitialId}
        onOpenStats={(folderId) => {
          setActiveFolderId(folderId);
          setIsFolderModalOpen(false);
          setIsStatsModalOpen(true);
        }}
      />

      {/* Game Plan Play Usage Statistics Modal (Bar Chart & Rep Analysis) */}
      <GamePlanStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectPlay={onSelectPlay}
        onOpenFolderManager={(folderId) => {
          setFolderModalInitialId(folderId);
          setIsFolderModalOpen(true);
        }}
      />
    </div>
  );
};
