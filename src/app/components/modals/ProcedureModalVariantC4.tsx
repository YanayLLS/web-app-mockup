import { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Star,
  Play,
  ExternalLink,
  Box,
  FileText,
  Eye,
  Sparkles,
  ChevronDown,
  Settings,
  Clock,
  Edit2,
  AlertCircle,
  Volume2,
  GitBranch,
} from 'lucide-react';

interface ProcedureModalVariantC4Props {
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

export function ProcedureModalVariantC4({ procedure, onClose }: ProcedureModalVariantC4Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(procedure.name);
  const [description, setDescription] = useState(
    procedure.description ||
      'This procedure guides technicians through the step-by-step maintenance process for the Generator Digital Twin. It includes visual annotations, hotspot interactions, and guided narration for field service operations.'
  );
  const [aiInstructions, setAiInstructions] = useState(
    'Narrate each step clearly. Pause after safety warnings. Highlight interactive hotspots before prompting the user to act.'
  );
  const [changelog, setChangelog] = useState('');
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mock version history
  const versionHistory = [
    { version: '2.3', date: 'Mar 18, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '2.2', date: 'Mar 10, 2026', by: 'James Moriarty', initials: 'JM', color: '#2F80ED' },
    { version: '2.1', date: 'Feb 28, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '2.0', date: 'Feb 14, 2026', by: 'Sarah Connor', initials: 'SC', color: '#E67E22' },
    { version: '1.0', date: 'Jan 10, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
  ];

  const currentVersion = procedure.publishedVersion || '2.3';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-c4-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 1100,
          height: '90vh',
          backgroundColor: '#F5F5F5',
          borderRadius: 16,
          boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-5"
          style={{
            height: 52,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E9E9E9',
            zIndex: 10,
          }}
        >
          {/* Left: Icon + Editable Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(47,128,237,0.1)',
              }}
            >
              <FileText size={15} style={{ color: '#2F80ED' }} />
            </div>

            {isEditingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                  if (e.key === 'Escape') {
                    setTitleValue(procedure.name);
                    setIsEditingTitle(false);
                  }
                }}
                className="flex-1 min-w-0 outline-none"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#36415D',
                  lineHeight: '20px',
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '2px solid #2E80ED',
                  backgroundColor: '#FFFFFF',
                }}
              />
            ) : (
              <h2
                id="variant-c4-title"
                className="truncate cursor-pointer"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#36415D',
                  lineHeight: '20px',
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '2px solid transparent',
                }}
                onClick={() => setIsEditingTitle(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                  e.currentTarget.style.borderColor = '#E9E9E9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title="Click to edit title"
              >
                {titleValue}
              </h2>
            )}
          </div>

          {/* Right: Status badge + Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {/* Status Badge */}
            {procedure.hasUnpublishedChanges ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#B45309',
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <AlertCircle size={12} />
                <span>Unpublished changes</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#0B9E4D',
                  backgroundColor: 'rgba(17,232,116,0.08)',
                  border: '1px solid rgba(17,232,116,0.2)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#11E874',
                    display: 'inline-block',
                  }}
                />
                <span>Published v{currentVersion}</span>
              </div>
            )}

            {/* Share */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#2F80ED',
                border: '1px solid rgba(47,128,237,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.06)';
                e.currentTarget.style.borderColor = 'rgba(47,128,237,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(47,128,237,0.25)';
              }}
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            {/* Star */}
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: isStarred ? '#F59E0B' : '#868D9E' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={18} fill={isStarred ? '#F59E0B' : 'none'} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#868D9E' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Hero Preview (Compact) ─── */}
        <div
          className="shrink-0 relative overflow-hidden flex items-center justify-center mx-5 mt-4"
          style={{
            height: 240,
            borderRadius: 12,
            background: 'linear-gradient(160deg, #2F80ED 0%, #004FFF 60%, #0033BB 100%)',
            boxShadow: '0 8px 32px rgba(47,128,237,0.3)',
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

          {/* Bottom-left: DT name pill */}
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

          {/* Bottom-right: Open in viewer */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#2F80ED',
                backgroundColor: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.92)'; }}
            >
              <Eye size={13} />
              <span>Open in viewer</span>
            </button>
          </div>
        </div>

        {/* ─── Two-Panel Workspace ─── */}
        <div
          className="flex-1 flex min-h-0 mx-5 mt-4 mb-5 gap-4"
        >
          {/* ─── Left Panel: Content Editor (58%) ─── */}
          <div
            className="overflow-y-auto"
            style={{
              width: '58%',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderLeft: '3px solid #2F80ED',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ padding: '20px 24px' }} className="flex flex-col gap-6">

              {/* Section: Edit Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Edit2 size={14} style={{ color: '#2F80ED' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Edit Actions
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#2F80ED',
                      border: '1.5px solid rgba(47,128,237,0.3)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(47,128,237,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(47,128,237,0.3)';
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Edit in app</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: '#2F80ED',
                      border: '1.5px solid #2F80ED',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#82B3F4'; e.currentTarget.style.borderColor = '#82B3F4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2F80ED'; e.currentTarget.style.borderColor = '#2F80ED'; }}
                  >
                    <ExternalLink size={14} />
                    <span>Edit in canvas</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: '#F0F0F0' }} />

              {/* Section: Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: '#36415D' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Description
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#868D9E' }}>
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  className="w-full outline-none resize-none transition-colors"
                  style={{
                    fontSize: 13,
                    lineHeight: '20px',
                    color: '#36415D',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #C2C9DB',
                    backgroundColor: '#FAFAFA',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2E80ED';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,128,237,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#C2C9DB';
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Section: AI Instructions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} style={{ color: '#2F80ED' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Instructions
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  className="w-full outline-none resize-none transition-colors"
                  style={{
                    fontSize: 13,
                    lineHeight: '20px',
                    color: '#36415D',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #C2C9DB',
                    backgroundColor: '#FAFAFA',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2E80ED';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,128,237,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#C2C9DB';
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <p style={{ fontSize: 11, color: '#868D9E', marginTop: 4, paddingLeft: 2 }}>
                  Guide the AI narrator for this procedure.
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: '#F0F0F0' }} />

              {/* Section: Settings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={14} style={{ color: '#5E677D' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Settings
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left sub-group: Text to Speech */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Volume2 size={13} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Text to Speech</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
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

                  {/* Right sub-group: Logic */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <GitBranch size={13} style={{ color: '#2F80ED' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Logic</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
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
              </div>
            </div>
          </div>

          {/* ─── Right Panel: Publish & Info Sidebar (42%) ─── */}
          <div
            className="overflow-y-auto"
            style={{
              width: '42%',
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ padding: '20px' }} className="flex flex-col gap-5">

              {/* ── Publishing Card ── */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                {/* Version display */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#36415D',
                        lineHeight: '36px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      v{currentVersion}
                    </span>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                      backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.08)' : 'rgba(127,127,127,0.08)',
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
                    {procedure.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Published date */}
                <p style={{ fontSize: 12, color: '#868D9E', marginBottom: 14 }}>
                  Published {procedure.publishedDate || 'Mar 18, 2026 at 2:30 PM'}
                </p>

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 14 }} />

                {/* Changelog */}
                <div className="mb-3">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#5E677D', marginBottom: 6, display: 'block' }}>
                    Changelog
                  </label>
                  <textarea
                    rows={2}
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="Describe what changed..."
                    className="w-full outline-none resize-none transition-colors"
                    style={{
                      fontSize: 13,
                      lineHeight: '18px',
                      color: '#36415D',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1.5px solid #C2C9DB',
                      backgroundColor: '#FAFAFA',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2E80ED';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,128,237,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#C2C9DB';
                      e.currentTarget.style.backgroundColor = '#FAFAFA';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Publish button */}
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#0B9E4D',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(11,158,77,0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0A8A43'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0B9E4D'; }}
                >
                  {procedure.hasUnpublishedChanges ? 'Publish Update' : 'Publish'}
                </button>
              </div>

              {/* ── Digital Twin Connection ── */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      backgroundColor: 'rgba(47,128,237,0.08)',
                      border: '1px solid rgba(47,128,237,0.12)',
                    }}
                  >
                    <Box size={17} style={{ color: '#2F80ED' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }} className="truncate">
                      Generator Digital Twin
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#11E874',
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontSize: 11, color: '#0B9E4D', fontWeight: 500 }}>Connected</span>
                    </div>
                  </div>
                  <button
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#2F80ED',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 4px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* ── Activity ── */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <Clock size={14} style={{ color: '#868D9E' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Activity
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Last edited */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#2F80ED',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#FFFFFF',
                      }}
                    >
                      {procedure.lastEditedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, color: '#868D9E', lineHeight: '16px' }}>
                        Last edited: <span style={{ color: '#36415D', fontWeight: 500 }}>{procedure.lastEdited}</span>
                      </p>
                      <p style={{ fontSize: 11, color: '#5E677D' }}>
                        by {procedure.lastEditedBy}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#F0F0F0' }} />

