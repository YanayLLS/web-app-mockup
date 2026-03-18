import { Plus, GripVertical, Check } from 'lucide-react';
import { Step, StepAction } from './ProcedureEditor';
import { motion } from 'motion/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface TableOfContentsProps {
  steps: Step[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onAddStep: () => void;
  onDeleteStep: (index: number) => void;
  onRenameStep: (index: number, newTitle: string) => void;
  onActionSelect: (stepIndex: number, actionIndex: number) => void;
  selectedActionPath: Map<string, number>;
  onAddAction: (stepIndex: number, label: string) => void;
  onEditAction: (stepIndex: number, actionIndex: number, newLabel: string) => void;
  onRemoveAction: (stepIndex: number, actionIndex: number) => void;
  onReorderActions: (stepIndex: number, fromIndex: number, toIndex: number) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
  editingEnabled: boolean;
  onClose?: () => void;
  procedureTitle?: string;
}

interface VisibleStep {
  step: Step;
  index: number;
  depth: number; // 0 for root, 1+ for nested from options
  parentActionLabel?: string; // 'a', 'b', 'c' etc.
  displayNumber?: number; // Visual number in TOC for display purposes
}

interface DraggableStepProps {
  visibleStep: VisibleStep;
  currentStepIndex: number;
  hoveredIndex: number | null;
  dropIndicatorIndex: number | null;
  onStepChange: (index: number) => void;
  onHoverChange: (index: number | null) => void;
  onAddOption: (stepIndex: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDropIndicatorChange: (index: number | null) => void;
  getStepTitle: (step: Step, index: number) => string;
  getStepState: (index: number) => 'visited' | 'selected' | 'default';
  editingEnabled: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onRename?: (stepIndex: number) => void;
  onDelete?: (stepIndex: number) => void;
}

const DraggableStep = ({
  visibleStep,
  currentStepIndex,
  hoveredIndex,
  dropIndicatorIndex,
  onStepChange,
  onHoverChange,
  onAddOption,
  onMove,
  onDropIndicatorChange,
  getStepTitle,
  getStepState,
  editingEnabled,
  isEditing,
  editValue,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onRename,
  onDelete
}: DraggableStepProps) => {
  const { step, index, depth, parentActionLabel } = visibleStep;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'STEP',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDropIndicatorChange(null);
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'STEP',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      // Just show the drop indicator, don't actually move yet
      onDropIndicatorChange(hoverIndex);
    },
    drop: (item: { index: number }) => {
      const dragIndex = item.index;
      const dropIndex = index;
      if (dragIndex !== dropIndex) {
        onMove(dragIndex, dropIndex);
      }
      onDropIndicatorChange(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  const state = getStepState(index);
  const isHovered = hoveredIndex === index;
  const showDropIndicator = dropIndicatorIndex === index;

  // Styling based on state
  const bgColor = state === 'visited' ? 'var(--muted)' : state === 'selected' ? 'var(--primary)' : 'var(--secondary)';
  const textColor = state === 'visited' ? 'var(--muted)' : state === 'selected' ? 'var(--primary)' : 'var(--foreground)';
  const numberBgColor = state === 'visited' ? 'var(--muted)' : state === 'selected' ? 'var(--primary)' : 'var(--secondary)';
  const numberTextColor = state === 'visited' || state === 'selected' ? 'var(--primary-foreground)' : 'var(--foreground)';
  
  // Calculate indentation based on depth
  const indentWidth = depth * 16; // 16px per level

  // If editing, show input field
  if (isEditing) {
    return (
      <div
        ref={ref}
        className="relative"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {showDropIndicator && (
          <div 
            className="absolute left-0 right-0 -top-1 h-0.5 z-10"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 4px var(--primary)',
            }}
          />
        )}
        
        <div
          className="flex items-center gap-2 rounded-lg w-full"
          style={{
            gap: '8px',
            padding: '8px',
            paddingLeft: `${8 + indentWidth + 32}px`,
            background: 'var(--secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEditSubmit();
              } else if (e.key === 'Escape') {
                onEditCancel();
              }
            }}
            className="flex-1 bg-transparent border-none outline-none"
            style={{
              color: 'var(--foreground)',
              
              fontSize: '12px'
            }}
            placeholder="Step name"
          />

          <button
            onClick={onEditSubmit}
            className="flex items-center justify-center p-1 rounded transition-all shrink-0"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
            title="Confirm"
          >
            <Check className="size-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="relative"
      onMouseEnter={() => onHoverChange(index)}
      onMouseLeave={() => onHoverChange(null)}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Drop indicator line */}
      {showDropIndicator && (
        <div 
          className="absolute left-0 right-0 -top-1 h-0.5 z-10"
          style={{
            background: 'var(--primary)',
            boxShadow: '0 0 4px var(--primary)',
          }}
        />
      )}
      
