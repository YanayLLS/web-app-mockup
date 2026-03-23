import {
  X,
  Share2,
  Star,
  FileText,
  Play,
  ExternalLink,
  Box,
  Check,
  History,
} from 'lucide-react';

interface ProcedureModalVariantDProps {
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

export function ProcedureModalVariantD({ procedure, onClose }: ProcedureModalVariantDProps) {
  // --- Mock data ---
  const versionHistory = [
    { version: '1.2', date: 'Mar 15, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '1.1', date: 'Feb 28, 2026', by: 'Mike Chen', initials: 'MC', color: '#4a90d9' },
    { version: '1.0', date: 'Jan 10, 2026', by: 'Laura Green', initials: 'LG', color: '#aa74b5' },
    { version: '0.9', date: 'Dec 02, 2025', by: 'Sarah Kim', initials: 'SK', color: '#e0724b' },
  ];

  const settingsData = {
    textToSpeech: [
      { label: 'Auto narrate header', checked: true },
      { label: 'Auto narrate description', checked: true },
      { label: 'Wait for completion', checked: false },
    ],
    logics: [
      { label: 'Allow 2D viewing', checked: true },
      { label: 'Toggle step advancement', checked: true },
      { label: 'Allow skipping steps', checked: false },
      { label: 'Show survey', checked: true },
    ],
  };

  // --- Tile wrapper style ---
  const tileStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #C2C9DB',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const tileLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#868D9E',
    marginBottom: '10px',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-d-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '85vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ========== TOP BAR ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #C2C9DB',
            flexShrink: 0,
          }}
        >
          {/* Left: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EBF2FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={16} color="#2F80ED" />
            </div>
            <h2
              id="variant-d-title"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#36415D',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {procedure.name}
            </h2>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '34px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #C2C9DB',
                background: '#FFFFFF',
                color: '#36415D',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #C2C9DB',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              title="Add to favorites"
            >
              <Star size={16} color="#868D9E" />
            </button>
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #C2C9DB',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              aria-label="Close modal"
            >
              <X size={16} color="#868D9E" />
            </button>
          </div>
        </div>

        {/* ========== GRID AREA ========== */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            background: '#F5F5F5',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridAutoRows: 'auto',
              gap: '12px',
            }}
          >
            {/* ---- PREVIEW TILE (spans 2 cols, 2 rows) ---- */}
            <div
              style={{
                ...tileStyle,
                gridColumn: 'span 2',
                gridRow: 'span 2',
                padding: '12px',
              }}
            >
              <div style={tileLabelStyle}>Preview</div>
              <div
                style={{
                  flex: 1,
                  minHeight: '280px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2F80ED 0%, #004FFF 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative grid pattern */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.06,
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Play button */}
                <button
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
                  aria-label="Play 3D preview"
                >
                  <Play size={24} color="white" fill="white" style={{ marginLeft: '3px' }} />
                </button>

                {/* DT name label at bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Box size={14} color="rgba(255,255,255,0.7)" />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    Generator Digital Twin
                  </span>
                </div>
              </div>
            </div>

            {/* ---- STATUS TILE ---- */}
            <div style={tileStyle}>
              <div style={tileLabelStyle}>Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* Published badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#11E874',
                      boxShadow: '0 0 6px rgba(17,232,116,0.4)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#36415D' }}>
                    Published
                  </span>
                </div>

                {/* Version */}
                <div>
                  <div style={{ fontSize: '11px', color: '#868D9E', marginBottom: '2px' }}>
                    Version
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#36415D' }}>
                    {procedure.publishedVersion || '1.2'}
                  </div>
                </div>

                {/* Published date */}
                <div>
                  <div style={{ fontSize: '11px', color: '#868D9E', marginBottom: '2px' }}>
                    Published
                  </div>
                  <div style={{ fontSize: '13px', color: '#36415D' }}>
                    {procedure.publishedDate || 'Mar 15, 2026'}
                  </div>
                </div>

                {/* Update button */}
                <button
                  style={{
                    marginTop: 'auto',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid rgba(17,232,116,0.4)',
                    background: 'rgba(17,232,116,0.08)',
                    color: '#0B9E4D',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(17,232,116,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(17,232,116,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(17,232,116,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(17,232,116,0.4)';
                  }}
                >
                  Update
                </button>
              </div>
            </div>

            {/* ---- ACTIONS TILE ---- */}
            <div style={tileStyle}>
              <div style={tileLabelStyle}>Actions</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <button
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid rgba(47,128,237,0.35)',
                    background: '#FFFFFF',
                    color: '#2F80ED',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(47,128,237,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.55)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.35)';
                  }}
                >
                  Edit in app
                  <ExternalLink size={12} />
                </button>
                <button
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2F80ED',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#82B3F4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#2F80ED')}
                >
                  Edit in canvas
                </button>
              </div>
            </div>

            {/* ---- DESCRIPTION TILE (spans 2 cols) ---- */}
            <div style={{ ...tileStyle, gridColumn: 'span 2' }}>
              <div style={tileLabelStyle}>Description</div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Small thumbnail */}
                <div
                  style={{
                    width: '80px',
                    height: '56px',
                    borderRadius: '8px',
                    background: '#E9E9E9',
                    border: '1px solid #C2C9DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {procedure.thumbnail ? (
                    <img
                      src={procedure.thumbnail}
                      alt="Thumbnail"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    <FileText size={20} color="#868D9E" />
                  )}
                </div>

                {/* Description text */}
                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.55',
                    color: '#36415D',
                    margin: 0,
                  }}
                >
                  {procedure.description ||
                    'Step-by-step maintenance procedure for the Generator Digital Twin. Covers inspection, diagnostics, part replacement, and final verification with interactive 3D guidance.'}
                </p>
              </div>
            </div>

            {/* ---- DIGITAL TWIN TILE ---- */}
            <div style={tileStyle}>
              <div style={tileLabelStyle}>Digital Twin</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '10px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#EBF2FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box size={20} color="#2F80ED" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#36415D',
                      marginBottom: '6px',
                    }}
                  >
                    Generator Digital Twin
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0B9E4D',
                      background: 'rgba(17,232,116,0.12)',
                      padding: '3px 10px',
                      borderRadius: '100px',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#11E874',
                      }}
                    />
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* ---- SETTINGS TILE (spans 2 cols) ---- */}
            <div style={{ ...tileStyle, gridColumn: 'span 2' }}>
              <div style={tileLabelStyle}>Settings</div>
              <div style={{ display: 'flex', gap: '32px' }}>
                {/* Text to Speech group */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#36415D',
                      marginBottom: '10px',
                    }}
                  >
                    Text to Speech
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {settingsData.textToSpeech.map((opt, i) => (
                      <label
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: opt.checked ? 'none' : '1.5px solid #C2C9DB',
                            background: opt.checked ? '#2F80ED' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {opt.checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '12px', color: '#36415D' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: '#E9E9E9', alignSelf: 'stretch' }} />

                {/* Logics group */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#36415D',
                      marginBottom: '10px',
                    }}
                  >
                    Logics
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {settingsData.logics.map((opt, i) => (
                      <label
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: opt.checked ? 'none' : '1.5px solid #C2C9DB',
                            background: opt.checked ? '#2F80ED' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {opt.checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '12px', color: '#36415D' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ---- VERSION HISTORY TILE ---- */}
            <div style={tileStyle}>
              <div style={{ ...tileLabelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={11} color="#868D9E" />
                Version History
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                {versionHistory.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 4px',
                      borderBottom: i < versionHistory.length - 1 ? '1px solid #F0F0F0' : 'none',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: v.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}
                      >
                        {v.initials}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#36415D',
                          lineHeight: '1.3',
                        }}
                      >
                        v{v.version}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#868D9E',
                          lineHeight: '1.3',
                        }}
                      >
                        {v.date}
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
  );
}
