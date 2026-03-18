import { useState } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { Users, Palette, Headphones, Grid3x3, TrendingUp, Cloud, QrCode, Puzzle, ChevronDown, ChevronLeft, Folder, Search, Settings as SettingsIcon, PanelLeft, PanelLeftClose, Crown, HelpCircle } from 'lucide-react';
import { useRole, hasAccess } from '../contexts/RoleContext';
import { ProjectSettingsModal } from './modals/ProjectSettingsModal';
import { toast } from 'sonner';
import { useProject } from '../contexts/ProjectContext';
import { webNotifications } from './pages/NotificationsPage';
// Secondary sidebar that pushes content, resizable, with sidebar-like design v4

interface SidebarProps {
  selectedMenuItem: string;
  onMenuItemSelect: (item: string) => void;
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onBackToMain: () => void;
  isWorkspaceManagement: boolean;
  onToggleWorkspaceManagement: () => void;
  isMinimized: boolean;
  onToggleMinimized: () => void;
  isSecondarySidebarOpen: boolean;
  onToggleSecondarySidebar: (open: boolean) => void;
}

const mainMenuItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: webNotifications.filter(n => n.unread).length > 0 ? String(webNotifications.filter(n => n.unread).length) : undefined },
  { id: 'remote-support', label: 'Remote Support', icon: 'remote-support' },
  { id: 'ai-studio', label: 'AI Studio', icon: 'ai' },
  { id: 'archive', label: 'Archive', icon: 'archive' },
];

const workspaceManagementItems = [
  { id: 'ws-members', label: 'Members', icon: 'members' },
  { id: 'ws-groups', label: 'Groups', icon: 'members' },
  { id: 'ws-roles', label: 'Roles', icon: 'crown' },
  { id: 'ws-design', label: 'Workspace Design', icon: 'palette' },
  { id: 'ws-remote-support', label: 'Remote Support Settings', icon: 'headphones' },
  { id: 'ws-subworkspaces', label: 'Sub-Workspaces', icon: 'grid' },
  { id: 'ws-pay-per-click', label: 'Pay Per Click', icon: 'trending' },
  { id: 'ws-sso', label: 'SSO', icon: 'cloud' },
  { id: 'ws-qr-codes', label: 'Static QR codes', icon: 'qrcode' },
  { id: 'ws-integrations', label: 'Integrations', icon: 'puzzle' },
];

const projectMenuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' },
];

function IconHome() {
  return (
    <svg className="block w-5 h-[22.35px]" fill="none" viewBox="0 0 20 22.3529">
      <path d={svgPaths.p242897c0} fill="currentColor" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg className="block w-4 h-5" fill="none" viewBox="0 0 12 15">
      <path d={svgPaths.p20988100} fill="currentColor" />
    </svg>
  );
}

function IconRemoteSupport() {
  return (
    <svg className="block w-[17.42px] h-5" fill="none" viewBox="0 0 17.415 20">
      <path d={svgPaths.p2ac58860} fill="currentColor" />
    </svg>
  );
}

function IconAi() {
  return (
    <svg className="block w-[15px] h-[15px]" fill="none" viewBox="0 0 15 15">
      <g>
        <g />
        <path d={svgPaths.p1c242b80} fill="currentColor" />
      </g>
    </svg>
  );
}

function IconArchive() {
  return (
    <svg className="block w-5 h-5" fill="none" viewBox="0 0 20 20">
      <mask height="20" id="mask0_3_1248775" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="20" x="0" y="0">
        <rect fill="currentColor" height="20" width="20" />
      </mask>
      <g mask="url(#mask0_3_1248775)">
        <path d={svgPaths.p3a1e1900} fill="currentColor" />
      </g>
    </svg>
  );
}

function IconLogo() {
  return (
    <svg className="block w-6 h-6" fill="none" viewBox="0 0 24 24">
      <g>
        <path d={svgPaths.p2e071580} fill="currentColor" />
        <path d={svgPaths.p159c9f80} fill="currentColor" />
        <path d={svgPaths.p50fb500} fill="currentColor" />
        <path d={svgPaths.p1f65b900} fill="currentColor" />
      </g>
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="block w-[5.89px] h-2.5" fill="none" viewBox="0 0 5.8875 10">
      <path d={svgPaths.p2430cbc0} fill="currentColor" />
    </svg>
  );
}

function IconAdd() {
  return (
    <svg className="block w-[9.8px] h-[9.8px]" fill="none" viewBox="0 0 9.8 9.8">
      <path d={svgPaths.p10b9600} fill="currentColor" />
    </svg>
  );
}

function getIcon(iconName: string) {
  switch (iconName) {
    case 'home':
      return <IconHome />;
    case 'notifications':
      return <IconNotifications />;
    case 'remote-support':
      return <IconRemoteSupport />;
    case 'ai':
      return <IconAi />;
    case 'archive':
      return <IconArchive />;
    case 'members':
      return <Users size={20} />;
    case 'palette':
      return <Palette size={20} />;
    case 'headphones':
      return <Headphones size={20} />;
    case 'grid':
      return <Grid3x3 size={20} />;
    case 'trending':
      return <TrendingUp size={20} />;
    case 'cloud':
      return <Cloud size={20} />;
    case 'qrcode':
      return <QrCode size={20} />;
    case 'puzzle':
      return <Puzzle size={20} />;
    case 'crown':
      return <Crown size={20} />;
    default:
      return null;
  }
}

