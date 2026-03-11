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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Model Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[var(--radius)] hover:bg-secondary/50 transition-colors cursor-pointer"
        style={{
          border: '1px solid var(--border)',
        }}
      >
        {currentModel.iconImage ? (
          <img 
            src={currentModel.iconImage} 
            alt="" 
            className="w-[16px] h-[16px] object-contain shrink-0"
          />
        ) : (
          <span className="text-[14px]">{currentModel.icon}</span>
        )}
        <span
          style={{
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
          }}
        >
          {currentModel.name}
        </span>
        <ChevronDown 
          size={14} 
          style={{ 
            color: 'var(--foreground)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-[100] bg-card rounded-[var(--radius)] overflow-hidden custom-scrollbar"
          style={{
            width: '280px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-md)',
          }}
        >
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className="w-full text-left px-[12px] py-[10px] hover:bg-secondary/50 transition-colors flex items-start gap-[10px] relative"
              style={{
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Model Icon */}
              {model.iconImage ? (
                <img 
                  src={model.iconImage} 
                  alt="" 
                  className="w-[18px] h-[18px] object-contain shrink-0 mt-[2px]"
                />
              ) : (
                <span className="text-[16px] shrink-0 mt-[2px]">{model.icon}</span>
              )}

              {/* Model Info */}
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--foreground)',
                  }}
                >
                  {model.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  {model.description}
                </div>
              </div>

              {/* Check Icon for Selected */}
              {model.id === selectedModel && (
                <Check 
                  size={16} 
                  style={{ 
                    color: 'var(--primary)',
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }} 
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
