import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  SkipForward,
} from 'lucide-react';

interface PresentationModeProps {
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  onExit: () => void;
  onFocusNode: (nodeId: string) => void;
  onSetNodeDim: (dimmedNodeIds: string[], activeNodeId: string) => void;
}

interface PathStep {
  nodeId: string;
  edgeId?: string; // edge that led to this node
}

export function PresentationMode({
  nodes,
  edges,
  isActive,
  onExit,
  onFocusNode,
  onSetNodeDim,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [path, setPath] = useState<PathStep[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ label: string; nodeId: string; edgeId: string }[] | null>(null);

  // Build the initial linear path from start node following edges
  const buildPath = useCallback(() => {
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) return [];

    const steps: PathStep[] = [{ nodeId: startNode.id }];
    const visited = new Set<string>([startNode.id]);
    let currentId = startNode.id;

    while (true) {
      // Find outgoing edges from current node
      const outgoing = edges.filter(e => e.source === currentId);
      if (outgoing.length === 0) break;

      if (outgoing.length === 1) {
        const nextId = outgoing[0].target;
        if (visited.has(nextId)) break;
        visited.add(nextId);
        steps.push({ nodeId: nextId, edgeId: outgoing[0].id });
        currentId = nextId;
      } else {
        // Multiple outputs — follow the first one for the linear path count
        // but we'll handle branches dynamically during navigation
        const nextId = outgoing[0].target;
        if (visited.has(nextId)) break;
        visited.add(nextId);
        steps.push({ nodeId: nextId, edgeId: outgoing[0].id });
        currentId = nextId;
      }
    }

    return steps;
  }, [nodes, edges]);

  // Count total reachable nodes for the step counter
  const totalSteps = useMemo(() => {
    const visited = new Set<string>();
    const queue = [nodes.find(n => n.type === 'start')?.id].filter(Boolean) as string[];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      edges.filter(e => e.source === id).forEach(e => queue.push(e.target));
    }
    return visited.size;
  }, [nodes, edges]);

  // Initialize path when entering presentation mode
  useEffect(() => {
    if (isActive) {
      const initialPath = buildPath();
      setPath(initialPath);
      setCurrentIndex(0);
      setBranchOptions(null);
      if (initialPath.length > 0) {
        onFocusNode(initialPath[0].nodeId);
        onSetNodeDim(
          nodes.map(n => n.id).filter(id => id !== initialPath[0].nodeId),
          initialPath[0].nodeId
        );
      }
    }
  }, [isActive]);

  // Navigate to a step
  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= path.length) return;
    setCurrentIndex(index);
    setBranchOptions(null);

    const step = path[index];
    onFocusNode(step.nodeId);
    onSetNodeDim(
      nodes.map(n => n.id).filter(id => id !== step.nodeId),
      step.nodeId
    );

    // Check if this node has branches
    const outgoing = edges.filter(e => e.source === step.nodeId);
    if (outgoing.length > 1) {
      // Get the label for each branch
      const currentNode = nodes.find(n => n.id === step.nodeId);
      const options = (currentNode?.data as any)?.options || [];

      const branches = outgoing.map(e => {
        const opt = options.find((o: any) => o.id === e.sourceHandle);
        return {
          label: opt?.text || 'Continue',
          nodeId: e.target,
          edgeId: e.id,
        };
      });
      setBranchOptions(branches);
    }
  }, [path, nodes, edges, onFocusNode, onSetNodeDim]);

  // Handle branch selection
  const selectBranch = useCallback((branch: { label: string; nodeId: string; edgeId: string }) => {
    // Append this branch choice to the path and navigate
    const newPath = [...path.slice(0, currentIndex + 1), { nodeId: branch.nodeId, edgeId: branch.edgeId }];

    // Continue building path from the branch
    const visited = new Set(newPath.map(s => s.nodeId));
    let currentId = branch.nodeId;

    while (true) {
      const outgoing = edges.filter(e => e.source === currentId);
      if (outgoing.length === 0) break;
      const nextId = outgoing[0].target;
      if (visited.has(nextId)) break;
      visited.add(nextId);
      newPath.push({ nodeId: nextId, edgeId: outgoing[0].id });
      currentId = nextId;
    }

    setPath(newPath);
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setBranchOptions(null);

    onFocusNode(branch.nodeId);
    onSetNodeDim(
      nodes.map(n => n.id).filter(id => id !== branch.nodeId),
      branch.nodeId
    );

    // Check for branches on the new node
    const outgoing = edges.filter(e => e.source === branch.nodeId);
    if (outgoing.length > 1) {
      const branchNode = nodes.find(n => n.id === branch.nodeId);
      const options = (branchNode?.data as any)?.options || [];
      setBranchOptions(outgoing.map(e => {
        const opt = options.find((o: any) => o.id === e.sourceHandle);
        return { label: opt?.text || 'Continue', nodeId: e.target, edgeId: e.id };
      }));
    }
  }, [path, currentIndex, nodes, edges, onFocusNode, onSetNodeDim]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (!branchOptions && currentIndex < path.length - 1) {
          goToStep(currentIndex + 1);
        }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          goToStep(currentIndex - 1);
        }
      }
      if (e.key === 'F5') {
        e.preventDefault();
        onExit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentIndex, path, branchOptions, goToStep, onExit]);

  if (!isActive) return null;

  const currentStep = path[currentIndex];
  const currentNode = currentStep ? nodes.find(n => n.id === currentStep.nodeId) : null;
  const currentTitle = currentNode
    ? ((currentNode.data as any)?.title || (currentNode.data as any)?.label || 'Start')
    : '';

  return (
    <>
      {/* Semi-transparent overlay to indicate read-only mode */}
      <div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.08) 100%)',
        }}
      />

      {/* Top bar: Presentation Mode indicator */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-lg backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(47, 128, 237, 0.95)',
          boxShadow: '0 4px 20px rgba(47, 128, 237, 0.3)',
        }}
      >
        <Play size={14} className="text-white" fill="white" />
        <span className="text-white text-sm font-semibold">Presentation Mode</span>
        <div className="w-px h-4 bg-white/30" />
        <span className="text-white/80 text-xs">{currentTitle}</span>
      </div>

      {/* Bottom controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 pointer-events-auto"
      >
        <div
          className="flex items-center gap-1 rounded-xl px-2 py-1.5 backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
        >
          {/* Previous button */}
          <button
            onClick={() => goToStep(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary"
            style={{ color: 'var(--foreground)' }}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Step counter */}
          <div
            className="px-4 py-1.5 rounded-lg text-xs font-bold tabular-nums"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)',
            }}
          >
            Step {currentIndex + 1} of {path.length}
          </div>

          {/* Next button or Branch options */}
          {branchOptions ? (
            <div className="flex items-center gap-1">
              {branchOptions.map((branch, idx) => (
                <button
                  key={idx}
                  onClick={() => selectBranch(branch)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  }}
                  title={branch.label}
                >
                  <SkipForward size={12} />
                  <span className="max-w-[80px] truncate">{branch.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => goToStep(currentIndex + 1)}
              disabled={currentIndex >= path.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentIndex >= path.length - 1 ? 'var(--secondary)' : 'var(--primary)',
                color: currentIndex >= path.length - 1 ? 'var(--muted)' : 'white',
              }}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          )}

          <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border)' }} />

          {/* Exit button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-50"
            style={{ color: 'var(--destructive)' }}
            title="Exit Presentation (Esc)"
          >
            <X size={16} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </>
  );
}
