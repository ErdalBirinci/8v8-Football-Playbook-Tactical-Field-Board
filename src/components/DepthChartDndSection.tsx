import React, { useState, useMemo } from 'react';
import { RosterPlayer } from '../types';
import { OFFENSIVE_SLOTS, saveRosterToStorage } from '../data/rosterData';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Shield,
  Zap,
  Sparkles,
  Check,
  Star,
  Users,
  Award,
  ArrowRightLeft,
  Flame,
} from 'lucide-react';

export type PositionGroupKey = 'WR' | 'OL' | 'QB' | 'RB' | 'ALL';

interface DepthChartDndSectionProps {
  roster: RosterPlayer[];
  onUpdateRoster: (newRoster: RosterPlayer[]) => void;
  onShowToast: (message: string) => void;
}

// Configuration for position groups and their associated starter 8v8 field slots
interface GroupConfig {
  key: PositionGroupKey;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  slots: { slotId: string; name: string; shortRole: string }[];
  matchPositions: string[];
}

const POSITION_GROUP_CONFIGS: GroupConfig[] = [
  {
    key: 'WR',
    label: 'Wide Receivers & Pass Catchers',
    shortLabel: 'WRs & Receivers',
    icon: '🏈',
    description:
      'Reorder WR depth chart via drag-and-drop. Top 3 receivers automatically become starting X (Solo), Z (Flanker), and Y (Slot/TE).',
    slots: [
      { slotId: 'X', name: 'X Receiver (Solo)', shortRole: 'Boundary / Iso Deep Threat' },
      { slotId: 'Z', name: 'Z Receiver (Flanker)', shortRole: 'Field / Motion Receiver' },
      { slotId: 'Y', name: 'Y Slot / TE', shortRole: 'Seam / Crosser Mismatch' },
    ],
    matchPositions: ['WR', 'SLOT', 'TE'],
  },
  {
    key: 'OL',
    label: 'Offensive Line (3 O-Line Pocket)',
    shortLabel: 'O-Linemen (3 OL)',
    icon: '🛡️',
    description:
      'Reorder 3 O-Line depth chart via drag-and-drop. Top 3 linemen automatically become starting LG (Left Guard), C (Center), and RG (Right Guard).',
    slots: [
      { slotId: 'LG', name: 'Left Guard (LG)', shortRole: 'Blindside Pass Pro & Puller' },
      { slotId: 'C', name: 'Center (C)', shortRole: 'Pocket Snapper & Anchor' },
      { slotId: 'RG', name: 'Right Guard (RG)', shortRole: 'Frontside Pass Pro & Drive' },
    ],
    matchPositions: ['OL', 'C', 'LG', 'RG', 'OT', 'G'],
  },
  {
    key: 'QB',
    label: 'Quarterbacks (Signal Callers)',
    shortLabel: 'Quarterbacks',
    icon: '⚡',
    description:
      'Reorder QB depth chart via drag-and-drop. Rank 1 becomes the starting Field General.',
    slots: [{ slotId: 'QB', name: 'Quarterback (QB)', shortRole: 'Field General & Distributor' }],
    matchPositions: ['QB'],
  },
  {
    key: 'RB',
    label: 'Running Backs (Ball Carriers)',
    shortLabel: 'Running Backs',
    icon: '🏃',
    description:
      'Reorder RB depth chart via drag-and-drop. Rank 1 becomes the starting Back.',
    slots: [{ slotId: 'RB', name: 'Running Back (RB)', shortRole: 'Lead Ball Carrier & Checkdown' }],
    matchPositions: ['RB', 'ATH'],
  },
];

