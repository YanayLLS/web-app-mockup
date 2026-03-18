import { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Search, 
  Upload, 
  Grid3x3, 
  List, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Box,
  File,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Folder,
  FolderOpen,
  Check,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Plus,
  Filter,
  Move,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from '../../contexts/ToastContext';
import { useRole, hasAccess } from '../../contexts/RoleContext';

type MediaType = 'image' | 'video' | 'document' | 'model' | 'all';
type ViewMode = 'grid' | 'list';

interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  typeName: string; // e.g., "frontlinehololens"
  size: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedDate: string;
  tags?: string[];
  folderId: string | null;
  usedInProcedures: string[]; // Array of procedure names
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  expanded?: boolean;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectionMode?: boolean;
  onSelectItem?: (item: MediaItem) => void;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  onUpload: (files: File[], folderId: string | null) => void;
}

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: string | null;
  onCreateFolder: (name: string, parentId: string | null) => void;
}

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
  itemType: 'file' | 'folder';
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  usedInProcedures: string[];
  onConfirm: () => void;
}

interface ReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: MediaItem;
  usedInProcedures: string[];
  allItems: MediaItem[];
  onReplace: (newItemId: string) => void;
  onUploadNew: (files: File[]) => void;
}

interface ProcedureListModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  procedures: string[];
}

// Generate fake thumbnail for images and videos
const generateThumbnail = (item: MediaItem): string => {
  if (item.thumbnail) return item.thumbnail;
  
  // Generate a consistent color based on item name
  const hash = item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  
  if (item.type === 'image') {
    // Return a gradient placeholder for images
    return `data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad${hash}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:hsl(${hue}, 70%25, 60%25);stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:hsl(${(hue + 60) % 360}, 70%25, 50%25);stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad${hash})'/%3E%3C/svg%3E`;
  } else if (item.type === 'video') {
    // Return a dark gradient with play icon for videos
    return `data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad${hash}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:hsl(${hue}, 50%25, 30%25);stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:hsl(${(hue + 40) % 360}, 50%25, 20%25);stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad${hash})'/%3E%3Ccircle cx='200' cy='150' r='40' fill='rgba(255,255,255,0.2)'/%3E%3Cpolygon points='185,135 185,165 215,150' fill='white'/%3E%3C/svg%3E`;
  }
  
  return '';
};

