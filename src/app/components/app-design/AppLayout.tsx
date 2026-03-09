import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, ChevronUp, Menu, X, BookOpen, Headset, Box, MessageSquare, HelpCircle, Star, Clock, User, Settings, LogOut, MoreVertical, Phone, Video } from 'lucide-react';
import { AppKnowledgeBasePage } from './pages/AppKnowledgeBasePage';
import { AppProjectKBPage } from './pages/AppProjectKBPage';
import { AppRemoteSupportPage } from './pages/AppRemoteSupportPage';
import { AppAIChatPage } from './pages/AppAIChatPage';
import { AppVirtualRoomPage } from './pages/AppVirtualRoomPage';
import { AppNotificationsPage } from './pages/AppNotificationsPage';
import { AppSearchModal } from './pages/AppSearchPage';
import { AppLoginPage } from './pages/AppLoginPage';
import { AppFolderBrowsePage } from './pages/AppFolderBrowsePage';
import { AppSettingsModal } from './components/AppSettingsModal';
import { AppProcedureInfoModal } from './components/AppProcedureInfoModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ProcedureEditor } from '../procedure-editor/ProcedureEditor';

const navItems = [
  { id: 'knowledgebase', icon: BookOpen, label: 'Projects', path: '/app/knowledgebase' },
  { id: 'remote-support', icon: Headset, label: 'Remote Support', path: '/app/remote-support' },
  { id: 'immersive', icon: Box, label: 'Immersive Room', path: '/app/immersive' },
  { id: 'ai-chat', icon: MessageSquare, label: 'AI Chat', path: '/app/ai-chat' },
];

const recentlyViewed = [
  { name: 'Cylinder pressure check', type: 'procedure', project: 'Workspace > Project > Folder' },
  { name: 'Routine Maintenance Procedure', type: 'procedure', project: 'Workspace > Project A' },
  { name: 'Machine Assembly Guide', type: 'procedure', project: 'Workspace > Project B' },
  { name: 'Digital Twin Model', type: 'digital-twin', project: 'Workspace > Project C' },
];

const favorites = [
  { name: 'Quick Start Guide', type: 'procedure', project: 'Workspace > Project A' },
  { name: 'Safety Protocols', type: 'procedure', project: 'Workspace > Project B' },
];

const sidebarContacts = [
  { id: '1', name: 'Luy Robin', role: 'Field Engineer', initials: 'LR', online: true, color: '#2F80ED' },
  { id: '2', name: 'David Amrosa', role: 'Service Support Expert', initials: 'DA', online: true, color: '#8404B3' },
  { id: '3', name: 'Nika Jerrardo', role: 'Instructor', initials: 'NJ', online: false, color: '#11E874' },
  { id: '4', name: 'Jared Sunn', role: 'Operator', initials: 'JS', online: true, color: '#FF6B35' },
  { id: '5', name: 'Sarah Chen', role: 'Admin', initials: 'SC', online: false, color: '#E91E63' },
  { id: '6', name: 'Marcus Williams', role: 'Field Engineer', initials: 'MW', online: true, color: '#00BCD4' },
  { id: '7', name: 'Elena Rodriguez', role: 'Support Manager', initials: 'ER', online: false, color: '#FF9800' },
  { id: '8', name: 'Tom Anderson', role: 'Operator', initials: 'TA', online: true, color: '#9C27B0' },
];

// Procedure data matching 3D scene's kbProcedures
const sceneProcedures: Record<string, { id: string; projectId: string; name: string; type: 'procedure'; steps: number; lastUpdated: string; version: string; description: string; digitalTwinName: string; configurationName: string; modeName: string }> = {
  p1: { id: 'p1', projectId: '915-i-series', name: 'Routine Maintenance', type: 'procedure', steps: 35, lastUpdated: '02/15/2025', version: '1.5', description: 'Complete routine maintenance procedure for high-volume equipment.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Maintenance' },
  p2: { id: 'p2', projectId: '915-i-series', name: 'Engine Calibration', type: 'procedure', steps: 22, lastUpdated: '01/28/2025', version: '2.1', description: 'Step-by-step calibration procedure for engine timing, fuel mixture, and governor settings.', digitalTwinName: 'Generator Assembly', configurationName: 'Calibration', modeName: 'Diagnostics' },
  p3: { id: 'p3', projectId: '915-i-series', name: 'Belt Replacement', type: 'procedure', steps: 15, lastUpdated: '03/01/2025', version: '1.0', description: 'Guide for inspecting and replacing drive belts.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Repair' },
  p4: { id: 'p4', projectId: '915-i-series', name: 'Spark Plug Replacement', type: 'procedure', steps: 12, lastUpdated: '02/20/2025', version: '1.2', description: 'Remove and replace spark plugs.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Repair' },
  p5: { id: 'p5', projectId: '915-i-series', name: 'Oil Change Procedure', type: 'procedure', steps: 8, lastUpdated: '02/10/2025', version: '3.0', description: 'Drain and refill engine oil.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Maintenance' },
  p6: { id: 'p6', projectId: '915-i-series', name: 'Starting Procedure', type: 'procedure', steps: 6, lastUpdated: '01/15/2025', version: '2.0', description: 'Safe engine starting sequence.', digitalTwinName: 'Generator Assembly', configurationName: 'Standard', modeName: 'Operation' },
};

