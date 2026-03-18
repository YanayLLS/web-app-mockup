import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, ChevronDown, Loader2, AlertTriangle, Monitor } from 'lucide-react';
import { useState } from 'react';

type LaunchState = 'normal' | 'loading' | 'error';

const procedureNames: Record<string, string> = {
  'p1': 'Routine Maintenance for High-Volume Printing Equipment',
  'p2': 'Engine Calibration Procedure',
  'sp1': 'Routine Maintenance for High-Volume Printing',
  'sp2': 'Belt Replacement Guide',
};

export function AppProcedureLaunchPage() {
  const navigate = useNavigate();
  const { projectId, procedureId } = useParams();
  const [launchState, setLaunchState] = useState<LaunchState>('normal');

  const procedureName = procedureNames[procedureId || ''] || 'Procedure';

  const handleLaunchOnDevice = () => {
    setLaunchState('loading');
    // Simulate loading then error
    setTimeout(() => {
      setLaunchState('error');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between bg-card border-b border-border">
        <button
          onClick={() => navigate(`/app/project/${projectId}/procedure/${procedureId}`)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors min-h-[44px]"
        >
          <ArrowLeft className="size-5" />
          <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>Return</span>
        </button>

        <button className="flex items-center gap-2 text-foreground hover:bg-secondary px-3 py-1.5 min-h-[44px] rounded-lg transition-colors">
          <Flag className="size-4" />
          <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>English</span>
          <ChevronDown className="size-3.5 text-muted" />
        </button>
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        <h1
          className="text-foreground text-center mb-10 max-w-xl px-4"
          style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)' }}
        >
          {procedureName}
        </h1>

        <div className="w-full space-y-3" style={{ maxWidth: 'min(384px, calc(100vw - 32px))' }}>
          <button
            className="w-full py-3.5 min-h-[48px] border-2 border-primary text-primary rounded-lg flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Run in 2D
          </button>

          <button
            className="w-full py-3.5 min-h-[48px] bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Run in 3D
          </button>
        </div>

        <button
          onClick={handleLaunchOnDevice}
          className="mt-8 flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors min-h-[44px]"
        >
          <Monitor className="size-4" />
          <span>Launch on another device</span>
        </button>
      </div>

      {/* Loading bottom sheet */}
      {launchState === 'loading' && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setLaunchState('normal')} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-elevation-lg z-50 p-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Searching for devices...
              </p>
            </div>
          </div>
        </>
      )}

      {/* Error bottom sheet */}
      {launchState === 'error' && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setLaunchState('normal')} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-elevation-lg z-50 p-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <p className="text-sm text-foreground text-center max-w-xs leading-relaxed px-4">
                We couldn't find another device. Make sure you are logged in and the application is open on another device.
              </p>
              <button
                onClick={() => {
                  setLaunchState('loading');
                  setTimeout(() => setLaunchState('error'), 2000);
                }}
                className="px-6 py-2.5 min-h-[44px] bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                style={{ fontWeight: 'var(--font-weight-semibold)' }}
              >
                Try again
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
