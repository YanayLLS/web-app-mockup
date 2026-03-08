import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Viewer3D } from './Viewer3D';
import { ProcedurePanel } from './ProcedurePanel';
import { Header } from './Header';
import { SideButtons } from './SideButtons';
import { MediaViewer } from './MediaViewer';
import { SettingsModal } from './SettingsModal';
import { PublishModal } from './PublishModal';
import { PopupPanel } from './PopupPanel';
import { ValidationPanel } from './ValidationPanel';
import { OptionsManager } from './OptionsManager';
import { BookmarksModal } from './BookmarksModal';
import { PartsCatalogPanel } from './PartsCatalogPanel';
import type { ModelHierarchyNode } from './Viewer3D';
import { TableOfContents } from './TableOfContents';
import { Tutorial } from './Tutorial';
import { SaveIndicator } from './SaveIndicator';
import { ARPlacementFlow, type ObjectTarget, type PlacementMethod } from './ARPlacementFlow';
import { ContextMenu } from './ContextMenu';
import { GraduationCap, Undo, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

export interface Step {
  id: string;
  title?: string;
  description?: string;
  actions: StepAction[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  color: string;
  hasAnimation: boolean;
  popups: Popup[];
  mediaFiles: MediaFile[];
  validation?: Validation; // Single validation per step
  parentStepId?: string;
  parentActionIndex?: number;
  nextStepId?: string; // For creating loops and custom step connections
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

// Pre-built sample procedure with rich step data
const sampleStepIds = {
  s1: 'sample-step-1',
  s2: 'sample-step-2',
  s3: 'sample-step-3',
  s4: 'sample-step-4',
  s5: 'sample-step-5',
  s6: 'sample-step-6',
  s7: 'sample-step-7',
  s8: 'sample-step-8',
};

const sampleSteps: Step[] = [
  {
    id: sampleStepIds.s1,
    title: 'Safety Preparation',
    description: 'Before beginning maintenance, ensure all safety protocols are followed. Wear appropriate PPE including safety glasses, gloves, and steel-toe boots. Verify the equipment is powered off and locked out.',
    actions: [],
    color: '#2F80ED',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-1a',
        title: 'PPE Required',
        description: 'Safety glasses, nitrile gloves, steel-toe boots, and hearing protection are mandatory for this procedure.',
        position: { x: 35, y: 25 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'down',
      },
      {
        id: 'popup-1b',
        title: 'Lockout Point',
        description: 'Main power disconnect is located on the left side panel. Apply lockout tag before proceeding.',
        position: { x: 70, y: 60 },
        color: '#FF1F1F',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'Lockout confirmed',
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s2,
    title: 'Remove Access Panel',
    description: 'Using a T-25 Torx driver, remove the six (6) screws securing the front access panel. Set screws aside in a magnetic tray to prevent loss. Carefully lift the panel away from the unit.',
    actions: [],
    color: 'var(--foreground)',
    hasAnimation: true,
    popups: [
      {
        id: 'popup-2a',
        title: 'Screw Locations',
        description: '4 screws along the top edge, 2 screws along the bottom edge. All are M5×12mm Torx T-25.',
        position: { x: 50, y: 30 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s3,
    title: 'Inspect Belt Condition',
    description: 'Visually inspect the drive belt for signs of wear, cracking, glazing, or fraying. Check belt tension by pressing down at the midpoint — deflection should be 10-15mm.',
    actions: [
      { label: 'Belt is OK', nextStepId: sampleStepIds.s5 },
      { label: 'Belt needs replacement', nextStepId: sampleStepIds.s4 },
    ],
    color: '#8404B3',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-3a',
        title: 'Wear Indicators',
        description: 'Look for cracks perpendicular to the belt direction, shiny spots (glazing), or any visible cord damage. Replace if any are found.',
        position: { x: 40, y: 45 },
        color: '#8404B3',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-3b',
        title: 'Tension Check',
        description: 'Press firmly at the belt midpoint between the two pulleys. Acceptable deflection: 10–15mm. If outside range, adjust tensioner.',
        position: { x: 65, y: 70 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'down',
      },
    ],
    mediaFiles: [],
    validation: {
      id: 'val-3',
      checkpoints: [
        {
          id: 'cp-3a',
          type: 'visual',
          severity: 'critical',
          label: 'Belt surface condition',
          selectedParts: ['drive-belt'],
          passState: { description: 'Belt shows no cracking, glazing or fraying', mediaFiles: [] },
          failState: { description: 'Belt shows visible wear — proceed to replacement', mediaFiles: [], remediationSteps: 'Replace belt following step 4' },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s4,
    title: 'Replace Drive Belt',
    description: 'Release the tensioner by rotating the tensioner arm clockwise. Slide the old belt off the pulleys. Route the new belt following the diagram on the belt guard. Release the tensioner to apply tension.',
    actions: [],
    color: '#FF6B35',
    hasAnimation: true,
    parentStepId: sampleStepIds.s3,
    parentActionIndex: 1,
    popups: [
      {
        id: 'popup-4a',
        title: 'Belt Routing Diagram',
        description: 'Follow the routing path: Motor pulley → Idler → Main drive → Tensioner. The ribbed side faces the grooved pulleys.',
        position: { x: 30, y: 35 },
        color: '#FF6B35',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-4b',
        title: 'Tensioner Release',
        description: 'Use a 15mm wrench on the tensioner bolt. Rotate clockwise to release tension. Do not force beyond the stop point.',
        position: { x: 60, y: 55 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s5,
    title: 'Lubricate Bearings',
    description: 'Apply 2-3 drops of ISO VG 68 bearing oil to each of the four bearing points marked in blue. Rotate the shaft by hand to distribute lubricant evenly.',
    actions: [],
    color: 'var(--foreground)',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-5a',
        title: 'Bearing Point #1 & #2',
        description: 'Front bearings — accessible directly after panel removal. Apply oil to the zerk fittings.',
        position: { x: 25, y: 40 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'right',
      },
      {
        id: 'popup-5b',
        title: 'Bearing Point #3 & #4',
        description: 'Rear bearings — reach through the service window on the back panel.',
        position: { x: 75, y: 40 },
        color: '#2F80ED',
        mediaFiles: [],
        arrowDirection: 'left',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s6,
    title: 'Check Fluid Levels',
    description: 'Inspect hydraulic fluid reservoir through the sight glass. Level should be between the MIN and MAX marks. Top up with ISO 46 hydraulic fluid if needed.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-6a',
        title: 'Sight Glass Location',
        description: 'The sight glass is on the right side of the hydraulic reservoir. Clean it first with a lint-free cloth before reading.',
        position: { x: 55, y: 50 },
        color: '#11E874',
        mediaFiles: [],
        arrowDirection: 'down',
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
          label: 'Hydraulic fluid level',
          selectedParts: ['hydraulic-reservoir'],
          tolerance: { nominal: 75, min: 50, max: 100, unit: '%' },
          passState: { description: 'Fluid level is within acceptable range', mediaFiles: [] },
          failState: { description: 'Fluid level is low — top up before continuing', mediaFiles: [] },
        },
      ],
    },
  },
  {
    id: sampleStepIds.s7,
    title: 'Reinstall Access Panel',
    description: 'Align the access panel with the locating pins and press firmly. Reinstall the six T-25 Torx screws in a star pattern. Torque to 4.5 Nm.',
    actions: [],
    color: 'var(--foreground)',
    hasAnimation: true,
    popups: [
      {
        id: 'popup-7a',
        title: 'Torque Specification',
        description: 'All panel screws: 4.5 Nm ± 0.5 Nm. Use a calibrated torque driver. Do not overtighten.',
        position: { x: 45, y: 30 },
        color: '#2F80ED',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'Torque verified',
        arrowDirection: 'up',
      },
    ],
    mediaFiles: [],
  },
  {
    id: sampleStepIds.s8,
    title: 'Final Verification & Startup',
    description: 'Remove lockout/tagout. Power on the equipment and run a 2-minute warm-up cycle. Listen for unusual noises. Check for leaks around the access panel and bearing points. Record maintenance in the logbook.',
    actions: [],
    color: '#11E874',
    hasAnimation: false,
    popups: [
      {
        id: 'popup-8a',
        title: 'Startup Checklist',
        description: '1. All panels secured\n2. Tools removed from work area\n3. Lockout removed\n4. Area clear of personnel\n5. Power switch to ON',
        position: { x: 30, y: 30 },
        color: '#11E874',
        mediaFiles: [],
        requiresConfirmation: true,
        confirmButtonText: 'All checks passed',
        arrowDirection: 'down',
      },
      {
        id: 'popup-8b',
        title: 'Leak Inspection Points',
        description: 'Check for fluid weeping at: panel gasket line, bearing seals, hydraulic line fittings, and drain plug.',
        position: { x: 65, y: 65 },
        color: '#FF1F1F',
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
          type: 'visual',
          severity: 'critical',
          label: 'No leaks detected',
          selectedParts: ['access-panel', 'bearings', 'hydraulic-lines'],
          passState: { description: 'No leaks observed during warm-up cycle', mediaFiles: [] },
          failState: { description: 'Leak detected — power down and investigate', mediaFiles: [], remediationSteps: 'Identify source and re-tighten or replace gasket' },
        },
        {
          id: 'cp-8b',
          type: 'presence',
          severity: 'warning',
          label: 'Normal operating sounds',
          selectedParts: ['motor-assembly'],
          passState: { description: 'Equipment sounds normal during warm-up', mediaFiles: [] },
          failState: { description: 'Unusual noise detected — investigate before full operation', mediaFiles: [] },
        },
      ],
    },
  },
];

export function ProcedureEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get('mode'); // 'view' | 'edit' | null
  const hasProcedureId = typeof window !== 'undefined' && window.location.pathname.includes('/procedure-editor/');

  // Use sample steps when opening from KB (has procedure ID), empty for new procedures
  const useSampleData = hasProcedureId && urlMode !== null;

  const [steps, setSteps] = useState<Step[]>(useSampleData ? sampleSteps : [initialStep]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedActionPath, setSelectedActionPath] = useState<Map<string, number>>(new Map());
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [procedureTitle, setProcedureTitle] = useState(useSampleData ? 'Routine Maintenance Procedure' : 'Elitebook 840 G9');
  const [showSettings, setShowSettings] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(urlMode !== 'view');
  const [showOptionsManager, setShowOptionsManager] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
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
  
  // AR Mode state
  const [isARMode, setIsARMode] = useState(false);
  const [showARPlacement, setShowARPlacement] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
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
  
  // Save indicator state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  
  const blobUrlsRef = useRef<Set<string>>(new Set());

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
      alert('This option already exists');
      return;
    }

    if (currentStep.actions.length >= 20) {
      alert('Maximum 20 options per step');
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
      alert('Maximum 10 media files per step');
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
      alert('Maximum 10 popups per step');
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

  // Handle open flow editor - open procedure editor page in a new tab
  const handleOpenFlowEditor = useCallback(() => {
    const currentPath = window.location.pathname;
    // Try to extract procedureId from current URL
    const match = currentPath.match(/procedure-editor\/([^/]+)/);
    const procedureId = match ? match[1] : 'default';
    window.open(`/web/procedure-editor/${procedureId}`, '_blank');
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

  const handleStartTutorial = useCallback(() => {
    // Check if screen is too small
    if (window.innerWidth < 768) {
      if (!confirm('Tutorial is best viewed on larger screens. Continue anyway?')) {
        return;
      }
    }

    // Only start if editing is enabled
    if (!editingEnabled) {
      alert('Please enable editing mode to view the tutorial');
      return;
    }

    setShowTutorial(true);
  }, [editingEnabled]);

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
      {/* Save Indicator - Hidden on /mobile path */}
      {!isMobilePath && <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />}
      
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
              src={`${import.meta.env.BASE_URL}app/digital-twin-scene.html?embedded=true&mode=procedure`}
              className="absolute inset-0 w-full h-full border-0"
              style={{ zIndex: 0 }}
              title="3D Scene"
              allow="autoplay; fullscreen"
            />
          )}

          {/* Header - Only show when editing is enabled and not during AR placement */}
          {editingEnabled && !showARPlacement && (
            <Header
              hasAnimation={currentStep.hasAnimation}
              onOpenSettings={() => setShowSettings(true)}
              onOpenBookmarks={() => setShowBookmarks(true)}
              onTogglePartsCatalog={() => setShowPartsCatalog(!showPartsCatalog)}
              isPartsCatalogOpen={showPartsCatalog}
              onOpenPublish={() => setShowPublish(true)}
              onOpenValidation={() => setShowValidationPanel(true)}
              checkpointCount={currentStep.validation?.checkpoints?.length ?? 0}
              hasCritical={currentStep.validation?.checkpoints?.some(cp => cp.severity === 'critical') ?? false}
            />
          )}

          {/* Part Selection Banner - Shows when selecting validation parts */}
          {isSelectingValidationParts && editingEnabled && !showARPlacement && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 rounded-lg flex flex-col"
              style={{
                backgroundColor: 'var(--primary)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                gap: 'var(--spacing-md)',
                boxShadow: 'var(--elevation-lg)',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '400px',
                maxWidth: '600px'
              }}
            >
              <div className="flex items-center justify-between" style={{ gap: 'var(--spacing-lg)' }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  <div>\n                    <p 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
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
                        fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                          fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
          {isSettingArrowDirection && !isMobileView && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 rounded-lg flex flex-col"
              style={{
                backgroundColor: 'var(--primary)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                gap: 'var(--spacing-md)',
                boxShadow: 'var(--elevation-lg)',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '400px',
                maxWidth: '600px'
              }}
            >
              <div className="flex items-center justify-between" style={{ gap: 'var(--spacing-lg)' }}>
                <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  <div>
                    <p 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
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
                        fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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
                      fontFamily: 'var(--font-family)',
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

          {/* Spacer - Only show when not in AR placement */}
          {!showARPlacement && (
            <div className="flex-[1_0_0] min-h-px min-w-px w-full" />
          )}

          {/* Conditional rendering: AR Placement Flow or Procedure Panel with Media Viewer */}
          {showARPlacement ? (
            // AR Placement Flow in full screen
            <ARPlacementFlow
              onComplete={handleARPlacementComplete}
              onCancel={handleARPlacementCancel}
              availableTargets={availableTargets}
            />
          ) : (
            <div className="w-full flex justify-center relative z-10 px-4 sm:px-0">
                {/* Step card - Always centered */}
                <ProcedurePanel
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
                  onToggleTOC={() => setShowTOC(!showTOC)}
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
                
                {/* Media Viewer - Positioned absolutely to attach to left side of step card */}
                <div
                  className="absolute right-1/2 hidden lg:flex flex-col justify-end pointer-events-none h-full"
                  style={{
                    marginRight: 'calc(350px + 8px)',
                    paddingBottom: 'var(--spacing-sm)'
                  }}
                >
                  <div className="pointer-events-auto max-h-full flex flex-col">
                    <MediaViewer 
                      mediaFiles={currentStep.mediaFiles}
                      onAddMediaFiles={handleAddMediaFiles}
                      onRemoveMediaFile={handleRemoveMediaFile}
                      onReorderMedia={handleReorderMedia}
                    />
                  </div>
                </div>
            </div>
          )}

          {/* Side Buttons */}
          <SideButtons 
            onEnterAR={handleEnterAR}
            onOpenPlacement={handleEnterAR}
            isARMode={isARMode}
            isMobileView={isMobileView}
          />

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

          {/* Bookmarks Modal */}
          {showBookmarks && (
            <BookmarksModal onClose={() => setShowBookmarks(false)} />
          )}
        </div>
      </div>

      {/* Table of Contents - Overlay on left */}
      {showTOC && (
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

      {/* Parts Catalog Panel - Outside main container for proper overlay */}
      <PartsCatalogPanel
        isOpen={showPartsCatalog}
        onClose={() => setShowPartsCatalog(false)}
        hierarchy={modelHierarchy}
      />

      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onClose={() => setShowTutorial(false)} />
      )}

      {/* Undo Delete Notification */}
      {showUndoNotification && deletedStep && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
          <div className="flex items-center gap-4 px-5 py-3 rounded-lg shadow-elevation-lg border-2 border-border bg-card text-card-foreground min-w-[320px]">
            <AlertCircle className="size-5 text-destructive flex-shrink-0" />
            <p className="flex-1 font-bold leading-tight">
              Step {deletedStep.index + 1} deleted
            </p>
            <button
              onClick={handleUndoDelete}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-button hover:opacity-90 transition-opacity font-bold"
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
          <div className="flex items-center gap-4 px-5 py-3 rounded-lg shadow-elevation-lg border-2 border-border bg-card text-card-foreground min-w-[320px]">
            <AlertCircle className="size-5 text-destructive flex-shrink-0" />
            <p className="flex-1 font-bold leading-tight">
              Popup deleted
            </p>
            <button
              onClick={handleUndoPopupDelete}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-button hover:opacity-90 transition-opacity font-bold"
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
    </div>
  );
}
