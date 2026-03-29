import { useState, useRef, useEffect } from 'react';
import { X, Globe, MoreHorizontal, Sparkles, Download, Upload, AlertTriangle, Eye, EyeOff, Trash2, Star, Plus } from 'lucide-react';

import { SUPPORTED_LANGUAGES } from './languageConstants';
import type { LanguageDefinition } from './languageConstants';

interface LanguagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  procedureLanguages: string[];
  defaultLanguage: string;
  editingLanguage: string;
  languageVisibility: Record<string, boolean>;
  onSetEditingLanguage: (code: string) => void;
  onSetDefaultLanguage: (code: string) => void;
  onToggleVisibility: (code: string) => void;
  onDeleteLanguage: (code: string) => void;
  onOpenAddLanguages: () => void;
  onTranslateWithAI: (targetCodes: string[]) => void;
  aiCreditsUsed?: number;
  aiCreditsMax?: number;
  translationCompleteness?: Record<string, number>;
}

/* ── tiny progress bar ─────────────────────────────────── */
function ProgressBar({ percent }: { percent: number }) {
  const color = percent >= 100 ? '#11E874' : percent >= 60 ? 'var(--primary)' : 'var(--border-color, #C2C9DB)';
  return (
    <div
      className="mt-1.5 rounded-full overflow-hidden"
      style={{ height: '3px', backgroundColor: 'var(--secondary)', width: '100%' }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

export function LanguagePanel({
  isOpen,
  onClose,
  procedureLanguages,
  defaultLanguage,
  editingLanguage,
  languageVisibility,
  onSetEditingLanguage,
  onSetDefaultLanguage,
  onToggleVisibility,
  onDeleteLanguage,
  onOpenAddLanguages,
  onTranslateWithAI,
  aiCreditsUsed = 0,
  aiCreditsMax = 0,
  translationCompleteness = {},
}: LanguagePanelProps) {
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close floating menu on outside click
  useEffect(() => {
    if (!openMenuCode) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuCode(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuCode]);

  if (!isOpen) return null;

  const langMap = new Map<string, LanguageDefinition>();
  SUPPORTED_LANGUAGES.forEach((l) => langMap.set(l.code, l));

  const addedLanguages = procedureLanguages
    .map((code) => langMap.get(code))
    .filter(Boolean) as LanguageDefinition[];

  const nonDefaultLanguages = procedureLanguages.filter((c) => c !== defaultLanguage);

  const aiLimitReached = aiCreditsMax > 0 && aiCreditsUsed >= aiCreditsMax;

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-[55] flex flex-col border-l"
      style={{
        width: '360px',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Languages
          </span>
          {procedureLanguages.length > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)' }}
            >
              {procedureLanguages.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-secondary"
          style={{ color: 'var(--muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Language list ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {addedLanguages.map((lang) => {
          const isDefault = lang.code === defaultLanguage;
          const isHovered = hoveredCard === lang.code;
          const completeness = translationCompleteness[lang.code] ?? (isDefault ? 100 : 0);
          const isEditing = lang.code === editingLanguage;
          const isHidden = languageVisibility[lang.code] === false;
          const barColor = completeness >= 100 ? '#11E874' : completeness >= 60 ? 'var(--primary)' : 'var(--border-color, #C2C9DB)';

          return (
            <div
              key={lang.code}
              className="flex items-center gap-3 transition-all rounded-lg"
              style={{
                padding: '8px 10px',
                marginBottom: '2px',
                backgroundColor: isEditing ? 'rgba(47, 128, 237, 0.05)' : isHovered ? 'var(--secondary)' : 'transparent',
                borderLeft: isEditing ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer',
                opacity: isHidden ? 0.45 : 1,
              }}
              onClick={() => onSetEditingLanguage(lang.code)}
              onMouseEnter={() => setHoveredCard(lang.code)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Flag */}
              <span className="text-xl leading-none shrink-0">{lang.flag}</span>

              {/* Name + progress bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: isEditing ? 'var(--primary)' : 'var(--foreground)' }}
                  >
                    {lang.name}
                  </span>
                  {isDefault && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full shrink-0"
                      style={{
                        backgroundColor: 'rgba(47, 128, 237, 0.08)',
                        color: 'var(--primary)',
                      }}
                    >
                      Default
                    </span>
                  )}
                </div>
                {!isDefault && <ProgressBar percent={completeness} />}
              </div>

              {/* Percentage text */}
              {!isDefault && (
                <span
                  className="text-[10px] font-medium shrink-0 tabular-nums"
                  style={{ color: barColor, minWidth: '28px', textAlign: 'right' }}
                >
                  {completeness}%
                </span>
              )}

              {/* Three-dot menu — visible on hover or when open */}
              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuCode(openMenuCode === lang.code ? null : lang.code);
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-secondary"
                  style={{
                    color: 'var(--muted)',
                    opacity: isHovered || openMenuCode === lang.code ? 1 : 0,
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>

                {openMenuCode === lang.code && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 z-50 rounded-lg py-1 min-w-[200px]"
                    style={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <button
                      onClick={() => {
                        onSetDefaultLanguage(lang.code);
                        setOpenMenuCode(null);
                      }}
                      disabled={isDefault}
                      className="w-full text-left px-3 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 hover:bg-secondary"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Star size={13} style={{ color: 'var(--muted)' }} />
                      Set as default
                    </button>

                    <button
                      onClick={() => {
                        if (aiLimitReached) {
                          setOpenMenuCode(null);
                          setShowLimitPopup(true);
                        } else {
                          onTranslateWithAI([lang.code]);
                          setOpenMenuCode(null);
                        }
                      }}
                      disabled={isDefault}
                      className="w-full text-left px-3 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 hover:bg-secondary"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                      Translate with AI
                    </button>

                    <div className="my-1 mx-3" style={{ borderTop: '1px solid var(--border)' }} />

                    <button
                      onClick={() => {
                        onToggleVisibility(lang.code);
                        setOpenMenuCode(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2.5 hover:bg-secondary"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {languageVisibility[lang.code] !== false ? (
                        <EyeOff size={13} style={{ color: 'var(--muted)' }} />
                      ) : (
                        <Eye size={13} style={{ color: 'var(--muted)' }} />
                      )}
                      {languageVisibility[lang.code] !== false ? 'Hide language' : 'Show language'}
                    </button>

                    <button
                      onClick={() => {
                        onDeleteLanguage(lang.code);
                        setOpenMenuCode(null);
                      }}
                      disabled={isDefault}
                      className="w-full text-left px-3 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5"
                      style={{ color: isDefault ? 'var(--disabled, #7F7F7F)' : '#FF1F1F' }}
                      onMouseEnter={(e) => {
                        if (!isDefault) e.currentTarget.style.backgroundColor = 'rgba(255, 31, 31, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 size={13} style={{ color: isDefault ? 'var(--disabled, #7F7F7F)' : '#FF1F1F' }} />
                      Delete language
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer actions ── */}
      <div
        className="px-4 py-3 shrink-0 flex flex-col gap-2 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onOpenAddLanguages}
          className="w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
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
          <Plus size={13} />
          Add Languages
        </button>

        <button
          onClick={() => {
            if (aiLimitReached) {
              setShowLimitPopup(true);
            } else {
              onTranslateWithAI(nonDefaultLanguages);
            }
          }}
          disabled={procedureLanguages.length < 2}
          className="w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            backgroundColor: procedureLanguages.length >= 2 ? 'rgba(47, 128, 237, 0.06)' : 'var(--secondary)',
            color: procedureLanguages.length >= 2 ? 'var(--primary)' : 'var(--muted)',
            border: `1px solid ${procedureLanguages.length >= 2 ? 'rgba(47, 128, 237, 0.15)' : 'var(--border)'}`,
          }}
          onMouseEnter={(e) => {
            if (procedureLanguages.length >= 2) {
              e.currentTarget.style.backgroundColor = 'rgba(47, 128, 237, 0.10)';
            }
          }}
          onMouseLeave={(e) => {
            if (procedureLanguages.length >= 2) {
              e.currentTarget.style.backgroundColor = 'rgba(47, 128, 237, 0.06)';
            }
          }}
        >
          <Sparkles size={13} />
          Translate All with AI
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {/* mock -- no-op */}}
            className="flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 hover:bg-secondary"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              backgroundColor: 'var(--card)',
            }}
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={() => {/* mock -- no-op */}}
            className="flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 hover:bg-secondary"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              backgroundColor: 'var(--card)',
            }}
          >
            <Upload size={12} /> Import
          </button>
        </div>
      </div>

      {/* AI limit reached popup */}
      {showLimitPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 70 }}
          onClick={() => setShowLimitPopup(false)}
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              width: '380px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.14), 0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(255, 31, 31, 0.08)' }}
                >
                  <AlertTriangle size={18} style={{ color: '#FF1F1F' }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold" style={{ color: 'var(--foreground)' }}>
                    AI Usage Limit Reached
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    {aiCreditsUsed.toLocaleString()} / {aiCreditsMax.toLocaleString()} credits used
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-pressed, #5E677D)' }}>
                Your workspace has reached its AI credit limit. To continue translating with AI, contact your administrator to increase the credit allocation.
              </p>
            </div>
            <div
              className="flex justify-end gap-2"
              style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setShowLimitPopup(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-secondary"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
