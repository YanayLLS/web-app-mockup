import { X } from 'lucide-react';
import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FrontlineWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minWidth?: number;
  minHeight?: number;
  dark?: boolean;
}

export function FrontlineWindow({
  isOpen,
  onClose,
  title,
  icon,
  children,
  defaultPosition,
  defaultSize = { width: 340, height: 480 },
  minWidth = 260,
  minHeight = 200,
  dark = false,
}: FrontlineWindowProps) {
  const [pos, setPos] = useState(defaultPosition ?? { x: 0, y: 0 });
  const [size, setSize] = useState(defaultSize);
  const [isActive, setIsActive] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const resizeRef = useRef<{
    edge: string;
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Reset position when defaultPosition changes (e.g. panel repositions)
  useEffect(() => {
    if (defaultPosition) {
      setPos(defaultPosition);
    }
  }, [defaultPosition?.x, defaultPosition?.y]);

  // Reset size when reopened
  useEffect(() => {
    if (isOpen) {
      setSize(defaultSize);
      setIsActive(true);
    }
  }, [isOpen]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };

    const handleDragMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      });
    };

    const handleDragEnd = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [pos]);

  // Resize handlers
  const handleResizeStart = useCallback((edge: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(true);
    resizeRef.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      startW: size.width,
      startH: size.height,
    };

    const handleResizeMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const r = resizeRef.current;
      const dx = ev.clientX - r.startX;
      const dy = ev.clientY - r.startY;

      let newW = r.startW;
      let newH = r.startH;
      let newX = r.startPosX;
      let newY = r.startPosY;

      if (r.edge.includes('e')) newW = Math.max(minWidth, r.startW + dx);
      if (r.edge.includes('w')) {
        newW = Math.max(minWidth, r.startW - dx);
        newX = r.startPosX + (r.startW - newW);
      }
      if (r.edge.includes('s')) newH = Math.max(minHeight, r.startH + dy);
      if (r.edge.includes('n')) {
        newH = Math.max(minHeight, r.startH - dy);
        newY = r.startPosY + (r.startH - newH);
      }

      setSize({ width: newW, height: newH });
      setPos({ x: newX, y: newY });
    };

    const handleResizeEnd = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [pos, size, minWidth, minHeight]);

  const edges = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
  const edgeCursors: Record<string, string> = {
    n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
    ne: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize', sw: 'nesw-resize',
  };
  const edgeStyles: Record<string, React.CSSProperties> = {
    n: { top: -3, left: 6, right: 6, height: 6 },
    s: { bottom: -3, left: 6, right: 6, height: 6 },
    e: { right: -3, top: 6, bottom: 6, width: 6 },
    w: { left: -3, top: 6, bottom: 6, width: 6 },
    ne: { top: -4, right: -4, width: 10, height: 10 },
    nw: { top: -4, left: -4, width: 10, height: 10 },
    se: { bottom: -4, right: -4, width: 10, height: 10 },
    sw: { bottom: -4, left: -4, width: 10, height: 10 },
  };

  const bgColor = dark ? 'rgba(38,43,58,0.88)' : '#fff';
  const borderColor = isActive ? '#2f80ed' : 'transparent';
  const boxShadow = isActive
    ? (dark
      ? '0 4px 20px rgba(47,128,237,0.3), 0 12px 40px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(47,128,237,0.25), 1px 1px 10px rgba(0,0,0,0.15)')
    : '1px 1px 10px rgba(0,0,0,0.15)';
  const headerBorderColor = dark ? 'rgba(255,255,255,0.08)' : '#e9e9e9';
  const titleColor = dark ? 'rgba(255,255,255,0.9)' : '#36415d';
  const closeIconColor = dark ? 'rgba(255,255,255,0.7)' : '#36415d';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={windowRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onMouseDown={() => setIsActive(true)}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            width: size.width,
            height: size.height,
            zIndex: 62,
            pointerEvents: 'auto',
            background: bgColor,
            borderRadius: 10,
            border: `2px solid ${borderColor}`,
            boxShadow,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth,
            minHeight,
            backdropFilter: dark ? 'blur(20px) saturate(1.2)' : undefined,
          }}
        >
          {/* Header */}
          <div
            onMouseDown={handleDragStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              gap: 8,
              cursor: 'grab',
              userSelect: 'none',
              flexShrink: 0,
              borderBottom: `1px solid ${headerBorderColor}`,
            }}
            onMouseDownCapture={() => {}} // keep grab cursor
          >
            {icon && (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                {icon}
              </div>
            )}
            <span
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 600,
                color: titleColor,
                
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: 26,
                height: 26,
                border: 'none',
                background: 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: closeIconColor,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,31,31,0.12)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
            className="fl-body-scroll"
          >
            {children}
          </div>

          {/* Resize edges */}
          {edges.map((edge) => (
            <div
              key={edge}
              onMouseDown={(e) => handleResizeStart(edge, e)}
              style={{
                position: 'absolute',
                zIndex: 1,
                cursor: edgeCursors[edge],
                ...edgeStyles[edge],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
