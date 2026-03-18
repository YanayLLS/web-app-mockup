import { X, AlertCircle, Edit2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PublishModalProps {
  onClose: () => void;
  onPublish: (version: string, changelog?: string) => void;
  currentVersion?: string;
}

export function PublishModal({ onClose, onPublish, currentVersion }: PublishModalProps) {
  const getNextVersion = (current?: string): string => {
    if (!current) return '1.0';
    
    const parts = current.split('.');
    const lastPart = parseFloat(parts[parts.length - 1]);
    const nextPart = (lastPart + 0.1).toFixed(1);
    
    if (parts.length === 2) {
      return `${parts[0]}.${nextPart}`;
    } else if (parts.length === 3) {
      return `${parts[0]}.${parts[1]}.${nextPart}`;
    }
    return current;
  };

  const [version, setVersion] = useState(getNextVersion(currentVersion));
  const [changelog, setChangelog] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditingVersion, setIsEditingVersion] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const changelogRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const validateVersion = (v: string): boolean => {
    // Must match pattern: number.number or number.number.number (e.g., 1.0, 1.2.3)
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    return versionRegex.test(v);
  };

  const handlePublish = () => {
    const trimmed = version.trim();
    
    if (!trimmed) {
      setError('Version cannot be empty');
      return;
    }

    if (!validateVersion(trimmed)) {
      setError('Invalid version format. Use format: 1.0 or 1.0.1');
      return;
    }

    onPublish(trimmed, changelog.trim() || undefined);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target !== changelogRef.current) {
      e.preventDefault();
      handlePublish();
    } else if (e.key === 'Escape') {
      if (isEditingVersion) {
        setIsEditingVersion(false);
      } else {
        onClose();
      }
    }
  };

  // Auto-focus input when editing version
  useEffect(() => {
    if (isEditingVersion && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingVersion]);

  // Focus trap
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

    modal.addEventListener('keydown', handleTabKey);
    
    // Focus the changelog textarea on mount
    changelogRef.current?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      <div 
        ref={modalRef}
        className="relative rounded-lg w-full max-w-[min(450px,calc(100vw-32px))] border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-elevation-lg)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b"
          style={{
            padding: 'var(--spacing-lg)',
            borderColor: 'var(--border)'
          }}
        >
          <h3 
            id="publish-title"
            style={{
              color: 'var(--foreground)',
              
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Publish Procedure
          </h3>
          <button
            onClick={onClose}
            className="transition-colors hover:opacity-80 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Close publish dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-6">
          <p 
            className="mb-4 leading-relaxed"
            style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-base)'
            }}
          >
            Publishing will make this procedure available.
          </p>

          {/* Version Number Section */}
          <div className="mb-5">
            <label 
              htmlFor="version-display" 
              className="block mb-2"
              style={{
                color: 'var(--foreground)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--text-sm)'
              }}
            >
              Version Number
            </label>
            
            {isEditingVersion ? (
              <div>
                <input
                  id="version-input"
                  ref={inputRef}
                  type="text"
                  value={version}
                  onChange={(e) => {
                    setVersion(e.target.value);
                    setError(null);
                  }}
                  onBlur={() => {
                    if (validateVersion(version.trim())) {
                      setIsEditingVersion(false);
                      setError(null);
                    }
                  }}
                  placeholder="1.0"
                  className="w-full rounded-lg px-4 py-2.5 min-h-[44px] outline-none border-2"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--ring)',
                    color: 'var(--foreground)',
                    
                    fontSize: 'var(--text-base)'
                  }}
                  aria-describedby={error ? 'version-error' : 'version-help'}
                />
                {error ? (
                  <div 
                    id="version-error" 
                    className="mt-2 p-2 rounded flex items-start border"
                    style={{
                      backgroundColor: 'var(--destructive)',
                      borderColor: 'var(--destructive)',
                      gap: 'var(--spacing-sm)'
                    }}
                    role="alert"
                  >
                    <AlertCircle 
                      className="size-4 flex-shrink-0 mt-0.5" 
                      style={{ color: 'var(--destructive-foreground)' }}
                    />
                    <p 
                      style={{
                        color: 'var(--destructive-foreground)',
                        fontSize: 'var(--text-sm)',
                        
                      }}
                    >
                      {error}
                    </p>
                  </div>
                ) : (
                  <p 
                    id="version-help" 
                    className="mt-1.5"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 'var(--text-xs)',
                      
                    }}
                  >
                    Format: 1.0 or 1.2.3 (major.minor or major.minor.patch)
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                <p
                  id="version-display"
                  className="px-4 py-2.5 rounded-lg"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--foreground)',
                    
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-bold)'
                  }}
                >
                  {version}
                </p>
                <button
                  onClick={() => setIsEditingVersion(true)}
                  className="p-1.5 rounded-lg transition-all hover:bg-secondary"
                  style={{
                    color: 'var(--muted-foreground)'
                  }}
                  aria-label="Edit version number"
                  title="Edit version"
                >
                  <Edit2 className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* What's Changed Section */}
          <div>
            <label 
              htmlFor="changelog-input"
              className="block mb-2"
              style={{
                color: 'var(--foreground)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--text-sm)'
              }}
            >
              What's changed?
            </label>
            <textarea
              id="changelog-input"
              ref={changelogRef}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe the changes in this version..."
              rows={4}
              className="w-full rounded-lg px-4 py-2.5 outline-none resize-none border"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                
                fontSize: 'var(--text-base)',
                lineHeight: '1.5'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
            <p 
              className="mt-1.5"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-xs)',
                
              }}
            >
              Optional: Add release notes or changelog
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end border-t"
          style={{
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-lg)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] rounded-button transition-opacity hover:brightness-110"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              
              fontSize: 'var(--text-base)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 min-h-[44px] rounded-button transition-opacity hover:brightness-110"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
