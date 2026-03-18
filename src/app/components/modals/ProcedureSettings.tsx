import { useState } from 'react';
import { ChevronDown, ChevronRight, Info, Settings, Sparkles } from 'lucide-react';

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
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2.5 px-4 py-3 min-h-[44px] hover:bg-secondary/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <Settings size={15} className="text-primary shrink-0" />
        <span className="text-sm text-foreground flex-1 text-left" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Settings
        </span>
        <ChevronDown size={14} className={`text-muted transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40">
          {localSettings.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex === 0 ? 'pt-3' : ''}>
              {/* Group Title */}
              {group.title && (
                <p className="text-[10px] text-muted uppercase tracking-wider mb-2 px-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {group.title}
                </p>
              )}

              {/* Options */}
              <div className="space-y-0.5">
                {group.options.map(option => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2.5 min-h-[44px] px-2 py-1 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={option.checked}
                      onChange={() => handleToggle(group.id, option.id)}
                      className="w-4 h-4 rounded border-border accent-[#2F80ED] cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-foreground flex-1">{option.label}</span>
                    {option.tooltip && (
                      <div className="group/tooltip relative shrink-0">
                        <Info size={12} className="text-muted hover:text-foreground transition-colors cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-foreground text-background text-[10px] rounded-lg whitespace-nowrap hidden md:block md:opacity-0 md:group-hover/tooltip:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                          {option.tooltip}
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Divider */}
              {groupIndex < localSettings.length - 1 && (
                <div className="h-px bg-border/50 my-3" />
              )}
            </div>
          ))}

          {/* AI Instructions */}
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between mb-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" />
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  AI Instructions
                </span>
                <span className="text-[10px] text-muted">(optional)</span>
              </div>
              <button className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-[#2F80ED] to-[#004fff] hover:brightness-125 transition-all px-2 py-1 rounded-md hover:bg-primary/5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Summarize with AI
              </button>
            </div>
            <textarea
              value={localAI}
              onChange={(e) => {
                setLocalAI(e.target.value);
                onAIInstructionsChange?.(e.target.value);
              }}
              placeholder="Meet the ProBook, an innovative laptop crafted for professionals who seek both power and sophistication..."
              className="w-full h-24 px-3 py-2.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
