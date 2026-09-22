import React, { useState } from 'react';
import { RosterPlayer, TokenDisplayMode } from '../types';
import {
  OFFENSIVE_SLOTS,
  ROSTER_PRESETS,
  TeamInfo,
  DEFAULT_ROSTER,
  DEFAULT_TEAM_INFO,
  loadTeamInfoFromStorage,
  saveTeamInfoToStorage,
} from '../data/rosterData';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  ArrowRightLeft,
  AlertCircle,
  Download,
  Upload,
  Printer,
  Shield,
  Zap,
  Info,
  Layers,
  LayoutGrid,
  Flame,
} from 'lucide-react';
import { DepthChartDndSection } from './DepthChartDndSection';

interface RosterManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterPlayer[];
  onUpdateRoster: (newRoster: RosterPlayer[]) => void;
  teamInfo?: TeamInfo;
  onUpdateTeamInfo?: (info: TeamInfo) => void;
  tokenDisplayMode: TokenDisplayMode;
  onUpdateTokenMode?: (mode: TokenDisplayMode) => void;
  onUpdateTokenDisplayMode?: (mode: TokenDisplayMode) => void;
}

export const RosterManagementModal: React.FC<RosterManagementModalProps> = ({
  isOpen,
  onClose,
  roster,
  onUpdateRoster,
  teamInfo: propTeamInfo,
  onUpdateTeamInfo,
  tokenDisplayMode,
  onUpdateTokenMode,
  onUpdateTokenDisplayMode,
}) => {
  const [internalTeamInfo, setInternalTeamInfo] = useState<TeamInfo>(() => loadTeamInfoFromStorage());
  const effectiveTeamInfo = propTeamInfo || internalTeamInfo || DEFAULT_TEAM_INFO;

  const handleUpdateTeamInfo = (newInfo: TeamInfo) => {
    setInternalTeamInfo(newInfo);
    saveTeamInfoToStorage(newInfo);
    if (onUpdateTeamInfo) {
      onUpdateTeamInfo(newInfo);
    }
  };

  const handleSetTokenMode = (mode: TokenDisplayMode) => {
    if (onUpdateTokenMode) onUpdateTokenMode(mode);
    if (onUpdateTokenDisplayMode) onUpdateTokenDisplayMode(mode);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'depth_chart' | 'full_roster' | 'team_settings'>('depth_chart');
  const [depthChartViewMode, setDepthChartViewMode] = useState<'dnd' | 'slots'>('dnd');

  // Player Create/Edit state
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formJersey, setFormJersey] = useState('');
  const [formPosition, setFormPosition] = useState<RosterPlayer['primaryPosition']>('WR');
  const [formSlot, setFormSlot] = useState<string>('');
  const [formStatus, setFormStatus] = useState<RosterPlayer['status']>('starter');
  const [formSpeed, setFormSpeed] = useState<number>(90);
  const [formHands, setFormHands] = useState<number>(90);
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState('#2563eb');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick slot swap state
  const [slotSwapFrom, setSlotSwapFrom] = useState<string | null>(null);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Filter roster
  const filteredRoster = roster.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyNumber.includes(searchQuery) ||
      (p.assignedSlot && p.assignedSlot.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPos = positionFilter === 'ALL' || p.primaryPosition === positionFilter;
    return matchesSearch && matchesPos;
  });

  // Calculate roster stats
  const assignedStartersCount = OFFENSIVE_SLOTS.filter((slot) =>
    roster.some((p) => p.assignedSlot === slot.id)
  ).length;

  // Check for duplicate jersey numbers
  const jerseyNumberCounts: Record<string, number> = {};
  roster.forEach((p) => {
    const num = p.jerseyNumber.trim();
    if (num) {
      jerseyNumberCounts[num] = (jerseyNumberCounts[num] || 0) + 1;
    }
  });

  const hasDuplicateNumbers = Object.values(jerseyNumberCounts).some((c) => c > 1);

  // Start adding new player
  const handleStartAdd = () => {
    setEditingPlayerId(null);
    setFormName('');
    // Auto-suggest lowest unused common jersey number
    const usedNums = new Set(roster.map((p) => parseInt(p.jerseyNumber, 10)).filter((n) => !isNaN(n)));
    let suggestedNum = 1;
    while (usedNums.has(suggestedNum) && suggestedNum < 99) {
      suggestedNum++;
    }
    setFormJersey(suggestedNum.toString());
    setFormPosition('WR');
    setFormSlot('');
    setFormStatus('starter');
    setFormSpeed(92);
    setFormHands(90);
    setFormNotes('');
    setFormColor('#2563eb');
    setFormError(null);
    setIsEditingPlayer(true);
  };

  // Start editing existing player
  const handleStartEdit = (player: RosterPlayer) => {
    setEditingPlayerId(player.id);
    setFormName(player.name);
    setFormJersey(player.jerseyNumber);
    setFormPosition(player.primaryPosition);
    setFormSlot(player.assignedSlot || '');
    setFormStatus(player.status);
    setFormSpeed(player.speedRating || 90);
    setFormHands(player.handsRating || 90);
    setFormNotes(player.notes || '');
    setFormColor(player.avatarColor || '#2563eb');
    setFormError(null);
    setIsEditingPlayer(true);
  };

  // Save Add/Edit
  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Player name is required');
      return;
    }
    if (!formJersey.trim()) {
      setFormError('Jersey number is required');
      return;
    }

    const cleanJersey = formJersey.trim().replace(/^#/, '');

    if (editingPlayerId) {
      // Editing existing
      const updated = roster.map((p) => {
        if (p.id === editingPlayerId) {
          return {
            ...p,
            name: formName.trim(),
            jerseyNumber: cleanJersey,
            primaryPosition: formPosition,
            assignedSlot: formSlot || null,
            status: formStatus,
            speedRating: Number(formSpeed),
            handsRating: Number(formHands),
            notes: formNotes.trim(),
            avatarColor: formColor,
          };
        }
        // If another player had this slot and we assigned it to this player, unassign the other
        if (formSlot && p.assignedSlot === formSlot && p.id !== editingPlayerId) {
          return { ...p, assignedSlot: null, status: p.status === 'starter' ? 'substitute' : p.status };
        }
        return p;
      });
      onUpdateRoster(updated);
      showToast(`Updated #${cleanJersey} ${formName}`);
    } else {
      // Creating new
      const newPlayer: RosterPlayer = {
        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: formName.trim(),
        jerseyNumber: cleanJersey,
        primaryPosition: formPosition,
        assignedSlot: formSlot || null,
        status: formStatus,
        speedRating: Number(formSpeed),
        handsRating: Number(formHands),
        notes: formNotes.trim(),
        avatarColor: formColor,
      };

      // Unassign slot from others if taken
      const updated = roster.map((p) => {
        if (formSlot && p.assignedSlot === formSlot) {
          return { ...p, assignedSlot: null };
        }
        return p;
      });

      onUpdateRoster([...updated, newPlayer]);
      showToast(`Added #${cleanJersey} ${formName} to roster`);
    }

    setIsEditingPlayer(false);
  };

  // Delete player
  const handleDeletePlayer = (playerId: string, playerName: string) => {
    if (confirm(`Remove ${playerName} from team roster?`)) {
      const updated = roster.filter((p) => p.id !== playerId);
      onUpdateRoster(updated);
      showToast(`Removed ${playerName}`);
    }
  };

  // Intelligently Auto-Assign Roster to missing 8v8 slot positions based on primaryPosition
  const handleAutoAssignRoster = () => {
    const updated = [...roster];
    let assignedCount = 0;

    // Check which slots are currently unfilled
    const unfilledSlots = OFFENSIVE_SLOTS.filter(
      (slot) => !updated.some((p) => p.assignedSlot === slot.id)
    );

    if (unfilledSlots.length === 0) {
      showToast('All 8 offensive starting slots are already assigned!');
      return;
    }

    // Priority mapping weights: strict match gets highest priority, multi-position/hybrid gets next
    // Slot assignment order prioritizing specific roles (QB, C, LG, RG, RB) before receivers (X, Z, Y)
    const sortedSlots = [...unfilledSlots].sort((a, b) => {
      const priorityOrder: Record<string, number> = { QB: 1, C: 2, LG: 3, RG: 4, RB: 5, X: 6, Z: 7, Y: 8 };
      return (priorityOrder[a.id] || 99) - (priorityOrder[b.id] || 99);
    });

    sortedSlots.forEach((slot) => {
      // Find unassigned candidate players
      const unassignedPlayers = updated.filter((p) => !p.assignedSlot);

      if (unassignedPlayers.length === 0) return;

      // Match scoring function:
      // 1. Exact match with slot recommendation rank (e.g. recommendedPos[0] = 100, recommendedPos[1] = 80)
      // 2. High overall ratings (Speed + Hands) as tiebreaker
      const scoredCandidates = unassignedPlayers
        .map((p) => {
          let score = 0;
          const posIdx = slot.recommendedPos.indexOf(p.primaryPosition);

          if (posIdx === 0) {
            score += 100; // Primary ideal match
          } else if (posIdx > 0) {
            score += 70 - posIdx * 10; // Secondary recommended match
          } else if (['OL', 'OT', 'OG', 'G', 'C', 'LG', 'RG'].includes(p.primaryPosition) && ['LG', 'RG', 'C'].includes(slot.id)) {
            score += 85; // 3 O-Line specialist match
          } else if (p.primaryPosition === 'ATH') {
            score += 50; // Athlete versatile match
          } else if (['WR', 'SLOT', 'TE'].includes(p.primaryPosition) && ['X', 'Z', 'Y'].includes(slot.id)) {
            score += 35; // Compatible pass catcher match
          } else {
            score += 10; // Fallback reserve
          }

          // Quality tiebreaker using ratings
          const qualityBonus = ((p.speedRating || 90) + (p.handsRating || 90)) / 20;
          score += qualityBonus;

          return { player: p, score };
        })
        .sort((a, b) => b.score - a.score);

      const best = scoredCandidates[0]?.player;
      if (best) {
        best.assignedSlot = slot.id;
        best.status = 'starter';
        assignedCount++;
      }
    });

    onUpdateRoster(updated);
    if (assignedCount > 0) {
      showToast(`Auto-assigned ${assignedCount} player${assignedCount > 1 ? 's' : ''} based on positions`);
    } else {
      showToast('No eligible unassigned players found to map');
    }
  };

  // Quick Assign player to slot
  const handleAssignSlot = (slotId: string, playerId: string) => {
    const updated = roster.map((p) => {
      if (p.id === playerId) {
        return { ...p, assignedSlot: slotId, status: 'starter' as const };
      }
      if (p.assignedSlot === slotId) {
        return { ...p, assignedSlot: null, status: 'substitute' as const };
      }
      return p;
    });
    onUpdateRoster(updated);
    const assigned = roster.find((p) => p.id === playerId);
    showToast(`Assigned #${assigned?.jerseyNumber} ${assigned?.name} to ${slotId}`);
  };

  // Quick Unassign slot
  const handleUnassignSlot = (slotId: string) => {
    const updated = roster.map((p) => {
      if (p.assignedSlot === slotId) {
        return { ...p, assignedSlot: null };
      }
      return p;
    });
    onUpdateRoster(updated);
  };

  // Load Preset
  const handleLoadPreset = (presetRoster: RosterPlayer[], presetName: string) => {
    if (confirm(`Load the "${presetName}" preset? This will update your active team roster.`)) {
      onUpdateRoster(presetRoster);
      showToast(`Loaded ${presetName}`);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ teamInfo: effectiveTeamInfo, roster, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(effectiveTeamInfo?.teamName || 'Aalto_Predators').replace(/\s+/g, '_')}_8v8_Roster.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported roster JSON');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Jersey', 'Name', 'Primary Position', 'Assigned Slot', 'Status', 'Speed', 'Hands', 'Notes'];
    const rows = roster.map((p) => [
      `#${p.jerseyNumber}`,
      `"${p.name}"`,
      p.primaryPosition,
      p.assignedSlot || 'None',
      p.status,
      p.speedRating || 90,
      p.handsRating || 90,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(effectiveTeamInfo?.teamName || 'Aalto_Predators').replace(/\s+/g, '_')}_Roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported roster CSV');
  };

  // Import JSON or CSV
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.roster)) {
            onUpdateRoster(parsed.roster);
            if (parsed.teamInfo) onUpdateTeamInfo(parsed.teamInfo);
            showToast('Imported roster successfully');
          } else if (Array.isArray(parsed)) {
            onUpdateRoster(parsed);
            showToast('Imported roster successfully');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const newRoster: RosterPlayer[] = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
              if (cols.length >= 2) {
                const jersey = cols[0].replace(/^#/, '');
                const name = cols[1];
                const pos = (cols[2] || 'WR') as RosterPlayer['primaryPosition'];
                const slot = cols[3] && cols[3] !== 'None' ? cols[3] : null;
                const status = (cols[4] || 'starter') as RosterPlayer['status'];
                newRoster.push({
                  id: `imported-${Date.now()}-${i}`,
                  name,
                  jerseyNumber: jersey,
                  primaryPosition: pos,
                  assignedSlot: slot,
                  status,
                  speedRating: Number(cols[5]) || 90,
                  handsRating: Number(cols[6]) || 90,
                  notes: cols[7] || '',
                  avatarColor: '#2563eb',
                });
              }
            }
            if (newRoster.length > 0) {
              onUpdateRoster(newRoster);
              showToast(`Imported ${newRoster.length} players from CSV`);
            }
          }
        }
      } catch (err) {
        alert('Could not parse uploaded roster file. Please ensure valid JSON or CSV format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* ================= MODAL HEADER ================= */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-display text-white">
                  Roster & Jersey Numbers Management
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {assignedStartersCount}/7 Starters Locked
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                Assign real athlete jersey numbers to update 2D field tokens, routes, and call sheets automatically.
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAssignRoster}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Intelligently auto-map unassigned players to offensive starting slots based on position"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Auto-Assign Roster</span>
            </button>
            <button
              onClick={handleStartAdd}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Roster"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= SUB-HEADER TOOLBAR & TABS ================= */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              id="roster-tab-depth-chart"
              onClick={() => setActiveTab('depth_chart')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'depth_chart'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-blue-600" />
              <span>Depth Chart &amp; Lineup</span>
            </button>
            <button
              onClick={() => setActiveTab('full_roster')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'full_roster'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Full Roster</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
                {roster.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('team_settings')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'team_settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Presets & Settings
            </button>
          </div>

          {/* Token Display Mode Switcher */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-medium">Field Board Token Style:</span>
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'jersey', label: 'Jersey # (e.g. #15)' },
                  { id: 'position', label: 'Position (QB)' },
                  { id: 'both', label: 'Both (#15 QB)' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleSetTokenMode(mode.id)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    tokenDisplayMode === mode.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Duplicate jersey number alert */}
        {hasDuplicateNumbers && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Warning:</strong> Multiple players share the same jersey number. Check your roster table to resolve duplicate numbers.
              </span>
            </div>
          </div>
        )}

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ================= TAB 1: 8v8 STARTING LINEUP & DEPTH CHART ================= */}
          {activeTab === 'depth_chart' && (
            <div className="space-y-6">
              {/* Depth Chart View Mode Selector & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                  <button
                    id="depth-view-dnd"
                    onClick={() => setDepthChartViewMode('dnd')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      depthChartViewMode === 'dnd'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-blue-600" />
                    <span>Drag &amp; Drop Depth Chart</span>
                  </button>
                  <button
                    id="depth-view-slots"
                    onClick={() => setDepthChartViewMode('slots')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      depthChartViewMode === 'slots'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                    <span>8v8 Formation Slots Grid</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoAssignRoster}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Intelligently auto-map players to missing positions based on primary position and ratings"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Auto-Assign Starters</span>
                  </button>
                </div>
              </div>

              {/* View 1: Drag and Drop Positional Depth Chart (WRs, O-Line, QBs, RBs) */}
              {depthChartViewMode === 'dnd' && (
                <DepthChartDndSection
                  roster={roster}
                  onUpdateRoster={onUpdateRoster}
                  onShowToast={showToast}
                />
              )}

              {/* View 2: 8v8 Field Formation Slots Grid */}
              {depthChartViewMode === 'slots' && (
                <div className="space-y-6">
                  {/* Informative Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          8v8 Offensive Slot Assignments
                        </h3>
                        <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                          Assigning a player to an offensive slot updates their jersey number on the 2D FieldBoard, route cards, whiteboard, and wristband play sheets instantly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 7 Slot Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {OFFENSIVE_SLOTS.map((slot) => {
                      const assignedPlayer = roster.find((p) => p.assignedSlot === slot.id);
                      const candidateReplacements = roster.filter((p) => p.id !== assignedPlayer?.id);

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-2xl p-4 border transition-all relative ${
                            assignedPlayer
                              ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                              : 'bg-amber-50/50 border-dashed border-amber-300'
                          }`}
                        >
                          {/* Slot Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-black text-sm flex items-center justify-center">
                                {slot.id}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {slot.name}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Rec: {slot.recommendedPos.join(', ')}
                                </span>
                              </div>
                            </div>

                            {assignedPlayer && (
                              <button
                                onClick={() => handleUnassignSlot(slot.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                                title="Unassign Starter"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Assigned Player Details */}
                          {assignedPlayer ? (
                            <div className="mt-3 space-y-3">
                              <div className="flex items-center gap-3">
                                {/* Jersey Token Badge */}
                                <div
                                  className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white font-mono font-black text-lg shadow-sm shrink-0 border-2 border-white"
                                  style={{ backgroundColor: assignedPlayer.avatarColor || '#2563eb' }}
                                >
                                  <span className="text-[9px] font-sans font-bold opacity-80 uppercase leading-none">
                                    #{assignedPlayer.jerseyNumber}
                                  </span>
                                  <span className="text-sm font-black leading-none mt-0.5">
                                    {assignedPlayer.primaryPosition}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-sm font-black text-slate-900 truncate">
                                      {assignedPlayer.name}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                      <Zap className="w-3 h-3" /> SPD {assignedPlayer.speedRating || 90}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-blue-600">
                                      HND {assignedPlayer.handsRating || 90}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {assignedPlayer.notes && (
                                <p className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 italic leading-relaxed">
                                  "{assignedPlayer.notes}"
                                </p>
                              )}

                              {/* Quick Swap Dropdown */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-[11px] text-slate-400 font-medium">Replace with:</span>
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignSlot(slot.id, e.target.value);
                                    }
                                  }}
                                  className="text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-2 py-1 font-medium text-slate-700 cursor-pointer"
                                >
                                  <option value="">Swap Player...</option>
                                  {candidateReplacements.map((cand) => (
                                    <option key={cand.id} value={cand.id}>
                                      #{cand.jerseyNumber} {cand.name} ({cand.primaryPosition})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 text-center py-4 space-y-2">
                              <p className="text-xs text-amber-800 font-medium">
                                No starter assigned
                              </p>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignSlot(slot.id, e.target.value);
                                  }
                                }}
                                className="w-full text-xs bg-white border border-amber-300 text-amber-900 rounded-xl px-3 py-2 font-bold shadow-2xs cursor-pointer hover:bg-amber-50"
                              >
                                <option value="">Select Starter from Roster...</option>
                                {roster.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    #{p.jerseyNumber} {p.name} ({p.primaryPosition}){' '}
                                    {p.assignedSlot ? `[Currently ${p.assignedSlot}]` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: FULL ROSTER TABLE & PLAYER MANAGEMENT ================= */}
          {activeTab === 'full_roster' && (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search player by name, jersey #, or slot..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-mono px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Position Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {['ALL', 'QB', 'WR', 'SLOT', 'RB', 'C', 'TE'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPositionFilter(pos)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        positionFilter === pos
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                {/* Export & Auto-Assign Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAutoAssignRoster}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Auto-assign unassigned roster players to open 8v8 offensive slots based on position"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto-Assign</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Export as CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Export as JSON backup"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4"># Jersey</th>
                        <th className="py-3 px-4">Player Name</th>
                        <th className="py-3 px-4">Position</th>
                        <th className="py-3 px-4">Assigned 8v8 Slot</th>
                        <th className="py-3 px-4">Ratings</th>
                        <th className="py-3 px-4">Notes & Attributes</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredRoster.length > 0 ? (
                        filteredRoster.map((player) => {
                          const isDuplicate = (jerseyNumberCounts[player.jerseyNumber] || 0) > 1;

                          return (
                            <tr
                              key={player.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              {/* Jersey # */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-9 h-9 rounded-xl font-mono font-black text-sm flex items-center justify-center text-white shadow-2xs ${
                                      isDuplicate ? 'ring-2 ring-red-500 ring-offset-1' : ''
                                    }`}
                                    style={{ backgroundColor: player.avatarColor || '#2563eb' }}
                                  >
                                    #{player.jerseyNumber}
                                  </span>
                                  {isDuplicate && (
                                    <span
                                      className="text-red-600 font-bold text-[10px]"
                                      title="Duplicate jersey number on roster"
                                    >
                                      DUPLICATE
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Player Name */}
                              <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                                <div>
                                  <span>{player.name}</span>
                                  <div className="text-[10px] text-slate-400 font-mono font-normal">
                                    Status:{' '}
                                    <span
                                      className={`font-bold ${
                                        player.status === 'starter'
                                          ? 'text-emerald-600'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      {player.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Primary Position */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                  {player.primaryPosition}
                                </span>
                              </td>

                              {/* Assigned Slot */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {player.assignedSlot ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-blue-100 text-blue-800 border border-blue-300">
                                      {player.assignedSlot}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-sans">
                                      Starter
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleAssignSlot(e.target.value, player.id);
                                      }
                                    }}
                                    className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 cursor-pointer"
                                  >
                                    <option value="">Assign to Slot...</option>
                                    {OFFENSIVE_SLOTS.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.id} ({s.name})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>

                              {/* Ratings */}
                              <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-emerald-700 font-bold">
                                    <span>SPD {player.speedRating || 90}</span>
                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${player.speedRating || 90}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-blue-700 font-bold">
                                    <span>HND {player.handsRating || 90}</span>
                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${player.handsRating || 90}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Notes */}
                              <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate">
                                {player.notes || '—'}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleStartEdit(player)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                                    title="Edit Player"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(player.id, player.name)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
                                    title="Delete Player"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No players found matching your search query or position filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PRESETS & TEAM SETTINGS ================= */}
          {activeTab === 'team_settings' && (
            <div className="space-y-6">
              {/* Preset Roster Library */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Preset Team Rosters</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROSTER_PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{preset.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {preset.roster.slice(0, 5).map((p) => (
                            <span
                              key={p.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700"
                            >
                              #{p.jerseyNumber} {p.primaryPosition}
                            </span>
                          ))}
                          {preset.roster.length > 5 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500">
                              +{preset.roster.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleLoadPreset(preset.roster, preset.name)}
                        className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Load This Preset
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import / Export & Backup */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Import & Export Roster Data</span>
                </h3>
                <p className="text-xs text-slate-600">
                  You can backup your team roster or import from external spreadsheets (CSV format) or JSON files.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV / JSON Roster</span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Download CSV Sheet</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset roster back to default NFL All-Pro squad?')) {
                        onUpdateRoster(DEFAULT_ROSTER);
                        showToast('Reset to default roster');
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ml-auto"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>

              {/* Team Information */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Team & Staff Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Team Name</label>
                    <input
                      type="text"
                      value={effectiveTeamInfo.teamName}
                      onChange={(e) => handleUpdateTeamInfo({ ...effectiveTeamInfo, teamName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Head Coach</label>
                    <input
                      type="text"
                      value={effectiveTeamInfo.headCoach}
                      onChange={(e) => handleUpdateTeamInfo({ ...effectiveTeamInfo, headCoach: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Offensive Coordinator</label>
                    <input
                      type="text"
                      value={effectiveTeamInfo.offensiveCoordinator}
                      onChange={(e) =>
                        handleUpdateTeamInfo({ ...effectiveTeamInfo, offensiveCoordinator: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= ADD / EDIT PLAYER MODAL / DRAWER ================= */}
        {isEditingPlayer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
              onSubmit={handleSavePlayer}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingPlayerId ? 'Edit Player' : 'Add New Athlete to Roster'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPlayer(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Player Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quarterback or Athlete Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jersey # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="15"
                    value={formJersey}
                    onChange={(e) => setFormJersey(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Position
                  </label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="QB">QB - Quarterback</option>
                    <option value="WR">WR - Outside Wide Receiver</option>
                    <option value="SLOT">SLOT - Inside Slot Receiver</option>
                    <option value="RB">RB - Running Back / Tailback</option>
                    <option value="TE">TE - Tight End</option>
                    <option value="C">C - Center / Snapper</option>
                    <option value="ATH">ATH - Athlete / Multi-position</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned 8v8 Slot
                  </label>
                  <select
                    value={formSlot}
                    onChange={(e) => setFormSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">None (Bench / Reserve)</option>
                    {OFFENSIVE_SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Speed Rating</span>
                    <span className="font-mono font-bold text-emerald-600">{formSpeed}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={formSpeed}
                    onChange={(e) => setFormSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Hands / Catch Rating</span>
                    <span className="font-mono font-bold text-blue-600">{formHands}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={formHands}
                    onChange={(e) => setFormHands(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* Color & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Token Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#dc2626', '#ea580c', '#2563eb', '#0284c7', '#7c3aed', '#059669', '#475569', '#0f172a'].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          formColor === c ? 'scale-125 border-slate-900 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coaching Notes / Archetype
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quick release, favorite deep ball target on 8-post"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingPlayer(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm active:scale-95"
                >
                  {editingPlayerId ? 'Save Changes' : 'Add Player to Roster'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODAL FOOTER ================= */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Changes are automatically saved to your local coaching database.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            Apply & Return to Playbook
          </button>
        </div>
      </div>
    </div>
  );
};