function App3DViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [procedureModal, setProcedureModal] = useState<string | null>(null);

  const params = new URLSearchParams(location.search);
  const startMode = params.get('mode') === 'editor' ? '&startMode=editor' : '';

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'openProcedureInfo' && e.data.procedureId) {
        setProcedureModal(e.data.procedureId);
      } else if (e.data?.type === 'openProcedure' && e.data.procedureId) {
        // "Run in 3D" from the 3D scene's built-in procedure modal
        navigate(`/app/procedure-editor/${e.data.procedureId}`);
      } else if (e.data?.type === 'backToKB') {
        navigate('/app/knowledgebase');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  const proc = procedureModal ? sceneProcedures[procedureModal] : null;

  return (
    <>
      <div className="w-full h-full relative">
        <iframe
          src={`${import.meta.env.BASE_URL}app/digital-twin-scene.html?embedded=true${startMode}`}
          className="absolute inset-0 w-full h-full border-0"
          title="Digital Twin"
          allow="autoplay; fullscreen"
        />
      </div>
      {proc && (
        <AppProcedureInfoModal
          procedure={proc}
          onClose={() => setProcedureModal(null)}
        />
      )}
    </>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Determine active nav item from URL
  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes('/remote-support')) return 'remote-support';
    if (path.includes('/immersive')) return 'immersive';
    if (path.includes('/ai-chat')) return 'ai-chat';
    if (path.includes('/search')) return 'search';
    return 'knowledgebase';
  };

  const activeNav = getActiveNav();

  // Close menus on outside click
  useEffect(() => {
    const handler = () => {
      setShowUserMenu(false);
      setShowNotifDropdown(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (!isLoggedIn) {
    return <AppLoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(true);
    }
  };

  // Check if we're on a page that shouldn't show the recently viewed panel
  const isRemoteSupport = location.pathname.includes('/remote-support');
  const isProcedureEditor = location.pathname.includes('/procedure-editor');
  const is3DViewer = location.pathname.includes('/3d-viewer');
  const isFullscreenEmbed = isProcedureEditor || is3DViewer;
  const isImmersive = location.pathname.includes('/immersive');
  const isDetailPage = location.pathname.includes('/procedure/') ||
                        location.pathname.includes('/ai-chat') ||
                        isImmersive ||
                        isFullscreenEmbed;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ fontFamily: 'var(--font-family)' }}>
      {/* ===== TOP HEADER BAR ===== */}
      <header className="shrink-0 flex items-center px-4 lg:pl-0 lg:pr-10 gap-3" style={{ backgroundColor: '#36415D', height: '55px' }}>
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-white p-1.5 hover:bg-white/10 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Logo — aligned above sidebar on desktop */}
        <div
          className="hidden lg:flex items-center justify-center shrink-0 cursor-pointer"
          style={{ width: '70px' }}
          onClick={() => navigate('/app/knowledgebase')}
        >
          <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}>F</span>
          </div>
        </div>
        <span className="text-white hidden lg:block uppercase tracking-wider cursor-pointer" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '24px', letterSpacing: '0.5px' }} onClick={() => navigate('/app/knowledgebase')}>
          ROTAX
        </span>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/app/knowledgebase')}>
          <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '16px' }}>F</span>
          </div>
          <span className="text-white hidden sm:block uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: '24px', letterSpacing: '0.5px' }}>
            ROTAX
          </span>
        </div>

        {/* Search bar - centered */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative" style={{ maxWidth: '360px', width: '100%' }}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setShowSearchModal(true); } }}
              className="w-full pl-8 pr-3 text-xs border-none outline-none text-white placeholder:text-white/50"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', height: '30px' }}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Update button */}
          <button
            className="hidden sm:flex items-center px-4 text-white text-sm hover:bg-white/10 transition-colors"
            style={{ border: '1px solid white', borderRadius: '25px', height: '32px', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Update
          </button>

          {/* Notifications */}
          <button
            className="relative p-1.5 text-white hover:bg-white/10 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifPanel(!showNotifPanel);
            }}
          >
            <Bell className="size-5" />
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive rounded-full flex items-center justify-center text-white"
              style={{ fontSize: '10px', fontWeight: 'var(--font-weight-bold)', padding: '0 4px' }}
            >
              8
            </span>
          </button>

          {/* Settings / More menu */}
          <button
            className="p-1.5 text-white hover:bg-white/10 rounded-lg hidden sm:flex"
            onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
          >
            <Settings className="size-5" />
          </button>

          {/* User avatar */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90"
              style={{ width: '32px', height: '32px', fontWeight: 'var(--font-weight-bold)', fontSize: '14px', fontFamily: "'Titillium Web', sans-serif" }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              CO
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-[10px] shadow-elevation-lg border border-border z-50 py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2">
                  <User className="size-4" /> Profile
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary flex items-center gap-2"
                  onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                >
                  <Settings className="size-4" /> Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-secondary flex items-center gap-2"
                  onClick={() => navigate('/')}
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN BODY ===== */}
      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* ===== LEFT SIDEBAR (icon nav) ===== */}
        {!isFullscreenEmbed && <nav
          className={`shrink-0 bg-card flex flex-col z-50
            ${isMobileMenuOpen
              ? 'fixed top-[55px] left-0 bottom-0 w-56 lg:w-[70px] lg:relative lg:top-0 lg:items-center'
              : 'hidden lg:flex lg:items-center w-[70px]'
            }`}
          style={{ borderRight: '1px solid #C2C9DB', paddingTop: isMobileMenuOpen ? '16px' : '0px', paddingBottom: isMobileMenuOpen ? '16px' : '40px' }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className="relative flex items-center transition-colors"
                style={{
                  color: isActive ? '#36415D' : '#7F7F7F',
                }}
                title={item.label}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{ width: '2px', height: '59px', backgroundColor: '#36415D' }}
                  />
                )}

                {/* Desktop: icon + small label stacked vertically */}
                <div className="hidden lg:flex flex-col items-center justify-center" style={{ width: '70px', paddingTop: '10px', paddingBottom: '10px', gap: '3px' }}>
                  <Icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                  <span
                    className="uppercase text-center leading-tight"
                    style={{
                      fontSize: '8px',
                      fontWeight: 'var(--font-weight-bold)',
                      letterSpacing: '0.3px',
                      width: '62px',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Mobile: icon + label horizontal */}
                <div
                  className="flex lg:hidden items-center gap-3 w-full"
                  style={{
                    padding: '12px 20px',
                    backgroundColor: isActive ? '#F0F4FF' : 'transparent',
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)' }}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Help button at bottom */}
          <div className="flex justify-center">
            <button
              className="flex items-center justify-center rounded-full transition-colors hover:opacity-100"
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#7F7F7F',
                opacity: 0.8,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-bold)',
              }}
              title="Help"
            >
              ?
            </button>
          </div>
        </nav>}

        {/* ===== RIGHT SIDEBAR PANEL (desktop only) ===== */}
        {!isDetailPage && showRecentPanel && (
          <aside
            className="hidden xl:flex shrink-0 bg-card flex-col overflow-y-auto"
            style={{ width: '371px', borderRight: '1px solid #C2C9DB', paddingTop: '10px' }}
          >
            {isRemoteSupport ? (
              /* ---- CONTACTS LIST for Remote Support ---- */
              <>
                <div className="px-4 pb-2" style={{ borderBottom: '1px solid #C2C9DB' }}>
                  <div className="flex items-center gap-2" style={{ height: '40px' }}>
                    <User className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      People
                    </span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#7F7F7F' }} />
                    <input
                      type="text"
                      placeholder="Search people..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm bg-secondary border-none outline-none text-foreground placeholder:text-muted"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {sidebarContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <div
                          className="size-9 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: contact.color, fontSize: '11px', fontWeight: 'bold' }}
                        >
                          {contact.initials}
                        </div>
                        {contact.online && (
                          <div className="absolute bottom-0 right-0 size-2.5 bg-accent rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate" style={{ fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                          {contact.name}
                        </div>
                        <div className="truncate" style={{ fontSize: '11px', color: '#7F7F7F' }}>
                          {contact.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Video className="size-3.5" />
                        </button>
                        <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Phone className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ---- FAVORITES & RECENTLY VIEWED for KB pages ---- */
              <>
                {/* Favorites */}
                <div style={{ borderBottom: '1px solid #C2C9DB' }}>
                  <button
                    className="flex items-center gap-2 w-full px-4 hover:bg-secondary/50 transition-colors"
                    style={{ height: '40px' }}
                  >
                    <Star className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 text-left uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      Favorites
                    </span>
                    <ChevronDown className="size-4" style={{ color: '#7F7F7F' }} />
                  </button>
                  <div className="px-4 pb-2">
                    {favorites.map((item, i) => (
                      <div
                        key={i}
                        className="hover:bg-secondary rounded-lg cursor-pointer transition-colors px-2"
                        style={{ paddingTop: '6px', paddingBottom: '6px' }}
                      >
                        <div className="truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                          {item.name}
                        </div>
                        <div className="truncate" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', color: '#7F7F7F' }}>
                          {item.project}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Viewed */}
                <div>
                  <button
                    className="flex items-center gap-2 w-full px-4 hover:bg-secondary/50 transition-colors"
                    style={{ height: '40px' }}
                  >
                    <Clock className="size-4" style={{ color: '#7F7F7F' }} />
                    <span
                      className="flex-1 text-left uppercase"
                      style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: '#36415D', letterSpacing: '0.5px' }}
                    >
                      Recently Viewed
                    </span>
                    <ChevronDown className="size-4" style={{ color: '#7F7F7F' }} />
                  </button>
                  <div className="px-4 pb-2">
                    {recentlyViewed.map((item, i) => (
                      <div
                        key={i}
                        className="hover:bg-secondary rounded-lg cursor-pointer transition-colors px-2"
                        style={{ paddingTop: '6px', paddingBottom: '6px' }}
                      >
                        <div className="truncate" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: '#36415D' }}>
                          {item.name}
                        </div>
                        <div className="truncate" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-normal)', color: '#7F7F7F' }}>
                          {item.project}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className={`flex-1 min-w-0 min-h-0 bg-background ${isFullscreenEmbed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Routes>
            <Route path="procedure-editor/:procedureId" element={
              <DndProvider backend={HTML5Backend}>
                <ProcedureEditor />
              </DndProvider>
            } />
            <Route path="3d-viewer" element={<App3DViewer />} />
            <Route path="knowledgebase" element={<AppKnowledgeBasePage />} />
            <Route path="project/:projectId/kb" element={<AppProjectKBPage />} />
            <Route path="project/:projectId/folder/:folderId" element={<AppFolderBrowsePage />} />
            <Route path="remote-support" element={<AppRemoteSupportPage />} />
            <Route path="ai-chat" element={<AppAIChatPage />} />
            {/* Notifications is now a side panel, not a page */}
            <Route path="immersive" element={<AppVirtualRoomPage />} />
            <Route path="*" element={<Navigate to="/app/knowledgebase" replace />} />
          </Routes>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {!isFullscreenEmbed && <nav className="lg:hidden shrink-0 bg-card flex items-center justify-around" style={{ borderTop: '1px solid #C2C9DB', height: '56px', padding: '0 4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          // Short labels for bottom nav
          const shortLabel = item.id === 'knowledgebase' ? 'Projects'
            : item.id === 'remote-support' ? 'Support'
            : item.id === 'immersive' ? 'Room'
            : item.id === 'ai-chat' ? 'AI Chat'
            : item.label;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors"
              style={{
                color: isActive ? '#2F80ED' : '#7F7F7F',
                minWidth: '48px',
                padding: '4px 6px',
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                lineHeight: '1',
              }}>
                {shortLabel}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors relative"
          style={{
            color: showNotifPanel ? '#2F80ED' : '#7F7F7F',
            minWidth: '48px',
            padding: '4px 6px',
          }}
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          <span
            className="absolute rounded-full bg-destructive"
            style={{ top: '2px', right: '8px', width: '6px', height: '6px' }}
          />
          <span style={{ fontSize: '9px', fontWeight: activeNav === 'notifications' ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)', lineHeight: '1' }}>
            Alerts
          </span>
        </button>
      </nav>}

      {/* Notifications Side Panel */}
      {showNotifPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setShowNotifPanel(false)}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-[61] bg-card flex flex-col shadow-elevation-lg"
            style={{
              width: '400px',
              maxWidth: '100vw',
              borderLeft: '1px solid #C2C9DB',
              animation: 'slide-in-right 0.25s ease-out',
            }}
          >
            {/* Close button overlaid on top-right, aligned with three-dots */}
            <button
              onClick={() => setShowNotifPanel(false)}
              className="absolute right-3 z-10 p-2 hover:bg-secondary rounded-lg transition-colors"
              style={{ color: '#7F7F7F', top: '16px' }}
            >
              <X className="size-5" />
            </button>
            {/* Content — AppNotificationsPage has its own header */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <AppNotificationsPage />
            </div>
          </div>
          <style>{`
            @keyframes slide-in-right {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && <AppSettingsModal onClose={() => setShowSettings(false)} />}

      {/* Search Modal */}
      <AppSearchModal
        isOpen={showSearchModal}
        onClose={() => { setShowSearchModal(false); setSearchQuery(''); }}
        initialQuery={searchQuery}
      />
    </div>
  );
}
