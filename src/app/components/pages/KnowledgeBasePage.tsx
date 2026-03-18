import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useAppPopup } from '../../contexts/AppPopupContext';
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
  Star,
  Play,
  Maximize2,
  Minimize2,
  Database
} from 'lucide-react';
import { ProcedureModal } from '../modals/ProcedureModal';
import { ConnectionPicker } from '../modals/ConnectionPicker';
import { MediaLibraryModal } from '../modals/MediaLibraryModal';
import { ProcedureCanvas } from './ProcedureCanvas';
import { useProject, KnowledgeBaseItem, ItemType, MediaType } from '../../contexts/ProjectContext';
import { getUrlParam, setUrlParam } from '../../utils/urlParams';
import { useToast } from '../../contexts/ToastContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { MemberAvatar } from '../MemberAvatar';

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
  { id: 'lastEditedBy', label: 'Edited by', visible: true, width: 110, sortable: true, removable: true },
  { id: 'lastEdited', label: 'Edited', visible: true, width: 110, sortable: true, removable: true },
  { id: 'size', label: 'Size', visible: false, width: 90, sortable: true, removable: true },
  { id: 'version', label: 'Version', visible: false, width: 100, sortable: true, removable: true },
];

// Columns visible to operators (non-content creators)
const OPERATOR_COLUMNS: ColumnConfig[] = [
  { id: 'type', label: 'Type', visible: true, width: 130, sortable: true, removable: false },
  { id: 'connectedDigitalTwin', label: 'Connection', visible: true, width: 200, sortable: true, removable: false },
];

function KnowledgeBaseGridSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header skeleton */}
      <div className="shrink-0 border-b border-border/60 bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 bg-muted/15 rounded-lg w-72 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-muted/15 rounded-lg animate-pulse" style={{ animationDelay: '50ms' }} />
            <div className="h-10 w-20 bg-muted/15 rounded-lg animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="h-10 w-28 bg-muted/15 rounded-lg animate-pulse" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-xl overflow-hidden animate-pulse"
              style={{ animationDelay: `${200 + i * 75}ms`, animationFillMode: 'backwards' }}
            >
              <div className="h-32 bg-gradient-to-br from-muted/15 to-muted/5" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-4 bg-muted/20 rounded-lg w-3/4" />
                <div className="h-3 bg-muted/15 rounded-lg w-1/2" />
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-5 h-5 bg-muted/10 rounded-full" />
                  <div className="h-3 bg-muted/10 rounded-lg w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseEmptyState({ onCreateClick, canCreate }: { onCreateClick: () => void; canCreate?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="p-6 bg-secondary/50 rounded-full mb-4">
        <Database size={40} className="text-muted" />
      </div>
      <h3 className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        {canCreate ? 'No items in knowledge base' : 'No items in knowledge base yet'}
      </h3>
      <p className="text-sm text-muted mb-6 text-center max-w-md">
        {canCreate ? 'Get started by creating your first digital twin, flow, or media file' : 'Items will appear here once they are created'}
      </p>
      {canCreate && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Create Your First Item</span>
        </button>
      )}
    </div>
  );
}

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
  const { confirm } = useAppPopup();
  const { currentRole } = useRole();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Check if user has edit permissions
  const canEdit = hasAccess(currentRole, 'projects-edit');
  const canCreate = hasAccess(currentRole, 'create-content');
  const canDelete = hasAccess(currentRole, 'delete-content');
  const canPublish = hasAccess(currentRole, 'publish-content');
  const canViewUnpublished = hasAccess(currentRole, 'view-unpublished');

  // URL param helpers for shareable modal state
  const setCanvasParam = (id: string | null) => setUrlParam('canvas', id);

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
  const [nameColumnWidth, setNameColumnWidth] = useState(320);
  const [openProcedure, setOpenProcedure] = useState<KnowledgeBaseItem | null>(null);
  const [openDigitalTwin, setOpenDigitalTwin] = useState<KnowledgeBaseItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<KnowledgeBaseItem | null>(null);
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
  const [dtImportFiles, setDtImportFiles] = useState<File[]>([]);
  const [mediaFullscreen, setMediaFullscreen] = useState(false);
  const dtFileInputRef = useRef<HTMLInputElement>(null);
  
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const addColumnMenuRef = useRef<HTMLDivElement>(null);
  const addColumnButtonRef = useRef<HTMLButtonElement>(null);
  const [addColumnMenuPos, setAddColumnMenuPos] = useState<{ top: number; right: number } | null>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);
  const [itemMenuPos, setItemMenuPos] = useState<{ top: number; right: number } | null>(null);
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

  // Wrappers that keep URL params in sync with modal state
  const openProcedureModal = (item: KnowledgeBaseItem | null) => {
    setOpenProcedure(item);
    setUrlParam('open', item?.id ?? null);
  };
  const openDigitalTwinModal = (item: KnowledgeBaseItem | null) => {
    setOpenDigitalTwin(item);
    setUrlParam('twin', item?.id ?? null);
  };
  const openMediaPreview = (item: KnowledgeBaseItem | null) => {
    setPreviewMedia(item);
    setUrlParam('media', item?.id ?? null);
  };
  const openMediaLibrary = (open: boolean) => {
    setIsMediaLibraryOpen(open);
    setUrlParam('medialib', open ? '1' : null);
  };
  const openCanvas = (item: KnowledgeBaseItem | null) => {
    setCanvasProcedure(item);
    setCanvasParam(item?.id ?? null);
  };

  // Sync with context
  useEffect(() => {
    setItems(knowledgeBaseItems);
  }, [knowledgeBaseItems]);

  // Helper: find a knowledge-base item by id (recursive)
  const findItemById = (list: KnowledgeBaseItem[], id: string): KnowledgeBaseItem | undefined => {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Auto-open modals from URL params on mount
  useEffect(() => {
    const placeholder = (id: string, type: ItemType, name: string): KnowledgeBaseItem => ({
      id, name, type, createdBy: '', createdDate: '', lastEditedBy: '', lastEdited: '',
    });

    // ?canvas=<id>
    const canvasId = getUrlParam('canvas');
    if (canvasId && !canvasProcedure) {
      const item = findItemById(knowledgeBaseItems, canvasId);
      setCanvasProcedure(item || placeholder(canvasId, 'procedure', 'Flow'));
    }

    // ?open=<id>  (procedure modal)
    const openId = getUrlParam('open');
    if (openId && !openProcedure) {
      const item = findItemById(knowledgeBaseItems, openId);
      if (item) setOpenProcedure(item);
      else setOpenProcedure(placeholder(openId, 'procedure', 'Flow'));
    }

    // ?twin=<id>  (digital twin modal)
    const twinId = getUrlParam('twin');
    if (twinId && !openDigitalTwin) {
      const item = findItemById(knowledgeBaseItems, twinId);
      if (item) setOpenDigitalTwin(item);
      else setOpenDigitalTwin(placeholder(twinId, 'digital-twin', 'Digital Twin'));
    }

    // ?media=<id>  (media preview)
    const mediaId = getUrlParam('media');
    if (mediaId && !previewMedia) {
      const item = findItemById(knowledgeBaseItems, mediaId);
      if (item) setPreviewMedia(item);
    }

    // ?medialib=1  (media library)
    if (getUrlParam('medialib') === '1') {
      setIsMediaLibraryOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus editing input
  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingItemId]);

  // Dismiss media preview on Escape
  useEffect(() => {
    if (!previewMedia) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openMediaPreview(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [previewMedia]);

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
  useClickOutside(filterMenuRef, () => setShowFilterMenu(false));
  useClickOutside(createMenuRef, () => setShowCreateMenu(false));
  useClickOutside(addColumnMenuRef, () => { setShowAddColumnMenu(false); setAddColumnMenuPos(null); });
  useClickOutside(itemMenuRef, () => { setActiveItemMenu(null); setItemMenuPos(null); });
  useClickOutside(digitalTwinConnectionMenuRef, () => {
    setDigitalTwinConnectionMenu(null);
    setProcedureSearchQuery('');
  });

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
    setSelectedItems(new Set());
  };

  // Move item(s) to root or into a specific folder (used by breadcrumb drop)
  const moveItemToFolder = (dragId: string, targetFolderId: string | null) => {
    const idsToMove = selectedItems.has(dragId) && selectedItems.size > 1
      ? Array.from(selectedItems)
      : [dragId];

    // Remove dragged items from tree
    const draggedItems: KnowledgeBaseItem[] = [];
    const removeRecursive = (itemList: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
      const result: KnowledgeBaseItem[] = [];
      for (const item of itemList) {
        if (idsToMove.includes(item.id)) {
          draggedItems.push(item);
        } else {
          if (item.children && item.children.length > 0) {
            result.push({ ...item, children: removeRecursive(item.children) });
          } else {
            result.push(item);
          }
        }
      }
      return result;
    };
    let newItems = removeRecursive(items);
    if (draggedItems.length === 0) return;

    // Clear parentId for root, or set to target folder
    const movedItems = draggedItems.map(i => ({ ...i, parentId: targetFolderId || undefined }));

    if (!targetFolderId) {
      // Move to root
      newItems = [...newItems, ...movedItems];
    } else {
      // Insert into target folder's children
      const insertIntoFolder = (list: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        return list.map(item => {
          if (item.id === targetFolderId && item.type === 'folder') {
            return { ...item, children: [...(item.children || []), ...movedItems], isExpanded: true };
          }
          if (item.children) {
            return { ...item, children: insertIntoFolder(item.children) };
          }
          return item;
        });
      };
      newItems = insertIntoFolder(newItems);
    }

    setItems(newItems);
    updateKnowledgeBaseItems(newItems);
    setSelectedItems(new Set());
  };

  const deleteItem = (itemId: string) => {
    const allItemsFlat = flattenItems(items);
    const item = allItemsFlat.find(i => i.id === itemId);
    const itemsCopy = [...items];
    
    deleteKnowledgeBaseItem(itemId);
    setActiveItemMenu(null);
    setItemMenuPos(null);
    
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

  const deleteSelectedItems = async () => {
    if (selectedItems.size > 3) {
      const ok = await confirm(`Delete ${selectedItems.size} items? This can be undone.`, { title: 'Delete Items', variant: 'warning', destructive: true });
      if (!ok) return;
    }
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
      name: 'Untitled Flow',
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
      openProcedureModal(newProcedure);
    }, 100);
  };

  const createMediaItem = () => {
    setShowCreateMenu(false);
    openMediaLibrary(true);
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
    setEditingItemName(newFolder.name);
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
    const name = editInputRef.current?.value?.trim() || editingItemName.trim();
    if (editingItemId && name) {
      const updateItem = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        return items.map(item => {
          if (item.id === editingItemId) {
            return { ...item, name };
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
    setItemMenuPos(null);
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
        return 'text-[#8B5CF6] bg-[#8B5CF6]/10';
      case 'procedure':
        return 'text-[#2F80ED] bg-[#2F80ED]/10';
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
        return 'Flow';
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
        return 'Flows';
      case 'media':
        return 'Media';
      case 'folder':
        return 'Folders';
      default:
        return filterValue;
    }
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
                <ChevronsUpDown size={12} className="md:opacity-0 md:group-hover/header:opacity-50 shrink-0" />
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
              className="ml-1 p-0.5 md:opacity-0 md:group-hover/header:opacity-100 hover:bg-destructive/10 rounded transition-all shrink-0"
            >
              <X size={12} className="text-destructive" />
            </button>
          )}
        </div>

        {/* Resize handle */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary transition-colors ${
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
      canDrag: () => canEdit,
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
        openProcedureModal(item);
      } else if (item.type === 'digital-twin') {
        openDigitalTwinModal(item);
      } else if (item.type === 'media') {
        openMediaPreview(item);
      } else if (item.type === 'folder') {
        toggleFolder(item.id);
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
          className={`group flex items-center h-12 border-b border-border transition-all ${
            shouldShowDragging ? 'opacity-50' : ''
          } ${
            isDropTarget && dropPosition === 'inside' ? 'bg-primary/20 border-primary' : ''
          } ${
            isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-[#D9E0F0]/40 border-l-2 border-l-transparent hover:border-l-primary/50'
          } cursor-pointer`}
        >
          {/* Drag Handle - DARK */}
          <div 
            ref={dragHandleRef}
            className="w-6 flex items-center justify-center cursor-move md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
                  className="p-0.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  {item.isExpanded ? (
                    <ChevronDown size={16} className="text-muted" />
                  ) : (
                    <ChevronRight size={16} className="text-muted" />
                  )}
                </button>
              )}
            </div>

            <div className={`p-1.5 rounded-lg ${getItemTypeColor(item)} shrink-0 relative`}>
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
                  defaultValue={editingItemName}
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
                  className="w-full h-7 px-2 bg-card border-2 border-primary rounded-lg text-sm text-foreground outline-none"
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
                          <span className="text-xs text-[#2F80ED] truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
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
                            <span className={`text-xs truncate ${count > 0 ? 'text-[#2F80ED]' : 'text-muted'}`} style={{ fontWeight: 'var(--font-weight-bold)' }}>
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
                  <MemberAvatar name={getColumnValue(item, column.id)} size="sm" showTooltip />
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
          <div className="w-10 px-4 flex items-center justify-center shrink-0">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMenuOpen) {
                    setActiveItemMenu(null);
                    setItemMenuPos(null);
                  } else {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setItemMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                    setActiveItemMenu(item.id);
                  }
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  isMenuOpen
                    ? 'opacity-100 bg-secondary'
                    : 'md:opacity-0 md:group-hover:opacity-100 hover:bg-secondary'
                }`}
              >
                <MoreHorizontal size={16} className="text-muted" />
              </button>
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

  const DroppableBreadcrumb = ({ folderId, label, icon, onClick, onDrop, isCurrent }: {
    folderId: string | null;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    onDrop: (dragId: string) => void;
    isCurrent: boolean;
  }) => {
    const ref = useRef<HTMLButtonElement>(null);

    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (draggedItem: DragItem) => {
        onDrop(draggedItem.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drop(ref);

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors ${
          isOver
            ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
            : isCurrent
              ? 'text-foreground'
              : 'text-muted hover:text-foreground'
        }`}
        style={isCurrent && !isOver ? { fontWeight: 'var(--font-weight-bold)' } : {}}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  const DraggableGridItem = ({ item }: { item: KnowledgeBaseItem }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isMenuOpen = activeItemMenu === item.id;
    const isSelected = selectedItems.has(item.id);
    const isEditing = editingItemId === item.id;

    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { id: item.id, type: ITEM_TYPE } as DragItem,
      canDrag: () => canEdit,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (draggedItem: DragItem) => {
        if (draggedItem.id === item.id) return;
        if (item.type === 'folder') {
          moveItem(draggedItem.id, item.id, 'inside');
        } else {
          moveItem(draggedItem.id, item.id, 'after');
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });

    drag(drop(ref));

    const handleCardClick = () => {
      if (isEditing) return;
      if (item.type === 'folder') {
        setCurrentFolderId(item.id);
      } else if (item.type === 'procedure') {
        openProcedureModal(item);
      } else if (item.type === 'digital-twin') {
        openDigitalTwinModal(item);
      } else if (item.type === 'media') {
        openMediaPreview(item);
      }
    };

    return (
      <div
        ref={ref}
        key={item.id}
        onClick={handleCardClick}
        className={`group relative bg-card border rounded-lg transition-all cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        } ${
          isOver ? 'ring-2 ring-primary border-primary' : ''
        } ${
          isSelected
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50 hover:shadow-md'
        }`}
        style={{ boxShadow: 'var(--elevation-sm)' }}
      >
        {/* Thumbnail/Icon Area - 16:9 Aspect Ratio */}
        <div className="relative w-full bg-secondary/30 overflow-hidden rounded-t-[var(--radius)]" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0">
            {item.thumbnail ? (
              <>
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
                {/* Play button overlay for video items */}
                {item.type === 'media' && item.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 transition-transform duration-300 group-hover:scale-110">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getItemTypeColor(item)} bg-opacity-10`}>
                <div className={`p-5 rounded-lg ${getItemTypeColor(item)} transition-transform duration-300 group-hover:scale-110`}>
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
                : 'border-white/80 bg-black/20 hover:bg-black/40 hover:border-white md:opacity-0 md:group-hover:opacity-100'
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
          </div>
        </div>

        {/* Menu Button - outside thumbnail to avoid clipping */}
        <div className="absolute top-3 right-3 z-10">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isMenuOpen) {
                  setActiveItemMenu(null);
                  setItemMenuPos(null);
                } else {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setItemMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                  setActiveItemMenu(item.id);
                }
              }}
              className={`p-1.5 rounded-lg transition-all backdrop-blur-sm ${
                isMenuOpen
                  ? 'opacity-100 bg-black/40'
                  : 'md:opacity-0 md:group-hover:opacity-100 bg-black/20 hover:bg-black/40'
              }`}
            >
              <MoreHorizontal size={16} className="text-white" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              defaultValue={editingItemName}
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
              className="w-full h-7 px-2 bg-card border-2 border-primary rounded-lg text-sm text-foreground outline-none"
              style={{ fontWeight: 'var(--font-weight-bold)' }}
            />
          ) : (
            <h3 className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {item.name}
            </h3>
          )}
          {item.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <MemberAvatar name={item.lastEditedBy || item.createdBy || ""} size="xs" showTooltip />
            <span className="text-xs text-muted truncate">
              Edited {formatDate(item.lastEdited || item.createdDate || "")}
            </span>
          </div>
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

  // Default type priority: folders first, then digital twins, then procedures, then media
  const TYPE_PRIORITY: Record<string, number> = { 'folder': 0, 'digital-twin': 1, 'procedure': 2, 'media': 3 };
  const sortByTypePriority = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
    return [...items].sort((a, b) => (TYPE_PRIORITY[a.type] ?? 9) - (TYPE_PRIORITY[b.type] ?? 9));
  };

  const sortItems = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
    if (!sortColumn || !sortDirection) return sortByTypePriority(items);

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

    // Filter out unpublished items for users without view-unpublished permission
    const filterUnpublished = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
      if (canViewUnpublished) return items;
      return items.filter(item => item.isPublished !== false).map(item => ({
        ...item,
        children: item.children ? filterUnpublished(item.children) : undefined,
      }));
    };

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
    } else {
      // List view: apply sort recursively through tree (uses type priority as default)
      const sortRecursive = (items: KnowledgeBaseItem[]): KnowledgeBaseItem[] => {
        const sorted = sortItems(items);
        return sorted.map(item => ({
          ...item,
          children: item.children ? sortRecursive(item.children) : undefined
        }));
      };
      itemsToFilter = sortRecursive(itemsToFilter);
    }

    // Hide unpublished items for users without permission
    itemsToFilter = filterUnpublished(itemsToFilter);

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

  if (isLoading) {
    return <KnowledgeBaseGridSkeleton />;
  }

  return (
    <div className={`flex flex-col h-full bg-background relative ${isShiftPressed ? 'select-none' : ''}`}>
      {/* Header - Hidden when canvas is open */}
      {!canvasProcedure && (
        <div className="shrink-0 border-b border-border bg-card">
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 py-4">
          {/* Left side - Search & Active Filters */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
            <div className="relative max-w-xs flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`relative flex items-center gap-2 h-10 px-3 rounded-lg border transition-colors ${
                  selectedFilter !== 'all'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border text-foreground hover:bg-secondary'
                }`}
              >
                <Filter size={16} />
                <span className="text-sm">Filter</span>
                {selectedFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                )}
              </button>

              {showFilterMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
                  style={{ boxShadow: 'var(--elevation-sm)' }}
                >
                  {[
                    { value: 'all', label: 'All Items', icon: null },
                    { value: 'digital-twin', label: 'Digital Twins', icon: Box },
                    { value: 'procedure', label: 'Flows', icon: FileText },
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
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode('list');
                  setCurrentFolderId(null);
                }}
                className={`p-2 rounded-lg transition-all ${
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
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-card text-primary shadow-sm' 
                    : 'text-muted hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid3x3 size={16} />
              </button>
            </div>

            {canCreate && (
              <>
                <div className="w-px h-6 bg-border" />

                {/* Import Button */}
                <button className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                  <Upload size={16} />
                  <span className="text-sm">Import</span>
                </button>

                {/* Create Button with Dropdown */}
                <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Create</span>
              </button>

              {showCreateMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-32px)] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
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
                    <div className="p-1.5 rounded bg-[#2F80ED]/10 shrink-0">
                      <Box size={16} className="text-[#2F80ED]" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Digital Twin</p>
                      <p className="text-xs text-muted">Create and edit digital twins</p>
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
                      <p style={{ fontWeight: 'var(--font-weight-bold)' }}>Flow</p>
                      <p className="text-xs text-muted">Connect a sequence of events to build a flow</p>
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
                      <p className="text-xs text-muted">Upload images, videos, or documents</p>
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
                      <p className="text-xs text-muted">Organize items in a folder</p>
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
          <div className="flex items-center h-10 border-t border-border bg-secondary/30 overflow-x-auto">
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
            
            {/* Name Column Header with Resize — left padding matches row icon+expand offset */}
            <div
              className="shrink-0 relative group/name-header"
              style={{ width: `${nameColumnWidth}px`, paddingLeft: '76px', paddingRight: '8px' }}
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
                  <ChevronsUpDown size={12} className="md:opacity-0 md:group-hover/name-header:opacity-50 shrink-0" />
                )}
              </button>
              
              {/* Resize handle for name column */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary transition-colors ${
                  resizingColumn === 'name' ? 'bg-primary' : 'md:opacity-0 md:group-hover/name-header:opacity-100 md:group-hover/name-header:bg-border'
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
                <button
                  ref={addColumnButtonRef}
                  onClick={() => {
                    if (showAddColumnMenu) {
                      setShowAddColumnMenu(false);
                      setAddColumnMenuPos(null);
                    } else {
                      const rect = addColumnButtonRef.current?.getBoundingClientRect();
                      if (rect) {
                        setAddColumnMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                      }
                      setShowAddColumnMenu(true);
                    }
                  }}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors group/addcol"
                  title="Customize columns"
                >
                  <Plus size={14} className="text-muted group-hover/addcol:text-foreground transition-colors" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-auto custom-scrollbar">
        {viewMode === 'list' ? (
          <div className="bg-card overflow-x-auto">
            {filteredItems().map((item) => (
              <DraggableItem key={item.id} item={item} level={0} />
            ))}

          </div>
        ) : (
          <div className="p-6">
            {/* Breadcrumbs for folder navigation — each segment is a drop target */}
            {currentFolderId && (
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                <DroppableBreadcrumb
                  folderId={null}
                  label="All Items"
                  icon={<Folder size={16} />}
                  onClick={() => setCurrentFolderId(null)}
                  onDrop={(dragId) => moveItemToFolder(dragId, null)}
                  isCurrent={false}
                />
                {getFolderPath(currentFolderId).map((folder, index, array) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-muted" />
                    <DroppableBreadcrumb
                      folderId={folder.id}
                      label={folder.name}
                      onClick={() => setCurrentFolderId(folder.id)}
                      onDrop={(dragId) => moveItemToFolder(dragId, folder.id)}
                      isCurrent={index === array.length - 1}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems().map(item => <DraggableGridItem key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems().length === 0 && (
          (searchQuery || selectedFilter !== 'all') ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="p-6 bg-secondary/50 rounded-full mb-4">
                <Search size={40} className="text-muted" />
              </div>
              <h3 className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                No items found
              </h3>
              <p className="text-sm text-muted mb-6 text-center max-w-md">
                Try adjusting your search or filter to find what you're looking for
              </p>
            </div>
          ) : currentFolderId ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="p-6 bg-secondary/50 rounded-full mb-4">
                <Folder size={40} className="text-muted" />
              </div>
              <h3 className="text-lg text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                This folder is empty
              </h3>
              <p className="text-sm text-muted mb-6 text-center max-w-md">
                Drag items here or create new ones to organize your content
              </p>
            </div>
          ) : (
            <KnowledgeBaseEmptyState onCreateClick={() => setShowCreateMenu(true)} canCreate={canCreate} />
          )
        )}
      </div>

      {/* Item Count Footer */}
      {!canvasProcedure && filteredItems().length > 0 && (
        <div className="shrink-0 border-t border-border bg-card px-6 py-2 flex items-center justify-between">
          <span className="text-xs text-muted">
            {searchQuery || selectedFilter !== 'all'
              ? `Showing ${filteredItems().length} of ${stats.total} items`
              : `${stats.total} item${stats.total !== 1 ? 's' : ''}`}
            {stats.total > 0 && !searchQuery && selectedFilter === 'all' && (
              <span className="ml-2 text-muted/60">
                {[
                  stats.digitalTwins > 0 && `${stats.digitalTwins} Digital Twin${stats.digitalTwins !== 1 ? 's' : ''}`,
                  stats.procedures > 0 && `${stats.procedures} Flow${stats.procedures !== 1 ? 's' : ''}`,
                  stats.media > 0 && `${stats.media} Media`,
                  stats.folders > 0 && `${stats.folders} Folder${stats.folders !== 1 ? 's' : ''}`,
                ].filter(Boolean).join(' \u00b7 ')}
              </span>
            )}
          </span>
          {sortColumn && sortDirection && (
            <span className="text-xs text-muted/60">
              Sorted by {columns.find(c => c.id === sortColumn)?.label || (sortColumn === 'name' ? 'Name' : sortColumn)} {sortDirection === 'asc' ? '\u2191' : '\u2193'}
            </span>
          )}
        </div>
      )}

      {/* Add Column Dropdown (rendered at root to avoid overflow clipping) */}
      {showAddColumnMenu && addColumnMenuPos && (
        <div
          ref={addColumnMenuRef}
          className="fixed w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          style={{ top: `${addColumnMenuPos.top}px`, right: `${addColumnMenuPos.right}px`, boxShadow: 'var(--elevation-sm)' }}
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

      {/* Item Actions Menu (rendered at root to avoid overflow clipping) */}
      {activeItemMenu && itemMenuPos && (() => {
        const menuItem = findItemById(items, activeItemMenu);
        if (!menuItem) return null;
        return (
          <div
            ref={itemMenuRef}
            className="fixed w-48 bg-card border border-border rounded-lg shadow-lg z-50"
            style={{ top: `${itemMenuPos.top}px`, right: `${itemMenuPos.right}px`, boxShadow: 'var(--elevation-sm)' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (menuItem.type === 'folder') {
                  setCurrentFolderId(menuItem.id);
                } else if (menuItem.type === 'procedure') {
                  openProcedureModal(menuItem);
                } else if (menuItem.type === 'digital-twin') {
                  openDigitalTwinModal(menuItem);
                } else if (menuItem.type === 'media') {
                  openMediaPreview(menuItem);
                }
                setActiveItemMenu(null);
                setItemMenuPos(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <ExternalLink size={16} className="text-muted" />
              <span>Open</span>
            </button>
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingItemId(menuItem.id);
                  setEditingItemName(menuItem.name);
                  setActiveItemMenu(null);
                  setItemMenuPos(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Edit size={16} className="text-muted" />
                <span>Rename</span>
              </button>
            )}
            {hasAccess(currentRole, 'duplicate-content') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateItem(menuItem.id);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Copy size={16} className="text-muted" />
                <span>Duplicate</span>
              </button>
            )}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
              <Download size={16} className="text-muted" />
              <span>Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(menuItem, e);
                setActiveItemMenu(null);
                setItemMenuPos(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Star size={16} className={isFavorite(menuItem.id) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'} />
              <span>{isFavorite(menuItem.id) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>
            {canDelete && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(menuItem.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Multi-Selection Bottom Overlay */}
      {selectedItems.size > 0 && !canvasProcedure && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-6 flex-wrap max-w-[calc(100vw-32px)]"
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
            <span className="text-xs text-muted ml-1">Shift+click for range</span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
              <Download size={16} />
              <span className="text-sm">Download</span>
            </button>
            {hasAccess(currentRole, 'duplicate-content') && (
              <button
                onClick={duplicateSelectedItems}
                className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm">Duplicate</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={deleteSelectedItems}
                className="flex items-center gap-2 h-9 px-4 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={16} />
                <span className="text-sm">Delete</span>
              </button>
            )}
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
            openCanvas(openProcedure);
            openProcedureModal(null);
          }}
          onClose={() => {
            openProcedureModal(null);
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
            openProcedureModal(updatedProcedure);
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
          onClose={() => openDigitalTwinModal(null)}
          onOpenProcedure={(proc) => {
            openDigitalTwinModal(null);
            openProcedureModal(proc);
          }}
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
            openDigitalTwinModal(updated);
          }}
        />
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => openMediaLibrary(false)}
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
          openMediaLibrary(false);
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
            className="fixed bg-card border border-border rounded-lg shadow-lg z-50 w-80 max-w-[calc(100vw-32px)]"
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
                  className="w-full h-8 pl-9 pr-3 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            onClose={() => openCanvas(null)}
          />
        </div>
      )}

      {/* Digital Twin Import Overlay */}
      {showDigitalTwinModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#FFFFFF' }}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Escape') { setShowDigitalTwinModal(false); setDtImportFiles([]); } }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) setDtImportFiles(prev => [...prev, ...files]);
          }}
        >
          {/* Close button */}
          <button onClick={() => { setShowDigitalTwinModal(false); setDtImportFiles([]); }} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Close"><X size={20} className="text-muted" /></button>
          {/* Hidden file input */}
          <input
            ref={dtFileInputRef}
            type="file"
            multiple
            accept=".dwg,.stp,.step,.fbx,.obj,.x_t,.glb,.gltf,.stl,.iges,.igs,.3ds"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) setDtImportFiles(prev => [...prev, ...files]);
              e.target.value = '';
            }}
          />

          {/* Center content */}
          <div className="flex flex-col items-center" style={{ maxWidth: 520 }}>
            {dtImportFiles.length === 0 ? (
              <>
                {/* File type icons - fading at edges */}
                <div className="flex items-center gap-3 mb-8 relative flex-wrap justify-center">
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
                  {['.DWG', '.STP', '.FBX', '.OBJ', '.X_T', '.GLB', '.STL', '.IGES'].map((ext, i) => (
                    <div
                      key={ext}
                      className="flex flex-col items-center justify-center flex-shrink-0"
                      style={{
                        width: 56,
                        height: 64,
                        borderRadius: 8,
                        border: '1.5px solid var(--input)',
                        opacity: i === 0 || i === 7 ? 0.3 : i === 1 || i === 6 ? 0.6 : 1,
                      }}
                    >
                      <File size={20} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginTop: 2 }}>{ext}</span>
                    </div>
                  ))}
                </div>

                {/* Description text */}
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  textAlign: 'center',
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}>
                  We support a wide range of 3D model formats including<br/>
                  STEP, FBX, OBJ, Parasolid, DWG, and more.
                </p>

                {/* Drop your file here */}
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--foreground)',
                  textAlign: 'center',
                }}>
                  Drop your file here or{' '}
                  <button
                    onClick={() => dtFileInputRef.current?.click()}
                    className="font-bold underline cursor-pointer"
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit' }}
                  >
                    browse
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Files added - show pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6" style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
                  {dtImportFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{
                        backgroundColor: 'var(--input)',
                        borderRadius: 25,
                        fontSize: 'var(--text-sm)',
                              color: 'var(--foreground)',
                      }}
                    >
                      <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      <button
                        onClick={() => setDtImportFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="flex items-center justify-center hover:opacity-70"
                        style={{ width: 16, height: 16 }}
                      >
                        <X size={12} style={{ color: 'var(--foreground)' }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add more files link */}
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  textAlign: 'center',
                }}>
                  Drop more files or{' '}
                  <button
                    onClick={() => dtFileInputRef.current?.click()}
                    className="font-bold underline cursor-pointer"
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit' }}
                  >
                    browse
                  </button>
                </p>
              </>
            )}
          </div>

          {/* Bottom buttons */}
          <div className="absolute bottom-8 flex items-center gap-3">
            <button
              onClick={() => {
                setShowDigitalTwinModal(false);
                setDtImportFiles([]);
              }}
              className="px-6 py-2.5 text-sm font-bold text-destructive hover:text-destructive/70 transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (dtImportFiles.length === 0) return;
                const fileName = dtImportFiles[0].name.replace(/\.[^/.]+$/, '');
                const dtId = `dt-${Date.now()}`;
                const kbId = `kb-dt-${Date.now()}`;
                const now = new Date().toISOString();
                const newItem: KnowledgeBaseItem = {
                  id: kbId,
                  name: fileName,
                  type: 'digital-twin',
                  digitalTwinId: dtId,
                  createdBy: 'Me',
                  createdDate: now,
                  lastEditedBy: 'Me',
                  lastEdited: now,
                  description: `Imported from ${dtImportFiles.map(f => f.name).join(', ')}`,
                };
                addKnowledgeBaseItem(newItem);
                setShowDigitalTwinModal(false);
                setDtImportFiles([]);
                openDigitalTwinModal(newItem);
                showToast(`Digital twin "${fileName}" created successfully`, 'success');
              }}
              className={`px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors rounded-lg ${dtImportFiles.length > 0 ? 'bg-primary hover:bg-primary/80 cursor-pointer' : 'bg-muted cursor-default'}`}
            >
              Create
            </button>
          </div>
        </div>
      )}
      {/* Media / Document Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-8"
          onClick={() => openMediaPreview(null)}
        >
          <div
            className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            style={{ boxShadow: 'var(--elevation-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${getItemTypeColor(previewMedia)}`}>
                  {getItemIcon(previewMedia)}
                </div>
                <div>
                  <h3 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
                    {previewMedia.name}
                  </h3>
                  <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    {getItemTypeLabel(previewMedia)} · Last edited {previewMedia.lastEdited}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openMediaPreview(null)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X size={18} className="text-muted" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-secondary/30">
              {previewMedia.mediaType === 'video' ? (
                <div className="w-full max-w-2xl rounded-lg overflow-hidden bg-black relative" style={{ aspectRatio: '16/9' }}>
                  {previewMedia.thumbnail ? (
                    <>
                      <img src={previewMedia.thumbnail} alt={previewMedia.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
                  )}
                  {/* Video player mockup overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                      <Play size={28} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  {/* Video progress bar mockup */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 text-xs">0:00</span>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-white/80 rounded-full" />
                      </div>
                      <span className="text-white/80 text-xs">3:45</span>
                    </div>
                    <p className="text-white/60 text-xs mt-2 truncate">{previewMedia.name}</p>
                  </div>
                </div>
              ) : previewMedia.mediaType === 'image' ? (
                previewMedia.thumbnail ? (
                  <img src={previewMedia.thumbnail} alt={previewMedia.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
                ) : (
                  <div className="w-full max-w-md rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.06)', border: '1px solid rgba(47,128,237,0.1)' }}>
                        <ImageIcon size={24} className="text-primary/35" />
                      </div>
                      <p className="text-sm text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Image preview</p>
                      <p className="text-xs text-muted/50 mt-1">{previewMedia.name}</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full max-w-lg bg-card border border-border rounded-lg overflow-hidden">
                  {previewMedia.thumbnail && (
                    <div className="w-full bg-secondary/30 overflow-hidden" style={{ maxHeight: '280px' }}>
                      <img src={previewMedia.thumbnail} alt={previewMedia.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(47,128,237,0.06)', border: '1px solid rgba(47,128,237,0.1)' }}>
                        <File size={24} className="text-primary/35" />
                      </div>
                      <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>{previewMedia.name}</h4>
                    </div>
                    {previewMedia.description && (
                      <p className="text-muted mb-4" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>{previewMedia.description}</p>
                    )}
                    <div className="flex flex-col gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                      <div className="flex justify-between"><span>Created by</span><span className="text-foreground">{previewMedia.createdBy}</span></div>
                      <div className="flex justify-between"><span>Created</span><span className="text-foreground">{previewMedia.createdDate}</span></div>
                      <div className="flex justify-between"><span>Last edited by</span><span className="text-foreground">{previewMedia.lastEditedBy}</span></div>
                      <div className="flex justify-between"><span>Last edited</span><span className="text-foreground">{previewMedia.lastEdited}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
