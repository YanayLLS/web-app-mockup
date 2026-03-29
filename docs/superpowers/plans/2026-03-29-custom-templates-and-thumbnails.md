# Custom Templates & Thumbnail Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make custom templates persist and display properly, add delete capability, and upgrade template thumbnails to a polished bar-style layout.

**Architecture:** Two files change: `ProcedureCanvas.tsx` gets localStorage persistence for custom templates + a delete handler; `TemplateLibrary.tsx` gets delete UI on custom template cards + a completely rewritten `FlowThumbnail` component. No new files.

**Tech Stack:** React, TypeScript, ReactFlow, localStorage, SVG

---

### Task 1: Add localStorage persistence for custom templates

**Files:**
- Modify: `src/app/components/pages/ProcedureCanvas.tsx:909-927` (templates state init)
- Modify: `src/app/components/pages/ProcedureCanvas.tsx:1074` (handleSaveAsTemplate)

- [ ] **Step 1: Load custom templates from localStorage on mount**

In `ProcedureCanvas.tsx`, update the `templates` state initializer (line 909-927) to also load saved custom templates:

```typescript
const [templates, setTemplates] = useState<FlowTemplate[]>(() => {
  // Generate built-in templates with real node/edge data
  const builtIn: FlowTemplate[] = BUILT_IN_TEMPLATES.map(def => {
    const { nodes: tplNodes, edges: tplEdges } = def.generator();
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      nodeCount: tplNodes.length,
      createdAt: '',
      authorName: def.authorName,
      nodes: tplNodes,
      edges: tplEdges,
      isFullProcedure: def.isFullProcedure,
      isBuiltIn: true,
    };
  });
  // Load custom templates from localStorage
  try {
    const saved = localStorage.getItem('flow-editor-custom-templates');
    if (saved) {
      const custom: FlowTemplate[] = JSON.parse(saved);
      return [...builtIn, ...custom];
    }
  } catch { /* ignore corrupt data */ }
  return builtIn;
});
```

- [ ] **Step 2: Persist on save — update handleSaveAsTemplate**

Update `handleSaveAsTemplate` (line 1074) to normalize positions and persist to localStorage:

```typescript
const handleSaveAsTemplate = useCallback((name: string, desc: string, cat: string) => {
  const sn = nodes.filter(n => n.selected && n.type !== 'start');
  const si = new Set(sn.map(n => n.id));
  const se = edges.filter(e => si.has(e.source) && si.has(e.target));
  // Normalize positions so top-left is (0,0)
  const minX = Math.min(...sn.map(n => n.position.x));
  const minY = Math.min(...sn.map(n => n.position.y));
  const normalizedNodes = sn.map(n => ({
    ...n,
    position: { x: n.position.x - minX, y: n.position.y - minY },
    selected: false,
  }));
  const newTemplate: FlowTemplate = {
    id: `custom-${Date.now()}`,
    name,
    description: desc,
    category: cat,
    nodeCount: sn.length || 1,
    createdAt: new Date().toISOString(),
    authorName: 'You',
    nodes: JSON.parse(JSON.stringify(normalizedNodes)),
    edges: JSON.parse(JSON.stringify(se)),
    isFullProcedure: sn.length >= 4,
    isBuiltIn: false,
  };
  setTemplates(p => {
    const next = [...p, newTemplate];
    // Persist only custom templates
    const custom = next.filter(t => !t.isBuiltIn);
    localStorage.setItem('flow-editor-custom-templates', JSON.stringify(custom));
    return next;
  });
}, [nodes, edges]);
```

- [ ] **Step 3: Verify in browser**

Run the app, select some nodes on the canvas, open Template Library, save as template. Refresh the page — custom template should still appear in the Custom tab.

---

### Task 2: Add delete template capability

**Files:**
- Modify: `src/app/components/pages/ProcedureCanvas.tsx` (add handleDeleteTemplate, pass to TemplateLibrary)
- Modify: `src/app/components/pages/canvas/TemplateLibrary.tsx` (add onDeleteTemplate prop, delete UI on cards)

- [ ] **Step 1: Add handleDeleteTemplate in ProcedureCanvas.tsx**

Add this callback right after `handleSaveAsTemplate`:

```typescript
const handleDeleteTemplate = useCallback((templateId: string) => {
  setTemplates(p => {
    const next = p.filter(t => t.id !== templateId);
    const custom = next.filter(t => !t.isBuiltIn);
    localStorage.setItem('flow-editor-custom-templates', JSON.stringify(custom));
    return next;
  });
}, []);
```

- [ ] **Step 2: Pass onDeleteTemplate to TemplateLibrary**

Update the `<TemplateLibrary>` JSX in ProcedureCanvas.tsx (around line 3298-3306) to include the new prop:

```tsx
<TemplateLibrary
  isOpen={showTemplateLibrary}
  onClose={() => setShowTemplateLibrary(false)}
  templates={templates}
  onInsertTemplate={handleInsertTemplate}
  onSaveAsTemplate={handleSaveAsTemplate}
  onDeleteTemplate={handleDeleteTemplate}
  hasSelectedNodes={nodes.some(n => n.selected && n.type !== 'start')}
/>
```