      <div className="flex items-center gap-2">
      {/* Drag Handle */}
      <div
        ref={drag}
        className="cursor-grab active:cursor-grabbing p-1 rounded transition-opacity shrink-0"
        style={{
          color: 'var(--muted-foreground)',
          opacity: isHovered ? 1 : 0,
          marginLeft: `${indentWidth}px`,
        }}
      >
        <GripVertical className="size-3.5" />
      </div>

      <button
        onClick={() => onStepChange(index)}
        className="content-stretch flex items-center relative rounded-lg shrink-0 flex-1 transition-all"
        style={{
          gap: '12px',
          padding: '8px',
          background: isHovered ? 'var(--secondary)' : 'transparent',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Branch indicator for nested steps */}
        {depth > 0 && parentActionLabel && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div 
              className="text-xs font-bold rounded px-1"
              style={{ 
                color: textColor,
                
                opacity: 0.6
              }}
            >
              {parentActionLabel}→
            </div>
          </div>
        )}

        {/* Step Number Circle */}
        <div 
          className="content-stretch flex flex-col items-center justify-center relative rounded-lg shrink-0 size-5"
          style={{ 
            background: numberBgColor,
            minWidth: '20px',
            paddingLeft: '4px',
            paddingRight: '4px'
          }}
        >
          <p 
            className="leading-[0] text-xs text-center whitespace-nowrap"
            style={{ 
              color: numberTextColor,
              
            }}
          >
            {visibleStep.displayNumber ?? index + 1}
          </p>
        </div>

        {/* Step Title */}
        <div 
          className="flex flex-[1_0_0] flex-col justify-center leading-[0] min-h-px min-w-px relative text-left"
          style={{ 
            color: textColor,
            
          }}
        >
          <p 
            className={`leading-normal text-xs whitespace-pre-wrap line-clamp-2 ${state === 'selected' ? 'font-bold' : ''}`}
           
          >
            {getStepTitle(step, index)}
          </p>
        </div>

        {/* Connection Indicator - Show if step has custom connection */}
        {step.nextStepId && (
          <div 
            className="flex items-center justify-center rounded-full shrink-0 size-4"
            style={{ 
              background: 'var(--accent)',
              color: 'var(--accent-foreground)'
            }}
            title="Connected to another step"
          >
            <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        )}
      </button>

      {/* Multi Choice Button - Show on hover when editing is enabled */}
      {isHovered && editingEnabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddOption(index);
          }}
          className="flex items-center justify-center p-1.5 rounded transition-all shrink-0 mr-2"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            opacity: isHovered ? 1 : 0
          }}
          aria-label="Add multi choice option to step"
          title="Multi Choice"
        >
          <Plus className="size-3" />
        </button>
      )}
      
      {/* Rename and Delete Buttons - Show on hover when editing is enabled */}
      {isHovered && editingEnabled && (
        <>
          {onRename && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(index);
              }}
              className="flex items-center justify-center p-1.5 rounded transition-all shrink-0"
              style={{
                background: 'var(--secondary)',
                color: 'var(--foreground)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--secondary)';
              }}
              aria-label="Rename step"
              title="Rename step"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="flex items-center justify-center p-1.5 rounded transition-all shrink-0 mr-2"
              style={{
                background: 'var(--secondary)',
                color: 'var(--destructive)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--destructive)';
                e.currentTarget.style.color = 'var(--destructive-foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--secondary)';
                e.currentTarget.style.color = 'var(--destructive)';
              }}
              aria-label="Delete step"
              title="Delete step"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </>
      )}
      </div>
    </div>
  );
};