                  {/* Created */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#aa74b5',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#FFFFFF',
                      }}
                    >
                      {procedure.createdBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, color: '#868D9E', lineHeight: '16px' }}>
                        Created: <span style={{ color: '#36415D', fontWeight: 500 }}>{procedure.createdDate}</span>
                      </p>
                      <p style={{ fontSize: 11, color: '#5E677D' }}>
                        by {procedure.createdBy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Version History (Collapsible) ── */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                {/* Header — always visible */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setVersionHistoryOpen(!versionHistoryOpen)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: '#5E677D' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>
                      Version History
                    </span>
                    <span
                      className="flex items-center justify-center"
                      style={{
                        minWidth: 20,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: 'rgba(47,128,237,0.08)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#2F80ED',
                        padding: '0 6px',
                      }}
                    >
                      {versionHistory.length}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{
                      color: '#868D9E',
                      transform: versionHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {/* Expanded content */}
                {versionHistoryOpen && (
                  <div style={{ padding: '0 20px 16px 20px' }}>
                    <div style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 }} />
                    <div className="flex flex-col gap-0">
                      {versionHistory.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 py-2 px-2 rounded-lg transition-colors"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {/* Version badge */}
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: i === 0 ? '#2F80ED' : '#5E677D',
                              minWidth: 32,
                            }}
                          >
                            v{v.version}
                          </span>

                          {/* Date */}
                          <span style={{ fontSize: 11, color: '#868D9E', flex: 1 }}>
                            {v.date}
                          </span>

                          {/* Author avatar */}
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: v.color,
                              fontSize: 8,
                              fontWeight: 700,
                              color: '#FFFFFF',
                            }}
                          >
                            {v.initials}
                          </div>

                          {/* Author name */}
                          <span style={{ fontSize: 11, color: '#5E677D', minWidth: 80 }}>
                            {v.by}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      className="flex items-center gap-2.5 cursor-pointer group"
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