- [ ] **Step 3: Update TemplateLibraryProps interface**

In `TemplateLibrary.tsx`, add the new prop to the interface (line 30-37):

```typescript
interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FlowTemplate[];
  onInsertTemplate: (template: FlowTemplate) => void;
  onSaveAsTemplate: (name: string, description: string, category: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  hasSelectedNodes: boolean;
}
```

Update the destructuring in the component function (line 250-257):

```typescript
export function TemplateLibrary({
  isOpen,
  onClose,
  templates,
  onInsertTemplate,
  onSaveAsTemplate,
  onDeleteTemplate,
  hasSelectedNodes,
}: TemplateLibraryProps) {
```

- [ ] **Step 4: Add delete UI to TemplateCard**

Update the `TemplateCard` component to support delete. Add `Trash2` and `Check` to the lucide-react import at the top of the file:

```typescript
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
```

Update the `TemplateCard` component (replacing the entire function, starting at line 560):

```tsx
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
```

- [ ] **Step 5: Pass onDelete to TemplateCard instances**

Update the two places where `<TemplateCard>` is rendered (around lines 504-511 and 527-533) to pass `onDelete` for non-built-in templates:

In the starterTemplates map (around line 504):
```tsx
{starterTemplates.map(template => (
  <TemplateCard
    key={template.id}
    template={template}
    onInsert={() => onInsertTemplate(template)}
    onDelete={!template.isBuiltIn ? () => onDeleteTemplate(template.id) : undefined}
    featured
  />
))}
```

In the blockTemplates map (around line 527):
```tsx
{blockTemplates.map(template => (
  <TemplateCard
    key={template.id}
    template={template}
    onInsert={() => onInsertTemplate(template)}
    onDelete={!template.isBuiltIn ? () => onDeleteTemplate(template.id) : undefined}
  />
))}
```

- [ ] **Step 6: Verify in browser**

Save a custom template, see the "Custom" badge and trash icon on hover. Click trash — turns red with checkmark. Click again — template is deleted. Refresh page — confirm deletion persisted.

---

### Task 3: Rewrite FlowThumbnail with polished bar layout

**Files:**
- Modify: `src/app/components/pages/canvas/TemplateLibrary.tsx:62-133` (replace entire FlowThumbnail function)

- [ ] **Step 1: Replace the FlowThumbnail component**

Replace the entire `FlowThumbnail` function (lines 62-133) with the new polished bar layout:

