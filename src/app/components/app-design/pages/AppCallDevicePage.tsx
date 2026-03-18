import { Phone, Search, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRole, hasAccess } from '../../../contexts/RoleContext';
import { useAppPopup } from '../../../contexts/AppPopupContext';
import { MemberAvatar } from '../../MemberAvatar';

interface AppCallDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppCallDeviceModal({ isOpen, onClose }: AppCallDeviceModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '', '', '', '']);
  const [contactSearch, setContactSearch] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { currentRole } = useRole();
  const canStartCall = hasAccess(currentRole, 'start-call');
  const { alert: appAlert } = useAppPopup();

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 8) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCall = async () => {
    const code = digits.filter(d => d).join('');
    if (code.length > 0) {
      await appAlert(`Calling device: ${code}`, { title: 'Calling Device', variant: 'info' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-card rounded-lg shadow-elevation-lg border border-border overflow-hidden"
          style={{ width: '420px', maxWidth: '100%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Call Device</h3>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Close">
              <X className="size-4" style={{ color: '#36415D' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Contact search section */}
            <div className="mb-5">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg text-sm bg-secondary border-none outline-none text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* Sample contact */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border rounded-lg">
                <MemberAvatar
                  name="Luy Robin"
                  initials="LR"
                  color="#2F80ED"
                  size="xl"
                  role="Field Engineer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Luy Robin
                  </div>
                  <div className="text-xs text-muted">Field Engineer</div>
                </div>
                <button
                  className={`p-2 rounded-lg transition-colors ${canStartCall ? 'text-primary hover:bg-primary/10' : 'text-muted cursor-not-allowed opacity-50'}`}
                  disabled={!canStartCall}
                  title={!canStartCall ? 'You do not have permission to start calls' : undefined}
                >
                  <Phone className="size-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <p className="text-sm text-muted">Or enter device ID below</p>
            </div>

            {/* Segmented Input: 3 groups of 3 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Group 1 */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-11 text-center text-lg rounded-lg border-2 border-dashed border-input bg-card outline-none focus:border-primary focus:border-solid transition-colors"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  />
                ))}
              </div>
              <span className="text-muted text-lg">-</span>
              {/* Group 2 */}
              <div className="flex gap-1.5">
                {[3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-11 text-center text-lg rounded-lg border-2 border-dashed border-input bg-card outline-none focus:border-primary focus:border-solid transition-colors"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  />
                ))}
              </div>
              <span className="text-muted text-lg">-</span>
              {/* Group 3 */}
              <div className="flex gap-1.5">
                {[6, 7, 8].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-11 text-center text-lg rounded-lg border-2 border-dashed border-input bg-card outline-none focus:border-primary focus:border-solid transition-colors"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  />
                ))}
              </div>
            </div>

            {/* Call button */}
            <button
              onClick={handleCall}
              disabled={!canStartCall}
              className={`w-full rounded-lg flex items-center justify-center gap-2 transition-colors ${canStartCall ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted/30 text-muted cursor-not-allowed'}`}
              style={{ fontWeight: 'var(--font-weight-semibold)', minHeight: '44px' }}
              title={!canStartCall ? 'You do not have permission to start calls' : undefined}
            >
              <Phone className="size-5" />
              Call
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
