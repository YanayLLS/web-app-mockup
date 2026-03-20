import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bug, X, RotateCcw, ChevronRight, ChevronDown, ChevronUp, Search, Play, FileText,
  Sparkles, Shield, Share2, Check, Copy, Star, Clock, Monitor, Tablet, Smartphone,
  Zap, Camera, Trash2, Square, SkipForward, ArrowLeftRight, ListOrdered,
} from 'lucide-react';
import { useRole, ROLES, type UserRole } from '../contexts/RoleContext';

// ==================== TYPES ====================
interface PageLink { label: string; path: string; children?: PageLink[]; }
interface FeatureItem { id: string; name: string; icon: string; desc: string; demoSteps: number; route: string; }
interface FeatureGroup { label: string; features: FeatureItem[]; }
interface StateSnapshot { id: string; name: string; ts: number; route: string; role: UserRole; }
interface PaletteCmd { id: string; label: string; desc: string; category: string; action: () => void; }

// ==================== CONSTANTS ====================
const LS = { RECENT: 'dbg-recent', DONE: 'dbg-done', PINS: 'dbg-pins', SNAPS: 'dbg-snaps' };
function lsGet<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } }

const roleGroups: { label: string; roles: UserRole[] }[] = [
  { label: 'External', roles: ['guest'] },
  { label: 'Operators', roles: ['operator', 'operator-mr'] },
  { label: 'Support & Field', roles: ['field-service-engineer', 'service-support-expert', 'service-support-manager'] },
  { label: 'Content & Admin', roles: ['instructor', 'content-creator', 'admin'] },
];

// ==================== PAGE DATA ====================
const appPages: PageLink[] = [
  { label: 'Projects', path: '/app/knowledgebase' },
  { label: 'Knowledge Base', path: '/app/project/915-i-series/kb' },
  { label: 'Remote Support', path: '/app/remote-support' },
  { label: 'AI Chat', path: '/app/ai-chat' },
  { label: '3D Flow (Edit)', path: '/app/procedure-editor/p1' },
  { label: '3D Flow (View)', path: '/app/procedure-editor/generator-maintenance?mode=view' },
  { label: 'Digital Twin Viewer', path: '/app/3d-viewer' },
  { label: 'Digital Twin Editor', path: '/app/3d-viewer?mode=editor' },
  { label: 'Immersive Room', path: '/app/immersive' },
];

const webPages: PageLink[] = [
  { label: 'Home', path: '/web/home' },
  { label: 'Notifications', path: '/web/notifications' },
  { label: 'Remote Support', path: '/web/remote-support', children: [
    { label: 'Simulate: Incoming Call', path: '/web/remote-support?sim=incoming-call' },
    { label: 'Simulate: Waiting Room', path: '/web/remote-support?sim=waiting-room' },
    { label: 'Simulate: Post-Call Summary', path: '/web/remote-support?sim=post-call-summary' },
    { label: 'Simulate: Recording in Progress', path: '/web/remote-support?sim=recording' },
    { label: 'Simulate: Poor Connection', path: '/web/remote-support?sim=poor-connection' },
    { label: 'Simulate: Waiting Room Participant (in call)', path: '/web/remote-support?sim=waiting-participant' },
  ]},
  { label: 'AI Studio', path: '/web/ai-studio' },
  { label: 'Archive', path: '/web/archive' },
  { label: 'Project', path: '/web/project/915-i-series/knowledgebase', children: [
    { label: 'Analytics', path: '/web/project/915-i-series/analytics' },
    { label: 'Activity Log', path: '/web/project/915-i-series/activity' },
    { label: 'Media Library', path: '/web/project/915-i-series/knowledgebase?medialib=1' },
    { label: 'Settings', path: '/web/project/915-i-series/knowledgebase?settings=1' },
    { label: 'Flow Editor (Canvas)', path: '/web/project/915-i-series/knowledgebase?canvas=915-i-series-kb-1-1' },
    { label: 'Flow Modal', path: '/web/project/915-i-series/knowledgebase?open=915-i-series-kb-1-1' },
    { label: 'Digital Twin Modal', path: '/web/project/915-i-series/knowledgebase?twin=915-i-series-kb-4' },
  ]},
  { label: 'Workspace Settings', path: '/web/workspace/members', children: [
    { label: 'Groups', path: '/web/workspace/groups' },
    { label: 'Design', path: '/web/workspace/design' },
    { label: 'Remote Support', path: '/web/workspace/remote-support' },
    { label: 'Sub-Workspaces', path: '/web/workspace/subworkspaces' },
    { label: 'Pay Per Click', path: '/web/workspace/pay-per-click' },
    { label: 'SSO', path: '/web/workspace/sso' },
    { label: 'QR Codes', path: '/web/workspace/qr-codes' },
    { label: 'Integrations', path: '/web/workspace/integrations' },
  ]},
];

