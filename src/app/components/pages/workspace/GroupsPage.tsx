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
  { id: 'member-10', name: 'James Mitchell', email: 'james.m@company.com', initials: 'JM', color: '#2F80ED' },
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
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-foreground"
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Groups
            </h1>
            <span className="px-2 py-0.5 text-[10px] bg-primary/8 text-primary rounded-full" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {groups.length}
            </span>
          </div>
          <p
            className="text-muted/70"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Manage groups to easily assign members and content access
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all flex-shrink-0"
          style={{
            backgroundColor: '#2F80ED',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
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
              <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>Name</span>
              <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>Members</span>
              <span className="text-[10px] text-muted uppercase tracking-wider" style={{ fontWeight: 'var(--font-weight-bold)' }}>Access</span>
              <div />
            </div>

            {/* Table Rows */}
            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="group grid items-center px-4 py-3.5 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all"
                  style={{
                    gridTemplateColumns: '40px 1fr 240px 280px 50px',
                    gap: '12px',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: group.color, fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {group.name.charAt(0).toUpperCase()}
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
                        className="px-2 py-1 border border-primary bg-card rounded-lg w-full max-w-[200px] outline-none text-sm text-foreground focus:ring-2 focus:ring-primary/10"
                        style={{ fontWeight: 'var(--font-weight-bold)' }}
                      />
                    ) : (
                      <>
                        <span
                          className="truncate cursor-pointer text-sm text-foreground"
                          onClick={() => handleStartRename(group)}
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          {group.name}
                        </span>
                        <button
                          onClick={() => handleStartRename(group)}
                          className="p-1 rounded-lg hover:bg-secondary transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0"
                          title="Rename group"
                        >
                          <Edit2 size={13} className="text-muted" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Members */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted whitespace-nowrap">
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary hover:border-primary/20 transition-all"
                      title="Manage access"
                    >
                      {group.projects.length > 0 ? (
                        <AccessSummary projectCount={group.projects.length} />
                      ) : (
                        <span className="text-xs text-muted">Add access</span>
                      )}
                    </button>
                  </div>

                  {/* Delete */}
                  <div className="flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDeleteModalGroup(group)}
                      className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-destructive/8 transition-colors"
                      title="Delete group"
                    >
                      <Trash2 size={15} className="text-muted hover:text-destructive transition-colors" />
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
