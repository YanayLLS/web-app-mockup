import { useState, useRef, useEffect } from 'react';
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
  ChevronUp,
  Settings,
  Volume2,
  GitBranch,
} from 'lucide-react';

interface ProcedureModalVariantC1Props {
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

export function ProcedureModalVariantC1({ procedure, onClose }: ProcedureModalVariantC1Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Editable text fields
  const [description, setDescription] = useState(
    procedure.description ||
      'This procedure guides technicians through the step-by-step maintenance process for the Generator Digital Twin. It includes visual annotations, hotspot interactions, and guided narration.'
  );
  const [aiInstructions, setAiInstructions] = useState(
    'Narrate each step clearly using a professional, calm tone. Pause briefly between steps to give the technician time to complete the action. Highlight safety warnings with extra emphasis.'
  );
  const [changelog, setChangelog] = useState('');

  // Track scroll for sticky header shadow
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setHasScrolled(container.scrollTop > 8);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mock settings state
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

  const version = procedure.publishedVersion || '2.3';
  const publishedDate = procedure.publishedDate || 'Mar 15, 2026';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-c1-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 1000,
          height: '90vh',
          backgroundColor: '#F5F5F5',
          borderRadius: 16,
          boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Sticky Top Bar ─── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 relative"
          style={{
            height: 52,
            backgroundColor: hasScrolled ? 'rgba(255,255,255,0.92)' : '#FFFFFF',
            backdropFilter: hasScrolled ? 'blur(12px)' : undefined,
            borderBottom: '1px solid #E9E9E9',
            zIndex: 10,
            transition: 'background-color 0.2s ease',
          }}
        >
          {/* Left: Title */}
          <div className="flex items-center gap-2.5 min-w-0">
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
            <h2
              id="variant-c1-title"
              className="truncate"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#36415D',
                lineHeight: '20px',
              }}
            >
              {procedure.name}
            </h2>
          </div>

          {/* Right: Status badge + Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Published status badge */}
            {procedure.isPublished && !procedure.hasUnpublishedChanges && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0B9E4D',
                  backgroundColor: 'rgba(17,232,116,0.1)',
                  borderRadius: 20,
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
                Published v{version}
              </span>
            )}
            {procedure.hasUnpublishedChanges && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#D97706',
                  backgroundColor: 'rgba(245,158,11,0.1)',
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    display: 'inline-block',
                  }}
                />
                Unpublished changes
              </span>
            )}

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

        {/* ─── Scrollable Content ─── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div style={{ padding: '16px 20px 28px 20px' }} className="flex flex-col gap-4">

            {/* ─── Hero Preview (shorter than Design C) ─── */}
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                width: '100%',
                height: '35vh',
                minHeight: 240,
                maxHeight: 380,
                borderRadius: 12,
                background: 'linear-gradient(160deg, #2F80ED 0%, #004FFF 60%, #0033BB 100%)',
                boxShadow: '0 8px 32px rgba(47,128,237,0.3)',
              }}
            >
              {/* Decorative circles */}
              <div
                style={{
                  position: 'absolute',
                  top: -80,
                  right: -80,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -60,
                  left: -60,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.03)',
                }}
              />

              {/* Play Button */}
              <button
                className="relative z-10 flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
                aria-label="Play 3D preview"
              >
                <Play size={30} className="ml-1" style={{ color: '#FFFFFF' }} fill="#FFFFFF" />
              </button>

              {/* Bottom-left: Digital twin name pill */}
              <div className="absolute bottom-4 left-4 z-10">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Box size={14} style={{ color: 'rgba(255,255,255,0.8)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>
                    Generator Digital Twin
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Action Bar ─── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: '14px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Edit in app — outlined blue */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#2F80ED',
                    border: '1.5px solid #2F80ED',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Edit in app</span>
                </button>

                {/* Edit in canvas — filled blue */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#2F80ED',
                    border: '1.5px solid #2F80ED',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#82B3F4';
                    e.currentTarget.style.borderColor = '#82B3F4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2F80ED';
                    e.currentTarget.style.borderColor = '#2F80ED';
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Edit in canvas</span>
                </button>

                {/* Preview as operator — outlined gray */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#5E677D',
                    border: '1.5px solid #C2C9DB',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                    e.currentTarget.style.borderColor = '#868D9E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#C2C9DB';
                  }}
                >
                  <Eye size={16} />
                  <span>Preview as operator</span>
                </button>
              </div>
            </div>

            {/* ─── Two-Column Layout ─── */}
            <div className="flex gap-4" style={{ minHeight: 0 }}>

              {/* ─── Left Column (60%) ─── */}
              <div className="flex flex-col gap-4" style={{ flex: '0 0 60%', maxWidth: '60%' }}>

                {/* Description Card — Editable */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} style={{ color: '#36415D' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Description
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setDescription(e.target.value);
                    }}
                    placeholder="Describe what this procedure does..."
                    rows={4}
                    className="w-full resize-none outline-none transition-colors"
                    style={{
                      fontSize: 14,
                      lineHeight: '22px',
                      color: '#36415D',
                      border: '1.5px solid #C2C9DB',
                      borderRadius: 8,
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2E80ED';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,128,237,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#C2C9DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <div
                    className="flex justify-end mt-1.5"
                    style={{ fontSize: 12, color: '#868D9E' }}
                  >
                    {description.length}/500
                  </div>
                </div>

                {/* AI Instructions Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={15} style={{ color: '#2F80ED' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Instructions
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#868D9E',
                      marginBottom: 10,
                      lineHeight: '18px',
                    }}
                  >
                    Describe how AI should narrate this procedure
                  </p>
                  <textarea
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="e.g. Use a calm, professional tone. Pause between steps..."
                    rows={4}
                    className="w-full resize-none outline-none transition-colors"
                    style={{
                      fontSize: 14,
                      lineHeight: '22px',
                      color: '#36415D',
                      border: '1.5px solid #C2C9DB',
                      borderRadius: 8,
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2E80ED';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,128,237,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#C2C9DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* ─── Right Column (40%) ─── */}
              <div className="flex flex-col gap-4" style={{ flex: '0 0 calc(40% - 16px)', maxWidth: 'calc(40% - 16px)' }}>

                {/* Publishing Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Publishing
                    </span>
                    {procedure.hasUnpublishedChanges && (
                      <span
                        className="flex items-center gap-1.5 px-2 py-0.5"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#D97706',
                          backgroundColor: 'rgba(245,158,11,0.1)',
                          borderRadius: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: '#F59E0B',
                            display: 'inline-block',
                          }}
                        />
                        Unsaved
                      </span>
                    )}
                  </div>

                  {/* Version + Date */}
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#868D9E' }}>Current version</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#36415D',
                          backgroundColor: '#F5F5F5',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        v{version}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, color: '#868D9E' }}>Published</span>
                      <span style={{ fontSize: 13, color: '#36415D' }}>{publishedDate}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 14 }} />

                  {/* Changelog textarea */}
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#5E677D',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Changelog
                  </label>
                  <textarea
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="What changed in this version?"
                    rows={2}
                    className="w-full resize-none outline-none transition-colors"
                    style={{
                      fontSize: 13,
                      lineHeight: '20px',
                      color: '#36415D',
                      border: '1.5px solid #C2C9DB',
                      borderRadius: 8,
                      padding: '8px 10px',
                      backgroundColor: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2E80ED';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(47,128,237,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#C2C9DB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  {/* Publish button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 mt-4 transition-colors"
                    style={{
                      height: 42,
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      backgroundColor: '#0B9E4D',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(11,158,77,0.25)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0AB854';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0B9E4D';
                    }}
                  >
                    <span>Publish Update</span>
                  </button>
                </div>

                {/* Settings Card — Collapsible */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between px-5 transition-colors"
                    style={{
                      height: 48,
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSettingsExpanded(!settingsExpanded)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={15} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Settings
                      </span>
                    </div>
                    {settingsExpanded ? (
                      <ChevronUp size={16} style={{ color: '#868D9E' }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: '#868D9E' }} />
                    )}
                  </button>

                  {settingsExpanded && (
                    <div style={{ padding: '0 20px 18px 20px' }}>
                      {/* Text-to-speech group */}
                      <div className="mb-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Volume2 size={13} style={{ color: '#2F80ED' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Text to Speech</span>
                        </div>
                        <div className="flex flex-col gap-2">
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

                      {/* Divider */}
                      <div style={{ height: 1, backgroundColor: '#F5F5F5', marginBottom: 14 }} />

                      {/* Logic group */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <GitBranch size={13} style={{ color: '#2F80ED' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D' }}>Logic</span>
                        </div>
                        <div className="flex flex-col gap-2">
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

                {/* Connected Digital Twin Card — Compact */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '16px 20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: 'rgba(47,128,237,0.08)',
                          border: '1px solid rgba(47,128,237,0.12)',
                        }}
                      >
                        <Box size={17} style={{ color: '#2F80ED' }} />
                      </div>
                      <div className="min-w-0">
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#868D9E',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 2,
                          }}
                        >
                          Connected Digital Twin
                        </p>
                        <p
                          style={{ fontSize: 14, fontWeight: 600, color: '#36415D', lineHeight: '18px' }}
                          className="truncate"
                        >
                          Generator Digital Twin
                        </p>
                      </div>
                    </div>
                    <button
                      className="shrink-0 transition-colors"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#2F80ED',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.06)';
                        e.currentTarget.style.color = '#82B3F4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#2F80ED';
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
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
