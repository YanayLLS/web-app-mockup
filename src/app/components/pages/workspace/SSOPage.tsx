import { Cloud, Key, CheckCircle2 } from 'lucide-react';

export function SSOPage() {
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          SSO (Single Sign-On)
        </h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
          Configure single sign-on for your workspace
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-6">
          {/* SSO Status */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-2" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  SSO is Enabled
                </h3>
                <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                  Your workspace is configured to use single sign-on authentication
                </p>
              </div>
            </div>
          </div>

          {/* SAML Configuration */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              SAML 2.0 Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Identity Provider URL
                </label>
                <input
                  type="text"
                  placeholder="https://idp.example.com/sso/saml"
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted"
                  style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Entity ID
                </label>
                <input
                  type="text"
                  placeholder="https://workspace.example.com"
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted"
                  style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2" style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  X.509 Certificate
                </label>
                <textarea
                  placeholder="Paste your certificate here..."
                  rows={4}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground placeholder:text-muted resize-none font-mono"
                  style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Supported Providers */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <h2 className="text-foreground mb-4" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Supported Identity Providers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Okta', 'Azure AD', 'Google Workspace', 'OneLogin', 'Auth0', 'PingIdentity'].map((provider) => (
                <div key={provider} className="flex items-center gap-2 px-4 py-3 min-h-[44px] border border-border rounded-[var(--radius)] hover:border-primary/50 transition-colors">
                  <Cloud size={18} className="text-primary" />
                  <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                    {provider}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
