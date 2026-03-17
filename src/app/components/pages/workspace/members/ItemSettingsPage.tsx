import { useState, useRef } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { UserSelectionContextMenu } from './UserSelectionContextMenu';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { MemberAvatarsRow, Member as AvatarMember, GroupAvatar } from './MemberAvatarsRow';
import { AddMembersContextMenu, MemberOption, GroupOption } from './AddMembersContextMenu';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface ItemSettingsPageProps {
  onClose?: () => void;
  groups: Group[];
  publicFeatureEnabled: boolean;
}

const allMembersData = [
  { id: '1', name: 'Alex Johnson', email: 'alex.johnson@acmecorp.com', initials: 'AJ', color: '#71edaa' },
  { id: '2', name: 'Maria Smith', email: 'maria.smith@acmecorp.com', initials: 'MS', color: '#b171ed' },
  { id: '3', name: 'David Brown', email: 'david.brown@acmecorp.com', initials: 'DB', color: '#bfed71' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@acmecorp.com', initials: 'ED', color: '#71a2ed' },
  { id: '5', name: 'James Wilson', email: 'james.wilson@acmecorp.com', initials: 'JW', color: '#ed7171' },
  { id: '6', name: 'Sophia Taylor', email: 'sophia.taylor@acmecorp.com', initials: 'ST', color: '#71edd9' },
  { id: '7', name: 'Liam Anderson', email: 'liam.anderson@acmecorp.com', initials: 'LA', color: '#71edaa' },
  { id: '8', name: 'Olivia Thomas', email: 'olivia.thomas@acmecorp.com', initials: 'OT', color: '#b171ed' },
];

export function ItemSettingsPage({ onClose, groups, publicFeatureEnabled }: ItemSettingsPageProps) {
  const availableGroups = groups.map(g => ({ name: g.name, members: g.members.length }));
  const [itemName, setItemName] = useState('Elitebook 840 G9');
  const [description, setDescription] = useState('Introducing the Elitebook, a cutting-edge laptop designed for professionals who demand performance and elegance. With its sleek aluminum chassis and ultra-thin profile, the Elitebook combines style with functionality. Equipped with the latest Intel processors, it ensures lightning-fast speed and efficiency for multitasking and demanding applications. The vibrant 15.6-inch display offers stunning visuals, making it perfect for presentations or creative work. Plus, with a long-lasting battery life, you can stay productive all day without worrying about recharging. Experience seamless connectivity with advanced Wi-Fi technology and a range of ports for all your devices. The Elitebook is not just a laptop; it\'s your ultimate productivity partner.');
  const [aiInstructions, setAiInstructions] = useState('Meet the ProBook, an innovative laptop crafted for professionals who seek both power and sophistication. Its sleek metal design and ultra-slim form factor merge style with practicality. Powered by the latest Intel processors, it delivers rapid performance and efficiency for multitasking and intensive applications. The brilliant 15.6-inch screen provides breathtaking visuals, ideal for presentations or creative projects. Additionally, with an impressive battery life, you can remain productive throughout the day without the hassle of frequent charging. Enjoy effortless connectivity with cutting-edge Wi-Fi technology and a variety of ports for all your gadgets. The ProBook is more than just a laptop; it\'s your essential tool for productivity.');
  const [isPrivate, setIsPrivate] = useState(true);
  
  // Force private mode if public feature is disabled
  if (!publicFeatureEnabled && !isPrivate) {
    setIsPrivate(true);
  }
  const [showShareContextMenu, setShowShareContextMenu] = useState(false);
  const [showAddMembersMenu, setShowAddMembersMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addMembersMenuPosition, setAddMembersMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [shareMenuPosition, setShareMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [sharedUserIds, setSharedUserIds] = useState<string[]>(['1', '2', '3', '4']);
  const [sharedGroupNames, setSharedGroupNames] = useState<string[]>([]);
  
  // Preserve privacy history: store the last private access list
  const [savedPrivateUserIds, setSavedPrivateUserIds] = useState<string[]>(['1', '2', '3', '4']);
  const [savedPrivateGroupNames, setSavedPrivateGroupNames] = useState<string[]>([]);
  
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const sharedMembers = allMembersData.filter(m => sharedUserIds.includes(m.id));

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

  const handleAddSharedAccess = (userIds: string[], groupNames: string[]) => {
    const newUserIds = [...new Set([...sharedUserIds, ...userIds])];
    const newGroupNames = [...new Set([...sharedGroupNames, ...groupNames])];
    
    setSharedUserIds(newUserIds);
    setSharedGroupNames(newGroupNames);
    
    // Keep saved version in sync if currently private
    if (isPrivate) {
      setSavedPrivateUserIds(newUserIds);
      setSavedPrivateGroupNames(newGroupNames);
    }
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

  const handleRemoveSharedUser = (userId: string) => {
    const newUserIds = sharedUserIds.filter(id => id !== userId);
    setSharedUserIds(newUserIds);
    
    // Keep saved version in sync if currently private
    if (isPrivate) {
      setSavedPrivateUserIds(newUserIds);
    }
  };

  const handleRemoveSharedGroup = (groupName: string) => {
    const newGroupNames = sharedGroupNames.filter(name => name !== groupName);
    setSharedGroupNames(newGroupNames);
    
    // Keep saved version in sync if currently private
    if (isPrivate) {
      setSavedPrivateGroupNames(newGroupNames);
    }
  };

  const handleMakePrivate = () => {
    setIsPrivate(true);
    // Restore saved private access list
    setSharedUserIds(savedPrivateUserIds);
    setSharedGroupNames(savedPrivateGroupNames);
  };

  const handleMakePublic = () => {
    // Save current private access list before clearing
    setSavedPrivateUserIds(sharedUserIds);
    setSavedPrivateGroupNames(sharedGroupNames);
    
    setIsPrivate(false);
    // Clear shared users/groups when making public (they're now saved)
    setSharedUserIds([]);
    setSharedGroupNames([]);
  };

  const handleTogglePrivacy = (makePrivate: boolean) => {
    if (makePrivate) {
      handleMakePrivate();
    } else {
      handleMakePublic();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div 
        className="bg-card rounded-[var(--radius-lg)] shadow-elevation-sm w-full max-w-[560px] max-h-[85vh] overflow-auto"
        style={{
          fontFamily: 'var(--font-family)',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 
                className="mb-1"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Item Settings
              </h2>
              <p 
                className="text-xs"
                style={{
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-family)',
                }}
              >
                Configure item properties and access
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-5 border-b border-border">
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-secondary rounded-[var(--radius-lg)] flex items-center justify-center border border-border overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1759668358660-0d06064f0f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3Njk3MDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name & Description */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label 
                  className="block mb-1.5 text-xs"
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  NAME
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>

              <div>
                <label 
                  className="block mb-1.5 text-xs"
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  DESCRIPTION <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Instructions */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <label 
              className="text-xs"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              AI INSTRUCTIONS <span className="font-normal">(optional)</span>
            </label>
            <button 
              className="text-xs px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
              style={{
                background: 'linear-gradient(90deg, #2F80ED 0%, #004fff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Summarize with AI
            </button>
          </div>
          <textarea
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="Add custom instructions for AI..."
            className="w-full px-3 py-2 border border-border rounded-[var(--radius-lg)] bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
            }}
          />
        </div>

        {/* Privacy */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <label 
              className="text-xs"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              PRIVACY
            </label>
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-[var(--radius-lg)]">
              <button
                onClick={() => handleTogglePrivacy(false)}
                disabled={!publicFeatureEnabled}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  !isPrivate ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-bold)',
                  opacity: !publicFeatureEnabled ? 0.4 : 1,
                  cursor: !publicFeatureEnabled ? 'not-allowed' : 'pointer',
                }}
              >
                Public
              </button>
              <button
                onClick={() => handleTogglePrivacy(true)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isPrivate ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Private
              </button>
            </div>
          </div>

          {/* Privacy Status Visualization */}
          {isPrivate ? (
            <div>
              {/* Private State Header */}
              <div 
                className="p-3 rounded-[var(--radius-lg)] flex items-start gap-3"
                style={{ 
                  backgroundColor: 'rgba(255, 165, 0, 0.08)',
                  border: '1px solid rgba(255, 165, 0, 0.2)',
                }}
              >
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255, 165, 0, 0.15)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8.33333V6.66667C15 4.36548 13.1346 2.5 10.8333 2.5H9.16667C6.86548 2.5 5 4.36548 5 6.66667V8.33333M6.66667 17.5H13.3333C14.7335 17.5 15.4335 17.5 15.9683 17.2275C16.4387 16.9878 16.8211 16.6054 17.0608 16.135C17.3333 15.6002 17.3333 14.9001 17.3333 13.5V12.3333C17.3333 10.9332 17.3333 10.2331 17.0608 9.69836C16.8211 9.22795 16.4387 8.8455 15.9683 8.60582C15.4335 8.33333 14.7335 8.33333 13.3333 8.33333H6.66667C5.26654 8.33333 4.56647 8.33333 4.03169 8.60582C3.56129 8.8455 3.17883 9.22795 2.93915 9.69836C2.66667 10.2331 2.66667 10.9332 2.66667 12.3333V13.5C2.66667 14.9001 2.66667 15.6002 2.93915 16.135C3.17883 16.6054 3.56129 16.9878 4.03169 17.2275C4.56647 17.5 5.26654 17.5 6.66667 17.5Z" stroke="rgba(255, 165, 0, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 
                    className="font-bold mb-0.5"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Private Access
                  </h5>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    Only invited members can access this item
                  </p>
                </div>
              </div>

              {/* Share Item With */}
              <div className="flex items-center justify-between pt-3">
                <p 
                  className="text-xs"
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  INVITED MEMBERS ({totalSharedCount})
                </p>
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
                  maxVisible={3}
                  showRemoveButton={true}
                  size="sm"
                />
              </div>
            </div>
          ) : (
            <div>
              {/* Public State */}
              <div 
                className="p-3 rounded-[var(--radius-lg)] flex items-start gap-3"
                style={{ 
                  backgroundColor: 'rgba(47, 128, 237, 0.08)',
                  border: '1px solid rgba(47, 128, 237, 0.2)',
                }}
              >
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(47, 128, 237, 0.15)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="rgba(47, 128, 237, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="rgba(47, 128, 237, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 
                    className="font-bold mb-0.5"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Project-Wide Access
                  </h5>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    All members with project access can view and interact with this item
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connected */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <label 
              className="text-xs"
              style={{
                color: 'var(--muted)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              CONNECTED
            </label>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1.5 bg-secondary rounded-[var(--radius-lg)] hover:bg-secondary/80 transition-colors text-xs"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                Connections
              </button>
              <div className="w-[150px]">
                <div 
                  className="px-3 py-1.5 border border-border rounded-[var(--radius-lg)] bg-white flex items-center justify-between cursor-pointer"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <span className="truncate">Elitebook 840 G9</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 flex items-center justify-between">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 transition-opacity flex items-center gap-2"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
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
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
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

      {/* Add Members Context Menu */}
      {showAddMembersMenu && addMembersMenuPosition && (
        <AddMembersContextMenu
          onClose={() => setShowAddMembersMenu(false)}
          onSave={(memberIds, groupIds) => {
            const newUserIds = [...new Set([...sharedUserIds, ...memberIds])];
            const newGroupNames = [...new Set([...sharedGroupNames, ...groupIds])];
            
            setSharedUserIds(newUserIds);
            setSharedGroupNames(newGroupNames);
            
            // Keep saved version in sync if currently private
            if (isPrivate) {
              setSavedPrivateUserIds(newUserIds);
              setSavedPrivateGroupNames(newGroupNames);
            }
            setShowAddMembersMenu(false);
          }}
          availableMembers={allMembersData}
          availableGroups={availableGroups.map(g => ({ id: g.name, name: g.name, memberCount: g.members }))}
          selectedMemberIds={sharedUserIds}
          selectedGroupIds={sharedGroupNames}
          showGroups={true}
          title="Share Item With"
          position={addMembersMenuPosition}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            console.log('Item deleted');
            if (onClose) onClose();
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          itemName={itemName}
        />
      )}
    </div>
  );
}
