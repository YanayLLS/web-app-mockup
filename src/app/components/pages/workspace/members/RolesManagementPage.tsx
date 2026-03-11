import { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Info } from 'lucide-react';
import { RoleDeleteModal } from './RoleDeleteModal';
import { RoleMembersContextMenu } from './RoleMembersContextMenu';
import { PermissionsModal } from './PermissionsModal';
import { ReassignRoleModal } from './ReassignRoleModal';
import { useRole, hasAccess } from '@/app/contexts/RoleContext';

export interface RolePermissions {
  training: string;
  content: string;
  administration: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermissions;
  memberCount: number;
}

// Helper function to format permission names into readable, coherent titles
const formatPermissionName = (permission: string): string => {
  const permissionTitles: { [key: string]: string } = {
    'CREATE_VIRTUAL_ROOM': 'Can create virtual rooms',
    'EDIT_PNC': 'Can edit PNC data',
    'NEW_OBJECT_TARGET_SYSTEM': 'Can create new object targets in system',
    'SUPPORT_AI_CHAT': 'Can access AI chat support',
    'SUPPORT_PARTS_CATALOG_LIST': 'Can view parts catalog list',
    'VIEW_PUBLISHED': 'Can view published content',
    'VIEW_PROCEDURE_AND_MEDIA': 'Can view procedures and media',
    'VIEW_REMOTE_SUPPORT': 'Can access remote support',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID': 'Can view remote support device IDs',
    'VIEW_TASKS': 'Can view assigned tasks',
    'VIEW_VIRTUAL_ROOM': 'Can view virtual rooms',
    'CREATE_REMOTE_SUPPORT': 'Can create remote support sessions',
    'VIEW_SELF_VIRTUAL_ROOM': 'Can view own virtual rooms',
    'CREATE_GUIDES': 'Can create new guides',
    'EDIT_GUIDES': 'Can edit existing guides',
    'IMPORT_GUIDES': 'Can import guides from files',
    'PUBLISH_GUIDES': 'Can publish guides',
    'CREATE_3D_GUIDES_EDITOR': 'Can create 3D guides in editor',
    'GUIDES_UPLOAD': 'Can upload files to guides',
    'VIEW_ALL_GUIDES': 'Can view all guides in workspace',
    'CREATE_3D_MODELS': 'Can create 3D models',
    'EDIT_3D_MODELS': 'Can edit existing 3D models',
    'IMPORT_3D_MODELS': 'Can import 3D models from files',
    'PUBLISH_3D_MODELS': 'Can publish 3D models',
    'VIEW_ALL_3D_MODELS': 'Can view all 3D models in workspace',
    'CREATE_IMAGES': 'Can create and upload images',
    'EDIT_IMAGES': 'Can edit existing images',
    'PUBLISH_IMAGES': 'Can publish images',
    'VIEW_ALL_IMAGES': 'Can view all images in workspace',
    'CREATE_VIDEOS': 'Can create and upload videos',
    'EDIT_VIDEOS': 'Can edit existing videos',
    'PUBLISH_VIDEOS': 'Can publish videos',
    'VIEW_ALL_VIDEOS': 'Can view all videos in workspace',
    'VIEW_USAGE_ANALYSIS': 'Can view usage analytics and reports',
    'EXPORT_USAGE_DATA': 'Can export usage data',
    'VIEW_USER_ANALYTICS': 'Can view user analytics',
    'VIEW_WORKSPACE_ANALYTICS': 'Can view workspace analytics',
    'WORKSPACE_SETTINGS': 'Can modify workspace settings',
    'USER_MANAGEMENT': 'Can manage users and permissions',
    'BILLING_MANAGEMENT': 'Can manage billing and subscriptions',
    'INVITE_USERS': 'Can invite new users to workspace',
    'REMOVE_USERS': 'Can remove users from workspace',
    'ASSIGN_ROLES': 'Can assign roles to users',
    'CREATE_GROUPS': 'Can create user groups',
    'MANAGE_GROUPS': 'Can manage existing groups',
    'VIEW_AUDIT_LOGS': 'Can view audit logs',
    'EXPORT_AUDIT_LOGS': 'Can export audit logs',
  };
  
  return permissionTitles[permission] || permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Comprehensive list of ALL possible permissions
const allPossiblePermissions = [
  'CREATE_VIRTUAL_ROOM',
  'VIEW_VIRTUAL_ROOM',
  'VIEW_SELF_VIRTUAL_ROOM',
  'EDIT_PNC',
  'NEW_OBJECT_TARGET_SYSTEM',
  'SUPPORT_AI_CHAT',
  'SUPPORT_PARTS_CATALOG_LIST',
  'VIEW_PUBLISHED',
  'VIEW_PROCEDURE_AND_MEDIA',
  'VIEW_REMOTE_SUPPORT',
  'VIEW_REMOTE_SUPPORT_DEVICE_ID',
  'VIEW_TASKS',
  'CREATE_REMOTE_SUPPORT',
  'CREATE_GUIDES',
  'EDIT_GUIDES',
  'IMPORT_GUIDES',
  'PUBLISH_GUIDES',
  'CREATE_3D_GUIDES_EDITOR',
  'GUIDES_UPLOAD',
  'VIEW_ALL_GUIDES',
  'CREATE_3D_MODELS',
  'EDIT_3D_MODELS',
  'IMPORT_3D_MODELS',
  'PUBLISH_3D_MODELS',
  'VIEW_ALL_3D_MODELS',
  'CREATE_IMAGES',
  'EDIT_IMAGES',
  'PUBLISH_IMAGES',
  'VIEW_ALL_IMAGES',
  'CREATE_VIDEOS',
  'EDIT_VIDEOS',
  'PUBLISH_VIDEOS',
  'VIEW_ALL_VIDEOS',
  'VIEW_USAGE_ANALYSIS',
  'EXPORT_USAGE_DATA',
  'VIEW_USER_ANALYTICS',
  'VIEW_WORKSPACE_ANALYTICS',
  'WORKSPACE_SETTINGS',
  'USER_MANAGEMENT',
  'BILLING_MANAGEMENT',
  'INVITE_USERS',
  'REMOVE_USERS',
  'ASSIGN_ROLES',
  'CREATE_GROUPS',
  'MANAGE_GROUPS',
  'VIEW_AUDIT_LOGS',
  'EXPORT_AUDIT_LOGS',
];

// Detailed permission lists for each role type
const permissionDetails: { [key: string]: string[] } = {
  'Operator': [
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_TASKS',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Operator MR': [
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Field Service Engineer': [
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Service Support Expert': [
    'ANALYTICS_TAB',
    'CALL_REMOTE_SUPPORT',
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'SCHEDULE_REMOTE_SUPPORT',
    'SCHEDULE_VIRTUAL_ROOM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_REMOTE_SUPPORT_USERS_LIST',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Instructor': [
    'ANALYTICS_TAB',
    'CALL_REMOTE_SUPPORT',
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_COLLABORATORS',
    'EDIT_PNC',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'SCHEDULE_REMOTE_SUPPORT',
    'SCHEDULE_VIRTUAL_ROOM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_COLLABORATORS',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_REMOTE_SUPPORT_USERS_LIST',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Support Service Manager': [
    'ANALYTICS_TAB',
    'CALL_REMOTE_SUPPORT',
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_COLLABORATORS',
    'EDIT_PNC',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'SCHEDULE_REMOTE_SUPPORT',
    'SCHEDULE_VIRTUAL_ROOM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_COLLABORATORS',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
    'VIEW_REMOTE_SUPPORT_USERS_LIST',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_VIRTUAL_ROOM',
  ],
  'Content Creator': [
    'ACCESS_MEDIA',
    'CREATE_PROCEDURE_AND_SETTINGS',
    'DUPLICATE_PROCEDURE',
    'DUPLICATE_PROJECT',
    'EDIT_COLLABORATORS',
    'EDIT_PNC',
    'EDIT_PROCEDURES',
    'EDIT_ROLES',
    'EDIT_TASKS',
    'EDIT_THREE_D_MODES',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'MOVE_AND_DELETE_ITEMS',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_SETTINGS',
    'PUBLISH_PROCEDURE',
    'SUPPORT_AI_CHAT',
    'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_COLLABORATORS',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_RECORDER',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_UNPUBLISHED',
    'GUIDES_UPLOAD',
  ],
  'Advanced Content Creator': [
    'ACCESS_MEDIA',
    'ANALYTICS_TAB',
    'CREATE_PROCEDURE_AND_SETTINGS',
    'DUPLICATE_PROCEDURE',
    'DUPLICATE_PROJECT',
    'EDIT_CAD_DATA',
    'EDIT_COLLABORATORS',
    'EDIT_PNC',
    'EDIT_PROCEDURES',
    'EDIT_ROLES',
    'EDIT_TASKS',
    'EDIT_THREE_D_MODES',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'MOVE_AND_DELETE_ITEMS',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'PROJECT_SETTINGS',
    'PUBLISH_PROCEDURE',
    'SUPPORT_AI_CHAT',
    'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_COLLABORATORS',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_RECORDER',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_UNPUBLISHED',
    'GUIDES_UPLOAD',
  ],
  'Usage Analysis': [
    'ANALYTICS_TAB',
    'GENERATE_ANALYTICS_REPORTS',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'SUPPORT_AI_CHAT',
    'VIEW_PUBLISHED',
    'VIEW_TASKS',
  ],
  'Workspace Admin': [
    'ACCESS_MEDIA',
    'ANALYTICS_TAB',
    'CREATE_PROCEDURE_AND_SETTINGS',
    'EDIT_COLLABORATORS',
    'EDIT_PNC',
    'EDIT_ROLES',
    'EDIT_TASKS',
    'GENERATE_ANALYTICS_REPORTS',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'PROJECT_SETTINGS',
    'SUPPORT_AI_CHAT',
    'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
    'VIEW_COLLABORATORS',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'GUIDES_UPLOAD',
  ],
  'Guest': [
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PUBLISHED',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_REMOTE_SUPPORT_DEVICE_ID',
  ],
};

const trainingPermissions = [
  { value: 'None', label: 'None', description: 'No training permissions', permissions: [] },
  { value: 'Operator', label: 'Operator', description: 'Operates equipment using flows', permissions: permissionDetails['Operator'] },
  { value: 'Operator MR', label: 'Operator MR', description: 'Uses Mixed Reality for equipment tasks', permissions: permissionDetails['Operator MR'] },
  { value: 'Instructor', label: 'Instructor', description: 'Trains staff on equipment', permissions: permissionDetails['Instructor'] },
  { value: 'Field Service Engineer', label: 'Field Service Engineer', description: 'On-site technical issue resolver', permissions: permissionDetails['Field Service Engineer'] },
  { value: 'Service Support Expert', label: 'Service Support Expert', description: 'Remote troubleshooting and support', permissions: permissionDetails['Service Support Expert'] },
  { value: 'Support Service Manager', label: 'Service Support Manager', description: 'Manages support team operations', permissions: permissionDetails['Support Service Manager'] },
];

const contentPermissions = [
  { value: 'None', label: 'None', description: 'No content creation permissions', permissions: [] },
  { value: 'Content Creator', label: 'Content Creator', description: 'Builds interactive training content', permissions: permissionDetails['Content Creator'] },
  { value: 'Advanced Content Creator', label: 'Advanced Content Creator', description: 'Enhanced tools for content creation', permissions: permissionDetails['Advanced Content Creator'] },
];

const administrationPermissions = [
  { value: 'None', label: 'None', description: 'No administration permissions', permissions: [] },
  { value: 'Usage Analysis', label: 'Usage Analysis', description: 'Generates user activity reports', permissions: permissionDetails['Usage Analysis'] },
  { value: 'Workspace Admin', label: 'Workspace Admin', description: 'Manages users and settings', permissions: permissionDetails['Workspace Admin'] },
];

export const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Operator',
    description: 'Operates equipment using flows',
    permissions: { training: 'Operator', content: 'None', administration: 'None' },
    memberCount: 24,
  },
  {
    id: '2',
    name: 'Support Agent',
    description: 'Provides remote troubleshooting and support',
    permissions: { training: 'Service Support Expert', content: 'None', administration: 'None' },
    memberCount: 8,
  },
  {
    id: '3',
    name: 'Content Creator',
    description: 'Builds interactive training content',
    permissions: { training: 'None', content: 'Content Creator', administration: 'None' },
    memberCount: 12,
  },
  {
    id: '4',
    name: 'Admin',
    description: 'Manages users and workspace settings',
    permissions: { training: 'None', content: 'None', administration: 'Workspace Admin' },
    memberCount: 3,
  },
];

// Mock member data for roles
const mockMembersByRole: { [roleName: string]: Array<{ id: string; name: string; email: string; initials: string; color: string; }> } = {
  'Operator': [
    { id: '1', name: 'Alex Turner', email: 'alex.turner@company.com', initials: 'AT', color: '#3b82f6' },
    { id: '2', name: 'Maria Garcia', email: 'maria.garcia@company.com', initials: 'MG', color: '#10b981' },
    { id: '3', name: 'James Wilson', email: 'james.wilson@company.com', initials: 'JW', color: '#f59e0b' },
    { id: '4', name: 'Sofia Chen', email: 'sofia.chen@company.com', initials: 'SC', color: '#ef4444' },
    { id: '5', name: 'David Miller', email: 'david.miller@company.com', initials: 'DM', color: '#8b5cf6' },
    { id: '6', name: 'Emma Johnson', email: 'emma.johnson@company.com', initials: 'EJ', color: '#ec4899' },
  ],
  'Support Agent': [
    { id: '7', name: 'Robert Lee', email: 'robert.lee@company.com', initials: 'RL', color: '#06b6d4' },
    { id: '8', name: 'Linda Brown', email: 'linda.brown@company.com', initials: 'LB', color: '#84cc16' },
    { id: '9', name: 'Michael Davis', email: 'michael.davis@company.com', initials: 'MD', color: '#f97316' },
  ],
  'Content Creator': [
    { id: '10', name: 'Sarah Thompson', email: 'sarah.thompson@company.com', initials: 'ST', color: '#14b8a6' },
    { id: '11', name: 'Kevin Martinez', email: 'kevin.martinez@company.com', initials: 'KM', color: '#a855f7' },
    { id: '12', name: 'Jessica White', email: 'jessica.white@company.com', initials: 'JW', color: '#f43f5e' },
    { id: '13', name: 'Daniel Rodriguez', email: 'daniel.rodriguez@company.com', initials: 'DR', color: '#3b82f6' },
  ],
  'Admin': [
    { id: '14', name: 'Jennifer Taylor', email: 'jennifer.taylor@company.com', initials: 'JT', color: '#10b981' },
    { id: '15', name: 'Christopher Moore', email: 'christopher.moore@company.com', initials: 'CM', color: '#f59e0b' },
  ],
};

interface RolesManagementPageProps {
  onNavigateToMembersWithRole?: (roleName: string) => void;
  roles?: Role[];
  onRolesChange?: (roles: Role[]) => void;
}

export function RolesManagementPage({ onNavigateToMembersWithRole, roles: externalRoles, onRolesChange }: RolesManagementPageProps) {
  // Role-based access control (defense-in-depth — sidebar already gates this page to admin)
  const { currentRole } = useRole();
  const isAdmin = hasAccess(currentRole, 'workspace-management');

  const [internalRoles, setInternalRoles] = useState<Role[]>(defaultRoles);
  
  // Use external roles if provided, otherwise use internal state
  const roles = externalRoles !== undefined ? externalRoles : internalRoles;
  const setRoles = (newRoles: Role[] | ((prev: Role[]) => Role[])) => {
    const updatedRoles = typeof newRoles === 'function' ? newRoles(roles) : newRoles;
    setInternalRoles(updatedRoles);
    if (onRolesChange) {
      onRolesChange(updatedRoles);
    }
  };
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [showPermissionDropdown, setShowPermissionDropdown] = useState<{
    roleId: string;
    type: 'training' | 'content' | 'administration';
  } | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteModalRole, setDeleteModalRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permissionsModal, setPermissionsModal] = useState<{ 
    label: string;
    rolePermissions: string[];
  } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [memberListMenu, setMemberListMenu] = useState<{ role: Role; position: { top: number; left: number } } | null>(null);
  const [reassignRoleModal, setReassignRoleModal] = useState<{ role: Role; members: Array<{ id: string; name: string; email: string; initials: string; color: string; }> } | null>(null);

  const handleCreateRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: 'New Role',
      permissions: { training: 'None', content: 'None', administration: 'None' },
      memberCount: 0,
    };
    setRoles([...roles, newRole]);
    setEditingRoleId(newRole.id);
    setEditingName(newRole.name);
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModalRole(role);
  };

  const confirmDeleteRole = () => {
    if (deleteModalRole) {
      setRoles(roles.filter((r) => r.id !== deleteModalRole.id));
      setDeleteModalRole(null);
    }
  };

  const handleRenameRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setEditingRoleId(roleId);
      setEditingName(role.name);
      setEditingDescription(role.description || '');
    }
  };

  const saveRename = (roleId: string) => {
    setRoles(roles.map((r) => (r.id === roleId ? { ...r, name: editingName, description: editingDescription } : r)));
    setEditingRoleId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const cancelRename = () => {
    setEditingRoleId(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handlePermissionChange = (
    roleId: string,
    type: 'training' | 'content' | 'administration',
    value: string
  ) => {
    setRoles(
      roles.map((r) =>
        r.id === roleId ? { ...r, permissions: { ...r.permissions, [type]: value } } : r
      )
    );
    setShowPermissionDropdown(null);
    setDropdownPosition(null);
  };

  const handleOpenDropdown = (
    roleId: string,
    type: 'training' | 'content' | 'administration',
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Get the number of items for this dropdown type
    const permissionOptions = getPermissionOptions(type);
    const itemCount = permissionOptions.length;
    
    // Calculate actual dropdown height based on content
    // Each item is approximately 68px (padding + text), with a max-height of 400px
    const itemHeight = 68;
    const calculatedHeight = itemCount * itemHeight;
    const maxDropdownHeight = 400;
    const dropdownHeight = Math.min(calculatedHeight, maxDropdownHeight);
    
    const dropdownWidth = 320; // Actual dropdown width
    const gap = 4; // Gap between button and dropdown
    
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    let top: number;
    let left = rect.left;
    
    // Determine if dropdown should appear below or above
    if (spaceBelow >= dropdownHeight + gap) {
      // Enough space below - show below button
      top = rect.bottom + gap;
    } else if (spaceAbove >= dropdownHeight + gap) {
      // Not enough space below but enough above - show above button
      top = rect.top - dropdownHeight - gap;
    } else if (spaceBelow > spaceAbove) {
      // Not enough space either way, but more space below
      top = rect.bottom + gap;
    } else {
      // Not enough space either way, but more space above
      top = rect.top - dropdownHeight - gap;
    }
    
    // Align dropdown with button width if button is wider, otherwise align left edge
    if (rect.width >= dropdownWidth) {
      // Button is wider, center dropdown under button
      left = rect.left;
    } else {
      // Align left edge with button
      left = rect.left;
    }
    
    // Check if dropdown would go off right edge
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = window.innerWidth - dropdownWidth - 16; // 16px padding from edge
    }
    
    // Ensure it doesn't go off left edge
    if (left < 16) {
      left = 16; // 16px padding from left
    }
    
    // Ensure it doesn't go off top edge
    if (top < 16) {
      top = 16; // 16px padding from top
    }
    
    // Ensure it doesn't go off bottom edge
    if (top + dropdownHeight > window.innerHeight - 16) {
      top = window.innerHeight - dropdownHeight - 16;
    }
    
    setDropdownPosition({ top, left });
    setShowPermissionDropdown(
      showPermissionDropdown?.roleId === roleId && showPermissionDropdown?.type === type
        ? null
        : { roleId, type }
    );
  };

  const getPermissionOptions = (type: 'training' | 'content' | 'administration') => {
    switch (type) {
      case 'training':
        return trainingPermissions;
      case 'content':
        return contentPermissions;
      case 'administration':
        return administrationPermissions;
    }
  };

  const handleRoleClick = (roleId: string) => {
    setSelectedRoleId(selectedRoleId === roleId ? null : roleId);
  };

  const handleMemberCountClick = (role: Role, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    // Calculate position beside the button
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const menuWidth = 320;
    const menuHeight = 400;
    
    let top = rect.top;
    let left = rect.right + 8; // 8px gap to the right of button
    
    // Check if menu would go off right edge
    if (left + menuWidth > window.innerWidth) {
      left = rect.left - menuWidth - 8; // Show on left side instead
    }
    
    // Check if menu would go off bottom edge
    if (top + menuHeight > window.innerHeight) {
      top = window.innerHeight - menuHeight - 16; // 16px padding from bottom
    }
    
    // Check if menu would go off top edge
    if (top < 16) {
      top = 16; // 16px padding from top
    }
    
    setMemberListMenu({ role, position: { top, left } });
  };

  const handleReassignRoleClick = (role: Role) => {
    const members = mockMembersByRole[role.name] || [];
    setReassignRoleModal({ role, members });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showPermissionDropdown) {
        const target = e.target as HTMLElement;
        if (!target.closest('.permission-dropdown') && !target.closest('.permission-button')) {
          setShowPermissionDropdown(null);
          setDropdownPosition(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPermissionDropdown]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-5 bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Roles
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Define roles with specific permissions for training, content, and administration
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateRole}
              className="px-4 py-2 rounded-lg transition-opacity hover:opacity-90 bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          )}
        </div>
      </div>

      {/* Roles List */}
      <div className="flex-1 overflow-auto bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
            <div
              key={role.id}
              onClick={() => handleRoleClick(role.id)}
              className="border rounded-lg overflow-hidden cursor-pointer transition-all"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
              }}
            >
              {/* Role Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0" style={{ minHeight: '32px' }}>
                    {editingRoleId === role.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(role.id);
                              if (e.key === 'Escape') cancelRename();
                            }}
                            placeholder="Role name"
                            className="flex-1 px-2 py-1 border text-sm bg-background focus:outline-none focus:ring-2"
                            style={{ 
                              color: 'var(--foreground)',
                              borderColor: 'var(--border)',
                              borderRadius: 'var(--radius)',
                              fontFamily: 'var(--font-family)',
                            }}
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRename(role.id);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelRename();
                            }}
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
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(role.id);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          placeholder="Role description (optional)"
                          className="px-2 py-1 border text-xs bg-background focus:outline-none focus:ring-2"
                          style={{ 
                            color: 'var(--muted)',
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius)',
                            fontFamily: 'var(--font-family)',
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                            {role.name}
                          </h3>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameRole(role.id);
                              }}
                              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                              style={{ borderRadius: 'var(--radius)' }}
                            >
                              <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                            </button>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                            {role.description}
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={(e) => handleMemberCountClick(role, e)}
                      className="flex items-center gap-2 mt-1 px-2 py-1 rounded transition-all hover:bg-secondary"
                      style={{ cursor: 'pointer', borderRadius: 'var(--radius-sm)', marginLeft: '-8px' }}
                    >
                      <Users className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
                        {role.memberCount} member{role.memberCount !== 1 ? 's' : ''}
                      </span>
                    </button>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                    </button>
                  )}
                </div>

                {/* Permissions - Always Visible */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                  {/* Training Permissions */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                      Training and Field
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => handleOpenDropdown(role.id, 'training', e)}
                        className="permission-button w-full px-3 py-2.5 border rounded-lg transition-colors text-left"
                        style={{ 
                          borderColor: role.permissions.training !== 'None' ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: role.permissions.training !== 'None' ? 'var(--primary-background)' : 'var(--background)',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-family)',
                          minHeight: '42px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = role.permissions.training !== 'None' ? 'var(--primary-background)' : 'var(--background)'}
                      >
                        <span
                          className="text-sm font-medium block truncate"
                          style={{
                            color:
                              role.permissions.training === 'None'
                                ? 'var(--muted)'
                                : 'var(--foreground)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {role.permissions.training}
                        </span>
                      </button>

                      {showPermissionDropdown?.roleId === role.id &&
                        showPermissionDropdown?.type === 'training' &&
                        dropdownPosition && (
                          <div 
                            className="permission-dropdown fixed z-[100] w-[320px] bg-card border rounded-lg max-h-[400px] overflow-y-auto"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                              borderColor: 'var(--border)',
                              borderRadius: 'var(--radius)',
                              boxShadow: 'var(--shadow-elevation-lg)',
                            }}
                          >
                            {trainingPermissions.map((perm) => {
                              const hasPermissions = perm.permissions && perm.permissions.length > 0;
                              return (
                                <div 
                                  key={perm.value} 
                                  className="relative border-b last:border-b-0 group" 
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <button
                                    onClick={() =>
                                      handlePermissionChange(role.id, 'training', perm.value)
                                    }
                                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                                    style={{
                                      fontFamily: 'var(--font-family)'
                                    }}
                                  >
                                    <p className="text-sm font-medium pr-8" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
                                      {perm.label}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                                      {perm.description}
                                    </p>
                                  </button>
                                  {hasPermissions && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPermissionsModal({
                                          label: perm.label,
                                          rolePermissions: perm.permissions
                                        });
                                      }}
                                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-secondary/50 transition-all md:opacity-0 md:group-hover:opacity-100"
                                      style={{
                                        color: 'var(--primary)',
                                      }}
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Content Permissions */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                      Content Creation
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => handleOpenDropdown(role.id, 'content', e)}
                        className="permission-button w-full px-3 py-2.5 border rounded-lg transition-colors text-left"
                        style={{ 
                          borderColor: role.permissions.content !== 'None' ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: role.permissions.content !== 'None' ? 'var(--primary-background)' : 'var(--background)',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-family)',
                          minHeight: '42px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = role.permissions.content !== 'None' ? 'var(--primary-background)' : 'var(--background)'}
                      >
                        <span
                          className="text-sm font-medium block truncate"
                          style={{
                            color:
                              role.permissions.content === 'None'
                                ? 'var(--muted)'
                                : 'var(--foreground)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {role.permissions.content}
                        </span>
                      </button>

                      {showPermissionDropdown?.roleId === role.id &&
                        showPermissionDropdown?.type === 'content' &&
                        dropdownPosition && (
                          <div 
                            className="permission-dropdown fixed z-[100] w-[320px] bg-card border rounded-lg max-h-[400px] overflow-y-auto"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                              borderColor: 'var(--border)',
                              borderRadius: 'var(--radius)',
                              boxShadow: 'var(--shadow-elevation-lg)',
                            }}
                          >
                            {contentPermissions.map((perm) => {
                              const hasPermissions = perm.permissions && perm.permissions.length > 0;
                              return (
                                <div 
                                  key={perm.value} 
                                  className="relative border-b last:border-b-0 group" 
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <button
                                    onClick={() =>
                                      handlePermissionChange(role.id, 'content', perm.value)
                                    }
                                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                                    style={{
                                      fontFamily: 'var(--font-family)'
                                    }}
                                  >
                                    <p className="text-sm font-medium pr-8" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
                                      {perm.label}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                                      {perm.description}
                                    </p>
                                  </button>
                                  {hasPermissions && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPermissionsModal({
                                          label: perm.label,
                                          rolePermissions: perm.permissions
                                        });
                                      }}
                                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-secondary/50 transition-all md:opacity-0 md:group-hover:opacity-100"
                                      style={{
                                        color: 'var(--primary)',
                                      }}
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Administration Permissions */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                      Administration
                    </label>
                    <div className="relative">
                      <button
                        onClick={(e) => handleOpenDropdown(role.id, 'administration', e)}
                        className="permission-button w-full px-3 py-2.5 border rounded-lg transition-colors text-left"
                        style={{ 
                          borderColor: role.permissions.administration !== 'None' ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: role.permissions.administration !== 'None' ? 'var(--primary-background)' : 'var(--background)',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-family)',
                          minHeight: '42px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = role.permissions.administration !== 'None' ? 'var(--primary-background)' : 'var(--background)'}
                      >
                        <span
                          className="text-sm font-medium block truncate"
                          style={{
                            color:
                              role.permissions.administration === 'None'
                                ? 'var(--muted)'
                                : 'var(--foreground)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {role.permissions.administration}
                        </span>
                      </button>

                      {showPermissionDropdown?.roleId === role.id &&
                        showPermissionDropdown?.type === 'administration' &&
                        dropdownPosition && (
                          <div 
                            className="permission-dropdown fixed z-[100] w-[320px] bg-card border rounded-lg max-h-[400px] overflow-y-auto"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                              borderColor: 'var(--border)',
                              borderRadius: 'var(--radius)',
                              boxShadow: 'var(--shadow-elevation-lg)',
                            }}
                          >
                            {administrationPermissions.map((perm) => {
                              const hasPermissions = perm.permissions && perm.permissions.length > 0;
                              return (
                                <div 
                                  key={perm.value} 
                                  className="relative border-b last:border-b-0 group" 
                                  style={{ borderColor: 'var(--border)' }}
                                >
                                  <button
                                    onClick={() =>
                                      handlePermissionChange(role.id, 'administration', perm.value)
                                    }
                                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                                    style={{
                                      fontFamily: 'var(--font-family)'
                                    }}
                                  >
                                    <p className="text-sm font-medium pr-8" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
                                      {perm.label}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
                                      {perm.description}
                                    </p>
                                  </button>
                                  {hasPermissions && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPermissionsModal({
                                          label: perm.label,
                                          rolePermissions: perm.permissions
                                        });
                                      }}
                                      className="absolute top-3 right-3 p-1.5 rounded hover:bg-secondary/50 transition-all md:opacity-0 md:group-hover:opacity-100"
                                      style={{
                                        color: 'var(--primary)',
                                      }}
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalRole && (
        <RoleDeleteModal
          roleName={deleteModalRole.name}
          memberCount={deleteModalRole.memberCount}
          onConfirm={confirmDeleteRole}
          onCancel={() => setDeleteModalRole(null)}
          onAssignRole={() => {
            handleReassignRoleClick(deleteModalRole);
            setDeleteModalRole(null);
          }}
        />
      )}
      
      {memberListMenu && (
        <RoleMembersContextMenu
          roleName={memberListMenu.role.name}
          members={mockMembersByRole[memberListMenu.role.name] || []}
          onClose={() => setMemberListMenu(null)}
          position={memberListMenu.position}
        />
      )}
      
      {/* Permissions Modal */}
      {permissionsModal && (
        <PermissionsModal
          roleName={permissionsModal.label}
          rolePermissions={permissionsModal.rolePermissions}
          onClose={() => setPermissionsModal(null)}
        />
      )}
      
      {/* Reassign Role Modal */}
      {reassignRoleModal && (
        <ReassignRoleModal
          roleName={reassignRoleModal.role.name}
          members={reassignRoleModal.members}
          availableRoles={roles.filter(r => r.id !== reassignRoleModal.role.id).map(r => r.name)}
          onClose={() => setReassignRoleModal(null)}
          onReassign={(memberIds, newRole) => {
            // Update member count for the old role
            setRoles(roles.map(r => {
              if (r.id === reassignRoleModal.role.id) {
                return { ...r, memberCount: Math.max(0, r.memberCount - memberIds.length) };
              }
              // Update member count for the new role
              if (r.name === newRole) {
                return { ...r, memberCount: r.memberCount + memberIds.length };
              }
              return r;
            }));
            
            // Check if all members have been reassigned
            const remainingCount = reassignRoleModal.role.memberCount - memberIds.length;
            if (remainingCount === 0) {
              // All members reassigned, now we can show delete confirmation
              setReassignRoleModal(null);
              setDeleteModalRole(roles.find(r => r.id === reassignRoleModal.role.id) || null);
            } else {
              // Still have members, close the reassign modal
              setReassignRoleModal(null);
            }
          }}
        />
      )}
    </div>
  );
}