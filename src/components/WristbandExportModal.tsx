import React, { useState } from 'react';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import { X, Printer, Download, Filter, FileText } from 'lucide-react';

interface WristbandExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WristbandExportModal: React.FC<WristbandExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'TRIPS PASS',
    'TWINS PASS',
    'EMPTY PASS',
    '2 LINE PASS',
  ]);
  const [columns, setColumns] = useState<3 | 4>(3);

  if (!isOpen) return null;

  const categories = [
    'TRIPS PASS',
    'TRIPS RUN',
    'TWINS PASS',
    'TWINS RUN',
    'EMPTY PASS',
    'EMPTY RUN',
    '2 LINE PASS',
    '2 LINE RUN',
    '1 LINE PASS',
    '1 LINE RUN',
    'SPLIT PASS',
    'SPLIT RUN',
  ];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const playsToPrint = ALL_PLAYBOOK_PLAYS.filter((p) =>
    selectedCategories.includes(p.category)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                QB Wristband &amp; Coach Call Sheet Generator
              </h3>
              <p className="text-xs text-slate-500">
                Generate high-density printable play call grids for game-day armbands
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Sheet
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden in print) */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white print:hidden text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-slate-700 uppercase">Include Formations:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Layout Columns:</span>
              <button
                onClick={() => setColumns(3)}
                className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
                  columns === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3-Col
              </button>
              <button
                onClick={() => setColumns(4)}
                className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
                  columns === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                4-Col Compact
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={`wristband-cat-${cat}`}
                onClick={() => toggleCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all border ${
                  selectedCategories.includes(cat)
                    ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Grid Sheet */}
        <div className="p-6 overflow-y-auto bg-slate-50 print:bg-white print:text-black print:p-0">
          <div className="text-center mb-4 print:mb-2">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <img
                src="/aalto-predators-logo.svg"
                alt="Aalto Predators Logo"
                className="w-7 h-7 object-contain inline-block rounded bg-black p-0.5"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-base font-black text-slate-900 print:text-black uppercase tracking-widest font-mono">
                AALTO PREDATORS 8v8 CALL SHEET
              </h2>
            </div>
            <p className="text-xs text-slate-500 print:text-gray-600 font-mono">
              Total Plays: {playsToPrint.length} | Finland University League | Wristband Insertion
            </p>
          </div>

          <div
            className={`grid gap-2 text-left ${
              columns === 4
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            }`}
          >
            {playsToPrint.map((play) => (
              <div
                key={`call-sheet-${play.id}`}
                className="p-2.5 rounded-lg border border-slate-200 print:border-black bg-white print:bg-white flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs bg-slate-100 print:bg-gray-200 text-blue-700 print:text-black px-1.5 py-0.5 rounded border border-slate-200">
                    #{play.playNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 print:text-gray-600 font-bold">
                    {play.direction}
                  </span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900 print:text-black leading-tight">
                  {play.code}
                </div>
                <div className="text-[10px] text-slate-500 print:text-gray-600 mt-1 truncate">
                  {play.englishName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
