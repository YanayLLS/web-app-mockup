import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
// Project management system with multi-project support
import { toast } from 'sonner';
import { useIsMobile } from './components/ui/use-mobile';
import { Sidebar } from './components/Sidebar';
import { SecondarySidebar } from './components/SecondarySidebar';
import { FavoritesBar } from './components/FavoritesBar';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { ProcedureModal } from './components/modals/ProcedureModal';
import { MediaViewerModal } from './components/modals/MediaViewerModal';
import { ContentView } from './components/ContentView';
import { AIChatView } from './components/AIChatView';
import { HomePage } from './components/HomePage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { RemoteSupportPage } from './components/pages/RemoteSupportPage';
import { AiStudioPage } from './components/pages/AiStudioPage';
import { ArchivePage } from './components/pages/ArchivePage';
import { ProjectOverviewPage } from './components/pages/ProjectOverviewPage';
import { GenericPage } from './components/pages/GenericPage';
import { MembersPageWrapper } from './components/pages/workspace/MembersPageWrapper';
import { WorkspaceDesignPage } from './components/pages/workspace/WorkspaceDesignPage';
import { RemoteSupportSettingsPage } from './components/pages/workspace/RemoteSupportSettingsPage';
import { SubWorkspacesPage } from './components/pages/workspace/SubWorkspacesPage';
import { PayPerClickPage } from './components/pages/workspace/PayPerClickPage';
import { SSOPage } from './components/pages/workspace/SSOPage';
import { StaticQRCodesPage } from './components/pages/workspace/StaticQRCodesPage';
import { IntegrationsPage } from './components/pages/workspace/IntegrationsPage';
import { GroupsPage } from './components/pages/workspace/GroupsPage';
import { RolesManagementPage } from './components/pages/workspace/members/RolesManagementPage';
import { GroupsProvider } from './contexts/GroupsContext';
import { KnowledgeBasePage } from './components/pages/KnowledgeBasePage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { ActivityLogPage } from './components/pages/ActivityLogPage';
import { ProjectSettingsModal } from './components/modals/ProjectSettingsModal';
import { MediaLibraryModal } from './components/modals/MediaLibraryModal';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { ToastProvider } from './contexts/ToastContext';
import { AvatarProvider, useAvatar } from './contexts/AvatarContext';
import { RoleProvider, useRole, hasAccess } from './contexts/RoleContext';
import { FavoritesProvider, useFavorites } from './contexts/FavoritesContext';
import { ActiveCallProvider } from './contexts/ActiveCallContext';
import { ProcedureStepsProvider } from './contexts/ProcedureStepsContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { AppPopupProvider } from './contexts/AppPopupContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { FloatingMinimizedCall } from './components/FloatingMinimizedCall';
import { getUrlParam, setUrlParam } from './utils/urlParams';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { WorkspaceSelector } from './components/WorkspaceSelector';
import { ProductSelector } from './components/ProductSelector';
import { ProcedureEditorPage } from './components/pages/ProcedureEditorPage';
import { AppLayout } from './components/app-design/AppLayout';
import { DebugMenu } from './components/DebugMenu';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AnimationsPanel } from './data/AnimationsPanel';
import { ConfigurationsPanel } from './data/ConfigurationsPanel';
import {
  IconHome,
  IconNotifications,
  IconRemoteSupport,
  IconAi,
  IconArchive,
  IconOverview,
  IconDocuments,
  IconTasks,
  IconTeam,
  IconSettings,
  IconAnalytics,
  IconActivity,
  IconMedia,
} from './components/icons';

