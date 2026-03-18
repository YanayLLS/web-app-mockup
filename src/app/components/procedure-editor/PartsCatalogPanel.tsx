import { X, Search, ChevronRight, ChevronDown, Eye, EyeOff, Box, Layers } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ModelHierarchyNode } from './Viewer3D';

interface PartsCatalogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hierarchy?: ModelHierarchyNode | null;
}

/** Collect all node names in a subtree */
function collectNames(node: ModelHierarchyNode): string[] {
  const names = [node.name];
  for (const child of node.children) {
    names.push(...collectNames(child));
  }
  return names;
}

/** Check if a node or any descendant matches the search query */
function matchesSearch(node: ModelHierarchyNode, query: string): boolean {
  if (node.displayName.toLowerCase().includes(query)) return true;
  return node.children.some(child => matchesSearch(child, query));
}

/** Collect names of all nodes that match search */
function collectMatchingParents(node: ModelHierarchyNode, query: string): Set<string> {
  const set = new Set<string>();
  if (node.children.some(child => matchesSearch(child, query))) {
    set.add(node.name);
  }
  for (const child of node.children) {
    for (const name of collectMatchingParents(child, query)) {
      set.add(name);
    }
  }
  return set;
}

// ── Tree Node Component ──────────────────────────────────────────────

interface TreeNodeProps {
  node: ModelHierarchyNode;
  depth: number;
  expanded: Set<string>;
  toggleExpanded: (name: string) => void;
  selectedParts: Set<string>;
  toggleSelected: (name: string) => void;
  hiddenParts: Set<string>;
  toggleVisibility: (name: string) => void;
  searchQuery: string;
}

