import { useState } from 'react';
import { X, Search, Users } from 'lucide-react';
import { Checkbox } from './Checkbox';

interface GroupWithColor {
  name: string;
  color: string;
}

interface GroupSelectionModalProps {
  currentGroups: string[];
  onClose: () => void;
  onGroupsChange: (groups: string[], overrideMode: boolean) => void;
  allowMultiple?: boolean;
  isBatchMode?: boolean;
  selectedMembersCount?: number;
  allGroupsFromMembers?: string[];
  availableGroups?: string[];
  availableGroupsWithColors?: GroupWithColor[];
  onManageGroups?: () => void;
}

export function GroupSelectionModal({
  currentGroups,
  onClose,
  onGroupsChange,
  allowMultiple = true,
  isBatchMode = false,
  selectedMembersCount = 0,
  availableGroups = [],
  availableGroupsWithColors = [],
  onManageGroups,
}: GroupSelectionModalProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideMode, setOverrideMode] = useState(false);

  // Use groups with colors if available, otherwise fallback to string array
  const groupsWithColors = availableGroupsWithColors.length > 0 
    ? availableGroupsWithColors 
    : availableGroups.map(name => ({ name, color: '#888888' }));

  const filteredGroups = groupsWithColors.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroup = (groupName: string) => {
    if (allowMultiple) {
      setSelectedGroups((prev) =>
        prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
      );
    } else {
      setSelectedGroups([groupName]);
    }
  };

  const handleSave = () => {
    onGroupsChange(selectedGroups, overrideMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-elevation-lg w-full max-w-[480px]"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--primary-background)' }}
              >
                <Users className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {isBatchMode ? 'Update Groups' : 'Select Groups'}
                </h3>
                {isBatchMode ? (
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    Updating {selectedMembersCount} member{selectedMembersCount > 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    Add to groups (optional)
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onManageGroups && (
                <button 
                  onClick={() => {
                    onManageGroups();
                    onClose();
                  }}
                  className="text-xs hover:underline transition-colors whitespace-nowrap"
                  style={{ color: 'var(--primary)' }}
                >
                  Manage Groups
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          {/* Groups List */}
          <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto border border-border rounded-lg p-3" style={{ backgroundColor: 'var(--background)' }}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Checkbox checked={selectedGroups.includes(group.name)} onChange={(e) => e.stopPropagation()} />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      <Users className="w-3 h-3" style={{ color: group.color }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {group.name}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  No groups found
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {/* Override Mode Toggle - Only show in batch mode */}
            {isBatchMode && (
              <button
                onClick={() => setOverrideMode(!overrideMode)}
                className="flex items-center gap-2 text-left"
              >
                <Checkbox 
                  checked={overrideMode} 
                  onChange={(e) => { e.stopPropagation(); setOverrideMode(!overrideMode); }} 
                />
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                  Override existing groups (replace instead of add)
                </span>
              </button>
            )}
            
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                {selectedGroups.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-opacity"
                 
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
