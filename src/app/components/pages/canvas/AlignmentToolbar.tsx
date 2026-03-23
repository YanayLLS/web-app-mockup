import type { Node } from 'reactflow';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../ui/tooltip';

interface AlignmentToolbarProps {
  selectedNodes: Node[];
  onUpdatePositions: (updates: { id: string; position: { x: number; y: number } }[]) => void;
}

const NODE_WIDTH = 280;
const NODE_HEIGHT = 200;

export function AlignmentToolbar({ selectedNodes, onUpdatePositions }: AlignmentToolbarProps) {
  if (selectedNodes.length < 2) return null;

  // Calculate bounding box of selected nodes for toolbar positioning
  const minX = Math.min(...selectedNodes.map(n => n.position.x));
  const maxX = Math.max(...selectedNodes.map(n => n.position.x + NODE_WIDTH));
  const minY = Math.min(...selectedNodes.map(n => n.position.y));
  const centerX = (minX + maxX) / 2;

  const alignLeft = () => {
    const targetX = minX;
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: targetX, y: n.position.y } })));
  };

  const alignCenterH = () => {
    const avgCenterX = selectedNodes.reduce((sum, n) => sum + n.position.x + NODE_WIDTH / 2, 0) / selectedNodes.length;
    const targetX = avgCenterX - NODE_WIDTH / 2;
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: targetX, y: n.position.y } })));
  };

  const alignRight = () => {
    const targetRight = maxX;
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: targetRight - NODE_WIDTH, y: n.position.y } })));
  };

  const alignTop = () => {
    const targetY = minY;
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: n.position.x, y: targetY } })));
  };

  const alignMiddle = () => {
    const avgCenterY = selectedNodes.reduce((sum, n) => sum + n.position.y + NODE_HEIGHT / 2, 0) / selectedNodes.length;
    const targetY = avgCenterY - NODE_HEIGHT / 2;
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: n.position.x, y: targetY } })));
  };

  const alignBottom = () => {
    const maxY = Math.max(...selectedNodes.map(n => n.position.y + NODE_HEIGHT));
    onUpdatePositions(selectedNodes.map(n => ({ id: n.id, position: { x: n.position.x, y: maxY - NODE_HEIGHT } })));
  };

  const distributeH = () => {
    if (selectedNodes.length < 3) return;
    const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
    const totalSpan = sorted[sorted.length - 1].position.x - sorted[0].position.x;
    const gap = totalSpan / (sorted.length - 1);
    onUpdatePositions(sorted.map((n, i) => ({
      id: n.id,
      position: { x: sorted[0].position.x + i * gap, y: n.position.y },
    })));
  };

  const distributeV = () => {
    if (selectedNodes.length < 3) return;
    const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
    const totalSpan = sorted[sorted.length - 1].position.y - sorted[0].position.y;
    const gap = totalSpan / (sorted.length - 1);
    onUpdatePositions(sorted.map((n, i) => ({
      id: n.id,
      position: { x: n.position.x, y: sorted[0].position.y + i * gap },
    })));
  };

  const buttons = [
    { label: 'Align Left', icon: AlignLeftIcon, action: alignLeft },
    { label: 'Align Center', icon: AlignCenterHIcon, action: alignCenterH },
    { label: 'Align Right', icon: AlignRightIcon, action: alignRight },
    { label: 'sep1', icon: null, action: null },
    { label: 'Align Top', icon: AlignTopIcon, action: alignTop },
    { label: 'Align Middle', icon: AlignMiddleIcon, action: alignMiddle },
    { label: 'Align Bottom', icon: AlignBottomIcon, action: alignBottom },
    { label: 'sep2', icon: null, action: null },
    { label: 'Distribute Horizontally', icon: DistributeHIcon, action: distributeH, disabled: selectedNodes.length < 3 },
    { label: 'Distribute Vertically', icon: DistributeVIcon, action: distributeV, disabled: selectedNodes.length < 3 },
  ];

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <div
        className="absolute z-20 flex items-center gap-0.5 px-1.5 py-1 rounded-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
        style={{
          left: `${centerX}px`,
          top: `${minY - 52}px`,
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        {buttons.map((btn) => {
          if (!btn.action) {
            return (
              <div
                key={btn.label}
                className="w-px h-5 mx-0.5"
                style={{ backgroundColor: 'var(--border)' }}
              />
            );
          }
          const Icon = btn.icon!;
          const disabled = (btn as any).disabled;
          return (
            <Tooltip key={btn.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={btn.action}
                  disabled={disabled}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    color: disabled ? 'var(--muted)' : 'var(--foreground)',
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Icon />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <span className="text-xs">{btn.label}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// --- Alignment SVG Icons (16x16) ---

function AlignLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="2" y2="14" />
      <rect x="4" y="3" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="4" y="8" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function AlignCenterHIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="8" y1="1" x2="8" y2="15" strokeDasharray="2 2" />
      <rect x="3" y="3" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="5" y="8" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="14" y1="2" x2="14" y2="14" />
      <rect x="2" y="3" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="6" y="8" width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function AlignTopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="14" y2="2" />
      <rect x="3" y="4" width="3" height="10" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="8" y="4" width="3" height="6" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function AlignMiddleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="1" y1="8" x2="15" y2="8" strokeDasharray="2 2" />
      <rect x="3" y="3" width="3" height="10" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="8" y="5" width="3" height="6" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function AlignBottomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="14" x2="14" y2="14" />
      <rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="8" y="6" width="3" height="6" rx="0.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function DistributeHIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="1" y1="2" x2="1" y2="14" strokeOpacity="0.4" />
      <line x1="15" y1="2" x2="15" y2="14" strokeOpacity="0.4" />
      <rect x="3" y="4" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="10" y="4" width="3" height="8" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 8 L9 8" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function DistributeVIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="1" x2="14" y2="1" strokeOpacity="0.4" />
      <line x1="2" y1="15" x2="14" y2="15" strokeOpacity="0.4" />
      <rect x="4" y="3" width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <rect x="4" y="10" width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 7 L8 9" strokeDasharray="1.5 1.5" />
    </svg>
  );
}
