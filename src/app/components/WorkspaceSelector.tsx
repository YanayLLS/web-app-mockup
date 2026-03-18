import { useState } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { Building2, Check, X, AlertCircle, CheckCircle2, Users, Mail } from 'lucide-react';

function IconLogo() {
  return (
    <svg className="block size-10" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
      <path d={svgPaths.p3df5b20d} fill="currentColor" />
    </svg>
  );
}

interface Workspace {
  id: string;
  name: string;
  memberCount: number;
  invitedBy?: string;
  isJoined: boolean;
}

interface WorkspaceSelectorProps {
  userEmail: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onDeclineInvitation: (workspaceId: string) => void;
}

export function WorkspaceSelector({ userEmail, onSelectWorkspace, onDeclineInvitation }: WorkspaceSelectorProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'ws-1', name: 'Acme Manufacturing', memberCount: 127, invitedBy: 'Sarah Chen', isJoined: true },
    { id: 'ws-2', name: 'Global Logistics Co.', memberCount: 89, invitedBy: 'Michael Rodriguez', isJoined: false },
    { id: 'ws-3', name: 'TechCorp Industries', memberCount: 45, invitedBy: 'James Wilson', isJoined: false },
  ]);

  const joinedWorkspaces = workspaces.filter(w => w.isJoined);
  const pendingInvitations = workspaces.filter(w => !w.isJoined);

  const handleSelectWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;
    if (workspace.isJoined) {
      setIsLoading(true);
      setTimeout(() => { onSelectWorkspace(workspaceId); }, 300);
    } else {
      setSelectedWorkspace(workspaceId);
    }
  };

  const handleJoinWorkspace = () => {
    if (!selectedWorkspace) return;
    setIsLoading(true);
    setTimeout(() => {
      setWorkspaces(prev => prev.map(w => w.id === selectedWorkspace ? { ...w, isJoined: true } : w));
      onSelectWorkspace(selectedWorkspace);
    }, 500);
  };

  const handleDecline = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    onDeclineInvitation(workspaceId);
    if (selectedWorkspace === workspaceId) setSelectedWorkspace(null);
  };

  // Debug
  const debugNoWorkspaces = () => { setWorkspaces([]); };
  const debugOnlyJoined = () => { setWorkspaces([{ id: 'ws-1', name: 'Acme Manufacturing', memberCount: 127, isJoined: true }]); };
  const debugOnlyInvited = () => { setWorkspaces([{ id: 'ws-2', name: 'Global Logistics Co.', memberCount: 89, invitedBy: 'Michael Rodriguez', isJoined: false }]); };
  const debugMixed = () => {
    setWorkspaces([
      { id: 'ws-1', name: 'Acme Manufacturing', memberCount: 127, isJoined: true },
      { id: 'ws-2', name: 'Global Logistics Co.', memberCount: 89, invitedBy: 'Michael Rodriguez', isJoined: false },
      { id: 'ws-3', name: 'TechCorp Industries', memberCount: 45, invitedBy: 'James Wilson', isJoined: false },
    ]);
  };

  const wsColors = ['#2F80ED', '#8B5CF6', '#F59E0B', '#11E874', '#E91E63'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-[540px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="mb-6 p-4 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/10" style={{ boxShadow: '0 8px 32px rgba(47,128,237,0.12)' }}>
            <div className="text-primary"><IconLogo /></div>
          </div>
          <h1 className="text-foreground mb-2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Select a workspace
          </h1>
          <div className="flex items-center gap-1.5 text-muted">
            <Mail size={14} />
            <span style={{ fontSize: 'var(--text-base)' }}>{userEmail}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="px-4 py-6 sm:p-8">
            {workspaces.length === 0 ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background: 'linear-gradient(135deg, rgba(47,128,237,0.08), rgba(47,128,237,0.03))', border: '1px solid rgba(47,128,237,0.1)', boxShadow: '0 8px 32px rgba(47,128,237,0.06)' }}>
                  <Building2 size={28} className="text-primary/40" />
                </div>
                <h3 className="text-[15px] text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  No workspaces available
                </h3>
                <p className="text-xs text-muted max-w-[300px] mx-auto leading-relaxed">
                  You need to be invited to a workspace to access Frontline.io. Contact your workspace administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Joined Workspaces */}
                {joinedWorkspaces.length > 0 && (
                  <div>
                    <h3 className="text-[10px] text-muted uppercase tracking-wider mb-3 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      <span className="w-1 h-3.5 rounded-full bg-[#11E874]" />
                      Your Workspaces
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {joinedWorkspaces.map((workspace, i) => {
                        const color = wsColors[i % wsColors.length];
                        return (
                          <button
                            key={workspace.id}
                            type="button"
                            onClick={() => handleSelectWorkspace(workspace.id)}
                            disabled={isLoading}
                            className="w-full p-4 min-h-[44px] border border-border rounded-xl hover:border-primary/40 hover:shadow-md bg-card transition-all text-left disabled:opacity-50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm shrink-0" style={{ backgroundColor: color, fontWeight: 'var(--font-weight-bold)' }}>
                                {workspace.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  {workspace.name}
                                </h4>
                                <p className="text-xs text-muted">{workspace.memberCount} members</p>
                              </div>
                              {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-[#11E874]/10 flex items-center justify-center text-[#0a9e4a] group-hover:bg-[#11E874]/20 transition-colors">
                                  <Check size={16} />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div>
                    <h3 className="text-[10px] text-muted uppercase tracking-wider mb-3 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      <span className="w-1 h-3.5 rounded-full bg-[#F59E0B]" />
                      Pending Invitations
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {pendingInvitations.map((workspace, i) => {
                        const color = wsColors[(joinedWorkspaces.length + i) % wsColors.length];
                        const isSelected = selectedWorkspace === workspace.id;
                        return (
                          <div
                            key={workspace.id}
                            className={`p-4 border rounded-xl transition-all ${
                              isSelected ? 'border-primary/40 bg-primary/[0.03] shadow-sm' : 'border-border bg-card'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm shrink-0" style={{ backgroundColor: color, fontWeight: 'var(--font-weight-bold)', opacity: 0.8 }}>
                                {workspace.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  {workspace.name}
                                </h4>
                                <p className="text-xs text-muted">
                                  {workspace.memberCount} members · Invited by {workspace.invitedBy}
                                </p>

                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => { setSelectedWorkspace(workspace.id); setTimeout(() => handleJoinWorkspace(), 100); }}
                                    disabled={isLoading}
                                    className="px-3.5 py-2 min-h-[44px] bg-primary text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
                                  >
                                    {isLoading && selectedWorkspace === workspace.id ? (
                                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining...</>
                                    ) : (
                                      <><Check size={15} />Join</>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDecline(workspace.id)}
                                    disabled={isLoading}
                                    className="px-3.5 py-2 min-h-[44px] bg-card border border-border rounded-lg hover:bg-secondary hover:border-destructive/20 transition-all flex items-center gap-1.5 disabled:opacity-50 text-muted hover:text-destructive"
                                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                                  >
                                    <X size={15} /> Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
              { fn: debugNoWorkspaces, icon: <AlertCircle size={14} className="text-destructive shrink-0" />, label: 'No Workspaces', hover: 'hover:border-destructive/20' },
              { fn: debugOnlyJoined, icon: <CheckCircle2 size={14} className="text-[#0a9e4a] shrink-0" />, label: 'Only Joined (1)', hover: 'hover:border-[#11E874]/20' },
              { fn: debugOnlyInvited, icon: <AlertCircle size={14} className="text-[#F59E0B] shrink-0" />, label: 'Only Invited (1)', hover: 'hover:border-[#F59E0B]/20' },
              { fn: debugMixed, icon: <CheckCircle2 size={14} className="text-primary shrink-0" />, label: 'Mixed (3)', hover: 'hover:border-primary/20' },
            ].map(({ fn, icon, label, hover }) => (
              <button
                key={label}
                onClick={fn}
                className={`px-3 py-2 min-h-[44px] bg-background border border-border rounded-lg hover:bg-secondary ${hover} transition-all text-left flex items-center gap-2`}
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