// Procedure List Modal
function ProcedureListModal({ isOpen, onClose, itemName, procedures }: ProcedureListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div role="dialog" aria-modal="true" aria-labelledby="procedure-list-title" className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="procedure-list-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Used In Flows</h3>
              <p className="text-sm text-muted mt-1">{itemName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {procedures.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Not used in any flows</p>
          ) : (
            <div className="space-y-2">
              {procedures.map((proc, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm text-foreground">{proc}</span>
                  <ExternalLink size={14} className="text-muted" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Folder Modal
function CreateFolderModal({ isOpen, onClose, parentFolderId, onCreateFolder }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), parentFolderId);
      setFolderName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div role="dialog" aria-modal="true" aria-labelledby="create-folder-title" className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 id="create-folder-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Create New Folder</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <label className="block mb-2 text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Folder Name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Enter folder name"
            className="w-full h-10 px-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-primary focus:ring-2 focus:ring-primary/10"
            autoFocus
          />
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}

// Rename Modal
function RenameModal({ isOpen, onClose, currentName, onRename, itemType }: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);

  const handleRename = () => {
    if (newName.trim() && newName !== currentName) {
      onRename(newName.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div role="dialog" aria-modal="true" aria-labelledby="rename-modal-title" className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 id="rename-modal-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Rename {itemType === 'file' ? 'File' : 'Folder'}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <label className="block mb-2 text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            New Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="w-full h-10 px-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-primary focus:ring-2 focus:ring-primary/10"
            autoFocus
          />
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={!newName.trim() || newName === currentName}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, itemName, usedInProcedures, onConfirm }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-item-title" className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-destructive" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 id="delete-item-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Warning: Delete Item</h3>
              <p className="text-sm text-muted">This action cannot be undone</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{itemName}</span>?
          </p>
          
          {usedInProcedures.length > 0 && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                ⚠️ This item is used in {usedInProcedures.length} flow{usedInProcedures.length !== 1 ? 's' : ''}:
              </p>
              <ul className="text-sm text-muted space-y-1">
                {usedInProcedures.map((proc) => (
                  <li key={proc}>• {proc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Replace Modal
function ReplaceModal({ isOpen, onClose, currentItem, usedInProcedures, allItems, onReplace, onUploadNew }: ReplaceModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Filter items of the same type
  const compatibleItems = useMemo(() => {
    return allItems.filter(item => 
      item.id !== currentItem.id && 
      item.type === currentItem.type &&
      (searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );
  }, [allItems, currentItem, searchQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleReplace = () => {
    if (selectedItemId) {
      onReplace(selectedItemId);
      setSelectedItemId('');
      setSearchQuery('');
      setShowUpload(false);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUploadNew(selectedFiles);
      setSelectedItemId('');
      setSearchQuery('');
      setShowUpload(false);
      setSelectedFiles([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div role="dialog" aria-modal="true" aria-labelledby="replace-item-title" className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 id="replace-item-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Replace Item</h3>
              <p className="text-sm text-muted">Choose a new item to replace {currentItem.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {usedInProcedures.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-4">
              <p className="text-sm mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                ℹ️ This item is used in {usedInProcedures.length} flow{usedInProcedures.length !== 1 ? 's' : ''}:
              </p>
              <ul className="text-sm text-muted space-y-1">
                {usedInProcedures.map((proc) => (
                  <li key={proc}>• {proc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Toggle between existing and upload */}
          <div className="flex items-center gap-2 mb-4 border-b border-border">
            <button
              onClick={() => setShowUpload(false)}
              className={`px-4 py-2 text-sm transition-colors relative ${
                !showUpload ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
              style={{ fontWeight: !showUpload ? 'var(--font-weight-bold)' : 'normal' }}
            >
              Choose Existing
              {!showUpload && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className={`px-4 py-2 text-sm transition-colors relative ${
                showUpload ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
              style={{ fontWeight: showUpload ? 'var(--font-weight-bold)' : 'normal' }}
            >
              Upload New
              {showUpload && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {!showUpload ? (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Search for replacement
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search compatible items..."
                    className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                {compatibleItems.length === 0 ? (
                  <div className="text-center py-8 text-muted">
                    <File size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No compatible items found</p>
                  </div>
                ) : (
                  compatibleItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        selectedItemId === item.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedItemId === item.id
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}>
                          {selectedItemId === item.id && <Check size={12} className="text-primary-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p style={{ fontWeight: 'var(--font-weight-bold)' }}>{item.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                            <span>{item.typeName}</span>
                            <span>{item.size}</span>
                            <span>Added {new Date(item.uploadedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="block mb-2 text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Upload new file
              </label>
              <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center transition-colors">
                <Upload size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-sm mb-3">Click to select a file</p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="replace-file-upload"
                  accept={currentItem.type === 'image' ? 'image/*' : currentItem.type === 'video' ? 'video/*' : '*'}
                />
                <label
                  htmlFor="replace-file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Select File
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <File size={16} className="text-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{selectedFiles[0].name}</p>
                      <p className="text-xs text-muted">{formatFileSize(selectedFiles[0].size)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="p-1 hover:bg-card rounded transition-colors"
                      aria-label="Remove selected file"
                    >
                      <X size={16} className="text-muted" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={showUpload ? handleUpload : handleReplace}
            disabled={showUpload ? selectedFiles.length === 0 : !selectedItemId}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Replace Item
          </button>
        </div>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({ isOpen, onClose, currentFolderId, onUpload }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, currentFolderId);
      setSelectedFiles([]);
      onClose();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div role="dialog" aria-modal="true" aria-labelledby="upload-media-title" className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl m-4">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 id="upload-media-title" style={{ fontWeight: 'var(--font-weight-bold)' }}>Upload Media</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload size={48} className="mx-auto mb-4 text-muted" />
            <p className="mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted mb-4">
              Supports images, videos, documents, and 3D models
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Select Files
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <p className="mb-3" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                Selected Files ({selectedFiles.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File size={16} className="text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-card rounded transition-colors shrink-0"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} className="text-muted" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 'var(--font-weight-bold)' }}
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Draggable Media Item Component
interface DraggableMediaItemProps {
  item: MediaItem;
  isSelected: boolean;
  viewMode: ViewMode;
  onToggleSelect: (id: string) => void;
  onOpenOptions: (item: MediaItem, event: React.MouseEvent) => void;
  onShowProcedures: (item: MediaItem) => void;
  onShowDetails: (item: MediaItem) => void;
  getMediaIcon: (type: MediaType, small?: boolean) => JSX.Element;
  getThumbnailColor: (type: MediaType) => string;
}

function DraggableMediaItem({
  item,
  isSelected,
  viewMode,
  onToggleSelect,
  onOpenOptions,
  onShowProcedures,
  onShowDetails,
  getMediaIcon,
  getThumbnailColor,
}: DraggableMediaItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'MEDIA_ITEM',
    item: { id: item.id, type: 'MEDIA_ITEM' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (viewMode === 'grid') {
    return (
      <div
        ref={drag}
        className={`group relative bg-card border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
        } ${isDragging ? 'opacity-50' : ''}`}
      >
        <div 
          onClick={() => onShowDetails(item)}
          className="aspect-[4/3] flex items-center justify-center border-b overflow-hidden"
        >
          {(item.type === 'image' || item.type === 'video') ? (
            <img 
              src={generateThumbnail(item)} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${getThumbnailColor(item.type)}`}>
              {getMediaIcon(item.type)}
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2 z-10">
          <div
            onClick={() => onToggleSelect(item.id)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-card/80 backdrop-blur-sm border-border md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            {isSelected && <Check size={12} className="text-primary-foreground" />}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions(item, e);
          }}
          className="absolute top-2 right-2 z-10 p-1 bg-card/80 backdrop-blur-sm border border-border rounded hover:bg-secondary transition-colors md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Options for ${item.name}`}
        >
          <MoreVertical size={14} className="text-muted" />
        </button>

        <div className="p-3">
          <p className="text-xs text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            {item.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <tr
      ref={drag}
      onClick={() => onToggleSelect(item.id)}
      className={`border-b border-border hover:bg-secondary transition-colors cursor-pointer ${
        isSelected ? 'bg-primary/5' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="px-2 py-3 w-12">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected ? 'bg-primary border-primary' : 'border-border'
          }`}
        >
          {isSelected && <Check size={12} className="text-primary-foreground" />}
        </div>
      </td>
      <td className="px-4 py-3 w-16">
        {(item.type === 'image' || item.type === 'video') ? (
          <img 
            src={generateThumbnail(item)} 
            alt={item.name} 
            className="w-10 h-10 object-cover rounded border border-border" 
          />
        ) : (
          getMediaIcon(item.type, true)
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-foreground">{item.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted">{item.typeName}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted">{item.size}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted">
          {new Date(item.uploadedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted">{item.uploadedBy}</span>
      </td>
      <td className="px-4 py-3">
        {item.usedInProcedures.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowProcedures(item);
            }}
            className="text-sm text-primary hover:underline"
          >
            {item.usedInProcedures.length} Procedure{item.usedInProcedures.length !== 1 ? 's' : ''}
          </button>
        ) : (
          <span className="text-sm text-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions(item, e);
          }}
          className="p-1 hover:bg-secondary rounded transition-colors"
          aria-label={`Options for ${item.name}`}
        >
          <MoreVertical size={14} className="text-muted" />
        </button>
      </td>
    </tr>
  );
}

// Folder Item Component with Drop Target
interface FolderItemComponentProps {
  folder: FolderItem;
  level: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onDropMedia: (folderId: string, mediaId: string) => void;
  hasChildFolders: boolean;
  hasItems: boolean;
  children?: React.ReactNode;
}

function FolderItemComponent({
  folder,
  level,
  isSelected,
  onSelect,
  onToggleExpand,
  onDropMedia,
  hasChildFolders,
  hasItems,
  children,
}: FolderItemComponentProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'MEDIA_ITEM',
    drop: (item: { id: string; type: string }) => {
      onDropMedia(folder.id, item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div>
      <div
        ref={drop}
        onClick={() => onSelect(folder.id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : isOver
            ? 'bg-accent/20'
            : 'hover:bg-secondary'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildFolders ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(folder.id);
            }}
            className="p-0.5 hover:bg-black/10 rounded transition-colors"
          >
            {folder.expanded ? (
              <ChevronDown size={14} className={isSelected ? 'text-primary-foreground' : 'text-muted'} />
            ) : (
              <ChevronRightIcon size={14} className={isSelected ? 'text-primary-foreground' : 'text-muted'} />
            )}
          </button>
        ) : (
          <div className="w-[18px]" />
        )}
        {folder.expanded ? (
          <FolderOpen size={16} className={isSelected ? 'text-primary-foreground' : 'text-foreground'} />
        ) : (
          <Folder size={16} className={isSelected ? 'text-primary-foreground' : 'text-foreground'} />
        )}
        <span className="text-sm flex-1" style={{ fontWeight: 'var(--font-weight-normal)' }}>
          {folder.name}
        </span>
        {!hasItems && (
          <span className="text-xs opacity-50" title="Empty folder">
            <Info size={12} className={isSelected ? 'text-primary-foreground' : 'text-muted'} />
          </span>
        )}
      </div>
      {folder.expanded && children}
    </div>
  );
}

// Mock data generators
const generateMockFolders = (): FolderItem[] => {
  return [
    { id: 'root', name: 'All Files', parentId: null, expanded: true },
    { id: 'f1', name: 'Digital Twins', parentId: 'root', expanded: true },
    { id: 'f2', name: 'Training Videos', parentId: 'root', expanded: false },
    { id: 'f3', name: 'Documentation', parentId: 'root', expanded: false },
    { id: 'f4', name: 'Product Images', parentId: 'root', expanded: false },
    { id: 'f5', name: 'CNC Models', parentId: 'f1', expanded: false },
    { id: 'f6', name: 'Robot Arms', parentId: 'f1', expanded: false },
    { id: 'f7', name: 'Procedures', parentId: 'f2', expanded: false },
    { id: 'f8', name: 'Safety', parentId: 'f3', expanded: false },
  ];
};

const generateMockMedia = (): MediaItem[] => {
  return [
    {
      id: 'm1',
      name: 'CNC_Machine_Model.glb',
      type: 'model',
      typeName: 'frontlinehololens',
      size: '24.5 MB',
      uploadedBy: 'John Davis',
      uploadedDate: '2024-11-05',
      tags: ['3D', 'CNC', 'Machine'],
      folderId: 'f5',
      usedInProcedures: ['CNC Maintenance', 'Machine Setup'],
      thumbnail: undefined,
    },
    {
      id: 'm2',
      name: 'maintenance_procedure.mp4',
      type: 'video',
      typeName: 'training_video',
      size: '156.8 MB',
      uploadedBy: 'Emily Carter',
      uploadedDate: '2024-11-04',
      tags: ['Tutorial', 'Maintenance'],
      folderId: 'f7',
      usedInProcedures: ['General Maintenance'],
      thumbnail: undefined,
    },
    {
      id: 'm3',
      name: 'safety_guidelines.pdf',
      type: 'document',
      typeName: 'pdf_document',
      size: '2.3 MB',
      uploadedBy: 'Sarah Chen',
      uploadedDate: '2024-11-03',
      tags: ['Safety', 'Guidelines'],
      folderId: 'f8',
      usedInProcedures: [],
      thumbnail: undefined,
    },
    {
      id: 'm4',
      name: 'product_photo_01.jpg',
      type: 'image',
      typeName: 'product_image',
      size: '4.2 MB',
      uploadedBy: 'Mike Wilson',
      uploadedDate: '2024-11-02',
      tags: ['Product', 'Photo'],
      folderId: 'f4',
      usedInProcedures: ['Product Assembly'],
      thumbnail: undefined,
    },
    {
      id: 'm5',
      name: 'assembly_diagram.png',
      type: 'image',
      typeName: 'diagram',
      size: '1.8 MB',
      uploadedBy: 'Lisa Anderson',
      uploadedDate: '2024-11-01',
      tags: ['Diagram', 'Assembly'],
      folderId: 'f4',
      usedInProcedures: ['Product Assembly', 'Training Module'],
      thumbnail: undefined,
    },
    {
      id: 'm6',
      name: 'robot_arm_model.fbx',
      type: 'model',
      typeName: 'frontlinehololens',
      size: '18.6 MB',
      uploadedBy: 'Tom Harris',
      uploadedDate: '2024-10-31',
      tags: ['3D', 'Robot'],
      folderId: 'f6',
      usedInProcedures: ['Robot Setup'],
      thumbnail: undefined,
    },
    {
      id: 'm7',
      name: 'training_video_01.mp4',
      type: 'video',
      typeName: 'training_video',
      size: '245.1 MB',
      uploadedBy: 'David Park',
      uploadedDate: '2024-10-30',
      tags: ['Training', 'Tutorial'],
      folderId: 'f7',
      usedInProcedures: ['Employee Onboarding'],
      thumbnail: undefined,
    },
    {
      id: 'm8',
      name: 'technical_specs.docx',
      type: 'document',
      typeName: 'word_document',
      size: '892 KB',
      uploadedBy: 'Emily Carter',
      uploadedDate: '2024-10-29',
      tags: ['Specs', 'Technical'],
      folderId: 'f3',
      usedInProcedures: [],
      thumbnail: undefined,
    },
    {
      id: 'm9',
      name: 'conveyor_blueprint.jpg',
      type: 'image',
      typeName: 'blueprint',
      size: '3.1 MB',
      uploadedBy: 'John Davis',
      uploadedDate: '2024-10-28',
      tags: ['Blueprint', 'Conveyor'],
      folderId: 'f4',
      usedInProcedures: ['Conveyor Installation'],
      thumbnail: undefined,
    },
    {
      id: 'm10',
      name: 'inspection_checklist.pdf',
      type: 'document',
      typeName: 'pdf_document',
      size: '1.5 MB',
      uploadedBy: 'Sarah Chen',
      uploadedDate: '2024-10-27',
      tags: ['Inspection', 'Checklist'],
      folderId: 'f8',
      usedInProcedures: ['Safety Inspection'],
      thumbnail: undefined,
    },
    {
      id: 'm11',
      name: 'warehouse_scan.glb',
      type: 'model',
      typeName: 'frontlinehololens',
      size: '45.2 MB',
      uploadedBy: 'Mike Wilson',
      uploadedDate: '2024-10-26',
      tags: ['3D', 'Scan', 'Warehouse'],
      folderId: 'f1',
      usedInProcedures: ['Warehouse Navigation'],
      thumbnail: undefined,
    },
    {
      id: 'm12',
      name: 'demo_session.mp4',
      type: 'video',
      typeName: 'demo_recording',
      size: '189.4 MB',
      uploadedBy: 'Lisa Anderson',
      uploadedDate: '2024-10-25',
      tags: ['Demo', 'Session'],
      folderId: 'f2',
      usedInProcedures: [],
      thumbnail: undefined,
    },
    {
      id: 'm13',
      name: 'part_catalog.xlsx',
      type: 'document',
      typeName: 'excel_spreadsheet',
      size: '3.7 MB',
      uploadedBy: 'Tom Harris',
      uploadedDate: '2024-10-24',
      tags: ['Catalog', 'Parts'],
      folderId: 'f3',
      usedInProcedures: ['Parts Ordering'],
      thumbnail: undefined,
    },
    {
      id: 'm14',
      name: 'machine_photo_02.png',
      type: 'image',
      typeName: 'photo',
      size: '2.9 MB',
      uploadedBy: 'David Park',
      uploadedDate: '2024-10-23',
      tags: ['Machine', 'Photo'],
      folderId: 'f4',
      usedInProcedures: [],
      thumbnail: undefined,
    },
    {
      id: 'm15',
      name: 'packaging_unit_3d.obj',
      type: 'model',
      typeName: 'frontlinehololens',
      size: '32.1 MB',
      uploadedBy: 'Emily Carter',
      uploadedDate: '2024-10-22',
      tags: ['3D', 'Packaging'],
      folderId: 'f1',
      usedInProcedures: ['Packaging Training'],
      thumbnail: undefined,
    },
    {
      id: 'm16',
      name: 'tutorial_basics.mp4',
      type: 'video',
      typeName: 'tutorial_video',
      size: '167.3 MB',
      uploadedBy: 'John Davis',
      uploadedDate: '2024-10-21',
      tags: ['Tutorial', 'Basics'],
      folderId: 'root',
      usedInProcedures: ['Basic Training'],
      thumbnail: undefined,
    },
  ];
};

function MediaLibraryContent({ isOpen, onClose, selectionMode = false, onSelectItem }: MediaLibraryModalProps) {
  const { showToast } = useToast();
  const { currentRole } = useRole();
  const canCreate = hasAccess(currentRole, 'create-content');
  const canDelete = hasAccess(currentRole, 'delete-content');
  const canEdit = hasAccess(currentRole, 'projects-edit');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MediaType>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<FolderItem[]>(generateMockFolders());
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(generateMockMedia());
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [optionsMenu, setOptionsMenu] = useState<{ item: MediaItem; x: number; y: number } | null>(null);
  const [renameModal, setRenameModal] = useState<{ item: MediaItem; type: 'file' | 'folder' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<MediaItem | null>(null);
  const [replaceModal, setReplaceModal] = useState<MediaItem | null>(null);
  const [procedureModal, setProcedureModal] = useState<MediaItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<MediaItem | null>(null);

  // Get current folder and its children
  const getChildFolders = useCallback(
    (parentId: string | null): FolderItem[] => {
      return folders.filter((f) => f.parentId === parentId);
    },
    [folders]
  );

  // Check if folder has child folders
  const folderHasChildFolders = useCallback(
    (folderId: string): boolean => {
      return folders.some((f) => f.parentId === folderId);
    },
    [folders]
  );

  // Check if folder has items
  const folderHasItems = useCallback(
    (folderId: string): boolean => {
      return mediaItems.some((item) => item.folderId === folderId);
    },
    [mediaItems]
  );

  // Filter media items - ONLY show items in the direct folder (not children)
  const filteredItems = useMemo(() => {
    let items = mediaItems;

    // Filter by folder - ONLY direct children
    items = items.filter((item) => item.folderId === selectedFolderId);

    // Filter by type
    if (filterType !== 'all') {
      items = items.filter((item) => item.type === filterType);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [mediaItems, selectedFolderId, filterType, searchQuery]);

  // Get media type icon
  const getMediaIcon = (type: MediaType, small: boolean = false) => {
    const size = small ? 24 : 40;
    switch (type) {
      case 'image':
        return <ImageIcon size={size} className="text-primary" />;
      case 'video':
        return <Video size={size} className="text-destructive" />;
      case 'document':
        return <FileText size={size} className="text-accent" />;
      case 'model':
        return <Box size={size} className="text-chart-4" />;
      default:
        return <File size={size} className="text-muted" />;
    }
  };

  // Get thumbnail background color
  const getThumbnailColor = (type: MediaType) => {
    switch (type) {
      case 'image':
        return 'bg-primary/10 border-primary/20';
      case 'video':
        return 'bg-destructive/10 border-destructive/20';
      case 'document':
        return 'bg-accent/10 border-accent/20';
      case 'model':
        return 'bg-chart-4/10 border-chart-4/20';
      default:
        return 'bg-secondary border-border';
    }
  };

  // Toggle folder expansion
  const toggleFolderExpand = (folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, expanded: !folder.expanded }
          : folder
      )
    );
  };

  // Toggle item selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all/none
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  // Handle drop media into folder
  const handleDropMedia = (folderId: string, mediaId: string) => {
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === mediaId ? { ...item, folderId } : item
      )
    );
  };

  // Handle upload
  const handleUpload = (files: File[], folderId: string | null) => {
    const newItems: MediaItem[] = files.map((file, index) => {
      let type: MediaType = 'document';
      let typeName = 'document';
      if (file.type.startsWith('image/')) {
        type = 'image';
        typeName = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
        typeName = 'video';
      } else if (file.name.endsWith('.glb') || file.name.endsWith('.fbx') || file.name.endsWith('.obj')) {
        type = 'model';
        typeName = 'frontlinehololens';
      }

      return {
        id: `m${Date.now()}_${index}`,
        name: file.name,
        type,
        typeName,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedBy: 'Yanay Nadel',
        uploadedDate: new Date().toISOString().split('T')[0],
        tags: [],
        folderId: folderId || selectedFolderId,
        usedInProcedures: [],
        thumbnail: undefined,
      };
    });

    setMediaItems((prev) => [...newItems, ...prev]);
  };

  // Create folder
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: FolderItem = {
      id: `f${Date.now()}`,
      name,
      parentId: parentId || selectedFolderId,
      expanded: false,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  // Handle options menu
  const handleOpenOptions = (item: MediaItem, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setOptionsMenu({ item, x: rect.right, y: rect.bottom });
  };

  // Handle delete
  const handleDelete = (itemId: string) => {
    const item = mediaItems.find(i => i.id === itemId);
    const previousItems = [...mediaItems];
    
    setMediaItems((prev) => prev.filter((item) => item.id !== itemId));
    setDeleteModal(null);
    
    if (item) {
      showToast(
        `Deleted "${item.name}"`,
        {
          label: 'Undo',
          onClick: () => {
            setMediaItems(previousItems);
          }
        }
      );
    }
  };

  // Handle rename
  const handleRename = (itemId: string, newName: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, name: newName } : item))
    );
  };

  // Handle replace
  const handleReplace = (oldItemId: string, newItemId: string) => {
    // In a real app, this would update all procedures that use the old item to use the new item
    console.log(`Replacing ${oldItemId} with ${newItemId}`);
  };

  // Handle replace with upload
  const handleReplaceWithUpload = (oldItemId: string, files: File[]) => {
    // Upload the new file and replace the old one
    handleUpload(files, mediaItems.find(item => item.id === oldItemId)?.folderId || null);
    handleDelete(oldItemId);
  };

  // Handle download
  const handleDownload = (item: MediaItem) => {
    console.log(`Downloading ${item.name}`);
    // In a real app, this would trigger a file download
  };

  // Render folder tree
  const renderFolderTree = (parentId: string | null, level: number = 0) => {
    const childFolders = getChildFolders(parentId);
    return childFolders.map((folder) => (
      <FolderItemComponent
        key={folder.id}
        folder={folder}
        level={level}
        isSelected={selectedFolderId === folder.id}
        onSelect={setSelectedFolderId}
        onToggleExpand={toggleFolderExpand}
        onDropMedia={handleDropMedia}
        hasChildFolders={folderHasChildFolders(folder.id)}
        hasItems={folderHasItems(folder.id)}
      >
        {renderFolderTree(folder.id, level + 1)}
      </FolderItemComponent>
    ));
  };

  const filterOptions = [
    { id: 'all' as MediaType, label: 'All Types', icon: <File size={16} /> },
    { id: 'model' as MediaType, label: 'Digital Twins', icon: <Box size={16} /> },
    { id: 'image' as MediaType, label: 'Images', icon: <ImageIcon size={16} /> },
    { id: 'video' as MediaType, label: 'Videos', icon: <Video size={16} /> },
    { id: 'document' as MediaType, label: 'Documents', icon: <FileText size={16} /> },
  ];

  const currentFilterLabel = filterOptions.find(f => f.id === filterType)?.label || 'All Types';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div role="dialog" aria-modal="true" aria-labelledby="media-library-title" className="relative w-full max-w-[95vw] h-[90vh] max-h-[calc(100vh-32px)] bg-card border border-border rounded-lg shadow-2xl flex flex-col m-4">
          {/* Selection Mode Banner */}
          {selectionMode && (
            <div className="shrink-0 bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check size={16} className="text-primary" />
                </div>
                <div>
                  <p style={{ fontWeight: 'var(--font-weight-bold)' }} className="text-foreground">
                    Select a media item
                  </p>
                  <p className="text-sm text-muted">
                    Click on an item to add it to your knowledge base
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Folder Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0 max-h-[200px] md:max-h-none">
            <div className="border-b border-border px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontWeight: 'var(--font-weight-bold)' }}>Folders</h3>
                {canCreate && (
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    aria-label="Create new folder"
                  >
                    <Plus size={16} className="text-muted" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {renderFolderTree(null)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="shrink-0 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 id="media-library-title" className="text-xl mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    Media Library
                  </h2>
                  <p className="text-sm text-muted">
                    {folders.find(f => f.id === selectedFolderId)?.name || 'All Files'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Close media library"
                >
                  <X size={20} className="text-muted" />
                </button>
              </div>

              {/* Search and Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Search media files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 h-10 bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors"
                    aria-haspopup="listbox"
                    aria-expanded={showFilterMenu}
                  >
                    <Filter size={16} />
                    <span className="text-sm">{currentFilterLabel}</span>
                    <ChevronDown size={14} className="text-muted" />
                  </button>
                  
                  {showFilterMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowFilterMenu(false)}
                      />
                      <div className="absolute top-full mt-2 right-0 w-56 max-w-[calc(100vw-32px)] bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                        {filterOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setFilterType(option.id);
                              setShowFilterMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              filterType === option.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-secondary'
                            }`}
                          >
                            {option.icon}
                            <span className="flex-1 text-left">{option.label}</span>
                            {filterType === option.id && (
                              <Check size={16} className="text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-border rounded-lg bg-secondary">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted hover:text-foreground'
                    }`}
                    style={{ borderRadius: 'var(--radius) 0 0 var(--radius)' }}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted hover:text-foreground'
                    }`}
                    style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Upload Button */}
                {canCreate && (
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 h-10 bg-primary text-primary-foreground rounded-lg hover:brightness-110 hover:shadow-md hover:shadow-primary/20 transition-all"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <File size={48} className="mx-auto mb-4 text-muted opacity-50" />
                    <p className="mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      No media files found
                    </p>
                    <p className="text-sm text-muted">
                      {searchQuery
                        ? 'Try adjusting your search or filters'
                        : 'Upload media to get started'}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredItems.map((item) => (
                      <DraggableMediaItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        viewMode={viewMode}
                        onToggleSelect={toggleSelection}
                        onOpenOptions={handleOpenOptions}
                        onShowProcedures={(item) => setProcedureModal(item)}
                        onShowDetails={(item) => {
                          if (selectionMode && onSelectItem) {
                            onSelectItem(item);
                            onClose();
                          } else {
                            setSelectedItemForDetails(item);
                          }
                        }}
                        getMediaIcon={getMediaIcon}
                        getThumbnailColor={getThumbnailColor}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-2 py-3 w-12">
                          <button
                            onClick={toggleSelectAll}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedItems.size === filteredItems.length &&
                              filteredItems.length > 0
                                ? 'bg-primary border-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {selectedItems.size === filteredItems.length &&
                              filteredItems.length > 0 && (
                                <Check size={12} className="text-primary-foreground" />
                              )}
                          </button>
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted w-16"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Type
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Name
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Type Name
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Size
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Date Added
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Added By
                        </th>
                        <th
                          className="text-left px-4 py-3 text-xs text-muted"
                          style={{ fontWeight: 'var(--font-weight-bold)' }}
                        >
                          Used In
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <DraggableMediaItem
                          key={item.id}
                          item={item}
                          isSelected={selectedItems.has(item.id)}
                          viewMode={viewMode}
                          onToggleSelect={toggleSelection}
                          onOpenOptions={handleOpenOptions}
                          onShowProcedures={(item) => setProcedureModal(item)}
                          onShowDetails={(item) => {
                            if (selectionMode && onSelectItem) {
                              onSelectItem(item);
                              onClose();
                            } else {
                              setSelectedItemForDetails(item);
                            }
                          }}
                          getMediaIcon={getMediaIcon}
                          getThumbnailColor={getThumbnailColor}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border px-6 py-4 bg-card">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </p>
                {selectedItems.size > 0 && (
                  <>
                    <div className="w-px h-4 bg-border" />
                    <p
                      className="text-sm text-primary"
                      style={{ fontWeight: 'var(--font-weight-bold)' }}
                    >
                      {selectedItems.size} selected
                    </p>
                    <button className="text-sm text-muted hover:text-foreground transition-colors">
                      <Move size={14} className="inline mr-1" />
                      Move
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => {
                          const firstSelectedItem = mediaItems.find(item => selectedItems.has(item.id));
                          if (firstSelectedItem) setDeleteModal(firstSelectedItem);
                        }}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          {selectedItemForDetails && !selectionMode && (
            <div className="w-80 border-l border-border flex flex-col shrink-0 bg-card">
              {/* Sidebar Header */}
              <div className="shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
                <h3 style={{ fontWeight: 'var(--font-weight-bold)' }}>Details</h3>
                <button
                  onClick={() => setSelectedItemForDetails(null)}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <X size={16} className="text-muted" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {/* Thumbnail Preview */}
                {(selectedItemForDetails.type === 'image' || selectedItemForDetails.type === 'video') && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={generateThumbnail(selectedItemForDetails)} 
                      alt={selectedItemForDetails.name} 
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted block mb-1">Name</label>
                    <p style={{ fontWeight: 'var(--font-weight-bold)' }} className="text-sm break-words">
                      {selectedItemForDetails.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-1">Type</label>
                      <p className="text-sm">{selectedItemForDetails.typeName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Size</label>
                      <p className="text-sm">{selectedItemForDetails.size}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-1">Date Added</label>
                      <p className="text-sm">
                        {new Date(selectedItemForDetails.uploadedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Added By</label>
                      <p className="text-sm">{selectedItemForDetails.uploadedBy}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1">Used In</label>
                    {selectedItemForDetails.usedInProcedures.length > 0 ? (
                      <button
                        onClick={() => setProcedureModal(selectedItemForDetails)}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedItemForDetails.usedInProcedures.length} Flow{selectedItemForDetails.usedInProcedures.length !== 1 ? 's' : ''}
                      </button>
                    ) : (
                      <p className="text-sm text-muted">Not used in any flows</p>
                    )}
                  </div>

                  {selectedItemForDetails.tags && selectedItemForDetails.tags.length > 0 && (
                    <div>
                      <label className="text-xs text-muted block mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedItemForDetails.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-secondary rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Options Context Menu */}
      {optionsMenu && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setOptionsMenu(null)}
          />
          <div
            className="fixed z-[60] w-48 bg-card border border-border rounded-lg shadow-lg py-1"
            style={{
              left: `${optionsMenu.x}px`,
              top: `${optionsMenu.y}px`,
              transform: 'translate(-100%, 0)',
            }}
          >
            {canEdit && (
              <button
                onClick={() => {
                  setRenameModal({ item: optionsMenu.item, type: 'file' });
                  setOptionsMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Edit size={16} />
                <span>Rename</span>
              </button>
            )}
            <button
              onClick={() => {
                handleDownload(optionsMenu.item);
                setOptionsMenu(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  setReplaceModal(optionsMenu.item);
                  setOptionsMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <RefreshCw size={16} />
                <span>Replace</span>
              </button>
            )}
            {canDelete && (
              <>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    setDeleteModal(optionsMenu.item);
                    setOptionsMenu(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        parentFolderId={selectedFolderId}
        onCreateFolder={handleCreateFolder}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentFolderId={selectedFolderId}
        onUpload={handleUpload}
      />

      {/* Rename Modal */}
      {renameModal && (
        <RenameModal
          isOpen={true}
          onClose={() => setRenameModal(null)}
          currentName={renameModal.item.name}
          onRename={(newName) => handleRename(renameModal.item.id, newName)}
          itemType={renameModal.type}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          itemName={deleteModal.name}
          usedInProcedures={deleteModal.usedInProcedures}
          onConfirm={() => handleDelete(deleteModal.id)}
        />
      )}

      {/* Replace Modal */}
      {replaceModal && (
        <ReplaceModal
          isOpen={true}
          onClose={() => setReplaceModal(null)}
          currentItem={replaceModal}
          usedInProcedures={replaceModal.usedInProcedures}
          allItems={mediaItems}
          onReplace={(newItemId) => handleReplace(replaceModal.id, newItemId)}
          onUploadNew={(files) => handleReplaceWithUpload(replaceModal.id, files)}
        />
      )}

      {/* Procedure List Modal */}
      {procedureModal && (
        <ProcedureListModal
          isOpen={true}
          onClose={() => setProcedureModal(null)}
          itemName={procedureModal.name}
          procedures={procedureModal.usedInProcedures}
        />
      )}


    </>
  );
}

export function MediaLibraryModal({ isOpen, onClose, selectionMode, onSelectItem }: MediaLibraryModalProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <MediaLibraryContent 
        isOpen={isOpen} 
        onClose={onClose} 
        selectionMode={selectionMode}
        onSelectItem={onSelectItem}
      />
    </DndProvider>
  );
}
