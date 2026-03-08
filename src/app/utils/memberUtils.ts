// Utility functions for member data

export interface MemberData {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role: string;
  status: 'active' | 'invited';
  groups: string[];
}

const avatarColors = ['#71edaa', '#b171ed', '#bfed71', '#71a2ed', '#ed7171', '#71edd9'];

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(id: string): string {
  // Generate a consistent color based on the id
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export function transformMemberForGroup(member: MemberData): { id: string; name: string; initials: string; color: string } {
  return {
    id: member.id,
    name: member.name,
    initials: member.initials,
    color: member.color,
  };
}
