import { X, Settings } from 'lucide-react';

interface GroupsContextMenuProps {
  memberName: string;
  currentGroups: string[];
  onClose: () => void;
  onManageGroups: () => void;
}

const availableGroups = ['Asia Pacific', 'Europe', 'North America', 'Latin America', 'Middle East', 'Africa'];

export function GroupsContextMenu({ memberName, currentGroups, onClose, onManageGroups }: GroupsContextMenuProps) {
  return (
    <div
      className="rounded-lg shadow-elevation-sm w-[280px] bg-card border border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {memberName}'s Groups
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Groups List */}
        <div className="flex flex-col gap-px max-h-[250px] overflow-y-auto">
          {currentGroups.map((group) => (
            <div
              key={group}
              className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
            >
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                  {group}
                </p>
              </div>
            </div>
          ))}
          {currentGroups.length === 0 && (
            <p className="text-xs text-muted p-2 text-center">No groups assigned</p>
          )}
        </div>

        {/* Manage Button */}
        <button
          onClick={() => {
            onManageGroups();
            onClose();
          }}
          className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Settings className="w-3 h-3" />
          <span className="text-xs">Manage Groups</span>
        </button>
      </div>
    </div>
  );
}
