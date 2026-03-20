export interface AnimationFolder {
  id: string;
  name: string;
  isExpanded: boolean;
  sortOrder: number;
}

export interface AnimationItem {
  id: string;
  name: string;
  duration: number; // seconds
  folderId?: string;
  sortOrder: number;
  hasSdkBadge: boolean;
  thumbnailColor: string; // Placeholder color for thumbnail
  connectedParts: string[];
  linkedProcedure?: string;
}

export const MOCK_ANIMATION_FOLDERS: AnimationFolder[] = [
  { id: 'af-assembly', name: 'Assembly Sequences', isExpanded: true, sortOrder: 0 },
  { id: 'af-maintenance', name: 'Maintenance', isExpanded: true, sortOrder: 1 },
  { id: 'af-disassembly', name: 'Disassembly', isExpanded: false, sortOrder: 2 },
];

export const MOCK_ANIMATIONS: AnimationItem[] = [
  {
    id: 'anim-1',
    name: 'Impeller Removal',
    duration: 12.5,
    folderId: 'af-maintenance',
    sortOrder: 0,
    hasSdkBadge: false,
    thumbnailColor: '#5B8DEF',
    connectedParts: ['Impeller Assembly', 'Drive Shaft'],
    linkedProcedure: 'Oil Change',
  },
  {
    id: 'anim-2',
    name: 'Housing Cover Lift',
    duration: 8.0,
    folderId: 'af-disassembly',
    sortOrder: 0,
    hasSdkBadge: true,
    thumbnailColor: '#7C5BEF',
    connectedParts: ['Pump Housing'],
  },
  {
    id: 'anim-3',
    name: 'Oil Filter Extraction',
    duration: 15.2,
    folderId: 'af-maintenance',
    sortOrder: 1,
    hasSdkBadge: false,
    thumbnailColor: '#EF8B5B',
    connectedParts: ['Oil Filter', 'Filter Housing'],
    linkedProcedure: 'Oil Change',
  },
  {
    id: 'anim-4',
    name: 'Drive Shaft Assembly',
    duration: 22.0,
    folderId: 'af-assembly',
    sortOrder: 0,
    hasSdkBadge: true,
    thumbnailColor: '#5BEFC4',
    connectedParts: ['Drive Shaft', 'Bearing Assembly', 'Coupling'],
  },
  {
    id: 'anim-5',
    name: 'Cooling Fan Installation',
    duration: 9.8,
    folderId: 'af-assembly',
    sortOrder: 1,
    hasSdkBadge: false,
    thumbnailColor: '#EF5B8D',
    connectedParts: ['Cooling System', 'Fan Blade Assembly'],
  },
  {
    id: 'anim-6',
    name: 'Pump Seal Replacement',
    duration: 18.5,
    sortOrder: 0,
    hasSdkBadge: false,
    thumbnailColor: '#C4EF5B',
    connectedParts: ['Pump Housing', 'Mechanical Seal', 'O-Ring Kit'],
    linkedProcedure: 'Seal Replacement',
  },
  {
    id: 'anim-7',
    name: 'Full Exploded View',
    duration: 30.0,
    sortOrder: 1,
    hasSdkBadge: true,
    thumbnailColor: '#5BC4EF',
    connectedParts: ['Pump Housing', 'Impeller Assembly', 'Drive Shaft', 'Oil Filter', 'Cooling System'],
  },
  {
    id: 'anim-8',
    name: 'Bearing Inspection',
    duration: 6.3,
    folderId: 'af-maintenance',
    sortOrder: 2,
    hasSdkBadge: false,
    thumbnailColor: '#EFC45B',
    connectedParts: ['Bearing Assembly'],
  },
  {
    id: 'anim-9',
    name: 'Valve Body Disassembly',
    duration: 14.0,
    folderId: 'af-disassembly',
    sortOrder: 1,
    hasSdkBadge: false,
    thumbnailColor: '#8D5BEF',
    connectedParts: ['Valve Body', 'Spring Assembly', 'Valve Seat'],
  },
  {
    id: 'anim-10',
    name: 'Motor Coupling Alignment',
    duration: 11.2,
    folderId: 'af-assembly',
    sortOrder: 2,
    hasSdkBadge: true,
    thumbnailColor: '#5BEF8D',
    connectedParts: ['Coupling', 'Motor Mount', 'Drive Shaft'],
  },
];

// Parts hierarchy for PartsSelectionModal
export interface PartNode {
  id: string;
  name: string;
  children?: PartNode[];
}

export const MOCK_PARTS_HIERARCHY: PartNode[] = [
  {
    id: 'part-pump',
    name: 'Pump Housing',
    children: [
      { id: 'part-pump-body', name: 'Pump Body' },
      { id: 'part-pump-cover', name: 'Pump Cover' },
      {
        id: 'part-pump-seal',
        name: 'Seal Assembly',
        children: [
          { id: 'part-mech-seal', name: 'Mechanical Seal' },
          { id: 'part-oring', name: 'O-Ring Kit' },
          { id: 'part-gasket', name: 'Gasket Set' },
        ],
      },
    ],
  },
  {
    id: 'part-impeller',
    name: 'Impeller Assembly',
    children: [
      { id: 'part-impeller-blade', name: 'Impeller Blade' },
      { id: 'part-impeller-hub', name: 'Impeller Hub' },
      { id: 'part-impeller-shroud', name: 'Wear Ring' },
    ],
  },
  {
    id: 'part-drive',
    name: 'Drive Shaft',
    children: [
      { id: 'part-shaft-main', name: 'Main Shaft' },
      {
        id: 'part-bearing',
        name: 'Bearing Assembly',
        children: [
          { id: 'part-bearing-front', name: 'Front Bearing' },
          { id: 'part-bearing-rear', name: 'Rear Bearing' },
          { id: 'part-bearing-spacer', name: 'Bearing Spacer' },
        ],
      },
      { id: 'part-coupling', name: 'Coupling' },
    ],
  },
  {
    id: 'part-oil',
    name: 'Oil Filter',
    children: [
      { id: 'part-filter-element', name: 'Filter Element' },
      { id: 'part-filter-housing', name: 'Filter Housing' },
      { id: 'part-drain-plug', name: 'Drain Plug' },
    ],
  },
  {
    id: 'part-cooling',
    name: 'Cooling System',
    children: [
      { id: 'part-fan', name: 'Fan Blade Assembly' },
      { id: 'part-radiator', name: 'Radiator' },
      { id: 'part-coolant-pump', name: 'Coolant Pump' },
      { id: 'part-thermostat', name: 'Thermostat Valve' },
    ],
  },
  {
    id: 'part-valve',
    name: 'Valve Body',
    children: [
      { id: 'part-valve-seat', name: 'Valve Seat' },
      { id: 'part-spring', name: 'Spring Assembly' },
      { id: 'part-actuator', name: 'Actuator' },
    ],
  },
  {
    id: 'part-motor',
    name: 'Motor Mount',
    children: [
      { id: 'part-motor-base', name: 'Base Plate' },
      { id: 'part-motor-bolts', name: 'Mounting Bolts' },
      { id: 'part-vibration-pad', name: 'Vibration Dampener' },
    ],
  },
];
