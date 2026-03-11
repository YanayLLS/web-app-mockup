import { createContext, useContext, useState, ReactNode } from 'react';
import { getRandomGroupColor } from '../constants/colors';

export { getRandomGroupColor } from '../constants/colors';

export interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

const initialGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Asia Pacific',
    color: '#2F80ED',
    members: [
      { id: 'member-1', name: 'Akira Jameson', initials: 'AJ', color: '#2F80ED' },
      { id: 'member-2', name: 'Ming Sun', initials: 'MS', color: '#E91E63' },
      { id: 'member-3', name: 'Priya Kapoor', initials: 'PK', color: '#FF9800' },
    ],
    projects: [],
  },
  {
    id: 'group-2',
    name: 'Europe',
    color: '#8404B3',
    members: [
      { id: 'member-4', name: 'Daniel Becker', initials: 'DB', color: '#00BCD4' },
      { id: 'member-5', name: 'Sophie Laurent', initials: 'SL', color: '#9C27B0' },
      { id: 'member-6', name: 'Erik Nilsson', initials: 'EN', color: '#11E874' },
      { id: 'member-7', name: 'Lucia Rossi', initials: 'LR', color: '#FF6B35' },
      { id: 'member-8', name: 'Tomasz Kowalski', initials: 'TK', color: '#2F80ED' },
    ],
    projects: [],
  },
  {
    id: 'group-3',
    name: 'North America',
    color: '#11E874',
    members: [
      { id: 'member-9', name: 'Rachel Torres', initials: 'RT', color: '#E91E63' },
      { id: 'member-10', name: 'James Mitchell', initials: 'JM', color: '#8404B3' },
      { id: 'member-11', name: 'Karen Wells', initials: 'KW', color: '#FF9800' },
      { id: 'member-12', name: 'Chris Anderson', initials: 'CA', color: '#00BCD4' },
    ],
    projects: [],
  },
];

interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  addGroup: (name: string) => Group;
  deleteGroup: (id: string) => void;
  renameGroup: (id: string, name: string) => void;
  addMembersToGroup: (groupId: string, members: Group['members']) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  updateGroupProjects: (groupId: string, projectIds: string[]) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

let nextGroupId = 4;

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);

  const addGroup = (name: string): Group => {
    const newGroup: Group = {
      id: `group-${nextGroupId++}`,
      name,
      color: getRandomGroupColor(),
      members: [],
      projects: [],
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const renameGroup = (id: string, name: string) => {
    setGroups(prev =>
      prev.map(g => (g.id === id ? { ...g, name } : g))
    );
  };

  const addMembersToGroup = (groupId: string, members: Group['members']) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const existingIds = new Set(g.members.map(m => m.id));
        const newMembers = members.filter(m => !existingIds.has(m.id));
        return { ...g, members: [...g.members, ...newMembers] };
      })
    );
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, members: g.members.filter(m => m.id !== memberId) }
          : g
      )
    );
  };

  const updateGroupProjects = (groupId: string, projectIds: string[]) => {
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, projects: projectIds } : g
      )
    );
  };

  const value: GroupsContextType = {
    groups,
    setGroups,
    addGroup,
    deleteGroup,
    renameGroup,
    addMembersToGroup,
    removeMemberFromGroup,
    updateGroupProjects,
  };

  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    console.warn('useGroups: GroupsContext is undefined, using fallback');
    return {
      groups: initialGroups,
      setGroups: (() => {}) as React.Dispatch<React.SetStateAction<Group[]>>,
      addGroup: () => initialGroups[0],
      deleteGroup: () => {},
      renameGroup: () => {},
      addMembersToGroup: () => {},
      removeMemberFromGroup: () => {},
      updateGroupProjects: () => {},
    };
  }
  return context;
}
