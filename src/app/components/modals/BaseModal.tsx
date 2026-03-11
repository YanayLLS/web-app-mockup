import { useEffect, useRef, ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Click backdrop to close (default: true if onClose provided) */
  backdropClose?: boolean;
  /** Close on Escape key (default: true if onClose provided) */
  escapeClose?: boolean;
  /** Backdrop opacity — maps to bg-black/{value} (default: 50) */
  opacity?: 40 | 50 | 60 | 70;
  /** Enable backdrop blur (default: false) */
  blur?: boolean;
  /** Additional className on the backdrop */
  className?: string;
  /** Z-index layer (default: 50) */
  zIndex?: number;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  backdropClose = !!onClose,
  escapeClose = !!onClose,
  opacity = 50,
  blur = false,
  className = '',
  zIndex = 50,
}: BaseModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !escapeClose || !onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, escapeClose, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdropClose && onClose && contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const opacityClass = `bg-black/${opacity}`;
  const blurClass = blur ? 'backdrop-blur-sm' : '';

  return (
    <div
      className={`fixed inset-0 ${opacityClass} ${blurClass} flex items-center justify-center ${className}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        className="max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] overflow-auto"
      >
        {children}
      </div>
    </div>
  );
}
