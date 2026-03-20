import { useState, useCallback, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useProcedureSteps } from '../../contexts/ProcedureStepsContext';
import { DEFAULT_PROCEDURE_STEPS } from '../../data/mockProcedureSteps';
import type { Step } from '../procedure-editor/ProcedureEditor';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import type { Connection, Edge, Node, OnConnectStartParams } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { 
  ArrowLeft,
  Undo,
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
  Check,
  Search,
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
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { MemberAvatar } from '../MemberAvatar';

interface ProcedureCanvasProps {
  procedureId: string;
  procedureName: string;
  onClose: () => void;
}

const nodeTypes = {
  start: StartNode,
  dynamic: DynamicNode,
  note: NoteNode,
  logic: LogicNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

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

    nodes.push({
      id: nodeId,
      type: 'dynamic',
      position: { x: 400, y: 50 + (index + 1) * 300 },
      data: {
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        isColorized: true,
        color: step.color || '#2F80ED',
        isInput: false,
        inputType: 'text',
        isBranching: step.actions.length > 0,
        options: step.actions.length > 0
          ? step.actions.map((a, i) => ({ id: `opt-${nodeId}-${i}`, text: a.label }))
          : [{ id: `opt-${nodeId}`, text: 'Continue' }],
        popups: step.popups.map(p => ({ id: p.id, title: p.title || '' })),
        checklist: step.validation?.checkpoints.map(cp => ({ id: cp.id, text: cp.label, checked: false })) || [],
        media: step.mediaFiles.map(m => m.id),
      },
    });

    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
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
      validation: d.checklist && d.checklist.length > 0
        ? {
            id: `val-${node.id}`,
            checkpoints: d.checklist.map((c: any) => ({
              id: c.id || crypto.randomUUID(),
              type: 'visual' as const,
              severity: 'warning' as const,
              label: c.text,
              selectedParts: [],
              passState: { description: '', mediaFiles: [] },
              failState: { description: '', mediaFiles: [] },
            })),
          }
        : undefined,
    };
  });
}

