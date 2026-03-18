import { Headphones, Clock, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspaceSettings } from '../../../contexts/WorkspaceContext';

export function RemoteSupportSettingsPage() {
  const { settings, updateSettings } = useWorkspaceSettings();
  const { enableRemoteSupport, requireApproval, sessionTimeout, allowFileTransfer } = settings;

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5">
        <h1 className="text-foreground mb-1" style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Remote Support Settings
        </h1>
        <p className="text-muted/70" style={{ fontSize: 'var(--text-sm)' }}>
          Configure remote support and assistance features
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar">
        <div className="max-w-3xl space-y-5">

          {/* Enable Remote Support */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h3 className="text-foreground mb-1 flex items-center gap-2 text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              <span className="w-1 h-4 rounded-full bg-primary" />
              Enable Remote Support
            </h3>
            <p className="text-xs text-muted mb-4 ml-3">
              Allow team members to request and provide remote assistance
            </p>
            <label className="flex items-center gap-3 cursor-pointer w-fit p-3 rounded-lg hover:bg-secondary/30 transition-colors -ml-1">
              <input
                type="checkbox"
                checked={enableRemoteSupport}
                onChange={(e) => updateSettings({ enableRemoteSupport: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary accent-[#2F80ED]"
              />
              <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Remote support is {enableRemoteSupport ? 'enabled' : 'disabled'}
              </span>
              {enableRemoteSupport && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#11E874]/10 text-[#0a9e4a]" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Active
                </span>
              )}
            </label>
          </div>

          {/* Session Timeout */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h3 className="text-foreground mb-1 flex items-center gap-2 text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              <span className="w-1 h-4 rounded-full bg-[#F59E0B]" />
              Session Timeout
            </h3>
            <p className="text-xs text-muted mb-4 ml-3">
              Automatically end inactive remote support sessions
            </p>
            <div className="flex items-center gap-3 ml-3">
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => updateSettings({ sessionTimeout: Math.max(5, Math.min(120, parseInt(e.target.value) || 5)) })}
                className="w-20 px-3 py-2.5 bg-card border border-border rounded-lg text-foreground text-center outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
                min="5"
                max="120"
              />
              <span className="text-sm text-muted">minutes</span>
              <span className="text-[10px] text-muted/50 ml-2">(5–120)</span>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-sm transition-shadow">
            <h3 className="text-foreground mb-1 flex items-center gap-2 text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              <span className="w-1 h-4 rounded-full bg-[#FF1F1F]" />
              Security Settings
            </h3>
            <p className="text-xs text-muted mb-4 ml-3">
              Configure security and permission settings for remote sessions
            </p>

            <div className="space-y-1 ml-1">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => updateSettings({ requireApproval: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary accent-[#2F80ED]"
                />
                <div>
                  <span className="text-sm text-foreground block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Require user approval before starting session
                  </span>
                  <span className="text-[10px] text-muted">Users must accept before an expert can view their screen</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <input
                  type="checkbox"
                  checked={allowFileTransfer}
                  onChange={(e) => updateSettings({ allowFileTransfer: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary accent-[#2F80ED]"
                />
                <div>
                  <span className="text-sm text-foreground block" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Allow file transfers during sessions
                  </span>
                  <span className="text-[10px] text-muted">Participants can send and receive files in-call</span>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => toast.success('Remote support settings saved')}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
