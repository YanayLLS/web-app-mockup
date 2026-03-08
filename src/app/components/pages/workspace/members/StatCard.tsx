import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, iconColor }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: iconColor || 'var(--primary)',
          opacity: 0.1,
        }}
      >
        <Icon
          className="w-6 h-6"
          style={{
            color: iconColor || 'var(--primary)',
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm"
          style={{
            color: 'var(--muted)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {label}
        </p>
        <p
          className="mt-1"
          style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
