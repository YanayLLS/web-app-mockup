import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { X, Mail, Shield, Clock, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

export interface ProfileUser {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  status?: 'active' | 'invited' | 'offline';
  imageUrl?: string;
  initials?: string;
  color?: string;
  phone?: string;
  location?: string;
  lastActive?: string;
  groups?: string[];
}

interface UserProfileContextType {
  openProfile: (user: ProfileUser) => void;
  closeProfile: () => void;
  profileUser: ProfileUser | null;
  isOpen: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    // Return a no-op version so components work even without the provider
    return {
      openProfile: () => {},
      closeProfile: () => {},
      profileUser: null,
      isOpen: false,
    };
  }
  return ctx;
}

// Utility functions for avatar display
const avatarColors = [
  '#aa74b5', '#6b8fd4', '#4db6ac', '#e06c75', '#d4a76b',
  '#7c8fe0', '#56b6c2', '#c678dd', '#61afef', '#98c379',
  '#e5c07b', '#be5046', '#5c6bc0', '#26a69a', '#ef5350',
];

export function getAvatarInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function getAvatarColor(nameOrId: string): string {
  if (!nameOrId) return avatarColors[0];
  const hash = nameOrId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function StatusDot({ status }: { status: 'active' | 'invited' | 'offline' }) {
  const colors = {
    active: 'bg-[#11E874]',
    invited: 'bg-[#f59e0b]',
    offline: 'bg-[#7F7F7F]',
  };
  const labels = {
    active: 'Active now',
    invited: 'Invited',
    offline: 'Offline',
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-family)' }}>
        {labels[status]}
      </span>
    </span>
  );
}

function UserProfileSideModal({ user, onClose }: { user: ProfileUser; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside(panelRef, onClose);

  const initials = user.initials || getAvatarInitials(user.name);
  const color = user.color || getAvatarColor(user.id || user.name);

  return (
    <div className="fixed inset-0 z-[200]" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Panel - slides in from right */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[340px] max-w-[90vw] bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-foreground)' }}>
            User Profile
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[var(--radius)] flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Close profile"
          >
            <X size={16} style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 shadow-lg ring-4 ring-white/10"
              style={{
                backgroundColor: color,
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)',
              }}
            >
              {user.imageUrl ? (
                <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <h3 className="text-lg mb-1" style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-foreground)' }}>
              {user.name}
            </h3>
            {user.status && <StatusDot status={user.status} />}
          </div>

          {/* Info Section */}
          <div className="px-4 space-y-1">
            {user.email && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors group cursor-pointer">
                <Mail size={15} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted mb-0.5">Email</div>
                  <div className="text-sm text-foreground truncate">{user.email}</div>
                </div>
                <ExternalLink size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
            {user.role && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                <Shield size={15} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted mb-0.5">Role</div>
                  <div className="text-sm text-foreground">{user.role}</div>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                <Phone size={15} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted mb-0.5">Phone</div>
                  <div className="text-sm text-foreground">{user.phone}</div>
                </div>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                <MapPin size={15} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted mb-0.5">Location</div>
                  <div className="text-sm text-foreground">{user.location}</div>
                </div>
              </div>
            )}
            {user.lastActive && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors">
                <Clock size={15} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted mb-0.5">Last Active</div>
                  <div className="text-sm text-foreground">{user.lastActive}</div>
                </div>
              </div>
            )}
          </div>

          {/* Groups */}
          {user.groups && user.groups.length > 0 && (
            <div className="px-4 mt-5">
              <div className="text-xs text-muted mb-2 px-3" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Groups
              </div>
              <div className="flex flex-wrap gap-1.5 px-3">
                {user.groups.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openProfile = useCallback((user: ProfileUser) => {
    setProfileUser(user);
    setIsOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    setIsOpen(false);
    // Delay clearing user so exit animation can play
    setTimeout(() => setProfileUser(null), 300);
  }, []);

  return (
    <UserProfileContext.Provider value={{ openProfile, closeProfile, profileUser, isOpen }}>
      {children}
      {isOpen && profileUser && (
        <UserProfileSideModal user={profileUser} onClose={closeProfile} />
      )}
    </UserProfileContext.Provider>
  );
}
