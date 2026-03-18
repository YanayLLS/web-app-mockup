import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject, KnowledgeBaseItem } from '../contexts/ProjectContext';
import { Search, X, Home, Bell, Headphones, Sparkles, Archive, Users, Settings, Folder, Box, ClipboardList, FileImage, Film, File } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

const PAGE_ITEMS = [
  { id: 'home', label: 'Home', subtitle: 'Your workspace overview', icon: <Home size={15} />, path: '/web/home' },
  { id: 'notifications', label: 'Notifications', subtitle: 'Recent alerts and updates', icon: <Bell size={15} />, path: '/web/notifications' },
  { id: 'remote-support', label: 'Remote Support', subtitle: 'Start or join a support session', icon: <Headphones size={15} />, path: '/web/remote-support' },
  { id: 'ai-studio', label: 'AI Studio', subtitle: 'AI-powered tools and assistants', icon: <Sparkles size={15} />, path: '/web/ai-studio' },
  { id: 'archive', label: 'Archive', subtitle: 'Archived projects and content', icon: <Archive size={15} />, path: '/web/archive' },
];

const WORKSPACE_ITEMS = [
  { id: 'ws-members', label: 'Members', subtitle: 'Manage workspace members', icon: <Users size={15} />, path: '/web/workspace/members' },
  { id: 'ws-groups', label: 'Groups', subtitle: 'Organize members into groups', icon: <Users size={15} />, path: '/web/workspace/groups' },
  { id: 'ws-design', label: 'Workspace Design', subtitle: 'Branding and appearance', icon: <Settings size={15} />, path: '/web/workspace/design' },
];

function kbItemIcon(item: KnowledgeBaseItem) {
  if (item.type === 'folder') return <Folder size={15} />;
  if (item.type === 'digital-twin') return <Box size={15} />;
  if (item.type === 'procedure') return <ClipboardList size={15} />;
  if (item.type === 'media') {
    if (item.mediaType === 'video') return <Film size={15} />;
    if (item.mediaType === 'image') return <FileImage size={15} />;
    return <File size={15} />;
  }
  return <File size={15} />;
}

// Flatten nested KB items recursively
function flattenKbItems(items: KnowledgeBaseItem[], projectId: string, projectName: string, parentPath = ''): { item: KnowledgeBaseItem; projectId: string; projectName: string; path: string }[] {
  const results: { item: KnowledgeBaseItem; projectId: string; projectName: string; path: string }[] = [];
  for (const it of items) {
    const path = parentPath ? `${parentPath} / ${it.name}` : it.name;
    results.push({ item: it, projectId, projectName, path });
    if (it.children?.length) {
      results.push(...flattenKbItems(it.children, projectId, projectName, path));
    }
  }
  return results;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { projects } = useProject();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const nav = useCallback((path: string) => { navigate(path); onClose(); }, [navigate, onClose]);

  // Flatten all KB items across all projects once
  const allKbItems = useMemo(() =>
    projects.flatMap(p => flattenKbItems(p.knowledgeBaseItems, p.id, p.name)),
    [projects]
  );

  // Build results
  const results: SearchResult[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const out: SearchResult[] = [];

    PAGE_ITEMS
      .filter(p => !q || p.label.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q))
      .forEach(p => out.push({ ...p, category: 'Pages', action: () => nav(p.path) }));

    WORKSPACE_ITEMS
      .filter(p => !q || p.label.toLowerCase().includes(q) || p.subtitle!.toLowerCase().includes(q))
      .forEach(p => out.push({ ...p, category: 'Workspace', action: () => nav(p.path) }));

    projects
      .filter(p => !q || p.name.toLowerCase().includes(q))
      .forEach(p => out.push({
        id: p.id,
        label: p.name,
        subtitle: `${p.knowledgeBaseItems.length} items`,
        icon: <Folder size={15} />,
        category: 'Projects',
        action: () => nav(`/web/project/${p.id}/knowledgebase`),
      }));

    // KB items — only when there's a query
    if (q) {
      allKbItems
        .filter(({ item, projectName }) =>
          item.name.toLowerCase().includes(q) ||
          projectName.toLowerCase().includes(q)
        )
        .slice(0, 12)
        .forEach(({ item, projectId, projectName }) => out.push({
          id: `kb-${projectId}-${item.id}`,
          label: item.name,
          subtitle: projectName,
          icon: kbItemIcon(item),
          category: 'Knowledge Base',
          action: () => nav(`/web/project/${projectId}/knowledgebase`),
        }));
    }

    return out;
  }, [query, projects, allKbItems, nav]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[focusedIdx]) { results[focusedIdx].action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, focusedIdx, onClose]);

  useEffect(() => { setFocusedIdx(0); }, [query]);

  if (!isOpen) return null;

  const categoryOrder = ['Pages', 'Workspace', 'Projects', 'Knowledge Base'];
  let idx = 0;
  const categories = categoryOrder
    .map(cat => ({
      label: cat,
      items: results.filter(r => r.category === cat).map(r => ({ ...r, globalIdx: idx++ })),
    }))
    .filter(c => c.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh]"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, projects, knowledge base…"
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--color-foreground)', fontFamily: 'var(--font-family)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-secondary transition-colors flex-shrink-0">
              <X size={13} style={{ color: 'var(--color-muted)' }} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-[10px] border border-border" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-family)' }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Search size={20} className="mx-auto mb-2 text-muted/30" />
              <p className="text-sm text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                No results for "<span className="text-foreground">{query}</span>"
              </p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.label}>
                <div className="px-4 py-1.5 text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-muted)' }}>
                  {cat.label}
                </div>
                {cat.items.map(item => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setFocusedIdx(item.globalIdx)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: focusedIdx === item.globalIdx ? 'var(--color-secondary)' : 'transparent',
                      outline: focusedIdx === item.globalIdx ? '1px solid rgba(47,128,237,0.2)' : 'none',
                      outlineOffset: '-1px',
                    }}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                      item.category === 'Pages' ? 'text-primary' :
                      item.category === 'Workspace' ? 'text-[#8B5CF6]' :
                      item.category === 'Projects' ? 'text-[#F59E0B]' :
                      'text-[#10b981]'
                    }`} style={{
                      background: item.category === 'Pages' ? 'rgba(47,128,237,0.08)' :
                                  item.category === 'Workspace' ? 'rgba(139,92,246,0.08)' :
                                  item.category === 'Projects' ? 'rgba(245,158,11,0.08)' :
                                  'rgba(16,185,129,0.08)'
                    }}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{item.label}</div>
                      {item.subtitle && (
                        <div className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{item.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-3">
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-family)' }}>{key}</kbd>
              <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
