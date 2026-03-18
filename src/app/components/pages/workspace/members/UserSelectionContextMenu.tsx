import { useState } from 'react';
import { X, Search, Users } from 'lucide-react';
import { MemberAvatar } from '../../../MemberAvatar';

interface UserSelectionContextMenuProps {
  onClose: () => void;
  onSelect: (users: string[], groups: string[]) => void;
  showGroups?: boolean;
}

const availableGroups = [
  { name: 'Asia Pacific', members: 25 },
  { name: 'Europe', members: 30 },
  { name: 'North America', members: 15 },
  { name: 'Latin America', members: 12 },
  { name: 'Middle East', members: 18 },
  { name: 'Africa', members: 10 },
];

const allMembers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', initials: 'AJ', color: '#71edaa' },
  { id: '2', name: 'Maria Smith', email: 'maria@company.com', initials: 'MS', color: '#b171ed' },
  { id: '3', name: 'David Brown', email: 'david@company.com', initials: 'DB', color: '#bfed71' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', initials: 'ED', color: '#71a2ed' },
  { id: '5', name: 'James Wilson', email: 'james@company.com', initials: 'JW', color: '#ed7171' },
  { id: '6', name: 'Sophia Taylor', email: 'sophia@company.com', initials: 'ST', color: '#71edd9' },
  { id: '7', name: 'Liam Anderson', email: 'liam@company.com', initials: 'LA', color: '#71edaa' },
  { id: '8', name: 'Olivia Thomas', email: 'olivia@company.com', initials: 'OT', color: '#b171ed' },
  { id: '9', name: 'Noah Jackson', email: 'noah@company.com', initials: 'NJ', color: '#71a2ed' },
  { id: '10', name: 'Ava White', email: 'ava@company.com', initials: 'AW', color: '#ed7171' },
];

export function UserSelectionContextMenu({ onClose, onSelect, showGroups = true }: UserSelectionContextMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const filteredMembers = allMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = availableGroups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleGroup = (groupName: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupName) ? prev.filter(name => name !== groupName) : [...prev, groupName]
    );
  };

  const handleSave = () => {
    onSelect(selectedUsers, selectedGroups);
    onClose();
  };

  const totalSelected = selectedUsers.length + selectedGroups.length;

  return (
    <div
      className="rounded-lg w-[420px] bg-card border border-border shadow-elevation-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)' }}>
            Add Members {showGroups && '& Groups'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={showGroups ? "Search members or groups..." : "Search members..."}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-ring transition-colors"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* List */}
        <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
          {/* Groups Section */}
          {showGroups && filteredGroups.length > 0 && (
            <>
              <div className="px-2 py-1.5">
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>GROUPS</span>
              </div>
              {filteredGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors rounded-lg"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {group.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {group.members} members
                    </p>
                  </div>
                  {selectedGroups.includes(group.name) && (
                    <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </>
          )}

          {/* Members Section */}
          {filteredMembers.length > 0 && (
            <>
              {showGroups && filteredGroups.length > 0 && (
                <div className="px-2 py-1.5 mt-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>MEMBERS</span>
                </div>
              )}
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleUser(member.id)}
                  className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors rounded-lg"
                >
                  <MemberAvatar
                    name={member.name}
                    size="xl"
                    color={member.color}
                    initials={member.initials}
                    id={member.id}
                    showTooltip={false}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {member.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {member.email}
                    </p>
                  </div>
                  {selectedUsers.includes(member.id) && (
                    <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {totalSelected} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={totalSelected === 0}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
