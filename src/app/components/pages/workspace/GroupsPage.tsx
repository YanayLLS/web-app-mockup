import { useState, useRef, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { useGroups, Group, getRandomGroupColor } from '@/app/contexts/GroupsContext';
import { GroupDeleteModal } from '@/app/components/modals/GroupDeleteModal';
import { EmptyState } from '@/app/components/modals/EmptyState';
import { MemberAvatarsRow, Member } from '@/app/components/modals/MemberAvatarsRow';
import { AccessSummary } from '@/app/components/modals/AccessSummary';
import { AddMembersContextMenu, MemberOption } from '@/app/components/modals/AddMembersContextMenu';

const allMembersData: MemberOption[] = [
  { id: 'member-1', name: 'Akira Jameson', email: 'akira.j@company.com', initials: 'AJ', color: '#2F80ED' },
  { id: 'member-2', name: 'Ming Sun', email: 'ming.s@company.com', initials: 'MS', color: '#E91E63' },
  { id: 'member-3', name: 'Priya Kapoor', email: 'priya.k@company.com', initials: 'PK', color: '#FF9800' },
  { id: 'member-4', name: 'Daniel Becker', email: 'daniel.b@company.com', initials: 'DB', color: '#00BCD4' },
  { id: 'member-5', name: 'Sophie Laurent', email: 'sophie.l@company.com', initials: 'SL', color: '#9C27B0' },
  { id: 'member-6', name: 'Erik Nilsson', email: 'erik.n@company.com', initials: 'EN', color: '#11E874' },
  { id: 'member-7', name: 'Lucia Rossi', email: 'lucia.r@company.com', initials: 'LR', color: '#FF6B35' },
  { id: 'member-8', name: 'Tomasz Kowalski', email: 'tomasz.k@company.com', initials: 'TK', color: '#2F80ED' },
  { id: 'member-9', name: 'Rachel Torres', email: 'rachel.t@company.com', initials: 'RT', color: '#E91E63' },
  { id: 'member-10', name: 'James Mitchell', email: 'james.m@company.com', initials: 'JM', color: '#8404B3' },
  { id: 'member-11', name: 'Karen Wells', email: 'karen.w@company.com', initials: 'KW', color: '#FF9800' },
  { id: 'member-12', name: 'Chris Anderson', email: 'chris.a@company.com', initials: 'CA', color: '#00BCD4' },
];

export function GroupsPage() {
  const { groups, addGroup, deleteGroup, renameGroup, addMembersToGroup, removeMemberFromGroup } = useGroups();

  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteModalGroup, setDeleteModalGroup] = useState<Group | null>(null);
  const [addMembersGroupId, setAddMembersGroupId] = useState<string | null>(null);
  const [addMembersPosition, setAddMembersPosition] = useState<{ top: number; left: number } | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const addButtonRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>({});

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingGroupId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingGroupId]);

  const handleCreateGroup = () => {
    const newGroup = addGroup('New Group');
    // Enter rename mode immediately
    setRenamingGroupId(newGroup.id);
    setRenameValue(newGroup.name);
  };

  const handleStartRename = (group: Group) => {
    setRenamingGroupId(group.id);
    setRenameValue(group.name);
  };

  const handleFinishRename = () => {
    if (renamingGroupId && renameValue.trim()) {
      renameGroup(renamingGroupId, renameValue.trim());
    }
    setRenamingGroupId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setRenamingGroupId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModalGroup) {
      deleteGroup(deleteModalGroup.id);
      setDeleteModalGroup(null);
    }
  };

  const handleAddMembersClick = (groupId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAddMembersPosition({ top: rect.bottom + 4, left: rect.left });
    setAddMembersGroupId(groupId);
  };

  const handleAddMembersSave = (memberIds: string[]) => {
    if (addMembersGroupId) {
      const membersToAdd = allMembersData
        .filter(m => memberIds.includes(m.id))
        .map(m => ({ id: m.id, name: m.name, initials: m.initials, color: m.color }));
      addMembersToGroup(addMembersGroupId, membersToAdd);
    }
  };

  // Get or create a ref for each group's add button
  const getAddButtonRef = (groupId: string): React.RefObject<HTMLButtonElement> => {
    if (!addButtonRefs.current[groupId]) {
      addButtonRefs.current[groupId] = { current: null } as React.RefObject<HTMLButtonElement>;
    }
    return addButtonRefs.current[groupId];
  };

  return (
    <div className="flex flex-col h-full bg-background" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Header */}
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-foreground mb-1"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--font-weight-bold)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Groups
          </h1>
          <p
            className="text-muted"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)',
            }}
          >
            Manage groups to easily assign members and content access
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="flex items-center gap-2 px-4 py-2 min-h-[44px] text-white rounded-[var(--radius-button)] hover:opacity-90 transition-colors flex-shrink-0"
          style={{
            backgroundColor: '#2F80ED',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-family)',
          }}
        >
          <Plus size={16} />
          <span>Create Group</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create groups to organize members and manage content access more efficiently."
            action={{ label: 'Create Group', onClick: handleCreateGroup }}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
            {/* Table Header */}
            <div
              className="grid items-center px-4 py-2 mb-1"
              style={{
                gridTemplateColumns: '40px 1fr 240px 280px 50px',
                gap: '12px',
              }}
            >
              <div />
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Name
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Members
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Access
              </span>
              <div />
            </div>

            {/* Table Rows */}
            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="group grid items-center px-4 py-3 rounded-[var(--radius)] hover:bg-secondary/50 transition-colors"
                  style={{
                    gridTemplateColumns: '40px 1fr 240px 280px 50px',
                    gap: '12px',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: group.color }}
                  >
                    <Users size={16} className="text-white" />
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    {renamingGroupId === group.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={handleRenameKeyDown}
                        className="px-2 py-1 border rounded-[var(--radius)] w-full max-w-[200px] focus:outline-none"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-family)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--foreground)',
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--primary)',
                          boxShadow: '0 0 0 2px var(--primary-background)',
                        }}
                      />
                    ) : (
                      <>
                        <span
                          className="truncate cursor-pointer"
                          onClick={() => handleStartRename(group)}
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-bold)',
                            fontFamily: 'var(--font-family)',
                            color: 'var(--foreground)',
                          }}
                        >
                          {group.name}
                        </span>
                        <button
                          onClick={() => handleStartRename(group)}
                          className="p-1 rounded-[var(--radius)] hover:bg-secondary transition-colors md:opacity-0 md:group-hover:opacity-100"
                          style={{ flexShrink: 0 }}
                          title="Rename group"
                        >
                          <Edit2 size={13} style={{ color: 'var(--muted)' }} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Members */}
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family)',
                        color: 'var(--muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                    <MemberAvatarsRow
                      members={group.members as Member[]}
                      onAddClick={(e) => handleAddMembersClick(group.id, e)}
                      onRemoveMember={(memberId) => removeMemberFromGroup(group.id, memberId)}
                      maxVisible={3}
                      size="sm"
                      addButtonRef={getAddButtonRef(group.id)}
                    />
                  </div>

                  {/* Access */}
                  <div className="flex items-center">
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] hover:bg-secondary transition-colors"
                      style={{
                        border: '1px solid var(--border)',
                      }}
                      title="Manage access"
                    >
                      {group.projects.length > 0 ? (
                        <AccessSummary projectCount={group.projects.length} />
                      ) : (
                        <span
                          style={{
                            color: 'var(--muted)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-xs)',
                          }}
                        >
                          Add access
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Delete */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setDeleteModalGroup(group)}
                      className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius)] hover:bg-destructive/10 transition-colors"
                      title="Delete group"
                    >
                      <Trash2 size={16} style={{ color: '#FF1F1F' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalGroup && (
        <GroupDeleteModal
          groupName={deleteModalGroup.name}
          memberCount={deleteModalGroup.members.length}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalGroup(null)}
        />
      )}

      {/* Add Members Context Menu */}
      {addMembersGroupId && (
        <AddMembersContextMenu
          onClose={() => {
            setAddMembersGroupId(null);
            setAddMembersPosition(null);
          }}
          onSave={(memberIds) => handleAddMembersSave(memberIds)}
          availableMembers={allMembersData}
          selectedMemberIds={
            groups.find(g => g.id === addMembersGroupId)?.members.map(m => m.id) || []
          }
          title="Add Members to Group"
          position={addMembersPosition}
        />
      )}
    </div>
  );
}
