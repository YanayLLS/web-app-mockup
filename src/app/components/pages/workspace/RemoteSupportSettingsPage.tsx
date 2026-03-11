import { useState } from 'react';
import { Headphones, Globe, Clock, Shield } from 'lucide-react';

export function RemoteSupportSettingsPage() {
  const [enableRemoteSupport, setEnableRemoteSupport] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [allowFileTransfer, setAllowFileTransfer] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
          fontFamily: 'var(--font-family)'
        }}>
          Remote Support Settings
        </h1>
        <p className="text-muted" style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)'
        }}>
          Configure remote support and assistance features
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-6">
          {/* Enable Remote Support */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-2" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Enable Remote Support
                </h3>
                <p className="text-muted mb-4" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Allow team members to request and provide remote assistance
                </p>
                <label className="flex items-center gap-3 cursor-pointer w-fit min-h-[44px]">
                  <div className={`w-12 h-6 rounded-full transition-colors ${enableRemoteSupport ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-5 h-5 rounded-full bg-card transition-transform transform ${enableRemoteSupport ? 'translate-x-7' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableRemoteSupport}
                    onChange={(e) => setEnableRemoteSupport(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-foreground" style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    {enableRemoteSupport ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-2" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Session Timeout
                </h3>
                <p className="text-muted mb-4" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Automatically end inactive remote support sessions
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-24 px-3 py-2 bg-input-background border border-border rounded-[var(--radius)] text-foreground"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}
                    min="5"
                    max="120"
                  />
                  <span className="text-muted" style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}>
                    minutes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-[var(--radius)] p-4 sm:p-6" style={{ boxShadow: 'var(--elevation-sm)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground mb-2" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Security Settings
                </h3>
                <p className="text-muted mb-4" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Configure security and permission settings for remote sessions
                </p>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-foreground" style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      Require user approval before starting session
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={allowFileTransfer}
                      onChange={(e) => setAllowFileTransfer(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-foreground" style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)'
                    }}>
                      Allow file transfers during sessions
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)'
            }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
