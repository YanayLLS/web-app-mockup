import { useState, useCallback, useRef } from 'react';
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
  const [arrowHovered, setArrowHovered] = useState(false);
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
  const active = selected || isHovered;
  const animated = data?.animated !== false; // default on
  const edgeLabel = data?.label;


  // Compute path length for dash animation
  const pathLength = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  ) * 1.5; // approximate bezier length

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
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

      {/* Animated flow dots — CSS-only dash animation along the edge path */}
      {animated && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="4 8"
          strokeLinecap="round"
          opacity={active ? 0.5 : 0.2}
          style={{
            animation: 'edgeFlowAnimation 1.5s linear infinite',
          }}
        />
      )}

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

      {/* Edge label — branch name shown on the edge path */}
      {edgeLabel && !showButtons && (
        <EdgeLabelRenderer>
          <div
            className="edge-branch-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(47, 128, 237, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(47, 128, 237, 0.15)',
                letterSpacing: '0.02em',
              }}
            >
              {edgeLabel}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Interactive target (arrow-head) grab zone */}
      <circle
        cx={targetX}
        cy={targetY}
        r={arrowHovered ? 10 : 7}
        fill={arrowHovered ? 'rgba(47, 128, 237, 0.2)' : 'transparent'}
        stroke={arrowHovered ? '#2F80ED' : 'transparent'}
        strokeWidth={arrowHovered ? 2 : 0}
        style={{
          cursor: arrowHovered ? 'grab' : 'default',
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          filter: arrowHovered ? 'drop-shadow(0 0 8px rgba(47,128,237,0.5))' : 'none',
          pointerEvents: 'visiblePainted',
        }}
        onMouseEnter={() => { setArrowHovered(true); setIsHovered(true); }}
        onMouseLeave={() => { setArrowHovered(false); setIsHovered(false); }}
      />
      {/* Pulsing ring on arrow hover */}
      {arrowHovered && (
        <circle
          cx={targetX}
          cy={targetY}
          r={14}
          fill="none"
          stroke="#2F80ED"
          strokeWidth={1.5}
          opacity={0.4}
          style={{ animation: 'edgeTargetRipple 1s ease-out infinite' }}
        />
      )}

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
            <div className="relative group/edgedel">
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
              >
                <Trash2 size={14} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/edgedel:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                Delete connection
              </div>
            </div>

            {/* Add Step Button */}
            <div className="relative group/edgeadd">
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
              >
                <Plus size={16} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/edgeadd:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                Insert step here
              </div>
            </div>
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
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--primary)" fillOpacity="0.45" />
        </marker>
        {/* Active (hover/selected) arrow — bigger, full opacity, with glow */}
        <marker
          id="edge-arrow-active"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--primary)" />
        </marker>
      </defs>

      {/* CSS animations for edge flow */}
      <style>{`
        @keyframes edgeFlowAnimation {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes edgePulseAnimation {
          0% { opacity: 0; stroke-width: 2; }
          50% { opacity: 0.8; stroke-width: 6; }
          100% { opacity: 0; stroke-width: 2; }
        }
        @keyframes edgeTargetRipple {
          0% { r: 8; opacity: 0.5; }
          100% { r: 20; opacity: 0; }
        }
      `}</style>
    </svg>
  );
}
