import { useState, useRef } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { useAvatar } from '../contexts/AvatarContext';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { logout } = useAvatar();
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
    { id: 'personal-info', label: 'Update Personal Info', ref: personalInfoRef },
    { id: 'password', label: 'Update Password', ref: passwordRef },
    { id: 'language', label: 'Preferred viewing language', ref: languageRef },
    { id: 'active-signins', label: 'Active sign-ins', ref: activeSigninsRef },
    { id: 'workspaces', label: 'Workspaces list', ref: workspacesRef },
    { id: 'close-account', label: 'Close Account', ref: closeAccountRef },
  ];

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

  const handlePasswordReset = () => {
    // In a real app, this would send a password reset email
    alert('A password reset link has been sent to your email address.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-[var(--radius)] w-full max-w-[calc(100vw-32px)] sm:max-w-5xl max-h-[90vh] flex flex-col" style={{ boxShadow: 'var(--elevation-lg)', fontFamily: 'var(--font-family)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-[var(--radius)] transition-colors"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - hidden on mobile */}
          <div className="hidden sm:flex w-64 border-r border-border flex-col">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 bg-secondary border border-border rounded-[var(--radius)] px-3 py-2">
                <Search size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted text-[16px] sm:text-[length:var(--text-xs)]"
                  style={{ fontFamily: 'var(--font-family)' }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {sections.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.ref)}
                  className="w-full text-left px-3 py-2.5 min-h-[44px] rounded-[var(--radius)] transition-colors text-foreground hover:bg-secondary"
                  style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                >
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
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
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
                        <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                          Yanay D
                        </p>
                        <p className="text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                          {email}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted ml-20" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                      Click avatar to upload or remove
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-foreground outline-none focus:border-primary transition-colors text-[16px] sm:text-[length:var(--text-sm)]"
                        style={{ fontFamily: 'var(--font-family)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 text-foreground outline-none focus:border-primary transition-colors text-[16px] sm:text-[length:var(--text-sm)]"
                        style={{ fontFamily: 'var(--font-family)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted mb-2" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-secondary border border-border rounded-[var(--radius)] px-3 py-2 text-muted outline-none cursor-not-allowed text-[16px] sm:text-[length:var(--text-sm)]"
                      style={{ fontFamily: 'var(--font-family)' }}
                    />
                  </div>

                  {/* 3D Avatar Section */}
                  <div className="bg-secondary border border-border rounded-[var(--radius)] p-4">
                    <h4 className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                      3D Avatar Settings
                    </h4>
                    <p className="text-muted mb-4" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                      Configure your 3D avatar for immersive experiences like the Immersive Room, where you can interact with content in a virtual environment.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Hand Preference */}
                      <div>
                        <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}>
                          Dominant Hand
                        </label>
                        <p className="text-muted mb-3" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                          Select which hand you prefer to use for interactions in VR/XR experiences
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedHand('left')}
                            className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-[var(--radius)] border transition-colors ${
                              selectedHand === 'left' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'
                            }`}
                            style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                          >
                            Left Hand
                          </button>
                          <button
                            onClick={() => setSelectedHand('right')}
                            className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-[var(--radius)] border transition-colors ${
                              selectedHand === 'right' ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'
                            }`}
                            style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}
                          >
                            Right Hand
                          </button>
                        </div>
                      </div>

                      {/* Features using 3D Avatar */}
                      <div className="pt-3 border-t border-border">
                        <p className="text-muted mb-2" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}>
                          Used in:
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-muted" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Immersive Room:</span> Collaborative virtual workspace for training and content interaction
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button className="px-6 py-2.5 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}>
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div ref={passwordRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                  Update Password
                </h3>

                <div className="bg-secondary border border-border rounded-[var(--radius)] p-4 mb-4">
                  <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                    We'll send you a password reset link to your email address.
                  </p>
                  <p className="text-muted" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)' }}>
                    Email: {email}
                  </p>
                </div>

                <button
                  onClick={handlePasswordReset}
                  className="px-6 py-2.5 min-h-[44px] bg-primary text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}
                >
                  Request Password Reset Link
                </button>
              </div>

              {/* Language Section */}
              <div ref={languageRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                  Preferred viewing language
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-background border border-border rounded-[var(--radius)] px-3 py-2 pr-10 text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer min-h-[44px] text-[16px] sm:text-[length:var(--text-sm)]"
                      style={{ fontFamily: 'var(--font-family)' }}
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
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
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
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                        Disable help button
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Sign-ins Section */}
              <div ref={activeSigninsRef} className="scroll-mt-6 pt-8 pb-8 border-b border-border">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                  Active sign-ins
                </h3>

                <div className="border border-border rounded-[var(--radius)] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                          Device type
                        </th>
                        <th className="text-left px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                          Login date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSignins.map((signin, index) => (
                        <tr key={index} className="border-t border-border hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                            {signin.type}
                          </td>
                          <td className="px-4 py-3 text-muted" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
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
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                  Workspaces list
                </h3>

                <div className="border border-border rounded-[var(--radius)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                            Workspace Name
                          </th>
                          <th className="text-left px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                            Training Permissions
                          </th>
                          <th className="text-left px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                            Content Permissions
                          </th>
                          <th className="text-left px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                            Admin Permissions
                          </th>
                          <th className="text-left px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                            Last Login
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workspaces.map((workspace, index) => (
                          <tr key={index} className="border-t border-border hover:bg-secondary/50 transition-colors">
                            <td className="px-4 py-3 text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                              {workspace.name}
                            </td>
                            <td className="px-4 py-3 text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                              {workspace.training}
                            </td>
                            <td className="px-4 py-3 text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                              {workspace.content}
                            </td>
                            <td className="px-4 py-3 text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                              {workspace.admin}
                            </td>
                            <td className="px-4 py-3 text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
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
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
                  Close Account
                </h3>

                <div className="bg-secondary border border-border rounded-[var(--radius)] p-4 mb-4">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
                    To close your account, first delete or transfer all of the projects you own. If you have any Premium Plans, you'll need to cancel them too.
                  </p>
                </div>

                <button
                  onClick={() => setShowCloseAccountConfirm(true)}
                  className="px-6 py-2.5 min-h-[44px] bg-destructive text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}
                >
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
          <div className="relative bg-card border border-border rounded-[var(--radius)] w-full max-w-[calc(100vw-32px)] sm:max-w-[480px] px-4 py-6 sm:p-6" style={{ boxShadow: 'var(--elevation-lg)' }}>
            <h3 className="text-foreground mb-4" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)' }}>
              Close Account?
            </h3>

            <p className="text-foreground mb-6" style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family)' }}>
              Are you sure you want to close your account? This action cannot be undone. All your data, projects, and settings will be permanently deleted.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseAccountConfirm(false)}
                className="px-4 py-2 min-h-[44px] bg-secondary text-foreground rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCloseAccountConfirm(false);
                  onClose();
                  logout();
                }}
                className="px-4 py-2 min-h-[44px] bg-destructive text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'var(--font-family)' }}
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
