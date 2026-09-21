import { InGameDrivePlay, PlayGameResult } from '../types';

const STORAGE_KEY = '8v8_playbook_ingame_tracker_v1';

export function getInGamePlays(): InGameDrivePlay[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveInGamePlays(plays: InGameDrivePlay[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
    window.dispatchEvent(new CustomEvent('playbook_ingame_updated', { detail: plays }));
  } catch (e) {
    console.error('Failed to save in-game plays', e);
  }
}

export function logInGamePlay(play: Omit<InGameDrivePlay, 'id' | 'timestamp'>): InGameDrivePlay[] {
  const current = getInGamePlays();
  const newPlay: InGameDrivePlay = {
    ...play,
    id: `ingame-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  const updated = [newPlay, ...current];
  saveInGamePlays(updated);
  return updated;
}

export function clearInGamePlays(): void {
  saveInGamePlays([]);
}