```tsx
function FlowThumbnail({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  if (nodes.length === 0) return null;

  const svgW = 220;
  const barW = 100, barH = 12, barR = 3;
  const startW = 56, startH = 14, startR = 7;
  const gapY = 6;         // vertical gap between node bottom and next connector top
  const arrowSize = 4;    // arrow-head half-width
  const connLen = 10;     // connector line length (gap between nodes)
  const branchBarW = 46, branchBarH = 10, branchBarR = 3;
  const branchDropY = 14; // vertical drop for branch lines
  const cx = svgW / 2;    // center x

  // Sort by Y position (flow order)
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);

  // Build positions top-down
  type NodePos = { id: string; y: number; node: Node; isBranch: boolean; isStart: boolean; h: number };
  const layout: NodePos[] = [];
  let curY = 4; // top padding

  sorted.forEach(n => {
    const d = n.data as any;
    const isStart = n.type === 'start';
    const isBranch = (d?.options?.length ?? 0) > 1;
    const h = isStart ? startH : barH;
    layout.push({ id: n.id, y: curY, node: n, isBranch, isStart, h });
    curY += h + gapY + connLen;
  });

  // If last node is a branch, add space for branch lines
  const lastNode = layout[layout.length - 1];
  const extraBranch = lastNode?.isBranch ? branchDropY + branchBarH + 6 : 0;
  const svgH = Math.min(160, Math.max(80, curY - connLen + extraBranch + 4));

  // Build edge lookup: source -> target
  const edgeMap = new Map<string, string[]>();
  edges.forEach(e => {
    if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
    edgeMap.get(e.source)!.push(e.target);
  });

  return (
    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
      {layout.map((item, i) => {
        const d = item.node.data as any;
        const color = d?.isColorized && d?.color ? d.color : '#2F80ED';
        const elements: React.ReactNode[] = [];

        if (item.isStart) {
          // Start pill
          elements.push(
            <rect
              key={`n-${item.id}`}
              x={cx - startW / 2} y={item.y}
              width={startW} height={startH} rx={startR}
              fill="#2F80ED"
            />
          );
        } else if (item.isBranch) {
          // Decision pill
          elements.push(
            <rect
              key={`n-${item.id}`}
              x={cx - barW / 2} y={item.y}
              width={barW} height={barH} rx={barH / 2}
              fill="#fef3c7" stroke="#f59e0b" strokeWidth={1}
            />
          );
        } else {
          // Regular step bar with left color accent
          elements.push(
            <g key={`n-${item.id}`}>
              <rect
                x={cx - barW / 2} y={item.y}
                width={barW} height={barH} rx={barR}
                fill="white" stroke="#e2e8f0" strokeWidth={1}
              />
              <rect
                x={cx - barW / 2} y={item.y}
                width={3} height={barH}
                rx={1.5}
                fill={color}
              />
              {/* Input type indicators */}
              {d?.isInput && d?.inputType === 'barcode' && (
                <g>
                  {[0, 3, 5, 8, 10].map((offset, j) => (
                    <rect key={j} x={cx + barW / 2 - 16 + offset} y={item.y + 3} width={1.5} height={6} rx={0.5} fill={color} opacity={0.4} />
                  ))}
                </g>
              )}
              {d?.isInput && d?.inputType === 'picture' && (
                <circle cx={cx + barW / 2 - 10} cy={item.y + barH / 2} r={2.5} fill="none" stroke={color} strokeWidth={0.8} opacity={0.4} />
              )}
              {d?.isInput && d?.inputType === 'text' && (
                <g opacity={0.4}>
                  <line x1={cx + barW / 2 - 14} y1={item.y + barH - 3} x2={cx + barW / 2 - 6} y2={item.y + barH - 3} stroke={color} strokeWidth={0.8} />
                  <line x1={cx + barW / 2 - 10} y1={item.y + 3} x2={cx + barW / 2 - 8} y2={item.y + barH - 3} stroke={color} strokeWidth={0.8} />
                </g>
              )}
            </g>
          );
        }

        // Connector to next node (if not last and not a branch that fans out)
        const nextItem = layout[i + 1];
        if (nextItem && !item.isBranch) {
          const fromY = item.y + item.h;
          const toY = nextItem.y;
          elements.push(
            <g key={`c-${item.id}`}>
              <line x1={cx} y1={fromY} x2={cx} y2={toY} stroke="#C2C9DB" strokeWidth={1} />
              <polygon
                points={`${cx - arrowSize},${toY - arrowSize} ${cx},${toY} ${cx + arrowSize},${toY - arrowSize}`}
                fill="#C2C9DB"
              />
            </g>
          );
        }

        // Branch lines from decision nodes
        if (item.isBranch) {
          const opts = d?.options || [];
          const numBranches = Math.min(opts.length, 3);
          const fromY = item.y + item.h;
          const dropY = fromY + branchDropY;

          if (numBranches === 2) {
            // Two branches: left (green) and right (red)
            const leftX = cx - 36;
            const rightX = cx + 36;
            elements.push(
              <g key={`b-${item.id}`}>
                <line x1={cx} y1={fromY} x2={leftX} y2={dropY} stroke="#10b981" strokeWidth={1.2} />
                <rect x={leftX - branchBarW / 2} y={dropY} width={branchBarW} height={branchBarH} rx={branchBarR} fill="#d1fae5" stroke="#10b981" strokeWidth={0.8} />
                <line x1={cx} y1={fromY} x2={rightX} y2={dropY} stroke="#ef4444" strokeWidth={1.2} />
                <rect x={rightX - branchBarW / 2} y={dropY} width={branchBarW} height={branchBarH} rx={branchBarR} fill="#fee2e2" stroke="#ef4444" strokeWidth={0.8} />
              </g>
            );
          } else if (numBranches >= 3) {
            // Three branches: left, center, right
            const leftX = cx - 55;
            const rightX = cx + 55;
            const colors = ['#10b981', '#3b82f6', '#ef4444'];
            const fills = ['#d1fae5', '#dbeafe', '#fee2e2'];
            const xs = [leftX, cx, rightX];
            elements.push(
              <g key={`b-${item.id}`}>
                {xs.map((bx, bi) => (
                  <g key={bi}>
                    <line x1={cx} y1={fromY} x2={bx} y2={dropY} stroke={colors[bi]} strokeWidth={1.2} />
                    <rect x={bx - branchBarW / 2 + 4} y={dropY} width={branchBarW - 8} height={branchBarH} rx={branchBarR} fill={fills[bi]} stroke={colors[bi]} strokeWidth={0.8} />
                  </g>
                ))}
              </g>
            );
          }
        }

        return elements;
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Verify thumbnails in browser**

Open the Template Library and check:
- Equipment Inspection: blue start pill → bars with barcode icon → amber decision pill → green/red branch endpoints
- Lockout/Tagout: long linear flow with 7 bars
- Troubleshooting: short flow ending in 3-way branch
- Photo Documentation: 2 bars, one with camera icon
- Each template should be visually distinguishable at a glance

---

### Task 4: Commit

- [ ] **Step 1: Stage and commit all changes**

```bash
git add src/app/components/pages/ProcedureCanvas.tsx src/app/components/pages/canvas/TemplateLibrary.tsx
git commit -m "Custom templates: localStorage persistence, delete, improved thumbnails"
```