// Main App Component with Login Check
// Handles authentication flow before rendering main application
function AppContent() {
  const { isLoggedIn, login } = useAvatar();
  const isMobile = useIsMobile();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const handleLogin = (email: string, password: string) => {
    // Store email for workspace selector
    setUserEmail(email);
    // Show workspace selector instead of logging in directly
    setShowWorkspaceSelector(true);
  };

  const handleSignUp = (email: string, password: string, fullName: string) => {
    console.log('Sign up:', { email, fullName });
    // After sign-up, switch back to login
    setShowSignUp(false);
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    console.log('Selected workspace:', workspaceId);
    // Complete login after workspace selection
    login(userEmail, 'password');
  };

  const handleDeclineInvitation = (workspaceId: string) => {
    console.log('Declined workspace:', workspaceId);
  };
  
  if (!isLoggedIn) {
    if (showWorkspaceSelector) {
      return (
        <WorkspaceSelector
          userEmail={userEmail}
          onSelectWorkspace={handleSelectWorkspace}
          onDeclineInvitation={handleDeclineInvitation}
        />
      );
    }
    
    if (showSignUp) {
      return (
        <SignUpScreen 
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setShowSignUp(false)}
        />
      );
    }
    
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onSwitchToSignUp={() => setShowSignUp(true)}
      />
    );
  }
  
  return <MainApp isMobile={isMobile} />;
}

