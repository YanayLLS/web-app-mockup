import { useState, useCallback, useRef } from 'react';
import type { Node, NodeChange } from 'reactflow';

interface PositionChange {
  type: 'position';
  id: string;
  dragging?: boolean;
  position?: { x: number; y: number };
}

export interface GuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number; // x for vertical, y for horizontal
  from: number;     // start coordinate on the other axis
  to: number;       // end coordinate on the other axis
}

const SNAP_THRESHOLD = 8;
const NEIGHBOR_SNAP_GAP = 60; // ideal spacing between nodes
const NODE_WIDTH = 280;
const NODE_HEIGHT = 200; // approximate

export function useSmartGuides(nodes: Node[]) {
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const isDraggingRef = useRef(false);

  const handleNodesChange = useCallback(
    (changes: NodeChange[], originalOnChange: (changes: NodeChange[]) => void) => {
      // Check if any node is being dragged
      const positionChanges = changes.filter(
        (c): c is PositionChange => c.type === 'position' && (c as any).dragging === true
      );

      if (positionChanges.length === 0) {
        // No active drag — clear guides if we were dragging before
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          setGuides([]);
        }
        originalOnChange(changes);
        return;
      }

      isDraggingRef.current = true;

      // Process each dragging node
      const newGuides: GuideLine[] = [];
      const modifiedChanges = [...changes];

      for (const change of positionChanges) {
        if (!change.position) continue;

        const draggedNode = nodes.find(n => n.id === change.id);
        if (!draggedNode) continue;

        const dragX = change.position.x;
        const dragY = change.position.y;
        const dragCenterX = dragX + NODE_WIDTH / 2;
        const dragCenterY = dragY + NODE_HEIGHT / 2;
        const dragRight = dragX + NODE_WIDTH;
        const dragBottom = dragY + NODE_HEIGHT;

        let snapX: number | null = null;
        let snapY: number | null = null;

        // Compare with all other nodes
        for (const otherNode of nodes) {
          if (otherNode.id === change.id) continue;
          if (otherNode.type === 'note') continue; // skip notes

          const oX = otherNode.position.x;
          const oY = otherNode.position.y;
          const oCenterX = oX + NODE_WIDTH / 2;
          const oCenterY = oY + NODE_HEIGHT / 2;
          const oRight = oX + NODE_WIDTH;
          const oBottom = oY + NODE_HEIGHT;

          // --- Vertical guides (x-axis alignment) ---
          // Center-to-center X
          if (Math.abs(dragCenterX - oCenterX) < SNAP_THRESHOLD) {
            snapX = oCenterX - NODE_WIDTH / 2;
            newGuides.push({
              orientation: 'vertical',
              position: oCenterX,
              from: Math.min(dragY, oY) - 20,
              to: Math.max(dragBottom, oBottom) + 20,
            });
          }
          // Left-to-left
          else if (Math.abs(dragX - oX) < SNAP_THRESHOLD) {
            snapX = oX;
            newGuides.push({
              orientation: 'vertical',
              position: oX,
              from: Math.min(dragY, oY) - 20,
              to: Math.max(dragBottom, oBottom) + 20,
            });
          }
          // Right-to-right
          else if (Math.abs(dragRight - oRight) < SNAP_THRESHOLD) {
            snapX = oRight - NODE_WIDTH;
            newGuides.push({
              orientation: 'vertical',
              position: oRight,
              from: Math.min(dragY, oY) - 20,
              to: Math.max(dragBottom, oBottom) + 20,
            });
          }

          // --- Horizontal guides (y-axis alignment) ---
          // Center-to-center Y
          if (Math.abs(dragCenterY - oCenterY) < SNAP_THRESHOLD) {
            snapY = oCenterY - NODE_HEIGHT / 2;
            newGuides.push({
              orientation: 'horizontal',
              position: oCenterY,
              from: Math.min(dragX, oX) - 20,
              to: Math.max(dragRight, oRight) + 20,
            });
          }
          // Top-to-top
          else if (Math.abs(dragY - oY) < SNAP_THRESHOLD) {
            snapY = oY;
            newGuides.push({
              orientation: 'horizontal',
              position: oY,
              from: Math.min(dragX, oX) - 20,
              to: Math.max(dragRight, oRight) + 20,
            });
          }
          // Bottom-to-bottom
          else if (Math.abs(dragBottom - oBottom) < SNAP_THRESHOLD) {
            snapY = oBottom - NODE_HEIGHT;
            newGuides.push({
              orientation: 'horizontal',
              position: oBottom,
              from: Math.min(dragX, oX) - 20,
              to: Math.max(dragRight, oRight) + 20,
            });
          }

          // --- Snap-to-neighbor spacing ---
          // Below the other node
          const gapBelow = dragY - oBottom;
          if (Math.abs(gapBelow - NEIGHBOR_SNAP_GAP) < SNAP_THRESHOLD && Math.abs(dragCenterX - oCenterX) < NODE_WIDTH) {
            snapY = oBottom + NEIGHBOR_SNAP_GAP;
          }
          // Above the other node
          const gapAbove = oY - dragBottom;
          if (Math.abs(gapAbove - NEIGHBOR_SNAP_GAP) < SNAP_THRESHOLD && Math.abs(dragCenterX - oCenterX) < NODE_WIDTH) {
            snapY = oY - NODE_HEIGHT - NEIGHBOR_SNAP_GAP;
          }
          // Right of the other node
          const gapRight = dragX - oRight;
          if (Math.abs(gapRight - NEIGHBOR_SNAP_GAP) < SNAP_THRESHOLD && Math.abs(dragCenterY - oCenterY) < NODE_HEIGHT) {
            snapX = oRight + NEIGHBOR_SNAP_GAP;
          }
          // Left of the other node
          const gapLeft = oX - dragRight;
          if (Math.abs(gapLeft - NEIGHBOR_SNAP_GAP) < SNAP_THRESHOLD && Math.abs(dragCenterY - oCenterY) < NODE_HEIGHT) {
            snapX = oX - NODE_WIDTH - NEIGHBOR_SNAP_GAP;
          }
        }

        // Apply snap if found
        if (snapX !== null || snapY !== null) {
          const idx = modifiedChanges.indexOf(change);
          if (idx !== -1) {
            modifiedChanges[idx] = {
              ...change,
              position: {
                x: snapX !== null ? snapX : dragX,
                y: snapY !== null ? snapY : dragY,
              },
            };
          }
        }
      }

      setGuides(newGuides);
      originalOnChange(modifiedChanges);
    },
    [nodes]
  );

  const clearGuides = useCallback(() => {
    setGuides([]);
    isDraggingRef.current = false;
  }, []);

  return { guides, handleNodesChange, clearGuides };
}