// ==================== FEATURES DATA ====================
const featureGroups: FeatureGroup[] = [
  { label: '3D Digital Twin', features: [
    { id: 'hotspots', name: 'Hotspot System', icon: '\u{1F4CD}', desc: 'Create, place, and manage interactive hotspots on your 3D model.', demoSteps: 14, route: '/app/3d-viewer' },
    { id: 'import-model', name: 'Import 3D Model', icon: '\u{1F4E6}', desc: 'Import 3D model files (.fbx, .obj, .glb, .gltf, .stl) into your scene.', demoSteps: 7, route: '/app/3d-viewer' },
    { id: 'import-tool', name: 'Import Tool from Library', icon: '\u{1F527}', desc: 'Browse the Toolbox Library and import tools into your scene.', demoSteps: 8, route: '/app/3d-viewer' },
    { id: 'parts-catalog', name: 'Parts Catalog', icon: '\u{1F5C2}\uFE0F', desc: 'View, search, select, and manage all parts in your scene.', demoSteps: 6, route: '/app/3d-viewer' },
    { id: 'camera', name: 'Camera & Navigation', icon: '\u{1F3A5}', desc: 'Navigate the 3D scene with orbit, pan, zoom, and focus.', demoSteps: 8, route: '/app/3d-viewer' },
    { id: 'save-preview', name: 'Save & Preview', icon: '\u{1F4BE}', desc: 'Save changes and preview the scene as end users see it.', demoSteps: 6, route: '/app/3d-viewer' },
    { id: 'grid-settings', name: 'Grid & Settings', icon: '\u2699\uFE0F', desc: 'Toggle the reference grid and configure scene settings.', demoSteps: 8, route: '/app/3d-viewer' },
    { id: 'animations', name: 'Animation Manager', icon: '\u{1F39E}\uFE0F', desc: 'Create, organize, and preview animations for your parts.', demoSteps: 8, route: '/app/3d-viewer' },
    { id: 'keyboard', name: 'Keyboard Shortcuts', icon: '\u2328\uFE0F', desc: 'Master the keyboard shortcuts to speed up your workflow.', demoSteps: 5, route: '/app/3d-viewer' },
    { id: 'dt-configurations', name: 'Configurations', icon: '\u{1F39B}\uFE0F', desc: 'Create and manage digital twin configurations — define part visibility, tags, permissions, folders, and import/export configs.', demoSteps: 22, route: '/app/3d-viewer' },
  ]},
  { label: 'XR App', features: [
    { id: 'xr-login', name: 'Login & Settings', icon: '\u{1F510}', desc: 'Log in to the XR app and configure connection settings.', demoSteps: 5, route: '/xr' },
    { id: 'xr-kb', name: 'Knowledge Base', icon: '\u{1F4DA}', desc: 'Browse projects, explore KB items, and view content with media.', demoSteps: 7, route: '/xr' },
    { id: 'xr-procedures', name: 'Flows', icon: '\u{1F4CB}', desc: 'Follow step-by-step guided flows with media and validation.', demoSteps: 6, route: '/xr' },
    { id: 'xr-call', name: 'Remote Support & Calls', icon: '\u{1F4DE}', desc: 'Start a remote support call with video, chat, and participants.', demoSteps: 6, route: '/xr' },
    { id: 'xr-camera', name: 'XR Camera & Navigation', icon: '\u{1F3A5}', desc: 'Navigate the XR camera view with drag and keyboard controls.', demoSteps: 4, route: '/xr' },
  ]},
  { label: 'Procedures', features: [
    { id: 'proc-twin-state', name: 'Set State of a Digital Twin', icon: '\u{1F4BE}', desc: 'Save and restore the 3D scene state (camera, visibility, X-Ray) per procedure step.', demoSteps: 5, route: '/app/procedure-editor/p1' },
  ]},
  { label: 'App', features: [
    { id: 'kb-config-selection', name: 'Open DT with Configuration', icon: '\u{1F39B}\uFE0F', desc: 'Open a digital twin from the Knowledge Base and select a configuration.', demoSteps: 6, route: '/app/project/generator/kb' },
  ]},
];

const allFeatures = featureGroups.flatMap(g => g.features);


// ==================== VIEWPORT PRESETS ====================
const viewportPresets = [
  { id: 'desktop', label: 'Desktop', w: 1440, Icon: Monitor },
  { id: 'tablet', label: 'Tablet', w: 768, Icon: Tablet },
  { id: 'phone', label: 'Phone', w: 375, Icon: Smartphone },
];

type TabId = 'pages' | 'features' | 'roles';

