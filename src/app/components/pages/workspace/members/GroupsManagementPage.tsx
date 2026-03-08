import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Users, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import { ProjectAccessModal } from './ProjectAccessModal';
import { GroupDeleteModal } from './GroupDeleteModal';
import { EmptyState } from './EmptyState';
import { type Member, mockMembers } from './MembersPage';
import { getInitials, getAvatarColor } from '@/app/utils/memberUtils';
import { getRandomGroupColor } from '@/app/utils/groupUtils';
import { MemberAvatarsRow } from './MemberAvatarsRow';
import { AddMembersContextMenu, MemberOption } from './AddMembersContextMenu';
import { AccessSummary } from './AccessSummary';

export interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface GroupsManagementPageProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
  publicFeatureEnabled?: boolean;
  members?: Member[];
  onMembersChange?: (members: Member[]) => void;
}

export function GroupsManagementPage({ groups, onGroupsChange, publicFeatureEnabled = true, members = mockMembers, onMembersChange }: GroupsManagementPageProps) {
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteModalGroup, setDeleteModalGroup] = useState<Group | null>(null);

  const handleCreateGroup = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: 'New Group',
      color: getRandomGroupColor(),
      members: [],
      projects: [],
    };
    onGroupsChange([...groups, newGroup]);
    // Immediately enter edit mode for the new group
    setEditingGroupId(newGroup.id);
    setEditingName(newGroup.name);
  };

  const handleDeleteGroup = (group: Group) => {
    setDeleteModalGroup(group);
  };

  const confirmDeleteGroup = () => {
    if (deleteModalGroup) {
      onGroupsChange(groups.filter((g) => g.id !== deleteModalGroup.id));
      setDeleteModalGroup(null);
    }
  };

  const handleRenameGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditingGroupId(groupId);
      setEditingName(group.name);
    }
  };

  const saveRename = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    
    const oldName = group.name;
    const newName = editingName;
    
    // Update the group name
    onGroupsChange(groups.map((g) => (g.id === groupId ? { ...g, name: newName } : g)));
    
    // Update all members who have this group to use the new name
    if (onMembersChange && oldName !== newName) {
      const updatedMembers = members.map((member) => {
        if (member.groups.includes(oldName)) {
          return {
            ...member,
            groups: member.groups.map((g) => (g === oldName ? newName : g)),
          };
        }
        return member;
      });
      onMembersChange(updatedMembers);
    }
    
    setEditingGroupId(null);
    setEditingName('');
  };

  const cancelRename = () => {
    setEditingGroupId(null);
    setEditingName('');
  };

  const handleAddMembersClick = (groupId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const menuWidth = 320;
    const menuHeight = 500;
    
    let top = rect.bottom + 4;
    let left = rect.left;
    
    // Check if menu would go off right edge
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 16;
    }
    
    // Check if menu would go off bottom edge
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    
    setMenuPosition({ top, left });
    setShowMemberMenu(groupId);
  };

  const handleAddMembers = (groupId: string, memberIds: string[]) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Transform members data to the format needed for groups
    const membersToAdd = members
      .filter(m => memberIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name,
        initials: getInitials(m.name),
        color: getAvatarColor(m.id),
      }));

    onGroupsChange(groups.map((g) => {
      if (g.id === groupId) {
        const existingIds = g.members.map(m => m.id);
        const newMembers = membersToAdd.filter(m => !existingIds.includes(m.id));
        
        // Update members' groups
        // Note: In a real app, this would update the actual state
        members.forEach(member => {
          if (memberIds.includes(member.id) && !member.groups.includes(group.name)) {
            member.groups.push(group.name);
          }
        });
        
        return {
          ...g,
          members: [...g.members, ...newMembers],
        };
      }
      return g;
    }));
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    onGroupsChange(groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.filter(m => m.id !== memberId),
        };
      }
      return g;
    }));
  };

  const handleUpdateProjects = (groupId: string, projectIds: string[]) => {
    onGroupsChange(groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          projects: projectIds,
        };
      }
      return g;
    }));
  };

  const getAccessCounts = (projectIds: string[]) => {
    let projectCount = 0;
    let folderCount = 0;
    let itemCount = 0;

    projectIds.forEach(id => {
      if (/^p\d+$/.test(id)) {
        // Pure project ID (e.g., p1, p2)
        projectCount++;
      } else if (/^p\d+f\d+$/.test(id)) {
        // Folder ID (e.g., p1f1)
        folderCount++;
      } else if (/^p\d+f\d+i\d+$/.test(id)) {
        // Item ID (e.g., p1f1i1)
        itemCount++;
      }
    });

    return { projectCount, folderCount, itemCount };
  };

  useEffect(() => {
    if (!showMemberMenu) return;

    const handleClickOutside = () => {
      setShowMemberMenu(null);
      setMenuPosition(null);
    };

    // Delay adding the listener to avoid closing immediately on the same click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMemberMenu]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card" style={{ 
        padding: 'calc(var(--radius) * 1.5)',
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ 
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-weight-bold)',
            }}>
              Groups
            </h2>
            <p style={{ 
              color: 'var(--muted)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              marginTop: 'calc(var(--radius) * 0.25)',
            }}>
              Manage groups to easily assign members and content access
            </p>
          </div>
          <button
            onClick={handleCreateGroup}
            className="transition-opacity hover:opacity-90 flex items-center"
            style={{
              padding: 'calc(var(--radius) * 0.8) calc(var(--radius) * 1.2)',
              borderRadius: 'var(--radius-button)',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-base)',
              gap: 'calc(var(--radius) * 0.5)',
            }}
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div
        className="grid items-center border-b bg-card"
        style={{
          gridTemplateColumns: '40px 1fr 240px 280px 50px',
          padding: 'calc(var(--radius) * 0.8) calc(var(--radius) * 1.5)',
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <div></div>
        <span style={{ 
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Name
        </span>
        <span style={{ 
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Members
        </span>
        <span style={{ 
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
        }}>
          Access
        </span>
        <div></div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-auto bg-background">
        {groups.map((group) => (
          <div
            key={group.id}
            className="grid items-center border-b transition-colors"
            style={{
              gridTemplateColumns: '40px 1fr 240px 280px 50px',
              padding: 'calc(var(--radius) * 1.2) calc(var(--radius) * 1.5)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(233, 233, 233, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <Users className="w-4 h-4" style={{ color: group.color }} />
            </div>

            {/* Name */}
            <div className="pr-4 flex flex-col justify-center" style={{ minHeight: '52px' }}>
              {editingGroupId === group.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(group.id);
                      if (e.key === 'Escape') cancelRename();
                    }}
                    className="px-2 py-1 border rounded text-sm bg-card focus:outline-none focus:ring-2"
                    style={{ 
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => saveRename(group.id)}
                    className="px-2 py-1 rounded text-xs hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      fontFamily: 'var(--font-family)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelRename}
                    className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      fontFamily: 'var(--font-family)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                      {group.name}
                    </p>
                    <button
                      onClick={() => handleRenameGroup(group.id)}
                      className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                    </button>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </p>
                </>
              )}
            </div>

            {/* Members */}
            <MemberAvatarsRow
              members={group.members}
              onAddClick={(e) => handleAddMembersClick(group.id, e)}
              onRemoveMember={(memberId) => handleRemoveMember(group.id, memberId)}
              maxVisible={4}
              showRemoveButton={true}
            />

            {/* Access */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProjectModal(group.id)}
                className="text-sm px-4 py-2 border transition-colors font-medium"
                style={{ 
                  color: 'var(--foreground)', 
                  fontFamily: 'var(--font-family)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {group.projects.length > 0 ? (
                  <AccessSummary {...getAccessCounts(group.projects)} />
                ) : (
                  <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>Add access</span>
                )}
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDeleteGroup(group)}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ borderRadius: 'var(--radius-md)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--destructive-background)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Trash2 className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
            </button>
          </div>
        ))}

        {/* Empty State */}
        {groups.length === 0 && (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create groups to organize members and manage their access to projects collectively. Groups make it easy to assign permissions to multiple people at once."
            action={{
              label: "Create Group",
              onClick: handleCreateGroup
            }}
          />
        )}
      </div>

      {/* Add Members Context Menu */}
      {showMemberMenu && menuPosition && (
        <AddMembersContextMenu
          onClose={() => {
            setShowMemberMenu(null);
            setMenuPosition(null);
          }}
          onSave={(memberIds, groupIds) => {
            handleAddMembers(showMemberMenu, memberIds);
            setShowMemberMenu(null);
            setMenuPosition(null);
          }}
          availableMembers={members.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            initials: getInitials(m.name),
            color: getAvatarColor(m.id),
            role: m.role,
            groups: m.groups,
          }))}
          selectedMemberIds={groups.find(g => g.id === showMemberMenu)?.members.map(m => m.id) || []}
          showGroups={false}
          title="Manage Group Members"
          position={menuPosition}
        />
      )}

      {/* Project Access Modal */}
      {showProjectModal && (
        <ProjectAccessModal
          currentProjects={groups.find((g) => g.id === showProjectModal)?.projects || []}
          onClose={() => setShowProjectModal(null)}
          onSave={(projectIds) => {
            handleUpdateProjects(showProjectModal, projectIds);
            setShowProjectModal(null);
          }}
          groups={groups}
          publicFeatureEnabled={publicFeatureEnabled}
        />
      )}

      {/* Delete Modal */}
      {deleteModalGroup && (
        <GroupDeleteModal
          groupName={deleteModalGroup.name}
          memberCount={deleteModalGroup.members.length}
          onConfirm={confirmDeleteGroup}
          onCancel={() => setDeleteModalGroup(null)}
        />
      )}
    </div>
  );
}