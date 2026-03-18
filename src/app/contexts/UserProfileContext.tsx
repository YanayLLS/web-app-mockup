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

function StatusBadge({ status }: { status: 'active' | 'invited' | 'offline' }) {
  const config = {
    active: { color: '#0a9e4a', bg: 'rgba(17,232,116,0.1)', dot: '#11E874', label: 'Active now' },
    invited: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', dot: '#F59E0B', label: 'Invited' },
    offline: { color: '#7F7F7F', bg: 'rgba(127,127,127,0.08)', dot: '#7F7F7F', label: 'Offline' },
  };
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: c.bg }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot, boxShadow: status === 'active' ? `0 0 6px ${c.dot}60` : undefined }} />
      <span className="text-xs" style={{ color: c.color, fontWeight: 'var(--font-weight-semibold)' }}>
        {c.label}
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
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Panel - slides in from right */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[340px] max-w-[90vw] bg-card border-l border-border animate-in slide-in-from-right duration-250 flex flex-col"
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
          <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            User Profile
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close profile"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4">
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl"
                style={{
                  backgroundColor: color,
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: `0 8px 24px ${color}40`,
                }}
              >
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {user.status === 'active' && (
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-card"
                  style={{ backgroundColor: '#11E874', boxShadow: '0 0 8px rgba(17,232,116,0.5)', borderWidth: '3px', borderColor: 'var(--color-card)' }}
                />
              )}
            </div>
            <h3 className="text-lg text-foreground mb-1.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {user.name}
            </h3>
            {user.status && <StatusBadge status={user.status} />}
          </div>

          {/* Info Section */}
          <div className="px-4 space-y-1">
            {user.email && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Email</div>
                  <div className="text-sm text-foreground truncate">{user.email}</div>
                </div>
                <ExternalLink size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
            {user.role && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/8 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Role</div>
                  <div className="text-sm text-foreground">{user.role}</div>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#11E874]/8 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-[#0a9e4a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Phone</div>
                  <div className="text-sm text-foreground">{user.phone}</div>
                </div>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/8 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-[#F59E0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Location</div>
                  <div className="text-sm text-foreground">{user.location}</div>
                </div>
              </div>
            )}
            {user.lastActive && (
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5" style={{ fontWeight: 'var(--font-weight-bold)' }}>Last Active</div>
                  <div className="text-sm text-foreground">{user.lastActive}</div>
                </div>
              </div>
            )}
          </div>

          {/* Groups */}
          {user.groups && user.groups.length > 0 && (
            <div className="px-4 mt-6 pb-4">
              <div className="text-[10px] text-muted uppercase tracking-wide mb-2.5 px-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Groups
              </div>
              <div className="flex flex-wrap gap-1.5 px-3">
                {user.groups.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary/8 text-primary border border-primary/10"
                    style={{ fontWeight: 'var(--font-weight-semibold)' }}
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
