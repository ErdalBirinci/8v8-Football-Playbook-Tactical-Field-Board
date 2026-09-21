import React, { useState } from 'react';
import { Play, PlayVideoLink } from '../types';
import { getPlayVideoLinks, addVideoLinkToPlay, removeVideoLink } from '../utils/playVideoLinks';
import { Tv, X, Plus, Trash2, ExternalLink, Video } from 'lucide-react';

interface FilmRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: Play;
}

export const FilmRoomModal: React.FC<FilmRoomModalProps> = ({
  isOpen,
  onClose,
  play,
}) => {
  const [videoLinks, setVideoLinks] = useState(() => getPlayVideoLinks());
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentPlayLinks = videoLinks[play.id] || [];

  const handleAdd = () => {
    if (!url.trim()) return;
    addVideoLinkToPlay(play.id, {
      title: title.trim() || `Film Clip ${currentPlayLinks.length + 1}`,
      url: url.trim(),
      platform: url.includes('youtube') || url.includes('youtu.be') ? 'youtube' : url.includes('hudl') ? 'hudl' : 'other',
      notes: notes.trim(),
    });
    setVideoLinks(getPlayVideoLinks());
    setUrl('');
    setTitle('');
    setNotes('');
  };

  const handleRemove = (idx: number) => {
    removeVideoLink(play.id, idx);
    setVideoLinks(getPlayVideoLinks());
  };

  return (
    <div
      id="film-room-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Film Room &amp; Video Clips</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentPlayLinks.length} Clips
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {play.code} • {play.englishName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add Video Form */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Attach Hudl / YouTube / Video URL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Clip Title (e.g. 'Game vs Aalto - Slot Seam TD')"
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Video URL (YouTube, Hudl, Vimeo)"
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Coaching notes on this clip (e.g. 'Notice WR1 stem depth before cut')"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clip</span>
              </button>
            </div>
          </div>

          {/* Attached Clips List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Play Film Library
            </h4>

            {currentPlayLinks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No video clips attached yet for {play.code}. Add Hudl or YouTube links above to review execution with players!
              </div>
            ) : (
              <div className="space-y-4">
                {currentPlayLinks.map((clip, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{clip.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={clip.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-purple-50 text-purple-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Video</span>
                        </a>
                        <button
                          onClick={() => handleRemove(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* YouTube Embed if valid */}
                    {clip.embedUrl && (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                        <iframe
                          src={clip.embedUrl}
                          title={clip.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {clip.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <strong className="text-purple-700">Film Note: </strong>
                        {clip.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Film room clips stored per play
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
