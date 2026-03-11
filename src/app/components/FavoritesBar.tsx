import { useState, useRef, useEffect } from 'react';
import { X, FileText, Video, File, Star, Pencil, Check } from 'lucide-react';
import { useFavorites, FavoriteItem } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { useRole } from '../contexts/RoleContext';

interface FavoritesBarProps {
  onFavoriteClick: (item: FavoriteItem) => void;
}

function getIconForType(type: 'article' | 'video' | 'document' | 'procedure' | 'media') {
  switch (type) {
    case 'article':
      return <FileText size={14} />;
    case 'video':
      return <Video size={14} />;
    case 'document':
      return <File size={14} />;
    case 'procedure':
      return <FileText size={14} />;
    case 'media':
      return <Video size={14} />;
    default:
      return <FileText size={14} />;
  }
}

export function FavoritesBar({ onFavoriteClick }: FavoritesBarProps) {
  const { favorites, removeFavorite, renameFavorite } = useFavorites();
  const { showToast } = useToast();
  const { currentRole } = useRole();
  const isGuest = currentRole === 'guest';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Don't render if no favorites
  if (favorites.length === 0) {
    return null;
  }

  const startRename = (item: FavoriteItem, e?: React.MouseEvent) => {
    if (isGuest) return;
    e?.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.customName || item.name);
  };

  const commitRename = (id: string) => {
    if (editValue.trim()) {
      renameFavorite(id, editValue.trim());
      showToast('Shortcut renamed');
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <div
      className="w-full px-4 py-1.5 flex items-center gap-2 overflow-x-auto custom-scrollbar"
      style={{
        fontFamily: 'var(--font-family)',
        borderBottom: '1px solid var(--border-color, #E9E9E9)',
      }}
    >
      <div className="flex items-center gap-1 shrink-0" style={{ color: '#868D9E' }}>
        <Star size={14} />
        <span style={{ fontSize: '12px', fontWeight: 500 }}>Shortcuts</span>
      </div>
      <div className="flex items-center flex-nowrap gap-1.5">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 shrink-0"
            style={{
              background: 'var(--panel-bg, #F5F5F5)',
              border: '1px solid transparent',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--panel-selected, #D9E0F0)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color, #C2C9DB)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--panel-bg, #F5F5F5)';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            }}
          >
            {editingId === item.id ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(item.id);
                    if (e.key === 'Escape') cancelRename();
                  }}
                  onBlur={() => commitRename(item.id)}
                  className="outline-none border-2 border-primary bg-white rounded px-1.5 py-0.5"
                  style={{
                    fontSize: '13px',
                    width: `${Math.max(60, editValue.length * 8)}px`,
                    maxWidth: '200px',
                    borderColor: '#2F80ED',
                    color: '#36415D',
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => onFavoriteClick(item)}
                onDoubleClick={isGuest ? undefined : (e) => startRename(item, e)}
                className="relative flex items-center gap-1.5 transition-colors"
                style={{ color: '#36415D' }}
                title={isGuest ? "Click to open" : "Click to open, double-click to rename"}
              >
                <span style={{ color: '#868D9E' }}>
                  {getIconForType(item.type)}
                </span>
                <span className="max-w-[150px] truncate">
                  {item.customName || item.name}
                </span>
                {/* Overlay actions on hover — hidden for guests */}
                {!isGuest && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-[var(--panel-selected,#D9E0F0)] rounded pl-1">
                  <span
                    onClick={(e) => { e.stopPropagation(); startRename(item, e); }}
                    className="p-0.5 rounded hover:bg-black/10 cursor-pointer"
                    style={{ color: '#868D9E' }}
                    title="Rename shortcut"
                  >
                    <Pencil size={12} />
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(item.id);
                      showToast(`Removed "${item.customName || item.name}" from shortcuts`);
                    }}
                    className="p-0.5 rounded hover:bg-destructive/10 cursor-pointer"
                    style={{ color: '#868D9E' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--destructive)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#868D9E'; }}
                    title="Remove shortcut"
                  >
                    <X size={12} />
                  </span>
                </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
