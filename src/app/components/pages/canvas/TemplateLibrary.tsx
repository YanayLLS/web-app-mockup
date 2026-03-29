import { useState, useMemo } from 'react';
import {
  X,
  Search,
  Layout,
  Plus,
  Copy,
  Layers,
  Star,
  Trash2,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Node, Edge } from 'reactflow';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  createdAt: string;
  authorName: string;
  nodes: Node[];
  edges: Edge[];
  isFullProcedure: boolean;
  isBuiltIn?: boolean;
}

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FlowTemplate[];
  onInsertTemplate: (template: FlowTemplate) => void;
  onSaveAsTemplate: (name: string, description: string, category: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  hasSelectedNodes: boolean;
}

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, category: string) => void;
  categories: string[];
}

// ─── Category Config ─────────────────────────────────────────────────────────

const categoryConfig: Record<string, { color: string; icon: string }> = {
  'Safety': { color: '#ef4444', icon: '🛡' },
  'Maintenance': { color: '#3b82f6', icon: '🔧' },
  'Assembly': { color: '#10b981', icon: '🔩' },
  'Inspection': { color: '#f59e0b', icon: '🔍' },
  'Training': { color: '#8b5cf6', icon: '🎓' },
  'General': { color: '#64748b', icon: '📋' },
};

function getCategoryColor(category: string): string {
  return categoryConfig[category]?.color || '#64748b';
}

// ─── SVG Flow Thumbnail ─────────────────────────────────────────────────────

