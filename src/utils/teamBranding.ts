import { TeamBrandingConfig } from '../types';

const STORAGE_KEY = '8v8_playbook_team_branding_v1';

export const DEFAULT_TEAM_BRANDING: TeamBrandingConfig = {
  teamName: 'Aalto Predators',
  abbreviation: 'PRED',
  primaryJerseyColor: '#E31B23', // Predator Crimson Red
  secondaryJerseyColor: '#FFF8E7', // Cream / Ivory
  numberTextColor: '#ffffff',
  helmetColor: '#0A0A0B', // Jet Black Helmet
  accentColor: '#E31B23',
  fieldGrassTone: 'classic',
};

export function getTeamBranding(): TeamBrandingConfig {
  if (typeof window === 'undefined') return DEFAULT_TEAM_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEAM_BRANDING;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TEAM_BRANDING, ...parsed };
  } catch (e) {
    console.warn('Failed to parse team branding, returning defaults', e);
    return DEFAULT_TEAM_BRANDING;
  }
}

export function saveTeamBranding(branding: TeamBrandingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    window.dispatchEvent(new CustomEvent('playbook_branding_updated', { detail: branding }));
  } catch (e) {
    console.error('Failed to save team branding', e);
  }
}
