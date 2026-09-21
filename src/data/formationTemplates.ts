import { FormationTemplate } from '../types';

export const BUILT_IN_FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    id: 'builtin-trips-right',
    name: 'Trips Right (8v8 3-OL Spread)',
    category: 'TRIPS PASS',
    direction: 'RIGHT',
    isBuiltIn: true,
    description: '3 O-Line (LG, C, RG), QB in shotgun, RB in backfield, Trips receivers right (Z, Y) and backside receiver (X)',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Handoff' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Interior Pass Pro' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection / Pull' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection / Drive' },
      X: { id: 'X', label: 'X (WR-L)', positionName: 'Outside Left WR', initialPos: { x: 14, y: 65 }, roleDescription: 'Boundary Solo' },
      Y: { id: 'Y', label: 'Y (Slot)', positionName: 'Trips Slot Receiver', initialPos: { x: 74, y: 66 }, roleDescription: 'Intermediate Seam/Cross' },
      Z: { id: 'Z', label: 'Z (WR-R)', positionName: 'Outside Right WR', initialPos: { x: 88, y: 65 }, roleDescription: 'Perimeter Primary' },
      RB: { id: 'RB', label: 'RB', positionName: 'Running Back', initialPos: { x: 40, y: 75 }, roleDescription: 'Pass Pro / Checkdown' },
    },
  },
  {
    id: 'builtin-trips-left',
    name: 'Trips Left (8v8 3-OL Spread)',
    category: 'TRIPS PASS',
    direction: 'LEFT',
    isBuiltIn: true,
    description: '3 O-Line (LG, C, RG), QB in shotgun, RB in backfield, Trips receivers left (X, Y) and backside receiver (Z)',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Handoff' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Interior Pass Pro' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection / Pull' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection / Drive' },
      X: { id: 'X', label: 'X (WR-L)', positionName: 'Outside Left WR', initialPos: { x: 12, y: 65 }, roleDescription: 'Perimeter Primary' },
      Y: { id: 'Y', label: 'Y (Slot)', positionName: 'Trips Slot Receiver', initialPos: { x: 26, y: 66 }, roleDescription: 'Intermediate Seam/Cross' },
      Z: { id: 'Z', label: 'Z (WR-R)', positionName: 'Outside Right WR', initialPos: { x: 86, y: 65 }, roleDescription: 'Boundary Solo' },
      RB: { id: 'RB', label: 'RB', positionName: 'Running Back', initialPos: { x: 60, y: 75 }, roleDescription: 'Pass Pro / Checkdown' },
    },
  },
  {
    id: 'builtin-twins-2x2',
    name: 'Twins 2x2 (8v8 Balanced Spread)',
    category: 'TWINS PASS',
    direction: 'BALANCED',
    isBuiltIn: true,
    description: '3 O-Line (LG, C, RG), QB in shotgun, 4 receivers balanced (X & H left, Y & Z right)',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Handoff' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Pass Pro' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection' },
      X: { id: 'X', label: 'X (WR-L)', positionName: 'Outside Left WR', initialPos: { x: 14, y: 65 }, roleDescription: 'Boundary Outside' },
      H: { id: 'H', label: 'H (Slot-L)', positionName: 'Inside Left Slot', initialPos: { x: 28, y: 66 }, roleDescription: 'Field Slot Left' },
      Y: { id: 'Y', label: 'Y (Slot-R)', positionName: 'Inside Right Slot', initialPos: { x: 72, y: 66 }, roleDescription: 'Field Slot Right' },
      Z: { id: 'Z', label: 'Z (WR-R)', positionName: 'Outside Right WR', initialPos: { x: 88, y: 65 }, roleDescription: 'Boundary Outside' },
    },
  },
  {
    id: 'builtin-empty-4wide',
    name: 'Empty 4-Wide (8v8 3-OL Spread)',
    category: 'EMPTY PASS',
    direction: 'BALANCED',
    isBuiltIn: true,
    description: '3 O-Line pocket protection with 4 wide receivers spread horizontally (2x2)',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Quick Passer' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Anchor' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection' },
      X: { id: 'X', label: 'X (WR-1)', positionName: 'Far Left WR', initialPos: { x: 12, y: 65 }, roleDescription: 'Quick Outlet' },
      H: { id: 'H', label: 'H (Slot-1)', positionName: 'Left Slot', initialPos: { x: 28, y: 66 }, roleDescription: 'Slot Quick Under' },
      Y: { id: 'Y', label: 'Y (Slot-2)', positionName: 'Right Slot', initialPos: { x: 72, y: 66 }, roleDescription: 'Seam Crosser' },
      Z: { id: 'Z', label: 'Z (WR-2)', positionName: 'Far Right WR', initialPos: { x: 88, y: 65 }, roleDescription: 'Outside Vertical' },
    },
  },
  {
    id: 'builtin-split-backs',
    name: 'Split Backs 8v8 (3-OL Power)',
    category: 'SPLIT RUN',
    direction: 'BALANCED',
    isBuiltIn: true,
    description: '3 O-Line (LG, C, RG) with two split running backs flanking QB and 2 perimeter WRs',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Option' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Interior Block' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Power Drive Block / Pull' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Power Drive Block / Pull' },
      X: { id: 'X', label: 'X (WR-L)', positionName: 'Outside Left WR', initialPos: { x: 16, y: 65 }, roleDescription: 'Boundary Crack / Stalk' },
      Z: { id: 'Z', label: 'Z (WR-R)', positionName: 'Outside Right WR', initialPos: { x: 84, y: 65 }, roleDescription: 'Field Stalk Block' },
      RB: { id: 'RB', label: 'RB (Left Back)', positionName: 'Left Running Back', initialPos: { x: 40, y: 77 }, roleDescription: 'Sweep Carrier / Checkdown' },
      HB: { id: 'HB', label: 'HB (Right Back)', positionName: 'Right Halfback', initialPos: { x: 60, y: 77 }, roleDescription: 'Lead Pull Blocker / Wheel' },
    },
  },
  {
    id: 'builtin-bunch-right',
    name: 'Bunch Right 8v8 (3-OL Cluster)',
    category: 'TRIPS PASS',
    direction: 'RIGHT',
    isBuiltIn: true,
    description: '3 O-Line protection, 3-man bunch cluster on right, 1 backside receiver, and RB in backfield',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Handoff' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Pass Pro' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection' },
      X: { id: 'X', label: 'X (Solo)', positionName: 'Outside Left WR', initialPos: { x: 14, y: 65 }, roleDescription: 'Backside Solo' },
      Z: { id: 'Z', label: 'Z (Point)', positionName: 'Point Receiver', initialPos: { x: 78, y: 65 }, roleDescription: 'Point Clearout' },
      Y: { id: 'Y', label: 'Y (Outside)', positionName: 'Outside Bunch Slot', initialPos: { x: 85, y: 67 }, roleDescription: 'Corner / Flag' },
      RB: { id: 'RB', label: 'RB', positionName: 'Running Back', initialPos: { x: 40, y: 75 }, roleDescription: 'Pass Pro / Checkdown' },
    },
  },
  {
    id: 'builtin-2line-tight',
    name: '2-Line Tight 8v8 (3-OL Compact)',
    category: '2 LINE PASS',
    direction: 'BALANCED',
    isBuiltIn: true,
    description: '3 O-Line front (LG, C, RG) with compact tight ends and receivers for play-action and tight window reads',
    playerPositions: {
      QB: { id: 'QB', label: 'QB', positionName: 'Quarterback', initialPos: { x: 50, y: 75 }, roleDescription: 'Passer / Handoff' },
      C: { id: 'C', label: 'C', positionName: 'Center (3 O-Line)', initialPos: { x: 50, y: 65 }, roleDescription: 'Snap & Pass Pro' },
      LG: { id: 'LG', label: 'LG', positionName: 'Left Guard (3 O-Line)', initialPos: { x: 44, y: 65 }, roleDescription: 'Pass Protection' },
      RG: { id: 'RG', label: 'RG', positionName: 'Right Guard (3 O-Line)', initialPos: { x: 56, y: 65 }, roleDescription: 'Pass Protection' },
      X: { id: 'X', label: 'X (WR-L)', positionName: 'Tight Left WR', initialPos: { x: 22, y: 65 }, roleDescription: 'Tight Split Left' },
      Y: { id: 'Y', label: 'Y (TE-R)', positionName: 'Tight End / Wing Right', initialPos: { x: 64, y: 66 }, roleDescription: 'Inline Seam / Drag' },
      Z: { id: 'Z', label: 'Z (WR-R)', positionName: 'Tight Right WR', initialPos: { x: 80, y: 65 }, roleDescription: 'Tight Split Right' },
      RB: { id: 'RB', label: 'RB (Deep Pistol)', positionName: 'Pistol Running Back', initialPos: { x: 50, y: 81 }, roleDescription: 'Pistol Run / Pro' },
    },
  },
];

