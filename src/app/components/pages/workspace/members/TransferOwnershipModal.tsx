import { AlertCircle } from 'lucide-react';

interface TransferOwnershipModalProps {
  memberName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function TransferOwnershipModal({ memberName, onClose, onConfirm }: TransferOwnershipModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-elevation-lg w-full max-w-[480px]"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)' }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: '#d97706' }} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold mb-1" style={{ color: 'var(--foreground)', fontSize: 'var(--text-h4)' }}>
                Transfer Workspace Ownership
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
            Transferring ownership will change your role from a workspace owner to an admin. 
            <span className="font-medium"> {memberName}</span> will become the new workspace owner and gain full control over the workspace.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--foreground)' }}>
            Are you sure you want to proceed?
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-lg transition-opacity"
            style={{
              backgroundColor: '#d97706',
              color: 'white',
            }}
          >
            Transfer Ownership
          </button>
        </div>
      </div>
    </div>
  );
}
