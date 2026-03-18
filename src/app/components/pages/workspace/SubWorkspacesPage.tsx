import { useState } from 'react';
import { Plus, MoreVertical, FolderOpen, Users, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface SubWorkspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
  color: string;
  initial: string;
}

const mockSubWorkspaces: SubWorkspace[] = [
  { id: '1', name: 'Engineering', description: 'Development and technical projects', memberCount: 24, projectCount: 12, color: '#2F80ED', initial: 'E' },
  { id: '2', name: 'Design', description: 'UI/UX and creative work', memberCount: 8, projectCount: 6, color: '#8B5CF6', initial: 'D' },
  { id: '3', name: 'Marketing', description: 'Marketing campaigns and content', memberCount: 15, projectCount: 9, color: '#F59E0B', initial: 'M' },
];

export function SubWorkspacesPage() {
  const [subWorkspaces] = useState<SubWorkspace[]>(mockSubWorkspaces);
  const totalMembers = subWorkspaces.reduce((s, w) => s + w.memberCount, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-1" style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              Sub-Workspaces
            </h1>
            <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
              Organize teams and projects into separate sub-workspaces
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
              <Layers size={13} className="text-primary" />
              <span className="text-[11px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {subWorkspaces.length} workspaces · {totalMembers} members
              </span>
            </div>
            <button
              onClick={() => toast.success('Create sub-workspace dialog opened')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Plus size={16} />
              <span>Create Sub-Workspace</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {subWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
            >
              {/* Color top accent bar */}
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${workspace.color}, ${workspace.color}80)` }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                    style={{ background: workspace.color, fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {workspace.initial}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toast.success(`${workspace.name} options`); }}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={16} className="text-muted" />
                  </button>
                </div>

                <h3 className="text-foreground text-sm mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {workspace.name}
                </h3>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  {workspace.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-muted/60" />
                    <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      {workspace.memberCount}
                    </span>
                    <span className="text-[10px] text-muted">members</span>
                  </div>
                  <div className="w-px h-3 bg-border/60" />
                  <div className="flex items-center gap-1.5">
                    <FolderOpen size={13} className="text-muted/60" />
                    <span className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      {workspace.projectCount}
                    </span>
                    <span className="text-[10px] text-muted">projects</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
