import { useRole, hasAccess } from '../../contexts/RoleContext';

export function ArchivePage() {
  const { currentRole } = useRole();
  const canPermanentlyDelete = hasAccess(currentRole, 'archive-delete');
  const archivedItems = [
    { id: 1, name: 'Legacy Project Alpha', type: 'Project', archivedDate: 'Jan 15, 2025' },
    { id: 2, name: 'Old Marketing Campaign', type: 'Project', archivedDate: 'Dec 28, 2024' },
    { id: 3, name: 'Q3 2024 Reports', type: 'Document', archivedDate: 'Dec 10, 2024' },
    { id: 4, name: 'Beta Testing Notes', type: 'Document', archivedDate: 'Nov 22, 2024' },
    { id: 5, name: 'Deprecated API Docs', type: 'Document', archivedDate: 'Nov 5, 2024' },
  ];

  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-foreground mb-1">Archive</h3>
        <p className="text-xs text-muted">Browse archived items and projects</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search archive..."
          className="flex-1 px-3 py-2 bg-background border border-border rounded-[var(--radius)] text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select className="px-3 py-2 bg-background border border-border rounded-[var(--radius)] text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>All Types</option>
          <option>Projects</option>
          <option>Documents</option>
        </select>
      </div>

      <div className="bg-background rounded-[var(--radius)] border border-border overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_150px_150px_200px] min-w-[500px] gap-3 px-4 py-2.5 border-b border-border bg-card">
          <div className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Name
          </div>
          <div className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Type
          </div>
          <div className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Archived Date
          </div>
          <div className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Actions
          </div>
        </div>

        {/* Table Rows */}
        {archivedItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_150px_150px_200px] min-w-[500px] gap-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-secondary/10 transition-colors"
          >
            <div className="text-xs text-foreground">{item.name}</div>
            <div className="text-xs text-muted">{item.type}</div>
            <div className="text-xs text-muted">{item.archivedDate}</div>
            <div className="text-xs flex items-center gap-3">
              <button className="px-3 py-2 text-primary hover:underline">Restore</button>
              {canPermanentlyDelete && (
                <button className="px-3 py-2 text-destructive hover:underline">Delete forever</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
