import { AlertTriangle, Trash2 } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface GroupDeleteModalProps {
  groupName: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GroupDeleteModal({
  groupName,
  memberCount,
  onConfirm,
  onCancel,
}: GroupDeleteModalProps) {
  return (
    <BaseModal isOpen={true} onClose={onCancel} opacity={70} zIndex={200}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="group-delete-title"
        aria-describedby="group-delete-description"
        className="bg-card rounded-xl max-w-md mx-4 w-full max-h-[calc(100vh-32px)] overflow-y-auto border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      >
        <div className="px-6 py-5">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3
                id="group-delete-title"
                className="text-foreground"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                Delete Group
              </h3>
              <p id="group-delete-description" className="text-xs text-muted mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Warning about members */}
          {memberCount > 0 && (
            <div className="rounded-xl px-4 py-3 mt-4 bg-destructive/5 border border-destructive/15">
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>{groupName}</strong> has{' '}
                <strong className="text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                </strong>
                . They will lose any access granted through this group.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[44px] bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 min-h-[44px] bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all flex items-center gap-2"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <Trash2 size={15} />
            Delete Group
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
