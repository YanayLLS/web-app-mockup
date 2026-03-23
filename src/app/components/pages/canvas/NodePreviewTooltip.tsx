import { useState, useEffect, useRef } from 'react';
import type { Node } from 'reactflow';
import {
  Image as ImageIcon,
  GitFork,
  MessageSquare,
  TextCursorInput,
  Camera,
  ScanBarcode,
} from 'lucide-react';

interface NodePreviewTooltipProps {
  node: Node | null;
  mousePosition: { x: number; y: number };
  onDismiss: () => void;
}

export function NodePreviewTooltip({ node, mousePosition, onDismiss }: NodePreviewTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node) {
      setVisible(false);
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [node]);

  // Position calculation
  useEffect(() => {
    if (!visible || !node) return;

    const tooltipWidth = 280;
    const tooltipHeight = 320;
    const padding = 16;

    let x = mousePosition.x + 16;
    let y = mousePosition.y - 20;

    // Clamp to viewport
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = mousePosition.x - tooltipWidth - 16;
    }
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = window.innerHeight - tooltipHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    if (x < padding) {
      x = padding;
    }

    setPosition({ x, y });
  }, [visible, mousePosition, node]);

  if (!node || !visible) return null;

  const data = node.data as any;

  // Skip for start nodes (minimal content)
  if (node.type === 'start') return null;

  // Skip for note nodes
  if (node.type === 'note') return null;

  const title = data.title || data.label || 'Untitled';
  const description = data.description || '';
  const media = data.media || [];
  const options = data.options || [];
  const popups = data.popups || [];
  const isInput = data.isInput;
  const inputType = data.inputType;

  // Logic node info
  const isLogic = node.type === 'logic';
  const logicType = data.logicType;
  const platforms = data.platforms || [];

  const getInputIcon = () => {
    switch (inputType) {
      case 'picture': return <Camera size={10} />;
      case 'barcode': return <ScanBarcode size={10} />;
      default: return <TextCursorInput size={10} />;
    }
  };

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[200] rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        maxHeight: '360px',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="font-bold text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
          {title}
        </div>
        {description && (
          <div
            className="text-xs mt-1 leading-relaxed"
            style={{
              color: 'var(--muted)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="flex flex-col">
        {/* Logic node type info */}
        {isLogic && (
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <GitFork size={12} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
              {logicType === 'platform-switch' ? `Platform Switch (${platforms.length})` :
               logicType === 'procedure-link' ? 'Procedure Link' :
               'Object Target'}
            </span>
          </div>
        )}

        {/* Media */}
        {media.length > 0 && (
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <ImageIcon size={12} style={{ color: 'var(--primary)' }} />
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>
              {media.length} media file{media.length !== 1 ? 's' : ''} attached
            </span>
          </div>
        )}

        {/* Options/branches */}
        {options.length > 1 && (
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <GitFork size={12} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                {options.length} branches
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {options.slice(0, 4).map((opt: any, idx: number) => (
                <div
                  key={opt.id || idx}
                  className="text-[10px] px-2 py-0.5 rounded truncate"
                  style={{
                    backgroundColor: 'rgba(47, 128, 237, 0.08)',
                    color: 'var(--primary)',
                  }}
                >
                  {idx + 1}. {opt.text}
                </div>
              ))}
              {options.length > 4 && (
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  +{options.length - 4} more...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input requirement */}
        {isInput && (
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            {getInputIcon()}
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>
              Requires {inputType === 'picture' ? 'photo capture' : inputType === 'barcode' ? 'barcode scan' : 'text input'}
            </span>
          </div>
        )}

        {/* Popup notices */}
        {popups.length > 0 && (
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <MessageSquare size={12} style={{ color: '#f59e0b' }} />
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>
              {popups.length} popup notice{popups.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
