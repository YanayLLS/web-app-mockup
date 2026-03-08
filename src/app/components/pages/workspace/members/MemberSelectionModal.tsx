import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface MemberData {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  status: 'active' | 'invited';
  groups: string[];
  role?: string;
}

interface MemberSelectionModalProps {
  groupId: string;
  onClose: () => void;
  onSelect: (memberIds: string[]) => void;
  isContextMenu?: boolean;
  availableMembers?: MemberData[];
  currentGroupName?: string;
}

export function MemberSelectionModal({ 
  groupId, 
  onClose, 
  onSelect, 
  isContextMenu = false,
  availableMembers = [],
  currentGroupName = ''
}: MemberSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pre-select members already in the group
  const membersAlreadyInGroup = availableMembers
    .filter(member => member.groups.includes(currentGroupName))
    .map(member => member.id);
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>(membersAlreadyInGroup);

  // Show all members, not just those not in the group
  const filteredMembers = availableMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleSave = () => {
    onSelect(selectedMembers);
  };

  const renderMembersList = () => (
    <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto">
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
            No members found
          </p>
        </div>
      ) : (
        filteredMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => toggleMember(member.id)}
            className="flex items-center gap-3 p-3 hover:bg-secondary transition-all rounded-lg border border-transparent"
            style={{
              fontFamily: 'var(--font-family)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
              style={{
                backgroundColor: member.color,
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {member.initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                {member.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs truncate" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                  {member.email}
                </p>
                {member.role && (
                  <>
                    <span style={{ color: 'var(--muted)' }}>•</span>
                    <p className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                      {member.role}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {member.status === 'invited' && (
                <div
                  className="px-2.5 py-1 rounded text-xs"
                  style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)', fontFamily: 'var(--font-family)' }}
                >
                  Invited
                </div>
              )}
              {selectedMembers.includes(member.id) && (
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
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
            </div>
          </button>
        ))
      )}
    </div>
  );

  if (isContextMenu) {
    return (
      <div
        className="rounded-lg shadow-elevation-sm w-[400px] bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-family)' }}>Add Members</h3>
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
              placeholder="Search or enter email..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-ring transition-colors"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}
            />
          </div>

          {/* Members List */}
          {renderMembersList()}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
              {selectedMembers.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedMembers.length === 0}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                Add Members
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-elevation-sm w-full max-w-[400px]"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium" style={{ color: 'var(--foreground)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-family)' }}>Add Members</h3>
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
              placeholder="Search or enter email..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-ring transition-colors"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}
            />
          </div>

          {/* Members List */}
          {renderMembersList()}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
              {selectedMembers.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedMembers.length === 0}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                Add Members
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