function FlowThumbnail({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  if (nodes.length === 0) return null;

  const svgW = 220;
  const barH = 10, barR = 3;
  const startH = 12, startR = 6;
  const arrowSize = 3;
  const cx = svgW / 2;
  const maxH = 120;
  const padY = 4;

  // Sort by Y position (flow order)
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);

  // Group nodes into rows by similar Y position (threshold: half the average Y gap)
  type Row = { nodes: Node[]; y: number };
  const rows: Row[] = [];
  const yThreshold = sorted.length > 1
    ? Math.max(100, (sorted[sorted.length - 1].position.y - sorted[0].position.y) / (sorted.length * 1.5))
    : 100;

  sorted.forEach(n => {
    const lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(n.position.y - lastRow.nodes[0].position.y) < yThreshold) {
      lastRow.nodes.push(n);
    } else {
      rows.push({ nodes: [n], y: 0 });
    }
  });

  // Sort nodes within each row by X position (left to right)
  rows.forEach(row => row.nodes.sort((a, b) => a.position.x - b.position.x));

  // Calculate dynamic vertical spacing
  const rowCount = rows.length;
  const totalNodeH = rows.reduce((sum, row) => sum + (row.nodes[0]?.type === 'start' ? startH : barH), 0);
  const availableGap = maxH - padY * 2 - totalNodeH;
  const gapPerRow = Math.max(8, availableGap / Math.max(1, rowCount - 1));

  // Assign Y positions to rows
  let curY = padY;
  rows.forEach((row, i) => {
    const h = row.nodes[0]?.type === 'start' ? startH : barH;
    row.y = curY;
    curY += h + (i < rowCount - 1 ? gapPerRow : 0);
  });
  const svgH = Math.max(60, curY + padY);

  // Build position map for each node: { cx, cy, w, h }
  const posMap = new Map<string, { cx: number; cy: number; w: number; h: number }>();
  rows.forEach(row => {
    const count = row.nodes.length;
    const h = row.nodes[0]?.type === 'start' ? startH : barH;
    if (count === 1) {
      const n = row.nodes[0];
      const w = n.type === 'start' ? 50 : 90;
      posMap.set(n.id, { cx, cy: row.y + h / 2, w, h });
    } else {
      // Spread nodes horizontally
      const totalSpread = Math.min(160, count * 60);
      const startX = cx - totalSpread / 2;
      const spacing = count > 1 ? totalSpread / (count - 1) : 0;
      row.nodes.forEach((n, ni) => {
        const w = 46;
        posMap.set(n.id, { cx: startX + ni * spacing, cy: row.y + h / 2, w, h });
      });
    }
  });

  // Build edge source->targets lookup
  const edgeList = edges.map(e => ({ source: e.source, target: e.target }));

  // Render
  const renderedNodes: React.ReactNode[] = [];
  const renderedEdges: React.ReactNode[] = [];

  // Draw edges first (behind nodes)
  edgeList.forEach((e, ei) => {
    const from = posMap.get(e.source);
    const to = posMap.get(e.target);
    if (!from || !to) return;
    const fromY = from.cy + from.h / 2;
    const toY = to.cy - to.h / 2;
    // Determine edge color based on target node
    const targetNode = nodes.find(n => n.id === e.target);
    const td = targetNode?.data as any;
    const isGreen = td?.isColorized && td?.color === '#10b981';
    const isRed = td?.isColorized && (td?.color === '#ef4444');
    const edgeColor = isGreen ? '#10b981' : isRed ? '#ef4444' : '#C2C9DB';
    if (Math.abs(from.cx - to.cx) < 5) {
      // Straight vertical connector
      renderedEdges.push(
        <g key={`e-${ei}`}>
          <line x1={from.cx} y1={fromY} x2={to.cx} y2={toY} stroke={edgeColor} strokeWidth={1} />
          <polygon
            points={`${to.cx - arrowSize},${toY - arrowSize} ${to.cx},${toY} ${to.cx + arrowSize},${toY - arrowSize}`}
            fill={edgeColor}
          />
        </g>
      );
    } else {
      // Angled connector (for branches)
      const midY = fromY + (toY - fromY) * 0.4;
      renderedEdges.push(
        <g key={`e-${ei}`}>
          <path
            d={`M${from.cx},${fromY} C${from.cx},${midY} ${to.cx},${midY} ${to.cx},${toY}`}
            fill="none" stroke={edgeColor} strokeWidth={1}
          />
          <polygon
            points={`${to.cx - arrowSize},${toY - arrowSize} ${to.cx},${toY} ${to.cx + arrowSize},${toY - arrowSize}`}
            fill={edgeColor}
          />
        </g>
      );
    }
  });

  // Draw nodes
  rows.forEach(row => {
    row.nodes.forEach(n => {
      const pos = posMap.get(n.id);
      if (!pos) return;
      const d = n.data as any;
      const isStart = n.type === 'start';
      const isBranch = (d?.options?.length ?? 0) > 1;
      const color = d?.isColorized && d?.color ? d.color : '#2F80ED';
      const x = pos.cx - pos.w / 2;
      const y = pos.cy - pos.h / 2;

      if (isStart) {
        renderedNodes.push(
          <rect key={`n-${n.id}`} x={x} y={y} width={pos.w} height={pos.h} rx={startR} fill="#2F80ED" />
        );
      } else if (isBranch) {
        renderedNodes.push(
          <rect key={`n-${n.id}`} x={x} y={y} width={pos.w} height={pos.h} rx={pos.h / 2}
            fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
        );
      } else {
        // Regular bar with left accent + optional input indicator
        const accentColor = color;
        renderedNodes.push(
          <g key={`n-${n.id}`}>
            <rect x={x} y={y} width={pos.w} height={pos.h} rx={barR} fill="white" stroke="#e2e8f0" strokeWidth={1} />
            <rect x={x} y={y} width={3} height={pos.h} rx={1.5} fill={accentColor} />
            {d?.isInput && d?.inputType === 'barcode' && (
              <g>
                {[0, 3, 5, 8, 10].map((offset, j) => (
                  <rect key={j} x={x + pos.w - 16 + offset} y={y + 2} width={1.5} height={pos.h - 4} rx={0.5} fill={accentColor} opacity={0.35} />
                ))}
              </g>
            )}
            {d?.isInput && d?.inputType === 'picture' && (
              <circle cx={x + pos.w - 10} cy={pos.cy} r={2} fill="none" stroke={accentColor} strokeWidth={0.8} opacity={0.35} />
            )}
            {d?.isInput && d?.inputType === 'text' && (
              <g opacity={0.35}>
                <line x1={x + pos.w - 14} y1={y + pos.h - 3} x2={x + pos.w - 6} y2={y + pos.h - 3} stroke={accentColor} strokeWidth={0.8} />
              </g>
            )}
          </g>
        );
      }
    });
  });

  return (
    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
      {renderedEdges}
      {renderedNodes}
    </svg>
  );
}

