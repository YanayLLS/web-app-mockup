import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  MoreHorizontal, 
  Search, 
  Grid3x3, 
  List, 
  Filter, 
  Plus, 
  Upload, 
  Link as LinkIcon, 
  File, 
  Video, 
  Image as ImageIcon, 
  Box, 
  FileText, 
  X,
  Download,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Check,
  GripVertical,
  ChevronUp,
  ChevronsUpDown,
  FolderPlus,
  Star
} from 'lucide-react';
import { ProcedureModal } from '../modals/ProcedureModal';
import { ConnectionPicker } from '../modals/ConnectionPicker';
import { MediaLibraryModal } from '../modals/MediaLibraryModal';
import { ProcedureCanvas } from './ProcedureCanvas';
import { useProject, KnowledgeBaseItem, ItemType, MediaType } from '../../contexts/ProjectContext';
import { useToast } from '../../contexts/ToastContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { useFavorites } from '../../contexts/FavoritesContext';

type SortDirection = 'asc' | 'desc' | null;

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width: number;
  sortable: boolean;
  removable: boolean;
}

interface DragItem {
  id: string;
  type: string;
}

const ITEM_TYPE = 'KNOWLEDGE_ITEM';
const COLUMN_TYPE = 'COLUMN_HEADER';

const ALL_AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: 'type', label: 'Type', visible: true, width: 130, sortable: true, removable: false },
  { id: 'connectedDigitalTwin', label: 'Connection', visible: true, width: 150, sortable: true, removable: true },
  { id: 'createdBy', label: 'Created by', visible: true, width: 130, sortable: true, removable: true },
  { id: 'createdDate', label: 'Created', visible: true, width: 100, sortable: true, removable: true },
  { id: 'lastEditedBy', label: 'Last edited by', visible: true, width: 130, sortable: true, removable: true },
  { id: 'lastEdited', label: 'Last edited', visible: true, width: 110, sortable: true, removable: true },
  { id: 'size', label: 'Size', visible: false, width: 90, sortable: true, removable: true },
  { id: 'version', label: 'Version', visible: false, width: 100, sortable: true, removable: true },
];

// Columns visible to operators (non-content creators)
const OPERATOR_COLUMNS: ColumnConfig[] = [
  { id: 'type', label: 'Type', visible: true, width: 130, sortable: true, removable: false },
  { id: 'connectedDigitalTwin', label: 'Connection', visible: true, width: 200, sortable: true, removable: false },
];

export function KnowledgeBasePage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <KnowledgeBaseContent />
    </DndProvider>
  );
}

