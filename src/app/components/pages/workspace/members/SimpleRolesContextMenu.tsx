import { X, RefreshCw, Settings, Info } from 'lucide-react';
import { useState } from 'react';
import { PermissionsModal } from './PermissionsModal';
import { Checkbox } from './Checkbox';

export interface RoleWithDescription {
  name: string;
  description?: string;
}

interface SimpleRolesContextMenuProps {
  selectedRoles?: string[]; // Changed from currentRole to selectedRoles for multi-select
  currentRole?: string | null; // Keep for backward compatibility
  onClose: () => void;
  onSelect?: (role: string) => void; // Keep for backward compatibility
  onToggleRole?: (role: string) => void; // New handler for multi-select
  onToggleRoleSystem?: () => void;
  roleSystemType?: 'new' | 'today';
  onNavigateToRoles?: () => void;
  isBatchMode?: boolean;
  selectedMembersCount?: number;
  availableRoles?: RoleWithDescription[];
  isFilterMode?: boolean; // New prop to indicate this is for filtering
}

const defaultRoles = [
  {
    name: 'Owner',
    description: 'Full access to workspace and settings',
  },
  {
    name: 'Admin',
    description: 'Manages users and workspace settings',
  },
  {
    name: 'Operator',
    description: 'Operates equipment using flows',
  },
  {
    name: 'Support Agent',
    description: 'Provides remote troubleshooting and support',
  },
  {
    name: 'Content Creator',
    description: 'Builds interactive training content',
  },
];

const roleDescriptions: { [key: string]: string } = {
  'Operator': 'Operates equipment using flows',
  'Support Agent': 'Provides remote troubleshooting and support',
  'Content Creator': 'Builds interactive training content',
  'Admin': 'Manages users and workspace settings',
  'Owner': 'Full access to workspace and settings',
};

// Comprehensive role permissions mapping
const rolePermissions: { [key: string]: string[] } = {
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
  'Admin': [
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
  'Owner': [
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
    'WORKSPACE_SETTINGS',
    'BILLING_AND_SUBSCRIPTION',
    'MANAGE_WORKSPACE_MEMBERS',
  ],
  'Support Agent': [
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
};

export function SimpleRolesContextMenu({ selectedRoles, currentRole, onClose, onSelect, onToggleRole, onToggleRoleSystem, roleSystemType, onNavigateToRoles, isBatchMode = false, selectedMembersCount = 0, availableRoles: externalAvailableRoles, isFilterMode = false }: SimpleRolesContextMenuProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState<{ roleName: string; permissions: string[] } | null>(null);
  
  // Build roles list from provided availableRoles or use defaults
  const roles = externalAvailableRoles || defaultRoles;
  return (
    <div
      className="rounded-lg shadow-elevation-sm w-[320px] bg-card border border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
              {isFilterMode ? 'Filter by Role' : isBatchMode ? 'Update Role' : 'Assign Role'}
            </h3>
            {isBatchMode && !isFilterMode && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                Updating {selectedMembersCount} member{selectedMembersCount > 1 ? 's' : ''}
              </p>
            )}
            {isFilterMode && selectedRoles && selectedRoles.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                {selectedRoles.length} role{selectedRoles.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onToggleRoleSystem && !isFilterMode && (
              <button
                onClick={onToggleRoleSystem}
                className="p-1 hover:bg-secondary rounded transition-colors"
                title={roleSystemType === 'new' ? 'Switch to Today Role System' : 'Switch to New Role System'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles List */}
        <div className="flex flex-col gap-px max-h-[300px] overflow-y-auto">
          {roles.map((role) => {
            const permissions = rolePermissions[role.name] || [];
            const hasPermissions = permissions.length > 0;
            const isSelected = isFilterMode && selectedRoles ? selectedRoles.includes(role.name) : currentRole === role.name;
            
            return (
              <div key={role.name} className="relative group">
                <button
                  onClick={() => {
                    if (isFilterMode && onToggleRole) {
                      onToggleRole(role.name);
                    } else if (onSelect) {
                      onSelect(role.name);
                    }
                  }}
                  onMouseEnter={() => setHoveredRole(role.name)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className={`w-full flex items-start gap-3 p-2 hover:bg-secondary transition-colors rounded text-left ${
                    !isFilterMode && isSelected ? 'bg-secondary' : ''
                  }`}
                >
                  {isFilterMode && (
                    <div className="pt-0.5 flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleRole && onToggleRole(role.name)}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                      {role.name}
                    </p>
                    {role.description && (
                      <p className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                        {role.description}
                      </p>
                    )}
                  </div>
                </button>
                {hasPermissions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPermissionsModal({ roleName: role.name, permissions });
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded hover:bg-secondary/80 transition-all md:opacity-0 md:group-hover:opacity-100"
                    title={`View ${role.name} permissions`}
                  >
                    <Info 
                      className="w-3.5 h-3.5" 
                      style={{ color: 'var(--primary)' }}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Manage Roles Link */}
        {onNavigateToRoles && !isFilterMode && (
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => {
                onNavigateToRoles();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs hover:bg-secondary rounded-lg transition-colors"
              style={{ 
                color: 'var(--primary)', 
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              <Settings className="w-3.5 h-3.5" />
              Manage Roles
            </button>
          </div>
        )}
      </div>
      
      {/* Permissions Modal */}
      {showPermissionsModal && (
        <PermissionsModal
          roleName={showPermissionsModal.roleName}
          rolePermissions={showPermissionsModal.permissions}
          onClose={() => setShowPermissionsModal(null)}
        />
      )}
    </div>
  );
}