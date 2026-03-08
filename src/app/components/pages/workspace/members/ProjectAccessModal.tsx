import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import { X, Search, ChevronRight, ChevronDown, Folder, File, Info, Globe } from 'lucide-react';
import { Checkbox } from './Checkbox';

export interface Group {
  id: string;
  name: string;
  color: string;
  members: Array<{ id: string; name: string; initials: string; color: string }>;
  projects: string[];
}

interface ProjectAccessModalProps {
  currentProjects: string[];
  memberGroups?: string[];
  mixedProjects?: string[]; // Projects that only some selected members have
  onClose: () => void;
  onSave: (projectIds: string[]) => void;
  memberRole?: string; // Role of the member (to check for Owner/Admin)
  groups?: Group[]; // Groups data for dynamic access lookup
  publicFeatureEnabled?: boolean; // Feature flag for public projects
  roleAccessRules?: { [contentId: string]: string[] }; // Role-based access rules
  roleAccessFeatureEnabled?: boolean; // Feature flag for role access
  isFilterMode?: boolean; // New prop to indicate this is for filtering
}

// Define which projects are public (all workspace members have access)
// This is only active when publicFeatureEnabled is true
const publicProjects = ['p1', 'p4'];

interface ProjectNode {
  id: string;
  name: string;
  type: 'project' | 'folder' | 'item';
  children?: ProjectNode[];
}

