import { useState } from 'react';
import { ChevronDown, ChevronRight, Info, Settings, Sparkles, RotateCcw } from 'lucide-react';

interface SettingOption {
  id: string;
  label: string;
  checked: boolean;
  tooltip?: string;
  defaultChecked?: boolean;
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

const AI_MAX_LENGTH = 1000;

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
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  // #23 — count changed settings
  const changedCount = localSettings.reduce((sum, group) => {
    return sum + group.options.filter(opt => {
      const defaultVal = opt.defaultChecked !== undefined ? opt.defaultChecked : true;
      return opt.checked !== defaultVal;
    }).length;
  }, 0);

  // #21 — Summarize with AI handler
  const handleSummarize = async () => {
    if (!localAI.trim() || isSummarizing) return;
    setIsSummarizing(true);
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 1500));
    const words = localAI.trim().split(/\s+/);
    if (words.length > 20) {
      const summarized = words.slice(0, 15).join(' ') + '...';
      setLocalAI(summarized);
      onAIInstructionsChange?.(summarized);
    }
    setIsSummarizing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2.5 px-4 py-3 min-h-[46px] hover:bg-secondary/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <Settings size={15} className="text-primary shrink-0" />
        <span className="text-sm text-foreground flex-1 text-left" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          Settings
        </span>
        {/* #23 — changed indicator */}
        {!isExpanded && changedCount > 0 && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
            {changedCount} changed
          </span>
        )}
        <ChevronDown size={14} className={`text-muted transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40">
          {localSettings.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex === 0 ? 'pt-3' : ''}>
              {/* Group Title */}
              {group.title && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <p className="text-[10px] text-muted uppercase tracking-wider flex-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {group.title}
                  </p>
                  {/* #25 — show count of options in group */}
                  <span className="text-[9px] text-muted bg-secondary rounded px-1.5 py-0.5">
                    {group.options.filter(o => o.checked).length}/{group.options.length}
                  </span>
                </div>
              )}

              {/* Options */}
              <div className="space-y-0.5">
                {group.options.map(option => {
                  const isChanged = option.checked !== (option.defaultChecked !== undefined ? option.defaultChecked : true);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-2.5 min-h-[44px] px-2 py-1 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer ${isChanged ? 'bg-amber-50/50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={() => handleToggle(group.id, option.id)}
                        className="w-4 h-4 rounded border-border accent-[#2F80ED] cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-foreground flex-1">
                        {option.label}
                        {/* #23 — changed dot */}
                        {isChanged && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ml-1.5" style={{ verticalAlign: 'middle' }} />
                        )}
                      </span>
                      {/* #22 — tooltip works on all screens */}
                      {option.tooltip && (
                        <div className="group/tooltip relative shrink-0">
                          <Info size={12} className="text-muted hover:text-foreground transition-colors cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-[#36415D] text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-30" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            {option.tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#36415D]" />
                          </div>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* #25 — Divider with stronger visual */}
              {groupIndex < localSettings.length - 1 && (
                <div className="h-px bg-border my-3" />
              )}
            </div>
          ))}

          {/* AI Instructions */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" />
                <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  AI Instructions
                </span>
                <span className="text-[10px] text-muted">(optional)</span>
              </div>
              {/* #21 — Summarize with AI handler */}
              <button
                onClick={handleSummarize}
                disabled={!localAI.trim() || isSummarizing}
                className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-[#2F80ED] to-[#004fff] hover:brightness-125 transition-all px-2 py-1 rounded-md hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                {isSummarizing && (
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#2F80ED" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="#2F80ED" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                <span>{isSummarizing ? 'Summarizing...' : 'Summarize with AI'}</span>
              </button>
            </div>
            {/* #24 — textarea with char counter */}
            <div className="relative">
              <textarea
                value={localAI}
                onChange={(e) => {
                  if (e.target.value.length <= AI_MAX_LENGTH) {
                    setLocalAI(e.target.value);
                    onAIInstructionsChange?.(e.target.value);
                  }
                }}
                maxLength={AI_MAX_LENGTH}
                placeholder="Describe the product or context for AI-assisted features..."
                className="w-full h-24 px-3 py-2.5 pb-6 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              />
              <span className={`absolute bottom-1.5 right-2.5 text-[10px] pointer-events-none ${localAI.length > AI_MAX_LENGTH * 0.9 ? 'text-red-500' : 'text-muted'}`}>
                {localAI.length}/{AI_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
