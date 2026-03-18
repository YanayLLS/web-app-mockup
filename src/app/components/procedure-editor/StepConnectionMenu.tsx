import { Link, Unlink, Search, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Step } from './ProcedureEditor';
import { useClickOutside } from '../../hooks/useClickOutside';

interface StepConnectionMenuProps {
  steps: Step[];
  currentStepId: string;
  currentNextStepId?: string;
  onConnectToStep: (targetStepId: string | undefined) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function StepConnectionMenu({ 
  steps, 
  currentStepId, 
  currentNextStepId,
  onConnectToStep, 
  onClose, 
  position 
}: StepConnectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useClickOutside(menuRef, onClose);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Filter steps - exclude current step and filter by search
  const availableSteps = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.id !== currentStepId)
    .filter(({ step, index }) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const stepNumber = `step ${index + 1}`;
      const title = step.title?.toLowerCase() || '';
      const description = step.description?.toLowerCase() || '';
      return stepNumber.includes(query) || title.includes(query) || description.includes(query);
    });

  const handleDisconnect = () => {
    onConnectToStep(undefined);
    onClose();
  };

  const handleConnect = (targetStepId: string) => {
    onConnectToStep(targetStepId);
    onClose();
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
          top: `${Math.min(position.y, window.innerHeight - 508)}px`,
          left: `${Math.min(Math.max(8, position.x), window.innerWidth - 408)}px`,
          background: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-elevation-lg)',
          minWidth: '280px',
          maxWidth: 'min(400px, calc(100vw - 16px))',
          maxHeight: 'min(500px, calc(100vh - 16px))'
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
              
              color: 'var(--foreground)'
            }}
          >
            Connect to Step
          </h3>
          <p 
            className="text-xs mt-1"
            style={{ 
              
              color: 'var(--muted-foreground)'
            }}
          >
            Choose where this step should go next
          </p>
        </div>

        {/* Search Input */}
        <div 
          className="px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)'
            }}
          >
            <Search className="size-4" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search steps..."
              className="flex-1 text-sm bg-transparent outline-none"
              style={{
                
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>

        {/* Disconnect Option */}
        {currentNextStepId && (
          <div 
            className="px-3 py-2 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg hover:bg-secondary/50 transition-colors text-left"
              style={{
                
                color: 'var(--foreground)'
              }}
            >
              <Unlink className="size-4" style={{ color: 'var(--destructive)' }} />
              <span className="text-sm">Disconnect (use default flow)</span>
            </button>
          </div>
        )}

        {/* Steps List */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ 
            maxHeight: '320px'
          }}
        >
          {availableSteps.length === 0 ? (
            <div 
              className="px-4 py-8 text-center text-sm"
              style={{ 
                
                color: 'var(--muted-foreground)'
              }}
            >
              {searchQuery ? 'No steps match your search' : 'No other steps available'}
            </div>
          ) : (
            <div className="py-2">
              {availableSteps.map(({ step, index }) => {
                const isConnected = currentNextStepId === step.id;
                const stepLabel = step.title || step.description || `Step ${index + 1}`;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleConnect(step.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-secondary/50 transition-colors text-left ${
                      isConnected ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div 
                      className="flex items-center justify-center rounded-full size-8 shrink-0 text-xs font-bold"
                      style={{
                        background: step.color || 'var(--muted)',
                        color: 'white'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {stepLabel}
                      </div>
                      {step.title && step.description && (
                        <div 
                          className="text-xs truncate mt-0.5"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {step.description}
                        </div>
                      )}
                    </div>
                    {isConnected ? (
                      <div 
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--accent)' }}
                      >
                        Connected
                      </div>
                    ) : (
                      <ArrowRight 
                        className="size-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity" 
                        style={{ color: 'var(--muted-foreground)' }} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
