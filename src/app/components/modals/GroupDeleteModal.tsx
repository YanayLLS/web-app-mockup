import { AlertTriangle } from 'lucide-react';
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
        className="bg-card rounded-[var(--radius-lg)] p-6 max-w-md mx-4 w-full max-h-[calc(100vh-32px)] overflow-y-auto"
        style={{ boxShadow: 'var(--shadow-elevation-lg)' }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 31, 31, 0.1)' }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--destructive)' }} aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h3
          id="group-delete-title"
          className="text-center mb-1"
          style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-family)',
          }}
        >
          Warning: Delete Group
        </h3>

        {/* Subtitle */}
        <p
          id="group-delete-description"
          className="text-center mb-4"
          style={{
            color: 'var(--muted)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)',
          }}
        >
          This action cannot be undone.
        </p>

        {/* Warning about members */}
        {memberCount > 0 && (
          <div
            className="rounded-[var(--radius)] px-4 py-3 mb-6"
            style={{
              backgroundColor: 'rgba(255, 31, 31, 0.05)',
              border: '1px solid rgba(255, 31, 31, 0.2)',
            }}
          >
            <p
              style={{
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
              }}
            >
              <strong style={{ fontWeight: 'var(--font-weight-bold)' }}>{groupName}</strong> has{' '}
              <strong style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </strong>
              . They will lose any access granted through this group.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[44px] bg-secondary hover:bg-secondary/80 text-foreground rounded-[var(--radius)] transition-colors"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 min-h-[44px] transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Delete Group
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
