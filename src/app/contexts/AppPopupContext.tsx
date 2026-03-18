import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

type PopupVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertOptions {
  title?: string;
  variant?: PopupVariant;
  okLabel?: string;
}

interface ConfirmOptions {
  title?: string;
  variant?: PopupVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use danger styling on confirm button */
  destructive?: boolean;
}

interface PromptOptions {
  title?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AppPopupAPI {
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  prompt: (message: string, options?: PromptOptions) => Promise<string | null>;
}

type PopupEntry =
  | { type: 'alert'; message: string; options: AlertOptions; resolve: (value: void) => void }
  | { type: 'confirm'; message: string; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { type: 'prompt'; message: string; options: PromptOptions; resolve: (value: string | null) => void };

// ── Context ────────────────────────────────────────────────────────────

const AppPopupContext = createContext<AppPopupAPI | null>(null);

export function useAppPopup(): AppPopupAPI {
  const ctx = useContext(AppPopupContext);
  if (!ctx) throw new Error('useAppPopup must be used within AppPopupProvider');
  return ctx;
}

// ── Icon helper ────────────────────────────────────────────────────────

const variantConfig: Record<PopupVariant, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: '#2F80ED', bg: 'rgba(47,128,237,0.1)' },
  success: { icon: CheckCircle2, color: '#0a9e4a', bg: 'rgba(17,232,116,0.1)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  error: { icon: XCircle, color: '#FF1F1F', bg: 'rgba(255,31,31,0.1)' },
};

function VariantIcon({ variant }: { variant?: PopupVariant }) {
  const cfg = variantConfig[variant || 'info'];
  const Icon = cfg.icon;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
      <Icon size={18} style={{ color: cfg.color }} />
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────────────

export function AppPopupProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<PopupEntry | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const queueRef = useRef<PopupEntry[]>([]);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setPromptValue(next.type === 'prompt' ? (next.options.defaultValue || '') : '');
      setCurrent(next);
    } else {
      setCurrent(null);
    }
  }, []);

  const enqueue = useCallback((entry: PopupEntry) => {
    if (current) {
      queueRef.current.push(entry);
    } else {
      if (entry.type === 'prompt') setPromptValue(entry.options.defaultValue || '');
      setCurrent(entry);
    }
  }, [current]);

  const close = useCallback((value: any) => {
    if (current) {
      (current.resolve as (v: any) => void)(value);
    }
    setCurrent(null);
    setPromptValue('');
  }, [current]);

  // When current is cleared, show the next queued popup
  useEffect(() => {
    if (!current && queueRef.current.length > 0) {
      showNext();
    }
  }, [current, showNext]);

  const alert = useCallback((message: string, options: AlertOptions = {}): Promise<void> => {
    return new Promise<void>((resolve) => {
      enqueue({ type: 'alert', message, options, resolve });
    });
  }, [enqueue]);

  const confirm = useCallback((message: string, options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      enqueue({ type: 'confirm', message, options, resolve });
    });
  }, [enqueue]);

  const prompt = useCallback((message: string, options: PromptOptions = {}): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      enqueue({ type: 'prompt', message, options, resolve });
    });
  }, [enqueue]);

  const getTitle = () => {
    if (!current) return '';
    if (current.type === 'prompt') return current.options.title || 'Input';
    const opts = current.options as AlertOptions | ConfirmOptions;
    if (opts.title) return opts.title;
    switch (opts.variant) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return current.type === 'confirm' ? 'Confirm' : 'Notice';
    }
  };

  return (
    <AppPopupContext.Provider value={{ alert, confirm, prompt }}>
      {children}

      <AlertDialog
        open={!!current}
        onOpenChange={(open) => {
          if (!open) {
            if (current?.type === 'confirm') close(false);
            else if (current?.type === 'prompt') close(null);
            else close(undefined);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-foreground">
              {current?.type !== 'prompt' && (
                <VariantIcon variant={(current?.options as AlertOptions)?.variant} />
              )}
              {getTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">
              {current?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Prompt input */}
          {current?.type === 'prompt' && (
            <div className="px-0">
              <Input
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={(current.options as PromptOptions).placeholder || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    close(promptValue || null);
                  }
                }}
                className="border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              />
            </div>
          )}

          <AlertDialogFooter>
            {/* Alert: just OK */}
            {current?.type === 'alert' && (
              <AlertDialogAction
                onClick={() => close(undefined)}
                className="bg-primary hover:brightness-110 hover:shadow-md hover:shadow-primary/20 active:brightness-95 text-white transition-all"
              >
                {(current.options as AlertOptions).okLabel || 'OK'}
              </AlertDialogAction>
            )}

            {/* Confirm: Cancel + Confirm */}
            {current?.type === 'confirm' && (
              <>
                <AlertDialogCancel
                  onClick={() => close(false)}
                  className="text-foreground border-border hover:bg-secondary hover:border-primary/20 transition-all"
                >
                  {(current.options as ConfirmOptions).cancelLabel || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => close(true)}
                  className={
                    (current.options as ConfirmOptions).destructive
                      ? 'bg-destructive hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 active:brightness-95 text-white transition-all'
                      : 'bg-primary hover:brightness-110 hover:shadow-md hover:shadow-primary/20 active:brightness-95 text-white transition-all'
                  }
                >
                  {(current.options as ConfirmOptions).confirmLabel || 'Confirm'}
                </AlertDialogAction>
              </>
            )}

            {/* Prompt: Cancel + OK */}
            {current?.type === 'prompt' && (
              <>
                <AlertDialogCancel
                  onClick={() => close(null)}
                  className="text-foreground border-border hover:bg-secondary hover:border-primary/20 transition-all"
                >
                  {(current.options as PromptOptions).cancelLabel || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => close(promptValue || null)}
                  className="bg-primary hover:brightness-110 hover:shadow-md hover:shadow-primary/20 active:brightness-95 text-white transition-all"
                >
                  {(current.options as PromptOptions).confirmLabel || 'OK'}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPopupContext.Provider>
  );
}
