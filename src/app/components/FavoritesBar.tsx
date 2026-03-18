import { useState, useRef, useEffect } from 'react';
import { X, FileText, Video, File, Star, Pencil } from 'lucide-react';
import { useFavorites, FavoriteItem } from '../contexts/FavoritesContext';
import { useToast } from '../contexts/ToastContext';
import { useRole } from '../contexts/RoleContext';

interface FavoritesBarProps {
  onFavoriteClick: (item: FavoriteItem) => void;
}

function getIconForType(type: 'article' | 'video' | 'document' | 'procedure' | 'media') {
  switch (type) {
    case 'article': return <FileText size={13} />;
    case 'video': return <Video size={13} />;
    case 'document': return <File size={13} />;
    case 'procedure': return <FileText size={13} />;
    case 'media': return <Video size={13} />;
    default: return <FileText size={13} />;
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

  if (favorites.length === 0) return null;

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

  const cancelRename = () => setEditingId(null);

  return (
    <div className="w-full px-4 py-1.5 flex items-center gap-2.5 overflow-x-auto custom-scrollbar border-b border-border/60">
      {/* Label */}
      <div className="flex items-center gap-1.5 shrink-0 text-muted">
        <Star size={13} className="text-[#F59E0B]" />
        <span className="text-xs" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Shortcuts</span>
      </div>

      {/* Items */}
      <div className="flex items-center flex-nowrap gap-1.5">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/40 border border-transparent hover:bg-secondary hover:border-border/60 transition-all shrink-0"
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
                  className="outline-none border border-primary bg-card rounded-md px-2 py-0.5 text-foreground focus:ring-2 focus:ring-primary/10 transition-all"
                  style={{
                    fontSize: '12px',
                    width: `${Math.max(60, editValue.length * 7.5)}px`,
                    maxWidth: '200px',
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => onFavoriteClick(item)}
                onDoubleClick={isGuest ? undefined : (e) => startRename(item, e)}
                className="relative flex items-center gap-1.5 text-foreground transition-colors text-xs"
                title={isGuest ? 'Click to open' : 'Click to open, double-click to rename'}
              >
                <span className="text-muted">{getIconForType(item.type)}</span>
                <span className="max-w-[150px] truncate">{item.customName || item.name}</span>
                {/* Actions on hover */}
                {!isGuest && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-secondary rounded pl-1">
                    <span
                      onClick={(e) => { e.stopPropagation(); startRename(item, e); }}
                      className="p-0.5 rounded hover:bg-primary/10 cursor-pointer text-muted hover:text-primary transition-colors"
                      title="Rename shortcut"
                    >
                      <Pencil size={11} />
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(item.id);
                        showToast(`Removed "${item.customName || item.name}" from shortcuts`);
                      }}
                      className="p-0.5 rounded hover:bg-destructive/10 cursor-pointer text-muted hover:text-destructive transition-colors"
                      title="Remove shortcut"
                    >
                      <X size={11} />
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
