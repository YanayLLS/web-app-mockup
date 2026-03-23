import { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Star,
  Play,
  ExternalLink,
  Box,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpCircle,
  History,
  Settings,
  Volume2,
  GitBranch,
} from 'lucide-react';

interface ProcedureModalVariantCProps {
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

export function ProcedureModalVariantC({ procedure, onClose }: ProcedureModalVariantCProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll for sticky header opacity
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

  // Mock version history
  const versionHistory = [
    { version: '1.2', date: 'Mar 15, 2026 at 3:12 PM', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '1.1', date: 'Feb 28, 2026 at 11:05 AM', by: 'James Moriarty', initials: 'JM', color: '#2F80ED' },
    { version: '1.0', date: 'Jan 10, 2026 at 9:30 AM', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '0.9', date: 'Dec 20, 2025 at 4:45 PM', by: 'Sarah Connor', initials: 'SC', color: '#E67E22' },
    { version: '0.8', date: 'Nov 19, 2025 at 2:48 PM', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-c-title"
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
              id="variant-c-title"
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

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
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

            {/* ─── Hero Preview Section ─── */}
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                width: '100%',
                height: '50vh',
                minHeight: 320,
                maxHeight: 500,
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

              {/* Bottom-left: Digital twin name */}
              <div className="absolute bottom-5 left-5 z-10">
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

              {/* Bottom-right: Edit buttons */}
              <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
                >
                  <span>Edit in app</span>
                  <ExternalLink size={11} />
                </button>
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
                  <span>Edit in canvas</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>

            {/* ─── Three Info Cards Row ─── */}
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1: Status */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <CheckCircle2 size={15} style={{ color: '#11E874' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: procedure.isPublished ? '#0B9E4D' : '#7F7F7F',
                      backgroundColor: procedure.isPublished ? 'rgba(17,232,116,0.1)' : 'rgba(127,127,127,0.1)',
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
                      }}
                    />
                    {procedure.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: '#868D9E' }}>Version</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}>
                      {procedure.publishedVersion || '1.0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: '#868D9E' }}>Published</span>
                    <span style={{ fontSize: 12, color: '#36415D' }}>
                      {procedure.publishedDate || 'Mar 15, 2026'}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-1.5 mt-4 transition-colors"
                  style={{
                    height: 34,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0B9E4D',
                    backgroundColor: 'rgba(17,232,116,0.08)',
                    borderRadius: 8,
                    border: '1px solid rgba(17,232,116,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(17,232,116,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(17,232,116,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(17,232,116,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(17,232,116,0.2)';
                  }}
                >
                  <ArrowUpCircle size={14} />
                  <span>{procedure.hasUnpublishedChanges ? 'Update' : 'Publish'}</span>
                </button>
              </div>

              {/* Card 2: Digital Twin */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <Box size={15} style={{ color: '#2F80ED' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Digital Twin
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: 'rgba(47,128,237,0.08)',
                      border: '1px solid rgba(47,128,237,0.12)',
                    }}
                  >
                    <Box size={18} style={{ color: '#2F80ED' }} />
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#36415D', lineHeight: '18px' }} className="truncate">
                      Generator Digital Twin
                    </p>
                    <p style={{ fontSize: 11, color: '#868D9E', marginTop: 2 }}>
                      3D Model
                    </p>
                  </div>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-1.5 transition-colors"
                  style={{
                    height: 34,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#2F80ED',
                    backgroundColor: 'rgba(47,128,237,0.06)',
                    borderRadius: 8,
                    border: '1px solid rgba(47,128,237,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(47,128,237,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.15)';
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open Digital Twin</span>
                </button>
              </div>

              {/* Card 3: Activity */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <Clock size={15} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Activity
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {/* Last edited */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="shrink-0 flex items-center justify-center mt-0.5"
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
                    <div>
                      <p style={{ fontSize: 12, color: '#868D9E', lineHeight: '16px' }}>Last edited by</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#36415D', lineHeight: '18px' }}>
                        {procedure.lastEditedBy}
                      </p>
                      <p style={{ fontSize: 11, color: '#868D9E', marginTop: 1 }}>
                        {procedure.lastEdited}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#E9E9E9' }} />

                  {/* Created by */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="shrink-0 flex items-center justify-center mt-0.5"
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
                    <div>
                      <p style={{ fontSize: 12, color: '#868D9E', lineHeight: '16px' }}>Created by</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#36415D', lineHeight: '18px' }}>
                        {procedure.createdBy}
                      </p>
                      <p style={{ fontSize: 11, color: '#868D9E', marginTop: 1 }}>
                        {procedure.createdDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Description Section ─── */}
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

              <div className="flex gap-4">
                {/* Thumbnail */}
                <div
                  className="shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: 100,
                    height: 72,
                    borderRadius: 8,
                    backgroundColor: '#F5F5F5',
                    border: '1px solid #E9E9E9',
                  }}
                >
                  {procedure.thumbnail ? (
                    <img
                      src={procedure.thumbnail}
                      alt="Procedure thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText size={24} style={{ color: '#C2C9DB' }} />
                  )}
                </div>

                {/* Description text */}
                <p
                  className="flex-1"
                  style={{
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#5E677D',
                  }}
                >
                  {procedure.description ||
                    'This procedure guides technicians through the step-by-step maintenance process for the Generator Digital Twin. It includes visual annotations, hotspot interactions, and guided narration for field service operations.'}
                </p>
              </div>
            </div>

            {/* ─── Bottom Row: Settings + Version History ─── */}
            <div className="grid grid-cols-2 gap-4">
              {/* Settings Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={15} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Settings
                  </span>
                </div>

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

              {/* Version History Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <History size={15} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Version History
                  </span>
                </div>

                <div className="flex flex-col">
                  {versionHistory.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 relative" style={{ paddingBottom: i < versionHistory.length - 1 ? 16 : 0 }}>
                      {/* Timeline connector */}
                      {i < versionHistory.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 11,
                            top: 24,
                            bottom: 0,
                            width: 2,
                            backgroundColor: '#E9E9E9',
                          }}
                        />
                      )}

                      {/* Version dot */}
                      <div
                        className="shrink-0 flex items-center justify-center relative z-10"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: i === 0 ? '#2F80ED' : '#E9E9E9',
                          border: i === 0 ? '3px solid rgba(47,128,237,0.2)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 8, fontWeight: 700, color: i === 0 ? '#FFFFFF' : '#868D9E' }}>
                          {v.version}
                        </span>
                      </div>

                      {/* Version info */}
                      <div className="flex-1 min-w-0" style={{ paddingTop: 1 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? '#2F80ED' : '#36415D' }}>
                            v{v.version}
                          </span>
                          {i === 0 && (
                            <span
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
                        <p style={{ fontSize: 11, color: '#868D9E', marginTop: 2 }} className="truncate">
                          {v.date}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: v.color,
                              fontSize: 8,
                              fontWeight: 700,
                              color: '#FFFFFF',
                            }}
                          >
                            {v.initials}
                          </div>
                          <span style={{ fontSize: 11, color: '#5E677D' }}>{v.by}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
