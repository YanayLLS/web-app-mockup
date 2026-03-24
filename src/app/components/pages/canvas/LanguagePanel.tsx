import { useState, useRef, useEffect } from 'react';
import { X, Globe, MoreHorizontal, Sparkles, Download, Upload, AlertTriangle, Eye, EyeOff, Trash2, Star } from 'lucide-react';

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

/* ── tiny progress ring (SVG) ────────────────────────────── */
function ProgressRing({ percent, size = 28, stroke = 3 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = percent >= 100 ? '#11E874' : percent >= 60 ? '#2F80ED' : '#C2C9DB';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E9E9E9"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
      />
    </svg>
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
      className="absolute top-0 right-0 bottom-0 z-[55] flex flex-col"
      style={{
        width: '360px',
        backgroundColor: '#FFFFFF',
        boxShadow: '-4px 0 24px rgba(54, 65, 93, 0.10), -1px 0 4px rgba(54, 65, 93, 0.06)',
      }}
    >
      {/* ── Gradient accent stripe ── */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #2F80ED, #004FFF)',
          flexShrink: 0,
        }}
      />

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid #E9E9E9' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2F80ED, #004FFF)',
              boxShadow: '0 2px 8px rgba(47, 128, 237, 0.3)',
            }}
          >
            <Globe className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h3
              className="text-sm font-bold leading-tight"
              style={{ color: '#36415D', letterSpacing: '-0.01em' }}
            >
              Languages
            </h3>
            <span className="text-[11px]" style={{ color: '#868D9E' }}>
              {procedureLanguages.length} language{procedureLanguages.length !== 1 ? 's' : ''} configured
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: '#868D9E' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Language list ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '8px 12px' }}>
        {addedLanguages.map((lang) => {
          const isDefault = lang.code === defaultLanguage;
          const isHovered = hoveredCard === lang.code;
          const completeness = translationCompleteness[lang.code] ?? (isDefault ? 100 : 0);
          const isEditing = lang.code === editingLanguage;
          const isHidden = languageVisibility[lang.code] === false;
          const barColor = completeness >= 100 ? '#11E874' : completeness >= 60 ? '#2F80ED' : '#C2C9DB';

          return (
            <div
              key={lang.code}
              className="flex items-center gap-3 transition-all"
              style={{
                padding: '8px 10px',
                marginBottom: '2px',
                borderRadius: '10px',
                backgroundColor: isEditing ? 'rgba(47, 128, 237, 0.05)' : isHovered ? '#F8F8FA' : 'transparent',
                borderLeft: isEditing ? '3px solid #2F80ED' : '3px solid transparent',
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
                    style={{ color: isEditing ? '#2F80ED' : '#36415D' }}
                  >
                    {lang.name}
                  </span>
                  {isDefault && (
                    <span
                      className="text-[10px] font-semibold px-2 py-[2px] rounded-full shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(47, 128, 237, 0.10), rgba(47, 128, 237, 0.06))',
                        color: '#2F80ED',
                        border: '1px solid rgba(47, 128, 237, 0.15)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Default
                    </span>
                  )}
                </div>
                {/* Thin progress bar */}
                {!isDefault && (
                  <div
                    className="mt-1.5 rounded-full overflow-hidden"
                    style={{ height: '3px', backgroundColor: '#F0F0F0', width: '100%' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${completeness}%`,
                        backgroundColor: barColor,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Percentage text — compact */}
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
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                  style={{
                    color: '#868D9E',
                    opacity: isHovered || openMenuCode === lang.code ? 1 : 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E9E9E9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <MoreHorizontal size={14} />
                </button>

                {openMenuCode === lang.code && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 z-50 rounded-xl py-1.5 min-w-[200px]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E9E9E9',
                      boxShadow: '0 8px 24px rgba(54, 65, 93, 0.12), 0 2px 6px rgba(54, 65, 93, 0.06)',
                      animation: 'fadeInSlide 0.15s ease-out',
                    }}
                  >
                    <button
                      onClick={() => {
                        onSetDefaultLanguage(lang.code);
                        setOpenMenuCode(null);
                      }}
                      disabled={isDefault}
                      className="w-full text-left px-3.5 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5"
                      style={{ color: '#36415D' }}
                      onMouseEnter={(e) => {
                        if (!isDefault) e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Star size={13} style={{ color: '#868D9E' }} />
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
                      className="w-full text-left px-3.5 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5"
                      style={{ color: '#36415D' }}
                      onMouseEnter={(e) => {
                        if (!isDefault) e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Sparkles size={13} style={{ color: '#2F80ED' }} />
                      Translate with AI
                    </button>

                    <div className="my-1 mx-3" style={{ borderTop: '1px solid #E9E9E9' }} />

                    <button
                      onClick={() => {
                        onToggleVisibility(lang.code);
                        setOpenMenuCode(null);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center gap-2.5"
                      style={{ color: '#36415D' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {languageVisibility[lang.code] !== false ? (
                        <EyeOff size={13} style={{ color: '#868D9E' }} />
                      ) : (
                        <Eye size={13} style={{ color: '#868D9E' }} />
                      )}
                      {languageVisibility[lang.code] !== false ? 'Hide language' : 'Show language'}
                    </button>

                    <button
                      onClick={() => {
                        onDeleteLanguage(lang.code);
                        setOpenMenuCode(null);
                      }}
                      disabled={isDefault}
                      className="w-full text-left px-3.5 py-2 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5"
                      style={{ color: isDefault ? '#7F7F7F' : '#FF1F1F' }}
                      onMouseEnter={(e) => {
                        if (!isDefault) e.currentTarget.style.backgroundColor = 'rgba(255, 31, 31, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 size={13} style={{ color: isDefault ? '#7F7F7F' : '#FF1F1F' }} />
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
        className="px-5 py-4 shrink-0 flex flex-col gap-2.5"
        style={{ borderTop: '1px solid #E9E9E9' }}
      >
        <button
          onClick={onOpenAddLanguages}
          className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #2F80ED, #004FFF)',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(47, 128, 237, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(47, 128, 237, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(47, 128, 237, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Globe size={13} />
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
          className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              procedureLanguages.length >= 2
                ? 'rgba(47, 128, 237, 0.06)'
                : '#F5F5F5',
            color:
              procedureLanguages.length >= 2
                ? '#2F80ED'
                : '#7F7F7F',
            border: `1px solid ${
              procedureLanguages.length >= 2
                ? 'rgba(47, 128, 237, 0.2)'
                : '#E9E9E9'
            }`,
            opacity: procedureLanguages.length < 2 ? 0.5 : 1,
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
            className="flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
            style={{
              border: '1px solid #E9E9E9',
              color: '#868D9E',
              backgroundColor: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
              e.currentTarget.style.borderColor = '#C2C9DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E9E9E9';
            }}
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={() => {/* mock -- no-op */}}
            className="flex-1 px-3 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
            style={{
              border: '1px solid #E9E9E9',
              color: '#868D9E',
              backgroundColor: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
              e.currentTarget.style.borderColor = '#C2C9DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E9E9E9';
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9E9E9',
              boxShadow: '0 16px 48px rgba(54, 65, 93, 0.14), 0 4px 12px rgba(54, 65, 93, 0.08)',
              animation: 'fadeInSlide 0.15s ease-out',
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
                  <h3 className="text-[14px] font-bold" style={{ color: '#36415D' }}>
                    AI Usage Limit Reached
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: '#868D9E' }}>
                    {aiCreditsUsed.toLocaleString()} / {aiCreditsMax.toLocaleString()} credits used
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#5E677D' }}>
                Your workspace has reached its AI credit limit. To continue translating with AI, contact your administrator to increase the credit allocation.
              </p>
            </div>
            <div
              className="flex justify-end gap-2"
              style={{ padding: '12px 20px', borderTop: '1px solid #F0F0F0' }}
            >
              <button
                onClick={() => setShowLimitPopup(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ border: '1px solid #E9E9E9', color: '#5E677D', backgroundColor: '#FFFFFF' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* keyframe animation for dropdown menu */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
