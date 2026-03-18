import { useState } from 'react';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { FolderOpen, FileText, RotateCcw, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function ArchivePage() {
  const { currentRole } = useRole();
  const canPermanentlyDelete = hasAccess(currentRole, 'archive-delete');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const archivedItems = [
    { id: 1, name: 'Legacy Project Alpha', type: 'Project' as const, archivedDate: 'Jan 15, 2025' },
    { id: 2, name: 'Old Marketing Campaign', type: 'Project' as const, archivedDate: 'Dec 28, 2024' },
    { id: 3, name: 'Q3 2024 Reports', type: 'Document' as const, archivedDate: 'Dec 10, 2024' },
    { id: 4, name: 'Beta Testing Notes', type: 'Document' as const, archivedDate: 'Nov 22, 2024' },
    { id: 5, name: 'Deprecated API Docs', type: 'Document' as const, archivedDate: 'Nov 5, 2024' },
  ];

  const filtered = archivedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeIcon = (type: string) => {
    if (type === 'Project') return <FolderOpen size={18} />;
    return <FileText size={18} />;
  };

  const typeColor = (type: string) => {
    if (type === 'Project') return { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' };
    return { bg: 'rgba(47,128,237,0.1)', color: '#2F80ED' };
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-foreground mb-1">Archive</h3>
        <p className="text-xs text-muted">Browse and restore archived items and projects</p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border rounded-lg focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search archive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none ring-0 border-none placeholder:text-muted focus:outline-none focus:ring-0"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          style={{ fontWeight: 'var(--font-weight-medium)' }}
        >
          <option value="all">All Types</option>
          <option value="project">Projects</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Items count */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] text-muted" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} in archive
        </span>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-center mb-5">
              <FolderOpen size={28} className="text-muted/40" />
            </div>
            <p className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              No archived items found
            </p>
            <p className="text-xs text-muted max-w-[240px]">
              {searchQuery ? `No items matching "${searchQuery}"` : 'Items you archive will appear here'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const tc = typeColor(item.type);
            return (
              <div
                key={item.id}
                className="group flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card hover:border-border/80 hover:shadow-sm transition-all"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: tc.bg, color: tc.color }}
                >
                  {typeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted">{item.type}</span>
                    <span className="text-muted/30">·</span>
                    <span className="text-[11px] text-muted">Archived {item.archivedDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toast.success(`"${item.name}" restored`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-lg transition-all"
                    style={{ fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    <RotateCcw size={12} />
                    Restore
                  </button>
                  {canPermanentlyDelete && (
                    <button
                      onClick={() => toast.success(`"${item.name}" deleted permanently`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/15 rounded-lg transition-all"
                      style={{ fontWeight: 'var(--font-weight-medium)' }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
