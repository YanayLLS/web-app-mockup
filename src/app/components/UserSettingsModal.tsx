import { useState, useRef } from 'react';
import { X, Search, ChevronDown, Monitor, Globe, Smartphone, Glasses, User, Lock, Languages, Fingerprint, Building2, AlertTriangle } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { useAvatar } from '../contexts/AvatarContext';
import { useAppPopup } from '../contexts/AppPopupContext';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { logout } = useAvatar();
  const { alert: appAlert } = useAppPopup();
  const [firstName, setFirstName] = useState('Yanay');
  const [lastName, setLastName] = useState('Nadel');
  const [email] = useState('yanay@lls-ltd.com');
  const [selectedHand, setSelectedHand] = useState('right');
  const [language, setLanguage] = useState('EN-US');
  const [sendAnonymousData, setSendAnonymousData] = useState(true);
  const [showHelpButton, setShowHelpButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCloseAccountConfirm, setShowCloseAccountConfirm] = useState(false);

  const personalInfoRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const activeSigninsRef = useRef<HTMLDivElement>(null);
  const workspacesRef = useRef<HTMLDivElement>(null);
  const closeAccountRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'personal-info', label: 'Update Personal Info', ref: personalInfoRef, icon: <User size={14} /> },
    { id: 'password', label: 'Update Password', ref: passwordRef, icon: <Lock size={14} /> },
    { id: 'language', label: 'Preferred viewing language', ref: languageRef, icon: <Languages size={14} /> },
    { id: 'active-signins', label: 'Active sign-ins', ref: activeSigninsRef, icon: <Fingerprint size={14} /> },
    { id: 'workspaces', label: 'Workspaces list', ref: workspacesRef, icon: <Building2 size={14} /> },
    { id: 'close-account', label: 'Close Account', ref: closeAccountRef, icon: <AlertTriangle size={14} /> },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Windows': return <Monitor size={14} className="text-[#2F80ED]" />;
      case 'Web Browser': return <Globe size={14} className="text-[#8B5CF6]" />;
      case 'Android': return <Smartphone size={14} className="text-[#11E874]" />;
      case 'iOS': return <Smartphone size={14} className="text-[#FF9800]" />;
      case 'HoloLens': return <Glasses size={14} className="text-[#00BCD4]" />;
      default: return <Monitor size={14} className="text-muted" />;
    }
  };

  const getDeviceBg = (type: string) => {
    switch (type) {
      case 'Windows': return 'rgba(47,128,237,0.08)';
      case 'Web Browser': return 'rgba(139,92,246,0.08)';
      case 'Android': return 'rgba(17,232,116,0.08)';
      case 'iOS': return 'rgba(255,152,0,0.08)';
      case 'HoloLens': return 'rgba(0,188,212,0.08)';
      default: return 'rgba(134,141,158,0.08)';
    }
  };

  const getPermissionStyle = (perm: string) => {
    if (perm === 'All') return { color: '#0a9e4a', bg: 'rgba(17,232,116,0.1)' };
    if (perm === 'None') return { color: '#7F7F7F', bg: 'rgba(127,127,127,0.08)' };
    return { color: '#2F80ED', bg: 'rgba(47,128,237,0.08)' };
  };

  const activeSignins = [
    { type: 'Windows', date: '10.02.2026 14:26' },
    { type: 'Web Browser', date: '28.12.2025 14:07' },
    { type: 'Web Browser', date: '30.01.2026 14:04' },
    { type: 'Android', date: '30.10.2025 15:49' },
    { type: 'HoloLens', date: '01.09.2025 11:35' },
    { type: 'Windows', date: '28.01.2026 17:47' },
    { type: 'Windows', date: '27.08.2025 15:21' },
    { type: 'HoloLens', date: '28.08.2025 14:23' },
    { type: 'Web Browser', date: '14.09.2025 15:56' },
    { type: 'Web Browser', date: '11.09.2025 18:30' },
    { type: 'Windows', date: '11.09.2025 18:45' },
    { type: 'Web Browser', date: '11.09.2025 18:14' },
    { type: 'iOS', date: '15.09.2025 18:00' },
    { type: 'Web Browser', date: '19.10.2025 09:56' },
    { type: 'Web Browser', date: '28.12.2025 13:26' },
    { type: 'Android', date: '13.11.2025 15:33' },
    { type: 'Web Browser', date: '04.11.2025 11:28' },
    { type: 'Web Browser', date: '09.02.2026 15:00' },
    { type: 'Windows', date: '26.11.2025 12:04' },
    { type: 'Web Browser', date: '09.02.2026 15:06' },
    { type: 'Android', date: '05.02.2026 11:39' },
  ];

  const workspaces = [
    { name: 'lls', training: 'All', content: 'All', admin: 'All', lastLogin: '21.01.2026 13:53' },
    { name: 'testfordeletion', training: 'All', content: 'All', admin: 'All', lastLogin: '27.06.2022 15:01' },
    { name: 'lls-ltd', training: 'Service support manager', content: 'Advanced content creator', admin: 'None', lastLogin: '-' },
    { name: 'testioniq5-0', training: 'Service support manager', content: 'Advanced content creator', admin: 'Workspace Admin', lastLogin: '15.11.2023 11:25' },
    { name: 'testpayperclick-0', training: 'All', content: 'All', admin: 'All', lastLogin: '24.10.2023 18:18' },
    { name: 'LLSYanay', training: 'All', content: 'All', admin: 'All', lastLogin: '11.02.2026 15:51' },
    { name: 'test-sub-workspace-0', training: 'All', content: 'All', admin: 'All', lastLogin: '28.01.2026 18:10' },
    { name: 'noam', training: 'Service support manager', content: 'Advanced content creator', admin: 'Workspace Admin', lastLogin: '03.12.2025 14:18' },
    { name: 'refreshtest-0', training: 'Field service engineer', content: 'Advanced content creator', admin: 'Workspace Admin', lastLogin: '09.02.2026 15:03' },
    { name: 'andrey-workspace', training: 'Service support manager', content: 'Advanced content creator', admin: 'Usage analysis', lastLogin: '21.01.2026 16:40' },
    { name: 'No permissions for yanay', training: 'None', content: 'None', admin: 'None', lastLogin: '28.12.2025 13:26' },
    { name: 'Yanay AI', training: 'All', content: 'All', admin: 'All', lastLogin: '09.02.2026 15:06' },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePasswordReset = async () => {
    // In a real app, this would send a password reset email
    await appAlert('A password reset link has been sent to your email address.', { title: 'Password Reset', variant: 'success' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg w-full max-w-[calc(100vw-32px)] sm:max-w-5xl max-h-[90vh] flex flex-col" style={{ boxShadow: 'var(--elevation-lg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - hidden on mobile */}
          <div className="hidden sm:flex w-64 border-r border-border flex-col">
            {/* Search */}
            <div className="p-3 border-b border-border/60">
              <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
                <Search size={14} className="text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted text-[16px] sm:text-[length:var(--text-xs)]"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {sections.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.ref)}
                  className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg transition-all flex items-center gap-2.5 ${
                    section.id === 'close-account'
                      ? 'text-destructive/70 hover:bg-destructive/5 hover:text-destructive'
                      : 'text-foreground hover:bg-secondary hover:translate-x-[2px]'
                  }`}
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  <span className="text-muted shrink-0">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Single scrollable page */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 sm:p-6">
            <div className="max-w-3xl">
              {/* Personal Info Section */}
              <div ref={personalInfoRef} className="scroll-mt-6 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Update Personal Info
                </h3>

                <div className="space-y-4">
                  {/* User Avatar */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <UserAvatar 
                        size="large" 
                        editable={true}
                        initials="YD"
                      />
                      <div>
                        <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
                          Yanay D
                        </p>
                        <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                          {email}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted ml-20" style={{ fontSize: 'var(--text-xs)' }}>
                      Click avatar to upload or remove
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary transition-colors text-[16px] sm:text-[length:var(--text-sm)]"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary transition-colors text-[16px] sm:text-[length:var(--text-sm)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-muted outline-none cursor-not-allowed text-[16px] sm:text-[length:var(--text-sm)]"
                    />
                  </div>

                  {/* 3D Avatar Section */}
                  <div className="bg-secondary border border-border rounded-lg p-4">
                    <h4 className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
                      3D Avatar Settings
                    </h4>
                    <p className="text-muted mb-4" style={{ fontSize: 'var(--text-sm)' }}>
                      Configure your 3D avatar for immersive experiences like the Immersive Room, where you can interact with content in a virtual environment.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Hand Preference */}
                      <div>
                        <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          Dominant Hand
                        </label>
                        <p className="text-muted mb-3" style={{ fontSize: 'var(--text-xs)' }}>
                          Select which hand you prefer to use for interactions in VR/XR experiences
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedHand('left')}
                            className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-lg border transition-colors ${
                              selectedHand === 'left' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'
                            }`}
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Left Hand
                          </button>
                          <button
                            onClick={() => setSelectedHand('right')}
                            className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-lg border transition-colors ${
                              selectedHand === 'right' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'
                            }`}
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Right Hand
                          </button>
                        </div>
                      </div>

                      {/* Features using 3D Avatar */}
                      <div className="pt-3 border-t border-border">
                        <p className="text-muted mb-2" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                          Used in:
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Immersive Room:</span> Collaborative virtual workspace for training and content interaction
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button className="px-6 py-2.5 min-h-[44px] bg-primary text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div ref={passwordRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Update Password
                </h3>

                <div className="bg-secondary border border-border rounded-lg p-4 mb-4">
                  <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-sm)' }}>
                    We'll send you a password reset link to your email address.
                  </p>
                  <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    Email: {email}
                  </p>
                </div>

                <button
                  onClick={handlePasswordReset}
                  className="px-6 py-2.5 min-h-[44px] bg-primary text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-2"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
                >
                  <Lock size={15} />
                  Request Password Reset Link
                </button>
              </div>

              {/* Language Section */}
              <div ref={languageRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Preferred viewing language
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer min-h-[44px] text-[16px] sm:text-[length:var(--text-sm)]"
                    >
                      <option value="EN-US">EN-US</option>
                      <option value="EN-GB">EN-GB</option>
                      <option value="ES">ES</option>
                      <option value="FR">FR</option>
                      <option value="DE">DE</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendAnonymousData}
                        onChange={(e) => setSendAnonymousData(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Allow sending of anonymous performance data
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!showHelpButton}
                        onChange={(e) => setShowHelpButton(!e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Disable help button
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Sign-ins Section */}
              <div ref={activeSigninsRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Active sign-ins
                </h3>

                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/60">
                        <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          Device type
                        </th>
                        <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          Login date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSignins.map((signin, index) => (
                        <tr key={index} className="border-t border-border/60 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: getDeviceBg(signin.type) }}>
                                {getDeviceIcon(signin.type)}
                              </div>
                              <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                {signin.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                            {signin.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workspaces Section */}
              <div ref={workspacesRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Workspaces list
                </h3>

                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-secondary/60">
                          <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            Workspace Name
                          </th>
                          <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            Training
                          </th>
                          <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            Content
                          </th>
                          <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            Admin
                          </th>
                          <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            Last Login
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workspaces.map((workspace, index) => (
                          <tr key={index} className="border-t border-border/60 hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                    {workspace.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                  {workspace.name}
                                </span>
                              </div>
                            </td>
                            {[workspace.training, workspace.content, workspace.admin].map((perm, i) => {
                              const ps = getPermissionStyle(perm);
                              return (
                                <td key={i} className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className="inline-flex px-2 py-0.5 rounded-full text-[11px]"
                                    style={{ color: ps.color, background: ps.bg, fontWeight: 'var(--font-weight-bold)' }}
                                  >
                                    {perm}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-sm)' }}>
                              {workspace.lastLogin}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Close Account Section - At the bottom */}
              <div ref={closeAccountRef} className="scroll-mt-6 pt-8 pb-6">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Close Account
                </h3>

                <div className="bg-secondary border border-border rounded-lg p-4 mb-4">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    To close your account, first delete or transfer all of the projects you own. If you have any Premium Plans, you'll need to cancel them too.
                  </p>
                </div>

                <button
                  onClick={() => setShowCloseAccountConfirm(true)}
                  className="px-6 py-2.5 min-h-[44px] bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all flex items-center gap-2"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
                >
                  <AlertTriangle size={15} />
                  Close Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Account Confirmation Modal */}
      {showCloseAccountConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCloseAccountConfirm(false)}
          />
          
          {/* Confirmation Dialog */}
          <div className="relative bg-card border border-border rounded-xl w-full max-w-[calc(100vw-32px)] sm:max-w-[480px] overflow-hidden" style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Close Account?
                </h3>
              </div>

              <p className="text-foreground/80 leading-relaxed" style={{ fontSize: 'var(--text-sm)' }}>
                Are you sure you want to close your account? This action cannot be undone. All your data, projects, and settings will be permanently deleted.
              </p>
            </div>

            <div className="border-t border-border/60 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseAccountConfirm(false)}
                className="px-4 py-2.5 min-h-[44px] bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCloseAccountConfirm(false);
                  onClose();
                  logout();
                }}
                className="px-5 py-2.5 min-h-[44px] bg-destructive text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-destructive/20 transition-all"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
              >
                Close Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
