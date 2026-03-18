import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

interface AppLoginPageProps {
  onLogin: () => void;
}

export function AppLoginPage({ onLogin }: AppLoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState<string | null>(null);

  const handleLogin = () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    // Mock login - any password works
    onLogin();
  };

  const errorDialogs = [
    { id: 'sso', title: 'SSO Feedback Missing', message: 'No feedback from your provider. Please contact your support.' },
    { id: 'internet', title: 'No internet connection', message: 'Unable to connect. Please check your internet connection.' },
    { id: 'access', title: 'SSO Access Denied', message: 'Access is not approved. Check your credentials or contact your support.' },
    { id: 'server', title: 'Server Unresponsive', message: 'No response from server system. Try again later or contact support.' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#36415D' }}>
      {/* Main login card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm bg-card rounded-lg p-5 sm:p-8" style={{ boxShadow: 'var(--elevation-lg)', maxWidth: 'min(384px, calc(100vw - 32px))' }}>
          {/* Back button + Title */}
          <div className="flex items-center gap-3 mb-6">
            <button className="p-2 text-muted hover:text-foreground rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Go back">
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-foreground" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h2)' }}>
              Welcome
            </h2>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full h-12 pl-10 pr-10 rounded-lg bg-card border-2 border-input outline-none text-foreground placeholder:text-muted focus:border-primary transition-colors"
                style={{ fontSize: '16px' }}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'password-error' : undefined}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {error && (
              <p id="password-error" className="text-xs text-destructive mt-1.5 flex items-center gap-1" role="alert">
                <AlertCircle className="size-3" /> {error}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right mb-4">
            <button className="text-sm text-muted hover:text-foreground transition-colors min-h-[44px]">
              Forgot Password?
            </button>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 min-h-[48px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Login
          </button>

          {/* Bottom links */}
          <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
            <button className="text-sm text-foreground hover:text-primary transition-colors min-h-[44px] flex items-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Create account
            </button>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors min-h-[44px] flex items-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              or continue as guest
            </button>
          </div>
        </div>
      </div>

      {/* Error states preview (at bottom for demo) */}
      <div className="p-4 sm:p-6" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <p className="text-xs text-white/50 text-center mb-3">
          Error dialog previews (click to test):
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {errorDialogs.map((d) => (
            <button
              key={d.id}
              onClick={() => setShowErrorDialog(d.id)}
              className="px-3 py-2 min-h-[36px] bg-white/10 text-white/70 rounded-full text-xs hover:bg-white/20 transition-colors"
            >
              {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* Error dialog overlay */}
      {showErrorDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={() => setShowErrorDialog(null)}>
          <div
            className="w-full bg-card rounded-lg p-6 text-center"
            style={{ boxShadow: 'var(--elevation-lg)', maxWidth: 'min(320px, calc(100vw - 32px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-h4)' }}>
              {errorDialogs.find(d => d.id === showErrorDialog)?.title}
            </h3>
            <p className="text-sm text-muted mb-4">
              {errorDialogs.find(d => d.id === showErrorDialog)?.message}
            </p>
            <button
              onClick={() => setShowErrorDialog(null)}
              className="px-8 py-2.5 min-h-[44px] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              style={{ fontWeight: 'var(--font-weight-semibold)' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
