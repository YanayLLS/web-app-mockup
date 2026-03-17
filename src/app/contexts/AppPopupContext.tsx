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

function VariantIcon({ variant }: { variant?: PopupVariant }) {
  const size = 20;
  switch (variant) {
    case 'success':
      return <CheckCircle2 size={size} className="text-[#11E874] shrink-0" />;
    case 'warning':
      return <AlertTriangle size={size} className="text-[#F5A623] shrink-0" />;
    case 'error':
      return <XCircle size={size} className="text-[#FF1F1F] shrink-0" />;
    case 'info':
    default:
      return <Info size={size} className="text-[#2F80ED] shrink-0" />;
  }
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
            <AlertDialogTitle className="flex items-center gap-2 text-[#36415D]">
              {current?.type !== 'prompt' && (
                <VariantIcon variant={(current?.options as AlertOptions)?.variant} />
              )}
              {getTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#36415D]/80 text-sm whitespace-pre-wrap">
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
                className="border-[#C2C9DB] focus-visible:border-[#2E80ED]"
              />
            </div>
          )}

          <AlertDialogFooter>
            {/* Alert: just OK */}
            {current?.type === 'alert' && (
              <AlertDialogAction
                onClick={() => close(undefined)}
                className="bg-[#2F80ED] hover:bg-[#82B3F4] active:bg-[#5999F1] text-white"
              >
                {(current.options as AlertOptions).okLabel || 'OK'}
              </AlertDialogAction>
            )}

            {/* Confirm: Cancel + Confirm */}
            {current?.type === 'confirm' && (
              <>
                <AlertDialogCancel
                  onClick={() => close(false)}
                  className="text-[#36415D] border-[#C2C9DB]"
                >
                  {(current.options as ConfirmOptions).cancelLabel || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => close(true)}
                  className={
                    (current.options as ConfirmOptions).destructive
                      ? 'bg-[#FF1F1F] hover:bg-[#FF7979] active:bg-[#FF4C4C] text-white'
                      : 'bg-[#2F80ED] hover:bg-[#82B3F4] active:bg-[#5999F1] text-white'
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
                  className="text-[#36415D] border-[#C2C9DB]"
                >
                  {(current.options as PromptOptions).cancelLabel || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => close(promptValue || null)}
                  className="bg-[#2F80ED] hover:bg-[#82B3F4] active:bg-[#5999F1] text-white"
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
