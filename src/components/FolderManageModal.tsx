import React, { useState, useMemo } from 'react';
import { PlayFolder, FolderColor } from '../types';
import {
  FOLDER_COLORS_META,
  createCustomFolder,
  updateFolder,
  deleteFolder,
  setFolderPlays,
  getDefaultFolders,
  saveFolders,
} from '../utils/folderStorage';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import {
  FolderPlus,
  X,
  Check,
  Trash2,
  Edit2,
  Folder,
  ListFilter,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  BarChart3,
} from 'lucide-react';

interface FolderManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: PlayFolder[];
  onFoldersChange: (folders: PlayFolder[]) => void;
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  initialEditingFolderId?: string | null;
  onOpenStats?: (folderId: string) => void;
}

const AVAILABLE_COLORS: FolderColor[] = ['blue', 'emerald', 'amber', 'purple', 'rose', 'indigo', 'cyan'];

const PRESET_NAMES = [
  'Game Plan A',
  'Game Plan B',
  'Scout Team',
  'Red Zone / Goal Line',
  '2-Minute Drill',
  'Short Yardage (3rd & 1)',
  'Blitz Beater Package',
  'Trick & Special Plays',
];

export const FolderManageModal: React.FC<FolderManageModalProps> = ({
  isOpen,
  onClose,
  folders,
  onFoldersChange,
  activeFolderId,
  onSelectFolder,
  initialEditingFolderId,
  onOpenStats,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit-plays' | 'list'>(
    initialEditingFolderId ? 'edit-plays' : 'list'
  );
  const [selectedFolderForPlays, setSelectedFolderForPlays] = useState<string>(
    initialEditingFolderId || folders[0]?.id || ''
  );

  // New folder form state
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<FolderColor>('blue');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Editing existing folder state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<FolderColor>('blue');
  const [editDesc, setEditDesc] = useState('');

  // Plays selection search inside modal
  const [playSearch, setPlaySearch] = useState('');
  const [playCategoryFilter, setPlayCategoryFilter] = useState('ALL');

  if (!isOpen) return null;

  const currentFolderForPlays = folders.find((f) => f.id === selectedFolderForPlays);

  const handleCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFolderName.trim()) return;
    const created = createCustomFolder(newFolderName.trim(), newFolderColor, newFolderDesc.trim());
    const updated = [...folders, created];
    onFoldersChange(updated);
    setNewFolderName('');
    setNewFolderDesc('');
    setSelectedFolderForPlays(created.id);
    setActiveTab('edit-plays');
  };

  const handleStartEdit = (folder: PlayFolder) => {
    setEditingFolderId(folder.id);
    setEditName(folder.name);
    setEditColor(folder.color);
    setEditDesc(folder.description || '');
  };

  const handleSaveEdit = () => {
    if (!editingFolderId || !editName.trim()) return;
    const updated = updateFolder(editingFolderId, {
      name: editName.trim(),
      color: editColor,
      description: editDesc.trim(),
    });
    onFoldersChange(updated);
    setEditingFolderId(null);
  };

  const handleDelete = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Plays will not be deleted from the playbook.')) {
      const updated = deleteFolder(folderId);
      onFoldersChange(updated);
      if (activeFolderId === folderId) {
        onSelectFolder(null);
      }
      if (selectedFolderForPlays === folderId) {
        setSelectedFolderForPlays(updated[0]?.id || '');
      }
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset folders back to standard Game Plan A, Game Plan B, and Scout Team defaults?')) {
      const defaults = getDefaultFolders();
      saveFolders(defaults);
      onFoldersChange(defaults);
      setSelectedFolderForPlays(defaults[0]?.id || '');
    }
  };

  const handleTogglePlayInFolder = (playId: string) => {
    if (!currentFolderForPlays) return;
    const exists = currentFolderForPlays.playIds.includes(playId);
    const newPlayIds = exists
      ? currentFolderForPlays.playIds.filter((id) => id !== playId)
      : [...currentFolderForPlays.playIds, playId];

    const updated = setFolderPlays(currentFolderForPlays.id, newPlayIds);
    onFoldersChange(updated);
  };

  const handleSelectAllFilteredPlays = () => {
    if (!currentFolderForPlays) return;
    const filteredPlayIds = filteredPlaysForBatch.map((p) => p.id);
    const combined = Array.from(new Set([...currentFolderForPlays.playIds, ...filteredPlayIds]));
    const updated = setFolderPlays(currentFolderForPlays.id, combined);
    onFoldersChange(updated);
  };

  const handleClearAllPlaysInFolder = () => {
    if (!currentFolderForPlays) return;
    const updated = setFolderPlays(currentFolderForPlays.id, []);
    onFoldersChange(updated);
  };

  // Filter plays for batch assign
  const filteredPlaysForBatch = useMemo(() => {
    return ALL_PLAYBOOK_PLAYS.filter((play) => {
      if (playCategoryFilter !== 'ALL' && play.category !== playCategoryFilter) {
        return false;
      }
      if (!playSearch.trim()) return true;
      const q = playSearch.toLowerCase();
      return (
        play.playNumber.toString().includes(q) ||
        play.code.toLowerCase().includes(q) ||
        play.englishName.toLowerCase().includes(q) ||
        play.conceptName.toLowerCase().includes(q)
      );
    });
  }, [playSearch, playCategoryFilter]);

  return (
    <div
      id="folder-manage-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Playbook Custom Folders &amp; Game Plans</h2>
              <p className="text-xs text-slate-400 font-mono">Organize plays into Game Plan A, Game Plan B, Scout Team &amp; packages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Folder Directory ({folders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Create Folder</span>
          </button>
          <button
            onClick={() => setActiveTab('edit-plays')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'edit-plays'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Assign Plays to Folder</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: LIST / DIRECTORY */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Current Custom Folders
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset to default Game Plan A, B and Scout Team"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {folders.map((f) => {
                  const colorMeta = FOLDER_COLORS_META[f.color] || FOLDER_COLORS_META.blue;
                  const isEditingThis = editingFolderId === f.id;
                  const isCurrentActive = activeFolderId === f.id;

                  if (isEditingThis) {
                    return (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl border border-blue-400 bg-blue-50/50 space-y-3 animate-in fade-in duration-100"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Folder Name"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                          />
                          {/* Color picker */}
                          <div className="flex items-center gap-1.5">
                            {AVAILABLE_COLORS.map((c) => {
                              const cMeta = FOLDER_COLORS_META[c];
                              return (
                                <button
                                  key={`edit-col-${c}`}
                                  type="button"
                                  onClick={() => setEditColor(c)}
                                  className={`w-6 h-6 rounded-full ${cMeta.dot} transition-transform flex items-center justify-center cursor-pointer ${
                                    editColor === c ? 'scale-110 ring-2 ring-offset-1 ring-slate-800' : 'opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  {editColor === c && <Check className="w-3 h-3 text-white" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Optional notes or tactical description"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFolderId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-3.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-2xs"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={f.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentActive
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMeta.badge} font-bold`}
                        >
                          <Folder className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">{f.name}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${colorMeta.badge}`}>
                              {f.playIds.length} {f.playIds.length === 1 ? 'play' : 'plays'}
                            </span>
                            {f.isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                                Default
                              </span>
                            )}
                          </div>
                          {f.description && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-md">
                              {f.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        {onOpenStats && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenStats(f.id);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                            title="View Usage Frequency Statistics for this Folder"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Stats</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFolderForPlays(f.id);
                            setActiveTab('edit-plays');
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Assign plays to this folder"
                        >
                          <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                          <span>Assign Plays</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(f)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Rename or change color"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('create')}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Another Custom Folder</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW FOLDER */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Folder Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Game Plan A, Scout Team, Red Zone Specials..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Preset quick suggestions */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400">QUICK PRESETS:</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_NAMES.map((name) => (
                    <button
                      key={`preset-${name}`}
                      type="button"
                      onClick={() => setNewFolderName(name)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color theme picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Folder Accent Color</label>
                <div className="flex items-center gap-3">
                  {AVAILABLE_COLORS.map((c) => {
                    const cMeta = FOLDER_COLORS_META[c];
                    return (
                      <button
                        key={`new-col-${c}`}
                        type="button"
                        onClick={() => setNewFolderColor(c)}
                        className={`w-7 h-7 rounded-full ${cMeta.dot} transition-all flex items-center justify-center cursor-pointer ${
                          newFolderColor === c ? 'scale-115 ring-3 ring-offset-2 ring-slate-800 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {newFolderColor === c && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description / Coach Notes</label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="Optional tactical explanation for when to call these plays"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create &amp; Assign Plays</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ASSIGN PLAYS TO FOLDER (BATCH CHECKLIST) */}
          {activeTab === 'edit-plays' && (
            <div className="space-y-4">
              {/* Folder Selector dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Assigning to:</span>
                  <select
                    value={selectedFolderForPlays}
                    onChange={(e) => setSelectedFolderForPlays(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 cursor-pointer"
                  >
                    {folders.map((f) => (
                      <option key={`select-f-${f.id}`} value={f.id}>
                        {f.name} ({f.playIds.length} plays)
                      </option>
                    ))}
                  </select>
                </div>

                {currentFolderForPlays && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredPlays}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      + Add All Visible ({filteredPlaysForBatch.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllPlaysInFolder}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Clear Folder
                    </button>
                  </div>
                )}
              </div>

              {/* Search & Category Filter for Plays */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={playSearch}
                    onChange={(e) => setPlaySearch(e.target.value)}
                    placeholder="Search plays by name, number, code or concept..."
                    className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                  {playSearch && (
                    <button
                      type="button"
                      onClick={() => setPlaySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  value={playCategoryFilter}
                  onChange={(e) => setPlayCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Formations</option>
                  <option value="TRIPS PASS">TRIPS PASS</option>
                  <option value="TRIPS RUN">TRIPS RUN</option>
                  <option value="TWINS PASS">TWINS PASS</option>
                  <option value="TWINS RUN">TWINS RUN</option>
                  <option value="EMPTY PASS">EMPTY PASS</option>
                  <option value="TWO LINE PASS">2 LINE PASS</option>
                  <option value="SPLIT PASS">SPLIT PASS</option>
                </select>
              </div>

              {/* Plays Checklist */}
              <div className="border border-slate-200 rounded-xl max-h-[300px] overflow-y-auto divide-y divide-slate-100 bg-white">
                {filteredPlaysForBatch.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No plays match search query.</div>
                ) : (
                  filteredPlaysForBatch.map((play) => {
                    const isChecked = currentFolderForPlays?.playIds.includes(play.id) || false;
                    return (
                      <label
                        key={`batch-play-${play.id}`}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50/90 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlayInFolder(play.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <div
                            className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {play.playNumber}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{play.code}</div>
                            <div className="text-[11px] text-slate-500 truncate">{play.englishName}</div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                            play.direction === 'RIGHT'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {play.category.split(' ')[0]}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Footer summary for tab */}
              {currentFolderForPlays && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Selected: <strong className="text-slate-900">{currentFolderForPlays.playIds.length}</strong>{' '}
                    plays in <strong className="text-blue-600">{currentFolderForPlays.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFolder(currentFolderForPlays.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    View in Play Selector →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Saved locally in browser storage &amp; instantly synchronized
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
