import React, { useState } from 'react';
import { PLAYBOOK_GLOSSARY, GlossaryTerm } from '../data/glossary';
import { X, Search, Languages, ArrowRight, BookMarked, Globe } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [languageMode, setLanguageMode] = useState<'EN_TO_FI' | 'FI_TO_EN'>('EN_TO_FI');

  if (!isOpen) return null;

  const categories = [
    { key: 'ALL', labelEn: 'All Terms', labelFi: 'Kaikki' },
    { key: 'FORMATION', labelEn: 'Formations', labelFi: 'Muodostelmat' },
    { key: 'ACTION', labelEn: 'Plays & Actions', labelFi: 'Pelikonsertit' },
    { key: 'ROUTE', labelEn: 'Route Tree', labelFi: 'Heittoreitit' },
    { key: 'DEFENSE', labelEn: 'Defenses', labelFi: 'Puolustus' },
    { key: 'POSITION', labelEn: 'Positions', labelFi: 'Pelipaikat' },
    { key: 'TACTIC', labelEn: 'Tactics & Rules', labelFi: 'Taktiikka & Säännöt' },
  ];

  const filtered = PLAYBOOK_GLOSSARY.filter((term) => {
    if (categoryFilter !== 'ALL' && term.category !== categoryFilter) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      term.englishTerm.toLowerCase().includes(q) ||
      term.finnishTerm.toLowerCase().includes(q) ||
      term.description.toLowerCase().includes(q) ||
      term.descriptionFi.toLowerCase().includes(q) ||
      term.example.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <span>EN-FI Football Glossary</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  Englanti - Suomi Sanasto
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Official 8v8 Football (Finland University League) playbook terminology, tactical concepts &amp; formations in English and Finnish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search English or Finnish terms (e.g. Pelinrakentaja, Trips, Flat, Sweep, Reitti)..."
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs font-medium"
              />
            </div>

            {/* Language Order Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-[11px] font-mono">
              <button
                onClick={() => setLanguageMode('EN_TO_FI')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  languageMode === 'EN_TO_FI'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN → FI
              </button>
              <button
                onClick={() => setLanguageMode('FI_TO_EN')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  languageMode === 'FI_TO_EN'
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FI → EN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={`cat-${cat.key}`}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  categoryFilter === cat.key
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.labelEn}</span>
                <span className="opacity-70 text-[10px]">({cat.labelFi})</span>
              </button>
            ))}
          </div>
        </div>

        {/* List of Terms */}
        <div className="p-4 overflow-y-auto space-y-2.5 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No terminology found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((term, i) => {
              const primaryTerm = languageMode === 'EN_TO_FI' ? term.englishTerm : term.finnishTerm;
              const secondaryTerm = languageMode === 'EN_TO_FI' ? term.finnishTerm : term.englishTerm;
              const primaryDesc = languageMode === 'EN_TO_FI' ? term.description : term.descriptionFi;
              const secondaryDesc = languageMode === 'EN_TO_FI' ? term.descriptionFi : term.description;

              return (
                <div
                  key={`glossary-item-${i}`}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-blue-700 font-mono">
                        {primaryTerm}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-sm text-amber-700 font-mono">
                        {secondaryTerm}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      {term.categoryLabelEn} • {term.categoryLabelFi}
                    </span>
                  </div>

                  {/* Bilingual Descriptions */}
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-800 font-sans leading-relaxed">
                      {primaryDesc}
                    </p>
                    <p className="text-slate-500 font-sans italic text-[11px] leading-relaxed border-l-2 border-slate-300 pl-2">
                      {secondaryDesc}
                    </p>
                  </div>

                  {term.example && (
                    <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <span className="font-bold text-emerald-900">Esimerkki / Example:</span>
                      <span>{term.example}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
