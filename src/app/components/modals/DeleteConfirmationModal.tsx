import { AlertTriangle, Trash2 } from 'lucide-react';
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
        className="bg-card rounded-xl max-w-md mx-4 overflow-hidden border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h3
              id="delete-confirm-title"
              className="text-foreground"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {title}
            </h3>
          </div>
          <p
            id="delete-confirm-message"
            className="text-foreground/80 leading-relaxed"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {message}
            {itemName && (
              <>
                {' '}
                <strong className="text-foreground">{itemName}</strong>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all flex items-center gap-2"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
