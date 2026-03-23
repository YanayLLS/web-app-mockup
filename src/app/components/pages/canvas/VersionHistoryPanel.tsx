import { useState, useRef } from 'react';
import {
  X,
  Clock,
  RotateCcw,
  Eye,
  EyeOff,
  Tag,
} from 'lucide-react';
import { MemberAvatar } from '../../MemberAvatar';
import type { Node, Edge } from 'reactflow';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Version {
  id: string;
  name: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  changeSummary: string;
  snapshot: {
    nodes: Node[];
    edges: Edge[];
  };
}

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  onSaveVersion: (name: string) => void;
  onPreviewVersion: (version: Version | null) => void;
  onRestoreVersion: (version: Version) => void;
  previewingVersionId: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VersionHistoryPanel({
  isOpen,
  onClose,
  versions,
  onSaveVersion,
  onPreviewVersion,
  onRestoreVersion,
  previewingVersionId,
}: VersionHistoryPanelProps) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!versionName.trim()) return;
    onSaveVersion(versionName.trim());
    setVersionName('');
    setShowSaveInput(false);
  };

  const handleRestore = (version: Version) => {
    onRestoreVersion(version);
    setShowRestoreConfirm(null);
  };

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-[55] flex flex-col border-l"
      style={{
        width: '320px',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-sm)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Version History
          </span>
          {versions.length > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)' }}
            >
              {versions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowSaveInput(!showSaveInput);
              setTimeout(() => saveInputRef.current?.focus(), 100);
            }}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Save as Version"
          >
            <Tag className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Close"
          >
            <X size={16} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      {/* Save Version Input */}
      {showSaveInput && (
        <div
          className="px-4 py-3 flex gap-2 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <input
            ref={saveInputRef}
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setShowSaveInput(false);
            }}
            placeholder='e.g. "v1.0 - Initial flow"'
            className="flex-1 text-xs border rounded px-2.5 py-1.5 focus:outline-none"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          />
          <button
            onClick={handleSave}
            disabled={!versionName.trim()}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: versionName.trim() ? 'var(--primary)' : 'var(--secondary)',
              color: versionName.trim() ? 'white' : 'var(--muted)',
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Preview Banner */}
      {previewingVersionId && (
        <div
          className="px-4 py-2 flex items-center justify-between shrink-0 border-b"
          style={{
            backgroundColor: 'rgba(47, 128, 237, 0.08)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
              Previewing version
            </span>
          </div>
          <button
            onClick={() => onPreviewVersion(null)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-secondary transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            <EyeOff className="w-3 h-3" />
            Exit
          </button>
        </div>
      )}

      {/* Version List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <Clock className="w-8 h-8 mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              No versions yet
            </p>
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
              Save your work to create a version snapshot
            </p>
          </div>
        ) : (
          <div className="py-1">
            {versions.map((version, index) => {
              const isPreviewing = previewingVersionId === version.id;
              const isLatest = index === 0;

              return (
                <div
                  key={version.id}
                  className="px-4 py-3 transition-colors hover:bg-secondary/50"
                  style={{
                    backgroundColor: isPreviewing ? 'rgba(47, 128, 237, 0.05)' : undefined,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {/* Version name + time + badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {version.name}
                        </span>
                        {isLatest && (
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: '#10b98115',
                              color: '#10b981',
                            }}
                          >
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        {formatTimestamp(version.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <MemberAvatar
                      name={version.authorName}
                      id={version.authorId}
                      initials={version.authorInitials}
                      color={version.authorColor}
                      size="sm"
                    />
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {version.authorName}
                    </span>
                  </div>

                  {/* Change summary */}
                  <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                    {version.changeSummary}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isPreviewing ? (
                      <button
                        onClick={() => onPreviewVersion(null)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-colors hover:bg-secondary"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <EyeOff className="w-3 h-3" />
                        Exit Preview
                      </button>
                    ) : (
                      <button
                        onClick={() => onPreviewVersion(version)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-colors hover:bg-secondary"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    )}

                    {!isLatest && (
                      <>
                        {showRestoreConfirm === version.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px]" style={{ color: 'var(--destructive)' }}>
                              Restore?
                            </span>
                            <button
                              onClick={() => handleRestore(version)}
                              className="px-2 py-1 rounded text-[10px] font-semibold transition-colors"
                              style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setShowRestoreConfirm(null)}
                              className="px-2 py-1 rounded text-[10px] font-medium border transition-colors hover:bg-secondary"
                              style={{
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                              }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowRestoreConfirm(version.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-colors hover:bg-secondary"
                            style={{
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)',
                            }}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 border-t shrink-0 flex items-center gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
