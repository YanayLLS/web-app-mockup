import { useState } from 'react';
import { X, ChevronDown, Save, Plus, Search, ChevronLeft, RefreshCw, Settings, Info } from 'lucide-react';
import { PermissionsModal } from './PermissionsModal';
import { useAppPopup } from '../../../../contexts/AppPopupContext';

interface RolesSelectionContextMenuProps {
  currentRoles: {
    training: string;
    content: string;
    administration: string;
  };
  onClose: () => void;
  onSave: (roles: any) => void;
  onToggleRoleSystem?: () => void;
  roleSystemType?: 'new' | 'today';
  onNavigateToRoles?: () => void;
  isBatchMode?: boolean;
  selectedMembersCount?: number;
}

interface RoleTemplate {
  id: string;
  name: string;
  roles: {
    training: string;
    content: string;
    administration: string;
  };
}

const trainingRoles = [
  { value: 'None', label: 'None', description: 'No training permissions' },
  { value: 'Operator', label: 'Operator', description: 'Operates equipment using flows' },
  { value: 'Operator MR', label: 'Operator MR', description: 'Uses Mixed Reality for equipment tasks' },
  { value: 'Instructor', label: 'Instructor', description: 'Trains staff on equipment' },
  { value: 'Field Service Engineer', label: 'Field Service Engineer', description: 'On-site technical issue resolver' },
  { value: 'Service Support Expert', label: 'Service Support Expert', description: 'Remote troubleshooting and support' },
  { value: 'Service Support Manager', label: 'Service Support Manager', description: 'Manages support team operations' },
];

const contentRoles = [
  { value: 'None', label: 'None', description: 'No content creation permissions' },
  { value: 'Content Creator', label: 'Content Creator', description: 'Builds interactive training content' },
  { value: 'Advanced Content Creator', label: 'Advanced Content Creator', description: 'Enhanced tools for content creation' },
];

const administrationRoles = [
  { value: 'None', label: 'None', description: 'No administration permissions' },
  { value: 'Usage Analysis', label: 'Usage Analysis', description: 'Generates user activity reports' },
  { value: 'Workspace Admin', label: 'Workspace Admin', description: 'Manages users and settings' },
  { value: 'Workspace Owner', label: 'Workspace Owner', description: 'Full control and ownership' },
];

