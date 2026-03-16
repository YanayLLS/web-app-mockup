import type { UserRole } from '../../contexts/RoleContext';

export interface ConfigFolder {
  id: string;
  name: string;
  isExpanded: boolean;
  sortOrder: number;
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  tags: string[];
  isEnabled: boolean;
  isDefault: boolean;
  isReadOnly: boolean;
  lastUpdated: string;
  sortOrder: number;
  permittedRoles: UserRole[];
  /** Map of partName -> visibility state. true = visible, false = hidden */
  partStates: Record<string, boolean>;
  /** Folder this configuration belongs to (null/undefined = root level) */
  folderId?: string;
}

export const MOCK_FOLDERS: ConfigFolder[] = [
  { id: 'folder-regional', name: 'Regional Variants', isExpanded: true, sortOrder: 0 },
  { id: 'folder-retrofit', name: 'Retrofit Kits', isExpanded: false, sortOrder: 1 },
];

export const MOCK_CONFIGURATIONS: Configuration[] = [
  {
    id: 'config-default',
    name: 'Default Configuration',
    description: 'The base configuration representing the default state of the digital twin. All parts are visible in their original positions.',
    tags: ['default', 'base'],
    isEnabled: true,
    isDefault: true,
    isReadOnly: true,
    lastUpdated: '2026-03-10T14:30:00Z',
    sortOrder: 0,
    permittedRoles: ['guest', 'operator', 'operator-mr', 'field-service-engineer', 'service-support-expert', 'instructor', 'service-support-manager', 'content-creator', 'admin'],
    partStates: {},
  },
  {
    id: 'config-standard',
    name: 'Standard Model',
    description: 'Standard production model without optional accessories. Coolant system, premium exhaust, and auxiliary power module are hidden.',
    tags: ['standard', 'production', 'base-model'],
    isEnabled: true,
    isDefault: false,
    isReadOnly: false,
    lastUpdated: '2026-03-12T09:15:00Z',
    sortOrder: 1,
    permittedRoles: ['operator', 'field-service-engineer', 'service-support-expert', 'instructor', 'content-creator', 'admin'],
    partStates: {
      'CoolantAssembly': false,
      'CoolantPump': false,
      'CoolantReservoir': false,
      'PremiumExhaust': false,
      'AuxPowerModule': false,
    },
  },
  {
    id: 'config-premium-coolant',
    name: 'Premium with Coolant',
    description: 'Full premium model including coolant system, premium exhaust, and all optional accessories. Used for high-tier installations.',
    tags: ['premium', 'coolant', 'full-option'],
    isEnabled: true,
    isDefault: false,
    isReadOnly: false,
    lastUpdated: '2026-03-13T16:45:00Z',
    sortOrder: 2,
    permittedRoles: ['field-service-engineer', 'service-support-expert', 'instructor', 'content-creator', 'admin'],
    partStates: {
      'CoolantAssembly': true,
      'CoolantPump': true,
      'CoolantReservoir': true,
      'PremiumExhaust': true,
      'AuxPowerModule': true,
    },
  },
  {
    id: 'config-autocorp-usa-east',
    name: 'AutoCorp-USA-East',
    description: 'Regional configuration for AutoCorp USA East Coast installations. Includes cold-weather package and 60Hz power module variant.',
    tags: ['autocorp', 'usa-east', 'regional', '60hz'],
    isEnabled: true,
    isDefault: false,
    isReadOnly: false,
    lastUpdated: '2026-03-14T11:20:00Z',
    sortOrder: 3,
    permittedRoles: ['field-service-engineer', 'service-support-expert', 'content-creator', 'admin'],
    partStates: {
      'CoolantAssembly': true,
      'CoolantPump': true,
      'CoolantReservoir': true,
      'ColdWeatherPackage': true,
      'PowerModule50Hz': false,
      'PowerModule60Hz': true,
    },
    folderId: 'folder-regional',
  },
  {
    id: 'config-no-coolant-retrofit',
    name: 'No-Coolant Retrofit',
    description: 'Retrofit configuration for sites removing the coolant system. Includes replacement air-cooling adapter plate and modified exhaust routing.',
    tags: ['retrofit', 'no-coolant', 'air-cooled'],
    isEnabled: false,
    isDefault: false,
    isReadOnly: false,
    lastUpdated: '2026-03-11T08:00:00Z',
    sortOrder: 4,
    permittedRoles: ['field-service-engineer', 'content-creator', 'admin'],
    partStates: {
      'CoolantAssembly': false,
      'CoolantPump': false,
      'CoolantReservoir': false,
      'AirCoolingAdapter': true,
      'ModifiedExhaust': true,
    },
    folderId: 'folder-retrofit',
  },
];
