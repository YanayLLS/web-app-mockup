import { Step, Popup, MediaFile } from './ProcedureEditor';
import { X, ChevronDown, ChevronLeft, ChevronRight, Plus, Palette, Pencil, CheckCircle, MoreVertical, Keyboard, Glasses, Video, RotateCcw, ExternalLink, Maximize2, PanelLeftClose } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from '../../../imports/svg-hd561eopnw';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ProcedurePanelProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  isTtsEnabled: boolean;
  onStepChange: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onUpdateStep: (updates: Partial<Step>) => void;
  onToggleTts: () => void;
  onAddTitle: () => void;
  onRemoveTitle: () => void;
  onAddDescription: () => void;
  onRemoveDescription: () => void;
  onRemoveAction: (index: number) => void;
  onAddStep: () => void;
  onDeleteStep: () => void;
  popups: Popup[];
  onRemovePopup: (id: string) => void;
  onAddPopup: (popup: Popup) => void;
  onShowPopupPanel: () => void;
  editingEnabled: boolean;
  showNewStepAnimation: boolean;
  stepPopAnimation: boolean;
  flashStepShadow: boolean;
  allSteps: Step[];
  onToggleTOC: () => void;
  isTOCOpen: boolean;
  isFirstVisibleStep: boolean;
  onChangeColor: (color: string) => void;
  onAddAction: (label: string) => void;
  onEditAction: (index: number, newLabel: string) => void;
  onRestart: () => void;
  onBack: () => void;
  onOpenFlowEditor: () => void;
  checkpointCount: number;
  hasCritical: boolean;
  onOpenValidation: () => void;
  layout?: 'topleft' | 'sidepanel';
  tocEnabled?: boolean;
  onCollapseSidepanel?: () => void;
}

