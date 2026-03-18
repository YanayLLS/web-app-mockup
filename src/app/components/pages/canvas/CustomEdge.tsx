import { useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
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
  markerEnd,
  data,
  selected,
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

  const handleAddNodeBetween = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onAddNodeBetween) {
      data.onAddNodeBetween(id);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        id={`${id}-hover-area`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible edge with glow on hover or selection */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (isHovered ? 3 : 2),
          stroke: selected ? 'var(--primary)' : (style.stroke || '#2f80ed'),
          filter: (selected || isHovered) ? 'drop-shadow(0 0 6px var(--primary))' : 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Buttons in center - show on hover or selected */}
      {(isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
                            display: 'flex',
              gap: '8px',
              alignItems: 'center',
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
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-lg nodrag"
              style={{
                backgroundColor: deleteHovered ? 'var(--destructive)' : 'var(--card)',
                borderColor: deleteHovered ? 'var(--destructive)' : 'var(--border)',
                color: deleteHovered ? 'white' : 'var(--destructive)',
                transform: deletePressed ? 'scale(0.9)' : (deleteHovered ? 'scale(1.1)' : 'scale(1)'),
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setDeleteHovered(true)}
              title="Delete connection"
            >
              <Trash2 size={16} />
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
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-lg nodrag"
              style={{
                backgroundColor: addHovered ? 'var(--primary)' : 'var(--card)',
                borderColor: addHovered ? 'var(--primary)' : 'var(--border)',
                color: addHovered ? 'white' : 'var(--muted)',
                transform: addPressed ? 'scale(0.9)' : (addHovered ? 'scale(1.1)' : 'scale(1)'),
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setAddHovered(true)}
              title="Add step between"
            >
              <Plus size={18} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
