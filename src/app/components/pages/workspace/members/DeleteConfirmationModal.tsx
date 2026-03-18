import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmButtonText?: string;
}

export function DeleteConfirmationModal({
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmButtonText = 'Delete',
}: DeleteConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl overflow-hidden mx-4"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {title}
            </h3>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{message}</p>
          {itemName && (
            <div className="px-3 py-2 text-sm text-foreground bg-secondary/50 rounded-lg border border-border/60" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {itemName}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all text-sm"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-5 py-2.5 bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all text-sm flex items-center gap-2"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            <Trash2 size={15} />
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
