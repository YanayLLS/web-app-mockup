import { useState, useRef, useEffect } from 'react';
import {
  X,
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
  Share2,
} from 'lucide-react';

interface ProcedureModalVariantE4Props {
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

export function ProcedureModalVariantE4({ procedure, onClose }: ProcedureModalVariantE4Props) {
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-e4-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 720,
          height: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Ultra-Minimal Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-end"
          style={{
            height: 44,
            paddingRight: 8,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: 30,
              height: 30,
              color: 'rgba(255,255,255,0.85)',
              backgroundColor: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.35)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            }}
            aria-label="Close modal"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
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
              height: 240,
              background: 'linear-gradient(160deg, #2F80ED 0%, #004FFF 60%, #0033BB 100%)',
            }}
          >
            {/* Decorative shapes */}
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '60%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.02)',
              }}
            />

            {/* Play Button */}
            <button
              className="relative z-10 flex items-center justify-center transition-transform hover:scale-110"
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
              aria-label="Play 3D preview"
            >
              <Play size={24} className="ml-0.5" style={{ color: '#FFFFFF' }} fill="#FFFFFF" />
            </button>

            {/* Bottom-left: DT badge */}
            <div className="absolute bottom-3 left-3 z-10">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box size={12} style={{ color: 'rgba(255,255,255,0.8)' }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                  Generator Digital Twin
                </span>
              </div>
            </div>
          </div>

          {/* ─── Document Content Area ─── */}
          <div style={{ padding: '0 32px' }}>
            {/* ─── Title ─── */}
            <div style={{ marginTop: 20 }}>
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
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#36415D',
                    lineHeight: '32px',
                    padding: '2px 0',
                    border: 'none',
                    borderBottom: '2px solid #2F80ED',
                    background: 'transparent',
                    letterSpacing: '-0.01em',
                  }}
                />
              ) : (
                <h3
                  id="variant-e4-title"
                  className="cursor-text"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#36415D',
                    lineHeight: '32px',
                    padding: '2px 0',
                    borderBottom: '2px solid transparent',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                  onClick={() => setEditingTitle(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#E9E9E9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  {titleValue || procedure.name}
                </h3>
              )}
            </div>

            {/* ─── Inline Metadata Chips ─── */}
            <div
              className="flex items-center flex-wrap gap-1.5"
              style={{ marginTop: 10 }}
            >
              {/* Status chip */}
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                  backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.08)' : 'rgba(127,127,127,0.08)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  lineHeight: '16px',
                  letterSpacing: '0.01em',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: procedure.isPublished ? '#11E874' : '#7F7F7F',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {procedure.isPublished
                  ? `Published v${procedure.publishedVersion || '2.3'}`
                  : 'Draft'}
              </span>

              {/* Author chip */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#5E677D',
                  backgroundColor: 'rgba(54,65,93,0.05)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  lineHeight: '16px',
                  letterSpacing: '0.01em',
                }}
              >
                by {procedure.lastEditedBy || 'Laura Green'}
              </span>

              {/* Edited date chip */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#868D9E',
                  backgroundColor: 'rgba(54,65,93,0.04)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  lineHeight: '16px',
                  letterSpacing: '0.01em',
                }}
              >
                Edited {procedure.lastEdited || 'Mar 15'}
              </span>

              {/* Digital Twin chip (blue, clickable) */}
              <span
                className="cursor-pointer transition-colors"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#2F80ED',
                  backgroundColor: 'rgba(47,128,237,0.08)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  lineHeight: '16px',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.08)';
                }}
              >
                DT: Generator
              </span>

              {/* Star chip */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="inline-flex items-center justify-center transition-colors"
                style={{
                  width: 24,
                  height: 22,
                  borderRadius: 12,
                  backgroundColor: isStarred ? 'rgba(245,158,11,0.1)' : 'rgba(54,65,93,0.04)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: isStarred ? '#F59E0B' : '#C2C9DB',
                }}
                onMouseEnter={(e) => {
                  if (!isStarred) e.currentTarget.style.backgroundColor = 'rgba(54,65,93,0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isStarred) e.currentTarget.style.backgroundColor = 'rgba(54,65,93,0.04)';
                }}
                title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill={isStarred ? '#F59E0B' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            </div>

            {/* ─── Description ─── */}
            <div style={{ marginTop: 16 }}>
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
                    fontSize: 15,
                    fontWeight: 400,
                    color: '#5E677D',
                    lineHeight: '1.7',
                    padding: '4px 0',
                    border: 'none',
                    borderBottom: '2px solid #2F80ED',
                    background: 'transparent',
                    minHeight: 48,
                    fontFamily: 'inherit',
                  }}
                  placeholder="Add a description..."
                />
              ) : (
                <p
                  className="cursor-text"
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    color: descriptionValue ? '#5E677D' : '#868D9E',
                    lineHeight: '1.7',
                    margin: 0,
                    padding: '4px 0',
                    borderBottom: '2px solid transparent',
                  }}
                  onClick={() => setEditingDescription(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#E9E9E9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  {descriptionValue || 'Add a description...'}
                </p>
              )}
            </div>

            {/* ─── Action Links Row ─── */}
            <div
              className="flex items-center gap-3"
              style={{ marginTop: 16 }}
            >
              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#2F80ED',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#82B3F4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#2F80ED'; }}
              >
                <ExternalLink size={13} />
                <span>Edit in app</span>
              </button>

              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#2F80ED',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#82B3F4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#2F80ED'; }}
              >
                <ExternalLink size={13} />
                <span>Edit in canvas</span>
              </button>

              <span style={{ color: '#E9E9E9', fontSize: 14, userSelect: 'none' }}>|</span>

              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#5E677D',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#36415D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5E677D'; }}
              >
                <Eye size={13} />
                <span>Preview as operator</span>
              </button>

              <span style={{ color: '#E9E9E9', fontSize: 14, userSelect: 'none' }}>|</span>

              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#5E677D',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#36415D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5E677D'; }}
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>

            {/* ─── Thin Divider ─── */}
            <div style={{ height: 1, backgroundColor: '#EEEFF2', marginTop: 20 }} />

            {/* ─── Settings Section (Collapsible) ─── */}
            <div>
              <button
                className="w-full flex items-center gap-2 transition-colors"
                style={{
                  height: 42,
                  color: '#36415D',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '0 4px',
                  borderRadius: 6,
                  margin: '2px -4px',
                  width: 'calc(100% + 8px)',
                }}
                onClick={() => setSettingsOpen(!settingsOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {settingsOpen
                  ? <ChevronDown size={13} style={{ color: '#868D9E' }} />
                  : <ChevronRight size={13} style={{ color: '#868D9E' }} />
                }
                <Settings size={13} style={{ color: '#868D9E' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>Settings</span>
              </button>

              {settingsOpen && (
                <div style={{ paddingBottom: 12, paddingLeft: 4 }}>
                  {/* Text-to-speech group */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Volume2 size={13} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Text to Speech</span>
                    </div>
                    <div className="flex flex-col gap-2.5 pl-0.5">
                      <SettingCheckbox
                        label="Auto narrate header"
                        checked={settings.autoNarrateHeader}
                        onChange={() => toggleSetting('autoNarrateHeader')}
                      />
                      <SettingCheckbox
                        label="Auto narrate description"
                        checked={settings.autoNarrateDescription}
                        onChange={() => toggleSetting('autoNarrateDescription')}
                      />
                      <SettingCheckbox
                        label="Wait for completion"
                        checked={settings.waitForCompletion}
                        onChange={() => toggleSetting('waitForCompletion')}
                      />
                    </div>
                  </div>

                  {/* Logic group */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <GitBranch size={13} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Logic</span>
                    </div>
                    <div className="flex flex-col gap-2.5 pl-0.5">
                      <SettingCheckbox
                        label="Allow 2D viewing"
                        checked={settings.allow2D}
                        onChange={() => toggleSetting('allow2D')}
                      />
                      <SettingCheckbox
                        label="Toggle step on selection"
                        checked={settings.toggleStep}
                        onChange={() => toggleSetting('toggleStep')}
                      />
                      <SettingCheckbox
                        label="Allow skipping steps"
                        checked={settings.allowSkipping}
                        onChange={() => toggleSetting('allowSkipping')}
                      />
                      <SettingCheckbox
                        label="Show survey"
                        checked={settings.showSurvey}
                        onChange={() => toggleSetting('showSurvey')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Thin Divider ─── */}
            <div style={{ height: 1, backgroundColor: '#EEEFF2' }} />

            {/* ─── Version History Section (Collapsible) ─── */}
            <div>
              <button
                className="w-full flex items-center gap-2 transition-colors"
                style={{
                  height: 42,
                  color: '#36415D',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '0 4px',
                  borderRadius: 6,
                  margin: '2px -4px',
                  width: 'calc(100% + 8px)',
                }}
                onClick={() => setVersionHistoryOpen(!versionHistoryOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {versionHistoryOpen
                  ? <ChevronDown size={13} style={{ color: '#868D9E' }} />
                  : <ChevronRight size={13} style={{ color: '#868D9E' }} />
                }
                <Clock size={13} style={{ color: '#868D9E' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>Version History</span>
                <span
                  className="ml-1"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#868D9E',
                    backgroundColor: '#F0F0F0',
                    padding: '1px 7px',
                    borderRadius: 10,
                  }}
                >
                  {versionHistory.length}
                </span>
              </button>

              {versionHistoryOpen && (
                <div style={{ paddingBottom: 12 }}>
                  {versionHistory.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center rounded-md transition-colors"
                      style={{
                        padding: '7px 8px',
                        marginLeft: -8,
                        marginRight: -8,
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: i === 0 ? '#2F80ED' : '#36415D',
                          minWidth: 36,
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
                      <span style={{ fontSize: 13, color: '#5E677D' }}>
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
                      <span style={{ fontSize: 13, color: '#5E677D' }}>
                        {v.by}
                      </span>
                      {i === 0 && (
                        <span
                          className="ml-2"
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#2F80ED',
                            backgroundColor: 'rgba(47,128,237,0.08)',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom spacer for floating dock */}
            <div style={{ height: 80 }} />
          </div>
        </div>

        {/* ─── Floating Bottom Action Dock ─── */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <div
            className="flex items-center gap-4"
            style={{
              height: 46,
              padding: '0 8px 0 20px',
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: '#868D9E',
                whiteSpace: 'nowrap',
                fontWeight: 400,
              }}
            >
              Last saved 2 min ago
            </span>

            <button
              className="flex items-center justify-center transition-colors"
              style={{
                height: 32,
                padding: '0 18px',
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#2F80ED',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#82B3F4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2F80ED';
              }}
            >
              Publish Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Setting Checkbox Sub-component ─── */

function SettingCheckbox({
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
      style={{ fontSize: 13, color: '#36415D' }}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className="shrink-0 flex items-center justify-center transition-all"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: checked ? '1.5px solid #2F80ED' : '1.5px solid #C2C9DB',
          backgroundColor: checked ? '#2F80ED' : 'transparent',
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
