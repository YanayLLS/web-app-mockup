import { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import frontlineLogo from 'figma:asset/2e4d44f46e0eb5c8e5ebd83749d089e9d5ec518c.png';

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  iconImage?: string;
  provider: 'openai' | 'anthropic' | 'other';
}

const availableModels: AIModel[] = [
  {
    id: 'frontline-ai',
    name: 'Frontline AI',
    description: 'Deeply integrated with frontline.io',
    iconImage: frontlineLogo,
    provider: 'other',
  },
  {
    id: 'gpt-5-2',
    name: 'GPT-5-2',
    description: 'OpenAI most advanced model.',
    icon: '🤖',
    provider: 'openai',
  },
  {
    id: 'gpt-5-1',
    name: 'GPT-5-1',
    description: 'Advanced AI for logic and multi-step tasks.',
    icon: '🤖',
    provider: 'openai',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    description: 'A lightweight version of GPT-5.',
    icon: '🤖',
    provider: 'openai',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Chat with 4o without leaving Frontline360.',
    icon: '🤖',
    provider: 'openai',
  },
  {
    id: 'gpt-4-1',
    name: 'GPT-4-1',
    description: 'Excels at everyday tasks with large context.',
    icon: '🤖',
    provider: 'openai',
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    description: 'Quick & efficient reasoning.',
    icon: '⚡',
    provider: 'openai',
  },
  {
    id: 'o3',
    name: 'o3',
    description: 'Advanced deep reasoning.',
    icon: '⚡',
    provider: 'openai',
  },
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    description: "Anthropic's most advanced reasoning model.",
    icon: '🔶',
    provider: 'anthropic',
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    description: 'Efficient & versatile for everyday tasks.',
    icon: '🔶',
    provider: 'anthropic',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    description: 'Fast and compact AI responses.',
    icon: '🔶',
    provider: 'anthropic',
  },
];

const providerColor: Record<string, string> = {
  openai: '#10B981',
  anthropic: '#F59E0B',
  other: '#2F80ED',
};

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  compact?: boolean;
}

export function ModelSelector({
  selectedModel = 'frontline-ai',
  onModelChange,
  compact = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleModelSelect = (modelId: string) => {
    onModelChange?.(modelId);
    setIsOpen(false);
  };

  // Group models by provider
  const grouped = [
    { label: 'Frontline', models: availableModels.filter(m => m.provider === 'other') },
    { label: 'OpenAI', models: availableModels.filter(m => m.provider === 'openai') },
    { label: 'Anthropic', models: availableModels.filter(m => m.provider === 'anthropic') },
  ].filter(g => g.models.length > 0);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Model Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all cursor-pointer"
      >
        {currentModel.iconImage ? (
          <img
            src={currentModel.iconImage}
            alt=""
            className="w-4 h-4 object-contain shrink-0"
          />
        ) : (
          <span className="text-sm shrink-0">{currentModel.icon}</span>
        )}
        <span
          className="text-foreground"
          style={{
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          {currentModel.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 left-0 z-[100] bg-card border border-border rounded-xl w-[300px] max-w-[calc(100vw-32px)] max-h-[400px] overflow-y-auto custom-scrollbar"
          style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
        >
          <div className="p-1.5">
            {grouped.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="h-px bg-border/60 my-1.5 mx-2" />}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {group.label}
                  </span>
                </div>
                {group.models.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-2.5 relative ${
                        isSelected ? 'bg-primary/[0.06]' : 'hover:bg-secondary/60'
                      }`}
                    >
                      {/* Model Icon */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${providerColor[model.provider]}10` }}>
                        {model.iconImage ? (
                          <img
                            src={model.iconImage}
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <span className="text-sm">{model.icon}</span>
                        )}
                      </div>

                      {/* Model Info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className={`text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {model.name}
                        </div>
                        <div className="text-xs text-muted mt-0.5 leading-relaxed">
                          {model.description}
                        </div>
                      </div>

                      {/* Check Icon for Selected */}
                      {isSelected && (
                        <Check size={16} className="text-primary absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
