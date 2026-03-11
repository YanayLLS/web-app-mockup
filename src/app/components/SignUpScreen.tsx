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
  const [hasWorkspaces, setHasWorkspaces] = useState(true); // For debug

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Create account
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 500);
  };

  const handleCompleteSignUp = () => {
    onSignUp(email, password, fullName);
  };

  // Debug functions
  const debugFillValid = () => {
    setEmail('newuser@company.com');
    setFullName('John Doe');
    setPassword('password123');
    setConfirmPassword('password123');
    setError('');
  };

  const debugShowEmailError = () => {
    setEmail('invalid-email');
    setStep('email');
    setError('Please enter a valid email address');
  };

  const debugShowPasswordMismatch = () => {
    setEmail('test@example.com');
    setFullName('Test User');
    setPassword('password123');
    setConfirmPassword('different');
    setStep('details');
    setError('Passwords do not match');
  };

  const debugNoWorkspaces = () => {
    setHasWorkspaces(false);
    setStep('success');
  };

  const debugWithWorkspaces = () => {
    setHasWorkspaces(true);
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="mb-6 p-4 bg-primary/10 rounded-[var(--radius-lg)] backdrop-blur-sm">
            <div className="text-primary">
              <IconLogo />
            </div>
          </div>
          <h1 
            className="text-foreground mb-2" 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Frontline.io
          </h1>
          <p 
            className="text-muted text-center"
            style={{ 
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Create your account
          </p>
        </div>

        {/* Sign Up Card */}
        <div 
          className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden"
          style={{ boxShadow: 'var(--elevation-lg)' }}
        >
          {/* Progress Indicator */}
          <div className="flex">
            <div 
              className={`flex-1 h-1 transition-all duration-300 ${
                step === 'email' ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
            <div 
              className={`flex-1 h-1 transition-all duration-300 ${
                step === 'details' ? 'bg-primary' : step === 'success' ? 'bg-primary/30' : 'bg-border'
              }`}
            />
            <div 
              className={`flex-1 h-1 transition-all duration-300 ${
                step === 'success' ? 'bg-primary' : 'bg-border'
              }`}
            />
          </div>

          <div className="px-4 py-6 sm:p-8">
            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-[var(--radius)] text-primary">
                      <Mail size={20} />
                    </div>
                    <h2
                      className="text-foreground"
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontFamily: 'var(--font-family)'
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
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Work email address
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
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-[var(--radius)] text-foreground outline-none focus:border-primary transition-colors text-[16px]"
                    style={{
                      fontFamily: 'var(--font-family)'
                    }}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-[var(--radius)]">
                    <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                    <p
                      className="text-error"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              </form>
            )}

            {/* Details Step */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-[var(--radius)] text-primary">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-foreground"
                        style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-weight-bold)',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        Create your account
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setError('');
                        }}
                        className="text-muted hover:text-primary transition-colors flex items-center gap-1 mt-1 max-w-full"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-family)'
                        }}
                      >
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{email}</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label
                      htmlFor="fullName"
                      className="block text-foreground mb-2"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError('');
                      }}
                      placeholder="John Doe"
                      autoFocus
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-[var(--radius)] text-foreground outline-none focus:border-primary transition-colors text-[16px]"
                      style={{
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-foreground mb-2"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family)'
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
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-[var(--radius)] text-foreground outline-none focus:border-primary transition-colors text-[16px]"
                      style={{
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-foreground mb-2"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Re-enter your password"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-[var(--radius)] text-foreground outline-none focus:border-primary transition-colors text-[16px]"
                      style={{
                        fontFamily: 'var(--font-family)'
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-[var(--radius)]">
                    <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                    <p
                      className="text-error"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError('');
                    }}
                    className="px-4 py-3 min-h-[44px] bg-background border-2 border-border rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
                    <PartyPopper size={40} className="text-success" />
                  </div>
                  
                  <h2 
                    className="text-foreground mb-3"
                    style={{ 
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Account created successfully!
                  </h2>
                  
                  <p 
                    className="text-muted mb-6"
                    style={{ 
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Welcome to Frontline.io, {fullName}
                  </p>

                  {/* Conditional message based on workspace invitations */}
                  {hasWorkspaces ? (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-[var(--radius)] text-left">
                      <div className="flex items-start gap-3">
                        <Info size={20} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p 
                            className="text-foreground mb-1"
                            style={{ 
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-semibold)',
                              fontFamily: 'var(--font-family)'
                            }}
                          >
                            You have workspace invitations
                          </p>
                          <p 
                            className="text-muted"
                            style={{ 
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family)'
                            }}
                          >
                            After signing in, you'll be able to select and join your invited workspaces.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-[var(--radius)] text-left">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
                        <div>
                          <p 
                            className="text-foreground mb-1"
                            style={{ 
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-semibold)',
                              fontFamily: 'var(--font-family)'
                            }}
                          >
                            No workspace invitations yet
                          </p>
                          <p 
                            className="text-muted"
                            style={{ 
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family)'
                            }}
                          >
                            You'll need to be invited to a workspace to access Frontline.io. Contact your workspace administrator to request an invitation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCompleteSignUp}
                  className="w-full px-4 py-3 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Continue to Sign In
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-6 px-4 py-4 sm:p-4 bg-card/50 border border-border rounded-[var(--radius)] backdrop-blur-sm">
          <p
            className="text-muted mb-3"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Debug Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={debugFillValid}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <CheckCircle2 size={14} className="inline mr-2 text-success" />
              Fill Valid Data
            </button>
            <button
              onClick={debugShowEmailError}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle size={14} className="inline mr-2 text-error" />
              Email Error
            </button>
            <button
              onClick={debugShowPasswordMismatch}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle size={14} className="inline mr-2 text-error" />
              Password Mismatch
            </button>
            <button
              onClick={debugNoWorkspaces}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle size={14} className="inline mr-2 text-warning" />
              No Workspaces
            </button>
            <button
              onClick={debugWithWorkspaces}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left col-span-2"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <CheckCircle2 size={14} className="inline mr-2 text-success" />
              Show Workspaces (2)
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p
          className="text-center text-muted mt-6"
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family)'
          }}
        >
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline min-h-[44px]"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
