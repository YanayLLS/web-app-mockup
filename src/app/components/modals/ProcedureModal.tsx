import { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  ChevronRight,
  FileText,
  ChevronDown,
  Play,
  ExternalLink,
  Box,
  Clock,
  User,
  Calendar,
  Edit2,
  AlertCircle,
  Star,
  Clapperboard,
  Link2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject, KnowledgeBaseItem } from '../../contexts/ProjectContext';
import { ProcedureSettings } from './ProcedureSettings';
import { VersionHistory } from './VersionHistory';
import { ConfirmDialog } from './ConfirmDialog';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useToast } from '../../contexts/ToastContext';
// Fixed: Using currentProject from ProjectContext instead of undefined project

interface ProcedureModalProps {
  isOpen?: boolean;
  mode?: 'procedure' | 'digital-twin';
  procedure: {
    id: string;
    name: string;
    description?: string;
    connectedDigitalTwinIds?: string[];
    thumbnail?: string;
    isPublished: boolean;
    hasUnpublishedChanges: boolean;
    publishedVersion?: string;
    publishedDate?: string;
    createdBy: string;
    createdDate: string;
    lastEditedBy: string;
    lastEdited: string;
  };
  onClose: () => void;
  onSave?: (updatedProcedure: any) => void;
  startEditingTitle?: boolean;
  onOpenCanvas?: () => void;
}

