import { useState } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Mail, User, PartyPopper, Info } from 'lucide-react';

function IconLogo() {
  return (
    <svg className="block size-10" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
      <path d={svgPaths.p3df5b20d} fill="currentColor" />
    </svg>
  );
}

interface SignUpScreenProps {
  onSignUp: (email: string, password: string, fullName: string) => void;
  onSwitchToLogin: () => void;
}

export function SignUpScreen({ onSignUp, onSwitchToLogin }: SignUpScreenProps) {
  const [step, setStep] = useState<'email' | 'details' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(true);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    if (!password) { setError('Please enter a password'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep('success'); }, 500);
  };

  const handleCompleteSignUp = () => { onSignUp(email, password, fullName); };

  // Debug
  const debugFillValid = () => { setEmail('newuser@company.com'); setFullName('John Doe'); setPassword('password123'); setConfirmPassword('password123'); setError(''); };
  const debugShowEmailError = () => { setEmail('invalid-email'); setStep('email'); setError('Please enter a valid email address'); };
  const debugShowPasswordMismatch = () => { setEmail('test@example.com'); setFullName('Test User'); setPassword('password123'); setConfirmPassword('different'); setStep('details'); setError('Passwords do not match'); };
  const debugNoWorkspaces = () => { setHasWorkspaces(false); setStep('success'); };
  const debugWithWorkspaces = () => { setHasWorkspaces(true); setStep('success'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="mb-6 p-4 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/10" style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.12)' }}>
            <div className="text-primary"><IconLogo /></div>
          </div>
          <h1 className="text-foreground mb-2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Frontline.io
          </h1>
          <p className="text-muted text-center" style={{ fontSize: 'var(--text-base)' }}>
            Create your account
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}>
          {/* Progress */}
          <div className="flex gap-1 px-4 pt-4 sm:px-8 sm:pt-6">
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === 'email' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === 'details' ? 'bg-primary' : step === 'success' ? 'bg-primary/30' : 'bg-border/60'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === 'success' ? 'bg-primary' : 'bg-border/60'}`} />
          </div>

          <div className="px-4 py-6 sm:p-8">
            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Mail size={20} /></div>
                    <h2 className="text-foreground" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}>
                      Enter your email
                    </h2>
                  </div>
                  <label htmlFor="signup-email" className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Work email address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="name@company.com"
                    autoFocus
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/15 rounded-xl">
                    <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Details Step */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><User size={20} /></div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-foreground" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}>
                        Create your account
                      </h2>
                      <button
                        type="button"
                        onClick={() => { setStep('email'); setError(''); }}
                        className="text-muted hover:text-primary transition-colors flex items-center gap-1.5 mt-1 max-w-full"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        <Mail size={13} className="shrink-0" />
                        <span className="truncate">{email}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Full name
                      </label>
                      <input
                        id="fullName" type="text" value={fullName} autoFocus
                        onChange={(e) => { setFullName(e.target.value); setError(''); }}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-password" className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Password
                      </label>
                      <input
                        id="signup-password" type="password" value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword" type="password" value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all text-[16px]"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/15 rounded-xl">
                    <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); }}
                    className="px-4 py-3 min-h-[44px] bg-card border border-border rounded-xl text-foreground hover:bg-secondary hover:border-primary/20 transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 min-h-[44px] bg-primary text-white rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:brightness-100 disabled:hover:shadow-none"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {isLoading ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</>
                    ) : (
                      <>Continue <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#11E874]/10 rounded-2xl mb-6" style={{ boxShadow: '0 8px 24px rgba(17,232,116,0.1)' }}>
                    <PartyPopper size={36} className="text-[#0a9e4a]" />
                  </div>

                  <h2 className="text-foreground mb-3" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                    Account created!
                  </h2>
                  <p className="text-muted mb-6" style={{ fontSize: 'var(--text-base)' }}>
                    Welcome to Frontline.io, {fullName}
                  </p>

                  {hasWorkspaces ? (
                    <div className="p-4 bg-primary/[0.04] border border-primary/15 rounded-xl text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Info size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                            You have workspace invitations
                          </p>
                          <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                            After signing in, you'll be able to select and join your invited workspaces.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F59E0B]/[0.04] border border-[#F59E0B]/15 rounded-xl text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle size={16} className="text-[#F59E0B]" />
                        </div>
                        <div>
                          <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                            No workspace invitations yet
                          </p>
                          <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                            You'll need to be invited to a workspace. Contact your administrator to request an invitation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCompleteSignUp}
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}
                >
                  Continue to Sign In <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-6 px-4 py-4 sm:p-4 bg-card/60 border border-border/60 rounded-xl backdrop-blur-sm">
          <p className="text-muted mb-3" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Debug Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { fn: debugFillValid, icon: <CheckCircle2 size={14} className="text-[#0a9e4a] shrink-0" />, label: 'Fill Valid Data', hoverBorder: 'hover:border-[#11E874]/20' },
              { fn: debugShowEmailError, icon: <AlertCircle size={14} className="text-destructive shrink-0" />, label: 'Email Error', hoverBorder: 'hover:border-destructive/20' },
              { fn: debugShowPasswordMismatch, icon: <AlertCircle size={14} className="text-destructive shrink-0" />, label: 'Password Mismatch', hoverBorder: 'hover:border-destructive/20' },
              { fn: debugNoWorkspaces, icon: <AlertCircle size={14} className="text-[#F59E0B] shrink-0" />, label: 'No Workspaces', hoverBorder: 'hover:border-[#F59E0B]/20' },
            ].map(({ fn, icon, label, hoverBorder }) => (
              <button
                key={label}
                onClick={fn}
                className={`px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary ${hoverBorder} transition-all text-left flex items-center gap-2`}
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {icon} {label}
              </button>
            ))}
            <button
              onClick={debugWithWorkspaces}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary hover:border-[#11E874]/20 transition-all text-left flex items-center gap-2 col-span-2"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              <CheckCircle2 size={14} className="text-[#0a9e4a] shrink-0" /> Show Workspaces (2)
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-muted mt-6" style={{ fontSize: 'var(--text-sm)' }}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-primary hover:text-primary/80 transition-colors min-h-[44px]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
