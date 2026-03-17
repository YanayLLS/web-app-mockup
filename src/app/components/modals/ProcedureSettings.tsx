import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface SettingOption {
  id: string;
  label: string;
  checked: boolean;
  tooltip?: string;
}

interface SettingGroup {
  id: string;
  title: string;
  options: SettingOption[];
}

interface ProcedureSettingsProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  settings: SettingGroup[];
  aiInstructions?: string;
  onSettingsChange?: (settings: SettingGroup[]) => void;
  onAIInstructionsChange?: (instructions: string) => void;
}

export function ProcedureSettings({
  isExpanded,
  onToggleExpand,
  settings,
  aiInstructions = '',
  onSettingsChange,
  onAIInstructionsChange,
}: ProcedureSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localAI, setLocalAI] = useState(aiInstructions);

  const handleToggle = (groupId: string, optionId: string) => {
    const newSettings = localSettings.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          options: group.options.map(opt =>
            opt.id === optionId ? { ...opt, checked: !opt.checked } : opt
          ),
        };
      }
      return group;
    });
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius)]">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] hover:bg-secondary/50 transition-colors"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown size={12} className="text-muted" aria-hidden="true" />
        ) : (
          <ChevronRight size={12} className="text-muted" aria-hidden="true" />
        )}
        <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Settings
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {localSettings.map((group, groupIndex) => (
            <div key={group.id}>
              {/* Group Title */}
              {group.title && (
                <p className="text-xs text-muted mb-2 px-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {group.title}
                </p>
              )}

              {/* Options */}
              <div className="space-y-1">
                {group.options.map(option => (
                  <div key={option.id} className="flex items-center gap-2 min-h-[44px]">
                    <button
                      onClick={() => handleToggle(group.id, option.id)}
                      className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
                        option.checked
                          ? 'bg-primary border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option.checked && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path
                            d="M1 5.5L4 8.5L11 1.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-xs text-foreground">{option.label}</span>
                      {option.tooltip && (
                        <div className="group/tooltip relative">
                          <Info size={12} className="text-muted hover:text-foreground transition-colors cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap hidden md:block md:opacity-0 md:group-hover/tooltip:opacity-100 pointer-events-none transition-opacity">
                            {option.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              {groupIndex < localSettings.length - 1 && (
                <div className="h-px bg-border my-3" />
              )}
            </div>
          ))}

          {/* AI Instructions */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  AI Instructions
                </span>
                <span className="text-xs text-muted">(optional)</span>
              </div>
              <button className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-[#2F80ED] to-[#004fff] hover:opacity-80 transition-opacity" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Summarize with AI
              </button>
            </div>
            <textarea
              value={localAI}
              onChange={(e) => {
                setLocalAI(e.target.value);
                onAIInstructionsChange?.(e.target.value);
              }}
              placeholder="Meet the ProBook, an innovative laptop crafted for professionals who seek both power and sophistication. Its sleek metal design..."
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-[var(--radius)] text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
