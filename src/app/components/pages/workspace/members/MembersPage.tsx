import { useState, useRef, useEffect, useCallback } from 'react';
import { Filter, ChevronDown, MoreHorizontal, Trash2, X, Search, ArrowUpDown, Crown, Users } from 'lucide-react';
import svgPaths from '@/imports/svg-hajybgkzcm';
import { GroupContextMenu } from './GroupContextMenu';
import { GroupSelectionModal } from './GroupSelectionModal';
import { ProjectAccessModal } from './ProjectAccessModal';
import { RoleManagementModal } from './RoleManagementModal';
import { SimpleRolesContextMenu } from './SimpleRolesContextMenu';
import { Checkbox } from './Checkbox';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ResizableColumnHeader } from './ResizableColumnHeader';
import { MultiSelectFilterModal } from './MultiSelectFilterModal';
import { EmptyState } from './EmptyState';
import { UndoToast } from './UndoToast';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { calculateMenuPosition } from '@/app/utils/positionUtils';
import { AccessSummary } from './AccessSummary';
import { RequestSeatsModal } from './RequestSeatsModal';
import { type RoleWithDescription } from './SimpleRolesContextMenu';
import { FilterBuilderModal, type FilterGroup } from './FilterBuilderModal';
import { useRole, hasAccess } from '@/app/contexts/RoleContext';
import { MemberAvatar } from '../../../MemberAvatar';

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  // Handle invalid or special dates
  if (!dateString || dateString === 'Never') {
    return '';
  }
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Try to parse as a simple date string like "October 10"
    return dateString;
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) {
    return 'Now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else {
    // For anything more than yesterday, show the actual date
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  invitedBy: string;
  invitedOn: string;
  access: string;
  accessProjects?: string[]; // Individual projects
  accessItems?: string[]; // Individual items (not part of a project)
  groups: string[];
  status: 'active' | 'invited';
}

interface InvitedMemberData {
  id: string;
  email: string;
  group: string | null;
  projects: string[];
  role: any;
  invitedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface MembersPageProps {
  onInviteClick: () => void;
  onManageGroups: (memberId: string) => void;
  roleSystem?: 'new' | 'today';
  onNavigateToRoles?: () => void;
  onNavigateToGroups?: () => void;
  invitedMembers?: InvitedMemberData[];
  groups: Group[];
  publicFeatureEnabled?: boolean;
  members?: Member[];
  onMembersChange?: (members: Member[]) => void;
  initialRoleFilter?: string | null;
  onClearInitialFilter?: () => void;
  availableRoles?: RoleWithDescription[];
  roleAccessRules?: { [contentId: string]: string[] };
  roleAccessFeatureEnabled?: boolean;
  complexFilteringEnabled?: boolean;
}

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@acmecorp.com',
    role: 'Owner',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    invitedBy: 'Self',
    invitedOn: '10/25/2023',
    access: 'Worldwide Infrastructure +2',
    accessProjects: ['Worldwide Infrastructure', 'Europe Operations', 'Asia Operations'],
    accessItems: [],
    groups: ['Asia Pacific', 'Europe'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Maria Smith',
    email: 'maria.smith@acmecorp.com',
    role: 'Admin',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    invitedBy: 'Alex Johnson',
    invitedOn: '10/26/2023',
    access: 'Europe Operations +3',
    accessProjects: ['Europe Operations'],
    accessItems: ['Berlin Maintenance', 'Paris Maintenance', 'London Support'],
    groups: ['North America'],
    status: 'active',
  },
  {
    id: '3',
    name: 'David Brown',
    email: 'david.brown@acmecorp.com',
    role: 'Operator',
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (Today)
    invitedBy: 'Alex Johnson',
    invitedOn: '10/27/2023',
    access: 'Asia Operations',
    accessProjects: ['Asia Operations'],
    accessItems: [],
    groups: ['Asia Pacific'],
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@acmecorp.com',
    role: 'Support Agent',
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    invitedBy: 'Maria Smith',
    invitedOn: '10/28/2023',
    access: 'Regional Analytics +4',
    accessProjects: ['Regional Analytics'],
    accessItems: ['Europe Dashboard', 'Asia Dashboard', 'Global Overview', '24/7 Helpdesk'],
    groups: [],
    status: 'active',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james.wilson@acmecorp.com',
    role: 'Content Creator',
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    invitedBy: 'Alex Johnson',
    invitedOn: '10/29/2023',
    access: 'Field Services +6',
    accessProjects: ['Field Services', 'Worldwide Infrastructure'],
    accessItems: ['Rome Maintenance', 'Madrid Operations', 'Milan Support', 'Barcelona Support'],
    groups: ['Europe', 'North America'],
    status: 'active',
  },
  {
    id: '6',
    name: 'Sophia Taylor',
    email: 'sophia.taylor@acmecorp.com',
    role: '',
    lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (1 week)
    invitedBy: 'Maria Smith',
    invitedOn: '10/30/2023',
    access: 'Worldwide Infrastructure +1',
    accessProjects: ['Worldwide Infrastructure', 'Europe Operations'],
    accessItems: [],
    groups: ['Asia Pacific', 'North America'],
    status: 'active',
  },
  {
    id: '7',
    name: 'Liam Anderson',
    email: 'liam.anderson@acmecorp.com',
    role: 'Content Creator',
    lastActive: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago (1 month)
    invitedBy: 'Noah Jackson',
    invitedOn: '10/31/2023',
    access: 'Asia Operations +',
    accessProjects: [],
    accessItems: ['Tokyo Maintenance'],
    groups: [],
    status: 'active',
  },
  {
    id: '8',
    name: 'Olivia Thomas',
    email: 'olivia.thomas@acmecorp.com',
    role: 'Content Creator',
    lastActive: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago (3 months)
    invitedBy: 'Maria Smith',
    invitedOn: '11/01/2023',
    access: 'Field Services +3',
    accessProjects: ['Field Services'],
    accessItems: ['Berlin Office', 'Vienna Office', 'Amsterdam Office'],
    groups: ['Europe'],
    status: 'active',
  },
  {
    id: '9',
    name: 'Noah Jackson',
    email: 'noah.jackson@acmecorp.com',
    role: 'Admin',
    lastActive: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // Over a year ago
    invitedBy: 'Alex Johnson',
    invitedOn: '11/02/2023',
    access: 'Europe Operations +3',
    accessProjects: ['Europe Operations'],
    accessItems: ['Munich Operations', 'Hamburg Support', 'Lyon Operations'],
    groups: [],
    status: 'active',
  },
  {
    id: '10',
    name: 'Ava White',
    email: 'ava.white@acmecorp.com',
    role: 'Support Agent',
    lastActive: 'October 10',
    invitedBy: 'Noah Jackson',
    invitedOn: '11/03/2023',
    access: 'Asia Operations',
    accessProjects: ['Asia Operations'],
    accessItems: [],
    groups: ['North America'],
    status: 'active',
  },
  {
    id: '11',
    name: 'Systems Architect',
    email: 'systems.architect@acmecorp.com',
    role: 'Operator',
    lastActive: 'October 11',
    invitedBy: 'Alex Johnson',
    invitedOn: '11/04/2023',
    access: 'Worldwide Infrastructure +7',
    accessProjects: ['Worldwide Infrastructure'],
    accessItems: ['Berlin Maintenance', 'Munich Operations', 'Hamburg Support', 'Paris Maintenance', 'Lyon Operations', 'London Support', 'Manchester Operations'],
    groups: [],
    status: 'invited',
  },
  {
    id: '12',
    name: 'Cloud Engineer',
    email: 'cloud.engineer@acmecorp.com',
    role: 'Operator',
    lastActive: 'October 12',
    invitedBy: 'Maria Smith',
    invitedOn: '11/05/2023',
    access: 'Regional Analytics +4',
    accessProjects: ['Regional Analytics'],
    accessItems: ['24/7 Helpdesk', 'Remote Monitoring', 'Emergency Response', 'Global Overview'],
    groups: [],
    status: 'invited',
  },
];

const availableProjects = [
  'Worldwide Infrastructure',
  'Europe Operations',
  'Asia Operations',
  'Regional Analytics',
  'Field Services',
];
// Import project hierarchy for ID mapping
import { projectsHierarchy } from './ProjectAccessModal';

