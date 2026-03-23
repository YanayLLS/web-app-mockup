import { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Star,
  Play,
  Box,
  ExternalLink,
  Settings,
  Clock,
  ChevronDown,
  ChevronRight,
  Volume2,
  GitBranch,
} from 'lucide-react';

interface ProcedureModalVariantE2Props {
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

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
};

export function ProcedureModalVariantE2({ procedure, onClose }: ProcedureModalVariantE2Props) {
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

  const versionHistory = [
    { version: '2.3', date: 'Mar 15, 2026', by: 'Laura Green' },
    { version: '2.2', date: 'Mar 2, 2026', by: 'James Moriarty' },
    { version: '2.1', date: 'Feb 14, 2026', by: 'Laura Green' },
    { version: '2.0', date: 'Jan 10, 2026', by: 'Laura Green' },
    { version: '1.0', date: 'Dec 20, 2025', by: 'Sarah Connor' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
      const len = descriptionRef.current.value.length;
      descriptionRef.current.setSelectionRange(len, len);
    }
  }, [editingDescription]);

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
        aria-labelledby="variant-e2-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 780,
          height: '90vh',
          backgroundColor: '#EEEEF1',
          borderRadius: 14,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{
            height: 50,
            padding: '0 20px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E4E5EA',
            borderRadius: '14px 14px 0 0',
          }}
        >
          <h2
            id="variant-e2-title"
            className="truncate"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#36415D',
              lineHeight: '18px',
              letterSpacing: '-0.01em',
            }}
          >
            {titleValue || procedure.name}
          </h2>

          <div className="flex items-center gap-0.5 shrink-0">
            <TopBarBtn title="Share">
              <Share2 size={15} />
            </TopBarBtn>
            <TopBarBtn
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => setIsStarred(!isStarred)}
              active={isStarred}
              activeColor="#F59E0B"
            >
              <Star size={15} fill={isStarred ? '#F59E0B' : 'none'} />
            </TopBarBtn>
            <TopBarBtn title="Close" onClick={onClose}>
              <X size={15} />
            </TopBarBtn>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{
            scrollBehavior: 'smooth',
            padding: '12px 16px',
          }}
        >
          <div className="flex flex-col" style={{ gap: 10 }}>
            {/* ═══ Hero Card — 16:9 aspect ratio ═══ */}
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <div
                className="relative overflow-hidden flex items-center justify-center"
                style={{
                  width: '100%',
                  paddingBottom: '56.25%', /* 16:9 */
                  background: 'linear-gradient(155deg, #2F80ED 0%, #1A6AD4 40%, #004FFF 70%, #0033BB 100%)',
                  position: 'relative',
                }}
              >
                {/* Centered content overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* Decorative shapes */}
                  <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
                  <div style={{ position: 'absolute', top: '35%', left: '55%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
                  {/* Bottom vignette */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.12), transparent)' }} />

                  {/* Play Button */}
                  <button
                    className="relative z-10 flex items-center justify-center"
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1.5px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'; }}
                    aria-label="Play 3D preview"
                  >
                    <Play size={28} className="ml-0.5" style={{ color: '#FFFFFF' }} fill="#FFFFFF" />
                  </button>

                  {/* DT badge */}
                  <div className="absolute bottom-3.5 left-3.5 z-10">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Box size={12} style={{ color: 'rgba(255,255,255,0.75)' }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                        Generator Digital Twin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Content Card ═══ */}
            <div style={{ ...cardStyle, padding: '20px 24px' }}>
              {/* Action Row */}
              <div className="flex items-center gap-1" style={{ marginBottom: 14 }}>
                <ActionLink icon={<ExternalLink size={13} />} label="Edit in app" />
                <ActionLink icon={<ExternalLink size={13} />} label="Edit in canvas" />
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: '#F0F1F4', marginBottom: 16 }} />

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
                    if (e.key === 'Escape') { setTitleValue(procedure.name); setEditingTitle(false); }
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
                  onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#E0E3EB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}
                >
                  {titleValue || procedure.name}
                </h3>
              )}

              {/* Editable description */}
              {editingDescription ? (
                <textarea
                  ref={descriptionRef}
                  value={descriptionValue}
                  onChange={(e) => { setDescriptionValue(e.target.value); autoResizeTextarea(e.target); }}
                  onBlur={() => setEditingDescription(false)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditingDescription(false); }}
                  className="w-full outline-none resize-none"
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: '#5E677D',
                    lineHeight: '22px',
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
                    color: descriptionValue ? '#5E677D' : '#A0A7B8',
                    lineHeight: '22px',
                    marginTop: 10,
                    padding: '4px 0',
                    borderBottom: '2px solid transparent',
                    transition: 'border-color 200ms ease',
                  }}
                  onClick={() => setEditingDescription(true)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#E0E3EB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}
                >
                  {descriptionValue || 'Add a description...'}
                </p>
              )}
            </div>

            {/* ═══ Properties Card ═══ */}
            <div style={{ ...cardStyle, padding: '6px 8px' }}>
              <PropertyRow
                label="Status"
                value={
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                      backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.08)' : 'rgba(127,127,127,0.08)',
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}
                  >
                    <span
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: procedure.isPublished ? '#11E874' : '#7F7F7F',
                        display: 'inline-block',
                      }}
                    />
                    {procedure.isPublished ? `Published v${procedure.publishedVersion || '2.3'}` : 'Draft'}
                  </span>
                }
              />
              <PropertyRow
                label="Digital Twin"
                value={
                  <span
                    className="cursor-pointer"
                    style={{ fontSize: 13, fontWeight: 600, color: '#2F80ED', transition: 'color 200ms' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.textDecoration = 'none'; }}
                  >
                    Generator Digital Twin
                  </span>
                }
              />
              <PropertyRow
                label="Created"
                value={<span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>{procedure.createdDate} by {procedure.createdBy}</span>}
              />
              <PropertyRow
                label="Last edited"
                value={<span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>{procedure.lastEdited} by {procedure.lastEditedBy}</span>}
              />
              <PropertyRow
                label="Published"
                value={<span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>{procedure.publishedDate || 'Feb 14, 2026'}</span>}
                isLast
              />
            </div>

            {/* ═══ Settings Card ═══ */}
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <button
                className="w-full flex items-center gap-2.5"
                style={{
                  height: 46,
                  color: '#36415D',
                  padding: '0 18px',
                  transition: 'background-color 200ms ease',
                }}
                onClick={() => setSettingsOpen(!settingsOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {settingsOpen
                  ? <ChevronDown size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />
                  : <ChevronRight size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />}
                <Settings size={14} style={{ color: '#868D9E' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>Settings</span>
              </button>

              {settingsOpen && (
                <div style={{ padding: '0 18px 18px' }}>
                  <div style={{ height: 1, backgroundColor: '#F0F1F4', marginBottom: 14 }} />

                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Volume2 size={12} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#5E677D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Text to Speech</span>
                    </div>
                    <div className="flex flex-col gap-2.5 pl-0.5">
                      <SettingCheckbox label="Auto narrate header" checked={settings.autoNarrateHeader} onChange={() => toggleSetting('autoNarrateHeader')} />
                      <SettingCheckbox label="Auto narrate description" checked={settings.autoNarrateDescription} onChange={() => toggleSetting('autoNarrateDescription')} />
                      <SettingCheckbox label="Wait for completion" checked={settings.waitForCompletion} onChange={() => toggleSetting('waitForCompletion')} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <GitBranch size={12} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#5E677D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logic</span>
                    </div>
                    <div className="flex flex-col gap-2.5 pl-0.5">
                      <SettingCheckbox label="Allow 2D viewing" checked={settings.allow2D} onChange={() => toggleSetting('allow2D')} />
                      <SettingCheckbox label="Toggle step on selection" checked={settings.toggleStep} onChange={() => toggleSetting('toggleStep')} />
                      <SettingCheckbox label="Allow skipping steps" checked={settings.allowSkipping} onChange={() => toggleSetting('allowSkipping')} />
                      <SettingCheckbox label="Show survey" checked={settings.showSurvey} onChange={() => toggleSetting('showSurvey')} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ Version History Card ═══ */}
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <button
                className="w-full flex items-center gap-2.5"
                style={{
                  height: 46,
                  color: '#36415D',
                  padding: '0 18px',
                  transition: 'background-color 200ms ease',
                }}
                onClick={() => setVersionHistoryOpen(!versionHistoryOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {versionHistoryOpen
                  ? <ChevronDown size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />
                  : <ChevronRight size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />}
                <Clock size={14} style={{ color: '#868D9E' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>Version History</span>
                <span
                  className="ml-1"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#868D9E',
                    backgroundColor: '#EDEEF2',
                    padding: '1px 7px',
                    borderRadius: 10,
                  }}
                >
                  {versionHistory.length}
                </span>
              </button>

              {versionHistoryOpen && (
                <div style={{ padding: '0 10px 10px' }}>
                  <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 8px 6px' }} />

                  {versionHistory.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center"
                      style={{
                        padding: '7px 10px',
                        borderRadius: 6,
                        cursor: 'default',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F8FA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? '#2F80ED' : '#36415D', minWidth: 38 }}>
                        v{v.version}
                      </span>
                      <span style={{ fontSize: 12, color: '#C2C9DB', margin: '0 8px' }}>&middot;</span>
                      <span style={{ fontSize: 13, color: '#5E677D' }}>{v.date}</span>
                      <span style={{ fontSize: 12, color: '#C2C9DB', margin: '0 8px' }}>&middot;</span>
                      <span style={{ fontSize: 13, color: '#5E677D' }}>{v.by}</span>
                      {i === 0 && (
                        <span
                          className="ml-2.5"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#2F80ED',
                            backgroundColor: 'rgba(47,128,237,0.07)',
                            padding: '2px 7px',
                            borderRadius: 4,
                            letterSpacing: '0.02em',
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
          </div>

          <div style={{ height: 12 }} />
        </div>

        {/* ─── Sticky Bottom Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{
            height: 54,
            padding: '0 22px',
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 14px 14px',
            boxShadow: '0 -1px 0 #E4E5EA, 0 -6px 16px rgba(0,0,0,0.04)',
          }}
        >
          <span style={{ fontSize: 12, color: '#A0A7B8', fontWeight: 500 }}>
            Last saved 2 min ago
          </span>

          <button
            className="flex items-center justify-center"
            style={{
              height: 34,
              padding: '0 22px',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#0B9E4D',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(11,158,77,0.3)',
              transition: 'background-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0A8F44';
              e.currentTarget.style.boxShadow = '0 3px 8px rgba(11,158,77,0.35)';
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

/* ─── Top Bar Button ─── */

function TopBarBtn({
  children,
  title,
  onClick,
  active,
  activeColor,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-md"
      style={{
        width: 32,
        height: 32,
        color: active && activeColor ? activeColor : '#868D9E',
        transition: 'background-color 200ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F1F4'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

/* ─── Action Link ─── */

function ActionLink({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5"
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: '#2F80ED',
        padding: '5px 10px',
        borderRadius: 6,
        transition: 'background-color 200ms ease, color 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F0F4FF';
        e.currentTarget.style.color = '#1A6AD4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#2F80ED';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ─── Property Row ─── */

function PropertyRow({
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
      className="flex items-center justify-between"
      style={{
        padding: '7px 10px',
        borderRadius: 6,
        borderBottom: isLast ? 'none' : '1px solid #F5F6F8',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span style={{ fontSize: 12, color: '#868D9E', minWidth: 90, fontWeight: 500 }}>
        {label}
      </span>
      <div>{value}</div>
    </div>
  );
}

/* ─── Setting Checkbox ─── */

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
        onClick={(e) => { e.preventDefault(); onChange(); }}
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: checked ? '1.5px solid #2F80ED' : '1.5px solid #C2C9DB',
          backgroundColor: checked ? '#2F80ED' : 'transparent',
          transition: 'all 200ms ease',
          boxShadow: checked ? '0 0 0 2px rgba(47,128,237,0.15)' : 'none',
        }}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); }
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="select-none" style={{ lineHeight: '18px', transition: 'color 200ms' }}>{label}</span>
    </label>
  );
}