// ==================== COMPONENT ====================
export function DebugMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole, setRole } = useRole();

  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('pages');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const s = new Set<string>();
    featureGroups.forEach(g => s.add(g.label));
    [...appPages, ...webPages].forEach(p => { if (p.children) s.add(p.path); });
    return s;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDemoId, setCopiedDemoId] = useState<string | null>(null);

  // Feature 1: Command palette
  const isCommandMode = searchQuery.startsWith('>');
  const cmdQuery = isCommandMode ? searchQuery.slice(1).trim().toLowerCase() : '';

  // Feature 3: State snapshots
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>(() => lsGet(LS.SNAPS, []));
  const [snapName, setSnapName] = useState('');

  // Feature 4: Recent pages
  const [recentPages, setRecentPages] = useState<string[]>(() => lsGet(LS.RECENT, []));

  // Feature 5: Demo completion
  const [completedDemos, setCompletedDemos] = useState<string[]>(() => lsGet(LS.DONE, []));

  // Feature 6: Viewport
  const [activeViewport, setActiveViewport] = useState<string | null>(null);
  const [vpSize, setVpSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Feature 7: Role A/B
  const [compareRole, setCompareRole] = useState<UserRole | null>(null);

  // Feature 8: Keyboard nav
  const [focusedIdx, setFocusedIdx] = useState(-1);

  // Feature 9: Pinned items
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => lsGet(LS.PINS, []));


  // Feature 12: Auto-hide button
  const [btnIdle, setBtnIdle] = useState(false);

  // Feature 14: Collapsible route
  const [routeCollapsed, setRouteCollapsed] = useState(false);

  // Feature 11: Copy route feedback
  const [routeCopied, setRouteCopied] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingDemoRef = useRef<string | null>(null);
  const autoStartedRef = useRef<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const itemIdxRef = useRef(0);

  const currentPath = location.pathname + location.search;
  const currentPathname = location.pathname;
  const isApp = currentPathname.startsWith('/app');
  const isWeb = currentPathname.startsWith('/web');
  const isXR = currentPathname.startsWith('/xr');

  // ==================== HELPERS ====================
  const isPinned = (key: string) => pinnedItems.includes(key);
  const togglePin = (key: string) => {
    const next = isPinned(key) ? pinnedItems.filter(k => k !== key) : [...pinnedItems, key];
    setPinnedItems(next);
    lsSet(LS.PINS, next);
  };
  const isDemoComplete = (id: string) => completedDemos.includes(id);
  const markDemoComplete = useCallback((id: string) => {
    setCompletedDemos(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      lsSet(LS.DONE, next);
      return next;
    });
  }, []);

  const countPages = (pages: PageLink[]): number => {
    let c = 0; for (const p of pages) { c++; if (p.children) c += countPages(p.children); } return c;
  };
  const totalAppPages = countPages(appPages);
  const totalWebPages = countPages(webPages);
  const totalFeatures = allFeatures.length;
  const totalRoles = roleGroups.reduce((s, g) => s + g.roles.length, 0);

  // ==================== NAVIGATION ====================
  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const startDemo = useCallback((feat: FeatureItem, keepOpen = false) => {
    const isParentDemo = feat.id.startsWith('proc-');
    const isKBDemo = feat.id.startsWith('kb-');
    const featPath = feat.route.split('?')[0]; // strip query params for comparison
    const onPage = currentPathname === featPath || currentPathname.startsWith(featPath + '/')
      || (isParentDemo && currentPathname.startsWith('/app/procedure-editor/'));
    if (onPage) {
      if (isKBDemo) {
        // KB demos run in the React parent on the KB page
        window.dispatchEvent(new CustomEvent('kb-demo-start', { detail: { featureId: feat.id } }));
      } else if (isParentDemo) {
        // Procedure demos run in the React parent, not the iframe
        window.dispatchEvent(new CustomEvent('procedure-demo-start', { detail: { featureId: feat.id } }));
      } else {
        const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
        if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'debugStartDemo', featureId: feat.id }, '*');
      }
    } else {
      pendingDemoRef.current = feat.id;
      navigate(`${feat.route}?demo=${feat.id}`);
    }
    if (!keepOpen) setIsOpen(false);
  }, [currentPathname, navigate]);


  // ==================== SNAPSHOTS ====================
  const saveSnapshot = () => {
    const name = snapName.trim() || `Snapshot ${snapshots.length + 1}`;
    const snap: StateSnapshot = { id: Date.now().toString(), name, ts: Date.now(), route: currentPath, role: currentRole };
    const next = [snap, ...snapshots].slice(0, 20);
    setSnapshots(next); lsSet(LS.SNAPS, next); setSnapName('');
  };
  const restoreSnapshot = (snap: StateSnapshot) => {
    setRole(snap.role); navigate(snap.route); setShowSnapshots(false);
  };
  const deleteSnapshot = (id: string) => {
    const next = snapshots.filter(s => s.id !== id);
    setSnapshots(next); lsSet(LS.SNAPS, next);
  };

  // ==================== ROLE A/B ====================
  const toggleRoleAB = () => {
    if (!compareRole) return;
    const prev = currentRole;
    setRole(compareRole);
    setCompareRole(prev);
  };

  // ==================== COPY ROUTE ====================
  const copyRoute = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setRouteCopied(true); setTimeout(() => setRouteCopied(false), 1500);
    });
  };

  // ==================== SHARE DEMO LINK ====================
  const shareDemoLink = (feat: FeatureItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.origin + import.meta.env.BASE_URL + feat.route.slice(1));
    url.searchParams.set('demo', feat.id);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedDemoId(feat.id); setTimeout(() => setCopiedDemoId(null), 2000);
    });
  };

  // ==================== VIEWPORT ====================
  const setViewport = (presetId: string | null) => {
    setActiveViewport(presetId);
    const preset = viewportPresets.find(p => p.id === presetId);
    window.dispatchEvent(new CustomEvent('debug-viewport', { detail: { width: preset?.w ?? null, preset: presetId } }));
    // Apply constrained viewport to the app root container
    const root = document.getElementById('app-root');
    if (root) {
      if (preset) {
        root.style.width = `${preset.w}px`;
        root.style.maxWidth = `${preset.w}px`;
        root.style.margin = '0 auto';
        root.style.boxShadow = '0 0 0 1px #C2C9DB, 0 8px 32px rgba(54,65,93,.15)';
        root.style.overflow = 'hidden';
        root.style.height = '100vh';
        document.body.style.backgroundColor = '#E0E0E0';
        document.body.style.overflow = 'hidden';
        setVpSize({ w: preset.w, h: window.innerHeight });
      } else {
        root.style.width = '';
        root.style.maxWidth = '';
        root.style.margin = '';
        root.style.boxShadow = '';
        root.style.overflow = '';
        root.style.height = '';
        document.body.style.backgroundColor = '';
        document.body.style.overflow = '';
        setVpSize({ w: window.innerWidth, h: window.innerHeight });
      }
    }
    if (preset) document.documentElement.style.setProperty('--debug-viewport-width', `${preset.w}px`);
    else document.documentElement.style.removeProperty('--debug-viewport-width');
  };

  // ==================== COMMAND PALETTE ====================
  const commands: PaletteCmd[] = useMemo(() => {
    const cmds: PaletteCmd[] = [
      { id: 'copy-route', label: 'Copy Current Route', desc: currentPath, category: 'Nav', action: copyRoute },
      { id: 'restart', label: 'Clear Cache & Restart', desc: 'Clears storage and reloads', category: 'System', action: () => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; } },
      { id: 'nav-app', label: 'Go to App', desc: '/app/knowledgebase', category: 'Nav', action: () => navigate('/app/knowledgebase') },
      { id: 'nav-web', label: 'Go to Web', desc: '/web/home', category: 'Nav', action: () => navigate('/web/home') },
      { id: 'nav-xr', label: 'Go to XR', desc: '/xr', category: 'Nav', action: () => navigate('/xr') },
      { id: 'nav-home', label: 'Go to Selector', desc: '/', category: 'Nav', action: () => navigate('/') },
      { id: 'save-snap', label: 'Save State Snapshot', desc: 'Save current route + role', category: 'State', action: () => setShowSnapshots(true) },
      { id: 'clear-recent', label: 'Clear Recent History', desc: 'Remove recently visited', category: 'System', action: () => { setRecentPages([]); lsSet(LS.RECENT, []); } },
      { id: 'clear-done', label: 'Clear Completed Demos', desc: 'Reset demo progress', category: 'System', action: () => { setCompletedDemos([]); lsSet(LS.DONE, []); } },
      { id: 'clear-pins', label: 'Clear All Pins', desc: 'Remove all pinned items', category: 'System', action: () => { setPinnedItems([]); lsSet(LS.PINS, []); } },
      { id: 'clear-snaps', label: 'Clear All Snapshots', desc: 'Delete saved snapshots', category: 'System', action: () => { setSnapshots([]); lsSet(LS.SNAPS, []); } },
      { id: 'vp-desktop', label: 'Viewport: Desktop', desc: '1440px', category: 'Viewport', action: () => setViewport('desktop') },
      { id: 'vp-tablet', label: 'Viewport: Tablet', desc: '768px', category: 'Viewport', action: () => setViewport('tablet') },
      { id: 'vp-phone', label: 'Viewport: Phone', desc: '375px', category: 'Viewport', action: () => setViewport('phone') },
      { id: 'vp-reset', label: 'Viewport: Reset', desc: 'Clear viewport override', category: 'Viewport', action: () => setViewport(null) },
      ...Object.entries(ROLES).map(([id, role]) => ({
        id: `role-${id}`, label: `Switch to ${role.label}`, desc: role.description, category: 'Roles', action: () => setRole(id as UserRole),
      })),
    ];
    return cmds;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, navigate, setRole]);

  const filteredCommands = useMemo(() => {
    if (!cmdQuery) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(cmdQuery) || c.desc.toLowerCase().includes(cmdQuery) || c.category.toLowerCase().includes(cmdQuery));
  }, [commands, cmdQuery]);

  // ==================== SEARCH / FILTER ====================
  const filterPages = (pages: PageLink[], q: string): PageLink[] => {
    if (!q) return pages;
    const ql = q.toLowerCase();
    return pages.reduce<PageLink[]>((acc, p) => {
      const match = p.label.toLowerCase().includes(ql) || p.path.toLowerCase().includes(ql);
      const kids = p.children ? filterPages(p.children, q) : [];
      if (match || kids.length) acc.push({ ...p, children: kids.length ? kids : p.children });
      return acc;
    }, []);
  };
  const filterFeatureGroups = (groups: FeatureGroup[], q: string): FeatureGroup[] => {
    if (!q) return groups;
    const ql = q.toLowerCase();
    return groups.reduce<FeatureGroup[]>((acc, g) => {
      const f = g.features.filter(ft => ft.name.toLowerCase().includes(ql) || ft.desc.toLowerCase().includes(ql));
      if (f.length) acc.push({ ...g, features: f });
      return acc;
    }, []);
  };
  const filterRoleGroups = (q: string) => {
    if (!q) return roleGroups;
    const ql = q.toLowerCase();
    return roleGroups.reduce<{ label: string; roles: UserRole[] }[]>((acc, g) => {
      const f = g.roles.filter(r => ROLES[r].label.toLowerCase().includes(ql) || ROLES[r].description.toLowerCase().includes(ql));
      if (f.length) acc.push({ ...g, roles: f });
      return acc;
    }, []);
  };
  const getFirstMatch = (pages: PageLink[], q: string): PageLink | null => {
    if (!q) return null;
    const ql = q.toLowerCase();
    for (const p of pages) {
      if (p.label.toLowerCase().includes(ql) || p.path.toLowerCase().includes(ql)) return p;
      if (p.children) { const c = getFirstMatch(p.children, q); if (c) return c; }
    }
    return null;
  };

  const searchQ = isCommandMode ? '' : searchQuery;
  const filteredGroups = filterFeatureGroups(featureGroups, searchQ);
  const filteredRoleGroups = filterRoleGroups(searchQ);
  const filteredAppPages = filterPages(appPages, searchQ);
  const filteredWebPages = filterPages(webPages, searchQ);
  const isGlobalSearch = !!searchQ;
  const hasPageResults = isGlobalSearch && (filteredAppPages.length > 0 || filteredWebPages.length > 0);
  const hasFeatureResults = isGlobalSearch && filteredGroups.length > 0;
  const hasRoleResults = isGlobalSearch && filteredRoleGroups.length > 0;
  const totalPageCount = countPages(filteredAppPages) + countPages(filteredWebPages);
  const totalFeatureCount = filteredGroups.reduce((s, g) => s + g.features.length, 0);
  const totalRoleCount = filteredRoleGroups.reduce((s, g) => s + g.roles.length, 0);
  const noResults = isGlobalSearch && !hasPageResults && !hasFeatureResults && !hasRoleResults;

  // Pinned pages/features
  const pinnedPagePaths = pinnedItems.filter(k => k.startsWith('p:')).map(k => k.slice(2));
  const pinnedFeatIds = pinnedItems.filter(k => k.startsWith('f:')).map(k => k.slice(2));
  const pinnedPageItems = useMemo(() => {
    const all: PageLink[] = [];
    const walk = (pages: PageLink[]) => { for (const p of pages) { if (pinnedPagePaths.includes(p.path)) all.push(p); if (p.children) walk(p.children); } };
    walk([...appPages, ...webPages]);
    return all;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedItems]);
  const pinnedFeats = useMemo(() => allFeatures.filter(f => pinnedFeatIds.includes(f.id)), [pinnedFeatIds]);

  // Demo completion stats
  const completionByGroup = useMemo(() => {
    const m: Record<string, { done: number; total: number }> = {};
    for (const g of featureGroups) {
      const done = g.features.filter(f => completedDemos.includes(f.id)).length;
      m[g.label] = { done, total: g.features.length };
    }
    return m;
  }, [completedDemos]);

  // ==================== EFFECTS ====================

  // Shift+F toggle + Cmd+K command palette
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const editable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      // Shift+F
      if (e.shiftKey && e.key === 'F' && !e.ctrlKey && !e.metaKey && !e.altKey && !editable) {
        e.preventDefault();
        setIsOpen(p => { const n = !p; if (n) setTimeout(() => searchInputRef.current?.focus(), 50); return n; });
      }
      // Ctrl+K / Cmd+K → open with command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setSearchQuery('>');
        setTimeout(() => { searchInputRef.current?.focus(); searchInputRef.current?.setSelectionRange(1, 1); }, 50);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Iframe messages: toggle, demo ready, demo start/end, playlist advance
  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (e.data?.type === 'debugToggle') {
        setIsOpen(p => { const n = !p; if (n) setTimeout(() => searchInputRef.current?.focus(), 50); return n; });
      }
      if (e.data?.type === 'debugFeatures' && pendingDemoRef.current) {
        const fid = pendingDemoRef.current;
        if (fid.startsWith('proc-')) {
          // Don't clear pending — wait for procedureDemosAvailable
        } else {
          pendingDemoRef.current = null;
          setTimeout(() => {
            const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
            if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'debugStartDemo', featureId: fid }, '*');
          }, 300);
        }
      }
      if (e.data?.type === 'procedureDemosAvailable' && pendingDemoRef.current) {
        const fid = pendingDemoRef.current;
        if (fid.startsWith('proc-')) {
          pendingDemoRef.current = null;
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('procedure-demo-start', { detail: { featureId: fid } }));
          }, 300);
        }
      }
      if (e.data?.type === 'kbDemosAvailable' && pendingDemoRef.current) {
        const fid = pendingDemoRef.current;
        if (fid.startsWith('kb-')) {
          pendingDemoRef.current = null;
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('kb-demo-start', { detail: { featureId: fid } }));
          }, 300);
        }
      }
      // DT scene config demo continuation → navigate to KB and start KB demo
      if (e.data?.type === 'debugDemoContinue' && e.data.nextFeatureId) {
        const feat = allFeatures.find(f => f.id === e.data.nextFeatureId);
        if (feat) {
          if (e.data.featureId) markDemoComplete(e.data.featureId);
          setTimeout(() => startDemo(feat), 300);
        }
      }
      if (e.data?.type === 'debugDemoStarted') {
        const url = new URL(window.location.href);
        url.searchParams.set('demo', e.data.featureId);
        history.replaceState(null, '', url.toString());
      }
      if (e.data?.type === 'debugDemoEnded') {
        // Mark complete
        if (e.data.featureId) markDemoComplete(e.data.featureId);
        // URL cleanup
        const url = new URL(window.location.href);
        if (url.searchParams.has('demo')) { url.searchParams.delete('demo'); history.replaceState(null, '', url.toString()); }
      }
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, [markDemoComplete, startDemo]);

  // Auto-start demo from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demoId = params.get('demo');
    if (demoId && demoId !== autoStartedRef.current) {
      for (const g of featureGroups) {
        const feat = g.features.find(f => f.id === demoId);
        if (feat) {
          autoStartedRef.current = demoId;
          const isParent = feat.id.startsWith('proc-');
          const fp = feat.route.split('?')[0];
          const onPage = currentPathname === fp || currentPathname.startsWith(fp + '/')
            || (isParent && currentPathname.startsWith('/app/procedure-editor/'));
          if (onPage && isParent) {
            // Dispatch directly with delay to let components mount
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('procedure-demo-start', { detail: { featureId: feat.id } }));
            }, 600);
          } else if (onPage) {
            pendingDemoRef.current = feat.id;
            // Also try sending directly after iframe loads (debugFeatures may have already fired)
            setTimeout(() => {
              if (pendingDemoRef.current === feat.id) {
                pendingDemoRef.current = null;
                const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
                if (iframe?.contentWindow) iframe.contentWindow.postMessage({ type: 'debugStartDemo', featureId: feat.id }, '*');
              }
            }, 1200);
          } else {
            pendingDemoRef.current = feat.id;
            navigate(`${feat.route}?demo=${feat.id}`);
          }
          break;
        }
      }
    }
  }, [location.search, currentPathname, navigate]);

  // Track recent pages
  useEffect(() => {
    const path = location.pathname + location.search;
    setRecentPages(prev => {
      const filtered = prev.filter(p => p !== path);
      const next = [path, ...filtered].slice(0, 8);
      lsSet(LS.RECENT, next);
      return next;
    });
  }, [location.pathname, location.search]);

  // Viewport resize tracking
  useEffect(() => {
    const h = () => {
      if (!activeViewport) setVpSize({ w: window.innerWidth, h: window.innerHeight });
      else setVpSize(prev => ({ ...prev, h: window.innerHeight }));
    };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [activeViewport]);

  // Auto-hide button after 5s idle
  useEffect(() => {
    if (isOpen) { setBtnIdle(false); return; }
    const reset = () => { setBtnIdle(false); clearTimeout(idleTimer.current); idleTimer.current = setTimeout(() => setBtnIdle(true), 5000); };
    reset();
    window.addEventListener('mousemove', reset);
    return () => { window.removeEventListener('mousemove', reset); clearTimeout(idleTimer.current); };
  }, [isOpen]);

  // Reset focused index on search change
  useEffect(() => { setFocusedIdx(0); }, [searchQuery]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIdx >= 0 && contentRef.current) {
      const el = contentRef.current.querySelector(`[data-di="${focusedIdx}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx]);

  // ==================== KEYBOARD NAV ====================
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const getCount = () => contentRef.current?.querySelectorAll('[data-di]').length ?? 0;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const c = getCount();
      if (c > 0) setFocusedIdx(p => (p + 1) % c);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const c = getCount();
      if (c > 0) setFocusedIdx(p => (p - 1 + c) % c);
    } else if (e.key === 'Enter') {
      // If focused item exists, click it
      if (focusedIdx >= 0 && contentRef.current) {
        const el = contentRef.current.querySelector(`[data-di="${focusedIdx}"]`) as HTMLElement;
        if (el) { e.preventDefault(); el.click(); return; }
      }
      // Command mode
      if (isCommandMode && filteredCommands.length > 0) {
        filteredCommands[0].action();
        setSearchQuery(''); return;
      }
      // Normal search fallback
      if (searchQuery) {
        const allPages = [...appPages, ...webPages];
        const pm = getFirstMatch(allPages, searchQuery);
        if (pm) { handleNavigate(pm.path); setSearchQuery(''); return; }
        const q = searchQuery.toLowerCase();
        for (const g of featureGroups) {
          const feat = g.features.find(f => f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
          if (feat) { startDemo(feat); setSearchQuery(''); return; }
        }
        for (const g of roleGroups) {
          const rid = g.roles.find(r => ROLES[r].label.toLowerCase().includes(q) || ROLES[r].description.toLowerCase().includes(q));
          if (rid) { setRole(rid); setSearchQuery(''); return; }
        }
      }
    } else if (e.key === 'Escape') {
      if (searchQuery) setSearchQuery('');
      else setIsOpen(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  };

  // Item index counter for keyboard nav — reset before each render
  itemIdxRef.current = 0;
  const nextDi = () => itemIdxRef.current++;
  const diFocusStyle = (idx: number) => focusedIdx === idx ? { backgroundColor: '#E8F0FE', outline: '1px solid #2F80ED44', outlineOffset: '-1px' } : {};

  // ==================== RENDER HELPERS ====================

  const renderPinStar = (key: string, small = false) => (
    <button onClick={(e) => { e.stopPropagation(); togglePin(key); }}
      className="shrink-0 rounded hover:bg-yellow-50 transition-colors"
      style={{ padding: small ? '1px' : '3px', color: isPinned(key) ? '#F59E0B' : '#C2C9DB' }}
      title={isPinned(key) ? 'Unpin' : 'Pin'}>
      <Star style={{ width: small ? '10px' : '12px', height: small ? '10px' : '12px', fill: isPinned(key) ? '#F59E0B' : 'none' }} />
    </button>
  );

  const renderDemoItem = (feat: FeatureItem, indent = 20) => {
    const idx = nextDi();
    const isOnPage = currentPathname === feat.route || currentPathname.startsWith(feat.route + '/');
    const done = isDemoComplete(feat.id);
    return (
      <div key={feat.id} data-di={idx}
        className="flex items-center gap-2 rounded cursor-pointer hover:bg-purple-50 transition-colors"
        style={{ padding: `5px 8px 5px ${indent}px`, ...diFocusStyle(idx) }}
        onClick={() => startDemo(feat)}>
        <span style={{ fontSize: '14px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{feat.icon}</span>
        <div className="flex-1 min-w-0 flex items-center gap-1">
          <span style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat.name}</span>
          {done && <Check style={{ width: '12px', height: '12px', color: '#11E874', flexShrink: 0 }} />}
        </div>
        {renderPinStar(`f:${feat.id}`, true)}
        <button onClick={(e) => shareDemoLink(feat, e)}
          className="shrink-0 rounded hover:bg-purple-100 transition-colors"
          style={{ padding: '3px', color: copiedDemoId === feat.id ? '#11E874' : '#868D9E' }}
          title={copiedDemoId === feat.id ? 'Link copied!' : 'Copy share link'}>
          {copiedDemoId === feat.id ? <Check style={{ width: '12px', height: '12px' }} /> : <Share2 style={{ width: '12px', height: '12px' }} />}
        </button>
        <div className="flex items-center gap-1 shrink-0 rounded"
          style={{ padding: '2px 6px', backgroundColor: isOnPage ? '#F3E8FF' : '#F5F5F5', color: isOnPage ? '#2F80ED' : '#868D9E', fontSize: '11px', fontWeight: 600 }}>
          <Play style={{ width: '10px', height: '10px', fill: isOnPage ? '#2F80ED' : '#868D9E' }} />
          {feat.demoSteps}
        </div>
      </div>
    );
  };

  const renderPageList = (pages: PageLink[], indent = 0): React.ReactNode => {
    return pages.map((page) => {
      const idx = nextDi();
      const isActive = currentPath === page.path;
      const isExpanded = expandedSections.has(page.path);
      const hasChildren = page.children && page.children.length > 0;
      return (
        <div key={page.path}>
          <div data-di={idx}
            className="flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded transition-colors"
            style={{ paddingLeft: `${8 + indent * 12}px`, paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', ...diFocusStyle(idx) }}>
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleSection(page.path); }} className="shrink-0 p-0.5">
                {isExpanded ? <ChevronDown style={{ width: '14px', height: '14px', color: '#868D9E' }} /> : <ChevronRight style={{ width: '14px', height: '14px', color: '#868D9E' }} />}
              </button>
            ) : <div style={{ width: '16px' }} />}
            <button onClick={() => handleNavigate(page.path)} className="flex-1 text-left truncate"
              style={{ fontSize: '13px', color: isActive ? '#2F80ED' : '#36415D', fontWeight: isActive ? 'bold' : 'normal' }}>
              {page.label}
            </button>
            {renderPinStar(`p:${page.path}`, true)}
          </div>
          {hasChildren && isExpanded && renderPageList(page.children!, indent + 1)}
        </div>
      );
    });
  };

  // ==================== TAB BADGE COUNTS ====================
  const tabBadges: Record<TabId, number> = {
    pages: totalAppPages + totalWebPages,
    features: totalFeatures,
    roles: totalRoles,
  };


  // ==================== JSX ====================
  return createPortal(
    <>
      {/* ===== Debug toggle button (auto-hide) ===== */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setTimeout(() => searchInputRef.current?.focus(), 50); }}
        className="fixed z-[9999] flex items-center justify-center transition-all hover:scale-110"
        style={{
          bottom: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%',
          background: isOpen ? '#FF1F1F' : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          boxShadow: isOpen ? '0 2px 8px rgba(255,31,31,0.4)' : '0 2px 12px rgba(118,75,162,0.5), 0 0 20px rgba(102,126,234,0.3)',
          border: 'none',
          animation: isOpen ? 'none' : 'debug-glow 2s ease-in-out infinite alternate',
          opacity: btnIdle && !isOpen ? 0.2 : 1,
          transition: 'opacity 0.5s ease, transform 0.15s ease',
        }}
        title="Debug Menu (Shift+F)"
        onMouseEnter={() => setBtnIdle(false)}>
        {isOpen ? <X style={{ width: '16px', height: '16px', color: 'white' }} /> : <Bug style={{ width: '16px', height: '16px', color: 'white' }} />}
      </button>

      {/* ===== Debug panel ===== */}
      {isOpen && (
        <div className="fixed z-[9998] flex flex-col" style={{
          bottom: '60px', right: '16px', width: '340px', maxWidth: 'calc(100vw - 32px)', height: '540px', maxHeight: 'calc(100vh - 80px)',
          backgroundColor: '#FFFFFF', border: '1px solid #C2C9DB', borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '10px 12px', borderBottom: '1px solid #E9E9E9' }}>
            <div className="flex items-center gap-2">
              <Bug style={{ width: '14px', height: '14px', color: '#2F80ED' }} />
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#36415D' }}>Debug Menu</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                style={{ fontSize: '12px', color: '#FF1F1F', border: '1px solid #FF1F1F33', borderRadius: '6px' }}
                title="Restart">
                <RotateCcw style={{ width: '10px', height: '10px' }} /> Restart
              </button>
            </div>
          </div>

          {/* Tabs with count badges */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid #E9E9E9' }}>
            {([
              { id: 'pages' as TabId, label: 'Pages', Icon: FileText, color: '#2F80ED' },
              { id: 'features' as TabId, label: 'Demos', Icon: Sparkles, color: '#2F80ED' },
              { id: 'roles' as TabId, label: 'Roles', Icon: Shield, color: '#11E874' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 transition-colors hover:bg-black/5"
                style={{ fontSize: '12px', fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  color: activeTab === tab.id ? tab.color : '#868D9E',
                  borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent' }}>
                <tab.Icon style={{ width: '13px', height: '13px' }} />
                {tab.label}
                <span style={{ fontSize: '10px', color: '#868D9E', marginLeft: '2px', fontWeight: 'normal' }}>{tabBadges[tab.id]}</span>
              </button>
            ))}
          </div>

          {/* Search — global + command palette */}
          <div className="shrink-0" style={{ padding: '6px 8px', borderBottom: '1px solid #E9E9E9' }}>
            <div className="flex items-center gap-1.5 rounded" style={{
              padding: '4px 6px',
              border: isCommandMode ? '1px solid #2F80ED33' : '1px solid #C2C9DB',
              backgroundColor: isCommandMode ? '#FDFBFF' : '#F5F5F5',
            }}>
              {isCommandMode
                ? <Zap style={{ width: '14px', height: '14px', color: '#2F80ED', flexShrink: 0 }} />
                : <Search style={{ width: '14px', height: '14px', color: '#868D9E', flexShrink: 0 }} />
              }
              <input ref={searchInputRef} type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown}
                placeholder={isCommandMode ? 'Type a command...' : 'Search pages, demos, roles... (> for commands)'}
                className="flex-1 bg-transparent outline-none border-none"
                style={{ fontSize: '13px', color: '#36415D' }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="shrink-0">
                  <X style={{ width: '12px', height: '12px', color: '#868D9E' }} />
                </button>
              )}
            </div>
          </div>

          {/* ===== Scrollable content ===== */}
          <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0" style={{ padding: '4px 0' }}>

            {/* ===== COMMAND PALETTE ===== */}
            {isCommandMode ? (
              <div style={{ padding: '0 4px' }}>
                {filteredCommands.length === 0 && (
                  <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '13px', color: '#868D9E' }}>No commands match "{cmdQuery}"</div>
                )}
                {/* Group by category */}
                {(() => {
                  const cats = [...new Set(filteredCommands.map(c => c.category))];
                  return cats.map(cat => (
                    <div key={cat} style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '10px', color: '#2F80ED', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', fontWeight: 700 }}>{cat}</div>
                      {filteredCommands.filter(c => c.category === cat).map(cmd => {
                        const idx = nextDi();
                        return (
                          <div key={cmd.id} data-di={idx}
                            className="flex items-center gap-2 rounded cursor-pointer hover:bg-purple-50 transition-colors"
                            style={{ padding: '5px 8px 5px 16px', ...diFocusStyle(idx) }}
                            onClick={() => { cmd.action(); setSearchQuery(''); }}>
                            <Zap style={{ width: '12px', height: '12px', color: '#2F80ED', flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: '13px', color: '#36415D', fontWeight: 500 }}>{cmd.label}</div>
                              <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>

            /* ===== GLOBAL SEARCH RESULTS ===== */
            ) : isGlobalSearch ? (
              <div style={{ padding: '0 4px' }}>
                {noResults && <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: '13px', color: '#868D9E' }}>No results for "{searchQuery}"</div>}

                {hasPageResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <FileText style={{ width: '12px', height: '12px', color: '#2F80ED' }} />
                      <span style={{ fontSize: '11px', color: '#2F80ED', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Pages</span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalPageCount}</span>
                    </div>
                    {filteredAppPages.length > 0 && (<><div style={{ fontSize: '10px', color: '#868D9E', padding: '2px 8px 2px 20px', fontWeight: 600 }}>APP</div>{renderPageList(filteredAppPages)}</>)}
                    {filteredWebPages.length > 0 && (<><div style={{ fontSize: '10px', color: '#868D9E', padding: '2px 8px 2px 20px', fontWeight: 600 }}>WEB</div>{renderPageList(filteredWebPages)}</>)}
                  </div>
                )}

                {hasFeatureResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <Sparkles style={{ width: '12px', height: '12px', color: '#2F80ED' }} />
                      <span style={{ fontSize: '11px', color: '#2F80ED', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Demos</span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalFeatureCount}</span>
                    </div>
                    {filteredGroups.map(g => <div key={g.label}>{g.features.map(f => renderDemoItem(f))}</div>)}
                  </div>
                )}

                {hasRoleResults && (
                  <div style={{ marginBottom: '4px' }}>
                    <div className="flex items-center gap-1.5" style={{ padding: '4px 8px', marginBottom: '2px' }}>
                      <Shield style={{ width: '12px', height: '12px', color: '#11E874' }} />
                      <span style={{ fontSize: '11px', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Roles</span>
                      <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>{totalRoleCount}</span>
                    </div>
                    {filteredRoleGroups.map(g => (
                      <div key={g.label}>{g.roles.map(roleId => {
                        const idx = nextDi();
                        const role = ROLES[roleId];
                        const isActive = currentRole === roleId;
                        return (
                          <button key={roleId} data-di={idx}
                            onClick={() => { setRole(roleId); setSearchQuery(''); }}
                            className="flex items-center gap-2 w-full rounded transition-colors"
                            style={{ padding: '5px 8px 5px 20px', backgroundColor: isActive ? '#E8F5E9' : 'transparent', cursor: 'pointer', ...diFocusStyle(idx) }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = focusedIdx === idx ? '#E8F0FE' : '#F5F5F5'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isActive ? '#E8F5E9' : 'transparent'; }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: isActive ? '2px solid #11E874' : '2px solid #C2C9DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isActive && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#11E874' }} />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div style={{ fontSize: '13px', color: isActive ? '#36415D' : '#5E677D', fontWeight: isActive ? 'bold' : 'normal' }}>{role.label}</div>
                              <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role.description}</div>
                            </div>
                          </button>
                        );
                      })}</div>
                    ))}
                  </div>
                )}
              </div>

            ) : (
            /* ===== TAB-SPECIFIC CONTENT ===== */
            <>
              {/* ==================== PAGES TAB ==================== */}
              {activeTab === 'pages' && (
                <div style={{ padding: '0 4px' }}>
                  {/* Pinned pages */}
                  {pinnedPageItems.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <div className="flex items-center gap-1.5" style={{ padding: '4px 8px' }}>
                        <Star style={{ width: '11px', height: '11px', color: '#F59E0B', fill: '#F59E0B' }} />
                        <span style={{ fontSize: '10px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Pinned</span>
                      </div>
                      {pinnedPageItems.map(p => {
                        const idx = nextDi();
                        const isActive = currentPath === p.path;
                        return (
                          <div key={p.path} data-di={idx}
                            className="flex items-center gap-1 cursor-pointer hover:bg-yellow-50/50 rounded transition-colors"
                            style={{ padding: '3px 8px 3px 20px', ...diFocusStyle(idx) }}>
                            <button onClick={() => handleNavigate(p.path)} className="flex-1 text-left truncate"
                              style={{ fontSize: '13px', color: isActive ? '#2F80ED' : '#36415D', fontWeight: isActive ? 'bold' : 'normal' }}>
                              {p.label}
                            </button>
                            {renderPinStar(`p:${p.path}`, true)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recent pages - removed */}

                  {/* Platform nav tabs */}
                  <div className="flex shrink-0" style={{ margin: '2px 4px 6px', borderBottom: '1px solid #E9E9E9', position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
                    {[
                      { label: 'Selector', path: '/', active: !isApp && !isWeb && !isXR },
                      { label: 'App', path: '/app/knowledgebase', active: isApp },
                      { label: 'Web', path: '/web/home', active: isWeb },
                      { label: 'XR', path: '/xr', active: isXR },
                    ].map(tab => (
                      <button key={tab.label} onClick={() => handleNavigate(tab.path)}
                        className="flex-1 py-1 text-center transition-colors hover:bg-black/5"
                        style={{ fontSize: '11px', fontWeight: tab.active ? 'bold' : 'normal', color: tab.active ? '#2F80ED' : '#868D9E', borderBottom: tab.active ? '2px solid #2F80ED' : '2px solid transparent' }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {isApp && (<><div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', marginBottom: '2px', fontWeight: 700 }}>App Pages</div>{renderPageList(appPages)}</>)}
                  {isWeb && (<><div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', marginBottom: '2px', fontWeight: 700 }}>Web Pages</div>{renderPageList(webPages)}</>)}
                  {!isApp && !isWeb && (
                    <div style={{ padding: '8px', color: '#868D9E', fontSize: '12px', textAlign: 'center' }}>Select a platform tab above</div>
                  )}
                </div>
              )}

              {/* ==================== DEMOS TAB ==================== */}
              {activeTab === 'features' && (
                <div style={{ padding: '0 4px' }}>
                  {/* Pinned demos */}
                  {pinnedFeats.length > 0 && (
                    <div style={{ marginBottom: '4px' }}>
                      <div className="flex items-center gap-1.5" style={{ padding: '4px 8px' }}>
                        <Star style={{ width: '11px', height: '11px', color: '#F59E0B', fill: '#F59E0B' }} />
                        <span style={{ fontSize: '10px', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Pinned</span>
                      </div>
                      {pinnedFeats.map(f => renderDemoItem(f, 20))}
                    </div>
                  )}

                  {/* Feature groups with completion tracking */}
                  {featureGroups.map(group => {
                    const isExpanded = expandedSections.has(group.label);
                    const { done, total } = completionByGroup[group.label] || { done: 0, total: 0 };
                    return (
                      <div key={group.label} style={{ marginBottom: '2px' }}>
                        <button onClick={() => toggleSection(group.label)}
                          className="flex items-center gap-1.5 w-full hover:bg-black/5 rounded transition-colors"
                          style={{ padding: '5px 8px' }}>
                          {isExpanded ? <ChevronDown style={{ width: '12px', height: '12px', color: '#2F80ED' }} /> : <ChevronRight style={{ width: '12px', height: '12px', color: '#2F80ED' }} />}
                          <span style={{ fontSize: '12px', color: '#2F80ED', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{group.label}</span>
                          <span style={{ fontSize: '11px', color: done === total && total > 0 ? '#11E874' : '#868D9E', marginLeft: 'auto' }}>
                            {done}/{total}
                          </span>
                          {/* Mini progress bar */}
                          <div style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: '#E9E9E9', overflow: 'hidden', marginLeft: '4px' }}>
                            <div style={{ width: `${total ? (done / total) * 100 : 0}%`, height: '100%', backgroundColor: done === total && total > 0 ? '#11E874' : '#2F80ED', borderRadius: '2px', transition: 'width 0.3s' }} />
                          </div>
                        </button>
                        {isExpanded && group.features.map(f => renderDemoItem(f, 24))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ==================== ROLES TAB ==================== */}
              {activeTab === 'roles' && (
                <div style={{ padding: '4px 4px' }}>
                  {/* Active role badge + A/B compare */}
                  <div style={{ margin: '0 4px 8px', padding: '8px 10px', backgroundColor: '#F0FFF4', border: '1px solid #11E87444', borderRadius: '8px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Role</span>
                      {compareRole ? (
                        <div className="flex items-center gap-1">
                          <button onClick={toggleRoleAB}
                            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                            style={{ fontSize: '10px', color: '#2F80ED', border: '1px solid #2F80ED33', fontWeight: 600 }}
                            title="Swap roles">
                            <ArrowLeftRight style={{ width: '10px', height: '10px' }} /> Swap
                          </button>
                          <button onClick={() => setCompareRole(null)}
                            className="rounded hover:bg-red-50 p-0.5" title="Exit compare">
                            <X style={{ width: '10px', height: '10px', color: '#FF1F1F' }} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => {
                          const allRoles = roleGroups.flatMap(g => g.roles);
                          const other = allRoles.find(r => r !== currentRole) || allRoles[0];
                          setCompareRole(other);
                        }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                          style={{ fontSize: '10px', color: '#868D9E', border: '1px solid #C2C9DB', fontWeight: 500 }}
                          title="Enable A/B role comparison">
                          <ArrowLeftRight style={{ width: '10px', height: '10px' }} /> Compare
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#36415D', fontWeight: 'bold' }}>{ROLES[currentRole].label}</div>
                    <div style={{ fontSize: '11px', color: '#868D9E', marginTop: '2px' }}>{ROLES[currentRole].description}</div>
                    {compareRole && (
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #11E87444' }}>
                        <div style={{ fontSize: '10px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Compare With</div>
                        <div style={{ fontSize: '13px', color: '#5E677D', fontWeight: 600 }}>{ROLES[compareRole].label}</div>
                        <div style={{ fontSize: '11px', color: '#868D9E' }}>{ROLES[compareRole].description}</div>
                      </div>
                    )}
                  </div>

                  {/* Role groups */}
                  {roleGroups.map(group => (
                    <div key={group.label} style={{ marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', fontWeight: 700 }}>{group.label}</div>
                      {group.roles.map(roleId => {
                        const idx = nextDi();
                        const role = ROLES[roleId];
                        const isActive = currentRole === roleId;
                        const isCompare = compareRole === roleId;
                        return (
                          <button key={roleId} data-di={idx}
                            onClick={() => {
                              if (compareRole !== null) { setCompareRole(roleId); }
                              else setRole(roleId);
                            }}
                            className="flex items-center gap-2 w-full rounded transition-colors"
                            style={{ padding: '6px 8px', backgroundColor: isActive ? '#E8F5E9' : isCompare ? '#EBF5FF' : 'transparent', cursor: 'pointer', ...diFocusStyle(idx) }}
                            onMouseEnter={e => { if (!isActive && !isCompare) e.currentTarget.style.backgroundColor = focusedIdx === idx ? '#E8F0FE' : '#F5F5F5'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isActive ? '#E8F5E9' : isCompare ? '#EBF5FF' : 'transparent'; }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: isActive ? '2px solid #11E874' : isCompare ? '2px solid #2F80ED' : '2px solid #C2C9DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isActive && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#11E874' }} />}
                              {isCompare && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2F80ED' }} />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-1">
                                <span style={{ fontSize: '13px', color: isActive ? '#36415D' : '#5E677D', fontWeight: isActive ? 'bold' : 'normal' }}>{role.label}</span>
                                {isCompare && <span style={{ fontSize: '9px', color: '#2F80ED', fontWeight: 700 }}>B</span>}
                              </div>
                              <div style={{ fontSize: '11px', color: '#868D9E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role.description}</div>
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

        </div>
      )}

      <style>{`
        @keyframes debug-glow {
          0% { box-shadow: 0 2px 12px rgba(118,75,162,0.5), 0 0 20px rgba(102,126,234,0.3); }
          100% { box-shadow: 0 2px 16px rgba(240,147,251,0.6), 0 0 28px rgba(118,75,162,0.4); }
        }
      `}</style>
    </>,
    document.body
  );
}
