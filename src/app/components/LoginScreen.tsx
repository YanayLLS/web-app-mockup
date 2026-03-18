import { useState } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { ArrowRight, AlertCircle, CheckCircle2, Mail, Lock, User } from 'lucide-react';

function IconLogo() {
  return (
    <svg className="block size-10" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
      <path d={svgPaths.p3df5b20d} fill="currentColor" />
    </svg>
  );
}

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
}

export function LoginScreen({ onLogin, onSwitchToSignUp }: LoginScreenProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email, password);
    }, 500);
  };

  // Debug functions
  const debugFillValid = () => {
    setEmail('yanay@lls-ltd.com');
    setPassword('password123');
    setError('');
  };

  const debugShowEmailError = () => {
    setEmail('invalid-email');
    setStep('email');
    setError('Please enter a valid email address');
  };

  const debugShowPasswordError = () => {
    setEmail('test@example.com');
    setPassword('123');
    setStep('password');
    setError('Password must be at least 6 characters');
  };

  const debugShowLoginError = () => {
    setEmail('test@example.com');
    setPassword('wrongpassword');
    setStep('password');
    setError('Invalid email or password. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="mb-6 p-4 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/10" style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.12)' }}>
            <div className="text-primary">
              <IconLogo />
            </div>
          </div>
          <h1
            className="text-foreground mb-2"
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Frontline.io
          </h1>
          <p className="text-muted text-center" style={{ fontSize: 'var(--text-base)' }}>
            Welcome back! Sign in to continue
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}
        >
          {/* Progress Indicator */}
          <div className="flex gap-1 px-4 pt-4 sm:px-8 sm:pt-6">
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              step === 'email' ? 'bg-primary' : 'bg-primary/30'
            }`} />
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              step === 'password' ? 'bg-primary' : 'bg-border/60'
            }`} />
          </div>

          <div className="px-4 py-6 sm:p-8">
            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Mail size={20} />
                    </div>
                    <h2
                      className="text-foreground"
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      Enter your email
                    </h2>
                  </div>

                  <label
                    htmlFor="email"
                    className="block text-foreground mb-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="name@company.com"
                    autoFocus
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/15 rounded-xl">
                    <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Password Step */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Lock size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-foreground"
                        style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-weight-bold)',
                        }}
                      >
                        Enter your password
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setPassword('');
                          setError('');
                        }}
                        className="text-muted hover:text-primary transition-colors flex items-center gap-1.5 mt-1 max-w-full"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        <User size={13} className="shrink-0" />
                        <span className="truncate">{email}</span>
                      </button>
                    </div>
                  </div>

                  <label
                    htmlFor="password"
                    className="block text-foreground mb-2"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    autoFocus
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                  />

                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 mt-3 min-h-[44px] sm:min-h-0 transition-colors"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/15 rounded-xl">
                    <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:brightness-100 disabled:hover:shadow-none"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-6 px-4 py-4 sm:p-4 bg-card/60 border border-border/60 rounded-xl backdrop-blur-sm">
          <p
            className="text-muted mb-3"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Debug Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={debugFillValid}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary hover:border-[#11E874]/20 transition-all text-left flex items-center gap-2"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <CheckCircle2 size={14} className="text-[#0a9e4a] shrink-0" />
              Fill Valid Data
            </button>
            <button
              onClick={debugShowEmailError}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary hover:border-destructive/20 transition-all text-left flex items-center gap-2"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <AlertCircle size={14} className="text-destructive shrink-0" />
              Email Error
            </button>
            <button
              onClick={debugShowPasswordError}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary hover:border-destructive/20 transition-all text-left flex items-center gap-2"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <AlertCircle size={14} className="text-destructive shrink-0" />
              Password Error
            </button>
            <button
              onClick={debugShowLoginError}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary hover:border-destructive/20 transition-all text-left flex items-center gap-2"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <AlertCircle size={14} className="text-destructive shrink-0" />
              Login Error
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-muted mt-6" style={{ fontSize: 'var(--text-sm)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary hover:text-primary/80 transition-colors min-h-[44px]"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
