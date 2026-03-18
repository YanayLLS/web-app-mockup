import { useState, useEffect, useRef } from 'react';
import { X, Search, Users } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { MemberAvatar } from '../../../MemberAvatar';
import { useClickOutside } from '../../../../hooks/useClickOutside';

export interface MemberOption {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role?: string;
  groups?: string[];
}

export interface GroupOption {
  id: string;
  name: string;
  memberCount: number;
}

interface AddMembersContextMenuProps {
  onClose: () => void;
  onSave: (memberIds: string[], groupIds: string[]) => void;
  availableMembers: MemberOption[];
  availableGroups?: GroupOption[];
  selectedMemberIds?: string[];
  selectedGroupIds?: string[];
  showGroups?: boolean;
  title?: string;
  position?: { top: number; left: number } | null;
}

export function AddMembersContextMenu({
  onClose,
  onSave,
  availableMembers,
  availableGroups = [],
  selectedMemberIds = [],
  selectedGroupIds = [],
  showGroups = false,
  title = 'Add Members',
  position = null,
}: AddMembersContextMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(selectedMemberIds);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(selectedGroupIds);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle escape key and clicks outside
  useClickOutside(menuRef, onClose);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const filteredMembers = availableMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = showGroups
    ? availableGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSave = () => {
    onSave(selectedMembers, selectedGroups);
    onClose();
  };

  const totalSelected = selectedMembers.length + selectedGroups.length;

  // Calculate position
  const menuStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderColor: 'var(--border)',
  };

  if (position) {
    menuStyle.position = 'fixed';
    menuStyle.top = `${position.top}px`;
    menuStyle.left = `${position.left}px`;
    menuStyle.zIndex = 50;
  }

  return (
    <div
      ref={menuRef}
      className="shadow-lg border-2 w-[320px] max-w-[calc(100vw-32px)] max-h-[500px] flex flex-col"
      style={{
        ...menuStyle,
        borderRadius: 'var(--radius-lg)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--foreground)', fontSize: 'var(--text-sm)' }}>
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="text"
            placeholder={`Search ${showGroups ? 'members and groups' : 'members'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border focus:outline-none"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 2px var(--primary-background)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
            autoFocus
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Groups Section */}
        {showGroups && filteredGroups.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 mb-1">
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                Groups
              </span>
            </div>
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary/60 rounded-lg transition-colors"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <Checkbox checked={selectedGroups.includes(group.id)} onChange={(e) => e.stopPropagation()} />
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--secondary)',
                  }}
                >
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--foreground)', fontSize: 'var(--text-sm)' }}>
                    {group.name}
                  </div>
                  <div className="truncate" style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                    {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Section */}
        {filteredMembers.length > 0 && (
          <div>
            {showGroups && filteredGroups.length > 0 && (
              <div className="px-2 py-1 mb-1">
                <span className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>
                  Members
                </span>
              </div>
            )}
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-secondary/60 rounded-lg transition-colors"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <Checkbox checked={selectedMembers.includes(member.id)} onChange={(e) => e.stopPropagation()} />
                <MemberAvatar name={member.name} size="md" color={member.color} initials={member.initials} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--foreground)', fontSize: 'var(--text-sm)' }}>
                    {member.name}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate" style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>{member.email}</span>
                  </div>
                </div>
                {member.role && (
                  <span
                    className="px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--primary-background)',
                      color: 'var(--primary)',
                      
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No {showGroups ? 'members or groups' : 'members'} found
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {totalSelected} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}