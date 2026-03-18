import { X, Info, Check } from 'lucide-react';

// All 47 possible permissions
const allPossiblePermissions = [
  'ACCESS_MEDIA',
  'ANALYTICS_TAB',
  'CALL_REMOTE_SUPPORT',
  'CREATE_PROCEDURE_AND_SETTINGS',
  'CREATE_REMOTE_SUPPORT',
  'CREATE_VIRTUAL_ROOM',
  'DUPLICATE_PROCEDURE',
  'DUPLICATE_PROJECT',
  'EDIT_CAD_DATA',
  'EDIT_COLLABORATORS',
  'EDIT_PNC',
  'EDIT_PROCEDURES',
  'EDIT_ROLES',
  'EDIT_TASKS',
  'EDIT_THREE_D_MODES',
  'GENERATE_ANALYTICS_REPORTS',
  'GET_CAD_DATA',
  'GET_SPARE_PARTS_DATA',
  'GUIDES_UPLOAD',
  'IN_APP_DIGITAL_TWIN_CREATION',
  'MOVE_AND_DELETE_ITEMS',
  'NEW_OBJECT_TARGET_SYSTEM',
  'PROJECT_DASHBOARD',
  'PROJECT_SETTINGS',
  'PUBLISH_PROCEDURE',
  'SCHEDULE_REMOTE_SUPPORT',
  'SCHEDULE_VIRTUAL_ROOM',
  'SUPPORT_AI_CHAT',
  'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
  'SUPPORT_PARTS_CATALOG_LIST',
  'VIEW_COLLABORATORS',
  'VIEW_PUBLISHED',
  'VIEW_PROCEDURE_AND_MEDIA',
  'VIEW_RECORDER',
  'VIEW_REMOTE_SUPPORT',
  'VIEW_REMOTE_SUPPORT_DEVICE_ID',
  'VIEW_REMOTE_SUPPORT_USERS_LIST',
  'VIEW_TASKS',
  'VIEW_THREE_D_SCENES',
  'VIEW_UNPUBLISHED',
  'VIEW_VIRTUAL_ROOM',
];

// Human-readable permission titles
const permissionTitles: { [key: string]: string } = {
  'ACCESS_MEDIA': 'Access Media',
  'ANALYTICS_TAB': 'Analytics Tab',
  'CALL_REMOTE_SUPPORT': 'Call Remote Support',
  'CREATE_PROCEDURE_AND_SETTINGS': 'Create Procedure & Settings',
  'CREATE_REMOTE_SUPPORT': 'Create Remote Support',
  'CREATE_VIRTUAL_ROOM': 'Create Virtual Room',
  'DUPLICATE_PROCEDURE': 'Duplicate Procedure',
  'DUPLICATE_PROJECT': 'Duplicate Project',
  'EDIT_CAD_DATA': 'Edit CAD Data',
  'EDIT_COLLABORATORS': 'Edit Collaborators',
  'EDIT_PNC': 'Edit P&C',
  'EDIT_PROCEDURES': 'Edit Procedures',
  'EDIT_ROLES': 'Edit Roles',
  'EDIT_TASKS': 'Edit Tasks',
  'EDIT_THREE_D_MODES': 'Edit 3D Modes',
  'GENERATE_ANALYTICS_REPORTS': 'Generate Analytics Reports',
  'GET_CAD_DATA': 'Get CAD Data',
  'GET_SPARE_PARTS_DATA': 'Get Spare Parts Data',
  'GUIDES_UPLOAD': 'Guides Upload',
  'IN_APP_DIGITAL_TWIN_CREATION': 'In-App Digital Twin Creation',
  'MOVE_AND_DELETE_ITEMS': 'Move & Delete Items',
  'NEW_OBJECT_TARGET_SYSTEM': 'New Object Target System',
  'PROJECT_DASHBOARD': 'Project Dashboard',
  'PROJECT_SETTINGS': 'Project Settings',
  'PUBLISH_PROCEDURE': 'Publish Procedure',
  'SCHEDULE_REMOTE_SUPPORT': 'Schedule Remote Support',
  'SCHEDULE_VIRTUAL_ROOM': 'Schedule Virtual Room',
  'SUPPORT_AI_CHAT': 'Support AI Chat',
  'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS': 'Support Bookmarks & Context Menu',
  'SUPPORT_PARTS_CATALOG_LIST': 'Support Parts Catalog List',
  'VIEW_COLLABORATORS': 'View Collaborators',
  'VIEW_PUBLISHED': 'View Published',
  'VIEW_PROCEDURE_AND_MEDIA': 'View Procedure & Media',
  'VIEW_RECORDER': 'View Recorder',
  'VIEW_REMOTE_SUPPORT': 'View Remote Support',
  'VIEW_REMOTE_SUPPORT_DEVICE_ID': 'View Remote Support Device ID',
  'VIEW_REMOTE_SUPPORT_USERS_LIST': 'View Remote Support Users List',
  'VIEW_TASKS': 'View Tasks',
  'VIEW_THREE_D_SCENES': 'View 3D Scenes',
  'VIEW_UNPUBLISHED': 'View Unpublished',
  'VIEW_VIRTUAL_ROOM': 'View Virtual Room',
};

interface PermissionsModalProps {
  roleName: string;
  rolePermissions: string[];
  onClose: () => void;
}

export function PermissionsModal({ roleName, rolePermissions, onClose }: PermissionsModalProps) {
  const enabledCount = rolePermissions.length;
  const disabledCount = allPossiblePermissions.length - enabledCount;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permissions-modal-title"
    >
      <div
        className="bg-card rounded-lg border w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col m-4"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevation-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-background)' }}
            >
              <Info className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 
                id="permissions-modal-title"
                className="font-bold" 
                style={{ 
                  color: 'var(--foreground)', 
                  
                  fontSize: 'var(--text-h3)'
                }}
              >
                {roleName} Permissions
              </h2>
              <p 
                className="text-sm mt-0.5" 
                style={{ 
                  color: 'var(--muted)', 
                   
                }}
              >
                {enabledCount} enabled · {disabledCount} disabled
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allPossiblePermissions.map((permission) => {
              const isEnabled = rolePermissions.includes(permission);
              return (
                <div
                  key={permission}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: isEnabled ? 'var(--success-background)' : 'var(--card)',
                    borderColor: isEnabled ? 'var(--success)' : 'var(--border)',
                    opacity: isEnabled ? 1 : 0.6,
                  }}
                >
                  <div 
                    className="flex items-center justify-center w-5 h-5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: isEnabled ? 'var(--success)' : 'var(--secondary)',
                    }}
                  >
                    {isEnabled && (
                      <Check 
                        className="w-3.5 h-3.5" 
                        style={{ color: 'white' }}
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span 
                    className="text-sm"
                    style={{ 
                      color: 'var(--foreground)',
                      
                      fontWeight: isEnabled ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                    }}
                  >
                    {permissionTitles[permission] || permission}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
