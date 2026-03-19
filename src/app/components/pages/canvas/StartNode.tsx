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
        className="canvas-step-card flex flex-col w-[280px] rounded-xl transition-all"
        style={{
          borderColor: selected ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
          boxShadow: selected
            ? '0 0 0 2px var(--primary), 0 4px 16px rgba(47,128,237,0.15)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Node content */}
        <div className="px-4 pt-3 pb-3.5 flex flex-col gap-1.5">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
              {data.label}
            </p>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            This is the beginning of the procedure
          </p>
        </div>

        {/* Connection handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className=""
          style={{
            width: 14, height: 14,
            left: '50%',
            bottom: -7,
            transform: 'translateX(-50%)',
            background: '#10b981',
            border: '2px solid var(--card)',
            cursor: 'crosshair',
            zIndex: 10,
          }}
        />
        {!data.connectedHandles?.has('default') && (
          <button
            onClick={(e) => { e.stopPropagation(); data.onAddConnectedStep?.(); }}
            className="absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border flex items-center justify-center hover:scale-110 nodrag opacity-30 hover:opacity-100 canvas-add-btn z-10"
            style={{ bottom: '-30px' }}
            title="Add connected step"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
