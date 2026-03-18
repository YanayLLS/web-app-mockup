import { useState, useRef } from 'react';
import { X, ChevronDown, Plus, Trash2, Folder, FileText, ChevronRight, Info } from 'lucide-react';
import { UserSelectionContextMenu } from './UserSelectionContextMenu';
import { MemberAvatarsRow, Member as AvatarMember, GroupAvatar } from './MemberAvatarsRow';
import { AddMembersContextMenu, MemberOption, GroupOption } from './AddMembersContextMenu';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { RoleAccessModal } from './RoleAccessModal';

interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface ProjectSettingsPageProps {
  onClose?: () => void;
  groups: Group[];
  publicFeatureEnabled: boolean;
  roleAccessFeatureEnabled?: boolean;
  roleAccessRules?: { [contentId: string]: string[] };
  onRoleAccessRulesChange?: (rules: { [contentId: string]: string[] }) => void;
}

const allMembersData = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', initials: 'AJ', color: '#71edaa' },
  { id: '2', name: 'Maria Smith', email: 'maria@company.com', initials: 'MS', color: '#b171ed' },
  { id: '3', name: 'David Brown', email: 'david@company.com', initials: 'DB', color: '#bfed71' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', initials: 'ED', color: '#71a2ed' },
  { id: '5', name: 'James Wilson', email: 'james@company.com', initials: 'JW', color: '#ed7171' },
  { id: '6', name: 'Sophia Taylor', email: 'sophia@company.com', initials: 'ST', color: '#71edd9' },
  { id: '7', name: 'Liam Anderson', email: 'liam@company.com', initials: 'LA', color: '#71edaa' },
  { id: '8', name: 'Olivia Thomas', email: 'olivia@company.com', initials: 'OT', color: '#b171ed' },
];

