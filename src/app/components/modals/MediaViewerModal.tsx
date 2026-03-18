import { X, Download, ImageIcon, Film, FileText } from 'lucide-react';
import { BaseModal } from './BaseModal';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    type: string;
    mediaType?: 'image' | 'video' | 'document';
    thumbnail?: string;
    url?: string;
  };
}

function MediaTypeIcon({ type }: { type?: string }) {
  switch (type) {
    case 'video': return <Film size={16} className="text-[#8B5CF6]" />;
    case 'image': return <ImageIcon size={16} className="text-[#2F80ED]" />;
    default: return <FileText size={16} className="text-muted" />;
  }
}

function MediaTypeBadge({ type }: { type?: string }) {
  const config = {
    video: { label: 'Video', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
    image: { label: 'Image', color: '#2F80ED', bg: 'rgba(47,128,237,0.08)' },
    document: { label: 'Document', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  };
  const c = config[type as keyof typeof config] || { label: 'File', color: '#868D9E', bg: 'rgba(134,141,158,0.08)' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ color: c.color, background: c.bg, fontWeight: 'var(--font-weight-bold)' }}>
      {c.label}
    </span>
  );
}

export function MediaViewerModal({ isOpen, onClose, item }: MediaViewerModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} opacity={70}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-viewer-title"
        className="relative max-w-5xl max-h-[90vh] w-full mx-4 bg-card rounded-xl overflow-hidden border border-border"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.mediaType === 'video' ? 'rgba(139,92,246,0.08)' : 'rgba(47,128,237,0.08)' }}>
              <MediaTypeIcon type={item.mediaType} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="media-viewer-title"
                className="text-foreground truncate"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}
              >
                {item.name}
              </h2>
              <MediaTypeBadge type={item.mediaType} />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(item.url || item.thumbnail) && (
              <a
                href={item.url || item.thumbnail}
                download={item.name}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted hover:text-foreground"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={18} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted hover:text-foreground"
              aria-label="Close media viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex items-center justify-center bg-black/[0.03] p-6"
          style={{ minHeight: 'min(400px, 60vh)' }}
        >
          {item.mediaType === 'video' && item.url ? (
            <video
              src={item.url}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
          ) : item.mediaType === 'image' && (item.url || item.thumbnail) ? (
            <img
              src={item.url || item.thumbnail}
              alt={item.name}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
          ) : (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(47,128,237,0.03))', border: '1px solid rgba(47,128,237,0.1)' }}>
                <FileText size={28} className="text-primary/40" />
              </div>
              <p className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>Preview not available</p>
              <p className="text-xs text-muted max-w-[240px]">This file type doesn't support inline preview</p>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
