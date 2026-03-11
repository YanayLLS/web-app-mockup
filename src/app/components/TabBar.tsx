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
    <div className="bg-background px-3 pt-2 pb-1 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-xs transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-card text-foreground border border-border shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-secondary/30'
            }`}
            style={activeTab === tab.id ? { fontWeight: 'var(--font-weight-bold)' } : {}}
          >
            {tab.icon && <div className="shrink-0">{tab.icon}</div>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