export const DepthChartDndSection: React.FC<DepthChartDndSectionProps> = ({
  roster,
  onUpdateRoster,
  onShowToast,
}) => {
  const [activeGroup, setActiveGroup] = useState<PositionGroupKey>('WR');

  // Drag and Drop state
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragOverPlayerId, setDragOverPlayerId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before');

  // Active configuration for selected group
  const currentConfig = useMemo(
    () => POSITION_GROUP_CONFIGS.find((c) => c.key === activeGroup) || POSITION_GROUP_CONFIGS[0],
    [activeGroup]
  );

  // Filter and order players belonging to current group
  const groupPlayers = useMemo(() => {
    if (activeGroup === 'ALL') {
      return [...roster];
    }

    const config = currentConfig;
    const groupSlotIds = config.slots.map((s) => s.slotId);

    // Filter players matching position or assigned to one of group's slots
    const matched = roster.filter((p) => {
      const posMatch = config.matchPositions.includes(p.primaryPosition);
      const slotMatch = p.assignedSlot && groupSlotIds.includes(p.assignedSlot);
      return posMatch || slotMatch;
    });

    // Sort: Starters assigned to group's slots in order first, then remaining by their order in roster
    const startersInSlots: RosterPlayer[] = [];
    groupSlotIds.forEach((slotId) => {
      const assigned = matched.find((p) => p.assignedSlot === slotId);
      if (assigned) startersInSlots.push(assigned);
    });

    const nonStarters = matched.filter((p) => !startersInSlots.some((s) => s.id === p.id));

    return [...startersInSlots, ...nonStarters];
  }, [roster, activeGroup, currentConfig]);

  // Apply reordered list for group and update starter slots accordingly
  const applyGroupReorder = (
    reorderedList: RosterPlayer[],
    config: GroupConfig,
    actionDesc?: string
  ) => {
    const slotIds = config.slots.map((s) => s.slotId);
    const reorderedIds = new Set(reorderedList.map((p) => p.id));

    // Map new slots to reordered items
    const updatedGroupPlayers = reorderedList.map((player, index) => {
      if (index < slotIds.length) {
        // This player is a starter for the slot at index
        const assignedSlot = slotIds[index];
        return {
          ...player,
          assignedSlot,
          status: 'starter' as const,
        };
      } else {
        // Reserve / Backup
        const wasInGroupSlot = player.assignedSlot && slotIds.includes(player.assignedSlot);
        return {
          ...player,
          assignedSlot: wasInGroupSlot ? null : player.assignedSlot,
          status: (player.status === 'starter' && wasInGroupSlot ? 'substitute' : player.status) as RosterPlayer['status'],
        };
      }
    });

    // Merge updated group players into full roster preserving other players
    const groupMap = new Map<string, RosterPlayer>();
    updatedGroupPlayers.forEach((p) => groupMap.set(p.id, p));

    // Also unassign any non-group player who held one of these slots
    const updatedFullRoster = roster.map((p) => {
      if (groupMap.has(p.id)) {
        return groupMap.get(p.id)!;
      }
      // If a non-group player had one of our target slots that was just reassigned
      if (p.assignedSlot && slotIds.includes(p.assignedSlot)) {
        const assignedInGroup = updatedGroupPlayers.some((gp) => gp.assignedSlot === p.assignedSlot);
        if (assignedInGroup) {
          return { ...p, assignedSlot: null, status: 'substitute' as const };
        }
      }
      return p;
    });

    // Make sure all updatedGroupPlayers are in roster (in case any were missing)
    updatedGroupPlayers.forEach((gp) => {
      if (!updatedFullRoster.some((p) => p.id === gp.id)) {
        updatedFullRoster.push(gp);
      }
    });

    onUpdateRoster(updatedFullRoster);
    saveRosterToStorage(updatedFullRoster);

    if (actionDesc) {
      onShowToast(actionDesc);
    }
  };

  // Reorder by index within active group
  const handleMoveIndex = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= groupPlayers.length) return;
    const items = [...groupPlayers];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    const targetSlot = toIndex < currentConfig.slots.length ? currentConfig.slots[toIndex].name : 'Backup';
    applyGroupReorder(
      items,
      currentConfig,
      `Moved #${moved.jerseyNumber} ${moved.name} to Depth #${toIndex + 1} (${targetSlot})`
    );
  };

  // Promote player to starter rank 1 (top of depth chart)
  const handlePromoteToStarter = (player: RosterPlayer) => {
    const items = groupPlayers.filter((p) => p.id !== player.id);
    items.unshift(player);

    const firstSlot = currentConfig.slots[0];
    applyGroupReorder(
      items,
      currentConfig,
      `Promoted #${player.jerseyNumber} ${player.name} to Starter (${firstSlot.name})`
    );
  };

  // Direct assign player to specific slot
  const handleAssignToSpecificSlot = (player: RosterPlayer, targetSlotId: string) => {
    const slotIdx = currentConfig.slots.findIndex((s) => s.slotId === targetSlotId);
    if (slotIdx === -1) return;

    const items = groupPlayers.filter((p) => p.id !== player.id);
    items.splice(slotIdx, 0, player);

    applyGroupReorder(
      items,
      currentConfig,
      `Assigned #${player.jerseyNumber} ${player.name} to ${targetSlotId} Starter`
    );
  };

  // Auto-Sort group by rating
  const handleSortGroup = (criterion: 'speed' | 'hands' | 'overall') => {
    const items = [...groupPlayers].sort((a, b) => {
      if (criterion === 'speed') {
        return (b.speedRating || 90) - (a.speedRating || 90);
      }
      if (criterion === 'hands') {
        return (b.handsRating || 90) - (a.handsRating || 90);
      }
      const overallA = ((a.speedRating || 90) + (a.handsRating || 90)) / 2;
      const overallB = ((b.speedRating || 90) + (b.handsRating || 90)) / 2;
      return overallB - overallA;
    });

    applyGroupReorder(
      items,
      currentConfig,
      `Sorted ${currentConfig.shortLabel} by ${criterion.toUpperCase()}`
    );
  };

  // ================= DRAG AND DROP HANDLERS =================
  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    setDraggedPlayerId(playerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', playerId);
  };

  const handleDragOverCard = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedPlayerId === targetPlayerId) {
      setDragOverPlayerId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAfter = e.clientY > midY;

    setDragOverPlayerId(targetPlayerId);
    setDropPosition(isAfter ? 'after' : 'before');
  };

  const handleDropOnCard = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    const sourceId = draggedPlayerId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetPlayerId) {
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
      return;
    }

    const sourceIndex = groupPlayers.findIndex((p) => p.id === sourceId);
    const targetIndex = groupPlayers.findIndex((p) => p.id === targetPlayerId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedPlayerId(null);
      setDragOverPlayerId(null);
      return;
    }

    const items = [...groupPlayers];
    const [moved] = items.splice(sourceIndex, 1);

    // Calculate new insertion index
    let insertIndex = targetIndex;
    if (dropPosition === 'after') {
      insertIndex = sourceIndex < targetIndex ? targetIndex : targetIndex + 1;
    } else {
      insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    }
    insertIndex = Math.max(0, Math.min(items.length, insertIndex));

    items.splice(insertIndex, 0, moved);

    const newDepthRank = insertIndex + 1;
    const newSlotDesc =
      insertIndex < currentConfig.slots.length
        ? `Starter: ${currentConfig.slots[insertIndex].name}`
        : `Depth #${newDepthRank} (Reserve)`;

    applyGroupReorder(
      items,
      currentConfig,
      `Reordered depth chart: #${moved.jerseyNumber} ${moved.name} -> ${newSlotDesc}`
    );

    setDraggedPlayerId(null);
    setDragOverPlayerId(null);
  };

  // Drop directly on a Starter Slot landing zone
  const handleDropOnSlotTarget = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const sourceId = draggedPlayerId || e.dataTransfer.getData('text/plain');
    setDragOverSlotId(null);
    setDraggedPlayerId(null);

    if (!sourceId) return;

    const sourcePlayer = roster.find((p) => p.id === sourceId);
    if (!sourcePlayer) return;

    handleAssignToSpecificSlot(sourcePlayer, slotId);
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
    setDragOverPlayerId(null);
    setDragOverSlotId(null);
  };

  return (
    <div className="space-y-5" id="depth-chart-dnd-container">
      {/* Position Group Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {POSITION_GROUP_CONFIGS.map((config) => {
            const count = roster.filter(
              (p) =>
                config.matchPositions.includes(p.primaryPosition) ||
                (p.assignedSlot && config.slots.some((s) => s.slotId === p.assignedSlot))
            ).length;
            const isActive = activeGroup === config.key;

            return (
              <button
                key={config.key}
                id={`depth-group-tab-${config.key.toLowerCase()}`}
                onClick={() => setActiveGroup(config.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{config.icon}</span>
                <span className="whitespace-nowrap">{config.shortLabel}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Sorting Dropdown / Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Auto-Sort:</span>
          <button
            onClick={() => handleSortGroup('speed')}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Sort by Speed Rating (Fastest first)"
          >
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Speed</span>
          </button>
          <button
            onClick={() => handleSortGroup('hands')}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Sort by Hands / Catching Rating"
          >
            <Award className="w-3 h-3 text-blue-600" />
            <span>Hands</span>
          </button>
          <button
            onClick={() => handleSortGroup('overall')}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Sort by Overall Skill Rating"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Overall</span>
          </button>
        </div>
      </div>

      {/* Instructional Overview Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 mt-0.5">
            {currentConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{currentConfig.label}</h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
                Drag &amp; Drop Reordering Enabled
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
              {currentConfig.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-blue-200">
          <GripVertical className="w-4 h-4 text-blue-500" />
          <span>Grab &amp; Drag handle to reorder hierarchy</span>
        </div>
      </div>

      {/* Starting Formation Drop Targets Shelf */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>8v8 Starting Formation Slots (Drop Targets)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Drag any player card directly onto a slot target below
          </span>
        </div>

        <div
          className={`grid grid-cols-1 ${
            currentConfig.slots.length === 1
              ? 'sm:grid-cols-1'
              : currentConfig.slots.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-3'
          } gap-3`}
        >
          {currentConfig.slots.map((slot, idx) => {
            const assignedPlayer = roster.find((p) => p.assignedSlot === slot.slotId);
            const isTargetHovered = dragOverSlotId === slot.slotId;

            return (
              <div
                key={slot.slotId}
                id={`slot-target-${slot.slotId.toLowerCase()}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverSlotId(slot.slotId);
                }}
                onDragLeave={() => setDragOverSlotId(null)}
                onDrop={(e) => handleDropOnSlotTarget(e, slot.slotId)}
                className={`rounded-2xl p-3.5 border-2 transition-all relative flex items-center justify-between gap-3 ${
                  isTargetHovered
                    ? 'border-blue-500 bg-blue-100/90 shadow-md scale-[1.02]'
                    : assignedPlayer
                    ? 'border-blue-300/80 bg-white shadow-xs'
                    : 'border-dashed border-amber-300 bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {slot.slotId}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {slot.name}
                      </span>
                      <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans truncate">
                      {slot.shortRole}
                    </p>
                  </div>
                </div>

                {/* Assigned Athlete Badge */}
                {assignedPlayer ? (
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 pl-2 pr-2.5 py-1 rounded-xl border border-slate-200">
                    <div
                      className="w-6 h-6 rounded-lg text-white font-mono font-black text-xs flex items-center justify-center shadow-2xs shrink-0"
                      style={{ backgroundColor: assignedPlayer.avatarColor || '#2563eb' }}
                    >
                      #{assignedPlayer.jerseyNumber}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 leading-none">
                        {assignedPlayer.name.split(' ').pop()}
                      </div>
                      <div className="text-[9px] font-mono text-emerald-600 font-bold leading-none mt-0.5">
                        SPD {assignedPlayer.speedRating || 90}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                    Unassigned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Drag-and-Drop Depth Ladder List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentConfig.shortLabel} Depth Hierarchy (Drag to Reorder)</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {groupPlayers.length} Athletes in Group
          </span>
        </div>

        {groupPlayers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium text-slate-600">
              No athletes found in the {currentConfig.shortLabel} position group.
            </p>
            <p className="text-[11px] text-slate-400">
              Add players with {currentConfig.matchPositions.join(', ')} positions in the Full Roster tab.
            </p>
          </div>
        ) : (
          <div className="space-y-2" id="depth-chart-players-list">
            {groupPlayers.map((player, index) => {
              const isStarter = index < currentConfig.slots.length;
              const starterSlot = isStarter ? currentConfig.slots[index] : null;
              const isBeingDragged = draggedPlayerId === player.id;
              const isDragOver = dragOverPlayerId === player.id;

              return (
                <div
                  key={player.id}
                  id={`depth-player-row-${player.id}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, player.id)}
                  onDragOver={(e) => handleDragOverCard(e, player.id)}
                  onDrop={(e) => handleDropOnCard(e, player.id)}
                  onDragEnd={handleDragEnd}
                  className={`group relative rounded-2xl p-3.5 border transition-all select-none ${
                    isBeingDragged
                      ? 'opacity-40 scale-[0.98] border-dashed border-blue-400 bg-blue-50'
                      : isDragOver
                      ? dropPosition === 'before'
                        ? 'border-t-4 border-t-blue-600 bg-blue-50/70 shadow-md'
                        : 'border-b-4 border-b-blue-600 bg-blue-50/70 shadow-md'
                      : isStarter
                      ? 'bg-white border-blue-200/90 shadow-xs hover:border-blue-400 hover:shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Drag Handle, Depth Rank & Jersey Token */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-300 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Drag to reorder depth chart position"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Depth Rank Badge */}
                      <div className="flex flex-col items-center justify-center shrink-0 w-8">
                        <span
                          className={`text-xs font-mono font-black ${
                            isStarter ? 'text-blue-700' : 'text-slate-400'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase leading-none">
                          {isStarter ? 'STARTER' : 'SUB'}
                        </span>
                      </div>

                      {/* Jersey Avatar Token */}
                      <div
                        className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white font-mono font-black text-sm shadow-xs shrink-0 border-2 border-white"
                        style={{ backgroundColor: player.avatarColor || '#2563eb' }}
                      >
                        <span className="text-[9px] font-sans opacity-80 uppercase leading-none">
                          #{player.jerseyNumber}
                        </span>
                        <span className="text-xs font-black leading-none mt-0.5">
                          {player.primaryPosition}
                        </span>
                      </div>

                      {/* Player Bio & Role */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-black text-slate-900 truncate">
                            {player.name}
                          </h5>
                          {isStarter && starterSlot ? (
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                              <Star className="w-3 h-3 text-blue-600 fill-blue-600" />
                              <span>
                                {starterSlot.slotId} Starter ({starterSlot.name})
                              </span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-slate-200/80 text-slate-600">
                              Depth #{index + 1} (Reserve)
                            </span>
                          )}
                        </div>

                        {/* Ratings & Notes */}
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono">
                          <div className="flex items-center gap-1 text-emerald-700 font-bold">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span>SPD {player.speedRating || 90}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-blue-700 font-bold">
                            <Award className="w-3 h-3 text-blue-500" />
                            <span>HND {player.handsRating || 90}</span>
                          </div>
                          {player.notes && (
                            <>
                              <span className="hidden md:inline">•</span>
                              <span className="text-slate-500 truncate max-w-xs italic hidden md:inline font-sans text-[11px]">
                                "{player.notes}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Controls & Position Assignment */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {/* One-Click Slot Assignment Dropdown */}
                      <select
                        value={isStarter && starterSlot ? starterSlot.slotId : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignToSpecificSlot(player, e.target.value);
                          }
                        }}
                        className="text-[11px] font-mono font-medium bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 cursor-pointer shadow-2xs"
                        title="Quick assign starter slot"
                      >
                        <option value="">Set Slot...</option>
                        {currentConfig.slots.map((s) => (
                          <option key={s.slotId} value={s.slotId}>
                            Slot {s.slotId} ({s.name})
                          </option>
                        ))}
                      </select>

                      {/* Promote to Starter Button (if not already #1) */}
                      {index > 0 && (
                        <button
                          onClick={() => handlePromoteToStarter(player)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Promote to Depth #1 Starter"
                        >
                          <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span className="hidden sm:inline">Make #1</span>
                        </button>
                      )}

                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMoveIndex(index, index - 1)}
                        disabled={index === 0}
                        className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          index === 0
                            ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white hover:bg-blue-50 border-slate-200 text-slate-600 hover:text-blue-700 shadow-2xs'
                        }`}
                        title="Move Up in Depth Chart"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMoveIndex(index, index + 1)}
                        disabled={index === groupPlayers.length - 1}
                        className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          index === groupPlayers.length - 1
                            ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white hover:bg-blue-50 border-slate-200 text-slate-600 hover:text-blue-700 shadow-2xs'
                        }`}
                        title="Move Down in Depth Chart"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
