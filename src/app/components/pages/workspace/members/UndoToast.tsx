import { useEffect, useState } from 'react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
  showUndo?: boolean;
}

export function UndoToast({ message, onUndo, onClose, duration = 10000, showUndo = true }: UndoToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(progressInterval);
      }
    }, 16); // ~60fps

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
    handleClose();
  };

  return (
    <div
      className="fixed bottom-6 left-6 z-[100] pointer-events-auto"
      style={{
        transform: `translateX(${isVisible && !isLeaving ? '0' : '-120%'})`,
        opacity: isVisible && !isLeaving ? '1' : '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="flex items-center gap-4 px-6 py-4 rounded-lg min-w-[360px] relative overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--elevation-sm)',
        }}
      >
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--primary)',
            transition: 'width 0.016s linear',
          }}
        />

        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--destructive)',
            opacity: 0.1,
          }}
        >
          <Undo2
            className="w-5 h-5"
            style={{
              color: 'var(--destructive)',
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-base)',
            }}
          >
            {message}
          </p>
        </div>

        {showUndo && (
          <button
            onClick={handleUndo}
            className="flex-shrink-0 px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            Undo
          </button>
        )}

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </div>
  );
}
