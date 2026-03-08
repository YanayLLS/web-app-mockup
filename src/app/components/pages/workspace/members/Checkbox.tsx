interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.MouseEvent<HTMLDivElement>) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  blocked?: boolean;
}

export function Checkbox({ checked, onChange, indeterminate = false, disabled = false, blocked = false }: CheckboxProps) {
  const showBlocked = blocked && !checked;
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(e);
      }}
      className="w-4 h-4 rounded flex items-center justify-center border-2 transition-all"
      style={{
        borderColor: showBlocked ? 'var(--destructive)' : (checked || indeterminate ? 'var(--primary)' : 'var(--border)'),
        backgroundColor: showBlocked ? 'var(--destructive)' : (checked || indeterminate ? 'var(--primary)' : 'transparent'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {checked && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
          <path
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {indeterminate && !checked && !showBlocked && (
        <div className="w-2 h-0.5 bg-white" />
      )}
      {showBlocked && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
