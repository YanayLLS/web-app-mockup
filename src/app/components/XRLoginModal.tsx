import { X, Glasses, QrCode, KeyRound } from 'lucide-react';

interface XRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function XRLoginModal({ isOpen, onClose }: XRLoginModalProps) {
  const pinCode = '1341';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl w-full max-w-[calc(100vw-32px)] sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-border/60 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center text-[#00BCD4]">
              <Glasses size={20} />
            </div>
            <div>
              <h2 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                Login with XR
              </h2>
              <p className="text-xs text-muted mt-0.5">Quick access for headset devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* QR Code */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <QrCode size={16} className="text-primary" />
                <p className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Personal QR code
                </p>
              </div>
              <div className="bg-white border border-border/60 rounded-xl p-6 flex items-center justify-center aspect-square" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-40 h-40 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <QrCode size={64} className="text-muted/30" />
                </div>
              </div>
            </div>

            {/* PIN Code */}
            <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={16} className="text-[#8B5CF6]" />
                <p className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Personal PIN code
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#8B5CF6]/5 to-primary/5 border border-[#8B5CF6]/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[120px] sm:h-[calc(100%-52px)]">
                <div className="flex gap-3">
                  {pinCode.split('').map((digit, i) => (
                    <div
                      key={i}
                      className="w-12 h-14 bg-card border border-border rounded-lg flex items-center justify-center"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                      <span className="text-foreground text-2xl" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {digit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-primary/[0.04] border border-primary/10 rounded-xl p-5">
            <p className="text-foreground mb-3 flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              How to use quick login
            </p>
            <div className="space-y-2.5 ml-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>1</span>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Scan the QR code with your XR headset camera</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>2</span>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Enter the PIN code when prompted on the device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
