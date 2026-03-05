import { Plus, Edit2, Trash2, AlertCircle, Check, X, GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface StepAction {
  label: string;
  nextStepId: string;
}

interface OptionsContextMenuProps {
  actions: StepAction[];
  onAddAction: (label: string) => void;
  onEditAction: (index: number, newLabel: string) => void;
  onRemoveAction: (index: number) => void;
  onReorderActions: (fromIndex: number, toIndex: number) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

interface DraggableOptionItemProps {
  action: StepAction;
  index: number;
  isEditing: boolean;
  editText: string;
  onStartEdit: (index: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemove: (index: number) => void;
  onEditTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}

const DraggableOptionItem = ({ 
  action, 
  index, 
  isEditing, 
  editText, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onRemove, 
  onEditTextChange, 
  onKeyDown,
  onMove,
  editInputRef
}: DraggableOptionItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'OPTION',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'OPTION',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div 
      ref={ref}
      className="px-3 py-2 hover:bg-secondary/50 transition-colors"
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        background: isOver ? 'var(--accent)/10' : undefined
      }}
    >
      {isEditing ? (
        /* Edit Mode */
        <div className="flex gap-2">
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 px-2 py-1 rounded text-sm border"
            style={{
              fontFamily: 'var(--font-family)',
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
          />
          <button
            onClick={onSaveEdit}
            className="p-1 rounded hover:bg-secondary transition-colors"
            style={{ color: 'var(--accent)' }}
            aria-label="Save"
          >
            <Check className="size-4" />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1 rounded hover:bg-secondary transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        /* View Mode */
        <div className="flex items-center gap-2">
          <div 
            ref={drag}
            className="cursor-grab active:cursor-grabbing p-0.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <GripVertical className="size-3.5" />
          </div>
          <div 
            className="flex-1 text-sm"
            style={{ 
              fontFamily: 'var(--font-family)',
              color: 'var(--foreground)'
            }}
          >
            {action.label}
          </div>
          <button
            onClick={() => onStartEdit(index)}
            className="p-1 rounded hover:bg-secondary transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Edit option"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1 rounded hover:bg-secondary transition-colors"
            style={{ color: 'var(--destructive)' }}
            aria-label="Delete option"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const MAX_OPTION_LENGTH = 100;

function OptionsContextMenuContent({ 
  actions, 
  onAddAction, 
  onEditAction, 
  onRemoveAction, 
  onReorderActions,
  onClose, 
  position 
}: OptionsContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [newOptionText, setNewOptionText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // Focus input when opening
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    // Focus edit input when editing starts
    if (editingIndex !== null) {
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [editingIndex]);

  const handleAddOption = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) {
      setError('Option cannot be empty');
      return;
    }

    if (trimmed.length > MAX_OPTION_LENGTH) {
      setError(`Option too long (max ${MAX_OPTION_LENGTH} characters)`);
      return;
    }

    if (actions.some(a => a.label === trimmed)) {
      setError('This option already exists');
      return;
    }

    if (actions.length >= 20) {
      setError('Maximum 20 options per step');
      return;
    }

    onAddAction(trimmed);
    setNewOptionText('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(actions[index].label);
    setError(null);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const trimmed = editText.trim();
    if (!trimmed) {
      setError('Option cannot be empty');
      return;
    }

    if (trimmed.length > MAX_OPTION_LENGTH) {
      setError(`Option too long (max ${MAX_OPTION_LENGTH} characters)`);
      return;
    }

    // Check for duplicates (excluding current item)
    if (actions.some((a, i) => i !== editingIndex && a.label === trimmed)) {
      setError('This option already exists');
      return;
    }

    onEditAction(editingIndex, trimmed);
    setEditingIndex(null);
    setEditText('');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, isEdit: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEdit) {
        handleSaveEdit();
      } else {
        handleAddOption();
      }
    } else if (e.key === 'Escape') {
      if (isEdit) {
        handleCancelEdit();
      } else if (error) {
        setError(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 rounded-lg border overflow-hidden flex flex-col"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          background: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-elevation-lg)',
          minWidth: '280px',
          maxWidth: '320px',
          maxHeight: '480px'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{ 
            borderColor: 'var(--border)',
            background: 'var(--secondary)'
          }}
        >
          <h3 
            className="font-bold text-sm"
            style={{ 
              fontFamily: 'var(--font-family)',
              color: 'var(--foreground)'
            }}
          >
            Manage Options
          </h3>
          <p 
            className="text-xs mt-1"
            style={{ 
              fontFamily: 'var(--font-family)',
              color: 'var(--muted-foreground)'
            }}
          >
            {actions.length} option{actions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Add New Option Input */}
        <div 
          className="px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newOptionText}
              onChange={(e) => {
                setNewOptionText(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => handleKeyDown(e, false)}
              placeholder="New option..."
              className="flex-1 px-3 py-2 rounded-lg text-sm border"
              style={{
                fontFamily: 'var(--font-family)',
                background: 'var(--background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            />
            <button
              onClick={handleAddOption}
              disabled={!newOptionText.trim()}
              className="px-3 py-2 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-foreground)'
              }}
              aria-label="Add multi choice option"
            >
              <Plus className="size-4" />
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              className="flex items-start gap-2 mt-2 px-2 py-1.5 rounded text-xs"
              style={{
                background: 'var(--destructive)',
                color: 'white',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle className="size-3 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Options List */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ 
            maxHeight: '300px'
          }}
        >
          {actions.length === 0 ? (
            <div 
              className="px-4 py-8 text-center text-sm"
              style={{ 
                fontFamily: 'var(--font-family)',
                color: 'var(--muted-foreground)'
              }}
            >
              No options yet. Add one above.
            </div>
          ) : (
            <div className="py-2">
              {actions.map((action, index) => (
                <DraggableOptionItem
                  key={index}
                  action={action}
                  index={index}
                  isEditing={editingIndex === index}
                  editText={editText}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onRemove={(idx) => {
                    onRemoveAction(idx);
                    setError(null);
                  }}
                  onEditTextChange={(text) => {
                    setEditText(text);
                    setError(null);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                  onMove={onReorderActions}
                  editInputRef={editInputRef}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function OptionsContextMenu(props: OptionsContextMenuProps) {
  return <OptionsContextMenuContent {...props} />;
}
