import { useState } from 'react';
import svgPaths from "../../imports/svg-albmkprcym";
import { Building2, Check, X, AlertCircle, CheckCircle2, Users } from 'lucide-react';

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
  isJoined: boolean; // true if user is already a member, false if just invited
}

interface WorkspaceSelectorProps {
  userEmail: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onDeclineInvitation: (workspaceId: string) => void;
}

export function WorkspaceSelector({ userEmail, onSelectWorkspace, onDeclineInvitation }: WorkspaceSelectorProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock workspace data - in real app this would come from API
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-1',
      name: 'Acme Manufacturing',
      memberCount: 127,
      invitedBy: 'Sarah Chen',
      isJoined: true
    },
    {
      id: 'ws-2',
      name: 'Global Logistics Co.',
      memberCount: 89,
      invitedBy: 'Michael Rodriguez',
      isJoined: false
    },
    {
      id: 'ws-3',
      name: 'TechCorp Industries',
      memberCount: 45,
      invitedBy: 'James Wilson',
      isJoined: false
    }
  ]);

  const joinedWorkspaces = workspaces.filter(w => w.isJoined);
  const pendingInvitations = workspaces.filter(w => !w.isJoined);

  const handleSelectWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    if (workspace.isJoined) {
      // Already joined, just select it
      setIsLoading(true);
      setTimeout(() => {
        onSelectWorkspace(workspaceId);
      }, 300);
    } else {
      // Need to join first
      setSelectedWorkspace(workspaceId);
    }
  };

  const handleJoinWorkspace = () => {
    if (!selectedWorkspace) return;
    
    setIsLoading(true);
    setTimeout(() => {
      // Update workspace to joined status
      setWorkspaces(prev => prev.map(w => 
        w.id === selectedWorkspace ? { ...w, isJoined: true } : w
      ));
      onSelectWorkspace(selectedWorkspace);
    }, 500);
  };

  const handleDecline = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    onDeclineInvitation(workspaceId);
    if (selectedWorkspace === workspaceId) {
      setSelectedWorkspace(null);
    }
  };

  // Debug functions
  const debugNoWorkspaces = () => {
    setWorkspaces([]);
  };

  const debugOnlyJoined = () => {
    setWorkspaces([
      {
        id: 'ws-1',
        name: 'Acme Manufacturing',
        memberCount: 127,
        isJoined: true
      }
    ]);
  };

  const debugOnlyInvited = () => {
    setWorkspaces([
      {
        id: 'ws-2',
        name: 'Global Logistics Co.',
        memberCount: 89,
        invitedBy: 'Michael Rodriguez',
        isJoined: false
      }
    ]);
  };

  const debugMixed = () => {
    setWorkspaces([
      {
        id: 'ws-1',
        name: 'Acme Manufacturing',
        memberCount: 127,
        isJoined: true
      },
      {
        id: 'ws-2',
        name: 'Global Logistics Co.',
        memberCount: 89,
        invitedBy: 'Michael Rodriguez',
        isJoined: false
      },
      {
        id: 'ws-3',
        name: 'TechCorp Industries',
        memberCount: 45,
        invitedBy: 'James Wilson',
        isJoined: false
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[540px] relative z-10">
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
            Select a workspace
          </h1>
          <p 
            className="text-muted text-center"
            style={{ 
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family)'
            }}
          >
            {userEmail}
          </p>
        </div>

        {/* Workspace Selection Card */}
        <div 
          className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden"
          style={{ boxShadow: 'var(--elevation-lg)' }}
        >
          <div className="px-4 py-6 sm:p-8">
            {workspaces.length === 0 ? (
              // No workspaces available
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Building2 size={32} className="text-muted" />
                </div>
                <h3 
                  className="text-foreground mb-2"
                  style={{ 
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  No workspaces available
                </h3>
                <p 
                  className="text-muted max-w-[320px] mx-auto"
                  style={{ 
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  You need to be invited to a workspace to access Frontline.io. Contact your workspace administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Joined Workspaces */}
                {joinedWorkspaces.length > 0 && (
                  <div>
                    <h3 
                      className="text-foreground mb-3 flex items-center gap-2"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        fontFamily: 'var(--font-family)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      <Users size={16} />
                      Your Workspaces
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {joinedWorkspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          type="button"
                          onClick={() => handleSelectWorkspace(workspace.id)}
                          disabled={isLoading}
                          className="w-full p-4 min-h-[44px] border-2 border-border rounded-[var(--radius)] hover:border-primary/50 bg-background transition-all text-left disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center shrink-0"
                              style={{ color: 'var(--primary)' }}
                            >
                              <Building2 size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-foreground"
                                style={{ 
                                  fontSize: 'var(--text-base)',
                                  fontWeight: 'var(--font-weight-semibold)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                {workspace.name}
                              </h4>
                              <p 
                                className="text-muted"
                                style={{ 
                                  fontSize: 'var(--text-sm)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                {workspace.memberCount} members
                              </p>
                            </div>
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <Check size={20} className="text-success" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div>
                    <h3 
                      className="text-foreground mb-3 flex items-center gap-2"
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        fontFamily: 'var(--font-family)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      <AlertCircle size={16} />
                      Pending Invitations
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {pendingInvitations.map((workspace) => (
                        <div
                          key={workspace.id}
                          className={`p-4 border-2 rounded-[var(--radius)] transition-all ${
                            selectedWorkspace === workspace.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-12 h-12 rounded-[var(--radius)] bg-warning/10 flex items-center justify-center shrink-0"
                              style={{ color: 'var(--warning)' }}
                            >
                              <Building2 size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-foreground"
                                style={{ 
                                  fontSize: 'var(--text-base)',
                                  fontWeight: 'var(--font-weight-semibold)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                {workspace.name}
                              </h4>
                              <p 
                                className="text-muted"
                                style={{ 
                                  fontSize: 'var(--text-sm)',
                                  fontFamily: 'var(--font-family)'
                                }}
                              >
                                {workspace.memberCount} members · Invited by {workspace.invitedBy}
                              </p>
                              
                              {/* Action buttons */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    setSelectedWorkspace(workspace.id);
                                    // Auto-join after selection
                                    setTimeout(() => handleJoinWorkspace(), 100);
                                  }}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                                  style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    fontFamily: 'var(--font-family)'
                                  }}
                                >
                                  {isLoading && selectedWorkspace === workspace.id ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Joining...
                                    </>
                                  ) : (
                                    <>
                                      <Check size={16} />
                                      Join
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDecline(workspace.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                  style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    fontFamily: 'var(--font-family)'
                                  }}
                                >
                                  <X size={16} />
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              onClick={debugNoWorkspaces}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle size={14} className="inline mr-2 text-error" />
              No Workspaces
            </button>
            <button
              onClick={debugOnlyJoined}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <CheckCircle2 size={14} className="inline mr-2 text-success" />
              Only Joined (1)
            </button>
            <button
              onClick={debugOnlyInvited}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <AlertCircle size={14} className="inline mr-2 text-warning" />
              Only Invited (1)
            </button>
            <button
              onClick={debugMixed}
              className="px-3 py-2 min-h-[44px] bg-background border border-border rounded-[var(--radius)] hover:bg-secondary transition-colors text-left"
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-family)'
              }}
            >
              <CheckCircle2 size={14} className="inline mr-2 text-primary" />
              Mixed (3)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
