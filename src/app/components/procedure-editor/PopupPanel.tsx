import { Popup, MediaFile } from './ProcedureEditor';
import { X, ChevronLeft, ChevronRight, Plus, Palette, AlertCircle, Upload, Trash2, Folders } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaManagerModal } from './MediaManagerModal';

interface PopupPanelProps {
  popups: Popup[];
  onAddPopup: (popup: Popup) => void;
  onUpdatePopup: (id: string, updates: Partial<Popup>) => void;
  onRemovePopup: (id: string) => void;
  editingEnabled: boolean;
  onClose: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_BUTTON_TEXT_LENGTH = 30;
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

export function PopupPanel({
  popups,
  onAddPopup,
  onUpdatePopup,
  onRemovePopup,
  editingEnabled,
  onClose
}: PopupPanelProps) {
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingButtonText, setIsEditingButtonText] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localButtonText, setLocalButtonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMediaManager, setShowMediaManager] = useState(false);
  
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPopup = popups[currentPopupIndex];

  // Update local state when popup changes
  useEffect(() => {
    if (currentPopup) {
      if (!isEditingTitle) {
        setLocalTitle(currentPopup.title || '');
      }
      if (!isEditingDescription) {
        setLocalDescription(currentPopup.description || '');
      }
      if (!isEditingButtonText) {
        setLocalButtonText(currentPopup.confirmButtonText || 'OK');
      }
    }
  }, [currentPopup, isEditingTitle, isEditingDescription, isEditingButtonText]);

  // Reset to first popup when popups array changes
  useEffect(() => {
    if (currentPopupIndex >= popups.length && popups.length > 0) {
      setCurrentPopupIndex(0);
    }
  }, [popups.length, currentPopupIndex]);

  // Reset media index when popup changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [currentPopupIndex]);

  // Click outside handler for color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showColorPicker &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleAddPopup = () => {
    if (popups.length >= 10) {
      setError('Maximum 10 popups per step');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newPopup: Popup = {
      id: crypto.randomUUID(),
      title: 'New Warning',
      description: 'Enter warning description here',
      position: { x: 100, y: 100 },
      color: '#ef4444',
      mediaFiles: [],
      confirmButtonText: 'OK',
      requiresConfirmation: false
    };
    
    onAddPopup(newPopup);
    setCurrentPopupIndex(popups.length); // Switch to the new popup
    setError(null);
  };

  const handleDeletePopup = () => {
    if (!currentPopup) return;
    onRemovePopup(currentPopup.id);
    if (currentPopupIndex > 0) {
      setCurrentPopupIndex(currentPopupIndex - 1);
    }
  };

  const handlePrevious = () => {
    setCurrentPopupIndex(Math.max(0, currentPopupIndex - 1));
  };

  const handleNext = () => {
    setCurrentPopupIndex(Math.min(popups.length - 1, currentPopupIndex + 1));
  };

  const handleColorChange = (color: string) => {
    if (currentPopup) {
      onUpdatePopup(currentPopup.id, { color });
      setShowColorPicker(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentPopup) return;

    if (currentPopup.mediaFiles.length + files.length > 5) {
      setError('Maximum 5 media files per popup');
      setTimeout(() => setError(null), 3000);
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

    onUpdatePopup(currentPopup.id, {
      mediaFiles: [...currentPopup.mediaFiles, ...newMediaFiles]
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    if (!currentPopup) return;
    const updatedMediaFiles = currentPopup.mediaFiles.filter(m => m.id !== mediaId);
    onUpdatePopup(currentPopup.id, { mediaFiles: updatedMediaFiles });
  };

  const handlePreviousMedia = () => {
    setCurrentMediaIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMedia = () => {
    if (currentPopup?.mediaFiles) {
      setCurrentMediaIndex((prev) => Math.min(currentPopup.mediaFiles.length - 1, prev + 1));
    }
  };

  // If no popups, don't show anything
  if (popups.length === 0) {
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={() => {
          // Only allow closing by clicking background if requiresConfirmation is false
          if (!currentPopup?.requiresConfirmation) {
            onClose();
          }
        }}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal Container - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-lg overflow-hidden pointer-events-auto w-full max-w-2xl max-h-[90vh] flex flex-col"
          style={{
            boxShadow: `0px 8px 32px 0px ${currentPopup?.color || '#ef4444'}40`,
            border: '1px solid var(--border)'
          }}
        >
          {/* Header with Color Background (with opacity) */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: 'var(--spacing-lg)',
              gap: 'var(--spacing-md)',
              backgroundColor: `${currentPopup?.color || '#ef4444'}20`,
              borderBottom: `2px solid ${currentPopup?.color || '#ef4444'}`,
              color: 'var(--foreground)'
            }}
          >
            {/* Title */}
            <div className="flex-1">
              {isEditingTitle && editingEnabled ? (
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                  onBlur={() => {
                    onUpdatePopup(currentPopup.id, { title: localTitle });
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdatePopup(currentPopup.id, { title: localTitle });
                      setIsEditingTitle(false);
                    } else if (e.key === 'Escape') {
                      setLocalTitle(currentPopup.title || '');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="px-2 py-1 rounded bg-white/90 border-2 outline-none"
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--ring)'
                  }}
                  placeholder="Warning title..."
                  maxLength={MAX_TITLE_LENGTH}
                  autoFocus
                />
              ) : (
                <h3
                  onClick={() => editingEnabled && setIsEditingTitle(true)}
                  className={editingEnabled ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)'
                  }}
                >
                  {currentPopup?.title || 'Warning'}
                </h3>
              )}
              {popups.length > 1 && !isEditingTitle && (
                <p
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {currentPopupIndex + 1} of {popups.length}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
              {/* Color Picker */}
              {editingEnabled && (
                <button
                  ref={colorButtonRef}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  title="Change color"
                  aria-label="Change warning color"
                >
                  <Palette className="size-5" />
                </button>
              )}

              {/* Delete */}
              {editingEnabled && (
                <button
                  onClick={handleDeletePopup}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  style={{ color: 'var(--destructive)' }}
                  title="Delete warning"
                  aria-label="Delete warning"
                >
                  <Trash2 className="size-5" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                style={{ color: 'var(--foreground)' }}
                title="Close"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--spacing-lg)' }}>
            <div className="flex flex-col" style={{ gap: 'var(--spacing-lg)' }}>
              {/* Description */}
              {currentPopup?.description !== undefined ? (
                isEditingDescription && editingEnabled ? (
                  <div>
                    <label
                      className="block text-muted-foreground mb-2"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={localDescription}
                      onChange={(e) => setLocalDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                      onBlur={() => {
                        onUpdatePopup(currentPopup.id, { description: localDescription });
                        setIsEditingDescription(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setLocalDescription(currentPopup.description || '');
                          setIsEditingDescription(false);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-input-background border-2 outline-none resize-none"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--foreground)',
                        borderColor: 'var(--ring)',
                        minHeight: '120px'
                      }}
                      placeholder="Warning description..."
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => editingEnabled && setIsEditingDescription(true)}
                    className="w-full text-left group relative p-3 rounded-lg transition-colors"
                    disabled={!editingEnabled}
                  >
                    <p
                      className="whitespace-pre-wrap text-card-foreground"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: '1.6'
                      }}
                    >
                      {currentPopup.description}
                    </p>
                    {editingEnabled && (
                      <div
                        className="absolute inset-0 border-2 border-transparent group-hover:border-primary transition-colors pointer-events-none rounded-lg"
                      />
                    )}
                  </button>
                )
              ) : null}

              {/* Media Files - Show one at a time with navigation */}
              {currentPopup?.mediaFiles && currentPopup.mediaFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label
                      className="text-muted-foreground"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      Media {editingEnabled && `(${currentPopup.mediaFiles.length}/5)`}
                    </label>
                    {editingEnabled && (
                      <div className="flex" style={{ gap: 'var(--spacing-xs)' }}>
                        <button
                          onClick={() => setShowMediaManager(true)}
                          className="flex items-center rounded-lg px-3 py-2 transition-all hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--secondary)',
                            color: 'var(--foreground)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-bold)',
                            gap: 'var(--spacing-xs)'
                          }}
                        >
                          <Folders className="size-4" />
                          Manage
                        </button>
                        <label className="cursor-pointer">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleMediaUpload}
                            className="hidden"
                            disabled={currentPopup.mediaFiles.length >= 5}
                          />
                          <span
                            className="flex items-center rounded-lg px-3 py-2 transition-all hover:opacity-80 disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'var(--accent-foreground)',
                              fontFamily: 'var(--font-family)',
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-bold)',
                              gap: 'var(--spacing-xs)'
                            }}
                          >
                            <Upload className="size-4" />
                            Upload
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Single Media Display with Navigation */}
                  <div className="relative">
                    <div
                      className="aspect-video rounded-lg overflow-hidden border relative"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      {currentPopup.mediaFiles[currentMediaIndex]?.type.startsWith('image/') ? (
                        <img 
                          src={currentPopup.mediaFiles[currentMediaIndex].url} 
                          alt={currentPopup.mediaFiles[currentMediaIndex].name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <video 
                          src={currentPopup.mediaFiles[currentMediaIndex]?.url} 
                          controls
                          className="w-full h-full object-cover" 
                        />
                      )}

                      {/* Delete button - only when editing */}
                      {editingEnabled && (
                        <button
                          onClick={() => handleRemoveMedia(currentPopup.mediaFiles[currentMediaIndex].id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg transition-opacity"
                          style={{
                            backgroundColor: 'var(--destructive)',
                            color: 'var(--destructive-foreground)'
                          }}
                          aria-label="Remove media"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* Navigation buttons - show if more than one media */}
                    {currentPopup.mediaFiles.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousMedia}
                          disabled={currentMediaIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          style={{ color: 'white' }}
                          aria-label="Previous media"
                        >
                          <ChevronLeft className="size-5" />
                        </button>
                        <button
                          onClick={handleNextMedia}
                          disabled={currentMediaIndex === currentPopup.mediaFiles.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          style={{ color: 'white' }}
                          aria-label="Next media"
                        >
                          <ChevronRight className="size-5" />
                        </button>

                        {/* Media counter */}
                        <div 
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70"
                          style={{
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-sm)',
                            color: 'white'
                          }}
                        >
                          {currentMediaIndex + 1} / {currentPopup.mediaFiles.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Media Caption */}
                  {currentPopup.mediaFiles[currentMediaIndex]?.caption && (
                    <p
                      className="mt-2 px-3 py-2 rounded-lg"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--foreground)',
                        backgroundColor: 'var(--secondary)',
                        lineHeight: '1.5'
                      }}
                    >
                      {currentPopup.mediaFiles[currentMediaIndex].caption}
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Button */}
              <div className="flex flex-col items-center" style={{ gap: 'var(--spacing-md)' }}>
                {isEditingButtonText && editingEnabled ? (
                  <div className="w-full flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
                    <label
                      className="block text-muted-foreground"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={localButtonText}
                      onChange={(e) => setLocalButtonText(e.target.value.slice(0, MAX_BUTTON_TEXT_LENGTH))}
                      onBlur={() => {
                        onUpdatePopup(currentPopup.id, { confirmButtonText: localButtonText || 'OK' });
                        setIsEditingButtonText(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdatePopup(currentPopup.id, { confirmButtonText: localButtonText || 'OK' });
                          setIsEditingButtonText(false);
                        } else if (e.key === 'Escape') {
                          setLocalButtonText(currentPopup.confirmButtonText || 'OK');
                          setIsEditingButtonText(false);
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-input-background border-2 outline-none"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--foreground)',
                        borderColor: 'var(--ring)'
                      }}
                      placeholder="OK"
                      maxLength={MAX_BUTTON_TEXT_LENGTH}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (editingEnabled) {
                        setIsEditingButtonText(true);
                      } else {
                        onClose();
                      }
                    }}
                    className="px-8 py-3 rounded-lg transition-all group relative"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                    onMouseEnter={(e) => {
                      if (!editingEnabled) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!editingEnabled) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {currentPopup.confirmButtonText || 'OK'}
                    {editingEnabled && (
                      <div
                        className="absolute inset-0 border-2 border-transparent group-hover:border-white/50 transition-colors pointer-events-none rounded-lg"
                      />
                    )}
                  </button>
                )}

                {/* Requires Confirmation Checkbox */}
                {editingEnabled && (
                  <label 
                    className="flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50"
                    style={{ gap: 'var(--spacing-sm)' }}
                  >
                    <input
                      type="checkbox"
                      checked={currentPopup?.requiresConfirmation || false}
                      onChange={(e) => {
                        if (currentPopup) {
                          onUpdatePopup(currentPopup.id, { requiresConfirmation: e.target.checked });
                        }
                      }}
                      className="size-4 rounded cursor-pointer"
                      style={{
                        accentColor: 'var(--primary)'
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--foreground)'
                      }}
                    >
                      Requires confirmation
                    </span>
                  </label>
                )}

                {/* Arrow Direction Controls */}
                {editingEnabled && (
                  <div className="w-full">
                    <label
                      className="block mb-2"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--foreground)'
                      }}
                    >
                      Arrow Direction
                    </label>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {(['none', 'up', 'down', 'left', 'right'] as const).map((direction) => {
                        const isActive = (currentPopup?.arrowDirection || 'none') === direction;
                        return (
                          <button
                            key={direction}
                            onClick={() => {
                              if (currentPopup) {
                                onUpdatePopup(currentPopup.id, { arrowDirection: direction });
                              }
                            }}
                            className="flex-1 flex items-center justify-center transition-all"
                            style={{
                              gap: 'var(--spacing-xs)',
                              padding: 'var(--spacing-md)',
                              backgroundColor: isActive ? 'var(--primary)' : 'var(--card)',
                              color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 'var(--text-xs)',
                              fontFamily: 'var(--font-family)',
                              fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                              borderRadius: '0'
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'var(--secondary)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'var(--card)';
                              }
                            }}
                          >
                            {direction === 'none' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                              </svg>
                            )}
                            {direction === 'up' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                              </svg>
                            )}
                            {direction === 'down' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                              </svg>
                            )}
                            {direction === 'left' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                              </svg>
                            )}
                            {direction === 'right' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            )}
                            <span style={{ textTransform: 'capitalize' }}>{direction}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons - only if more than one popup */}
              {popups.length > 1 && (
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPopupIndex === 0}
                    className="flex items-center px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--foreground)',
                      gap: 'var(--spacing-xs)',
                      backgroundColor: 'var(--secondary)'
                    }}
                    aria-label="Previous warning"
                    onMouseEnter={(e) => {
                      if (currentPopupIndex !== 0) {
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPopupIndex === popups.length - 1}
                    className="flex items-center px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--foreground)',
                      gap: 'var(--spacing-xs)',
                      backgroundColor: 'var(--secondary)'
                    }}
                    aria-label="Next warning"
                    onMouseEnter={(e) => {
                      if (currentPopupIndex !== popups.length - 1) {
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Smaller Add Warning button */}
          {editingEnabled && popups.length < 10 && (
            <div
              className="border-t flex justify-end"
              style={{
                padding: 'var(--spacing-md)',
                borderColor: 'var(--border)'
              }}
            >
              <button
                onClick={handleAddPopup}
                className="py-2 px-4 rounded-lg transition-all flex items-center hover:opacity-80"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  gap: 'var(--spacing-xs)'
                }}
                aria-label="Add another warning"
              >
                <Plus className="size-4" />
                <span>Add Warning</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Color Picker Popover */}
      <AnimatePresence>
        {showColorPicker && colorButtonRef.current && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setShowColorPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              ref={colorPickerRef}
              className="fixed bg-card border rounded-lg z-[70]"
              style={{
                boxShadow: 'var(--shadow-elevation-lg)',
                borderColor: 'var(--border)',
                padding: 'var(--spacing-lg)',
                minWidth: '240px',
                left: `${colorButtonRef.current.getBoundingClientRect().left}px`,
                top: `${colorButtonRef.current.getBoundingClientRect().bottom + 8}px`
              }}
            >
              <p
                className="text-card-foreground mb-3"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)'
                }}
              >
                Choose Color
              </p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="size-12 rounded-lg hover:scale-110 transition-transform border-2 relative"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        currentPopup?.color === color ? 'var(--foreground)' : 'var(--border)'
                    }}
                    aria-label={`Color ${color}`}
                  >
                    {currentPopup?.color === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="size-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md"
          >
            <div
              className="flex items-center rounded-lg shadow-elevation-lg bg-destructive text-destructive-foreground"
              style={{
                padding: 'var(--spacing-md)',
                gap: 'var(--spacing-sm)'
              }}
            >
              <AlertCircle className="size-5 flex-shrink-0" />
              <p style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Manager Modal */}
      <AnimatePresence>
        {showMediaManager && currentPopup && (
          <MediaManagerModal
            mediaFiles={currentPopup.mediaFiles}
            onUpdateMediaFiles={(updatedMediaFiles) => {
              onUpdatePopup(currentPopup.id, { mediaFiles: updatedMediaFiles });
              setShowMediaManager(false);
            }}
            onClose={() => setShowMediaManager(false)}
            maxFiles={5}
          />
        )}
      </AnimatePresence>
    </>
  );
}
