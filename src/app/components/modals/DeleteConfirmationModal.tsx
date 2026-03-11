import { AlertTriangle } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export function DeleteConfirmationModal({
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmationModalProps) {
  return (
    <BaseModal isOpen={true} onClose={onClose} opacity={70} zIndex={200}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-message"
        className="bg-card rounded-[var(--radius-lg)] p-6 max-w-md mx-4"
        style={{ boxShadow: 'var(--shadow-elevation-lg)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={20} className="text-destructive shrink-0" aria-hidden="true" />
          <h3
            id="delete-confirm-title"
            className="text-foreground"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Warning: {title}
          </h3>
        </div>
        <p
          id="delete-confirm-message"
          className="text-muted mb-6"
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)',
          }}
        >
          {message}
          {itemName && (
            <>
              {' '}
              <strong style={{ color: 'var(--foreground)' }}>{itemName}</strong>
            </>
          )}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-[var(--radius)] transition-colors"
            style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 transition-colors"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