export function ProcedurePanel({
  step,
  stepIndex,
  totalSteps,
  isTtsEnabled,
  onStepChange,
  onNext,
  onPrevious,
  onUpdateStep,
  onToggleTts,
  onAddTitle,
  onRemoveTitle,
  onAddDescription,
  onRemoveDescription,
  onRemoveAction,
  onAddStep,
  onDeleteStep,
  popups,
  onRemovePopup,
  onAddPopup,
  onShowPopupPanel,
  editingEnabled,
  showNewStepAnimation,
  stepPopAnimation,
  flashStepShadow,
  allSteps,
  onToggleTOC,
  isTOCOpen,
  isFirstVisibleStep,
  onChangeColor,
  onAddAction,
  onEditAction,
  onRestart,
  onBack,
  onOpenFlowEditor,
  checkpointCount,
  hasCritical,
  onOpenValidation,
  layout,
  tocEnabled,
  onCollapseSidepanel
}: ProcedurePanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [localTitle, setLocalTitle] = useState(step.title || '');
  const [localDescription, setLocalDescription] = useState(step.description || '');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const optionsScrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [cameraAnimationEnabled, setCameraAnimationEnabled] = useState(true);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [inlineMediaIndex, setInlineMediaIndex] = useState(0);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
  const [editingActionLabel, setEditingActionLabel] = useState('');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const isResizing = useRef(false);

  // Right-edge drag-to-resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = cardWidth;

    // Block iframe from stealing mouse events during drag
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(f => (f.style.pointerEvents = 'none'));

    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(200, Math.min(startWidth + (ev.clientX - startX), window.innerWidth * 0.5));
      setCardWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      iframes.forEach(f => (f.style.pointerEvents = ''));
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [cardWidth]);

  const shadowColor = step.color || '#36415d';
  const isLastStep = stepIndex === totalSteps - 1;
  const isSidepanel = layout === 'sidepanel';

  // Sidepanel color scheme: dark text on white bg
  const textColor = isSidepanel ? 'text-[#36415D]' : 'text-white';
  const textMuted = isSidepanel ? 'text-[#868D9E]' : 'text-white/60';

  // Flash shadow color - use accent/button color for the flash
  const currentShadowColor = flashStepShadow ? 'var(--accent)' : shadowColor;

  const checkScrollButtons = useCallback(() => {
    const container = optionsScrollRef.current;
    if (!container) return;
    
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  }, []);

  const scrollOptions = (direction: 'left' | 'right') => {
    const container = optionsScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    
    // Check scroll buttons after animation
    setTimeout(checkScrollButtons, 300);
  };

  const handleNextOrAddStep = () => {
    onNext();
  };

  const CardWrapper = motion.div;
  
  // Check scroll buttons when actions change or component mounts
  useEffect(() => {
    setTimeout(checkScrollButtons, 100);
  }, [step.actions.length, checkScrollButtons]);

  // Also check on window resize
  useEffect(() => {
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollButtons]);

  // Reset inline media index when step changes
  useEffect(() => {
    setInlineMediaIndex(0);
  }, [step.id]);

  // Sync local state with step props when not editing
  useEffect(() => {
    if (!isEditingTitle) {
      setLocalTitle(step.title || '');
    }
  }, [step.title, isEditingTitle]);

  useEffect(() => {
    if (!isEditingDescription) {
      setLocalDescription(step.description || '');
    }
  }, [step.description, isEditingDescription]);

  // Auto-enter editing mode when title is first added
  useEffect(() => {
    if (step.title === 'Enter step title here' && !isEditingTitle) {
      // Use setTimeout to break out of the render cycle
      setTimeout(() => setIsEditingTitle(true), 0);
    }
  }, [step.title]);

  // Click outside to close color picker
  useClickOutside([colorPickerRef, colorButtonRef], () => setShowColorPicker(false), showColorPicker);

  // Click outside to close more menu
  useClickOutside(moreMenuRef, () => setShowMoreMenu(false), showMoreMenu);

  const colorOptions = [
    { name: 'Default', color: 'var(--foreground)' },
    { name: 'Blue', color: 'var(--primary)' },
    { name: 'Green', color: 'var(--accent)' },
    { name: 'Red', color: 'var(--destructive)' },
    { name: 'Purple', color: '#9b51e0' },
    { name: 'Orange', color: '#f2994a' },
  ];

  // Auto-select text when entering title edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Auto-enter editing mode when description is first added
  useEffect(() => {
    if (step.description === 'Enter step description here' && !isEditingDescription) {
      // Use setTimeout to break out of the render cycle
      setTimeout(() => setIsEditingDescription(true), 0);
    }
  }, [step.description]);
  
  // Determine animation type
  let cardProps;
  if (showNewStepAnimation) {
    // New step animation - slide up
    cardProps = {
      initial: { y: 50, opacity: 0, scale: 0.95 },
      animate: { y: 0, opacity: 1, scale: 1 },
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }
    };
  } else if (stepPopAnimation) {
    // Pop animation for step navigation
    cardProps = {
      animate: { 
        scale: [1, 1.05, 1],
      },
      transition: { 
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1] // Elastic ease out
      }
    };
  } else {
    // No animation
    cardProps = {
      initial: false,
      animate: { y: 0, opacity: 1, scale: 1 }
    };
  }

  return (
    <>
    <CardWrapper
      data-tutorial="step-card"
      ref={cardRef}
      className={`content-stretch flex ${layout === 'topleft' || layout === 'sidepanel' ? 'items-start justify-start flex-col' : 'items-end justify-end'} relative shrink-0 ${layout === 'topleft' ? '' : layout === 'sidepanel' ? 'w-full h-full' : (isCollapsed ? 'w-auto' : 'w-full sm:w-[700px] max-w-[calc(100vw-32px)]')} z-10`}
      style={{
        pointerEvents: 'auto',
        ...(layout === 'topleft' ? { width: `${cardWidth}px`, height: 'auto', maxHeight: '90vh', transition: 'none' } : {}),
        ...(layout === 'sidepanel' ? { transition: 'none' } : {})
      }}
      {...(layout === 'sidepanel' ? {} : cardProps)}
    >
      <div
        className={`${layout === 'sidepanel' ? 'bg-white' : 'bg-[rgba(0,0,0,0.5)]'} ${layout === 'topleft' || layout === 'sidepanel' ? 'w-full h-full' : 'flex-[1_0_0] min-h-px min-w-px'} relative ${layout === 'sidepanel' ? '' : 'rounded-[10px]'}`}
        style={layout === 'sidepanel' ? {} : {
          boxShadow: `0px 4px 48.9px ${currentShadowColor}`,
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        {layout !== 'sidepanel' && <div aria-hidden="true" className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[10px]" />}
        <div className={`flex flex-col ${layout === 'sidepanel' ? 'h-full' : 'items-center'} ${layout !== 'topleft' && layout !== 'sidepanel' ? 'justify-center size-full' : ''} ${layout === 'topleft' ? 'p-[20px]' : layout === 'sidepanel' ? 'p-[24px]' : 'p-[8px]'} m-[0px]`}>
          <div className={`content-stretch flex flex-col ${layout === 'sidepanel' ? 'h-full' : 'items-center'} ${layout !== 'topleft' && layout !== 'sidepanel' ? 'justify-center' : ''} relative w-full`} style={{ gap: layout === 'sidepanel' ? 'var(--spacing-lg)' : 'var(--spacing-md)', zIndex: 1 }}>
            <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" style={{ zIndex: 2 }}>
              <div className="content-stretch flex flex-col items-start w-full" style={{ zIndex: 3 }}>
                  {/* Header */}
                  <div className="content-stretch flex items-center relative shrink-0 w-full">
                    <button 
                      onClick={onToggleTts}
                      className="content-stretch cursor-pointer flex items-center justify-center relative shrink-0 w-[28px] h-[28px] sm:w-[32px] sm:h-[32px]"
                      title={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                    >
                      {isTtsEnabled ? (
                        <div className="relative shrink-0 size-[20px] sm:size-[24px]">
                          <svg className={`block size-full ${textColor}`} fill="currentColor" viewBox="0 0 16 15">
                            <path d={svgPaths.p184348c0} />
                          </svg>
                        </div>
                      ) : (
                        <div className="relative shrink-0 size-[20px] sm:size-[24px]">
                          <svg className={`block size-full ${textColor}`} fill="currentColor" viewBox="0 0 16 15">
                            <path d={svgPaths.p184348c0} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[2px] h-full bg-destructive rotate-45 origin-center" style={{ boxShadow: '0 0 2px rgba(255,31,31,0.8)' }} />
                          </div>
                        </div>
                      )}
                    </button>
                    
                    {/* Warning label for popups - Click to create or view */}
                    <button
                      onClick={() => {
                        if (popups.length === 0) {
                          // Auto-create first popup
                          const newPopup: Popup = {
                            id: crypto.randomUUID(),
                            title: 'New Warning',
                            description: 'Enter warning description here',
                            position: { x: 100, y: 100 },
                            color: 'var(--destructive)',
                            mediaFiles: [],
                            confirmButtonText: 'OK',
                            requiresConfirmation: false
                          };
                          onAddPopup(newPopup);
                        }
                        // Always show the popup panel
                        onShowPopupPanel();
                      }}
                      className="relative shrink-0 cursor-pointer rounded-lg transition-all"
                      style={{
                        padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)',
                        background: isSidepanel
                          ? (popups.length === 0 ? 'rgba(255, 31, 31, 0.1)' : 'rgba(255, 31, 31, 0.12)')
                          : (popups.length === 0 ? 'rgba(255, 31, 31, 0.15)' : 'rgba(255, 31, 31, 0.2)'),
                        border: isSidepanel
                          ? (popups.length === 0 ? '1px solid rgba(255, 31, 31, 0.5)' : '1px solid rgba(255, 31, 31, 0.6)')
                          : (popups.length === 0 ? '1px solid rgba(255, 31, 31, 0.3)' : '1px solid rgba(255, 31, 31, 0.4)'),
                        marginLeft: 'var(--spacing-xs)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isSidepanel ? 'rgba(255, 31, 31, 0.15)' : 'rgba(255, 31, 31, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSidepanel
                          ? (popups.length === 0 ? 'rgba(255, 31, 31, 0.1)' : 'rgba(255, 31, 31, 0.12)')
                          : (popups.length === 0 ? 'rgba(255, 31, 31, 0.15)' : 'rgba(255, 31, 31, 0.2)');
                      }}
                      title={popups.length === 0 ? "Add warning" : "View warnings"}
                    >
                      <p
                        className={`${isSidepanel ? 'text-[#FF1F1F]' : 'text-white'} whitespace-nowrap text-xs sm:text-sm font-medium flex items-center`}
                        style={{

                          gap: 'var(--spacing-xs)',
                          opacity: isSidepanel ? 1 : 0.9
                        }}
                      >
                        {popups.length === 0 && <Plus className="size-3" />}
                        {popups.length > 0 && (
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        {popups.length === 0 ? 'Warning' : 'Warning'}
                      </p>
                    </button>
                    
                    {/* Checkpoint badge — hidden in topleft layout */}
                    {checkpointCount > 0 && layout !== 'topleft' && (
                      <button
                        onClick={onOpenValidation}
                        className="relative shrink-0 cursor-pointer rounded-lg transition-all flex items-center"
                        style={{
                          padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)',
                          background: hasCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          border: hasCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                          gap: 'var(--spacing-xs)',
                          marginLeft: 'var(--spacing-xs)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = hasCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = hasCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                        }}
                        title={`${checkpointCount} checkpoint${checkpointCount !== 1 ? 's' : ''}${hasCritical ? ' (critical)' : ''}`}
                      >
                        <CheckCircle className="size-3" style={{ color: hasCritical ? '#ef4444' : '#3b82f6' }} />
                        <p
                          className="text-white whitespace-nowrap text-xs sm:text-sm font-medium"
                          style={{
                            
                            opacity: 0.9
                          }}
                        >
                          {checkpointCount}
                        </p>
                      </button>
                    )}

                    <button
                      onClick={tocEnabled ? onToggleTOC : undefined}
                      className={`relative shrink-0 rounded-lg transition-all ${tocEnabled ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{
                        padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)',
                        background: isTOCOpen && tocEnabled ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        border: isTOCOpen && tocEnabled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (tocEnabled && !isTOCOpen) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isTOCOpen && tocEnabled ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
                      }}
                      title={!tocEnabled ? `Step ${stepIndex + 1} of ${totalSteps}` : isTOCOpen ? "Close Table of Contents" : "Open Table of Contents"}
                    >
                      <p
                        className={`${textColor} whitespace-nowrap text-xs sm:text-sm font-medium`}
                        style={{

                          opacity: isTOCOpen ? 1 : 0.9,
                        }}
                      >
Step {stepIndex + 1} of {totalSteps}
                      </p>
                    </button>
                    <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                      <div className="flex-[1_0_0] h-full min-h-px min-w-px" />
                    </div>
                    <div className="content-stretch flex items-center relative shrink-0" style={{ gap: 'var(--spacing-sm)', padding: 'var(--spacing-xs)' }}>
                      {/* Color Picker Button - Only show if editing enabled */}
                      {editingEnabled && (
                        <button 
                          ref={colorButtonRef}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="relative rounded-[3px] shrink-0 size-[20px] sm:size-[24px] min-h-[44px] min-w-[44px] cursor-pointer hover:bg-white/10 flex items-center justify-center"
                          title="Change step color"
                        >
                          <Palette className="size-3 sm:size-4 text-white/70 hover:text-white transition-colors" />
                        </button>
                      )}
                      <button
                        onClick={() => isSidepanel && onCollapseSidepanel ? onCollapseSidepanel() : setIsCollapsed(!isCollapsed)}
                        className={`relative rounded-[3px] shrink-0 size-[20px] sm:size-[24px] cursor-pointer ${isSidepanel ? 'hover:bg-[#E9E9E9]' : 'hover:bg-[rgba(255,255,255,0.1)]'} flex items-center justify-center`}
                        title={isSidepanel ? "Hide panel" : isCollapsed ? "Expand" : "Collapse"}
                      >
                        {isSidepanel ? (
                          <PanelLeftClose className={`size-3 sm:size-4 ${textColor}`} />
                        ) : (
                          <ChevronDown
                            className={`size-3 sm:size-4 ${textColor} transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* Text box - Hidden when collapsed */}
                  {!isCollapsed && (
                    <div
                      className={`w-full flex flex-col relative ${layout === 'topleft' || isSidepanel ? 'overflow-y-auto' : ''}`}
                      style={{
                        gap: isSidepanel ? 'var(--spacing-lg)' : 'var(--spacing-md)',
                        minHeight: layout === 'topleft' || isSidepanel ? undefined : '61px',
                        pointerEvents: 'auto',
                        zIndex: 100,
                        isolation: 'isolate',
                        marginTop: 'var(--spacing-md)'
                      }}
                    >
                      {/* Title Section */}
                      {step.title !== undefined ? (
                        isEditingTitle && editingEnabled ? (
                          // Edit mode - show input
                          <div
                            className="w-full"
                            style={{
                              padding: 'var(--spacing-xs)',
                              borderRadius: 'var(--radius)',
                              pointerEvents: 'auto',
                              zIndex: 10,
                              position: 'relative'
                            }}
                          >
                            <input
                              ref={titleInputRef}
                              type="text"
                              value={localTitle}
                              onChange={(e) => setLocalTitle(e.target.value)}
                              onBlur={() => {
                                onUpdateStep({ title: localTitle });
                                setIsEditingTitle(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  onUpdateStep({ title: localTitle });
                                  setIsEditingTitle(false);
                                } else if (e.key === 'Escape') {
                                  setLocalTitle(step.title || '');
                                  setIsEditingTitle(false);
                                }
                              }}
                              className="w-full text-white outline-none"
                              style={{
                                backgroundColor: '#368dc4',
                                
                                fontSize: 'var(--text-h4)',
                                fontWeight: 'var(--font-weight-bold)',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius)',
                                lineHeight: '1.5',
                                border: '2px solid white',
                                pointerEvents: 'auto',
                                touchAction: 'auto',
                                zIndex: 1
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          // Display mode - clickable to edit
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Title clicked for editing');
                              if (editingEnabled) {
                                setIsEditingTitle(true);
                              }
                            }}
                            className="w-full text-left group"
                            style={{
                              padding: 'var(--spacing-xs)',
                              borderRadius: 'var(--radius)',
                              pointerEvents: 'auto',
                              zIndex: 10,
                              cursor: editingEnabled ? 'pointer' : 'default',
                              position: 'relative'
                            }}
                          >
                            <div
                              className={`${textColor} whitespace-pre-wrap line-clamp-2`}
                              style={{

                                fontSize: isSidepanel ? 'var(--text-h3)' : 'var(--text-h4)',
                                fontWeight: 'var(--font-weight-bold)',
                                lineHeight: '1.5',
                                pointerEvents: 'none'
                              }}
                            >
                              {step.title}
                            </div>
                            {editingEnabled && (
                              <div 
                                className="absolute inset-0 border-2 border-transparent group-hover:border-white transition-colors pointer-events-none"
                                style={{ borderRadius: 'var(--radius)' }}
                              />
                            )}
                          </button>
                        )
                      ) : (
                        editingEnabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Add Title clicked!');
                              onAddTitle();
                              // After adding title, enter edit mode
                              setTimeout(() => setIsEditingTitle(true), 100);
                            }}
                            className="w-full flex items-center justify-center border-2 border-dashed border-transparent hover:border-white transition-colors"
                            style={{
                              padding: 'var(--spacing-xs)',
                              borderRadius: 'var(--radius)',
                              pointerEvents: 'auto',
                              zIndex: 10,
                              cursor: 'pointer',
                              position: 'relative',
                              minHeight: '40px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <span 
                              className="text-white opacity-70"
                              style={{
                                
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-normal)',
                                pointerEvents: 'none'
                              }}
                            >
                              + Add Title
                            </span>
                          </button>
                        )
                      )}

                      {/* Description Section */}
                      {step.description !== undefined ? (
                        isEditingDescription && editingEnabled ? (
                          // Edit mode - show textarea
                          <div
                            className="w-full relative"
                            style={{
                              padding: 'var(--spacing-xs)',
                              borderRadius: 'var(--radius)',
                              pointerEvents: 'auto',
                              zIndex: 10
                            }}
                          >
                            <textarea
                              value={localDescription}
                              onChange={(e) => setLocalDescription(e.target.value)}
                              onBlur={() => {
                                onUpdateStep({ description: localDescription });
                                setIsEditingDescription(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  e.preventDefault();
                                  onUpdateStep({ description: localDescription });
                                  setIsEditingDescription(false);
                                } else if (e.key === 'Escape') {
                                  setLocalDescription(step.description || '');
                                  setIsEditingDescription(false);
                                }
                              }}
                              className="w-full text-white outline-none resize-none overflow-y-auto"
                              style={{
                                backgroundColor: '#368dc4',
                                
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-normal)',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius)',
                                lineHeight: '1.5',
                                border: '2px solid white',
                                pointerEvents: 'auto',
                                touchAction: 'auto',
                                zIndex: 1,
                                minHeight: '66px',
                                maxHeight: '500px'
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          // Display mode - wrapper with edit button
                          <div className="w-full relative group" style={{ padding: 'var(--spacing-xs)' }}>
                            {/* Clickable text area to toggle expand/collapse */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDescriptionExpanded(!isDescriptionExpanded);
                              }}
                              className="w-full text-left"
                              style={{
                                borderRadius: 'var(--radius)',
                                pointerEvents: 'auto',
                                zIndex: 10,
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                            >
                              <div
                                className={`${textColor} whitespace-pre-wrap overflow-hidden`}
                                style={{

                                  fontSize: isSidepanel ? 'var(--text-sm)' : layout === 'topleft' ? '12px' : 'var(--text-sm)',
                                  fontWeight: 'var(--font-weight-normal)',
                                  lineHeight: isSidepanel ? '1.6' : layout === 'topleft' ? '1.55' : '1.5',
                                  pointerEvents: 'none',
                                  ...(layout === 'topleft' || isSidepanel ? {
                                    overflowY: 'auto' as const,
                                    maxHeight: 'none',
                                  } : {
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical' as const,
                                    WebkitLineClamp: isDescriptionExpanded ? 'unset' : 3,
                                    maxHeight: isDescriptionExpanded ? '500px' : 'none',
                                    overflowY: isDescriptionExpanded ? 'auto' as const : 'hidden' as const,
                                  })
                                }}
                              >
                                {step.description}
                              </div>
                            </button>

                            {/* Edit button - only show when editing is enabled */}
                            {editingEnabled && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsEditingDescription(true);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
                                style={{
                                  zIndex: 20
                                }}
                                title="Edit description"
                                aria-label="Edit description"
                              >
                                <Pencil className="size-3 text-white" />
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        editingEnabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Add Description clicked!');
                              onAddDescription();
                              // After adding description, enter edit mode
                              setTimeout(() => setIsEditingDescription(true), 100);
                            }}
                            className="w-full flex items-center justify-center border-2 border-dashed border-transparent hover:border-white transition-colors"
                            style={{
                              height: '66px',
                              padding: 'var(--spacing-xs)',
                              borderRadius: 'var(--radius)',
                              pointerEvents: 'auto',
                              zIndex: 10,
                              cursor: 'pointer',
                              position: 'relative',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <span 
                              className="text-white opacity-70"
                              style={{
                                
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-normal)',
                                pointerEvents: 'none'
                              }}
                            >
                              + Add Description
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Inline Media — shown inside card in topleft/sidepanel layout */}
            {(layout === 'topleft' || isSidepanel) && !isCollapsed && step.mediaFiles.length > 0 && (
              <div className="shrink-0 w-full flex flex-col" style={{ zIndex: 3, gap: '6px' }}>
                {/* Expand button */}
                <div className="flex items-center justify-end w-full">
                  <button
                    className={`shrink-0 ${isSidepanel ? 'text-[#868D9E] hover:text-[#36415D]' : 'text-white/60 hover:text-white/90'} transition-colors cursor-pointer`}
                    title="Expand media"
                  >
                    <Maximize2 className="size-3" />
                  </button>
                </div>

                {/* Clean media image — no overlapping UI */}
                <div
                  className="w-full rounded-lg overflow-hidden"
                  style={{ aspectRatio: '4/3', background: isSidepanel ? '#E9E9E9' : 'rgba(0,0,0,0.6)' }}
                >
                  {step.mediaFiles[inlineMediaIndex]?.type.startsWith('image') ? (
                    <img
                      src={step.mediaFiles[inlineMediaIndex].url}
                      alt={step.mediaFiles[inlineMediaIndex].name}
                      className="w-full h-full object-cover"
                    />
                  ) : step.mediaFiles[inlineMediaIndex]?.type.startsWith('video') ? (
                    <video
                      src={step.mediaFiles[inlineMediaIndex].url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : null}
                </div>

                {/* Controls row below media: arrows + dots */}
                {step.mediaFiles.length > 1 && (
                  <div className="flex items-center justify-center w-full" style={{ gap: '8px' }}>
                    <button
                      onClick={() => setInlineMediaIndex((inlineMediaIndex - 1 + step.mediaFiles.length) % step.mediaFiles.length)}
                      className={`shrink-0 rounded-full p-1 transition-colors cursor-pointer ${isSidepanel ? 'bg-[#E9E9E9] hover:bg-[#D9E0F0]' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      <ChevronLeft className={`size-3.5 ${textColor}`} />
                    </button>

                    <div className="flex items-center" style={{ gap: '4px' }}>
                      {step.mediaFiles.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setInlineMediaIndex(i)}
                          className="rounded-full transition-all cursor-pointer"
                          style={{
                            width: i === inlineMediaIndex ? '12px' : '5px',
                            height: '5px',
                            background: isSidepanel
                              ? (i === inlineMediaIndex ? '#36415D' : '#C2C9DB')
                              : (i === inlineMediaIndex ? 'white' : 'rgba(255,255,255,0.5)'),
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setInlineMediaIndex((inlineMediaIndex + 1) % step.mediaFiles.length)}
                      className={`shrink-0 rounded-full p-1 transition-colors cursor-pointer ${isSidepanel ? 'bg-[#E9E9E9] hover:bg-[#D9E0F0]' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      <ChevronRight className={`size-3.5 ${textColor}`} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Always show if there are actions or editing is enabled, and not collapsed */}
            {!isCollapsed && (step.actions.length > 0 || editingEnabled) && (
              <div className="relative shrink-0 w-full" style={{ zIndex: 5 }}>
                <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-center justify-center relative w-full" style={{ gap: 'var(--spacing-sm)' }}>
                    <div className="flex flex-[1_0_0] flex-row items-center self-stretch relative">
                      {/* Left Arrow */}
                      {showLeftArrow && (
                        <button
                          onClick={() => scrollOptions('left')}
                          className="absolute left-0 z-10 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-elevation-sm transition-all"
                          style={{ padding: 'var(--spacing-xs)' }}
                          aria-label="Scroll left"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                      )}
                      
                      {/* Options Container */}
                      <div
                        ref={optionsScrollRef}
                        onScroll={checkScrollButtons}
                        className={`content-stretch cursor-pointer flex flex-[1_0_0] h-full items-center justify-center min-h-px min-w-px ${layout === 'topleft' ? 'flex-wrap overflow-hidden' : 'overflow-x-auto overflow-y-clip'} relative scrollbar-hide`}
                        style={{
                          gap: 'var(--spacing-xs)',
                          padding: 'var(--spacing-sm)'
                        }}
                      >
                        {step.actions.map((action, index) => {
                          const targetStepIndex = allSteps.findIndex(s => s.id === action.nextStepId);
                          const isEditing = editingActionIndex === index;
                          
                          return (
                            <div 
                              key={index}
                              className="bg-[rgba(0,0,0,0.5)] content-stretch flex items-center justify-center relative rounded-[25px] shrink-0 group hover:bg-[rgba(0,0,0,0.7)] transition-colors"
                              style={{ 
                                gap: 'var(--spacing-sm)',
                                paddingLeft: 'var(--spacing-md)',
                                paddingRight: 'var(--spacing-md)',
                                paddingTop: 'var(--spacing-sm)',
                                paddingBottom: 'var(--spacing-sm)'
                              }}
                            >
                              <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                              
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingActionLabel}
                                  onChange={(e) => setEditingActionLabel(e.target.value)}
                                  onBlur={() => {
                                    if (editingActionLabel.trim()) {
                                      onEditAction(index, editingActionLabel.trim());
                                    }
                                    setEditingActionIndex(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (editingActionLabel.trim()) {
                                        onEditAction(index, editingActionLabel.trim());
                                      }
                                      setEditingActionIndex(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingActionIndex(null);
                                    }
                                  }}
                                  className="bg-transparent border-none outline-none text-white text-center text-[10px] sm:text-[12px] min-w-[60px]"
                                  style={{
                                    
                                    fontWeight: 'var(--font-weight-normal)'
                                  }}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      if (targetStepIndex !== -1) {
                                        onStepChange(targetStepIndex);
                                      }
                                    }}
                                    className="text-white text-[10px] sm:text-[12px] whitespace-nowrap cursor-pointer"
                                    style={{
                                      
                                      fontWeight: 'var(--font-weight-normal)'
                                    }}
                                    title={`Go to step ${targetStepIndex + 1}`}
                                  >
                                    {action.label}
                                  </button>
                                  
                                  {editingEnabled && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingActionIndex(index);
                                        setEditingActionLabel(action.label);
                                      }}
                                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-1"
                                      title="Edit option name"
                                    >
                                      <Pencil className="size-2.5 sm:size-3 text-white/70 hover:text-white transition-colors" />
                                    </button>
                                  )}
                                </>
                              )}

                              {editingEnabled && !isEditing && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveAction(index);
                                  }}
                                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-1"
                                  title="Remove option"
                                >
                                  <X className="size-3 text-white" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* + Multi Choice Button - Styled like an option */}
                        {editingEnabled && (
                          <button
                            onClick={() => {
                              const defaultLabel = `Option ${step.actions.length + 1}`;
                              onAddAction(defaultLabel);
                            }}
                            className="bg-[rgba(0,0,0,0.5)] content-stretch flex items-center justify-center relative rounded-[25px] shrink-0 hover:bg-accent/30 transition-colors"
                            style={{ 
                              gap: 'var(--spacing-sm)',
                              paddingLeft: 'var(--spacing-md)',
                              paddingRight: 'var(--spacing-md)',
                              paddingTop: 'var(--spacing-sm)',
                              paddingBottom: 'var(--spacing-sm)'
                            }}
                            title="Multi Choice"
                          >
                            <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                            <Plus className="size-3 sm:size-4 text-white/70" />
                            <span 
                              className="text-white text-[10px] sm:text-[12px] whitespace-nowrap"
                              style={{
                                
                                fontWeight: 'var(--font-weight-normal)'
                              }}
                            >
                              Multi Choice
                            </span>
                          </button>
                        )}
                      </div>
                      
                      {/* Right Arrow */}
                      {showRightArrow && (
                        <button
                          onClick={() => scrollOptions('right')}
                          className="absolute right-0 z-10 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-elevation-sm transition-all"
                          style={{ padding: 'var(--spacing-xs)' }}
                          aria-label="Scroll right"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popups Display - Removed, popups are now accessed via Warning button */}

            {/* Controls or Completion UI */}
            <div data-tutorial="controls" className={`content-stretch flex flex-col items-center relative shrink-0 w-full ${isSidepanel ? 'mt-auto' : ''}`} style={{ pointerEvents: 'auto', zIndex: 4, marginTop: isSidepanel ? undefined : layout === 'topleft' && isCollapsed ? 'var(--spacing-sm)' : 'var(--spacing-lg)' }}>
              {isLastStep && !editingEnabled ? (
                /* Completion UI */
                <div 
                  className="flex flex-col items-center w-full"
                  style={{ gap: 'var(--spacing-lg)' }}
                >
                  {/* Success Icon with Pulsing Ring */}
                  <div 
                    className="relative"
                    style={{ width: '80px', height: '80px' }}
                  >
                    {/* Outer Pulsing Ring */}
                    <div 
                      className="absolute rounded-full animate-pulse"
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'var(--accent)',
                        opacity: 0.2,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    {/* Inner Circle */}
                    <div 
                      className="absolute rounded-full"
                      style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--accent)',
                        boxShadow: 'var(--elevation-sm)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    {/* Checkmark Icon */}
                    <svg 
                      className="absolute"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>

                  {/* Text Content */}
                  <div 
                    className="flex flex-col items-center"
                    style={{ gap: 'var(--spacing-md)' }}
                  >
                    <div 
                      className="flex flex-col items-center"
                      style={{ gap: 'var(--spacing-xs)' }}
                    >
                      <h2 
                        style={{
                          color: 'white',
                          fontSize: 'var(--text-h3)',
                          
                          fontWeight: 'var(--font-weight-bold)',
                          margin: 0
                        }}
                      >
                        Procedure Completed!
                      </h2>
                      <p 
                        style={{
                          color: 'white',
                          opacity: 0.8,
                          fontSize: 'var(--text-sm)',
                          
                          fontWeight: 'var(--font-weight-normal)',
                          margin: 0
                        }}
                      >
                        You've successfully finished all steps
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div 
                      className="flex items-center"
                      style={{ gap: 'var(--spacing-sm)' }}
                    >
                      {/* Back Button */}
                      <button
                        onClick={onPrevious}
                        className="transition-transform active:scale-95 hover:scale-105"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: 'var(--radius-button)',
                          paddingLeft: 'var(--spacing-md)',
                          paddingRight: 'var(--spacing-md)',
                          paddingTop: 'var(--spacing-md)',
                          paddingBottom: 'var(--spacing-md)',
                          boxShadow: 'var(--elevation-sm)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ChevronLeft 
                          className="size-5"
                          style={{ color: 'white' }}
                        />
                      </button>

                      {/* Restart Button */}
                      <button
                        onClick={onRestart}
                        className="group relative overflow-hidden transition-transform active:scale-95 hover:scale-105"
                        style={{
                          backgroundColor: 'var(--primary)',
                          borderRadius: 'var(--radius-button)',
                          paddingLeft: 'var(--spacing-xl)',
                          paddingRight: 'var(--spacing-xl)',
                          paddingTop: 'var(--spacing-md)',
                          paddingBottom: 'var(--spacing-md)',
                          boxShadow: 'var(--elevation-sm)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Shimmer Effect */}
                        <div 
                          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                          }}
                        />
                        <span
                          style={{
                            color: 'var(--primary-foreground)',
                            fontSize: 'var(--text-sm)',
                            
                            fontWeight: 'var(--font-weight-normal)',
                            position: 'relative'
                          }}
                        >
                          Restart Procedure
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Navigation Controls */
                <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" style={{ gap: 'var(--spacing-sm)' }}>
                  <div className="bg-[rgba(217,224,240,0)] content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative rounded-[25px]" style={{ gap: 'var(--spacing-xs) var(--spacing-sm)' }}>
                    <div className="flex flex-row items-center self-stretch">
                      <button 
                        onClick={() => {
                          console.log('Back button clicked, isFirstVisibleStep:', isFirstVisibleStep);
                          onPrevious();
                        }}
                        disabled={isFirstVisibleStep}
                        className={`${isSidepanel ? 'bg-[#E9E9E9] hover:bg-[#D9E0F0]' : 'bg-[rgba(0,0,0,0.5)] hover:bg-[rgba(0,0,0,0.7)]'} h-full min-h-[44px] relative rounded-[25px] shrink-0 w-[40px] sm:w-[50px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer`}
                        style={{ pointerEvents: 'auto', zIndex: 1 }}
                      >
                        <div className="overflow-clip relative rounded-[inherit] size-full flex items-center justify-center">
                          <ChevronLeft className={`size-4 sm:size-5 ${textColor}`} />
                        </div>
                        {!isSidepanel && <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />}
                      </button>
                    </div>
                    <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                      <div className="flex-[1_0_0] h-full min-h-px min-w-px" />
                    </div>
                    <button 
                      onClick={handleNextOrAddStep}
                      className={`content-stretch flex h-[30px] sm:h-[35px] min-h-[44px] items-center justify-center relative rounded-[25px] shrink-0 min-w-[70px] sm:min-w-[80px] transition-all ${
                        isLastStep 
                          ? editingEnabled 
                            ? 'bg-transparent border-2 border-dashed border-primary/60 hover:border-primary hover:bg-primary/10' 
                            : 'opacity-0 pointer-events-none'
                          : 'bg-[#2f80ed] hover:bg-[#2571d1]'
                      }`}
                      style={{
                        paddingLeft: 'var(--spacing-md)',
                        paddingRight: 'var(--spacing-md)',
                        paddingTop: 'var(--spacing-xs)',
                        paddingBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <p className={`font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[9px] sm:text-[10px] ${
                        isLastStep ? 'text-primary' : 'text-white'
                      }`} style={{ fontVariationSettings: "'wdth' 100" }}>
                        {isLastStep ? 'Add step' : 'Next'}
                      </p>
                    </button>
                    {/* Only show Play button if there's animation */}
                    {step.hasAnimation && (
                      <button className="-translate-x-1/2 absolute bg-[rgba(0,0,0,0.5)] cursor-pointer min-h-[44px] h-[30px] sm:h-[35px] left-1/2 rounded-[25px] top-px w-[50px] sm:w-[61px] hover:bg-[rgba(0,0,0,0.7)] transition-colors">
                        <div className="flex items-center justify-center gap-1 rounded-[inherit] size-full" style={{ padding: 'var(--spacing-xs)' }}>
                          <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[9px] sm:text-[10px] text-left text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Play
                          </p>
                          <div className="relative shrink-0 size-[8px] sm:size-[10px]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 14">
                              <path d="M0 0L0 14L9 7L0 0Z" fill="white" />
                            </svg>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[25px]" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      {/* Right-edge resize handle */}
      {layout === 'topleft' && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute top-0 -right-[5px] w-[12px] h-full cursor-ew-resize group/resize z-20"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-white/0 group-hover/resize:bg-white/30 transition-colors" />
        </div>
      )}
    </CardWrapper>

      {/* Color Picker Menu - Rendered outside card to avoid z-index stacking issues */}
      {showColorPicker && editingEnabled && (
        <>
          {/* Backdrop to block all pointer events */}
          <div 
            className="fixed inset-0 z-[9998] cursor-default"
            onClick={() => setShowColorPicker(false)}
            style={{ pointerEvents: 'auto' }}
          />
          <div 
            ref={colorPickerRef}
            className="fixed bg-card border border-border rounded-lg z-[9999]"
            style={{
              top: colorButtonRef.current ? colorButtonRef.current.getBoundingClientRect().bottom + 4 : '28px',
              left: colorButtonRef.current ? Math.max(8, Math.min(colorButtonRef.current.getBoundingClientRect().right - 156, window.innerWidth - 164)) : 'auto',
              padding: 'var(--spacing-sm)',
              boxShadow: 'var(--elevation-sm)',
              maxWidth: 'calc(100vw - 16px)'
            }}
            role="menu"
            aria-label="Color picker"
          >
            <div className="flex flex-col min-w-[140px]" style={{ gap: 'var(--spacing-xs)' }}>
              {colorOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    onChangeColor(option.color);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center w-full text-left hover:bg-secondary/50 rounded transition-colors"
                  style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    gap: 'var(--spacing-sm)'
                  }}
                >
                  <div
                    className="shrink-0 size-4 rounded-full border border-border"
                    style={{ backgroundColor: option.color }}
                  />
                  <span 
                    className="text-foreground"
                    style={{
                      
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    {/* Hotkeys Overlay */}
    {showHotkeys && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setShowHotkeys(false)}
      >
        <div
          className="rounded-xl w-[420px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
            padding: 'var(--spacing-xl)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-semibold">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setShowHotkeys(false)}
              className="rounded-md p-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="size-4 text-white/70" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { keys: ['→', 'Space'], label: 'Next step' },
              { keys: ['←'], label: 'Previous step' },
              { keys: ['Home'], label: 'First step' },
              { keys: ['End'], label: 'Last step' },
              { keys: ['R'], label: 'Restart procedure' },
              { keys: ['T'], label: 'Toggle text-to-speech' },
              { keys: ['Esc'], label: 'Close / Go back' },
              { keys: ['F'], label: 'Toggle fullscreen' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-white/70 text-sm">
                  {shortcut.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {shortcut.keys.map((key, j) => (
                    <span key={j}>
                      {j > 0 && <span className="text-white/30 text-xs mx-1">or</span>}
                      <kbd
                        className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-md text-xs text-white/90 font-medium"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0 8px',
                          
                        }}
                      >
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
