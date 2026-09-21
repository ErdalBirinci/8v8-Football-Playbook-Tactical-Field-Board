import { PlayVideoLink } from '../types';

const STORAGE_KEY = '8v8_playbook_video_links_v1';

export function getPlayVideoLinks(): Record<string, PlayVideoLink[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function savePlayVideoLinks(links: Record<string, PlayVideoLink[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    window.dispatchEvent(new CustomEvent('playbook_video_links_updated', { detail: links }));
  } catch (e) {
    console.error('Failed to save video links', e);
  }
}

export function addVideoLinkToPlay(playId: string, link: Omit<PlayVideoLink, 'playId'>): void {
  const current = getPlayVideoLinks();
  const playLinks = current[playId] || [];
  
  // Format embedUrl if YouTube
  let embedUrl = link.url;
  if (link.url.includes('youtube.com/watch?v=')) {
    const videoId = link.url.split('v=')[1]?.split('&')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (link.url.includes('youtu.be/')) {
    const videoId = link.url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  const newLink: PlayVideoLink = {
    ...link,
    playId,
    embedUrl,
  };

  current[playId] = [...playLinks, newLink];
  savePlayVideoLinks(current);
}

export function removeVideoLink(playId: string, index: number): void {
  const current = getPlayVideoLinks();
  const playLinks = current[playId] || [];
  if (playLinks[index]) {
    playLinks.splice(index, 1);
    current[playId] = playLinks;
    savePlayVideoLinks(current);
  }
}
