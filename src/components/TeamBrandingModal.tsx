import React, { useState } from 'react';
import { TeamBrandingConfig } from '../types';
import { getTeamBranding, saveTeamBranding, DEFAULT_TEAM_BRANDING } from '../utils/teamBranding';
import { Palette, X, RotateCcw, Check, Shield } from 'lucide-react';

interface TeamBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandingChange?: (branding: TeamBrandingConfig) => void;
}

const PRESET_PALETTES = [
  { name: 'Aalto Predators (Red & Black)', primary: '#E31B23', secondary: '#FFF8E7', helmet: '#0A0A0B' },
  { name: 'Navy & Gold (Wolverines)', primary: '#1e3a8a', secondary: '#f59e0b', helmet: '#0f172a' },
  { name: 'Crimson & Cream (Tide)', primary: '#991b1b', secondary: '#fef08a', helmet: '#7f1d1d' },
  { name: 'Emerald & Gold (Irish)', primary: '#065f46', secondary: '#eab308', helmet: '#ca8a04' },
  { name: 'Royal & Silver (Helsinki)', primary: '#2563eb', secondary: '#94a3b8', helmet: '#1e293b' },
  { name: 'Black & Neon Volt', primary: '#09090b', secondary: '#84cc16', helmet: '#18181b' },
  { name: 'Purple & Gold (Vikings)', primary: '#581c87', secondary: '#eab308', helmet: '#3b0764' },
];

export const TeamBrandingModal: React.FC<TeamBrandingModalProps> = ({
  isOpen,
  onClose,
  onBrandingChange,
}) => {
  const [branding, setBranding] = useState<TeamBrandingConfig>(() => getTeamBranding());
  const effectiveBranding = { ...DEFAULT_TEAM_BRANDING, ...(branding || {}) };

  if (!isOpen) return null;

  const handleSave = () => {
    saveTeamBranding(effectiveBranding);
    if (onBrandingChange) onBrandingChange(effectiveBranding);
    onClose();
  };

  const handleReset = () => {
    setBranding(DEFAULT_TEAM_BRANDING);
    saveTeamBranding(DEFAULT_TEAM_BRANDING);
    if (onBrandingChange) onBrandingChange(DEFAULT_TEAM_BRANDING);
  };

  return (
    <div
      id="team-branding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Team Branding &amp; Jersey Kit</h2>
              <p className="text-xs text-slate-400 font-mono">Custom team colors, helmets &amp; tactical player tokens</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Live Token & Jersey Preview */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-around">
            {/* Player Token Preview */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-mono font-bold shadow-lg border-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: branding.primaryJerseyColor,
                  color: branding.numberTextColor,
                  borderColor: branding.secondaryJerseyColor,
                }}
              >
                15
              </div>
              <span className="text-[11px] font-bold text-slate-600 font-mono">Offense Token</span>
            </div>

            {/* Helmet Preview */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2"
                style={{
                  backgroundColor: effectiveBranding.helmetColor,
                  borderColor: effectiveBranding.secondaryJerseyColor,
                }}
              >
                <Shield className="w-7 h-7" style={{ color: effectiveBranding.secondaryJerseyColor }} />
              </div>
              <span className="text-[11px] font-bold text-slate-600 font-mono">Team Helmet</span>
            </div>

            {/* Team Info */}
            <div className="text-left">
              <div className="text-base font-extrabold text-slate-900">{effectiveBranding.teamName}</div>
              <div className="text-xs font-mono font-bold text-blue-600">[{effectiveBranding.abbreviation}]</div>
              <div className="text-[10px] text-slate-500 mt-1">Finland University League 8v8</div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Popular College Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setBranding((prev) => ({
                      ...effectiveBranding,
                      ...(prev || {}),
                      primaryJerseyColor: preset.primary,
                      secondaryJerseyColor: preset.secondary,
                      helmetColor: preset.helmet,
                    }));
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-medium cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center -space-x-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="truncate text-[11px]">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Team Name</label>
              <input
                type="text"
                value={effectiveBranding.teamName}
                onChange={(e) => setBranding({ ...effectiveBranding, teamName: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Abbreviation</label>
              <input
                type="text"
                maxLength={4}
                value={effectiveBranding.abbreviation}
                onChange={(e) => setBranding({ ...effectiveBranding, abbreviation: e.target.value.toUpperCase() })}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Primary Jersey</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryJerseyColor}
                  onChange={(e) => setBranding({ ...branding, primaryJerseyColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono font-semibold">{branding.primaryJerseyColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Secondary / Trim</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.secondaryJerseyColor}
                  onChange={(e) => setBranding({ ...branding, secondaryJerseyColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono font-semibold">{branding.secondaryJerseyColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Helmet Shell</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.helmetColor}
                  onChange={(e) => setBranding({ ...branding, helmetColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono font-semibold">{branding.helmetColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Kit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