// ─── Save Template Modal ─────────────────────────────────────────────────────

function SaveTemplateModal({ isOpen, onClose, onSave, categories }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'General');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), category);
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-xl border p-6 w-full max-w-md mx-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Save as Template
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Safety Check Flow"
              className="w-full text-xs border rounded px-3 py-2 focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={2}
              className="w-full text-xs border rounded px-3 py-2 focus:outline-none resize-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--muted)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs border rounded px-3 py-2 focus:outline-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-medium border hover:bg-secondary transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: name.trim() ? 'var(--primary)' : 'var(--secondary)',
                color: name.trim() ? 'white' : 'var(--muted)',
              }}
            >
              Save Template
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TemplateLibrary({
  isOpen,
  onClose,
  templates,
  onInsertTemplate,
  onSaveAsTemplate,
  onDeleteTemplate,
  hasSelectedNodes,
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'built-in' | 'custom'>('all');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category));
    return Array.from(cats).sort();
  }, [templates]);

  const allCategories = useMemo(() => {
    const cats = new Set(['Safety', 'Maintenance', 'Assembly', 'Inspection', 'Training', 'General']);
    templates.forEach(t => cats.add(t.category));
    return Array.from(cats).sort();
  }, [templates]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    templates.forEach(t => {
      if (activeTab === 'built-in' && !t.isBuiltIn) return;
      if (activeTab === 'custom' && t.isBuiltIn) return;
      counts.set(t.category, (counts.get(t.category) || 0) + 1);
    });
    return counts;
  }, [templates, activeTab]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (activeTab === 'built-in' && !t.isBuiltIn) return false;
      if (activeTab === 'custom' && t.isBuiltIn) return false;
      if (activeCategory && t.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [templates, activeTab, activeCategory, searchQuery]);

  const starterTemplates = filteredTemplates.filter(t => t.isFullProcedure);
  const blockTemplates = filteredTemplates.filter(t => !t.isFullProcedure);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="rounded-xl border flex overflow-hidden mx-4"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-lg)',
            width: 820,
            height: '78vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Left Sidebar ─── */}
          <div
            className="w-[180px] shrink-0 flex flex-col border-r"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
          >
            {/* Search */}
            <div className="p-3 pb-2">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3"
                  style={{ color: 'var(--muted)' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full text-xs border rounded-md pl-7 pr-2 py-1.5 focus:outline-none"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            {/* Source tabs */}
            <div className="px-3 pb-3">
              <div className="flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {([
                  { key: 'all' as const, label: 'All' },
                  { key: 'built-in' as const, label: 'Built-in' },
                  { key: 'custom' as const, label: 'Custom' },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex-1 py-1.5 text-[10px] font-medium transition-colors"
                    style={{
                      backgroundColor: activeTab === tab.key ? 'var(--card)' : 'transparent',
                      color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted)',
                      borderRight: tab.key !== 'custom' ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-3 mb-2" style={{ borderTop: '1px solid var(--border)' }} />

            {/* Categories */}
            <div className="px-2 flex-1">
              <button
                onClick={() => setActiveCategory(null)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors mb-0.5"
                style={{
                  backgroundColor: !activeCategory ? 'var(--card)' : 'transparent',
                  color: !activeCategory ? 'var(--foreground)' : 'var(--muted)',
                  fontWeight: !activeCategory ? 600 : 400,
                }}
              >
                <Layout className="w-3.5 h-3.5 shrink-0" />
                All Templates
                <span className="ml-auto text-[10px]" style={{ color: 'var(--muted)' }}>
                  {filteredTemplates.length + (activeCategory ? templates.filter(t => {
                    if (activeTab === 'built-in' && !t.isBuiltIn) return false;
                    if (activeTab === 'custom' && t.isBuiltIn) return false;
                    return true;
                  }).length - filteredTemplates.length : 0)}
                </span>
              </button>
              {categories.map(cat => {
                const conf = categoryConfig[cat] || { color: '#64748b', icon: '📄' };
                const count = categoryCounts.get(cat) || 0;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors mb-0.5"
                    style={{
                      backgroundColor: isActive ? conf.color + '10' : 'transparent',
                      color: isActive ? conf.color : 'var(--muted)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <span className="text-sm shrink-0 w-4 text-center">{conf.icon}</span>
                    {cat}
                    {count > 0 && (
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--muted)' }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Save button — always visible */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
              {hasSelectedNodes ? (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  <Plus className="w-3 h-3" />
                  Save Selection as Template
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                    Select steps on the canvas, then come back here to save them as a reusable template.
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors hover:bg-secondary"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    Go Select Steps
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Content ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                {activeCategory || 'All Templates'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </span>
                <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Layout className="w-10 h-10 mb-3" style={{ color: 'var(--border)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    {activeTab === 'custom' ? 'No custom templates yet' : 'No templates found'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {activeTab === 'custom'
                      ? 'Select nodes on the canvas and click "Save Selection" to create reusable templates.'
                      : searchQuery ? 'Try a different search term' : 'Try a different filter'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Procedure Starters */}
                  {starterTemplates.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                          Procedure Starters
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {starterTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onInsert={() => onInsertTemplate(template)}
                            onDelete={!template.isBuiltIn ? () => onDeleteTemplate(template.id) : undefined}
                            featured
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reusable Blocks */}
                  {blockTemplates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                          Reusable Blocks
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {blockTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onInsert={() => onInsertTemplate(template)}
                            onDelete={!template.isBuiltIn ? () => onDeleteTemplate(template.id) : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveTemplateModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={onSaveAsTemplate}
            categories={allCategories}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onInsert,
  onDelete,
  featured = false,
}: {
  template: FlowTemplate;
  onInsert: () => void;
  onDelete?: () => void;
  featured?: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = getCategoryColor(template.category);

  return (
    <div
      className="group rounded-lg border transition-all hover:shadow-md cursor-pointer overflow-hidden relative"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      onClick={onInsert}
    >
      {/* Delete button for custom templates */}
      {onDelete && (
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded transition-all opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: confirmDelete ? '#ef4444' : 'var(--background)',
            color: confirmDelete ? 'white' : 'var(--muted)',
            border: confirmDelete ? 'none' : '1px solid var(--border)',
          }}
          title={confirmDelete ? 'Click to confirm delete' : 'Delete template'}
          onClick={(e) => {
            e.stopPropagation();
            if (confirmDelete) {
              onDelete();
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
            }
          }}
        >
          {confirmDelete ? <Check className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
        </button>
      )}

      {/* Thumbnail */}
      <div
        className="px-3 pt-3 pb-2"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <FlowThumbnail nodes={template.nodes} edges={template.edges} />
      </div>

      {/* Info */}
      <div className="p-3 pt-2">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[9px] font-medium uppercase" style={{ color: 'var(--muted)' }}>
            {template.category}
          </span>
          {!template.isBuiltIn && (
            <span
              className="text-[8px] font-semibold uppercase px-1 py-0.5 rounded"
              style={{ backgroundColor: 'var(--primary)', color: 'white', opacity: 0.7 }}
            >
              Custom
            </span>
          )}
          <span className="text-[9px] ml-auto" style={{ color: 'var(--muted)' }}>
            {template.nodeCount} step{template.nodeCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
          {template.name}
        </div>

        {template.description && (
          <div className="text-[10px] leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
            {template.description}
          </div>
        )}

        {/* Hover action */}
        <div className="flex items-center justify-end mt-1.5 h-4">
          <span
            className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
            style={{ color: 'var(--primary)' }}
          >
            {featured ? 'Use Template' : 'Insert Block'}
            <Copy className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
