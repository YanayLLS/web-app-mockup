import { useState } from 'react';
import { RefreshCw, SkipForward, FileText, Sparkles } from 'lucide-react';
import { BaseModal } from '../../modals/BaseModal';

export type TranslationOption = 'replace' | 'skip' | 'missing-only';

interface TranslationOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (option: TranslationOption) => void;
}

const options: { value: TranslationOption; label: string; description: string; Icon: typeof RefreshCw }[] = [
  { value: 'replace', label: 'Replace all', description: 'Overwrite existing translations with new AI output.', Icon: RefreshCw },
  { value: 'skip', label: 'Skip translated nodes', description: 'Skip entire nodes that already have any translation.', Icon: SkipForward },
  { value: 'missing-only', label: 'Fill missing fields', description: 'Translate empty fields within each node, keep existing ones.', Icon: FileText },
];

export function TranslationOptionsDialog({ isOpen, onClose, onContinue }: TranslationOptionsDialogProps) {
  const [selected, setSelected] = useState<TranslationOption>('replace');

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={60}>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          width: '460px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-lg, 0 16px 48px rgba(0, 0, 0, 0.14))',
        }}
      >
        {/* Header with icon */}
        <div style={{ padding: '20px 24px 16px' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(47, 128, 237, 0.08)' }}
            >
              <Sparkles className="w-[18px] h-[18px]" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h3
                className="text-[15px] font-bold leading-tight"
                style={{ color: 'var(--foreground)' }}
              >
                Translation Options
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Some languages already have content. Choose how to handle it.
              </p>
            </div>
          </div>
        </div>

        {/* Option cards */}
        <div style={{ padding: '0 20px 20px' }} className="flex flex-col gap-2">
          {options.map((opt) => {
            const isActive = selected === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="flex items-center gap-3 cursor-pointer transition-all"
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'rgba(47, 128, 237, 0.04)' : 'var(--card)',
                  margin: isActive ? '0' : '0.25px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#C2C9DB';
                    e.currentTarget.style.backgroundColor = 'var(--secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isActive ? 'rgba(47, 128, 237, 0.10)' : 'var(--secondary)',
                  }}
                >
                  <opt.Icon
                    size={15}
                    style={{ color: isActive ? 'var(--primary)' : 'var(--muted)' }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-semibold"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}
                  >
                    {opt.label}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {opt.description}
                  </div>
                </div>

                {/* Radio */}
                <div
                  className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: isActive ? 'var(--primary)' : '#C2C9DB',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {isActive && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2.5"
          style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-secondary"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              backgroundColor: 'var(--card)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onContinue(selected);
              onClose();
            }}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
