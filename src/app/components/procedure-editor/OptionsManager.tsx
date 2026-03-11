import { X, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface StepAction {
  label: string;
  nextStepId: string;
}

interface OptionsManagerProps {
  actions: StepAction[];
  onAddAction: (action: string) => void;
  onEditAction: (index: number, newText: string) => void;
  onRemoveAction: (index: number) => void;
  onClose: () => void;
}

const MAX_OPTION_LENGTH = 100;

export function OptionsManager({ actions, onAddAction, onEditAction, onRemoveAction, onClose }: OptionsManagerProps) {
  const [newAction, setNewAction] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    const trimmed = newAction.trim();
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
    setNewAction('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(actions[index].label);
    setError(null);
    setTimeout(() => editInputRef.current?.focus(), 0);
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
        handleAdd();
      }
    } else if (e.key === 'Escape') {
      if (isEdit) {
        handleCancelEdit();
      } else {
        onClose();
      }
    }
  };

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className="relative bg-card rounded-lg w-full max-w-[500px] shadow-elevation-sm max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 id="options-title" className="text-card-foreground">Options Manager</h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close options manager"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Multi Choice */}
        <div className="p-4 border-b border-border">
          <label htmlFor="new-option" className="block text-card-foreground font-bold mb-2">
            Add New Option
          </label>
          <div className="flex gap-2">
            <input
              id="new-option"
              ref={inputRef}
              type="text"
              value={newAction}
              onChange={(e) => {
                setNewAction(e.target.value.slice(0, MAX_OPTION_LENGTH));
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter option text..."
              maxLength={MAX_OPTION_LENGTH}
              className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              aria-describedby={error ? 'option-error' : undefined}
            />
            <button
              onClick={handleAdd}
              disabled={!newAction.trim()}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-button hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2"
              aria-label="Add multi choice option"
            >
              <Plus className="size-4" />
              Add
            </button>
          </div>
          <p className="text-muted text-xs mt-1">
            {newAction.length} / {MAX_OPTION_LENGTH} characters
          </p>
          
          {error && (
            <div id="option-error" className="mt-2 p-2 bg-destructive/10 border border-destructive rounded flex items-start gap-2" role="alert">
              <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-4">
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No options yet</p>
              <p className="text-muted text-sm mt-1">Add options for step progression choices</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group"
                >
                  {editingIndex === index ? (
                    <>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => {
                          setEditText(e.target.value.slice(0, MAX_OPTION_LENGTH));
                          setError(null);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, true)}
                        maxLength={MAX_OPTION_LENGTH}
                        className="flex-1 bg-card border border-border rounded px-3 py-1.5 text-card-foreground outline-none focus:ring-2 focus:ring-ring"
                        aria-label={`Edit option ${index + 1}`}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1.5 bg-accent text-accent-foreground rounded hover:opacity-90"
                        aria-label="Save edit"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 bg-secondary text-secondary-foreground rounded hover:opacity-90"
                        aria-label="Cancel edit"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-card-foreground">
                        {index + 1}. {action.label}
                      </span>
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Edit option ${index + 1}`}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete option \"${action.label}\"?`)) {
                            onRemoveAction(index);
                            setError(null);
                          }
                        }}
                        className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Delete option ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-muted text-sm">
            {actions.length} / 20 options
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
