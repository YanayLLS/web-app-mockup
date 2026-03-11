import { useEffect, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onResetAllParts: () => void;
  onHide: () => void;
  onIsolate: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onResetAllParts,
  onHide,
  onIsolate
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose, true, true);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }
      if (adjustedX < 8) {
        adjustedX = 8;
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }
      if (adjustedY < 8) {
        adjustedY = 8;
      }

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--elevation-lg)',
        padding: 'var(--spacing-xs)',
        minWidth: '180px',
        maxWidth: 'calc(100vw - 16px)'
      }}
    >
      <button
        onClick={() => handleItemClick(onResetAllParts)}
        className="w-full text-left transition-colors"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-normal)',
          color: 'var(--foreground)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent-foreground)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
      >
        Reset all parts
      </button>

      <button
        onClick={() => handleItemClick(onHide)}
        className="w-full text-left transition-colors"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-normal)',
          color: 'var(--foreground)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent-foreground)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
      >
        Hide
      </button>

      <button
        onClick={() => handleItemClick(onIsolate)}
        className="w-full text-left transition-colors"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'var(--font-weight-normal)',
          color: 'var(--foreground)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent-foreground)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
      >
        Isolate
      </button>
    </div>
  );
}
