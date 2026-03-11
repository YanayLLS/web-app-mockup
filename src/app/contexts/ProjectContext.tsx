import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_PROJECTS } from '../data/mockProjectData';
// Multi-project management context with isolated data per project

export type ItemType = 'digital-twin' | 'procedure' | 'media' | 'folder';
export type MediaType = 'video' | 'image' | 'document';

export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'published' 
  | 'unpublished'
  | 'connected'
  | 'disconnected'
  | 'renamed'
  | 'moved'
  | 'shared';

export type ActivityCategory = 
  | 'knowledge-base'
  | 'digital-twin'
  | 'procedure'
  | 'session'
  | 'settings'
  | 'user';

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: ActivityAction;
  category: ActivityCategory;
  itemName: string;
  itemType?: ItemType;
  details?: string;
  metadata?: {
    from?: string;
    to?: string;
    itemId?: string;
    relatedItemId?: string;
    relatedItemName?: string;
  };
}

export interface KnowledgeBaseItem {
  id: string;
  name: string;
  type: ItemType;
  mediaType?: MediaType;
  createdBy: string;
  createdDate: string;
  lastEditedBy: string;
  lastEdited: string;
  connectedDigitalTwinIds?: string[];
  digitalTwinId?: string;
  children?: KnowledgeBaseItem[];
  isExpanded?: boolean;
  thumbnail?: string;
  description?: string;
  isPublished?: boolean;
  hasUnpublishedChanges?: boolean;
  publishedVersion?: string;
  publishedDate?: string;
  parentId?: string;
}

export interface DigitalTwin {
  id: string;
  name: string;
  description?: string;
  preview3DUrl?: string;
  createdBy: string;
  createdDate: string;
  lastEditedBy: string;
  lastEdited: string;
}

export interface Owner {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface SharedMember {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  type: 'user' | 'group';
  memberCount?: number;
}

export interface ProjectSettings {
  owners: Owner[];
  description: string;
  privacy: 'private' | 'public' | 'workspace';
  sharedWith: SharedMember[];
  defaultDigitalTwin: string;
  createdDate: string;
}

export interface ProjectData {
  id: string;
  name: string;
  digitalTwins: DigitalTwin[];
  knowledgeBaseItems: KnowledgeBaseItem[];
  activityLogs: ActivityLog[];
  settings: ProjectSettings;
}

interface ProjectContextType {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  setCurrentProject: (projectId: string) => void;
  createProject: (projectData: Omit<ProjectData, 'id' | 'digitalTwins' | 'knowledgeBaseItems' | 'activityLogs'>) => string;
  updateProject: (projectId: string, updates: Partial<ProjectData>) => void;
  deleteProject: (projectId: string) => void;
  
  // Current project helpers
  digitalTwins: DigitalTwin[];
  knowledgeBaseItems: KnowledgeBaseItem[];
  activityLogs: ActivityLog[];
  getDigitalTwinById: (id: string) => DigitalTwin | undefined;
  getDigitalTwinByName: (name: string) => DigitalTwin | undefined;
  getConnectedProcedures: (digitalTwinId: string) => KnowledgeBaseItem[];
  updateKnowledgeBaseItems: (items: KnowledgeBaseItem[]) => void;
  addKnowledgeBaseItem: (item: KnowledgeBaseItem) => void;
  updateKnowledgeBaseItem: (id: string, updates: Partial<KnowledgeBaseItem>) => void;
  deleteKnowledgeBaseItem: (id: string) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  dtThumbnail: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Ensure context is properly initialized

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>(DEFAULT_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [dtThumbnail, setDtThumbnail] = useState<string | null>(null);

  // Listen for thumbnail from the 3D scene iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'dt-thumbnail' && e.data.dataUrl) {
        const dataUrl = e.data.dataUrl;
        setDtThumbnail(dataUrl);
        // Update generator project KB items with the captured thumbnail
        setProjects(prev => prev.map(project => {
          if (project.id !== 'generator') return project;
          const updateThumbs = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] =>
            items.map(item => {
              const updated = item.type === 'digital-twin'
                ? { ...item, thumbnail: dataUrl }
                : item;
              return updated.children ? { ...updated, children: updateThumbs(updated.children) } : updated;
            });
          return { ...project, knowledgeBaseItems: updateThumbs(project.knowledgeBaseItems) };
        }));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  const setCurrentProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const createProject = (projectData: Omit<ProjectData, 'id' | 'digitalTwins' | 'knowledgeBaseItems' | 'activityLogs'>): string => {
    const newProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProject: ProjectData = {
      id: newProjectId,
      name: projectData.name,
      digitalTwins: [],
      knowledgeBaseItems: [],
      activityLogs: [],
      settings: projectData.settings,
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProjectId);
    return newProjectId;
  };

  const updateProject = (projectId: string, updates: Partial<ProjectData>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // If deleting current project, switch to first available project
    if (currentProjectId === projectId) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      if (remainingProjects.length > 0) {
        setCurrentProjectId(remainingProjects[0].id);
      }
    }
  };

  // Current project helpers
  const digitalTwins = currentProject?.digitalTwins || [];
  const knowledgeBaseItems = currentProject?.knowledgeBaseItems || [];
  const activityLogs = currentProject?.activityLogs || [];

  const getDigitalTwinById = (id: string) => {
    return digitalTwins.find(dt => dt.id === id);
  };

  const getDigitalTwinByName = (name: string) => {
    return digitalTwins.find(dt => dt.name === name);
  };

