import { useState, useRef, useEffect } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { UserSettingsModal } from './UserSettingsModal';
import { XRLoginModal } from './XRLoginModal';
import { UserAvatar } from './UserAvatar';
import { useAvatar } from '../contexts/AvatarContext';
import { useRole, ROLES, UserRole, hasAccess } from '../contexts/RoleContext';
import { getUrlParam, setUrlParam } from '../utils/urlParams';
import { ChevronDown, Search, Settings as SettingsIcon } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { toast } from 'sonner';

interface TopBarProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
  isWorkspaceManagement?: boolean;
  onToggleWorkspaceManagement?: () => void;
  onOpenSearch?: () => void;
}

function IconDownload() {
  return (
    <svg className="block w-[9.33px] h-[9.33px]" fill="none" viewBox="0 0 9.33333 9.33333">
      <path d={svgPaths.pe512100} fill="var(--color-primary)" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="block w-[13px] h-[13px]" fill="none" viewBox="0 0 13 13">
      <path d={svgPaths.p1fc9e400} fill="var(--color-foreground)" />
    </svg>
  );
}

function IconAi() {
  return (
    <svg className="block w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
      <g>
        <g />
        <path d={svgPaths.p3a31b80} fill="url(#paint0_linear_ai)" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_ai" x1="8.91572" x2="8.91572" y1="1.89954" y2="16.3207">
          <stop stopColor="#2F80ED" />
          <stop offset="1" stopColor="#004FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="block size-5" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M4 18c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4M12.5 12.5l-1.4-1.4M4.9 4.9L3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconSwitch() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <path d="M2 6h8M10 6l-2-2M10 6l-2 2M14 10H6M6 10l2 2M6 10l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <rect x="2" y="5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1M8 9v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconXR() {
  return (
    <svg className="block size-4" fill="none" viewBox="0 0 16 16">
      <rect x="2" y="5" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="5.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="10.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="block size-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconLogo() {
  return (
    <svg className="block w-full h-full" fill="none" viewBox="0 0 24 24">
      <g>
        <path d={svgPaths.p2e071580} fill="currentColor" />
        <path d={svgPaths.p159c9f80} fill="currentColor" />
        <path d={svgPaths.p50fb500} fill="currentColor" />
        <path d={svgPaths.p1f65b900} fill="currentColor" />
      </g>
    </svg>
  );
}

export function TopBar({ isChatOpen, onToggleChat, onMenuClick, isMobile, isWorkspaceManagement, onToggleWorkspaceManagement, onOpenSearch }: TopBarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showXRLogin, setShowXRLogin] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const openAccountSettings = (open: boolean) => { setShowAccountSettings(open); setUrlParam('account', open ? '1' : null); };
  const openXRLogin = (open: boolean) => { setShowXRLogin(open); setUrlParam('xrlogin', open ? '1' : null); };

  useEffect(() => {
    if (getUrlParam('account') === '1') setShowAccountSettings(true);
    if (getUrlParam('xrlogin') === '1') setShowXRLogin(true);
  }, []);
  const { workspace: wsSettings } = useWorkspace();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState({ id: 'frontline', name: 'Frontline360', initials: 'F', color: 'primary' });
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const workspaceButtonRef = useRef<HTMLButtonElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const { currentRole, setRole, roleInfo } = useRole();
  const canAccessAiChat = hasAccess(currentRole, 'ai-chat');

  // Close user menu when clicking outside
  useClickOutside([userMenuRef, userButtonRef], () => setIsUserMenuOpen(false), isUserMenuOpen);

  // Close workspace menu when clicking outside
  useClickOutside([workspaceMenuRef, workspaceButtonRef], () => {
    setShowWorkspaceMenu(false);
    setWorkspaceSearchQuery('');
  }, showWorkspaceMenu);


  const canAccessWorkspaceManagement = hasAccess(currentRole, 'workspace-management') || hasAccess(currentRole, 'workspace-members');

  // Mock workspace data — current workspace uses context values
  const allWorkspaces = [
    { id: 'frontline', name: wsSettings.name, initials: wsSettings.name.charAt(0).toUpperCase(), color: 'primary' },
    { id: 'lls', name: 'LLS-ltd', initials: 'L', color: 'accent' },
    { id: 'design', name: 'Design Team', initials: 'D', color: 'secondary' },
    { id: 'eng', name: 'Engineering Hub', initials: 'E', color: 'primary' },
    { id: 'marketing', name: 'Marketing Ops', initials: 'M', color: 'accent' },
    { id: 'sales', name: 'Sales Central', initials: 'S', color: 'primary' },
  ];

  const filteredWorkspaces = allWorkspaces.filter(ws => 
    ws.name.toLowerCase().includes(workspaceSearchQuery.toLowerCase())
  );

  const handleWorkspaceSwitch = (workspace: typeof allWorkspaces[0]) => {
    setCurrentWorkspace(workspace);
    setShowWorkspaceMenu(false);
    setWorkspaceSearchQuery('');
  };

  const handleWorkspaceManagementClick = () => {
    setShowWorkspaceMenu(false);
    if (onToggleWorkspaceManagement) {
      onToggleWorkspaceManagement();
    }
  };

  const handleAccountSettings = () => {
    setIsUserMenuOpen(false);
    openAccountSettings(true);
  };

  const handleXRLogin = () => {
    setIsUserMenuOpen(false);
    openXRLogin(true);
  };

  const handleRoleSwitcher = () => {
    setIsUserMenuOpen(false);
    setShowRoleSwitcher(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setShowRoleSwitcher(false);
  };

  const { logout } = useAvatar();
  
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  return (
    <>
      <div role="banner" className={`h-[54px] bg-background shrink-0 flex items-center justify-between border-b border-border ${isMobile ? 'px-4' : 'px-6'}`}>
        {/* Left side - Workspace button and Mobile menu button */}
        <div className="flex-1 flex items-center gap-3">
          {isMobile && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2.5 -ml-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
          )}

          {/* Workspace Button */}
          {!isMobile && (
            <div className="relative">
              <button
                ref={workspaceButtonRef}
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] hover:bg-secondary transition-all duration-200"
                style={{ fontFamily: 'var(--font-family)' }}
                aria-label="Workspace management"
                aria-expanded={showWorkspaceMenu}
                aria-haspopup="true"
              >
                {currentWorkspace.id === 'frontline' ? (
                  <div className="w-6 h-6 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {wsSettings.logoUrl ? (
                      <img src={wsSettings.logoUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-5 h-5 text-primary">
                        <IconLogo />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-6 h-6 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 ${
                      currentWorkspace.color === 'primary' ? 'bg-primary/20 text-primary' :
                      currentWorkspace.color === 'accent' ? 'bg-accent/20 text-accent' :
                      'bg-secondary text-foreground'
                    }`}
                    style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}
                  >
                    {currentWorkspace.initials}
                  </div>
                )}
                <span className="text-sidebar-foreground truncate max-w-[160px]" style={{
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {currentWorkspace.id === 'frontline' ? wsSettings.name : currentWorkspace.name}
                </span>
                <ChevronDown size={14} className={`text-muted transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Workspace Dropdown Menu */}
              {showWorkspaceMenu && (
                <div 
                  ref={workspaceMenuRef}
                  className="absolute top-full left-0 mt-2 w-80 max-w-[calc(100vw-32px)] bg-card border border-border rounded-[var(--radius)] z-50"
                  style={{ boxShadow: 'var(--elevation-lg)', fontFamily: 'var(--font-family)' }}
                >
                  {/* Workspace Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-3">
                      {currentWorkspace.id === 'frontline' ? (
                        <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center p-2 overflow-hidden">
                          {wsSettings.logoUrl ? (
                            <img src={wsSettings.logoUrl} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full text-primary">
                              <IconLogo />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-[var(--radius)] flex items-center justify-center ${
                            currentWorkspace.color === 'primary' ? 'bg-primary/20 text-primary' :
                            currentWorkspace.color === 'accent' ? 'bg-accent/20 text-accent' :
                            'bg-secondary text-foreground'
                          }`}
                          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}
                        >
                          {currentWorkspace.initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                          {currentWorkspace.id === 'frontline' ? wsSettings.name : currentWorkspace.name}
                        </h3>
                        <p className="text-muted truncate" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                          23 members • Business Plus
                        </p>
                      </div>
                    </div>

                    {/* Workspace Settings Button */}
                    {canAccessWorkspaceManagement && (
                      <button
                        onClick={handleWorkspaceManagementClick}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-[var(--radius)] transition-colors"
                      >
                        <SettingsIcon size={16} style={{ color: 'var(--color-foreground)' }} />
                        <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}>
                          Workspace Settings
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={workspaceSearchQuery}
                        onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
                        style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                      />
                    </div>
                  </div>

                  {/* Workspaces List */}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className="p-2">
                      {filteredWorkspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleWorkspaceSwitch(workspace)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] hover:bg-secondary transition-all duration-200 hover:translate-x-[2px]"
                        >
                          <div 
                            className={`w-8 h-8 rounded-[var(--radius)] flex items-center justify-center flex-shrink-0 ${
                              workspace.color === 'primary' ? 'bg-primary/20 text-primary' :
                              workspace.color === 'accent' ? 'bg-accent/20 text-accent' :
                              'bg-secondary text-foreground'
                            }`}
                            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}
                          >
                            {workspace.initials}
                          </div>
                          <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                            {workspace.name}
                          </span>
                          {workspace.id === currentWorkspace.id && (
                            <svg className="ml-auto block w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 16 16">
                              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      ))}
                      {filteredWorkspaces.length === 0 && (
                        <div className="px-3 py-4 text-center text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                          No workspaces found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center - Search and Chat Button */}
        <div className="flex items-center gap-2">
          {/* Search Field - Desktop */}
          {!isMobile && (
            <button
              onClick={() => onOpenSearch?.()}
              className="flex items-center gap-2 bg-background border border-input rounded-full px-3 py-1 w-full max-w-[720px] min-w-[200px] transition-all hover:border-primary/50 hover:shadow-sm"
              aria-label="Open search"
            >
              <IconSearch />
              <span className="flex-1 text-left text-xs text-muted">Search</span>
              {canAccessAiChat && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleChat(); }}
                  className="group flex items-center gap-1.5 flex-shrink-0 p-1 rounded-full hover:bg-secondary transition-colors"
                  aria-label="AI chat"
                >
                  <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap select-none">Ask AI</span>
                  <IconAi />
                </button>
              )}
            </button>
          )}

          {/* Search Icon - Mobile */}
          {isMobile && (
            <button
              className="p-2.5 rounded-[var(--radius)] hover:bg-secondary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Right side - Install App and User Avatar */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {!isMobile && (
            <button className="flex items-center gap-1.5 text-primary hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-all">
              <IconDownload />
              <span className="text-xs" style={{ fontWeight: 'var(--font-weight-medium)' }}>Install App</span>
            </button>
          )}

          <div className="relative">
            <button
              ref={userButtonRef}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="cursor-pointer p-1.5 rounded-[var(--radius)] hover:bg-secondary transition-colors"
              aria-label="User settings"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <UserAvatar
                size="small"
                showOnlineStatus={true}
                initials="YD"
              />
            </button>

            {/* User Menu */}
            {isUserMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] bg-card border border-border rounded-[var(--radius)] py-1 z-50"
                style={{ boxShadow: 'var(--elevation-lg)' }}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar 
                      size="medium" 
                      showOnlineStatus={true}
                      editable={true}
                      initials="YD"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                        Yanay D
                      </p>
                      <p className="text-muted truncate" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                        yanay@lls-ltd.com
                      </p>
                    </div>
                  </div>
                  
                  {/* Current Role Badge */}
                  <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-[var(--radius)] inline-flex items-center gap-1.5">
                    <IconBriefcase />
                    <span className="text-primary" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'var(--font-family)' }}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleAccountSettings}
                    className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <IconSettings />
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Account Settings
                    </span>
                  </button>
                  <button
                    onClick={handleXRLogin}
                    className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <IconXR />
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Login with XR
                    </span>
                  </button>
                </div>

                {/* Debug: Switch Role */}
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleRoleSwitcher}
                    className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <IconSwitch />
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Switch Role (Debug)
                    </span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left hover:bg-destructive/10 transition-colors flex items-center gap-3"
                  >
                    <IconLogout />
                    <span className="text-destructive" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={showAccountSettings} 
        onClose={() => openAccountSettings(false)}
      />

      {/* XR Login Modal */}
      <XRLoginModal
        isOpen={showXRLogin}
        onClose={() => openXRLogin(false)} 
      />

      {/* Role Switcher Modal */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-card border border-border rounded-[var(--radius-lg)] w-full max-w-2xl max-h-[80vh] max-h-[80dvh] overflow-hidden"
            style={{ boxShadow: 'var(--elevation-lg)' }}
          >
            {/* Header */}
            <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 
                  className="text-foreground"
                  style={{ 
                    fontSize: 'var(--text-lg)', 
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Switch Role (Debug Mode)
                </h2>
                <p 
                  className="text-muted mt-1"
                  style={{ 
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Select a role to view the application from that perspective
                </p>
              </div>
              <button
                onClick={() => setShowRoleSwitcher(false)}
                className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
              >
                <svg className="block size-5" fill="none" viewBox="0 0 20 20">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(ROLES) as UserRole[]).map((roleKey) => {
                  const role = ROLES[roleKey];
                  const isActive = currentRole === roleKey;
                  
                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleRoleChange(roleKey)}
                      className={`p-4 border-2 rounded-[var(--radius)] text-left transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 
                          className="text-foreground"
                          style={{ 
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-weight-bold)',
                            fontFamily: 'var(--font-family)'
                          }}
                        >
                          {role.label}
                        </h3>
                        {isActive && (
                          <div className="p-1 bg-primary rounded-full shrink-0">
                            <svg className="block size-3" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p 
                        className="text-muted"
                        style={{ 
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Current Selection Info */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-[var(--radius)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-[var(--radius)] text-primary shrink-0">
                    <IconBriefcase />
                  </div>
                  <div>
                    <p 
                      className="text-foreground mb-1"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      Currently viewing as: {roleInfo.label}
                    </p>
                    <p 
                      className="text-muted"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      The sidebar menu and available features will adjust based on the selected role's permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OLD Account Settings Modal - REMOVE */}
      {false && showAccountSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-[var(--radius)] w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Account Settings
              </h2>
              <button
                onClick={() => setShowAccountSettings(false)}
                className="p-2 hover:bg-secondary rounded-[var(--radius)] transition-colors"
              >
                <svg className="block size-5" fill="none" viewBox="0 0 20 20">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div>
                <h3 className="text-sm text-foreground mb-4" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Walter White"
                      className="w-full bg-input-background border border-border focus:border-primary rounded-[var(--radius)] px-3 py-2 text-sm text-foreground outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="walter@workspace.com"
                      className="w-full bg-input-background border border-border focus:border-primary rounded-[var(--radius)] px-3 py-2 text-sm text-foreground outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      disabled
                      className="w-full bg-secondary border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setShowAccountSettings(false)}
                  className="px-4 py-2 border border-border text-foreground rounded-[var(--radius)] text-sm hover:bg-secondary transition-colors"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Settings saved!');
                    setShowAccountSettings(false);
                  }}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}
