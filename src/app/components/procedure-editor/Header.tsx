import { useState, useEffect, useRef } from 'react';
import { Settings, X, RotateCw, Upload, Save, Zap, Bookmark, AlertCircle, Undo, List, CheckCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { TwinState } from './ProcedureEditor';

interface HeaderProps {
  hasAnimation: boolean;
  hasTwinState: boolean;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
  onTogglePartsCatalog: () => void;
  isPartsCatalogOpen: boolean;
  onOpenPublish: () => void;
  onOpenValidation: () => void;
  checkpointCount: number;
  hasCritical: boolean;
  onAnimate: () => void;
  onSaveTwinState: () => void;
  onClearTwinState: () => void;
}

export function Header({
  hasAnimation,
  hasTwinState,
  onOpenSettings,
  onOpenBookmarks,
  onTogglePartsCatalog,
  isPartsCatalogOpen,
  onOpenPublish,
  onOpenValidation,
  checkpointCount,
  hasCritical,
  onAnimate,
  onSaveTwinState,
  onClearTwinState
}: HeaderProps) {
  const [showDigitalTwinMenu, setShowDigitalTwinMenu] = useState(false);
  const [deletedTwinState, setDeletedTwinState] = useState(false);
  const [showUndoTwinNotification, setShowUndoTwinNotification] = useState(false);

  const digitalTwinRef = useRef<HTMLDivElement>(null);
  const digitalTwinButtonRef = useRef<HTMLButtonElement>(null);

  const handleToggleDigitalTwinState = () => {
    setShowDigitalTwinMenu(!showDigitalTwinMenu);
  };

  const handleUpdateDigitalTwinState = () => {
    onSaveTwinState();
    setShowDigitalTwinMenu(false);
  };

  const handleClearDigitalTwinState = () => {
    setDeletedTwinState(true);
    setShowUndoTwinNotification(true);
    onClearTwinState();
    setShowDigitalTwinMenu(false);
    setTimeout(() => {
      setShowUndoTwinNotification(false);
      setDeletedTwinState(false);
    }, 5000);
  };

  const handleUndoClearTwinState = () => {
    // Re-save: the scene state hasn't changed, so saving again restores it
    onSaveTwinState();
    setShowUndoTwinNotification(false);
    setDeletedTwinState(false);
  };

  useClickOutside([digitalTwinRef, digitalTwinButtonRef], () => setShowDigitalTwinMenu(false), showDigitalTwinMenu);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDigitalTwinMenu(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div
        data-tutorial="toolbar"
        className="bg-card content-stretch flex flex-wrap gap-0.5 items-center p-2 relative rounded-button shrink-0 z-10 max-w-[calc(100vw-32px)] overflow-x-auto"
      >
        <div aria-hidden="true" className="absolute border border-border inset-0 pointer-events-none rounded-button shadow-elevation-sm" />

        {/* Bookmarks Button */}
        <button
          onClick={onOpenBookmarks}
          className="content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center hover:bg-secondary/50 transition-colors"
          title="Bookmarks"
          aria-label="Open bookmarks"
        >
          <Bookmark className="size-4 text-foreground" />
        </button>

        {/* Parts Catalog Toggle */}
        <button
          onClick={onTogglePartsCatalog}
          className={`content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center transition-colors ${
            isPartsCatalogOpen ? 'bg-accent/20 hover:bg-accent/30' : 'hover:bg-secondary/50'
          }`}
          title={isPartsCatalogOpen ? 'Close parts catalog' : 'Open parts catalog'}
          aria-label={isPartsCatalogOpen ? 'Close parts catalog' : 'Open parts catalog'}
          aria-pressed={isPartsCatalogOpen}
        >
          <List className="size-4 text-foreground" />
        </button>

        {/* Save Twin Setup Button */}
        <div className="relative shrink-0">
          <button
            ref={digitalTwinButtonRef}
            onClick={handleToggleDigitalTwinState}
            data-demo="twin-save"
            className={`content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center transition-colors ${
              hasTwinState
                ? 'bg-accent/20 hover:bg-accent/30'
                : 'hover:bg-secondary/50'
            }`}
            title="Save Twin Setup"
            aria-label="Save Twin Setup"
            aria-pressed={hasTwinState}
          >
            <Save className="size-4 text-foreground" />
            {hasTwinState && (
              <div
                className="absolute rounded-full"
                style={{
                  top: '4px',
                  right: '4px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: 'var(--accent)',
                  border: '1.5px solid var(--card)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </button>
        </div>

        {/* Animate Button — highlighted + dot indicator when animation exists */}
        <div className="relative shrink-0">
          <button
            onClick={onAnimate}
            className={`content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center transition-colors ${
              hasAnimation ? 'bg-accent/20 hover:bg-accent/30' : 'hover:bg-secondary/50'
            }`}
            title={hasAnimation ? 'Edit Animation' : 'Add Animation'}
            aria-label={hasAnimation ? 'Edit Animation' : 'Add Animation'}
          >
            <Zap className={`size-4 ${hasAnimation ? 'text-accent' : 'text-foreground'}`} />
            {hasAnimation && (
              <div
                className="absolute rounded-full"
                style={{
                  top: '4px',
                  right: '4px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: 'var(--accent)',
                  border: '1.5px solid var(--card)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </button>
        </div>

        {/* Validation Button with count badge */}
        <div className="relative shrink-0">
          <button
            onClick={onOpenValidation}
            className={`content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center transition-colors ${
              checkpointCount > 0 ? 'bg-accent/20 hover:bg-accent/30' : 'hover:bg-secondary/50'
            }`}
            title="Validation Point"
            aria-label="Validation Point"
          >
            <CheckCircle className="size-4 text-foreground" />
          </button>
          {checkpointCount > 0 && (
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                top: '-6px',
                right: '-6px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                backgroundColor: hasCritical ? '#ef4444' : 'var(--accent)',
                pointerEvents: 'none',
                fontSize: '10px',
                fontWeight: 600,
                
                color: 'white',
                lineHeight: 1
              }}
            >
              {checkpointCount}
            </div>
          )}
        </div>

        <div className="flex flex-row items-center self-stretch">
          <div className="bg-border h-full shrink-0 w-px" />
        </div>

        {/* Settings Button — opens flow settings page */}
        <button
          onClick={onOpenSettings}
          className="content-stretch flex gap-2 items-center p-2 relative rounded-lg shrink-0 w-8 h-8 min-h-[44px] min-w-[44px] justify-center hover:bg-secondary/50 transition-colors"
          title="Flow settings"
          aria-label="Flow settings"
        >
          <Settings className="size-4 text-foreground" />
        </button>

        {/* Publish Button */}
        <button
          onClick={onOpenPublish}
          className="relative px-4 py-2 min-h-[44px] rounded-button bg-accent text-accent-foreground hover:bg-accent/80 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm hover:shadow-lg group"
          style={{
            
            fontWeight: 600,
            fontSize: '13px'
          }}
          aria-label="Publish procedure"
        >
          <Upload className="size-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Publish</span>
        </button>
      </div>

      {/* Digital Twin State Menu */}
      <AnimatePresence>
        {showDigitalTwinMenu && digitalTwinButtonRef.current && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            ref={digitalTwinRef}
            className="fixed bg-card border border-border rounded-lg shadow-elevation-lg z-[100]"
            style={{
              top: `${digitalTwinButtonRef.current.getBoundingClientRect().bottom + 8}px`,
              left: `${Math.min(digitalTwinButtonRef.current.getBoundingClientRect().left, window.innerWidth - 216)}px`,
              minWidth: '200px',
              maxWidth: 'calc(100vw - 16px)'
            }}
            role="menu"
            aria-label="Digital twin state menu"
          >
            <div className="flex flex-col" style={{ padding: 'var(--spacing-md)' }}>
              <button
                onClick={handleUpdateDigitalTwinState}
                data-demo="twin-set"
                className="flex flex-col gap-1 px-3 py-3 min-h-[44px] rounded-md hover:bg-accent hover:text-accent-foreground text-left w-full transition-all group"
                style={{
                  color: 'var(--foreground)',
                  
                  fontSize: '13px'
                }}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="size-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>
                    {hasTwinState ? 'Update State' : 'Set State'}
                  </span>
                </div>
                {!hasTwinState && (
                  <span style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    paddingLeft: '22px',
                    
                  }}>
                    Save current digital twin state
                  </span>
                )}
              </button>
              {hasTwinState && (
                <button
                  onClick={handleClearDigitalTwinState}
                  data-demo="twin-clear"
                  className="flex items-center gap-2 px-3 py-3 min-h-[44px] rounded-md hover:bg-destructive/10 hover:text-destructive text-left w-full transition-all group"
                  style={{
                    color: 'var(--foreground)',
                    
                    fontSize: '13px'
                  }}
                  role="menuitem"
                >
                  <X className="size-3.5 group-hover:scale-110 transition-transform" />
                  <span>Clear State</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Clear Twin State Notification */}
      {showUndoTwinNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4 px-5 py-3 rounded-lg shadow-elevation-lg border-2 border-border bg-card text-card-foreground min-w-[280px] max-w-[calc(100vw-32px)]"
          >
            <AlertCircle className="size-5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            <p className="flex-1 leading-tight" style={{
              
              fontWeight: 600,
              color: 'var(--foreground)'
            }}>
              Twin setup cleared
            </p>
            <button
              onClick={handleUndoClearTwinState}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-button hover:brightness-110 transition-opacity"
              style={{
                
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <Undo className="size-4" />
              Undo
            </button>
            <button
              onClick={() => {
                setShowUndoTwinNotification(false);
                setDeletedTwinState(false);
              }}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
