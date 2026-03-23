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

interface ProcedureModalVariantC3Props {
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

export function ProcedureModalVariantC3({ procedure, onClose }: ProcedureModalVariantC3Props) {
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
        aria-labelledby="variant-c3-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 750,
          height: '90vh',
          backgroundColor: '#FFFFFF',
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
            borderBottom: '1px solid #F0F1F4',
            backgroundColor: '#FAFBFD',
          }}
        >
          <h2
            id="variant-c3-title"
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
            <TopBarButton title="Share">
              <Share2 size={15} />
            </TopBarButton>
            <TopBarButton
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => setIsStarred(!isStarred)}
              style={{ color: isStarred ? '#F59E0B' : undefined }}
            >
              <Star size={15} fill={isStarred ? '#F59E0B' : 'none'} />
            </TopBarButton>
            <TopBarButton title="Close" onClick={onClose}>
              <X size={15} />
            </TopBarButton>
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
              background: 'linear-gradient(155deg, #2F80ED 0%, #1A6AD4 40%, #004FFF 70%, #0033BB 100%)',
            }}
          >
            {/* Decorative shapes */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', top: '40%', left: '60%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
            {/* Bottom vignette */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)' }} />

            {/* Play Button */}
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
            <div className="absolute bottom-4 left-4 z-10">
              <div
                className="flex items-center gap-2 px-3 py-1.5"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 10,
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

          {/* ─── Action Row ─── */}
          <div
            className="flex items-center gap-1 px-6"
            style={{ height: 48 }}
          >
            <ActionLink icon={<ExternalLink size={13} />} label="Edit in app" color="#2F80ED" />
            <ActionLink icon={<ExternalLink size={13} />} label="Edit in canvas" color="#2F80ED" />
            <span style={{ color: '#E0E3EB', fontSize: 14, userSelect: 'none', margin: '0 4px' }}>|</span>
            <ActionLink icon={<Eye size={13} />} label="Preview as operator" color="#5E677D" hoverColor="#36415D" />
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 24px' }} />

          {/* ─── Title + Description ─── */}
          <div style={{ padding: '20px 28px 24px' }}>
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

          {/* ─── Properties Section ─── */}
          <div
            style={{
              margin: '0 20px',
              padding: '14px 12px',
              backgroundColor: '#F8F9FC',
              borderRadius: 10,
            }}
          >
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
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
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

          {/* Spacing */}
          <div style={{ height: 8 }} />

          {/* ─── Settings (Collapsible) ─── */}
          <div style={{ padding: '0 24px' }}>
            <CollapsibleHeader
              icon={<Settings size={14} />}
              label="Settings"
              isOpen={settingsOpen}
              onToggle={() => setSettingsOpen(!settingsOpen)}
            />

            {settingsOpen && (
              <div
                style={{
                  paddingBottom: 16,
                  paddingLeft: 8,
                  borderLeft: '3px solid #2F80ED',
                  marginLeft: 6,
                }}
              >
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

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 24px' }} />

          {/* ─── Version History (Collapsible) ─── */}
          <div style={{ padding: '0 24px' }}>
            <CollapsibleHeader
              icon={<Clock size={14} />}
              label="Version History"
              isOpen={versionHistoryOpen}
              onToggle={() => setVersionHistoryOpen(!versionHistoryOpen)}
              badge={versionHistory.length}
            />

            {versionHistoryOpen && (
              <div
                style={{
                  paddingBottom: 16,
                  borderLeft: '3px solid #2F80ED',
                  marginLeft: 6,
                  paddingLeft: 8,
                }}
              >
                {versionHistory.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center"
                    style={{
                      padding: '7px 10px',
                      marginLeft: -2,
                      marginRight: -10,
                      borderRadius: 6,
                      cursor: 'default',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F6F8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? '#2F80ED' : '#36415D', minWidth: 38 }}>
                      v{v.version}
                    </span>
                    <span style={{ fontSize: 12, color: '#A0A7B8', margin: '0 8px' }}>&middot;</span>
                    <span style={{ fontSize: 13, color: '#5E677D' }}>{v.date}</span>
                    <span style={{ fontSize: 12, color: '#A0A7B8', margin: '0 8px' }}>&middot;</span>
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

          <div style={{ height: 64 }} />
        </div>

        {/* ─── Sticky Bottom Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-6"
          style={{
            height: 54,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 -1px 0 #F0F1F4, 0 -8px 20px rgba(0,0,0,0.03)',
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

function TopBarButton({
  children,
  title,
  onClick,
  style,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-md"
      style={{
        width: 32,
        height: 32,
        color: '#868D9E',
        transition: 'background-color 200ms ease, color 200ms ease',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEF0F4'; }}
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
  color = '#2F80ED',
  hoverColor,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  hoverColor?: string;
}) {
  return (
    <button
      className="flex items-center gap-1.5"
      style={{
        fontSize: 13,
        fontWeight: 500,
        color,
        padding: '5px 10px',
        borderRadius: 6,
        transition: 'background-color 200ms ease, color 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F0F4FF';
        if (hoverColor) e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = color;
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ─── Collapsible Header ─── */

function CollapsibleHeader({
  icon,
  label,
  isOpen,
  onToggle,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: number;
}) {
  return (
    <button
      className="w-full flex items-center gap-2.5"
      style={{
        height: 44,
        color: '#36415D',
        padding: '0 8px',
        marginLeft: -8,
        marginRight: -8,
        borderRadius: 6,
        transition: 'background-color 200ms ease',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F6F8'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {isOpen
        ? <ChevronDown size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />
        : <ChevronRight size={13} style={{ color: '#868D9E', transition: 'transform 200ms' }} />}
      <span style={{ color: '#868D9E', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>{label}</span>
      {badge !== undefined && (
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
          {badge}
        </span>
      )}
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
        padding: '7px 8px',
        borderRadius: 6,
        borderBottom: isLast ? 'none' : '1px solid #F0F1F4',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
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
