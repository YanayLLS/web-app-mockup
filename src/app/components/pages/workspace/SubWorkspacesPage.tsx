import { useState } from 'react';
import { Plus, MoreVertical, FolderOpen, Users } from 'lucide-react';

interface SubWorkspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
}

const mockSubWorkspaces: SubWorkspace[] = [
  { id: '1', name: 'Engineering', description: 'Development and technical projects', memberCount: 24, projectCount: 12 },
  { id: '2', name: 'Design', description: 'UI/UX and creative work', memberCount: 8, projectCount: 6 },
  { id: '3', name: 'Marketing', description: 'Marketing campaigns and content', memberCount: 15, projectCount: 9 },
];

export function SubWorkspacesPage() {
  const [subWorkspaces] = useState<SubWorkspace[]>(mockSubWorkspaces);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Sub-Workspaces
        </h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
          Organize teams and projects into separate sub-workspaces
        </p>
      </div>

      <div className="border-b border-border bg-card px-4 sm:px-6 py-3">
        <button className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors" style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          <Plus size={16} />
          <span>Create Sub-Workspace</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subWorkspaces.map((workspace) => (
            <div key={workspace.id} className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-5 hover:border-primary/50 transition-colors" style={{ boxShadow: 'var(--elevation-sm)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center">
                  <FolderOpen size={20} className="text-primary" />
                </div>
                <button className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors">
                  <MoreVertical size={18} className="text-muted" />
                </button>
              </div>
              <h3 className="text-foreground mb-2" style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                {workspace.name}
              </h3>
              <p className="text-muted mb-4" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                {workspace.description}
              </p>
              <div className="flex items-center gap-4 text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{workspace.memberCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderOpen size={14} />
                  <span>{workspace.projectCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
