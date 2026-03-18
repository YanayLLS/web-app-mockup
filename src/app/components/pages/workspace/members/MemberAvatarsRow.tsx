import { UserPlus, Users } from 'lucide-react';
import { MemberAvatar } from '../../../MemberAvatar';

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
  color?: string;
}

interface MemberAvatarsRowProps {
  members: Member[];
  groups?: GroupAvatar[];
  onAddClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveMember?: (memberId: string) => void;
  onRemoveGroup?: (groupId: string) => void;
  maxVisible?: number;
  showRemoveButton?: boolean;
  size?: 'sm' | 'md'; // sm = w-7 h-7, md = w-9 h-9
  addButtonRef?: React.RefObject<HTMLButtonElement>;
}

export function MemberAvatarsRow({
  members,
  groups = [],
  onAddClick,
  onRemoveMember,
  onRemoveGroup,
  maxVisible = 4,
  showRemoveButton = true,
  size = 'md',
  addButtonRef,
}: MemberAvatarsRowProps) {
  const totalCount = members.length + groups.length;
  const displayItems = [...groups, ...members];
  const visibleItems = displayItems.slice(0, maxVisible);
  const remainingCount = totalCount - maxVisible;

  const avatarSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const removeButtonSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const spacing = size === 'sm' ? '-space-x-2' : '-space-x-3';
  const containerGap = size === 'sm' ? 'gap-2' : 'gap-3';

  return (
    <div className={`flex items-center ${containerGap}`}>
      <div className={`flex items-center ${spacing}`}>
        {visibleItems.map((item, index) => {
          // Check if it's a group (has memberCount property)
          const isGroup = 'memberCount' in item;
          
          if (isGroup) {
            const group = item as GroupAvatar;
            const groupColor = group.color || 'var(--primary)';
            return (
              <div
                key={`group-${group.id}`}
                className={`${avatarSize} rounded-full flex items-center justify-center border-2 cursor-pointer hover:z-10 group/member relative`}
                style={{
                  backgroundColor: `${groupColor}20`,
                  borderColor: 'var(--background)',
                  
                }}
              >
                <Users className={iconSize} style={{ color: groupColor }} />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full mb-2 px-2 py-1 rounded hidden md:block md:opacity-0 md:group-hover/member:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                  style={{
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    fontSize: 'var(--text-xs)',
                    
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--popover-foreground)' }}>{group.name}</div>
                    <div style={{ color: 'var(--popover-foreground)', fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {showRemoveButton && onRemoveGroup && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveGroup(group.id);
                    }}
                    className={`absolute -top-1 -right-1 ${removeButtonSize} rounded-full md:opacity-0 md:group-hover/member:opacity-100 transition-opacity text-xs flex items-center justify-center shadow-sm hover:scale-110`}
                    style={{
                      backgroundColor: 'var(--destructive)',
                      color: 'var(--destructive-foreground)',
                      
                    }}
                    title="Remove group"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }
          
          // It's a member
          const member = item as Member;
          return (
            <MemberAvatar
              key={`member-${member.id}`}
              name={member.name}
              id={member.id}
              initials={member.initials}
              color={member.color}
              size={size === 'sm' ? 'md' : 'xl'}
              border
              onRemove={showRemoveButton && onRemoveMember ? (e) => { e.stopPropagation(); onRemoveMember(member.id); } : undefined}
              className="hover:z-10"
            />
          );
        })}
        {remainingCount > 0 && (
          <div
            className={`${avatarSize} rounded-full flex items-center justify-center ${textSize} border-2 font-medium`}
            style={{
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--background)',
              color: 'var(--foreground)',
              
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      {onAddClick && (
        <button
          ref={addButtonRef}
          onClick={(e) => onAddClick(e)}
          className={`${avatarSize} min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center border-2 border-dashed hover:bg-secondary transition-colors`}
          style={{ borderColor: 'var(--border)' }}
          title="Add members"
        >
          <UserPlus className={iconSize} style={{ color: 'var(--muted)' }} />
        </button>
      )}
    </div>
  );
}