// Permissions mapping for "today" role system
const todayRolePermissions: { [key: string]: string[] } = {
  // Training & Field roles
  'Operator': [
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
  ],
  'Operator MR': [
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
  ],
  'Instructor': [
    'CREATE_VIRTUAL_ROOM',
    'EDIT_PNC',
    'NEW_OBJECT_TARGET_SYSTEM',
    'SUPPORT_AI_CHAT',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
  ],
  'Field Service Engineer': [
    'ACCESS_MEDIA',
    'ANALYTICS_TAB',
    'CREATE_REMOTE_SUPPORT',
    'CREATE_VIRTUAL_ROOM',
    'EDIT_CAD_DATA',
    'EDIT_PNC',
    'GET_CAD_DATA',
    'GET_SPARE_PARTS_DATA',
    'GUIDES_UPLOAD',
    'NEW_OBJECT_TARGET_SYSTEM',
    'PROJECT_DASHBOARD',
    'SUPPORT_AI_CHAT',
    'SUPPORT_BOOKMARKS_CONTEXT_MENU_OPTIONS',
    'SUPPORT_PARTS_CATALOG_LIST',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_REMOTE_SUPPORT',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'GUIDES_UPLOAD',
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
  'Service Support Manager': [
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
  // Content Creation roles
  'Content Creator': [
    'ACCESS_MEDIA',
    'CREATE_PROCEDURE_AND_SETTINGS',
    'DUPLICATE_PROCEDURE',
    'EDIT_PROCEDURES',
    'EDIT_TASKS',
    'EDIT_THREE_D_MODES',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'MOVE_AND_DELETE_ITEMS',
    'PUBLISH_PROCEDURE',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_RECORDER',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_UNPUBLISHED',
  ],
  'Advanced Content Creator': [
    'ACCESS_MEDIA',
    'CREATE_PROCEDURE_AND_SETTINGS',
    'DUPLICATE_PROCEDURE',
    'DUPLICATE_PROJECT',
    'EDIT_CAD_DATA',
    'EDIT_PROCEDURES',
    'EDIT_TASKS',
    'EDIT_THREE_D_MODES',
    'GET_CAD_DATA',
    'IN_APP_DIGITAL_TWIN_CREATION',
    'MOVE_AND_DELETE_ITEMS',
    'PROJECT_SETTINGS',
    'PUBLISH_PROCEDURE',
    'VIEW_PROCEDURE_AND_MEDIA',
    'VIEW_RECORDER',
    'VIEW_TASKS',
    'VIEW_THREE_D_SCENES',
    'VIEW_UNPUBLISHED',
  ],
  // Administration roles
  'Usage Analysis': [
    'ANALYTICS_TAB',
    'GENERATE_ANALYTICS_REPORTS',
  ],
  'Workspace Admin': [
    'EDIT_COLLABORATORS',
    'EDIT_ROLES',
    'PROJECT_SETTINGS',
    'VIEW_COLLABORATORS',
  ],
  'Workspace Owner': [
    'EDIT_COLLABORATORS',
    'EDIT_ROLES',
    'PROJECT_SETTINGS',
    'VIEW_COLLABORATORS',
  ],
};

const defaultTemplates: RoleTemplate[] = [
  {
    id: '1',
    name: 'Field Operator',
    roles: { training: 'Operator', content: 'None', administration: 'None' },
  },
  {
    id: '2',
    name: 'Content Manager',
    roles: { training: 'Instructor', content: 'Advanced Content Creator', administration: 'Usage Analysis' },
  },
  {
    id: '3',
    name: 'Administrator',
    roles: { training: 'None', content: 'None', administration: 'Workspace Admin' },
  },
];

export function RolesSelectionContextMenu({ currentRoles, onClose, onSave, onToggleRoleSystem, roleSystemType, onNavigateToRoles, isBatchMode = false, selectedMembersCount = 0 }: RolesSelectionContextMenuProps) {
  const [roles, setRoles] = useState(currentRoles);
  const [showTraining, setShowTraining] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showAdministration, setShowAdministration] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templates, setTemplates] = useState<RoleTemplate[]>(defaultTemplates);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const { confirm: appConfirm } = useAppPopup();

  // Get combined permissions from all three role categories
  const getCombinedPermissions = () => {
    const allPermissions = new Set<string>();
    
    if (roles.training !== 'None' && todayRolePermissions[roles.training]) {
      todayRolePermissions[roles.training].forEach(p => allPermissions.add(p));
    }
    if (roles.content !== 'None' && todayRolePermissions[roles.content]) {
      todayRolePermissions[roles.content].forEach(p => allPermissions.add(p));
    }
    if (roles.administration !== 'None' && todayRolePermissions[roles.administration]) {
      todayRolePermissions[roles.administration].forEach(p => allPermissions.add(p));
    }
    
    return Array.from(allPermissions);
  };

  const getCombinedRoleName = () => {
    const parts = [];
    if (roles.training !== 'None') parts.push(roles.training);
    if (roles.content !== 'None') parts.push(roles.content);
    if (roles.administration !== 'None') parts.push(roles.administration);
    return parts.length > 0 ? parts.join(' + ') : 'No roles selected';
  };

  const handleRoleChange = (category: 'training' | 'content' | 'administration', value: string) => {
    setRoles({ ...roles, [category]: value });
  };

  const handleApplyTemplate = (template: RoleTemplate) => {
    setRoles(template.roles);
    setShowTemplates(false);
  };

  const handleSaveAsTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate: RoleTemplate = {
        id: Date.now().toString(),
        name: newTemplateName.trim(),
        roles: { ...roles },
      };
      setTemplates([...templates, newTemplate]);
      setNewTemplateName('');
      setShowSaveTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const ok = await appConfirm('Are you sure you want to delete this template?', { title: 'Delete Template', variant: 'warning', destructive: true });
    if (ok) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  if (showTemplates) {
    return (
      <div
        className="rounded-lg shadow-elevation-sm w-[320px] bg-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTemplates(false)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Use Template
            </h3>
            <div className="flex items-center gap-1">
              {onToggleRoleSystem && (
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

          {/* Search Input */}
          <div className="h-[35px] relative rounded-lg">
            <div className="flex items-center gap-1 px-2 py-1 h-full">
              <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="flex-1 bg-white outline-none text-xs border border-border rounded-lg px-1 focus:border-ring transition-colors"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>

          {/* Templates List */}
          <div className="flex flex-col gap-px max-h-[300px] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-2 hover:bg-secondary rounded transition-colors"
              >
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="flex-1 text-left"
                >
                  <p className="text-xs font-bold text-foreground">{template.name}</p>
                  <p className="text-[10px] text-muted">
                    {Object.entries(template.roles)
                      .filter(([_, value]) => value !== 'None')
                      .map(([key, value]) => value)
                      .join(', ') || 'No roles assigned'}
                  </p>
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg shadow-elevation-sm w-[320px] bg-card border border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
              {isBatchMode ? 'Update Roles' : 'Assign Roles'}
            </h3>
            {isBatchMode && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                Updating {selectedMembersCount} member{selectedMembersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onToggleRoleSystem && (
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

        {/* Template Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex-1 px-2 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-xs flex items-center justify-center gap-1"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <Save className="w-3 h-3" />
            Use Template
          </button>
          <button
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
            className="flex-1 px-2 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-xs flex items-center justify-center gap-1"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}
          >
            <Plus className="w-3 h-3" />
            Save Template
          </button>
        </div>

        {/* Save Template Input */}
        {showSaveTemplate && (
          <div className="flex gap-1">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveAsTemplate();
                if (e.key === 'Escape') {
                  setShowSaveTemplate(false);
                  setNewTemplateName('');
                }
              }}
              placeholder="Template name..."
              className="flex-1 px-2 py-1 border border-border rounded text-xs bg-white focus:border-ring transition-colors outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveAsTemplate}
              className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90"
            >
              Save
            </button>
          </div>
        )}

        {/* Training and field */}
        <div>
          <p className="text-xs text-muted mb-1">Training and field</p>
          <div className="relative">
            <button
              onClick={() => {
                setShowTraining(!showTraining);
                setShowContent(false);
                setShowAdministration(false);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card flex items-center justify-between hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-bold text-foreground">{roles.training}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>

            {showTraining && (
              <div className="absolute z-10 mt-1 w-full bg-card border-2 border-border rounded-lg shadow-elevation-sm max-h-[300px] overflow-y-auto">
                {trainingRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      handleRoleChange('training', role.value);
                      setShowTraining(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-secondary transition-colors"
                  >
                    <p className="text-sm font-bold text-foreground">{role.label}</p>
                    <p className="text-xs text-muted">{role.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content creation */}
        <div>
          <p className="text-xs text-muted mb-1">Content creation</p>
          <div className="relative">
            <button
              onClick={() => {
                setShowContent(!showContent);
                setShowTraining(false);
                setShowAdministration(false);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card flex items-center justify-between hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-bold text-foreground">{roles.content}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>

            {showContent && (
              <div className="absolute z-10 mt-1 w-full bg-card border-2 border-border rounded-lg shadow-elevation-sm max-h-[300px] overflow-y-auto">
                {contentRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      handleRoleChange('content', role.value);
                      setShowContent(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-secondary transition-colors"
                  >
                    <p className="text-sm font-bold text-foreground">{role.label}</p>
                    <p className="text-xs text-muted">{role.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Administration */}
        <div>
          <p className="text-xs text-muted mb-1">Administration</p>
          <div className="relative">
            <button
              onClick={() => {
                setShowAdministration(!showAdministration);
                setShowTraining(false);
                setShowContent(false);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card flex items-center justify-between hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-bold text-foreground">{roles.administration}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>

            {showAdministration && (
              <div className="absolute z-10 mt-1 w-full bg-card border-2 border-border rounded-lg shadow-elevation-sm max-h-[300px] overflow-y-auto">
                {administrationRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      handleRoleChange('administration', role.value);
                      setShowAdministration(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-secondary transition-colors"
                  >
                    <p className="text-sm font-bold text-foreground">{role.label}</p>
                    <p className="text-xs text-muted">{role.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Manage Roles Link */}
        {onNavigateToRoles && (
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

        {/* View Combined Permissions */}
        {(roles.training !== 'None' || roles.content !== 'None' || roles.administration !== 'None') && (
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs hover:bg-primary-background rounded-lg transition-colors"
              style={{ 
                color: 'var(--primary)', 
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <Info className="w-3.5 h-3.5" />
              View Combined Permissions
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary transition-colors"
            style={{ 
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(roles)}
            className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            style={{ 
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Permissions Modal */}
      {showPermissionsModal && (
        <PermissionsModal
          roleName={getCombinedRoleName()}
          rolePermissions={getCombinedPermissions()}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  );
}
