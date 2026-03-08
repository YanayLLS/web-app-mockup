import { useState } from 'react';
import { MembersPage, mockMembers, type Member } from './members/MembersPage';
import { InviteMembersPanel } from './members/InviteMembersPanel';
import { ManageGroupsPanel } from './members/ManageGroupsPanel';
import { Toast } from './members/Toast';

interface InvitedMember {
  id: string;
  email: string;
  group: string | null;
  projects: string[];
  role: any;
  invitedAt: Date;
}

interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface ManageGroupsState {
  memberId: string;
  memberName: string;
  currentGroups: string[];
}

const initialGroups: Group[] = [
  {
    id: '1',
    name: 'Asia Pacific',
    color: '#2f80ed',
    members: [
      { id: 'm1', name: 'Alex Johnson', initials: 'AJ', color: '#71edaa' },
      { id: 'm2', name: 'Sarah Chen', initials: 'SC', color: '#b171ed' },
      { id: 'm3', name: 'Mike Ross', initials: 'MR', color: '#71a2ed' },
    ],
    projects: ['p1', 'p2', 'p1f1i1', 'p2f1i1'],
  },
  {
    id: '2',
    name: 'Europe',
    color: '#11e874',
    members: [
      { id: 'm4', name: 'David Brown', initials: 'DB', color: '#bfed71' },
      { id: 'm5', name: 'Emma Wilson', initials: 'EW', color: '#ed7171' },
      { id: 'm6', name: 'James Taylor', initials: 'JT', color: '#71edd9' },
      { id: 'm7', name: 'Olivia Davis', initials: 'OD', color: '#b171ed' },
    ],
    projects: ['p1', 'p3', 'p1f1', 'p3f1i1'],
  },
  {
    id: '3',
    name: 'North America',
    color: '#f2994a',
    members: [
      { id: 'm8', name: 'Sophia Taylor', initials: 'ST', color: '#71a2ed' },
      { id: 'm9', name: 'Liam Anderson', initials: 'LA', color: '#71edaa' },
    ],
    projects: ['p2', 'p4', 'p2f1', 'p2f2i1'],
  },
  {
    id: '4',
    name: 'Latin America',
    color: '#9b51e0',
    members: [
      { id: 'm10', name: 'Ava White', initials: 'AW', color: '#bfed71' },
      { id: 'm11', name: 'Noah Jackson', initials: 'NJ', color: '#ed7171' },
    ],
    projects: ['p3', 'p5'],
  },
  {
    id: '5',
    name: 'Middle East',
    color: '#eb5757',
    members: [
      { id: 'm12', name: 'Emily Davis', initials: 'ED', color: '#71edd9' },
      { id: 'm13', name: 'James Wilson', initials: 'JW', color: '#b171ed' },
      { id: 'm14', name: 'Maria Smith', initials: 'MS', color: '#71a2ed' },
    ],
    projects: ['p1', 'p4'],
  },
  {
    id: '6',
    name: 'Africa',
    color: '#56ccf2',
    members: [
      { id: 'm1', name: 'Alex Johnson', initials: 'AJ', color: '#71edaa' },
      { id: 'm2', name: 'Sarah Chen', initials: 'SC', color: '#b171ed' },
    ],
    projects: ['p2', 'p3'],
  },
];

const defaultAvailableRoles = [
  { name: 'Owner', description: 'Full access to workspace and settings' },
  { name: 'Admin', description: 'Manage members and workspace settings' },
  { name: 'Operator', description: 'Execute procedures and complete tasks' },
  { name: 'Support Agent', description: 'Handle support requests and remote assistance' },
  { name: 'Content Creator', description: 'Create and manage procedures and content' },
];

export function MembersPageWrapper() {
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [manageGroupsState, setManageGroupsState] = useState<ManageGroupsState | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; subtitle?: string } | null>(null);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [groups] = useState<Group[]>(initialGroups);
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const handleInvite = (emails: string[], group: string | null, projects: string[], roles: any) => {
    const baseTimestamp = Date.now();
    const newInvitedMembers = emails.map((email, index) => ({
      id: `invited-${baseTimestamp}-${index}-${Math.random().toString(36).substring(2, 15)}`,
      email,
      group,
      projects,
      role: roles,
      invitedAt: new Date(),
    }));

    setInvitedMembers((prev) => [...prev, ...newInvitedMembers]);

    const count = emails.length;
    const subtitle = group
      ? `Added to ${group}`
      : projects.length > 0
        ? `Access to ${projects.length} project${projects.length > 1 ? 's' : ''}`
        : undefined;

    setShowToast({
      message: `${count} invitation${count > 1 ? 's' : ''} sent successfully!`,
      subtitle,
    });
  };

  const handleManageGroups = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setManageGroupsState({
        memberId,
        memberName: member.name,
        currentGroups: member.groups,
      });
    }
  };

  const handleSaveGroups = (savedGroups: string[]) => {
    setShowToast({
      message: `Groups updated for ${manageGroupsState?.memberName}`,
      subtitle: savedGroups.length > 0 ? savedGroups.join(', ') : 'No groups assigned',
    });
  };

  return (
    <>
      <MembersPage
        onInviteClick={() => setShowInvitePanel(true)}
        onManageGroups={handleManageGroups}
        roleSystem="new"
        invitedMembers={invitedMembers}
        groups={groups}
        publicFeatureEnabled={true}
        members={members}
        onMembersChange={setMembers}
        availableRoles={defaultAvailableRoles}
        roleAccessFeatureEnabled={false}
        complexFilteringEnabled={false}
      />

      {showInvitePanel && (
        <InviteMembersPanel
          onClose={() => setShowInvitePanel(false)}
          onInvite={handleInvite}
          roleSystem="new"
          groups={groups}
          publicFeatureEnabled={true}
          availableSeats={30 - members.length}
          totalSeats={30}
          availableRoles={defaultAvailableRoles}
        />
      )}

      {manageGroupsState && (
        <ManageGroupsPanel
          memberId={manageGroupsState.memberId}
          memberName={manageGroupsState.memberName}
          currentGroups={manageGroupsState.currentGroups}
          onClose={() => setManageGroupsState(null)}
          onSave={handleSaveGroups}
        />
      )}

      {showToast && (
        <Toast
          message={showToast.message}
          subtitle={showToast.subtitle}
          onClose={() => setShowToast(null)}
        />
      )}
    </>
  );
}
