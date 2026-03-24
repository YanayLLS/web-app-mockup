import { useState, useCallback, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useProcedureSteps } from '../../contexts/ProcedureStepsContext';
import { DEFAULT_PROCEDURE_STEPS } from '../../data/mockProcedureSteps';
import type { Step } from '../procedure-editor/ProcedureEditor';
import ReactFlow, {
  Background,
  MiniMap,
  Panel,
  addEdge,
  updateEdge,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
} from 'reactflow';
import type { Connection, Edge, Node, OnConnectStartParams } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import {
  ArrowLeft,
  Undo,
  Redo,
  Save,
  Users,
  GitCommit,
  Plus,
  StickyNote,
  GitBranch,
  ExternalLink,
  Target,
  X,
  Settings,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Keyboard,
  Check,
  Search,
  CheckCircle2,
  MessageSquare,
  Clock,
  Layout,
  Globe,
  List,
} from 'lucide-react';
import imgDots from "figma:asset/024a1ea7ee32f89f8dbc4aa4a011b69bd6e9bad7.png";
import { DynamicNode } from './canvas/DynamicNode';
import { StartNode } from './canvas/StartNode';
import { NoteNode } from './canvas/NoteNode';
import { LogicNode } from './canvas/LogicNode';
import { CustomEdge, EdgeMarkerDefs } from './canvas/CustomEdge';
import { ContextMenu, ContextMenuType } from './canvas/ContextMenu';
import { MediaLibraryModal } from '../modals/MediaLibraryModal';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';
import { ProcedureModal } from '../modals/ProcedureModal';
import type { KnowledgeBaseItem } from '../../contexts/ProjectContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { SearchOverlay } from './canvas/SearchOverlay';
import { useFlowValidation } from './canvas/useFlowValidation';
import { ValidationPanel } from './canvas/ValidationPanel';
import { useSmartGuides } from './canvas/useSmartGuides';
import { AlignmentToolbar } from './canvas/AlignmentToolbar';
import type { CommentThread, Comment as CommentType } from './canvas/CommentPanel';
import { VersionHistoryPanel, type Version } from './canvas/VersionHistoryPanel';
import { TemplateLibrary, type FlowTemplate } from './canvas/TemplateLibrary';
import { BUILT_IN_TEMPLATES } from './canvas/builtInTemplates';
import { GroupNode } from './canvas/GroupNode';
import { SUPPORTED_LANGUAGES } from './canvas/languageConstants';
import { LanguagePanel } from './canvas/LanguagePanel';
import { AddLanguageModal } from './canvas/AddLanguageModal';
import { TranslationProgressModal } from './canvas/TranslationProgressModal';
import { TranslationOptionsDialog } from './canvas/TranslationOptionsDialog';
import type { TranslationOption } from './canvas/TranslationOptionsDialog';
import { Group } from 'lucide-react';

interface ProcedureCanvasProps {
  procedureId: string;
  procedureName: string;
  procedureItem?: KnowledgeBaseItem;
  onClose: () => void;
}

