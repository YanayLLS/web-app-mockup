import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface RoleSelectionModalProps {
  currentRole: string;
  onClose: () => void;
  onRoleChange: (role: string) => void;
  isBatchMode?: boolean;
  selectedMembersCount?: number;
}

// Roles that match the RolesManagementPage (excluding Owner as it's not selectable)
const availableRoles = [
  'Admin',
  'Operator',
  'Support Agent',
  'Content Creator',
];

export function RoleSelectionModal({
  currentRole,
  onClose,
  onRoleChange,
  isBatchMode = false,
  selectedMembersCount = 0,
}: RoleSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);

  const filteredRoles = availableRoles.filter(role =>
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    onRoleChange(selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-elevation-sm w-full max-w-[500px] max-h-[80vh] flex flex-col"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground">Select Role</h2>
              {isBatchMode && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Changing role for {selectedMembersCount} member{selectedMembersCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="h-[42px] relative rounded-lg mt-4 flex items-center gap-2 px-3 py-2 bg-white border border-border focus-within:border-ring transition-colors">
            <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="flex flex-col gap-2">
            {filteredRoles.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-secondary'
                  }`}
                >
                  {/* Radio button */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredRoles.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                No roles found
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
