import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
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
  Maximize2,
  Minimize2,
  Info,
  Copy,
  EyeOff,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject, KnowledgeBaseItem } from '../../contexts/ProjectContext';
import { ProcedureSettings } from './ProcedureSettings';
import { VersionHistory } from './VersionHistory';
import { useRole, hasAccess } from '../../contexts/RoleContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useToast } from '../../contexts/ToastContext';

interface ProcedureModalProps {
  isOpen?: boolean;
  mode?: 'procedure' | 'digital-twin';
  procedure: {
    id: string;
    name: string;
    description?: string;
    connectedDigitalTwinIds?: string[];
    digitalTwinId?: string;
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
  onOpenProcedure?: (procedureItem: any) => void;
}

export function ProcedureModal({ isOpen = true, mode = 'procedure', procedure, onClose, onSave, startEditingTitle = false, onOpenCanvas, onOpenProcedure }: ProcedureModalProps) {
  const { digitalTwins, getDigitalTwinById, knowledgeBaseItems, currentProject } = useProject();
  const { currentRole } = useRole();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isDT = mode === 'digital-twin';

  // Check if user has edit permissions
  const canEdit = hasAccess(currentRole, 'projects-edit');
  const canDelete = hasAccess(currentRole, 'delete-content');
  const canPublish = hasAccess(currentRole, 'publish-content');
  const canDuplicate = hasAccess(currentRole, 'duplicate-content');
  const canShare = hasAccess(currentRole, 'share-content');
  const canViewCollaborators = hasAccess(currentRole, 'view-collaborators');
  const canEditCollaborators = hasAccess(currentRole, 'edit-collaborators');

  // For DT mode: find procedures connected to this digital twin
  const dtMatchId = isDT ? (procedure.digitalTwinId || procedure.id) : procedure.id;
  const flattenKBItems = (items: typeof knowledgeBaseItems): typeof knowledgeBaseItems => {
    let result: typeof knowledgeBaseItems = [];
    items.forEach(i => { result.push(i); if (i.children) result = result.concat(flattenKBItems(i.children)); });
    return result;
  };
  const connectedProcedures = isDT
    ? flattenKBItems(knowledgeBaseItems).filter(
        i => i.type === 'procedure' && i.connectedDigitalTwinIds?.includes(dtMatchId)
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
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [versionHistoryExpanded, setVersionHistoryExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [showPendingChanges, setShowPendingChanges] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

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

  // Store original values on mount for pending changes comparison
  const originalRef = useRef({
    name: procedure.name,
    description: procedure.description || '',
    connectedDigitalTwinIds: [...(procedure.connectedDigitalTwinIds || [])],
  });
  const initialSettingsRef = useRef(JSON.parse(JSON.stringify(procedureSettings)));
  const initialAIRef = useRef(aiInstructions);

  const [versionHistory, setVersionHistory] = useState([
    { version: '1.4', publishDate: 'March 15, 2025 at 10:22 AM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '1.3', publishDate: 'February 28, 2025 at 3:15 PM', publishedBy: 'Daniel Kim', publishedByInitials: 'DK', publishedByColor: '#4a90d9' },
    { version: '1.2', publishDate: 'January 12, 2025 at 11:45 AM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
    { version: '1.1', publishDate: 'December 5, 2024 at 9:30 AM', publishedBy: 'Sarah Chen', publishedByInitials: 'SC', publishedByColor: '#e07c5a' },
    { version: '1.0', publishDate: 'November 19, 2024 at 2:48 PM', publishedBy: 'Laura Green', publishedByInitials: 'LG', publishedByColor: '#aa74b5' },
  ]);

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [lastSavedText, setLastSavedText] = useState('Just now');
  const [copiedLink, setCopiedLink] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useClickOutside(dropdownRef, () => setShowDigitalTwinDropdown(false));
  useClickOutside(shareMenuRef, () => setShowShareMenu(false));
  useClickOutside(statusMenuRef, () => setShowStatusMenu(false), showStatusMenu, true);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // #8 — Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingTitle && !showDigitalTwinDropdown && !showShareMenu) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditingTitle, showDigitalTwinDropdown, showShareMenu]);

  // #5 — Dynamic "last saved" text
  useEffect(() => {
    if (!lastSavedAt) return;
    const update = () => {
      const diff = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (diff < 10) setLastSavedText('Just now');
      else if (diff < 60) setLastSavedText(`${diff}s ago`);
      else if (diff < 3600) setLastSavedText(`${Math.floor(diff / 60)} min ago`);
      else setLastSavedText(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  // Compute pending changes — compare current form state vs original values
  const orig = originalRef.current;
  const pendingChanges: { label: string; detail: string }[] = [];
  if (procedure.isPublished || procedure.hasUnpublishedChanges) {
    // Title
    if (procedureName !== orig.name) {
      pendingChanges.push({ label: 'Title', detail: `"${orig.name}" → "${procedureName}"` });
    }
    // Description
    if (description !== orig.description) {
      if (!orig.description && description) pendingChanges.push({ label: 'Description', detail: 'Added' });
      else if (orig.description && !description) pendingChanges.push({ label: 'Description', detail: 'Removed' });
      else pendingChanges.push({ label: 'Description', detail: 'Modified' });
    }
    // Digital twin connections (procedure mode)
    if (!isDT) {
      const origIds = orig.connectedDigitalTwinIds;
      const idsChanged = selectedDigitalTwinIds.length !== origIds.length ||
        selectedDigitalTwinIds.some(id => !origIds.includes(id));
      if (idsChanged) {
        const added = selectedDigitalTwinIds.filter(id => !origIds.includes(id));
        const removed = origIds.filter(id => !selectedDigitalTwinIds.includes(id));
        if (added.length && !removed.length) pendingChanges.push({ label: 'Digital Twin', detail: `${added.length} connection${added.length > 1 ? 's' : ''} added` });
        else if (removed.length && !added.length) pendingChanges.push({ label: 'Digital Twin', detail: `${removed.length} connection${removed.length > 1 ? 's' : ''} removed` });
        else pendingChanges.push({ label: 'Digital Twin', detail: 'Connections changed' });
      }
    }
    // Settings changes (procedure mode)
    if (!isDT) {
      procedureSettings.forEach((group, gi) => {
        group.options.forEach((opt, oi) => {
          const initial = initialSettingsRef.current[gi]?.options[oi];
          if (initial && opt.checked !== initial.checked) {
            pendingChanges.push({ label: 'Setting', detail: `"${opt.label}" ${opt.checked ? 'enabled' : 'disabled'}` });
          }
        });
      });
    }
    // AI Instructions (procedure mode)
    if (!isDT && aiInstructions !== initialAIRef.current) {
      if (!initialAIRef.current && aiInstructions) pendingChanges.push({ label: 'AI Instructions', detail: 'Added' });
      else if (initialAIRef.current && !aiInstructions) pendingChanges.push({ label: 'AI Instructions', detail: 'Removed' });
      else pendingChanges.push({ label: 'AI Instructions', detail: 'Modified' });
    }
    // If item was already flagged as having unpublished changes and no local edits
    if (procedure.hasUnpublishedChanges && pendingChanges.length === 0) {
      pendingChanges.push({ label: 'Content', detail: isDT ? 'Digital twin updated since last publish' : 'Flow steps updated since last publish' });
    }
  }

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

    // Reset original refs to reflect the new published state
    originalRef.current = { name: procedureName, description, connectedDigitalTwinIds: [...selectedDigitalTwinIds] };
    initialSettingsRef.current = JSON.parse(JSON.stringify(procedureSettings));
    initialAIRef.current = aiInstructions;
    setIsPublishing(false);

    const actionText = procedure.isPublished ? 'updated' : 'published';
    showToast(`Flow ${actionText} successfully to v${newVersion}`, 'success');
  };

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    setShowStatusMenu(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (onSave) {
      onSave({
        ...procedure,
        name: procedureName,
        description,
        connectedDigitalTwinIds: selectedDigitalTwinIds.length > 0 ? selectedDigitalTwinIds : undefined,
        isPublished: false,
        hasUnpublishedChanges: false,
      });
    }
    setIsUnpublishing(false);
    showToast('Flow unpublished — reverted to draft', 'success');
  };

  const handleRollbackVersion = (rolledBackVersion: { version: string; publishDate: string; publishedBy: string; publishedByInitials: string; publishedByColor: string }) => {
    // Rollback creates a new version at the top based on the rolled-back snapshot
    const latestVersion = versionHistory[0]?.version || '1.0';
    const parts = latestVersion.split('.');
    const newVersion = `${parseInt(parts[0])}.${parseInt(parts[1] || '0') + 1}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      + ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newEntry = {
      version: newVersion,
      publishDate: formattedDate,
      publishedBy: 'You',
      publishedByInitials: 'YD',
      publishedByColor: '#2F80ED',
    };
    setVersionHistory([newEntry, ...versionHistory]);

    // Update the procedure's published version
    const shortDate = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    if (onSave) {
      onSave({
        ...procedure,
        name: procedureName,
        description,
        connectedDigitalTwinIds: selectedDigitalTwinIds.length > 0 ? selectedDigitalTwinIds : undefined,
        isPublished: true,
        hasUnpublishedChanges: false,
        publishedVersion: newVersion,
        publishedDate: shortDate,
      });
    }
  };

  const handleClose = () => {
    // Auto-save any changes before closing
    if (pendingChanges.length > 0 && onSave) {
      onSave({
        ...procedure,
        name: procedureName,
        description,
        connectedDigitalTwinIds: selectedDigitalTwinIds.length > 0 ? selectedDigitalTwinIds : undefined,
        hasUnpublishedChanges: procedure.isPublished ? true : procedure.hasUnpublishedChanges,
      });
    }
    onClose();
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

  // ── E2 Inline Styles ──────────────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 16,
    animation: 'pmOverlayIn 200ms ease-out',
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: '#EEEEF1',
    borderRadius: 14,
    width: '100%',
    maxWidth: 780,
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
    animation: 'pmDialogIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const topBarStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    height: 50,
    minHeight: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid #E4E5EA',
    borderRadius: '14px 14px 0 0',
    flexShrink: 0,
  };

  const scrollAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: '#EEEEF1',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  };

  const bottomBarStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    height: 54,
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    boxShadow: '0 -1px 0 #E4E5EA, 0 -6px 16px rgba(0,0,0,0.04)',
    borderRadius: '0 0 14px 14px',
    flexShrink: 0,
  };

  const topBarBtnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    color: '#868D9E',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'background 150ms',
    flexShrink: 0,
  };

  const propertyRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderBottom: '1px solid #F5F6F8',
    transition: 'background 120ms',
  };

  const propertyLabelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 400,
    color: '#868D9E',
    flexShrink: 0,
    minWidth: 100,
  };

  const propertyValueStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: '#36415D',
    textAlign: 'right' as const,
  };

  const actionLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#2F80ED',
    padding: '6px 12px',
    borderRadius: 20,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'background 150ms',
    textDecoration: 'none',
  };

  const actionLinkDisabledStyle: React.CSSProperties = {
    ...actionLinkStyle,
    color: '#C2C9DB',
    cursor: 'not-allowed',
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="procedure-modal-title"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══ TOP BAR ══ */}
        <div style={topBarStyle}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 flex-1 overflow-hidden min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className={`flex items-center gap-1 ${!crumb.isLink ? 'min-w-0 overflow-hidden' : 'shrink-0'}`}>
                {crumb.isLink ? (
                  <button
                    onClick={() => {
                      onClose();
                      console.log('Navigate to:', crumb.type, crumb.id);
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#2F80ED',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = 'none'; }}
                  >
                    {crumb.name}
                  </button>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#36415D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260, display: 'block' }}>
                    {crumb.name}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && <ChevronRight size={12} style={{ color: '#C2C9DB', flexShrink: 0 }} />}
              </div>
            ))}
          </div>

          {/* Top bar buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Share */}
            {canShare && (
              <div style={{ position: 'relative' }} ref={shareMenuRef}>
                <div className="group/share relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    style={topBarBtnStyle}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F4'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    aria-haspopup="true"
                    aria-expanded={showShareMenu}
                  >
                    <Share2 size={16} />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/share:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    Share
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#36415D]" />
                  </div>
                </div>

                {showShareMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: 8,
                      width: 340,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E4E5EA',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      padding: 16,
                      zIndex: 10,
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#36415D', marginBottom: 4 }}>
                      Share this {isDT ? 'digital twin' : 'flow'}
                    </p>
                    <p style={{ fontSize: 12, color: '#868D9E', marginBottom: 12 }}>
                      Anyone with the link can view this {isDT ? 'digital twin' : 'flow'}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://${currentProject?.name?.toLowerCase().replace(/\s+/g, '-') || 'project'}.frontline.io/${isDT ? 'dt' : 'flow'}/${procedure.id}`}
                        style={{
                          flex: 1,
                          height: 36,
                          padding: '0 12px',
                          backgroundColor: '#F5F6F8',
                          border: '1px solid #E4E5EA',
                          borderRadius: 8,
                          fontSize: 12,
                          color: '#36415D',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => {
                          const url = `https://${currentProject?.name?.toLowerCase().replace(/\s+/g, '-') || 'project'}.frontline.io/${isDT ? 'dt' : 'flow'}/${procedure.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          showToast('Link copied to clipboard');
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        style={{
                          height: 36,
                          padding: '0 14px',
                          backgroundColor: copiedLink ? '#11E874' : '#2F80ED',
                          color: '#FFFFFF',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'background-color 200ms',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Copy size={12} />
                        {copiedLink ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Star / Favorite */}
            <div className="group/fav relative">
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
                style={{
                  ...topBarBtnStyle,
                  color: isFavorited ? '#F59E0B' : '#868D9E',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F4'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star size={16} fill={isFavorited ? '#F59E0B' : 'none'} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/fav:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#36415D]" />
              </div>
            </div>

            {/* Close */}
            <div className="group/close relative">
              <button
                onClick={handleClose}
                style={topBarBtnStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F1F4'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/close:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                Close <span style={{ opacity: 0.6 }}>Esc</span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#36415D]" />
              </div>
            </div>
          </div>
        </div>

        {/* ══ SCROLL AREA ══ */}
        <div style={scrollAreaStyle} className="custom-scrollbar">

          {/* ── Card 1: Hero Preview ── */}
          <div style={cardStyle}>
            {/* DT selector dropdown above hero — procedure mode only */}
            {!isDT && canEdit && (
              <div style={{ padding: '10px 16px 0 16px', position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setShowDigitalTwinDropdown(!showDigitalTwinDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    width: '100%',
                    height: 38,
                    padding: '0 12px',
                    backgroundColor: '#FAFBFC',
                    border: '1px solid #E4E5EA',
                    borderRadius: 8,
                    fontSize: 13,
                    color: selectedDigitalTwins.length === 0 ? '#868D9E' : '#36415D',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'border-color 150ms',
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={showDigitalTwinDropdown}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedDigitalTwins.length === 0
                      ? 'Select digital twins'
                      : selectedDigitalTwins.length === 1
                      ? selectedDigitalTwins[0]!.name
                      : `${selectedDigitalTwins.length} digital twins selected`}
                  </span>
                  <ChevronDown size={14} style={{ color: '#868D9E', flexShrink: 0 }} />
                </button>

                {showDigitalTwinDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 16,
                      right: 16,
                      top: '100%',
                      marginTop: 4,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E5EA',
                      borderRadius: 10,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      maxHeight: 220,
                      overflowY: 'auto',
                      padding: 4,
                      zIndex: 10,
                    }}
                    className="custom-scrollbar"
                  >
                    {digitalTwins.map((twin) => {
                      const isSelected = selectedDigitalTwinIds.includes(twin.id);
                      return (
                        <label
                          key={twin.id}
                          className="flex items-center gap-3"
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 13,
                            backgroundColor: isSelected ? 'rgba(47,128,237,0.06)' : 'transparent',
                            transition: 'background 120ms',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F6F8';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? 'rgba(47,128,237,0.06)' : 'transparent';
                          }}
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
                            style={{
                              width: 16,
                              height: 16,
                              accentColor: '#2F80ED',
                              cursor: 'pointer',
                              flexShrink: 0,
                              borderRadius: 4,
                            }}
                          />
                          <Box size={14} style={{ color: isSelected ? '#2F80ED' : '#868D9E', flexShrink: 0 }} />
                          <span style={{ color: isSelected ? '#2F80ED' : '#36415D', fontWeight: isSelected ? 600 : 400 }}>
                            {twin.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Hero 16:9 area */}
            <div style={{ padding: !isDT && canEdit ? '8px 16px 16px 16px' : 16, position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: (isDT || selectedDigitalTwins.length > 0)
                    ? 'linear-gradient(155deg, #2F80ED 0%, #1A6AD4 40%, #004FFF 70%, #0033BB 100%)'
                    : 'linear-gradient(155deg, #667085 0%, #475467 50%, #344054 100%)',
                }}
              >
                {/* Decorative radial shapes */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle at 25% 35%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.08) 0%, transparent 40%)',
                  pointerEvents: 'none',
                }} />
                {/* Bottom vignette */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }} />

                {(isDT || selectedDigitalTwins.length > 0) ? (
                  <>
                    {!show3DViewer ? (
                      <>
                        {/* Play button - frosted glass, 66px */}
                        <div className="group/play" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                          <button
                            onClick={() => setShow3DViewer(true)}
                            style={{
                              width: 66,
                              height: 66,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255,255,255,0.18)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 200ms, transform 200ms',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.28)';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.18)';
                              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                            }}
                            aria-label="Play 3D preview"
                          >
                            <Play size={28} style={{ color: '#FFFFFF', marginLeft: 3 }} fill="white" />
                          </button>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/play:opacity-100 pointer-events-none transition-opacity backdrop-blur-sm">
                            Preview 3D model
                          </div>
                        </div>

                        {/* DT badge bottom-left — frosted glass pill */}
                        <div style={{
                          position: 'absolute',
                          bottom: 14,
                          left: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 20,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          maxWidth: 'calc(100% - 28px)',
                        }}>
                          <Box size={12} style={{ color: '#FFFFFF', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isDT ? procedureName : (
                              selectedDigitalTwins.length === 1 ? selectedDigitalTwins[0]!.name :
                              selectedDigitalTwins.length <= 3 ? selectedDigitalTwins.map(dt => dt!.name).join(', ') :
                              `${selectedDigitalTwins.length} digital twins`
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0 }}>
                        <Simple3DViewer
                          digitalTwinName={isDT ? procedureName : (selectedDigitalTwins.length === 1 ? selectedDigitalTwins[0]!.name : `${selectedDigitalTwins.length} digital twins`)}
                          onClose={() => setShow3DViewer(false)}
                          onOpenSettings={() => {
                            setShow3DViewer(false);
                            setSettingsExpanded(true);
                          }}
                          procedureId={!isDT ? procedure.id : undefined}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty state — no DT selected */
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Box size={48} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 10 }} />
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>No digital twin selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Card 2: Content ── */}
          <div style={{ ...cardStyle, padding: '20px 24px' }}>
            {/* Action links row */}
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              {isDT ? (
                <>
                  <div className="group/editdt relative">
                    <button
                      onClick={() => window.open(`${import.meta.env.BASE_URL}app/3d-viewer?mode=editor`, '_blank')}
                      style={actionLinkStyle}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F4FF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <ExternalLink size={13} />
                      Edit Digital Twin
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/editdt:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      Opens in new tab
                    </div>
                  </div>
                  <button
                    style={actionLinkStyle}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F4FF'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <Clapperboard size={13} />
                    Animate
                  </button>
                </>
              ) : (
                <>
                  <div className="group/editapp relative">
                    <button
                      disabled={selectedDigitalTwinIds.length === 0}
                      onClick={() => window.open(`${import.meta.env.BASE_URL}app/procedure-editor/${procedure.id}?mode=edit`, '_blank')}
                      style={selectedDigitalTwinIds.length === 0 ? actionLinkDisabledStyle : actionLinkStyle}
                      onMouseEnter={(e) => {
                        if (selectedDigitalTwinIds.length > 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F4FF';
                      }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <ExternalLink size={13} />
                      Edit in app
                    </button>
                    {selectedDigitalTwinIds.length === 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/editapp:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        Select a digital twin first
                      </div>
                    )}
                  </div>
                  <div className="group/editcanvas relative">
                    <button
                      disabled={selectedDigitalTwinIds.length === 0}
                      onClick={onOpenCanvas}
                      style={selectedDigitalTwinIds.length === 0 ? actionLinkDisabledStyle : actionLinkStyle}
                      onMouseEnter={(e) => {
                        if (selectedDigitalTwinIds.length > 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#F0F4FF';
                      }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <Edit2 size={13} />
                      Edit in canvas
                    </button>
                    {selectedDigitalTwinIds.length === 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#36415D] text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/editcanvas:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        Select a digital twin first
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: '#F0F1F4', margin: '0 0 14px 0' }} />

            {/* Unpublished changes indicator */}
            {canEdit && procedure.isPublished && (pendingChanges.length > 0 || procedure.hasUnpublishedChanges) && (
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div className="flex items-center gap-1.5" style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  borderRadius: 6,
                }}>
                  <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>Unpublished changes</span>
                </div>
              </div>
            )}

            {/* Editable title */}
            <div
              style={{ marginBottom: 10 }}
              onMouseEnter={() => canEdit && setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
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
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#36415D',
                    border: '2px solid #2E80ED',
                    borderRadius: 8,
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              ) : (
                <div
                  onClick={() => canEdit && setIsEditingTitle(true)}
                  className="flex items-center gap-2"
                  style={{
                    cursor: canEdit ? 'pointer' : 'default',
                    padding: '2px 4px',
                    borderRadius: 6,
                    transition: 'background 120ms',
                    backgroundColor: isTitleHovered && canEdit ? '#F5F6F8' : 'transparent',
                  }}
                >
                  <h2
                    id="procedure-modal-title"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#36415D',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {procedureName}
                  </h2>
                  {canEdit && (
                    <Edit2
                      size={15}
                      style={{
                        color: '#868D9E',
                        flexShrink: 0,
                        opacity: isTitleHovered ? 1 : 0,
                        transition: 'opacity 150ms',
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Description textarea — always visible */}
            <div style={{ position: 'relative' }}>
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setDescription(e.target.value);
                }}
                placeholder="Write a description (optional)..."
                rows={3}
                maxLength={500}
                disabled={!canEdit}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingBottom: 24,
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#5E677D',
                  lineHeight: '22px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E5EA',
                  borderRadius: 8,
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#2E80ED'; }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#E4E5EA'; }}
              />
              {canEdit && (
                <span style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 10,
                  fontSize: 10,
                  color: description.length > 450 ? '#FF1F1F' : '#C2C9DB',
                  fontWeight: 500,
                  pointerEvents: 'none',
                }}>
                  {description.length}/500
                </span>
              )}
            </div>
          </div>

          {/* ── Card 3: Properties ── */}
          <div style={{ ...cardStyle, padding: '6px 8px' }}>
            {/* Status */}
            <div
              style={{ ...propertyRowStyle, position: 'relative' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <span style={propertyLabelStyle}>Status</span>
              <span style={propertyValueStyle}>
                {isUnpublishing ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    backgroundColor: '#FFF7ED',
                    color: '#D97706',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    <span style={{ width: 12, height: 12, border: '2px solid #D97706', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Unpublishing...
                  </span>
                ) : procedure.isPublished ? (
                  <span
                    onClick={canPublish ? () => setShowStatusMenu(!showStatusMenu) : undefined}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 10px',
                      backgroundColor: 'rgba(11,158,77,0.1)',
                      color: '#0B9E4D',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: canPublish ? 'pointer' : 'default',
                      transition: 'filter 120ms',
                    }}
                    onMouseEnter={(e) => { if (canPublish) (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0B9E4D' }} />
                    Published
                    {canPublish && <ChevronDown size={12} style={{ marginLeft: 2 }} />}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    backgroundColor: '#F5F6F8',
                    color: '#868D9E',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#C2C9DB' }} />
                    Draft
                  </span>
                )}
              </span>

              {/* Status dropdown menu */}
              {showStatusMenu && procedure.isPublished && canPublish && (
                <div
                  ref={statusMenuRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 8,
                    marginTop: 4,
                    background: '#FFFFFF',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
                    border: '1px solid #E5E7EB',
                    padding: 4,
                    zIndex: 10,
                    minWidth: 160,
                  }}
                >
                  <button
                    onClick={handleUnpublish}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#D97706',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFF7ED'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <EyeOff size={14} />
                    Unpublish to draft
                  </button>
                </div>
              )}
            </div>

            {/* Digital Twin */}
            <div
              style={propertyRowStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <span style={propertyLabelStyle}>Digital Twin</span>
              <span style={propertyValueStyle}>
                {isDT ? (
                  <span style={{ color: '#2F80ED', fontWeight: 600 }}>{procedureName}</span>
                ) : selectedDigitalTwins.length > 0 ? (
                  <span style={{ color: '#2F80ED', fontWeight: 600 }}>
                    {selectedDigitalTwins.length === 1 ? selectedDigitalTwins[0]!.name : `${selectedDigitalTwins.length} selected`}
                  </span>
                ) : (
                  <span style={{ color: '#C2C9DB', fontStyle: 'italic' }}>None</span>
                )}
              </span>
            </div>

            {/* Created */}
            <div
              style={propertyRowStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <span style={propertyLabelStyle}>Created</span>
              <span style={propertyValueStyle}>
                {procedure.createdDate} &middot; {procedure.createdBy}
              </span>
            </div>

            {/* Last edited */}
            <div
              style={propertyRowStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <span style={propertyLabelStyle}>Last edited</span>
              <span style={propertyValueStyle}>
                {procedure.lastEdited} &middot; {procedure.lastEditedBy}
              </span>
            </div>

            {/* Published */}
            {procedure.isPublished && procedure.publishedVersion && (
              <div
                style={{ ...propertyRowStyle, borderBottom: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <span style={propertyLabelStyle}>Published</span>
                <span style={propertyValueStyle}>
                  v{procedure.publishedVersion} &middot; {procedure.publishedDate}
                </span>
              </div>
            )}
          </div>

          {/* ── Card 4: Settings (procedure) or Connected Flows (DT) ── */}
          {isDT ? (
            <div style={cardStyle}>
              {/* Connected Flows header */}
              <button
                onClick={() => setConnectedProceduresExpanded(!connectedProceduresExpanded)}
                className="flex items-center justify-between"
                style={{
                  width: '100%',
                  height: 46,
                  padding: '0 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFBFC'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                aria-expanded={connectedProceduresExpanded}
              >
                <div className="flex items-center gap-2">
                  <Link2 size={16} style={{ color: '#2F80ED' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#36415D' }}>Connected Flows</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#868D9E',
                    backgroundColor: '#F0F1F4',
                    borderRadius: 10,
                    padding: '1px 8px',
                  }}>
                    {connectedProcedures.length}
                  </span>
                </div>
                <ChevronDown size={14} style={{
                  color: '#868D9E',
                  transition: 'transform 200ms',
                  transform: connectedProceduresExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                }} />
              </button>

              {connectedProceduresExpanded && (
                <div style={{ padding: '0 12px 12px 12px', borderTop: '1px solid #F0F1F4' }}>
                  {connectedProcedures.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 16px' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F6F8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                      }}>
                        <FileText size={20} style={{ color: '#C2C9DB' }} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#36415D', marginBottom: 4 }}>
                        No connected flows
                      </p>
                      <p style={{ fontSize: 12, color: '#868D9E', lineHeight: 1.4 }}>
                        Create a flow and connect it to this digital twin to see it here
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
                      {connectedProcedures.map(proc => (
                        <div
                          key={proc.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenProcedure?.(proc)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenProcedure?.(proc); } }}
                          className="flex items-center gap-2"
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'background 120ms',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F6F8'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                        >
                          <FileText size={14} style={{ color: '#868D9E', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#36415D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {proc.name}
                          </span>
                          {proc.isPublished && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#0B9E4D',
                              backgroundColor: 'rgba(11,158,77,0.1)',
                              padding: '2px 8px',
                              borderRadius: 10,
                              flexShrink: 0,
                            }}>
                              Published
                            </span>
                          )}
                          <ChevronRight size={12} style={{ color: '#C2C9DB', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Settings — procedure mode: wrap ProcedureSettings in card */
            <div style={cardStyle}>
              <ProcedureSettings
                isExpanded={settingsExpanded}
                onToggleExpand={() => setSettingsExpanded(!settingsExpanded)}
                settings={procedureSettings}
                aiInstructions={aiInstructions}
                onSettingsChange={setProcedureSettings}
                onAIInstructionsChange={setAIInstructions}
              />
            </div>
          )}

          {/* ── Card 5: Version History ── */}
          <div style={cardStyle}>
            <VersionHistory
              isExpanded={versionHistoryExpanded}
              onToggleExpand={() => setVersionHistoryExpanded(!versionHistoryExpanded)}
              versions={versionHistory}
              onRollback={handleRollbackVersion}
            />
          </div>
        </div>

        {/* ══ PENDING CHANGES STRIP (above bottom bar) ══ */}
        {canPublish && procedure.isPublished && pendingChanges.length > 0 && (
          <div style={{
            backgroundColor: '#FFFBEB',
            borderTop: '1px solid #FDE68A',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowPendingChanges(!showPendingChanges)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(245,158,11,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <AlertCircle size={13} style={{ color: '#D97706', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706', flex: 1, textAlign: 'left' }}>
                {pendingChanges.length} pending change{pendingChanges.length !== 1 ? 's' : ''} to publish
              </span>
              {showPendingChanges ? (
                <ChevronDown size={13} style={{ color: '#D97706' }} />
              ) : (
                <ChevronUp size={13} style={{ color: '#D97706' }} />
              )}
            </button>
            {showPendingChanges && (
              <div style={{ padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {pendingChanges.map((change, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #FDE68A',
                    borderRadius: 6,
                    fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 600, color: '#92400E', flexShrink: 0 }}>{change.label}</span>
                    <span style={{ color: '#B45309' }}>{change.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ BOTTOM BAR ══ */}
        <div style={bottomBarStyle}>
          {/* Left side */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: '#868D9E', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} style={{ opacity: 0.6 }} />
              Last saved {lastSavedText}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {canPublish && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                style={{
                  height: 34,
                  padding: '0 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#0B9E4D',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 200ms',
                  boxShadow: '0 2px 8px rgba(11,158,77,0.25)',
                }}
                onMouseEnter={(e) => {
                  if (!isPublishing) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#0A8F44';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(11,158,77,0.35)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#0B9E4D';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(11,158,77,0.25)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {isPublishing && (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                {isPublishing ? 'Publishing...' : (procedure.isPublished ? 'Update' : 'Publish')}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// Embedded 3D Viewer — renders the actual digital-twin-scene or procedure editor in an iframe
interface Simple3DViewerProps {
  digitalTwinName: string;
  onClose: () => void;
  onOpenSettings?: () => void;
  procedureId?: string; // If provided, shows the procedure 3D view instead of the DT scene
}

function Simple3DViewer({ digitalTwinName, onClose, onOpenSettings, procedureId }: Simple3DViewerProps) {
  const baseUrl = import.meta.env.BASE_URL;
  const iframeSrc = procedureId
    ? `${baseUrl}app/procedure-editor/${procedureId}?mode=view&preview=true`
    : `${baseUrl}app/digital-twin-scene.html?embedded=true`;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for settings request from embedded 3D scene
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'open-flow-settings' && onOpenSettings) {
        onOpenSettings();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onOpenSettings]);

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[100] bg-black flex items-center justify-center" : "absolute inset-0 bg-black flex items-center justify-center"}>
      {/* Top-right buttons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div className="group/fs relative">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} className="text-white" /> : <Maximize2 size={14} className="text-white" />}
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 bg-black/70 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/fs:opacity-100 pointer-events-none transition-opacity backdrop-blur-sm">
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </div>
        </div>
        <div className="group/close3d relative">
          <button
            onClick={() => { setIsFullscreen(false); onClose(); }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
            aria-label="Close 3D viewer"
          >
            <X size={16} className="text-white" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 bg-black/70 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/close3d:opacity-100 pointer-events-none transition-opacity backdrop-blur-sm">
            Close viewer
          </div>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        src={iframeSrc}
        className="w-full h-full border-0"
        title={digitalTwinName}
        allow="autoplay"
      />
    </div>
  );
}
