import { useEffect, useRef } from 'react';
import {
  Copy, Scissors, CopyPlus, MessageSquare, BookmarkPlus, Trash2,
  Layers, MousePointer2, LayoutGrid, StickyNote, GitBranch, Box
} from 'lucide-react';

export enum ContextMenuType {
  CANVAS_ROOT = 'canvas',
  CONNECTION_CREATE = 'connection',
  NODE = 'node',
  MULTI_SELECT = 'multi-select',
}

interface ContextMenuProps {
  x: number;
  y: number;
  type: ContextMenuType;
  onClose: () => void;
  onAction: (action: string) => void;
  nodeData?: any;
  selectedCount?: number;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider select-none"
      style={{ color: 'var(--muted)' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />;
}

function MenuItem({
  label,
  shortcut,
  danger,
  onClick,
  sub,
  icon: Icon,
}: {
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick: () => void;
  sub?: string;
  icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-1.5 text-[13px] transition-colors canvas-menu-item flex items-center gap-3 focus:outline-none focus:bg-[var(--secondary)]"
      style={{ color: danger ? 'var(--destructive)' : 'var(--foreground)' }}
    >
      {/* #53 — Icons on menu items */}
      {Icon && <Icon size={14} style={{ color: danger ? 'var(--destructive)' : 'var(--muted)', flexShrink: 0 }} />}
      <span className="flex-1 min-w-0">
        {label}
        {sub && (
          <span className="block text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
            {sub}
          </span>
        )}
      </span>
      {shortcut && (
        <span className="text-[11px] shrink-0" style={{ color: 'var(--muted)' }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}

export function ContextMenu({ x, y, type, onClose, onAction, nodeData, selectedCount }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuWidth = 280;
  const menuHeight = 380;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

  const menuStyle = {
    left: `${Math.max(8, clampedX)}px`,
    top: `${Math.max(8, clampedY)}px`,
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--elevation-lg)',
  };

  const menuClass =
    'fixed z-[100] rounded-lg border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-w-[min(320px,calc(100vw-1rem))]';

  // #56 — Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = menuRef.current?.querySelectorAll('button.canvas-menu-item');
        if (!items || items.length === 0) return;
        const focused = document.activeElement as HTMLElement;
        const idx = Array.from(items).indexOf(focused);
        let next: number;
        if (e.key === 'ArrowDown') {
          next = idx < items.length - 1 ? idx + 1 : 0;
        } else {
          next = idx > 0 ? idx - 1 : items.length - 1;
        }
        (items[next] as HTMLElement).focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus first item on open
  useEffect(() => {
    setTimeout(() => {
      const firstItem = menuRef.current?.querySelector('button.canvas-menu-item') as HTMLElement;
      firstItem?.focus();
    }, 50);
  }, []);

  // ── Multi-select context menu ──
  if (type === ContextMenuType.MULTI_SELECT && selectedCount && selectedCount > 1) {
    return (
      <div ref={menuRef} className={menuClass} style={menuStyle}>
        <div className="py-1">
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <MousePointer2 size={14} style={{ color: 'var(--primary)' }} />
              {selectedCount} Nodes Selected
            </div>
          </div>

          <SectionLabel>Clipboard</SectionLabel>
          <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={() => onAction('copy-selected')} />
          <MenuItem icon={Scissors} label="Cut" shortcut="Ctrl+X" onClick={() => onAction('cut-selected')} />
          <MenuItem icon={CopyPlus} label="Duplicate" shortcut="Ctrl+D" onClick={() => onAction('duplicate-selected')} />

          <Divider />
          <SectionLabel>Organize</SectionLabel>
          <MenuItem icon={Layers} label="Group into Section" onClick={() => onAction('group-selected')} />
          <MenuItem icon={MousePointer2} label="Select All" shortcut="Ctrl+A" onClick={() => onAction('select-all')} />

          <Divider />
          <MenuItem icon={Trash2} label={`Delete ${selectedCount} Nodes`} shortcut="Del" danger onClick={() => onAction('delete-selected')} />
        </div>
      </div>
    );
  }

  // ── Single node context menu ──
  if (type === ContextMenuType.NODE && nodeData) {
    const displayTitle =
      nodeData.title ||
      nodeData.label ||
      (nodeData.nodeType === 'note'
        ? 'Note'
        : nodeData.nodeType === 'logic'
          ? nodeData.logicType === 'platform-switch'
            ? 'Platform Switch'
            : nodeData.logicType === 'procedure-link'
              ? 'Procedure Link'
              : 'Object Target'
          : 'Node Details');

    return (
      <div ref={menuRef} className={menuClass} style={menuStyle}>
        <div className="py-1">
          {/* Node header */}
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
              {displayTitle}
            </div>
            {nodeData.description && (
              <div className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--muted)' }}>
                {nodeData.description}
              </div>
            )}
          </div>

          {/* Info sections (media / checklist / options) */}
          {nodeData.media && nodeData.media.length > 0 && (
            <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
                Attached Media ({nodeData.media.length})
              </div>
              <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                {nodeData.media.map((mediaId: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2 py-1 rounded text-[11px] border"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="flex-1 truncate">
                      {mediaId.startsWith('upload-') ? mediaId.replace(/^upload-\d+-/, '') : (mediaId.split('-').pop() || `Media ${idx + 1}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nodeData.options && nodeData.options.length > 1 && (
            <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted)' }}>
                Outputs ({nodeData.options.length})
              </div>
              <div className="flex flex-col gap-1">
                {nodeData.options.map((option: any, idx: number) => (
                  <div key={option.id} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                    <span style={{ color: 'var(--foreground)' }}>{option.text || `Option ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {nodeData.nodeType !== 'start' && (
            <>
              <SectionLabel>Actions</SectionLabel>
              <MenuItem icon={MessageSquare} label="Add Comment" onClick={() => onAction('add-comment')} />
              <MenuItem icon={CopyPlus} label="Duplicate Node" shortcut="Ctrl+D" onClick={() => onAction('duplicate')} />

              <Divider />
              <SectionLabel>Templates</SectionLabel>
              <MenuItem icon={BookmarkPlus} label="Save as Template" onClick={() => onAction('save-as-template')} />

              <Divider />
              <MenuItem icon={Trash2} label="Delete Node" shortcut="Del" danger onClick={() => onAction('delete')} />
            </>
          )}
          {nodeData.nodeType === 'start' && (
            <>
              <SectionLabel>Actions</SectionLabel>
              <MenuItem icon={MessageSquare} label="Add Comment" onClick={() => onAction('add-comment')} />
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Canvas root / connection-create context menu ──
  return (
    <div ref={menuRef} className={menuClass} style={menuStyle}>
      <div className="py-1 min-w-[240px]">
        <SectionLabel>Add Node</SectionLabel>
        <MenuItem icon={Box} label="Step Node" onClick={() => onAction('create-step')} />
        <MenuItem icon={StickyNote} label="Note" onClick={() => onAction('create-note')} />
        <MenuItem icon={GitBranch} label="Logic Node" onClick={() => onAction('create-logic')} />

        {type === ContextMenuType.CANVAS_ROOT && (
          <>
            <Divider />
            <SectionLabel>Layout</SectionLabel>
            <MenuItem icon={LayoutGrid} label="Auto Arrange" onClick={() => onAction('auto-arrange')} />

            <Divider />
            <SectionLabel>Organize</SectionLabel>
            <MenuItem icon={Layers} label="Group Selected" onClick={() => onAction('group-selected')} />
          </>
        )}

        {type === ContextMenuType.CONNECTION_CREATE && (
          <div className="px-4 py-1.5 text-[11px] flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            This will be connected automatically
          </div>
        )}
      </div>
    </div>
  );
}
