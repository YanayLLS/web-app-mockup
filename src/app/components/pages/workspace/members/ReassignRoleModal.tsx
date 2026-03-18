import { useState } from 'react';
import { X, Users, ChevronDown } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { MemberAvatar } from '../../../MemberAvatar';

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface ReassignRoleModalProps {
  roleName: string;
  members: Member[];
  availableRoles: string[];
  onClose: () => void;
  onReassign: (memberIds: string[], newRole: string) => void;
}

export function ReassignRoleModal({ 
  roleName, 
  members, 
  availableRoles,
  onClose, 
  onReassign 
}: ReassignRoleModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));
  const [selectedRole, setSelectedRole] = useState<string>(availableRoles[0] || '');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m.id));
    }
  };

  const handleReassign = () => {
    if (selectedMembers.length > 0 && selectedRole) {
      onReassign(selectedMembers, selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-elevation-lg w-full max-w-[600px] flex flex-col max-h-[80vh]"
        style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Reassign Members from "{roleName}"
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Select members and assign them to a new role
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* New Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
              New Role
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-2.5 rounded-lg border flex items-center justify-between hover:bg-secondary transition-colors"
                style={{ 
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  
                }}
              >
                <span>{selectedRole || 'Select a role'}</span>
                <ChevronDown 
                  className="w-4 h-4 transition-transform" 
                  style={{ 
                    color: 'var(--muted)',
                    transform: showRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </button>
              
              {showRoleDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div 
                    className="absolute top-full mt-1 w-full rounded-lg border shadow-elevation-md overflow-hidden z-20"
                    style={{ 
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {availableRoles.map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors"
                        style={{ 
                          color: 'var(--foreground)',
                          
                          backgroundColor: selectedRole === role ? 'var(--secondary)' : 'transparent',
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Select Members ({selectedMembers.length} of {members.length})
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--primary)' }}
              >
                {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div 
              className="border rounded-lg divide-y"
              style={{ 
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              {members.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleToggleMember(member.id)}
                  />
                  <MemberAvatar
                    name={member.name}
                    size="lg"
                    color={member.color}
                    initials={member.initials}
                    id={member.id}
                    showTooltip={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {member.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {selectedMembers.length === 0 ? 'Select at least one member' : 
             selectedMembers.length === members.length ? 'All members selected' :
             `${members.length - selectedMembers.length} member${members.length - selectedMembers.length > 1 ? 's' : ''} will keep current role`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm rounded-lg border hover:bg-secondary transition-colors"
              style={{ 
                color: 'var(--foreground)', 
                
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={selectedMembers.length === 0 || !selectedRole}
              className="px-5 py-2.5 text-sm rounded-lg transition-opacity"
              style={{ 
                backgroundColor: selectedMembers.length === 0 || !selectedRole ? 'var(--muted)' : 'var(--primary)',
                color: selectedMembers.length === 0 || !selectedRole ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                
                borderRadius: 'var(--radius)',
                opacity: selectedMembers.length === 0 || !selectedRole ? '0.5' : '1',
                cursor: selectedMembers.length === 0 || !selectedRole ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (selectedMembers.length > 0 && selectedRole) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMembers.length > 0 && selectedRole) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Reassign {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
