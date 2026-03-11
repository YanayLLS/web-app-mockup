export function ProjectOverviewPage() {
  return (
    <div className="p-3 sm:p-4">
      <div className="mb-4">
        <h3 className="text-foreground mb-1">Project Overview</h3>
        <p className="text-xs text-muted">View high-level information and status of your project</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-background border border-border rounded-[var(--radius)]">
          <p className="text-xs text-muted mb-1">Total Tasks</p>
          <p className="text-2xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>42</p>
        </div>
        <div className="p-4 bg-background border border-border rounded-[var(--radius)]">
          <p className="text-xs text-muted mb-1">Completed</p>
          <p className="text-2xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>28</p>
        </div>
        <div className="p-4 bg-background border border-border rounded-[var(--radius)]">
          <p className="text-xs text-muted mb-1">In Progress</p>
          <p className="text-2xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>14</p>
        </div>
      </div>

      <div className="p-4 bg-background border border-border rounded-[var(--radius)] mb-4">
        <h4 className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Project Progress
        </h4>
        <div className="w-full bg-secondary rounded-full h-2 mb-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
        </div>
        <p className="text-xs text-muted">67% Complete</p>
      </div>

      <div className="p-4 bg-background border border-border rounded-[var(--radius)]">
        <h4 className="text-sm text-foreground mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Recent Activity
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-foreground">Task "Design Review" completed</p>
              <p className="text-muted">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-foreground">New document "API Specifications" added</p>
              <p className="text-muted">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-foreground">Team member Sarah joined the project</p>
              <p className="text-muted">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