export function Sidebar({
  selectedMenuItem,
  onMenuItemSelect,
  selectedProject,
  onProjectSelect,
  onBackToMain,
  isWorkspaceManagement,
  onToggleWorkspaceManagement,
  isMinimized,
  onToggleMinimized,
  isSecondarySidebarOpen,
  onToggleSecondarySidebar,
}: SidebarProps) {
  const { currentRole } = useRole();
  const { projects, createProject, currentProject, setCurrentProject } = useProject();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [showSearchField, setShowSearchField] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  // Compute unread notification count for aria-labels
  const unreadNotificationCount = webNotifications.filter(n => n.unread).length;

  // Filter menu items based on current role
  const availableMainMenuItems = mainMenuItems.filter(item => {
    if (item.id === 'home' || item.id === 'notifications') return hasAccess(currentRole, item.id);
    if (item.id === 'remote-support') return hasAccess(currentRole, 'remote-support');
    if (item.id === 'ai-studio') return hasAccess(currentRole, 'ai-studio');
    if (item.id === 'archive') return hasAccess(currentRole, 'archive');
    return true;
  });

  // Filter menu items based on search query
  const filteredMainMenuItems = menuSearchQuery
    ? availableMainMenuItems.filter(item => 
        item.label.toLowerCase().includes(menuSearchQuery.toLowerCase())
      )
    : availableMainMenuItems;

  const filteredWorkspaceMenuItems = menuSearchQuery
    ? workspaceManagementItems.filter(item =>
        item.label.toLowerCase().includes(menuSearchQuery.toLowerCase())
      )
    : workspaceManagementItems;

  // Filter workspace items by role: admin sees all, SSM only sees Members & Groups
  const visibleWorkspaceItems = filteredWorkspaceMenuItems.filter(item => {
    if (hasAccess(currentRole, 'workspace-management')) return true; // admin sees all
    if (hasAccess(currentRole, 'workspace-members')) {
      return item.id === 'ws-members' || item.id === 'ws-groups';
    }
    return false;
  });

  // Filter projects based on search query
  const filteredProjects = menuSearchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
      )
    : projects;

  const canAccessProjects = hasAccess(currentRole, 'projects');
  const canCreateNewProject = hasAccess(currentRole, 'new-project');

  const handleSaveProject = (projectData: {
    name: string;
    owners: Array<{ id: string; name: string; initials: string; color: string }>;
    description: string;
    privacy: 'private' | 'public' | 'workspace';
    sharedWith: Array<{ id: string; name: string; initials?: string; color?: string; type: 'user' | 'group'; memberCount?: number }>;
    defaultDigitalTwin: string;
    createdDate?: string;
  }) => {
    const newProjectId = createProject({
      name: projectData.name,
      settings: {
        owners: projectData.owners,
        description: projectData.description,
        privacy: projectData.privacy,
        sharedWith: projectData.sharedWith,
        defaultDigitalTwin: projectData.defaultDigitalTwin,
        createdDate: projectData.createdDate || new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
      },
    });
    toast.success(`Project "${projectData.name}" created successfully!`);
    setShowNewProjectModal(false);
    onProjectSelect(newProjectId);
  };

  return (
    <nav role="navigation" aria-label="Main navigation" className="flex flex-col w-full h-full bg-background transition-all duration-300 ease-in-out border-r border-border">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-border group relative"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        {!isMinimized ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <h2 
                className="text-sidebar-foreground" 
                style={{ 
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                Menu
              </h2>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <button
                onClick={() => setShowSearchField(!showSearchField)}
                className={`flex items-center justify-center p-2 rounded-[var(--radius)] text-sidebar-foreground transition-all duration-200 ${
                  showSearchField ? 'bg-secondary opacity-100' : 'hover:bg-secondary'
                } ${isHeaderHovered ? 'opacity-100' : 'opacity-0'}`}
                title="Search menu"
                aria-label="Search menu"
                aria-expanded={showSearchField}
              >
                <Search size={16} />
              </button>

              {/* Minimize Button - Shows on hover */}
              <button
                onClick={onToggleMinimized}
                className={`flex items-center justify-center p-2 rounded-[var(--radius)] text-sidebar-foreground hover:bg-secondary transition-all duration-200 ${
                  isHeaderHovered ? 'opacity-100' : 'opacity-0'
                }`}
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onToggleMinimized}
            className="flex items-center justify-center p-2 rounded-[var(--radius)] text-sidebar-foreground hover:bg-secondary transition-all duration-200"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        )}
      </div>

      {/* Menu Search Field */}
      {showSearchField && !isMinimized && (
        <div className="px-3 pt-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
              style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
              aria-label="Search menu items"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar overscroll-contain">
        {isWorkspaceManagement ? (
          <>
            {/* Back to Workspace Button */}
            {!isMinimized && (
              <button
                onClick={onToggleWorkspaceManagement}
                className="flex items-center gap-2 px-3 py-2 mb-4 text-sidebar-foreground hover:bg-secondary rounded-[var(--radius)] transition-all duration-200 hover:translate-x-[-2px]"
                style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                aria-label="Back to workspace"
                aria-expanded={isWorkspaceManagement}
              >
                <ChevronLeft size={18} />
                <span>Back to workspace</span>
              </button>
            )}

            {/* Workspace Management Menu Items */}
            <div className="flex flex-col gap-1">
              {/* Expand button as first menu item when minimized */}
              {isMinimized && (
                <button
                  onClick={onToggleMinimized}
                  className="flex items-center justify-center w-full aspect-square rounded-[var(--radius)] text-sidebar-foreground hover:bg-secondary transition-all duration-200 hover:scale-105 mb-2"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeft size={20} />
                </button>
              )}
              
              {visibleWorkspaceItems.map((item) => {
                const isActive = selectedMenuItem === item.id && !selectedProject;
                return (
                  <button
                    key={item.id}
                    onClick={() => onMenuItemSelect(item.id)}
                    className={`flex items-center gap-3 rounded-[var(--radius)] transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary text-sidebar-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-secondary hover:translate-x-[2px]'
                    } ${isMinimized ? 'justify-center w-full aspect-square' : 'px-3 py-2'}`}
                    style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                    title={isMinimized ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="shrink-0 w-5 flex items-center justify-center">
                      {getIcon(item.icon || '')}
                    </div>
                    {!isMinimized && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Main Menu Items */}
            <div className="flex flex-col gap-1">
              {/* Expand button as first menu item when minimized */}
              {isMinimized && (
                null
              )}

              {filteredMainMenuItems.map((item) => {
                const isActive = selectedMenuItem === item.id && !selectedProject;
                return (
                  <button
                    key={item.id}
                    onClick={() => onMenuItemSelect(item.id)}
                    className={`flex items-center gap-3 rounded-[var(--radius)] transition-all duration-200 relative ${
                      isActive
                        ? 'bg-secondary text-sidebar-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-secondary hover:translate-x-[2px]'
                    } ${isMinimized ? 'justify-center w-full aspect-square' : 'px-3 py-2'}`}
                    style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                    title={isMinimized ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="shrink-0 w-5 flex items-center justify-center">
                      {getIcon(item.icon)}
                    </div>
                    {!isMinimized && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-full"
                            style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}
                            aria-label={`${item.badge} unread notifications`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isMinimized && item.badge && (
                      <div
                        className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full"
                        style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}
                        aria-label={`${item.badge} unread notifications`}
                      >
                        {item.badge}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Projects Section */}
              {!isMinimized ? (
                <>
                  <div className="flex items-center justify-between mt-6 mb-2 px-3">
                    <span className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                      Projects
                    </span>
                    {canCreateNewProject && (
                      <button
                        onClick={() => setShowNewProjectModal(true)}
                        className="text-muted hover:text-foreground hover:bg-secondary rounded-[var(--radius)] p-2 transition-all duration-200 hover:scale-110"
                        title="Create new project"
                        aria-label="Create new project"
                      >
                        <IconAdd />
                      </button>
                    )}
                  </div>
                  
                  {filteredProjects.map((project, index) => {
                    const isActive = selectedProject === project.id;
                    const dotColors = ['#2F80ED', '#8B5CF6', '#F59E0B', '#11E874', '#E91E63', '#00BCD4', '#FF6B35', '#6366F1'];
                    const dotColor = dotColors[index % dotColors.length];
                    return (
                      <button
                        key={project.id}
                        onClick={() => {
                          onProjectSelect(project.id);
                          setCurrentProject(project.id);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-[var(--radius)] transition-all duration-200 text-left ${
                          isActive
                            ? 'bg-secondary text-sidebar-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-secondary hover:translate-x-[2px]'
                        }`}
                        style={{ fontFamily: 'var(--font-family)' }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive ? dotColor : `${dotColor}60` }} />
                        {project.name}
                      </button>
                    );
                  })}
                </>
              ) : (
                canAccessProjects && (
                  <button
                    onClick={() => onToggleSecondarySidebar(!isSecondarySidebarOpen)}
                    className={`w-full aspect-square flex items-center justify-center rounded-[var(--radius)] transition-all duration-200 hover:scale-105 ${
                      isSecondarySidebarOpen || selectedProject
                        ? 'bg-secondary text-sidebar-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-secondary'
                    }`}
                    title="Projects"
                    aria-label="Projects"
                    aria-expanded={isSecondarySidebarOpen}
                  >
                    <Folder size={20} />
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-2'} text-xs text-sidebar-foreground hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors w-full`} title="Help" aria-label="Help">
          <HelpCircle size={15} className="text-muted shrink-0" />
          {!isMinimized && <span>Help</span>}
        </button>
      </div>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSave={handleSaveProject}
        mode="create"
      />
    </nav>
  );
}
