import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Viewer3D } from './Viewer3D';
import { ProcedurePanel } from './ProcedurePanel';
import { Header } from './Header';
import { MediaViewer } from './MediaViewer';
import { SettingsModal } from './SettingsModal';
import { PublishModal } from './PublishModal';
import { PopupPanel } from './PopupPanel';
import { ValidationPanel } from './ValidationPanel';
import { OptionsManager } from './OptionsManager';
import { BookmarksModal } from './BookmarksModal';
import { PartsCatalogPanel } from './PartsCatalogPanel';
import { MOCK_CONFIGURATIONS } from '../../data/configurationsData';
import type { ModelHierarchyNode } from './Viewer3D';
import { TableOfContents } from './TableOfContents';
import { Tutorial } from './Tutorial';
import { SaveIndicator } from './SaveIndicator';
import { ARPlacementFlow, type ObjectTarget, type PlacementMethod } from './ARPlacementFlow';
import { ContextMenu } from './ContextMenu';
import { DemoRunner, type DemoFeature } from './DemoRunner';
import { AnimationBuilder } from './AnimationBuilder';
import { HotspotsPanel } from './HotspotsPanel';
import { GraduationCap, Undo, AlertCircle, X, MoreVertical, Keyboard, Glasses, Video, RotateCcw, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProcedureSteps } from '../../contexts/ProcedureStepsContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { useAppPopup } from '../../contexts/AppPopupContext';

// Extend window type for validation callback
declare global {
  interface Window {
    __validationPartsCallback?: (parts: string[]) => void;
  }
}

export interface StepAction {
  label: string;
  nextStepId: string;
}

export interface TwinState {
  camera: { cx: number; cy: number; cz: number; tx: number; ty: number; tz: number };
  hiddenParts: string[];
  xrayParts: string[];
}

export interface Step {
  id: string;
  title?: string;
  description?: string;
  actions: StepAction[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  color: string;
  hasAnimation: boolean;
  animationId?: string | null; // ID of attached animation in the 3D scene
  twinState?: TwinState | null; // Saved digital twin state for this step
  popups: Popup[];
  mediaFiles: MediaFile[];
  validation?: Validation; // Single validation per step
  parentStepId?: string;
  parentActionIndex?: number;
  nextStepId?: string; // For creating loops and custom step connections
  configurationId?: string; // GAP 3 (FR55-57): Linked configuration
  configurationName?: string; // Display name for the linked configuration
}

export interface Popup {
  id: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
  position: { x: number; y: number };
  color?: string;
  mediaFiles: MediaFile[];
  confirmButtonText?: string;
  requiresConfirmation?: boolean;
  arrowDirection?: 'up' | 'down' | 'left' | 'right' | 'none'; // Arrow indicator direction
}

export interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  caption?: string;
}

export type CheckpointType = 'visual' | 'measurement' | 'presence' | 'sequence';
export type CheckpointSeverity = 'critical' | 'warning' | 'info';

export interface MeasurementTolerance {
  nominal: number;
  min: number;
  max: number;
  unit: string; // 'mm' | 'psi' | '°C' | '°F' | 'Nm' | '%' | custom
}

export interface ValidationOutcome {
  description: string;
  mediaFiles: MediaFile[];
  remediationSteps?: string;
}

export interface Checkpoint {
  id: string;
  type: CheckpointType;
  severity: CheckpointSeverity;
  label: string;
  selectedParts: string[];
  arrowDirection?: { x: number; y: number; z: number };
  tolerance?: MeasurementTolerance;
  passState: ValidationOutcome;
  failState: ValidationOutcome;
  sequenceOrder?: number;
}

export interface Validation {
  id: string;
  checkpoints: Checkpoint[];
}

export interface PublishInfo {
  version: string;
  date: string;
  changelog?: string;
}

// No limit on steps - removed MAX_STEPS

const initialStep: Step = {
  id: crypto.randomUUID(),
  actions: [],
  color: 'var(--foreground)',
  hasAnimation: false,
  popups: [],
  mediaFiles: []
};

// Extract procedure ID from URL path
function getProcedureIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/procedure-editor\/([^/?]+)/);
  return match ? match[1] : null;
}

// Map procedure IDs to their web knowledgebase URLs (for "open in web" settings)
function getWebSettingsUrl(procedureId: string | null): string {
  const mapping: Record<string, string> = {
    'p1': '/web/project/915-i-series/knowledgebase?open=915-i-series-kb-1-1',
    'p2': '/web/project/915-i-series/knowledgebase?open=p2',
    'p3': '/web/project/915-i-series/knowledgebase?open=p3',
    'p4': '/web/project/915-i-series/knowledgebase?open=p4',
    'p5': '/web/project/915-i-series/knowledgebase?open=p5',
    'p6': '/web/project/915-i-series/knowledgebase?open=p6',
    'generator-maintenance': '/web/project/generator/knowledgebase?open=generator-kb-2',
  };
  if (procedureId && mapping[procedureId]) return mapping[procedureId];
  return `/web/project/generator/knowledgebase?open=${procedureId || 'new'}`;
}

const sampleStepIds = {
  s1: 'sample-step-1',
  s2: 'sample-step-2',
  s3: 'sample-step-3',
  s4: 'sample-step-4',
  s5: 'sample-step-5',
  s6: 'sample-step-6',
  s7: 'sample-step-7',
  s8: 'sample-step-8',
  s9: 'sample-step-9',
  s10: 'sample-step-10',
};

