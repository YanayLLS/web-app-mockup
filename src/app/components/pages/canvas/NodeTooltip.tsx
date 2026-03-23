import type { ReactNode } from 'react';

interface NodeTooltipProps {
  label: string;
  desc?: string;
  shortcut?: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
}

export function NodeTooltip({ label, desc, shortcut, children, side = 'top' }: NodeTooltipProps) {
  return (
    <div className="node-tooltip-wrap">
      {children}
      <div className={`node-tooltip ${side === 'bottom' ? 'node-tooltip-bottom' : ''}`}>
        <div className="node-tooltip-content">
          <div className="node-tooltip-header">
            <span className="node-tooltip-label">{label}</span>
            {shortcut && <kbd className="node-tooltip-kbd">{shortcut}</kbd>}
          </div>
          {desc && <span className="node-tooltip-desc">{desc}</span>}
        </div>
      </div>
    </div>
  );
}
