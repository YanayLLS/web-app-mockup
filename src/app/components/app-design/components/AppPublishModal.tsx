import { useState } from 'react';
import { useRole, hasAccess } from '../../../contexts/RoleContext';

interface AppPublishModalProps {
  currentVersion?: string;
  onClose: () => void;
  onPublish: (newVersion: string, changes: string) => void;
}

export function AppPublishModal({ currentVersion, onClose, onPublish }: AppPublishModalProps) {
  const { currentRole } = useRole();
  const canPublish = hasAccess(currentRole, 'publish-content');
  const [newVersion, setNewVersion] = useState(currentVersion ? '' : '1.0');
  const [changes, setChanges] = useState('');
  const [allowPayPerClick, setAllowPayPerClick] = useState(false);

  // If user can't publish, don't render the modal at all
  if (!canPublish) return null;

  // Default new version suggestion
  const suggestedVersion = (() => {
    if (!currentVersion) return '1.0';
    const parts = currentVersion.split('.');
    const minor = parseInt(parts[1] || '0', 10) + 1;
    return `${parts[0]}.${minor}`;
  })();

  const displayVersion = newVersion || suggestedVersion;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-card rounded-lg shadow-elevation-lg w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h4)' }}>
              Publish
            </h3>
            <p className="text-sm text-muted mb-5">
              You are about to publish a new version of the item.
            </p>

            {/* Current version */}
            <div className="mb-4">
              <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Current version
              </label>
              <div className="px-3 py-2.5 bg-secondary rounded-lg text-sm text-foreground">
                {currentVersion || '---'}
              </div>
            </div>

            {/* New version */}
            <div className="mb-4">
              <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                New version
              </label>
              <input
                type="text"
                value={displayVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-full px-3 py-2.5 bg-card rounded-lg text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Changes */}
            <div className="mb-4">
              <label className="text-xs text-muted mb-1 block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Changes in this version
              </label>
              <textarea
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                rows={3}
                placeholder="Describe the changes made..."
                className="w-full px-3 py-2.5 bg-card rounded-lg text-sm text-foreground border border-border outline-none resize-none placeholder:text-muted focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Pay per click checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer mb-6">
              <div
                className={`size-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                  allowPayPerClick ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setAllowPayPerClick(!allowPayPerClick);
                }}
              >
                {allowPayPerClick && (
                  <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground">Allow pay per click sharing</span>
            </label>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 min-h-[44px] bg-destructive text-white rounded-lg text-sm hover:bg-destructive/90 transition-colors"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => onPublish(displayVersion, changes)}
                className="px-5 py-2.5 min-h-[44px] bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
