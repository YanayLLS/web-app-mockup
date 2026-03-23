import { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Star,
  Play,
  Box,
  ExternalLink,
  Eye,
  Settings,
  Clock,
  ChevronDown,
  ChevronRight,
  Volume2,
  GitBranch,
} from 'lucide-react';

interface ProcedureModalVariantE1Props {
  procedure: {
    id: string;
    name: string;
    description?: string;
    connectedDigitalTwinIds?: string[];
    digitalTwinId?: string;
    thumbnail?: string;
    isPublished: boolean;
    hasUnpublishedChanges: boolean;
    publishedVersion?: string;
    publishedDate?: string;
    createdBy: string;
    createdDate: string;
    lastEditedBy: string;
    lastEdited: string;
  };
  onClose: () => void;
}

export function ProcedureModalVariantE1({ procedure, onClose }: ProcedureModalVariantE1Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(procedure.name);
  const [descriptionValue, setDescriptionValue] = useState(
    procedure.description || ''
  );
  const [editingDescription, setEditingDescription] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Settings state
  const [settings, setSettings] = useState({
    autoNarrateHeader: true,
    autoNarrateDescription: true,
    waitForCompletion: true,
    allow2D: true,
    toggleStep: true,
    allowSkipping: false,
    showSurvey: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Version history data
  const versionHistory = [
    { version: '2.3', date: 'Mar 15, 2026', by: 'Laura Green' },
    { version: '2.2', date: 'Mar 2, 2026', by: 'James Moriarty' },
    { version: '2.1', date: 'Feb 14, 2026', by: 'Laura Green' },
    { version: '2.0', date: 'Jan 10, 2026', by: 'Laura Green' },
    { version: '1.0', date: 'Dec 20, 2025', by: 'Sarah Connor' },
  ];

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Focus description textarea when editing
  useEffect(() => {
    if (editingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
      const len = descriptionRef.current.value.length;
      descriptionRef.current.setSelectionRange(len, len);
    }
  }, [editingDescription]);

  // Auto-resize textarea
  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-e1-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 750,
          height: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 32px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Minimal Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-6"
          style={{
            height: 52,
            borderBottom: '1px solid #F0F1F4',
            backgroundColor: '#FAFBFD',
          }}
        >
          {/* Left: Title breadcrumb */}
          <h2
            id="variant-e1-title"
            className="truncate"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#36415D',
              lineHeight: '20px',
              letterSpacing: '-0.01em',
            }}
          >
            {titleValue || procedure.name}
          </h2>

          {/* Right: Icon buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="flex items-center justify-center transition-all"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                color: '#868D9E',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF0F6';
                e.currentTarget.style.color = '#36415D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#868D9E';
              }}
              title="Share"
            >
              <Share2 size={15} />
            </button>

            <button
              onClick={() => setIsStarred(!isStarred)}
              className="flex items-center justify-center transition-all"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                color: isStarred ? '#F59E0B' : '#868D9E',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF0F6';
                if (!isStarred) e.currentTarget.style.color = '#36415D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isStarred ? '#F59E0B' : '#868D9E';
              }}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={15} fill={isStarred ? '#F59E0B' : 'none'} />
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center transition-all"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                color: '#868D9E',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF0F6';
                e.currentTarget.style.color = '#36415D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#868D9E';
              }}
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* ─── Hero Preview ─── */}
          <div
            className="relative overflow-hidden flex items-center justify-center"
            style={{
              width: '100%',
              height: 300,
              background: 'linear-gradient(155deg, #2F80ED 0%, #1A6AD4 40%, #0033BB 100%)',
            }}
          >
            {/* Mesh-like decorative shapes */}
            <div
              style={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -60,
                left: -40,
                width: 240,
                height: 240,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '60%',
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,79,255,0.15) 0%, transparent 70%)',
              }}
            />
            {/* Subtle noise-like overlay for depth */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.06) 100%)',
              }}
            />

            {/* Play Button — frosted glass */}
            <button
              className="relative z-10 flex items-center justify-center"
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
                cursor: 'pointer',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
              aria-label="Play 3D preview"
            >
              <Play size={28} style={{ color: '#FFFFFF', marginLeft: 3 }} fill="#FFFFFF" />
            </button>

            {/* Bottom-left: DT name badge — frosted glass */}
            <div className="absolute bottom-4 left-5 z-10">
              <div
                className="flex items-center gap-2 px-3.5 py-2"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Box size={13} style={{ color: 'rgba(255,255,255,0.75)' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                  Generator Digital Twin
                </span>
              </div>
            </div>
          </div>

          {/* ─── Action Row ─── */}
          <div
            className="flex items-center gap-1 px-6"
            style={{ height: 50 }}
          >
            <ActionLink icon={<ExternalLink size={13} />} label="Edit in app" color="#2F80ED" hoverColor="#1A6AD4" />
            <ActionLink icon={<ExternalLink size={13} />} label="Edit in canvas" color="#2F80ED" hoverColor="#1A6AD4" />
            <span style={{ color: '#E0E2E8', fontSize: 16, userSelect: 'none', margin: '0 4px' }}>|</span>
            <ActionLink icon={<Eye size={13} />} label="Preview as operator" color="#5E677D" hoverColor="#36415D" />
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 24px' }} />

          {/* ─── Title + Description Section ─── */}
          <div style={{ padding: '24px 28px 20px' }}>
            {/* Editable title */}
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                  if (e.key === 'Escape') {
                    setTitleValue(procedure.name);
                    setEditingTitle(false);
                  }
                }}
                className="w-full outline-none"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#36415D',
                  lineHeight: '30px',
                  letterSpacing: '-0.02em',
                  padding: '2px 0',
                  border: 'none',
                  borderBottom: '2px solid #2F80ED',
                  background: 'transparent',
                }}
              />
            ) : (
              <h3
                className="cursor-text"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#36415D',
                  lineHeight: '30px',
                  letterSpacing: '-0.02em',
                  padding: '2px 0',
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 200ms ease',
                }}
                onClick={() => setEditingTitle(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = '#D9E0F0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                {titleValue || procedure.name}
              </h3>
            )}

            {/* Editable description */}
            {editingDescription ? (
              <textarea
                ref={descriptionRef}
                value={descriptionValue}
                onChange={(e) => {
                  setDescriptionValue(e.target.value);
                  autoResizeTextarea(e.target);
                }}
                onBlur={() => setEditingDescription(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingDescription(false);
                  }
                }}
                className="w-full outline-none resize-none"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#5E677D',
                  lineHeight: '22.4px',
                  marginTop: 10,
                  padding: '4px 0',
                  border: 'none',
                  borderBottom: '2px solid #2F80ED',
                  background: 'transparent',
                  minHeight: 44,
                }}
                placeholder="Add a description..."
              />
            ) : (
              <p
                className="cursor-text"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: descriptionValue ? '#5E677D' : '#868D9E',
                  lineHeight: '22.4px',
                  marginTop: 10,
                  padding: '4px 0',
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 200ms ease',
                }}
                onClick={() => setEditingDescription(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = '#D9E0F0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                {descriptionValue || 'Add a description...'}
              </p>
            )}
          </div>

          {/* ─── Properties Section — tinted background ─── */}
          <div
            style={{
              backgroundColor: '#F8F9FC',
              margin: '0 16px',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <E1PropertyRow
              label="Status"
              value={
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                    backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.08)' : 'rgba(127,127,127,0.08)',
                    padding: '3px 12px',
                    borderRadius: 20,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: procedure.isPublished ? '#11E874' : '#7F7F7F',
                      display: 'inline-block',
                    }}
                  />
                  {procedure.isPublished
                    ? `Published v${procedure.publishedVersion || '2.3'}`
                    : 'Draft'}
                </span>
              }
            />
            <E1PropertyRow
              label="Digital Twin"
              value={
                <span
                  className="cursor-pointer"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#2F80ED',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.textDecoration = 'underline';
                    (e.currentTarget as HTMLSpanElement).style.color = '#1A6AD4';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.textDecoration = 'none';
                    (e.currentTarget as HTMLSpanElement).style.color = '#2F80ED';
                  }}
                >
                  Generator Digital Twin
                </span>
              }
            />
            <E1PropertyRow
              label="Created"
              value={
                <span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>
                  {procedure.createdDate} by {procedure.createdBy}
                </span>
              }
            />
            <E1PropertyRow
              label="Last edited"
              value={
                <span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>
                  {procedure.lastEdited} by {procedure.lastEditedBy}
                </span>
              }
            />
            <E1PropertyRow
              label="Published"
              value={
                <span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>
                  {procedure.publishedDate || 'Feb 14, 2026'}
                </span>
              }
              isLast
            />
          </div>

          {/* Spacer */}
          <div style={{ height: 8 }} />

          {/* ─── Settings Section (Collapsible) ─── */}
          <div style={{ padding: '0 24px' }}>
            <CollapsibleHeader
              icon={<Settings size={14} />}
              label="Settings"
              isOpen={settingsOpen}
              onToggle={() => setSettingsOpen(!settingsOpen)}
            />

            <div
              style={{
                overflow: 'hidden',
                maxHeight: settingsOpen ? 500 : 0,
                opacity: settingsOpen ? 1 : 0,
                transition: 'max-height 300ms ease, opacity 200ms ease',
              }}
            >
              <div
                style={{
                  paddingBottom: 18,
                  paddingLeft: 8,
                  borderLeft: '3px solid #2F80ED',
                  marginLeft: 6,
                }}
              >
                {/* Text-to-speech group */}
                <div style={{ marginBottom: 18 }}>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: 10, paddingLeft: 12 }}>
                    <Volume2 size={13} style={{ color: '#2F80ED' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      Text to Speech
                    </span>
                  </div>
                  <div className="flex flex-col gap-2" style={{ paddingLeft: 12 }}>
                    <E1SettingCheckbox
                      label="Auto narrate header"
                      checked={settings.autoNarrateHeader}
                      onChange={() => toggleSetting('autoNarrateHeader')}
                    />
                    <E1SettingCheckbox
                      label="Auto narrate description"
                      checked={settings.autoNarrateDescription}
                      onChange={() => toggleSetting('autoNarrateDescription')}
                    />
                    <E1SettingCheckbox
                      label="Wait for completion"
                      checked={settings.waitForCompletion}
                      onChange={() => toggleSetting('waitForCompletion')}
                    />
                  </div>
                </div>

                {/* Logic group */}
                <div>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: 10, paddingLeft: 12 }}>
                    <GitBranch size={13} style={{ color: '#2F80ED' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      Logic
                    </span>
                  </div>
                  <div className="flex flex-col gap-2" style={{ paddingLeft: 12 }}>
                    <E1SettingCheckbox
                      label="Allow 2D viewing"
                      checked={settings.allow2D}
                      onChange={() => toggleSetting('allow2D')}
                    />
                    <E1SettingCheckbox
                      label="Toggle step on selection"
                      checked={settings.toggleStep}
                      onChange={() => toggleSetting('toggleStep')}
                    />
                    <E1SettingCheckbox
                      label="Allow skipping steps"
                      checked={settings.allowSkipping}
                      onChange={() => toggleSetting('allowSkipping')}
                    />
                    <E1SettingCheckbox
                      label="Show survey"
                      checked={settings.showSurvey}
                      onChange={() => toggleSetting('showSurvey')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 24px' }} />

          {/* ─── Version History Section (Collapsible) ─── */}
          <div style={{ padding: '0 24px' }}>
            <CollapsibleHeader
              icon={<Clock size={14} />}
              label="Version History"
              badge={versionHistory.length}
              isOpen={versionHistoryOpen}
              onToggle={() => setVersionHistoryOpen(!versionHistoryOpen)}
            />

            <div
              style={{
                overflow: 'hidden',
                maxHeight: versionHistoryOpen ? 500 : 0,
                opacity: versionHistoryOpen ? 1 : 0,
                transition: 'max-height 300ms ease, opacity 200ms ease',
              }}
            >
              <div
                style={{
                  paddingBottom: 18,
                  paddingLeft: 8,
                  borderLeft: '3px solid #2F80ED',
                  marginLeft: 6,
                }}
              >
                {versionHistory.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 7,
                      cursor: 'default',
                      transition: 'background-color 200ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F1F4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: i === 0 ? '#2F80ED' : '#36415D',
                        minWidth: 38,
                      }}
                    >
                      v{v.version}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#C2C9DB',
                        margin: '0 8px',
                      }}
                    >
                      &mdash;
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#5E677D',
                      }}
                    >
                      {v.date}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#C2C9DB',
                        margin: '0 8px',
                      }}
                    >
                      &mdash;
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#5E677D',
                      }}
                    >
                      {v.by}
                    </span>
                    {i === 0 && (
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#2F80ED',
                          backgroundColor: 'rgba(47,128,237,0.08)',
                          padding: '2px 8px',
                          borderRadius: 5,
                          letterSpacing: '0.02em',
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom padding to prevent content being hidden by sticky bar */}
          <div style={{ height: 64 }} />
        </div>

        {/* ─── Sticky Bottom Bar — gradient shadow instead of hard border ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-6"
          style={{
            height: 56,
            backgroundColor: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Gradient shadow overlay on top */}
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: 0,
              right: 0,
              height: 20,
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 100%)',
              pointerEvents: 'none',
            }}
          />

          <span style={{ fontSize: 12, color: '#868D9E', fontWeight: 400 }}>
            Last saved 2 min ago
          </span>

          <button
            className="flex items-center justify-center"
            style={{
              height: 36,
              padding: '0 22px',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#0B9E4D',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(11,158,77,0.3)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#099443';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,158,77,0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0B9E4D';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(11,158,77,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Publish Update
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Action Link Sub-component ─── */

function ActionLink({
  icon,
  label,
  color,
  hoverColor,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  hoverColor: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5"
      style={{
        fontSize: 13,
        fontWeight: 500,
        color,
        padding: '5px 10px',
        borderRadius: 7,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.backgroundColor = '#F0F4FF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


/* ─── Collapsible Header Sub-component ─── */

function CollapsibleHeader({
  icon,
  label,
  badge,
  isOpen,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="w-full flex items-center gap-2.5"
      style={{
        height: 48,
        color: '#36415D',
        padding: '0 8px',
        marginLeft: -8,
        marginRight: -8,
        width: 'calc(100% + 16px)',
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'background-color 200ms ease',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F5F6FA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span
        style={{
          transition: 'transform 200ms ease',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isOpen
          ? <ChevronDown size={14} style={{ color: '#868D9E' }} />
          : <ChevronRight size={14} style={{ color: '#868D9E' }} />
        }
      </span>
      <span style={{ color: '#868D9E', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>{label}</span>
      {badge !== undefined && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#868D9E',
            backgroundColor: '#EEF0F6',
            padding: '2px 8px',
            borderRadius: 10,
            marginLeft: 2,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}


/* ─── Property Row Sub-component — 2-column grid ─── */

function E1PropertyRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        alignItems: 'center',
        padding: '10px 8px',
        borderBottom: isLast ? 'none' : '1px solid #F0F1F4',
        borderRadius: 6,
        transition: 'background-color 200ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span style={{ fontSize: 13, color: '#868D9E', fontWeight: 400 }}>
        {label}
      </span>
      <div>{value}</div>
    </div>
  );
}


/* ─── Setting Checkbox Sub-component — refined with smooth transitions ─── */

function E1SettingCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer"
      style={{
        fontSize: 13,
        color: '#36415D',
        padding: '4px 0',
        transition: 'color 200ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#1A2340'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#36415D'; }}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: checked ? '1.5px solid #2F80ED' : '1.5px solid #C2C9DB',
          backgroundColor: checked ? '#2F80ED' : 'transparent',
          transition: 'all 200ms ease',
          boxShadow: checked ? '0 1px 3px rgba(47,128,237,0.25)' : 'none',
        }}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange();
          }
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="select-none" style={{ lineHeight: '18px' }}>{label}</span>
    </label>
  );
}
