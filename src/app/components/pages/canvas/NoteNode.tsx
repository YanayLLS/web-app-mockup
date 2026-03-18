import { useState, useEffect, useRef } from 'react';
import type { NodeProps } from 'reactflow';
import { StickyNote, X } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface NoteNodeData {
  text: string;
  color: string;
  editingEnabled?: boolean;
  onChange?: (newData: any) => void;
  onAction?: (action: 'delete') => void;
}

export function NoteNode({ data, selected }: NodeProps<NoteNodeData>) {
  const [localText, setLocalText] = useState(data.text);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalText(data.text);
  }, [data.text]);

  const updateData = (newData: Partial<NoteNodeData>) => {
    data.onChange?.(newData);
  };

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [localText]);

  // Close color picker when clicking outside
  useClickOutside(colorMenuRef, () => setShowColorPicker(false), showColorPicker);

  const noteColors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Pink', value: '#fecdd3' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Purple', value: '#ddd6fe' },
    { name: 'Orange', value: '#fed7aa' },
  ];

  return (
    <div 
      className="relative rounded-lg shadow-lg transition-all"
      style={{
        backgroundColor: data.color || '#fef08a',
        width: 'clamp(180px, 60vw, 240px)',
        minHeight: '160px',
        border: selected ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: selected ? 'var(--elevation-lg)' : 'var(--elevation-md)',
              }}
    >
      {/* Header with icon and delete button */}
      <div className="flex items-center justify-between p-2 border-b border-black/10">
        {data.editingEnabled !== false ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-2 hover:bg-black/5 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Change color"
          >
            <StickyNote size={16} className="opacity-60" />
          </button>
        ) : (
          <div className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <StickyNote size={16} className="opacity-60" />
          </div>
        )}
        {data.editingEnabled !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onAction?.('delete');
            }}
            className="p-2 hover:bg-black/5 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Delete note"
          >
            <X size={14} className="opacity-60" />
          </button>
        )}
      </div>

      {/* Color picker */}
      {showColorPicker && (
        <div
          ref={colorMenuRef}
          className="absolute top-12 left-0 z-50 p-2 rounded-lg border shadow-lg animate-in fade-in zoom-in-95 duration-200 max-w-[calc(100vw-1rem)]"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-lg)',
          }}
        >
          <div className="flex flex-col gap-1">
            {noteColors.map(color => (
              <button
                key={color.value}
                onClick={() => {
                  updateData({ color: color.value });
                  setShowColorPicker(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-secondary text-sm min-h-[44px]"
              >
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: 'rgba(0,0,0,0.2)'
                  }} 
                />
                <span style={{ color: 'var(--foreground)' }}>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note content */}
      <div className="p-3 nodrag cursor-text">
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={(e) => {
            if (data.editingEnabled === false) return;
            setLocalText(e.target.value);
            updateData({ text: e.target.value });
          }}
          readOnly={data.editingEnabled === false}
          className="w-full bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed"
          placeholder="Add a note..."
          style={{
            color: '#000',
            minHeight: '100px',
                        cursor: data.editingEnabled === false ? 'default' : undefined,
          }}
        />
      </div>
    </div>
  );
}
