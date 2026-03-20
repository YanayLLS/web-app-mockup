import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronRight, ChevronDown, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PARTS_HIERARCHY, type PartNode } from '../../data/animationsData';

interface PartsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedPartIds: string[]) => void;
  initialSelectedIds?: string[];
  title?: string;
}

// Collect all descendant leaf IDs for a node
function getAllDescendantIds(node: PartNode): string[] {
  const ids: string[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
}

// Flatten the tree for search filtering
function flattenTree(nodes: PartNode[]): PartNode[] {
  const result: PartNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenTree(node.children));
  }
  return result;
}

type CheckState = 'checked' | 'unchecked' | 'mixed';

function getCheckState(node: PartNode, selectedIds: Set<string>): CheckState {
  if (!node.children || node.children.length === 0) {
    return selectedIds.has(node.id) ? 'checked' : 'unchecked';
  }
  const allDescendants = getAllDescendantIds(node).filter(id => id !== node.id);
  const selectedCount = allDescendants.filter(id => selectedIds.has(id)).length;
  // Also check if the node itself (parent) is explicitly selected
  const selfSelected = selectedIds.has(node.id);
  if (selectedCount === allDescendants.length && selfSelected) return 'checked';
  if (selectedCount === 0 && !selfSelected) return 'unchecked';
  return 'mixed';
}

function TriStateCheckbox({ state, onClick }: { state: CheckState; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="size-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-all"
      style={{
        borderColor: state === 'unchecked' ? '#C2C9DB' : '#2F80ED',
        backgroundColor: state === 'unchecked' ? '#FFFFFF' : '#2F80ED',
      }}
    >
      {state === 'checked' && <Check className="size-3 text-white" strokeWidth={3} />}
      {state === 'mixed' && <Minus className="size-3 text-white" strokeWidth={3} />}
    </button>
  );
}

function PartTreeNode({
  node,
  depth,
  selectedIds,
  expandedIds,
  onToggleSelect,
  onToggleExpand,
  searchQuery,
}: {
  node: PartNode;
  depth: number;
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  onToggleSelect: (node: PartNode) => void;
  onToggleExpand: (nodeId: string) => void;
  searchQuery: string;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const checkState = getCheckState(node, selectedIds);

  // Highlight matching text
  const highlightName = (name: string) => {
    if (!searchQuery) return name;
    const idx = name.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <span style={{ backgroundColor: 'rgba(47, 128, 237, 0.2)', borderRadius: '2px', padding: '0 1px' }}>
          {name.slice(idx, idx + searchQuery.length)}
        </span>
        {name.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer rounded-[6px] transition-colors group"
        style={{
          paddingLeft: `${12 + depth * 20}px`,
          paddingRight: '12px',
          paddingTop: '6px',
          paddingBottom: '6px',
          backgroundColor: checkState !== 'unchecked' ? 'rgba(47, 128, 237, 0.06)' : undefined,
        }}
        onClick={() => {
          if (hasChildren) onToggleExpand(node.id);
          else onToggleSelect(node);
        }}
        onMouseEnter={(e) => {
          if (checkState === 'unchecked') (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = checkState !== 'unchecked' ? 'rgba(47, 128, 237, 0.06)' : '';
        }}
      >
        {/* Expand/collapse arrow for parent nodes */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
            className="size-4 flex items-center justify-center shrink-0"
            style={{ color: '#868D9E' }}
          >
            {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <div className="size-4 shrink-0" />
        )}

        <TriStateCheckbox state={checkState} onClick={() => onToggleSelect(node)} />

        <span
          style={{
            fontSize: '13px',
            color: '#36415D',
            fontWeight: hasChildren ? 500 : 400,
          }}
        >
          {highlightName(node.name)}
        </span>

        {hasChildren && (
          <span style={{ fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>
            {node.children!.length}
          </span>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            {node.children!.map((child) => (
              <PartTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedIds={selectedIds}
                expandedIds={expandedIds}
                onToggleSelect={onToggleSelect}
                onToggleExpand={onToggleExpand}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PartsSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedIds = [],
  title = 'Select Parts',
}: PartsSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(MOCK_PARTS_HIERARCHY.map(n => n.id))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialSelectedIds));
      setSearchQuery('');
      setExpandedIds(new Set(MOCK_PARTS_HIERARCHY.map(n => n.id)));
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, initialSelectedIds]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleToggleSelect = useCallback((node: PartNode) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allIds = getAllDescendantIds(node);
      const allSelected = allIds.every(id => next.has(id));
      if (allSelected) {
        allIds.forEach(id => next.delete(id));
      } else {
        allIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery) return MOCK_PARTS_HIERARCHY;
    const q = searchQuery.toLowerCase();
    const flatAll = flattenTree(MOCK_PARTS_HIERARCHY);
    const matchingIds = new Set(flatAll.filter(n => n.name.toLowerCase().includes(q)).map(n => n.id));

    // Include ancestors of matching nodes
    function ancestorInclude(nodes: PartNode[]): PartNode[] {
      return nodes
        .map(node => {
          if (matchingIds.has(node.id)) return node;
          if (node.children) {
            const filteredChildren = ancestorInclude(node.children);
            if (filteredChildren.length > 0) return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean) as PartNode[];
    }
    return ancestorInclude(MOCK_PARTS_HIERARCHY);
  }, [searchQuery]);

  const selectedCount = selectedIds.size;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-in fade-in duration-150"
      style={{ zIndex: 100, backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={(e) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) onClose();
      }}
    >
      <motion.div
        ref={contentRef}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-[14px] flex flex-col overflow-hidden"
        style={{
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 80px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #E9E9E9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '16px 20px 12px', borderBottom: '1px solid #E9E9E9' }}
        >
          <div className="flex items-center gap-2.5">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#36415D' }}>{title}</h3>
            {selectedCount > 0 && (
              <span
                className="rounded-full flex items-center justify-center"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: '#2F80ED',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                }}
              >
                {selectedCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors"
            style={{ color: '#868D9E' }}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px 6px' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E' }} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts..."
              className="w-full bg-white border outline-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
              style={{
                borderRadius: '8px',
                padding: '8px 12px 8px 32px',
                fontSize: '13px',
                color: '#36415D',
                borderColor: '#C2C9DB',
                minHeight: '36px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded hover:bg-[#F5F5F5]"
                style={{ color: '#868D9E' }}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Parts tree */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ padding: '4px 8px', minHeight: '200px', maxHeight: '400px' }}
        >
          {filteredTree.length > 0 ? (
            filteredTree.map((node) => (
              <PartTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedIds={selectedIds}
                expandedIds={expandedIds}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={handleToggleExpand}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-8" style={{ color: '#868D9E', fontSize: '13px' }}>
              No parts found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '12px 16px', borderTop: '1px solid #E9E9E9' }}
        >
          <span style={{ fontSize: '12px', color: '#868D9E' }}>
            {selectedCount} part{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-[8px] border hover:bg-[#F5F5F5] transition-all"
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#36415D',
                borderColor: '#C2C9DB',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(Array.from(selectedIds))}
              className="rounded-[8px] hover:shadow-[0_2px_8px_rgba(47,128,237,0.25)] transition-all"
              style={{
                padding: '7px 20px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#2F80ED',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