// Auto-arrange function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 280;

  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });

  // Calculate dynamic heights based on node content
  const nodeHeights = new Map<string, number>();
  nodes.forEach((node) => {
    let height = 200; // Base height for start/logic nodes
    
    if (node.type === 'dynamic') {
      const data = node.data as any;
      const baseHeight = 150;
      const titleHeight = 30;
      
      // Add height for description if it exists
      const descriptionHeight = data.description ? Math.max(60, Math.min(200, data.description.length / 2)) : 0;
      
      // Add height for options
      const optionsHeight = (data.options?.length || 0) * 20;
      
      // Add height for checklist
      const checklistHeight = (data.checklist?.length || 0) * 20;
      
      // Add height for popups
      const popupsHeight = (data.popups?.length || 0) * 20;
      
      // Add height for media
      const mediaHeight = (data.media?.length || 0) * 20;
      
      height = baseHeight + titleHeight + descriptionHeight + optionsHeight + checklistHeight + popupsHeight + mediaHeight;
    }
    
    nodeHeights.set(node.id, height);
    dagreGraph.setNode(node.id, { width: nodeWidth, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const height = nodeHeights.get(node.id) || 200;
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function FlowEditorInner({ procedureId, procedureName, onClose }: ProcedureCanvasProps) {
  const { currentRole } = useRole();
  const editingEnabled = hasAccess(currentRole, 'projects-edit');
  const { getSteps, setSteps: setContextSteps } = useProcedureSteps();

  // Build initial flow from shared context steps
  const initialFlow = useMemo(() => {
    const contextSteps = getSteps(procedureId);
    return stepsToFlow(contextSteps);
  }, [procedureId]); // only on first load

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mediaLibraryCallback, setMediaLibraryCallback] = useState<((selectedMedia: string[]) => void) | null>(null);
  const [procedureSelectCallback, setProcedureSelectCallback] = useState<((procedureId: string, procedureName: string) => void) | null>(null);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const { screenToFlowPosition, fitView, setCenter } = useReactFlow();

  // Delete hotkey handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Delete or Backspace is pressed and not focused on an input
      if ((event.key === 'Delete' || event.key === 'Backspace') && 
          event.target instanceof HTMLElement && 
          !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault();
        
        // Delete selected nodes
        const selectedNodes = nodes.filter(n => n.selected && n.type !== 'start');
        if (selectedNodes.length > 0) {
          const selectedIds = selectedNodes.map(n => n.id);
          setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
          setEdges((eds) => eds.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
          setHasUnsavedChanges(true);
        }
        
        // Delete selected edges
        const selectedEdges = edges.filter(e => e.selected);
        if (selectedEdges.length > 0) {
          const selectedEdgeIds = selectedEdges.map(e => e.id);
          setEdges((eds) => eds.filter((e) => !selectedEdgeIds.includes(e.id)));
          setHasUnsavedChanges(true);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges]);

  // Helper to update node data
  const onNodeDataChange = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedData = { ...node.data, ...newData };
          // Auto-update isBranching based on options (>1 means actual branching, 1 is the default "Continue")
          if ('options' in updatedData) {
            updatedData.isBranching = updatedData.options.length > 1;
          }
          return { ...node, data: updatedData };
        }
        return node;
      })
    );

    // When options change, clean up orphaned edges (edges pointing to removed option handles)
    if ('options' in newData) {
      const validHandleIds = new Set(newData.options.map((o: any) => o.id));
      setEdges(eds => eds.filter(e => {
        if (e.source !== id) return true;
        // Keep edge if its sourceHandle is valid, or migrate null/default to first option
        if (!e.sourceHandle || e.sourceHandle === 'default') return true;
        return validHandleIds.has(e.sourceHandle);
      }));
    }
    setHasUnsavedChanges(true);
  }, [setNodes]);

  const onNodeAction = useCallback((id: string, action: 'delete' | 'duplicate') => {
    if (action === 'delete') {
      // Prevent deleting start node
      if (nodes.find(n => n.id === id)?.type === 'start') return;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    } else if (action === 'duplicate') {
      const nodeToDuplicate = nodes.find(n => n.id === id);
      if (nodeToDuplicate && nodeToDuplicate.type !== 'start') {
        const newNode = {
          ...nodeToDuplicate,
          id: crypto.randomUUID(),
          position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
          data: { ...nodeToDuplicate.data },
          selected: true
        };
        setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNode));
      }
    }
    setHasUnsavedChanges(true);
  }, [nodes, setNodes, setEdges]);

  // Add connected step handler
  const handleAddConnectedStep = useCallback((nodeId: string, sourceHandle?: string) => {
    let newNodePosition = { x: 0, y: 0 };
    let newNodeId: string = '';
    
    setNodes(currentNodes => {
      const parentNode = currentNodes.find(n => n.id === nodeId);
      if (!parentNode) return currentNodes;

      const stepCount = currentNodes.filter(n => n.type !== 'start').length + 1;
      newNodeId = crypto.randomUUID();
      
      // Center the new node exactly below the parent
      // Assuming node width is ~280px, we keep x position the same for alignment
      newNodePosition = { 
        x: parentNode.position.x,
        y: parentNode.position.y + 300 
      };

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
          checklist: [],
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

      // Deselect all other nodes and add new one
      return currentNodes.map(n => ({ ...n, selected: false })).concat(newNode);
    });
    
    // Center the new node in view - account for node dimensions (roughly 280x200)
    setTimeout(() => {
      setCenter(newNodePosition.x + 140, newNodePosition.y + 100, { zoom: 1, duration: 400 });
    }, 100);
    
    setHasUnsavedChanges(true);
  }, [setNodes, setEdges, setCenter]);

  // Add additional branching option (first option is always the default output)
  const handleAddOption = useCallback((nodeId: string) => {
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
        checklist: [],
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
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setHasUnsavedChanges(true);
  }, [edges, nodes, setNodes, setEdges]);

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

      return {
        ...node,
        data: {
          ...node.data,
          editingEnabled,
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
          connectedHandles
        },
      };
    });
  }, [nodes, edges, onNodeDataChange, onNodeAction, handleAddOption, handleAddConnectedStep, setNodes, editingEnabled]);

  // Delete edge handler
  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setHasUnsavedChanges(true);
  }, [setEdges]);

  // Inject callbacks into edges
  const edgesWithCallbacks = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        onAddNodeBetween: handleAddNodeBetween,
        onDelete: handleDeleteEdge
      }
    }));
  }, [edges, handleAddNodeBetween, handleDeleteEdge]);

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
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_: any, params: OnConnectStartParams) => {
    connectStartRef.current = params;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectStartRef.current) return;
      
      const target = event.target as HTMLElement;
      const isHandle = target.classList.contains('react-flow__handle');
      const isNode = target.closest('.react-flow__node');

      // If released on empty canvas, create a new step automatically
      if (!isHandle && !isNode && connectStartRef.current.nodeId) {
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : (event as MouseEvent);
        const position = screenToFlowPosition({ x: clientX, y: clientY });
        
        // Create new step at drop position
        const stepCount = nodes.filter(n => n.type !== 'start').length + 1;
        const newNodeId = crypto.randomUUID();
        
        const newNode: Node = {
          id: newNodeId,
          type: 'dynamic',
          position: { x: position.x - 140, y: position.y - 100 }, // Center on cursor
          selected: true,
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
            checklist: [],
            media: []
          }
        };
        
        const newEdge: Edge = {
          id: `e-${connectStartRef.current.nodeId}-${connectStartRef.current.handleId || 'default'}-${newNodeId}`,
          source: connectStartRef.current.nodeId,
          sourceHandle: connectStartRef.current.handleId || undefined,
          target: newNodeId,
          type: 'custom',
          style: { strokeWidth: 2, stroke: '#2f80ed' },
          animated: false
        };
        
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
        setEdges((eds) => addEdge(newEdge, eds));
        setHasUnsavedChanges(true);
        
        connectStartRef.current = null;
      }
    },
    [screenToFlowPosition, nodes, setNodes, setEdges]
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
      setMenu({
        x: event.clientX,
        y: event.clientY,
        type: ContextMenuType.NODE,
        data: { ...node.data, nodeId: node.id, nodeType: node.type }
      });
    },
    []
  );

  const onPaneClick = useCallback(() => setMenu(null), []);
  const onNodeClick = useCallback(() => setMenu(null), []);

  const handleMenuAction = useCallback((action: string) => {
    if (!menu) return;

    // Handle auto-arrange action
    if (action === 'auto-arrange') {
      onAutoArrange();
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
          checklist: [],
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
    }

    setMenu(null);
  }, [menu, nodes, screenToFlowPosition, setNodes, setEdges, onAutoArrange, onNodeAction]);

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
        checklist: [],
        media: []
      }
    };
    
    // Deselect all other nodes
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setHasUnsavedChanges(true);
    
    // Center on the new node after a brief delay to ensure it's rendered
    // Account for node dimensions (roughly 280x200) to center properly
    setTimeout(() => {
      setCenter(lowestX + 140, lowestY + 100, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter]);

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
    
    // Center on the new note
    setTimeout(() => {
      setCenter(noteX + 120, noteY + 80, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter]);

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
    
    // Center on the new node
    setTimeout(() => {
      setCenter(lowestX + 120, lowestY + 100, { zoom: 1, duration: 400 });
    }, 100);
  }, [nodes, setNodes, setCenter]);

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
          className="p-2 rounded-lg transition-colors opacity-40 cursor-not-allowed"
          title="Undo (coming soon)"
          disabled
        >
          <Undo className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>

        <div className="w-px h-6 bg-border" style={{ backgroundColor: 'var(--border)' }} />

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
          onClick={() => setIsProcedureModalOpen(true)}
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          style={{
            background: `url(${imgDots})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <EdgeMarkerDefs />
          <Background gap={20} size={1} style={{ backgroundColor: 'transparent' }} />
          <Controls
            className="!bottom-[20px] !left-[20px]"
            showInteractive={false}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--elevation-sm)',
            }}
          />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'start') return '#11e874';
              const d = n.data as any;
              if (d.isColorized) return d.color || '#f59e0b';
              if (d.isBranching) return '#2f80ed';
              return '#7f7f7f';
            }} 
            className="rounded-lg overflow-hidden" 
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          />
        </ReactFlow>

        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            type={menu.type}
            onClose={() => setMenu(null)}
            onAction={handleMenuAction}
            nodeData={menu.data}
          />
        )}

        {/* HUD Info */}
        <div 
          className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-none backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(var(--card-rgb, 255, 255, 255), 0.9)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-sm)',
          }}
        >
          <div className="font-bold" style={{ color: 'var(--foreground)' }}>Flow Editor</div>
          <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Use + buttons to connect steps. Create notes for collaboration.
          </div>
        </div>

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
            description: '',
            tags: [],
            category: '',
            estimatedTime: 0,
            connections: [],
            isPublished: false,
            hasUnpublishedChanges: hasUnsavedChanges,
            publishedVersion: '1.0',
            publishedDate: new Date().toLocaleDateString()
          }}
          onClose={() => setIsProcedureModalOpen(false)}
          onSave={(updatedProcedure) => {
            // Update procedure details if needed
            setIsProcedureModalOpen(false);
          }}
        />
      )}
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
