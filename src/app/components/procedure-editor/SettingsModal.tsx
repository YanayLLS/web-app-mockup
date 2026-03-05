import svgPathsSettings from "../../../imports-procedure-editor/svg-q4dhfj3mj8";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  procedureTitle: string;
  onProcedureTitleChange: (title: string) => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_AI_LENGTH = 2000;
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function SettingsModal({ onClose, procedureTitle, onProcedureTitleChange }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    enable2D: true,
    optionAutoProceeds: true,
    autoSkipSteps: true,
    showSurvey: true,
    readHeaders: true,
    readDescriptions: true,
    waitForNarration: true
  });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState(procedureTitle);
  const [description, setDescription] = useState('');
  const [aiInstructions, setAiInstructions] = useState('Meet the ProBook, an innovative laptop crafted for professionals who seek both power and sophistication. Its sleek metal design and ultra-slim form factor merge style with practicality...');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousThumbnailRef = useRef<string | null>(null);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size
    if (file.size > MAX_THUMBNAIL_SIZE) {
      setUploadError(`File too large. Maximum size is ${MAX_THUMBNAIL_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Cleanup previous blob URL
      if (previousThumbnailRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previousThumbnailRef.current);
      }

      const url = reader.result as string;
      setThumbnailUrl(url);
      previousThumbnailRef.current = url;
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveThumbnail = () => {
    if (previousThumbnailRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previousThumbnailRef.current);
    }
    setThumbnailUrl(null);
    previousThumbnailRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit title changes
  const submitTitleChange = useCallback(() => {
    if (title !== procedureTitle) {
      onProcedureTitleChange(title);
    }
  }, [title, procedureTitle, onProcedureTitleChange]);

  // Save title when closing
  const handleClose = useCallback(() => {
    submitTitleChange();
    onClose();
  }, [submitTitleChange, onClose]);

  // Sync title with prop on initial mount only
  useEffect(() => {
    setTitle(procedureTitle);
  }, []); // Only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    // Reset scroll position
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

    return () => {
      if (previousThumbnailRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previousThumbnailRef.current);
      }
    };
  }, []);

  // Trap focus within modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    window.addEventListener('keydown', handleEscKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [handleClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="relative bg-card rounded-lg w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-elevation-sm border border-border flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          {/* Top Bar */}
          <div className="bg-secondary/30 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between gap-4" style={{ padding: 'var(--spacing-sm, 8px)' }}>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 size-6">
                  <div className="absolute inset-[22.61%_0_23.83%_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 12.8559">
                      <line stroke="currentColor" className="text-foreground" x1="1.32677" x2="9.04051" y1="10.8252" y2="1.39729" />
                      <line stroke="currentColor" className="text-foreground" x1="15.0323" x2="21.3466" y1="10.8348" y2="2.71637" />
                      <line stroke="currentColor" className="text-foreground" x1="15.0734" x2="9.9309" y1="8.92386" y2="3.78137" />
                      <circle cx="2.14271" cy="10.7131" className="fill-foreground" r="2.14271" />
                      <circle cx="15.8601" cy="9.85572" className="fill-foreground" r="2.14271" />
                      <circle cx="8.13939" cy="2.99987" className="fill-foreground" r="2.14271" />
                      <circle cx="21.8573" cy="2.14271" className="fill-foreground" r="2.14271" />
                    </svg>
                  </div>
                </div>
                <h3 id="settings-title" className="text-card-foreground" style={{ fontFamily: 'var(--font-family)' }}>Procedure Settings</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClose} 
                  className="hover:bg-secondary/50 rounded-lg p-1.5 transition-colors ml-auto"
                  aria-label="Close settings"
                >
                  <X className="size-5 text-muted" />
                </button>
              </div>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div style={{ padding: 'var(--spacing-sm, 8px)' }} className="space-y-3">
              {/* Basic Information Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-border">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-card-foreground font-bold" style={{ fontFamily: 'var(--font-family)' }}>Basic Information</h4>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="procedure-title" className="block text-card-foreground font-bold mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                    Procedure Title
                  </label>
                  <input
                    id="procedure-title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
                      setTitle(newTitle);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitTitleChange();
                        e.currentTarget.blur();
                      }
                    }}
                    maxLength={MAX_TITLE_LENGTH}
                    className="w-full bg-white border border-border rounded-lg text-card-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    style={{ padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)', fontFamily: 'var(--font-family)' }}
                    placeholder="Enter procedure title"
                  />
                  <p className="text-muted text-xs mt-0.5" style={{ fontFamily: 'var(--font-family)' }}>
                    {title.length} / {MAX_TITLE_LENGTH} characters
                  </p>
                </div>

                {/* Thumbnail and Description */}
                <div>
                  <label className="block text-card-foreground font-bold mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                    Thumbnail & Description
                  </label>
                  
                  {uploadError && (
                    <div className="mb-2 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2" style={{ padding: 'var(--spacing-xs, 6px)' }}>
                      <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-destructive font-bold text-sm" style={{ fontFamily: 'var(--font-family)' }}>{uploadError}</p>
                      </div>
                      <button
                        onClick={() => setUploadError(null)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label="Dismiss error"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {/* Thumbnail Upload */}
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        aria-label="Upload thumbnail"
                      />
                      <button
                        onClick={handleThumbnailClick}
                        className="aspect-[16/9] rounded-lg w-[180px] border-2 border-dashed border-border hover:border-primary bg-secondary/30 hover:bg-secondary/50 flex flex-col items-center justify-center gap-2 transition-all group overflow-hidden"
                        aria-label="Upload thumbnail image"
                      >
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="size-8 text-muted group-hover:text-primary transition-colors" />
                            <span className="text-xs text-muted group-hover:text-primary transition-colors font-bold" style={{ fontFamily: 'var(--font-family)' }}>Upload thumbnail</span>
                          </>
                        )}
                      </button>
                      {thumbnailUrl && (
                        <button
                          onClick={handleRemoveThumbnail}
                          className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90 shadow-elevation-sm"
                          aria-label="Remove thumbnail"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex-1">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        placeholder="Write a brief description of this procedure..."
                        className="w-full h-full bg-white border border-border rounded-lg text-card-foreground outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow min-h-[100px]"
                        style={{ padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)', fontFamily: 'var(--font-family)' }}
                        aria-label="Procedure description"
                      />
                      <p className="text-muted text-xs mt-0.5" style={{ fontFamily: 'var(--font-family)' }}>
                        {description.length} / {MAX_DESCRIPTION_LENGTH} characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-border">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-card-foreground font-bold" style={{ fontFamily: 'var(--font-family)' }}>Procedure Settings</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Logics Column */}
                  <div className="space-y-1">
                    <h5 className="text-card-foreground font-bold mb-1.5 text-sm" style={{ fontFamily: 'var(--font-family)' }}>Logics</h5>
                    
                    <SettingOption
                      title="Enable 2D"
                      description="Allows viewing this procedure in 2D mode"
                      checked={settings.enable2D}
                      onToggle={() => toggleSetting('enable2D')}
                    />
                    <SettingOption
                      title="Option auto proceeds"
                      description="Selecting an option moves to next step"
                      checked={settings.optionAutoProceeds}
                      onToggle={() => toggleSetting('optionAutoProceeds')}
                    />
                    <SettingOption
                      title="Auto skip steps"
                      description="Continues after animations finish"
                      checked={settings.autoSkipSteps}
                      onToggle={() => toggleSetting('autoSkipSteps')}
                    />
                    <SettingOption
                      title="Show survey"
                      description="Displays feedback survey on completion"
                      checked={settings.showSurvey}
                      onToggle={() => toggleSetting('showSurvey')}
                    />
                  </div>

                  {/* Text to Speech Column */}
                  <div className="space-y-1">
                    <h5 className="text-card-foreground font-bold mb-1.5 text-sm" style={{ fontFamily: 'var(--font-family)' }}>Text to Speech</h5>
                    
                    <SettingOption
                      title="Read headers"
                      description="Reads each step's header aloud"
                      checked={settings.readHeaders}
                      onToggle={() => toggleSetting('readHeaders')}
                    />
                    <SettingOption
                      title="Read descriptions"
                      description="Reads each step's description aloud"
                      checked={settings.readDescriptions}
                      onToggle={() => toggleSetting('readDescriptions')}
                    />
                    <SettingOption
                      title="Wait for narration"
                      description="Prevents auto-advance until finished"
                      checked={settings.waitForNarration}
                      onToggle={() => toggleSetting('waitForNarration')}
                    />
                  </div>
                </div>
              </div>

              {/* AI Instructions Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-border">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-card-foreground font-bold" style={{ fontFamily: 'var(--font-family)' }}>AI Instructions</h4>
                    <p className="text-muted text-xs" style={{ fontFamily: 'var(--font-family)' }}>Optional context for AI-assisted features</p>
                  </div>
                  <button className="text-primary hover:underline font-bold text-sm" style={{ fontFamily: 'var(--font-family)' }}>
                    Summarize with AI
                  </button>
                </div>

                <textarea
                  id="ai-instructions"
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value.slice(0, MAX_AI_LENGTH))}
                  maxLength={MAX_AI_LENGTH}
                  className="w-full bg-white border border-border rounded-lg text-card-foreground leading-relaxed outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                  style={{ padding: 'var(--spacing-xs, 6px) var(--spacing-sm, 8px)', fontFamily: 'var(--font-family)' }}
                  rows={4}
                  placeholder="Provide context and instructions for AI features..."
                />
                <p className="text-muted text-xs" style={{ fontFamily: 'var(--font-family)' }}>
                  {aiInstructions.length} / {MAX_AI_LENGTH} characters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SettingOptionProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function SettingOption({ title, description, checked, onToggle }: SettingOptionProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 rounded-lg hover:bg-secondary/50 transition-colors w-full text-left group"
      style={{ padding: 'var(--spacing-xs, 6px)' }}
    >
      {/* Checkbox */}
      <div className="relative shrink-0">
        <div className={`size-5 rounded-md border-2 transition-colors flex items-center justify-center ${
          checked ? 'bg-primary border-primary' : 'bg-white border-border'
        }`}>
          {checked && (
            <svg className="size-3.5 text-primary-foreground" fill="none" viewBox="0 0 15.4 11.7778">
              <line stroke="currentColor" strokeWidth="1.5" x1="4.01109" x2="15.0111" y1="11.3889" y2="0.388909" />
              <line stroke="currentColor" strokeWidth="1.5" x1="0.388909" x2="4.78891" y1="6.98891" y2="11.3889" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className="text-card-foreground font-bold text-sm mb-0.5" style={{ fontFamily: 'var(--font-family)' }}>{title}</p>
        <p className="text-muted text-xs leading-relaxed" style={{ fontFamily: 'var(--font-family)' }}>{description}</p>
      </div>
    </button>
  );
}
