import { Key, CheckCircle2, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const providers = [
  { name: 'Okta', color: '#007DC1', initial: 'Ok' },
  { name: 'Azure AD', color: '#0078D4', initial: 'Az' },
  { name: 'Google Workspace', color: '#4285F4', initial: 'G' },
  { name: 'OneLogin', color: '#24292F', initial: 'OL' },
  { name: 'Auth0', color: '#EB5424', initial: 'A0' },
  { name: 'PingIdentity', color: '#B3282D', initial: 'Pi' },
];

export function SSOPage() {
  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          SSO (Single Sign-On)
        </h1>
        <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
          Configure single sign-on for your workspace
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-5">

          {/* SSO Status Banner */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-[#11E874]/20 bg-[#11E874]/[0.04]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(17,232,116,0.12)', color: '#0a9e4a' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                SSO is Enabled
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Your workspace is configured to use single sign-on authentication
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-[10px] bg-[#11E874]/15 text-[#0a9e4a] shrink-0" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Active
            </div>
          </div>

          {/* SAML Configuration */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-5 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              SAML 2.0 Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground mb-1.5 text-xs" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Identity Provider URL
                </label>
                <input
                  type="text"
                  placeholder="https://idp.example.com/sso/saml"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  style={{ fontSize: 'var(--text-sm)' }}
                />
              </div>
              <div>
                <label className="block text-foreground mb-1.5 text-xs" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  Entity ID
                </label>
                <input
                  type="text"
                  placeholder="https://workspace.example.com"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  style={{ fontSize: 'var(--text-sm)' }}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-foreground mb-1.5 text-xs" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  <Key size={12} className="text-muted" />
                  X.509 Certificate
                </label>
                <textarea
                  placeholder="Paste your certificate here..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          {/* Supported Providers */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-foreground mb-1 flex items-center gap-2" style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Supported Identity Providers
            </h2>
            <p className="text-muted text-xs mb-4 ml-3">
              Select your identity provider to see setup instructions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {providers.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => toast.success(`${provider.name} setup guide opened`)}
                  className="group flex items-center gap-3 px-4 py-3.5 border border-border rounded-xl hover:border-primary/25 hover:bg-primary/[0.02] hover:shadow-sm transition-all text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px]"
                    style={{ background: provider.color, fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {provider.initial}
                  </div>
                  <span className="flex-1 text-foreground text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {provider.name}
                  </span>
                  <ExternalLink size={14} className="text-muted/40 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => toast.success('SSO configuration saved')}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Shield size={15} />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
