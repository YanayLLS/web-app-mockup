import { Check, Minus } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.MouseEvent<HTMLDivElement>) => void;
  indeterminate?: boolean;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, indeterminate, disabled }: CheckboxProps) {
  const isActive = checked || indeterminate;

  return (
    <div
      onClick={disabled ? undefined : onChange}
      className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
        isActive
          ? 'bg-primary border-primary'
          : 'border-border hover:border-primary/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={!disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(e as any); } } : undefined}
    >
      {indeterminate ? (
        <Minus className="w-3 h-3 text-primary-foreground" />
      ) : checked ? (
        <Check className="w-3 h-3 text-primary-foreground" />
      ) : null}
    </div>
  );
}
