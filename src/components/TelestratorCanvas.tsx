import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Highlighter,
  ArrowUpRight,
  Eraser,
  RotateCcw,
  Trash2,
  X,
  Palette,
} from 'lucide-react';

interface TelestratorCanvasProps {
  isActive: boolean;
  onClose: () => void;
  width?: number;
  height?: number;
}

type DrawTool = 'pen' | 'highlighter' | 'arrow' | 'eraser';

interface DrawElement {
  id: string;
  tool: DrawTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export const TelestratorCanvas: React.FC<TelestratorCanvasProps> = ({
  isActive,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<DrawTool>('pen');
  const [activeColor, setActiveColor] = useState<string>('#facc15'); // Neon Yellow default
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  const colors = [
    { name: 'Neon Yellow', hex: '#facc15' },
    { name: 'Predator Red', hex: '#ef4444' },
    { name: 'Electric Cyan', hex: '#06b6d4' },
    { name: 'White Chalk', hex: '#ffffff' },
    { name: 'Bright Green', hex: '#22c55e' },
  ];

  // Resize canvas to match container size
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      redraw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isActive, elements]);

  // Redraw all saved elements
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    elements.forEach((el) => {
      if (el.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.tool === 'highlighter') {
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width * 2.8;
      } else if (el.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = el.width * 3;
      } else {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
      }

      ctx.moveTo(el.points[0].x, el.points[0].y);

      if (el.tool === 'arrow') {
        // Line with arrow head
        const start = el.points[0];
        const end = el.points[el.points.length - 1];
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = Math.max(14, el.width * 3.5);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else {
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    currentPathRef.current = [coords];
  };

  const handleDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    currentPathRef.current.push(coords);

    // Live preview
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentPathRef.current;
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'highlighter') {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth * 2.8;
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 3;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
    }

    if (activeTool === 'arrow') {
      redraw();
      const start = points[0];
      const end = points[points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = Math.max(14, strokeWidth * 3.5);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 6),
        end.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 6),
        end.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPathRef.current.length > 1) {
      const newElement: DrawElement = {
        id: `draw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tool: activeTool,
        color: activeColor,
        width: strokeWidth,
        points: [...currentPathRef.current],
      };
      setElements((prev) => [...prev, newElement]);
    }
    currentPathRef.current = [];
  };

  const handleUndo = () => {
    setElements((prev) => {
      const next = prev.slice(0, -1);
      return next;
    });
  };

  const handleClear = () => {
    setElements([]);
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-40 pointer-events-auto select-none cursor-crosshair"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={handleStartDraw}
        onMouseMove={handleDraw}
        onMouseUp={handleEndDraw}
        onMouseLeave={handleEndDraw}
        onTouchStart={handleStartDraw}
        onTouchMove={handleDraw}
        onTouchEnd={handleEndDraw}
      />

      {/* Floating Telestrator Toolbar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-2 flex-wrap max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tool Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'pen'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Freehand Chalk Pen"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('arrow')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'arrow'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Directional Vector Arrow"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Translucent Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'eraser'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Precision Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {colors.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setActiveColor(c.hex)}
              className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                activeColor === c.hex
                  ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950'
                  : 'hover:scale-110 opacity-80'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Line Thickness */}
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => setStrokeWidth(2)}
            className={`px-2 py-1 rounded ${
              strokeWidth === 2 ? 'bg-slate-700 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            Fine
          </button>
          <button
            type="button"
            onClick={() => setStrokeWidth(4)}
            className={`px-2 py-1 rounded ${
              strokeWidth === 4 ? 'bg-slate-700 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            Med
          </button>
          <button
            type="button"
            onClick={() => setStrokeWidth(7)}
            className={`px-2 py-1 rounded ${
              strokeWidth === 7 ? 'bg-slate-700 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            Thick
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={elements.length === 0}
            className="p-2 text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-slate-800 disabled:opacity-40 transition-colors"
            title="Undo Last Stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={elements.length === 0}
            className="p-2 text-rose-400 hover:text-rose-200 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-slate-800 disabled:opacity-40 transition-colors"
            title="Clear All Markings"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 transition-colors"
            title="Exit Telestrator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
