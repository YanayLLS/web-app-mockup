import { AlertTriangle } from 'lucide-react';

interface GroupDeleteModalProps {
  groupName: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GroupDeleteModal({ groupName, memberCount, onConfirm, onCancel }: GroupDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-elevation-lg w-full max-w-[420px]"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="p-6 flex flex-col gap-5">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--destructive-background, rgba(239, 68, 68, 0.1))' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--destructive)' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                Delete Group
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>
              Are you sure you want to delete the <span className="font-bold">"{groupName}"</span> group?
            </p>
            {memberCount > 0 && (
              <div
                className="px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'var(--destructive-background, rgba(239, 68, 68, 0.1))' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>
                  {memberCount} member{memberCount > 1 ? 's are' : ' is'} currently in this group
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  They will lose access to all projects associated with this group
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              Delete Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
