import { PlayFolder, FolderColor } from '../types';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';

const STORAGE_KEY = '8v8_playbook_custom_folders_v1';

export const FOLDER_COLORS_META: Record<
  FolderColor,
  {
    name: string;
    badge: string;
    activeTab: string;
    border: string;
    dot: string;
    lightBg: string;
    text: string;
    ring: string;
  }
> = {
  blue: {
    name: 'Blue',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    activeTab: 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20',
    border: 'border-blue-500',
    dot: 'bg-blue-500',
    lightBg: 'bg-blue-50/70',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
  },
  emerald: {
    name: 'Emerald',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeTab: 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-500/20',
    border: 'border-emerald-500',
    dot: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/70',
    text: 'text-emerald-600',
    ring: 'ring-emerald-500',
  },
  amber: {
    name: 'Amber',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    activeTab: 'bg-amber-600 text-white border-amber-600 shadow-xs shadow-amber-500/20',
    border: 'border-amber-500',
    dot: 'bg-amber-500',
    lightBg: 'bg-amber-50/70',
    text: 'text-amber-600',
    ring: 'ring-amber-500',
  },
  purple: {
    name: 'Purple',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    activeTab: 'bg-purple-600 text-white border-purple-600 shadow-xs shadow-purple-500/20',
    border: 'border-purple-500',
    dot: 'bg-purple-500',
    lightBg: 'bg-purple-50/70',
    text: 'text-purple-600',
    ring: 'ring-purple-500',
  },
  rose: {
    name: 'Rose',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    activeTab: 'bg-rose-600 text-white border-rose-600 shadow-xs shadow-rose-500/20',
    border: 'border-rose-500',
    dot: 'bg-rose-500',
    lightBg: 'bg-rose-50/70',
    text: 'text-rose-600',
    ring: 'ring-rose-500',
  },
  indigo: {
    name: 'Indigo',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    activeTab: 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/20',
    border: 'border-indigo-500',
    dot: 'bg-indigo-500',
    lightBg: 'bg-indigo-50/70',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500',
  },
  cyan: {
    name: 'Cyan',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    activeTab: 'bg-cyan-600 text-white border-cyan-600 shadow-xs shadow-cyan-500/20',
    border: 'border-cyan-500',
    dot: 'bg-cyan-500',
    lightBg: 'bg-cyan-50/70',
    text: 'text-cyan-600',
    ring: 'ring-cyan-500',
  },
};

/**
 * Generate sensible default folders requested by coaches:
 * - 'Game Plan A' (Primary offensive package)
 * - 'Game Plan B' (Secondary / contingency package)
 * - 'Scout Team' (Opponent defense prep / scout looks)
 */
export function getDefaultFolders(): PlayFolder[] {
  const allIds = ALL_PLAYBOOK_PLAYS.map((p) => p.id);

  // Pick intelligent plays for Game Plan A (Core staples: first 5-6 plays)
  const gamePlanAPlays = allIds.slice(0, 6);

  // Pick plays for Game Plan B (Alternates / 2-min: next 5 plays)
  const gamePlanBPlays = allIds.slice(6, 11);

  // Pick plays for Scout Team (Opponent scout looks: next 4-5 plays)
  const scoutTeamPlays = allIds.slice(11, 16);

  return [
    {
      id: 'folder-game-plan-a',
      name: 'Game Plan A',
      color: 'blue',
      description: 'Primary 1st & 2nd down base offensive install and rhythm pass/run staples.',
      playIds: gamePlanAPlays,
      createdAt: '2026-09-01T00:00:00.000Z',
      isDefault: true,
    },
    {
      id: 'folder-game-plan-b',
      name: 'Game Plan B',
      color: 'purple',
      description: 'Contingency & alternate packages: 2-minute hurry-up, spread empty, and deep shots.',
      playIds: gamePlanBPlays,
      createdAt: '2026-09-01T00:00:00.000Z',
      isDefault: true,
    },
    {
      id: 'folder-scout-team',
      name: 'Scout Team',
      color: 'amber',
      description: 'Opponent scout looks, unusual alignments, and defensive prep packages.',
      playIds: scoutTeamPlays,
      createdAt: '2026-09-01T00:00:00.000Z',
      isDefault: true,
    },
  ];
}

/**
 * Read custom folders from localStorage
 */
export function getSavedFolders(): PlayFolder[] {
  if (typeof window === 'undefined') return getDefaultFolders();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultFolders();
      saveFolders(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultFolders();
  } catch (err) {
    console.warn('Failed to load folders from localStorage, using defaults', err);
    return getDefaultFolders();
  }
}

/**
 * Save custom folders to localStorage
 */
export function saveFolders(folders: PlayFolder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
    window.dispatchEvent(new CustomEvent('playbook_folders_updated', { detail: folders }));
  } catch (err) {
    console.error('Failed to save folders to localStorage', err);
  }
}

/**
 * Create a new custom folder
 */
export function createCustomFolder(
  name: string,
  color: FolderColor = 'blue',
  description = '',
  initialPlayIds: string[] = []
): PlayFolder {
  const folders = getSavedFolders();
  const newFolder: PlayFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    color,
    description: description.trim(),
    playIds: initialPlayIds,
    createdAt: new Date().toISOString(),
    isDefault: false,
  };
  const updated = [...folders, newFolder];
  saveFolders(updated);
  return newFolder;
}

/**
 * Update an existing folder's name, color, description, or play list
 */
export function updateFolder(
  folderId: string,
  updates: Partial<Omit<PlayFolder, 'id' | 'createdAt'>>
): PlayFolder[] {
  const folders = getSavedFolders();
  const updated = folders.map((f) => {
    if (f.id === folderId) {
      return { ...f, ...updates };
    }
    return f;
  });
  saveFolders(updated);
  return updated;
}

/**
 * Delete a custom folder
 */
export function deleteFolder(folderId: string): PlayFolder[] {
  const folders = getSavedFolders();
  const updated = folders.filter((f) => f.id !== folderId);
  saveFolders(updated);
  return updated;
}

/**
 * Toggle a play in a specific folder
 */
export function togglePlayInFolder(folderId: string, playId: string): PlayFolder[] {
  const folders = getSavedFolders();
  const updated = folders.map((f) => {
    if (f.id === folderId) {
      const exists = f.playIds.includes(playId);
      const newPlayIds = exists ? f.playIds.filter((id) => id !== playId) : [...f.playIds, playId];
      return { ...f, playIds: newPlayIds };
    }
    return f;
  });
  saveFolders(updated);
  return updated;
}

/**
 * Batch update plays in a folder
 */
export function setFolderPlays(folderId: string, playIds: string[]): PlayFolder[] {
  const folders = getSavedFolders();
  const updated = folders.map((f) => {
    if (f.id === folderId) {
      return { ...f, playIds };
    }
    return f;
  });
  saveFolders(updated);
  return updated;
}
