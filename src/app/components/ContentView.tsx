import { ReactNode } from 'react';

interface ContentViewProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  hideHeader?: boolean;
}

export function ContentView({ icon, title, children, hideHeader = false }: ContentViewProps) {
  return (
    <div className="flex-1 bg-background overflow-hidden min-w-0">
      <div className="p-1 md:p-2 h-full">
        <div className="bg-card rounded-lg border border-border h-full overflow-hidden flex flex-col">
          {/* Header */}
          {!hideHeader && (
            <div className="px-3 md:px-5 py-3 md:py-3.5 shrink-0 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <span className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {title}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
