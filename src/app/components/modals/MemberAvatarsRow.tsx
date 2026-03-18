import { UserPlus, Users } from 'lucide-react';

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface GroupAvatar {
  id: string;
  name: string;
  memberCount: number;
}

interface MemberAvatarsRowProps {
  members: Member[];
  groups?: GroupAvatar[];
  onAddClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveMember?: (memberId: string) => void;
  onRemoveGroup?: (groupId: string) => void;
  maxVisible?: number;
  showRemoveButton?: boolean;
  size?: 'sm' | 'md';
  addButtonRef?: React.RefObject<HTMLButtonElement>;
}

export function MemberAvatarsRow({
  members,
  groups = [],
  onAddClick,
  onRemoveMember,
  onRemoveGroup,
  maxVisible = 4,
  showRemoveButton = false,
  size = 'md',
  addButtonRef,
}: MemberAvatarsRowProps) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  const removeButtonSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';

  // Combine groups and members for display
  const allItems = [...groups.map(g => ({ ...g, type: 'group' as const })), ...members.map(m => ({ ...m, type: 'member' as const }))];
  const visibleItems = allItems.slice(0, maxVisible);
  const additionalCount = allItems.length - maxVisible;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className={`${sizeClasses} rounded-full flex items-center justify-center border-2 cursor-pointer hover:z-10 group/member relative`}
            style={{
              backgroundColor: item.type === 'group' ? 'var(--secondary)' : item.color,
              borderColor: 'var(--background)',
              fontWeight: '600',
            }}
          >
            {item.type === 'group' ? (
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            ) : (
              <span className="text-white">{item.initials}</span>
            )}

            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-2 px-2 py-1 rounded opacity-0 group-hover/member:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
              style={{
                backgroundColor: 'var(--popover)',
                color: 'var(--popover-foreground)',
                fontSize: 'var(--text-xs)',
                  boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
              }}
            >
              {item.type === 'group' ? (
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--popover-foreground)' }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'var(--popover-foreground)', fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                    {item.memberCount} members
                  </div>
                </div>
              ) : (
                item.name
              )}
            </div>

            {/* Remove button */}
            {showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.type === 'group' && onRemoveGroup) {
                    onRemoveGroup(item.id);
                  } else if (item.type === 'member' && onRemoveMember) {
                    onRemoveMember(item.id);
                  }
                }}
                className={`absolute -top-1 -right-1 ${removeButtonSize} rounded-full opacity-0 group-hover/member:opacity-100 transition-opacity text-xs flex items-center justify-center shadow-sm hover:scale-110`}
                title={item.type === 'group' ? 'Remove group' : 'Remove member'}
                style={{
                  backgroundColor: 'var(--destructive)',
                  color: 'var(--destructive-foreground)',
                    }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {additionalCount > 0 && (
          <div
            className={`${sizeClasses} rounded-full flex items-center justify-center border-2 font-medium`}
            style={{
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          >
            +{additionalCount}
          </div>
        )}
      </div>

      {onAddClick && (
        <button
          ref={addButtonRef}
          onClick={onAddClick}
          className={`${sizeClasses} rounded-full flex items-center justify-center border-2 border-dashed hover:bg-primary/5 hover:border-primary/30 transition-all`}
          title="Add members"
          style={{ borderColor: 'var(--border)' }}
        >
          <UserPlus className="w-3.5 h-3.5 text-muted" />
        </button>
      )}
    </div>
  );
}
