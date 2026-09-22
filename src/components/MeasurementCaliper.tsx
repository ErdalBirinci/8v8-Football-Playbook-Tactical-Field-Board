import React, { useState } from 'react';
import { Ruler, X, RotateCcw } from 'lucide-react';

interface MeasurementCaliperProps {
  isActive: boolean;
  onClose: () => void;
  // Callback when user clicks on SVG field
  fieldWidthYards?: number; // default ~40 yds for 8v8
  fieldLengthYards?: number; // default ~80 yds
}

export interface CaliperPoint {
  x: number; // 0 to 100 on SVG
  y: number; // 0 to 100 on SVG
}

export const MeasurementCaliper: React.FC<MeasurementCaliperProps> = ({
  isActive,
  onClose,
  fieldWidthYards = 40,
  fieldLengthYards = 80,
}) => {
  const [pointA, setPointA] = useState<CaliperPoint | null>(null);
  const [pointB, setPointB] = useState<CaliperPoint | null>(null);

  if (!isActive) return null;

  // Calculate distance in yards
  let totalYards = 0;
  let horizontalYards = 0;
  let verticalYards = 0;

  if (pointA && pointB) {
    const dx = ((pointB.x - pointA.x) / 100) * fieldWidthYards;
    const dy = ((pointB.y - pointA.y) / 100) * fieldLengthYards;
    horizontalYards = Math.abs(dx);
    verticalYards = Math.abs(dy);
    totalYards = Math.sqrt(dx * dx + dy * dy);
  }

  const handleReset = () => {
    setPointA(null);
    setPointB(null);
  };

  return (
    <div className="absolute top-16 right-4 z-40 bg-slate-950/90 backdrop-blur-md border border-cyan-500/60 rounded-2xl p-3 shadow-2xl text-xs font-mono text-slate-200 w-72 pointer-events-auto select-none animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Ruler className="w-4 h-4" />
          <span>TACTICAL CALIPER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Reset Measurement Points"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="py-2.5 space-y-2">
        <p className="text-[11px] text-slate-400">
          Click two positions on the field to measure exact receiver splits, dropback depth, or spacing:
        </p>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Diagonal Distance:</span>
            <span className="text-sm font-bold text-cyan-300">
              {pointA && pointB ? `${totalYards.toFixed(1)} YDS` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Horizontal Split:</span>
            <span className="text-slate-300">
              {pointA && pointB ? `${horizontalYards.toFixed(1)} YDS` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Vertical Depth:</span>
            <span className="text-slate-300">
              {pointA && pointB ? `${verticalYards.toFixed(1)} YDS` : '--'}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center">
          {!pointA
            ? '📍 Step 1: Click anywhere on field for Point A'
            : !pointB
            ? '📍 Step 2: Click second location for Point B'
            : '✓ Distance measured. Click reset or a new point.'}
        </div>
      </div>
    </div>
  );
};
