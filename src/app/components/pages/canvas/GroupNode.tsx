import { useState, useRef, useEffect, useCallback } from 'react';
import type { NodeProps } from 'reactflow';
import { X, GripHorizontal } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

const GROUP_COLORS = [
  { name: 'Yellow', value: '#fef08a', bg: 'rgba(254, 240, 138, 0.15)', border: 'rgba(234, 179, 8, 0.4)' },
  { name: 'Pink', value: '#fecdd3', bg: 'rgba(254, 205, 211, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
  { name: 'Blue', value: '#bfdbfe', bg: 'rgba(191, 219, 254, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Green', value: '#bbf7d0', bg: 'rgba(187, 247, 208, 0.15)', border: 'rgba(34, 197, 94, 0.4)' },
  { name: 'Purple', value: '#ddd6fe', bg: 'rgba(221, 214, 254, 0.15)', border: 'rgba(139, 92, 246, 0.4)' },
  { name: 'Orange', value: '#fed7aa', bg: 'rgba(254, 215, 170, 0.15)', border: 'rgba(249, 115, 22, 0.4)' },
];

export interface GroupNodeData {
  label: string;
  color: string;
  childCount: number;
  width: number;
  height: number;
  editingEnabled?: boolean;
  onChange?: (data: Partial<GroupNodeData>) => void;
  onUngroup?: () => void;
}

export function GroupNode({ data, selected }: NodeProps<GroupNodeData>) {
  const [localLabel, setLocalLabel] = useState(data.label);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalLabel(data.label); }, [data.label]);

  useClickOutside(colorRef, () => setShowColorPicker(false), showColorPicker);

  const colorEntry = GROUP_COLORS.find(c => c.value === data.color) || GROUP_COLORS[2]; // default blue

  // ─── Resize handling ───
  const resizingRef = useRef<{ edge: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const onResizeStart = useCallback((e: React.PointerEvent, edge: string) => {
    e.stopPropagation();
    e.preventDefault();
    const w = Math.max(320, data.width);
    const h = Math.max(120, data.height);
    resizingRef.current = { edge, startX: e.clientX, startY: e.clientY, startW: w, startH: h };
    const onMove = (ev: PointerEvent) => {
      if (!resizingRef.current) return;
      const dx = ev.clientX - resizingRef.current.startX;
      const dy = ev.clientY - resizingRef.current.startY;
      const newW = edge.includes('e') ? Math.max(320, resizingRef.current.startW + dx) : undefined;
      const newH = edge.includes('s') ? Math.max(120, resizingRef.current.startH + dy) : undefined;
      data.onChange?.({
        ...(newW !== undefined ? { width: newW } : {}),
        ...(newH !== undefined ? { height: newH } : {}),
      });
    };
    const onUp = () => {
      resizingRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [data]);

  const currentW = Math.max(320, data.width);
  const currentH = Math.max(120, data.height);

  return (
    <div
      className="relative"
      style={{
        width: currentW,
        height: currentH,
        minWidth: 280,
        overflow: 'visible',
      }}
    >
      {/* Group container */}
      <div
        className="absolute inset-0 rounded-xl transition-all"
        style={{
          backgroundColor: colorEntry.bg,
          border: `2px dashed ${selected ? 'var(--primary)' : colorEntry.border}`,
          boxShadow: selected ? '0 0 0 2px var(--primary), 0 4px 16px rgba(47,128,237,0.15)' : 'none',
        }}
      />

      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-2 px-3 py-2 rounded-t-[10px] z-10"
        style={{
          backgroundColor: colorEntry.bg,
          borderBottom: `1px dashed ${colorEntry.border}`,
        }}
      >
        {/* Color dot / picker trigger */}
        <div className="relative">
          <button
            onClick={() => data.editingEnabled !== false && setShowColorPicker(!showColorPicker)}
            className="w-4 h-4 rounded-full border transition-transform hover:scale-110 nodrag"
            style={{
              backgroundColor: colorEntry.value,
              borderColor: colorEntry.border,
            }}
            title="Change group color"
          />

          {showColorPicker && (
            <div
              ref={colorRef}
              className="absolute top-6 left-0 z-50 p-2 rounded-lg border shadow-lg animate-in fade-in zoom-in-95 duration-200 nodrag"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--elevation-lg)',
              }}
            >
              <div className="flex gap-1.5">
                {GROUP_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => {
                      data.onChange?.({ color: c.value });
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border transition-transform ${data.color === c.value ? 'ring-2 ring-offset-1 scale-110' : ''}`}
                    style={{
                      backgroundColor: c.value,
                      borderColor: c.border,
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editable label */}
        <input
          type="text"
          value={localLabel}
          onChange={(e) => {
            if (data.editingEnabled === false) return;
            setLocalLabel(e.target.value);
            data.onChange?.({ label: e.target.value });
          }}
          readOnly={data.editingEnabled === false}
          className="flex-1 text-xs font-bold bg-transparent border-none focus:outline-none nodrag"
          style={{ color: 'var(--foreground)' }}
          placeholder="Group Name"
        />

        {/* Ungroup button */}
        {data.editingEnabled !== false && (
          <button
            onClick={() => data.onUngroup?.()}
            className="p-1 rounded hover:bg-black/10 transition-colors nodrag"
            title="Ungroup"
          >
            <X size={12} style={{ color: 'var(--muted)' }} />
          </button>
        )}

        {/* Drag handle */}
        <GripHorizontal size={14} style={{ color: 'var(--muted)', opacity: 0.5 }} />
      </div>

      {/* Resize handles (only when editing enabled) */}
      {data.editingEnabled !== false && (
        <>
          {/* Right edge */}
          <div
            className="absolute top-0 right-0 w-2 h-full nodrag nopan"
            style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => onResizeStart(e, 'e')}
          />
          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 w-full h-2 nodrag nopan"
            style={{ cursor: 'ns-resize' }}
            onPointerDown={(e) => onResizeStart(e, 's')}
          />
          {/* Bottom-right corner */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 nodrag nopan"
            style={{ cursor: 'nwse-resize' }}
            onPointerDown={(e) => onResizeStart(e, 'se')}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="absolute bottom-1 right-1" style={{ opacity: selected ? 0.6 : 0.3 }}>
              <line x1="9" y1="1" x2="1" y2="9" stroke={colorEntry.border} strokeWidth="1.5" />
              <line x1="9" y1="5" x2="5" y2="9" stroke={colorEntry.border} strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export { GROUP_COLORS };
