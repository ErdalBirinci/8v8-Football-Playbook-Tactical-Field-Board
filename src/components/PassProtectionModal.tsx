import React, { useState } from 'react';
import { PASS_PROTECTION_SCHEMES } from '../data/passProtectionData';
import { PassProtectionScheme } from '../types';
import { Shield, X, ShieldAlert, CheckCircle2, ChevronRight, UserCheck, ArrowRight } from 'lucide-react';

interface PassProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassProtectionModal: React.FC<PassProtectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('slide-left');

  if (!isOpen) return null;

  const currentScheme =
    PASS_PROTECTION_SCHEMES.find((s) => s.id === selectedSchemeId) || PASS_PROTECTION_SCHEMES[0];

  return (
    <div
      id="pass-protection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Pass Protection &amp; Blocking Rules</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3 OL (LG, C, RG) + RB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Offensive line slide rules, man assignments &amp; blitz pickup
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

        {/* Protection Scheme Selector Buttons */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none">
          {PASS_PROTECTION_SCHEMES.map((scheme) => {
            const isSelected = scheme.id === currentScheme.id;
            return (
              <button
                key={scheme.id}
                onClick={() => setSelectedSchemeId(scheme.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {scheme.code} • {scheme.name}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{currentScheme.name}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{currentScheme.description}</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                Center Call: {currentScheme.centerCall}
              </div>
            </div>

            {/* Line vs Back Responsibilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>3-OL (LG, C, RG) DUTIES</span>
                </div>
                <div className="font-semibold text-slate-800">{currentScheme.guardResponsibility}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" />
                  <span>RUNNING BACK ASSIGNMENT</span>
                </div>
                <div className="font-semibold text-slate-800">{currentScheme.rbResponsibility}</div>
              </div>
            </div>

            {/* QB Hot Read Callout */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950">
              <div className="font-mono text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span>QUARTERBACK HOT THROW READ</span>
              </div>
              <div className="font-semibold">{currentScheme.qbHotRead}</div>
            </div>
          </div>

          {/* Coaching Execution Checkpoints */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Tactical Blocking Step-by-Step Points
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentScheme.diagramNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-2 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            University League 8-Man Protection Architecture
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
