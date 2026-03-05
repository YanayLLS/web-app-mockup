import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {isSaving && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center bg-card border border-border rounded-lg"
            style={{
              padding: 'var(--spacing-xs) var(--spacing-md)',
              gap: 'var(--spacing-xs)',
              boxShadow: 'var(--elevation-sm)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Cloud className="size-4 text-primary" />
            </motion.div>
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              Saving changes...
            </span>
          </motion.div>
        )}
        {!isSaving && showSaved && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
            transition={{ duration: 0.2 }}
            className="flex items-center bg-card border border-border rounded-lg"
            style={{
              padding: 'var(--spacing-xs) var(--spacing-md)',
              gap: 'var(--spacing-xs)',
              boxShadow: 'var(--elevation-sm)'
            }}
          >
            <Check className="size-4 text-accent" />
            <span
              className="text-muted-foreground"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              All changes saved
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
