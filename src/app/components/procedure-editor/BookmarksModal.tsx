import { X, Search, Plus, Star, File, Folder, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BookmarksModalProps {
  onClose: () => void;
}

interface Bookmark {
  id: string;
  name: string;
  type: 'file' | 'folder';
  isFavorite?: boolean;
  children?: Bookmark[];
}

const mockBookmarks: Bookmark[] = [
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
    name: 'Troubleshooting Guide',
    type: 'file',
    isFavorite: false
  },
  {
    id: '4',
    name: 'Documentation Hub',
    type: 'folder',
    isFavorite: false,
    children: []
  },
  {
    id: '5',
    name: 'Project Resources',
    type: 'folder',
    isFavorite: false,
    children: [
      { id: '5-1', name: 'Team Guidelines', type: 'file' },
      { id: '5-2', name: 'Design Specs', type: 'file' }
    ]
  }
];

export function BookmarksModal({ onClose }: BookmarksModalProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
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
  const others = filteredBookmarks.filter(b => !b.isFavorite);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    window.addEventListener('keydown', handleEscKey);
    
    // Focus search input
    searchInputRef.current?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className="relative bg-card rounded-lg w-full max-w-[520px] shadow-elevation-sm max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 id="bookmarks-title" className="text-card-foreground">Bookmarks</h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close bookmarks"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4" role="tablist">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-3 relative ${
              activeTab === 'my'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeTab === 'my'}
            aria-controls="my-bookmarks-panel"
          >
            My Bookmarks
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-3 relative ${
              activeTab === 'public'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted hover:text-foreground'
            }`}
            role="tab"
            aria-selected={activeTab === 'public'}
            aria-controls="public-bookmarks-panel"
          >
            Public bookmarks
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2 pr-20 text-foreground outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search bookmarks"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button 
                className="p-1 hover:bg-secondary/50 rounded"
                aria-label="Search"
              >
                <Search className="size-4 text-muted" />
              </button>
              <button 
                className="bg-primary p-1 rounded hover:opacity-90"
                aria-label="Add new bookmark"
              >
                <Plus className="size-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        <div 
          className="flex-1 overflow-y-auto px-4 pb-4"
          role="tabpanel"
          id={`${activeTab}-bookmarks-panel`}
        >
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <File className="size-16 mx-auto mb-3 text-muted" />
              <p className="text-muted">
                {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
              </p>
              <p className="text-muted text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'Add bookmarks to get started'}
              </p>
            </div>
          ) : (
            <>
              {/* Favorites Section */}
              {favorites.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="size-4 text-primary fill-primary" />
                    <h4 className="text-card-foreground font-bold">Favorites</h4>
                  </div>
                  <div className="space-y-1">
                    {favorites.map((bookmark) => (
                      <button
                        key={bookmark.id}
                        className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer group w-full text-left"
                      >
                        <File className="size-4 text-primary" />
                        <span className="flex-1 text-card-foreground">{bookmark.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Bookmarks */}
              {others.length > 0 && (
                <div className="space-y-1">
                  {others.map((bookmark) => (
                    <div key={bookmark.id}>
                      <button
                        className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer group w-full text-left"
                        onClick={() => bookmark.type === 'folder' && toggleFolder(bookmark.id)}
                      >
                        {bookmark.type === 'folder' ? (
                          <>
                            <ChevronRight 
                              className={`size-4 text-muted transition-transform ${
                                expandedFolders.has(bookmark.id) ? 'rotate-90' : ''
                              }`}
                            />
                            <Folder className="size-4 text-muted" />
                          </>
                        ) : (
                          <File className="size-4 text-muted ml-4" />
                        )}
                        <span className="flex-1 text-card-foreground">{bookmark.name}</span>
                      </button>
                      
                      {bookmark.type === 'folder' && expandedFolders.has(bookmark.id) && bookmark.children && (
                        <div className="ml-8 mt-1 space-y-1">
                          {bookmark.children.map((child) => (
                            <button
                              key={child.id}
                              className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer w-full text-left"
                            >
                              <File className="size-4 text-muted" />
                              <span className="text-card-foreground">{child.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-muted text-sm text-center">
            Hold Ctrl/⌘ to select multiple items
          </p>
        </div>
      </div>
    </div>
  );
}