const nodeTypes = {
  start: StartNode,
  dynamic: DynamicNode,
  note: NoteNode,
  logic: LogicNode,
  section: GroupNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// ─── Translation API utilities ──────────────────────────────────────────────

const LANG_API_CODES: Record<string, string> = {
  'EN-US': 'en', 'FR': 'fr', 'DE': 'de', 'ES': 'es', 'IT': 'it',
  'PT': 'pt', 'NL': 'nl', 'PL': 'pl', 'JA': 'ja', 'KO': 'ko',
  'ZH': 'zh-CN', 'AR': 'ar', 'HE': 'he', 'RU': 'ru',
};

async function translateText(text: string, fromCode: string, toCode: string): Promise<string> {
  if (!text.trim()) return '';
  const from = LANG_API_CODES[fromCode] || 'en';
  const to = LANG_API_CODES[toCode] || toCode.toLowerCase();
  if (from === to) return text;
  try {
    const resp = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}`
    );
    if (!resp.ok) throw new Error('API error');
    const json = await resp.json();
    const translated = json.responseData?.translatedText;
    if (!translated || translated.startsWith('MYMEMORY WARNING')) {
      return `[${toCode}] ${text}`;
    }
    return translated;
  } catch {
    return `[${toCode}] ${text}`;
  }
}

// Mock workspace users
const workspaceUsers = [
  { id: '1', name: 'Sarah Johnson', initials: 'SJ', color: '#2f80ed' },
  { id: '2', name: 'Michael Chen', initials: 'MC', color: '#11e874' },
  { id: '3', name: 'Emma Williams', initials: 'EW', color: '#9747ff' },
];

// ─── Convert between Step[] (shared context) and ReactFlow nodes/edges ──────

// Convert Step[] from context into ReactFlow nodes and edges
function stepsToFlow(steps: Step[]): { nodes: Node[]; edges: Edge[] } {
  const startNode: Node = {
    id: 'start-node',
    type: 'start',
    position: { x: 400, y: 50 },
    data: { label: 'Start' },
  };

  if (!steps || steps.length === 0) {
    return { nodes: [startNode], edges: [] };
  }

  // Build ordered list following parentStepId chain
  const orderedSteps = getOrderedStepList(steps);

  const nodes: Node[] = [startNode];
  const edges: Edge[] = [];

  orderedSteps.forEach((step, index) => {
    const nodeId = step.id;
    const prevId = index === 0 ? 'start-node' : orderedSteps[index - 1].id;
    const title = step.title || `Step ${index + 1}`;
    const description = step.description || '';
    const options = step.actions.length > 0
      ? step.actions.map((a, i) => ({
          id: `opt-${nodeId}-${i}`,
          text: a.label,
          // FR fully translated, DE partial (first 6 steps), ES none
          textMulti: {
            'FR': `[FR] ${a.label}`,
            ...(index < 6 ? { 'DE': `[DE] ${a.label}` } : {}),
          } as Record<string, string>,
          textMultiBase: {
            'FR': a.label,
            ...(index < 6 ? { 'DE': a.label } : {}),
          } as Record<string, string>,
        }))
      : [{ id: `opt-${nodeId}`, text: 'Continue' }];

    // Build partial translation data for demo:
    // FR = fully translated, DE = first 6 steps only, ES = none
    const titleMulti: Record<string, string> = {
      'EN-US': title,
      'FR': `[FR] ${title}`,
    };
    const titleMultiBase: Record<string, string> = {
      'EN-US': title,
      'FR': title,
    };
    const descriptionMulti: Record<string, string> = {
      'EN-US': description,
      'FR': `[FR] ${description}`,
    };
    const descriptionMultiBase: Record<string, string> = {
      'EN-US': description,
      'FR': description,
    };
    if (index < 6) {
      titleMulti['DE'] = `[DE] ${title}`;
      titleMultiBase['DE'] = title;
      descriptionMulti['DE'] = `[DE] ${description}`;
      descriptionMultiBase['DE'] = description;
    }

    nodes.push({
      id: nodeId,
      type: 'dynamic',
      position: { x: 400, y: 50 + (index + 1) * 300 },
      data: {
        title,
        description,
        titleMulti,
        titleMultiBase,
        descriptionMulti,
        descriptionMultiBase,
        isColorized: !!step.color && step.color !== 'var(--foreground)',
        color: step.color || '#2F80ED',
        isInput: !!(step.validation?.checkpoints?.some(cp => cp.type === 'measurement')),
        inputType: step.validation?.checkpoints?.some(cp => cp.type === 'measurement') ? 'text' : 'picture',
        isBranching: step.actions.length > 0,
        options,
        popups: step.popups.map(p => ({ id: p.id, title: p.title || '' })),
        media: step.mediaFiles.map(m => m.id),
      },
    });

    // Determine the sourceHandle for the edge from the previous node
    let sourceHandle: string | undefined;
    if (index > 0) {
      const prevStep = orderedSteps[index - 1];
      sourceHandle = prevStep.actions.length > 0
        ? `opt-${prevId}-0`   // first action option
        : `opt-${prevId}`;    // single "Continue" option
    }

    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
      sourceHandle: sourceHandle || null,
      type: 'custom',
      style: { strokeWidth: 2, stroke: '#2f80ed' },
      animated: false,
    });
  });

  return getLayoutedElements(nodes, edges);
}

// Follow parentStepId chain to produce ordered array
function getOrderedStepList(steps: Step[]): Step[] {
  if (steps.length === 0) return [];
  // Find root step (no parentStepId)
  const childIds = new Set(steps.filter(s => s.parentStepId).map(s => s.parentStepId!));
  let root = steps.find(s => !s.parentStepId);
  if (!root) root = steps[0];

  const byParent = new Map<string, Step>();
  for (const s of steps) {
    if (s.parentStepId) byParent.set(s.parentStepId, s);
  }

  const ordered: Step[] = [root];
  let current = root;
  while (byParent.has(current.id)) {
    current = byParent.get(current.id)!;
    ordered.push(current);
  }
  // Add any orphans not in the chain
  const inChain = new Set(ordered.map(s => s.id));
  for (const s of steps) {
    if (!inChain.has(s.id)) ordered.push(s);
  }
  return ordered;
}

// Convert ReactFlow nodes/edges back into Step[] for the shared context
function flowToSteps(nodes: Node[], edges: Edge[]): Step[] {
  // Get only dynamic (step) nodes, skip start/note/logic
  const stepNodes = nodes.filter(n => n.type === 'dynamic');
  if (stepNodes.length === 0) return [];

  // Build adjacency from edges: source → target
  const childMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!childMap.has(e.source)) childMap.set(e.source, []);
    childMap.get(e.source)!.push(e.target);
  }

  // Find the first step node connected from start-node
  const startChildren = childMap.get('start-node') || [];
  const firstStepId = startChildren.find(id => stepNodes.some(n => n.id === id));

  // Topological order following edges from start
  const ordered: Node[] = [];
  const visited = new Set<string>();
  function walk(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = stepNodes.find(n => n.id === id);
    if (node) ordered.push(node);
    const children = childMap.get(id) || [];
    for (const c of children) walk(c);
  }
  if (firstStepId) walk(firstStepId);
  // Add any unvisited step nodes
  for (const n of stepNodes) {
    if (!visited.has(n.id)) ordered.push(n);
  }

  return ordered.map((node, index) => {
    const d = node.data as any;
    return {
      id: node.id,
      parentStepId: index > 0 ? ordered[index - 1].id : undefined,
      title: d.title || '',
      description: d.description || '',
      actions: d.isBranching && d.options
        ? d.options.map((opt: any) => ({ label: opt.text, nextStepId: '' }))
        : [],
      color: d.color || '#2F80ED',
      hasAnimation: false,
      popups: (d.popups || []).map((p: any) => ({
        id: p.id || crypto.randomUUID(),
        title: p.title || '',
        position: { x: 50, y: 50 },
        mediaFiles: [],
      })),
      mediaFiles: [],
      validation: undefined,
    };
  });
}

// Auto-arrange function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], compact = false) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = compact ? 200 : 280;

  dagreGraph.setGraph({ rankdir: 'TB', nodesep: compact ? 40 : 100, ranksep: compact ? 30 : 80 });

  // Separate group (section) nodes from layoutable nodes
  const groupNodes = nodes.filter(n => n.type === 'section');
  const groupIds = new Set(groupNodes.map(n => n.id));
  const layoutableNodes = nodes.filter(n => n.type !== 'section');

  // Build a map of parentNode → group id for children, and resolve absolute positions
  // for children that have relative positions stored
  const childToGroup = new Map<string, string>();
  layoutableNodes.forEach(n => {
    if (n.parentNode && groupIds.has(n.parentNode)) {
      childToGroup.set(n.id, n.parentNode);
    }
  });

  // Calculate dynamic heights based on node content
  const nodeHeights = new Map<string, number>();
  layoutableNodes.forEach((node) => {
    let height = compact ? 60 : 120; // Base height for start/logic nodes

    if (node.type === 'dynamic') {
      if (compact) {
        // Compact: just title + small badges
        height = 52;
      } else {
        const data = node.data as any;
        const baseHeight = 80;
        const titleHeight = 30;
        const descriptionHeight = data.description ? Math.min(60, Math.ceil(data.description.length / 4)) : 0;
        const optionsHeight = (data.options?.length || 0) * 18;
        const popupsHeight = (data.popups?.length || 0) * 18;
        const mediaHeight = (data.media?.length || 0) * 18;
        height = baseHeight + titleHeight + descriptionHeight + optionsHeight + popupsHeight + mediaHeight;
      }
    }

    nodeHeights.set(node.id, height);
    dagreGraph.setNode(node.id, { width: nodeWidth, height });
  });

  edges.forEach((edge) => {
    // Only add edges between layoutable nodes
    if (!groupIds.has(edge.source) && !groupIds.has(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  // Assign absolute positions from dagre to all layoutable nodes
  const absolutePositions = new Map<string, { x: number; y: number }>();
  layoutableNodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const height = nodeHeights.get(node.id) || 200;
    absolutePositions.set(node.id, {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - height / 2,
    });
  });

  // Post-layout: spread children of branching nodes wider
  // Build source→targets map from edges, preserving sourceHandle for ordering
  const sourceToTargets = new Map<string, string[]>();
  const edgeHandleMap = new Map<string, string | null>(); // "sourceId:targetId" → sourceHandle
  edges.forEach(edge => {
    if (groupIds.has(edge.source) || groupIds.has(edge.target)) return;
    const list = sourceToTargets.get(edge.source) || [];
    list.push(edge.target);
    sourceToTargets.set(edge.source, list);
    edgeHandleMap.set(`${edge.source}:${edge.target}`, edge.sourceHandle || null);
  });

  // Build option order lookup: nodeId → [optionId, optionId, ...] left-to-right
  const nodeOptionsOrder = new Map<string, string[]>();
  layoutableNodes.forEach(node => {
    const data = node.data as any;
    if (data.options && data.options.length > 1) {
      nodeOptionsOrder.set(node.id, data.options.map((o: any) => o.id));
    }
  });

  // Helper: measure actual node width from DOM, fallback to dagre constant
  function getRenderedWidth(nodeId: string): number {
    const el = document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement | null;
    return el ? el.offsetWidth : nodeWidth;
  }

  // Spread multi-target branching: align each target's input handle under its source handle
  const minTargetGap = nodeWidth + (compact ? 20 : 60); // minimum gap between target left edges
  sourceToTargets.forEach((targets, sourceId) => {
    const uniqueTargets = [...new Set(targets)];
    if (uniqueTargets.length < 2) return;

    const sourcePos = absolutePositions.get(sourceId);
    if (!sourcePos) return;
    const sourceNode = layoutableNodes.find(n => n.id === sourceId);
    if (!sourceNode) return;
    const srcData = sourceNode.data as any;
    const totalOptions = srcData.options?.length || 1;
    const sourceW = getRenderedWidth(sourceId);

    const optionOrder = nodeOptionsOrder.get(sourceId) || [];

    // Map targets to their option handle indices
    const sorted = uniqueTargets
      .map(id => {
        const handle = edgeHandleMap.get(`${sourceId}:${id}`);
        const optIdx = handle ? optionOrder.indexOf(handle) : -1;
        return { id, optIdx, pos: absolutePositions.get(id)! };
      })
      .filter(t => t.pos);

    // Assign unknown-handle targets to unused option slots
    const usedIndices = new Set(sorted.filter(t => t.optIdx >= 0).map(t => t.optIdx));
    const unusedIndices: number[] = [];
    for (let i = 0; i < totalOptions; i++) {
      if (!usedIndices.has(i)) unusedIndices.push(i);
    }
    let unusedPtr = 0;
    sorted.forEach(t => {
      if (t.optIdx < 0 && unusedPtr < unusedIndices.length) {
        t.optIdx = unusedIndices[unusedPtr++];
      }
    });

    // Sort by option index (left-to-right handle order)
    sorted.sort((a, b) => a.optIdx - b.optIdx);

    if (sorted.length < 2) return;

    // Compute ideal X for each target: input handle (50%) under source option handle
    const ideals = sorted.map(t => {
      const handlePct = totalOptions === 1 ? 50 : 8 + (t.optIdx / Math.max(1, totalOptions - 1)) * 84;
      const handleAbsX = sourcePos.x + (handlePct / 100) * sourceW;
      const targetW = getRenderedWidth(t.id);
      return handleAbsX - 0.5 * targetW;
    });

    // Enforce minimum spacing (push right if too close)
    const adjusted = [...ideals];
    for (let i = 1; i < adjusted.length; i++) {
      if (adjusted[i] - adjusted[i - 1] < minTargetGap) {
        adjusted[i] = adjusted[i - 1] + minTargetGap;
      }
    }

    // Re-center around the ideal center to preserve handle alignment symmetry
    const idealCenter = (ideals[0] + ideals[ideals.length - 1]) / 2;
    const adjustedCenter = (adjusted[0] + adjusted[adjusted.length - 1]) / 2;
    const reCenter = idealCenter - adjustedCenter;

    sorted.forEach((t, i) => {
      const newX = adjusted[i] + reCenter;
      const dx = newX - t.pos.x;
      if (Math.abs(dx) > 1) {
        shiftSubtree(t.id, dx, absolutePositions, sourceToTargets);
      }
    });
  });

  function shiftSubtree(
    nodeId: string,
    dx: number,
    positions: Map<string, { x: number; y: number }>,
    childMap: Map<string, string[]>,
    visited = new Set<string>()
  ) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const pos = positions.get(nodeId);
    if (pos) {
      pos.x += dx;
    }
    const children = childMap.get(nodeId);
    if (children) {
      // Only shift children that have a single parent (this node)
      // to avoid double-shifting nodes with multiple incoming edges
      children.forEach(cid => {
        // Count how many parents this child has
        let parentCount = 0;
        childMap.forEach(targets => {
          if (targets.includes(cid)) parentCount++;
        });
        if (parentCount <= 1) {
          shiftSubtree(cid, dx, positions, childMap, visited);
        }
      });
    }
  }

  // For branching nodes whose options all converge to a single child,
  // shift the child so its input handle (center) aligns under the first output handle.
  // Uses DOM-measured widths for accuracy.
  sourceToTargets.forEach((targets, sourceId) => {
    const uniqueTargets = [...new Set(targets)];
    if (uniqueTargets.length !== 1) return;
    const sourceNode = layoutableNodes.find(n => n.id === sourceId);
    if (!sourceNode) return;
    const srcData = sourceNode.data as any;
    if (!srcData.options || srcData.options.length <= 1) return;
    const sourcePos = absolutePositions.get(sourceId);
    const targetPos = absolutePositions.get(uniqueTargets[0]);
    if (!sourcePos || !targetPos) return;

    const sourceW = getRenderedWidth(sourceId);
    const targetW = getRenderedWidth(uniqueTargets[0]);
    // First option handle is at 8% of source width
    const firstHandleX = sourcePos.x + 0.08 * sourceW;
    // Target input handle is at 50% of target width
    const inputHandleX = targetPos.x + 0.50 * targetW;
    const shift = firstHandleX - inputHandleX;

    shiftSubtree(uniqueTargets[0], shift, absolutePositions, sourceToTargets);
  });

  // Align start node center-X with its first child so they line up visually
  const startNode = layoutableNodes.find(n => n.type === 'start');
  if (startNode) {
    const startTargets = sourceToTargets.get(startNode.id);
    if (startTargets && startTargets.length === 1) {
      const childPos = absolutePositions.get(startTargets[0]);
      const startPos = absolutePositions.get(startNode.id);
      if (childPos && startPos) {
        // Center-align: set start's center X to child's center X
        const childCenterX = childPos.x + nodeWidth / 2;
        const startW = 220; // approximate start node width (narrower than dynamic)
        startPos.x = childCenterX - startW / 2;
      }
    }
  }

  // Rebuild group bounds from their children's new absolute positions
  const groupPadding = 50;
  const groupHeaderHeight = 40;
  const updatedGroups = new Map<string, { x: number; y: number; width: number; height: number }>();

  groupNodes.forEach(g => {
    const children = layoutableNodes.filter(n => childToGroup.get(n.id) === g.id);
    if (children.length === 0) {
      // No children — keep group where it is
      updatedGroups.set(g.id, {
        x: g.position.x,
        y: g.position.y,
        width: (g.data as any).width || 320,
        height: (g.data as any).height || 200,
      });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    children.forEach(n => {
      const pos = absolutePositions.get(n.id)!;
      const el = document.querySelector(`[data-id="${n.id}"]`) as HTMLElement | null;
      const w = el ? el.offsetWidth : nodeWidth;
      const h = el ? el.offsetHeight : (nodeHeights.get(n.id) || 200);
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + w);
      maxY = Math.max(maxY, pos.y + h);
    });

    updatedGroups.set(g.id, {
      x: minX - groupPadding,
      y: minY - groupPadding - groupHeaderHeight,
      width: maxX - minX + groupPadding * 2,
      height: maxY - minY + groupPadding * 2 + groupHeaderHeight,
    });
  });

  // Build final node list
  const layoutedNodes: Node[] = [];

  // Add updated group nodes
  groupNodes.forEach(g => {
    const bounds = updatedGroups.get(g.id)!;
    layoutedNodes.push({
      ...g,
      position: { x: bounds.x, y: bounds.y },
      data: { ...g.data, width: bounds.width, height: bounds.height },
    });
  });

  // Add layoutable nodes — convert grouped children back to relative positions
  layoutableNodes.forEach(n => {
    const absPos = absolutePositions.get(n.id)!;
    const groupId = childToGroup.get(n.id);
    if (groupId) {
      const groupBounds = updatedGroups.get(groupId)!;
      layoutedNodes.push({
        ...n,
        position: { x: absPos.x - groupBounds.x, y: absPos.y - groupBounds.y },
      });
    } else {
      layoutedNodes.push({
        ...n,
        parentNode: undefined,
        position: absPos,
      });
    }
  });

  return { nodes: layoutedNodes, edges };
};

function FlowEditorInner({ procedureId, procedureName, procedureItem, onClose }: ProcedureCanvasProps) {
  const { currentRole } = useRole();
  const editingEnabled = hasAccess(currentRole, 'projects-edit');
  const { getSteps, setSteps: setContextSteps } = useProcedureSteps();

  // Build initial flow from shared context steps
  const initialFlow = useMemo(() => {
    const contextSteps = getSteps(procedureId);
    return stepsToFlow(contextSteps);
  }, [procedureId]); // only on first load

  const {
    nodes, edges, setNodes, setEdges,
    onNodesChange, onEdgesChange,
    undo, redo, canUndo, canRedo, takeSnapshot,
  } = useUndoRedo(initialFlow.nodes, initialFlow.edges);

  // Sync flow changes back to the shared context (debounced)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const steps = flowToSteps(nodes, edges);
      if (steps.length > 0) {
        setContextSteps(procedureId, steps);
      }
    }, 500);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [nodes, edges, procedureId, setContextSteps]);
  const [menu, setMenu] = useState<{ x: number; y: number; type: ContextMenuType; data?: any } | null>(null);
  const connectStartRef = useRef<{ nodeId: string | null; handleId: string | null } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ─── Action log for detailed pending changes ───
  // Each entry: { label, detail } — deduped by label+detail to avoid spam
  const changeLogRef = useRef<{ label: string; detail: string }[]>([]);
  const changeLogKeysRef = useRef(new Set<string>());
  const [changeLogVersion, setChangeLogVersion] = useState(0); // bump to trigger re-read
  const logChange = useCallback((label: string, detail: string) => {
    const key = `${label}::${detail}`;
    if (changeLogKeysRef.current.has(key)) return;
    changeLogKeysRef.current.add(key);
    changeLogRef.current.push({ label, detail });
    setChangeLogVersion(v => v + 1);
    setHasUnsavedChanges(true);
  }, []);
  // Read the log (triggers re-render via changeLogVersion)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flowChangeSummary = useMemo(() => [...changeLogRef.current], [changeLogVersion]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mediaLibraryCallback, setMediaLibraryCallback] = useState<((selectedMedia: string[]) => void) | null>(null);
  const [procedureSelectCallback, setProcedureSelectCallback] = useState<((procedureId: string, procedureName: string) => void) | null>(null);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [procedureModalSettings, setProcedureModalSettings] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Navigation & Discovery state
  const [showSearch, setShowSearch] = useState(false);
  const [searchState, setSearchState] = useState<{ activeIds: Set<string> | null; highlightedId: string | null }>({ activeIds: null, highlightedId: null });

  // Validation & Layout state
  const [showValidation, setShowValidation] = useState(false);
  const validationResult = useFlowValidation(nodes, edges, showValidation);
  const { guides, handleNodesChange: smartGuidesHandler, clearGuides } = useSmartGuides(nodes);


  // Hover preview state
  // ReactFlow helpers (must be before callbacks that reference them)
  const { screenToFlowPosition, fitView, setCenter, getViewport, setViewport } = useReactFlow();

  // Collaboration: Comments, Versions, Templates
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // Language / Localization state
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [procedureLanguages, setProcedureLanguages] = useState<string[]>(['EN-US', 'FR', 'DE', 'ES']);
  const [defaultLanguage, setDefaultLanguage] = useState('EN-US');
  const [editingLanguage, setEditingLanguage] = useState('EN-US');
  const [languageVisibility, setLanguageVisibility] = useState<Record<string, boolean>>({ 'EN-US': true, 'FR': true, 'DE': true, 'ES': true });
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [showTranslationProgress, setShowTranslationProgress] = useState(false);
  const [translationTargetLanguages, setTranslationTargetLanguages] = useState<string[]>([]);
  const [translationProgress, setTranslationProgress] = useState<Record<string, number>>({});
  const translationCancelledRef = useRef(false);
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);
  const [translationOptionsCallback, setTranslationOptionsCallback] = useState<((opt: TranslationOption) => void) | null>(null);

  // AI credits state (mock)
  const [aiCreditsUsed, setAiCreditsUsed] = useState(15000);
  const [aiCreditsMax, setAiCreditsMax] = useState(20000);
  // Ref so closures always see the latest AI limit values
  const aiLimitRef = useRef({ used: 15000, max: 20000 });
  useEffect(() => { aiLimitRef.current = { used: aiCreditsUsed, max: aiCreditsMax }; }, [aiCreditsUsed, aiCreditsMax]);

  const [previewingVersionId, setPreviewingVersionId] = useState<string | null>(null);
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>(() => { const sn = initialFlow.nodes.filter(n => n.type === 'dynamic'); const t: CommentThread[] = []; if (sn.length >= 1) t.push({ id: 'thread-1', nodeId: sn[0].id, resolved: false, createdAt: new Date(Date.now()-7200000).toISOString(), comments: [{ id: 'c1', authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', text: 'Should we add a safety warning?', mentions: [], createdAt: new Date(Date.now()-7200000).toISOString() }, { id: 'c2', authorId: '2', authorName: 'Michael Chen', authorInitials: 'MC', authorColor: '#11e874', text: '@Sarah Johnson Yes, I will add one.', mentions: ['1'], createdAt: new Date(Date.now()-3600000).toISOString() }] }); if (sn.length >= 2) t.push({ id: 'thread-2', nodeId: sn[1].id, resolved: true, createdAt: new Date(Date.now()-86400000).toISOString(), comments: [{ id: 'c3', authorId: '3', authorName: 'Emma Williams', authorInitials: 'EW', authorColor: '#9747ff', text: 'Instructions unclear.', mentions: [], createdAt: new Date(Date.now()-86400000).toISOString() }, { id: 'c4', authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', text: 'Fixed.', mentions: [], createdAt: new Date(Date.now()-72000000).toISOString() }] }); if (sn.length >= 3) t.push({ id: 'thread-3', nodeId: sn[2].id, resolved: false, createdAt: new Date(Date.now()-1800000).toISOString(), comments: [{ id: 'c5', authorId: '2', authorName: 'Michael Chen', authorInitials: 'MC', authorColor: '#11e874', text: 'We should add a photo of the air filter housing here. Techs have been confused about which clips to release.', mentions: [], createdAt: new Date(Date.now()-1800000).toISOString() }, { id: 'c6', authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', text: '@Michael Chen Good call! I\'ll take a photo during the next maintenance session.', mentions: ['2'], createdAt: new Date(Date.now()-900000).toISOString() }, { id: 'c7', authorId: '3', authorName: 'Emma Williams', authorInitials: 'EW', authorColor: '#9747ff', text: 'Also consider adding a warning about the brittle plastic clips on older models.', mentions: [], createdAt: new Date(Date.now()-300000).toISOString() }] }); return t; });
  const [versions, setVersions] = useState<Version[]>([{ id: 'v4', name: 'Auto-save', timestamp: new Date(Date.now()-300000).toISOString(), authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', changeSummary: 'Modified 2 nodes', snapshot: { nodes: initialFlow.nodes, edges: initialFlow.edges } }, { id: 'v3', name: 'v2.0 - Branching', timestamp: new Date(Date.now()-7200000).toISOString(), authorId: '2', authorName: 'Michael Chen', authorInitials: 'MC', authorColor: '#11e874', changeSummary: 'Added 3 steps', snapshot: { nodes: initialFlow.nodes.slice(0,3), edges: initialFlow.edges.slice(0,2) } }, { id: 'v2', name: 'v1.0 - Initial', timestamp: new Date(Date.now()-172800000).toISOString(), authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', changeSummary: 'Initial procedure', snapshot: { nodes: initialFlow.nodes.slice(0,2), edges: initialFlow.edges.slice(0,1) } }, { id: 'v1', name: 'Created', timestamp: new Date(Date.now()-259200000).toISOString(), authorId: '3', authorName: 'Emma Williams', authorInitials: 'EW', authorColor: '#9747ff', changeSummary: 'Empty procedure', snapshot: { nodes: [initialFlow.nodes[0]], edges: [] } }]);
  const [templates, setTemplates] = useState<FlowTemplate[]>(() => {
    // Generate built-in templates with real node/edge data
    return BUILT_IN_TEMPLATES.map(def => {
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
  });
  const handleAddComment = useCallback((nodeId: string, threadId: string|null, text: string, mentions: string[]) => { const nc: CommentType = { id: crypto.randomUUID(), authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', text, mentions, createdAt: new Date().toISOString() }; setCommentThreads(p => threadId ? p.map(t => t.id === threadId ? { ...t, comments: [...t.comments, nc] } : t) : [...p, { id: crypto.randomUUID(), nodeId, resolved: false, createdAt: new Date().toISOString(), comments: [nc] }]); }, []);
  const handleResolveThread = useCallback((id: string) => setCommentThreads(p => p.map(t => t.id === id ? { ...t, resolved: true } : t)), []);
  const handleUnresolveThread = useCallback((id: string) => setCommentThreads(p => p.map(t => t.id === id ? { ...t, resolved: false } : t)), []);
  const handleToggleReaction = useCallback((threadId: string, commentId: string, emoji: string) => {
    const currentUser = 'Sarah Johnson';
    setCommentThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      return { ...t, comments: t.comments.map(c => {
        if (c.id !== commentId) return c;
        const reactions = c.reactions || [];
        const existing = reactions.find(r => r.emoji === emoji);
        let updated: { emoji: string; userNames: string[] }[];
        if (existing) {
          if (existing.userNames.includes(currentUser)) {
            const filtered = existing.userNames.filter(n => n !== currentUser);
            updated = filtered.length > 0
              ? reactions.map(r => r.emoji === emoji ? { ...r, userNames: filtered } : r)
              : reactions.filter(r => r.emoji !== emoji);
          } else {
            updated = reactions.map(r => r.emoji === emoji ? { ...r, userNames: [...r.userNames, currentUser] } : r);
          }
        } else {
          updated = [...reactions, { emoji, userNames: [currentUser] }];
        }
        return { ...c, reactions: updated };
      }) };
    }));
  }, []);
  const handleSaveVersion = useCallback((name: string) => { setVersions(p => [{ id: crypto.randomUUID(), name, timestamp: new Date().toISOString(), authorId: '1', authorName: 'Sarah Johnson', authorInitials: 'SJ', authorColor: '#2f80ed', changeSummary: nodes.filter(n => n.type !== 'start').length + ' steps', snapshot: { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) } }, ...p]); }, [nodes, edges]);
  const handlePreviewVersion = useCallback((v: Version|null) => setPreviewingVersionId(v?.id || null), []);
  const handleRestoreVersion = useCallback((v: Version) => { takeSnapshot(); setNodes(JSON.parse(JSON.stringify(v.snapshot.nodes))); setEdges(JSON.parse(JSON.stringify(v.snapshot.edges))); setPreviewingVersionId(null); setHasUnsavedChanges(true); logChange('Version', `Restored "${v.name}"`); }, [setNodes, setEdges, takeSnapshot, logChange]);
  const handleInsertTemplate = useCallback((tpl: FlowTemplate) => {
    if (tpl.nodes.length === 0) return;
    // Calculate insertion offset: place below existing nodes
    const baseY = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.y)) + 300 : 100;
    // Find the bounding box of template nodes to compute offset
    const tplMinY = Math.min(...tpl.nodes.map(n => n.position.y));
    const tplMinX = Math.min(...tpl.nodes.map(n => n.position.x));
    const offsetY = baseY - tplMinY;
    const offsetX = 400 - tplMinX; // Center around x=400
    // Create new IDs for all nodes and options
    const idMap = new Map<string, string>();
    const optMap = new Map<string, string>();
    const nn: Node[] = tpl.nodes.map(n => {
      const nid = crypto.randomUUID();
      idMap.set(n.id, nid);
      const nd = JSON.parse(JSON.stringify(n.data));
      if (nd.options && Array.isArray(nd.options)) {
        nd.options = nd.options.map((o: any) => {
          const oid = crypto.randomUUID();
          optMap.set(o.id, oid);
          return { ...o, id: oid };
        });
      }
      nd.isBranching = nd.options?.length > 1;
      return { id: nid, type: n.type || 'dynamic', position: { x: n.position.x + offsetX, y: n.position.y + offsetY }, data: nd };
    });
    const ne: Edge[] = tpl.edges.filter(e => idMap.has(e.source) && idMap.has(e.target)).map(e => {
      const sh = e.sourceHandle ? (optMap.get(e.sourceHandle) || e.sourceHandle) : null;
      return { id: `e-${idMap.get(e.source)}-${sh || 'src'}-${idMap.get(e.target)}`, source: idMap.get(e.source)!, target: idMap.get(e.target)!, sourceHandle: sh, targetHandle: e.targetHandle || null, type: 'custom' as const, style: { strokeWidth: 2, stroke: '#2f80ed' }, animated: false };
    });
    takeSnapshot();
    // Merge then auto-arrange everything so the inserted template fits cleanly
    const mergedNodes = [...nodes, ...nn];
    const mergedEdges = [...edges, ...ne];
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mergedNodes, mergedEdges, compactView);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setHasUnsavedChanges(true);
    logChange('Template', `Inserted template "${tpl.name}" (${tpl.nodes.length} nodes)`);
    setShowTemplateLibrary(false);
    // Pan to first inserted node after layout
    const firstInserted = layoutedNodes.find(n => n.id === nn[0]?.id);
    if (firstInserted) setTimeout(() => setCenter(firstInserted.position.x + 140, firstInserted.position.y + 100, { zoom: 1, duration: 400 }), 100);
  }, [nodes, edges, setNodes, setEdges, setCenter, takeSnapshot, logChange]);
  const handleSaveAsTemplate = useCallback((name: string, desc: string, cat: string) => { const sn = nodes.filter(n => n.selected && n.type !== 'start'), si = new Set(sn.map(n => n.id)), se = edges.filter(e => si.has(e.source) && si.has(e.target)); setTemplates(p => [...p, { id: crypto.randomUUID(), name, description: desc, category: cat, nodeCount: sn.length||1, createdAt: new Date().toISOString(), authorName: 'Sarah Johnson', nodes: JSON.parse(JSON.stringify(sn)), edges: JSON.parse(JSON.stringify(se)), isFullProcedure: sn.length >= 4, isBuiltIn: false }]); }, [nodes, edges]);
  const commentCounts = useMemo(() => { const c = new Map<string, number>(); commentThreads.forEach(t => { if (!t.resolved) c.set(t.nodeId, (c.get(t.nodeId)||0)+t.comments.length); }); return c; }, [commentThreads]);

  // ─── Language handlers ─────────────────────────────────────────────────
  const handleSetDefaultLanguage = useCallback((code: string) => {
    setDefaultLanguage(code);
    logChange('Language', `Default language changed to ${code}`);
    // Sync base fields from new default's Multi values
    setNodes(nds => nds.map(n => {
      if (n.type !== 'dynamic') return n;
      const d = n.data as any;
      const newTitle = d.titleMulti?.[code] ?? d.title;
      const newDesc = d.descriptionMulti?.[code] ?? d.description;
      const newOptions = d.options?.map((o: any) => ({ ...o, text: o.textMulti?.[code] ?? o.text }));
      return { ...n, data: { ...d, title: newTitle, description: newDesc, options: newOptions } };
    }));
  }, [setNodes]);

  const handleAddLanguages = useCallback((codes: string[], copyFromDefault: boolean) => {
    setProcedureLanguages(prev => [...prev, ...codes]);
    logChange('Language', `Added ${codes.length} language${codes.length > 1 ? 's' : ''}: ${codes.join(', ')}`);
    setLanguageVisibility(prev => {
      const next = { ...prev };
      codes.forEach(c => { next[c] = true; });
      return next;
    });
    if (copyFromDefault) {
      setNodes(nds => nds.map(n => {
        if (n.type !== 'dynamic') return n;
        const d = n.data as any;
        const titleMulti = { ...(d.titleMulti || {}) };
        const titleBase = { ...(d.titleMultiBase || {}) };
        const descMulti = { ...(d.descriptionMulti || {}) };
        const descBase = { ...(d.descriptionMultiBase || {}) };
        codes.forEach(c => {
          if (!titleMulti[c]) { titleMulti[c] = d.title || ''; titleBase[c] = d.title || ''; }
          if (!descMulti[c]) { descMulti[c] = d.description || ''; descBase[c] = d.description || ''; }
        });
        const newOptions = d.options?.map((o: any) => {
          const tm = { ...(o.textMulti || {}) };
          const tb = { ...(o.textMultiBase || {}) };
          codes.forEach(c => { if (!tm[c]) { tm[c] = o.text || ''; tb[c] = o.text || ''; } });
          return { ...o, textMulti: tm, textMultiBase: tb };
        });
        return { ...n, data: { ...d, titleMulti, titleMultiBase: titleBase, descriptionMulti: descMulti, descriptionMultiBase: descBase, options: newOptions } };
      }));
    }
  }, [setNodes]);

  const handleDeleteLanguage = useCallback((code: string) => {
    if (code === defaultLanguage) return;
    logChange('Language', `Removed language: ${code}`);
    setProcedureLanguages(prev => prev.filter(c => c !== code));
    setLanguageVisibility(prev => { const n = { ...prev }; delete n[code]; return n; });
    if (editingLanguage === code) setEditingLanguage(defaultLanguage);
    // Remove Multi field entries for this language
    setNodes(nds => nds.map(n => {
      if (n.type !== 'dynamic') return n;
      const d = n.data as any;
      const titleMulti = { ...(d.titleMulti || {}) }; delete titleMulti[code];
      const titleBase = { ...(d.titleMultiBase || {}) }; delete titleBase[code];
      const descMulti = { ...(d.descriptionMulti || {}) }; delete descMulti[code];
      const descBase = { ...(d.descriptionMultiBase || {}) }; delete descBase[code];
      const newOptions = d.options?.map((o: any) => {
        const tm = { ...(o.textMulti || {}) }; delete tm[code];
        const tb = { ...(o.textMultiBase || {}) }; delete tb[code];
        return { ...o, textMulti: tm, textMultiBase: tb };
      });
      return { ...n, data: { ...d, titleMulti, titleMultiBase: titleBase, descriptionMulti: descMulti, descriptionMultiBase: descBase, options: newOptions } };
    }));
  }, [defaultLanguage, editingLanguage, setNodes]);

  const startRealTranslation = useCallback(async (targetCodes: string[]) => {
    // Final guard: block if AI limit reached
    const { used, max } = aiLimitRef.current;
    if (max > 0 && used >= max) return;
    translationCancelledRef.current = false;
    const init: Record<string, number> = {};
    targetCodes.forEach(c => { init[c] = 0; });
    setTranslationProgress(init);
    setTranslationTargetLanguages(targetCodes);
    setShowTranslationProgress(true);

    const dynamicNodes = nodes.filter(n => n.type === 'dynamic');
    // Collect per-node results: Map<langCode, Map<nodeId, {title, desc, options[]}>>
    const results = new Map<string, Map<string, { title: string; desc: string; opts: string[] }>>();
    targetCodes.forEach(c => results.set(c, new Map()));

    // Translate all languages in parallel; within each language, translate nodes sequentially
    await Promise.all(targetCodes.map(async (code) => {
      let completed = 0;
      for (const node of dynamicNodes) {
        if (translationCancelledRef.current) return;
        const d = node.data as any;
        const [tTitle, tDesc] = await Promise.all([
          translateText(d.title || '', defaultLanguage, code),
          translateText(d.description || '', defaultLanguage, code),
        ]);
        // Translate branching options (skip single "Continue")
        const branchOpts = (d.options || []).filter((o: any) => d.options.length > 1);
        const tOpts = await Promise.all(
          branchOpts.map((o: any) => translateText(o.text || '', defaultLanguage, code))
        );
        results.get(code)!.set(node.id, { title: tTitle, desc: tDesc, opts: tOpts });
        completed++;
        setTranslationProgress(prev => ({ ...prev, [code]: Math.round((completed / dynamicNodes.length) * 100) }));
      }
    }));

    if (translationCancelledRef.current) return;

    // Apply all results to nodes
    setNodes(nds => nds.map(n => {
      if (n.type !== 'dynamic') return n;
      const d = n.data as any;
      const titleMulti = { ...(d.titleMulti || {}) };
      const titleBase = { ...(d.titleMultiBase || {}) };
      const descMulti = { ...(d.descriptionMulti || {}) };
      const descBase = { ...(d.descriptionMultiBase || {}) };
      targetCodes.forEach(code => {
        const r = results.get(code)?.get(n.id);
        if (r) {
          titleMulti[code] = r.title;
          titleBase[code] = d.title || '';
          descMulti[code] = r.desc;
          descBase[code] = d.description || '';
        }
      });
      const newOptions = d.options?.map((o: any, i: number) => {
        const tm = { ...(o.textMulti || {}) };
        const tb = { ...(o.textMultiBase || {}) };
        if (d.options.length > 1) {
          targetCodes.forEach(code => {
            const r = results.get(code)?.get(n.id);
            if (r && r.opts[i] !== undefined) {
              tm[code] = r.opts[i];
              tb[code] = o.text || '';
            }
          });
        }
        return { ...o, textMulti: tm, textMultiBase: tb };
      });
      return { ...n, data: { ...d, titleMulti, titleMultiBase: titleBase, descriptionMulti: descMulti, descriptionMultiBase: descBase, options: newOptions } };
    }));

    setAiCreditsUsed(prev => Math.min(prev + targetCodes.length * 500, aiCreditsMax + 5000));
    logChange('Translation', `AI translated to ${targetCodes.join(', ')}`);
    setShowTranslationProgress(false);
    setTranslationTargetLanguages([]);
  }, [nodes, defaultLanguage, setNodes, aiCreditsMax, logChange]);

  const handleTranslateWithAI = useCallback((targetCodes: string[]) => {
    // Use ref to always get latest AI limit values (avoids stale closure)
    const { used, max } = aiLimitRef.current;
    if (max > 0 && used >= max) return;
    if (targetCodes.length === 0) return;
    const hasExisting = nodes.some(n => {
      if (n.type !== 'dynamic') return false;
      const d = n.data as any;
      return targetCodes.some(c => d.titleMulti?.[c] || d.descriptionMulti?.[c]);
    });
    if (hasExisting) {
      setTranslationOptionsCallback(() => (_opt: TranslationOption) => {
        // Re-check limit when user confirms the options dialog
        const lim = aiLimitRef.current;
        if (lim.max > 0 && lim.used >= lim.max) return;
        startRealTranslation(targetCodes);
      });
      setShowTranslationOptions(true);
    } else {
      startRealTranslation(targetCodes);
    }
  }, [nodes, startRealTranslation]);


  const handleToggleVisibility = useCallback((code: string) => {
    setLanguageVisibility(prev => ({ ...prev, [code]: !prev[code] }));
  }, []);

  // ─── Multi-select clipboard (copy/paste/cut/duplicate) ──────────────────
  interface ClipboardData {
    nodes: Array<{ type: string; relativePosition: { x: number; y: number }; data: Record<string, any>; originalId: string }>;
    edges: Array<{ sourceOriginalId: string; targetOriginalId: string; sourceHandle: string | null; targetHandle: string | null }>;
  }
  const clipboardRef = useRef<ClipboardData | null>(null);
  const selectedNodeCount = useMemo(() => nodes.filter(n => n.selected).length, [nodes]);

  const copySelectedToClipboard = useCallback(() => {
    const selected = nodes.filter(n => n.selected && n.type !== 'start');
    if (selected.length === 0) return;
    const cx = selected.reduce((s, n) => s + n.position.x, 0) / selected.length;
    const cy = selected.reduce((s, n) => s + n.position.y, 0) / selected.length;
    const ids = new Set(selected.map(n => n.id));
    clipboardRef.current = {
      nodes: selected.map(n => {
        const { onChange, onAction, onAddOption, onAddConnectedStep, onOpenMediaLibrary, onSelectProcedure, connectedHandles, editingEnabled, compactView: _cv, ...clean } = n.data as any;
        return { type: n.type!, relativePosition: { x: n.position.x - cx, y: n.position.y - cy }, data: clean, originalId: n.id };
      }),
      edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)).map(e => ({
        sourceOriginalId: e.source, targetOriginalId: e.target, sourceHandle: e.sourceHandle || null, targetHandle: e.targetHandle || null,
      })),
    };
  }, [nodes, edges]);

  const pasteFromClipboard = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || clip.nodes.length === 0) return;
    const idMap = new Map<string, string>();
    const optMap = new Map<string, string>();
    const maxY = nodes.reduce((m, n) => Math.max(m, n.position.y), 0);
    const avgX = nodes.length > 0 ? nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length : 400;
    const newNodes: Node[] = clip.nodes.map(cn => {
      const nid = crypto.randomUUID(); idMap.set(cn.originalId, nid);
      const nd = JSON.parse(JSON.stringify(cn.data));
      if (nd.options && Array.isArray(nd.options)) nd.options = nd.options.map((o: any) => { const oid = crypto.randomUUID(); optMap.set(o.id, oid); return { ...o, id: oid }; });
      return { id: nid, type: cn.type, position: { x: cn.relativePosition.x + avgX + 50, y: cn.relativePosition.y + maxY + 100 }, selected: true, data: nd };
    });
    const newEdges: Edge[] = clip.edges.filter(ce => idMap.has(ce.sourceOriginalId) && idMap.has(ce.targetOriginalId)).map(ce => {
      const sh = ce.sourceHandle ? (optMap.get(ce.sourceHandle) || ce.sourceHandle) : null;
      return { id: `e-${idMap.get(ce.sourceOriginalId)}-${sh || 'src'}-${idMap.get(ce.targetOriginalId)}`, source: idMap.get(ce.sourceOriginalId)!, target: idMap.get(ce.targetOriginalId)!, sourceHandle: sh, targetHandle: ce.targetHandle, type: 'custom' as const, style: { strokeWidth: 2, stroke: '#2f80ed' }, animated: false };
    });
    takeSnapshot(); setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes)); setEdges(eds => [...eds, ...newEdges]); setHasUnsavedChanges(true);
    logChange('Clipboard', `Pasted ${newNodes.length} node${newNodes.length > 1 ? 's' : ''}`);
  }, [nodes, setNodes, setEdges, takeSnapshot, logChange]);

  const deleteSelectedNodes = useCallback(() => {
    const sel = nodes.filter(n => n.selected && n.type !== 'start');
    if (sel.length === 0) return;
    sel.forEach(n => logChange('Step', `Deleted "${(n.data as any)?.title || n.type || 'node'}"`));
    const ids = new Set(sel.map(n => n.id));
    // Find group nodes being deleted — free their children first
    const deletedGroupIds = new Set(sel.filter(n => n.type === 'section').map(n => n.id));
    takeSnapshot();
    setNodes(nds => nds
      .filter(n => !ids.has(n.id))
      .map(n => n.parentNode && deletedGroupIds.has(n.parentNode)
        ? { ...n, parentNode: undefined, position: { x: n.position.x + (nds.find(g => g.id === n.parentNode)?.position.x || 0), y: n.position.y + (nds.find(g => g.id === n.parentNode)?.position.y || 0) } }
        : n
      )
    );
    setEdges(eds => eds.filter(e => !ids.has(e.source) && !ids.has(e.target)));
    setHasUnsavedChanges(true);
  }, [nodes, setNodes, setEdges, takeSnapshot]);

  const duplicateSelected = useCallback(() => {
    const sel = nodes.filter(n => n.selected && n.type !== 'start');
    if (sel.length === 0) return;
    const selIds = new Set(sel.map(n => n.id));
    const idMap = new Map<string, string>(); const optMap = new Map<string, string>();
    const newNodes: Node[] = sel.map(n => {
      const nid = crypto.randomUUID(); idMap.set(n.id, nid);
      const { onChange, onAction, onAddOption, onAddConnectedStep, onOpenMediaLibrary, onSelectProcedure, connectedHandles, editingEnabled, compactView: _cv, ...clean } = n.data as any;
      const nd = JSON.parse(JSON.stringify(clean));
      if (nd.options && Array.isArray(nd.options)) nd.options = nd.options.map((o: any) => { const oid = crypto.randomUUID(); optMap.set(o.id, oid); return { ...o, id: oid }; });
      return { id: nid, type: n.type!, position: { x: n.position.x + 50, y: n.position.y + 50 }, selected: true, data: nd };
    });
    const intEdges = edges.filter(e => selIds.has(e.source) && selIds.has(e.target)).map(e => {
      const sh = e.sourceHandle ? (optMap.get(e.sourceHandle) || e.sourceHandle) : null;
      return { id: `e-${idMap.get(e.source)}-${sh || 'src'}-${idMap.get(e.target)}`, source: idMap.get(e.source)!, target: idMap.get(e.target)!, sourceHandle: sh, targetHandle: e.targetHandle || null, type: 'custom' as const, style: { strokeWidth: 2, stroke: '#2f80ed' }, animated: false };
    });
    takeSnapshot(); setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes)); setEdges(eds => [...eds, ...intEdges]); setHasUnsavedChanges(true);
    logChange('Step', `Duplicated ${sel.length} node${sel.length > 1 ? 's' : ''}`);
  }, [nodes, edges, setNodes, setEdges, takeSnapshot, logChange]);

  const selectAllNodes = useCallback(() => { setNodes(nds => nds.map(n => ({ ...n, selected: true }))); }, [setNodes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if ((e.key === 'Delete' || e.key === 'Backspace') && !ctrl) { e.preventDefault(); deleteSelectedNodes(); if (edges.some(ed => ed.selected)) { takeSnapshot(); setEdges(eds => eds.filter(ed => !ed.selected)); setHasUnsavedChanges(true); logChange('Connection', 'Connection removed'); } return; }
      if (ctrl && e.key === 'a') { e.preventDefault(); selectAllNodes(); return; }
      if (ctrl && e.key === 'c') { e.preventDefault(); copySelectedToClipboard(); return; }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteFromClipboard(); return; }
      if (ctrl && e.key === 'x') { e.preventDefault(); copySelectedToClipboard(); deleteSelectedNodes(); return; }
      if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); return; }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [edges, setEdges, takeSnapshot, copySelectedToClipboard, pasteFromClipboard, deleteSelectedNodes, duplicateSelected, selectAllNodes, logChange]);

  // Helper to update node data
  const onNodeDataChange = useCallback((id: string, newData: any) => {
    // Detect what changed and log it
    const node = nodes.find(n => n.id === id);
    const title = (node?.data as any)?.title || 'Untitled';
    const stepLabel = `"${title}"`;
    if ('title' in newData) logChange('Edit', `Title changed on ${stepLabel}`);
    if ('description' in newData) logChange('Edit', `Description changed on ${stepLabel}`);
    if ('color' in newData || 'isColorized' in newData) logChange('Style', `Color changed on ${stepLabel}`);
    if ('media' in newData) {
      const oldMedia = ((node?.data as any)?.media || []) as string[];
      const newMedia = (newData.media || []) as string[];
      if (newMedia.length > oldMedia.length) logChange('Media', `Media added to ${stepLabel}`);
      else if (newMedia.length < oldMedia.length) logChange('Media', `Media removed from ${stepLabel}`);
    }
    if ('options' in newData) {
      const oldOpts = ((node?.data as any)?.options || []) as any[];
      const newOpts = (newData.options || []) as any[];
      if (newOpts.length > oldOpts.length) logChange('Options', `Option added to ${stepLabel}`);
      else if (newOpts.length < oldOpts.length) logChange('Options', `Option removed from ${stepLabel}`);
      else logChange('Options', `Option text changed on ${stepLabel}`);
    }
    if ('popups' in newData) {
      const oldP = ((node?.data as any)?.popups || []) as any[];
      const newP = (newData.popups || []) as any[];
      if (newP.length > oldP.length) logChange('Popup', `Popup added to ${stepLabel}`);
      else if (newP.length < oldP.length) logChange('Popup', `Popup removed from ${stepLabel}`);
      else logChange('Popup', `Popup edited on ${stepLabel}`);
    }
    if ('isInput' in newData) logChange('Input', `Input ${newData.isInput ? 'enabled' : 'disabled'} on ${stepLabel}`);
    if ('inputType' in newData) logChange('Input', `Input type changed to "${newData.inputType}" on ${stepLabel}`);
    if ('titleMulti' in newData || 'descriptionMulti' in newData) logChange('Translation', `Translation edited on ${stepLabel}`);
    if ('linkedProcedureId' in newData) logChange('Link', `Linked procedure changed on ${stepLabel}`);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedData = { ...node.data, ...newData };
          if ('options' in updatedData) {
            updatedData.isBranching = updatedData.options.length > 1;
          }
          return { ...node, data: updatedData };
        }
        return node;
      })
    );

    // When options change, clean up orphaned edges
    if ('options' in newData) {
      const validHandleIds = new Set(newData.options.map((o: any) => o.id));
      setEdges(eds => eds.filter(e => {
        if (e.source !== id) return true;
        if (!e.sourceHandle || e.sourceHandle === 'default') return true;
        return validHandleIds.has(e.sourceHandle);
      }));
    }
    setHasUnsavedChanges(true);
  }, [setNodes, nodes, logChange]);

  const onNodeAction = useCallback((id: string, action: 'delete' | 'duplicate') => {
    const node = nodes.find(n => n.id === id);
    const title = (node?.data as any)?.title || 'Untitled';
    if (action === 'delete') {
      if (node?.type === 'start') return;
      logChange('Step', `Deleted "${title}"`);
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    } else if (action === 'duplicate') {
      if (node && node.type !== 'start') {
        logChange('Step', `Duplicated "${title}"`);
        const newNode = {
          ...node,
          id: crypto.randomUUID(),
          position: { x: node.position.x + 50, y: node.position.y + 50 },
          data: { ...node.data },
          selected: true
        };
        setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNode));
      }
    }
    setHasUnsavedChanges(true);
  }, [nodes, setNodes, setEdges, logChange]);

  // Add connected step handler
  const handleAddConnectedStep = useCallback((nodeId: string, sourceHandle?: string) => {
    const parent = nodes.find(n => n.id === nodeId);
    logChange('Step', `Added connected step from "${(parent?.data as any)?.title || 'node'}"`);
    let newNodePosition = { x: 0, y: 0 };
    let newNodeId: string = '';

    setNodes(currentNodes => {
      const parentNode = currentNodes.find(n => n.id === nodeId);
      if (!parentNode) return currentNodes;

      const stepCount = currentNodes.filter(n => n.type !== 'start').length + 1;
      newNodeId = crypto.randomUUID();

      // Find existing child nodes connected from this parent to arrange horizontally
      const existingChildIds = new Set(
        edges.filter(e => e.source === nodeId).map(e => e.target)
      );
      const existingChildren = currentNodes.filter(n => existingChildIds.has(n.id));
      const childCount = existingChildren.length;

      // Node width ~280px + 40px gap = 320px spacing
      const nodeSpacing = 320;
      // Offset so children are centered under the parent
      const totalWidth = (childCount + 1) * nodeSpacing;
      const startX = parentNode.position.x - (totalWidth / 2) + (nodeSpacing / 2);

      newNodePosition = {
        x: startX + childCount * nodeSpacing,
        y: parentNode.position.y + 300
      };

      // Reposition existing children to keep them centered
      const updatedPositions = new Map<string, { x: number; y: number }>();
      existingChildren.forEach((child, i) => {
        updatedPositions.set(child.id, {
          x: startX + i * nodeSpacing,
          y: child.position.y,
        });
      });

      const newNode: Node = {
        id: newNodeId,
        type: 'dynamic',
        position: newNodePosition,
        selected: true, // Auto-select the new node
        data: {
          title: `Step ${stepCount}`,
          description: '',
          isColorized: false,
          color: '#f59e0b',
          isInput: false,
          inputType: 'text',
          isBranching: false,
          options: [{ id: crypto.randomUUID(), text: 'Continue' }],
          popups: [],
          media: []
        }
      };

      // Use the provided sourceHandle, or fall back to the first option's ID
      const parentOptions = (parentNode.data as any)?.options;
      const resolvedHandle = sourceHandle || parentOptions?.[0]?.id || 'default';

      const newEdge: Edge = {
        id: `e-${nodeId}-${resolvedHandle}-${newNodeId}`,
        source: nodeId,
        sourceHandle: resolvedHandle,
        target: newNodeId,
        type: 'custom',
        style: { strokeWidth: 2, stroke: '#2f80ed' },
        animated: false
      };
      
      setTimeout(() => setEdges(eds => addEdge(newEdge, eds)), 0);

      // Deselect all, reposition existing siblings, and add new node
      return currentNodes.map(n => {
        const newPos = updatedPositions.get(n.id);
        return {
          ...n,
          selected: false,
          position: newPos || n.position,
        };
      }).concat(newNode);
    });
    
    // Center the new node in view - account for node dimensions (roughly 280x200)
    setTimeout(() => {
      setCenter(newNodePosition.x + 140, newNodePosition.y + 100, { zoom: 1, duration: 400 });
    }, 100);
    
    setHasUnsavedChanges(true);
  }, [edges, setNodes, setEdges, setCenter]);

  // Add additional branching option (first option is always the default output)
  const handleAddOption = useCallback((nodeId: string) => {
    const nd = nodes.find(n => n.id === nodeId);
    logChange('Options', `Option added to "${(nd?.data as any)?.title || 'node'}"`);
    setNodes(currentNodes => {
      const node = currentNodes.find(n => n.id === nodeId);
      if (!node) return currentNodes;

      const existingOptions = (node.data as any)?.options || [{ id: crypto.randomUUID(), text: 'Continue' }];
      const newOption = { id: crypto.randomUUID(), text: `Option ${existingOptions.length}` };
      const firstOptionId = existingOptions[0]?.id;

      // Migrate edges: if any edge uses "default" or null sourceHandle, update to first option's ID
      if (firstOptionId) {
        setEdges(eds => eds.map(e => {
          if (e.source === nodeId && (!e.sourceHandle || e.sourceHandle === 'default')) {
            return { ...e, sourceHandle: firstOptionId };
          }
          return e;
        }));
      }

      return currentNodes.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              options: [...existingOptions, newOption],
              isBranching: true
            }
          };
        }
        return n;
      });
    });

    setHasUnsavedChanges(true);
  }, [setNodes, setEdges]);

  // Add node between two connected nodes (from edge + button)
  const handleAddNodeBetween = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    logChange('Step', 'Inserted step between connections');
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return;
    
    // Create new node between source and target
    const stepCount = nodes.filter(n => n.type !== 'start').length + 1;
    const newNodeId = crypto.randomUUID();
    
    // Position halfway between source and target
    const newPosition = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2
    };
    
    const newNodeFirstOptionId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: 'dynamic',
      position: newPosition,
      selected: true,
      data: {
        title: `Step ${stepCount}`,
        description: '',
        isColorized: false,
        color: '#f59e0b',
        isInput: false,
        inputType: 'text',
        isBranching: false,
        options: [{ id: newNodeFirstOptionId, text: 'Continue' }],
        popups: [],
        media: []
      }
    };

    // Create two new edges: source -> newNode and newNode -> target
    const edge1: Edge = {
      id: `e-${edge.source}-${edge.sourceHandle || 'src'}-${newNodeId}`,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: newNodeId,
      type: 'custom',
      style: { strokeWidth: 2, stroke: '#2f80ed' },
      animated: false
    };

    const edge2: Edge = {
      id: `e-${newNodeId}-${newNodeFirstOptionId}-${edge.target}`,
      source: newNodeId,
      sourceHandle: newNodeFirstOptionId,
      target: edge.target,
      targetHandle: edge.targetHandle,
      type: 'custom',
      style: { strokeWidth: 2, stroke: '#2f80ed' },
      animated: false
    };
    
    // Update state: remove old edge, add new node and two new edges
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setEdges((eds) => eds.filter(e => e.id !== edgeId).concat([edge1, edge2]));
    setHasUnsavedChanges(true);
    
    // Center on new node
    setTimeout(() => {
      setCenter(newPosition.x + 140, newPosition.y + 100, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, edges, setNodes, setEdges, setCenter]);

  // Auto Arrange
  const onAutoArrange = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, compactView);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setHasUnsavedChanges(true);
  }, [edges, nodes, setNodes, setEdges, compactView]);

  // Re-layout when compact view toggles so lines get shorter/longer
  const prevCompactRef = useRef(compactView);
  useEffect(() => {
    if (prevCompactRef.current !== compactView) {
      prevCompactRef.current = compactView;
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, compactView);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      fitView({ padding: 0.15, duration: 400 });
    }
  }, [compactView]); // intentionally only depend on compactView to avoid re-triggering on node changes

  // Validation: Go to node handler
  const handleGoToValidationNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    // Center on the node and briefly select it
    setCenter(node.position.x + 140, node.position.y + 100, { zoom: 1, duration: 400 });
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })));
  }, [nodes, setNodes, setCenter]);

  // Alignment: Update positions handler
  const handleAlignmentUpdate = useCallback((updates: { id: string; position: { x: number; y: number } }[]) => {
    takeSnapshot();
    setNodes(nds => nds.map(n => {
      const update = updates.find(u => u.id === n.id);
      if (update) return { ...n, position: update.position };
      return n;
    }));
    setHasUnsavedChanges(true);
  }, [setNodes, takeSnapshot]);

  // Selected nodes for alignment toolbar
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);

  // Wrap onNodesChange with smart guides
  const handleNodesChangeWithGuides = useCallback(
    (changes: any) => smartGuidesHandler(changes, onNodesChange),
    [smartGuidesHandler, onNodesChange]
  );

  // Inject callbacks into nodes
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      // Find which handles have connections
      const connectedHandles = new Set<string>();
      const firstOptionId = (node.data as any)?.options?.[0]?.id;
      edges.forEach(edge => {
        if (edge.source === node.id) {
          connectedHandles.add(edge.sourceHandle || firstOptionId || 'default');
        }
      });

      // Search: apply dimming/highlighting classes
      let searchClassName = '';
      if (searchState.activeIds) {
        if (node.id === searchState.highlightedId) {
          searchClassName = 'canvas-search-highlight';
        } else if (!searchState.activeIds.has(node.id)) {
          searchClassName = 'canvas-search-dimmed';
        }
      }

      // Validation: apply indicator classes when panel is open
      let validationClassName = '';
      if (showValidation && validationResult.nodeIssueMap.has(node.id)) {
        const severity = validationResult.nodeIssueMap.get(node.id);
        if (severity === 'error') validationClassName = 'canvas-validation-error';
        else if (severity === 'warning') validationClassName = 'canvas-validation-warning';
      }

      return {
        ...node,
        className: [searchClassName, validationClassName].filter(Boolean).join(' ') || node.className,
        data: {
          ...node.data,
          editingEnabled,
          editingLanguage,
          defaultLanguage,
          compactView,
          onChange: (newData: any) => onNodeDataChange(node.id, newData),
          onAction: (action: any) => onNodeAction(node.id, action),
          onAddOption: node.type === 'dynamic' ? () => handleAddOption(node.id) : undefined,
          onAddConnectedStep: (node.type === 'dynamic' || node.type === 'start' || node.type === 'logic') ? (sourceHandle?: string) => handleAddConnectedStep(node.id, sourceHandle) : undefined,
          onOpenMediaLibrary: (callback: (selectedMedia: string[]) => void) => {
            setMediaLibraryCallback(() => callback);
          },
          onSelectProcedure: node.type === 'logic' ? () => {
            setProcedureSelectCallback(() => (procedureId: string, procedureName: string) => {
              setNodes((nds) => nds.map((n) =>
                n.id === node.id
                  ? { ...n, data: { ...n.data, linkedProcedureId: procedureId, linkedProcedureName: procedureName } }
                  : n
              ));
              setProcedureSelectCallback(null);
            });
          } : undefined,
          // Group node: ungroup callback
          onUngroup: node.type === 'section' ? () => {
            setNodes(nds => {
              const groupNode = nds.find(n => n.id === node.id);
              if (!groupNode) return nds.filter(n => n.id !== node.id);
              return nds
                .filter(n => n.id !== node.id)
                .map(n => n.parentNode === node.id
                  ? { ...n, parentNode: undefined, position: { x: n.position.x + groupNode.position.x, y: n.position.y + groupNode.position.y } }
                  : n
                );
            });
            setHasUnsavedChanges(true);
          } : undefined,
          commentCount: commentCounts.get(node.id) || 0,
          commentThreads: commentThreads.filter(t => t.nodeId === node.id).map(t => ({ id: t.id, resolved: t.resolved, comments: t.comments.map(c => ({ id: c.id, authorInitials: c.authorInitials, authorColor: c.authorColor, authorName: c.authorName, text: c.text, createdAt: c.createdAt, reactions: c.reactions })) })),
          onAddComment: (text: string, threadId?: string) => handleAddComment(node.id, threadId || null, text, []),
          onResolveThread: handleResolveThread,
          onUnresolveThread: handleUnresolveThread,
          onToggleReaction: handleToggleReaction,
          connectedHandles
        },
      };
    });
  }, [nodes, edges, onNodeDataChange, onNodeAction, handleAddOption, handleAddConnectedStep, setNodes, editingEnabled, searchState, showValidation, validationResult.nodeIssueMap, commentCounts, commentThreads, handleAddComment, handleResolveThread, handleUnresolveThread, handleToggleReaction, editingLanguage, defaultLanguage, compactView]);

  // Delete edge handler
  const handleDeleteEdge = useCallback((edgeId: string) => {
    logChange('Connection', 'Connection removed');
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setHasUnsavedChanges(true);
  }, [setEdges, logChange]);

  // Inject callbacks into edges (+ labels)
  const edgesWithCallbacks = useMemo(() => {
    return edges.map((edge) => {
      // Find the source node to get branch label
      const sourceNode = nodes.find(n => n.id === edge.source);
      const options = (sourceNode?.data as any)?.options || [];
      const hasBranches = options.length > 1;
      const optionLabel = hasBranches && edge.sourceHandle
        ? options.find((o: any) => o.id === edge.sourceHandle)?.text
        : undefined;

      return {
        ...edge,
        data: {
          ...edge.data,
          onAddNodeBetween: handleAddNodeBetween,
          onDelete: handleDeleteEdge,
          label: optionLabel,
        }
      };
    });
  }, [edges, nodes, handleAddNodeBetween, handleDeleteEdge]);

  // Validate connections: prevent self-loops, duplicates, and enforce one-edge-per-source-handle
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;
      // Prevent duplicate edge from same source handle to same target
      const duplicateExists = edges.some(
        e => e.source === connection.source && e.target === connection.target && e.sourceHandle === connection.sourceHandle
      );
      if (duplicateExists) return false;
      // Each source handle can only connect to one target (dragging replaces, but block the UI hint)
      const handleAlreadyConnected = edges.some(
        e => e.source === connection.source && e.sourceHandle === connection.sourceHandle
      );
      if (handleAlreadyConnected) return false;
      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      connectStartRef.current = null;
      
      // If dragging from a source handle that already has a connection, remove the old one
      setEdges((eds) => {
        // Remove any existing connection from the same source handle
        const filteredEdges = eds.filter(
          (edge) => 
            !(edge.source === params.source && edge.sourceHandle === params.sourceHandle)
        );
        
        // Add the new connection
        return addEdge({
          ...params,
          type: 'custom',
          style: { strokeWidth: 2, stroke: '#2f80ed' },
          animated: false
        }, filteredEdges);
      });
      
      setHasUnsavedChanges(true);
      logChange('Connection', 'Connected nodes');
    },
    [setEdges, logChange]
  );

  const edgeUpdateSuccessful = useRef(true);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeUpdateSuccessful.current = true;
      takeSnapshot();
      setEdges((eds) => updateEdge(oldEdge, newConnection, eds));
      setHasUnsavedChanges(true);
      logChange('Connection', 'Connection rerouted');
    },
    [setEdges, takeSnapshot, logChange]
  );

  const onEdgeUpdateEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeUpdateSuccessful.current) {
        // Dragged off into empty space — delete the edge
        takeSnapshot();
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        setHasUnsavedChanges(true);
        logChange('Connection', 'Connection removed');
      }
      edgeUpdateSuccessful.current = true;
    },
    [setEdges, takeSnapshot, logChange]
  );

  // ─── Drag into / out of group frames ───
  const handleNodeDragStop = useCallback((_event: React.MouseEvent, draggedNode: Node) => {
    clearGuides();
    // Skip group nodes and start nodes
    if (draggedNode.type === 'section' || draggedNode.type === 'start') return;

    setNodes(nds => {
      const groups = nds.filter(n => n.type === 'section');
      if (groups.length === 0) return nds;

      // Compute absolute position of the dragged node
      const parent = draggedNode.parentNode ? nds.find(n => n.id === draggedNode.parentNode) : null;
      const absX = draggedNode.position.x + (parent?.position.x || 0);
      const absY = draggedNode.position.y + (parent?.position.y || 0);

      // Get dragged node's DOM size
      const el = document.querySelector(`[data-id="${draggedNode.id}"]`) as HTMLElement | null;
      const nw = el ? el.offsetWidth : 280;
      const nh = el ? el.offsetHeight : 180;
      const cx = absX + nw / 2;
      const cy = absY + nh / 2;

      // Find group whose bounds contain the center of the dragged node
      let targetGroup: Node | null = null;
      for (const g of groups) {
        const gw = (g.data as any)?.width || 320;
        const gh = (g.data as any)?.height || 120;
        if (cx >= g.position.x && cx <= g.position.x + gw && cy >= g.position.y && cy <= g.position.y + gh) {
          targetGroup = g;
          break;
        }
      }

      const currentParent = draggedNode.parentNode || null;
      const targetId = targetGroup?.id || null;

      // No change needed
      if (currentParent === targetId) return nds;

      return nds.map(n => {
        if (n.id !== draggedNode.id) return n;
        if (targetGroup) {
          // Drag into group — convert to relative position
          return { ...n, parentNode: targetGroup.id, position: { x: absX - targetGroup.position.x, y: absY - targetGroup.position.y } };
        } else {
          // Drag out of group — convert to absolute position
          return { ...n, parentNode: undefined, position: { x: absX, y: absY } };
        }
      });
    });
    setHasUnsavedChanges(true);
  }, [setNodes, clearGuides]);

  const onConnectStart = useCallback((_: any, params: OnConnectStartParams) => {
    connectStartRef.current = params;
  }, []);

  const onConnectEnd = useCallback(
    () => {
      connectStartRef.current = null;
    },
    []
  );

  // Context menu for canvas - now includes settings option
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        type: ContextMenuType.CANVAS_ROOT,
        data: null
      });
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      // If multiple nodes are selected, show bulk context menu
      const selCount = nodes.filter(n => n.selected).length;
      if (selCount > 1) {
        setMenu({
          x: event.clientX,
          y: event.clientY,
          type: ContextMenuType.MULTI_SELECT,
          data: { selectedCount: selCount }
        });
      } else {
        setMenu({
          x: event.clientX,
          y: event.clientY,
          type: ContextMenuType.NODE,
          data: { ...node.data, nodeId: node.id, nodeType: node.type }
        });
      }
    },
    [nodes]
  );

  const onPaneClick = useCallback(() => setMenu(null), []);
  const onNodeClick = useCallback((_: any, node: Node) => {
    setMenu(null);
  }, []);

  // ─── Group Node Creation (moved before handleMenuAction to avoid TDZ) ───
  const handleCreateGroup = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected && n.type !== 'start' && n.type !== 'section');
    if (selectedNodes.length < 2) return;
    takeSnapshot();
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // Measure actual DOM node sizes when available, fallback to generous estimates
    selectedNodes.forEach(n => {
      const el = document.querySelector(`[data-id="${n.id}"]`) as HTMLElement | null;
      const w = el ? el.offsetWidth : 320;
      const h = el ? el.offsetHeight : 220;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + w);
      maxY = Math.max(maxY, n.position.y + h);
    });
    const groupId = `section-${Date.now()}`;
    const groupX = minX - padding;
    const groupY = minY - padding - 40;
    const groupNode: Node = {
      id: groupId, type: 'section',
      position: { x: groupX, y: groupY },
      data: { label: 'Group', color: '#bfdbfe', childCount: selectedNodes.length, width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 + 40 },
      zIndex: -1,
      draggable: true,
      selectable: true,
      style: { overflow: 'visible' },
    };
    const childIds = new Set(selectedNodes.map(n => n.id));
    setNodes(nds => [
      groupNode,
      ...nds.map(n => childIds.has(n.id)
        ? { ...n, parentNode: groupId, position: { x: n.position.x - groupX, y: n.position.y - groupY } }
        : n
      ),
    ]);
    setHasUnsavedChanges(true);
    logChange('Group', `Created group with ${selectedNodes.length} nodes`);
  }, [nodes, setNodes, takeSnapshot, logChange]);

  const handleMenuAction = useCallback((action: string) => {
    if (!menu) return;

    // Handle multi-select bulk actions
    if (menu.type === ContextMenuType.MULTI_SELECT) {
      if (action === 'copy-selected') { copySelectedToClipboard(); }
      if (action === 'cut-selected') { copySelectedToClipboard(); deleteSelectedNodes(); }
      if (action === 'duplicate-selected') { duplicateSelected(); }
      if (action === 'delete-selected') { deleteSelectedNodes(); }
      if (action === 'select-all') { selectAllNodes(); }
      if (action === 'group-selected') { handleCreateGroup(); }
      setMenu(null);
      return;
    }

    // Handle auto-arrange action
    if (action === 'auto-arrange') {
      onAutoArrange();
      setMenu(null);
      return;
    }

    // Handle group selected
    if (action === 'group-selected') {
      handleCreateGroup();
      setMenu(null);
      return;
    }

    // Handle node-specific actions from context menu
    if (menu.type === ContextMenuType.NODE && menu.data?.nodeId) {
      if (action === 'delete') {
        onNodeAction(menu.data.nodeId, 'delete');
        setMenu(null);
        return;
      }
      if (action === 'duplicate') {
        onNodeAction(menu.data.nodeId, 'duplicate');
        setMenu(null);
        return;
      }
      if (action === 'add-comment') {
        // Comments are now inline on nodes via the badge popover
        setMenu(null);
        return;
      }
      if (action === 'save-as-template') {
        // If multiple nodes already selected, keep that selection; otherwise select just this node
        const alreadyMulti = nodes.filter(n => n.selected && n.type !== 'start').length > 1;
        if (!alreadyMulti) {
          setNodes(nds => nds.map(n => ({ ...n, selected: n.id === menu.data.nodeId })));
        }
        setShowTemplateLibrary(true);
        setMenu(null);
        return;
      }
    }

    const position = menu.data?.position || screenToFlowPosition({ x: menu.x, y: menu.y });
    const stepCount = nodes.filter(n => n.type !== 'start').length + 1;

    let newNode: Node | null = null;

    if (action === 'create-step') {
      newNode = {
        id: crypto.randomUUID(),
        type: 'dynamic',
        position,
        data: {
          title: `Step ${stepCount}`,
          description: '',
          isColorized: false,
          color: '#f59e0b',
          isInput: false,
          inputType: 'text',
          isBranching: false,
          options: [{ id: crypto.randomUUID(), text: 'Continue' }],
          popups: [],
          media: []
        }
      };
    }

    if (newNode) {
      setNodes((nds) => nds.concat(newNode!));
      
      if (menu.type === ContextMenuType.CONNECTION_CREATE && menu.data?.sourceId) {
        setEdges((eds) => addEdge({ 
          source: menu.data.sourceId, 
          sourceHandle: menu.data.sourceHandle, 
          target: newNode!.id, 
          targetHandle: null,
          id: `e${menu.data.sourceId}-${newNode!.id}`,
          type: 'custom',
          style: { strokeWidth: 2, stroke: '#2f80ed' },
        }, eds));
      }
      setHasUnsavedChanges(true);
      logChange('Step', `Added step "${newNode!.data.title || 'New step'}"`);
    }

    setMenu(null);
  }, [menu, nodes, screenToFlowPosition, setNodes, setEdges, onAutoArrange, onNodeAction, copySelectedToClipboard, deleteSelectedNodes, duplicateSelected, selectAllNodes, handleCreateGroup, logChange]);

  const handleSave = () => {
    // Save logic here
    setHasUnsavedChanges(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Ctrl+F to open search
  useEffect(() => {
    const handleSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  // Focus node helper — centers viewport + selects node
  const handleFocusNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    // Center viewport on the node
    const x = node.position.x + 140;
    const y = node.position.y + 100;
    setCenter(x, y, { zoom: 1, duration: 400 });
    // Select the node
    setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })));
  }, [nodes, setCenter, setNodes]);


  // Function to create a new step with proper numbering
  const handleCreateNewStep = useCallback(() => {
    const stepCount = nodes.filter(n => n.type !== 'start').length + 1;
    
    // Find the lowest node (highest y position)
    let lowestY = 0;
    let lowestX = 0;
    if (nodes.length > 0) {
      const lowestNode = nodes.reduce((lowest, node) => {
        return node.position.y > lowest.position.y ? node : lowest;
      }, nodes[0]);
      lowestY = lowestNode.position.y + 300; // Position 300px below lowest node
      lowestX = lowestNode.position.x;
    }
    
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'dynamic',
      position: { x: lowestX, y: lowestY },
      selected: true, // Auto-select the new node
      data: {
        title: `Step ${stepCount}`,
        description: '',
        isColorized: false,
        isInput: false,
        inputType: 'text',
        isBranching: false,
        options: [{ id: crypto.randomUUID(), text: 'Continue' }],
        popups: [],
        media: []
      }
    };

    // Deselect all other nodes
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setHasUnsavedChanges(true);
    logChange('Step', `Added new step "Step ${stepCount}"`);

    // Center on the new node after a brief delay to ensure it's rendered
    // Account for node dimensions (roughly 280x200) to center properly
    setTimeout(() => {
      setCenter(lowestX + 140, lowestY + 100, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter, logChange]);

  // Function to create a new note
  const handleCreateNote = useCallback(() => {
    // Find a good position - offset from center or last note
    const existingNotes = nodes.filter(n => n.type === 'note');
    let noteX = 400;
    let noteY = 200;
    
    if (existingNotes.length > 0) {
      const lastNote = existingNotes[existingNotes.length - 1];
      noteX = lastNote.position.x + 50;
      noteY = lastNote.position.y + 50;
    } else if (nodes.length > 0) {
      // Position to the right of existing content
      const rightmostNode = nodes.reduce((rightmost, node) => {
        return node.position.x > rightmost.position.x ? node : rightmost;
      }, nodes[0]);
      noteX = rightmostNode.position.x + 400;
      noteY = rightmostNode.position.y;
    }
    
    const newNoteId = `note-${Date.now()}`;
    const newNote: Node = {
      id: newNoteId,
      type: 'note',
      position: { x: noteX, y: noteY },
      selected: true,
      data: {
        text: '',
        color: '#fef08a' // Default yellow
      }
    };
    
    // Deselect all other nodes
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNote));
    setHasUnsavedChanges(true);
    logChange('Note', 'Added sticky note');

    // Center on the new note
    setTimeout(() => {
      setCenter(noteX + 120, noteY + 80, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter, logChange]);

  // Function to create logic nodes
  const handleCreateLogicNode = useCallback((logicType: 'platform-switch' | 'procedure-link' | 'object-target') => {
    // Find a good position - below the lowest node
    const lowestNode = nodes.length > 0 
      ? nodes.reduce((lowest, node) => {
          return node.position.y > lowest.position.y ? node : lowest;
        }, nodes[0])
      : null;
    
    const lowestY = lowestNode ? lowestNode.position.y + 250 : 150;
    const lowestX = lowestNode ? lowestNode.position.x : 300;
    
    const newLogicId = `logic-${Date.now()}`;
    const newLogicNode: Node = {
      id: newLogicId,
      type: 'logic',
      position: { x: lowestX, y: lowestY },
      selected: true,
      data: {
        logicType,
        platforms: logicType === 'platform-switch' ? [
          { id: crypto.randomUUID(), platform: 'desktop', label: 'Desktop' },
          { id: crypto.randomUUID(), platform: 'mobile', label: 'Mobile' },
          { id: crypto.randomUUID(), platform: 'hololens', label: 'XR Headsets' }
        ] : undefined,
        linkedProcedureId: undefined,
        linkedProcedureName: undefined,
        targetObjectName: undefined,
        targetObjectDescription: undefined,
      }
    };
    
    // Deselect all other nodes
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newLogicNode));
    setHasUnsavedChanges(true);
    logChange('Logic', `Added ${logicType} logic node`);

    // Center on the new node
    setTimeout(() => {
      setCenter(lowestX + 120, lowestY + 100, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter, logChange]);


  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const isInputFocused = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) ||
             (e.target as HTMLElement)?.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save (always works, even while editing text)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Don't handle any other shortcuts if focused on text input
      if (isInputFocused(e)) return;

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Escape: Deselect all + close context menu
      if (e.key === 'Escape') {
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
        setEdges((eds) => eds.map(edge => ({ ...edge, selected: false })));
        setMenu(null);
        return;
      }

      // Ctrl+G: Group selected nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleCreateGroup();
        return;
      }

      // N: Add new step
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          handleCreateNewStep();
          return;
        }
      }

      // Delete / Backspace: Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected && n.type !== 'start');
        if (selectedNodes.length > 0) {
          const selectedIds = selectedNodes.map(n => n.id);
          setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
          setEdges((eds) => eds.filter((edge) => !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)));
          setHasUnsavedChanges(true);
        }
        const selectedEdges = edges.filter(edge => edge.selected);
        if (selectedEdges.length > 0) {
          const selectedEdgeIds = selectedEdges.map(edge => edge.id);
          setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
          setHasUnsavedChanges(true);
          logChange('Connection', `${selectedEdges.length} connection${selectedEdges.length > 1 ? 's' : ''} removed`);
        }
        return;
      }

      // Arrow keys: Nudge selected nodes by grid increment (20px)
      const arrowMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -20 },
        ArrowDown: { x: 0, y: 20 },
        ArrowLeft: { x: -20, y: 0 },
        ArrowRight: { x: 20, y: 0 },
      };
      if (arrowMap[e.key]) {
        const delta = arrowMap[e.key];
        const selected = nodes.filter(n => n.selected);
        if (selected.length > 0) {
          e.preventDefault();
          setNodes((nds) =>
            nds.map((n) =>
              n.selected
                ? { ...n, position: { x: n.position.x + delta.x, y: n.position.y + delta.y } }
                : n
            )
          );
          setHasUnsavedChanges(true);
        }
      }

      // Shift+1: Fit view
      if (e.shiftKey && e.key === '!') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
        return;
      }

      // ?: Show hotkeys
      if (e.key === '?') {
        e.preventDefault();
        setShowHotkeys(prev => !prev);
        return;
      }

      // C: Toggle compact view
      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setCompactView(prev => !prev);
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges, undo, redo, handleSave, handleCreateNewStep, handleCreateGroup, fitView, logChange]);

  // Debug menu AI credit controls
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.action === 'set-ai-credits') {
        setAiCreditsUsed(detail.used);
        setAiCreditsMax(detail.max);
      }
    };
    window.addEventListener('flow-debug', handler);
    return () => window.removeEventListener('flow-debug', handler);
  }, []);

  const translationCompleteness = useMemo(() => {
    const result: Record<string, number> = {};
    const dynamicNodes = nodes.filter(n => n.type === 'dynamic');
    if (dynamicNodes.length === 0) return result;
    procedureLanguages.forEach(code => {
      if (code === defaultLanguage) { result[code] = 100; return; }
      let filled = 0;
      let total = 0;
      dynamicNodes.forEach(n => {
        const d = n.data as any;
        total += 2; // title + description
        // Translation counts only if it exists AND source hasn't changed since
        const titleFresh = d.titleMulti?.[code] && d.titleMultiBase?.[code] === d.title;
        const descFresh = d.descriptionMulti?.[code] && d.descriptionMultiBase?.[code] === d.description;
        if (titleFresh) filled++;
        if (descFresh) filled++;
        // Count branching options (skip single "Continue" default)
        const opts = d.options || [];
        if (opts.length > 1) {
          opts.forEach((o: any) => {
            total++;
            if (o.textMulti?.[code] && o.textMultiBase?.[code] === o.text) filled++;
          });
        }
      });
      result[code] = total > 0 ? Math.round((filled / total) * 100) : 0;
    });
    return result;
  }, [nodes, procedureLanguages, defaultLanguage]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col relative bg-background">
      {/* Top Bar */}
      <div 
        className="h-auto min-h-[56px] border-b flex items-center flex-wrap px-3 sm:px-4 gap-2 sm:gap-3 shrink-0 relative z-10 py-2"
        style={{ 
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </button>
        
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>
            Flow Editor
          </span>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>/</span>
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {procedureName}
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${canUndo ? 'hover:bg-secondary' : 'opacity-40 cursor-not-allowed'}`}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" style={{ color: canUndo ? 'var(--foreground)' : 'var(--muted)' }} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${canRedo ? 'hover:bg-secondary' : 'opacity-40 cursor-not-allowed'}`}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" style={{ color: canRedo ? 'var(--foreground)' : 'var(--muted)' }} />
        </button>

        <div className="w-px h-6 bg-border" style={{ backgroundColor: 'var(--border)' }} />

        {/* Search */}
        <button
          onClick={() => setShowSearch(true)}
          className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title="Search Nodes (Ctrl+F)"
        >
          <Search className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </button>

        {/* Compact View Toggle */}
        <button
          onClick={() => setCompactView(!compactView)}
          className={`p-2 rounded-lg transition-colors ${compactView ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title={compactView ? 'Expanded View' : 'Compact View — titles only'}
          style={compactView ? { color: 'var(--primary)' } : undefined}
        >
          <List className="w-4 h-4" style={{ color: compactView ? 'var(--primary)' : 'var(--foreground)' }} />
        </button>

        {/* Validation */}
        <button
          onClick={() => setShowValidation(!showValidation)}
          className={`p-2 rounded-lg transition-colors relative ${showValidation ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title="Flow Validation"
        >
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          {validationResult.totalCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-1"
              style={{
                backgroundColor: validationResult.errorCount > 0 ? '#FF1F1F' : validationResult.warningCount > 0 ? '#f59e0b' : '#2F80ED',
              }}
            >
              {validationResult.totalCount}
            </span>
          )}
        </button>

        {/* Version History */}
        <button
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          className={`p-2 rounded-lg transition-colors ${showVersionHistory ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title="Version History"
        >
          <Clock className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </button>

        {/* Template Library */}
        <button
          onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
          className={`p-2 rounded-lg transition-colors ${showTemplateLibrary ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title="Template Library"
        >
          <Layout className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </button>

        {/* Keyboard Shortcuts */}
        <div className="relative">
          <button
            onClick={() => setShowHotkeys(!showHotkeys)}
            className={`p-2 rounded-lg transition-colors ${showHotkeys ? 'bg-secondary' : 'hover:bg-secondary'}`}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>

          {/* Keyboard Shortcuts Popover */}
          {showHotkeys && (
            <>
              <div className="fixed inset-0 z-[99]" onClick={() => setShowHotkeys(false)} />
              <div
                className="absolute z-[100] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
                style={{
                  width: '320px',
                  maxHeight: '420px',
                  top: 'calc(100% + 8px)',
                  right: '0px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(54, 65, 93, 0.14), 0 2px 8px rgba(54, 65, 93, 0.08)',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                      Keyboard Shortcuts
                    </span>
                  </div>
                  <button
                    onClick={() => setShowHotkeys(false)}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    <X size={14} style={{ color: 'var(--muted)' }} />
                  </button>
                </div>

                {/* Shortcuts List */}
                <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '370px' }}>
                  {[
                    { section: 'General', shortcuts: [
                      { keys: 'Ctrl+Z', label: 'Undo' },
                      { keys: 'Ctrl+Y', label: 'Redo' },
                      { keys: 'Ctrl+S', label: 'Save' },
                      { keys: 'Ctrl+F', label: 'Search nodes' },
                      { keys: 'Escape', label: 'Deselect all / close menu' },
                      { keys: '?', label: 'Show keyboard shortcuts' },
                    ]},
                    { section: 'Canvas', shortcuts: [
                      { keys: '⇧1', label: 'Fit view' },
                      { keys: 'N', label: 'Add new step' },
                      { keys: 'C', label: 'Toggle compact view' },
                      { keys: 'Delete', label: 'Delete selected' },
                      { keys: '↑ ↓ ← →', label: 'Nudge selected nodes' },
                    ]},
                    { section: 'Selection', shortcuts: [
                      { keys: 'Shift+Click', label: 'Multi-select nodes' },
                      { keys: 'Drag on canvas', label: 'Selection box' },
                    ]},
                    { section: 'Nodes', shortcuts: [
                      { keys: 'Double-click', label: 'Edit node title / description' },
                      { keys: 'Right-click', label: 'Context menu' },
                    ]},
                  ].map(({ section, shortcuts }) => (
                    <div key={section}>
                      <div
                        className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--muted)', backgroundColor: 'var(--secondary)' }}
                      >
                        {section}
                      </div>
                      {shortcuts.map(({ keys, label }) => (
                        <div
                          key={keys}
                          className="flex items-center justify-between px-4 py-1.5 border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <span className="text-[11px]" style={{ color: 'var(--foreground)' }}>{label}</span>
                          <kbd
                            className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: 'var(--secondary)',
                              color: 'var(--foreground)',
                              border: '1px solid var(--border)',
                              textAlign: 'center',
                            }}
                          >
                            {keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Languages */}
        <button
          onClick={() => setShowLanguagePanel(!showLanguagePanel)}
          className={`p-2 rounded-lg transition-colors relative ${showLanguagePanel ? 'bg-secondary' : 'hover:bg-secondary'}`}
          title="Languages"
        >
          <Globe className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          {procedureLanguages.length > 1 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-[8px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              {procedureLanguages.length}
            </span>
          )}
        </button>

        <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

        <button
          onClick={onAutoArrange}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Auto Arrange"
        >
          <GitCommit className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Auto Arrange</span>
        </button>

        <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

        <div className="flex items-center gap-2 px-2">
          <Users className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          <div className="flex items-center -space-x-2">
            {workspaceUsers.map((user) => (
              <MemberAvatar
                key={user.id}
                name={user.name}
                id={user.id}
                initials={user.initials}
                color={user.color}
                size="lg"
                border
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

        <button
          onClick={() => { setProcedureModalSettings(true); setIsProcedureModalOpen(true); }}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Flow Settings"
        >
          <Settings className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </button>

        <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

        <button
          onClick={handleSave}
          className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
          title="Save"
        >
          <Save className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          {hasUnsavedChanges && (
            <div
              className="absolute right-1 top-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          )}
        </button>

        <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen
            ? <Minimize className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
            : <Maximize className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          }
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 relative">
        {/* Inset shadows - only on canvas area below header */}
        <div className="absolute inset-0 pointer-events-none z-50" style={{
          boxShadow: 'inset 0 10px 20px -10px rgba(0,0,0,0.15), inset 0 -10px 20px -10px rgba(0,0,0,0.15), inset 10px 0 20px -10px rgba(0,0,0,0.15), inset -10px 0 20px -10px rgba(0,0,0,0.15)'
        }} />
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edgesWithCallbacks}
          onNodesChange={handleNodesChangeWithGuides}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          isValidConnection={isValidConnection}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeDragStop={handleNodeDragStop}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onSelectionContextMenu={(event) => {
            event.preventDefault();
            const selCount = nodes.filter(n => n.selected).length;
            if (selCount > 1) {
              setMenu({
                x: event.clientX,
                y: event.clientY,
                type: ContextMenuType.MULTI_SELECT,
                data: { selectedCount: selCount }
              });
            }
          }}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          onMoveStart={() => setMenu(null)}

          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          multiSelectionKeyCode="Shift"
          selectNodesOnDrag={false}
          panOnDrag={[1, 2]}
          style={{
            background: `url(${imgDots})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <EdgeMarkerDefs />
          <Background gap={20} size={1} style={{ backgroundColor: 'transparent' }} />
          <Panel
            position="bottom-left"
            className="flex items-center gap-0 rounded-lg overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--elevation-sm)',
              margin: '20px',
              padding: 0,
            }}
          >
            <button
              onClick={() => setViewport({ ...getViewport(), zoom: Math.min(getViewport().zoom * 1.2, 2) }, { duration: 200 })}
              className="p-2 hover:bg-secondary transition-colors"
              title="Zoom In"
              style={{ borderRight: '1px solid var(--border)' }}
            >
              <ZoomIn className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
            </button>
            <button
              onClick={() => setViewport({ ...getViewport(), zoom: Math.max(getViewport().zoom / 1.2, 0.1) }, { duration: 200 })}
              className="p-2 hover:bg-secondary transition-colors"
              title="Zoom Out"
              style={{ borderRight: '1px solid var(--border)' }}
            >
              <ZoomOut className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
            </button>
            <button
              onClick={() => fitView({ padding: 0.2, duration: 300 })}
              className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-secondary transition-colors"
              title="Fit View (Shift+1)"
            >
              <Maximize className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
            </button>
          </Panel>
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              if (n.type === 'start') return '#10b981';
              if (n.type === 'note') return '#d97706';
              if (n.type === 'logic') return '#6366f1';
              const d = n.data as any;
              if (d.isColorized) return d.color || '#f59e0b';
              return '#2f80ed';
            }}
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              width: 180,
              height: 130,
            }}
          />
        </ReactFlow>


        {/* Search Overlay */}
        {showSearch && (
          <SearchOverlay
            nodes={nodes}
            onFocusNode={handleFocusNode}
            onClose={() => setShowSearch(false)}
            onSearchStateChange={setSearchState}
          />
        )}

        {/* Outline Panel */}
        {/* Validation Panel */}
        {showValidation && (
          <ValidationPanel
            result={validationResult}
            onGoToNode={handleGoToValidationNode}
            onClose={() => setShowValidation(false)}
          />
        )}

        {/* Version History Panel */}
        {showVersionHistory && (
          <VersionHistoryPanel
            isOpen={showVersionHistory}
            onClose={() => { setShowVersionHistory(false); setPreviewingVersionId(null); }}
            versions={versions}
            onSaveVersion={handleSaveVersion}
            onPreviewVersion={handlePreviewVersion}
            onRestoreVersion={handleRestoreVersion}
            previewingVersionId={previewingVersionId}
          />
        )}

        {/* Language Panel */}
        {showLanguagePanel && (
          <LanguagePanel
            isOpen={showLanguagePanel}
            onClose={() => setShowLanguagePanel(false)}
            procedureLanguages={procedureLanguages}
            defaultLanguage={defaultLanguage}
            editingLanguage={editingLanguage}
            languageVisibility={languageVisibility}
            onSetEditingLanguage={setEditingLanguage}
            onSetDefaultLanguage={handleSetDefaultLanguage}
            onToggleVisibility={handleToggleVisibility}
            onDeleteLanguage={handleDeleteLanguage}
            onOpenAddLanguages={() => setShowAddLanguageModal(true)}
            onTranslateWithAI={handleTranslateWithAI}
            aiCreditsUsed={aiCreditsUsed}
            aiCreditsMax={aiCreditsMax}
            translationCompleteness={translationCompleteness}
          />
        )}

        {/* Alignment Toolbar (in flow coordinates, rendered via ReactFlow's viewport) */}
        {selectedNodes.length >= 2 && (
          <AlignmentToolbar
            selectedNodes={selectedNodes}
            onUpdatePositions={handleAlignmentUpdate}
          />
        )}

        {/* Smart Guide Lines SVG overlay */}
        {guides.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none z-40"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {guides.map((guide, i) => (
              guide.orientation === 'vertical' ? (
                <line
                  key={i}
                  x1={guide.position}
                  y1={guide.from}
                  x2={guide.position}
                  y2={guide.to}
                  stroke="#2F80ED"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />
              ) : (
                <line
                  key={i}
                  x1={guide.from}
                  y1={guide.position}
                  x2={guide.to}
                  y2={guide.position}
                  stroke="#2F80ED"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />
              )
            ))}
          </svg>
        )}

        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            type={menu.type}
            onClose={() => setMenu(null)}
            onAction={handleMenuAction}
            nodeData={menu.data}
            selectedCount={menu.data?.selectedCount || selectedNodeCount}
          />
        )}


        {/* Selection Count Badge */}
        {selectedNodeCount > 1 && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              boxShadow: 'var(--elevation-md)',
            }}
          >
            <span className="text-sm font-semibold">{selectedNodeCount} nodes selected</span>
            <span className="text-xs opacity-75">Ctrl+C to copy</span>
          </div>
        )}

        {/* Save Toast */}
        {showSaveToast && (
          <div
            className="absolute top-4 right-4 z-10 px-4 py-2.5 rounded-lg flex items-center gap-2 save-toast pointer-events-none"
            style={{
              backgroundColor: 'var(--accent)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--elevation-sm)',
            }}
          >
            <Check className="w-4 h-4" style={{ color: 'var(--accent-foreground, var(--foreground))' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-foreground, var(--foreground))' }}>
              Changes saved
            </span>
          </div>
        )}

        {/* Floating Action Menu */}
        <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <div className="canvas-fam absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center backdrop-blur-md">
          {/* Primary: New Step */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleCreateNewStep} className="canvas-fam-primary">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>New Step</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
              <div className="canvas-fam-tooltip-title">New Step</div>
              <div className="canvas-fam-tooltip-desc">Add an instruction step to the procedure flow</div>
            </TooltipContent>
          </Tooltip>

          <div className="canvas-fam-sep" />

          {/* Secondary icon buttons */}
          <div className="canvas-fam-group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleCreateNote} className="canvas-fam-icon-btn">
                  <StickyNote className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Note</div>
                <div className="canvas-fam-tooltip-desc">Pin a note to the canvas for team comments or reminders</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleCreateLogicNode('platform-switch')} className="canvas-fam-icon-btn">
                  <GitBranch className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Platform Branch</div>
                <div className="canvas-fam-tooltip-desc">Split the flow based on device — show different steps for HoloLens, tablet, or desktop</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleCreateLogicNode('procedure-link')} className="canvas-fam-icon-btn">
                  <ExternalLink className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Procedure Link</div>
                <div className="canvas-fam-tooltip-desc">Jump to another procedure mid-flow, then return to continue</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleCreateLogicNode('object-target')} className="canvas-fam-icon-btn">
                  <Target className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Object Target</div>
                <div className="canvas-fam-tooltip-desc">Anchor a step to a specific 3D object in the digital twin scene</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleCreateGroup} className="canvas-fam-icon-btn" disabled={nodes.filter(n => n.selected && n.type !== 'start' && n.type !== 'section').length < 2}>
                  <Group className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Group Selected</div>
                <div className="canvas-fam-tooltip-desc">Wrap selected nodes in a labeled group container (select 2+ nodes)</div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setShowTemplateLibrary(true)} className="canvas-fam-icon-btn">
                  <Layout className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className="canvas-fam-tooltip">
                <div className="canvas-fam-tooltip-title">Templates</div>
                <div className="canvas-fam-tooltip-desc">Browse and insert reusable procedure templates and step blocks</div>
              </TooltipContent>
            </Tooltip>
          </div>

        </div>
        </TooltipProvider>
      </div>

      {/* Media Library Modal */}
      {mediaLibraryCallback && (
        <MediaLibraryModal
          isOpen={true}
          onClose={() => setMediaLibraryCallback(null)}
          selectionMode={true}
          onSelectItem={(item) => {
            // Since the modal only supports single selection, we wrap it in an array
            if (mediaLibraryCallback) {
              mediaLibraryCallback([item.id]);
            }
            setMediaLibraryCallback(null);
          }}
        />
      )}

      {/* Procedure Selection Modal */}
      {procedureSelectCallback && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setProcedureSelectCallback(null)}
        >
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: 'var(--card)',
              boxShadow: 'var(--elevation-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                Select Procedure
              </h3>
              <button
                onClick={() => setProcedureSelectCallback(null)}
                className="p-1 rounded canvas-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Select a procedure to link to this logic node.
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {Object.entries(DEFAULT_PROCEDURE_STEPS)
                .filter(([id]) => id !== procedureId)
                .map(([id, data]) => (
                <button
                  key={id}
                  onClick={() => {
                    if (procedureSelectCallback) {
                      procedureSelectCallback(id, data.title);
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded border canvas-select-item"
                  style={{ color: 'var(--foreground)' }}
                >
                  <div className="font-medium">{data.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {data.steps.length} steps
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Procedure Modal */}
      {isProcedureModalOpen && (
        <ProcedureModal
          procedure={{
            id: procedureId,
            name: procedureName,
            description: procedureItem?.description || '',
            connectedDigitalTwinIds: procedureItem?.connectedDigitalTwinIds,
            thumbnail: procedureItem?.thumbnail,
            isPublished: procedureItem?.isPublished ?? false,
            hasUnpublishedChanges: hasUnsavedChanges,
            publishedVersion: procedureItem?.publishedVersion || '1.0',
            publishedDate: procedureItem?.publishedDate || new Date().toLocaleDateString(),
            createdBy: procedureItem?.createdBy || '',
            createdDate: procedureItem?.createdDate || '',
            lastEditedBy: procedureItem?.lastEditedBy || '',
            lastEdited: procedureItem?.lastEdited || '',
          }}
          startOnSettings={procedureModalSettings}
          flowChanges={flowChangeSummary}
          onClose={() => { setIsProcedureModalOpen(false); setProcedureModalSettings(false); }}
          onSave={(updatedProcedure) => {
            setIsProcedureModalOpen(false);
            setProcedureModalSettings(false);
          }}
        />
      )}


      {/* Template Library */}
      {showTemplateLibrary && (
        <TemplateLibrary
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          templates={templates}
          onInsertTemplate={handleInsertTemplate}
          onSaveAsTemplate={handleSaveAsTemplate}
          hasSelectedNodes={nodes.some(n => n.selected && n.type !== 'start')}
        />
      )}

      {/* Add Language Modal */}
      <AddLanguageModal
        isOpen={showAddLanguageModal}
        onClose={() => setShowAddLanguageModal(false)}
        existingLanguages={procedureLanguages}
        onAdd={handleAddLanguages}
      />

      {/* Translation Progress Modal */}
      <TranslationProgressModal
        isOpen={showTranslationProgress}
        targetLanguages={translationTargetLanguages}
        progress={translationProgress}
        onCancel={() => { translationCancelledRef.current = true; setShowTranslationProgress(false); setTranslationTargetLanguages([]); }}
      />

      {/* Translation Options Dialog */}
      <TranslationOptionsDialog
        isOpen={showTranslationOptions}
        onClose={() => { setShowTranslationOptions(false); setTranslationOptionsCallback(null); }}
        onContinue={(opt) => {
          if (translationOptionsCallback) translationOptionsCallback(opt);
          setShowTranslationOptions(false);
          setTranslationOptionsCallback(null);
        }}
      />

    </div>
  );
}

export function ProcedureCanvas(props: ProcedureCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
