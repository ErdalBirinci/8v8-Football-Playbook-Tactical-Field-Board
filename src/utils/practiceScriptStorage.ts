import { PracticeScript, PracticeScriptItem } from '../types';

const STORAGE_KEY = '8v8_playbook_practice_script_v1';

export const DEFAULT_PRACTICE_SCRIPT: PracticeScript = {
  id: 'script-default-install',
  title: 'Game Week 1 - 15 Play Practice Script',
  date: '2026-09-21',
  gameWeek: 'Week 1 vs Helsinki Roosters',
  items: [
    { id: 'item-1', playId: 'trips-run-101-right', order: 1, period: '1st & 10 (Install)', hash: 'MIDDLE', coachNote: 'Base power run outside zone' },
    { id: 'item-2', playId: 'trips-pass-97-right', order: 2, period: '1st & 10 (Install)', hash: 'MIDDLE', coachNote: 'Corner/Smash read vs Cover 2' },
    { id: 'item-3', playId: 'twins-pass-31-right', order: 3, period: '2nd & Medium', hash: 'LEFT', coachNote: 'Quick 3-step rhythm slant' },
    { id: 'item-4', playId: 'twins-run-39-right', order: 4, period: '2nd & Short', hash: 'RIGHT', coachNote: 'Jet sweep motion timing' },
    { id: 'item-5', playId: 'empty-pass-11-right', order: 5, period: '3rd & Long (7+)', hash: 'MIDDLE', coachNote: 'Four verticals stretch deep safeties' },
    { id: 'item-6', playId: 'trips-pass-98-right', order: 6, period: '3rd & Medium (4-6)', hash: 'LEFT', coachNote: 'Flood concept toward sideline boundary' },
    { id: 'item-7', playId: 'two-line-pass-61-right', order: 7, period: 'Red Zone (15 Yd Line)', hash: 'MIDDLE', coachNote: 'High-low crossers in condensed field' },
    { id: 'item-8', playId: 'two-line-run-63-right', order: 8, period: 'Goal Line (3 Yd Line)', hash: 'MIDDLE', coachNote: 'Inside power punch behind RG & C' },
    { id: 'item-9', playId: 'split-pass-81-right', order: 9, period: '2-Minute Drill', hash: 'RIGHT', coachNote: 'Out routes to stop clock' },
    { id: 'item-10', playId: 'empty-pass-12-right', order: 10, period: '2-Minute Drill', hash: 'MIDDLE', coachNote: 'Dig route over middle behind LB drop' },
  ],
};

export function getPracticeScript(): PracticeScript {
  if (typeof window === 'undefined') return DEFAULT_PRACTICE_SCRIPT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRACTICE_SCRIPT;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PRACTICE_SCRIPT;
  }
}

export function savePracticeScript(script: PracticeScript): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(script));
    window.dispatchEvent(new CustomEvent('playbook_script_updated', { detail: script }));
  } catch (e) {
    console.error('Failed to save practice script', e);
  }
}

export function addPlayToScript(playId: string, period = '1st & 10', hash: 'LEFT' | 'MIDDLE' | 'RIGHT' = 'MIDDLE'): PracticeScript {
  const script = getPracticeScript();
  const newItem: PracticeScriptItem = {
    id: `script-item-${Date.now()}`,
    playId,
    order: script.items.length + 1,
    period,
    hash,
    coachNote: '',
  };
  const updated: PracticeScript = {
    ...script,
    items: [...script.items, newItem],
  };
  savePracticeScript(updated);
  return updated;
}

export function removePlayFromScript(itemId: string): PracticeScript {
  const script = getPracticeScript();
  const updatedItems = script.items
    .filter((it) => it.id !== itemId)
    .map((it, idx) => ({ ...it, order: idx + 1 }));
  const updated = { ...script, items: updatedItems };
  savePracticeScript(updated);
  return updated;
}

export function reorderScriptItem(fromIndex: number, toIndex: number): PracticeScript {
  const script = getPracticeScript();
  const items = [...script.items];
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  const renumbered = items.map((it, idx) => ({ ...it, order: idx + 1 }));
  const updated = { ...script, items: renumbered };
  savePracticeScript(updated);
  return updated;
}
