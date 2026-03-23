import { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Star,
  Play,
  ExternalLink,
  Box,
  FileText,
  ArrowUpCircle,
  History,
  Settings,
  Volume2,
  GitBranch,
  ChevronDown,
  MoreHorizontal,
  Image as ImageIcon,
} from 'lucide-react';

interface ProcedureModalVariantC2Props {
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

export function ProcedureModalVariantC2({ procedure, onClose }: ProcedureModalVariantC2Props) {
  const [isStarred, setIsStarred] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [previewMode, setPreviewMode] = useState<'2D' | '3D'>('3D');
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
    { version: '2.3', date: 'Mar 15, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '2.2', date: 'Feb 28, 2026', by: 'James Moriarty', initials: 'JM', color: '#2F80ED' },
    { version: '2.1', date: 'Jan 10, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '2.0', date: 'Dec 20, 2025', by: 'Sarah Connor', initials: 'SC', color: '#E67E22' },
    { version: '1.0', date: 'Nov 19, 2025', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
  ];

  // Version timeline dots (last 4 versions for the mini timeline)
  const timelineVersions = versionHistory.slice(0, 4).reverse();

  // Derive publishing state
  const isPublished = procedure.isPublished;
  const hasChanges = procedure.hasUnpublishedChanges;
  const currentVersion = procedure.publishedVersion || '2.3';
  const publishDate = procedure.publishedDate || 'Mar 15, 2026';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-c2-title"
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 1050,
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
              id="variant-c2-title"
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
                height: '48vh',
                minHeight: 300,
                maxHeight: 480,
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

              {/* ─── Floating Toolbar Overlay ─── */}
              <div
                className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 px-2 py-1.5"
                style={{
                  borderRadius: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* 2D / 3D toggle buttons */}
                <button
                  onClick={() => setPreviewMode('2D')}
                  className="flex items-center justify-center transition-all"
                  style={{
                    height: 30,
                    padding: '0 14px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    color: previewMode === '2D' ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    backgroundColor: previewMode === '2D' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  }}
                >
                  2D
                </button>
                <button
                  onClick={() => setPreviewMode('3D')}
                  className="flex items-center justify-center transition-all"
                  style={{
                    height: 30,
                    padding: '0 14px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    color: previewMode === '3D' ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    backgroundColor: previewMode === '3D' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  }}
                >
                  3D
                </button>

                {/* Divider */}
                <div
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    margin: '0 4px',
                  }}
                />

                {/* Digital Twin selector dropdown */}
                <button
                  className="flex items-center gap-2 px-3 transition-all"
                  style={{
                    height: 30,
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <Box size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span>Generator Digital Twin</span>
                  <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>

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

            {/* ─── Full-width Publishing Status Bar ─── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: '16px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                borderLeft: isPublished && hasChanges
                  ? '4px solid #F59E0B'
                  : isPublished
                    ? '4px solid #11E874'
                    : '4px solid #7F7F7F',
              }}
            >
              <div className="flex items-center justify-between">
                {/* Left: Status indicator */}
                <div className="flex items-center gap-4">
                  {/* Status dot + label */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-2"
                      style={{
                        padding: '5px 14px 5px 10px',
                        borderRadius: 20,
                        backgroundColor: isPublished && hasChanges
                          ? 'rgba(245,158,11,0.08)'
                          : isPublished
                            ? 'rgba(17,232,116,0.08)'
                            : 'rgba(127,127,127,0.08)',
                      }}
                    >
                      <div
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          backgroundColor: isPublished && hasChanges
                            ? '#F59E0B'
                            : isPublished
                              ? '#11E874'
                              : '#7F7F7F',
                          boxShadow: isPublished && hasChanges
                            ? '0 0 0 3px rgba(245,158,11,0.2)'
                            : isPublished
                              ? '0 0 0 3px rgba(17,232,116,0.2)'
                              : 'none',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isPublished && hasChanges
                            ? '#B45309'
                            : isPublished
                              ? '#0B9E4D'
                              : '#7F7F7F',
                        }}
                      >
                        {isPublished && hasChanges
                          ? 'Unpublished changes'
                          : isPublished
                            ? 'Published'
                            : 'Draft'}
                      </span>
                    </div>

                    {/* Version badge */}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#2F80ED',
                        backgroundColor: 'rgba(47,128,237,0.08)',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        letterSpacing: '0.02em',
                      }}
                    >
                      v{currentVersion}
                    </span>

                    {/* Published date */}
                    {isPublished && (
                      <span style={{ fontSize: 13, color: '#868D9E' }}>
                        Published {publishDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Center: Mini version timeline */}
                <div className="flex items-center gap-0" style={{ marginLeft: 'auto', marginRight: 32 }}>
                  {timelineVersions.map((v, i) => {
                    const isLast = i === timelineVersions.length - 1;
                    const isFirst = i === 0;
                    return (
                      <div key={i} className="flex items-center">
                        {/* Dot */}
                        <div className="flex flex-col items-center" style={{ position: 'relative' }}>
                          <div
                            style={{
                              width: isLast ? 14 : 10,
                              height: isLast ? 14 : 10,
                              borderRadius: '50%',
                              backgroundColor: isLast ? '#2F80ED' : '#D1D5DB',
                              border: isLast ? '3px solid rgba(47,128,237,0.25)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                            title={`v${v.version} — ${v.date}`}
                          />
                          {/* Version label under dot */}
                          <span
                            style={{
                              position: 'absolute',
                              top: isLast ? 20 : 16,
                              fontSize: 9,
                              fontWeight: isLast ? 700 : 500,
                              color: isLast ? '#2F80ED' : '#868D9E',
                              whiteSpace: 'nowrap',
                              fontFamily: 'monospace',
                            }}
                          >
                            {v.version}
                          </span>
                        </div>

                        {/* Connecting line */}
                        {!isLast && (
                          <div
                            style={{
                              width: 28,
                              height: 2,
                              backgroundColor: i === timelineVersions.length - 2 ? '#2F80ED' : '#D1D5DB',
                              opacity: i === timelineVersions.length - 2 ? 0.4 : 1,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="flex items-center gap-2 px-5 transition-colors"
                    style={{
                      height: 38,
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: isPublished && hasChanges ? '#0B9E4D' : '#0B9E4D',
                      boxShadow: '0 2px 8px rgba(11,158,77,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0AAD56';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,158,77,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0B9E4D';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,158,77,0.3)';
                    }}
                  >
                    <ArrowUpCircle size={16} />
                    <span>{isPublished && hasChanges ? 'Update' : 'Publish'}</span>
                  </button>

                  {/* More menu */}
                  <button
                    className="flex items-center justify-center transition-colors"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      color: '#868D9E',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #E9E9E9',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EBEBEB';
                      e.currentTarget.style.color = '#36415D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                      e.currentTarget.style.color = '#868D9E';
                    }}
                    title="More publishing options"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Two-column Card Row: Content + Configuration ─── */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Card — Content */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
              >
                {/* Thumbnail spanning full card width */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '100%',
                    height: 140,
                    backgroundColor: '#F0F2F5',
                    borderBottom: '1px solid #E9E9E9',
                  }}
                >
                  {procedure.thumbnail ? (
                    <img
                      src={procedure.thumbnail}
                      alt="Procedure thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={28} style={{ color: '#C2C9DB' }} />
                      <span style={{ fontSize: 11, color: '#868D9E' }}>No thumbnail</span>
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div style={{ padding: '18px 20px' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} style={{ color: '#36415D' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Content
                    </span>
                  </div>

                  {/* Description text */}
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: '22px',
                      color: '#5E677D',
                      marginBottom: 20,
                    }}
                  >
                    {procedure.description ||
                      'This procedure guides technicians through the step-by-step maintenance process for the Generator Digital Twin. It includes visual annotations, hotspot interactions, and guided narration for field service operations.'}
                  </p>

                  {/* Divider */}
                  <div style={{ height: 1, backgroundColor: '#F0F2F5', marginBottom: 14 }} />

                  {/* Metadata */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: '#aa74b5',
                          fontSize: 8,
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}
                      >
                        {procedure.createdBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 12, color: '#868D9E' }}>
                        Created by <span style={{ color: '#5E677D', fontWeight: 500 }}>{procedure.createdBy}</span> on {procedure.createdDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          backgroundColor: '#2F80ED',
                          fontSize: 8,
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}
                      >
                        {procedure.lastEditedBy.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 12, color: '#868D9E' }}>
                        Last edited by <span style={{ color: '#5E677D', fontWeight: 500 }}>{procedure.lastEditedBy}</span> on {procedure.lastEdited}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card — Configuration */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* ── Settings Section ── */}
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={15} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Configuration
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
                <div style={{ height: 1, backgroundColor: '#F0F2F5', marginBottom: 14 }} />

                {/* Logic group */}
                <div className="mb-5">
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

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: '#F0F2F5', marginBottom: 14 }} />

                {/* ── Version History Section ── */}
                <div className="flex items-center gap-2 mb-3">
                  <History size={15} style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Version History
                  </span>
                </div>

                <div className="flex flex-col">
                  {versionHistory.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3"
                      style={{
                        padding: '9px 0',
                        borderBottom: i < versionHistory.length - 1 ? '1px solid #F0F2F5' : 'none',
                      }}
                    >
                      {/* Version badge */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: i === 0 ? '#2F80ED' : '#36415D',
                          backgroundColor: i === 0 ? 'rgba(47,128,237,0.08)' : '#F5F5F5',
                          padding: '2px 8px',
                          borderRadius: 5,
                          fontFamily: 'monospace',
                          minWidth: 42,
                          textAlign: 'center',
                        }}
                      >
                        v{v.version}
                      </span>

                      {/* Date */}
                      <span
                        className="flex-1"
                        style={{
                          fontSize: 12,
                          color: '#868D9E',
                        }}
                      >
                        {v.date}
                      </span>

                      {/* Author avatar + name */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div
                          className="flex items-center justify-center"
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
                        <span style={{ fontSize: 12, color: '#5E677D' }}>{v.by}</span>
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
