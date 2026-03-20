import { useState, useCallback } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, MarkerType } from 'reactflow';
import { Plus, Trash2 } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  data,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [deletePressed, setDeletePressed] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  const [addPressed, setAddPressed] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddNodeBetween = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onAddNodeBetween) {
      data.onAddNodeBetween(id);
    }
  }, [data, id]);

  const handleDelete = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  }, [data, id]);

  const showButtons = isHovered || selected;

  // Compute arrow angle at the target point for a small directional indicator
  const active = selected || isHovered;

  return (
    <>
      {/* Invisible wider path for easier hover detection — extends to cover button area too */}
      <path
        id={`${id}-hover-area`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={28}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible edge with glow on hover or selection */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#edge-arrow${active ? '-active' : ''})`}
        style={{
          ...style,
          strokeWidth: active ? 2.5 : 2,
          stroke: 'var(--primary)',
          filter: active ? 'drop-shadow(0 0 4px rgba(47,128,237,0.4))' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Buttons in center - show on hover or selected */}
      {showButtons && (
        <EdgeLabelRenderer>
          <div
            className="edge-label-buttons"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              onMouseDown={() => setDeletePressed(true)}
              onMouseUp={() => setDeletePressed(false)}
              onMouseLeave={() => {
                setDeleteHovered(false);
                setDeletePressed(false);
              }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md nodrag"
              style={{
                backgroundColor: deleteHovered ? 'var(--destructive)' : 'var(--card)',
                borderColor: deleteHovered ? 'var(--destructive)' : 'rgba(0,0,0,0.1)',
                color: deleteHovered ? 'white' : 'var(--destructive)',
                transform: deletePressed ? 'scale(0.9)' : (deleteHovered ? 'scale(1.1)' : 'scale(1)'),
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setDeleteHovered(true)}
              title="Delete connection"
            >
              <Trash2 size={14} />
            </button>

            {/* Add Step Button */}
            <button
              onClick={handleAddNodeBetween}
              onMouseDown={() => setAddPressed(true)}
              onMouseUp={() => setAddPressed(false)}
              onMouseLeave={() => {
                setAddHovered(false);
                setAddPressed(false);
              }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md nodrag"
              style={{
                backgroundColor: addHovered ? 'var(--primary)' : 'var(--card)',
                borderColor: addHovered ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                color: addHovered ? 'white' : '#B0B7C8',
                transform: addPressed ? 'scale(0.9)' : (addHovered ? 'scale(1.1)' : 'scale(1)'),
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setAddHovered(true)}
              title="Add step between"
            >
              <Plus size={16} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

/**
 * SVG marker definitions for edge arrows.
 * Render this once inside the ReactFlow wrapper.
 */
export function EdgeMarkerDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Default arrow — matches edge color */}
        <marker
          id="edge-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" fillOpacity="0.5" />
        </marker>
        {/* Active (hover/selected) arrow */}
        <marker
          id="edge-arrow-active"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="9"
          markerHeight="9"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
        </marker>
      </defs>
    </svg>
  );
}