  const getConnectedProcedures = (digitalTwinId: string): KnowledgeBaseItem[] => {
    const flattenItems = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
      let result: KnowledgeBaseItem[] = [];
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          result = result.concat(flattenItems(item.children));
        }
      });
      return result;
    };
    
    const allItems = flattenItems(knowledgeBaseItems);
    return allItems.filter(item => 
      item.type === 'procedure' && 
      item.connectedDigitalTwinIds && 
      item.connectedDigitalTwinIds.includes(digitalTwinId)
    );
  };

  const updateKnowledgeBaseItems = (items: KnowledgeBaseItem[]) => {
    if (!currentProject) return;
    updateProject(currentProject.id, { knowledgeBaseItems: items });
  };

  const addKnowledgeBaseItem = (item: KnowledgeBaseItem) => {
    if (!currentProject) return;
    
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user: item.createdBy,
      action: 'created',
      category: item.type === 'procedure' ? 'procedure' : item.type === 'digital-twin' ? 'digital-twin' : 'knowledge-base',
      itemName: item.name,
      itemType: item.type,
      details: `Created new ${item.type.replace('-', ' ')}`,
      metadata: {
        itemId: item.id,
      }
    };
    
    updateProject(currentProject.id, {
      knowledgeBaseItems: [...currentProject.knowledgeBaseItems, item],
      activityLogs: [newLog, ...currentProject.activityLogs],
    });
  };

  const updateKnowledgeBaseItem = (id: string, updates: Partial<KnowledgeBaseItem>) => {
    if (!currentProject) return;

    const findItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const updateItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };

    const originalItem = findItem(currentProject.knowledgeBaseItems);
    const newItems = updateItem(currentProject.knowledgeBaseItems);
    
    if (originalItem) {
      const currentUser = originalItem.lastEditedBy || 'Unknown User';
      let newLog: ActivityLog | null = null;
      
      if (updates.name && updates.name !== originalItem.name) {
        newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          user: currentUser,
          action: 'renamed',
          category: originalItem.type === 'procedure' ? 'procedure' : 'digital-twin',
          itemName: updates.name,
          itemType: originalItem.type,
          details: `Renamed from "${originalItem.name}"`,
          metadata: {
            itemId: id,
            from: originalItem.name,
            to: updates.name,
          }
        };
      } else if (updates.isPublished !== undefined && updates.isPublished !== originalItem.isPublished) {
        newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          user: currentUser,
          action: updates.isPublished ? 'published' : 'unpublished',
          category: 'procedure',
          itemName: originalItem.name,
          itemType: originalItem.type,
          details: updates.isPublished 
            ? `Published version ${updates.publishedVersion || 'unknown'}`
            : 'Unpublished for editing',
          metadata: {
            itemId: id,
            to: updates.publishedVersion,
          }
        };
      } else if (Object.keys(updates).some(key => key !== 'lastEdited' && key !== 'lastEditedBy')) {
        newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          user: currentUser,
          action: 'updated',
          category: originalItem.type === 'procedure' ? 'procedure' : 'digital-twin',
          itemName: originalItem.name,
          itemType: originalItem.type,
          details: updates.description ? 'Updated description and details' : 'Updated item details',
          metadata: {
            itemId: id,
          }
        };
      }

      updateProject(currentProject.id, {
        knowledgeBaseItems: newItems,
        activityLogs: newLog ? [newLog, ...currentProject.activityLogs] : currentProject.activityLogs,
      });
    } else {
      updateProject(currentProject.id, { knowledgeBaseItems: newItems });
    }
  };

  const deleteKnowledgeBaseItem = (id: string) => {
    if (!currentProject) return;

    const findAndRemove = (items: KnowledgeBaseItem[]): { items: KnowledgeBaseItem[], deletedItem?: KnowledgeBaseItem } => {
      let deletedItem: KnowledgeBaseItem | undefined;
      const newItems = items.filter(item => {
        if (item.id === id) {
          deletedItem = item;
          return false;
        }
        if (item.children) {
          const result = findAndRemove(item.children);
          item.children = result.items;
          if (result.deletedItem) {
            deletedItem = result.deletedItem;
          }
        }
        return true;
      });
      return { items: newItems, deletedItem };
    };

    const result = findAndRemove(currentProject.knowledgeBaseItems);
    
    if (result.deletedItem) {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        user: result.deletedItem.lastEditedBy,
        action: 'deleted',
        category: result.deletedItem.type === 'procedure' ? 'procedure' : 'digital-twin',
        itemName: result.deletedItem.name,
        itemType: result.deletedItem.type,
        details: `Deleted ${result.deletedItem.type.replace('-', ' ')}`,
        metadata: {
          itemId: id,
        }
      };

      updateProject(currentProject.id, {
        knowledgeBaseItems: result.items,
        activityLogs: [newLog, ...currentProject.activityLogs],
      });
    }
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    if (!currentProject) return;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };

    updateProject(currentProject.id, {
      activityLogs: [newLog, ...currentProject.activityLogs],
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        digitalTwins,
        knowledgeBaseItems,
        activityLogs,
        getDigitalTwinById,
        getDigitalTwinByName,
        getConnectedProcedures,
        updateKnowledgeBaseItems,
        addKnowledgeBaseItem,
        updateKnowledgeBaseItem,
        deleteKnowledgeBaseItem,
        addActivityLog,
        dtThumbnail,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
