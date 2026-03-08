import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 shadow-lg border-2"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 transition-colors"
            style={{ borderRadius: 'var(--radius-md)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p
            className="text-sm mb-3"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {message}
          </p>
          {itemName && (
            <div
              className="px-3 py-2 text-sm font-medium"
              style={{
                backgroundColor: 'var(--secondary)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {itemName}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-colors text-sm"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
              borderRadius: 'var(--radius-md)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 transition-colors text-sm"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              fontFamily: 'var(--font-family)',
              borderRadius: 'var(--radius-md)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