export function ProjectSettingsPage({ 
  onClose, 
  groups, 
  publicFeatureEnabled, 
  roleAccessFeatureEnabled = true,
  roleAccessRules: externalRoleAccessRules,
  onRoleAccessRulesChange
}: ProjectSettingsPageProps) {
  const availableGroups = groups.map(g => ({ name: g.name, members: g.members.length }));
  
  // Filter privacy options based on public feature toggle
  const privacyOptions = [
    {
      value: 'private',
      label: 'Private',
      description: 'Only invited members have access',
    },
    {
      value: 'workspace',
      label: 'Workspace public',
      description: 'All workspace members have access',
    },
    ...(publicFeatureEnabled ? [{
      value: 'public',
      label: 'Public',
      description: 'Everyone with a link have access',
    }] : []),
  ];
  const [projectName, setProjectName] = useState('Elitebook 840 G9');
  const [privacy, setPrivacy] = useState('private');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [showShareContextMenu, setShowShareContextMenu] = useState(false);
  const [showOwnerContextMenu, setShowOwnerContextMenu] = useState(false);
  const [showAddMembersMenu, setShowAddMembersMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addMembersMenuPosition, setAddMembersMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [shareMenuPosition, setShareMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [ownerMenuPosition, setOwnerMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [sharedUserIds, setSharedUserIds] = useState<string[]>(['1', '2', '3', '4']);
  const [sharedGroupNames, setSharedGroupNames] = useState<string[]>(['Asia Pacific']);
  const [ownerIds, setOwnerIds] = useState<string[]>(['1']);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const ownerButtonRef = useRef<HTMLButtonElement>(null);

  // Role access rules
  const trainingFieldRoles = [
    'Operator',
    'Service Support Expert',
    'Instructor',
    'Support Service Manager',
    'Content Creator',
    'Advanced Content Creator',
  ];

  // Mock content tree structure
  const contentTree = [
    {
      id: 'f1',
      name: 'Installation Guides',
      type: 'folder' as const,
      items: [
        { id: 'f1i1', name: 'Quick Start Guide', type: 'item' as const },
        { id: 'f1i2', name: 'Hardware Setup', type: 'item' as const },
        { id: 'f1i3', name: 'Software Installation', type: 'item' as const },
      ],
    },
    {
      id: 'f2',
      name: 'Maintenance Procedures',
      type: 'folder' as const,
      items: [
        { id: 'f2i1', name: 'Daily Checks', type: 'item' as const },
        { id: 'f2i2', name: 'Monthly Maintenance', type: 'item' as const },
        { id: 'f2i3', name: 'Annual Service', type: 'item' as const },
      ],
    },
    {
      id: 'f3',
      name: 'Troubleshooting',
      type: 'folder' as const,
      items: [
        { id: 'f3i1', name: 'Common Issues', type: 'item' as const },
        { id: 'f3i2', name: 'Error Codes', type: 'item' as const },
        { id: 'f3i3', name: 'Support Contact', type: 'item' as const },
      ],
    },
    { id: 'i1', name: 'Product Overview', type: 'item' as const },
    { id: 'i2', name: 'Safety Guidelines', type: 'item' as const },
  ];

  // Use external role access rules if provided, otherwise use internal state
  const [internalRoleAccessRules, setInternalRoleAccessRules] = useState<{ [contentId: string]: string[] }>({
    'f1': ['Operator', 'Service Support Expert', 'Instructor'],
    'f1i1': ['Operator', 'Service Support Expert', 'Instructor'],
    'f1i2': ['Service Support Expert', 'Instructor'],
    'f2': ['Service Support Expert', 'Instructor', 'Support Service Manager'],
    'f2i1': ['Service Support Expert', 'Instructor'],
    'i1': ['Operator', 'Service Support Expert', 'Instructor', 'Content Creator'],
    'i2': ['Operator', 'Service Support Expert'],
  });
  
  const roleAccessRules = externalRoleAccessRules || internalRoleAccessRules;
  const setRoleAccessRules = onRoleAccessRulesChange || setInternalRoleAccessRules;

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['f1', 'f2']));
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showRoleAccessModal, setShowRoleAccessModal] = useState<string | null>(null);

  // Reset privacy to 'private' if public feature is disabled and currently set to 'public'
  if (!publicFeatureEnabled && privacy === 'public') {
    setPrivacy('private');
  }

  const selectedPrivacy = privacyOptions.find(o => o.value === privacy);

  const sharedMembers = allMembersData.filter(m => sharedUserIds.includes(m.id));
  const owners = allMembersData.filter(m => ownerIds.includes(m.id));

  const totalSharedCount = sharedUserIds.length + sharedGroupNames.reduce((acc, groupName) => {
    const group = availableGroups.find(g => g.name === groupName);
    return acc + (group?.members || 0);
  }, 0);

  const handleShareButtonClick = () => {
    const button = shareButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const menuWidth = 280;
      const menuHeight = 400;
      
      let top = rect.bottom + 4;
      let left = rect.left;
      
      // Check if menu would go off right edge
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16;
      }
      
      // Check if menu would go off bottom edge
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }
      
      setShareMenuPosition({ top, left });
      setShowShareContextMenu(true);
    }
  };

  const handleOwnerButtonClick = () => {
    const button = ownerButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const menuWidth = 280;
      const menuHeight = 400;
      
      let top = rect.bottom + 4;
      let left = rect.left;
      
      // Check if menu would go off right edge
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16;
      }
      
      // Check if menu would go off bottom edge
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }
      
      setOwnerMenuPosition({ top, left });
      setShowOwnerContextMenu(true);
    }
  };

  const handleAddSharedAccess = (userIds: string[], groupNames: string[]) => {
    setSharedUserIds(prev => [...new Set([...prev, ...userIds])]);
    setSharedGroupNames(prev => [...new Set([...prev, ...groupNames])]);
  };

  const handleAddMembersClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const menuWidth = 320;
    const menuHeight = 500;
    
    let top = rect.bottom + 4;
    let left = rect.left;
    
    // Check if menu would go off right edge
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - 16;
    }
    
    // Check if menu would go off bottom edge
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    
    setAddMembersMenuPosition({ top, left });
    setShowAddMembersMenu(true);
  };

  const handleSetOwners = (userIds: string[], groupNames: string[]) => {
    setOwnerIds(userIds);
  };

  const handleRemoveSharedUser = (userId: string) => {
    setSharedUserIds(prev => prev.filter(id => id !== userId));
  };

  const handleRemoveSharedGroup = (groupName: string) => {
    setSharedGroupNames(prev => prev.filter(name => name !== groupName));
  };

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleRoleAccess = (contentId: string, roleName: string) => {
    setRoleAccessRules(prev => {
      const currentRoles = prev[contentId] || [];
      const hasAccess = currentRoles.includes(roleName);
      
      if (hasAccess) {
        return {
          ...prev,
          [contentId]: currentRoles.filter(r => r !== roleName),
        };
      } else {
        return {
          ...prev,
          [contentId]: [...currentRoles, roleName],
        };
      }
    });
  };

  const hasRoleAccess = (contentId: string, roleName: string): boolean => {
    return (roleAccessRules[contentId] || []).includes(roleName);
  };

  // Calculate total items and accessible items for each role
  const calculateRoleStats = () => {
    // Count all items (folders + items)
    let totalItems = 0;
    const allContentIds: string[] = [];

    contentTree.forEach(item => {
      allContentIds.push(item.id);
      totalItems++;
      if (item.type === 'folder' && item.items) {
        item.items.forEach(subItem => {
          allContentIds.push(subItem.id);
          totalItems++;
        });
      }
    });

    // For each role, count accessible items
    const roleStats: { [roleName: string]: { accessible: number; total: number } } = {};
    trainingFieldRoles.forEach(role => {
      const accessibleCount = allContentIds.filter(id => hasRoleAccess(id, role)).length;
      roleStats[role] = {
        accessible: accessibleCount,
        total: totalItems,
      };
    });

    return roleStats;
  };

  const roleStats = calculateRoleStats();

  const handleRemoveOwner = (ownerId: string) => {
    if (ownerIds.length > 1) {
      setOwnerIds(prev => prev.filter(id => id !== ownerId));
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="bg-card rounded-xl shadow-elevation-sm w-full max-w-[600px] max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-foreground uppercase mb-2">Edit Project Settings</h2>
              <p className="text-xs text-foreground mb-1">Created at 11/11/2021</p>
              <p className="text-xs text-foreground">
                A Project has its own digital twins, procedures and media.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Project Name and Owner */}
        <div className="p-6 border-b border-border grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-foreground mb-2">Project Name</h4>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <h4 className="text-foreground mb-2">Owners</h4>
            <div className="flex items-center justify-between px-3 py-2 border border-border rounded-xl bg-card">
              <MemberAvatarsRow
                members={owners.map(m => ({
                  id: m.id,
                  name: m.name,
                  initials: m.initials,
                  color: m.color,
                }))}
                groups={[]}
                onAddClick={handleOwnerButtonClick}
                onRemoveMember={handleRemoveOwner}
                maxVisible={4}
                showRemoveButton={true}
                size="sm"
                addButtonRef={ownerButtonRef}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-border">
          <h4 className="text-foreground mb-2">
            Description <span className="text-xs font-normal text-muted">(optional)</span>
          </h4>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            defaultValue="Introducing the Elitebook, a cutting-edge laptop designed for professionals who demand performance and elegance. With its sleek aluminum chassis and ultra-thin profile, the Elitebook combines style with functionality."
          />
        </div>

        {/* Privacy */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-foreground mb-1">Privacy</h4>
              <p className="text-xs text-foreground">Set an access level to this project</p>
            </div>
            <div className="relative w-[160px]">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="w-full px-3 py-2 border border-border rounded-xl bg-card flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="text-sm">{selectedPrivacy?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPrivacyDropdown && (
                <div className="absolute z-20 mt-1 w-[280px] right-0 bg-card border-2 border-secondary rounded-xl shadow-elevation-sm overflow-hidden p-4">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPrivacy(option.value);
                        setShowPrivacyDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary transition-colors mb-1"
                    >
                      <h4 className="text-sm text-foreground mb-1">{option.label}</h4>
                      <p className="text-xs text-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Share Project With - Only show if private */}
          {privacy === 'private' && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-xs text-foreground">Share project with:</p>
              <MemberAvatarsRow
                members={sharedMembers.map(m => ({
                  id: m.id,
                  name: m.name,
                  initials: m.initials,
                  color: m.color,
                }))}
                groups={sharedGroupNames.map(name => {
                  const group = availableGroups.find(g => g.name === name);
                  return {
                    id: name,
                    name,
                    memberCount: group?.members || 0,
                  };
                })}
                onAddClick={handleAddMembersClick}
                onRemoveMember={handleRemoveSharedUser}
                onRemoveGroup={handleRemoveSharedGroup}
                maxVisible={4}
                showRemoveButton={true}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Role Access Rules */}
        {roleAccessFeatureEnabled && (
          <div className="p-6 border-b border-border">
            <div className="mb-4">
              <h4 
                className="mb-1"
                style={{
                  color: 'var(--foreground)',
                  
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                Role Access Rules
              </h4>
              <p 
                style={{
                  color: 'var(--muted)',
                  
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '1.5',
                }}
              >
                Configure which roles can access folders and items in this project
              </p>
            </div>

            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-3 border rounded-xl bg-card flex items-center justify-between hover:bg-secondary transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '1.5',
                }}
              >
                <span
                  style={{
                    color: 'var(--foreground)',
                  }}
                >
                  Manage roles access
                </span>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              </button>

              {showRoleDropdown && (
                <div
                  className="absolute z-20 mt-1 w-full bg-card border rounded-xl shadow-elevation-sm overflow-hidden"
                  style={{
                    borderColor: 'var(--border)',
                  }}
                >
                  {trainingFieldRoles.map(role => {
                    const stats = roleStats[role];
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setShowRoleAccessModal(role);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-secondary transition-colors border-b last:border-b-0 flex items-center justify-between"
                        style={{
                          borderColor: 'var(--border)',
                          
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-normal)',
                          lineHeight: '1.5',
                          textAlign: 'left',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--foreground)',
                          }}
                        >
                          {role}
                        </span>
                        <span
                          className="px-3 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--primary-background)',
                            color: 'var(--primary)',
                            
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          {stats.accessible}/{stats.total}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Digital Twin Settings */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-foreground mb-1">Default digital twin</h4>
              <p className="text-xs text-foreground">Automatically connects to new procedures</p>
            </div>
            <div className="w-[250px]">
              <div className="px-3 py-2 border border-border rounded-xl bg-card flex items-center justify-between">
                <span className="text-sm">Elitebook 840 G9</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex items-center justify-between border-t border-border">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 transition-opacity flex items-center gap-2"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              borderRadius: 'var(--radius-lg)',
              
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button 
            className="px-4 py-2 transition-opacity"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-lg)',
              
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Save
          </button>
        </div>
      </div>

      {/* Share Context Menu */}
      {showShareContextMenu && shareMenuPosition && (
        <div
          className="fixed z-50"
          style={{ top: `${shareMenuPosition.top}px`, left: `${shareMenuPosition.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <UserSelectionContextMenu
            onClose={() => setShowShareContextMenu(false)}
            onSelect={handleAddSharedAccess}
            showGroups={true}
          />
        </div>
      )}

      {/* Owner Context Menu */}
      {showOwnerContextMenu && ownerMenuPosition && (
        <div
          className="fixed z-50"
          style={{ top: `${ownerMenuPosition.top}px`, left: `${ownerMenuPosition.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <UserSelectionContextMenu
            onClose={() => setShowOwnerContextMenu(false)}
            onSelect={handleSetOwners}
            showGroups={false}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            console.log('Project deleted');
            if (onClose) onClose();
          }}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          itemName={projectName}
        />
      )}

      {/* Add Members Context Menu */}
      {showAddMembersMenu && addMembersMenuPosition && (
        <AddMembersContextMenu
          onClose={() => setShowAddMembersMenu(false)}
          onSave={(memberIds, groupIds) => {
            setSharedUserIds(prev => [...new Set([...prev, ...memberIds])]);
            setSharedGroupNames(prev => [...new Set([...prev, ...groupIds])]);
            setShowAddMembersMenu(false);
          }}
          availableMembers={allMembersData}
          availableGroups={availableGroups.map(g => ({ id: g.name, name: g.name, memberCount: g.members }))}
          selectedMemberIds={sharedUserIds}
          selectedGroupIds={sharedGroupNames}
          showGroups={true}
          title="Share Project With"
          position={addMembersMenuPosition}
        />
      )}

      {/* Role Access Modal */}
      {showRoleAccessModal && (
        <RoleAccessModal
          projectName={projectName}
          roleName={showRoleAccessModal}
          contentTree={contentTree}
          roleAccessRules={roleAccessRules}
          onClose={() => {
            setShowRoleAccessModal(null);
            setShowRoleDropdown(true); // Reopen dropdown for quick role selection
          }}
          onSave={(updatedRules) => {
            setRoleAccessRules(updatedRules);
            setShowRoleAccessModal(null);
            setShowRoleDropdown(true); // Reopen dropdown for quick role selection
          }}
        />
      )}
    </div>
  );
}
