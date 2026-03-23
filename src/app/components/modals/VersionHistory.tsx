import { useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Eye, GitCompareArrows, History, X, ArrowLeft, Plus, Minus, Edit3, ArrowRightLeft } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';

interface Version {
  version: string;
  publishDate: string;
  publishedBy: string;
  publishedByInitials: string;
  publishedByColor: string;
}

interface VersionHistoryProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  versions: Version[];
  onRollback?: (version: Version) => void;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const match = dateStr.match(/^(\w+)\s+(\d+),\s+(\d{4})/);
  if (match) {
    const months: Record<string, string> = { January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', May: 'May', June: 'Jun', July: 'Jul', August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec' };
    return `${months[match[1]] || match[1]} ${match[2]}, ${match[3]}`;
  }
  return dateStr;
}

function formatTime(dateStr: string): string {
  const match = dateStr.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (match) return match[1];
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return '';
}

// Mock change data per version for "View changes"
const MOCK_CHANGES: Record<string, { type: 'added' | 'removed' | 'modified' | 'reordered'; description: string }[]> = {
  '1.4': [
    { type: 'added', description: 'Added "Safety verification" step after lockout' },
    { type: 'modified', description: 'Updated coolant check instructions with new thresholds' },
    { type: 'modified', description: 'Revised belt inspection criteria images' },
  ],
  '1.3': [
    { type: 'added', description: 'Added battery testing step with voltage requirements' },
    { type: 'removed', description: 'Removed deprecated oil pressure check procedure' },
    { type: 'modified', description: 'Updated safety lockout diagram' },
    { type: 'reordered', description: 'Moved fuel filter inspection before air filter' },
  ],
  '1.2': [
    { type: 'added', description: 'Added hose inspection step with wear indicators' },
    { type: 'modified', description: 'Updated load testing parameters to match new standards' },
  ],
  '1.1': [
    { type: 'modified', description: 'Corrected oil level check instructions' },
    { type: 'modified', description: 'Fixed typo in coolant flush procedure' },
    { type: 'added', description: 'Added warning label to electrical system step' },
  ],
  '1.0': [
    { type: 'added', description: 'Initial version with 10-step maintenance flow' },
  ],
};

// Mock step names for preview
const MOCK_STEPS = [
  'Safety Lockout',
  'Oil Level Check',
  'Coolant System Flush',
  'Air Filter Inspection',
  'Fuel Filter Check',
  'Battery Testing',
  'Belt & Hose Inspection',
  'Load Testing',
  'Safety Verification',
  'Final Sign-off',
];

function ChangeIcon({ type }: { type: 'added' | 'removed' | 'modified' | 'reordered' }) {
  switch (type) {
    case 'added': return <Plus size={12} />;
    case 'removed': return <Minus size={12} />;
    case 'modified': return <Edit3 size={12} />;
    case 'reordered': return <ArrowRightLeft size={12} />;
  }
}

function getChangeColor(type: 'added' | 'removed' | 'modified' | 'reordered') {
  switch (type) {
    case 'added': return { text: '#0B9E4D', bg: 'rgba(11,158,77,0.08)', border: 'rgba(11,158,77,0.15)' };
    case 'removed': return { text: '#FF1F1F', bg: 'rgba(255,31,31,0.06)', border: 'rgba(255,31,31,0.12)' };
    case 'modified': return { text: '#2F80ED', bg: 'rgba(47,128,237,0.06)', border: 'rgba(47,128,237,0.12)' };
    case 'reordered': return { text: '#8B5CF6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.12)' };
  }
}

function getChangeLabel(type: 'added' | 'removed' | 'modified' | 'reordered') {
  switch (type) {
    case 'added': return 'Added';
    case 'removed': return 'Removed';
    case 'modified': return 'Modified';
    case 'reordered': return 'Reordered';
  }
}

