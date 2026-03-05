import { Validation, ValidationMode, ValidationState, MediaFile } from './ProcedureEditor';
import { X, Plus, Upload, Trash2, CheckCircle, XCircle, Box, Image as ImageIcon, Camera, ChevronLeft, ChevronRight, Info, HelpCircle, ArrowRight, Crosshair } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ValidationPanelProps {
  validation?: Validation;
  onAddValidation: (validation: Validation) => void;
  onUpdateValidation: (updates: Partial<Validation>) => void;
  onRemoveValidation: () => void;
  editingEnabled: boolean;
  onClose: () => void;
  onSelectParts: (callback: (parts: string[]) => void) => void;
  onSetArrowDirection: (callback: (direction: { x: number; y: number; z: number }) => void) => void;
  isMobileView: boolean;
  availableParts: string[];
}

const MAX_DESCRIPTION_LENGTH = 500;

type StateTab = 'pass' | 'fail';

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg pointer-events-none z-50"
            style={{
              backgroundColor: 'var(--popover)',
              color: 'var(--popover-foreground)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-normal)',
              boxShadow: 'var(--elevation-sm)',
              maxWidth: '240px',
              whiteSpace: 'normal',
              lineHeight: '1.5',
              border: '1px solid var(--border)'
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Step indicator badge
function StepBadge({ number, status }: { number: number; status: 'pending' | 'active' | 'done' }) {
  const bgColor = status === 'done'
    ? '#22c55e'
    : status === 'active'
      ? 'var(--primary)'
      : 'var(--secondary)';
  const textColor = status === 'pending' ? 'var(--muted-foreground)' : 'white';

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: bgColor,
        scale: status === 'active' ? 1.1 : 1
      }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center shrink-0"
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        fontSize: '11px',
        fontFamily: 'var(--font-family)',
        fontWeight: 'var(--font-weight-bold)',
        color: textColor
      }}
    >
      {status === 'done' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      ) : (
        number
      )}
    </motion.div>
  );
}

