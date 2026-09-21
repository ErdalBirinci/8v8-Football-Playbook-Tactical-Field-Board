import React, { useState, useMemo, useEffect } from 'react';
import { PlayFolder, Play } from '../types';
import { ALL_PLAYBOOK_PLAYS } from '../data/allPlays';
import { FOLDER_COLORS_META } from '../utils/folderStorage';
import {
  getPlayUsageStats,
  recordPlayUsage,
  resetUsageStatsToDefaults,
  PlayUsageMap,
} from '../utils/playUsageStats';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  X,
  Folder,
  Flame,
  Activity,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface GamePlanStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: PlayFolder[];
  activeFolderId?: string | null;
  onSelectPlay?: (play: Play) => void;
  onOpenFolderManager?: (folderId: string) => void;
}

export const GamePlanStatsModal: React.FC<GamePlanStatsModalProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolderId: initialActiveFolderId,
  onSelectPlay,
  onOpenFolderManager,
}) => {
  // Select active folder inside the modal (default to provided activeFolderId or first folder)
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => {
    if (initialActiveFolderId && initialActiveFolderId !== 'ALL') return initialActiveFolderId;
    return folders[0]?.id || 'folder-game-plan-a';
  });

  // Chart layout orientation
  const [chartOrientation, setChartOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  // Color coding mode
  const [colorBy, setColorBy] = useState<'folder' | 'playType'>('playType');

  // Live usage stats
  const [usageStats, setUsageStats] = useState<PlayUsageMap>(() => getPlayUsageStats());

  // Listen for background updates to usage stats
  useEffect(() => {
    const handleUsageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PlayUsageMap>;
      if (customEvent.detail) {
        setUsageStats(customEvent.detail);
      } else {
        setUsageStats(getPlayUsageStats());
      }
    };
    window.addEventListener('playbook_usage_updated', handleUsageUpdate);
    return () => window.removeEventListener('playbook_usage_updated', handleUsageUpdate);
  }, []);

  // Sync initial folder when modal opens
  useEffect(() => {
    if (isOpen && initialActiveFolderId && initialActiveFolderId !== 'ALL') {
      setSelectedFolderId(initialActiveFolderId);
    }
  }, [isOpen, initialActiveFolderId]);

  // Selected folder object
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || folders[0] || null;
  }, [folders, selectedFolderId]);

  // Plays belonging to the current folder
  const folderPlays = useMemo(() => {
    if (!currentFolder) return [];
    return ALL_PLAYBOOK_PLAYS.filter((p) => currentFolder.playIds.includes(p.id));
  }, [currentFolder]);

  // Usage data for the selected plays
  const chartData = useMemo(() => {
    if (folderPlays.length === 0) return [];

    const list = folderPlays.map((play) => {
      const calls = usageStats[play.id] || 0;
      return {
        id: play.id,
        playNumber: play.playNumber,
        code: play.code,
        displayName: `#${play.playNumber} ${play.code.replace(/^\d+\.\s*/, '')}`,
        shortName: `#${play.playNumber}`,
        englishName: play.englishName,
        category: play.category,
        playType: play.playType,
        direction: play.direction,
        calls,
      };
    });

    // Sort by frequency descending (most frequent first)
    list.sort((a, b) => b.calls - a.calls);

    const totalCalls = list.reduce((sum, item) => sum + item.calls, 0);

    return list.map((item) => ({
      ...item,
      percentage: totalCalls > 0 ? Math.round((item.calls / totalCalls) * 100) : 0,
    }));
  }, [folderPlays, usageStats]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCalls = chartData.reduce((sum, p) => sum + p.calls, 0);
    const mostFrequent = chartData.length > 0 ? chartData[0] : null;

    const passCalls = chartData
      .filter((p) => p.playType === 'PASS' || p.playType === 'PLAY_ACTION')
      .reduce((sum, p) => sum + p.calls, 0);

    const runCalls = chartData
      .filter((p) => p.playType === 'RUN')
      .reduce((sum, p) => sum + p.calls, 0);

    const screenCalls = chartData
      .filter((p) => p.playType === 'SCREEN')
      .reduce((sum, p) => sum + p.calls, 0);

    const passPct = totalCalls > 0 ? Math.round(((passCalls + screenCalls) / totalCalls) * 100) : 0;
    const runPct = totalCalls > 0 ? Math.round((runCalls / totalCalls) * 100) : 0;
    const avgCalls = chartData.length > 0 ? (totalCalls / chartData.length).toFixed(1) : '0';

    return {
      totalCalls,
      mostFrequent,
      passCalls,
      runCalls,
      screenCalls,
      passPct,
      runPct,
      avgCalls,
    };
  }, [chartData]);

  if (!isOpen) return null;

  // Folder Color styling
  const folderColorMeta = currentFolder
    ? FOLDER_COLORS_META[currentFolder.color] || FOLDER_COLORS_META.blue
    : FOLDER_COLORS_META.blue;

  // Color helper for chart bars
  const getBarColor = (item: (typeof chartData)[0]) => {
    if (colorBy === 'folder') {
      switch (currentFolder?.color) {
        case 'blue':
          return '#2563eb';
        case 'purple':
          return '#9333ea';
        case 'amber':
          return '#d97706';
        case 'emerald':
          return '#059669';
        case 'rose':
          return '#e11d48';
        case 'cyan':
          return '#0891b2';
        case 'indigo':
          return '#4f46e5';
        default:
          return '#2563eb';
      }
    }

    // Color by play type
    switch (item.playType) {
      case 'RUN':
        return '#10b981'; // Emerald
      case 'PASS':
        return '#2563eb'; // Blue
      case 'SCREEN':
        return '#06b6d4'; // Cyan
      case 'PLAY_ACTION':
        return '#8b5cf6'; // Purple
      default:
        return '#64748b'; // Slate
    }
  };

  const handleAdjustUsage = (playId: string, delta: number) => {
    const updated = recordPlayUsage(playId, delta);
    setUsageStats(updated);
  };

  const handleReset = () => {
    if (window.confirm('Reset all play call frequencies back to default practice benchmarks?')) {
      const defaults = resetUsageStatsToDefaults();
      setUsageStats(defaults);
    }
  };

  return (
    <div
      id="game-plan-stats-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Game Plan Play Usage Statistics</h2>
              <p className="text-xs text-slate-400 font-mono">
                Visualize play call frequencies, target repetitions &amp; run/pass distribution
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

        {/* Folder Selection Bar */}
        <div className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Folder className="w-3.5 h-3.5 text-blue-600" />
            <span>GAME PLAN FOLDER:</span>
          </span>

          {folders.map((f) => {
            const isSelected = f.id === selectedFolderId;
            const fMeta = FOLDER_COLORS_META[f.color] || FOLDER_COLORS_META.blue;

            return (
              <button
                key={`stats-folder-btn-${f.id}`}
                onClick={() => setSelectedFolderId(f.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border text-xs font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 ${
                  isSelected
                    ? `${fMeta.activeTab} ring-2 ${fMeta.ring}/30`
                    : `${fMeta.badge} hover:opacity-90`
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{f.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-black/5 text-slate-700'
                  }`}
                >
                  {f.playIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {folderPlays.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No plays assigned to this folder</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assign plays to <strong>{currentFolder?.name || 'this folder'}</strong> in the PlaySelector or Folder Manager to view frequency statistics.
              </p>
              {onOpenFolderManager && currentFolder && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenFolderManager(currentFolder.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  + Assign Plays to {currentFolder.name}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Top Tactical KPIs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Calls */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>TOTAL CALLS</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {summaryMetrics.totalCalls} <span className="text-xs font-normal text-slate-500">reps</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across {folderPlays.length} plays</div>
                </div>

                {/* Most Frequent Play */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="text-[11px] font-mono text-blue-700 flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 text-blue-600" />
                    <span>MOST FREQUENT</span>
                  </div>
                  <div className="text-sm font-bold text-blue-950 truncate mt-1">
                    {summaryMetrics.mostFrequent ? summaryMetrics.mostFrequent.code : 'None'}
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                    {summaryMetrics.mostFrequent ? `${summaryMetrics.mostFrequent.calls} calls (${summaryMetrics.mostFrequent.percentage}%)` : '-'}
                  </div>
                </div>

                {/* Run vs Pass Tendency */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PASS / RUN RATIO</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1 flex items-center gap-1.5">
                    <span className="text-blue-600">{summaryMetrics.passPct}% P</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-emerald-600">{summaryMetrics.runPct}% R</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {summaryMetrics.passCalls + summaryMetrics.screenCalls} Pass vs {summaryMetrics.runCalls} Run
                  </div>
                </div>

                {/* Avg Calls / Reps */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>AVG REPS / PLAY</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {summaryMetrics.avgCalls}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Calls per concept</div>
                </div>
              </div>

              {/* Bar Chart Section */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                {/* Chart Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Play Call Frequency Distribution ({currentFolder?.name})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Ranked by practice repetitions and game call frequency
                    </p>
                  </div>

                  {/* Chart display toggles */}
                  <div className="flex items-center gap-2 text-xs">
                    {/* Orientation toggle */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                      <button
                        onClick={() => setChartOrientation('horizontal')}
                        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          chartOrientation === 'horizontal'
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Horizontal
                      </button>
                      <button
                        onClick={() => setChartOrientation('vertical')}
                        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          chartOrientation === 'vertical'
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Vertical
                      </button>
                    </div>

                    {/* Color By toggle */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                      <button
                        onClick={() => setColorBy('playType')}
                        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          colorBy === 'playType'
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Color bars by Pass vs Run vs Screen"
                      >
                        Play Type
                      </button>
                      <button
                        onClick={() => setColorBy('folder')}
                        className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          colorBy === 'folder'
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Color bars using folder accent"
                      >
                        Folder Theme
                      </button>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                {colorBy === 'playType' && (
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                      <span>Pass</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Run</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                      <span>Screen</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      <span>Play-Action</span>
                    </span>
                  </div>
                )}

                {/* Recharts Bar Chart */}
                <div className="w-full pt-2">
                  {chartOrientation === 'horizontal' ? (
                    // Horizontal Bar Chart (Ranking Style - easy to read play names)
                    <div className="w-full" style={{ height: Math.max(260, chartData.length * 36) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="displayName"
                            type="category"
                            width={140}
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                    <div className="font-bold text-blue-400">{data.code}</div>
                                    <div className="text-slate-300 text-[11px]">{data.englishName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {data.category} • {data.playType}
                                    </div>
                                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4 font-mono font-bold text-emerald-400">
                                      <span>Frequency:</span>
                                      <span>
                                        {data.calls} calls ({data.percentage}%)
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="calls" radius={[0, 6, 6, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(entry)}
                                className="transition-opacity hover:opacity-80"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    // Vertical Column Chart
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="horizontal"
                          margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis
                            dataKey="shortName"
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                    <div className="font-bold text-blue-400">{data.code}</div>
                                    <div className="text-slate-300 text-[11px]">{data.englishName}</div>
                                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4 font-mono font-bold text-emerald-400">
                                      <span>Frequency:</span>
                                      <span>
                                        {data.calls} calls ({data.percentage}%)
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="calls" radius={[6, 6, 0, 0]} barSize={26}>
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-v-${index}`}
                                fill={getBarColor(entry)}
                                className="transition-opacity hover:opacity-80"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Plays Usage Ranking Breakdown Table & Live Adjuster */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                      Play Call Log &amp; Practice Rep Adjuster
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Click + / - to track real-time play calls or launch into tactical board
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reset to benchmark distribution"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Benchmarks</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {chartData.map((playItem, rankIdx) => {
                    const originalPlay = folderPlays.find((p) => p.id === playItem.id);
                    const maxCalls = chartData[0]?.calls || 1;
                    const fillPercent = Math.max(5, Math.round((playItem.calls / maxCalls) * 100));

                    return (
                      <div
                        key={`table-play-${playItem.id}`}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank badge */}
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                              rankIdx === 0
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : rankIdx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : rankIdx === 2
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{rankIdx + 1}
                          </div>

                          {/* Play Number Badge */}
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                            {playItem.playNumber}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {playItem.code}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                                  playItem.playType === 'RUN'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : playItem.playType === 'SCREEN'
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {playItem.playType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {playItem.englishName}
                            </div>
                          </div>
                        </div>

                        {/* Frequency Meter and Rep Controls */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {/* Visual progress bar */}
                          <div className="hidden md:flex flex-col items-end gap-0.5 w-24">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {playItem.percentage}% share
                            </span>
                          </div>

                          {/* Reps counter & Adjuster buttons */}
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleAdjustUsage(playItem.id, -1)}
                              disabled={playItem.calls <= 0}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer transition-colors"
                              title="Decrease reps"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-9 text-center font-mono font-bold text-xs text-slate-900">
                              {playItem.calls}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustUsage(playItem.id, 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer transition-colors"
                              title="Increment play call / rep"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* View in tactical field button */}
                          {onSelectPlay && originalPlay && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectPlay(originalPlay);
                                onClose();
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Open in Tactical Field Board"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Statistical analysis based on game calls and practice reps
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
