import { Loader2, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface AppMeetingJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppMeetingJoinModal({ isOpen, onClose }: AppMeetingJoinModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'default' | 'loading' | 'error'>('default');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setStatus('default');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoin = () => {
    const code = digits.join('');
    if (code.length < 6) return;

    setStatus('loading');
    setTimeout(() => {
      setStatus('error');
    }, 1500);
  };

  const code = digits.join('');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-card rounded-[var(--radius)] shadow-elevation-lg border border-border overflow-hidden"
          style={{ width: '440px', maxWidth: '100%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>Join Meeting</h3>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
              <X className="size-4" style={{ color: '#36415D' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-center text-foreground mb-5" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '15px' }}>
              Enter meeting password
            </h2>

              {/* Segmented input: 2 groups of 3 */}
              <div className="flex items-center justify-center gap-3 mb-5">
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
                      className={`size-11 text-center text-lg rounded-lg outline-none transition-colors
                        ${status === 'error' ? 'border-2 border-destructive bg-destructive/5' : 'border-2 border-dashed border-input bg-card focus:border-primary focus:border-solid'}`}
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
                      className={`size-11 text-center text-lg rounded-lg outline-none transition-colors
                        ${status === 'error' ? 'border-2 border-destructive bg-destructive/5' : 'border-2 border-dashed border-input bg-card focus:border-primary focus:border-solid'}`}
                      style={{ fontWeight: 'var(--font-weight-bold)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Error message */}
              {status === 'error' && (
                <p className="text-center text-sm text-destructive mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Invalid meeting password
                </p>
              )}

              {/* Join button */}
              <button
                onClick={handleJoin}
                disabled={code.length < 6 || status === 'loading'}
                className="w-full py-2.5 bg-primary text-white rounded-[var(--radius-button)] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'JOIN'
                )}
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
