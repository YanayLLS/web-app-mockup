import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  subtitle?: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, subtitle, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
      style={{
        transform: `translate(-50%, ${isVisible && !isLeaving ? '0' : '-100%'}) scale(${isVisible && !isLeaving ? '1' : '0.95'})`,
        opacity: isVisible && !isLeaving ? '1' : '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-lg shadow-elevation-lg min-w-[320px] max-w-[500px]"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--primary-background)',
            animation: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <CheckCircle2
            className="w-5 h-5"
            style={{
              color: 'var(--primary)',
              animation: 'checkmark 0.5s ease-in-out 0.2s both',
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm"
            style={{ color: 'var(--foreground)' }}
          >
            {message}
          </p>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