/* ─── Preview overlay ─── */
function PreviewOverlay({ version, onClose }: { version: Version; onClose: () => void }) {
  // Show a mock flow preview for this version
  const stepCount = version.version === '1.0' ? 8
    : version.version === '1.1' ? 9
    : version.version === '1.2' ? 9
    : version.version === '1.3' ? 10
    : 10;
  const steps = MOCK_STEPS.slice(0, stepCount);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 720, maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 80px)',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={16} style={{ color: '#2F80ED' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#36415D' }}>
              Preview — v{version.version}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#868D9E',
              backgroundColor: '#F5F6F8', borderRadius: 12, padding: '2px 8px',
            }}>
              {formatShortDate(version.publishDate)}
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#868D9E',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview body — mock canvas */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, backgroundColor: '#FAFBFC' }}>
          {/* Info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            backgroundColor: 'rgba(47,128,237,0.06)', border: '1px solid rgba(47,128,237,0.12)',
            marginBottom: 20,
          }}>
            <Eye size={13} style={{ color: '#2F80ED' }} />
            <span style={{ fontSize: 12, color: '#2F80ED', fontWeight: 500 }}>
              Read-only preview of this version. {stepCount} steps total.
            </span>
          </div>

          {/* Mock flow diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 320, padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E4E5EA',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'border-color 120ms, box-shadow 120ms',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2F80ED';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(47,128,237,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#E4E5EA';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    backgroundColor: i === 0 ? '#0B9E4D' : i === steps.length - 1 ? '#2F80ED' : '#F0F1F4',
                    color: i === 0 || i === steps.length - 1 ? '#FFFFFF' : '#36415D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#36415D' }}>{step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 2, height: 16, backgroundColor: '#D1D5DB' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#868D9E' }}>
            Published by {version.publishedBy}
          </span>
          <button onClick={onClose} style={{
            height: 32, padding: '0 16px', borderRadius: 8,
            border: '1px solid #E4E5EA', backgroundColor: '#FFFFFF',
            color: '#36415D', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F6F8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── View Changes overlay ─── */
function ViewChangesOverlay({ version, previousVersion, onClose }: {
  version: Version;
  previousVersion: Version | null;
  onClose: () => void;
}) {
  const changes = MOCK_CHANGES[version.version] || [];
  const counts = {
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
    reordered: changes.filter(c => c.type === 'reordered').length,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 540, maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 80px)',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitCompareArrows size={16} style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#36415D' }}>
              Changes in v{version.version}
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#868D9E',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Version comparison header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10,
            backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB',
          }}>
            {previousVersion ? (
              <>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#868D9E',
                  backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
                  borderRadius: 6, padding: '2px 8px',
                }}>v{previousVersion.version}</span>
                <ArrowLeft size={14} style={{ color: '#C2C9DB', transform: 'rotate(180deg)' }} />
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#2F80ED',
                  backgroundColor: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.15)',
                  borderRadius: 6, padding: '2px 8px',
                }}>v{version.version}</span>
                <span style={{ fontSize: 11, color: '#868D9E', marginLeft: 4 }}>
                  {formatShortDate(version.publishDate)}
                </span>
              </>
            ) : (
              <>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#0B9E4D',
                  backgroundColor: 'rgba(11,158,77,0.08)', border: '1px solid rgba(11,158,77,0.15)',
                  borderRadius: 6, padding: '2px 8px',
                }}>v{version.version}</span>
                <span style={{ fontSize: 11, color: '#868D9E', marginLeft: 4 }}>
                  Initial release — {formatShortDate(version.publishDate)}
                </span>
              </>
            )}
          </div>

          {/* Summary counters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {counts.added > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0B9E4D', backgroundColor: 'rgba(11,158,77,0.08)', borderRadius: 12, padding: '3px 10px' }}>
                +{counts.added} added
              </span>
            )}
            {counts.removed > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#FF1F1F', backgroundColor: 'rgba(255,31,31,0.06)', borderRadius: 12, padding: '3px 10px' }}>
                −{counts.removed} removed
              </span>
            )}
            {counts.modified > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#2F80ED', backgroundColor: 'rgba(47,128,237,0.06)', borderRadius: 12, padding: '3px 10px' }}>
                ~{counts.modified} modified
              </span>
            )}
            {counts.reordered > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 12, padding: '3px 10px' }}>
                ↔{counts.reordered} reordered
              </span>
            )}
          </div>

          {/* Change list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {changes.map((change, i) => {
              const color = getChangeColor(change.type);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px',
                  backgroundColor: color.bg,
                  border: `1px solid ${color.border}`,
                  borderRadius: 8,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    backgroundColor: '#FFFFFF', border: `1px solid ${color.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color.text, flexShrink: 0, marginTop: 1,
                  }}>
                    <ChangeIcon type={change.type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: color.text,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>{getChangeLabel(change.type)}</span>
                    <p style={{ fontSize: 13, color: '#36415D', margin: '2px 0 0', lineHeight: 1.4, fontWeight: 400 }}>
                      {change.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#868D9E' }}>
            {changes.length} change{changes.length !== 1 ? 's' : ''} by {version.publishedBy}
          </span>
          <button onClick={onClose} style={{
            height: 32, padding: '0 16px', borderRadius: 8,
            border: '1px solid #E4E5EA', backgroundColor: '#FFFFFF',
            color: '#36415D', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F6F8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════ */

export function VersionHistory({
  isExpanded,
  onToggleExpand,
  versions,
  onRollback,
}: VersionHistoryProps) {
  const { currentRole } = useRole();
  const { showToast } = useToast();
  const canRollback = hasAccess(currentRole, 'publish-content');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [changesVersion, setChangesVersion] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setActiveMenu(null), activeMenu !== null, true);

  const handleRollback = (index: number) => {
    setRollbackTarget(index);
    setActiveMenu(null);
  };

  const confirmRollback = () => {
    if (rollbackTarget !== null) {
      const target = versions[rollbackTarget];
      if (onRollback) onRollback(target);
      showToast(`Rolled back to v${target.version} — a new version has been created`, 'success');
      setRollbackTarget(null);
    }
  };

  const handlePreview = (index: number) => {
    setPreviewVersion(index);
    setActiveMenu(null);
  };

  const handleViewChanges = (index: number) => {
    setChangesVersion(index);
    setActiveMenu(null);
  };

  return (
    <>
      {/* Header */}
      <button
        onClick={onToggleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 16px', height: 46, minHeight: 46,
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'background 120ms',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
      >
        <History size={15} style={{ color: '#8B5CF6', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#36415D', flex: 1, textAlign: 'left' }}>
          Version History
        </span>
        {!isExpanded && versions.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#868D9E',
            backgroundColor: '#F0F1F4', borderRadius: 10, padding: '1px 7px',
          }}>
            {versions.length}
          </span>
        )}
        <ChevronDown size={14} style={{
          color: '#868D9E', flexShrink: 0,
          transition: 'transform 200ms',
          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #F0F1F4' }}>
          {versions.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '28px 16px 20px',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <History size={18} style={{ color: '#C2C9DB' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#36415D', marginBottom: 2 }}>No versions yet</span>
              <span style={{ fontSize: 11, color: '#868D9E', textAlign: 'center' }}>Publish your first version to start tracking history</span>
            </div>
          ) : (
            <div style={{ paddingTop: 8 }}>
              {versions.map((version, index) => {
                const isLatest = index === 0;
                const isLast = index === versions.length - 1;
                const time = formatTime(version.publishDate);

                return (
                  <div key={index} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {/* Timeline line + dot */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      width: 20, flexShrink: 0, paddingTop: 2,
                    }}>
                      <div style={{
                        width: isLatest ? 10 : 8,
                        height: isLatest ? 10 : 8,
                        borderRadius: '50%',
                        backgroundColor: isLatest ? '#0B9E4D' : '#D1D5DB',
                        border: isLatest ? '2px solid rgba(11,158,77,0.2)' : 'none',
                        flexShrink: 0,
                        marginTop: 5,
                      }} />
                      {!isLast && (
                        <div style={{
                          width: 1.5, flex: 1, minHeight: 16,
                          backgroundColor: '#E5E7EB',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1, minWidth: 0,
                      paddingBottom: isLast ? 0 : 6,
                    }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 8px', marginLeft: -8,
                          borderRadius: 8,
                          transition: 'background 120ms',
                          cursor: 'default',
                          position: 'relative',
                          backgroundColor: hoveredRow === index ? '#F9FAFB' : 'transparent',
                        }}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {/* Version badge */}
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: isLatest ? '#0B9E4D' : '#2F80ED',
                          backgroundColor: isLatest ? 'rgba(11,158,77,0.08)' : 'rgba(47,128,237,0.06)',
                          borderRadius: 6, padding: '2px 8px',
                          flexShrink: 0,
                        }}>
                          v{version.version}
                        </span>
                        {isLatest && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: '#0B9E4D',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>
                            Current
                          </span>
                        )}

                        {/* Date & publisher */}
                        <span style={{
                          fontSize: 11, color: '#868D9E', fontWeight: 400,
                          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={version.publishDate}>
                          {formatShortDate(version.publishDate)}{time ? ` · ${time}` : ''}
                        </span>

                        {/* Avatar */}
                        <MemberAvatar
                          name={version.publishedBy}
                          initials={version.publishedByInitials}
                          color={version.publishedByColor}
                          size="sm"
                        />

                        {/* Action buttons — show on hover */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          opacity: hoveredRow === index ? 1 : 0,
                          transition: 'opacity 120ms',
                        }}>
                          <button
                            onClick={() => handlePreview(index)}
                            title="Preview this version"
                            style={{
                              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer',
                              color: '#868D9E', transition: 'all 120ms',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#EFF6FF';
                              (e.currentTarget as HTMLElement).style.color = '#2F80ED';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = '#868D9E';
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleViewChanges(index)}
                            title="View changes"
                            style={{
                              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer',
                              color: '#868D9E', transition: 'all 120ms',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(139,92,246,0.08)';
                              (e.currentTarget as HTMLElement).style.color = '#8B5CF6';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = '#868D9E';
                            }}
                          >
                            <GitCompareArrows size={13} />
                          </button>
                          {canRollback && index > 0 && (
                            <button
                              onClick={() => handleRollback(index)}
                              title="Rollback to this version"
                              style={{
                                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer',
                                color: '#868D9E', transition: 'all 120ms',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(217,119,6,0.08)';
                                (e.currentTarget as HTMLElement).style.color = '#D97706';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = '#868D9E';
                              }}
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview overlay */}
      {previewVersion !== null && (
        <PreviewOverlay
          version={versions[previewVersion]}
          onClose={() => setPreviewVersion(null)}
        />
      )}

      {/* View changes overlay */}
      {changesVersion !== null && (
        <ViewChangesOverlay
          version={versions[changesVersion]}
          previousVersion={changesVersion < versions.length - 1 ? versions[changesVersion + 1] : null}
          onClose={() => setChangesVersion(null)}
        />
      )}

      {/* Rollback confirmation dialog */}
      <ConfirmDialog
        isOpen={rollbackTarget !== null}
        title="Rollback Version"
        message={rollbackTarget !== null ? `Are you sure you want to rollback to v${versions[rollbackTarget]?.version}? This will create a new version based on the selected snapshot.` : ''}
        confirmText="Rollback"
        cancelText="Cancel"
        onConfirm={confirmRollback}
        onCancel={() => setRollbackTarget(null)}
        variant="danger"
      />
    </>
  );
}
