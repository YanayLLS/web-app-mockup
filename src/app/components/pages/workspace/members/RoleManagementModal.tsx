import { useState, useEffect, useRef } from 'react';
import { RolesSelectionContextMenu } from './RolesSelectionContextMenu';
import { SimpleRolesContextMenu, type RoleWithDescription } from './SimpleRolesContextMenu';

interface RoleManagementModalProps {
  currentRole: string | any;
  roleSystem: 'new' | 'today';
  onClose: () => void;
  onRoleChange: (role: any) => void;
  position?: { top: number; left?: number; right?: number };
  isBatchMode?: boolean;
  selectedMembersCount?: number;
  onNavigateToRoles?: () => void;
  availableRoles?: RoleWithDescription[];
}

export function RoleManagementModal({
  currentRole,
  roleSystem: initialRoleSystem,
  onClose,
  onRoleChange,
  position,
  isBatchMode = false,
  selectedMembersCount = 0,
  onNavigateToRoles,
  availableRoles,
}: RoleManagementModalProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [roleSystem, setRoleSystem] = useState<'new' | 'today'>(initialRoleSystem);

  // Convert string role to appropriate format
  const initialRoles = roleSystem === 'new' 
    ? currentRole 
    : (typeof currentRole === 'string' 
        ? { training: 'None', content: 'None', administration: 'None' }
        : currentRole);

  const handleRoleSelect = (role: any) => {
    onRoleChange(role);
  };

  const toggleRoleSystem = () => {
    setRoleSystem(prev => prev === 'new' ? 'today' : 'new');
  };

  useEffect(() => {
    if (!position) return; // If no position, it's a centered modal

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, position]);

  // Context menu mode (positioned)
  if (position) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50"
        style={{ 
          top: `${position.top}px`, 
          left: position.left !== undefined ? `${position.left}px` : undefined,
          right: position.right !== undefined ? `${position.right}px` : undefined
        }}
      >
        {roleSystem === 'new' ? (
          <SimpleRolesContextMenu
            currentRole={typeof initialRoles === 'string' ? initialRoles : initialRoles.selectedRole}
            onClose={onClose}
            onSelect={handleRoleSelect}
            onToggleRoleSystem={toggleRoleSystem}
            roleSystemType={roleSystem}
            onNavigateToRoles={onNavigateToRoles}
            availableRoles={availableRoles}
          />
        ) : (
          <RolesSelectionContextMenu
            currentRoles={initialRoles}
            onClose={onClose}
            onSave={handleRoleSelect}
            onToggleRoleSystem={toggleRoleSystem}
            roleSystemType={roleSystem}
            onNavigateToRoles={onNavigateToRoles}
          />
        )}
      </div>
    );
  }

  // Modal mode (centered with backdrop)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {roleSystem === 'new' ? (
          <SimpleRolesContextMenu
            currentRole={typeof initialRoles === 'string' ? initialRoles : initialRoles.selectedRole}
            onClose={onClose}
            onSelect={handleRoleSelect}
            onToggleRoleSystem={toggleRoleSystem}
            roleSystemType={roleSystem}
            onNavigateToRoles={onNavigateToRoles}
            isBatchMode={isBatchMode}
            selectedMembersCount={selectedMembersCount}
            availableRoles={availableRoles}
          />
        ) : (
          <RolesSelectionContextMenu
            currentRoles={initialRoles}
            onClose={onClose}
            onSave={handleRoleSelect}
            onToggleRoleSystem={toggleRoleSystem}
            roleSystemType={roleSystem}
            onNavigateToRoles={onNavigateToRoles}
            isBatchMode={isBatchMode}
            selectedMembersCount={selectedMembersCount}
          />
        )}
      </div>
    </div>
  );
}