function TreeNode({
  node,
  depth,
  expanded,
  toggleExpanded,
  selectedParts,
  toggleSelected,
  hiddenParts,
  toggleVisibility,
  searchQuery,
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.name);
  const isSelected = selectedParts.has(node.name);
  const isHidden = hiddenParts.has(node.name);
  const isLeaf = !hasChildren;

  // Check if this subtree is fully hidden
  const allChildNames = useMemo(() => collectNames(node), [node]);
  const allHidden = allChildNames.every(n => hiddenParts.has(n));

  // Search filtering
  const query = searchQuery.toLowerCase();
  const selfMatches = node.displayName.toLowerCase().includes(query);
  const childMatches = !selfMatches && node.children.some(child => matchesSearch(child, query));
  if (query && !selfMatches && !childMatches) return null;

  return (
    <>
      <div
        className={`flex items-center group cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/10'
            : 'hover:bg-foreground/5'
        }`}
        style={{
          paddingLeft: `${12 + depth * 16}px`,
          paddingRight: '8px',
          paddingTop: '8px',
          paddingBottom: '8px',
          minHeight: '44px',
          borderRadius: 'var(--radius-button)',
        }}
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(node.name);
          }
          toggleSelected(node.name);
        }}
      >
        {/* Expand / Collapse or Leaf Icon */}
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: '18px', height: '18px', marginRight: '4px' }}
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              toggleExpanded(node.name);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="size-3.5 text-muted" />
            ) : (
              <ChevronRight className="size-3.5 text-muted" />
            )
          ) : (
            <Box className="size-3 text-muted/60" />
          )}
        </span>

        {/* Name + Badge */}
        <div className="flex-1 min-w-0 flex items-center" style={{ gap: '6px' }}>
          <span
            className={`truncate ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}
            style={{
              
              fontSize: isLeaf ? 'var(--text-xs)' : 'var(--text-sm)',
              opacity: isHidden || allHidden ? 0.4 : 1,
            }}
          >
            {node.displayName}
          </span>
          {hasChildren && (
            <span
              className="flex-shrink-0 text-muted/70"
              style={{
                
                fontSize: '10px',
                backgroundColor: 'var(--secondary)',
                padding: '0 5px',
                borderRadius: '99px',
                lineHeight: '16px',
              }}
            >
              {node.meshCount}
            </span>
          )}
        </div>

        {/* Visibility Toggle */}
        <button
          className="flex-shrink-0 p-0.5 rounded opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-foreground/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              // Toggle all children
              const names = collectNames(node);
              const anyVisible = names.some(n => !hiddenParts.has(n));
              for (const n of names) {
                toggleVisibility(n, anyVisible ? 'hide' : 'show');
              }
            } else {
              toggleVisibility(node.name);
            }
          }}
        >
          {isHidden || allHidden ? (
            <EyeOff className="size-3 text-muted" />
          ) : (
            <Eye className="size-3 text-muted" />
          )}
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              selectedParts={selectedParts}
              toggleSelected={toggleSelected}
              hiddenParts={hiddenParts}
              toggleVisibility={toggleVisibility}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Main Panel Component ─────────────────────────────────────────────

export function PartsCatalogPanel({ isOpen, onClose, hierarchy }: PartsCatalogPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Start with top-level groups expanded
    if (!hierarchy) return new Set<string>();
    return new Set(hierarchy.children.map(c => c.name).concat([hierarchy.name]));
  });
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [hiddenParts, setHiddenParts] = useState<Set<string>>(new Set());

  // When hierarchy loads for the first time, expand top level
  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  if (hierarchy && initializedFor !== hierarchy.name) {
    setInitializedFor(hierarchy.name);
    setExpanded(new Set(hierarchy.children.map(c => c.name).concat([hierarchy.name])));
  }

  // Auto-expand parents when searching
  const effectiveExpanded = useMemo(() => {
    if (!searchQuery || !hierarchy) return expanded;
    const searchExpanded = collectMatchingParents(hierarchy, searchQuery.toLowerCase());
    return new Set([...expanded, ...searchExpanded, hierarchy.name]);
  }, [expanded, searchQuery, hierarchy]);

  const toggleExpanded = useCallback((name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((name: string) => {
    setSelectedParts(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleVisibility = useCallback((name: string, force?: 'hide' | 'show') => {
    setHiddenParts(prev => {
      const next = new Set(prev);
      if (force === 'hide') { next.add(name); }
      else if (force === 'show') { next.delete(name); }
      else if (next.has(name)) { next.delete(name); }
      else { next.add(name); }
      return next;
    });
  }, []);

  const totalMeshes = hierarchy?.meshCount ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:max-w-[320px] z-[61] flex flex-col p-2 sm:p-3"
        >
          <div
            className="bg-card shadow-[0px_2px_9px_0px_rgba(0,0,0,0.55)] flex flex-col h-full"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b border-sidebar-border"
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderTopLeftRadius: 'var(--radius)',
                borderTopRightRadius: 'var(--radius)',
              }}
            >
              <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                <Layers className="size-4 text-primary" />
                <p
                  className="text-foreground font-semibold"
                  style={{
                    
                    fontSize: 'var(--text-base)',
                  }}
                >
                  Parts Catalog
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground p-1 transition-colors rounded hover:bg-foreground/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts..."
                  className="w-full bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow min-h-[44px]"
                  style={{
                    borderRadius: 'var(--radius-button)',
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    paddingLeft: '32px',
                    
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>
            </div>

            {/* Tree View */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: '0 var(--spacing-sm) var(--spacing-sm)' }}
            >
              {hierarchy ? (
                hierarchy.children.map((child) => (
                  <TreeNode
                    key={child.name}
                    node={child}
                    depth={0}
                    expanded={effectiveExpanded}
                    toggleExpanded={toggleExpanded}
                    selectedParts={selectedParts}
                    toggleSelected={toggleSelected}
                    hiddenParts={hiddenParts}
                    toggleVisibility={toggleVisibility}
                    searchQuery={searchQuery}
                  />
                ))
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-muted"
                  style={{
                    padding: 'var(--spacing-xl)',
                    gap: 'var(--spacing-md)',
                  }}
                >
                  <Layers className="size-8 opacity-30" />
                  <p
                    style={{
                      
                      fontSize: 'var(--text-sm)',
                      textAlign: 'center',
                    }}
                  >
                    Loading model hierarchy...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="border-t border-border bg-background"
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottomLeftRadius: 'var(--radius)',
                borderBottomRightRadius: 'var(--radius)',
              }}
            >
              <div
                className="flex justify-between text-muted"
                style={{
                  
                  fontSize: 'var(--text-xs)',
                }}
              >
                <span>Total Parts</span>
                <span className="font-semibold text-foreground">{totalMeshes}</span>
              </div>
              {selectedParts.size > 0 && (
                <div
                  className="flex justify-between text-muted"
                  style={{
                    
                    fontSize: 'var(--text-xs)',
                    marginTop: '2px',
                  }}
                >
                  <span>Selected</span>
                  <span className="font-semibold text-primary">{selectedParts.size}</span>
                </div>
              )}
              {hiddenParts.size > 0 && (
                <div
                  className="flex justify-between text-muted"
                  style={{
                    
                    fontSize: 'var(--text-xs)',
                    marginTop: '2px',
                  }}
                >
                  <span>Hidden</span>
                  <span className="font-semibold text-muted">{hiddenParts.size}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
