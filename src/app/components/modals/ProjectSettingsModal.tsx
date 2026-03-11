import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Trash2 } from 'lucide-react';
import { MemberAvatarsRow } from './MemberAvatarsRow';
import { AddMembersContextMenu, MemberOption, GroupOption } from './AddMembersContextMenu';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useGroups } from '@/app/contexts/GroupsContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';

interface Owner {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface SharedMember {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  type: 'user' | 'group';
  memberCount?: number;
}

interface ProjectData {
  name: string;
  owners: Owner[];
  description: string;
  privacy: 'private' | 'public' | 'workspace';
  sharedWith: SharedMember[];
  defaultDigitalTwin: string;
  createdDate?: string;
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: ProjectData) => void;
  onDelete?: () => void;
  mode: 'create' | 'edit';
  initialData?: ProjectData;
  publicFeatureEnabled?: boolean;
}

// Mock available members data
const allMembersData: MemberOption[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', initials: 'AJ', color: '#71edaa' },
  { id: '2', name: 'Maria Smith', email: 'maria@company.com', initials: 'MS', color: '#b171ed' },
  { id: '3', name: 'David Brown', email: 'david@company.com', initials: 'DB', color: '#bfed71' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', initials: 'ED', color: '#71a2ed' },
  { id: '5', name: 'James Wilson', email: 'james@company.com', initials: 'JW', color: '#ed7171' },
  { id: '6', name: 'Sophia Taylor', email: 'sophia@company.com', initials: 'ST', color: '#71edd9' },
  { id: '7', name: 'Liam Anderson', email: 'liam@company.com', initials: 'LA', color: '#71edaa' },
  { id: '8', name: 'Olivia Thomas', email: 'olivia@company.com', initials: 'OT', color: '#b171ed' },
];

// availableGroups is now derived dynamically from GroupsContext inside the component

export function ProjectSettingsModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode,
  initialData,
  publicFeatureEnabled = false,
}: ProjectSettingsModalProps) {
  const { currentRole } = useRole();
  const canDelete = hasAccess(currentRole, 'delete-content');
  const { groups } = useGroups();
  const dynamicGroups: GroupOption[] = groups.map(g => ({
    id: g.name,
    name: g.name,
    memberCount: g.members.length,
  }));

  const [projectName, setProjectName] = useState(initialData?.name || '');
  const [owners, setOwners] = useState<Owner[]>(initialData?.owners || [
    { id: '1', name: 'Alex Johnson', initials: 'AJ', color: '#71edaa' }
  ]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [privacy, setPrivacy] = useState<'private' | 'public' | 'workspace'>(initialData?.privacy || 'private');
  const [sharedUserIds, setSharedUserIds] = useState<string[]>(
    initialData?.sharedWith.filter(m => m.type === 'user').map(m => m.id) || []
  );
  const [sharedGroupIds, setSharedGroupIds] = useState<string[]>(
    initialData?.sharedWith.filter(m => m.type === 'group').map(m => m.id) || []
  );
  const [defaultDigitalTwin, setDefaultDigitalTwin] = useState(initialData?.defaultDigitalTwin || 'Elitebook 840 G9');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [showDigitalTwinDropdown, setShowDigitalTwinDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareContextMenu, setShowShareContextMenu] = useState(false);
  const [showOwnerContextMenu, setShowOwnerContextMenu] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [ownerMenuPosition, setOwnerMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const privacyDropdownRef = useRef<HTMLDivElement>(null);
  const digitalTwinDropdownRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const ownerButtonRef = useRef<HTMLButtonElement>(null);

  // Privacy options based on feature flag
  const privacyOptions = [
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Only invited members have access',
    },
    {
      value: 'workspace' as const,
      label: 'Workspace public',
      description: 'All workspace members have access',
    },
    ...(publicFeatureEnabled ? [{
      value: 'public' as const,
      label: 'Public',
      description: 'Everyone with a link have access',
    }] : []),
  ];

  // Reset privacy if public feature disabled
  useEffect(() => {
    if (!publicFeatureEnabled && privacy === 'public') {
      setPrivacy('private');
    }
  }, [publicFeatureEnabled, privacy]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setProjectName(initialData.name || '');
      setOwners(initialData.owners || []);
      setDescription(initialData.description || '');
      setPrivacy(initialData.privacy || 'private');
      setSharedUserIds(initialData.sharedWith.filter(m => m.type === 'user').map(m => m.id) || []);
      setSharedGroupIds(initialData.sharedWith.filter(m => m.type === 'group').map(m => m.id) || []);
      setDefaultDigitalTwin(initialData.defaultDigitalTwin || 'Elitebook 840 G9');
    } else if (mode === 'create') {
      setProjectName('');
      setOwners([{ id: '1', name: 'Alex Johnson', initials: 'AJ', color: '#71edaa' }]);
      setDescription('');
      setPrivacy('private');
      setSharedUserIds([]);
      setSharedGroupIds([]);
      setDefaultDigitalTwin('Elitebook 840 G9');
    }
  }, [initialData, mode]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showDeleteModal) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, showDeleteModal]);

  // Close dropdowns when clicking outside
  useClickOutside(privacyDropdownRef, () => setShowPrivacyDropdown(false), isOpen);
  useClickOutside(digitalTwinDropdownRef, () => setShowDigitalTwinDropdown(false), isOpen);

  if (!isOpen) return null;

  const selectedPrivacy = privacyOptions.find(o => o.value === privacy);

  const handleSave = () => {
    if (!projectName.trim()) {
      return;
    }

    const sharedWith: SharedMember[] = [
      ...sharedUserIds.map(id => {
        const member = allMembersData.find(m => m.id === id);
        return {
          id,
          name: member?.name || '',
          initials: member?.initials,
          color: member?.color,
          type: 'user' as const,
        };
      }),
      ...sharedGroupIds.map(id => {
        const group = dynamicGroups.find(g => g.id === id);
        return {
          id,
          name: group?.name || '',
          type: 'group' as const,
          memberCount: group?.memberCount,
        };
      }),
    ];

    const projectData: ProjectData = {
      name: projectName,
      owners,
      description,
      privacy,
      sharedWith,
      defaultDigitalTwin,
      createdDate: initialData?.createdDate || new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    };

    onSave(projectData);

    if (mode === 'create') {
      setProjectName('');
      setOwners([{ id: '1', name: 'Alex Johnson', initials: 'AJ', color: '#71edaa' }]);
      setDescription('');
      setPrivacy('private');
      setSharedUserIds([]);
      setSharedGroupIds([]);
      setDefaultDigitalTwin('Elitebook 840 G9');
    }

    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteModal(false);
      onClose();
    }
  };

  const handleShareButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = shareButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const menuWidth = 320;
      const menuHeight = 500;

      let top = rect.bottom + 4;
      let left = rect.left;

      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16;
      }

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      setShareMenuPosition({ top, left });
      setShowShareContextMenu(true);
    }
  };

  const handleOwnerButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = ownerButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const menuWidth = 320;
      const menuHeight = 500;

      let top = rect.bottom + 4;
      let left = rect.left;

      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16;
      }

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      setOwnerMenuPosition({ top, left });
      setShowOwnerContextMenu(true);
    }
  };

  const handleRemoveOwner = (ownerId: string) => {
    if (owners.length > 1) {
      setOwners(prev => prev.filter(o => o.id !== ownerId));
    }
  };

  const handleSetOwners = (memberIds: string[]) => {
    const newOwners = memberIds.map(id => {
      const member = allMembersData.find(m => m.id === id);
      return {
        id,
        name: member?.name || '',
        initials: member?.initials || '',
        color: member?.color || '#71edaa',
      };
    });
    setOwners(newOwners);
  };

  const sharedMembers = allMembersData.filter(m => sharedUserIds.includes(m.id)).map(m => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    color: m.color,
  }));

  const sharedGroups = dynamicGroups.filter(g => sharedGroupIds.includes(g.id)).map(g => ({
    id: g.id,
    name: g.name,
    memberCount: g.memberCount,
  }));

  const currentDate = initialData?.createdDate || new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-settings-title"
        className="bg-card rounded-[var(--radius-lg)] w-full max-w-[600px] max-h-[90vh] overflow-auto"
        style={{ boxShadow: 'var(--shadow-elevation-sm)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2
                id="project-settings-title"
                className="text-foreground uppercase mb-2"
                style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}
              >
                {mode === 'create' ? 'Create New Project' : 'Edit Project Settings'}
              </h2>
              <p className="text-xs text-foreground mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                Created at {currentDate}
              </p>
              <p className="text-xs text-foreground" style={{ fontFamily: 'var(--font-family)' }}>
                A Project has its own digital twins, procedures and media.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Name and Owners */}
        <div className="p-6 border-b border-border grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-foreground mb-2" style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}>
              Project Name
            </h4>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontFamily: 'var(--font-family)' }}
            />
          </div>
          <div>
            <h4 className="text-foreground mb-2" style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}>
              Owners
            </h4>
            <div className="flex items-center justify-between px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-card">
              <MemberAvatarsRow
                members={owners}
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
          <h4 className="text-foreground mb-2" style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}>
            Description{' '}
            <span className="text-xs font-normal text-muted" style={{ fontFamily: 'var(--font-family)' }}>
              (optional)
            </span>
          </h4>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            style={{ fontFamily: 'var(--font-family)' }}
            placeholder="Introducing the Elitebook, a cutting-edge laptop designed for professionals who demand performance and elegance."
          />
        </div>

        {/* Privacy */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-foreground mb-1" style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}>
                Privacy
              </h4>
              <p className="text-xs text-foreground" style={{ fontFamily: 'var(--font-family)' }}>
                Set an access level to this project
              </p>
            </div>
            <div ref={privacyDropdownRef} className="relative w-[160px] max-w-[calc(100vw-64px)]">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-card flex items-center justify-between hover:bg-secondary transition-colors"
                style={{ fontFamily: 'var(--font-family)' }}
                aria-haspopup="listbox"
                aria-expanded={showPrivacyDropdown}
              >
                <span className="text-sm" style={{ fontFamily: 'var(--font-family)' }}>{selectedPrivacy?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPrivacyDropdown && (
                <div
                  className="absolute z-20 mt-1 w-[280px] max-w-[calc(100vw-64px)] right-0 bg-card border-2 border-secondary rounded-[var(--radius-lg)] shadow-elevation-sm overflow-hidden p-4"
                >
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPrivacy(option.value);
                        setShowPrivacyDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-[var(--radius-lg)] hover:bg-secondary transition-colors mb-1"
                    >
                      <h4 className="text-sm text-foreground mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                        {option.label}
                      </h4>
                      <p className="text-xs text-foreground" style={{ fontFamily: 'var(--font-family)' }}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Share Project With - Only show if private */}
          {privacy === 'private' && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-xs text-foreground" style={{ fontFamily: 'var(--font-family)' }}>
                Share project with:
              </p>
              <MemberAvatarsRow
                members={sharedMembers}
                groups={sharedGroups}
                onAddClick={handleShareButtonClick}
                onRemoveMember={(id) => setSharedUserIds(prev => prev.filter(uid => uid !== id))}
                onRemoveGroup={(id) => setSharedGroupIds(prev => prev.filter(gid => gid !== id))}
                maxVisible={4}
                showRemoveButton={true}
                size="sm"
                addButtonRef={shareButtonRef}
              />
            </div>
          )}
        </div>

        {/* Default Digital Twin */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-foreground mb-1" style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)' }}>
                Default digital twin
              </h4>
              <p className="text-xs text-foreground" style={{ fontFamily: 'var(--font-family)' }}>
                Automatically connects to new procedures
              </p>
            </div>
            <div ref={digitalTwinDropdownRef} className="w-[250px] max-w-[calc(100vw-64px)]">
              <div
                role="button"
                tabIndex={0}
                className="px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-card flex items-center justify-between cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => setShowDigitalTwinDropdown(!showDigitalTwinDropdown)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDigitalTwinDropdown(!showDigitalTwinDropdown); } }}
                aria-haspopup="listbox"
                aria-expanded={showDigitalTwinDropdown}
              >
                <span className="text-sm" style={{ fontFamily: 'var(--font-family)' }}>{defaultDigitalTwin}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              {showDigitalTwinDropdown && (
                <div
                  className="absolute mt-1 w-[250px] max-w-[calc(100vw-64px)] bg-card border border-border rounded-[var(--radius)] z-20 overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-elevation-md)' }}
                >
                  {['Elitebook 840 G9', 'ProBook 450 G10', 'ZBook Studio G9'].map((twin) => (
                    <button
                      key={twin}
                      onClick={() => {
                        setDefaultDigitalTwin(twin);
                        setShowDigitalTwinDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-secondary transition-colors ${
                        defaultDigitalTwin === twin ? 'bg-secondary' : ''
                      }`}
                      style={{ fontFamily: 'var(--font-family)' }}
                    >
                      {twin}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex items-center justify-between border-t border-border">
          {mode === 'edit' && onDelete && canDelete ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 transition-opacity flex items-center gap-2"
              style={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-family)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={handleSave}
            disabled={!projectName.trim()}
            className="px-4 py-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-family)',
            }}
            onMouseEnter={(e) => !projectName.trim() ? null : e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Share Context Menu */}
      {showShareContextMenu && shareMenuPosition && (
        <AddMembersContextMenu
          onClose={() => setShowShareContextMenu(false)}
          onSave={(memberIds, groupIds) => {
            setSharedUserIds(prev => [...new Set([...prev, ...memberIds])]);
            setSharedGroupIds(prev => [...new Set([...prev, ...groupIds])]);
            setShowShareContextMenu(false);
          }}
          availableMembers={allMembersData}
          availableGroups={dynamicGroups}
          selectedMemberIds={sharedUserIds}
          selectedGroupIds={sharedGroupIds}
          showGroups={true}
          title="Share Project With"
          position={shareMenuPosition}
        />
      )}

      {/* Owner Context Menu */}
      {showOwnerContextMenu && ownerMenuPosition && (
        <AddMembersContextMenu
          onClose={() => setShowOwnerContextMenu(false)}
          onSave={(memberIds) => {
            handleSetOwners(memberIds);
            setShowOwnerContextMenu(false);
          }}
          availableMembers={allMembersData}
          availableGroups={[]}
          selectedMemberIds={owners.map(o => o.id)}
          selectedGroupIds={[]}
          showGroups={false}
          title="Set Owners"
          position={ownerMenuPosition}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone. All digital twins, procedures, and media associated with this project will be permanently deleted."
          itemName={projectName}
        />
      )}
    </div>
  );
}
