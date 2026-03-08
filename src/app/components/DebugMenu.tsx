import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bug, X, RotateCcw, ChevronRight, ChevronDown, Search, Play, FileText, Sparkles, Shield } from 'lucide-react';
import { useRole, ROLES, type UserRole } from '../contexts/RoleContext';

// Role groups — 3 sets
const roleGroups: { label: string; roles: UserRole[] }[] = [
  { label: 'Operators', roles: ['operator', 'operator-mr'] },
  { label: 'Support & Field', roles: ['field-service-engineer', 'service-support-expert', 'service-support-manager'] },
  { label: 'Content & Admin', roles: ['instructor', 'content-creator', 'admin'] },
];

interface PageLink {
  label: string;
  path: string;
  children?: PageLink[];
}

interface FeatureItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  demoSteps: number;
  /** Route that must be active for this demo to run (has an iframe with the right page) */
  route: string;
}

interface FeatureGroup {
  label: string;
  features: FeatureItem[];
}

// ==================== PAGE DATA ====================
const appPages: PageLink[] = [
  { label: 'Projects', path: '/app/knowledgebase' },
  {
    label: 'Project Knowledge Base',
    path: '/app/project/915-i-series/kb',
    children: [
      { label: 'Folder: Procedures', path: '/app/project/915-i-series/folder/f1' },
      { label: 'Folder: Protocols', path: '/app/project/915-i-series/folder/f2' },
      { label: 'Folder: Training', path: '/app/project/915-i-series/folder/f3' },
    ],
  },
  {
    label: 'Project Knowledge Base 2',
    path: '/app/project/manufacturing-alpha/kb',
  },
  { label: 'Remote Support', path: '/app/remote-support' },
  { label: 'AI Chat', path: '/app/ai-chat' },
  { label: 'Procedure Editor', path: '/app/procedure-editor/p1' },
  { label: 'Digital Twin Viewer', path: '/app/3d-viewer' },
  { label: 'Digital Twin Editor', path: '/app/3d-viewer?mode=editor' },
  { label: 'Immersive Room', path: '/app/immersive' },
  { label: 'Notifications', path: '/app/notifications' },
];

const webPages: PageLink[] = [
  { label: 'Home', path: '/web/home' },
  { label: 'Notifications', path: '/web/notifications' },
  { label: 'Remote Support', path: '/web/remote-support' },
  { label: 'AI Studio', path: '/web/ai-studio' },
  { label: 'Archive', path: '/web/archive' },
  {
    label: 'Project',
    path: '/web/project/project-phoenix/knowledgebase',
    children: [
      { label: 'Analytics', path: '/web/project/project-phoenix/analytics' },
      { label: 'Activity Log', path: '/web/project/project-phoenix/activity' },
    ],
  },
  {
    label: 'Workspace Settings',
    path: '/web/workspace/members',
    children: [
      { label: 'Groups', path: '/web/workspace/groups' },
      { label: 'Design', path: '/web/workspace/design' },
      { label: 'Remote Support', path: '/web/workspace/remote-support' },
      { label: 'Sub-Workspaces', path: '/web/workspace/subworkspaces' },
      { label: 'Pay Per Click', path: '/web/workspace/pay-per-click' },
      { label: 'SSO', path: '/web/workspace/sso' },
      { label: 'QR Codes', path: '/web/workspace/qr-codes' },
      { label: 'Integrations', path: '/web/workspace/integrations' },
    ],
  },
];

