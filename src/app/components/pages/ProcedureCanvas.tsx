import { useState, useCallback, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useProcedureSteps } from '../../contexts/ProcedureStepsContext';
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
} from 'lucide-react';
import imgDots from "figma:asset/024a1ea7ee32f89f8dbc4aa4a011b69bd6e9bad7.png";
import { DynamicNode } from './canvas/DynamicNode';
import { StartNode } from './canvas/StartNode';
import { NoteNode } from './canvas/NoteNode';
import { LogicNode } from './canvas/LogicNode';
import { CustomEdge } from './canvas/CustomEdge';
import { ContextMenu, ContextMenuType } from './canvas/ContextMenu';
import { MediaLibraryModal } from '../modals/MediaLibraryModal';
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
  const [mediaLibraryCallback, setMediaLibraryCallback] = useState<((selectedMedia: string[]) => void) | null>(null);
  const [procedureSelectCallback, setProcedureSelectCallback] = useState<((procedureId: string, procedureName: string) => void) | null>(null);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);

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

      const newEdge: Edge = {
        id: `e-${nodeId}-${sourceHandle || 'default'}-${newNodeId}`,
        source: nodeId,
        sourceHandle: sourceHandle || undefined,
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
      return currentNodes.map(n => {
        if (n.id === nodeId) {
          const existingOptions = (n.data as any)?.options || [{ id: crypto.randomUUID(), text: 'Continue' }];
          const newOption = { id: crypto.randomUUID(), text: `Option ${existingOptions.length}` };

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
  }, [setNodes]);

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
        options: [{ id: crypto.randomUUID(), text: 'Continue' }],
        popups: [],
        checklist: [],
        media: []
      }
    };
    
    // Create two new edges: source -> newNode and newNode -> target
    const edge1: Edge = {
      id: `e-${edge.source}-${edge.sourceHandle || 'default'}-${newNodeId}`,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: newNodeId,
      type: 'custom',
      style: { strokeWidth: 2, stroke: '#2f80ed' },
      animated: false
    };
    
    const edge2: Edge = {
      id: `e-${newNodeId}-default-${edge.target}`,
      source: newNodeId,
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
      edges.forEach(edge => {
        if (edge.source === node.id) {
          connectedHandles.add(edge.sourceHandle || 'default');
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

  // Validate connections: prevent self-loops; replacement handled by onConnect
  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;
      return true;
    },
    []
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
  };

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
    <div className="w-full h-full flex flex-col relative bg-background">
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
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>
            Project 1 /
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
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

        {/* Floating Action Menu */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-2 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(var(--card-rgb, 255, 255, 255), 0.95)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-lg)',
          }}
        >
          <button 
            onClick={handleCreateNewStep}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title="Create New Step"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Step</span>
          </button>
          
          <button 
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            title="Add Note"
          >
            <StickyNote className="w-4 h-4" />
            <span className="text-sm font-medium">Note</span>
          </button>

          <div className="w-px h-6" style={{ backgroundColor: 'var(--border)' }} />

          <button 
            onClick={() => handleCreateLogicNode('platform-switch')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            title="Platform Switch Logic"
          >
            <GitBranch className="w-4 h-4" />
            <span className="text-sm font-medium">Platform</span>
          </button>

          <button 
            onClick={() => handleCreateLogicNode('procedure-link')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            title="Link to Flow"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Procedure</span>
          </button>

          <button 
            onClick={() => handleCreateLogicNode('object-target')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }}
            title="Object Target Logic"
          >
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Target</span>
          </button>
        </div>
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
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Select a procedure to link to this logic node.
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* Mock procedure list - in real app, this would come from your data */}
              {[
                { id: 'proc-1', name: 'Machine Maintenance' },
                { id: 'proc-2', name: 'Safety Inspection' },
                { id: 'proc-3', name: 'Equipment Setup' },
                { id: 'proc-4', name: 'Quality Check' },
                { id: 'proc-5', name: 'Calibration Process' },
              ].map((procedure) => (
                <button
                  key={procedure.id}
                  onClick={() => {
                    if (procedureSelectCallback) {
                      procedureSelectCallback(procedure.id, procedure.name);
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded border transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--secondary)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="font-medium">{procedure.name}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    ID: {procedure.id}
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
