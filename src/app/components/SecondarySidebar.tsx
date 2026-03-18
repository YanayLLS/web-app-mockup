import { ChevronLeft } from 'lucide-react';
import svgPaths from "../../imports/svg-albmkprcym";
import { useProject } from '../contexts/ProjectContext';
import { useState } from 'react';
import { hasAccess, useRole } from '../contexts/RoleContext';

interface SecondarySidebarProps {
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onClose: () => void;
}

function IconAdd() {
  return (
    <svg className="block w-[9.8px] h-[9.8px]" fill="none" viewBox="0 0 9.8 9.8">
      <path d={svgPaths.p10b9600} fill="currentColor" />
    </svg>
  );
}

export function SecondarySidebar({
  selectedProject,
  onProjectSelect,
  onClose,
}: SecondarySidebarProps) {
  const { currentRole } = useRole();
  const { projects, setCurrentProject } = useProject();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  
  const canCreateNewProject = hasAccess(currentRole, 'project-create');

  return (
    <div className="h-full flex flex-col bg-sidebar" role="navigation" aria-label="Project navigation">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
          Projects
        </h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-lg"
          aria-label="Close project navigation"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      
      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {projects.map((project) => {
            const isActive = selectedProject === project.id;
            return (
              <button
                key={project.id}
                onClick={() => {
                  onProjectSelect(project.id);
                  setCurrentProject(project.id);
                  onClose();
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-secondary text-foreground shadow-sm'
                    : 'text-foreground hover:bg-secondary hover:translate-x-[2px]'
                }`}
                style={{ fontSize: 'var(--text-sm)' }}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* New Project Button */}
      {canCreateNewProject && (
        <div className="px-3 py-3 border-t border-border">
          <button 
            onClick={() => {
              onClose();
              setShowNewProjectModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all duration-200"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <div className="w-4 h-4">
              <IconAdd />
            </div>
            <span>New Project</span>
          </button>
        </div>
      )}
    </div>
  );
}
