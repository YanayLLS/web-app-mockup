import { X } from 'lucide-react';

interface XRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function XRLoginModal({ isOpen, onClose }: XRLoginModalProps) {
  const pinCode = '1341';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-[var(--radius)] w-full max-w-[calc(100vw-32px)] sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--elevation-lg)', fontFamily: 'var(--font-family)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
            Login with XR
          </h2>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:p-6">
          <div className="border border-border rounded-[var(--radius)] px-4 py-6 sm:p-6">
            <h3 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
              Quick login for XR headsets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Personal QR code
                </p>
                <div className="bg-white border border-border rounded-[var(--radius)] p-6 flex items-center justify-center aspect-square">
                  <div className="w-40 h-40 bg-secondary rounded flex items-center justify-center text-muted" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                    QR Code
                  </div>
                </div>
              </div>
              <div>
                <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Personal PIN code
                </p>
                <div className="bg-background border border-border rounded-[var(--radius)] p-6 flex items-center justify-center min-h-[120px] sm:h-full">
                  <span className="text-foreground" style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)', letterSpacing: '0.2em' }}>
                    {pinCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-[var(--radius)] p-4">
              <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}>
                To use quick login on XR device:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                <li>Scan QR code with XR headset</li>
                <li>Enter PIN code when prompted</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
