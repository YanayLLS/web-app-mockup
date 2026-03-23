import { BaseModal } from '../../modals/BaseModal';
import { SUPPORTED_LANGUAGES } from './languageConstants';

interface TranslationProgressModalProps {
  isOpen: boolean;
  targetLanguages: string[];
  progress: Record<string, number>; // real progress per language (0-100)
  onCancel: () => void;
}

export function TranslationProgressModal({
  isOpen,
  targetLanguages,
  progress,
  onCancel,
}: TranslationProgressModalProps) {
  const langMap = new Map(SUPPORTED_LANGUAGES.map((l) => [l.code, l]));

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} zIndex={65}>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          width: '480px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-lg)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            AI Translation in Progress
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Translating content into {targetLanguages.length} language{targetLanguages.length > 1 ? 's' : ''}...
          </p>
        </div>

        {/* Progress list */}
        <div className="px-6 py-4 flex flex-col gap-4">
          {targetLanguages.map((code) => {
            const lang = langMap.get(code);
            const pct = Math.round(progress[code] || 0);
            return (
              <div key={code}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{lang?.flag || '\u{1F3F3}\u{FE0F}'}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {lang?.name || code}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: pct >= 100 ? '#11E874' : 'var(--primary)' }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--secondary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? '#11E874' : 'var(--primary)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border hover:bg-secondary transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
