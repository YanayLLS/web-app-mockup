import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '../../../../hooks/useClickOutside';
import { MemberAvatar } from '../../../MemberAvatar';

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface RoleMembersContextMenuProps {
  roleName: string;
  members: Member[];
  onClose: () => void;
  position: { top: number; left?: number; right?: number };
}

export function RoleMembersContextMenu({
  roleName,
  members,
  onClose,
  position,
}: RoleMembersContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose);

  // Clamp menu position within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(16, window.innerWidth - rect.width - 16)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(16, window.innerHeight - rect.height - 16)}px`;
    }
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed bg-card rounded-lg shadow-elevation-lg w-[320px] max-w-[calc(100vw-32px)] z-50"
      style={{ 
        top: `${position.top}px`, 
        left: position.left !== undefined ? `${position.left}px` : undefined,
        right: position.right !== undefined ? `${position.right}px` : undefined,
        border: '1px solid var(--border)',
        maxHeight: '400px',
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 
            className="text-sm font-bold" 
            style={{ 
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            {roleName} Members
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-secondary rounded p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Members List */}
        <div 
          className="flex flex-col gap-1 overflow-y-auto" 
          style={{ 
            maxHeight: '320px',
            borderRadius: 'var(--radius)',
          }}
        >
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 min-h-[44px] rounded hover:bg-secondary transition-colors"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {/* Avatar */}
                <MemberAvatar
                  name={member.name}
                  size="lg"
                  color={member.color}
                  initials={member.initials}
                  id={member.id}
                  showTooltip={false}
                />

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium truncate"
                    style={{ 
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {member.name}
                  </div>
                  <div 
                    className="text-xs truncate"
                    style={{ 
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {member.email}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div 
              className="text-center py-8"
              style={{ 
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
              }}
            >
              No members with this role
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
