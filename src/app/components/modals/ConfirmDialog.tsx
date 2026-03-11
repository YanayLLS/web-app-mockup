import { AlertCircle } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} opacity={60} blur zIndex={60}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="bg-card rounded-[var(--radius)] shadow-lg w-full max-w-md mx-4 border border-border overflow-hidden"
        style={{ boxShadow: 'var(--elevation-lg)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-[var(--radius)] ${
              variant === 'danger' ? 'bg-red-500/10' : 'bg-accent/10'
            }`}>
              <AlertCircle
                size={20}
                className={variant === 'danger' ? 'text-red-500' : 'text-accent'}
                aria-hidden="true"
              />
            </div>
            <h2 id="confirm-dialog-title" className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {variant === 'danger' ? 'Warning: ' : ''}{title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-foreground" id="confirm-dialog-description">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-secondary/30 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-secondary transition-colors"
          >
            <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {cancelText}
            </span>
          </button>
          <button
            onClick={onConfirm}
            className={`h-10 px-4 rounded-[var(--radius)] transition-colors ${
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {confirmText}
            </span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