export function ProcedureModal({ isOpen = true, mode = 'procedure', procedure, onClose, onSave, startEditingTitle = false, onOpenCanvas }: ProcedureModalProps) {
  const { digitalTwins, getDigitalTwinById, knowledgeBaseItems, currentProject } = useProject();
  const { currentRole } = useRole();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const isDT = mode === 'digital-twin';

  // Check if user has edit permissions
  const canEdit = hasAccess(currentRole, 'projects-edit');

  // For DT mode: find procedures connected to this digital twin
  const connectedProcedures = isDT
    ? knowledgeBaseItems.filter(
        i => i.type === 'procedure' && i.connectedDigitalTwinIds?.includes(procedure.id)
      )
    : [];
  const [connectedProceduresExpanded, setConnectedProceduresExpanded] = useState(true);
  
  // Check if this procedure is favorited
  const isFavorited = favorites.some(fav => fav.id === procedure.id);
  
  // Safety check: ensure we have a current project
  if (!currentProject) {
    console.error('ProcedureModal: No current project found');
    return null;
  }
  
  const [procedureName, setProcedureName] = useState(procedure.name);
  const [description, setDescription] = useState(procedure.description || '');
  const [selectedDigitalTwinIds, setSelectedDigitalTwinIds] = useState<string[]>(procedure.connectedDigitalTwinIds || []);
  const [showDigitalTwinDropdown, setShowDigitalTwinDropdown] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(startEditingTitle);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [versionHistoryExpanded, setVersionHistoryExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);

  const [procedureSettings, setProcedureSettings] = useState([
    {
      id: 'text-to-speech',
      title: 'Text to speech',
      options: [
        { id: 'auto-narrate-header', label: 'Auto narrate header', checked: true, tooltip: 'Automatically read headers aloud' },
        { id: 'auto-narrate-description', label: 'Auto narrate description', checked: true, tooltip: 'Automatically read descriptions aloud' },
        { id: 'wait-for-completion', label: 'Wait for text to speech completion before next step', checked: true, tooltip: 'Wait for audio to finish' },
      ],
    },
    {
      id: 'logics',
      title: 'Logics',
      options: [
        { id: 'allow-2d', label: 'Allow 2D viewing', checked: true },
        { id: 'toggle-step', label: 'Toggle step advancement on option selection', checked: true },
        { id: 'allow-skipping', label: 'Allow skipping steps', checked: true },
        { id: 'show-survey', label: 'Show survey', checked: true },
      ],
    },
  ]);

  const [aiInstructions, setAIInstructions] = useState('Meet the ProBook, an innovative laptop crafted for professionals who seek both power and sophistication. Its sleek metal design...');

  const [versionHistory, setVersionHistory] = useState([
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '0.99', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDigitalTwinDropdown(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Track changes
  useEffect(() => {
    const originalIds = procedure.connectedDigitalTwinIds || [];
    const idsChanged = selectedDigitalTwinIds.length !== originalIds.length ||
      selectedDigitalTwinIds.some(id => !originalIds.includes(id));
    
    const changed = 
      procedureName !== procedure.name ||
      description !== (procedure.description || '') ||
      idsChanged;
    setHasUnsavedChanges(changed);
  }, [procedureName, description, selectedDigitalTwinIds, procedure]);

  const selectedDigitalTwins = selectedDigitalTwinIds.map(id => getDigitalTwinById(id)).filter(Boolean);

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate 2 second publishing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Increment version
    const currentVersion = procedure.publishedVersion || '1.0';
    const versionParts = currentVersion.split('.');
    const majorVersion = parseInt(versionParts[0]);
    const minorVersion = parseInt(versionParts[1] || '0');
    const newVersion = `${majorVersion}.${minorVersion + 1}`;
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
    if (onSave) {
      onSave({
        ...procedure,
        name: procedureName,
        description,
        connectedDigitalTwinIds: selectedDigitalTwinIds.length > 0 ? selectedDigitalTwinIds : undefined,
        isPublished: true,
        hasUnpublishedChanges: false,
        publishedVersion: newVersion,
        publishedDate: formattedDate,
      });
    }
    
    setHasUnsavedChanges(false);
    setIsPublishing(false);
    
    // Show success indication
    const actionText = procedure.isPublished ? 'updated' : 'published';
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-[60] px-4 py-2.5 bg-[#11e874] text-white rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2';
    toast.style.fontWeight = 'var(--font-weight-bold)';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = 'var(--elevation-md)';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="white" stroke-width="2"/>
        <path d="M5 8l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Procedure ${actionText} successfully to v${newVersion}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleSaveChanges = () => {
    if (onSave) {
      onSave({
        ...procedure,
        name: procedureName,
        description,
        connectedDigitalTwinIds: selectedDigitalTwinIds.length > 0 ? selectedDigitalTwinIds : undefined,
        hasUnpublishedChanges: true,
      });
    }
    setHasUnsavedChanges(false);
    // Don't close the modal
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const handleCancelChanges = () => {
    setProcedureName(procedure.name);
    setDescription(procedure.description || '');
    setSelectedDigitalTwinIds(procedure.connectedDigitalTwinIds || []);
    setHasUnsavedChanges(false);
  };

  // Build breadcrumb path from procedure to root
  const buildBreadcrumbs = () => {
    const breadcrumbs: Array<{ name: string; isLink: boolean; id?: string; type?: string }> = [];
    
    // Add project name as root
    if (currentProject) {
      breadcrumbs.push({ name: currentProject.name, isLink: true, id: 'project', type: 'project' });
    }
    
    // Find all parent folders
    const findParentPath = (itemId: string): KnowledgeBaseItem[] => {
      const findItem = (items: KnowledgeBaseItem[], targetId: string): KnowledgeBaseItem | null => {
        for (const item of items) {
          if (item.id === targetId) return item;
          if (item.children) {
            const found = findItem(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const findPath = (items: KnowledgeBaseItem[], targetId: string, path: KnowledgeBaseItem[] = []): KnowledgeBaseItem[] | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return [...path, item];
          }
          if (item.children) {
            const found = findPath(item.children, targetId, [...path, item]);
            if (found) return found;
          }
        }
        return null;
      };

      const path = findPath(knowledgeBaseItems, itemId);
      return path || [];
    };

    const path = findParentPath(procedure.id);
    
    // Add folders (exclude the procedure itself which is the last item)
    for (let i = 0; i < path.length - 1; i++) {
      const item = path[i];
      if (item.type === 'folder') {
        breadcrumbs.push({ name: item.name, isLink: true, id: item.id, type: 'folder' });
      }
    }
    
    // Add current procedure as non-link
    breadcrumbs.push({ name: procedureName, isLink: false });
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-background rounded-[var(--radius)] shadow-lg w-full max-w-[1400px] h-[90vh] flex flex-col overflow-hidden"
        style={{ boxShadow: 'var(--elevation-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Breadcrumbs */}
        <div className="shrink-0 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2 shrink-0">
                  {crumb.isLink ? (
                    <button 
                      onClick={() => {
                        // Close the modal and navigate to the path
                        onClose();
                        // In a real app, this would navigate to the folder/project
                        console.log('Navigate to:', crumb.type, crumb.id);
                      }}
                      className="text-sm text-primary hover:underline truncate" 
                      style={{ fontWeight: 'var(--font-weight-bold)' }}
                    >
                      {crumb.name}
                    </button>
                  ) : (
                    <span className="text-sm text-foreground truncate" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {crumb.name}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-muted shrink-0" />}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={shareMenuRef}>
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  <Share2 size={14} />
                  <span className="text-sm">Share</span>
                </button>

                {showShareMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-96 bg-card border border-border rounded-[var(--radius)] shadow-lg z-10 p-4"
                    style={{ boxShadow: 'var(--elevation-sm)' }}
                  >
                    <p className="text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Share this {isDT ? 'digital twin' : 'procedure'}
                    </p>
                    <p className="text-xs text-muted mb-3">
                      Anyone with the link can view this {isDT ? 'digital twin' : 'procedure'}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://app.example.com/procedure/${procedure.id}`}
                        className="flex-1 h-9 px-3 bg-secondary border border-border rounded-[var(--radius)] text-xs text-foreground"
                      />
                      <button className="h-9 px-3 bg-primary text-primary-foreground rounded-[var(--radius)] text-xs hover:bg-primary/90 shrink-0">
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (isFavorited) {
                    removeFavorite(procedure.id);
                    showToast(`Removed "${procedure.name}" from favorites`);
                  } else {
                    if (currentProject) {
                      addFavorite({
                        id: procedure.id,
                        name: procedure.name,
                        type: 'procedure',
                        projectId: currentProject.id
                      });
                      showToast(`Added "${procedure.name}" to favorites`);
                    }
                  }
                }}
                className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star 
                  size={20} 
                  className={isFavorited ? 'text-accent' : 'text-muted'}
                  fill={isFavorited ? 'var(--accent)' : 'none'}
                />
              </button>

              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-secondary rounded-[var(--radius)] transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-header with Title and Status */}
        <div className="shrink-0 bg-card border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Icon */}
            <div className="p-2 bg-accent/10 rounded-[var(--radius)]">
              {isDT ? <Box size={20} className="text-accent" /> : <FileText size={20} className="text-accent" />}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 group/title">
              {isEditingTitle && canEdit ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTitle(false);
                    if (e.key === 'Escape') {
                      setProcedureName(procedure.name);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="h-9 px-3 bg-secondary border-2 border-primary rounded-[var(--radius)] text-sm text-foreground max-w-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ fontWeight: 'var(--font-weight-bold)' }}
                />
              ) : (
                <div
                  onMouseEnter={() => canEdit && setIsTitleHovered(true)}
                  onMouseLeave={() => setIsTitleHovered(false)}
                  onClick={() => canEdit && setIsEditingTitle(true)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 ${canEdit ? 'cursor-pointer' : 'cursor-default'} rounded-[var(--radius)] transition-all ${canEdit ? 'group-hover/title:bg-secondary' : ''} ${
                    isTitleHovered ? 'border-2 border-border' : 'border-2 border-transparent'
                  }`}
                >
                  <span
                    className="text-base text-foreground truncate max-w-md"
                    style={{ fontWeight: 'var(--font-weight-bold)' }}
                  >
                    {procedureName}
                  </span>
                  {canEdit && (
                    <Edit2
                      size={14}
                      className={`text-muted shrink-0 transition-opacity ${
                        isTitleHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* Status Indicators - Only for editing roles */}
            {canEdit && hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]">
                <AlertCircle size={14} className="text-destructive" />
                <span className="text-xs text-destructive" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Unsaved changes
                </span>
              </div>
            )}

            {canEdit && procedure.hasUnpublishedChanges && !hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]">
                <AlertCircle size={14} className="text-destructive" />
                <span className="text-xs text-destructive" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Unpublished changes
                </span>
              </div>
            )}

            {/* Published Status */}
            {procedure.isPublished && (
              <div className="text-right">
                <p className="text-xs text-foreground" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  Published
                </p>
                <p className="text-xs text-muted">
                  Version {procedure.publishedVersion} at {procedure.publishedDate}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <>
                {hasUnsavedChanges ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelChanges}
                      className="h-9 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      <span className="text-sm">Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="h-9 px-4 rounded-[var(--radius)] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>Save</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="h-9 px-4 rounded-[var(--radius)] bg-[#11e874] text-white hover:bg-[#0fd968] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                {isPublishing && (
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                <span className="text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {isPublishing ? 'Publishing...' : (procedure.isPublished ? 'Update' : 'Publish')}
                </span>
              </button>
            )}
            </>
          )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="flex gap-3 p-4 min-h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Preview Section */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm text-foreground mb-1" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      Preview
                    </h3>
                    {!isDT && (
                      <p className="text-xs text-muted">
                        Preview a connected digital twin, or{' '}
                        <button className="text-primary hover:underline">preview in 2D</button>
                      </p>
                    )}
                  </div>

                  {/* Digital Twin Selector - only in procedure mode */}
                  {!isDT && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => canEdit && setShowDigitalTwinDropdown(!showDigitalTwinDropdown)}
                        className={`flex items-center justify-between gap-3 h-10 px-4 bg-card border border-border rounded-[var(--radius)] text-sm text-foreground transition-colors min-w-[240px] ${canEdit ? 'hover:bg-secondary cursor-pointer' : 'cursor-default'}`}
                        disabled={!canEdit}
                      >
                        <span className="truncate">
                          {selectedDigitalTwins.length === 0
                            ? 'Select digital twins'
                            : selectedDigitalTwins.length === 1
                            ? selectedDigitalTwins[0]!.name
                            : `${selectedDigitalTwins.length} digital twins selected`}
                        </span>
                        <ChevronDown size={14} className="text-muted shrink-0" />
                      </button>

                      {showDigitalTwinDropdown && canEdit && (
                        <div
                          className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-[var(--radius)] shadow-lg z-10 max-h-60 overflow-auto"
                          style={{ boxShadow: 'var(--elevation-sm)' }}
                        >
                          {digitalTwins.map((twin) => {
                            const isSelected = selectedDigitalTwinIds.includes(twin.id);
                            return (
                              <label
                                key={twin.id}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer hover:bg-secondary"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDigitalTwinIds([...selectedDigitalTwinIds, twin.id]);
                                    } else {
                                      setSelectedDigitalTwinIds(selectedDigitalTwinIds.filter(id => id !== twin.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <Box size={14} className="text-muted" />
                                <span className="text-foreground">{twin.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3D Preview */}
                <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-[#5b19b4] to-[#004fff] rounded-[var(--radius)] overflow-hidden mb-3 flex items-center justify-center">
                  {(isDT || selectedDigitalTwins.length > 0) ? (
                    <>
                      {!show3DViewer ? (
                        <>
                          <button
                            onClick={() => setShow3DViewer(true)}
                            className="relative z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                          >
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </button>
                          <p className="absolute bottom-4 left-4 text-white text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                            {isDT ? procedureName : (selectedDigitalTwins.length === 1 ? selectedDigitalTwins[0]!.name : `${selectedDigitalTwins.length} digital twins`)}
                          </p>
                        </>
                      ) : (
                        <Simple3DViewer
                          digitalTwinName={isDT ? procedureName : (selectedDigitalTwins.length === 1 ? selectedDigitalTwins[0]!.name : `${selectedDigitalTwins.length} digital twins`)}
                          onClose={() => setShow3DViewer(false)}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <Box size={48} className="text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No digital twin selected</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {canEdit && (
                  <div className="flex gap-2">
                    {isDT ? (
                      <>
                        <button
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors"
                        >
                          <span className="text-sm">Edit Digital Twin</span>
                          <ExternalLink size={12} />
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors"
                        >
                          <Clapperboard size={14} />
                          <span className="text-sm">Animate</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={selectedDigitalTwinIds.length === 0}
                          onClick={() => navigate(`/web/procedure-editor/${procedure.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-sm">Edit in app</span>
                          <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={onOpenCanvas}
                          disabled={selectedDigitalTwinIds.length === 0}
                          className="flex-1 h-10 px-4 bg-primary text-primary-foreground rounded-[var(--radius)] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-sm">Edit in canvas</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-3">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-[120px] h-[68px] shrink-0 bg-secondary rounded-[var(--radius)] border border-border flex items-center justify-center">
                    {procedure.thumbnail ? (
                      <img 
                        src={procedure.thumbnail} 
                        alt="Procedure thumbnail"
                        className="w-full h-full object-cover rounded-[var(--radius)]"
                      />
                    ) : isDT ? (
                      <Box size={24} className="text-muted" />
                    ) : (
                      <FileText size={24} className="text-muted" />
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="flex-1">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a description (optional)..."
                      className="w-full h-full px-3 py-2 bg-card border border-border rounded-[var(--radius)] text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Side Menu - Only for editing roles */}
            {canEdit && (
              <div className="w-[400px] shrink-0 flex flex-col gap-3">
                {isDT ? (
                  /* Connected Procedures - DT mode */
                  <div className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
                    <button
                      onClick={() => setConnectedProceduresExpanded(!connectedProceduresExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 size={16} className="text-primary" />
                        <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          Connected Procedures
                        </span>
                        <span className="text-xs text-muted bg-secondary rounded-full px-2 py-0.5">{connectedProcedures.length}</span>
                      </div>
                      <ChevronDown size={16} className={`text-muted transition-transform ${connectedProceduresExpanded ? '' : '-rotate-90'}`} />
                    </button>

                    {connectedProceduresExpanded && (
                      <div className="px-4 pb-3 border-t border-border">
                        {connectedProcedures.length === 0 ? (
                          <p className="text-sm text-muted py-3 text-center">No procedures connected to this digital twin</p>
                        ) : (
                          <div className="flex flex-col gap-1 pt-2">
                            {connectedProcedures.map(proc => (
                              <div
                                key={proc.id}
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                              >
                                <FileText size={14} className="text-muted shrink-0" />
                                <span className="text-sm text-foreground truncate">{proc.name}</span>
                                {proc.isPublished && (
                                  <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded ml-auto shrink-0">Published</span>
                                )}
                                <ChevronRight size={12} className="text-muted shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Settings Section - Procedure mode */
                  <ProcedureSettings
                    isExpanded={settingsExpanded}
                    onToggleExpand={() => setSettingsExpanded(!settingsExpanded)}
                    settings={procedureSettings}
                    aiInstructions={aiInstructions}
                    onSettingsChange={setProcedureSettings}
                    onAIInstructionsChange={setAIInstructions}
                  />
                )}

                {/* Version History Section */}
                <VersionHistory
                  isExpanded={versionHistoryExpanded}
                  onToggleExpand={() => setVersionHistoryExpanded(!versionHistoryExpanded)}
                  versions={versionHistory}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Close Anyway"
        cancelText="Keep Editing"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowCloseConfirm(false)}
        variant="danger"
      />
    </div>
  );
}

// Simple 3D Viewer Component
interface Simple3DViewerProps {
  digitalTwinName: string;
  onClose: () => void;
}

function Simple3DViewer({ digitalTwinName, onClose }: Simple3DViewerProps) {
  const [rotation, setRotation] = useState({ x: 20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-b from-[#5b19b4] to-[#004fff] flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <X size={16} className="text-white" />
      </button>

      {/* 3D Object */}
      <div 
        className="relative"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Simple 3D Cube representing the digital twin */}
        <div
          className="relative"
          style={{
            width: '200px',
            height: '200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 bg-white/20 border-2 border-white/40 backdrop-blur-sm flex items-center justify-center"
            style={{
              transform: 'translateZ(100px)',
            }}
          >
            <Box size={48} className="text-white/60" />
          </div>
          
          {/* Back face */}
          <div
            className="absolute inset-0 bg-white/15 border-2 border-white/30 backdrop-blur-sm"
            style={{
              transform: 'translateZ(-100px) rotateY(180deg)',
            }}
          />
          
          {/* Right face */}
          <div
            className="absolute inset-0 bg-white/15 border-2 border-white/30 backdrop-blur-sm"
            style={{
              transform: 'rotateY(90deg) translateZ(100px)',
            }}
          />
          
          {/* Left face */}
          <div
            className="absolute inset-0 bg-white/15 border-2 border-white/30 backdrop-blur-sm"
            style={{
              transform: 'rotateY(-90deg) translateZ(100px)',
            }}
          />
          
          {/* Top face */}
          <div
            className="absolute inset-0 bg-white/20 border-2 border-white/40 backdrop-blur-sm"
            style={{
              transform: 'rotateX(90deg) translateZ(100px)',
            }}
          />
          
          {/* Bottom face */}
          <div
            className="absolute inset-0 bg-white/15 border-2 border-white/30 backdrop-blur-sm"
            style={{
              transform: 'rotateX(-90deg) translateZ(100px)',
            }}
          />
        </div>
      </div>

      {/* Digital Twin Name */}
      <p className="absolute bottom-4 left-4 text-white text-sm" style={{ fontWeight: 'var(--font-weight-bold)' }}>
        {digitalTwinName}
      </p>

      {/* Instructions */}
      <p className="absolute bottom-4 right-4 text-white/80 text-xs">
        Drag to rotate
      </p>
    </div>
  );
}
