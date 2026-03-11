import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole =
  | 'guest'
  | 'operator'
  | 'operator-mr'
  | 'field-service-engineer'
  | 'service-support-expert'
  | 'instructor'
  | 'service-support-manager'
  | 'content-creator'
  | 'admin';

export interface RoleInfo {
  id: UserRole;
  label: string;
  description: string;
}

export const ROLES: Record<UserRole, RoleInfo> = {
  'guest': {
    id: 'guest',
    label: 'Guest',
    description: 'External visitor with view-only access to shared content'
  },
  'operator': {
    id: 'operator',
    label: 'Operator',
    description: 'Basic frontline worker with access to flows and knowledge base'
  },
  'operator-mr': {
    id: 'operator-mr',
    label: 'Operator MR',
    description: 'Operator with mixed reality device access'
  },
  'field-service-engineer': {
    id: 'field-service-engineer',
    label: 'Field Service Engineer',
    description: 'On-site technician with advanced troubleshooting capabilities'
  },
  'service-support-expert': {
    id: 'service-support-expert',
    label: 'Service Support Expert',
    description: 'Remote support specialist providing guidance to field workers'
  },
  'instructor': {
    id: 'instructor',
    label: 'Instructor',
    description: 'Creates and manages training content and flows'
  },
  'service-support-manager': {
    id: 'service-support-manager',
    label: 'Service Support Manager',
    description: 'Manages support team and oversees operations'
  },
  'content-creator': {
    id: 'content-creator',
    label: 'Content Creator',
    description: 'Creates and maintains knowledge base content'
  },
  'admin': {
    id: 'admin',
    label: 'Admin',
    description: 'Full system access and workspace management'
  }
};

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  roleInfo: RoleInfo;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  // Persist the current role to localStorage so standalone HTML pages (e.g.
  // digital-twin-scene.html loaded in an iframe) can read it.
  useEffect(() => {
    localStorage.setItem('currentRole', currentRole);
  }, [currentRole]);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('currentRole', role);
    console.log('Role switched to:', ROLES[role].label);
  };

  const value = {
    currentRole,
    setRole,
    roleInfo: ROLES[currentRole]
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    // During hot reload, this might be temporarily undefined
    // Return a fallback to prevent crashes during development
    console.warn('useRole: RoleContext is undefined, using fallback');
    return {
      currentRole: 'admin' as const,
      setRole: () => {},
      roleInfo: ROLES['admin']
    };
  }
  return context;
}

// Helper function to check if a role has access to a feature
export function hasAccess(role: UserRole, feature: string): boolean {
  const accessMap: Record<string, UserRole[]> = {
    // Main menu items
    'home': ['guest', 'operator', 'operator-mr', 'field-service-engineer', 'service-support-expert', 'instructor', 'service-support-manager', 'content-creator', 'admin'],
    'notifications': ['guest', 'operator', 'operator-mr', 'field-service-engineer', 'service-support-expert', 'instructor', 'service-support-manager', 'content-creator', 'admin'],
    'remote-support': ['operator-mr', 'field-service-engineer', 'service-support-expert', 'service-support-manager', 'admin'],
    'ai-studio': ['instructor', 'content-creator', 'service-support-manager', 'admin'],
    'archive': ['content-creator', 'admin'],
    
    // Projects (Knowledge Base)
    'projects': ['guest', 'operator', 'operator-mr', 'field-service-engineer', 'service-support-expert', 'instructor', 'service-support-manager', 'content-creator', 'admin'],
    'projects-edit': ['instructor', 'content-creator', 'admin'], // Can edit procedures
    
    // Workspace management
    'workspace-management': ['admin'],
    'workspace-members': ['service-support-manager', 'admin'],
    'workspace-settings': ['admin'],
    
    // Analytics
    'analytics': ['service-support-manager', 'content-creator', 'admin'],
    'activity-log': ['service-support-manager', 'admin'],
    
    // AI Chat
    'ai-chat': ['field-service-engineer', 'service-support-expert', 'instructor', 'service-support-manager', 'content-creator', 'admin'],

    // Scheduling
    'schedule-meeting': ['field-service-engineer', 'service-support-expert', 'service-support-manager', 'admin'],

    // Project management
    'new-project': ['instructor', 'content-creator', 'admin'],

    // Content creation & editing
    'create-content': ['instructor', 'content-creator', 'admin'],
    'delete-content': ['content-creator', 'admin'],
    'publish-content': ['instructor', 'content-creator', 'admin'],
    'view-unpublished': ['instructor', 'service-support-manager', 'content-creator', 'admin'],
    'duplicate-content': ['instructor', 'content-creator', 'admin'],

    // Collaboration & sharing
    'share-content': ['instructor', 'service-support-expert', 'service-support-manager', 'content-creator', 'admin'],
    'view-collaborators': ['instructor', 'service-support-expert', 'service-support-manager', 'content-creator', 'admin'],
    'edit-collaborators': ['instructor', 'admin'],

    // AI Studio config
    'ai-studio-edit': ['instructor', 'content-creator', 'admin'],

    // Archive
    'archive-delete': ['admin'],

    // Remote support actions
    'start-call': ['operator-mr', 'field-service-engineer', 'service-support-expert', 'service-support-manager', 'admin'],
  };

  return accessMap[feature]?.includes(role) ?? false;
}

// Get menu items available for a role
export function getAvailableMenuItems(role: UserRole): string[] {
  const items: string[] = [];
  
  if (hasAccess(role, 'home')) items.push('home');
  if (hasAccess(role, 'notifications')) items.push('notifications');
  if (hasAccess(role, 'remote-support')) items.push('remote-support');
  if (hasAccess(role, 'ai-studio')) items.push('ai-studio');
  if (hasAccess(role, 'archive')) items.push('archive');
  
  return items;
}