// Main App Component
// This component uses ProjectContext and must be wrapped in ProjectProvider
function MainApp({ isMobile }: { isMobile: boolean }) {
  const { currentRole } = useRole();
  const { currentProject, updateProject, deleteProject, setCurrentProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('home');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedProjectTab, setSelectedProjectTab] = useState('overview');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [chatWidth, setChatWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useState(false);
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(240);
  const [isResizingSecondarySidebar, setIsResizingSecondarySidebar] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isWorkspaceManagement, setIsWorkspaceManagement] = useState(false);
  const [shouldShowScheduleModal, setShouldShowScheduleModal] = useState(false);
  const [openFavoriteItem, setOpenFavoriteItem] = useState<any | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAnimationsPanelOpen, setIsAnimationsPanelOpen] = useState(false);
  const [isConfigurationsPanelOpen, setIsConfigurationsPanelOpen] = useState(false);
  // Persist canvas param across tab switches so the flow editor stays open
  const [savedCanvasId, setSavedCanvasId] = useState<string | null>(null);

  // Wrappers that keep URL params in sync with modal state
  const openSettingsModal = (open: boolean) => {
    setIsSettingsModalOpen(open);
    setUrlParam('settings', open ? '1' : null);
  };
  const openMediaLibraryModal = (open: boolean) => {
    setIsMediaLibraryOpen(open);
    setUrlParam('medialib', open ? '1' : null);
  };

  // Auto-open modals from URL params on mount
  useEffect(() => {
    if (getUrlParam('settings') === '1') setIsSettingsModalOpen(true);
    if (getUrlParam('medialib') === '1') setIsMediaLibraryOpen(true);
  }, []);

  // Sync selected project with current project from context
  useEffect(() => {
    if (currentProject && selectedProject !== currentProject.id) {
      setSelectedProject(currentProject.id);
    }
  }, [currentProject]);

  // Sync URL with selected menu item
  useEffect(() => {
    // Strip /web prefix for internal route matching
    const path = location.pathname.replace(/^\/web/, '') || '/';
    if (path.startsWith('/project/')) {
      const parts = path.split('/');
      const projectId = parts[2];
      const tab = parts[3] || 'knowledgebase';
      setSelectedProject(projectId);
      setSelectedProjectTab(tab === 'knowledgebase' ? 'overview' : tab);
      setIsWorkspaceManagement(false);
    } else if (path.startsWith('/workspace/')) {
      const section = path.split('/')[2];
      setSelectedMenuItem(`ws-${section}`);
      setIsWorkspaceManagement(true);
      setSelectedProject(null);
    } else {
      const menuMap: { [key: string]: string } = {
        '/': 'home',
        '/home': 'home',
        '/notifications': 'notifications',
        '/remote-support': 'remote-support',
        '/ai-studio': 'ai-studio',
        '/archive': 'archive',
      };
      setSelectedMenuItem(menuMap[path] || 'home');
      setIsWorkspaceManagement(false);
      setSelectedProject(null);
    }
  }, [location.pathname]);

  // Auto-open chat if URL ends with /chat
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/chat')) {
      setIsChatOpen(true);
      const basePath = path.replace(/\/chat$/, '') || '/web/home';
      navigate(basePath, { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId);
    navigate(`/web/project/${projectId}/knowledgebase`);
  };

  const handleBackToMain = () => {
    navigate('/web/home');
  };

  const handleMenuItemSelect = (menuItem: string) => {
    setShouldShowScheduleModal(false);
    if (isMobile) {
      setIsSidebarOpen(false);
    }

    // Animations opens as an overlay panel instead of navigating
    if (menuItem === 'animations') {
      setIsAnimationsPanelOpen(true);
      return;
    }

    // Configurations opens as an overlay panel instead of navigating
    if (menuItem === 'configurations') {
      setIsConfigurationsPanelOpen(true);
      return;
    }

    const routeMap: { [key: string]: string } = {
      'home': '/web/home',
      'notifications': '/web/notifications',
      'remote-support': '/web/remote-support',
      'ai-studio': '/web/ai-studio',
      'archive': '/web/archive',
      'ws-members': '/web/workspace/members',
      'ws-design': '/web/workspace/design',
      'ws-remote-support': '/web/workspace/remote-support',
      'ws-subworkspaces': '/web/workspace/subworkspaces',
      'ws-pay-per-click': '/web/workspace/pay-per-click',
      'ws-sso': '/web/workspace/sso',
      'ws-qr-codes': '/web/workspace/qr-codes',
      'ws-groups': '/web/workspace/groups',
      'ws-roles': '/web/workspace/roles',
      'ws-integrations': '/web/workspace/integrations',
    };

    const route = routeMap[menuItem] || '/web/home';
    navigate(route);
  };

  const handleScheduleMeeting = () => {
    setShouldShowScheduleModal(true);
    navigate('/web/remote-support');
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Reset schedule modal flag after a brief delay to allow the RemoteSupportPage to read it
  useEffect(() => {
    if (shouldShowScheduleModal) {
      const timer = setTimeout(() => {
        setShouldShowScheduleModal(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowScheduleModal]);

  const handleToggleWorkspaceManagement = () => {
    if (!isWorkspaceManagement) {
      navigate('/web/workspace/members');
    } else {
      navigate('/web/home');
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Get project tabs based on role
  const getProjectTabs = () => {
    const canEdit = hasAccess(currentRole, 'projects-edit');
    const canViewAnalytics = hasAccess(currentRole, 'analytics');
    const canViewActivityLog = hasAccess(currentRole, 'activity-log');
    
    const tabs = [
      { id: 'overview', label: 'Knowledge Base', icon: <IconOverview /> },
    ];
    
    // Only content creators and admins see these tabs
    if (canViewAnalytics) {
      tabs.push({ id: 'analytics', label: 'Analytics', icon: <IconAnalytics /> });
    }
    if (canViewActivityLog) {
      tabs.push({ id: 'activity', label: 'Activity Log', icon: <IconActivity /> });
    }
    if (canEdit) {
      tabs.push({ id: 'media', label: 'Media Library', icon: <IconMedia /> });
      tabs.push({ id: 'settings', label: 'Settings', icon: <IconSettings /> });
    }
    
    return tabs;
  };

  // Get the page content, icon, and title based on selected menu item
  const getPageContent = (): { icon: JSX.Element; title: string; content: JSX.Element; hideHeader?: boolean } => {
    if (selectedProject) {
      switch (selectedProjectTab) {
        case 'overview':
          return {
            icon: <IconOverview />,
            title: 'Knowledge Base',
            content: <KnowledgeBasePage />,
          };
        case 'analytics':
          return {
            icon: <IconAnalytics />,
            title: 'Analytics',
            content: <AnalyticsPage projectId={selectedProject} />,
            hideHeader: true,
          };
        case 'activity':
          return {
            icon: <IconActivity />,
            title: 'Activity Log',
            content: <ActivityLogPage />,
            hideHeader: true,
          };
        case 'media':
          // Media Library is a modal, return overview as fallback
          return {
            icon: <IconOverview />,
            title: 'Knowledge Base',
            content: <KnowledgeBasePage />,
          };
        default:
          return {
            icon: <IconOverview />,
            title: 'Project',
            content: <GenericPage title="Project" description="Select a menu item to view content" />,
          };
      }
    }

    // Route-level permission gating — prevent direct URL access to restricted pages
    const menuItem = selectedMenuItem;
    if (menuItem.startsWith('ws-')) {
      const isWsMembersRoute = menuItem === 'ws-members' || menuItem === 'ws-groups';
      const hasPermission = isWsMembersRoute
        ? hasAccess(currentRole, 'workspace-members')
        : hasAccess(currentRole, 'workspace-management');

      if (!hasPermission) {
        return {
          icon: <IconHome />,
          title: 'Access Denied',
          content: (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>Access Restricted</div>
                <p className="text-sm text-muted">You don't have permission to view this page.</p>
              </div>
            </div>
          ),
          hideHeader: true,
        };
      }
    }
    if (menuItem === 'ai-studio' && !hasAccess(currentRole, 'ai-studio')) {
      return {
        icon: <IconHome />,
        title: 'Access Denied',
        content: (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>Access Restricted</div>
              <p className="text-sm text-muted">You don't have permission to view this page.</p>
            </div>
          </div>
        ),
        hideHeader: true,
      };
    }
    if (menuItem === 'remote-support' && !hasAccess(currentRole, 'remote-support')) {
      return {
        icon: <IconHome />,
        title: 'Access Denied',
        content: (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>Access Restricted</div>
              <p className="text-sm text-muted">You don't have permission to view this page.</p>
            </div>
          </div>
        ),
        hideHeader: true,
      };
    }
    if (menuItem === 'archive' && !hasAccess(currentRole, 'archive')) {
      return {
        icon: <IconHome />,
        title: 'Access Denied',
        content: (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>Access Restricted</div>
              <p className="text-sm text-muted">You don't have permission to view this page.</p>
            </div>
          </div>
        ),
        hideHeader: true,
      };
    }

    switch (selectedMenuItem) {
      case 'home':
        return {
          icon: <IconHome />,
          title: 'Home',
          content: <HomePage
            onNavigateToKnowledgeBase={() => {
              navigate('/web/project/915-i-series/knowledgebase');
            }}
            onNavigateToRemoteSupport={() => {
              navigate('/web/remote-support');
            }}
            onOpenAIChat={() => {
              setIsChatOpen(true);
            }}
            onScheduleMeeting={handleScheduleMeeting}
          />,
        };
      case 'notifications':
        return {
          icon: <IconNotifications />,
          title: 'Notifications',
          content: <NotificationsPage />,
        };
      case 'remote-support':
        return {
          icon: <IconRemoteSupport />,
          title: 'Remote Support',
          content: <RemoteSupportPage 
            onCallStateChange={setIsInCall} 
            initialShowScheduleModal={shouldShowScheduleModal}
          />,
          hideHeader: isInCall,
        };
      case 'ai-studio':
        return {
          icon: <IconAi />,
          title: 'AI Studio',
          content: <AiStudioPage />,
        };
      case 'archive':
        return {
          icon: <IconArchive />,
          title: 'Archive',
          content: <ArchivePage />,
        };
      case 'ws-members':
        return {
          icon: <IconHome />,
          title: 'Members',
          content: <MembersPageWrapper />,
          hideHeader: true,
        };
      case 'ws-design':
        return {
          icon: <IconHome />,
          title: 'Workspace Design',
          content: <WorkspaceDesignPage />,
          hideHeader: true,
        };
      case 'ws-remote-support':
        return {
          icon: <IconHome />,
          title: 'Remote Support Settings',
          content: <RemoteSupportSettingsPage />,
          hideHeader: true,
        };
      case 'ws-subworkspaces':
        return {
          icon: <IconHome />,
          title: 'Sub-Workspaces',
          content: <SubWorkspacesPage />,
          hideHeader: true,
        };
      case 'ws-pay-per-click':
        return {
          icon: <IconHome />,
          title: 'Pay Per Click',
          content: <PayPerClickPage />,
          hideHeader: true,
        };
      case 'ws-sso':
        return {
          icon: <IconHome />,
          title: 'SSO',
          content: <SSOPage />,
          hideHeader: true,
        };
      case 'ws-qr-codes':
        return {
          icon: <IconHome />,
          title: 'Static QR Codes',
          content: <StaticQRCodesPage />,
          hideHeader: true,
        };
      case 'ws-groups':
        return {
          icon: <IconHome />,
          title: 'Groups',
          content: <GroupsPage />,
          hideHeader: true,
        };
      case 'ws-roles':
        return {
          icon: <IconHome />,
          title: 'Roles',
          content: <RolesManagementPage />,
          hideHeader: true,
        };
      case 'ws-integrations':
        return {
          icon: <IconHome />,
          title: 'Integrations',
          content: <IntegrationsPage />,
          hideHeader: true,
        };
      default:
        return {
          icon: <IconHome />,
          title: 'Welcome',
          content: <GenericPage title="Welcome" description="Select a menu item to get started" />,
        };
    }
  };

  const pageContent = getPageContent();

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleChatMouseDown = () => {
    setIsResizingChat(true);
  };

  const handleSecondarySidebarMouseDown = () => {
    setIsResizingSecondarySidebar(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    }
    if (isResizingChat) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setChatWidth(newWidth);
      }
    }
    if (isResizingSecondarySidebar) {
      const sidebarOffset = isSidebarMinimized ? 72 : sidebarWidth;
      const newWidth = e.clientX - sidebarOffset;
      if (newWidth >= 180 && newWidth <= 400) {
        setSecondarySidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsResizingChat(false);
    setIsResizingSecondarySidebar(false);
  };

  // Add and remove event listeners for resizing
  useEffect(() => {
    if (isResizing || isResizingChat || isResizingSecondarySidebar) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isResizingChat, isResizingSecondarySidebar, isSidebarMinimized, sidebarWidth]);

  return (
    <div
        id="app-root"
        className="flex flex-col h-screen w-full bg-background overflow-hidden"
        style={{
          userSelect: (isResizing || isResizingChat || isResizingSecondarySidebar) ? 'none' : 'auto'
        }}
      >
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Top Bar - Full Width */}
      <TopBar
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        isWorkspaceManagement={isWorkspaceManagement}
        onToggleWorkspaceManagement={handleToggleWorkspaceManagement}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Shortcuts Bar - User-level, always visible */}
      <FavoritesBar
        onFavoriteClick={(item) => {
          // Open the modal for the favorited item
          setOpenFavoriteItem(item.data);
        }}
      />

      {/* Main Container - Sidebar and Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar Container with Resize Handle */}
        <div 
          className={`${
            isMobile 
              ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative shrink-0 transition-all duration-300 ease-in-out'
          }`}
          style={isMobile ? { width: '280px' } : { width: isSidebarMinimized ? '72px' : `${sidebarWidth}px` }}
        >
          <Sidebar
            selectedMenuItem={selectedMenuItem}
            onMenuItemSelect={handleMenuItemSelect}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
            onBackToMain={handleBackToMain}
            isWorkspaceManagement={isWorkspaceManagement}
            onToggleWorkspaceManagement={handleToggleWorkspaceManagement}
            isMinimized={isSidebarMinimized}
            onToggleMinimized={() => setIsSidebarMinimized(!isSidebarMinimized)}
            isSecondarySidebarOpen={isSecondarySidebarOpen}
            onToggleSecondarySidebar={setIsSecondarySidebarOpen}
          />
          
          {/* Resize Handle - Desktop only, not visible when minimized */}
          {!isMobile && !isSidebarMinimized && (
            <div
              className={`absolute top-0 right-0 bottom-0 w-1 cursor-col-resize transition-all ${
                isResizing ? 'bg-primary/30' : 'hover:bg-primary/20'
              }`}
              onMouseDown={handleMouseDown}
            />
          )}
        </div>

        {/* Secondary Sidebar (Projects Menu when minimized) */}
        {!isMobile && isSidebarMinimized && isSecondarySidebarOpen && (
          <div 
            className="relative shrink-0 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${secondarySidebarWidth}px` }}
          >
            <SecondarySidebar 
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelect}
              onClose={() => setIsSecondarySidebarOpen(false)}
            />
            
            {/* Resize Handle */}
            <div
              className={`absolute top-0 right-0 bottom-0 w-1 cursor-col-resize transition-all z-10 ${
                isResizingSecondarySidebar ? 'bg-primary/30' : 'hover:bg-primary/20'
              }`}
              onMouseDown={handleSecondarySidebarMouseDown}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div id="main-content" className="flex flex-col flex-1 min-w-0">
          {/* Tabs for Projects */}
          {selectedProject && (
            <TabBar
              tabs={getProjectTabs()}
              activeTab={selectedProjectTab}
              onTabChange={(tabId) => {
                if (tabId === 'settings') {
                  openSettingsModal(true);
                } else if (tabId === 'media') {
                  openMediaLibraryModal(true);
                } else {
                  // Save canvas param when leaving KB tab so we can restore it
                  if (selectedProjectTab === 'overview') {
                    const canvasParam = getUrlParam('canvas');
                    setSavedCanvasId(canvasParam);
                  }
                  const routeMap: { [key: string]: string } = {
                    'overview': 'knowledgebase',
                    'analytics': 'analytics',
                    'activity': 'activity',
                  };
                  const route = routeMap[tabId] || tabId;
                  // Restore canvas param when returning to KB tab
                  const search = tabId === 'overview' && savedCanvasId ? `?canvas=${savedCanvasId}` : '';
                  navigate(`/web/project/${selectedProject}/${route}${search}`);
                }
              }}
            />
          )}

          {/* Content and Chat Container */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1 min-h-0`}>
            {/* Content View */}
            <ContentView icon={pageContent.icon} title={pageContent.title} hideHeader={pageContent.hideHeader}>
              {pageContent.content}
            </ContentView>

            {/* AI Chat View */}
            {isChatOpen && (
              <div 
                className={`${
                  isMobile 
                    ? 'fixed inset-0 z-40 bg-card'
                    : 'relative shrink-0 h-full'
                }`}
                style={isMobile ? undefined : { width: `${chatWidth}px` }}
              >
                {/* Resize Handle - Desktop only */}
                {!isMobile && (
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1 cursor-col-resize transition-all z-10 ${
                      isResizingChat ? 'bg-primary/30' : 'hover:bg-primary/20'
                    }`}
                    onMouseDown={handleChatMouseDown}
                  />
                )}
                <AIChatView 
                  onClose={() => setIsChatOpen(false)}
                  currentPage={selectedProject ? selectedProjectTab : selectedMenuItem}
                  currentProjectName={selectedProject ? 'Manufacturing Facility Alpha' : undefined}
                  isAdmin={true}
                  onNavigateToAiStudio={() => {
                    navigate('/web/ai-studio');
                    setIsChatOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Settings Modal */}
      {currentProject && (
        <ProjectSettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => openSettingsModal(false)}
          onSave={(projectData) => {
            updateProject(currentProject.id, {
              name: projectData.name,
              settings: {
                owners: projectData.owners,
                description: projectData.description,
                privacy: projectData.privacy,
                sharedWith: projectData.sharedWith,
                defaultDigitalTwin: projectData.defaultDigitalTwin,
                createdDate: projectData.createdDate || currentProject.settings.createdDate,
              },
            });
            toast.success(`Project "${projectData.name}" updated successfully!`);
          }}
          onDelete={() => {
            deleteProject(currentProject.id);
            toast.success('Project deleted successfully!');
            setSelectedProject(null);
            navigate('/web/home');
          }}
          mode="edit"
          initialData={{
            name: currentProject.name,
            owners: currentProject.settings.owners,
            description: currentProject.settings.description,
            privacy: currentProject.settings.privacy,
            sharedWith: currentProject.settings.sharedWith,
            defaultDigitalTwin: currentProject.settings.defaultDigitalTwin,
            createdDate: currentProject.settings.createdDate,
          }}
        />
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal 
        isOpen={isMediaLibraryOpen} 
        onClose={() => openMediaLibraryModal(false)}
      />

      {/* Favorited Item Modal - Procedure */}
      {openFavoriteItem && openFavoriteItem.type === 'procedure' && (
        <ProcedureModal 
          isOpen={true}
          onClose={() => setOpenFavoriteItem(null)}
          procedure={openFavoriteItem}
          onSave={(updatedProcedure) => {
            // Update through ProjectContext if needed
            setOpenFavoriteItem(null);
          }}
        />
      )}

      {/* Favorited Item Modal - Media */}
      {openFavoriteItem && openFavoriteItem.type === 'media' && (
        <MediaViewerModal 
          isOpen={true}
          onClose={() => setOpenFavoriteItem(null)}
          item={openFavoriteItem}
        />
      )}

      {/* Animations Panel */}
      <AnimationsPanel
        isOpen={isAnimationsPanelOpen}
        onClose={() => setIsAnimationsPanelOpen(false)}
      />

      {/* Configurations Panel */}
      <ConfigurationsPanel
        isOpen={isConfigurationsPanelOpen}
        onClose={() => setIsConfigurationsPanelOpen(false)}
      />

      {/* Floating Minimized Call */}
      <FloatingMinimizedCall />
    </div>
  );
}

// Update document title based on current route
function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'Mockup Design';
    if (path === '/') {
      title = 'Select Platform';
    } else if (path.startsWith('/app')) {
      const segment = path.replace(/^\/app\/?/, '').split('/')[0] || 'knowledgebase';
      const titleMap: Record<string, string> = {
        'knowledgebase': 'Knowledge Base',
        'project': 'Project',
        'remote-support': 'Remote Support',
        'ai-chat': 'AI Chat',
        'immersive': 'Immersive Room',
        'notifications': 'Notifications',
        'procedure-editor': 'Procedure Editor',
        '3d-viewer': '3D Viewer',
      };
      title = `${titleMap[segment] || 'App'} — App`;
    } else if (path.startsWith('/web')) {
      const segment = path.replace(/^\/web\/?/, '').split('/')[0] || 'home';
      const titleMap: Record<string, string> = {
        'home': 'Home',
        'notifications': 'Notifications',
        'remote-support': 'Remote Support',
        'ai-studio': 'AI Studio',
        'archive': 'Archive',
        'project': 'Project',
        'workspace': 'Workspace Settings',
        'procedure-editor': 'Procedure Editor',
      };
      title = `${titleMap[segment] || 'Web'} — Web`;
    } else if (path.startsWith('/xr')) {
      title = 'XR Experience';
    }
    document.title = title;
  }, [location.pathname]);
}

// Router wrapper that handles product selection and platform routing
function AppRouter() {
  usePageTitle();
  return (
    <ProcedureStepsProvider>
    <WorkspaceProvider>
    <RoleProvider>
    <UserProfileProvider>
      <Routes>
        <Route path="/" element={<ProductSelector />} />
        <Route path="/web/*" element={
          <AvatarProvider>
              <ProjectProvider>
                <GroupsProvider>
                <FavoritesProvider>
                  <ActiveCallProvider>
                    <ToastProvider>
                      <Routes>
                        <Route path="procedure-editor/:procedureId" element={<ProcedureEditorPage />} />
                        <Route path="*" element={<AppContent />} />
                      </Routes>
                    </ToastProvider>
                  </ActiveCallProvider>
                </FavoritesProvider>
                </GroupsProvider>
              </ProjectProvider>
          </AvatarProvider>
        } />
        <Route path="/app/*" element={<ProjectProvider><AppLayout /></ProjectProvider>} />
        <Route path="/xr/*" element={
          <div className="w-screen h-screen bg-black">
            <iframe
              src={`${import.meta.env.BASE_URL}xr/xr-app.html`}
              className="w-full h-full border-0"
              title="XR App"
            />
          </div>
        } />
      </Routes>
      <DebugMenu />
    </UserProfileProvider>
    </RoleProvider>
    </WorkspaceProvider>
    </ProcedureStepsProvider>
  );
}

// Main App Export with Context Providers
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppPopupProvider>
        <AppRouter />
      </AppPopupProvider>
    </BrowserRouter>
  );
}
