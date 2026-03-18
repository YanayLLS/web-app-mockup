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
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(47,128,237,0.03))',
          border: '1px solid rgba(47,128,237,0.1)',
          boxShadow: '0 8px 32px rgba(47,128,237,0.06)',
        }}
      >
        <Icon size={28} className="text-primary/40" />
      </div>
      <h3 className="text-[15px] text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        {title}
      </h3>
      <p className="text-sm text-muted text-center max-w-[300px] leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
