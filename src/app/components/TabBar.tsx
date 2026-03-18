import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="bg-background px-3 pt-2 pb-1.5 overflow-x-auto border-b border-border/30">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-card text-foreground border border-border shadow-sm'
                  : 'text-muted hover:text-foreground hover:bg-secondary/40 border border-transparent'
              }`}
              style={{ fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)' }}
            >
              {tab.icon && (
                <div className={`shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`}>
                  {tab.icon}
                </div>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
