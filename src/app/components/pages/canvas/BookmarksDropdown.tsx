import { useState, useRef, useEffect } from 'react';
import { Bookmark, X, Plus, MapPin } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

export interface CanvasBookmark {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
  createdAt: number;
}

interface BookmarksDropdownProps {
  bookmarks: CanvasBookmark[];
  onAddBookmark: (name: string) => void;
  onGoToBookmark: (bookmark: CanvasBookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

export function BookmarksDropdown({
  bookmarks,
  onAddBookmark,
  onGoToBookmark,
  onDeleteBookmark,
}: BookmarksDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside([dropdownRef, buttonRef], () => {
    setIsOpen(false);
    setIsAdding(false);
    setNewName('');
  }, isOpen);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddBookmark(name);
    setNewName('');
    setIsAdding(false);
  };

  const canAdd = bookmarks.length < 10;

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isOpen ? 'bg-secondary' : 'hover:bg-secondary'
        }`}
        title="Bookmarks"
      >
        <Bookmark className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        {bookmarks.length > 0 && (
          <div
            className="absolute right-0.5 top-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--primary)',
              fontSize: '9px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1,
            }}
          >
            {bookmarks.length}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 right-0 rounded-lg border z-[100] min-w-[240px] max-w-[320px] overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-lg)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Bookmarks
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}>
              {bookmarks.length} / 10
            </span>
          </div>

          {/* Bookmark list */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {bookmarks.length === 0 && !isAdding && (
              <div className="px-4 py-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
                No bookmarks yet.
                <br />
                Save viewport positions for quick access.
              </div>
            )}

            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="flex items-center gap-2 px-3 py-2 group hover:bg-secondary/60 transition-colors cursor-pointer"
                onClick={() => {
                  onGoToBookmark(bm);
                  setIsOpen(false);
                }}
              >
                <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)' }}>
                  {bm.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bm.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all shrink-0"
                  title="Delete bookmark"
                >
                  <X size={12} style={{ color: 'var(--destructive, #FF1F1F)' }} />
                </button>
              </div>
            ))}

            {/* Add bookmark form */}
            {isAdding && (
              <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.slice(0, 40))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewName('');
                    }
                  }}
                  placeholder="Bookmark name..."
                  className="flex-1 text-xs bg-transparent border-b outline-none py-1"
                  style={{
                    borderBottomColor: 'var(--primary)',
                    color: 'var(--foreground)',
                  }}
                  maxLength={40}
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-30"
                  style={{ color: 'var(--primary)' }}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Add button */}
          {!isAdding && canAdd && (
            <div className="border-t px-2 py-2" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded transition-colors hover:bg-secondary/60"
                style={{ color: 'var(--primary)' }}
              >
                <Plus size={14} />
                Add Bookmark
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