const STORAGE_KEY = 'playbook_formation_templates_v1';

export function getStoredFormationTemplates(): FormationTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return BUILT_IN_FORMATION_TEMPLATES;
    }
    const customTemplates: FormationTemplate[] = JSON.parse(raw);
    return [...BUILT_IN_FORMATION_TEMPLATES, ...customTemplates];
  } catch (err) {
    console.error('Error loading custom formation templates:', err);
    return BUILT_IN_FORMATION_TEMPLATES;
  }
}

export function saveCustomFormationTemplate(newTemplate: FormationTemplate): FormationTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: FormationTemplate[] = raw ? JSON.parse(raw) : [];
    // If ID exists, replace; otherwise append
    const index = existing.findIndex((t) => t.id === newTemplate.id);
    let updated: FormationTemplate[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = newTemplate;
    } else {
      updated = [newTemplate, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return [...BUILT_IN_FORMATION_TEMPLATES, ...updated];
  } catch (err) {
    console.error('Error saving custom formation template:', err);
    return getStoredFormationTemplates();
  }
}

export function deleteCustomFormationTemplate(templateId: string): FormationTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BUILT_IN_FORMATION_TEMPLATES;
    const existing: FormationTemplate[] = JSON.parse(raw);
    const updated = existing.filter((t) => t.id !== templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return [...BUILT_IN_FORMATION_TEMPLATES, ...updated];
  } catch (err) {
    console.error('Error deleting custom formation template:', err);
    return getStoredFormationTemplates();
  }
}
