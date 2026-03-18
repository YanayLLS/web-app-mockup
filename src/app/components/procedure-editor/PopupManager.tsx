import { X, Plus, Trash2, Upload, AlertCircle, Palette } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Popup, MediaFile } from './ProcedureEditor';

interface PopupManagerProps {
  popups: Popup[];
  onAddPopup: (popup: Popup) => void;
  onUpdatePopup: (id: string, updates: Partial<Popup>) => void;
  onRemovePopup: (id: string) => void;
  onClose: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export function PopupManager({ popups, onAddPopup, onUpdatePopup, onRemovePopup, onClose }: PopupManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPopup = () => {
    if (popups.length >= 10) {
      setError('Maximum 10 popups per step');
      return;
    }

    const newPopup: Popup = {
      id: crypto.randomUUID(),
      title: 'New Popup',
      description: 'Enter popup description here',
      position: { x: 100, y: 100 },
      color: '#ef4444',
      mediaFiles: [],
      confirmButtonText: 'OK',
      requiresConfirmation: false
    };
    
    onAddPopup(newPopup);
    setError(null);
  };

  const handleStartEdit = (popup: Popup) => {
    setEditingId(popup.id);
    setEditTitle(popup.title || '');
    setEditDescription(popup.description || '');
    setError(null);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle && !trimmedDescription) {
      setError('Popup must have at least a title or description');
      return;
    }

    onUpdatePopup(editingId, {
      title: trimmedTitle || undefined,
      description: trimmedDescription || undefined
    });
    
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setError(null);
  };

  const handleColorChange = (popupId: string, color: string) => {
    onUpdatePopup(popupId, { color });
    setShowColorPicker(null);
  };

  const handleMediaUpload = (popupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const popup = popups.find(p => p.id === popupId);
    if (!popup) return;

    if (popup.mediaFiles.length + files.length > 5) {
      setError('Maximum 5 media files per popup');
      return;
    }

    const newMediaFiles: MediaFile[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        id: crypto.randomUUID(),
        url,
        name: file.name,
        type: file.type,
        size: file.size
      };
      newMediaFiles.push(mediaFile);
    });

    onUpdatePopup(popupId, {
      mediaFiles: [...popup.mediaFiles, ...newMediaFiles]
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (popupId: string, mediaId: string) => {
    const popup = popups.find(p => p.id === popupId);
    if (!popup) return;

    const updatedMediaFiles = popup.mediaFiles.filter(m => m.id !== mediaId);
    onUpdatePopup(popupId, { mediaFiles: updatedMediaFiles });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showColorPicker) {
        setShowColorPicker(null);
      } else if (editingId) {
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
      'button:not([disabled]), [href], input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
        className="relative bg-card rounded-lg w-full max-w-[600px] shadow-elevation-sm max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-manager-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 id="popup-manager-title" className="text-card-foreground">
            Popup Manager
          </h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close popup manager"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Add Popup Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={handleAddPopup}
            disabled={popups.length >= 10}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-button hover:brightness-110 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center gap-2"
            aria-label="Add new popup"
           
          >
            <Plus className="size-4" />
            Add Popup
          </button>
          
          {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive rounded flex items-start gap-2" role="alert">
              <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Popups List */}
        <div className="flex-1 overflow-y-auto p-4">
          {popups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No popups yet</p>
              <p className="text-muted text-sm mt-1">Add popups to display additional information</p>
            </div>
          ) : (
            <div className="space-y-4">
              {popups.map((popup) => (
                <div
                  key={popup.id}
                  className="p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors border border-border"
                >
                  {editingId === popup.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value.slice(0, MAX_TITLE_LENGTH));
                          setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Popup title..."
                        maxLength={MAX_TITLE_LENGTH}
                        className="w-full bg-card border border-border rounded px-3 py-2 text-card-foreground outline-none focus:ring-2 focus:ring-ring"
                       
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => {
                          setEditDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH));
                          setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Popup description..."
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        rows={3}
                        className="w-full bg-card border border-border rounded px-3 py-2 text-card-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                       
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1.5 bg-accent text-accent-foreground rounded hover:brightness-110 text-sm font-bold"
                         
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded hover:brightness-110 text-sm"
                         
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-card-foreground">
                            {popup.title || 'Untitled Popup'}
                          </h4>
                          {popup.description && (
                            <p className="text-muted text-sm mt-1">
                              {popup.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Color Picker */}
                          <div className="relative">
                            <button
                              onClick={() => setShowColorPicker(showColorPicker === popup.id ? null : popup.id)}
                              className="p-1.5 rounded transition-colors size-8 flex items-center justify-center"
                              style={{ background: popup.color || '#ef4444' }}
                              aria-label="Change color"
                              title="Change color"
                            >
                              <Palette className="size-4 text-white" />
                            </button>
                            {showColorPicker === popup.id && (
                              <>
                                {/* Backdrop to close on outside click */}
                                <div 
                                  className="fixed inset-0 z-40"
                                  onClick={() => setShowColorPicker(null)}
                                />
                                {/* Color picker popover */}
                                <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-lg z-50"
                                  style={{ 
                                    boxShadow: 'var(--shadow-elevation-lg)',
                                    minWidth: '200px'
                                  }}
                                >
                                  <p className="text-card-foreground font-bold text-sm mb-3">
                                    Choose Color
                                  </p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => handleColorChange(popup.id, color)}
                                        className="size-10 rounded-lg hover:scale-110 transition-transform border-2 relative"
                                        style={{ 
                                          background: color,
                                          borderColor: popup.color === color ? 'var(--foreground)' : 'var(--border)'
                                        }}
                                        aria-label={`Color ${color}`}
                                      >
                                        {popup.color === color && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleStartEdit(popup)}
                            className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            aria-label="Edit popup"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onRemovePopup(popup.id)}
                            className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            aria-label="Delete popup"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Media Files */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-card-foreground">
                            Media Files ({popup.mediaFiles.length}/5)
                          </p>
                          <label className="cursor-pointer">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={(e) => handleMediaUpload(popup.id, e)}
                              className="hidden"
                              disabled={popup.mediaFiles.length >= 5}
                            />
                            <span className="flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded text-sm hover:brightness-110 transition-opacity disabled:opacity-50">
                              <Upload className="size-3" />
                              Upload
                            </span>
                          </label>
                        </div>

                        {popup.mediaFiles.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {popup.mediaFiles.map((media) => (
                              <div key={media.id} className="relative group">
                                <div className="aspect-video rounded overflow-hidden bg-secondary border border-border">
                                  {media.type.startsWith('image/') ? (
                                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <video src={media.url} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveMedia(popup.id, media.id)}
                                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                  aria-label="Remove media"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-muted text-sm">
            {popups.length} / 10 popups
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:brightness-110 transition-opacity"
           
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
