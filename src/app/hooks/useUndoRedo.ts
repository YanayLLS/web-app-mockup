import { useCallback, useRef } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge, NodeChange, EdgeChange } from 'reactflow';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

/**
 * Wraps React Flow's useNodesState/useEdgesState with snapshot-based undo/redo.
 *
 * Every call to setNodes/setEdges automatically records a snapshot of the
 * previous state. Undo/redo swap between snapshots.
 *
 * Node drags are handled specially: call `takeSnapshot()` on dragStart,
 * and the position changes during drag don't record additional snapshots.
 */
export function useUndoRedo(initialNodes: Node[], initialEdges: Edge[]) {
  const [nodes, setNodesInternal, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdgesInternal, onEdgesChangeInternal] = useEdgesState(initialEdges);

  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);

  // We need refs to current state for snapshot captures inside callbacks
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Track whether we're in the middle of an undo/redo operation
  const isUndoRedoRef = useRef(false);
  // Track whether we're in the middle of a drag (suppress auto-snapshots)
  const isDraggingRef = useRef(false);

  const pushSnapshot = useCallback(() => {
    pastRef.current = [
      ...pastRef.current.slice(-(MAX_HISTORY - 1)),
      { nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })), edges: [...edgesRef.current] },
    ];
    futureRef.current = [];
  }, []);

  const takeSnapshot = useCallback(() => {
    pushSnapshot();
  }, [pushSnapshot]);

  // Wrapped setNodes: records snapshot before mutation
  const setNodes: typeof setNodesInternal = useCallback((update) => {
    if (!isUndoRedoRef.current && !isDraggingRef.current) {
      pushSnapshot();
    }
    setNodesInternal(update);
  }, [setNodesInternal, pushSnapshot]);

  // Wrapped setEdges: records snapshot before mutation
  const setEdges: typeof setEdgesInternal = useCallback((update) => {
    if (!isUndoRedoRef.current && !isDraggingRef.current) {
      pushSnapshot();
    }
    setEdgesInternal(update);
  }, [setEdgesInternal, pushSnapshot]);

  // React Flow change handlers — position changes during drag should not snapshot
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Detect drag start
    const hasDragStart = changes.some(
      (c) => c.type === 'position' && c.dragging === true
    );
    const hasDragEnd = changes.some(
      (c) => c.type === 'position' && c.dragging === false
    );

    if (hasDragStart && !isDraggingRef.current) {
      isDraggingRef.current = true;
      // Snapshot before drag starts
      pushSnapshot();
    }

    if (hasDragEnd) {
      isDraggingRef.current = false;
    }

    onNodesChangeInternal(changes);
  }, [onNodesChangeInternal, pushSnapshot]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
  }, [onEdgesChangeInternal]);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    pastRef.current = past.slice(0, -1);

    futureRef.current = [
      ...futureRef.current,
      { nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })), edges: [...edgesRef.current] },
    ];

    isUndoRedoRef.current = true;
    setNodesInternal(previous.nodes);
    setEdgesInternal(previous.edges);
    isUndoRedoRef.current = false;
  }, [setNodesInternal, setEdgesInternal]);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;

    const next = future[future.length - 1];
    futureRef.current = future.slice(0, -1);

    pastRef.current = [
      ...pastRef.current,
      { nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })), edges: [...edgesRef.current] },
    ];

    isUndoRedoRef.current = true;
    setNodesInternal(next.nodes);
    setEdgesInternal(next.edges);
    isUndoRedoRef.current = false;
  }, [setNodesInternal, setEdgesInternal]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    takeSnapshot,
  };
}
