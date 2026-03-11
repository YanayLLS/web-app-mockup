import { useState, useEffect, useRef } from 'react';
import { X, Search, Users } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { calculateMenuPosition } from '@/app/utils/positionUtils';
import { useClickOutside } from '../../../../hooks/useClickOutside';

interface GroupWithColor {
  name: string;
  color: string;
}

interface GroupContextMenuProps {
  currentGroups: string[];
  onClose: () => void;
  onSave: (groups: string[]) => void;
  position: { top: number; left?: number; right?: number };
  allowMultiple?: boolean;
  availableGroups?: string[];
  availableGroupsWithColors?: GroupWithColor[];
  onManageGroups?: () => void;
  isFilterMode?: boolean; // New prop to indicate this is for filtering
}

export function GroupContextMenu({
  currentGroups,
  onClose,
  onSave,
  position,
  allowMultiple = true,
  availableGroups = [],
  availableGroupsWithColors = [],
  onManageGroups,
  isFilterMode = false, // Default to false if not provided
}: GroupContextMenuProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onSave(selectedGroups);
    onClose();
  };

  useClickOutside(menuRef, handleClose);

  // Clamp menu position within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(16, window.innerWidth - rect.width - 16)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(16, window.innerHeight - rect.height - 16)}px`;
    }
  }, []);

  // In filter mode, apply changes immediately
  useEffect(() => {
    if (isFilterMode && selectedGroups !== currentGroups) {
      // Use setTimeout to avoid updating parent during render
      const timer = setTimeout(() => {
        onSave(selectedGroups);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroups, isFilterMode]);

  // Use groups with colors if available, otherwise fallback to string array
  const groupsWithColors = availableGroupsWithColors.length > 0 
    ? availableGroupsWithColors 
    : availableGroups.map(name => ({ name, color: '#888888' }));

  const filteredGroups = groupsWithColors.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroup = (groupName: string) => {
    let newGroups: string[];
    if (allowMultiple) {
      newGroups = selectedGroups.includes(groupName) 
        ? selectedGroups.filter((g) => g !== groupName) 
        : [...selectedGroups, groupName];
    } else {
      newGroups = [groupName];
      // For single selection, save immediately and close
      setSelectedGroups(newGroups);
      onSave(newGroups);
      return;
    }
    setSelectedGroups(newGroups);
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-card rounded-lg shadow-elevation-lg w-[360px] max-w-[calc(100vw-32px)] z-50"
      style={{ 
        top: `${position.top}px`, 
        left: position.left !== undefined ? `${position.left}px` : undefined,
        right: position.right !== undefined ? `${position.right}px` : undefined,
        border: '1px solid var(--border)',
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
              {isFilterMode ? 'Filter by Group' : 'Select Groups'}
            </h3>
            {isFilterMode && selectedGroups.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                {selectedGroups.length} group{selectedGroups.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onManageGroups && !isFilterMode && (
              <button 
                onClick={() => {
                  onManageGroups();
                  handleClose();
                }}
                className="text-xs hover:underline transition-colors"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-family)' }}
              >
                Manage Groups
              </button>
            )}
            <button onClick={handleClose} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 min-h-[44px] text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* Groups List */}
        <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto border border-border rounded-lg p-2" style={{ backgroundColor: 'var(--background)' }}>
          {filteredGroups.map((group) => (
            <div
              key={group.name}
              className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              onClick={() => toggleGroup(group.name)}
            >
              <Checkbox 
                checked={selectedGroups.includes(group.name)} 
                onChange={(e) => { e.stopPropagation(); toggleGroup(group.name); }} 
              />
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${group.color}20` }}
                >
                  <Users className="w-2.5 h-2.5" style={{ color: group.color }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-family)' }}>
                  {group.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border">
          <span className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
            {selectedGroups.length} selected
          </span>
        </div>
      </div>
    </div>
  );
}