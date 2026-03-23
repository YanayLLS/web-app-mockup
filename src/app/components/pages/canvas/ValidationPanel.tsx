import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Navigation,
  X,
  CheckCircle2,
} from 'lucide-react';
import type { ValidationResult, ValidationSeverity, ValidationIssue } from './useFlowValidation';

interface ValidationPanelProps {
  result: ValidationResult;
  onGoToNode: (nodeId: string) => void;
  onClose: () => void;
}

const severityConfig: Record<ValidationSeverity, { icon: typeof AlertCircle; color: string; bgColor: string; label: string }> = {
  error: {
    icon: AlertCircle,
    color: '#FF1F1F',
    bgColor: 'rgba(255, 31, 31, 0.08)',
    label: 'Errors',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    label: 'Warnings',
  },
  info: {
    icon: Info,
    color: '#2F80ED',
    bgColor: 'rgba(47, 128, 237, 0.08)',
    label: 'Info',
  },
};

function IssueItem({ issue, onGoTo }: { issue: ValidationIssue; onGoTo: () => void }) {
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group"
      style={{ backgroundColor: 'transparent' }}
      onClick={onGoTo}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = config.bgColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Icon size={14} style={{ color: config.color, marginTop: 1, flexShrink: 0 }} />
      <span className="text-xs leading-relaxed flex-1" style={{ color: 'var(--foreground)' }}>
        {issue.message}
      </span>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
        style={{ color: config.color }}
        title="Go to node"
        onClick={(e) => {
          e.stopPropagation();
          onGoTo();
        }}
      >
        <Navigation size={12} />
      </button>
    </div>
  );
}

function SeveritySection({
  severity,
  issues,
  onGoToNode,
}: {
  severity: ValidationSeverity;
  issues: ValidationIssue[];
  onGoToNode: (nodeId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = severityConfig[severity];
  const Icon = config.icon;

  if (issues.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors rounded"
        style={{ color: config.color }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Icon size={14} />
        <span>{config.label}</span>
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          {issues.length}
        </span>
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {issues.map((issue) => (
            <IssueItem
              key={issue.id}
              issue={issue}
              onGoTo={() => issue.nodeId && onGoToNode(issue.nodeId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ValidationPanel({ result, onGoToNode, onClose }: ValidationPanelProps) {
  const errorIssues = result.issues.filter((i) => i.severity === 'error');
  const warningIssues = result.issues.filter((i) => i.severity === 'warning');
  const infoIssues = result.issues.filter((i) => i.severity === 'info');

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-30 flex flex-col animate-in slide-in-from-right duration-200"
      style={{
        width: '320px',
        backgroundColor: 'var(--card)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: 'var(--foreground)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Validation
          </span>
          {result.totalCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: result.errorCount > 0 ? 'rgba(255,31,31,0.1)' : result.warningCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(47,128,237,0.1)',
                color: result.errorCount > 0 ? '#FF1F1F' : result.warningCount > 0 ? '#f59e0b' : '#2F80ED',
              }}
            >
              {result.totalCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-secondary"
          style={{ color: 'var(--muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {result.totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle2 size={40} style={{ color: '#11E874', opacity: 0.6 }} />
            <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              No issues found
            </div>
            <div className="text-xs text-center px-6" style={{ color: 'var(--muted)' }}>
              Your flow looks good! All nodes are properly connected.
            </div>
          </div>
        ) : (
          <>
            <SeveritySection severity="error" issues={errorIssues} onGoToNode={onGoToNode} />
            <SeveritySection severity="warning" issues={warningIssues} onGoToNode={onGoToNode} />
            <SeveritySection severity="info" issues={infoIssues} onGoToNode={onGoToNode} />
          </>
        )}
      </div>

      {/* Footer summary */}
      <div
        className="px-4 py-2.5 border-t shrink-0 flex items-center gap-3 text-[10px] uppercase tracking-wide font-bold"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        {result.errorCount > 0 && (
          <span className="flex items-center gap-1" style={{ color: '#FF1F1F' }}>
            <AlertCircle size={10} /> {result.errorCount} errors
          </span>
        )}
        {result.warningCount > 0 && (
          <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
            <AlertTriangle size={10} /> {result.warningCount} warnings
          </span>
        )}
        {result.infoCount > 0 && (
          <span className="flex items-center gap-1" style={{ color: '#2F80ED' }}>
            <Info size={10} /> {result.infoCount} info
          </span>
        )}
      </div>
    </div>
  );
}
