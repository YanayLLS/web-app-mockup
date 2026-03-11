import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';

interface ToastContextType {
  showToast: (message: string, action?: { label: string; onClick: () => void }, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback((
    message: string,
    action?: { label: string; onClick: () => void },
    duration: number = 5000
  ) => {
    toast(message, {
      duration,
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
