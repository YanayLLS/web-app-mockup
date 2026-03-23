import { useMemo } from 'react';
import { X, Play, Layers, GitBranch, StickyNote, ExternalLink, Target } from 'lucide-react';
import type { Node, Edge } from 'reactflow';

interface OutlinePanelProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onFocusNode: (nodeId: string) => void;
  onClose: () => void;
}

interface TreeItem {
  node: Node;
  depth: number;
  children: TreeItem[];
}

function buildTree(nodes: Node[], edges: Edge[]): TreeItem[] {
  // Build adjacency: source -> targets
  const childMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!childMap.has(e.source)) childMap.set(e.source, []);
    childMap.get(e.source)!.push(e.target);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();

  function walk(nodeId: string, depth: number): TreeItem | null {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    const childIds = childMap.get(nodeId) || [];
    const children: TreeItem[] = [];
    for (const cid of childIds) {
      const child = walk(cid, depth + 1);
      if (child) children.push(child);
    }

    return { node, depth, children };
  }

  // Start from start-node
  const items: TreeItem[] = [];
  const startItem = walk('start-node', 0);
  if (startItem) items.push(startItem);

  // Add orphan nodes not reachable from start
  for (const n of nodes) {
    if (!visited.has(n.id) && n.type !== 'start') {
      const orphan = walk(n.id, 0);
      if (orphan) items.push(orphan);
    }
  }

  return items;
}

function flattenTree(items: TreeItem[]): { node: Node; depth: number }[] {
  const result: { node: Node; depth: number }[] = [];
  function collect(item: TreeItem) {
    result.push({ node: item.node, depth: item.depth });
    for (const child of item.children) collect(child);
  }
  for (const item of items) collect(item);
  return result;
}

function getNodeIcon(type: string | undefined, data: any) {
  switch (type) {
    case 'start':
      return <Play size={13} style={{ color: '#10b981' }} />;
    case 'dynamic':
      return <Layers size={13} style={{ color: '#2f80ed' }} />;
    case 'logic':
      if (data?.logicType === 'procedure-link') return <ExternalLink size={13} style={{ color: '#8b5cf6' }} />;
      if (data?.logicType === 'object-target') return <Target size={13} style={{ color: '#ec4899' }} />;
      return <GitBranch size={13} style={{ color: '#6366f1' }} />;
    case 'note':
      return <StickyNote size={13} style={{ color: '#d97706' }} />;
    default:
      return <Layers size={13} style={{ color: 'var(--muted)' }} />;
  }
}

function getNodeTitle(node: Node): string {
  const d = node.data as any;
  if (node.type === 'start') return d.label || 'Start';
  if (node.type === 'note') return d.text?.slice(0, 40) || 'Empty Note';
  if (node.type === 'logic') {
    if (d.logicType === 'platform-switch') return 'Platform Switch';
    if (d.logicType === 'procedure-link') return d.linkedProcedureName || 'Procedure Link';
    if (d.logicType === 'object-target') return d.targetObjectName || 'Object Target';
  }
  return d.title || 'Untitled Step';
}

function getTypeBadge(type: string | undefined, data: any) {
  let label = 'Step';
  let color = '#2f80ed';

  switch (type) {
    case 'start':
      label = 'Start';
      color = '#10b981';
      break;
    case 'logic':
      label = 'Logic';
      color = '#6366f1';
      break;
    case 'note':
      label = 'Note';
      color = '#d97706';
      break;
  }

  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0"
      style={{
        backgroundColor: `${color}15`,
        color,
      }}
    >
      {label}
    </span>
  );
}

export function OutlinePanel({ nodes, edges, selectedNodeId, onFocusNode, onClose }: OutlinePanelProps) {
  const tree = useMemo(() => buildTree(nodes, edges), [nodes, edges]);
  const flatItems = useMemo(() => flattenTree(tree), [tree]);

  return (
    <div
      className="absolute top-0 left-0 bottom-0 z-[55] flex flex-col border-r"
      style={{
        width: '280px',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--elevation-sm)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Outline
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary transition-colors"
          title="Close outline"
        >
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {flatItems.map(({ node, depth }) => {
          const isSelected = node.id === selectedNodeId;
          const title = getNodeTitle(node);
          return (
            <button
              key={node.id}
              onClick={() => onFocusNode(node.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary/60"
              style={{
                paddingLeft: `${12 + depth * 16}px`,
                backgroundColor: isSelected ? 'var(--selected, #D9E0F0)' : 'transparent',
              }}
              title={title}
            >
              <span className="shrink-0">{getNodeIcon(node.type, node.data)}</span>
              <span
                className="text-xs truncate flex-1"
                style={{
                  color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {title}
              </span>
              {getTypeBadge(node.type, node.data)}
            </button>
          );
        })}

        {flatItems.length === 0 && (
          <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--muted)' }}>
            No nodes in this flow
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div
        className="px-4 py-2 border-t shrink-0 flex items-center gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
          {nodes.filter(n => n.type === 'dynamic').length} steps
        </span>
        <span className="text-[10px]" style={{ color: 'var(--border)' }}>|</span>
        <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
          {nodes.filter(n => n.type === 'logic').length} logic
        </span>
        <span className="text-[10px]" style={{ color: 'var(--border)' }}>|</span>
        <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
          {nodes.filter(n => n.type === 'note').length} notes
        </span>
      </div>
    </div>
  );
}
