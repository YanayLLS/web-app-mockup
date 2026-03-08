import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6"
      style={{
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{
          backgroundColor: 'var(--secondary)',
        }}
      >
        <Icon
          className="w-8 h-8"
          style={{
            color: 'var(--muted)',
          }}
        />
      </div>
      <h3
        className="mb-2"
        style={{
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-h3)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        {title}
      </h3>
      <p
        className="text-center max-w-md mb-6"
        style={{
          color: 'var(--muted)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-base)',
        }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-lg transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-bold)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