export const projectsHierarchy: ProjectNode[] = [
  {
    id: 'p1',
    name: 'Worldwide Infrastructure',
    type: 'project',
    children: [
      {
        id: 'p1f1',
        name: 'Germany Team',
        type: 'folder',
        children: [
          { id: 'p1f1i1', name: 'Berlin Maintenance', type: 'item' },
          { id: 'p1f1i2', name: 'Munich Operations', type: 'item' },
          { id: 'p1f1i3', name: 'Hamburg Support', type: 'item' },
        ],
      },
      {
        id: 'p1f2',
        name: 'France Team',
        type: 'folder',
        children: [
          { id: 'p1f2i1', name: 'Paris Maintenance', type: 'item' },
          { id: 'p1f2i2', name: 'Lyon Operations', type: 'item' },
        ],
      },
      {
        id: 'p1f3',
        name: 'UK Team',
        type: 'folder',
        children: [
          { id: 'p1f3i1', name: 'London Support', type: 'item' },
          { id: 'p1f3i2', name: 'Manchester Operations', type: 'item' },
        ],
      },
      {
        id: 'p1f4',
        name: 'Global Support',
        type: 'folder',
        children: [
          { id: 'p1f4i1', name: '24/7 Helpdesk', type: 'item' },
          { id: 'p1f4i2', name: 'Remote Monitoring', type: 'item' },
          { id: 'p1f4i3', name: 'Emergency Response', type: 'item' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Europe Operations',
    type: 'project',
    children: [
      {
        id: 'p2f1',
        name: 'Central Europe',
        type: 'folder',
        children: [
          { id: 'p2f1i1', name: 'Berlin Office', type: 'item' },
          { id: 'p2f1i2', name: 'Vienna Office', type: 'item' },
        ],
      },
      {
        id: 'p2f2',
        name: 'Western Europe',
        type: 'folder',
        children: [
          { id: 'p2f2i1', name: 'Amsterdam Office', type: 'item' },
          { id: 'p2f2i2', name: 'Brussels Office', type: 'item' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    name: 'Asia Operations',
    type: 'project',
    children: [
      {
        id: 'p3f1',
        name: 'East Asia',
        type: 'folder',
        children: [
          { id: 'p3f1i1', name: 'Tokyo Maintenance', type: 'item' },
          { id: 'p3f1i2', name: 'Seoul Operations', type: 'item' },
        ],
      },
      {
        id: 'p3f2',
        name: 'Southeast Asia',
        type: 'folder',
        children: [
          { id: 'p3f2i1', name: 'Singapore Hub', type: 'item' },
          { id: 'p3f2i2', name: 'Bangkok Support', type: 'item' },
        ],
      },
    ],
  },
  {
    id: 'p4',
    name: 'Regional Analytics',
    type: 'project',
    children: [
      {
        id: 'p4f1',
        name: 'Performance Metrics',
        type: 'folder',
        children: [
          { id: 'p4f1i1', name: 'Europe Dashboard', type: 'item' },
          { id: 'p4f1i2', name: 'Asia Dashboard', type: 'item' },
          { id: 'p4f1i3', name: 'Global Overview', type: 'item' },
        ],
      },
    ],
  },
  {
    id: 'p5',
    name: 'Field Services',
    type: 'project',
    children: [
      {
        id: 'p5f1',
        name: 'Italy',
        type: 'folder',
        children: [
          { id: 'p5f1i1', name: 'Rome Maintenance', type: 'item' },
          { id: 'p5f1i2', name: 'Milan Support', type: 'item' },
        ],
      },
      {
        id: 'p5f2',
        name: 'Spain',
        type: 'folder',
        children: [
          { id: 'p5f2i1', name: 'Madrid Operations', type: 'item' },
          { id: 'p5f2i2', name: 'Barcelona Support', type: 'item' },
        ],
      },
    ],
  },
];

// Helper to find parent project for any node
function findParentProject(nodeId: string): string | null {
  for (const project of projectsHierarchy) {
    if (project.id === nodeId) return nodeId;
    
    const searchInChildren = (node: ProjectNode): boolean => {
      if (node.id === nodeId) return true;
      if (node.children) {
        return node.children.some(child => searchInChildren(child));
      }
      return false;
    };
    
    if (searchInChildren(project)) {
      return project.id;
    }
  }
  return null;
}

// Helper to check if a node inherits public status from parent project
function isInheritedPublic(nodeId: string, publicFeatureEnabled: boolean): boolean {
  if (!publicFeatureEnabled) return false;
  const parentProjectId = findParentProject(nodeId);
  return parentProjectId ? publicProjects.includes(parentProjectId) : false;
}

// Helper to get all descendant IDs
function getAllDescendantIds(node: ProjectNode): string[] {
  const ids: string[] = [];
  const traverse = (n: ProjectNode) => {
    ids.push(n.id);
    if (n.children) {
      n.children.forEach(traverse);
    }
  };
  traverse(node);
  return ids;
}

// Helper to check if a parent should be indeterminate (some but not all children selected)
function isParentIndeterminate(
  node: ProjectNode,
  directAccessIds: string[],
  publicAccessIds: string[]
): boolean {
  if (!node.children || node.children.length === 0) return false;

  const descendantIds = getAllDescendantIds(node);
  // Exclude the parent itself, only check children
  const childIds = descendantIds.filter((id) => id !== node.id);
  // Exclude public items as they can't be toggled
  const selectableChildIds = childIds.filter((id) => !publicAccessIds.includes(id));

  if (selectableChildIds.length === 0) return false;

  const selectedCount = selectableChildIds.filter((id) =>
    directAccessIds.includes(id)
  ).length;

  // Indeterminate if some (but not all) selectable children are selected
  return selectedCount > 0 && selectedCount < selectableChildIds.length;
}

function TreeNode({
  node,
  level = 0,
  selected,
  expanded,
  onToggle,
  onSelect,
  groupAccessInfo,
  roleAccessInfo,
  directAccessIds,
  mixedProjects,
  searchQuery = '',
  isOwnerOrAdmin = false,
  publicFeatureEnabled = true,
  publicAccessIds = [],
  publicProjectIds = [],
  onTogglePublic,
  memberRole,
  roleAccessRules,
  roleAccessFeatureEnabled,
}: {
  node: ProjectNode;
  level?: number;
  selected: string[];
  expanded: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  groupAccessInfo?: { [key: string]: string[] };
  roleAccessInfo?: { [key: string]: string[] };
  directAccessIds: string[];
  mixedProjects?: string[];
  searchQuery?: string;
  isOwnerOrAdmin?: boolean;
  publicFeatureEnabled?: boolean;
  publicAccessIds?: string[];
  publicProjectIds?: string[];
  onTogglePublic?: (projectId: string) => void;
  memberRole?: string;
  roleAccessRules?: { [contentId: string]: string[] };
  roleAccessFeatureEnabled?: boolean;
}) {
  const isExpanded = expanded.includes(node.id);
  const isDirectlySelected = directAccessIds.includes(node.id);
  const isMixed = mixedProjects?.includes(node.id) || false;
  const hasChildren = node.children && node.children.length > 0;
  const accessibleFromGroups = groupAccessInfo?.[node.id] || [];
  const hasGroupAccess = accessibleFromGroups.length > 0;
  const accessibleFromRoles = roleAccessInfo?.[node.id] || [];
  const hasRoleAccess = accessibleFromRoles.length > 0;
  
  // Check if this node is public
  const isPublic = publicAccessIds.includes(node.id);
  const isTopLevelProject = projectsHierarchy.some(p => p.id === node.id);
  
  // Check if blocked by role
  const isBlockedByRole = roleAccessFeatureEnabled && 
    memberRole && 
    roleAccessRules && 
    roleAccessRules[node.id] && 
    !roleAccessRules[node.id].includes(memberRole) &&
    !isDirectlySelected &&
    !hasGroupAccess;
  
  // Determine if user has multiple access types
  const accessCount = [isDirectlySelected, hasGroupAccess, hasRoleAccess].filter(Boolean).length;
  const hasDualAccess = accessCount === 2;
  const hasTripleAccess = accessCount === 3;
  
  // Node is locked if user is Owner/Admin (but NOT if it's public - we can now toggle that)
  const isLocked = isOwnerOrAdmin;
  
  // Calculate if this parent should show indeterminate state
  const isIndeterminate = hasChildren && !isLocked && isParentIndeterminate(node, directAccessIds, publicAccessIds);
  
  // Node appears selected if: directly selected, has group access, has role access, is public, or is Owner/Admin
  // For parents with children, check if all selectable descendants are selected
  let effectivelySelected = isDirectlySelected || hasGroupAccess || hasRoleAccess || isPublic || isOwnerOrAdmin;
  
  if (hasChildren && !isLocked) {
    const descendantIds = getAllDescendantIds(node);
    const selectableDescendants = descendantIds.filter(
      (descId) => !publicAccessIds.includes(descId)
    );
    const allDescendantsSelected = selectableDescendants.every((descId) =>
      directAccessIds.includes(descId)
    );
    effectivelySelected = allDescendantsSelected || hasGroupAccess || hasRoleAccess || isPublic || isOwnerOrAdmin;
  }

  // Highlight search term
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span 
          key={i} 
          style={{ 
            backgroundColor: 'var(--primary-background)', 
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'var(--font-family)',
          }}
        >
          {part}
        </span>
      ) : part
    );
  };

  // Build access badge label
  const getAccessBadge = () => {
    if (isPublic) {
      // Determine badge text and title based on node type
      const badgeText = isTopLevelProject ? "PUBLIC" : "SHARED";
      const tooltipText = isTopLevelProject 
        ? "Public to all workspace members" 
        : "Shared with all project members";
      
      return (
        <div 
          className="flex items-center gap-1 rounded"
          style={{ 
            backgroundColor: 'var(--primary-background)', 
            color: 'var(--primary)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-bold)',
            paddingLeft: 'var(--spacing-1)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-0-5)',
            paddingBottom: 'var(--spacing-0-5)',
          }}
          title={tooltipText}
        >
          <Globe style={{ width: '12px', height: '12px' }} />
          <span>{badgeText}</span>
        </div>
      );
    }

    // Multiple access types (triple)
    if (hasTripleAccess) {
      const sources = [];
      if (hasGroupAccess) sources.push(`via ${accessibleFromGroups[0]}`);
      if (hasRoleAccess) sources.push(`via ${accessibleFromRoles[0]}`);
      
      return (
        <div 
          className="flex items-center gap-1 rounded"
          style={{ 
            backgroundColor: 'var(--secondary)', 
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            paddingLeft: 'var(--spacing-1)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-0-5)',
            paddingBottom: 'var(--spacing-0-5)',
          }}
        >
          <Info style={{ width: '12px', height: '12px' }} />
          <span>Direct + {sources.join(' + ')}</span>
        </div>
      );
    }

    // Dual access (any two)
    if (hasDualAccess) {
      let label = 'Direct';
      if (hasGroupAccess && hasRoleAccess) {
        label = `via ${accessibleFromGroups[0]} + via ${accessibleFromRoles[0]}`;
      } else if (hasGroupAccess && isDirectlySelected) {
        label = `Direct + via ${accessibleFromGroups[0]}`;
      } else if (hasRoleAccess && isDirectlySelected) {
        label = `Direct + via ${accessibleFromRoles[0]}`;
      }
      
      return (
        <div 
          className="flex items-center gap-1 rounded"
          style={{ 
            backgroundColor: 'var(--secondary)', 
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            paddingLeft: 'var(--spacing-1)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-0-5)',
            paddingBottom: 'var(--spacing-0-5)',
          }}
        >
          <Info style={{ width: '12px', height: '12px' }} />
          <span>{label}</span>
        </div>
      );
    }

    // Single access via group
    if (hasGroupAccess) {
      return (
        <div 
          className="flex items-center gap-1 rounded"
          style={{ 
            backgroundColor: 'var(--secondary)', 
            color: 'var(--muted)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            paddingLeft: 'var(--spacing-1)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-0-5)',
            paddingBottom: 'var(--spacing-0-5)',
          }}
        >
          <Info style={{ width: '12px', height: '12px' }} />
          <span>via {accessibleFromGroups[0]}</span>
          {accessibleFromGroups.length > 1 && (
            <span> +{accessibleFromGroups.length - 1}</span>
          )}
        </div>
      );
    }

    // Single access via role
    if (hasRoleAccess) {
      return (
        <div 
          className="flex items-center gap-1 rounded"
          style={{ 
            backgroundColor: 'var(--secondary)', 
            color: 'var(--muted)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            paddingLeft: 'var(--spacing-1)',
            paddingRight: 'var(--spacing-1)',
            paddingTop: 'var(--spacing-0-5)',
            paddingBottom: 'var(--spacing-0-5)',
          }}
        >
          <Info style={{ width: '12px', height: '12px' }} />
          <span>via {accessibleFromRoles[0]}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded ${
          (isLocked || isPublic) ? 'cursor-default' : 'cursor-pointer hover:bg-secondary transition-colors'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}

        <Checkbox
          checked={effectivelySelected}
          indeterminate={isIndeterminate || (isMixed && !effectivelySelected)}
          blocked={isBlockedByRole}
          onChange={(e) => {
            e.stopPropagation();
            if (!isLocked && !isPublic) {
              onSelect(node.id);
            }
          }}
          disabled={isLocked || isPublic}
        />

        {node.type === 'project' && <Folder className="w-4 h-4" style={{ color: 'var(--primary)' }} />}
        {node.type === 'folder' && <Folder className="w-4 h-4" style={{ color: 'var(--muted)' }} />}
        {node.type === 'item' && <File className="w-4 h-4" style={{ color: 'var(--muted)' }} />}

        <span 
          className="flex-1"
          style={{ 
            color: (isLocked || isPublic) ? 'var(--muted)' : 'var(--foreground)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-base)',
          }}
        >
          {highlightText(node.name)}
        </span>

        {getAccessBadge()}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selected={selected}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              groupAccessInfo={groupAccessInfo}
              roleAccessInfo={roleAccessInfo}
              directAccessIds={directAccessIds}
              mixedProjects={mixedProjects}
              searchQuery={searchQuery}
              isOwnerOrAdmin={isOwnerOrAdmin}
              publicFeatureEnabled={publicFeatureEnabled}
              publicAccessIds={publicAccessIds}
              publicProjectIds={publicProjectIds}
              onTogglePublic={onTogglePublic}
              memberRole={memberRole}
              roleAccessRules={roleAccessRules}
              roleAccessFeatureEnabled={roleAccessFeatureEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectAccessModal({
  currentProjects,
  memberGroups = [],
  mixedProjects = [],
  onClose,
  onSave,
  memberRole,
  groups = [],
  publicFeatureEnabled = true,
  roleAccessRules = {},
  roleAccessFeatureEnabled = true,
  isFilterMode = false,
}: ProjectAccessModalProps) {
  const isOwnerOrAdmin = memberRole === 'Owner' || memberRole === 'Admin';
  // Separate direct access from inherited access
  const [directAccessIds, setDirectAccessIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['p1', 'p2', 'p3']);
  const [searchQuery, setSearchQuery] = useState('');
  // Track which projects are public (only top-level projects can be public)
  const [publicProjectIds, setPublicProjectIds] = useState<string[]>(publicProjects);

  // Build group access info with cascade logic
  const buildGroupAccessInfo = () => {
    const groupAccessInfo: { [key: string]: string[] } = {};
    
    memberGroups.forEach((groupName) => {
      // Find the group from the groups prop
      const group = groups.find(g => g.name === groupName);
      const access = group?.projects || [];
      access.forEach((projectId) => {
        // Find the node in hierarchy
        const findNode = (nodes: ProjectNode[]): ProjectNode | null => {
          for (const node of nodes) {
            if (node.id === projectId) return node;
            if (node.children) {
              const found = findNode(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const node = findNode(projectsHierarchy);
        if (node) {
          // Add this ID and all descendants
          const allIds = getAllDescendantIds(node);
          allIds.forEach(id => {
            if (!groupAccessInfo[id]) {
              groupAccessInfo[id] = [];
            }
            if (!groupAccessInfo[id].includes(groupName)) {
              groupAccessInfo[id].push(groupName);
            }
          });
        }
      });
    });
    
    return groupAccessInfo;
  };

  // Get all IDs that are public (including descendants)
  const getAllPublicIds = () => {
    if (!publicFeatureEnabled) return [];
    
    const publicIds: string[] = [];
    
    publicProjectIds.forEach(projectId => {
      const project = projectsHierarchy.find(p => p.id === projectId);
      if (project) {
        publicIds.push(...getAllDescendantIds(project));
      }
    });
    
    return publicIds;
  };

  // Build role access info - which content the member can access via their role
  const buildRoleAccessInfo = () => {
    const roleAccessInfo: { [key: string]: string[] } = {};
    
    if (!roleAccessFeatureEnabled || !memberRole) {
      return roleAccessInfo;
    }
    
    // Iterate through all content IDs that have role access rules
    Object.keys(roleAccessRules).forEach(contentId => {
      const rolesWithAccess = roleAccessRules[contentId] || [];
      
      // Check if the member's role has access to this content
      if (rolesWithAccess.includes(memberRole)) {
        roleAccessInfo[contentId] = [memberRole];
      }
    });
    
    return roleAccessInfo;
  };

  const groupAccessInfo = buildGroupAccessInfo();
  const roleAccessInfo = buildRoleAccessInfo();
  const publicAccessIds = getAllPublicIds();
  
  // Helper to check if a node is a top-level project (can be made public)
  const isTopLevelProject = (nodeId: string): boolean => {
    return projectsHierarchy.some(p => p.id === nodeId);
  };
  
  // Helper to toggle public status
  const togglePublicStatus = (projectId: string) => {
    if (!isTopLevelProject(projectId)) return;
    
    setPublicProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Initialize: Filter out any inherited access from currentProjects to get only direct access
  useEffect(() => {
    // Only keep IDs that are not inherited from groups, roles, or public
    const onlyDirectAccess = currentProjects.filter(id => 
      !groupAccessInfo[id] && !roleAccessInfo[id] && !publicAccessIds.includes(id)
    );
    
    setDirectAccessIds(onlyDirectAccess);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjects]);

  // In filter mode, apply changes immediately
  useEffect(() => {
    if (isFilterMode && directAccessIds !== currentProjects) {
      // Use setTimeout to avoid updating parent during render
      const timer = setTimeout(() => {
        onSave(directAccessIds);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directAccessIds, isFilterMode]);

  // Compute all selected (direct + inherited)
  const allSelectedIds = [
    ...new Set([
      ...directAccessIds,
      ...Object.keys(groupAccessInfo),
      ...publicAccessIds,
    ])
  ];

  // Search functionality
  const searchLower = searchQuery.toLowerCase().trim();
  
  // Check if a node or any of its descendants match the search
  const nodeMatchesSearch = (node: ProjectNode): boolean => {
    if (!searchLower) return true;
    
    // Check if current node matches
    if (node.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if any child matches
    if (node.children) {
      return node.children.some(child => nodeMatchesSearch(child));
    }
    
    return false;
  };

  // Get IDs that should be expanded based on search
  const getExpandedForSearch = (): string[] => {
    if (!searchLower) return expanded;
    
    const toExpand: string[] = [];
    
    const checkAndExpand = (node: ProjectNode) => {
      if (node.children) {
        // If any child matches, expand this node
        const hasMatchingChild = node.children.some(child => nodeMatchesSearch(child));
        if (hasMatchingChild) {
          toExpand.push(node.id);
          // Recursively check children
          node.children.forEach(child => checkAndExpand(child));
        }
      }
    };
    
    projectsHierarchy.forEach(project => checkAndExpand(project));
    return toExpand;
  };

  const effectiveExpanded = searchLower ? getExpandedForSearch() : expanded;

  // Filter projects based on search
  const filterNode = (node: ProjectNode): ProjectNode | null => {
    if (!searchLower) return node;
    
    const matches = node.name.toLowerCase().includes(searchLower);
    const filteredChildren = node.children
      ?.map(child => filterNode(child))
      .filter((child): child is ProjectNode => child !== null);
    
    // Include node if it matches or has matching children
    if (matches || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : node.children,
      };
    }
    
    return null;
  };

  const filteredHierarchy = projectsHierarchy
    .map(project => filterNode(project))
    .filter((project): project is ProjectNode => project !== null);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelection = (id: string) => {
    // Can't toggle if Owner/Admin (they have access to all)
    if (isOwnerOrAdmin) return;
    
    // Can't toggle public items
    if (publicAccessIds.includes(id)) return;

    // Find the node in the hierarchy
    const findNode = (nodes: ProjectNode[]): ProjectNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(projectsHierarchy);
    if (!node) return;

    // If the node has children (project or folder), handle parent selection
    if (node.children && node.children.length > 0) {
      const descendantIds = getAllDescendantIds(node);
      // Filter out public items from descendants
      const selectableDescendants = descendantIds.filter(
        (descId) => !publicAccessIds.includes(descId)
      );

      // Check if all selectable descendants are currently selected
      const allDescendantsSelected = selectableDescendants.every((descId) =>
        directAccessIds.includes(descId)
      );

      setDirectAccessIds((prev) => {
        return allDescendantsSelected
          ? prev.filter((i) => !selectableDescendants.includes(i))
          : [...new Set([...prev, ...selectableDescendants])];
      });
    } else {
      // Leaf node (item), toggle normally
      setDirectAccessIds((prev) => {
        return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      });
    }
  };

  const getAllSelectableIds = () => {
    const ids: string[] = [];
    const traverse = (node: ProjectNode) => {
      // Only add if not public and matches search
      if (!publicAccessIds.includes(node.id) && nodeMatchesSearch(node)) {
        ids.push(node.id);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    filteredHierarchy.forEach(traverse);
    return ids;
  };

  const handleSelectAll = () => {
    const allIds = getAllSelectableIds();
    
    // If all selectable items are in direct access, deselect all
    const allSelected = allIds.every(id => directAccessIds.includes(id));
    
    if (allSelected) {
      // Remove all selectable IDs from direct access
      setDirectAccessIds(directAccessIds.filter(id => !allIds.includes(id)));
    } else {
      // Add all selectable IDs to direct access
      setDirectAccessIds([...new Set([...directAccessIds, ...allIds])]);
    }
  };

  const handleSave = () => {
    // Only save direct access - inherited access is computed at runtime
    onSave(directAccessIds);
    onClose();
  };

  const added = directAccessIds.filter(p => !currentProjects.includes(p));
  const removed = currentProjects.filter(p => !directAccessIds.includes(p) && !groupAccessInfo[p] && !publicAccessIds.includes(p));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-lg w-full max-w-[500px] max-h-[600px] flex flex-col"
        style={{ 
          boxShadow: 'var(--elevation-sm)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {isFilterMode ? 'Filter by Access' : 'Select Access'}
              </h3>
              {isFilterMode && directAccessIds.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-family)' }}>
                  {directAccessIds.length} project{directAccessIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info Banner for Owner/Admin */}
          {isOwnerOrAdmin && (
            <div 
              className="flex items-start gap-2 p-3 rounded"
              style={{ 
                backgroundColor: 'var(--primary-background)',
                borderRadius: 'var(--radius)',
              }}
            >
              <Info className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div className="flex-1">
                <p 
                  style={{ 
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{memberRole}s</span> have access to all items in the workspace regardless of project access settings.
                </p>
              </div>
            </div>
          )}

          {/* Info Banner for Groups/Public */}
          {!isOwnerOrAdmin && (memberGroups.length > 0 || publicAccessIds.length > 0) && (
            <div 
              className="flex items-start gap-2 p-3 rounded"
              style={{ 
                backgroundColor: 'var(--primary-background)',
                borderRadius: 'var(--radius)',
              }}
            >
              <Info className="w-4 h-4 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div className="flex-1">
                <p 
                  style={{ 
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {publicAccessIds.length > 0 && memberGroups.length > 0 && 
                    'Public projects are accessible workspace-wide. Folders/items marked as public are visible to all project members. Group access is automatically inherited.'
                  }
                  {publicAccessIds.length > 0 && memberGroups.length === 0 && 
                    'Public projects are accessible workspace-wide. Folders/items marked as public are visible to all project members.'
                  }
                  {publicAccessIds.length === 0 && memberGroups.length > 0 && 
                    'Group access is automatically inherited. You can add direct access independently.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white"
              style={{ 
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius)',
              }}
            />
          </div>

          {/* Select All Button */}
          {!isOwnerOrAdmin && (
            <button
              onClick={handleSelectAll}
              className="px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-left"
              style={{ 
                color: 'var(--primary)',
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-base)',
                borderRadius: 'var(--radius)',
              }}
            >
              {getAllSelectableIds().every(id => directAccessIds.includes(id)) ? 'Deselect All' : 'Select All'}
            </button>
          )}

          {/* Tree */}
          <div 
            className="flex-1 overflow-y-auto border border-border rounded-lg p-2" 
            style={{ 
              backgroundColor: 'var(--background)',
              borderRadius: 'var(--radius)',
            }}
          >
            {filteredHierarchy.length > 0 ? (
              filteredHierarchy.map((project) => (
                <TreeNode
                  key={project.id}
                  node={project}
                  selected={allSelectedIds}
                  expanded={effectiveExpanded}
                  onToggle={toggleExpanded}
                  onSelect={toggleSelection}
                  groupAccessInfo={groupAccessInfo}
                  roleAccessInfo={roleAccessInfo}
                  directAccessIds={directAccessIds}
                  mixedProjects={mixedProjects}
                  searchQuery={searchLower}
                  isOwnerOrAdmin={isOwnerOrAdmin}
                  publicFeatureEnabled={publicFeatureEnabled}
                  publicAccessIds={publicAccessIds}
                  publicProjectIds={publicProjectIds}
                  onTogglePublic={togglePublicStatus}
                  memberRole={memberRole}
                  roleAccessRules={roleAccessRules}
                  roleAccessFeatureEnabled={roleAccessFeatureEnabled}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="w-12 h-12 mb-3" style={{ color: 'var(--muted)', opacity: 0.3 }} />
                <p 
                  className="mb-1"
                  style={{ 
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  No results found
                </p>
                <p 
                  className="text-center"
                  style={{ 
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            {isOwnerOrAdmin ? (
              <span 
                style={{ 
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Access to all items • Cannot be modified
              </span>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span 
                  style={{ 
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {allSelectedIds.length} total ({directAccessIds.length} direct)
                </span>
                {(added.length > 0 || removed.length > 0) && (
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {added.length > 0 && <span style={{ color: 'var(--primary)' }}>+{added.length} added</span>}
                    {added.length > 0 && removed.length > 0 && <span style={{ color: 'var(--muted)' }}>, </span>}
                    {removed.length > 0 && <span style={{ color: 'var(--destructive)' }}>-{removed.length} removed</span>}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--text-base)',
                  borderRadius: 'var(--radius)',
                }}
              >
                {isOwnerOrAdmin ? 'Close' : 'Cancel'}
              </button>
              {!isOwnerOrAdmin && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ 
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-base)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}