// Helper function to get project/folder/item name by ID
function getProjectItemName(id: string): string | null {
  const findInNode = (node: any): string | null => {
    if (node.id === id) return node.name;
    if (node.children) {
      for (const child of node.children) {
        const found = findInNode(child);
        if (found) return found;
      }
    }
    return null;
  };

  for (const project of projectsHierarchy) {
    const found = findInNode(project);
    if (found) return found;
  }
  return null;
}

// Helper function to get project/folder/item ID by name
function getProjectItemId(name: string): string | null {
  const findInNode = (node: any): string | null => {
    if (node.name === name) return node.id;
    if (node.children) {
      for (const child of node.children) {
        const found = findInNode(child);
        if (found) return found;
      }
    }
    return null;
  };

  for (const project of projectsHierarchy) {
    const found = findInNode(project);
    if (found) return found;
  }
  return null;
}

// Helper function to get full path name (e.g., "Worldwide Infrastructure: Germany Team")
function getProjectItemFullPath(id: string): string {
  const findPathInNode = (node: any, path: string[] = []): string[] | null => {
    const currentPath = [...path, node.name];
    if (node.id === id) return currentPath;
    if (node.children) {
      for (const child of node.children) {
        const found = findPathInNode(child, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  for (const project of projectsHierarchy) {
    const found = findPathInNode(project);
    if (found) return found.join(': ');
  }
  return id; // Fallback to ID if not found
}

// Helper to categorize and count access IDs
function categorizeAccessIds(ids: string[]): { projects: number; folders: number; items: number } {
  let projects = 0, folders = 0, items = 0;
  ids.forEach(id => {
    if (/^p\d+$/.test(id)) {
      projects++;
    } else if (/^p\d+f\d+$/.test(id)) {
      folders++;
    } else if (/^p\d+f\d+i\d+$/.test(id)) {
      items++;
    }
  });
  return { projects, folders, items };
}

// Helper to format access chip display
function formatAccessChipLabel(ids: string[]): string {
  if (ids.length === 0) return '';
  if (ids.length === 1) return getProjectItemFullPath(ids[0]);
  
  const { projects, folders, items } = categorizeAccessIds(ids);
  const parts: string[] = [];
  if (projects > 0) parts.push(`${projects} Project${projects > 1 ? 's' : ''}`);
  if (folders > 0) parts.push(`${folders} Folder${folders > 1 ? 's' : ''}`);
  if (items > 0) parts.push(`${items} Item${items > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

// Default roles that match the RolesManagementPage
const defaultAvailableRoles = [
  'Owner', // Special role - not modifiable
  'Admin',
  'Operator',
  'Support Agent',
  'Content Creator',
];

export function MembersPage({ onInviteClick, onManageGroups, roleSystem = 'new', onNavigateToRoles, onNavigateToGroups, invitedMembers = [], groups, publicFeatureEnabled = true, members: externalMembers, onMembersChange, initialRoleFilter, onClearInitialFilter, availableRoles: externalAvailableRoles, roleAccessRules = {}, roleAccessFeatureEnabled = true, complexFilteringEnabled = false }: MembersPageProps) {
  // Role-based access control
  const { currentRole } = useRole();
  const isAdmin = hasAccess(currentRole, 'workspace-management');

  // Extract group names from groups data
  const availableGroups = groups.map(g => g.name);

  // Helper function to get group color by name
  const getGroupColor = (groupName: string): string => {
    const group = groups.find(g => g.name === groupName);
    return group?.color || '#888888';
  };

  // Use external roles if provided, otherwise use default roles
  const availableRoles = externalAvailableRoles || defaultAvailableRoles;
  const [internalMembers, setInternalMembers] = useState<Member[]>(mockMembers);
  
  // Use external members if provided, otherwise use internal state
  const members = externalMembers || internalMembers;
  const setMembers = onMembersChange || setInternalMembers;
  const [processedInviteIds, setProcessedInviteIds] = useState<string[]>([]);

  // Seat management
  const TOTAL_SEATS = 30;
  const takenSeats = members.length;
  const availableSeats = TOTAL_SEATS - takenSeats;
  const seatPercentageUsed = (takenSeats / TOTAL_SEATS) * 100;
  
  // Determine seat status color
  const getSeatStatusColor = () => {
    if (availableSeats === 0) return { icon: 'var(--destructive)', bg: 'var(--destructive-background)', iconPath: 'M6 18L18 6M6 6l12 12' }; // X icon
    if (seatPercentageUsed >= 90) return { icon: 'var(--warning)', bg: 'rgba(255, 193, 7, 0.1)', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }; // Warning icon
    return { icon: 'var(--success)', bg: 'var(--success-background)', iconPath: 'M5 13l4 4L19 7' }; // Check icon
  };
  
  const seatStatus = getSeatStatusColor();
  
  const [showRequestSeatsModal, setShowRequestSeatsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showFilterProjectsModal, setShowFilterProjectsModal] = useState(false);
  const [showFilterGroupsModal, setShowFilterGroupsModal] = useState<{ top: number; left: number } | null>(null);
  const [showFilterRolesModal, setShowFilterRolesModal] = useState<{ top: number; left: number } | null>(null);
  const [showGroupsModal, setShowGroupsModal] = useState<{ id: string; position: { top: number; left?: number; right?: number } } | null>(null);
  const [showAccessModal, setShowAccessModal] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<{ id: string; position: { top: number; left?: number; right?: number } } | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showBatchGroupsModal, setShowBatchGroupsModal] = useState(false);
  const [showBatchAccessModal, setShowBatchAccessModal] = useState(false);
  const [showBatchRoleModal, setShowBatchRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{ type: 'single' | 'batch', id?: string } | null>(null);
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState<string | null>(null);
  const [showMemberActionsMenu, setShowMemberActionsMenu] = useState<{ id: string; position: { top: number; left?: number; right?: number } } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    name: 200,
    email: 200,
    role: 180,
    lastActive: 120,
    invitedBy: 120,
    invitedOn: 120,
    groups: 200,
    access: 150,
  });
  const [undoData, setUndoData] = useState<{ members: Member[], message: string } | null>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Complex filtering state
  const [showFilterBuilderModal, setShowFilterBuilderModal] = useState(false);
  const [complexFilters, setComplexFilters] = useState<FilterGroup[]>([]);

  // Convert invited members to Member objects and add to members list
  const convertInvitedMemberToMember = useCallback((invited: InvitedMemberData): Member => {
    const today = new Date();
    const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    // Extract name from email (before @)
    const name = invited.email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Format role for display
    let roleDisplay = '';
    if (roleSystem === 'new') {
      roleDisplay = invited.role?.selectedRole || 'Operator';
    } else {
      const roles = [];
      if (invited.role?.training && invited.role.training !== 'None') roles.push(invited.role.training);
      if (invited.role?.content && invited.role.content !== 'None') roles.push(invited.role.content);
      if (invited.role?.administration && invited.role.administration !== 'None') roles.push(invited.role.administration);
      roleDisplay = roles.length > 0 ? roles.join(', ') : 'None';
    }

    // Format access display
    let accessDisplay = '';
    const groups = invited.group ? [invited.group] : [];
    if (groups.length > 0) {
      accessDisplay = `via ${groups[0]}`;
      if (groups.length > 1) {
        accessDisplay += ` +${groups.length - 1}`;
      }
    } else if (invited.projects.length > 0) {
      accessDisplay = invited.projects[0];
      if (invited.projects.length > 1) {
        accessDisplay += ` +${invited.projects.length - 1}`;
      }
    } else {
      accessDisplay = 'No access';
    }

    return {
      id: invited.id,
      name: name,
      email: invited.email,
      role: roleDisplay,
      lastActive: 'Never',
      invitedBy: 'You',
      invitedOn: formattedDate,
      access: accessDisplay,
      accessProjects: invited.projects,
      accessItems: [],
      groups: groups,
      status: 'invited',
    };
  }, [roleSystem]);

  // Add invited members to the members list
  useEffect(() => {
    const newInvites = invitedMembers.filter(
      (invite) => !processedInviteIds.includes(invite.id)
    );

    if (newInvites.length > 0) {
      const newMembers = newInvites.map(convertInvitedMemberToMember);
      setMembers((prevMembers) => {
        // Double-check that we're not adding duplicates
        const existingIds = new Set(prevMembers.map(m => m.id));
        const uniqueNewMembers = newMembers.filter(m => !existingIds.has(m.id));
        return [...uniqueNewMembers, ...prevMembers];
      });
      setProcessedInviteIds((prev) => [...prev, ...newInvites.map((inv) => inv.id)]);
    }
  }, [invitedMembers, convertInvitedMemberToMember]);

  // Cleanup any duplicate IDs in members list
  useEffect(() => {
    setMembers((prevMembers) => {
      const seen = new Set<string>();
      const uniqueMembers = prevMembers.filter((member) => {
        if (seen.has(member.id)) {
          return false; // Skip duplicates
        }
        seen.add(member.id);
        return true;
      });
      return uniqueMembers;
    });
  }, []); // Run once on mount

  // Apply initial role filter from navigation
  useEffect(() => {
    if (initialRoleFilter) {
      setSelectedRoles([initialRoleFilter]);
      // Clear the initial filter after applying it
      if (onClearInitialFilter) {
        onClearInitialFilter();
      }
    }
  }, [initialRoleFilter, onClearInitialFilter]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#71edaa', '#b171ed', '#bfed71', '#71a2ed', '#ed7171', '#71edd9'];
    return colors[index % colors.length];
  };

  // Get inviter details for avatar display
  const getInviterDetails = (inviterName: string) => {
    // Handle "Self" case for owner - no inviter
    if (inviterName === 'Self') {
      return null;
    }
    
    const member = members.find(m => m.name === inviterName);
    if (member) {
      const memberIndex = members.indexOf(member);
      return {
        name: inviterName,
        initials: getInitials(inviterName),
        color: getAvatarColor(memberIndex),
      };
    }
    // Default for non-member inviters
    return {
      name: inviterName,
      initials: getInitials(inviterName),
      color: '#71a2ed',
    };
  };

  // Helper function to get access count from groups
  const getGroupAccessCount = (member: Member) => {
    let projectCount = 0;
    let folderCount = 0;
    let itemCount = 0;
    
    // Collect all group access IDs
    const groupAccessIds = new Set<string>();
    member.groups.forEach(groupName => {
      const group = groups.find(g => g.name === groupName);
      if (group) {
        group.projects.forEach(id => groupAccessIds.add(id));
      }
    });
    
    // Count projects, folders, and items from group access
    groupAccessIds.forEach(id => {
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

  const formatAccessDisplay = (member: Member) => {
    const directProjects = member.accessProjects || [];
    const directItems = member.accessItems || [];
    const groupAccess = getGroupAccessCount(member);
    
    // Count direct projects and folders
    let directProjectCount = 0;
    let directFolderCount = 0;
    let directItemCount = directItems.length;
    
    directProjects.forEach(id => {
      if (/^p\d+$/.test(id)) {
        directProjectCount++;
      } else if (/^p\d+f\d+$/.test(id)) {
        directFolderCount++;
      }
    });
    
    // Total unique access (this is approximate since we can't deduplicate without knowing mappings)
    const totalProjects = directProjectCount + groupAccess.projectCount;
    const totalFolders = directFolderCount + groupAccess.folderCount;
    const totalItems = directItemCount + groupAccess.itemCount;
    
    if (totalProjects === 0 && totalFolders === 0 && totalItems === 0) {
      return null;
    }
    
    return { projects: totalProjects, folders: totalFolders, items: totalItems };
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProjects([]);
    setSelectedGroups([]);
    setSelectedRoles([]);
    setComplexFilters([]);
  };

  const hasActiveFilters = searchQuery || selectedProjects.length > 0 || selectedGroups.length > 0 || selectedRoles.length > 0 || complexFilters.length > 0;

  const handleSelectAll = () => {
    const filtered = filteredMembers;
    if (selectedMembers.length === filtered.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filtered.map(m => m.id));
    }
  };

  const handleSelectMember = (memberId: string, index: number, shiftKey: boolean = false) => {
    if (shiftKey && lastClickedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = sortedMembers.slice(start, end + 1).map(m => m.id);
      
      // Add all members in range to selection
      const newSelection = [...new Set([...selectedMembers, ...rangeIds])];
      setSelectedMembers(newSelection);
      setLastClickedIndex(index);
    } else {
      // Normal click: toggle single member
      if (selectedMembers.includes(memberId)) {
        setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      } else {
        setSelectedMembers([...selectedMembers, memberId]);
      }
      setLastClickedIndex(index);
    }
  };

  const handleBatchGroupsChange = (groups: string[], overrideMode: boolean) => {
    setMembers(members.map(member => {
      if (selectedMembers.includes(member.id)) {
        if (overrideMode) {
          // Override mode: replace all groups
          return { ...member, groups };
        } else {
          // Additive mode: merge selected groups with existing ones
          const mergedGroups = [...new Set([...member.groups, ...groups])];
          return { ...member, groups: mergedGroups };
        }
      }
      return member;
    }));
    setShowBatchGroupsModal(false);
    setSelectedMembers([]);
  };

  const handleBatchAccessChange = (projects: string[]) => {
    setMembers(members.map(member => {
      if (selectedMembers.includes(member.id)) {
        // Separate projects and items from the selection
        const projectIds = projects.filter(p => !p.includes('f') || !p.includes('i'));
        const itemIds = projects.filter(p => p.includes('f') && p.includes('i'));
        
        // Create display string
        let accessDisplay = 'No access';
        if (projectIds.length > 0) {
          accessDisplay = projectIds[0];
          if (projectIds.length > 1 || itemIds.length > 0) {
            const additionalCount = (projectIds.length - 1) + itemIds.length;
            if (additionalCount > 0) {
              accessDisplay += ` +${additionalCount}`;
            }
          }
        } else if (itemIds.length > 0) {
          const itemNames = itemIds.map(itemId => {
            const itemMap: { [key: string]: string } = {
              'p1f1i1': 'Dashboard',
              'p1f1i2': 'Settings',
              'p1f1i3': 'Reports',
            };
            return itemMap[itemId] || itemId;
          });
          accessDisplay = itemNames[0];
          if (itemNames.length > 1) {
            accessDisplay += ` +${itemNames.length - 1}`;
          }
        }
        
        return { 
          ...member, 
          access: accessDisplay,
          accessProjects: projectIds,
          accessItems: itemIds
        };
      }
      return member;
    }));
    setShowBatchAccessModal(false);
    setSelectedMembers([]);
  };

  const handleBatchRoleChange = (role: string | any) => {
    // If role is an object (from Today system), convert to string for display
    const roleDisplay = typeof role === 'string' ? role : (role.selectedRole || 'Custom Role');
    const updatedMembers = members.map(member => 
      selectedMembers.includes(member.id) 
        ? { ...member, role: roleDisplay } 
        : member
    );
    setMembers(updatedMembers);
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
    setShowBatchRoleModal(false);
    setSelectedMembers([]);
  };

  const handleMemberGroupsChange = (memberId: string, groups: string[]) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, groups } 
        : member
    ));
    setShowGroupsModal(null);
  };

  const handleMemberAccessChange = (memberId: string, projects: string[]) => {
    setMembers(members.map(member => {
      if (member.id === memberId) {
        // Separate projects and items from the selection
        const projectIds = projects.filter(p => !p.includes('f') || !p.includes('i'));
        const itemIds = projects.filter(p => p.includes('f') && p.includes('i'));
        
        // Create display string
        let accessDisplay = 'No access';
        if (projectIds.length > 0) {
          accessDisplay = projectIds[0];
          if (projectIds.length > 1 || itemIds.length > 0) {
            const additionalCount = (projectIds.length - 1) + itemIds.length;
            if (additionalCount > 0) {
              accessDisplay += ` +${additionalCount}`;
            }
          }
        } else if (itemIds.length > 0) {
          // Map item IDs back to item names for display
          const itemNames = itemIds.map(itemId => {
            // This is a reverse mapping - in a real app, you'd have a proper lookup
            const itemMap: { [key: string]: string } = {
              'p1f1i1': 'Dashboard',
              'p1f1i2': 'Settings',
              'p1f1i3': 'Reports',
              // Add more mappings as needed
            };
            return itemMap[itemId] || itemId;
          });
          accessDisplay = itemNames[0];
          if (itemNames.length > 1) {
            accessDisplay += ` +${itemNames.length - 1}`;
          }
        }
        
        return { 
          ...member, 
          access: accessDisplay,
          accessProjects: projectIds,
          accessItems: itemIds
        };
      }
      return member;
    }));
    setShowAccessModal(null);
  };

  const handleMemberRoleChange = (memberId: string, role: string | any) => {
    // If role is an object (from Today system), convert to string for display
    const roleDisplay = typeof role === 'string' ? role : (role.selectedRole || 'Custom Role');
    const updatedMembers = members.map(member => 
      member.id === memberId 
        ? { ...member, role: roleDisplay } 
        : member
    );
    setMembers(updatedMembers);
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
    setShowRoleModal(null);
  };

  const getCommonGroups = () => {
    if (selectedMembers.length === 0) return [];
    const selectedMemberObjects = members.filter(m => selectedMembers.includes(m.id));
    if (selectedMemberObjects.length === 0) return [];
    
    // Find groups common to all selected members
    const firstMemberGroups = selectedMemberObjects[0].groups;
    return firstMemberGroups.filter(group => 
      selectedMemberObjects.every(member => member.groups.includes(group))
    );
  };

  const getAllGroupsFromSelected = () => {
    if (selectedMembers.length === 0) return [];
    const selectedMemberObjects = members.filter(m => selectedMembers.includes(m.id));
    const allGroups = new Set<string>();
    selectedMemberObjects.forEach(member => {
      member.groups.forEach(group => allGroups.add(group));
    });
    return Array.from(allGroups);
  };

  const getMixedAccessProjects = () => {
    if (selectedMembers.length === 0) return [];
    const selectedMemberObjects = members.filter(m => selectedMembers.includes(m.id));
    if (selectedMemberObjects.length === 0) return [];
    
    // Get all unique project names across all selected members
    const allProjectNames = new Set<string>();
    selectedMemberObjects.forEach(member => {
      (member.accessProjects || []).forEach(proj => allProjectNames.add(proj));
    });
    
    // Find projects that some (but not all) members have
    const mixedProjects: string[] = [];
    allProjectNames.forEach(projectName => {
      const membersWithThisProject = selectedMemberObjects.filter(member => 
        (member.accessProjects || []).includes(projectName)
      );
      // If some but not all have this project, it's mixed
      if (membersWithThisProject.length > 0 && membersWithThisProject.length < selectedMemberObjects.length) {
        // Convert name to ID
        const projectId = getProjectItemId(projectName);
        if (projectId) {
          mixedProjects.push(projectId);
        }
      }
    });
    
    return mixedProjects;
  };

  const getCommonAccessProjects = () => {
    if (selectedMembers.length === 0) return [];
    const selectedMemberObjects = members.filter(m => selectedMembers.includes(m.id));
    if (selectedMemberObjects.length === 0) return [];
    
    // Find projects common to all selected members
    const firstMemberProjects = selectedMemberObjects[0].accessProjects || [];
    const commonProjectNames = firstMemberProjects.filter(proj => 
      selectedMemberObjects.every(member => (member.accessProjects || []).includes(proj))
    );
    
    // Convert names to IDs
    return commonProjectNames
      .map(name => getProjectItemId(name))
      .filter((id): id is string => id !== null);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleUndo = () => {
    if (undoData && undoData.members.length > 0) {
      setMembers([...members, ...undoData.members]);
      setUndoData(null);
    } else {
      // For non-undoable actions (like resend invite), just close the toast
      setUndoData(null);
    }
  };

  const handleTransferOwnership = (newOwnerId: string) => {
    setMembers(members.map(member => {
      if (member.role === 'Owner') {
        // Current owner becomes Admin
        return { ...member, role: 'Admin' };
      } else if (member.id === newOwnerId) {
        // New member becomes Owner
        return { ...member, role: 'Owner' };
      }
      return member;
    }));
    setShowTransferOwnershipModal(null);
    setShowMemberActionsMenu(null);
  };

  const handleResendInvite = (memberId: string) => {
    // In a real app, this would trigger an API call to resend the invite
    // For now, we'll just show a success message via undo toast
    const member = members.find(m => m.id === memberId);
    if (member) {
      setUndoData({
        members: [],
        message: `Invite resent to ${member.name}`
      });
    }
    setShowMemberActionsMenu(null);
  };

  // Function to check if a member matches complex filter rules
  const matchesComplexFilters = (member: Member): boolean => {
    if (complexFilters.length === 0) return true;

    // Each filter group is OR'd together
    return complexFilters.some(filterGroup => {
      if (filterGroup.rules.length === 0) return true;

      // Within a group, rules are AND'd or OR'd based on scope
      if (filterGroup.scope === 'all') {
        // ALL rules must match (AND)
        return filterGroup.rules.every(rule => {
          if (!rule.value || (Array.isArray(rule.value) && rule.value.length === 0)) return true; // Skip empty rules

          let matches = false;
          switch (rule.field) {
            case 'group':
              matches = typeof rule.value === 'string' && member.groups.includes(rule.value);
              break;
            case 'role':
              matches = typeof rule.value === 'string' && member.role === rule.value;
              break;
            case 'access':
              // Handle array of access IDs - check if member has ANY of the selected projects/folders/items
              if (Array.isArray(rule.value)) {
                matches = rule.value.some(accessId => member.access.includes(accessId));
              } else {
                matches = member.access.includes(rule.value);
              }
              break;
          }

          return rule.operator === 'is' ? matches : !matches;
        });
      } else {
        // ANY rule can match (OR)
        return filterGroup.rules.some(rule => {
          if (!rule.value || (Array.isArray(rule.value) && rule.value.length === 0)) return false;

          let matches = false;
          switch (rule.field) {
            case 'group':
              matches = typeof rule.value === 'string' && member.groups.includes(rule.value);
              break;
            case 'role':
              matches = typeof rule.value === 'string' && member.role === rule.value;
              break;
            case 'access':
              // Handle array of access IDs - check if member has ANY of the selected projects/folders/items
              if (Array.isArray(rule.value)) {
                matches = rule.value.some(accessId => member.access.includes(accessId));
              } else {
                matches = member.access.includes(rule.value);
              }
              break;
          }

          return rule.operator === 'is' ? matches : !matches;
        });
      }
    });
  };

  const filteredMembers = members.filter((member) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !member.name.toLowerCase().includes(query) &&
        !member.email.toLowerCase().includes(query) &&
        !member.role.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Use complex filtering if enabled and filters are defined
    if (complexFilteringEnabled && complexFilters.length > 0) {
      return matchesComplexFilters(member);
    }

    // Otherwise use simple filtering
    // Project filter - member must have ALL selected projects (AND logic)
    if (selectedProjects.length > 0) {
      const hasAllProjects = selectedProjects.every(project => member.access.includes(project));
      if (!hasAllProjects) return false;
    }

    // Group filter - member must be in ALL selected groups (AND logic)
    if (selectedGroups.length > 0) {
      const hasAllGroups = selectedGroups.every(group => member.groups.includes(group));
      if (!hasAllGroups) return false;
    }

    // Role filter - member must have one of the selected roles (OR logic makes sense for roles)
    if (selectedRoles.length > 0) {
      if (!selectedRoles.includes(member.role)) return false;
    }

    return true;
  });

  // Apply sorting
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const multiplier = direction === 'asc' ? 1 : -1;

    if (key === 'name' || key === 'email' || key === 'role' || key === 'lastActive' || key === 'invitedBy' || key === 'invitedOn') {
      return multiplier * a[key].localeCompare(b[key]);
    } else if (key === 'groups') {
      return multiplier * (a.groups.length - b.groups.length);
    } else if (key === 'access') {
      // Extract number from access string (e.g., "Project Titan +2")
      const getAccessCount = (access: string) => {
        const match = access.match(/\+(\d+)/);
        return match ? parseInt(match[1]) + 1 : 1;
      };
      return multiplier * (getAccessCount(a.access) - getAccessCount(b.access));
    }

    return 0;
  });

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Header */}
      <div className="border-b flex-shrink-0" style={{ 
        padding: 'calc(var(--radius) * 1)',
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 'calc(var(--radius) * 0.75)' }}>
            <div className="w-8 h-8 flex items-center justify-center" style={{
              backgroundColor: 'var(--primary)',
              opacity: 0.1,
              borderRadius: 'var(--radius)',
            }}>
              <svg className="w-5 h-5" style={{ color: 'var(--primary)', opacity: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 style={{
                color: 'var(--foreground)',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-weight-bold)',
              }}>Members</h2>
              <p style={{ 
                color: 'var(--muted)',
                fontSize: 'var(--text-sm)',
                marginTop: 'calc(var(--radius) * 0.25)',
              }}>
                {sortedMembers.length} {sortedMembers.length === 1 ? 'member' : 'members'}
                {sortedMembers.length !== members.length && (
                  <span> (filtered from {members.length} total)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b flex-shrink-0" style={{ 
        padding: 'calc(var(--radius) * 0.6) calc(var(--radius) * 1)',
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}>
        {/* Top Row: Search, Filter Buttons and Invite Section */}
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <div 
                className="h-[35px] relative flex items-center gap-1 px-2 py-1 border transition-colors"
                style={{ 
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="bg-transparent outline-none w-[200px] max-w-[40vw]"
                  style={{
                    color: 'var(--foreground)',
                        fontSize: 'var(--text-sm)',
                  }}
                />
              </div>
            </div>

            {/* Filter Buttons - Simple or Complex */}
            {!complexFilteringEnabled ? (
              // Simple filtering buttons (Groups, Access, Roles)
              <>
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setShowFilterGroupsModal({ top: rect.bottom + 5, left: rect.left });
              }}
              className="px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-colors"
              style={{ 
                borderColor: selectedGroups.length > 0 ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedGroups.length > 0 ? 'var(--primary-background)' : 'transparent',
                color: selectedGroups.length > 0 ? 'var(--primary)' : 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
              }}
              onMouseEnter={(e) => {
                if (selectedGroups.length === 0) {
                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGroups.length === 0) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Users className="w-4 h-4" />
              <span>Groups</span>
              {selectedGroups.length > 0 && (
                <span 
                  className="px-1.5 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                        fontSize: '10px',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {selectedGroups.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                setShowFilterProjectsModal(true);
              }}
              className="px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-colors"
              style={{ 
                borderColor: selectedProjects.length > 0 ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedProjects.length > 0 ? 'var(--primary-background)' : 'transparent',
                color: selectedProjects.length > 0 ? 'var(--primary)' : 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
              }}
              onMouseEnter={(e) => {
                if (selectedProjects.length === 0) {
                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProjects.length === 0) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Filter className="w-4 h-4" />
              <span>Access</span>
              {selectedProjects.length > 0 && (
                <span 
                  className="px-1.5 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                        fontSize: '10px',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {selectedProjects.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setShowFilterRolesModal({ top: rect.bottom + 5, left: rect.left });
              }}
              className="px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-colors"
              style={{ 
                borderColor: selectedRoles.length > 0 ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedRoles.length > 0 ? 'var(--primary-background)' : 'transparent',
                color: selectedRoles.length > 0 ? 'var(--primary)' : 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
              }}
              onMouseEnter={(e) => {
                if (selectedRoles.length === 0) {
                  e.currentTarget.style.backgroundColor = 'var(--secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRoles.length === 0) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Crown className="w-4 h-4" />
              <span>Roles</span>
              {selectedRoles.length > 0 && (
                <span 
                  className="px-1.5 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                        fontSize: '10px',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {selectedRoles.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
              </>
            ) : (
              // Complex filtering button
              <button
                onClick={() => setShowFilterBuilderModal(true)}
                className="px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-colors"
                style={{ 
                  borderColor: complexFilters.length > 0 ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: complexFilters.length > 0 ? 'var(--primary-background)' : 'transparent',
                  color: complexFilters.length > 0 ? 'var(--primary)' : 'var(--foreground)',
                    fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius)',
                }}
                onMouseEnter={(e) => {
                  if (complexFilters.length === 0) {
                    e.currentTarget.style.backgroundColor = 'var(--secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (complexFilters.length === 0) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {complexFilters.length > 0 && (
                  <span 
                    className="px-1.5 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                            fontSize: '10px',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {complexFilters.reduce((sum, g) => sum + g.rules.length, 0)}
                  </span>
                )}
              </button>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-colors"
                style={{ 
                  borderColor: 'var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--destructive)',
                    fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--destructive-background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="w-4 h-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
          
          {/* Invite Section */}
          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {/* Free Slots Indicator */}
            <div 
              className="flex items-center gap-2.5 px-3 py-2 border"
              style={{ 
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <div 
                  className="flex items-center justify-center"
                  style={{ 
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: seatStatus.bg,
                  }}
                >
                  <svg 
                    width="11" 
                    height="11" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                    style={{ color: seatStatus.icon }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={seatStatus.iconPath} />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span 
                    style={{ 
                      color: 'var(--foreground)', 
                            fontSize: 'var(--text-xs)',
                      lineHeight: '1.2',
                    }}
                  >
                    Available
                  </span>
                  <span 
                    style={{ 
                      color: seatStatus.icon, 
                            fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      lineHeight: '1.2',
                    }}
                  >
                    {availableSeats} {availableSeats === 1 ? 'slot' : 'slots'}
                  </span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '1px', 
                  height: '24px', 
                  backgroundColor: 'var(--border)',
                }}
              />
              <div className="flex flex-col">
                <span 
                  style={{ 
                    color: 'var(--muted)', 
                        fontSize: 'var(--text-xs)',
                    lineHeight: '1.2',
                  }}
                >
                  Total
                </span>
                <span 
                  style={{ 
                    color: 'var(--foreground)', 
                        fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    lineHeight: '1.2',
                  }}
                >
                  {TOTAL_SEATS} seats
                </span>
              </div>
            </div>

            {/* Invite Button — admin only */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (availableSeats <= 0) {
                    setShowRequestSeatsModal(true);
                  } else {
                    onInviteClick();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 transition-all"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--elevation-sm)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Invite Members
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display - Moved to filter chips */}
        {(searchQuery || selectedProjects.length > 0 || selectedGroups.length > 0 || selectedRoles.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {searchQuery && (
              <span 
                className="px-2 py-1 rounded flex items-center gap-1" 
                style={{ 
                  backgroundColor: 'var(--primary-background)',
                  color: 'var(--primary)',
                    fontSize: 'var(--text-sm)',
                  borderRadius: 'calc(var(--radius) * 0.5)',
                }}
              >
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-destructive transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedProjects.length > 0 && (
              <span 
                className="px-2 py-1 rounded flex items-center gap-1" 
                style={{ 
                  backgroundColor: 'var(--primary-background)',
                  color: 'var(--primary)',
                    fontSize: 'var(--text-sm)',
                  borderRadius: 'calc(var(--radius) * 0.5)',
                }}
              >
                Access: {formatAccessChipLabel(selectedProjects)}
                <button
                  onClick={() => setSelectedProjects([])}
                  className="hover:text-destructive transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedGroups.length > 0 && selectedGroups.map(groupName => {
              const group = groups.find(g => g.name === groupName);
              const groupColor = group?.color || 'var(--primary)';
              return (
                <span 
                  key={groupName}
                  className="px-2 py-1 rounded flex items-center gap-1.5" 
                  style={{ 
                    backgroundColor: `${groupColor}20`,
                    color: groupColor,
                    border: `1px solid ${groupColor}`,
                        fontSize: 'var(--text-sm)',
                    borderRadius: 'calc(var(--radius) * 0.5)',
                  }}
                >
                  <Users className="w-3 h-3" style={{ color: groupColor }} />
                  {groupName}
                  <button
                    onClick={() => setSelectedGroups(selectedGroups.filter(g => g !== groupName))}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: groupColor }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedRoles.length > 0 && (
              <span 
                className="px-2 py-1 rounded flex items-center gap-1" 
                style={{ 
                  backgroundColor: 'var(--primary-background)',
                  color: 'var(--primary)',
                    fontSize: 'var(--text-sm)',
                  borderRadius: 'calc(var(--radius) * 0.5)',
                }}
              >
                {selectedRoles.length === 1 
                  ? `Role: ${selectedRoles[0]}` 
                  : `Roles: ${selectedRoles.length} Roles`}
                <button
                  onClick={() => setSelectedRoles([])}
                  className="hover:text-destructive transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Batch Actions Toolbar - Floating at Bottom Center (admin only) */}
      {isAdmin && selectedMembers.length > 0 && (
        <div 
          className="fixed bottom-8 left-1/2 border flex items-center z-40 max-w-[calc(100vw-32px)]"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            padding: 'calc(var(--radius) * 1)',
            borderRadius: 'calc(var(--radius) * 2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
            gap: 'calc(var(--radius) * 1.5)',
          }}
        >
          {/* Selected count with Clear action */}
          <div className="flex items-center" style={{ gap: 'calc(var(--radius) * 0.8)' }}>
            <div 
              className="w-7 h-7 flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {selectedMembers.length}
            </div>
            <span style={{ 
              color: 'var(--foreground)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              selected
            </span>
            <button
              onClick={() => setSelectedMembers([])}
              className="ml-1 transition-colors"
              style={{ 
                color: 'var(--muted)',
                fontSize: 'var(--text-sm)',
                padding: '2px 6px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Clear
            </button>
          </div>
          
          <div 
            style={{ 
              width: '1px', 
              height: '24px', 
              backgroundColor: 'var(--border)' 
            }}
          />
          
          {/* Action Buttons */}
          <div className="flex items-center" style={{ gap: 'calc(var(--radius) * 0.6)' }}>
            <button
              onClick={() => setShowBatchGroupsModal(true)}
              className="border transition-all"
              style={{ 
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Groups
            </button>
            <button
              onClick={() => setShowBatchAccessModal(true)}
              className="border transition-all"
              style={{ 
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Access
            </button>
            <button
              onClick={() => setShowBatchRoleModal(true)}
              className="border transition-all"
              style={{ 
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                borderRadius: 'var(--radius)',
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Role
            </button>
            <button
              onClick={() => setShowDeleteModal({ type: 'batch' })}
              className="transition-all"
              style={{ 
                color: 'var(--destructive-foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--destructive)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Table Container with Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div style={{ minWidth: '1400px' }}>
          <table className="w-full">
            <thead className="sticky top-0 border-b z-20" style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}>
              <tr>
              <th className="w-[50px] sticky left-0 z-10" style={{ 
                padding: '0',
                backgroundColor: 'var(--card)',
              }}>
                <div className="flex items-center justify-center" style={{ width: '50px', height: '40px' }}>
                  <Checkbox
                    checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                    onChange={() => handleSelectAll()}
                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length}
                  />
                </div>
              </th>
              <ResizableColumnHeader
                label="Name"
                width={columnWidths.name}
                onResize={(w) => setColumnWidths({ ...columnWidths, name: w })}
                sortable
                sortKey="name"
                currentSort={sortConfig}
                onSort={() => handleSort('name')}
                sticky
                stickyLeft={50}
                backgroundColor="var(--card)"
              />
              <ResizableColumnHeader
                label="Email"
                width={columnWidths.email}
                onResize={(w) => setColumnWidths({ ...columnWidths, email: w })}
                sortable
                sortKey="email"
                currentSort={sortConfig}
                onSort={() => handleSort('email')}
              />
              <ResizableColumnHeader
                label="Role"
                width={columnWidths.role}
                onResize={(w) => setColumnWidths({ ...columnWidths, role: w })}
                sortable
                sortKey="role"
                currentSort={sortConfig}
                onSort={() => handleSort('role')}
              />
              <ResizableColumnHeader
                label="Last active"
                width={columnWidths.lastActive}
                onResize={(w) => setColumnWidths({ ...columnWidths, lastActive: w })}
                sortable
                sortKey="lastActive"
                currentSort={sortConfig}
                onSort={() => handleSort('lastActive')}
              />
              <ResizableColumnHeader
                label="Invited by"
                width={columnWidths.invitedBy}
                onResize={(w) => setColumnWidths({ ...columnWidths, invitedBy: w })}
                sortable
                sortKey="invitedBy"
                currentSort={sortConfig}
                onSort={() => handleSort('invitedBy')}
              />
              <ResizableColumnHeader
                label="Invited on"
                width={columnWidths.invitedOn}
                onResize={(w) => setColumnWidths({ ...columnWidths, invitedOn: w })}
                sortable
                sortKey="invitedOn"
                currentSort={sortConfig}
                onSort={() => handleSort('invitedOn')}
              />
              <ResizableColumnHeader
                label="Groups"
                width={columnWidths.groups}
                onResize={(w) => setColumnWidths({ ...columnWidths, groups: w })}
                sortable
                sortKey="groups"
                currentSort={sortConfig}
                onSort={() => handleSort('groups')}
              />
              <ResizableColumnHeader
                label="Access"
                width={columnWidths.access}
                onResize={(w) => setColumnWidths({ ...columnWidths, access: w })}
                sortable
                sortKey="access"
                currentSort={sortConfig}
                onSort={() => handleSort('access')}
              />
              <th className="w-[100px]" style={{ 
                padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
              }}></th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member, index) => (
              <tr 
                key={member.id} 
                className="border-b transition-colors group" 
                style={{
                  borderColor: 'var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(233, 233, 233, 0.5)';
                  // Update sticky cells to match hover
                  const checkboxCell = e.currentTarget.querySelector('td:nth-child(1)') as HTMLElement;
                  const nameCell = e.currentTarget.querySelector('td:nth-child(2)') as HTMLElement;
                  if (checkboxCell) checkboxCell.style.backgroundColor = 'rgba(233, 233, 233, 0.5)';
                  if (nameCell) nameCell.style.backgroundColor = 'rgba(233, 233, 233, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  // Reset sticky cells
                  const checkboxCell = e.currentTarget.querySelector('td:nth-child(1)') as HTMLElement;
                  const nameCell = e.currentTarget.querySelector('td:nth-child(2)') as HTMLElement;
                  if (checkboxCell) checkboxCell.style.backgroundColor = 'var(--background)';
                  if (nameCell) nameCell.style.backgroundColor = 'var(--background)';
                }}
              >
                <td className="sticky left-0 z-10" style={{ 
                  padding: '0',
                  backgroundColor: 'var(--background)',
                  transition: 'background-color 0.15s ease-in-out'
                }}>
                  <div 
                    onClick={(e) => handleSelectMember(member.id, index, e.shiftKey)}
                    onMouseDown={(e) => {
                      // Prevent text selection when shift-clicking
                      if (e.shiftKey) {
                        e.preventDefault();
                      }
                    }}
                    className="cursor-pointer flex items-center justify-center"
                    style={{ 
                      width: '50px', 
                      height: '48px',
                      userSelect: 'none'
                    }}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) => handleSelectMember(member.id, index, e.shiftKey)}
                      />
                    </div>
                  </div>
                </td>
                <td className="sticky left-[50px] z-10" style={{
                  width: `${columnWidths.name}px`,
                  minWidth: `${columnWidths.name}px`,
                  maxWidth: `${columnWidths.name}px`,
                  backgroundColor: 'var(--background)',
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                  transition: 'background-color 0.15s ease-in-out'
                }}>
                  <div className="flex items-center gap-2">
                    {member.status === 'invited' ? (
                      <>
                        <MemberAvatar
                          name="?"
                          initials="?"
                          color="var(--secondary)"
                          size="lg"
                          showTooltip={false}
                          showProfileOnClick={false}
                          className="[&_div]:!text-[var(--muted)]"
                        />
                        <span className="text-sm px-2 py-0.5 bg-secondary text-secondary-foreground rounded-lg">
                          Invited
                        </span>
                      </>
                    ) : (
                      <>
                        <MemberAvatar
                          name={member.name}
                          size="lg"
                          email={member.email}
                          role={member.role}
                          status={member.status}
                          groups={member.groups}
                          lastActive={member.lastActive}
                        />
                        <span className="text-sm">{member.name}</span>
                      </>
                    )}
                  </div>
                </td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                    fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}>{member.email}</td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                }}>
                  {member.role === 'Owner' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)' }}>
                        <Crown className="w-3 h-3" style={{ color: '#d97706' }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#d97706' }}>
                        Owner
                      </span>
                    </div>
                  ) : member.role ? (
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const menuHeight = roleSystem === 'new' ? 200 : 400;
                        const menuWidth = 320;
                        const position = calculateMenuPosition(rect, menuWidth, menuHeight);
                        setShowRoleModal({ 
                          id: member.id, 
                          position
                        });
                      }}
                      className="text-sm cursor-pointer hover:bg-primary/10 rounded px-2 py-1 transition-all group inline-block"
                    >
                      <span className="group-hover:text-primary transition-colors" style={{ color: 'var(--foreground)' }}>
                        {member.role}
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const menuHeight = roleSystem === 'new' ? 200 : 400;
                        const menuWidth = 320;
                        const position = calculateMenuPosition(rect, menuWidth, menuHeight);
                        setShowRoleModal({ 
                          id: member.id, 
                          position
                        });
                      }}
                      className="text-sm cursor-pointer hover:bg-primary/10 rounded px-2 py-1 transition-all group inline-block"
                    >
                      <span className="group-hover:text-primary transition-colors" style={{ color: 'var(--muted)' }}>
                        No role
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                    fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}>{formatRelativeTime(member.lastActive)}</td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                    fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}>
                  {(() => {
                    const inviterDetails = getInviterDetails(member.invitedBy);
                    
                    // Show dash for members without an inviter (e.g., owner)
                    if (!inviterDetails) {
                      return (
                        <span style={{ 
                          color: 'var(--muted-foreground)',
                                    fontSize: 'var(--text-sm)',
                        }}>
                          —
                        </span>
                      );
                    }
                    
                    return (
                      <MemberAvatar
                        name={inviterDetails.name}
                        initials={inviterDetails.initials}
                        color={inviterDetails.color}
                        size="lg"
                        showProfileOnClick={false}
                      />
                    );
                  })()}
                </td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                    fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                }}>{member.invitedOn}</td>
                <td style={{ 
                  width: `${columnWidths.groups}px`,
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                }}>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menuHeight = 300;
                      const menuWidth = 320;
                      const position = calculateMenuPosition(rect, menuWidth, menuHeight);
                      setShowGroupsModal({ 
                        id: member.id, 
                        position
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all overflow-hidden"
                  >
                    {member.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.groups.map((group) => {
                          const groupColor = getGroupColor(group);
                          return (
                            <span
                              key={group}
                              className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1"
                              style={{
                                backgroundColor: `${groupColor}20`,
                                color: groupColor,
                                border: `1px solid ${groupColor}`,
                                              }}
                            >
                              <Users className="w-3 h-3" style={{ color: groupColor }} />
                              {group}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">No groups</span>
                    )}
                  </div>
                </td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                }}>
                  {(member.role === 'Owner' || member.role === 'Admin') ? (
                    <div
                      onClick={() => setShowAccessModal(member.id)}
                      className="text-xs cursor-pointer hover:bg-primary/10 rounded px-2 py-1 transition-all inline-flex items-center gap-1.5"
                    >
                      <span className="hover:text-primary transition-colors font-medium" style={{ color: 'var(--primary)' }}>
                        All items
                      </span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs font-medium" 
                        style={{ 
                          backgroundColor: 'var(--primary-background)', 
                          color: 'var(--primary)',
                                    fontSize: '10px'
                        }}
                      >
                        {member.role}
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowAccessModal(member.id)}
                      className="text-xs cursor-pointer hover:bg-primary/10 rounded px-2 py-1 transition-all inline-flex items-center gap-1.5"
                    >
                      {(() => {
                        const accessData = formatAccessDisplay(member);
                        if (!accessData) {
                          return <AccessSummary projectCount={0} folderCount={0} itemCount={0} />;
                        }
                        return (
                          <AccessSummary 
                            projectCount={accessData.projects} 
                            folderCount={accessData.folders} 
                            itemCount={accessData.items}
                          />
                        );
                      })()}
                    </div>
                  )}
                </td>
                <td style={{ 
                  padding: 'calc(var(--radius) * 0.5) calc(var(--radius) * 1)',
                }}>
                  <div className="flex items-center gap-2 justify-end">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuHeight = 120;
                          const menuWidth = 200;
                          const position = calculateMenuPosition(rect, menuWidth, menuHeight);
                          setShowMemberActionsMenu({
                            id: member.id,
                            position
                          });
                        }}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setShowDeleteModal({ type: 'single', id: member.id })}
                        className="w-6 h-6 flex items-center justify-center hover:bg-destructive/10 rounded transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {members.length === 0 && (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Get started by inviting team members to your workspace. They'll be able to collaborate on projects and access resources based on their roles."
            action={isAdmin ? {
              label: "Invite Members",
              onClick: onInviteClick
            } : undefined}
          />
        )}

        {members.length > 0 && filteredMembers.length === 0 && (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Try adjusting your filters to see more results. You can filter by projects, groups, roles, or search by name and email."
          />
        )}
      </div>

      {/* Groups Context Menu */}
      {showGroupsModal && (
        <GroupContextMenu
          currentGroups={members.find(m => m.id === showGroupsModal.id)?.groups || []}
          onClose={() => setShowGroupsModal(null)}
          onSave={(groups) => handleMemberGroupsChange(showGroupsModal.id, groups)}
          position={showGroupsModal.position}
          allowMultiple={true}
          availableGroups={availableGroups}
          availableGroupsWithColors={groups.map(g => ({ name: g.name, color: g.color }))}
          onManageGroups={onNavigateToGroups}
        />
      )}

      {/* Access Modal */}
      {showAccessModal && (() => {
        const member = members.find(m => m.id === showAccessModal);
        
        // Get direct member access as IDs
        const directAccessIds = [
          ...(member?.accessProjects || []).map(p => {
            const projectMap: { [key: string]: string } = {
              'Worldwide Infrastructure': 'p1',
              'Europe Operations': 'p2',
              'Asia Operations': 'p3',
              'Regional Analytics': 'p4',
              'Field Services': 'p5',
            };
            return projectMap[p] || 'p1';
          }),
          ...(member?.accessItems || []).map(item => {
            const itemMap: { [key: string]: string } = {
              'Berlin Maintenance': 'p1f1i1',
              'Munich Operations': 'p1f1i2',
              'Hamburg Support': 'p1f1i3',
              'Paris Maintenance': 'p1f2i1',
              'Lyon Operations': 'p1f2i2',
              'London Support': 'p1f3i1',
              'Manchester Operations': 'p1f3i2',
              '24/7 Helpdesk': 'p1f4i1',
              'Remote Monitoring': 'p1f4i2',
              'Emergency Response': 'p1f4i3',
              'Berlin Office': 'p2f1i1',
              'Vienna Office': 'p2f1i2',
              'Amsterdam Office': 'p2f2i1',
              'Brussels Office': 'p2f2i2',
              'Tokyo Maintenance': 'p3f1i1',
              'Seoul Operations': 'p3f1i2',
              'Singapore Hub': 'p3f2i1',
              'Bangkok Support': 'p3f2i2',
              'Europe Dashboard': 'p4f1i1',
              'Asia Dashboard': 'p4f1i2',
              'Global Overview': 'p4f1i3',
              'Rome Maintenance': 'p5f1i1',
              'Milan Support': 'p5f1i2',
              'Madrid Operations': 'p5f2i1',
              'Barcelona Support': 'p5f2i2',
            };
            return itemMap[item] || 'p1f1i1';
          }),
        ];
        
        // Get group access IDs
        const groupAccessIds: string[] = [];
        (member?.groups || []).forEach(groupName => {
          const group = groups.find(g => g.name === groupName);
          if (group) {
            groupAccessIds.push(...group.projects);
          }
        });
        
        // Combine and deduplicate all access
        const currentAccess = [...new Set([...directAccessIds, ...groupAccessIds])];
        
        return (
          <ProjectAccessModal
            currentProjects={currentAccess}
            memberGroups={member?.groups || []}
            onClose={() => setShowAccessModal(null)}
            onSave={(projects) => handleMemberAccessChange(showAccessModal, projects)}
            memberRole={member?.role}
            groups={groups}
            publicFeatureEnabled={publicFeatureEnabled}
            roleAccessRules={roleAccessRules}
            roleAccessFeatureEnabled={roleAccessFeatureEnabled}
          />
        );
      })()}

      {/* Batch Groups Modal */}
      {showBatchGroupsModal && (
        <GroupSelectionModal
          currentGroups={getCommonGroups()}
          onClose={() => setShowBatchGroupsModal(false)}
          onGroupsChange={handleBatchGroupsChange}
          allowMultiple={true}
          isBatchMode={true}
          selectedMembersCount={selectedMembers.length}
          allGroupsFromMembers={getAllGroupsFromSelected()}
          availableGroups={availableGroups}
          availableGroupsWithColors={groups.map(g => ({ name: g.name, color: g.color }))}
          onManageGroups={onNavigateToGroups}
        />
      )}

      {/* Batch Access Modal */}
      {showBatchAccessModal && (
        <ProjectAccessModal
          currentProjects={getCommonAccessProjects()}
          mixedProjects={getMixedAccessProjects()}
          memberGroups={getAllGroupsFromSelected()}
          onClose={() => setShowBatchAccessModal(false)}
          onSave={handleBatchAccessChange}
          groups={groups}
          publicFeatureEnabled={publicFeatureEnabled}
          roleAccessRules={roleAccessRules}
          roleAccessFeatureEnabled={roleAccessFeatureEnabled}
        />
      )}

      {/* Role Context Menu */}
      {showRoleModal && (
        <RoleManagementModal
          currentRole={members.find(m => m.id === showRoleModal.id)?.role || ''}
          roleSystem={roleSystem}
          onClose={() => setShowRoleModal(null)}
          onRoleChange={(role) => handleMemberRoleChange(showRoleModal.id, role)}
          position={showRoleModal.position}
          onNavigateToRoles={onNavigateToRoles}
          availableRoles={availableRoles}
        />
      )}

      {/* Batch Role Modal */}
      {showBatchRoleModal && (
        <RoleManagementModal
          currentRole=""
          roleSystem={roleSystem}
          onClose={() => setShowBatchRoleModal(false)}
          onRoleChange={handleBatchRoleChange}
          isBatchMode={true}
          selectedMembersCount={selectedMembers.length}
          onNavigateToRoles={onNavigateToRoles}
          availableRoles={availableRoles}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (() => {
        // Calculate how many can actually be deleted (excluding owner)
        const deletableCount = showDeleteModal.type === 'batch' 
          ? selectedMembers.filter(id => {
              const member = members.find(m => m.id === id);
              return member?.role !== 'Owner';
            }).length
          : 1;
        const hasOwner = false; // Allow deleting owners now that multiple owners are supported
        
        return (
          <DeleteConfirmModal
            title={showDeleteModal.type === 'batch' 
              ? `Remove ${deletableCount} member${deletableCount > 1 ? 's' : ''}?`
              : 'Remove member?'
            }
            message={showDeleteModal.type === 'batch'
              ? `Are you sure you want to remove ${deletableCount} member${deletableCount > 1 ? 's' : ''}?${hasOwner ? ' (The owner cannot be removed)' : ''} This action cannot be undone.`
              : 'Are you sure you want to remove this member? This action cannot be undone.'
            }
          confirmText="Remove"
          onConfirm={() => {
            if (showDeleteModal.type === 'batch') {
              // Filter out the owner from deletion
              const membersToDelete = selectedMembers.filter(id => {
                const member = members.find(m => m.id === id);
                return member?.role !== 'Owner';
              });
              
              const deletedMembers = members.filter(m => membersToDelete.includes(m.id));
              setMembers(members.filter(m => !membersToDelete.includes(m.id)));
              setUndoData({
                members: deletedMembers,
                message: `${deletedMembers.length} member${deletedMembers.length > 1 ? 's' : ''} removed`
              });
              setSelectedMembers([]);
            } else if (showDeleteModal.id) {
              const deletedMember = members.find(m => m.id === showDeleteModal.id);
              setMembers(members.filter(m => m.id !== showDeleteModal.id));
              if (deletedMember) {
                setUndoData({
                  members: [deletedMember],
                  message: `${deletedMember.name} removed`
                });
              }
            }
            setShowDeleteModal(null);
          }}
          onCancel={() => setShowDeleteModal(null)}
          />
        );
      })()}

      {/* Filter Modals */}
      {showFilterProjectsModal && (
        <ProjectAccessModal
          currentProjects={selectedProjects}
          memberGroups={[]}
          onClose={() => setShowFilterProjectsModal(false)}
          onSave={(projects) => {
            setSelectedProjects(projects);
          }}
          groups={groups}
          publicFeatureEnabled={publicFeatureEnabled}
          roleAccessRules={roleAccessRules}
          roleAccessFeatureEnabled={roleAccessFeatureEnabled}
          isFilterMode={true}
        />
      )}

      {showFilterGroupsModal && (
        <GroupContextMenu
          currentGroups={selectedGroups}
          onClose={() => setShowFilterGroupsModal(null)}
          onSave={(groups) => {
            setSelectedGroups(groups);
          }}
          position={showFilterGroupsModal}
          allowMultiple={true}
          availableGroups={availableGroups}
          availableGroupsWithColors={groups.map(g => ({ name: g.name, color: g.color }))}
          onManageGroups={onNavigateToGroups}
          isFilterMode={true}
        />
      )}

      {showFilterRolesModal && (
        <div
          style={{
            position: 'fixed',
            top: `${showFilterRolesModal.top}px`,
            left: `${showFilterRolesModal.left}px`,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <SimpleRolesContextMenu
            selectedRoles={selectedRoles}
            onClose={() => setShowFilterRolesModal(null)}
            onToggleRole={(role) => {
              setSelectedRoles(prev => 
                prev.includes(role)
                  ? prev.filter(r => r !== role)
                  : [...prev, role]
              );
            }}
            isFilterMode={true}
            availableRoles={externalAvailableRoles}
          />
        </div>
      )}

      {/* Filter Builder Modal */}
      {showFilterBuilderModal && (
        <FilterBuilderModal
          onClose={() => setShowFilterBuilderModal(false)}
          onApply={(filters) => {
            setComplexFilters(filters);
            setShowFilterBuilderModal(false);
          }}
          availableGroups={groups.map(g => ({ name: g.name, color: g.color }))}
          availableRoles={externalAvailableRoles || defaultAvailableRoles.map(name => ({ name, description: '' }))}
          availableProjects={[
            'Worldwide Infrastructure',
            'Europe Operations',
            'Asia Operations',
            'Project Titan',
            'Global Dashboard',
          ]}
          initialFilters={complexFilters}
        />
      )}

      {/* Member Actions Menu */}
      {showMemberActionsMenu && (() => {
        const member = members.find(m => m.id === showMemberActionsMenu.id);
        if (!member) return null;

        return (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMemberActionsMenu(null)}
            />
            <div
              className="fixed z-50"
              style={{ 
                top: `${showMemberActionsMenu.position.top}px`, 
                left: showMemberActionsMenu.position.left !== undefined ? `${showMemberActionsMenu.position.left}px` : undefined,
                right: showMemberActionsMenu.position.right !== undefined ? `${showMemberActionsMenu.position.right}px` : undefined
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card border border-border rounded-lg shadow-elevation-sm overflow-hidden min-w-[200px]">
                {member.status === 'invited' ? (
                  <button
                    onClick={() => handleResendInvite(member.id)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                    style={{ 
                      color: 'var(--foreground)',
                          }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Resend Invite
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowTransferOwnershipModal(member.id);
                      setShowMemberActionsMenu(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                    style={{ 
                      color: 'var(--foreground)',
                          }}
                  >
                    <Crown className="w-4 h-4" />
                    Transfer Ownership
                  </button>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Transfer Ownership Modal */}
      {showTransferOwnershipModal && (() => {
        const member = members.find(m => m.id === showTransferOwnershipModal);
        if (!member) return null;

        return (
          <TransferOwnershipModal
            memberName={member.name}
            onClose={() => setShowTransferOwnershipModal(null)}
            onConfirm={() => handleTransferOwnership(member.id)}
          />
        );
      })()}

      {/* Undo Toast */}
      {undoData && (
        <UndoToast
          message={undoData.message}
          onUndo={undoData.members.length > 0 ? handleUndo : undefined}
          onClose={() => setUndoData(null)}
          duration={10000}
          showUndo={undoData.members.length > 0}
        />
      )}

      {/* Request Seats Modal */}
      {showRequestSeatsModal && (
        <RequestSeatsModal
          onClose={() => setShowRequestSeatsModal(false)}
          availableSeats={availableSeats}
          totalSeats={TOTAL_SEATS}
        />
      )}
    </div>
  );
}