interface DraggableOptionProps {
  stepIndex: number;
  action: StepAction;
  actionIndex: number;
  isOptionSelected: boolean;
  indentWidth: number;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onActionSelect: () => void;
  onHover: (hover: boolean) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onDropIndicatorChange: (stepIndex: number, actionIndex: number | null) => void;
  dropIndicatorActionIndex: number | null;
  getOptionLabel: (index: number) => string;
  editingEnabled: boolean;
  onRename?: () => void;
  onDelete?: () => void;
}

const DraggableOption = ({
  stepIndex,
  action,
  actionIndex,
  isOptionSelected,
  indentWidth,
  isEditing,
  editValue,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onActionSelect,
  onHover,
  onMove,
  onDropIndicatorChange,
  dropIndicatorActionIndex,
  getOptionLabel,
  editingEnabled,
  onRename,
  onDelete
}: DraggableOptionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [{ isDragging }, drag] = useDrag({
    type: 'OPTION',
    item: { stepIndex, actionIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDropIndicatorChange(stepIndex, null);
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'OPTION',
    hover: (item: { stepIndex: number; actionIndex: number }) => {
      if (item.stepIndex !== stepIndex) return; // Only allow reordering within same step
      if (item.actionIndex === actionIndex) return;
      
      // Show the drop indicator
      onDropIndicatorChange(stepIndex, actionIndex);
    },
    drop: (item: { stepIndex: number; actionIndex: number }) => {
      if (item.stepIndex !== stepIndex) return;
      if (item.actionIndex !== actionIndex) {
        onMove(item.actionIndex, actionIndex);
      }
      onDropIndicatorChange(stepIndex, null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && (monitor.getItem() as any)?.stepIndex === stepIndex,
    }),
  });

  drag(drop(ref));
  
  const showDropIndicator = dropIndicatorActionIndex === actionIndex;

  const optionNumberBgColor = isOptionSelected ? 'var(--primary)' : 'var(--secondary)';
  const optionTextColor = isOptionSelected ? 'var(--primary)' : 'var(--foreground)';
  const optionNumberTextColor = isOptionSelected ? 'var(--primary-foreground)' : 'var(--foreground)';

  if (isEditing) {
    return (
      <div
        ref={ref}
        onClick={() => onActionSelect()}
        className="relative cursor-pointer"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {/* Drop indicator line */}
        {showDropIndicator && (
          <div 
            className="absolute left-0 right-0 -top-1 h-0.5 z-10"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 4px var(--primary)',
            }}
          />
        )}
        
        <div
          className="content-stretch flex items-center relative rounded-lg shrink-0 w-full"
          style={{
            gap: '12px',
            padding: '8px',
            paddingLeft: `${8 + indentWidth + 32}px`,
            background: 'var(--secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
        {/* Option Letter Circle */}
        <div
          className="content-stretch flex flex-col items-center justify-center relative rounded-lg shrink-0 size-5"
          style={{
            background: optionNumberBgColor,
            minWidth: '20px',
            paddingLeft: '4px',
            paddingRight: '4px'
          }}
        >
          <p
            className="leading-[0] text-xs text-center whitespace-nowrap"
            style={{
              color: optionNumberTextColor,
              
            }}
          >
            {getOptionLabel(actionIndex)}
          </p>
        </div>

        {/* Editable Input */}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onEditSubmit();
            } else if (e.key === 'Escape') {
              onEditCancel();
            }
          }}
          className="flex-1 px-2 py-1 rounded outline-none"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--primary)',
            color: 'var(--foreground)',
            
            fontSize: '12px'
          }}
          placeholder="Option name"
        />

        {/* OK Button */}
        <button
          onClick={onEditSubmit}
          className="flex items-center justify-center p-1 rounded transition-all shrink-0"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }}
          title="Confirm"
        >
          <Check className="size-3" />
        </button>
      </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover(false);
      }}
      className="relative"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Drop indicator line */}
      {showDropIndicator && (
        <div 
          className="absolute left-0 right-0 -top-1 h-0.5 z-10"
          style={{
            background: 'var(--primary)',
            boxShadow: '0 0 4px var(--primary)',
          }}
        />
      )}
      
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing p-1 rounded transition-opacity shrink-0"
          style={{
            color: 'var(--muted-foreground)',
            opacity: isHovered ? 1 : 0,
            marginLeft: `${indentWidth + 32}px`,
          }}
        >
          <GripVertical className="size-3" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionSelect();
          }}
          className="content-stretch flex items-center relative rounded-lg shrink-0 flex-1 transition-all"
          style={{
            gap: '12px',
            padding: '8px',
            paddingLeft: isHovered ? '8px' : `${8}px`,
            background: isHovered ? 'var(--secondary)' : 'transparent',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Option Letter Circle */}
          <div
            className="content-stretch flex flex-col items-center justify-center relative rounded-lg shrink-0 size-5"
            style={{
              background: optionNumberBgColor,
              minWidth: '20px',
              paddingLeft: '4px',
              paddingRight: '4px'
            }}
          >
            <p
              className="leading-[0] text-xs text-center whitespace-nowrap"
              style={{
                color: optionNumberTextColor,
                
              }}
            >
              {getOptionLabel(actionIndex)}
            </p>
          </div>

          {/* Option Text */}
          <div
            className="flex flex-[1_0_0] flex-col justify-center leading-[0] min-h-px min-w-px relative text-left"
            style={{
              color: optionTextColor,
              
            }}
          >
            <p
              className={`leading-normal text-xs whitespace-pre-wrap line-clamp-2 ${isOptionSelected ? 'font-bold' : ''}`}
             
            >
              {action.label}
            </p>
          </div>
        </button>

        {/* Rename and Delete Buttons - Show on hover when editing is enabled */}
        {isHovered && editingEnabled && !isEditing && (
          <>
            {onRename && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
                className="flex items-center justify-center p-1.5 rounded transition-all shrink-0"
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)';
                }}
                aria-label="Rename option"
                title="Rename option"
              >
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center justify-center p-1.5 rounded transition-all shrink-0 mr-2"
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--destructive)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--destructive)';
                  e.currentTarget.style.color = 'var(--destructive-foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)';
                  e.currentTarget.style.color = 'var(--destructive)';
                }}
                aria-label="Delete option"
                title="Delete option"
              >
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function TableOfContentsContent({
  steps,
  currentStepIndex,
  onStepChange,
  onAddStep,
  onDeleteStep,
  onRenameStep,
  onActionSelect,
  selectedActionPath,
  onAddAction,
  onEditAction,
  onRemoveAction,
  onReorderActions,
  onReorderSteps,
  editingEnabled,
  onClose,
  procedureTitle
}: TableOfContentsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const [editingOption, setEditingOption] = useState<{ stepIndex: number; actionIndex: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [dropIndicatorOption, setDropIndicatorOption] = useState<{ stepIndex: number; actionIndex: number | null } | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editStepValue, setEditStepValue] = useState('');
  const [deletedStep, setDeletedStep] = useState<{ step: Step; index: number } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  
  // State for undoable option deletion
  const [deletedOption, setDeletedOption] = useState<{ stepIndex: number; actionIndex: number; action: any } | null>(null);
  const [showOptionUndoToast, setShowOptionUndoToast] = useState(false);
  
  // State for undoable option rename
  const [renamedOption, setRenamedOption] = useState<{ stepIndex: number; actionIndex: number; oldLabel: string; newLabel: string } | null>(null);
  const [showRenameUndoToast, setShowRenameUndoToast] = useState(false);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handler for starting step rename
  const handleStartRename = (stepIndex: number) => {
    const step = steps[stepIndex];
    setEditingStepIndex(stepIndex);
    setEditStepValue(step.title || '');
  };

  // Handler for submitting step rename
  const handleStepEditSubmit = () => {
    if (editingStepIndex !== null) {
      onRenameStep(editingStepIndex, editStepValue.trim());
      setEditingStepIndex(null);
      setEditStepValue('');
    }
  };

  // Handler for canceling step rename
  const handleStepEditCancel = () => {
    setEditingStepIndex(null);
    setEditStepValue('');
  };

  // Handler for deleting step with undo
  const handleDeleteStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    setDeletedStep({ step, index: stepIndex });
    onDeleteStep(stepIndex);
    setShowUndoToast(true);
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setShowUndoToast(false);
      setDeletedStep(null);
    }, 5000);
  };

  // Handler for undoing delete
  const handleUndoDelete = () => {
    if (deletedStep) {
      // TODO: Implement undo logic - need to add onRestoreStep to props
      console.log('Undo delete', deletedStep);
      setShowUndoToast(false);
      setDeletedStep(null);
    }
  };

  // Build the visible path based on selected actions
  const visibleSteps = useMemo(() => {
    const visible: VisibleStep[] = [];
    const visitedStepIds = new Set<string>();

    // Find the first step (no parent)
    const rootStep = steps.find(s => !s.parentStepId);
    if (!rootStep) return visible;

    // Recursive function to add step and its children
    const addStepToPath = (stepId: string, depth: number = 0, parentActionLabel?: string) => {
      const step = steps.find(s => s.id === stepId);
      if (!step || visitedStepIds.has(stepId)) return;

      const stepIndex = steps.indexOf(step);
      visitedStepIds.add(stepId);
      
      visible.push({
        step,
        index: stepIndex,
        depth,
        parentActionLabel
      });

      // If this step has actions and one is selected, follow that path
      if (step.actions.length > 0) {
        const selectedActionIndex = selectedActionPath.get(step.id);
        
        if (selectedActionIndex !== undefined && step.actions[selectedActionIndex]) {
          const selectedAction = step.actions[selectedActionIndex];
          const actionLabel = String.fromCharCode(97 + selectedActionIndex); // 'a', 'b', 'c'...
          // Steps from options should remain at the same depth level (not indented more)
          addStepToPath(selectedAction.nextStepId, depth, actionLabel);
        } else {
          // Has actions but none selected, still check for linear next step
          const linearNext = steps.find(s => 
            s.parentStepId === step.id && s.parentActionIndex === undefined
          );
          if (linearNext) {
            addStepToPath(linearNext.id, depth, parentActionLabel);
          }
        }
      } else {
        // No actions, check for linear next step
        const linearNext = steps.find(s => 
          s.parentStepId === step.id && s.parentActionIndex === undefined
        );
        if (linearNext) {
          addStepToPath(linearNext.id, depth, parentActionLabel);
        }
      }
    };

    // Start from root
    addStepToPath(rootStep.id);

    return visible;
  }, [steps, selectedActionPath]);

  const getStepTitle = (step: Step, index: number) => {
    if (step.title) return step.title;
    return `Step ${index + 1}`;
  };

  // Determine step state based on current step and visible path
  const getStepState = (index: number): 'visited' | 'selected' | 'default' => {
    // Find the current step in the visible steps list
    const currentVisibleIndex = visibleSteps.findIndex(vs => vs.index === currentStepIndex);
    const stepVisibleIndex = visibleSteps.findIndex(vs => vs.index === index);
    
    // If step is not in visible path, it's not visited
    if (stepVisibleIndex === -1) return 'default';
    
    // Check if this step comes before current step in the visible path
    if (stepVisibleIndex < currentVisibleIndex) return 'visited';
    if (stepVisibleIndex === currentVisibleIndex) return 'selected';
    return 'default';
  };

  // Get the option letter label (a, b, c, etc.)
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(97 + index); // 97 is 'a'
  };

  const handleAddOption = (stepIndex: number) => {
    const step = steps[stepIndex];
    const isFirstAction = step.actions.length === 0;
    const newActionIndex = step.actions.length;
    const currentStepsLength = steps.length;
    
    // Add a new action with a default label
    const newLabel = `Option ${newActionIndex + 1}`;
    onAddAction(stepIndex, newLabel);
    
    // Navigate to the step (select it)
    onStepChange(stepIndex);
    
    // Select the newly added option and navigate to its child step
    // The new step will be added at the end of the steps array (index = currentStepsLength)
    setTimeout(() => {
      onActionSelect(stepIndex, newActionIndex);
      
      // Navigate to the newly created child step (which is at the end of the steps array)
      // This will make the child step the active step
      setTimeout(() => {
        // The new child step should be at index currentStepsLength (the old length)
        onStepChange(currentStepsLength);
      }, 50); // Longer timeout to ensure steps array is updated
    }, 0);
    
    // Set editing mode for the newly added option
    setEditingOption({ stepIndex, actionIndex: newActionIndex });
    setEditValue(newLabel);
  };

  const handleEditSubmit = () => {
    if (editingOption && editValue.trim()) {
      const step = steps[editingOption.stepIndex];
      const action = step.actions[editingOption.actionIndex];
      const oldLabel = action.label;
      const newLabel = editValue.trim();
      
      // Only create undo if the label actually changed
      if (oldLabel !== newLabel) {
        onEditAction(editingOption.stepIndex, editingOption.actionIndex, newLabel);
        
        // Set up undo for rename
        setRenamedOption({
          stepIndex: editingOption.stepIndex,
          actionIndex: editingOption.actionIndex,
          oldLabel,
          newLabel
        });
        setShowRenameUndoToast(true);
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setShowRenameUndoToast(false);
          setRenamedOption(null);
        }, 5000);
      }
    }
    setEditingOption(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingOption(null);
    setEditValue('');
  };
  
  // Handler for deleting option with undo
  const handleDeleteOption = (stepIndex: number, actionIndex: number) => {
    const step = steps[stepIndex];
    const action = step.actions[actionIndex];
    
    setDeletedOption({ stepIndex, actionIndex, action });
    onRemoveAction(stepIndex, actionIndex);
    setShowOptionUndoToast(true);
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setShowOptionUndoToast(false);
      setDeletedOption(null);
    }, 5000);
  };
  
  // Handler for undoing option delete
  const handleUndoOptionDelete = () => {
    if (deletedOption) {
      // Re-add the action
      onAddAction(deletedOption.stepIndex, deletedOption.action.label);
      setShowOptionUndoToast(false);
      setDeletedOption(null);
    }
  };
  
  // Handler for undoing option rename
  const handleUndoOptionRename = () => {
    if (renamedOption) {
      // Restore the old label
      onEditAction(renamedOption.stepIndex, renamedOption.actionIndex, renamedOption.oldLabel);
      setShowRenameUndoToast(false);
      setRenamedOption(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed z-50 flex flex-col
        sm:left-4 sm:top-4 sm:bottom-4 sm:w-full sm:max-w-[320px]
        max-sm:inset-0 max-sm:w-full max-sm:h-full"
      style={{
        background: 'var(--card)',
        backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-elevation-lg)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between border-b"
        style={{ 
          padding: 'var(--spacing-md, 12px)',
          borderColor: 'var(--border)'
        }}
      >
        <h4 style={{ 
          color: 'var(--foreground)',
          
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: '1.2'
        }}>
          {procedureTitle || 'Untitled Flow'}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-button transition-all"
            style={{
              background: 'transparent',
              color: 'var(--muted-foreground)',
              borderRadius: 'var(--radius-md)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--secondary)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
            aria-label="Close table of contents"
            title="Close"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Steps List - with gradient fade at bottom */}
      <div className="flex-1 overflow-y-auto overflow-x-clip relative scrollbar-hide" style={{ padding: 'var(--spacing-md, 12px)' }}>
        <div className="flex flex-col gap-0.5">
          {visibleSteps.map((visibleStep, displayIndex) => {
            const { step, index } = visibleStep;
            const hasOptions = step.actions.length > 0;
            const selectedOption = selectedActionPath.get(step.id);
            
            return (
              <div key={step.id}>
                {/* Main Step Row */}
                <DraggableStep
                  visibleStep={{ ...visibleStep, displayNumber: displayIndex + 1 }}
                  currentStepIndex={currentStepIndex}
                  hoveredIndex={hoveredIndex}
                  dropIndicatorIndex={dropIndicatorIndex}
                  onStepChange={(stepIndex) => {
                    // If the step has options, automatically select the first option if none is selected
                    const clickedStep = steps[stepIndex];
                    if (clickedStep.actions.length > 0) {
                      const currentSelection = selectedActionPath.get(clickedStep.id);
                      if (currentSelection === undefined) {
                        onActionSelect(stepIndex, 0);
                      }
                    }
                    onStepChange(stepIndex);
                    
                    // Close TOC on mobile after navigation
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  onHoverChange={setHoveredIndex}
                  onAddOption={handleAddOption}
                  onMove={onReorderSteps}
                  onDropIndicatorChange={setDropIndicatorIndex}
                  getStepTitle={getStepTitle}
                  getStepState={getStepState}
                  editingEnabled={editingEnabled}
                  isEditing={editingStepIndex === index}
                  editValue={editStepValue}
                  onEditChange={setEditStepValue}
                  onEditSubmit={handleStepEditSubmit}
                  onEditCancel={handleStepEditCancel}
                  onRename={handleStartRename}
                  onDelete={steps.length > 1 ? handleDeleteStep : undefined}
                />

                {/* Options - Show when step has actions */}
                {hasOptions && (
                  <div className="flex flex-col gap-0.5">
                    {step.actions.map((action: StepAction, actionIndex: number) => {
                      const isOptionSelected = selectedOption === actionIndex;
                      const depth = visibleStep.depth;
                      const indentWidth = depth * 16;
                      const isEditing = editingOption?.stepIndex === index && editingOption?.actionIndex === actionIndex;
                      const dropIndicatorActionIndex = dropIndicatorOption?.stepIndex === index ? dropIndicatorOption?.actionIndex : null;

                      return (
                        <DraggableOption
                          key={actionIndex}
                          stepIndex={index}
                          action={action}
                          actionIndex={actionIndex}
                          isOptionSelected={isOptionSelected}
                          indentWidth={indentWidth}
                          isEditing={isEditing}
                          editValue={editValue}
                          onEditChange={setEditValue}
                          onEditSubmit={handleEditSubmit}
                          onEditCancel={handleEditCancel}
                          onActionSelect={() => {
                            onActionSelect(index, actionIndex);
                            
                            // Close TOC on mobile after action selection
                            if (isMobile && onClose) {
                              onClose();
                            }
                          }}
                          onHover={(hover) => setHoveredIndex(hover ? `${index}-${actionIndex}` as any : null)}
                          onMove={(fromIndex, toIndex) => onReorderActions(index, fromIndex, toIndex)}
                          onDropIndicatorChange={(stepIdx, actionIdx) => setDropIndicatorOption({ stepIndex: stepIdx, actionIndex: actionIdx })}
                          dropIndicatorActionIndex={dropIndicatorActionIndex}
                          getOptionLabel={getOptionLabel}
                          editingEnabled={editingEnabled}
                          onRename={() => {
                            setEditingOption({ stepIndex: index, actionIndex });
                            setEditValue(action.label);
                          }}
                          onDelete={() => {
                            handleDeleteOption(index, actionIndex);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Add Step Button at end of list - only show when editing is enabled */}
          {editingEnabled && (
            <button
              onClick={() => {
                // Add step as a child of the last visible step in the TOC
                if (visibleSteps.length > 0) {
                  const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
                  // Navigate to the last visible step first, then add
                  onStepChange(lastVisibleStep.index);
                  // Use setTimeout to ensure the step change completes
                  setTimeout(() => {
                    onAddStep();
                  }, 0);
                } else {
                  onAddStep();
                }
              }}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-lg transition-all mt-2 group"
              style={{
                background: 'transparent',
                border: '2px dashed var(--border)',
                color: 'var(--muted-foreground)',
                
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent-foreground)';
                e.currentTarget.style.borderStyle = 'solid';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--muted-foreground)';
                e.currentTarget.style.borderStyle = 'dashed';
              }}
              aria-label="Add new step"
            >
              <Plus className="size-4" />
              <span>
                Add Step
              </span>
            </button>
          )}
        </div>


      </div>

      {/* Undo Toast for Step Deletion */}
      {showUndoToast && deletedStep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 rounded-lg shadow-lg flex items-center justify-between p-3 z-50"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              color: 'var(--foreground)',
              
              fontSize: '13px',
            }}
          >
            Step deleted
          </span>
          <button
            onClick={handleUndoDelete}
            className="px-3 py-1 rounded transition-all"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Undo
          </button>
        </motion.div>
      )}

      {/* Undo Toast for Option Deletion */}
      {showOptionUndoToast && deletedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 rounded-lg shadow-lg flex items-center justify-between p-3 z-50"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              color: 'var(--foreground)',
              
              fontSize: '13px',
            }}
          >
            Option deleted
          </span>
          <button
            onClick={handleUndoOptionDelete}
            className="px-3 py-1 rounded transition-all"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Undo
          </button>
        </motion.div>
      )}

      {/* Undo Toast for Option Rename */}
      {showRenameUndoToast && renamedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 rounded-lg shadow-lg flex items-center justify-between p-3 z-50"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              color: 'var(--foreground)',
              
              fontSize: '13px',
            }}
          >
            Option renamed
          </span>
          <button
            onClick={handleUndoOptionRename}
            className="px-3 py-1 rounded transition-all"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Undo
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export function TableOfContents(props: TableOfContentsProps) {
  return <TableOfContentsContent {...props} />;
}