// ==================== FEATURES DATA (mirrored from debug-menu.js) ====================
const featureGroups: FeatureGroup[] = [
  {
    label: '3D Digital Twin',
    features: [
      { id: 'hotspots', name: 'Hotspot System', icon: '\u{1F4CD}', desc: 'Create, place, and manage interactive hotspots on your 3D model.', demoSteps: 14, route: '/app/3d-viewer' },
      { id: 'import-model', name: 'Import 3D Model', icon: '\u{1F4E6}', desc: 'Import 3D model files (.fbx, .obj, .glb, .gltf, .stl) into your scene.', demoSteps: 7, route: '/app/3d-viewer' },
      { id: 'import-tool', name: 'Import Tool from Library', icon: '\u{1F527}', desc: 'Browse the Toolbox Library and import tools into your scene.', demoSteps: 8, route: '/app/3d-viewer' },
      { id: 'parts-catalog', name: 'Parts Catalog', icon: '\u{1F5C2}\uFE0F', desc: 'View, search, select, and manage all parts in your scene.', demoSteps: 6, route: '/app/3d-viewer' },
      { id: 'camera', name: 'Camera & Navigation', icon: '\u{1F3A5}', desc: 'Navigate the 3D scene with orbit, pan, zoom, and focus.', demoSteps: 8, route: '/app/3d-viewer' },
      { id: 'save-preview', name: 'Save & Preview', icon: '\u{1F4BE}', desc: 'Save changes and preview the scene as end users see it.', demoSteps: 6, route: '/app/3d-viewer' },
      { id: 'grid-settings', name: 'Grid & Settings', icon: '\u2699\uFE0F', desc: 'Toggle the reference grid and configure scene settings.', demoSteps: 8, route: '/app/3d-viewer' },
      { id: 'animations', name: 'Animation Manager', icon: '\u{1F39E}\uFE0F', desc: 'Create, organize, and preview animations for your parts.', demoSteps: 8, route: '/app/3d-viewer' },
      { id: 'keyboard', name: 'Keyboard Shortcuts', icon: '\u2328\uFE0F', desc: 'Master the keyboard shortcuts to speed up your workflow.', demoSteps: 5, route: '/app/3d-viewer' },
    ],
  },
  {
    label: 'XR App',
    features: [
      { id: 'xr-login', name: 'Login & Settings', icon: '\u{1F510}', desc: 'Log in to the XR app and configure connection settings.', demoSteps: 5, route: '/xr' },
      { id: 'xr-kb', name: 'Knowledge Base', icon: '\u{1F4DA}', desc: 'Browse projects, explore KB items, and view content with media.', demoSteps: 7, route: '/xr' },
      { id: 'xr-procedures', name: 'Procedures', icon: '\u{1F4CB}', desc: 'Follow step-by-step guided procedures with media and validation.', demoSteps: 6, route: '/xr' },
      { id: 'xr-call', name: 'Remote Support & Calls', icon: '\u{1F4DE}', desc: 'Start a remote support call with video, chat, and participants.', demoSteps: 6, route: '/xr' },
      { id: 'xr-camera', name: 'XR Camera & Navigation', icon: '\u{1F3A5}', desc: 'Navigate the XR camera view with drag and keyboard controls.', demoSteps: 4, route: '/xr' },
    ],
  },
];

type TabId = 'pages' | 'features' | 'roles';

