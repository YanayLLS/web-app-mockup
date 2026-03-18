import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
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
      <h3
        className="mb-2 text-[15px]"
        style={{
          color: 'var(--foreground)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        {title}
      </h3>
      <p
        className="text-center max-w-[280px] leading-relaxed"
        style={{
          color: 'var(--muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 rounded-lg transition-all hover:brightness-110 hover:shadow-md hover:shadow-primary/20 flex items-center gap-2"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            boxShadow: '0 2px 8px rgba(47,128,237,0.15)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
