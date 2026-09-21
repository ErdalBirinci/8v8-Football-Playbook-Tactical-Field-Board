import { getSavedFolders, saveFolders } from './folderStorage';
import { getTeamBranding, saveTeamBranding } from './teamBranding';
import { getPracticeScript, savePracticeScript } from './practiceScriptStorage';
import { getInGamePlays, saveInGamePlays } from './inGameTracker';
import { getPlayUsageStats, savePlayUsageStats } from './playUsageStats';
import { getPlayVideoLinks, savePlayVideoLinks } from './playVideoLinks';

export interface PlaybookBackupPayload {
  version: string;
  exportedAt: string;
  folders: any[];
  branding: any;
  practiceScript: any;
  inGamePlays: any[];
  usageStats: Record<string, number>;
  videoLinks: Record<string, any>;
}

export function exportPlaybookBackup(): void {
  const payload: PlaybookBackupPayload = {
    version: '2.0-8v8',
    exportedAt: new Date().toISOString(),
    folders: getSavedFolders(),
    branding: getTeamBranding(),
    practiceScript: getPracticeScript(),
    inGamePlays: getInGamePlays(),
    usageStats: getPlayUsageStats(),
    videoLinks: getPlayVideoLinks(),
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `8v8_playbook_export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importPlaybookBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    if (Array.isArray(data.folders)) {
      saveFolders(data.folders);
    }
    if (data.branding && typeof data.branding === 'object') {
      saveTeamBranding(data.branding);
    }
    if (data.practiceScript && Array.isArray(data.practiceScript.items)) {
      savePracticeScript(data.practiceScript);
    }
    if (Array.isArray(data.inGamePlays)) {
      saveInGamePlays(data.inGamePlays);
    }
    if (data.usageStats && typeof data.usageStats === 'object') {
      savePlayUsageStats(data.usageStats);
    }
    if (data.videoLinks && typeof data.videoLinks === 'object') {
      savePlayVideoLinks(data.videoLinks);
    }

    return { success: true, message: 'Playbook backup restored successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Failed to parse JSON file.' };
  }
}