export function DebugMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole, setRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('pages');
  // Start with all feature groups, page parents, and web workspace children expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Expand all feature groups
    featureGroups.forEach(g => initial.add(g.label));
    // Expand all page entries that have children
    [...appPages, ...webPages].forEach(p => { if (p.children) initial.add(p.path); });
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingDemoRef = useRef<string | null>(null);

  // Shift+F to toggle debug menu with search focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'F' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        setIsOpen(prev => {
          const next = !prev;
          if (next) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
          return next;
        });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for iframe messages: toggle hotkey forwarding + demo auto-start + URL sync
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'debugToggle') {
        setIsOpen(prev => {
          const next = !prev;
          if (next) setTimeout(() => searchInputRef.current?.focus(), 50);
          return next;
        });
      }
      if (e.data?.type === 'debugFeatures' && pendingDemoRef.current) {
        const featureId = pendingDemoRef.current;
        pendingDemoRef.current = null;
        setTimeout(() => {
          const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'debugStartDemo', featureId }, '*');
          }
        }, 300);
      }
      // Sync demo state to URL bar
      if (e.data?.type === 'debugDemoStarted') {
        const url = new URL(window.location.href);
        url.searchParams.set('demo', e.data.featureId);
        history.replaceState(null, '', url.toString());
      }
      if (e.data?.type === 'debugDemoEnded') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('demo')) {
          url.searchParams.delete('demo');
          history.replaceState(null, '', url.toString());
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const currentPath = location.pathname + location.search;
  const currentPathname = location.pathname;

  // Auto-start demo from URL ?demo=featureId
  const autoStartedRef = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demoId = params.get('demo');
    if (demoId && demoId !== autoStartedRef.current) {
      for (const group of featureGroups) {
        const feat = group.features.find(f => f.id === demoId);
        if (feat) {
          const alreadyOnPage = currentPathname === feat.route || currentPathname.startsWith(feat.route + '/');
          if (alreadyOnPage) {
            autoStartedRef.current = demoId;
            // Use pendingDemoRef so demo starts when iframe reports ready
            pendingDemoRef.current = feat.id;
          } else {
            pendingDemoRef.current = feat.id;
            autoStartedRef.current = demoId;
            navigate(`${feat.route}?demo=${feat.id}`);
          }
          break;
        }
      }
    }
  }, [location.search, currentPathname, navigate]);
  const isApp = currentPathname.startsWith('/app');
  const isWeb = currentPathname.startsWith('/web');
  const isXR = currentPathname.startsWith('/xr');

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const startDemo = useCallback((feat: FeatureItem) => {
    // Check if we're already on the right page
    const alreadyOnPage = currentPathname === feat.route || currentPathname.startsWith(feat.route + '/');
    if (alreadyOnPage) {
      // Directly send to iframe
      const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'debugStartDemo', featureId: feat.id }, '*');
      }
    } else {
      // Navigate first, then the postMessage listener will fire the demo when the iframe reports ready
      pendingDemoRef.current = feat.id;
      navigate(`${feat.route}?demo=${feat.id}`);
    }
    setIsOpen(false);
  }, [currentPathname, navigate]);

  const getFirstMatch = (pages: PageLink[], query: string): PageLink | null => {
    if (!query) return null;
    const q = query.toLowerCase();
    for (const page of pages) {
      if (page.label.toLowerCase().includes(q) || page.path.toLowerCase().includes(q)) return page;
      if (page.children) {
        const child = getFirstMatch(page.children, query);
        if (child) return child;
      }
    }
    return null;
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery) {
      // Global: try pages first, then features
      const allPages = [...appPages, ...webPages];
      const pageMatch = getFirstMatch(allPages, searchQuery);
      if (pageMatch) {
        handleNavigate(pageMatch.path);
        setSearchQuery('');
        return;
      }
      // Try first feature match
      const q = searchQuery.toLowerCase();
      for (const group of featureGroups) {
        const feat = group.features.find(f => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
        if (feat) {
          startDemo(feat);
          setSearchQuery('');
          return;
        }
      }
      // Try first role match
      for (const group of roleGroups) {
        const roleId = group.roles.find(r => ROLES[r].label.toLowerCase().includes(q) || ROLES[r].description.toLowerCase().includes(q));
        if (roleId) {
          setRole(roleId);
          setSearchQuery('');
          return;
        }
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const filterPages = (pages: PageLink[], query: string): PageLink[] => {
    if (!query) return pages;
    const q = query.toLowerCase();
    return pages.reduce<PageLink[]>((acc, page) => {
      const matchesSelf = page.label.toLowerCase().includes(q) || page.path.toLowerCase().includes(q);
      const filteredChildren = page.children ? filterPages(page.children, query) : [];
      if (matchesSelf || filteredChildren.length > 0) {
        acc.push({ ...page, children: filteredChildren.length > 0 ? filteredChildren : page.children });
      }
      return acc;
    }, []);
  };

  const filterFeatureGroups = (groups: FeatureGroup[], query: string): FeatureGroup[] => {
    if (!query) return groups;
    const q = query.toLowerCase();
    return groups.reduce<FeatureGroup[]>((acc, group) => {
      const filtered = group.features.filter(f => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
      if (filtered.length > 0) acc.push({ ...group, features: filtered });
      return acc;
    }, []);
  };

  const renderPageList = (pages: PageLink[], indent = 0) => {
    return pages.map((page) => {
      const isActive = currentPath === page.path;
      const isExpanded = expandedSections.has(page.path);
      const hasChildren = page.children && page.children.length > 0;

      return (
        <div key={page.path}>
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded transition-colors"
            style={{ paddingLeft: `${8 + indent * 12}px`, paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px' }}
          >
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleSection(page.path); }}
                className="shrink-0 p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown style={{ width: '14px', height: '14px', color: '#868D9E' }} />
                ) : (
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#868D9E' }} />
                )}
              </button>
            )}
            {!hasChildren && <div style={{ width: '16px' }} />}
            <button
              onClick={() => handleNavigate(page.path)}
              className="flex-1 text-left truncate"
              style={{
                fontSize: '13px',
                color: isActive ? '#2F80ED' : '#36415D',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              {page.label}
            </button>
          </div>
          {hasChildren && isExpanded && renderPageList(page.children!, indent + 1)}
        </div>
      );
    });
  };

  const filteredGroups = filterFeatureGroups(featureGroups, searchQuery);

  // Filter roles by search query
  const filterRoleGroups = (query: string) => {
    if (!query) return roleGroups;
    const q = query.toLowerCase();
    return roleGroups.reduce<{ label: string; roles: UserRole[] }[]>((acc, group) => {
      const filtered = group.roles.filter(r =>
        ROLES[r].label.toLowerCase().includes(q) || ROLES[r].description.toLowerCase().includes(q)
      );
      if (filtered.length > 0) acc.push({ ...group, roles: filtered });
      return acc;
    }, []);
  };

  // Count flat page matches (including children)
  const countPages = (pages: PageLink[]): number => {
    let count = 0;
    for (const p of pages) {
      count++;
      if (p.children) count += countPages(p.children);
    }
    return count;
  };

  const filteredRoleGroups = filterRoleGroups(searchQuery);
  const filteredAppPages = filterPages(appPages, searchQuery);
  const filteredWebPages = filterPages(webPages, searchQuery);
  const hasPageResults = searchQuery && (filteredAppPages.length > 0 || filteredWebPages.length > 0);
  const hasFeatureResults = searchQuery && filteredGroups.length > 0;
  const hasRoleResults = searchQuery && filteredRoleGroups.length > 0;
  const isGlobalSearch = !!searchQuery;
  const totalPageCount = countPages(filteredAppPages) + countPages(filteredWebPages);
  const totalFeatureCount = filteredGroups.reduce((s, g) => s + g.features.length, 0);
  const totalRoleCount = filteredRoleGroups.reduce((s, g) => s + g.roles.length, 0);
  const noResults = isGlobalSearch && !hasPageResults && !hasFeatureResults && !hasRoleResults;

  return createPortal(
    <>
      {/* Debug toggle button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
        className="fixed z-[9999] flex items-center justify-center transition-all hover:scale-110"
        style={{
          bottom: '16px',
          right: '16px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isOpen ? '#FF1F1F' : '#36415D',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
        title="Debug Menu (Shift+F)"
      >
        {isOpen ? (
          <X style={{ width: '16px', height: '16px', color: 'white' }} />
        ) : (
          <Bug style={{ width: '16px', height: '16px', color: 'white' }} />
        )}
      </button>

      {/* Debug panel — fixed size, scrollable content */}
      {isOpen && (
        <div
          className="fixed z-[9998] flex flex-col"
          style={{
            bottom: '60px',
            right: '16px',
            width: '320px',
            height: '520px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C2C9DB',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{ padding: '10px 12px', borderBottom: '1px solid #E9E9E9' }}
          >
            <div className="flex items-center gap-2">
              <Bug style={{ width: '14px', height: '14px', color: '#8404B3' }} />
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#36415D' }}>
                Debug Menu
              </span>
            </div>
            <button
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              style={{ fontSize: '12px', color: '#FF1F1F', border: '1px solid #FF1F1F33', borderRadius: '6px' }}
              title="Restart — go to product selector"
            >
              <RotateCcw style={{ width: '10px', height: '10px' }} />
              Restart
            </button>
          </div>

          {/* Current route */}
          <div
            className="shrink-0"
            style={{ padding: '6px 12px', borderBottom: '1px solid #E9E9E9', backgroundColor: '#F5F5F5' }}
          >
            <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Current Route
            </div>
            <div style={{ fontSize: '12px', color: '#2F80ED', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {currentPath}
            </div>
          </div>

          {/* Pages / Features / Roles tabs */}
          <div
            className="flex shrink-0"
            style={{ borderBottom: '1px solid #E9E9E9' }}
          >
            {([
              { id: 'pages' as TabId, label: 'Pages', Icon: FileText, activeColor: '#2F80ED' },
              { id: 'features' as TabId, label: 'Demos', Icon: Sparkles, activeColor: '#8404B3' },
              { id: 'roles' as TabId, label: 'Roles', Icon: Shield, activeColor: '#11E874' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-center transition-colors hover:bg-black/5"
                style={{
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  color: activeTab === tab.id ? tab.activeColor : '#868D9E',
                  borderBottom: activeTab === tab.id
                    ? `2px solid ${tab.activeColor}`
                    : '2px solid transparent',
                }}
              >
                <tab.Icon style={{ width: '13px', height: '13px' }} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search — global across all tabs */}
          <div className="shrink-0" style={{ padding: '6px 8px', borderBottom: '1px solid #E9E9E9' }}>
            <div className="flex items-center gap-1.5 rounded" style={{ padding: '4px 6px', border: '1px solid #C2C9DB', backgroundColor: '#F5F5F5' }}>
              <Search style={{ width: '14px', height: '14px', color: '#868D9E', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search pages, demos, roles..."
                className="flex-1 bg-transparent outline-none border-none"
                style={{ fontSize: '13px', color: '#36415D' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="shrink-0">
                  <X style={{ width: '12px', height: '12px', color: '#868D9E' }} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '4px 0' }}>

            {/* ==================== GLOBAL SEARCH RESULTS ==================== */}
            {isGlobalSearch ? (
              <div style={{ padding: '0 4px' }}>
                {noResults && (
                  <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '13px', color: '#868D9E' }}>
                    No results for "{searchQuery}"
                  </div>
                )}

                {/* Page results */}
                {hasPageResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <FileText style={{ width: '12px', height: '12px', color: '#2F80ED' }} />
                      <span style={{ fontSize: '11px', color: '#2F80ED', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        Pages
                      </span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalPageCount}</span>
                    </div>
                    {filteredAppPages.length > 0 && (
                      <>
                        <div style={{ fontSize: '10px', color: '#868D9E', padding: '2px 8px 2px 20px', fontWeight: 600 }}>APP</div>
                        {renderPageList(filteredAppPages)}
                      </>
                    )}
                    {filteredWebPages.length > 0 && (
                      <>
                        <div style={{ fontSize: '10px', color: '#868D9E', padding: '2px 8px 2px 20px', fontWeight: 600 }}>WEB</div>
                        {renderPageList(filteredWebPages)}
                      </>
                    )}
                  </div>
                )}

                {/* Feature results */}
                {hasFeatureResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <Sparkles style={{ width: '12px', height: '12px', color: '#8404B3' }} />
                      <span style={{ fontSize: '11px', color: '#8404B3', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        Demos
                      </span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalFeatureCount}</span>
                    </div>
                    {filteredGroups.map((group) => (
                      <div key={group.label}>
                        {group.features.map((feat) => {
                          const isOnPage = currentPathname === feat.route || currentPathname.startsWith(feat.route + '/');
                          return (
                            <div
                              key={feat.id}
                              className="flex items-center gap-2 rounded cursor-pointer hover:bg-purple-50 transition-colors"
                              style={{ padding: '5px 8px 5px 20px' }}
                              onClick={() => startDemo(feat)}
                            >
                              <span style={{ fontSize: '14px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{feat.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div style={{ fontSize: '13px', color: '#36415D', fontWeight: 500 }}>{feat.name}</div>
                                <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat.desc}</div>
                              </div>
                              <div
                                className="flex items-center gap-1 shrink-0 rounded"
                                style={{
                                  padding: '2px 6px',
                                  backgroundColor: isOnPage ? '#F3E8FF' : '#F5F5F5',
                                  color: isOnPage ? '#8404B3' : '#868D9E',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                }}
                              >
                                <Play style={{ width: '10px', height: '10px', fill: isOnPage ? '#8404B3' : '#868D9E' }} />
                                {feat.demoSteps}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Role results */}
                {hasRoleResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <Shield style={{ width: '12px', height: '12px', color: '#11E874' }} />
                      <span style={{ fontSize: '11px', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                        Roles
                      </span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalRoleCount}</span>
                    </div>
                    {filteredRoleGroups.map((group) => (
                      <div key={group.label}>
                        {group.roles.map((roleId) => {
                          const role = ROLES[roleId];
                          const isActive = currentRole === roleId;
                          return (
                            <button
                              key={roleId}
                              onClick={() => { setRole(roleId); setSearchQuery(''); }}
                              className="flex items-center gap-2 w-full rounded transition-colors"
                              style={{
                                padding: '5px 8px 5px 20px',
                                backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? '#E8F5E9' : 'transparent'; }}
                            >
                              <div
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '50%',
                                  border: isActive ? '2px solid #11E874' : '2px solid #C2C9DB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {isActive && (
                                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#11E874' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div style={{ fontSize: '13px', color: isActive ? '#36415D' : '#5E677D', fontWeight: isActive ? 'bold' : 'normal' }}>
                                  {role.label}
                                </div>
                                <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {role.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            /* ==================== TAB-SPECIFIC CONTENT (no search) ==================== */
            <>
            {/* ==================== PAGES TAB ==================== */}
            {activeTab === 'pages' && (
              <div style={{ padding: '0 4px' }}>
                {/* Platform nav tabs */}
                <div className="flex shrink-0" style={{ margin: '2px 4px 6px', borderBottom: '1px solid #E9E9E9' }}>
                  {[
                    { label: 'Selector', path: '/', active: !isApp && !isWeb && !isXR },
                    { label: 'App', path: '/app/knowledgebase', active: isApp },
                    { label: 'Web', path: '/web/home', active: isWeb },
                    { label: 'XR', path: '/xr', active: isXR },
                  ].map((tab) => (
                    <button
                      key={tab.label}
                      onClick={() => handleNavigate(tab.path)}
                      className="flex-1 py-1 text-center transition-colors hover:bg-black/5"
                      style={{
                        fontSize: '11px',
                        fontWeight: tab.active ? 'bold' : 'normal',
                        color: tab.active ? '#2F80ED' : '#868D9E',
                        borderBottom: tab.active ? '2px solid #2F80ED' : '2px solid transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {isApp && (
                  <>
                    <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', marginBottom: '2px', fontWeight: 700 }}>
                      App Pages
                    </div>
                    {renderPageList(appPages)}
                  </>
                )}
                {isWeb && (
                  <>
                    <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', marginBottom: '2px', fontWeight: 700 }}>
                      Web Pages
                    </div>
                    {renderPageList(webPages)}
                  </>
                )}
                {!isApp && !isWeb && (
                  <>
                    <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', marginBottom: '4px', fontWeight: 700 }}>
                      Platforms
                    </div>
                    {[
                      { label: 'Open App Design', path: '/app/knowledgebase' },
                      { label: 'Open Web Design', path: '/web/home' },
                      { label: 'Open XR Design', path: '/xr' },
                    ].map((item) => (
                      <div
                        key={item.path}
                        className="cursor-pointer hover:bg-black/5 rounded transition-colors"
                        style={{ padding: '4px 8px' }}
                      >
                        <button onClick={() => handleNavigate(item.path)} style={{ fontSize: '13px', color: '#36415D' }}>
                          {item.label}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ==================== FEATURES TAB ==================== */}
            {activeTab === 'features' && (
              <div style={{ padding: '0 4px' }}>
                {featureGroups.map((group) => {
                  const isExpanded = expandedSections.has(group.label);
                  return (
                    <div key={group.label} style={{ marginBottom: '2px' }}>
                      <button
                        onClick={() => toggleSection(group.label)}
                        className="flex items-center gap-1.5 w-full hover:bg-black/5 rounded transition-colors"
                        style={{ padding: '5px 8px' }}
                      >
                        {isExpanded ? (
                          <ChevronDown style={{ width: '12px', height: '12px', color: '#8404B3' }} />
                        ) : (
                          <ChevronRight style={{ width: '12px', height: '12px', color: '#8404B3' }} />
                        )}
                        <span style={{ fontSize: '12px', color: '#8404B3', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                          {group.label}
                        </span>
                        <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>
                          {group.features.length}
                        </span>
                      </button>
                      {isExpanded && group.features.map((feat) => {
                        const isOnPage = currentPathname === feat.route || currentPathname.startsWith(feat.route + '/');
                        return (
                          <div
                            key={feat.id}
                            className="flex items-center gap-2 rounded cursor-pointer hover:bg-purple-50 transition-colors"
                            style={{ padding: '5px 8px 5px 24px' }}
                            onClick={() => startDemo(feat)}
                            title={isOnPage ? `Start demo (${feat.demoSteps} steps)` : `Navigate to ${feat.route} and start demo`}
                          >
                            <span style={{ fontSize: '14px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{feat.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: '13px', color: '#36415D', fontWeight: 500 }}>{feat.name}</div>
                              <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat.desc}</div>
                            </div>
                            <div
                              className="flex items-center gap-1 shrink-0 rounded"
                              style={{
                                padding: '2px 6px',
                                backgroundColor: isOnPage ? '#F3E8FF' : '#F5F5F5',
                                color: isOnPage ? '#8404B3' : '#868D9E',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              <Play style={{ width: '10px', height: '10px', fill: isOnPage ? '#8404B3' : '#868D9E' }} />
                              {feat.demoSteps}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== ROLES TAB ==================== */}
            {activeTab === 'roles' && (
              <div style={{ padding: '4px 4px' }}>
                {/* Current role badge */}
                <div
                  style={{
                    margin: '0 4px 8px',
                    padding: '8px 10px',
                    backgroundColor: '#F0FFF4',
                    border: '1px solid #11E87444',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
                    Active Role
                  </div>
                  <div style={{ fontSize: '14px', color: '#36415D', fontWeight: 'bold' }}>
                    {ROLES[currentRole].label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#868D9E', marginTop: '2px' }}>
                    {ROLES[currentRole].description}
                  </div>
                </div>

                {/* Role groups */}
                {roleGroups.map((group) => (
                  <div key={group.label} style={{ marginBottom: '6px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#868D9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '4px 8px',
                        fontWeight: 700,
                      }}
                    >
                      {group.label}
                    </div>
                    {group.roles.map((roleId) => {
                      const role = ROLES[roleId];
                      const isActive = currentRole === roleId;
                      return (
                        <button
                          key={roleId}
                          onClick={() => setRole(roleId)}
                          className="flex items-center gap-2 w-full rounded transition-colors"
                          style={{
                            padding: '6px 8px',
                            backgroundColor: isActive ? '#E8F5E9' : 'transparent',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          {/* Radio indicator */}
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: isActive ? '2px solid #11E874' : '2px solid #C2C9DB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isActive && (
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#11E874' }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div style={{
                              fontSize: '13px',
                              color: isActive ? '#36415D' : '#5E677D',
                              fontWeight: isActive ? 'bold' : 'normal',
                            }}>
                              {role.label}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#868D9E',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {role.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </div>

          {/* Footer */}
          <div
            className="shrink-0 flex items-center justify-between"
            style={{ padding: '6px 12px', borderTop: '1px solid #E9E9E9', backgroundColor: '#F5F5F5' }}
          >
            <span style={{ fontSize: '11px', color: '#868D9E' }}>
              Shift+F to toggle
            </span>
            <span style={{ fontSize: '11px', color: '#868D9E' }}>
              Debug · Mockup Design
            </span>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
