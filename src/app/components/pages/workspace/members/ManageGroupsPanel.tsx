import { useState } from 'react';
import { X, Users } from 'lucide-react';

interface ManageGroupsPanelProps {
  memberId: string;
  memberName: string;
  currentGroups: string[];
  onClose: () => void;
  onSave: (groups: string[]) => void;
}

const availableGroups = [
  { name: 'Group 1', members: 25 },
  { name: 'Japan sales', members: 30 },
  { name: 'Global sales', members: 15 },
];

export function ManageGroupsPanel({
  memberId,
  memberName,
  currentGroups,
  onClose,
  onSave,
}: ManageGroupsPanelProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentGroups);

  const toggleGroup = (groupName: string) => {
    if (selectedGroups.includes(groupName)) {
      setSelectedGroups(selectedGroups.filter(g => g !== groupName));
    } else {
      setSelectedGroups([...selectedGroups, groupName]);
    }
  };

  const handleSave = () => {
    onSave(selectedGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[var(--radius-lg)] shadow-elevation-sm w-full max-w-[400px]">
        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-foreground">Manage Groups</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member Info */}
          <div className="p-3 bg-secondary rounded-[var(--radius-lg)]">
            <p className="text-sm text-secondary-foreground">
              Managing groups for: <span className="font-bold">{memberName}</span>
            </p>
          </div>

          {/* Groups List */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted">Select groups to assign this member to:</p>
            <div className="max-h-[300px] overflow-auto border border-border rounded-[var(--radius-lg)] p-2">
              {availableGroups.map((group) => (
                <label
                  key={group.name}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-secondary cursor-pointer rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.name)}
                    onChange={() => toggleGroup(group.name)}
                    className="rounded border-border"
                  />
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{group.name}</p>
                    <p className="text-xs text-muted">{group.members} members</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Groups Summary */}
          {selectedGroups.length > 0 && (
            <div className="p-3 bg-accent/10 rounded-[var(--radius-lg)]">
              <p className="text-xs text-foreground mb-2">Selected groups ({selectedGroups.length}):</p>
              <div className="flex flex-wrap gap-1">
                {selectedGroups.map((group) => (
                  <span
                    key={group}
                    className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs flex items-center gap-1"
                  >
                    {group}
                    <button
                      onClick={() => toggleGroup(group)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-[var(--radius-button)] hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-button)] hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
