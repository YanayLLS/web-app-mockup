import { AlertCircle, AlertTriangle } from 'lucide-react';
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
  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertTriangle : AlertCircle;

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} opacity={60} blur zIndex={60}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="bg-card rounded-xl w-full max-w-md mx-4 border border-border overflow-hidden"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}>
              <Icon size={20} />
            </div>
            <h2 id="confirm-dialog-title" className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              {title}
            </h2>
          </div>

          <p className="text-foreground/80 leading-relaxed" id="confirm-dialog-description" style={{ fontSize: 'var(--text-sm)' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg transition-all hover:brightness-110 hover:shadow-md ${
              isDanger
                ? 'bg-destructive text-white hover:shadow-destructive/20'
                : 'bg-primary text-primary-foreground hover:shadow-primary/20'
            }`}
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