function KnowledgeBaseContent() {
  const { 
    knowledgeBaseItems, 
    updateKnowledgeBaseItems, 
    deleteKnowledgeBaseItem, 
    addKnowledgeBaseItem,
    digitalTwins,
    getDigitalTwinById,
    currentProject 
  } = useProject();
  const { showToast } = useToast();
  const { currentRole } = useRole();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  // Check if user has edit permissions
  const canEdit = hasAccess(currentRole, 'projects-edit');

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | ItemType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const [activeItemMenu, setActiveItemMenu] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [nameColumnWidth, setNameColumnWidth] = useState(250);
  const [openProcedure, setOpenProcedure] = useState<KnowledgeBaseItem | null>(null);
  const [openDigitalTwin, setOpenDigitalTwin] = useState<KnowledgeBaseItem | null>(null);
  const [canvasProcedure, setCanvasProcedure] = useState<KnowledgeBaseItem | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [newlyCreatedProcedureId, setNewlyCreatedProcedureId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [connectionPickerItem, setConnectionPickerItem] = useState<KnowledgeBaseItem | null>(null);
  const [connectionPickerPosition, setConnectionPickerPosition] = useState({ top: 0, left: 0 });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [digitalTwinConnectionMenu, setDigitalTwinConnectionMenu] = useState<{
    digitalTwinId: string;
    position: { top: number; left: number };
  } | null>(null);
  const [procedureSearchQuery, setProcedureSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showDigitalTwinModal, setShowDigitalTwinModal] = useState(false);
  
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const addColumnMenuRef = useRef<HTMLDivElement>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const digitalTwinConnectionMenuRef = useRef<HTMLDivElement>(null);

  // Use operator columns for non-editors, full columns for content creators/admins
  const [columns, setColumns] = useState<ColumnConfig[]>(
    canEdit 
      ? ALL_AVAILABLE_COLUMNS.filter(col => col.visible)
      : OPERATOR_COLUMNS
  );

  const [items, setItems] = useState<KnowledgeBaseItem[]>(knowledgeBaseItems);

  // Sync with context
  useEffect(() => {
    setItems(knowledgeBaseItems);
  }, [knowledgeBaseItems]);

  // Focus editing input
  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingItemId]);

  // Track shift key for range selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
      if (addColumnMenuRef.current && !addColumnMenuRef.current.contains(event.target as Node)) {
        setShowAddColumnMenu(false);
      }
      if (itemMenuRef.current && !itemMenuRef.current.contains(event.target as Node)) {
        setActiveItemMenu(null);
      }
      if (digitalTwinConnectionMenuRef.current && !digitalTwinConnectionMenuRef.current.contains(event.target as Node)) {
        setDigitalTwinConnectionMenu(null);
        setProcedureSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle column resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn === 'name') {
        const delta = e.clientX - resizeStartX;
        const newWidth = Math.max(100, resizeStartWidth + delta);
        setNameColumnWidth(newWidth);
      } else if (resizingColumn) {
        const delta = e.clientX - resizeStartX;
        const newWidth = Math.max(60, resizeStartWidth + delta);
        setColumns(prev => prev.map(col => 
          col.id === resizingColumn ? { ...col, width: newWidth } : col
        ));
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const toggleFolder = (itemId: string) => {
    const toggleItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };
    const newItems = toggleItem(items);
    setItems(newItems);
    updateKnowledgeBaseItems(newItems);
  };

  const addColumn = (columnId: string) => {
    const columnToAdd = ALL_AVAILABLE_COLUMNS.find(col => col.id === columnId);
    if (columnToAdd && !columns.find(col => col.id === columnId)) {
      setColumns([...columns, { ...columnToAdd, visible: true }]);
    }
    setShowAddColumnMenu(false);
  };

  const removeColumn = (columnId: string) => {
    // Don't allow removing non-removable columns
    const columnToRemove = columns.find(col => col.id === columnId);
    if (columnToRemove && !columnToRemove.removable) {
      return;
    }
    setColumns(columns.filter(col => col.id !== columnId));
  };

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const dragColumn = columns[dragIndex];
    const newColumns = [...columns];
    newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, dragColumn);
    setColumns(newColumns);
  };

  // Helper function to flatten nested items structure
  const flattenItems = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
    const result: KnowledgeBaseItem[] = [];
    const flatten = (items: KnowledgeBaseItem[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    flatten(items);
    return result;
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Helper function to get connected procedures from local items state
  const getConnectedProcedures = (digitalTwinId: string): KnowledgeBaseItem[] => {
    const allItems = flattenItems(items);
    return allItems.filter(i => 
      i.type === 'procedure' && 
      i.connectedDigitalTwinIds && 
      i.connectedDigitalTwinIds.includes(digitalTwinId)
    );
  };

  // Track last clicked item for shift-click selection
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const toggleItemSelection = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const allItemsFlat = flattenItems(items);
    const currentIndex = allItemsFlat.findIndex(item => item.id === itemId);
    
    if (event.shiftKey && lastClickedIndex !== null && currentIndex !== -1) {
      // Shift-click: select range
      const start = Math.min(lastClickedIndex, currentIndex);
      const end = Math.max(lastClickedIndex, currentIndex);
      const newSelected = new Set(selectedItems);
      
      for (let i = start; i <= end; i++) {
        newSelected.add(allItemsFlat[i].id);
      }
      
      setSelectedItems(newSelected);
    } else {
      // Regular click: toggle single item
      const newSelected = new Set(selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      setSelectedItems(newSelected);
      setLastClickedIndex(currentIndex);
    }
  };

  const selectAll = () => {
    const allItemIds = flattenItems(items).map(item => item.id);
    setSelectedItems(new Set(allItemIds));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  // Improved drag and drop with nesting support
  const moveItem = (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    // Determine which items to move
    const idsToMove = selectedItems.has(dragId) && selectedItems.size > 1
      ? Array.from(selectedItems)
      : [dragId];

    // Don't allow moving if target is one of the selected items
    if (idsToMove.includes(targetId)) return;

    const findAndRemoveItems = (items: KnowledgeBaseItem[], idsToRemove: string[]): { items: KnowledgeBaseItem[]; draggedItems: KnowledgeBaseItem[] } => {
      const draggedItems: KnowledgeBaseItem[] = [];
      
      const removeRecursive = (itemList: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        const result: KnowledgeBaseItem[] = [];
        
        for (const item of itemList) {
          if (idsToRemove.includes(item.id)) {
            draggedItems.push(item);
          } else {
            if (item.children && item.children.length > 0) {
              const newChildren = removeRecursive(item.children);
              result.push({ ...item, children: newChildren });
            } else {
              result.push(item);
            }
          }
        }
        
        return result;
      };
      
      return { items: removeRecursive(items), draggedItems };
    };

    const insertItems = (items: KnowledgeBaseItem[], targetId: string, draggedItems: KnowledgeBaseItem[], position: 'before' | 'after' | 'inside'): KnowledgeBaseItem[] => {
      const newItems: KnowledgeBaseItem[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.id === targetId) {
          if (position === 'before') {
            draggedItems.forEach(draggedItem => {
              newItems.push({ ...draggedItem, parentId: item.parentId });
            });
            newItems.push(item);
          } else if (position === 'after') {
            newItems.push(item);
            draggedItems.forEach(draggedItem => {
              newItems.push({ ...draggedItem, parentId: item.parentId });
            });
          } else if (position === 'inside' && item.type === 'folder') {
            const newChildren = [...(item.children || [])];
            draggedItems.forEach(draggedItem => {
              newChildren.push({ ...draggedItem, parentId: item.id });
            });
            newItems.push({
              ...item,
              children: newChildren,
              isExpanded: true
            });
          } else {
            newItems.push(item);
          }
        } else {
          if (item.children) {
            newItems.push({
              ...item,
              children: insertItems(item.children, targetId, draggedItems, position)
            });
          } else {
            newItems.push(item);
          }
        }
      }
      
      return newItems;
    };

    const { items: itemsWithoutDragged, draggedItems } = findAndRemoveItems(items, idsToMove);
    if (draggedItems.length === 0) return;

    const newItems = insertItems(itemsWithoutDragged, targetId, draggedItems, position);
    setItems(newItems);
    updateKnowledgeBaseItems(newItems);
  };

  const deleteItem = (itemId: string) => {
    const allItemsFlat = flattenItems(items);
    const item = allItemsFlat.find(i => i.id === itemId);
    const itemsCopy = [...items];
    
    deleteKnowledgeBaseItem(itemId);
    setActiveItemMenu(null);
    
    if (item) {
      showToast(
        `Deleted "${item.name}"`,
        {
          label: 'Undo',
          onClick: () => {
            updateKnowledgeBaseItems(itemsCopy);
          }
        }
      );
    }
  };

  const deleteSelectedItems = () => {
    const itemsCopy = [...items];
    const count = selectedItems.size;
    
    selectedItems.forEach(id => deleteKnowledgeBaseItem(id));
    setSelectedItems(new Set());
    
    showToast(
      `Deleted ${count} item${count > 1 ? 's' : ''}`,
      {
        label: 'Undo',
        onClick: () => {
          updateKnowledgeBaseItems(itemsCopy);
        }
      }
    );
  };

  // Thumbnail URLs for different item types
  const getThumbnailForType = (type: ItemType) => {
    const thumbnails = {
      'procedure': [
        'https://images.unsplash.com/photo-1583737097428-af53774819a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwYXNzZW1ibHklMjBsaW5lJTIwcHJvY2VkdXJlfGVufDF8fHx8MTc3MDcxMzY1MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1675602487652-3a4d8cdada94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwZXF1aXBtZW50JTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA3MTM2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'media': [
        'https://images.unsplash.com/photo-1758691736067-b309ee3ef7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobmljYWwlMjBkb2N1bWVudGF0aW9uJTIwdHJhaW5pbmclMjB2aWRlb3xlbnwxfHx8fDE3NzA3MTM2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1675602487652-3a4d8cdada94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwZXF1aXBtZW50JTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA3MTM2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'digital-twin': [
        'https://images.unsplash.com/photo-1768323102303-62da2858bd5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwcm9ib3QlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MDcxMzY1MXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1675602487652-3a4d8cdada94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwZXF1aXBtZW50JTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA3MTM2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    };
    
    const urls = thumbnails[type] || [];
    return urls[Math.floor(Math.random() * urls.length)];
  };

  const createProcedure = () => {
    const newProcedure: KnowledgeBaseItem = {
      id: `procedure-${Date.now()}`,
      name: 'Untitled Procedure',
      type: 'procedure',
      createdBy: 'Yanay Nadel',
      createdDate: new Date().toISOString().split('T')[0],
      lastEditedBy: 'Yanay Nadel',
      lastEdited: new Date().toISOString().split('T')[0],
      isPublished: false,
      hasUnpublishedChanges: false,
      description: '',
      connectedDigitalTwinIds: [],
      thumbnail: getThumbnailForType('procedure'),
    };
    
    addKnowledgeBaseItem(newProcedure);
    setShowCreateMenu(false);
    setNewlyCreatedProcedureId(newProcedure.id);
    
    // Open the procedure modal with edit mode for title
    setTimeout(() => {
      setOpenProcedure(newProcedure);
    }, 100);
  };

  const createMediaItem = () => {
    setShowCreateMenu(false);
    setIsMediaLibraryOpen(true);
  };

  const createFolder = () => {
    const newFolder: KnowledgeBaseItem = {
      id: `folder-${Date.now()}`,
      name: 'New Folder',
      type: 'folder',
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastEditedBy: 'Current User',
      lastEdited: new Date().toISOString().split('T')[0],
      children: [],
      isExpanded: false,
      parentId: currentFolderId, // Add folder to current folder if inside one
    };
    
    // If we're inside a folder, add to that folder's children
    if (currentFolderId) {
      const updatedItems = addItemToFolder(items, currentFolderId, newFolder);
      setItems(updatedItems);
      updateKnowledgeBaseItems(updatedItems);
    } else {
      // Otherwise add to root
      const newItems = [...items, newFolder];
      setItems(newItems);
      updateKnowledgeBaseItems(newItems);
    }
    
    setEditingItemId(newFolder.id);
    setShowCreateMenu(false);
  };

  // Helper function to add item to a specific folder
  const addItemToFolder = (items: KnowledgeBaseItem[], folderId: string, newItem: KnowledgeBaseItem): KnowledgeBaseItem[] => {
    return items.map(item => {
      if (item.id === folderId && item.type === 'folder') {
        return {
          ...item,
          children: [...(item.children || []), newItem],
          isExpanded: true, // Expand folder to show new item
        };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: addItemToFolder(item.children, folderId, newItem),
        };
      }
      return item;
    });
  };

  const finishEditingItem = () => {
    if (editingItemId && editingItemName.trim()) {
      const updateItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        return items.map(item => {
          if (item.id === editingItemId) {
            return { ...item, name: editingItemName.trim() };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      const newItems = updateItem(items);
      setItems(newItems);
      updateKnowledgeBaseItems(newItems);
    }
    setEditingItemId(null);
    setEditingItemName('');
  };

  const duplicateItem = (itemId: string) => {
    const findItem = (items: KnowledgeBaseItem[], id: string): KnowledgeBaseItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const getNextDuplicateName = (baseName: string, allItems: KnowledgeBaseItem[]): string => {
      const flatItems = flattenItems(allItems);
      const existingNames = flatItems.map(i => i.name);
      
      // Check if name already has a number suffix
      const match = baseName.match(/^(.*?)\s*\((\d+)\)$/);
      const nameWithoutNumber = match ? match[1] : baseName;
      
      let counter = 1;
      let newName = `${nameWithoutNumber} (${counter})`;
      
      while (existingNames.includes(newName)) {
        counter++;
        newName = `${nameWithoutNumber} (${counter})`;
      }
      
      return newName;
    };

    const originalItem = findItem(items, itemId);
    if (!originalItem) return;

    const duplicatedItem: KnowledgeBaseItem = {
      ...originalItem,
      id: `${originalItem.type}-${Date.now()}`,
      name: getNextDuplicateName(originalItem.name, items),
      children: originalItem.children ? JSON.parse(JSON.stringify(originalItem.children)) : undefined,
    };

    const newItems = [...items, duplicatedItem];
    setItems(newItems);
    updateKnowledgeBaseItems(newItems);
    setActiveItemMenu(null);
  };

  const duplicateSelectedItems = () => {
    selectedItems.forEach(id => duplicateItem(id));
    setSelectedItems(new Set());
  };

  const getItemIcon = (item: KnowledgeBaseItem) => {
    switch (item.type) {
      case 'folder':
        return <Folder size={18} />;
      case 'digital-twin':
        return <Box size={18} />;
      case 'procedure':
        return <FileText size={18} />;
      case 'media':
        if (item.mediaType === 'video') return <Video size={18} />;
        if (item.mediaType === 'image') return <ImageIcon size={18} />;
        return <File size={18} />;
      default:
        return <File size={18} />;
    }
  };

  const getItemTypeColor = (item: KnowledgeBaseItem) => {
    switch (item.type) {
      case 'folder':
        return 'text-primary bg-primary/10';
      case 'digital-twin':
        return 'text-[#8404b3] bg-[#8404b3]/10';
      case 'procedure':
        return 'text-accent bg-accent/10';
      case 'media':
        if (item.mediaType === 'video') return 'text-destructive bg-destructive/10';
        if (item.mediaType === 'image') return 'text-[#ff9500] bg-[#ff9500]/10';
        return 'text-muted bg-muted/10';
      default:
        return 'text-muted bg-muted/10';
    }
  };

  const getItemTypeLabel = (item: KnowledgeBaseItem) => {
    switch (item.type) {
      case 'folder':
        return 'Folder';
      case 'digital-twin':
        return 'Digital Twin';
      case 'procedure':
        return 'Procedure';
      case 'media':
        if (item.mediaType === 'video') return 'Video';
        if (item.mediaType === 'image') return 'Image';
        return 'Document';
      default:
        return 'Unknown';
    }
  };

  const toggleFavorite = (item: KnowledgeBaseItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!currentProject) return;

    const itemIsFavorited = isFavorite(item.id);
    
    if (itemIsFavorited) {
      removeFavorite(item.id);
      showToast(`Removed "${item.name}" from favorites`);
    } else {
      // Map item type to favorite type
      let favoriteType: 'article' | 'video' | 'document' = 'document';
      if (item.type === 'procedure') {
        favoriteType = 'article';
      } else if (item.type === 'media' && item.mediaType === 'video') {
        favoriteType = 'video';
      }

      addFavorite({
        id: item.id,
        name: item.name,
        icon: item.type,
        projectId: currentProject.id,
        type: favoriteType,
        data: item,
      });
      showToast(`Added "${item.name}" to favorites`);
    }
  };

  const getFilterLabel = (filterValue: string) => {
    switch (filterValue) {
      case 'digital-twin':
        return 'Digital Twins';
      case 'procedure':
        return 'Procedures';
      case 'media':
        return 'Media';
      case 'folder':
        return 'Folders';
      default:
        return filterValue;
    }
  };

  // Generate user initials from name
  const getUserInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color for user based on name
  const getUserColor = (name: string): string => {
    const colors = [
      '#aa74b5', // purple
      '#4a9eff', // blue
      '#ff6b6b', // red
      '#51cf66', // green
      '#ffa94d', // orange
      '#7950f2', // violet
      '#20c997', // teal
      '#ff6b9d', // pink
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getColumnValue = (item: KnowledgeBaseItem, columnId: string): any => {
    switch (columnId) {
      case 'name':
        return item.name;
      case 'type':
        return getItemTypeLabel(item);
      case 'connectedDigitalTwin':
        const twins = item.connectedDigitalTwinIds 
          ? item.connectedDigitalTwinIds.map(id => getDigitalTwinById(id)).filter(Boolean)
          : [];
        return twins.length > 0 ? twins.map(t => t!.name).join(', ') : '';
      case 'createdBy':
        return item.createdBy;
      case 'createdDate':
        return item.createdDate;
      case 'lastEditedBy':
        return item.lastEditedBy;
      case 'lastEdited':
        return item.lastEdited;
      case 'size':
        return '0 KB';
      case 'version':
        return item.publishedVersion || '-';
      default:
        return '';
    }
  };

  const DraggableColumnHeader = ({ column, index }: { column: ColumnConfig; index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const [{ isDragging }, drag] = useDrag({
      type: COLUMN_TYPE,
      item: { id: column.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver }, drop] = useDrop({
      accept: COLUMN_TYPE,
      hover: (draggedItem: { id: string; index: number }) => {
        if (draggedItem.index !== index) {
          moveColumn(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drag(drop(ref));

    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(column.id);
      setResizeStartX(e.clientX);
      setResizeStartWidth(column.width);
    };

    return (
      <div
        ref={ref}
        className={`group/header px-2 shrink-0 relative transition-colors ${
          isDragging ? 'opacity-50' : ''
        } ${
          isOver ? 'bg-primary/5' : ''
        } ${
          isHovered ? 'bg-secondary/50' : ''
        }`}
        style={{ width: `${column.width}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between h-full">
          {column.sortable ? (
            <button
              onClick={() => handleSort(column.id)}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors flex-1 min-w-0"
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            >
              <span className="truncate">{column.label}</span>
              {sortColumn === column.id ? (
                sortDirection === 'asc' ? (
                  <ChevronUp size={12} className="text-primary shrink-0" />
                ) : (
                  <ChevronDown size={12} className="text-primary shrink-0" />
                )
              ) : (
                <ChevronsUpDown size={12} className="opacity-0 group-hover/header:opacity-50 shrink-0" />
              )}
            </button>
          ) : (
            <span className="text-xs text-muted truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {column.label}
            </span>
          )}

          {/* Remove button */}
          {column.removable && (
            <button
              onClick={() => removeColumn(column.id)}
              className="ml-1 p-0.5 opacity-0 group-hover/header:opacity-100 hover:bg-destructive/10 rounded transition-all shrink-0"
            >
              <X size={12} className="text-destructive" />
            </button>
          )}
        </div>

        {/* Resize handle */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary transition-colors ${
            isHovered ? 'bg-border' : ''
          } ${
            resizingColumn === column.id ? 'bg-primary' : ''
          }`}
          onMouseDown={handleResizeStart}
        />
      </div>
    );
  };

  const DraggableItem = ({ item, level }: { item: KnowledgeBaseItem; level: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);
    
    const [{ isDragging }, drag, preview] = useDrag({
      type: ITEM_TYPE,
      item: { id: item.id, type: ITEM_TYPE } as DragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    // Track drag state changes
    useEffect(() => {
      if (isDragging) {
        setDraggedItemId(item.id);
      } else {
        setDraggedItemId(null);
      }
    }, [isDragging, item.id]);

    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      hover: (draggedItem: DragItem, monitor) => {
        if (draggedItem.id === item.id) return;

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        if (!hoverBoundingRect) return;

        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Determine drop position
        if (item.type === 'folder' && hoverClientY > hoverMiddleY * 0.5 && hoverClientY < hoverMiddleY * 1.5) {
          setDropTargetId(item.id);
          setDropPosition('inside');
        } else if (hoverClientY < hoverMiddleY) {
          setDropTargetId(item.id);
          setDropPosition('before');
        } else {
          setDropTargetId(item.id);
          setDropPosition('after');
        }
      },
      drop: (draggedItem: DragItem) => {
        if (dropTargetId && dropPosition) {
          moveItem(draggedItem.id, dropTargetId, dropPosition);
        }
        setDropTargetId(null);
        setDropPosition(null);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });

    drag(dragHandleRef);
    preview(drop(ref));

    const hasChildren = item.children && item.children.length > 0;
    const isMenuOpen = activeItemMenu === item.id;
    const isSelected = selectedItems.has(item.id);
    const isDropTarget = dropTargetId === item.id;
    const isInDragGroup = draggedItemId && selectedItems.has(draggedItemId) && selectedItems.has(item.id) && selectedItems.size > 1;
    const shouldShowDragging = isDragging || isInDragGroup;

    const handleRowClick = () => {
      if (item.type === 'procedure') {
        setOpenProcedure(item);
      } else if (item.type === 'digital-twin') {
        setOpenDigitalTwin(item);
      }
    };
    
    return (
      <div ref={ref}>
        {/* Drop indicator - BEFORE */}
        {isDropTarget && dropPosition === 'before' && (
          <div className="h-0.5 bg-primary mx-2 rounded-full" />
        )}

        <div 
          onClick={handleRowClick}
          className={`group flex items-center h-12 border-b border-border transition-colors ${
            shouldShowDragging ? 'opacity-50' : ''
          } ${
            isDropTarget && dropPosition === 'inside' ? 'bg-primary/20 border-primary' : ''
          } ${
            isSelected ? 'bg-primary/5' : 'hover:bg-secondary/50'
          } ${
            item.type === 'procedure' ? 'cursor-pointer' : ''
          }`}
        >
          {/* Drag Handle - DARK */}
          <div 
            ref={dragHandleRef}
            className="w-6 flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={16} className="text-foreground" />
          </div>

          {/* Checkbox - SQUARE */}
          <div className="w-8 flex items-center justify-center">
            <button
              onClick={(e) => toggleItemSelection(item.id, e)}
              className={`w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center ${
                isSelected 
                  ? 'bg-primary border-primary' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {isSelected && <Check size={14} className="text-primary-foreground" />}
            </button>
          </div>

          {/* Icon & Name - ONLY THIS PART IS INDENTED */}
          <div 
            className="flex items-center gap-3 px-2 shrink-0 relative group/name" 
            style={{ 
              width: `${nameColumnWidth}px`,
              paddingLeft: `${level * 24 + 8}px`
            }}
          >
            {/* Expand/Collapse Button */}
            <div className="w-4 flex items-center justify-center shrink-0">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.id);
                  }}
                  className="p-0.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                >
                  {item.isExpanded ? (
                    <ChevronDown size={16} className="text-muted" />
                  ) : (
                    <ChevronRight size={16} className="text-muted" />
                  )}
                </button>
              )}
            </div>

            <div className={`p-1.5 rounded-[var(--radius)] ${getItemTypeColor(item)} shrink-0 relative`}>
              {getItemIcon(item)}
              {/* Multi-select badge */}
              {isDragging && selectedItems.has(item.id) && selectedItems.size > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {selectedItems.size}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editingItemId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingItemName}
                  onChange={(e) => setEditingItemName(e.target.value)}
                  onBlur={finishEditingItem}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditingItem();
                    } else if (e.key === 'Escape') {
                      setEditingItemId(null);
                      setEditingItemName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-7 px-2 bg-card border-2 border-primary rounded-[var(--radius)] text-sm text-foreground focus:outline-none"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                />
              ) : (
                <p className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {item.name}
                </p>
              )}
            </div>
          </div>

          {/* Dynamic Columns - NOT INDENTED */}
          {columns.map((column) => {
            const connectedTwins = item.connectedDigitalTwinIds 
              ? item.connectedDigitalTwinIds.map(id => getDigitalTwinById(id)).filter(Boolean)
              : [];
            
            return (
              <div key={column.id} className="px-2 shrink-0" style={{ width: `${column.width}px` }}>
                {column.id === 'type' ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs truncate ${getItemTypeColor(item)}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {getItemTypeLabel(item)}
                  </span>
                ) : column.id === 'connectedDigitalTwin' ? (
                  <button
                    onClick={(e) => {
                      if (!canEdit) return; // Prevent non-editing roles from opening connection picker
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      
                      if (item.type === 'procedure') {
                        // Open procedure connection picker
                        setConnectionPickerPosition({
                          top: rect.bottom + 4,
                          left: rect.left,
                        });
                        setConnectionPickerItem(item);
                      } else if (item.type === 'digital-twin') {
                        // Open digital twin connection menu
                        // Use the digitalTwinId field if available, otherwise fall back to item.id
                        const dtId = item.digitalTwinId || item.id;
                        setDigitalTwinConnectionMenu({
                          digitalTwinId: dtId,
                          position: {
                            top: rect.bottom + 4,
                            left: rect.left,
                          }
                        });
                      }
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 ${canEdit ? 'hover:bg-secondary cursor-pointer' : 'cursor-default'} rounded-full w-full max-w-full transition-colors overflow-hidden`}
                    title={
                      item.type === 'procedure' && connectedTwins.length > 0
                        ? connectedTwins.map(t => t!.name).join(', ')
                        : item.type === 'digital-twin'
                        ? (() => {
                            const dtId = item.digitalTwinId || item.id;
                            const connectedProcedures = getConnectedProcedures(dtId);
                            const count = connectedProcedures.length;
                            return count > 0 ? `${count} ${count === 1 ? 'procedure' : 'procedures'}` : 'No procedures';
                          })()
                        : undefined
                    }
                  >
                    {item.type === 'procedure' ? (
                      connectedTwins.length > 0 ? (
                        <>
                          <LinkIcon size={10} className="text-accent shrink-0" />
                          <span className="text-xs text-accent truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {connectedTwins.length === 1 
                              ? connectedTwins[0]!.name 
                              : `${connectedTwins.length} digital twins`}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted">Connect...</span>
                      )
                    ) : item.type === 'digital-twin' ? (
                      (() => {
                        const dtId = item.digitalTwinId || item.id;
                        const connectedProcedures = getConnectedProcedures(dtId);
                        const count = connectedProcedures.length;
                        return (
                          <>
                            <LinkIcon size={10} className={`${count > 0 ? 'text-accent' : 'text-muted'} shrink-0`} />
                            <span className={`text-xs truncate ${count > 0 ? 'text-accent' : 'text-muted'}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
                              {count > 0 ? `${count} ${count === 1 ? 'procedure' : 'procedures'}` : 'No procedures'}
                            </span>
                          </>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </button>
                ) : column.id === 'createdBy' || column.id === 'lastEditedBy' ? (
                  (() => {
                    const userName = getColumnValue(item, column.id);
                    const initials = getUserInitials(userName);
                    const color = getUserColor(userName);
                    return (
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white cursor-default"
                        style={{ 
                          backgroundColor: color,
                          fontWeight: 'var(--font-weight-bold)'
                        }}
                        title={userName}
                      >
                        {initials}
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-xs text-muted truncate block">
                    {column.id === 'createdDate' || column.id === 'lastEdited' 
                      ? formatDate(getColumnValue(item, column.id))
                      : getColumnValue(item, column.id)
                    }
                  </span>
                )}
              </div>
            );
          })}

          {/* Actions */}
          <div className="w-10 px-4 flex items-center justify-center shrink-0 relative">
            {canEdit && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItemMenu(isMenuOpen ? null : item.id);
                }}
                className={`p-1.5 rounded-[var(--radius)] transition-all ${
                  isMenuOpen 
                    ? 'opacity-100 bg-secondary' 
                    : 'opacity-0 group-hover:opacity-100 hover:bg-secondary'
                }`}
              >
                <MoreHorizontal size={16} className="text-muted" />
              </button>
            )}

            {/* Actions Menu */}
            {isMenuOpen && (
              <div 
                ref={itemMenuRef}
                className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-[var(--radius)] shadow-lg z-20"
                style={{ boxShadow: 'var(--elevation-sm)' }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'procedure') {
                      setOpenProcedure(item);
                    } else if (item.type === 'digital-twin') {
                      setOpenDigitalTwin(item);
                    }
                    setActiveItemMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink size={16} className="text-muted" />
                  <span>Open</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItemId(item.id);
                    setEditingItemName(item.name);
                    setActiveItemMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Edit size={16} className="text-muted" />
                  <span>Rename</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateItem(item.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Copy size={16} className="text-muted" />
                  <span>Duplicate</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  <Download size={16} className="text-muted" />
                  <span>Download</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item, e);
                    setActiveItemMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Star size={16} className={isFavorite(item.id) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'} />
                  <span>{isFavorite(item.id) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
                <div className="border-t border-border my-1" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drop indicator - AFTER */}
        {isDropTarget && dropPosition === 'after' && (
          <div className="h-0.5 bg-primary mx-2 rounded-full" />
        )}

        {/* Render children if expanded */}
        {hasChildren && item.isExpanded && item.children?.map((child) => (
          <DraggableItem key={child.id} item={child} level={level + 1} />
        ))}
      </div>
    );
  };

  const renderGridItem = (item: KnowledgeBaseItem) => {
    const isMenuOpen = activeItemMenu === item.id;
    const isSelected = selectedItems.has(item.id);

    const handleCardClick = () => {
      if (item.type === 'folder') {
        setCurrentFolderId(item.id);
      } else if (item.type === 'procedure') {
        setOpenProcedure(item);
      } else if (item.type === 'digital-twin') {
        setOpenDigitalTwin(item);
      }
    };

    return (
      <div 
        key={item.id}
        onClick={handleCardClick}
        className={`group bg-card border rounded-[var(--radius)] transition-all overflow-hidden cursor-pointer ${
          isSelected 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-border hover:border-primary/50 hover:shadow-md'
        }`}
        style={{ boxShadow: 'var(--elevation-sm)' }}
      >
        {/* Thumbnail/Icon Area - 16:9 Aspect Ratio */}
        <div className="relative w-full bg-secondary/30 overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0">
            {item.thumbnail ? (
              <>
                <img 
                  src={item.thumbnail} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getItemTypeColor(item)} bg-opacity-10`}>
                <div className={`p-5 rounded-[var(--radius)] ${getItemTypeColor(item)} transition-transform duration-300 group-hover:scale-110`}>
                  {getItemIcon(item)}
                </div>
              </div>
            )}
          
            {/* Checkbox - SQUARE */}
            <button
            onClick={(e) => toggleItemSelection(item.id, e)}
            className={`absolute top-3 left-3 w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center backdrop-blur-sm ${
              isSelected 
                ? 'bg-primary border-primary' 
                : 'border-white/80 bg-black/20 hover:bg-black/40 hover:border-white opacity-0 group-hover:opacity-100'
            }`}
          >
            {isSelected && <Check size={14} className="text-primary-foreground" />}
          </button>

          {/* Type badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs backdrop-blur-sm ${getItemTypeColor(item)} border border-white/20`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {getItemTypeLabel(item)}
            </span>
          </div>

          {/* Menu Button */}
          <div className="absolute top-3 right-3" ref={isMenuOpen ? itemMenuRef : null}>
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItemMenu(isMenuOpen ? null : item.id);
                }}
                className={`p-1.5 rounded-[var(--radius)] transition-all backdrop-blur-sm ${
                  isMenuOpen 
                    ? 'opacity-100 bg-black/40' 
                    : 'opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-black/40'
                }`}
              >
                <MoreHorizontal size={16} className="text-white" />
              </button>
            )}

            {/* Actions Menu */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-[var(--radius)] shadow-lg z-50"
                style={{ boxShadow: 'var(--elevation-lg)' }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'folder') {
                      setCurrentFolderId(item.id);
                    } else if (item.type === 'procedure') {
                      setOpenProcedure(item);
                    } else if (item.type === 'digital-twin') {
                      setOpenDigitalTwin(item);
                    }
                    setActiveItemMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink size={16} className="text-muted" />
                  <span>Open</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateItem(item.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Copy size={16} className="text-muted" />
                  <span>Duplicate</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item, e);
                    setActiveItemMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Star size={16} className={isFavorite(item.id) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'} />
                  <span>{isFavorite(item.id) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
                <div className="border-t border-border my-1" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Get breadcrumb path for current folder
  const getFolderPath = (folderId: string | null): KnowledgeBaseItem[] => {
    if (!folderId) return [];
    
    const path: KnowledgeBaseItem[] = [];
    const allItems = flattenItems(items);
    let currentId: string | null = folderId;
    
    while (currentId) {
      const folder = allItems.find(item => item.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }
    
    return path;
  };

  const sortItems = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
    if (!sortColumn || !sortDirection) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = getColumnValue(a, sortColumn);
      const bValue = getColumnValue(b, sortColumn);

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const filteredItems = () => {
    let itemsToFilter: KnowledgeBaseItem[];
    
    // In grid view with folder navigation
    if (viewMode === 'grid' && !searchQuery && selectedFilter === 'all') {
      // Show items in current folder
      if (currentFolderId === null) {
        // Root level - show items without parentId
        itemsToFilter = flattenItems(items).filter(item => !item.parentId);
      } else {
        // Inside a folder - show items with matching parentId
        itemsToFilter = flattenItems(items).filter(item => item.parentId === currentFolderId);
      }
    } else {
      // For list view or when searching/filtering, use old behavior
      itemsToFilter = viewMode === 'grid' ? flattenItems(items) : items;
    }
    
    if (selectedFilter !== 'all') {
      itemsToFilter = flattenItems(itemsToFilter).filter(item => item.type === selectedFilter);
    }
    
    if (searchQuery) {
      itemsToFilter = flattenItems(itemsToFilter).filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (viewMode === 'grid' || selectedFilter !== 'all' || searchQuery) {
      itemsToFilter = sortItems(itemsToFilter);
    } else if (sortColumn && sortDirection) {
      const sortRecursive = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        const sorted = sortItems(items);
        return sorted.map(item => ({
          ...item,
          children: item.children ? sortRecursive(item.children) : undefined
        }));
      };
      itemsToFilter = sortRecursive(itemsToFilter);
    }
    
    return itemsToFilter;
  };

  // Calculate stats
  const allItemsFlat = flattenItems(items);
  const stats = {
    digitalTwins: allItemsFlat.filter(i => i.type === 'digital-twin').length,
    procedures: allItemsFlat.filter(i => i.type === 'procedure').length,
    media: allItemsFlat.filter(i => i.type === 'media').length,
    folders: allItemsFlat.filter(i => i.type === 'folder').length,
    total: allItemsFlat.length,
  };

  const availableColumnsToAdd = ALL_AVAILABLE_COLUMNS.filter(
    col => !columns.find(c => c.id === col.id)
  );

  return (
    <div className={`flex flex-col h-full bg-background relative ${isShiftPressed ? 'select-none' : ''}`}>
      {/* Header - Hidden when canvas is open */}
      {!canvasProcedure && (
        <div className="shrink-0 border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Search & Active Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-secondary border border-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-background rounded transition-colors"
                >
                  <X size={14} className="text-muted" />
                </button>
              )}
            </div>

            {/* Active Filter Label */}
            {selectedFilter !== 'all' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-xs text-primary" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {getFilterLabel(selectedFilter)}
                </span>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                >
                  <X size={12} className="text-primary" />
                </button>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 h-10 px-3 rounded-[var(--radius)] border transition-colors ${
                  selectedFilter !== 'all' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-card border-border text-foreground hover:bg-secondary'
                }`}
              >
                <Filter size={16} />
                <span className="text-sm">Filter</span>
              </button>

              {showFilterMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-[var(--radius)] shadow-lg z-10 overflow-hidden"
                  style={{ boxShadow: 'var(--elevation-sm)' }}
                >
                  {[
                    { value: 'all', label: 'All Items', icon: null },
                    { value: 'digital-twin', label: 'Digital Twins', icon: Box },
                    { value: 'procedure', label: 'Procedures', icon: FileText },
                    { value: 'media', label: 'Media', icon: Video },
                    { value: 'folder', label: 'Folders', icon: Folder },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setSelectedFilter(filter.value as any);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          selectedFilter === filter.value
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {Icon && <Icon size={16} className={selectedFilter === filter.value ? 'text-primary' : 'text-muted'} />}
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-[var(--radius)] p-1">
              <button
                onClick={() => {
                  setViewMode('list');
                  setCurrentFolderId(null);
                }}
                className={`p-2 rounded-[var(--radius)] transition-all ${
                  viewMode === 'list' 
                    ? 'bg-card text-primary shadow-sm' 
                    : 'text-muted hover:text-foreground'
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => {
                  setViewMode('grid');
                  setCurrentFolderId(null);
                }}
                className={`p-2 rounded-[var(--radius)] transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-card text-primary shadow-sm' 
                    : 'text-muted hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid3x3 size={16} />
              </button>
            </div>

            {canEdit && (
              <>
                <div className="w-px h-6 bg-border" />

                {/* Import Button */}
                <button className="flex items-center gap-2 h-10 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-secondary transition-colors">
                  <Upload size={16} />
                  <span className="text-sm">Import</span>
                </button>

                {/* Create Button with Dropdown */}
                <div className="relative" ref={createMenuRef}>
              <button 
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 h-10 px-4 rounded-[var(--radius)] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Create</span>
              </button>

              {showCreateMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-[var(--radius)] shadow-lg z-50 overflow-hidden"
                  style={{ boxShadow: 'var(--elevation-sm)' }}
                >
                  <div className="p-2">
                    <p className="text-xs text-muted px-2 py-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Create new item
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowDigitalTwinModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="p-1.5 rounded bg-[#8404b3]/10 shrink-0">
                      <Box size={16} className="text-[#8404b3]" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Digital Twin</p>
                      <p className="text-xs text-muted truncate">Create and edit digital twins</p>
                    </div>
                  </button>
                  <button 
                    onClick={createProcedure}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="p-1.5 rounded bg-accent/10 shrink-0">
                      <FileText size={16} className="text-accent" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Procedure</p>
                      <p className="text-xs text-muted truncate">Connect a sequence of events to build a procedure</p>
                    </div>
                  </button>
                  <button 
                    onClick={createMediaItem}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="p-1.5 rounded bg-destructive/10 shrink-0">
                      <Video size={16} className="text-destructive" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Media</p>
                      <p className="text-xs text-muted truncate">Upload images, videos, or documents</p>
                    </div>
                  </button>
                  <div className="border-t border-border my-1" />
                  <button 
                    onClick={createFolder}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <div className="p-1.5 rounded bg-primary/10 shrink-0">
                      <Folder size={16} className="text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Folder</p>
                      <p className="text-xs text-muted truncate">Organize items in a folder</p>
                    </div>
                  </button>
                </div>
              )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column Headers (List View Only) */}
        {viewMode === 'list' && (
          <div className="flex items-center h-10 px-4 border-t border-border bg-secondary/30">
            <div className="w-6" /> {/* Drag handle space */}
            <div className="w-8 flex items-center justify-center">
              <button
                onClick={selectedItems.size === allItemsFlat.length ? deselectAll : selectAll}
                className={`w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center ${
                  selectedItems.size > 0
                    ? 'bg-primary border-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {selectedItems.size > 0 && <Check size={14} className="text-primary-foreground" />}
              </button>
            </div>
            
            {/* Name Column Header with Resize */}
            <div 
              className="px-2 shrink-0 relative group/name-header"
              style={{ width: `${nameColumnWidth}px` }}
            >
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                style={{ fontWeight: 'var(--font-weight-bold)' }}
              >
                <span>Name</span>
                {sortColumn === 'name' ? (
                  sortDirection === 'asc' ? (
                    <ChevronUp size={12} className="text-primary shrink-0" />
                  ) : (
                    <ChevronDown size={12} className="text-primary shrink-0" />
                  )
                ) : (
                  <ChevronsUpDown size={12} className="opacity-0 group-hover/name-header:opacity-50 shrink-0" />
                )}
              </button>
              
              {/* Resize handle for name column */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary transition-colors ${
                  resizingColumn === 'name' ? 'bg-primary' : 'opacity-0 group-hover/name-header:opacity-100 group-hover/name-header:bg-border'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setResizingColumn('name');
                  setResizeStartX(e.clientX);
                  setResizeStartWidth(nameColumnWidth);
                }}
              />
            </div>

            {columns.map((column, index) => (
              <DraggableColumnHeader key={column.id} column={column} index={index} />
            ))}
            <div className="w-10 flex items-center justify-center">
              {/* Add Column Button */}
              {canEdit && availableColumnsToAdd.length > 0 && (
                <div className="relative" ref={addColumnMenuRef}>
                  <button
                    onClick={() => setShowAddColumnMenu(!showAddColumnMenu)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    title="Add column"
                  >
                    <Plus size={14} className="text-muted" />
                  </button>

                  {showAddColumnMenu && (
                    <div 
                      className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-[var(--radius)] shadow-lg z-10 overflow-hidden"
                      style={{ boxShadow: 'var(--elevation-sm)' }}
                    >
                      <div className="p-2 border-b border-border">
                        <p className="text-xs text-muted px-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          Add column
                        </p>
                      </div>
                      {availableColumnsToAdd.map((column) => (
                        <button
                          key={column.id}
                          onClick={() => addColumn(column.id)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {column.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-auto custom-scrollbar">
        {viewMode === 'list' ? (
          <div className="bg-card">
            {filteredItems().map((item) => (
              <DraggableItem key={item.id} item={item} level={0} />
            ))}
          </div>
        ) : (
          <div className="p-6">
            {/* Breadcrumbs for folder navigation */}
            {currentFolderId && (
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <Folder size={16} />
                  <span>All Items</span>
                </button>
                {getFolderPath(currentFolderId).map((folder, index, array) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-muted" />
                    <button
                      onClick={() => setCurrentFolderId(folder.id)}
                      className={`text-sm transition-colors ${
                        index === array.length - 1
                          ? 'text-foreground'
                          : 'text-muted hover:text-foreground'
                      }`}
                      style={index === array.length - 1 ? { fontWeight: 'var(--font-weight-bold)' } : {}}
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems().map(item => renderGridItem(item))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems().length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="p-6 bg-secondary/50 rounded-full mb-4">
              <Search size={40} className="text-muted" />
            </div>
            <h3 className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              No items found
            </h3>
            <p className="text-sm text-muted mb-6 text-center max-w-md">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter to find what you\'re looking for' 
                : 'Get started by creating your first digital twin, procedure, or media file'}
            </p>
            {!searchQuery && selectedFilter === 'all' && (
              <button 
                onClick={() => setShowCreateMenu(true)}
                className="flex items-center gap-2 h-10 px-6 rounded-[var(--radius)] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Create Your First Item</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Multi-Selection Bottom Overlay */}
      {selectedItems.size > 0 && !canvasProcedure && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-[var(--radius)] px-6 py-4 flex items-center gap-6"
          style={{ boxShadow: 'var(--elevation-sm)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check size={16} className="text-primary" />
              </div>
              <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={deselectAll}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-secondary transition-colors">
              <Download size={16} />
              <span className="text-sm">Download</span>
            </button>
            <button 
              onClick={duplicateSelectedItems}
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-secondary transition-colors"
            >
              <Copy size={16} />
              <span className="text-sm">Duplicate</span>
            </button>
            <button 
              onClick={deleteSelectedItems}
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={16} />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Procedure Modal */}
      {openProcedure && (
        <ProcedureModal
          procedure={{
            ...openProcedure,
            isPublished: openProcedure.isPublished ?? false,
            hasUnpublishedChanges: openProcedure.hasUnpublishedChanges ?? false,
            publishedVersion: openProcedure.publishedVersion || '1.5',
            publishedDate: openProcedure.publishedDate || '12/02/2022',
          }}
          startEditingTitle={openProcedure.id === newlyCreatedProcedureId}
          onOpenCanvas={() => {
            setCanvasProcedure(openProcedure);
            setOpenProcedure(null);
          }}
          onClose={() => {
            setOpenProcedure(null);
            setNewlyCreatedProcedureId(null);
          }}
          onSave={(updatedProcedure) => {
            const updateItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
              return items.map(item => {
                if (item.id === updatedProcedure.id) {
                  return updatedProcedure;
                }
                if (item.children) {
                  return { ...item, children: updateItem(item.children) };
                }
                return item;
              });
            };
            const newItems = updateItem(items);
            setItems(newItems);
            updateKnowledgeBaseItems(newItems);
            // Update the open procedure state to reflect new changes
            setOpenProcedure(updatedProcedure);
          }}
        />
      )}

      {/* Digital Twin Modal */}
      {openDigitalTwin && (
        <ProcedureModal
          mode="digital-twin"
          procedure={{
            ...openDigitalTwin,
            isPublished: openDigitalTwin.isPublished ?? false,
            hasUnpublishedChanges: openDigitalTwin.hasUnpublishedChanges ?? false,
            publishedVersion: openDigitalTwin.publishedVersion || '1.0',
            publishedDate: openDigitalTwin.publishedDate || '01/15/2025',
          }}
          onClose={() => setOpenDigitalTwin(null)}
          onSave={(updated) => {
            const updateItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
              return items.map(item => {
                if (item.id === updated.id) return updated;
                if (item.children) return { ...item, children: updateItem(item.children) };
                return item;
              });
            };
            const newItems = updateItem(items);
            setItems(newItems);
            updateKnowledgeBaseItems(newItems);
            setOpenDigitalTwin(updated);
          }}
        />
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        selectionMode={true}
        onSelectItem={(mediaItem) => {
          // Create a new knowledge base item from the selected media
          const newMediaKBItem: KnowledgeBaseItem = {
            id: `media-kb-${Date.now()}`,
            name: mediaItem.name,
            type: 'media',
            mediaType: mediaItem.type as MediaType,
            createdBy: 'Yanay Nadel',
            createdDate: new Date().toISOString().split('T')[0],
            lastEditedBy: 'Yanay Nadel',
            lastEdited: new Date().toISOString().split('T')[0],
            thumbnail: mediaItem.thumbnail,
          };
          
          addKnowledgeBaseItem(newMediaKBItem);
          setIsMediaLibraryOpen(false);
        }}
      />

      {/* Connection Picker */}
      {connectionPickerItem && (
        <ConnectionPicker
          item={connectionPickerItem}
          onClose={() => setConnectionPickerItem(null)}
          position={connectionPickerPosition}
        />
      )}

      {/* Digital Twin Connection Menu */}
      {digitalTwinConnectionMenu && (() => {
        const allProcedures = (() => {
          const collectProcedures = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
            let procedures: KnowledgeBaseItem[] = [];
            items.forEach(item => {
              if (item.type === 'procedure') {
                procedures.push(item);
              }
              if (item.children) {
                procedures = procedures.concat(collectProcedures(item.children));
              }
            });
            return procedures;
          };
          return collectProcedures(items);
        })();

        const filteredProcedures = procedureSearchQuery 
          ? allProcedures.filter(p => 
              p.name.toLowerCase().includes(procedureSearchQuery.toLowerCase())
            )
          : allProcedures;

        const handleToggleProcedure = (procedureId: string, isChecked: boolean) => {
          const updateItems = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
            return items.map(item => {
              if (item.id === procedureId) {
                const currentConnections = item.connectedDigitalTwinIds || [];
                const newConnections = isChecked
                  ? [...currentConnections, digitalTwinConnectionMenu.digitalTwinId]
                  : currentConnections.filter(id => id !== digitalTwinConnectionMenu.digitalTwinId);
                
                return {
                  ...item,
                  connectedDigitalTwinIds: newConnections.length > 0 ? newConnections : undefined,
                };
              }
              if (item.children) {
                return { ...item, children: updateItems(item.children) };
              }
              return item;
            });
          };
          const newItems = updateItems(items);
          setItems(newItems);
          updateKnowledgeBaseItems(newItems);
        };

        return (
          <div
            ref={digitalTwinConnectionMenuRef}
            className="fixed bg-card border border-border rounded-[var(--radius)] shadow-lg z-50 w-80"
            style={{
              top: `${digitalTwinConnectionMenu.position.top}px`,
              left: `${digitalTwinConnectionMenu.position.left}px`,
              boxShadow: 'var(--elevation-sm)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Connected Procedures
              </p>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search procedures..."
                  value={procedureSearchQuery}
                  onChange={(e) => setProcedureSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 bg-secondary border border-border rounded-[var(--radius)] text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Procedure List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredProcedures.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted">
                  {procedureSearchQuery ? 'No procedures found' : 'No procedures available'}
                </div>
              ) : (
                filteredProcedures.map(procedure => {
                  const isChecked = (procedure.connectedDigitalTwinIds || []).includes(digitalTwinConnectionMenu.digitalTwinId);
                  return (
                    <label
                      key={procedure.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleProcedure(procedure.id, e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                          {procedure.name}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Procedure Canvas - Renders in place of main content */}
      {canvasProcedure && (
        <div className="absolute inset-0 z-40">
          <ProcedureCanvas
            procedureId={canvasProcedure.id}
            procedureName={canvasProcedure.name}
            onClose={() => setCanvasProcedure(null)}
          />
        </div>
      )}

      {/* Digital Twin Creation Modal */}
      {showDigitalTwinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-card border border-border rounded-[var(--radius)] w-full max-w-md"
            style={{ boxShadow: 'var(--elevation-lg)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-foreground" style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-family)'
              }}>
                Create Digital Twin
              </h2>
              <button
                onClick={() => setShowDigitalTwinModal(false)}
                className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
              >
                <X size={18} className="text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Graphic */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-[#8404b3]/10 flex items-center justify-center">
                  <Box size={64} className="text-[#8404b3]" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <h3 className="text-foreground mb-2" style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)'
                }}>
                  Digital Twins are Created in the App
                </h3>
                <p className="text-muted" style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family)'
                }}>
                  To create and configure digital twins, you'll need to use our desktop or mobile application. This ensures all 3D models and configurations are properly synced.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDigitalTwinModal(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-[var(--radius)] transition-colors"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDigitalTwinModal(false);
                    showToast('Opening app...', 'info');
                  }}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-[var(--radius)] transition-colors"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Open App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
