import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  X,
  Plus,
  Trash2,
  Check,
  Edit2,
  Copy,
  Eye,
  Crosshair,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Bookmark,
  Share2,
  Play as PlayIcon,
} from 'lucide-react';
import { Play, DefenseScheme, DefensivePlayer, PlayDefensiveScout, PlayerAssignment } from '../types';
import {
  getAllDefenseSchemes,
  getCustomDefenseSchemes,
  saveCustomDefenseScheme,
  deleteCustomDefenseScheme,
  getPlayAssignedCoverage,
  savePlayAssignedCoverage,
  removePlayAssignedCoverage,
  getRecommendedDefensesForPlay,
  DEFENSIVE_ROLE_TYPES,
  DEFENSIVE_TEMPLATE_PRESETS,
} from '../utils/defensiveScoutStorage';

interface DefensiveScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlay: Play;
  activeDefenseScheme: DefenseScheme | null;
  onApplyDefenseToField: (scheme: DefenseScheme | null, enableOverlay?: boolean) => void;
  onUpdatePlayDefensiveData?: (scoutData: PlayDefensiveScout) => void;
}

export const DefensiveScoutModal: React.FC<DefensiveScoutModalProps> = ({
  isOpen,
  onClose,
  currentPlay,
  activeDefenseScheme,
  onApplyDefenseToField,
  onUpdatePlayDefensiveData,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'matchup_notes'>('library');
  const [filterCategory, setFilterCategory] = useState<'all' | 'zone' | 'man' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // All schemes & assigned data
  const [allSchemes, setAllSchemes] = useState<DefenseScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('cover-2');
  const [assignedScout, setAssignedScout] = useState<PlayDefensiveScout | null>(null);
  
  // Coach Play Notes
  const [playScoutNotes, setPlayScoutNotes] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Builder State
  const [builderEditingSchemeId, setBuilderEditingSchemeId] = useState<string | null>(null);
  const [builderName, setBuilderName] = useState('Custom 8v8 Defense');
  const [builderShortName, setBuilderShortName] = useState('Custom Def');
  const [builderDescription, setBuilderDescription] = useState('Custom 8v8 defensive scheme configuration.');
  const [builderStrength, setBuilderStrength] = useState('Locks down perimeter routes and controls the flat.');
  const [builderWeakness, setBuilderWeakness] = useState('Vulnerable to middle seam routes and delays.');
  const [builderPlayers, setBuilderPlayers] = useState<DefensivePlayer[]>([
    { id: 'CB1', label: 'CB1', name: 'Left Cornerback', initialPos: { x: 18, y: 55 }, coverageType: 'flat', zoneArea: { x: 10, y: 48, width: 22, height: 16, label: 'L Flat' } },
    { id: 'CB2', label: 'CB2', name: 'Right Cornerback', initialPos: { x: 82, y: 55 }, coverageType: 'flat', zoneArea: { x: 68, y: 48, width: 22, height: 16, label: 'R Flat' } },
    { id: 'FS', label: 'FS', name: 'Free Safety', initialPos: { x: 30, y: 32 }, coverageType: 'deep_half', zoneArea: { x: 5, y: 15, width: 45, height: 28, label: 'Deep L 1/2' } },
    { id: 'SS', label: 'SS', name: 'Strong Safety', initialPos: { x: 70, y: 32 }, coverageType: 'deep_half', zoneArea: { x: 50, y: 15, width: 45, height: 28, label: 'Deep R 1/2' } },
    { id: 'WLB', label: 'WLB', name: 'Will Linebacker', initialPos: { x: 36, y: 55 }, coverageType: 'hook_curl', zoneArea: { x: 26, y: 44, width: 20, height: 16, label: 'L Hook' } },
    { id: 'MLB', label: 'MLB', name: 'Middle Linebacker', initialPos: { x: 50, y: 54 }, coverageType: 'hook_curl', zoneArea: { x: 42, y: 42, width: 16, height: 18, label: 'Mid Hole' } },
    { id: 'SLB', label: 'SLB', name: 'Sam Linebacker', initialPos: { x: 64, y: 55 }, coverageType: 'hook_curl', zoneArea: { x: 54, y: 44, width: 20, height: 16, label: 'R Hook' } },
    { id: 'RUSH', label: 'RUSH', name: 'Pass Rusher', initialPos: { x: 50, y: 58 }, coverageType: 'blitz' },
  ]);

  // Selected player in builder for fine tuning
  const [selectedBuilderPlayerIdx, setSelectedBuilderPlayerIdx] = useState<number>(0);

  // Sync schemes on load & events
  const refreshSchemes = () => {
    const list = getAllDefenseSchemes();
    setAllSchemes(list);
    const assigned = getPlayAssignedCoverage(currentPlay.id);
    setAssignedScout(assigned);
    if (assigned?.notes) {
      setPlayScoutNotes(assigned.notes);
    } else {
      setPlayScoutNotes('');
    }
    if (assigned?.primarySchemeId) {
      setSelectedSchemeId(assigned.primarySchemeId);
    } else if (activeDefenseScheme) {
      setSelectedSchemeId(activeDefenseScheme.id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshSchemes();
    }
  }, [isOpen, currentPlay.id]);

  useEffect(() => {
    const handleUpdateEvent = () => {
      refreshSchemes();
    };
    window.addEventListener('playbook_defense_updated', handleUpdateEvent);
    return () => window.removeEventListener('playbook_defense_updated', handleUpdateEvent);
  }, [currentPlay.id]);

  const selectedScheme = useMemo(() => {
    return allSchemes.find((s) => s.id === selectedSchemeId) || allSchemes[0] || null;
  }, [allSchemes, selectedSchemeId]);

  const recommendations = useMemo(() => {
    return getRecommendedDefensesForPlay(currentPlay);
  }, [currentPlay]);

  const filteredSchemes = useMemo(() => {
    return allSchemes.filter((s) => {
      if (filterCategory === 'zone') {
        const isZone = ['cover-2', 'cover-3', 'cover-4', 'cover-6'].includes(s.id) || s.description.toLowerCase().includes('zone');
        if (!isZone) return false;
      } else if (filterCategory === 'man') {
        const isMan = ['cover-0', 'cover-1', 'man-match', 'bracket'].includes(s.id) || s.description.toLowerCase().includes('man') || s.description.toLowerCase().includes('bracket');
        if (!isMan) return false;
      } else if (filterCategory === 'custom') {
        if (!s.isCustom) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query) || s.shortName.toLowerCase().includes(query);
        const matchDesc = s.description.toLowerCase().includes(query) || s.strength.toLowerCase().includes(query) || s.weakness.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [allSchemes, filterCategory, searchQuery]);

  // Handle Save / Assign to Current Play
  const handleAssignPrimaryToPlay = (scheme: DefenseScheme) => {
    const scoutData: PlayDefensiveScout = {
      playId: currentPlay.id,
      primarySchemeId: scheme.id,
      notes: playScoutNotes,
      updatedAt: Date.now(),
    };
    savePlayAssignedCoverage(scoutData);
    setAssignedScout(scoutData);
    if (onUpdatePlayDefensiveData) {
      onUpdatePlayDefensiveData(scoutData);
    }
  };

  // Handle Apply Overlay to FieldBoard
  const handleApplyToField = (scheme: DefenseScheme) => {
    onApplyDefenseToField(scheme, true);
  };

  // Handle Save Notes
  const handleSaveNotes = () => {
    if (!selectedScheme) return;
    const scoutData: PlayDefensiveScout = {
      playId: currentPlay.id,
      primarySchemeId: assignedScout?.primarySchemeId || selectedScheme.id,
      notes: playScoutNotes,
      updatedAt: Date.now(),
    };
    savePlayAssignedCoverage(scoutData);
    setAssignedScout(scoutData);
    if (onUpdatePlayDefensiveData) {
      onUpdatePlayDefensiveData(scoutData);
    }
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Builder Helper: Load Template
  const handleLoadTemplate = (template: Partial<DefenseScheme>) => {
    setBuilderName(template.name || 'Custom Defense');
    setBuilderShortName(template.shortName || 'Custom');
    setBuilderDescription(template.description || '');
    setBuilderStrength(template.strength || '');
    setBuilderWeakness(template.weakness || '');
    if (template.players) {
      setBuilderPlayers(JSON.parse(JSON.stringify(template.players)));
    }
    setBuilderEditingSchemeId(null);
  };

  // Builder Helper: Edit Existing
  const handleEditExistingScheme = (scheme: DefenseScheme) => {
    setBuilderEditingSchemeId(scheme.id);
    setBuilderName(scheme.name);
    setBuilderShortName(scheme.shortName);
    setBuilderDescription(scheme.description);
    setBuilderStrength(scheme.strength);
    setBuilderWeakness(scheme.weakness);
    setBuilderPlayers(JSON.parse(JSON.stringify(scheme.players)));
    setActiveTab('builder');
    setSelectedBuilderPlayerIdx(0);
  };

  // Builder Helper: Save Custom Scheme
  const handleSaveBuilderScheme = (assignToPlayNow: boolean = false) => {
    const id = builderEditingSchemeId || `custom-${Date.now()}`;
    const newScheme: DefenseScheme = {
      id,
      name: builderName.trim() || 'Custom 8v8 Defense',
      shortName: builderShortName.trim() || 'Custom Def',
      description: builderDescription.trim(),
      strength: builderStrength.trim(),
      weakness: builderWeakness.trim(),
      players: builderPlayers,
      isCustom: true,
      createdAt: Date.now(),
    };

    saveCustomDefenseScheme(newScheme);
    refreshSchemes();
    setSelectedSchemeId(newScheme.id);

    if (assignToPlayNow) {
      handleAssignPrimaryToPlay(newScheme);
      handleApplyToField(newScheme);
    }

    setActiveTab('library');
  };

  // Builder Helper: Delete Custom Scheme
  const handleDeleteScheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom defensive scheme?')) {
      deleteCustomDefenseScheme(id);
      refreshSchemes();
    }
  };

  // Update a defender inside builder
  const handleUpdateBuilderPlayer = (index: number, updates: Partial<DefensivePlayer>) => {
    setBuilderPlayers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div
      id="defensive-scout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        id="defensive-scout-modal-container"
        className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ================= Modal Header ================= */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Defensive Scout &amp; Coverage Lab
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700/60">
                  8v8 Coverage Overlay
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                Target Play: <span className="text-amber-400 font-bold">{currentPlay.code}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200 truncate max-w-xs">{currentPlay.englishName}</span>
              </p>
            </div>
          </div>

          <button
            id="close-defensive-scout-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= Navigation Tabs ================= */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              id="scout-tab-library"
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Coverage Library &amp; Scout</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-800">
                {allSchemes.length}
              </span>
            </button>

            <button
              id="scout-tab-builder"
              onClick={() => {
                setBuilderEditingSchemeId(null);
                setActiveTab('builder');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>Coverage Builder &amp; Editor</span>
            </button>

            <button
              id="scout-tab-matchup-notes"
              onClick={() => setActiveTab('matchup_notes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'matchup_notes'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Scout Keys &amp; Install Notes</span>
            </button>
          </div>

          {/* Active Overlay Status Pill */}
          <div className="flex items-center gap-2">
            {activeDefenseScheme && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active on Field: <strong className="font-bold">{activeDefenseScheme.shortName}</strong>
              </span>
            )}
            {assignedScout && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-blue-600" />
                Play Default: <strong>{allSchemes.find(s => s.id === assignedScout.primarySchemeId)?.shortName || assignedScout.primarySchemeId}</strong>
              </span>
            )}
          </div>
        </div>

        {/* ================= Modal Body ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'library' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Scheme Selection & List (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Filter and Search Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search coverages (e.g. Cover 3, Bracket, Blitz)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono font-medium">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterCategory === 'all'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({allSchemes.length})
                    </button>
                    <button
                      onClick={() => setFilterCategory('zone')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterCategory === 'zone'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Zone Shells
                    </button>
                    <button
                      onClick={() => setFilterCategory('man')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterCategory === 'man'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Man &amp; Match
                    </button>
                    <button
                      onClick={() => setFilterCategory('custom')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        filterCategory === 'custom'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Custom ({allSchemes.filter((s) => s.isCustom).length})
                    </button>
                  </div>
                </div>

                {/* Scheme Cards List */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredSchemes.map((scheme) => {
                    const isSelected = selectedSchemeId === scheme.id;
                    const isAssigned = assignedScout?.primarySchemeId === scheme.id;
                    const isActive = activeDefenseScheme?.id === scheme.id;
                    const rec = recommendations.find((r) => r.scheme.id === scheme.id);

                    return (
                      <div
                        key={scheme.id}
                        id={`scheme-card-${scheme.id}`}
                        onClick={() => setSelectedSchemeId(scheme.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{scheme.name}</span>
                              {scheme.isCustom && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  Coach Custom
                                </span>
                              )}
                              {isAssigned && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  Play Default
                                </span>
                              )}
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  On Field
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-sans">
                              {scheme.description}
                            </p>
                          </div>
                        </div>

                        {/* Matchup quick tags */}
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-rose-500" />
                            {scheme.players.filter((p) => p.coverageType.includes('deep')).length} Deep DBs •{' '}
                            {scheme.players.filter((p) => p.coverageType === 'blitz').length} Blitzers
                          </span>

                          {rec?.matchupVerdict === 'favorable_for_offense' && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                              Favors Offense
                            </span>
                          )}
                          {rec?.matchupVerdict === 'challenging_for_offense' && (
                            <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                              Challenging Matchup
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredSchemes.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono border border-dashed border-slate-200 rounded-2xl">
                      No defensive coverages match your search criteria.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Selected Scheme Deep Inspection & Mini Field Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {selectedScheme ? (
                  <div className="space-y-4">
                    {/* Scheme Header Card & Actions */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">{selectedScheme.name}</h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              {selectedScheme.shortName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedScheme.description}</p>
                        </div>

                        {selectedScheme.isCustom && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditExistingScheme(selectedScheme)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Custom Coverage"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteScheme(selectedScheme.id, e)}
                              className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                              title="Delete Scheme"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Strengths & Weaknesses Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-emerald-900/30">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">
                            Defense Strength
                          </span>
                          <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{selectedScheme.strength}</p>
                        </div>
                        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-rose-900/30">
                          <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">
                            Offense Attack Window
                          </span>
                          <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{selectedScheme.weakness}</p>
                        </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            id="apply-defense-overlay-field-btn"
                            onClick={() => handleApplyToField(selectedScheme)}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show Overlay on Field Replay</span>
                          </button>

                          <button
                            id="assign-defense-to-play-btn"
                            onClick={() => handleAssignPrimaryToPlay(selectedScheme)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              assignedScout?.primarySchemeId === selectedScheme.id
                                ? 'bg-blue-900/80 text-blue-200 border-blue-600 font-black'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>
                              {assignedScout?.primarySchemeId === selectedScheme.id
                                ? 'Assigned as Play Default'
                                : 'Save as Play Default Defense'}
                            </span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleEditExistingScheme(selectedScheme)}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Clone &amp; Customize</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive 8v8 Field Alignment Preview Box */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                          PRE-SNAP DEFENDER ALIGNMENT (8v8)
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          8 Defenders • Red Tokens vs Offensive Blue
                        </span>
                      </div>

                      {/* SVG Field Diagram */}
                      <div className="relative aspect-[16/10] w-full bg-emerald-950 rounded-xl overflow-hidden border border-emerald-800/40 shadow-inner">
                        <svg viewBox="0 0 100 70" className="w-full h-full select-none">
                          {/* Endzone */}
                          <rect x="0" y="0" width="100" height="12" fill="#042f2e" opacity="0.9" />
                          <text x="50" y="8" fill="#14b8a6" fontSize="3" fontWeight="bold" textAnchor="middle" opacity="0.5">
                            ENDZONE
                          </text>

                          {/* Yard lines */}
                          <line x1="0" y1="12" x2="100" y2="12" stroke="#ffffff" strokeWidth="0.5" opacity="0.7" />
                          <line x1="0" y1="25" x2="100" y2="25" stroke="#ffffff" strokeWidth="0.3" opacity="0.3" strokeDasharray="1,1" />
                          <line x1="0" y1="40" x2="100" y2="40" stroke="#ffffff" strokeWidth="0.3" opacity="0.3" strokeDasharray="1,1" />
                          <line x1="0" y1="58" x2="100" y2="58" stroke="#38bdf8" strokeWidth="0.6" opacity="0.8" />
                          <text x="96" y="57" fill="#38bdf8" fontSize="2" fontWeight="bold" textAnchor="end">
                            LOS
                          </text>

                          {/* Zone Coverage Boxes */}
                          {selectedScheme.players
                            .filter((p) => p.zoneArea)
                            .map((p) => {
                              const z = p.zoneArea!;
                              return (
                                <g key={`preview-zone-${p.id}`}>
                                  <rect
                                    x={z.x}
                                    y={z.y}
                                    width={z.width}
                                    height={z.height}
                                    rx="1.5"
                                    fill="rgba(244, 63, 94, 0.12)"
                                    stroke="rgba(244, 63, 94, 0.45)"
                                    strokeWidth="0.35"
                                    strokeDasharray="1,1"
                                  />
                                  <text
                                    x={z.x + z.width / 2}
                                    y={z.y + z.height / 2 + 0.8}
                                    textAnchor="middle"
                                    fontSize="1.8"
                                    fontWeight="bold"
                                    fill="#f43f5e"
                                    opacity="0.85"
                                    className="font-mono"
                                  >
                                    {z.label}
                                  </text>
                                </g>
                              );
                            })}

                          {/* Offensive Player Tokens */}
                          {Object.entries(currentPlay.players).map(([slotKey, playerAssignment]) => {
                            const player = playerAssignment as PlayerAssignment;
                            return (
                              <g key={`off-token-${slotKey}`}>
                                <circle
                                  cx={player.initialPos.x}
                                  cy={player.initialPos.y}
                                  r="2.2"
                                  fill="#0284c7"
                                  stroke="#7dd3fc"
                                  strokeWidth="0.4"
                                />
                                <text
                                  x={player.initialPos.x}
                                  y={player.initialPos.y + 0.8}
                                  textAnchor="middle"
                                  fontSize="1.8"
                                  fontWeight="bold"
                                  fill="#ffffff"
                                  className="font-mono"
                                >
                                  {slotKey}
                                </text>
                              </g>
                            );
                          })}

                          {/* Man / Bracket Tether Lines */}
                          {selectedScheme.players
                            .filter((p) => (p.coverageType === 'man' || p.coverageType === 'match' || p.coverageType === 'bracket') && p.targetOffensivePlayerId)
                            .map((p) => {
                              const offPlayer = currentPlay.players[p.targetOffensivePlayerId!];
                              if (!offPlayer) return null;
                              return (
                                <line
                                  key={`preview-tether-${p.id}`}
                                  x1={p.initialPos.x}
                                  y1={p.initialPos.y}
                                  x2={offPlayer.initialPos.x}
                                  y2={offPlayer.initialPos.y}
                                  stroke={p.coverageType === 'bracket' ? '#f97316' : '#f43f5e'}
                                  strokeWidth="0.4"
                                  strokeDasharray="1,1"
                                  opacity="0.6"
                                />
                              );
                            })}

                          {/* Defensive Tokens */}
                          {selectedScheme.players.map((p) => (
                            <g key={`def-token-${p.id}`}>
                              <circle
                                cx={p.initialPos.x}
                                cy={p.initialPos.y}
                                r="2.2"
                                fill="#be123c"
                                stroke="#fda4af"
                                strokeWidth="0.4"
                              />
                              <text
                                x={p.initialPos.x}
                                y={p.initialPos.y + 0.8}
                                textAnchor="middle"
                                fontSize="1.6"
                                fontWeight="bold"
                                fill="#ffffff"
                                className="font-mono"
                              >
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      {/* Defender Breakdown Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
                        {selectedScheme.players.map((p) => {
                          const roleMeta = DEFENSIVE_ROLE_TYPES.find((r) => r.value === p.coverageType);
                          return (
                            <div
                              key={`pill-${p.id}`}
                              className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-300"
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-rose-400">{p.label}</span>
                                <span className="text-slate-400 text-[9px] truncate">{p.coverageType}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">
                                {p.targetOffensivePlayerId ? `vs ${p.targetOffensivePlayerId}` : p.zoneArea?.label || p.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ================= Builder & Editor Tab ================= */}
          {activeTab === 'builder' && (
            <div className="space-y-6">
              {/* Starter Presets Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Starter Templates
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Click to load base 8v8 scheme configuration
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEFENSIVE_TEMPLATE_PRESETS.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                        {tmpl.shortName}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {tmpl.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">COVERAGE FULL NAME</label>
                  <input
                    type="text"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    placeholder="e.g. Cover 3 Cloud Weakside Roll"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-mono">SHORT NAME / CALLOUT</label>
                  <input
                    type="text"
                    value={builderShortName}
                    onChange={(e) => setBuilderShortName(e.target.value)}
                    placeholder="e.g. C3 Cloud"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 font-mono">DESCRIPTION &amp; SCHEME RULES</label>
                  <textarea
                    rows={2}
                    value={builderDescription}
                    onChange={(e) => setBuilderDescription(e.target.value)}
                    placeholder="Describe how the 8 defenders rotate, match routes, or divide zone responsibility..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800 font-mono">SCHEME STRENGTH</label>
                  <input
                    type="text"
                    value={builderStrength}
                    onChange={(e) => setBuilderStrength(e.target.value)}
                    placeholder="e.g. Eliminates outside go routes &amp; locks boundary flat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-800 font-mono">OFFENSE ATTACK WINDOW (WEAKNESS)</label>
                  <input
                    type="text"
                    value={builderWeakness}
                    onChange={(e) => setBuilderWeakness(e.target.value)}
                    placeholder="e.g. Intermediate seam &amp; post over middle linebacker"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* 8 Defender Alignment & Assignment Table */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    8 DEFENSIVE PLAYER ROLES &amp; ALIGNMENT POSITIONS
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Configure initial (X, Y) and assignments
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {builderPlayers.map((player, idx) => {
                    const isSelected = selectedBuilderPlayerIdx === idx;
                    return (
                      <div
                        key={`bplayer-${player.id}-${idx}`}
                        onClick={() => setSelectedBuilderPlayerIdx(idx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                              {player.label}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{player.name}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            X: {player.initialPos.x}% • Y: {player.initialPos.y}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-500 font-mono block">Coverage Role</label>
                            <select
                              value={player.coverageType}
                              onChange={(e) =>
                                handleUpdateBuilderPlayer(idx, {
                                  coverageType: e.target.value as DefensivePlayer['coverageType'],
                                })
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                            >
                              {DEFENSIVE_ROLE_TYPES.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {(player.coverageType === 'man' ||
                            player.coverageType === 'bracket' ||
                            player.coverageType === 'match' ||
                            player.coverageType === 'spy') ? (
                            <div>
                              <label className="text-[10px] text-slate-500 font-mono block">Target Receiver</label>
                              <select
                                value={player.targetOffensivePlayerId || 'X'}
                                onChange={(e) =>
                                  handleUpdateBuilderPlayer(idx, {
                                    targetOffensivePlayerId: e.target.value,
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 font-mono"
                              >
                                {Object.keys(currentPlay.players).map((slotKey) => (
                                  <option key={slotKey} value={slotKey}>
                                    Target {slotKey} ({currentPlay.players[slotKey].position})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="text-[10px] text-slate-500 font-mono block">Zone Label</label>
                              <input
                                type="text"
                                value={player.zoneArea?.label || ''}
                                placeholder="e.g. Deep L 1/3"
                                onChange={(e) =>
                                  handleUpdateBuilderPlayer(idx, {
                                    zoneArea: {
                                      x: player.zoneArea?.x || player.initialPos.x - 10,
                                      y: player.zoneArea?.y || player.initialPos.y - 15,
                                      width: player.zoneArea?.width || 25,
                                      height: player.zoneArea?.height || 20,
                                      label: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        {/* Sliders for Position Tuning */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                          <div>
                            <div className="flex justify-between">
                              <span>Horiz (X):</span>
                              <span className="font-bold text-slate-800">{player.initialPos.x}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="95"
                              value={player.initialPos.x}
                              onChange={(e) =>
                                handleUpdateBuilderPlayer(idx, {
                                  initialPos: { ...player.initialPos, x: parseInt(e.target.value) },
                                })
                              }
                              className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <span>Depth (Y):</span>
                              <span className="font-bold text-slate-800">{player.initialPos.y}%</span>
                            </div>
                            <input
                              type="range"
                              min="15"
                              max="65"
                              value={player.initialPos.y}
                              onChange={(e) =>
                                handleUpdateBuilderPlayer(idx, {
                                  initialPos: { ...player.initialPos, y: parseInt(e.target.value) },
                                })
                              }
                              className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Builder Bottom Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel &amp; Back to Library
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveBuilderScheme(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Save to Coverage Library
                  </button>
                  <button
                    onClick={() => handleSaveBuilderScheme(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save &amp; Overlay on Current Play</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= Matchup & Scout Notes Tab ================= */}
          {activeTab === 'matchup_notes' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" />
                    Playbook Defensive Scout Report: {currentPlay.code}
                  </h3>
                  {assignedScout?.primarySchemeId && (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      Target Defense: {allSchemes.find((s) => s.id === assignedScout.primarySchemeId)?.name || assignedScout.primarySchemeId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Document key defensive pre-snap identifiers, safety shell reads, alert calls, and hot read adjustments for quarterback and receivers.
                </p>
              </div>

              {/* Editable Coach Scout Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 font-mono">
                    COACHING SCOUT NOTES &amp; AUDIBLE KEYS (SAVED PER PLAY)
                  </label>
                  {copiedNotification && (
                    <span className="text-[11px] font-mono font-bold text-emerald-600 animate-in fade-in">
                      Saved to Play!
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={playScoutNotes}
                  onChange={(e) => setPlayScoutNotes(e.target.value)}
                  placeholder={`Write defensive scout breakdown for ${currentPlay.englishName}...\nExample:\n• Against Cover 2: Key the boundary safety; if safety bites outside, hit X on the deep post in the middle hole.\n• Against Cover 0 Blitz: Hot read is Slot H on the quick slant at 1.2s.`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Scout Notes</span>
                  </button>
                </div>
              </div>

              {/* Quick Concept Counters Reference */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 font-mono block">
                  STANDARD 8v8 DEFENSIVE COVERAGE BEATERS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-rose-700 block font-mono">Cover 0 Blitz</span>
                    <p className="text-[11px] text-slate-600 mt-1">Slants, Mesh drags, quick screens, rub routes.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-blue-700 block font-mono">Cover 2 Zone</span>
                    <p className="text-[11px] text-slate-600 mt-1">Smash concept (Corner/Hitch), Deep Middle Post.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-purple-700 block font-mono">Cover 3 Sky</span>
                    <p className="text-[11px] text-slate-600 mt-1">Four Verticals (seams), 3-Level Flood, Quick Outs.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-cyan-700 block font-mono">Cover 4 Quarters</span>
                    <p className="text-[11px] text-slate-600 mt-1">Underneath crossers, Bubble screens, Dig/Shallow.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= Modal Footer ================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span>Aalto Predators 8v8 Tactical Scouting Lab</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
