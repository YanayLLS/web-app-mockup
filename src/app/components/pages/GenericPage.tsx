import { Construction } from 'lucide-react';

interface GenericPageProps {
  title: string;
  description: string;
}

export function GenericPage({ title, description }: GenericPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(47,128,237,0.1), rgba(47,128,237,0.04))',
            border: '1px solid rgba(47,128,237,0.1)',
            boxShadow: '0 8px 32px rgba(47,128,237,0.08)',
          }}
        >
          <Construction size={32} className="text-primary/50" />
        </div>

        {/* Title */}
        <h3 className="text-foreground mb-2 text-lg" style={{ fontWeight: 'var(--font-weight-bold)' }}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed mb-6 max-w-[320px]">
          {description}
        </p>

        {/* Decorative dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
      </div>
    </div>
  );
}
