import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Plus } from 'lucide-react';

interface StartNodeData {
  label: string;
  onAddConnectedStep?: () => void;
  connectedHandles?: Set<string>;
}

export function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <div className="relative group">
      <div 
        className="flex flex-col w-[280px] border-2 transition-all"
        style={{ 
          borderColor: selected ? 'var(--primary)' : 'var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: selected ? 'var(--elevation-lg)' : 'var(--elevation-sm)',
                    backgroundColor: 'var(--card)',
        }}
      >
        {/* Node color bar */}
        <div 
          className="h-2 rounded-t-[calc(var(--radius)-2px)]" 
          style={{ backgroundColor: 'var(--accent)' }} 
        />
        
        {/* Node content */}
        <div className="p-4 flex flex-col gap-3">
          {/* Node Header */}
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
                {data.label}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            This is the beginning of the procedure
          </p>
        </div>

        {/* Connection handle */}
        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <Handle
            type="source"
            position={Position.Bottom}
            id="default"
            className="!static !translate-x-0 !w-4 !h-4 !border-2 transition-all hover:!w-5 hover:!h-5 hover:!shadow-lg !cursor-crosshair"
            style={{
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--card)'
            }}
          />
          {!data.connectedHandles?.has('default') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onAddConnectedStep?.();
              }}
              className="absolute top-5 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-125 nodrag opacity-40 hover:opacity-100 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--muted)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--muted)';
              }}
              title="Add connected step"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
