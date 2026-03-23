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

interface ProcedureModalVariantE3Props {
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

export function ProcedureModalVariantE3({ procedure, onClose }: ProcedureModalVariantE3Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(procedure.name);
  const [descriptionValue, setDescriptionValue] = useState(
    procedure.description || ''
  );
  const [editingDescription, setEditingDescription] = useState(false);
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-e3-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 900,
          height: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Minimal Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-5"
          style={{
            height: 48,
            borderBottom: '1px solid #E9E9E9',
          }}
        >
          {/* Left: Title text */}
          <h2
            id="variant-e3-title"
            className="truncate"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#36415D',
              lineHeight: '20px',
            }}
          >
            {titleValue || procedure.name}
          </h2>

          {/* Right: Icon buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 32,
                height: 32,
                color: '#868D9E',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Share"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => setIsStarred(!isStarred)}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 32,
                height: 32,
                color: isStarred ? '#F59E0B' : '#868D9E',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} />
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 32,
                height: 32,
                color: '#868D9E',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── Hero Preview (Full Width) ─── */}
        <div
          className="relative overflow-hidden flex items-center justify-center shrink-0"
          style={{
            width: '100%',
            height: 260,
            background: 'linear-gradient(160deg, #2F80ED 0%, #004FFF 60%, #0033BB 100%)',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }}
          />

          {/* Play Button */}
          <button
            className="relative z-10 flex items-center justify-center transition-transform hover:scale-110"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            aria-label="Play 3D preview"
          >
            <Play size={26} className="ml-0.5" style={{ color: '#FFFFFF' }} fill="#FFFFFF" />
          </button>

          {/* Bottom-left: DT name badge */}
          <div className="absolute bottom-4 left-4 z-10">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box size={13} style={{ color: 'rgba(255,255,255,0.8)' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>
                Generator Digital Twin
              </span>
            </div>
          </div>
        </div>

        {/* ─── Two-Column Layout ─── */}
        <div className="flex-1 flex min-h-0">
          {/* ─── LEFT COLUMN (65%) ─── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              flex: '0 0 65%',
              scrollBehavior: 'smooth',
            }}
          >
            {/* ─── Action Row ─── */}
            <div
              className="flex items-center gap-3 px-6"
              style={{ height: 44 }}
            >
              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#2F80ED' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1A6AD4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#2F80ED'; }}
              >
                <ExternalLink size={13} />
                <span>Edit in app</span>
              </button>

              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#2F80ED' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1A6AD4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#2F80ED'; }}
              >
                <ExternalLink size={13} />
                <span>Edit in canvas</span>
              </button>

              <span style={{ color: '#C2C9DB', fontSize: 14, userSelect: 'none' }}>|</span>

              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, fontWeight: 500, color: '#5E677D' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#36415D'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#5E677D'; }}
              >
                <Eye size={13} />
                <span>Preview as operator</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: '#E9E9E9', margin: '0 24px' }} />

            {/* ─── Title + Description Section ─── */}
            <div style={{ padding: '20px 24px' }}>
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
                    padding: '2px 0',
                    borderBottom: '2px solid transparent',
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
                    lineHeight: '22px',
                    marginTop: 8,
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
                    lineHeight: '22px',
                    marginTop: 8,
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

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: '#E9E9E9', margin: '0 24px' }} />

            {/* ─── Settings Section (Collapsible) ─── */}
            <div style={{ padding: '0 24px' }}>
              <button
                className="w-full flex items-center gap-2.5 transition-colors"
                style={{
                  height: 44,
                  color: '#36415D',
                }}
                onClick={() => setSettingsOpen(!settingsOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; e.currentTarget.style.marginLeft = '-8px'; e.currentTarget.style.marginRight = '-8px'; e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.style.paddingRight = '8px'; e.currentTarget.style.borderRadius = '6px'; e.currentTarget.style.width = 'calc(100% + 16px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.marginLeft = '0'; e.currentTarget.style.marginRight = '0'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; e.currentTarget.style.width = '100%'; }}
              >
                {settingsOpen ? <ChevronDown size={14} style={{ color: '#868D9E' }} /> : <ChevronRight size={14} style={{ color: '#868D9E' }} />}
                <Settings size={14} style={{ color: '#868D9E' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>Settings</span>
              </button>

              {settingsOpen && (
                <div style={{ paddingBottom: 16, paddingLeft: 4 }}>
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

            {/* Bottom breathing room */}
            <div style={{ height: 24 }} />
          </div>

          {/* ─── RIGHT COLUMN / SIDEBAR (35%) ─── */}
          <div
            className="shrink-0 overflow-y-auto"
            style={{
              flex: '0 0 35%',
              backgroundColor: '#F8F9FC',
              borderLeft: '1px solid #E9E9E9',
              scrollBehavior: 'smooth',
            }}
          >
            <div style={{ padding: '20px 20px 24px 20px' }}>
              {/* ─── Status Badge ─── */}
              <div style={{ marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#868D9E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Status
                </span>
                <div style={{ marginTop: 6 }}>
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                      backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.1)' : 'rgba(127,127,127,0.1)',
                      padding: '4px 12px',
                      borderRadius: 20,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: procedure.isPublished ? '#11E874' : '#7F7F7F',
                        display: 'inline-block',
                      }}
                    />
                    {procedure.isPublished
                      ? `Published v${procedure.publishedVersion || '2.3'}`
                      : 'Draft'}
                  </span>
                </div>
              </div>

              {/* ─── Digital Twin ─── */}
              <div style={{ marginBottom: 18 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#868D9E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Digital Twin
                </span>
                <div style={{ marginTop: 4 }}>
                  <span
                    className="cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    style={{ fontSize: 13, fontWeight: 600, color: '#2F80ED' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.textDecoration = 'none';
                    }}
                  >
                    <Box size={13} />
                    Generator Digital Twin
                  </span>
                </div>
              </div>

              {/* ─── Metadata Pairs ─── */}
              <div style={{ marginBottom: 18 }}>
                <SidebarMetaRow label="Created" value={`${procedure.createdDate} by ${procedure.createdBy}`} />
                <SidebarMetaRow label="Last edited" value={`${procedure.lastEdited} by ${procedure.lastEditedBy}`} />
                <SidebarMetaRow label="Published" value={procedure.publishedDate || 'Feb 14, 2026'} isLast />
              </div>

              {/* ─── Divider ─── */}
              <div style={{ height: 1, backgroundColor: '#E0E3EB', marginBottom: 16 }} />

              {/* ─── Version History ─── */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} style={{ color: '#868D9E' }} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#868D9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Version History
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#868D9E',
                      backgroundColor: '#E9E9E9',
                      padding: '1px 7px',
                      borderRadius: 10,
                    }}
                  >
                    {versionHistory.length}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {versionHistory.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-md transition-colors"
                      style={{
                        padding: '6px 8px',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: i === 0 ? '#2F80ED' : '#36415D',
                          }}
                        >
                          v{v.version}
                        </span>
                        {i === 0 && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: '#2F80ED',
                              backgroundColor: 'rgba(47,128,237,0.1)',
                              padding: '1px 5px',
                              borderRadius: 3,
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                            }}
                          >
                            Latest
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 1 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#868D9E',
                          }}
                        >
                          {v.date} &middot; {v.by}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Publish Button ─── */}
              <div style={{ marginTop: 20 }}>
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{
                    height: 36,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#0B9E4D',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#099443';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0B9E4D';
                  }}
                >
                  Publish Update
                </button>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 8,
                    fontSize: 11,
                    color: '#868D9E',
                  }}
                >
                  Last saved 2 min ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar Metadata Row Sub-component ─── */

function SidebarMetaRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        paddingBottom: isLast ? 0 : 10,
        marginBottom: isLast ? 0 : 10,
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#868D9E',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#36415D',
          lineHeight: '17px',
        }}
      >
        {value}
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
