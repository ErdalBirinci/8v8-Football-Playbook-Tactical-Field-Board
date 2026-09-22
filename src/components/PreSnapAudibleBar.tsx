import React from 'react';
import { Play } from '../types';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import { footballAudio } from '../utils/audioSynthesizer';
import { Zap, Shield, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export type AudibleCall =
  | 'BASE'
  | 'HOT_SLANT'
  | 'HOT_SMOKE'
  | 'CHECK_RUN'
  | 'BUBBLE_SCREEN'
  | 'MAX_PROTECT';

interface PreSnapAudibleBarProps {
  activePlay?: Play;
  currentAudible?: AudibleCall;
  onSelectAudible?: (audible: AudibleCall) => void;
  onSelectAudiblePlay?: (play: Play) => void;
  onClose: () => void;
}

export const PreSnapAudibleBar: React.FC<PreSnapAudibleBarProps> = ({
  activePlay,
  currentAudible = 'BASE',
  onSelectAudible,
  onSelectAudiblePlay,
  onClose,
}) => {
  const [selectedCall, setSelectedCall] = React.useState<AudibleCall>(currentAudible);

  const handleAudibleSelect = (call: AudibleCall) => {
    setSelectedCall(call);
    onSelectAudible?.(call);
    footballAudio.playAudible();

    if (onSelectAudiblePlay) {
      if (call === 'HOT_SLANT') {
        // Quick slant audible
        const slantPlay = ALL_PLAYBOOK_PLAYS.find((p) => p.code.includes('Slant') || p.conceptName.includes('Slant') || p.id.includes('slant')) || ALL_PLAYBOOK_PLAYS[0];
        onSelectAudiblePlay(slantPlay);
      } else if (call === 'CHECK_RUN') {
        // Dive run check
        const runPlay = ALL_PLAYBOOK_PLAYS.find((p) => p.playType === 'RUN' && (p.code.includes('Dive') || p.code.includes('Lead') || p.code.includes('Blast'))) || ALL_PLAYBOOK_PLAYS.find((p) => p.playType === 'RUN') || ALL_PLAYBOOK_PLAYS[0];
        onSelectAudiblePlay(runPlay);
      } else if (call === 'HOT_SMOKE' || call === 'BUBBLE_SCREEN') {
        // Quick perimeter screen or quick game
        const quickPlay = ALL_PLAYBOOK_PLAYS.find((p) => p.tags.includes('QuickGame') || p.code.includes('Screen') || p.conceptName.includes('Screen')) || ALL_PLAYBOOK_PLAYS[1];
        onSelectAudiblePlay(quickPlay);
      } else if (call === 'MAX_PROTECT') {
        const passPlay = ALL_PLAYBOOK_PLAYS.find((p) => p.playType === 'PASS' && p.qbDrop.includes('Shotgun')) || ALL_PLAYBOOK_PLAYS[0];
        onSelectAudiblePlay(passPlay);
      } else if (call === 'BASE' && activePlay) {
        onSelectAudiblePlay(activePlay);
      }
    }
  };

  const audibles: { id: AudibleCall; label: string; desc: string; iconColor: string }[] = [
    {
      id: 'BASE',
      label: 'Base Call',
      desc: 'Execute original playbook design',
      iconColor: 'text-slate-400',
    },
    {
      id: 'HOT_SLANT',
      label: 'Hot: Slant',
      desc: '3-step quick slant vs aggressive zero blitz',
      iconColor: 'text-amber-400',
    },
    {
      id: 'HOT_SMOKE',
      label: 'Hot: Smoke',
      desc: '1-step latch throw attacking soft off-cushion CB',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'CHECK_RUN',
      label: 'Check: Dive',
      desc: 'Check to interior run vs light 3-man box',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'BUBBLE_SCREEN',
      label: 'Bubble Screen',
      desc: 'Perimeter quick-screen utilizing slot seal blocks',
      iconColor: 'text-purple-400',
    },
    {
      id: 'MAX_PROTECT',
      label: 'Max Protect',
      desc: 'RB locks inside A-gap to pick up overload rush',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="w-full bg-slate-950/95 border-b border-amber-500/50 p-2.5 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto text-xs animate-fade-in select-none">
      <div className="flex items-center gap-2 shrink-0">
        <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <Zap className="w-4 h-4 fill-current" />
        </span>
        <div>
          <span className="font-bold text-amber-300 block font-mono text-[11px]">
            PRE-SNAP AUDIBLE ENGINE
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block">
            Call instant hot routes or protection checks at line of scrimmage
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {audibles.map((a) => {
          const isActive = selectedCall === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleAudibleSelect(a.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-850 hover:border-slate-600'
              }`}
              title={a.desc}
            >
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="px-2 py-1 text-slate-400 hover:text-white text-xs rounded hover:bg-slate-900 shrink-0"
      >
        Close
      </button>
    </div>
  );
};
