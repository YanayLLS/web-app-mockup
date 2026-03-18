import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, iconColor = '#2F80ED' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-md transition-all">
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${iconColor}12` }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted mb-0.5">{label}</p>
        <p className="text-2xl text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
