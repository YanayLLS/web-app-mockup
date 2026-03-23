import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { Node } from 'reactflow';

interface SearchOverlayProps {
  nodes: Node[];
  onFocusNode: (nodeId: string) => void;
  onClose: () => void;
  onSearchStateChange: (state: { activeIds: Set<string> | null; highlightedId: string | null }) => void;
}

export function SearchOverlay({ nodes, onFocusNode, onClose, onSearchStateChange }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get searchable nodes (exclude start node, include dynamic/logic/note)
  const searchableNodes = nodes.filter(n => n.type !== 'start');

  // Filter matches
  const matches = query.trim()
    ? searchableNodes.filter(n => {
        const d = n.data as any;
        const title = (d.title || d.label || d.text || '').toLowerCase();
        const desc = (d.description || d.targetObjectName || d.linkedProcedureName || '').toLowerCase();
        const q = query.toLowerCase();
        return title.includes(q) || desc.includes(q);
      })
    : [];

  // Clamp current index
  const safeIndex = matches.length > 0 ? Math.min(currentIndex, matches.length - 1) : -1;
  const currentMatch = safeIndex >= 0 ? matches[safeIndex] : null;

  // Notify parent of search state changes
  useEffect(() => {
    if (!query.trim()) {
      onSearchStateChange({ activeIds: null, highlightedId: null });
      return;
    }
    const activeIds = new Set(matches.map(m => m.id));
    onSearchStateChange({
      activeIds,
      highlightedId: currentMatch?.id || null,
    });
  }, [query, safeIndex, matches.length]);

  // Focus on current match
  useEffect(() => {
    if (currentMatch) {
      onFocusNode(currentMatch.id);
    }
  }, [currentMatch?.id]);

  const goNext = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % matches.length);
  }, [matches.length]);

  const goPrev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      goNext();
    }
  };

  // Clean up search state on unmount
  useEffect(() => {
    return () => {
      onSearchStateChange({ activeIds: null, highlightedId: null });
    };
  }, []);

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-lg)',
        width: '400px',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCurrentIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search nodes..."
        className="flex-1 text-sm bg-transparent border-none outline-none"
        style={{ color: 'var(--foreground)' }}
      />

      {query.trim() && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
            {matches.length > 0 ? `${safeIndex + 1} of ${matches.length}` : 'No results'}
          </span>
          <button
            onClick={goPrev}
            disabled={matches.length === 0}
            className="p-1 rounded hover:bg-secondary transition-colors disabled:opacity-30"
            title="Previous (Shift+Enter)"
          >
            <ChevronUp size={14} style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            onClick={goNext}
            disabled={matches.length === 0}
            className="p-1 rounded hover:bg-secondary transition-colors disabled:opacity-30"
            title="Next (Enter)"
          >
            <ChevronDown size={14} style={{ color: 'var(--foreground)' }} />
          </button>
        </div>
      )}

      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
        title="Close (Escape)"
      >
        <X size={16} style={{ color: 'var(--muted)' }} />
      </button>
    </div>
  );
}
