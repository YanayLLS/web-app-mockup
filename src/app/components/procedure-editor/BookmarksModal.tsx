import { Search, Star, ChevronRight, GripVertical, X, Bookmark, FolderClosed } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BookmarksModalProps {
  onClose: () => void;
}

interface BookmarkItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  isFavorite?: boolean;
  children?: BookmarkItem[];
}

const mockBookmarks: BookmarkItem[] = [
  {
    id: '1',
    name: 'Spare Parts Overview',
    type: 'file',
    isFavorite: true
  },
  {
    id: '2',
    name: 'API Reference',
    type: 'file',
    isFavorite: true
  },
  {
    id: '3',
    name: 'Spare Parts Overview',
    type: 'file',
    isFavorite: false
  },
  {
    id: '4',
    name: 'Documentation Hub',
    type: 'file',
    isFavorite: false
  },
  {
    id: '5',
    name: 'Project Resources',
    type: 'folder',
    isFavorite: false,
    children: [
      { id: '5-1', name: 'Team Guidelines', type: 'file' },
      { id: '5-2', name: 'API Reference', type: 'file', isFavorite: true }
    ]
  }
];

function BookmarkIcon({ isFavorite, className }: { isFavorite?: boolean; className?: string }) {
  if (isFavorite) {
    return (
      <div className={`relative shrink-0 ${className || 'size-[24px]'}`}>
        <Bookmark className="size-full text-foreground" strokeWidth={1.5} />
        <Star className="absolute -top-[2px] -right-[2px] size-[11px] text-foreground fill-foreground" strokeWidth={2} />
      </div>
    );
  }
  return (
    <Bookmark className={`shrink-0 text-foreground opacity-60 ${className || 'size-[18px]'}`} strokeWidth={1.5} />
  );
}

export function BookmarksModal({ onClose }: BookmarksModalProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['5']));

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const filteredBookmarks = mockBookmarks.filter(bookmark =>
    bookmark.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = filteredBookmarks.filter(b => b.isFavorite);
  const nonFavorites = filteredBookmarks;

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscKey);
    searchInputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  const renderBookmarkRow = (bookmark: BookmarkItem, indented = false) => (
    <button
      key={bookmark.id}
      className="flex items-center gap-[8px] px-[10px] min-h-[44px] rounded-[8px] cursor-pointer group w-full text-left hover:bg-secondary/30"
    >
      <BookmarkIcon isFavorite={bookmark.isFavorite} />
      <span className="flex-1 text-foreground text-[14px] font-normal leading-[21px] truncate">
        {bookmark.name}
      </span>
    </button>
  );

  const renderFolderRow = (bookmark: BookmarkItem) => {
    const isExpanded = expandedFolders.has(bookmark.id);
    const hasChildren = bookmark.children && bookmark.children.length > 0;

    return (
      <div key={bookmark.id}>
        <button
          className="flex items-center gap-[6px] px-[10px] min-h-[44px] rounded-[8px] cursor-pointer group w-full text-left hover:bg-secondary/30"
          onClick={() => toggleFolder(bookmark.id)}
        >
          <ChevronRight
            className={`size-[12px] text-foreground shrink-0 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            strokeWidth={2}
          />
          <FolderClosed className="size-[20px] text-foreground shrink-0" strokeWidth={1.5} />
          <span className="flex-1 text-foreground text-[14px] font-normal leading-[21px] truncate">
            {bookmark.name}
          </span>
        </button>

        {isExpanded && hasChildren && (
          <div className="pl-[28px]">
            {bookmark.children!.map((child) => renderBookmarkRow(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative bg-card rounded-[14px] w-full max-w-[min(520px,calc(100vw-32px))] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.3)] flex flex-col h-[700px] max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-title"
      >
        {/* Header */}
        <div className="flex items-center gap-[12px] px-4 sm:px-[20px] h-[54px] shrink-0 border-b-2 border-border">
          <GripVertical className="size-[20px] text-foreground opacity-40 cursor-grab shrink-0 hidden sm:block" strokeWidth={2} />
          <h2 id="bookmarks-title" className="text-foreground text-[20px] sm:text-[24px] font-bold flex-1 leading-[36px]">
            Bookmarks
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:opacity-60 transition-opacity shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close bookmarks"
          >
            <X className="size-[16px]" strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b-2 border-border px-4 sm:px-[20px]" role="tablist">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 min-h-[44px] text-[14px] text-center border-b-2 -mb-[2px] cursor-pointer transition-colors ${
              activeTab === 'my'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeTab === 'my'}
          >
            My Bookmarks
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 min-h-[44px] text-[14px] text-center border-b-2 -mb-[2px] cursor-pointer transition-colors ${
              activeTab === 'public'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeTab === 'public'}
          >
            Public bookmarks
          </button>
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-[8px] min-h-[44px] shrink-0 px-4 sm:px-[20px] mt-[16px]">
          <div className="flex-1 h-full bg-card border-2 border-border rounded-[8px] focus-within:border-primary">
            <div className="flex items-center h-full px-[14px] gap-[10px]">
              <Search className="size-[16px] text-muted shrink-0" strokeWidth={2} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks..."
                className="flex-1 bg-transparent outline-none text-foreground text-[14px] placeholder:text-muted"
                aria-label="Search bookmarks"
              />
            </div>
          </div>
          <button
            className="flex items-center justify-center shrink-0 size-[44px] rounded-[8px] bg-secondary shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] cursor-pointer hover:opacity-80"
            aria-label="Create new folder"
          >
            <FolderClosed className="size-[18px] text-foreground" strokeWidth={1.5} />
          </button>
          <button
            className="flex items-center justify-center shrink-0 size-[44px] rounded-[8px] bg-primary shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] cursor-pointer hover:opacity-80"
            aria-label="Add new bookmark"
          >
            <Bookmark className="size-[14px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* Bookmarks List Container */}
        <div className="flex-1 min-h-0 px-4 sm:px-[20px] mt-[16px] mb-[20px]">
          <div className="flex flex-col h-full border border-border rounded-[10px] bg-card">
            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto p-[6px]"
              role="tabpanel"
              id={`${activeTab}-bookmarks-panel`}
            >
              {filteredBookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-foreground text-[14px] font-bold text-center">
                    {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
                  </p>
                  <p className="text-muted text-[14px] text-center mt-[6px]">
                    {searchQuery ? 'Try adjusting your search' : 'Create your first bookmark to get started'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Favorites Section */}
                  {favorites.length > 0 && !searchQuery && (
                    <div className="mb-[4px]">
                      <div className="flex items-center gap-[8px] h-[43px] px-[10px]">
                        <Star className="size-[16px] text-foreground fill-foreground shrink-0" />
                        <span className="text-foreground text-[18px] font-bold">Favorites</span>
                      </div>
                      {favorites.map((bookmark) => renderBookmarkRow(bookmark))}
                      <div className="h-px bg-border my-[6px]" />
                    </div>
                  )}

                  {/* All Bookmarks */}
                  {nonFavorites.map((bookmark) =>
                    bookmark.type === 'folder'
                      ? renderFolderRow(bookmark)
                      : renderBookmarkRow(bookmark)
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center h-[34px] shrink-0 border-t border-border">
              <p className="text-muted text-[14px] text-center">
                Hold Ctrl (⌘ on Mac) to select multiple items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