const sampleSteps: Step[] = [
  {
    id: sampleStepIds.s1,
    title: 'Safety Preparation & Lockout',
    description: 'Before beginning generator maintenance, ensure all safety protocols are followed. The generator must be fully shut down and cooled for at least 30 minutes. Wear appropriate PPE and apply lockout/tagout to the main breaker and fuel supply valve.',
    actions: [],
    color: '#FF1F1F',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-1a',
        title: 'Required PPE',
        description: 'Safety glasses, insulated gloves (rated 1000V), steel-toe boots, hearing protection, and flame-resistant clothing are mandatory.',
        position: { x: 30, y: 20 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-1b',
        title: 'Main Breaker Lockout',
        description: 'The main breaker is located on the generator control panel. Switch to OFF, apply your personal padlock, and attach the lockout tag with date and name.',
        position: { x: 70, y: 45 },
        color: '#FF1F1F',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'Lockout applied',
        arrowDirection: 'left',
      },
      {
        id: 'popup-1c',
        title: 'Fuel Supply Valve',
        description: 'Close the fuel supply valve on the fuel line near the base frame. This prevents fuel flow during filter and line inspections.',
        position: { x: 50, y: 75 },
        color: '#FF1F1F',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'Fuel valve closed',
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s2,
    parentStepId: sampleStepIds.s1,
    title: 'Visual Inspection of Generator Housing',
    description: 'Perform a thorough walk-around inspection of the generator enclosure. Check for external damage, corrosion, fluid leaks, loose bolts, and debris accumulation. Inspect exhaust connections and ventilation openings for blockages.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-2a',
        title: 'Exhaust System Check',
        description: 'Inspect the exhaust manifold and muffler connections for soot buildup, cracks, or loose clamps. Black residue around joints indicates an exhaust leak.',
        position: { x: 25, y: 30 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-2b',
        title: 'Ventilation Louvers',
        description: 'Ensure all ventilation louvers are clear of debris, leaves, or nesting material. Blocked louvers cause overheating and reduced power output.',
        position: { x: 65, y: 25 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-2c',
        title: 'Base Frame & Mounts',
        description: 'Check all anti-vibration mounts for cracking or compression. Verify anchor bolts are tight. Look for fluid puddles under the base frame.',
        position: { x: 45, y: 70 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-2',
      checkpoints: [
        {
          id: 'cp-2a',
          type: 'visual',
          severity: 'warning',
          label: 'Enclosure integrity',
          selectedParts: ['generator-housing', 'exhaust-manifold'],
          passState: { description: 'No visible damage, corrosion, or leaks found on housing', mediaFiles: [] },
          failState: { description: 'Damage or corrosion detected — document and schedule repair', mediaFiles: [] },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s3,
    parentStepId: sampleStepIds.s2,
    title: 'Check Engine Oil Level & Condition',
    description: 'Remove the oil dipstick, wipe clean, reinsert fully, and withdraw to read the level. Oil should be between the LOW and FULL marks. Inspect oil color and consistency — dark black or gritty oil indicates the need for an oil change.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-3a',
        title: 'Dipstick Location',
        description: 'The engine oil dipstick has a yellow handle and is located on the left side of the engine block, near the oil fill cap.',
        position: { x: 35, y: 40 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-3b',
        title: 'Oil Condition Guide',
        description: 'Amber/honey = good condition. Dark brown = serviceable but aging. Black/gritty = change immediately. Milky/frothy = possible coolant contamination — escalate.',
        position: { x: 70, y: 55 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-3',
      checkpoints: [
        {
          id: 'cp-3a',
          type: 'measurement',
          severity: 'critical',
          label: 'Engine oil level',
          selectedParts: ['engine-block', 'oil-dipstick'],
          tolerance: { nominal: 85, min: 60, max: 100, unit: '%' },
          passState: { description: 'Oil level is between LOW and FULL marks', mediaFiles: [] },
          failState: { description: 'Oil level is below LOW mark — top up or change oil', mediaFiles: [], remediationSteps: 'Add SAE 15W-40 diesel engine oil to bring level to FULL mark' },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s4,
    parentStepId: sampleStepIds.s3,
    title: 'Drain & Replace Engine Oil',
    description: 'Place a drain pan (min. 15L capacity) under the oil drain plug. Remove the drain plug using a 19mm socket and allow oil to drain completely (approx. 10 minutes). Replace the oil filter. Reinstall drain plug with new gasket and torque to 35 Nm. Fill with SAE 15W-40 diesel engine oil to the FULL mark.',
    actions: [],
    color: '#FF6B35',
    hasAnimation: true,
    configurationId: 'config-standard',
    configurationName: 'Standard Model',
    popups: [
      {
        id: 'popup-4a',
        title: 'Drain Plug Location',
        description: 'The oil drain plug is at the lowest point of the oil pan, accessible from the underside of the generator. Use a 19mm socket wrench.',
        position: { x: 40, y: 65 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'up',
      },
      {
        id: 'popup-4b',
        title: 'Oil Filter Replacement',
        description: 'Use a filter wrench to remove the old filter (turn counter-clockwise). Apply a thin film of new oil to the new filter gasket. Hand-tighten the new filter plus 3/4 turn.',
        position: { x: 65, y: 35 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'left',
      },
      {
        id: 'popup-4c',
        title: 'Oil Specification',
        description: 'Use SAE 15W-40 API CK-4 rated diesel engine oil. Capacity: 12.5 liters. Do not overfill — check dipstick after adding 12 liters.',
        position: { x: 25, y: 30 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'right',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s5,
    parentStepId: sampleStepIds.s4,
    title: 'Inspect & Replace Air Filter',
    description: 'Open the air filter housing by releasing the four spring clips. Remove the air filter element and inspect for dirt, damage, or moisture. Hold the filter up to light — if light does not pass through, replace the element. Clean the housing interior before installing the new filter.',
    actions: [],
    color: 'var(--foreground)',
    hasAnimation: true,
    configurationId: 'config-premium',
    configurationName: 'Premium Package',
    popups: [
      {
        id: 'popup-5a',
        title: 'Air Filter Housing',
        description: 'The air filter housing is located on top of the engine, connected to the intake manifold via a rubber boot. Release the four spring clips to open.',
        position: { x: 45, y: 25 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-5b',
        title: 'Filter Service Indicator',
        description: 'Check the restriction indicator on the air cleaner housing. If the indicator shows RED, the filter must be replaced regardless of visual condition.',
        position: { x: 70, y: 50 },
        color: '#FF1F1F',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s6,
    parentStepId: sampleStepIds.s5,
    title: 'Check Coolant Level & Condition',
    description: 'With the engine cool, remove the radiator cap (turn counter-clockwise slowly to release pressure). Coolant level should be visible at the filler neck. Check the overflow tank — level should be between MIN and MAX. Inspect coolant color: green/blue = good, brown/rusty = flush needed.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-6a',
        title: 'Radiator Cap Warning',
        description: 'NEVER open the radiator cap when the engine is hot. The cooling system is pressurized and can cause severe burns. Wait at least 30 minutes after shutdown.',
        position: { x: 35, y: 20 },
        color: '#FF1F1F',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-6b',
        title: 'Coolant Specification',
        description: 'Use a 50/50 mix of ethylene glycol antifreeze and distilled water. Do not mix coolant types (green vs orange). Total system capacity: 18 liters.',
        position: { x: 60, y: 55 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-6',
      checkpoints: [
        {
          id: 'cp-6a',
          type: 'measurement',
          severity: 'warning',
          label: 'Coolant level',
          selectedParts: ['radiator', 'coolant-overflow-tank'],
          tolerance: { nominal: 80, min: 50, max: 100, unit: '%' },
          passState: { description: 'Coolant level is within acceptable range', mediaFiles: [] },
          failState: { description: 'Coolant level is low — top up with correct mixture before proceeding', mediaFiles: [] },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s7,
    parentStepId: sampleStepIds.s6,
    title: 'Inspect Fuel System',
    description: 'Check all fuel lines and fittings for leaks, cracks, or loose connections. Inspect the fuel/water separator bowl — drain any accumulated water by opening the petcock valve at the bottom. Replace the fuel filter if the service interval has been reached (every 500 hours).',
    actions: [],
    color: '#FF6B35',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-7a',
        title: 'Fuel/Water Separator',
        description: 'The fuel/water separator is mounted on the engine front, between the fuel tank and injection pump. Clear water from the bowl by opening the drain valve until clean fuel flows.',
        position: { x: 30, y: 45 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-7b',
        title: 'Fuel Line Inspection',
        description: 'Follow each fuel line from the tank to the engine. Check for chafing where lines contact the frame. Look for wet spots or diesel smell indicating a leak.',
        position: { x: 65, y: 35 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-7c',
        title: 'Fuel Filter Replacement',
        description: 'If replacing: close fuel supply valve, use a filter wrench to remove old filter, prime new filter with clean diesel, install hand-tight plus 1/2 turn. Bleed air from the system using the bleed screw on the injection pump.',
        position: { x: 50, y: 70 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s8,
    parentStepId: sampleStepIds.s7,
    title: 'Test Battery & Electrical Connections',
    description: 'Measure battery voltage with a multimeter — should read 12.4V or higher (24V systems: 24.8V+). Inspect battery terminals for corrosion (white/green buildup). Clean terminals with a wire brush if needed. Check that all cable connections are tight. Verify the battery charger/maintainer is functioning.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-8a',
        title: 'Battery Voltage Reference',
        description: '12.6V+ = fully charged\n12.4V = 75% charged\n12.2V = 50% charged\n12.0V = 25% charged\nBelow 12.0V = dead — replace or recharge immediately.',
        position: { x: 40, y: 30 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-8b',
        title: 'Terminal Cleaning',
        description: 'Disconnect negative (-) terminal first, then positive (+). Clean with baking soda solution and wire brush. Apply anti-corrosion spray. Reconnect positive first, then negative.',
        position: { x: 65, y: 60 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-8',
      checkpoints: [
        {
          id: 'cp-8a',
          type: 'measurement',
          severity: 'critical',
          label: 'Battery voltage',
          selectedParts: ['battery', 'battery-terminals'],
          tolerance: { nominal: 12.6, min: 12.4, max: 14.0, unit: 'V' },
          passState: { description: 'Battery voltage is within normal operating range', mediaFiles: [] },
          failState: { description: 'Battery voltage is low — recharge or replace battery before startup', mediaFiles: [], remediationSteps: 'Connect battery charger at 10A for 4-6 hours, then retest' },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s9,
    parentStepId: sampleStepIds.s8,
    title: 'Inspect Drive Belt & Coolant Hoses',
    description: 'Check the serpentine drive belt for cracks, fraying, glazing, or excessive slack. Belt deflection should be 10-12mm at the longest span. Inspect all coolant hoses by squeezing them — they should be firm but flexible. Soft, spongy, or cracked hoses must be replaced.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-9a',
        title: 'Belt Tension Check',
        description: 'Press the belt at the midpoint between the alternator and water pump pulleys. Acceptable deflection: 10–12mm. If the auto-tensioner is at its limit, replace the belt.',
        position: { x: 35, y: 45 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-9b',
        title: 'Hose Inspection Points',
        description: 'Check upper radiator hose, lower radiator hose, heater hoses, and bypass hoses. Pay special attention to clamp areas — this is where hoses fail first.',
        position: { x: 65, y: 40 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-9',
      checkpoints: [
        {
          id: 'cp-9a',
          type: 'visual',
          severity: 'critical',
          label: 'Drive belt condition',
          selectedParts: ['drive-belt', 'alternator-pulley', 'water-pump-pulley'],
          passState: { description: 'Belt is in good condition with proper tension', mediaFiles: [] },
          failState: { description: 'Belt shows wear or improper tension — replace before startup', mediaFiles: [], remediationSteps: 'Install new serpentine belt part #GB-SB-2200 and verify tension' },
        },
        {
          id: 'cp-9b',
          type: 'visual',
          severity: 'warning',
          label: 'Coolant hose integrity',
          selectedParts: ['upper-radiator-hose', 'lower-radiator-hose'],
          passState: { description: 'All hoses are firm and free of cracks or swelling', mediaFiles: [] },
          failState: { description: 'Hose deterioration detected — schedule replacement', mediaFiles: [] },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s10,
    parentStepId: sampleStepIds.s9,
    title: 'Run Load Test & Final Checks',
    description: 'Remove all lockout/tagout devices. Open the fuel supply valve. Start the generator and allow a 5-minute warm-up at no load. Gradually apply load in 25% increments up to 75% rated capacity. Monitor voltage, frequency, oil pressure, and coolant temperature. Run under load for 15 minutes, then reduce load and cool down. Record all readings in the maintenance logbook.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-10a',
        title: 'Startup Checklist',
        description: '1. All panels and covers secured\n2. Tools removed from generator area\n3. Lockout devices removed\n4. Fuel valve open\n5. Coolant and oil at correct levels\n6. Area clear of personnel',
        position: { x: 25, y: 25 },
        color: '#11E874',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'All pre-start checks passed',
        arrowDirection: 'down',
      },
      {
        id: 'popup-10b',
        title: 'Operating Parameters',
        description: 'Voltage: 220V ±5% (or 380V for 3-phase)\nFrequency: 50 Hz ±0.5 Hz\nOil pressure: 40–60 psi\nCoolant temp: 80–95°C\nIf any parameter is out of range, shut down immediately.',
        position: { x: 65, y: 40 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'left',
      },
      {
        id: 'popup-10c',
        title: 'Maintenance Log Entry',
        description: 'Record: date, run hours, oil level/change, filter status, coolant level, battery voltage, belt condition, and any issues found. Sign and date the entry.',
        position: { x: 45, y: 75 },
        color: '#2F80ED',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'Logbook updated',
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-10',
      checkpoints: [
        {
          id: 'cp-10a',
          type: 'measurement',
          severity: 'critical',
          label: 'Output voltage under load',
          selectedParts: ['generator-alternator', 'control-panel'],
          tolerance: { nominal: 220, min: 209, max: 231, unit: 'V' },
          passState: { description: 'Voltage is stable and within ±5% of nominal', mediaFiles: [] },
          failState: { description: 'Voltage is out of range — check AVR and alternator', mediaFiles: [], remediationSteps: 'Inspect automatic voltage regulator (AVR) settings and alternator brushes' },
        },
        {
          id: 'cp-10b',
          type: 'measurement',
          severity: 'critical',
          label: 'Output frequency',
          selectedParts: ['engine-governor', 'control-panel'],
          tolerance: { nominal: 50, min: 49.5, max: 50.5, unit: 'Hz' },
          passState: { description: 'Frequency is stable at 50 Hz under load', mediaFiles: [] },
          failState: { description: 'Frequency deviation detected — adjust engine governor', mediaFiles: [] },
        },
        {
          id: 'cp-10c',
          type: 'visual',
          severity: 'warning',
          label: 'No leaks during operation',
          selectedParts: ['engine-block', 'fuel-lines', 'coolant-hoses', 'exhaust-manifold'],
          passState: { description: 'No fluid or exhaust leaks observed during load test', mediaFiles: [] },
          failState: { description: 'Leak detected during operation — shut down and repair', mediaFiles: [], remediationSteps: 'Identify leak source, tighten connections or replace gaskets' },
        },
      ],
    },
  },
];

export function ProcedureEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode'); // 'view' | 'edit' | null
  const isPreviewMode = searchParams.get('preview') === 'true';
  const activeConfigName = searchParams.get('config') || null;
  const panelLayout = searchParams.get('layout') as 'topleft' | null; // 'topleft' = narrow tall card at top-left
  const hasProcedureId = typeof window !== 'undefined' && window.location.pathname.includes('/procedure-editor/');
  const procedureIdFromUrl = getProcedureIdFromUrl();

  // Role-based permission check — only content creators / admins can edit
  const { currentRole } = useRole();
  const canEdit = hasAccess(currentRole, 'projects-edit');
  const { alert: appAlert, confirm: appConfirm } = useAppPopup();

  // Shared procedure steps context — single source of truth
  const { getSteps, setSteps: setContextSteps, getTitle, setTitle: setContextTitle } = useProcedureSteps();

  // Load steps from context, falling back to sampleSteps for known IDs, or empty for new procedures
  const useSampleData = hasProcedureId && urlMode !== null;
  const contextSteps = procedureIdFromUrl ? getSteps(procedureIdFromUrl) : [];
  const contextTitle = procedureIdFromUrl ? getTitle(procedureIdFromUrl) : '';
  const resolvedInitialSteps = contextSteps.length > 0 ? contextSteps : (useSampleData ? sampleSteps : [initialStep]);
  const resolvedInitialTitle = contextTitle || (useSampleData ? 'Generator Preventive Maintenance Procedure' : 'Elitebook 840 G9');

  const [steps, setStepsLocal] = useState<Step[]>(resolvedInitialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedActionPath, setSelectedActionPath] = useState<Map<string, number>>(new Map());
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [procedureTitle, setProcedureTitleLocal] = useState(resolvedInitialTitle);

  // Wrap setSteps to also sync back to the shared context
  const setSteps = useCallback((stepsOrUpdater: Step[] | ((prev: Step[]) => Step[])) => {
    setStepsLocal(prev => {
      const next = typeof stepsOrUpdater === 'function' ? stepsOrUpdater(prev) : stepsOrUpdater;
      if (procedureIdFromUrl) {
        setContextSteps(procedureIdFromUrl, next);
      }
      return next;
    });
  }, [procedureIdFromUrl, setContextSteps]);

  // Wrap setProcedureTitle to also sync to context
  const setProcedureTitle = useCallback((title: string) => {
    setProcedureTitleLocal(title);
    if (procedureIdFromUrl) {
      setContextTitle(procedureIdFromUrl, title);
    }
  }, [procedureIdFromUrl, setContextTitle]);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(urlMode !== 'view' && canEdit);
  const [showOptionsManager, setShowOptionsManager] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);
  const [showHotspotsPanel, setShowHotspotsPanel] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [tocFeatureEnabled, setTocFeatureEnabled] = useState(false);
  const [showPopupPanel, setShowPopupPanel] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [isSelectingValidationParts, setIsSelectingValidationParts] = useState(false);
  const [tempSelectedParts, setTempSelectedParts] = useState<string[]>([]);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  const [availableParts, setAvailableParts] = useState<string[]>([]);
  const [modelHierarchy, setModelHierarchy] = useState<ModelHierarchyNode | null>(null);
  const [isSettingArrowDirection, setIsSettingArrowDirection] = useState(false);
  const [tempArrowDirection, setTempArrowDirection] = useState<{ x: number; y: number; z: number } | null>(null);
  const [arrowDirectionCallback, setArrowDirectionCallback] = useState<((direction: { x: number; y: number; z: number }) => void) | null>(null);
  const [showNewStepAnimation, setShowNewStepAnimation] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [publishInfo, setPublishInfo] = useState<PublishInfo | null>(null);
  const [stepPopAnimation, setStepPopAnimation] = useState(false);
  const [flashStepShadow, setFlashStepShadow] = useState(false);
  const [deletedStep, setDeletedStep] = useState<{ step: Step; index: number } | null>(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [deletedPopup, setDeletedPopup] = useState<{ popup: Popup; stepIndex: number } | null>(null);
  const [showUndoPopupNotification, setShowUndoPopupNotification] = useState(false);
  
  // Animation editor state — hides procedure UI when open
  const [isAnimationEditorOpen, setIsAnimationEditorOpen] = useState(false);

  // AR Mode state
  const [isARMode, setIsARMode] = useState(false);
  const [showARPlacement, setShowARPlacement] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  // Scene more menu state
  const [showSceneMoreMenu, setShowSceneMoreMenu] = useState(false);
  const sceneMoreMenuRef = useRef<HTMLDivElement>(null);

  // Mobile view debug state
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check URL for mobile mode
  const isMobilePath = typeof window !== 'undefined' && window.location.pathname === '/mobile';
  
  // Auto-enable mobile view when on /mobile path
  useEffect(() => {
    if (isMobilePath) {
      setIsMobileView(true);
      setEditingEnabled(false);
    }
  }, [isMobilePath]);

  // Close scene more menu on click outside
  useEffect(() => {
    if (!showSceneMoreMenu) return;
    const handler = (e: MouseEvent) => {
      if (sceneMoreMenuRef.current && !sceneMoreMenuRef.current.contains(e.target as Node)) {
        setShowSceneMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSceneMoreMenu]);

  // Save indicator state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const sceneIframeRef = useRef<HTMLIFrameElement>(null);

  // Demo runner state
  const [activeDemo, setActiveDemo] = useState<DemoFeature | null>(null);

  // AR overlay state (synced from iframe via direct DOM access)
  const [arActive, setArActive] = useState(false);

  // Send a command to the 3D scene iframe
  const postToScene = useCallback((msg: Record<string, unknown>) => {
    sceneIframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  // Hide iframe's AR button in embedded mode and sync AR state via direct DOM access
  useEffect(() => {
    const iframe = sceneIframeRef.current;
    if (!iframe) return;

    let observer: MutationObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const setup = () => {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      const arBtn = iframeDoc.getElementById('arBtn');
      const arSubBtns = iframeDoc.getElementById('arSubBtns');

      if (arBtn) {
        // Hide the iframe AR button — React renders its own
        arBtn.style.display = 'none';

        // Observe class changes to sync arActive state
        observer = new MutationObserver(() => {
          setArActive(arBtn.classList.contains('ar-active'));
        });
        observer.observe(arBtn, { attributes: true, attributeFilter: ['class'] });
      }

      // Reposition sub-buttons to continue the React overlay column.
      // The React overlay is positioned at top-3 right-3 (12px each) relative to
      // the procedure editor container, which is offset from the iframe by 0px
      // (iframe fills the viewport below the top bar). The React buttons are at
      // iframe-y ≈ 11, 46, 81 with 28px height and 8px gap. Sub-btns start at ~117px.
      // Center the wider 44px sub-btns over the 28px React buttons (right ≈ 4px).
      if (arSubBtns) {
        arSubBtns.style.top = '117px';
        arSubBtns.style.right = '4px';
      }

      if (pollTimer) clearInterval(pollTimer);
    };

    // The iframe may not be loaded yet — poll until DOM is accessible
    pollTimer = setInterval(() => {
      try {
        if (iframe.contentDocument?.getElementById('arBtn')) setup();
      } catch { /* cross-origin guard */ }
    }, 500);

    iframe.addEventListener('load', setup);
    return () => {
      iframe.removeEventListener('load', setup);
      if (observer) observer.disconnect();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Ensure current step has validation property
  const currentStep = (() => {
    const step = steps[currentStepIndex] || steps[0] || initialStep;
    return step;
  })();

  // Migration effect removed - no longer needed

  // Get ordered steps based on selected action path for TOC
  const getOrderedSteps = useCallback(() => {
    const orderedSteps: Step[] = [];
    const visited = new Set<string>();
    
    const traverse = (stepId: string) => {
      const step = steps.find(s => s.id === stepId);
      if (!step || visited.has(stepId)) return;
      
      visited.add(stepId);
      orderedSteps.push(step);
      
      // If this step has a selected action, follow that path
      const selectedActionIndex = selectedActionPath.get(stepId);
      if (selectedActionIndex !== undefined && step.actions[selectedActionIndex]) {
        traverse(step.actions[selectedActionIndex].nextStepId);
        return;
      }
      
      // If no action selected but step has actions, follow the first action (default path)
      if (step.actions.length > 0) {
        traverse(step.actions[0].nextStepId);
        return;
      }
      
      // Otherwise, follow linear connection
      const linearNext = steps.find(s => 
        s.parentStepId === stepId && s.parentActionIndex === undefined
      );
      if (linearNext) {
        traverse(linearNext.id);
      }
    };
    
    // Start from the first step (root)
    if (steps.length > 0) {
      traverse(steps[0].id);
    }
    
    return orderedSteps;
  }, [steps, selectedActionPath]);

  // Check if current step is the first visible step
  const isFirstVisibleStep = useMemo(() => {
    const visibleSteps = getOrderedSteps();
    if (visibleSteps.length === 0) return true;
    return visibleSteps[0].id === currentStep.id;
  }, [getOrderedSteps, currentStep.id]);

  // Calculate TOC display number (visible step position) and total visible steps
  const { tocDisplayNumber, tocTotalSteps } = useMemo(() => {
    const visibleSteps = getOrderedSteps();
    const displayIndex = visibleSteps.findIndex(s => s.id === currentStep.id);
    return {
      tocDisplayNumber: displayIndex >= 0 ? displayIndex + 1 : currentStepIndex + 1,
      tocTotalSteps: visibleSteps.length
    };
  }, [getOrderedSteps, currentStep.id, currentStepIndex]);

  // Save changes function
  const saveChanges = useCallback(() => {
    // This is where you would actually save to a backend/localStorage
    // For now, we'll just simulate saving
    setIsSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      lastSaveTimeRef.current = Date.now();
    }, 800);
  }, []);

  // Trigger save indicator when changes are made
  const triggerSave = useCallback(() => {
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Check if 10 seconds have passed since last save
    const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
    const delay = timeSinceLastSave >= 10000 ? 0 : 10000 - timeSinceLastSave;
    
    // Schedule save
    saveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveChanges();
      }
    }, delay);
  }, [hasUnsavedChanges, saveChanges]);

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      
      // Cleanup save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);



  const handleStepChange = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setStepPopAnimation(true);
      setCurrentStepIndex(index);
      setTimeout(() => setStepPopAnimation(false), 300);
    }
  }, [steps.length]);

  const handleProcedureTitleChange = useCallback((title: string) => {
    setProcedureTitle(title);
    triggerSave();
  }, [triggerSave]);

  const handleUpdateStep = useCallback((updates: Partial<Step>) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const updatedStep = { ...newSteps[currentStepIndex], ...updates };
      
      // Clean up only truly empty title/description (only spaces or empty strings)
      // Allow placeholder text to persist so users can edit it
      if (updates.title !== undefined && updates.title.trim() === '') {
        updatedStep.title = undefined;
      }
      if (updates.description !== undefined && updates.description.trim() === '') {
        updatedStep.description = undefined;
      }
      
      newSteps[currentStepIndex] = updatedStep;
      return newSteps;
    });
    triggerSave();
  }, [currentStepIndex, triggerSave]);

  // Listen for messages back from the 3D scene iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      const { type } = e.data;

      if (type === 'twin-state-saved') {
        const { camera, hiddenParts, xrayParts } = e.data as { camera: any; hiddenParts: string[]; xrayParts: string[] };
        handleUpdateStep({ twinState: { camera, hiddenParts, xrayParts } });
      }

      if (type === 'animation-created') {
        const { animationId } = e.data as { animationId: string };
        handleUpdateStep({ hasAnimation: true, animationId });
      }

      if (type === 'animation-removed') {
        handleUpdateStep({ hasAnimation: false, animationId: null });
      }

      if (type === 'animation-editor-opened') {
        setIsAnimationEditorOpen(true);
      }

      if (type === 'animation-editor-closed') {
        setIsAnimationEditorOpen(false);
      }

      if (type === 'open-flow-settings') {
        // If we're in an iframe (preview mode), forward to parent
        if (window !== window.top) {
          window.parent.postMessage({ type: 'open-flow-settings' }, '*');
        } else {
          // Standalone: open in web context
          window.open(getWebSettingsUrl(procedureIdFromUrl), '_blank');
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handleUpdateStep]);

  // When step changes, restore twin state if saved
  useEffect(() => {
    if (currentStep.twinState) {
      postToScene({ type: 'restore-twin-state', ...currentStep.twinState });
    }
  }, [currentStepIndex, postToScene]); // intentionally depend on index, not step object

  // Demo definitions for procedure tutorials
  const procDemos = useMemo<Record<string, DemoFeature>>(() => ({
    'proc-twin-state': {
      id: 'proc-twin-state',
      name: 'Set State of a Digital Twin',
      steps: [
        {
          target: '[data-tutorial="toolbar"]',
          text: 'This is the <b>procedure toolbar</b>. It contains tools for digital twin state, animations, validation, and publishing.',
          pos: 'bottom',
          wait: 'observe',
        },
        {
          target: '[data-demo="twin-save"]',
          text: 'This is the <b>Save Twin Setup</b> button. It captures the current 3D scene — camera angle, part visibility, and X-Ray — and attaches it to this step.<br><br>Click it to open the state menu.',
          pos: 'bottom',
          wait: 'click',
        },
        {
          target: '[data-demo="twin-set"]',
          text: 'Click <b>Set State</b> to capture the current 3D view as this step\'s twin state.',
          pos: 'right',
          wait: 'click',
        },
        {
          target: '[data-demo="twin-save"]',
          text: 'The <b>accent dot</b> on the button confirms a twin state is saved. When users navigate to this step, the 3D scene will automatically restore this exact view.',
          pos: 'bottom',
          wait: 'observe',
        },
        {
          target: '[data-demo="twin-save"]',
          text: 'You can <b>update</b> the state by repeating the process, or <b>clear</b> it from the same menu. Twin state saves camera, visibility, and X-Ray settings per step — just like bookmarks.',
          pos: 'bottom',
          wait: 'observe',
        },
      ]
    },
  }), []);

  // Listen for demo start events from DebugMenu
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.featureId && procDemos[detail.featureId]) {
        setActiveDemo(procDemos[detail.featureId]);
      }
    };
    window.addEventListener('procedure-demo-start', handler);
    return () => window.removeEventListener('procedure-demo-start', handler);
  }, [procDemos]);

  // Listen for ToC feature flag from debug menu
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === 'set-toc-enabled') {
        setTocFeatureEnabled(detail.enabled);
        if (!detail.enabled) setShowTOC(false); // close TOC if flag turned off
      }
    };
    window.addEventListener('flow-debug', handler);
    return () => window.removeEventListener('flow-debug', handler);
  }, []);

  // Notify parent (DebugMenu) that procedure demos are available
  useEffect(() => {
    window.postMessage({
      type: 'procedureDemosAvailable',
      features: Object.values(procDemos).map(d => ({
        id: d.id, name: d.name, demoSteps: d.steps.length
      }))
    }, '*');
  }, [procDemos]);

  const handleAddTitle = useCallback(() => {
    console.log('handleAddTitle called, currentStep.title:', currentStep.title);
    if (!currentStep.title) {
      handleUpdateStep({ title: 'Enter step title here' });
    }
  }, [currentStep.title, handleUpdateStep]);

  const handleRemoveTitle = useCallback(() => {
    handleUpdateStep({ title: undefined });
  }, [handleUpdateStep]);

  const handleAddDescription = useCallback(() => {
    console.log('handleAddDescription called, currentStep.description:', currentStep.description);
    if (!currentStep.description) {
      handleUpdateStep({ description: 'Enter step description here' });
    }
  }, [currentStep.description, handleUpdateStep]);

  const handleRemoveDescription = useCallback(() => {
    handleUpdateStep({ description: undefined });
  }, [handleUpdateStep]);

  const handleAddAction = useCallback((actionName: string) => {
    const trimmedAction = actionName.trim();
    if (!trimmedAction) return;
    
    // Check for duplicates
    if (currentStep.actions.some(a => a.label === trimmedAction)) {
      appAlert('This option already exists.', { title: 'Duplicate Option', variant: 'warning' });
      return;
    }

    if (currentStep.actions.length >= 20) {
      appAlert('Maximum 20 options per step.', { title: 'Limit Reached', variant: 'warning' });
      return;
    }

    // No step limit

    // Create a new step for this action
    const newStep: Step = {
      id: crypto.randomUUID(),
      actions: [],
      color: 'var(--foreground)',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
      parentStepId: currentStep.id,
      parentActionIndex: currentStep.actions.length
    };

    const newAction: StepAction = {
      label: trimmedAction,
      nextStepId: newStep.id
    };

    setSteps(prev => [...prev, newStep]);
    handleUpdateStep({
      actions: [...currentStep.actions, newAction]
    });
  }, [currentStep, steps.length, handleUpdateStep]);

  const handleRemoveAction = useCallback((index: number) => {
    const actionToRemove = currentStep.actions[index];
    if (!actionToRemove) return;

    // Remove the step associated with this action
    const stepIdToRemove = actionToRemove.nextStepId;
    
    // Remove from steps array
    setSteps(prev => prev.filter(s => s.id !== stepIdToRemove));
    
    // Remove from selected action path
    setSelectedActionPath(prev => {
      const newMap = new Map(prev);
      newMap.delete(currentStep.id);
      return newMap;
    });

    // Remove the action
    handleUpdateStep({
      actions: currentStep.actions.filter((_, i) => i !== index)
    });
  }, [currentStep.actions, currentStep.id, handleUpdateStep]);

  const handleEditAction = useCallback((index: number, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const newActions = [...currentStep.actions];
    newActions[index] = { ...newActions[index], label: trimmed };
    handleUpdateStep({ actions: newActions });
  }, [currentStep.actions, handleUpdateStep]);

  const handleReorderActions = useCallback((fromIndex: number, toIndex: number) => {
    const newActions = [...currentStep.actions];
    const [movedItem] = newActions.splice(fromIndex, 1);
    newActions.splice(toIndex, 0, movedItem);
    handleUpdateStep({ actions: newActions });
  }, [currentStep.actions, handleUpdateStep]);

  const trackBlobUrl = useCallback((url: string) => {
    blobUrlsRef.current.add(url);
  }, []);

  const handleAddMediaFiles = useCallback((files: MediaFile[]) => {
    if (currentStep.mediaFiles.length + files.length > 10) {
      appAlert('Maximum 10 media files per step.', { title: 'Limit Reached', variant: 'warning' });
      return;
    }

    files.forEach(file => {
      if (file.url.startsWith('blob:')) {
        trackBlobUrl(file.url);
      }
    });

    const newMediaFiles = [...currentStep.mediaFiles, ...files];
    handleUpdateStep({ 
      mediaFiles: newMediaFiles,
      thumbnailUrl: newMediaFiles[0]?.url || currentStep.thumbnailUrl,
      mediaUrl: newMediaFiles[0]?.url || currentStep.mediaUrl
    });
  }, [currentStep.mediaFiles, currentStep.thumbnailUrl, currentStep.mediaUrl, handleUpdateStep, trackBlobUrl]);

  const handleRemoveMediaFile = useCallback((id: string) => {
    const fileToRemove = currentStep.mediaFiles.find(f => f.id === id);
    if (fileToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url);
      blobUrlsRef.current.delete(fileToRemove.url);
    }

    const newMediaFiles = currentStep.mediaFiles.filter(f => f.id !== id);
    handleUpdateStep({ 
      mediaFiles: newMediaFiles,
      thumbnailUrl: newMediaFiles[0]?.url,
      mediaUrl: newMediaFiles[0]?.url
    });
  }, [currentStep.mediaFiles, handleUpdateStep]);

  const handleReorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    const newMediaFiles = [...currentStep.mediaFiles];
    const [movedItem] = newMediaFiles.splice(fromIndex, 1);
    newMediaFiles.splice(toIndex, 0, movedItem);
    handleUpdateStep({ 
      mediaFiles: newMediaFiles,
      thumbnailUrl: newMediaFiles[0]?.url,
      mediaUrl: newMediaFiles[0]?.url
    });
  }, [currentStep.mediaFiles, handleUpdateStep]);

  const handleChangeColor = useCallback((color: string) => {
    handleUpdateStep({ color });
  }, [handleUpdateStep]);

  const handleToggleAnimation = useCallback(() => {
    handleUpdateStep({ hasAnimation: !currentStep.hasAnimation });
  }, [currentStep.hasAnimation, handleUpdateStep]);

  const handleAddPopup = useCallback((popup: Popup) => {
    if (currentStep.popups.length >= 10) {
      appAlert('Maximum 10 popups per step.', { title: 'Limit Reached', variant: 'warning' });
      return;
    }

    handleUpdateStep({
      popups: [...currentStep.popups, popup]
    });
  }, [currentStep.popups, handleUpdateStep]);

  const handleUpdatePopup = useCallback((id: string, updates: Partial<Popup>) => {
    handleUpdateStep({
      popups: currentStep.popups.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  }, [currentStep.popups, handleUpdateStep]);

  const handleRemovePopup = useCallback((id: string) => {
    const popupToDelete = currentStep.popups.find(p => p.id === id);
    if (!popupToDelete) return;

    // Store for undo
    setDeletedPopup({ popup: popupToDelete, stepIndex: currentStepIndex });
    setShowUndoPopupNotification(true);

    // Remove popup immediately
    handleUpdateStep({
      popups: currentStep.popups.filter(p => p.id !== id)
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowUndoPopupNotification(false);
      setDeletedPopup(null);
    }, 5000);
  }, [currentStep.popups, handleUpdateStep, currentStepIndex]);

  const handleUndoPopupDelete = useCallback(() => {
    if (!deletedPopup) return;

    // Restore popup to the step
    const targetStep = steps[deletedPopup.stepIndex];
    if (targetStep) {
      const updatedSteps = [...steps];
      updatedSteps[deletedPopup.stepIndex] = {
        ...targetStep,
        popups: [...targetStep.popups, deletedPopup.popup]
      };
      setSteps(updatedSteps);
    }

    setShowUndoPopupNotification(false);
    setDeletedPopup(null);
  }, [deletedPopup, steps]);

  // Validation handlers
  const handleAddValidation = useCallback(() => {
    const newValidation: Validation = {
      id: crypto.randomUUID(),
      checkpoints: []
    };
    handleUpdateStep({ validation: newValidation });
  }, [handleUpdateStep]);

  const handleAddCheckpoint = useCallback(() => {
    if (!currentStep.validation) return;
    const checkpoints = currentStep.validation.checkpoints;
    if (checkpoints.length >= 10) return;

    const newCheckpoint: Checkpoint = {
      id: crypto.randomUUID(),
      type: 'visual',
      severity: 'warning',
      label: '',
      selectedParts: [],
      passState: { description: '', mediaFiles: [] },
      failState: { description: '', mediaFiles: [] },
      sequenceOrder: checkpoints.length
    };

    handleUpdateStep({
      validation: {
        ...currentStep.validation,
        checkpoints: [...checkpoints, newCheckpoint]
      }
    });
    setActiveCheckpointId(newCheckpoint.id);
  }, [currentStep.validation, handleUpdateStep]);

  const handleUpdateCheckpoint = useCallback((checkpointId: string, updates: Partial<Checkpoint>) => {
    if (!currentStep.validation) return;

    handleUpdateStep({
      validation: {
        ...currentStep.validation,
        checkpoints: currentStep.validation.checkpoints.map(cp =>
          cp.id === checkpointId ? { ...cp, ...updates } : cp
        )
      }
    });
  }, [currentStep.validation, handleUpdateStep]);

  const handleRemoveCheckpoint = useCallback((checkpointId: string) => {
    if (!currentStep.validation) return;

    const newCheckpoints = currentStep.validation.checkpoints.filter(cp => cp.id !== checkpointId);
    handleUpdateStep({
      validation: {
        ...currentStep.validation,
        checkpoints: newCheckpoints
      }
    });
    if (activeCheckpointId === checkpointId) {
      setActiveCheckpointId(null);
    }
  }, [currentStep.validation, handleUpdateStep, activeCheckpointId]);

  const handleReorderCheckpoints = useCallback((newOrder: Checkpoint[]) => {
    if (!currentStep.validation) return;

    handleUpdateStep({
      validation: {
        ...currentStep.validation,
        checkpoints: newOrder.map((cp, i) => ({ ...cp, sequenceOrder: i }))
      }
    });
  }, [currentStep.validation, handleUpdateStep]);

  const handleRemoveValidation = useCallback(() => {
    handleUpdateStep({
      validation: undefined
    });
    setActiveCheckpointId(null);
  }, [handleUpdateStep]);

  const handleSelectPartsForValidation = useCallback((
    callback: (parts: string[]) => void
  ) => {
    // Enter part selection mode
    setIsSelectingValidationParts(true);
    setTempSelectedParts([]);
    
    // Store the callback for when user confirms selection
    window.__validationPartsCallback = callback;
  }, []);

  const handleConfirmPartSelection = useCallback(() => {
    console.log('Confirming part selection. tempSelectedParts:', tempSelectedParts);
    // Call the callback with selected parts
    if (window.__validationPartsCallback) {
      console.log('Calling validation callback with parts:', tempSelectedParts);
      window.__validationPartsCallback(tempSelectedParts);
      delete window.__validationPartsCallback;
    } else {
      console.log('ERROR: No validation callback found');
    }
    
    // Exit selection mode and reopen the validation panel
    setIsSelectingValidationParts(false);
    setTempSelectedParts([]);
    setShowValidationPanel(true);
  }, [tempSelectedParts]);

  const handleCancelPartSelection = useCallback(() => {
    // Cancel selection
    if (window.__validationPartsCallback) {
      delete window.__validationPartsCallback;
    }
    
    setIsSelectingValidationParts(false);
    setTempSelectedParts([]);
    setShowValidationPanel(true);
  }, []);

  const handleSetArrowDirectionForValidation = useCallback((
    callback: (direction: { x: number; y: number; z: number }) => void
  ) => {
    // Enter arrow direction mode
    setIsSettingArrowDirection(true);
    setShowValidationPanel(false);
    
    // Store the callback for when user confirms direction
    setArrowDirectionCallback(() => callback);
  }, []);

  const handleConfirmArrowDirection = useCallback((direction: { x: number; y: number; z: number }) => {
    // Call the callback with the arrow direction (or use the temp one if provided)
    const finalDirection = direction || tempArrowDirection;
    if (arrowDirectionCallback && finalDirection) {
      arrowDirectionCallback(finalDirection);
      setArrowDirectionCallback(null);
    }
    
    // Exit arrow direction mode and reopen the validation panel
    setIsSettingArrowDirection(false);
    setTempArrowDirection(null);
    setShowValidationPanel(true);
  }, [arrowDirectionCallback, tempArrowDirection]);

  const handleCancelArrowDirection = useCallback(() => {
    // Cancel arrow direction setting
    setArrowDirectionCallback(null);
    setIsSettingArrowDirection(false);
    setTempArrowDirection(null);
    setShowValidationPanel(true);
  }, []);

  const handlePartClick = useCallback((partName: string) => {
    if (!isSelectingValidationParts) return;
    
    console.log('Part clicked:', partName);
    setTempSelectedParts(prev => {
      if (prev.includes(partName)) {
        // Remove if already selected
        const updated = prev.filter(p => p !== partName);
        console.log('Part removed. Updated list:', updated);
        return updated;
      } else {
        // Add if not selected
        const updated = [...prev, partName];
        console.log('Part added. Updated list:', updated);
        return updated;
      }
    });
  }, [isSelectingValidationParts]);

  const handleAddStep = useCallback(() => {
    // No step limit

    // Find the last visible step in the current flow
    const findLastVisibleStep = (stepId: string): Step => {
      const step = steps.find(s => s.id === stepId);
      if (!step) return currentStep;

      // If this step has actions and one is selected, follow that path
      if (step.actions.length > 0) {
        const selectedActionIndex = selectedActionPath.get(step.id);
        
        if (selectedActionIndex !== undefined && step.actions[selectedActionIndex]) {
          const selectedAction = step.actions[selectedActionIndex];
          return findLastVisibleStep(selectedAction.nextStepId);
        } else {
          // Has actions but none selected, check for linear next step
          const linearNext = steps.find(s => 
            s.parentStepId === step.id && s.parentActionIndex === undefined
          );
          if (linearNext) {
            return findLastVisibleStep(linearNext.id);
          }
        }
      } else {
        // No actions, check for linear next step
        const linearNext = steps.find(s => 
          s.parentStepId === step.id && s.parentActionIndex === undefined
        );
        if (linearNext) {
          return findLastVisibleStep(linearNext.id);
        }
      }

      // No more children, this is the last visible step
      return step;
    };

    // Find the root step and traverse to find the last visible step
    const rootStep = steps.find(s => !s.parentStepId);
    const lastVisibleStep = rootStep ? findLastVisibleStep(rootStep.id) : currentStep;

    // Check if the last visible step already has a linear next step
    const existingLinearNext = steps.find(s => 
      s.parentStepId === lastVisibleStep.id && s.parentActionIndex === undefined
    );

    const newStep: Step = {
      id: crypto.randomUUID(),
      actions: [],
      color: 'var(--foreground)',
      hasAnimation: false,
      popups: [],
      mediaFiles: [],
      parentStepId: lastVisibleStep.id,
      parentActionIndex: undefined // Linear continuation
    };
    
    setShowNewStepAnimation(true);
    setStepPopAnimation(true);
    setFlashStepShadow(true);
    
    // If there's an existing linear next step, we need to insert the new step between last visible and existing
    if (existingLinearNext) {
      setSteps(prev => {
        // Update the existing linear next step to point to the new step instead
        const updatedSteps = prev.map(s => 
          s.id === existingLinearNext.id 
            ? { ...s, parentStepId: newStep.id, parentActionIndex: undefined }
            : s
        );
        // Add the new step
        return [...updatedSteps, newStep];
      });
    } else {
      // No existing linear next step, just add the new step
      setSteps(prev => [...prev, newStep]);
    }
    
    // Navigate to new step
    const newIndex = steps.length;
    setCurrentStepIndex(newIndex);
    
    setTimeout(() => {
      setShowNewStepAnimation(false);
      setStepPopAnimation(false);
      setFlashStepShadow(false);
    }, 100);
    
    triggerSave();
  }, [steps, currentStep, selectedActionPath, triggerSave]);

  const handleDeleteStep = useCallback(() => {
    if (steps.length <= 1) {
      return; // Silently prevent deletion of last step
    }
    
    const stepToDelete = currentStep;
    const index = currentStepIndex;
    
    // Store deleted step for undo
    setDeletedStep({ step: stepToDelete, index });
    setShowUndoNotification(true);

    // Reconnect the chain: update steps to bypass the deleted step
    setSteps(prev => {
      const updatedSteps = prev.map(step => {
        // If this step's parent is the deleted step (linear connection), reconnect to deleted step's parent
        if (step.parentStepId === stepToDelete.id && step.parentActionIndex === undefined) {
          return {
            ...step,
            parentStepId: stepToDelete.parentStepId,
            parentActionIndex: stepToDelete.parentActionIndex
          };
        }
        
        // Update any actions that point to the deleted step to point to its next step instead
        if (step.actions.length > 0) {
          const updatedActions = step.actions.map(action => {
            if (action.nextStepId === stepToDelete.id) {
              // Find what the deleted step was pointing to
              const deletedStepNext = prev.find(s => 
                (s.parentStepId === stepToDelete.id && s.parentActionIndex === undefined) ||
                stepToDelete.nextStepId === s.id
              );
              return {
                ...action,
                nextStepId: deletedStepNext?.id || action.nextStepId
              };
            }
            return action;
          });
          
          if (updatedActions !== step.actions) {
            return { ...step, actions: updatedActions };
          }
        }
        
        return step;
      });
      
      // Remove the deleted step
      return updatedSteps.filter((_, i) => i !== index);
    });
    
    // Go to previous step or first step after deletion
    setCurrentStepIndex(Math.max(0, index - 1));
    
    triggerSave();
    
    // Auto-hide undo notification after 5 seconds and cleanup blobs
    setTimeout(() => {
      setShowUndoNotification(false);
      
      // Cleanup media blob URLs if step wasn't restored
      setTimeout(() => {
        if (deletedStep?.step.mediaFiles) {
          deletedStep.step.mediaFiles.forEach(file => {
            if (file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
              blobUrlsRef.current.delete(file.url);
            }
          });
        }
        setDeletedStep(null);
      }, 500);
    }, 5000);
  }, [steps, currentStepIndex, currentStep, deletedStep, triggerSave]);

  const handleUndoDelete = useCallback(() => {
    if (!deletedStep) return;
    
    // Restore the deleted step at its original position
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps.splice(deletedStep.index, 0, deletedStep.step);
      return newSteps;
    });
    setCurrentStepIndex(deletedStep.index);
    setDeletedStep(null);
    setShowUndoNotification(false);
  }, [deletedStep]);

  // Handle option/action selection in TOC
  const handleActionSelect = useCallback((stepIndex: number, actionIndex: number) => {
    const step = steps[stepIndex];
    if (!step || !step.actions[actionIndex]) return;

    const previouslySelectedAction = selectedActionPath.get(step.id);
    
    // If selecting a different option, clear selections for descendant steps in old branches
    if (previouslySelectedAction !== undefined && previouslySelectedAction !== actionIndex) {
      // Build a set of all descendant step IDs from the old branch
      const getDescendants = (stepId: string): Set<string> => {
        const descendants = new Set<string>();
        const queue = [stepId];
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          descendants.add(currentId);
          
          const currentStep = steps.find(s => s.id === currentId);
          if (!currentStep) continue;
          
          // Add children from actions
          currentStep.actions.forEach(action => {
            if (!descendants.has(action.nextStepId)) {
              queue.push(action.nextStepId);
            }
          });
          
          // Add linear children
          steps.forEach(s => {
            if (s.parentStepId === currentId && !descendants.has(s.id)) {
              queue.push(s.id);
            }
          });
        }
        
        return descendants;
      };
      
      const oldBranchStepId = step.actions[previouslySelectedAction].nextStepId;
      const oldBranchDescendants = getDescendants(oldBranchStepId);
      
      // Clear selections only for old branch descendants, keep the steps
      const newSelectionMap = new Map<string, number>();
      selectedActionPath.forEach((value, key) => {
        if (!oldBranchDescendants.has(key)) {
          newSelectionMap.set(key, value);
        }
      });
      
      // Add new selection
      newSelectionMap.set(step.id, actionIndex);
      setSelectedActionPath(newSelectionMap);
    } else {
      // Just store the selected action path (first time selection or same option)
      setSelectedActionPath(prev => {
        const newMap = new Map(prev);
        newMap.set(step.id, actionIndex);
        return newMap;
      });
    }

    // Navigate to the step linked to this action
    const targetStepId = step.actions[actionIndex].nextStepId;
    const targetStepIndex = steps.findIndex(s => s.id === targetStepId);
    if (targetStepIndex !== -1) {
      handleStepChange(targetStepIndex);
    }
  }, [steps, selectedActionPath, handleStepChange, currentStepIndex]);

  // Handle "Next" button click with branching logic
  const handleNext = useCallback(() => {
    // Check for custom step connection first
    if (currentStep.nextStepId) {
      const targetStepIndex = steps.findIndex(s => s.id === currentStep.nextStepId);
      if (targetStepIndex !== -1) {
        handleStepChange(targetStepIndex);
        return;
      }
    }

    // If current step has actions
    if (currentStep.actions.length > 0) {
      const selectedActionIndex = selectedActionPath.get(currentStep.id);
      
      // If an action was selected, navigate to that step
      if (selectedActionIndex !== undefined) {
        const targetStepId = currentStep.actions[selectedActionIndex].nextStepId;
        const targetStepIndex = steps.findIndex(s => s.id === targetStepId);
        if (targetStepIndex !== -1) {
          handleStepChange(targetStepIndex);
          return;
        }
      }
      
      // No action selected, go to first action's step and mark it as selected
      const firstActionStepId = currentStep.actions[0].nextStepId;
      const firstActionStepIndex = steps.findIndex(s => s.id === firstActionStepId);
      if (firstActionStepIndex !== -1) {
        // Mark first action as selected in the path
        setSelectedActionPath(prev => {
          const newMap = new Map(prev);
          newMap.set(currentStep.id, 0);
          return newMap;
        });
        handleStepChange(firstActionStepIndex);
        return;
      }
    }
    
    // No actions, find the linear next step or create one
    const linearNextStep = steps.find(s => 
      s.parentStepId === currentStep.id && s.parentActionIndex === undefined
    );
    
    if (linearNextStep) {
      const nextIndex = steps.findIndex(s => s.id === linearNextStep.id);
      if (nextIndex !== -1) {
        handleStepChange(nextIndex);
      }
    } else {
      // No next step exists, create one
      handleAddStep();
    }
  }, [currentStep, steps, selectedActionPath, handleStepChange, handleAddStep]);

  // Handle "Previous" button click - only navigate through visible steps in TOC
  const handlePrevious = useCallback(() => {
    console.log('handlePrevious called');
    // Get the visible steps based on current selected action path
    const visibleSteps = getOrderedSteps();
    
    // Find current step in visible steps
    const currentVisibleIndex = visibleSteps.findIndex(s => s.id === currentStep.id);
    
    if (currentVisibleIndex > 0) {
      // Go to previous step in visible flow
      const previousVisibleStep = visibleSteps[currentVisibleIndex - 1];
      const previousStepIndex = steps.findIndex(s => s.id === previousVisibleStep.id);
      
      if (previousStepIndex !== -1) {
        handleStepChange(previousStepIndex);
      }
    }
  }, [currentStep, steps, getOrderedSteps, handleStepChange]);

  // Handle restart - navigate back to first step
  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setSelectedActionPath(new Map());
    setStepPopAnimation(true);
    setTimeout(() => setStepPopAnimation(false), 300);
  }, []);

  // Handle back - go back to previous context (3D viewer, projects, etc.)
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/knowledgebase');
    }
  }, [navigate]);

  // Handle open flow editor - open KB page with canvas param in a new tab
  const handleOpenFlowEditor = useCallback(() => {
    const currentPath = window.location.pathname;
    const match = currentPath.match(/procedure-editor\/([^/]+)/);
    const procedureId = match ? match[1] : 'default';
    window.open(`/web/project/915-i-series/knowledgebase?canvas=${procedureId}`, '_blank');
  }, []);

  const handleDeleteStepByIndex = useCallback((index: number) => {
    if (steps.length <= 1) {
      return; // Silently prevent deletion of last step
    }
    
    const stepToDelete = steps[index];
    
    // Store deleted step for undo
    setDeletedStep({ step: stepToDelete, index });
    setShowUndoNotification(true);

    // Reconnect the chain: update steps to bypass the deleted step
    setSteps(prev => {
      const updatedSteps = prev.map(step => {
        // If this step's parent is the deleted step (linear connection), reconnect to deleted step's parent
        if (step.parentStepId === stepToDelete.id && step.parentActionIndex === undefined) {
          return {
            ...step,
            parentStepId: stepToDelete.parentStepId,
            parentActionIndex: stepToDelete.parentActionIndex
          };
        }
        
        // Update any actions that point to the deleted step to point to its next step instead
        if (step.actions.length > 0) {
          const updatedActions = step.actions.map(action => {
            if (action.nextStepId === stepToDelete.id) {
              // Find what the deleted step was pointing to
              const deletedStepNext = prev.find(s => 
                (s.parentStepId === stepToDelete.id && s.parentActionIndex === undefined) ||
                stepToDelete.nextStepId === s.id
              );
              return {
                ...action,
                nextStepId: deletedStepNext?.id || action.nextStepId
              };
            }
            return action;
          });
          
          if (updatedActions !== step.actions) {
            return { ...step, actions: updatedActions };
          }
        }
        
        return step;
      });
      
      // Remove the deleted step
      return updatedSteps.filter((_, i) => i !== index);
    });
    
    // Adjust current step index if needed
    if (currentStepIndex === index) {
      setCurrentStepIndex(Math.max(0, index - 1));
    } else if (currentStepIndex > index) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
    
    triggerSave();
    
    // Auto-hide undo notification after 5 seconds and cleanup blobs
    setTimeout(() => {
      setShowUndoNotification(false);
      
      // Cleanup media blob URLs if step wasn't restored
      setTimeout(() => {
        if (deletedStep?.step.mediaFiles) {
          deletedStep.step.mediaFiles.forEach(file => {
            if (file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
              blobUrlsRef.current.delete(file.url);
            }
          });
        }
        setDeletedStep(null);
      }, 500);
    }, 5000);
  }, [steps, currentStepIndex, deletedStep, triggerSave]);

  const handlePublish = useCallback((version: string, changelog?: string) => {
    const publishData: PublishInfo = {
      version,
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      changelog
    };
    
    setPublishInfo(publishData);
    triggerSave();
  }, [triggerSave]);

  // Context menu handlers
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // Don't show context menu in AR mode
    if (isARMode || showARPlacement) {
      return;
    }

    event.preventDefault();
    
    // If context menu is already open, close it and open new one
    if (contextMenu) {
      setContextMenu(null);
      // Small delay before opening new menu
      setTimeout(() => {
        setContextMenu({ x: event.clientX, y: event.clientY });
      }, 50);
    } else {
      setContextMenu({ x: event.clientX, y: event.clientY });
    }
  }, [isARMode, showARPlacement, contextMenu]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleResetAllParts = useCallback(() => {
    console.log('Reset all parts');
    // TODO: Implement reset all parts functionality
    // This would reset visibility/transforms of all 3D parts
  }, []);

  const handleHide = useCallback(() => {
    console.log('Hide selected parts');
    // TODO: Implement hide functionality
    // This would hide selected 3D parts
  }, []);

  const handleIsolate = useCallback(() => {
    console.log('Isolate selected parts');
    // TODO: Implement isolate functionality
    // This would hide all parts except selected ones
  }, []);

  const handleStartTutorial = useCallback(async () => {
    // Check if screen is too small
    if (window.innerWidth < 768) {
      const ok = await appConfirm('Tutorial is best viewed on larger screens. Continue anyway?', { title: 'Small Screen', variant: 'warning' });
      if (!ok) return;
    }

    // Only start if editing is enabled
    if (!editingEnabled) {
      appAlert('Please enable editing mode to view the tutorial.', { title: 'Editing Required', variant: 'info' });
      return;
    }

    setShowTutorial(true);
  }, [editingEnabled, appAlert, appConfirm]);

  // Sample object targets for AR placement
  const availableTargets: ObjectTarget[] = useMemo(() => [
    {
      id: 'target-1',
      name: 'Laptop Base',
      previewUrl: 'https://images.unsplash.com/photo-1712698137596-15ea82027b55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMHRvcCUyMHZpZXd8ZW58MXx8fHwxNzcwODA2MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      subTargets: [
        { 
          id: 'sub-1', 
          name: 'Keyboard Area',
          previewUrl: 'https://images.unsplash.com/photo-1570944891413-e09ccc306147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGtleWJvYXJkJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA4MDYwMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        { 
          id: 'sub-2', 
          name: 'Touchpad Area',
          previewUrl: 'https://images.unsplash.com/photo-1768561327873-206fe9c43b93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjB0b3VjaHBhZCUyMGNsb3NldXB8ZW58MXx8fHwxNzcwODA2MDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      ]
    },
    {
      id: 'target-2',
      name: 'Monitor Stand',
      previewUrl: 'https://images.unsplash.com/photo-1705747075445-9b93f4d0984f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25pdG9yJTIwc3RhbmQlMjBkZXNrfGVufDF8fHx8MTc3MDgwNjAzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'target-3',
      name: 'Desktop Surface',
      previewUrl: 'https://images.unsplash.com/photo-1596347909509-5ea01fb4b278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBkZXNrJTIwc3VyZmFjZXxlbnwxfHx8fDE3NzA4MDYwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ], []);

  // AR Mode handlers
  const handleEnterAR = useCallback(() => {
    if (isARMode) {
      // Already in AR mode, toggle it off
      setIsARMode(false);
      setShowARPlacement(false);
      triggerSave();
    } else {
      // First time entering AR, show placement flow to set up
      setShowARPlacement(true);
    }
  }, [isARMode, triggerSave]);

  const handleARPlacementComplete = useCallback((method: PlacementMethod) => {
    console.log('AR placement complete with method:', method);
    setIsARMode(true);
    setShowARPlacement(false);
    triggerSave();
  }, [triggerSave]);

  const handleARPlacementCancel = useCallback(() => {
    console.log('AR placement cancelled');
    setShowARPlacement(false);
    setIsARMode(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        e.preventDefault();
        handleStepChange(currentStepIndex - 1);
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        e.preventDefault();
        handleStepChange(currentStepIndex + 1);
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowPopupPanel(false);
        setShowValidationPanel(false);
        setShowOptionsManager(false);
        setShowBookmarks(false);
        setShowPartsCatalog(false);
        setShowTutorial(false);
        setShowARPlacement(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps, isTtsEnabled, publishInfo, handleStepChange]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
      {/* Save Indicator - Hidden on /mobile path and during animation editing */}
      {!isMobilePath && !isAnimationEditorOpen && <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />}
      
      <div
        className="h-full w-full relative overflow-hidden"
        onContextMenu={handleContextMenu}
        style={{
          background: isARMode 
            ? 'url(https://images.unsplash.com/photo-1764114441123-586d13fc6ece?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjdG9yeSUyMGZsb29yJTIwY2FtZXJhJTIwdmlld3xlbnwxfHx8fDE3NzA4MTUwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral) center/cover'
            : 'linear-gradient(to bottom, #4362aa, #00091d)'
        }}
      >
        <div className="content-stretch flex flex-col items-center justify-center overflow-clip py-2 sm:py-2 relative size-full">
          {/* 3D Scene - Embedded from external server */}
          {!showARPlacement && (
            <iframe
              ref={sceneIframeRef}
              src={`${import.meta.env.BASE_URL}app/digital-twin-scene.html?embedded=true&mode=procedure`}
              className="absolute inset-0 w-full h-full border-0"
              style={{ zIndex: 0 }}
              title="3D Scene"
              allow="autoplay; fullscreen"
            />
          )}

          {/* Header - Only show when editing is enabled and not during AR placement or animation editing */}
          {editingEnabled && !showARPlacement && !isAnimationEditorOpen && (
            <Header
              hasAnimation={currentStep.hasAnimation}
              hasTwinState={!!currentStep.twinState}
              onOpenSettings={() => {
                // If embedded in an iframe (preview mode), forward to parent
                if (window !== window.top) {
                  window.parent.postMessage({ type: 'open-flow-settings' }, '*');
                } else {
                  // Standalone: open in web context
                  window.open(getWebSettingsUrl(procedureIdFromUrl), '_blank');
                }
              }}
              onOpenBookmarks={() => {
                postToScene({ type: 'toggle-bookmarks' });
                // Workaround: the iframe's toggle-bookmarks handler calls a non-existent
                // renderBookmarks() instead of renderBookmarksList(). Clicking the active
                // tab in the iframe re-triggers the correct render function.
                setTimeout(() => {
                  try {
                    const tab = sceneIframeRef.current?.contentDocument?.querySelector('.bk-tab.active') as HTMLElement;
                    if (tab) tab.click();
                  } catch { /* cross-origin guard */ }
                }, 150);
              }}
              onTogglePartsCatalog={() => postToScene({ type: 'toggle-parts-catalog' })}
              isPartsCatalogOpen={false}
              onOpenPublish={() => setShowPublish(true)}
              onOpenValidation={() => setShowValidationPanel(true)}
              checkpointCount={currentStep.validation?.checkpoints?.length ?? 0}
              hasCritical={currentStep.validation?.checkpoints?.some(cp => cp.severity === 'critical') ?? false}
              onAnimate={() => {
                // Open the Animation Builder editor overlay
                setIsAnimationEditorOpen(true);
              }}
              onSaveTwinState={() => postToScene({ type: 'capture-twin-state' })}
              onClearTwinState={() => handleUpdateStep({ twinState: null })}
              onToggleHotspots={() => setShowHotspotsPanel(!showHotspotsPanel)}
              isHotspotsPanelOpen={showHotspotsPanel}
              hotspotCount={7}
            />
          )}

          {/* Part Selection Banner - Shows when selecting validation parts */}
          {isSelectingValidationParts && editingEnabled && !showARPlacement && !isAnimationEditorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 rounded-lg flex flex-col w-[calc(100vw-32px)] sm:w-auto"
              style={{
                backgroundColor: 'var(--primary)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                gap: 'var(--spacing-md)',
                boxShadow: 'var(--elevation-lg)',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                maxWidth: '600px'
              }}
            >
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--spacing-lg)' }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  <div>\n                    <p 
                      style={{
                        fontSize: 'var(--text-sm)',
                        
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'white',
                        margin: 0
                      }}
                    >
                      Select Validation Parts
                    </p>
                    <p 
                      style={{
                        fontSize: 'var(--text-xs)',
                        
                        fontWeight: 'var(--font-weight-normal)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: 0
                      }}
                    >
                      {tempSelectedParts.length === 0 
                        ? 'Click parts in the 3D viewer' 
                        : `Selected: ${tempSelectedParts.join(', ')}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <button
                    onClick={handleCancelPartSelection}
                    className="rounded-lg transition-all"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPartSelection}
                    className="rounded-lg transition-all"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'white',
                      color: 'var(--primary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Set Selected Parts
                  </button>
                </div>
              </div>
              
              {/* Selected Parts Display */}
              {tempSelectedParts.length > 0 ? (
                <div 
                  className="rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: 'var(--spacing-md)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'white',
                      margin: '0 0 var(--spacing-xs) 0'
                    }}
                  >
                    Selected Parts ({tempSelectedParts.length})
                  </p>
                  <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
                    {tempSelectedParts.map((partName, index) => (
                      <span
                        key={index}
                        className="rounded-full flex items-center"
                        style={{
                          fontSize: 'var(--text-xs)',
                          
                          fontWeight: 'var(--font-weight-medium)',
                          backgroundColor: 'white',
                          color: 'var(--primary)',
                          padding: '4px var(--spacing-sm)',
                          gap: 'var(--spacing-xs)'
                        }}
                      >
                        {partName}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePartClick(partName);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--primary)',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div 
                  className="rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: 'var(--spacing-md)',
                    border: '1px dashed rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      
                      fontWeight: 'var(--font-weight-normal)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: 0
                    }}
                  >
                    No parts selected yet
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Arrow Direction Setting Banner - shown when setting arrow direction */}
          {isSettingArrowDirection && !isMobileView && !isAnimationEditorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 rounded-lg flex flex-col w-[calc(100vw-32px)] sm:w-auto"
              style={{
                backgroundColor: 'var(--primary)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                gap: 'var(--spacing-md)',
                boxShadow: 'var(--elevation-lg)',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                maxWidth: '600px'
              }}
            >
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--spacing-lg)' }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  <div>
                    <p 
                      style={{
                        fontSize: 'var(--text-sm)',
                        
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'white',
                        margin: 0
                      }}
                    >
                      Set Arrow Direction
                    </p>
                    <p 
                      style={{
                        fontSize: 'var(--text-xs)',
                        
                        fontWeight: 'var(--font-weight-normal)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: 0
                      }}
                    >
                      Rotate the arrow in the 3D viewer to set direction
                    </p>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <button
                    onClick={handleCancelArrowDirection}
                    className="rounded-lg transition-all"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => tempArrowDirection && handleConfirmArrowDirection(tempArrowDirection)}
                    disabled={!tempArrowDirection}
                    className="rounded-lg transition-all"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: tempArrowDirection ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      color: 'var(--primary)',
                      border: 'none',
                      cursor: tempArrowDirection ? 'pointer' : 'not-allowed',
                      fontSize: 'var(--text-sm)',
                      
                      fontWeight: 'var(--font-weight-bold)',
                      opacity: tempArrowDirection ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (tempArrowDirection) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
              
              {/* Current Direction Display */}
              {tempArrowDirection && (
                <div 
                  className="rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: 'var(--spacing-md)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'white',
                      margin: '0 0 var(--spacing-xs) 0'
                    }}
                  >
                    Current Direction
                  </p>
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      margin: 0,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    X: {tempArrowDirection.x.toFixed(2)}, Y: {tempArrowDirection.y.toFixed(2)}, Z: {tempArrowDirection.z.toFixed(2)}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Spacer - Only show when not in AR placement or animation editing and not topleft layout */}
          {!showARPlacement && !isAnimationEditorOpen && panelLayout !== 'topleft' && (
            <div className="flex-[1_0_0] min-h-px min-w-px w-full" />
          )}

          {/* Conditional rendering: AR Placement Flow or Procedure Panel with Media Viewer (hidden during animation editing) */}
          {isAnimationEditorOpen ? null : showARPlacement ? (
            // AR Placement Flow in full screen
            <ARPlacementFlow
              onComplete={handleARPlacementComplete}
              onCancel={handleARPlacementCancel}
              availableTargets={availableTargets}
            />
          ) : (
            <div className={panelLayout === 'topleft'
              ? 'absolute top-3 left-3 z-10'
              : 'w-full flex justify-center relative z-10 px-4 sm:px-0'
            } style={panelLayout === 'topleft' ? { height: 'calc(100% - 24px)', pointerEvents: 'none' } : undefined}>
                {/* Step card */}
                <ProcedurePanel
                  layout={panelLayout || undefined}
                  step={currentStep}
                  stepIndex={tocDisplayNumber - 1}
                  totalSteps={tocTotalSteps}
                  isTtsEnabled={isTtsEnabled}
                  onStepChange={handleStepChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onUpdateStep={handleUpdateStep}
                  onToggleTts={() => setIsTtsEnabled(!isTtsEnabled)}
                  onAddTitle={handleAddTitle}
                  onRemoveTitle={handleRemoveTitle}
                  onAddDescription={handleAddDescription}
                  onRemoveDescription={handleRemoveDescription}
                  onRemoveAction={handleRemoveAction}
                  onAddStep={handleAddStep}
                  onDeleteStep={handleDeleteStep}
                  popups={currentStep.popups}
                  onRemovePopup={handleRemovePopup}
                  onAddPopup={handleAddPopup}
                  onShowPopupPanel={() => setShowPopupPanel(true)}
                  editingEnabled={editingEnabled}
                  showNewStepAnimation={showNewStepAnimation}
                  stepPopAnimation={stepPopAnimation}
                  flashStepShadow={flashStepShadow}
                  allSteps={steps}
                  onToggleTOC={() => { if (tocFeatureEnabled) setShowTOC(!showTOC); }}
                  tocEnabled={tocFeatureEnabled}
                  isTOCOpen={showTOC}
                  isFirstVisibleStep={isFirstVisibleStep}
                  onChangeColor={handleChangeColor}
                  onAddAction={handleAddAction}
                  onEditAction={handleEditAction}
                  onRestart={handleRestart}
                  onBack={handleBack}
                  onOpenFlowEditor={handleOpenFlowEditor}
                  checkpointCount={currentStep.validation?.checkpoints?.length ?? 0}
                  hasCritical={currentStep.validation?.checkpoints?.some(cp => cp.severity === 'critical') ?? false}
                  onOpenValidation={() => setShowValidationPanel(true)}
                />

                {/* GAP 4 (FR59): Animation-config incompatibility warning in viewer mode */}
                {!editingEnabled && currentStep.hasAnimation && currentStep.configurationId && activeConfigName && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg pointer-events-auto"
                    style={{
                      top: '-36px',
                      padding: '6px 14px',
                      backgroundColor: 'rgba(255, 152, 0, 0.92)',
                      color: 'white',
                      fontSize: '12px',
                      
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 20,
                      maxWidth: '480px',
                    }}
                  >
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>Some parts in this step may not be visible with the current configuration.</span>
                  </div>
                )}

                {/* Configuration is set at the digital twin level, not per-step.
                   Cannot change configuration mid-procedure. */}

                {/* GAP 7 (FR58): Config-filtered options note in viewer mode */}
                {!editingEnabled && activeConfigName && currentStep.actions.length > 1 && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
                    style={{ bottom: '-22px', zIndex: 20 }}
                  >
                    <span style={{
                      fontSize: '10px',
                      
                      color: 'rgba(255,255,255,0.5)',
                      fontStyle: 'italic',
                    }}>
                      {currentStep.actions.length > 1
                        ? `1 option not available in "${activeConfigName}" configuration`
                        : ''}
                    </span>
                  </div>
                )}

                {/* Media Viewer - Positioned absolutely to attach to left side of step card (hidden in topleft layout) */}
                <div
                  className={`absolute right-1/2 hidden ${panelLayout === 'topleft' ? '' : 'lg:flex'} flex-col justify-end pointer-events-none h-full`}
                  style={{
                    marginRight: 'calc(350px + 8px)',
                    paddingBottom: 'var(--spacing-sm)',
                    ...(panelLayout === 'topleft' ? { display: 'none' } : {})
                  }}
                >
                  <div className="pointer-events-auto max-h-full flex flex-col">
                    <MediaViewer
                      mediaFiles={currentStep.mediaFiles}
                      onAddMediaFiles={handleAddMediaFiles}
                      onRemoveMediaFile={handleRemoveMediaFile}
                      onReorderMedia={handleReorderMedia}
                      editingEnabled={editingEnabled}
                    />
                  </div>
                </div>
            </div>
          )}

          {/* Configuration indicator badge in viewer mode — hidden in topleft layout (overlaps the card) */}
          {!editingEnabled && activeConfigName && !isAnimationEditorOpen && !showARPlacement && panelLayout !== 'topleft' && (
            <div
              className="absolute top-3 left-3 z-10 flex items-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '6px 14px 6px 10px',
                borderLeft: '3px solid #2F80ED',
                maxWidth: '220px',
              }}
            >
              <span
                className="truncate"
                style={{
                  fontSize: '12px',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  
                }}
                title={activeConfigName}
              >
                {activeConfigName}
              </span>
            </div>
          )}

          {/* Top-right scene buttons: close, more, AR (hidden in preview mode and during animation editing) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10" style={{ display: (isPreviewMode || isAnimationEditorOpen) ? 'none' : undefined }}>
            <button
              onClick={handleBack}
              className="size-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #36415d' }}
              title="Close procedure"
            >
              <X className="size-4 text-white/80" />
            </button>
            <div className="relative" ref={sceneMoreMenuRef}>
              <button
                onClick={() => setShowSceneMoreMenu(!showSceneMoreMenu)}
                className="size-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #36415d' }}
                title="More options"
              >
                <MoreVertical className="size-4 text-white/80" />
              </button>
              {showSceneMoreMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-56 rounded-lg overflow-hidden z-50"
                  style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div className="py-1">
                    <button
                      onClick={() => setShowSceneMoreMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                     
                    >
                      <Keyboard className="size-4 text-white/60" />
                      Hotkeys
                    </button>
                    <button
                      onClick={() => setShowSceneMoreMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                     
                    >
                      <Glasses className="size-4 text-white/60" />
                      Activate VR
                    </button>
                    <div className="h-px bg-white/10 mx-2 my-1" />
                    <button
                      onClick={() => { handleRestart(); setShowSceneMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                     
                    >
                      <RotateCcw className="size-4 text-white/60" />
                      Restart procedure
                    </button>
                    <button
                      onClick={() => { handleOpenFlowEditor(); setShowSceneMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                     
                    >
                      <ExternalLink className="size-4 text-white/60" />
                      Open procedure flow editor
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                // Directly click the iframe's AR button (same-origin)
                const iframeArBtn = sceneIframeRef.current?.contentDocument?.getElementById('arBtn');
                if (iframeArBtn) iframeArBtn.click();
              }}
              className="size-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
              style={{
                background: arActive ? 'rgba(255,31,31,0.75)' : 'rgba(0,0,0,0.5)',
                border: '1px solid #36415d'
              }}
              title={arActive ? 'Exit AR' : 'Enter AR'}
            >
              {arActive ? (
                <X className="size-4 text-white" />
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" />
                  <text x="12" y="15" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AR</text>
                </svg>
              )}
            </button>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <SettingsModal
              onClose={() => setShowSettings(false)}
              procedureTitle={procedureTitle}
              onProcedureTitleChange={handleProcedureTitleChange}
            />
          )}

          {/* Publish Modal */}
          {showPublish && (
            <PublishModal
              onClose={() => setShowPublish(false)}
              onPublish={handlePublish}
              currentVersion={publishInfo?.version}
            />
          )}

          {/* Popup Panel - Shown as modal when triggered */}
          {showPopupPanel && currentStep.popups.length > 0 && (
            <PopupPanel
              popups={currentStep.popups}
              onAddPopup={handleAddPopup}
              onUpdatePopup={handleUpdatePopup}
              onRemovePopup={handleRemovePopup}
              editingEnabled={editingEnabled}
              onClose={() => setShowPopupPanel(false)}
            />
          )}

          {/* Validation Panel - Shown as modal when triggered */}
          {showValidationPanel && (
            <ValidationPanel
              validation={currentStep.validation}
              onAddValidation={handleAddValidation}
              onAddCheckpoint={handleAddCheckpoint}
              onUpdateCheckpoint={handleUpdateCheckpoint}
              onRemoveCheckpoint={handleRemoveCheckpoint}
              onReorderCheckpoints={handleReorderCheckpoints}
              onRemoveValidation={handleRemoveValidation}
              activeCheckpointId={activeCheckpointId}
              onSetActiveCheckpointId={setActiveCheckpointId}
              editingEnabled={editingEnabled}
              onClose={() => setShowValidationPanel(false)}
              onSelectParts={handleSelectPartsForValidation}
              onSetArrowDirection={handleSetArrowDirectionForValidation}
              isMobileView={isMobileView}
              availableParts={availableParts}
            />
          )}

          {/* Options Manager */}
          {showOptionsManager && (
            <OptionsManager
              actions={currentStep.actions}
              onAddAction={handleAddAction}
              onEditAction={handleEditAction}
              onRemoveAction={handleRemoveAction}
              onClose={() => setShowOptionsManager(false)}
            />
          )}

          {/* Hotspots Panel */}
          <HotspotsPanel
            isOpen={showHotspotsPanel}
            onClose={() => setShowHotspotsPanel(false)}
          />

          {/* Bookmarks and Parts Catalog are now opened inside the 3D scene via postMessage */}
        </div>
      </div>

      {/* Table of Contents - Overlay on left (hidden during animation editing) */}
      {showTOC && !isAnimationEditorOpen && (
        <TableOfContents
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepChange={handleStepChange}
          onAddStep={handleAddStep}
          onDeleteStep={handleDeleteStepByIndex}
          onRenameStep={(stepIndex, newTitle) => {
            setSteps(prev => {
              const newSteps = [...prev];
              newSteps[stepIndex] = { ...newSteps[stepIndex], title: newTitle || undefined };
              return newSteps;
            });
            triggerSave();
          }}
          onActionSelect={handleActionSelect}
          selectedActionPath={selectedActionPath}
          onClose={() => setShowTOC(false)}
          procedureTitle={procedureTitle}
          onAddAction={(stepIndex, label) => {
            const step = steps[stepIndex];
            if (!step) return;
            
            const isFirstAction = step.actions.length === 0;
            
            // Find all linear child steps (steps that follow this step without being part of an option)
            const linearChildren = steps.filter(s => 
              s.parentStepId === step.id && s.parentActionIndex === undefined
            );
            
            const newStepId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const newAction: StepAction = { label, nextStepId: newStepId };
            
            const newStep: Step = {
              id: newStepId,
              title: undefined,
              description: undefined,
              actions: [],
              mediaFiles: [],
              popups: [],
              hasAnimation: false,
              color: '#36415d',
              parentStepId: step.id,
              parentActionIndex: step.actions.length // Index of the action we're adding
            };
            
            setSteps(prev => {
              const newSteps = [...prev];
              const updatedStep = { ...newSteps[stepIndex], actions: [...newSteps[stepIndex].actions, newAction] };
              newSteps[stepIndex] = updatedStep;
              
              // If this is the first action and there are linear children, move them to be children of this option
              if (isFirstAction && linearChildren.length > 0) {
                const firstChild = linearChildren[0];
                const childIndex = newSteps.findIndex(s => s.id === firstChild.id);
                
                if (childIndex !== -1) {
                  // Update all linear children to be children of this new option
                  // This is done by setting their parentActionIndex to the new action's index
                  newSteps[childIndex] = {
                    ...newSteps[childIndex],
                    parentStepId: step.id,
                    parentActionIndex: step.actions.length
                  };
                  
                  // Update the action to point to this existing step instead of creating a new one
                  updatedStep.actions[updatedStep.actions.length - 1] = {
                    ...updatedStep.actions[updatedStep.actions.length - 1],
                    nextStepId: firstChild.id
                  };
                  newSteps[stepIndex] = updatedStep;
                  
                  // Don't add the new empty step since we're reusing existing children
                  return newSteps;
                }
              }
              
              // Otherwise add the new empty step
              newSteps.push(newStep);
              return newSteps;
            });
          }}
          onEditAction={(stepIndex, actionIndex, newLabel) => {
            setSteps(prev => {
              const newSteps = [...prev];
              const updatedActions = [...newSteps[stepIndex].actions];
              updatedActions[actionIndex] = { ...updatedActions[actionIndex], label: newLabel };
              newSteps[stepIndex] = { ...newSteps[stepIndex], actions: updatedActions };
              return newSteps;
            });
          }}
          onRemoveAction={(stepIndex, actionIndex) => {
            const step = steps[stepIndex];
            if (!step || !step.actions[actionIndex]) return;
            
            const removedAction = step.actions[actionIndex];
            const nextStepId = removedAction.nextStepId;
            const isLastAction = step.actions.length === 1;
            
            // Find the step that this action points to
            const childStep = steps.find(s => s.id === nextStepId);
            
            setSteps(prev => {
              const newSteps = [...prev];
              const updatedActions = [...newSteps[stepIndex].actions];
              updatedActions.splice(actionIndex, 1);
              
              // If this is the last action being removed and there's a child step
              if (isLastAction && childStep) {
                // Convert the child step back to a linear child (no parentActionIndex)
                const childIndex = newSteps.findIndex(s => s.id === childStep.id);
                if (childIndex !== -1) {
                  newSteps[childIndex] = {
                    ...newSteps[childIndex],
                    parentStepId: step.id,
                    parentActionIndex: undefined
                  };
                }
              } else if (!isLastAction && childStep) {
                // If there are other actions remaining, reassign this option's children to the first remaining action
                const firstRemainingActionIndex = actionIndex === 0 ? 0 : 0;
                const childIndex = newSteps.findIndex(s => s.id === childStep.id);
                
                if (childIndex !== -1 && actionIndex !== firstRemainingActionIndex) {
                  // Only reassign if we're not removing the first action
                  // Otherwise the children stay with their current action
                  newSteps[childIndex] = {
                    ...newSteps[childIndex],
                    parentStepId: step.id,
                    parentActionIndex: firstRemainingActionIndex
                  };
                }
              } else if (childStep) {
                // No child step exists, just remove the action
                // Do nothing additional
              }
              
              newSteps[stepIndex] = { ...newSteps[stepIndex], actions: updatedActions };
              return newSteps;
            });
            
            setSelectedActionPath(prev => {
              const newMap = new Map(prev);
              const currentSelected = newMap.get(step.id);
              
              // If we're removing the selected action
              if (currentSelected === actionIndex) {
                // If there are remaining actions, select the previous one (or first if deleting index 0)
                if (step.actions.length > 1) {
                  const newSelectedIndex = actionIndex > 0 ? actionIndex - 1 : 0;
                  newMap.set(step.id, newSelectedIndex);
                } else {
                  // No more actions, clear the selection
                  newMap.delete(step.id);
                }
              } else if (currentSelected !== undefined && currentSelected > actionIndex) {
                // Adjust the selected action index if it's after the removed one
                newMap.set(step.id, currentSelected - 1);
              }
              return newMap;
            });
          }}
          onReorderActions={(stepIndex, fromIndex, toIndex) => {
            setSteps(prev => {
              const newSteps = [...prev];
              const actions = [...newSteps[stepIndex].actions];
              const [movedItem] = actions.splice(fromIndex, 1);
              actions.splice(toIndex, 0, movedItem);
              newSteps[stepIndex] = { ...newSteps[stepIndex], actions };
              return newSteps;
            });
          }}
          onReorderSteps={(fromIndex, toIndex) => {
            setSteps(prev => {
              const newSteps = [...prev];
              const [movedStep] = newSteps.splice(fromIndex, 1);
              newSteps.splice(toIndex, 0, movedStep);
              
              // Renumber all steps that have auto-generated titles (like "Step 1", "Step 2", etc.)
              const renumberedSteps = newSteps.map((step, index) => {
                // Check if this step has an auto-generated title pattern "Step X"
                if (step.title && /^Step \d+$/.test(step.title)) {
                  return {
                    ...step,
                    title: `Step ${index + 1}`
                  };
                }
                return step;
              });
              
              // Update current step index if needed
              if (currentStepIndex === fromIndex) {
                setCurrentStepIndex(toIndex);
              } else if (fromIndex < currentStepIndex && toIndex >= currentStepIndex) {
                setCurrentStepIndex(currentStepIndex - 1);
              } else if (fromIndex > currentStepIndex && toIndex <= currentStepIndex) {
                setCurrentStepIndex(currentStepIndex + 1);
              }
              
              return renumberedSteps;
            });
          }}
          editingEnabled={editingEnabled}
        />
      )}

      {/* Parts Catalog is now opened inside the 3D scene via postMessage */}

      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* Undo Delete Notification */}
      {showUndoNotification && deletedStep && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
          <div className="flex items-center gap-4 px-4 sm:px-5 py-3 rounded-lg shadow-elevation-lg border-2 border-border bg-card text-card-foreground w-[calc(100vw-32px)] sm:w-auto sm:min-w-[320px]">
            <AlertCircle className="size-5 text-destructive flex-shrink-0" />
            <p className="flex-1 font-bold leading-tight">
              Step {deletedStep.index + 1} deleted
            </p>
            <button
              onClick={handleUndoDelete}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-button hover:brightness-110 transition-opacity font-bold"
            >
              <Undo className="size-4" />
              Undo
            </button>
            <button
              onClick={() => {
                setShowUndoNotification(false);
                setDeletedStep(null);
              }}
              className="flex-shrink-0 text-muted hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <AlertCircle className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Undo Popup Delete Notification */}
      {showUndoPopupNotification && deletedPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
          <div className="flex items-center gap-4 px-4 sm:px-5 py-3 rounded-lg shadow-elevation-lg border-2 border-border bg-card text-card-foreground w-[calc(100vw-32px)] sm:w-auto sm:min-w-[320px]">
            <AlertCircle className="size-5 text-destructive flex-shrink-0" />
            <p className="flex-1 font-bold leading-tight">
              Popup deleted
            </p>
            <button
              onClick={handleUndoPopupDelete}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-button hover:brightness-110 transition-opacity font-bold"
            >
              <Undo className="size-4" />
              Undo
            </button>
            <button
              onClick={() => {
                setShowUndoPopupNotification(false);
                setDeletedPopup(null);
              }}
              className="flex-shrink-0 text-muted hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <AlertCircle className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && !isARMode && !showARPlacement && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onResetAllParts={handleResetAllParts}
          onHide={handleHide}
          onIsolate={handleIsolate}
        />
      )}

      {/* Animation Builder Editor - Full-screen overlay */}
      <AnimationBuilder
        isOpen={isAnimationEditorOpen}
        onClose={() => setIsAnimationEditorOpen(false)}
      />

      {/* Demo Runner for procedure tutorials */}
      <DemoRunner
        feature={activeDemo}
        onEnd={() => {
          setActiveDemo(null);
          window.postMessage({ type: 'debugDemoEnded', featureId: activeDemo?.id }, '*');
        }}
      />
    </div>
  );
}
