import { useState, useEffect, useRef } from 'react';
import { X, Search, Users, UserPlus } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { MemberAvatar } from '../MemberAvatar';
import { useClickOutside } from '../../hooks/useClickOutside';

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

  useClickOutside(menuRef, onClose);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!menuRef.current || !position) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${Math.max(16, window.innerWidth - rect.width - 16)}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${Math.max(16, window.innerHeight - rect.height - 16)}px`;
  }, [position]);

  const filteredMembers = availableMembers.filter(
    (m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = showGroups ? availableGroups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const toggleMember = (id: string) => setSelectedMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleGroup = (id: string) => setSelectedGroups((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = () => { onSave(selectedMembers, selectedGroups); onClose(); };
  const totalSelected = selectedMembers.length + selectedGroups.length;

  const menuStyle: React.CSSProperties = {};
  if (position) {
    menuStyle.position = 'fixed';
    menuStyle.top = `${position.top}px`;
    menuStyle.left = `${position.left}px`;
    menuStyle.zIndex = 50;
  }

  return (
    <div
      ref={menuRef}
      className="bg-card border border-border rounded-xl w-[320px] max-w-[calc(100vw-32px)] max-h-[500px] flex flex-col"
      style={{ ...menuStyle, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <UserPlus size={15} className="text-primary" />
          <h3 className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border/60">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-border rounded-lg focus-within:border-primary focus-within:bg-card focus-within:shadow-sm focus-within:shadow-primary/5 transition-all">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder={`Search ${showGroups ? 'members and groups' : 'members'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none border-none placeholder:text-muted focus:outline-none focus:ring-0"
            autoFocus
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
        {/* Groups Section */}
        {showGroups && filteredGroups.length > 0 && (
          <div className="mb-1">
            <div className="px-3 py-1.5">
              <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Groups
              </span>
            </div>
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] cursor-pointer rounded-lg transition-all ${
                  selectedGroups.includes(group.id) ? 'bg-primary/[0.04]' : 'hover:bg-secondary/60'
                }`}
              >
                <Checkbox checked={selectedGroups.includes(group.id)} onChange={(e) => e.stopPropagation()} />
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <Users size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>{group.name}</div>
                  <div className="text-xs text-muted">{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Section */}
        {filteredMembers.length > 0 && (
          <div>
            {showGroups && filteredGroups.length > 0 && (
              <div className="px-3 py-1.5">
                <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Members
                </span>
              </div>
            )}
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] cursor-pointer rounded-lg transition-all ${
                  selectedMembers.includes(member.id) ? 'bg-primary/[0.04]' : 'hover:bg-secondary/60'
                }`}
              >
                <Checkbox checked={selectedMembers.includes(member.id)} onChange={(e) => e.stopPropagation()} />
                <MemberAvatar name={member.name} size="md" color={member.color} initials={member.initials} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>{member.name}</div>
                  <div className="text-xs text-muted truncate">{member.email}</div>
                </div>
                {member.role && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] flex-shrink-0" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <Search size={20} className="text-muted/30 mb-2" />
            <p className="text-sm text-muted">
              No {showGroups ? 'members or groups' : 'members'} found
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/60">
        <span className="text-xs text-muted">
          {totalSelected} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 min-h-[44px] bg-card text-foreground border border-border rounded-lg hover:bg-secondary hover:border-primary/20 transition-all text-sm"
            style={{ fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 min-h-[44px] bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all text-sm"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