export function ValidationPanel({
  validation,
  onAddValidation,
  onUpdateValidation,
  onRemoveValidation,
  editingEnabled,
  onClose,
  onSelectParts,
  onSetArrowDirection,
  isMobileView,
  availableParts
}: ValidationPanelProps) {
  const [activeStateTab, setActiveStateTab] = useState<StateTab>('pass');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isSelectingParts, setIsSelectingParts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const isActualMobileDevice = typeof window !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const currentState = validation ?
    (activeStateTab === 'pass' ? validation.passState : validation.failState) : null;

  // Compute completion state
  const completionState = useMemo(() => {
    if (!validation) return { mode: false, target: false, outcome: false, total: 0, max: 3 };

    const mode = true; // always set once validation exists
    const target = validation.mode === 'object'
      ? (validation.selectedParts?.length > 0)
      : (validation.passState.mediaFiles?.length > 0 || validation.failState.mediaFiles?.length > 0);
    const outcome = !!(validation.passState.description || validation.failState.description);

    const total = [mode, target, outcome].filter(Boolean).length;
    return { mode, target, outcome, total, max: 3 };
  }, [validation]);

  // Update local state when validation or tab changes
  useEffect(() => {
    if (currentState && !isEditingDescription) {
      setLocalDescription(currentState.description || '');
    }
  }, [currentState, isEditingDescription, activeStateTab]);

  // Reset media index when tab changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [activeStateTab]);

  const handleAddValidation = () => {
    const newValidation: Validation = {
      id: crypto.randomUUID(),
      mode: 'image',
      passState: {
        description: '',
        mediaFiles: []
      },
      failState: {
        description: '',
        mediaFiles: []
      },
      selectedParts: []
    };

    onAddValidation(newValidation);
    setActiveStateTab('pass');
  };

  const handleUpdateMode = (mode: ValidationMode) => {
    if (!validation) return;
    onUpdateValidation({ mode });
  };

  const handleUpdateDescription = (description: string) => {
    if (!validation) return;

    const stateKey = activeStateTab === 'pass' ? 'passState' : 'failState';
    const updatedState = {
      ...validation[stateKey],
      description
    };

    onUpdateValidation({
      [stateKey]: updatedState
    });
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (localDescription.trim() !== (currentState?.description || '')) {
      handleUpdateDescription(localDescription.trim());
    }
  };

  const handleSelectParts = () => {
    setIsSelectingParts(true);
    onSelectParts((parts: string[]) => {
      if (validation) {
        onUpdateValidation({ selectedParts: parts });
      }
      setIsSelectingParts(false);
    });
    onClose();
  };

  const handleMediaUpload = (files: FileList | null, type: 'image' | 'video') => {
    if (!files || !validation) return;

    const stateKey = activeStateTab === 'pass' ? 'passState' : 'failState';
    const currentFiles = validation[stateKey].mediaFiles || [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          id: crypto.randomUUID(),
          url: e.target?.result as string,
          type,
          filename: file.name
        };

        const updatedState = {
          ...validation[stateKey],
          mediaFiles: [...currentFiles, newMedia]
        };

        onUpdateValidation({
          [stateKey]: updatedState
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (!validation) return;

    const stateKey = activeStateTab === 'pass' ? 'passState' : 'failState';
    const updatedFiles = (validation[stateKey].mediaFiles || []).filter(m => m.id !== mediaId);

    const updatedState = {
      ...validation[stateKey],
      mediaFiles: updatedFiles
    };

    onUpdateValidation({
      [stateKey]: updatedState
    });

    setCurrentMediaIndex(0);
  };

  const currentMediaFiles = currentState?.mediaFiles || [];
  const currentMedia = currentMediaFiles[currentMediaIndex];

  const getPlaceholderText = () => {
    if (validation?.mode === 'object') {
      return activeStateTab === 'pass'
        ? 'e.g., "All four mounting bolts are installed and properly tightened"'
        : 'e.g., "Missing two bolts on the left side or bolts are loose"';
    } else {
      return activeStateTab === 'pass'
        ? 'e.g., "Both cable connectors are plugged in and LED indicator is green"'
        : 'e.g., "Cable is not connected or LED indicator is red/off"';
    }
  };

  // No validation yet - empty state
  if (!validation) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-lg flex flex-col items-center"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-lg)',
            padding: 'var(--spacing-2xl)',
            maxWidth: '500px',
            margin: 'var(--spacing-lg)'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg transition-colors"
            style={{
              padding: 'var(--spacing-sm)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="size-5" />
          </button>

          <div className="flex flex-col items-center" style={{ gap: 'var(--spacing-lg)' }}>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--secondary)',
                width: '64px',
                height: '64px'
              }}
            >
              <CheckCircle className="size-8" style={{ color: 'var(--accent)' }} />
            </div>

            <div className="text-center" style={{ gap: 'var(--spacing-sm)' }}>
              <h3
                style={{
                  fontSize: 'var(--text-h3)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--foreground)',
                  margin: 0,
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                No Validation Yet
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--muted-foreground)',
                  margin: 0
                }}
              >
                Create a validation point to verify step completion with pass/fail states.
              </p>
            </div>

            {editingEnabled && (
              <button
                onClick={handleAddValidation}
                className="flex items-center rounded-lg transition-all"
                style={{
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus className="size-4" />
                Add Validation
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-lg flex flex-col"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-lg)',
          width: '90vw',
          maxWidth: '560px',
          height: '85vh',
          maxHeight: '720px',
          margin: 'var(--spacing-md)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: 'var(--spacing-lg) var(--spacing-xl)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            <div
              className="rounded-lg flex items-center justify-center shrink-0"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <CheckCircle className="size-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--foreground)',
                  margin: 0,
                  lineHeight: '1.3'
                }}
              >
                Validation Point
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--muted-foreground)',
                  margin: 0
                }}
              >
                Define what to check and the expected result
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg transition-colors shrink-0"
            style={{
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--secondary)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', backgroundColor: 'var(--secondary)' }}>
          <motion.div
            initial={false}
            animate={{ width: `${(completionState.total / completionState.max) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
              height: '100%',
              background: completionState.total === completionState.max
                ? '#22c55e'
                : 'linear-gradient(90deg, var(--primary), #6366f1)',
              borderRadius: '0 3px 3px 0'
            }}
          />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-xl)' }}>
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xl)' }}>

            {/* Step 1: What are you validating? */}
            <div>
              <div className="flex items-center" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <StepBadge number={1} status={completionState.mode ? 'done' : 'active'} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  What are you validating?
                </span>
                <Tooltip text="Choose how users will verify this step - by inspecting a 3D object or comparing against a reference image.">
                  <HelpCircle className="size-3" style={{ color: 'var(--muted-foreground)', cursor: 'help' }} />
                </Tooltip>
              </div>

              <div
                className="flex rounded-lg overflow-hidden"
                style={{
                  backgroundColor: 'var(--secondary)',
                  padding: '4px',
                  gap: '4px',
                  border: '1px solid var(--border)'
                }}
              >
                <button
                  onClick={() => handleUpdateMode('object')}
                  disabled={!editingEnabled}
                  className="flex-1 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: validation.mode === 'object' ? 'var(--card)' : 'transparent',
                    color: validation.mode === 'object' ? 'var(--foreground)' : 'var(--muted-foreground)',
                    border: 'none',
                    cursor: editingEnabled ? 'pointer' : 'not-allowed',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: validation.mode === 'object' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                    boxShadow: validation.mode === 'object' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    opacity: editingEnabled ? 1 : 0.5
                  }}
                >
                  <Box className="size-4" />
                  3D Object
                </button>
                <button
                  onClick={() => handleUpdateMode('image')}
                  disabled={!editingEnabled}
                  className="flex-1 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: validation.mode === 'image' ? 'var(--card)' : 'transparent',
                    color: validation.mode === 'image' ? 'var(--foreground)' : 'var(--muted-foreground)',
                    border: 'none',
                    cursor: editingEnabled ? 'pointer' : 'not-allowed',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: validation.mode === 'image' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                    boxShadow: validation.mode === 'image' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    opacity: editingEnabled ? 1 : 0.5
                  }}
                >
                  <ImageIcon className="size-4" />
                  Image
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            {/* Step 2: Select target & orientation */}
            <div>
              <div className="flex items-center" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <StepBadge
                  number={2}
                  status={completionState.target ? 'done' : completionState.mode ? 'active' : 'pending'}
                />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {validation.mode === 'object' ? 'Select target & orientation' : 'Set orientation'}
                </span>
                <Tooltip text={validation.mode === 'object'
                  ? "Pick which part(s) to inspect and set the arrow direction that guides the inspector's view."
                  : "Set an optional arrow direction to guide where the inspector should look."
                }>
                  <HelpCircle className="size-3" style={{ color: 'var(--muted-foreground)', cursor: 'help' }} />
                </Tooltip>
              </div>

              <div className="flex" style={{ gap: 'var(--spacing-md)' }}>
                {/* Part selector card - only for object mode */}
                {validation.mode === 'object' && (
                  <div
                    className="flex-1 rounded-lg flex flex-col items-center justify-center transition-all"
                    style={{
                      border: validation.selectedParts?.length > 0
                        ? '1.5px solid var(--primary)'
                        : '1.5px dashed var(--border)',
                      padding: 'var(--spacing-lg)',
                      backgroundColor: validation.selectedParts?.length > 0
                        ? 'rgba(59, 130, 246, 0.05)'
                        : 'var(--secondary)',
                      gap: 'var(--spacing-sm)',
                      minHeight: '130px',
                      cursor: editingEnabled ? 'pointer' : 'default'
                    }}
                    onClick={editingEnabled ? handleSelectParts : undefined}
                  >
                    {validation.selectedParts?.length > 0 ? (
                      <>
                        <div
                          className="rounded-lg flex items-center justify-center"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'var(--primary)',
                            color: 'white'
                          }}
                        >
                          <Crosshair className="size-4" />
                        </div>
                        <div className="flex flex-wrap justify-center" style={{ gap: '4px' }}>
                          {validation.selectedParts.map((part, index) => (
                            <span
                              key={index}
                              className="rounded-full"
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-medium)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--primary)',
                                padding: '3px var(--spacing-sm)'
                              }}
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                        {editingEnabled && (
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              fontFamily: 'var(--font-family)',
                              color: 'var(--muted-foreground)'
                            }}
                          >
                            Click to change
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className="rounded-lg flex items-center justify-center"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'var(--border)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          <Crosshair className="size-4" />
                        </div>
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--foreground)'
                          }}
                        >
                          Select Parts
                        </span>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontFamily: 'var(--font-family)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          Click to pick objects
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Arrow direction card */}
                <div
                  className="flex-1 rounded-lg flex flex-col items-center justify-center"
                  style={{
                    border: validation.arrowDirection
                      ? '1.5px solid var(--primary)'
                      : '1.5px dashed var(--border)',
                    padding: 'var(--spacing-lg)',
                    backgroundColor: validation.arrowDirection
                      ? 'rgba(59, 130, 246, 0.05)'
                      : 'var(--secondary)',
                    gap: 'var(--spacing-sm)',
                    minHeight: '130px'
                  }}
                >
                  {validation.arrowDirection ? (
                    <>
                      <div
                        className="rounded-lg flex items-center justify-center"
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: 'var(--primary)',
                          color: 'white'
                        }}
                      >
                        <ArrowRight className="size-4" />
                      </div>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--foreground)',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        ({validation.arrowDirection.x.toFixed(1)}, {validation.arrowDirection.y.toFixed(1)}, {validation.arrowDirection.z.toFixed(1)})
                      </span>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                        {editingEnabled && (
                          <>
                            <button
                              onClick={() => {
                                onSetArrowDirection((direction) => {
                                  onUpdateValidation({ arrowDirection: direction });
                                });
                              }}
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'var(--font-family)',
                                color: 'var(--primary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              Change
                            </button>
                            <span style={{ color: 'var(--border)' }}>|</span>
                            <button
                              onClick={() => onUpdateValidation({ arrowDirection: undefined })}
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'var(--font-family)',
                                color: 'var(--muted-foreground)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="rounded-lg flex items-center justify-center"
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: 'var(--border)',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        <ArrowRight className="size-4" />
                      </div>
                      {editingEnabled ? (
                        <button
                          onClick={() => {
                            onSetArrowDirection((direction) => {
                              onUpdateValidation({ arrowDirection: direction });
                            });
                          }}
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--foreground)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Set Direction
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          No direction set
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-family)',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        Guides inspector view
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            {/* Step 3: Define pass/fail criteria */}
            <div>
              <div className="flex items-center" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <StepBadge
                  number={3}
                  status={completionState.outcome ? 'done' : completionState.target ? 'active' : 'pending'}
                />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Define pass & fail criteria
                </span>
                <Tooltip text="Describe what a correct (pass) and incorrect (fail) outcome looks like so inspectors know exactly what to check.">
                  <HelpCircle className="size-3" style={{ color: 'var(--muted-foreground)', cursor: 'help' }} />
                </Tooltip>
              </div>

              {/* Pass/Fail tabs - compact pill style */}
              <div
                className="flex"
                style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}
              >
                <button
                  onClick={() => setActiveStateTab('pass')}
                  className="flex-1 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: activeStateTab === 'pass' ? '#ecfdf5' : 'var(--secondary)',
                    color: activeStateTab === 'pass' ? '#059669' : 'var(--muted-foreground)',
                    border: activeStateTab === 'pass' ? '1.5px solid #10b981' : '1.5px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: activeStateTab === 'pass' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'
                  }}
                >
                  <CheckCircle
                    className="size-4"
                    style={{
                      color: activeStateTab === 'pass' ? '#10b981' : 'var(--muted-foreground)',
                    }}
                  />
                  <div className="flex flex-col items-start">
                    <span>Pass</span>
                    {activeStateTab === 'pass' && (
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontWeight: 'var(--font-weight-normal)' }}>
                        Correct outcome
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveStateTab('fail')}
                  className="flex-1 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: activeStateTab === 'fail' ? '#fef2f2' : 'var(--secondary)',
                    color: activeStateTab === 'fail' ? '#dc2626' : 'var(--muted-foreground)',
                    border: activeStateTab === 'fail' ? '1.5px solid #ef4444' : '1.5px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: activeStateTab === 'fail' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)'
                  }}
                >
                  <XCircle
                    className="size-4"
                    style={{
                      color: activeStateTab === 'fail' ? '#ef4444' : 'var(--muted-foreground)',
                    }}
                  />
                  <div className="flex flex-col items-start">
                    <span>Fail</span>
                    {activeStateTab === 'fail' && (
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontWeight: 'var(--font-weight-normal)' }}>
                        Detect a defect
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* State Content */}
              <div
                className="rounded-lg"
                style={{
                  backgroundColor: 'var(--secondary)',
                  padding: 'var(--spacing-lg)',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Description */}
                <div style={{ marginBottom: validation.mode === 'image' ? 'var(--spacing-lg)' : 0 }}>
                  <div className="flex items-center" style={{ gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                    <label
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--foreground)'
                      }}
                    >
                      What to check
                    </label>
                  </div>
                  {editingEnabled ? (
                    <textarea
                      value={localDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                          setLocalDescription(e.target.value);
                        }
                      }}
                      onFocus={() => setIsEditingDescription(true)}
                      onBlur={handleDescriptionBlur}
                      placeholder={getPlaceholderText()}
                      className="w-full rounded-lg resize-none"
                      style={{
                        padding: 'var(--spacing-md)',
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 'var(--font-weight-normal)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        outline: 'none',
                        minHeight: '80px',
                        lineHeight: '1.6',
                        transition: 'border-color 0.2s'
                      }}
                      onFocusCapture={(e) => {
                        (e.target as HTMLTextAreaElement).style.borderColor = 'var(--primary)';
                        (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                      }}
                      onBlurCapture={(e) => {
                        (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)';
                        (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 'var(--font-weight-normal)',
                        color: currentState?.description ? 'var(--foreground)' : 'var(--muted-foreground)',
                        margin: 0,
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--card)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        minHeight: '80px',
                        lineHeight: '1.6'
                      }}
                    >
                      {currentState?.description || 'No description'}
                    </p>
                  )}
                  <div className="flex justify-end" style={{ marginTop: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 'var(--font-weight-normal)',
                        color: localDescription.length > 450
                          ? (localDescription.length >= 500 ? '#ef4444' : '#f59e0b')
                          : 'var(--muted-foreground)'
                      }}
                    >
                      {localDescription.length} / {MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Media - Only for image mode */}
                {validation.mode === 'image' && (
                  <div>
                    <div className="flex items-center" style={{ gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                      <label
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--foreground)'
                        }}
                      >
                        Reference Media
                      </label>
                      <Tooltip text="Upload reference images or videos for comparison">
                        <Info className="size-3" style={{ color: 'var(--muted-foreground)' }} />
                      </Tooltip>
                    </div>

                    {currentMediaFiles.length > 0 ? (
                      <div>
                        <div
                          className="relative rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: 'var(--card)',
                            height: '180px',
                            marginBottom: 'var(--spacing-sm)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          {currentMedia?.type === 'image' ? (
                            <img
                              src={currentMedia.url}
                              alt={currentMedia.filename}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : currentMedia?.type === 'video' ? (
                            <video
                              src={currentMedia.url}
                              controls
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : null}

                          {currentMediaFiles.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentMediaIndex((prev) =>
                                  prev > 0 ? prev - 1 : currentMediaFiles.length - 1
                                )}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full transition-colors"
                                style={{
                                  padding: 'var(--spacing-sm)',
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'white'
                                }}
                              >
                                <ChevronLeft className="size-4" />
                              </button>
                              <button
                                onClick={() => setCurrentMediaIndex((prev) =>
                                  prev < currentMediaFiles.length - 1 ? prev + 1 : 0
                                )}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full transition-colors"
                                style={{
                                  padding: 'var(--spacing-sm)',
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'white'
                                }}
                              >
                                <ChevronRight className="size-4" />
                              </button>
                              <div
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                                style={{
                                  padding: '2px var(--spacing-sm)',
                                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                  fontSize: 'var(--text-xs)',
                                  fontFamily: 'var(--font-family)',
                                  color: 'white'
                                }}
                              >
                                {currentMediaIndex + 1} / {currentMediaFiles.length}
                              </div>
                            </>
                          )}

                          {editingEnabled && (
                            <button
                              onClick={() => handleDeleteMedia(currentMedia.id)}
                              className="absolute top-2 right-2 rounded-lg transition-colors"
                              style={{
                                padding: 'var(--spacing-xs)',
                                backgroundColor: 'var(--destructive)',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white'
                              }}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rounded-lg flex flex-col items-center justify-center"
                        style={{
                          backgroundColor: 'var(--card)',
                          padding: 'var(--spacing-xl)',
                          border: '2px dashed var(--border)',
                          marginBottom: 'var(--spacing-sm)',
                          minHeight: '100px',
                          gap: 'var(--spacing-xs)'
                        }}
                      >
                        <ImageIcon className="size-5" style={{ color: 'var(--muted-foreground)' }} />
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            color: 'var(--muted-foreground)',
                            margin: 0,
                            textAlign: 'center'
                          }}
                        >
                          No media added yet
                        </p>
                      </div>
                    )}

                    {editingEnabled && (
                      <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
                        {isActualMobileDevice && (
                          <>
                            <input
                              ref={captureInputRef}
                              type="file"
                              accept="image/*,video/*"
                              capture="environment"
                              onChange={(e) => handleMediaUpload(e.target.files, 'image')}
                              style={{ display: 'none' }}
                            />
                            <button
                              onClick={() => captureInputRef.current?.click()}
                              className="flex-1 flex items-center justify-center rounded-lg transition-colors"
                              style={{
                                gap: 'var(--spacing-xs)',
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-medium)'
                              }}
                            >
                              <Camera className="size-4" />
                              Take Photo
                            </button>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleMediaUpload(e.target.files, 'image')}
                          style={{ display: 'none' }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center rounded-lg transition-colors"
                          style={{
                            gap: 'var(--spacing-xs)',
                            padding: 'var(--spacing-md)',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          <Upload className="size-4" />
                          Upload Media
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{
            padding: 'var(--spacing-md) var(--spacing-xl)',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--secondary)'
          }}
        >
          {editingEnabled ? (
            <button
              onClick={onRemoveValidation}
              className="flex items-center rounded-lg transition-colors"
              style={{
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'transparent',
                color: 'var(--muted-foreground)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--destructive)';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted-foreground)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-medium)',
                color: completionState.total === completionState.max ? '#22c55e' : 'var(--muted-foreground)'
              }}
            >
              {completionState.total} of {completionState.max} completed
            </span>
            <button
              onClick={onClose}
              className="flex items-center rounded-lg transition-all"
              style={{
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Done
              <CheckCircle className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
