import { X, Search, Plus, MoreVertical, Copy, Trash2, ChevronDown, ChevronRight, Upload, Download, Shield, Sliders, GripVertical, Pencil, PlusSquare, MinusSquare, Eye, Link2, FolderOpen, FolderPlus, FolderInput } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../hooks/useClickOutside';
import { MOCK_CONFIGURATIONS, MOCK_FOLDERS, type Configuration, type ConfigFolder } from './configurationsData';
import { ROLES, type UserRole } from '../contexts/RoleContext';
import { FrontlineWindow } from '../components/procedure-editor/FrontlineWindow';

interface ConfigurationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Toast Component ─────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto"
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-[10px] shadow-elevation-lg bg-white"
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: '13px',
          fontWeight: 500,
          color: '#36415D',
          border: '1px solid #E9E9E9',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#2F80ED',
            flexShrink: 0,
          }}
        />
        <span>{message}</span>
        <button onClick={onDismiss} className="hover:bg-[#F5F5F5] transition-colors rounded-md p-1 -mr-1" style={{ color: '#C2C9DB' }}>
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Confirm Dialog ──────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-white rounded-[14px] shadow-elevation-lg w-[calc(100vw-48px)] max-w-[380px]"
        style={{
          padding: '24px',
          border: '1px solid #E9E9E9',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: 'var(--font-family)', fontSize: '16px', fontWeight: 600, color: '#36415D', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'var(--font-family)', fontSize: '13px', color: '#868D9E', marginBottom: '24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div className="flex justify-end" style={{ gap: '10px' }}>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-[8px] hover:bg-[#F5F5F5] active:scale-[0.97] transition-all min-h-[40px]"
            style={{ fontFamily: 'var(--font-family)', fontSize: '13px', fontWeight: 500, color: '#36415D', border: '1px solid #C2C9DB' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-[8px] text-white hover:opacity-90 active:scale-[0.97] transition-all min-h-[40px]"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: confirmColor,
              boxShadow: `0 2px 8px ${confirmColor}40`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Configuration List Item ─────────────────────────────────────────

interface ConfigItemProps {
  config: Configuration;
  isActive: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onStartInlineRename: () => void;
  onToggleChecked: (shiftKey: boolean) => void;
  onCopyLink: () => void;
  onMoveToFolder: (folderId: string | undefined) => void;
  folders: ConfigFolder[];
}

function ConfigItem({ config, isActive, isChecked, onSelect, onToggleEnabled, onDuplicate, onDelete, onRename, onStartInlineRename, onToggleChecked, onCopyLink, onMoveToFolder, folders }: ConfigItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(config.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside([menuRef, menuBtnRef], () => setShowMenu(false), showMenu);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== config.name) {
      onRename(trimmed);
    } else {
      setEditName(config.name);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group cursor-pointer transition-all ${isActive ? '' : 'hover:bg-[#E9E9E9]/40'}`}
      data-demo={`config-item-${config.id}`}
      data-config-default={config.isDefault ? 'true' : undefined}
      style={{
        padding: '5px 8px',
        borderRadius: '8px',
        backgroundColor: isActive ? '#D9E0F0' : undefined,
        borderLeft: isActive ? '3px solid #2F80ED' : '3px solid transparent',
      }}
      onClick={onSelect}
    >
      <div className="flex items-center" style={{ gap: '6px', minHeight: '30px' }}>
        {/* Multi-select checkbox for non-default configs */}
        {!config.isDefault && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleChecked(e.nativeEvent instanceof MouseEvent ? e.nativeEvent.shiftKey : false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 accent-[#2F80ED]"
            style={{ width: '13px', height: '13px', cursor: 'pointer' }}
          />
        )}

        {/* Active indicator */}
        <div
          className="flex-shrink-0 rounded-full transition-colors"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: config.isEnabled ? (isActive ? '#2F80ED' : '#11E874') : '#C2C9DB',
            boxShadow: isActive ? '0 0 0 2px rgba(47,128,237,0.2)' : undefined,
          }}
        />

        {/* Name / inline edit */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setEditName(config.name); setIsEditing(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white border outline-none px-1.5 py-0.5"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '12px',
                color: '#36415D',
                borderColor: '#2E80ED',
                borderRadius: '6px',
                boxShadow: '0 0 0 2px rgba(46,128,237,0.12)',
              }}
            />
          ) : (
            <span
              className="truncate block"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: config.isEnabled ? '#36415D' : '#7F7F7F',
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {config.name}
            </span>
          )}
        </div>

        {/* Badges */}
        {config.isDefault && (
          <span
            className="flex-shrink-0"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '9px',
              fontWeight: 600,
              color: '#2F80ED',
              backgroundColor: 'rgba(47, 128, 237,0.08)',
              padding: '2px 6px',
              borderRadius: '99px',
              lineHeight: '13px',
              letterSpacing: '0.3px',
            }}
          >
            DEFAULT
          </span>
        )}

        {/* Enable/disable checkbox */}
        {!config.isDefault && (
          <input
            type="checkbox"
            checked={config.isEnabled}
            onChange={(e) => {
              e.stopPropagation();
              onToggleEnabled();
            }}
            onClick={(e) => e.stopPropagation()}
            title={config.isEnabled ? 'Disable configuration' : 'Enable configuration'}
            className="flex-shrink-0 accent-[#2F80ED]"
            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
          />
        )}

        {/* Three-dot menu */}
        <div className="flex-shrink-0">
            <button
              ref={menuBtnRef}
              data-demo="config-menu-btn"
              className="opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-[#E9E9E9] flex items-center justify-center"
              style={{ width: '24px', height: '24px' }}
              onClick={(e) => {
                e.stopPropagation();
                if (!showMenu && menuBtnRef.current) {
                  const rect = menuBtnRef.current.getBoundingClientRect();
                  setMenuPos({ top: rect.bottom + 4, left: rect.right - 130 });
                }
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="size-3" style={{ color: '#868D9E' }} />
            </button>
            <AnimatePresence>
              {showMenu && menuPos && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="fixed bg-white border rounded-[10px] shadow-elevation-lg z-[100]"
                  style={{ minWidth: '150px', top: menuPos.top, left: menuPos.left, borderColor: '#E9E9E9' }}
                >
                  <div style={{ padding: '4px' }}>
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[32px]"
                      style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setIsEditing(true);
                        onStartInlineRename();
                      }}
                    >
                      <Pencil className="size-3.5" style={{ color: '#868D9E' }} />
                      Rename
                    </button>
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[32px]"
                      style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                        setShowMenu(false);
                      }}
                    >
                      <Copy className="size-3.5" style={{ color: '#868D9E' }} />
                      Duplicate
                    </button>
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[32px]"
                      style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onCopyLink();
                      }}
                    >
                      <Link2 className="size-3.5" style={{ color: '#868D9E' }} />
                      Copy Link
                    </button>
                    {/* Move to Folder */}
                    <div className="relative">
                      <button
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[32px]"
                        style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoveSubmenu(!showMoveSubmenu);
                        }}
                      >
                        <FolderInput className="size-3.5" style={{ color: '#868D9E' }} />
                        Move to Folder
                        <ChevronRight className="size-3 ml-auto" style={{ color: '#C2C9DB' }} />
                      </button>
                      {showMoveSubmenu && (
                        <div
                          className="absolute left-full top-0 ml-1 bg-white border rounded-[10px] shadow-elevation-lg z-[101]"
                          style={{ minWidth: '130px', borderColor: '#E9E9E9' }}
                        >
                          <div style={{ padding: '4px' }}>
                            {config.folderId && (
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[30px]"
                                style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E', fontStyle: 'italic' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveToFolder(undefined);
                                  setShowMenu(false);
                                  setShowMoveSubmenu(false);
                                }}
                              >
                                No folder (root)
                              </button>
                            )}
                            {folders.filter((f) => f.id !== config.folderId).map((folder) => (
                              <button
                                key={folder.id}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[30px]"
                                style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#36415D' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveToFolder(folder.id);
                                  setShowMenu(false);
                                  setShowMoveSubmenu(false);
                                }}
                              >
                                <FolderOpen className="size-3" style={{ color: '#868D9E' }} />
                                {folder.name}
                              </button>
                            ))}
                            {folders.filter((f) => f.id !== config.folderId).length === 0 && !config.folderId && (
                              <span
                                className="block px-3 py-2"
                                style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#C2C9DB', fontStyle: 'italic' }}
                              >
                                No folders yet
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#E9E9E9', margin: '3px 8px' }} />
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#FF1F1F]/8 transition-colors text-left min-h-[32px]"
                      style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#FF1F1F' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Folder Item ─────────────────────────────────────────────────────

interface FolderItemProps {
  folder: ConfigFolder;
  configCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function FolderItem({ folder, configCount, isExpanded, onToggleExpand, onRename, onDelete }: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside([menuRef, menuBtnRef], () => setShowMenu(false), showMenu);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(trimmed);
    } else {
      setEditName(folder.name);
    }
    setIsEditing(false);
  };

  return (
    <div
      className="group cursor-pointer transition-all hover:bg-[#E9E9E9]/40"
      style={{
        padding: '5px 8px',
        borderRadius: '8px',
        marginTop: '6px',
      }}
      onClick={onToggleExpand}
    >
      <div className="flex items-center" style={{ gap: '6px', minHeight: '30px' }}>
        <div className="flex-shrink-0 transition-transform" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="size-3" style={{ color: '#868D9E' }} />
        </div>
        <FolderOpen className="size-3.5 flex-shrink-0" style={{ color: isExpanded ? '#2F80ED' : '#868D9E' }} />

        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setEditName(folder.name); setIsEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-white border outline-none px-1.5 py-0.5"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              color: '#36415D',
              borderColor: '#2E80ED',
              borderRadius: '6px',
              boxShadow: '0 0 0 2px rgba(46,128,237,0.12)',
            }}
          />
        ) : (
          <span
            className="flex-1 min-w-0 truncate"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#36415D',
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {folder.name}
          </span>
        )}

        <span
          className="flex-shrink-0"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '10px',
            fontWeight: 600,
            color: '#868D9E',
            backgroundColor: '#E9E9E9',
            padding: '1px 6px',
            borderRadius: '99px',
            lineHeight: '14px',
          }}
        >
          {configCount}
        </span>

        {/* Folder menu */}
        <div className="flex-shrink-0">
          <button
            ref={menuBtnRef}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-[#E9E9E9] flex items-center justify-center"
            style={{ width: '24px', height: '24px' }}
            onClick={(e) => {
              e.stopPropagation();
              if (!showMenu && menuBtnRef.current) {
                const rect = menuBtnRef.current.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 4, left: rect.right - 130 });
              }
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="size-3" style={{ color: '#868D9E' }} />
          </button>
          <AnimatePresence>
            {showMenu && menuPos && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed bg-white border rounded-[10px] shadow-elevation-lg z-[100]"
                style={{ minWidth: '140px', top: menuPos.top, left: menuPos.left, borderColor: '#E9E9E9' }}
              >
                <div style={{ padding: '4px' }}>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[32px]"
                    style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="size-3.5" style={{ color: '#868D9E' }} />
                    Rename
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#E9E9E9', margin: '3px 8px' }} />
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] hover:bg-[#FF1F1F]/8 transition-colors text-left min-h-[32px]"
                    style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#FF1F1F' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete Folder
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Detail Section ──────────────────────────────────────────────────

interface DetailSectionProps {
  config: Configuration;
  onUpdate: (updates: Partial<Configuration>) => void;
  onShowToast: (message: string) => void;
}

function DetailSection({ config, onUpdate, onShowToast }: DetailSectionProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [tagInput, setTagInput] = useState('');
  // GAP 9 (FR17-18): Add/Remove parts hidden by default until parts selected in 3D
  const [hasSelectedParts, setHasSelectedParts] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !config.tags.includes(tag)) {
      onUpdate({ tags: [...config.tags, tag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate({ tags: config.tags.filter((t) => t !== tag) });
  };

  const handleToggleRole = (role: UserRole) => {
    if (config.permittedRoles.includes(role)) {
      const newRoles = config.permittedRoles.filter((r) => r !== role);
      onUpdate({ permittedRoles: newRoles });
      if (newRoles.length === 0) {
        onShowToast('No roles selected \u2014 this configuration will be invisible to all users.');
      }
    } else {
      onUpdate({ permittedRoles: [...config.permittedRoles, role] });
    }
  };

  const roleEntries = Object.values(ROLES);

  const visibleCount = Object.values(config.partStates).filter(Boolean).length;
  const hiddenCount = Object.values(config.partStates).filter(v => !v).length;
  const hasPartStates = Object.keys(config.partStates).length > 0;

  return (
    <div data-demo="configurations-detail" className="overflow-y-auto" style={{ padding: '14px 16px 16px' }}>
      {/* ── Header badge ── */}
      {config.isDefault ? (
        <div
          className="flex items-center gap-2 mb-4"
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(47, 128, 237, 0.05)',
            border: '1px solid rgba(47, 128, 237, 0.1)',
          }}
        >
          <Shield className="size-3.5 shrink-0" style={{ color: '#2F80ED' }} />
          <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#2F80ED', fontWeight: 600 }}>
            Default Configuration
          </span>
          <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E', marginLeft: 'auto' }}>
            Always pre-selected
          </span>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 mb-4"
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: config.isEnabled ? 'rgba(17, 232, 116, 0.06)' : 'rgba(127,127,127,0.06)',
            border: `1px solid ${config.isEnabled ? 'rgba(17, 232, 116, 0.15)' : 'rgba(127,127,127,0.12)'}`,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: config.isEnabled ? '#11E874' : '#C2C9DB',
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: config.isEnabled ? '#36415D' : '#868D9E', fontWeight: 600 }}>
            {config.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          {config.tags.length > 0 && (
            <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#C2C9DB', marginLeft: 'auto' }}>
              {config.tags[0]}
            </span>
          )}
        </div>
      )}

      {/* ── Identity Section ── */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ fontFamily: 'var(--font-family)', fontSize: '11px', fontWeight: 600, color: '#868D9E', display: 'block', marginBottom: '4px', letterSpacing: '0.3px', textTransform: 'uppercase' }}
        >
          Name
        </label>
        <input
          value={config.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Configuration name..."
          className="w-full bg-white border outline-none mb-3 min-h-[36px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all placeholder:text-[#C2C9DB]"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '13px',
            fontWeight: 500,
            color: '#36415D',
            borderColor: '#C2C9DB',
            borderRadius: '8px',
            padding: '7px 10px',
          }}
        />

        <label
          style={{ fontFamily: 'var(--font-family)', fontSize: '11px', fontWeight: 600, color: '#868D9E', display: 'block', marginBottom: '4px', letterSpacing: '0.3px', textTransform: 'uppercase' }}
        >
          Description
        </label>
        <textarea
          value={config.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe this configuration..."
          rows={3}
          className="w-full bg-white border outline-none resize-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all placeholder:text-[#C2C9DB]"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '13px',
            color: '#36415D',
            borderColor: '#C2C9DB',
            borderRadius: '8px',
            padding: '7px 10px',
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* ── Tags Section ── */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ fontFamily: 'var(--font-family)', fontSize: '11px', fontWeight: 600, color: '#868D9E', display: 'block', marginBottom: '6px', letterSpacing: '0.3px', textTransform: 'uppercase' }}
        >
          Tags
        </label>
        <div className="flex flex-wrap mb-2" style={{ gap: '5px' }}>
          {config.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center group/tag hover:bg-[#D9E0F0] transition-colors"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '11px',
                fontWeight: 500,
                color: '#36415D',
                backgroundColor: '#E9E9E9',
                padding: '3px 6px 3px 9px',
                borderRadius: '99px',
                lineHeight: '16px',
                gap: '3px',
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-black/5"
                style={{ color: '#36415D' }}
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
          {config.tags.length === 0 && (
            <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#C2C9DB' }}>
              No tags yet — add one below
            </span>
          )}
        </div>
        <div data-demo="configurations-tags" className="flex" style={{ gap: '6px' }}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
            }}
            placeholder="Add tag..."
            data-demo="configurations-tag-input"
            className="flex-1 bg-white border outline-none min-h-[32px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              color: '#36415D',
              borderColor: '#C2C9DB',
              borderRadius: '8px',
              padding: '4px 10px',
            }}
          />
          <button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="px-3 rounded-[8px] hover:opacity-90 active:scale-[0.95] transition-all min-h-[32px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: '#2F80ED',
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #E9E9E9 15%, #E9E9E9 85%, transparent 100%)', margin: '0 -16px 16px' }} />

      {/* ── 3D Scene Actions ── */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ fontFamily: 'var(--font-family)', fontSize: '11px', fontWeight: 600, color: '#868D9E', display: 'block', marginBottom: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}
        >
          Scene State
        </label>

        {/* Captured parts summary */}
        {hasPartStates && (() => {
          const total = visibleCount + hiddenCount;
          const visiblePct = total > 0 ? (visibleCount / total) * 100 : 0;
          return (
            <div
              className="mb-3 rounded-[10px]"
              style={{
                padding: '12px',
                backgroundColor: 'rgba(47, 128, 237, 0.04)',
                border: '1px solid rgba(47, 128, 237, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="size-3.5" style={{ color: '#2F80ED' }} />
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '12px', fontWeight: 600, color: '#2F80ED' }}>
                    State Captured
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-family)', fontSize: '10px', color: '#868D9E' }}>
                  {total} parts
                </span>
              </div>
              {/* Mini visibility bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '99px',
                  backgroundColor: '#E9E9E9',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: `${visiblePct}%`,
                    height: '100%',
                    borderRadius: '99px',
                    backgroundColor: '#11E874',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#11E874' }} />
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#36415D' }}>
                    <strong style={{ fontWeight: 600 }}>{visibleCount}</strong> visible
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#E9E9E9' }} />
                  <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E' }}>
                    <strong style={{ fontWeight: 600 }}>{hiddenCount}</strong> hidden
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Set from View button */}
        <button
          data-demo="configurations-set-from-view"
          className="w-full flex items-center justify-center gap-2.5 rounded-[10px] mb-3 hover:shadow-[0_4px_16px_rgba(47,128,237,0.3)] active:scale-[0.97] transition-all min-h-[42px]"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #2F80ED 0%, #004FFF 100%)',
            padding: '9px 16px',
            boxShadow: '0 2px 8px rgba(47,128,237,0.2)',
          }}
          onClick={() => {
            onShowToast('Configuration updated from current view');
          }}
        >
          <Sliders className="size-4" />
          Set from View
        </button>

        {/* Add/Remove selected parts — FR17-18: hidden until parts selected */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {hasSelectedParts ? (
            <div
              className="rounded-[10px]"
              style={{
                padding: '10px',
                backgroundColor: 'rgba(47,128,237,0.04)',
                border: '1px solid rgba(47,128,237,0.1)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#2F80ED', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Parts selected — choose action:
              </span>
              <div className="flex" style={{ gap: '6px' }}>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[8px] hover:bg-white active:scale-[0.97] transition-all min-h-[34px] border"
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2F80ED',
                    borderColor: 'rgba(47,128,237,0.2)',
                    backgroundColor: 'white',
                    padding: '6px 10px',
                  }}
                  onClick={() => onShowToast('Selected parts added to configuration')}
                >
                  <PlusSquare className="size-3.5" />
                  Add
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[8px] hover:bg-white active:scale-[0.97] transition-all min-h-[34px] border"
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FF1F1F',
                    borderColor: 'rgba(255,31,31,0.2)',
                    backgroundColor: 'white',
                    padding: '6px 10px',
                  }}
                  onClick={() => onShowToast('Selected parts removed from configuration')}
                >
                  <MinusSquare className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center rounded-[10px]"
              style={{
                padding: '10px 12px',
                backgroundColor: '#F5F5F5',
                border: '1px dashed #E9E9E9',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#E9E9E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Eye className="size-3.5" style={{ color: '#C2C9DB' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E', flex: 1, lineHeight: 1.4 }}>
                Select parts in the 3D view to add or remove them.
              </span>
            </div>
          )}
          {/* Demo toggle for part selection simulation */}
          <button
            onClick={() => setHasSelectedParts((v) => !v)}
            className="flex items-center justify-center gap-1 rounded-[8px] hover:opacity-80 transition-opacity"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '10px',
              color: '#C2C9DB',
              background: 'none',
              border: '1px dashed #E9E9E9',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            {hasSelectedParts ? 'Clear part selection (demo)' : 'Simulate part selection (demo)'}
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #E9E9E9 15%, #E9E9E9 85%, transparent 100%)', margin: '0 -16px 16px' }} />

      {/* ── Settings Section ── */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ fontFamily: 'var(--font-family)', fontSize: '11px', fontWeight: 600, color: '#868D9E', display: 'block', marginBottom: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}
        >
          Settings
        </label>

        {/* Enable/Disable checkbox */}
        {!config.isDefault && (
          <label
            className="flex items-center gap-3 mb-3 cursor-pointer min-h-[38px] rounded-[10px] hover:bg-[#E9E9E9]/40 transition-colors px-3 -mx-3 py-2"
            style={{
              border: `1px solid ${config.isEnabled ? 'rgba(17,232,116,0.15)' : '#E9E9E9'}`,
              backgroundColor: config.isEnabled ? 'rgba(17,232,116,0.03)' : undefined,
            }}
          >
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={() => onUpdate({ isEnabled: !config.isEnabled })}
              className="accent-[#11E874]"
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <div className="flex-1">
              <span style={{ fontFamily: 'var(--font-family)', fontSize: '13px', color: '#36415D', fontWeight: 500, display: 'block' }}>
                {config.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <span style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E' }}>
                {config.isEnabled ? 'Visible to permitted roles' : 'Hidden from all users'}
              </span>
            </div>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: config.isEnabled ? '#11E874' : '#C2C9DB',
                flexShrink: 0,
                boxShadow: config.isEnabled ? '0 0 0 3px rgba(17,232,116,0.15)' : undefined,
              }}
            />
          </label>
        )}

        {/* Permissions (expandable) */}
        <div
          data-demo="configurations-permissions"
          className="border rounded-[10px] overflow-hidden"
          style={{ borderColor: '#E9E9E9' }}
        >
          <button
            data-demo="configurations-permissions-btn"
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#E9E9E9]/50 transition-colors min-h-[40px]"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            <div className="flex items-center" style={{ gap: '6px' }}>
              <Shield className="size-3.5" style={{ color: '#2F80ED' }} />
              <span style={{ fontFamily: 'var(--font-family)', fontSize: '13px', fontWeight: 500, color: '#36415D' }}>
                Permissions
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#2F80ED',
                  backgroundColor: 'rgba(47, 128, 237, 0.08)',
                  padding: '1px 6px',
                  borderRadius: '99px',
                }}
              >
                {config.permittedRoles.length}
              </span>
            </div>
            <div className="transition-transform" style={{ transform: showPermissions ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <ChevronDown className="size-3.5" style={{ color: '#868D9E' }} />
            </div>
          </button>
          <AnimatePresence>
            {showPermissions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div
                  className="border-t"
                  style={{ borderColor: '#E9E9E9', padding: '6px 8px' }}
                >
                  {roleEntries.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2.5 py-1.5 cursor-pointer min-h-[30px] rounded-md hover:bg-[#E9E9E9]/40 transition-colors px-2"
                    >
                      <input
                        type="checkbox"
                        checked={config.permittedRoles.includes(role.id)}
                        onChange={() => handleToggleRole(role.id)}
                        className="accent-[#2F80ED] flex-shrink-0"
                        style={{ width: '14px', height: '14px' }}
                      />
                      <span style={{ fontFamily: 'var(--font-family)', fontSize: '12px', color: '#36415D' }}>
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #E9E9E9 15%, #E9E9E9 85%, transparent 100%)', margin: '0 -16px 12px' }} />
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#C2C9DB', margin: 0 }}>
          {new Date(config.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        {!config.isDefault && (
          <button
            onClick={() => onShowToast('Use the context menu in the list to delete')}
            className="flex items-center gap-1.5 hover:bg-[#FF1F1F]/6 active:scale-[0.97] transition-all rounded-[6px]"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: '11px',
              fontWeight: 500,
              color: '#C2C9DB',
              padding: '4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF1F1F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#C2C9DB'; }}
          >
            <Trash2 className="size-3" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Panel Component ────────────────────────────────────────────

export function ConfigurationsPanel({ isOpen, onClose }: ConfigurationsPanelProps) {
  const [configurations, setConfigurations] = useState<Configuration[]>(MOCK_CONFIGURATIONS);
  const [folders, setFolders] = useState<ConfigFolder[]>(MOCK_FOLDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('config-default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    onConfirm: () => void;
  } | null>(null);
  const [importConfirmPending, setImportConfirmPending] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const lastCheckedIdRef = useRef<string | null>(null);
  const [showMoveToFolderMenu, setShowMoveToFolderMenu] = useState(false);
  const moveBtnRef = useRef<HTMLButtonElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const [moveMenuPos, setMoveMenuPos] = useState<{ top: number; left: number } | null>(null);

  useClickOutside([moveMenuRef, moveBtnRef], () => setShowMoveToFolderMenu(false), showMoveToFolderMenu);

  const selectedConfig = configurations.find((c) => c.id === selectedId) ?? null;

  // Filter by search query (name and tags)
  const filteredConfigs = configurations.filter((config) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      config.name.toLowerCase().includes(q) ||
      config.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  // Group configs: root-level (no folder) and per-folder
  const rootConfigs = filteredConfigs.filter((c) => !c.folderId);
  const configsByFolder = folders.reduce<Record<string, Configuration[]>>((acc, folder) => {
    acc[folder.id] = filteredConfigs.filter((c) => c.folderId === folder.id);
    return acc;
  }, {});

  // Flat ordered list of selectable (non-default) config IDs, matching display order
  const selectableOrderedIds = [
    ...rootConfigs.filter((c) => !c.isDefault).map((c) => c.id),
    ...folders.flatMap((folder) => (configsByFolder[folder.id] || []).filter((c) => !c.isDefault).map((c) => c.id)),
  ];

  const handleToggleCheckedWithShift = useCallback((configId: string, shiftKey: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastCheckedIdRef.current && lastCheckedIdRef.current !== configId) {
        const lastIdx = selectableOrderedIds.indexOf(lastCheckedIdRef.current);
        const curIdx = selectableOrderedIds.indexOf(configId);
        if (lastIdx !== -1 && curIdx !== -1) {
          const from = Math.min(lastIdx, curIdx);
          const to = Math.max(lastIdx, curIdx);
          for (let i = from; i <= to; i++) {
            next.add(selectableOrderedIds[i]);
          }
          return next;
        }
      }
      // Normal toggle
      if (next.has(configId)) next.delete(configId);
      else next.add(configId);
      return next;
    });
    lastCheckedIdRef.current = configId;
  }, [selectableOrderedIds]);

  const handleCreateConfiguration = useCallback(() => {
    // Find a unique name (auto-increment "Configuration N")
    let counter = 1;
    while (configurations.some((c) => c.name === `Configuration ${counter}`)) counter++;
    const baseName = `Configuration ${counter}`;

    // Capture the current 3D scene's part visibility as the initial state
    // (In a real app this would read from the 3D iframe; here we simulate a snapshot)
    const capturedPartStates: Record<string, boolean> = {
      'EngineBlock': true,
      'Alternator': true,
      'FuelSystem': true,
      'CoolantAssembly': true,
      'ExhaustManifold': true,
      'ControlPanel': true,
      'OilFilter': true,
      'AirFilter': true,
      'BeltDrive': true,
      'FuelTank': true,
    };

    const newConfig: Configuration = {
      id: `config-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: baseName,
      description: '',
      tags: [],
      isEnabled: true,
      isDefault: false,
      isReadOnly: false,
      lastUpdated: new Date().toISOString(),
      sortOrder: configurations.length,
      permittedRoles: ['content-creator', 'admin'],
      partStates: capturedPartStates,
    };
    setConfigurations((prev) => [...prev, newConfig]);
    // Auto-activate — you're now "in" this config
    setSelectedId(newConfig.id);
    setToastMessage('Configuration created — current scene state captured');
  }, [configurations]);

  const handleDuplicate = useCallback((configId: string) => {
    const source = configurations.find((c) => c.id === configId);
    if (!source) return;
    const duplicate: Configuration = {
      ...source,
      id: `config-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${source.name} (Copy)`,
      isDefault: false,
      isReadOnly: false,
      lastUpdated: new Date().toISOString(),
      sortOrder: configurations.length,
    };
    setConfigurations((prev) => [...prev, duplicate]);
    setSelectedId(duplicate.id);
    setToastMessage(`Duplicated "${source.name}"`);
  }, [configurations]);

  const handleDelete = useCallback((configId: string) => {
    const config = configurations.find((c) => c.id === configId);
    if (!config || config.isDefault) return;
    setConfirmDialog({
      title: 'Delete Configuration',
      message: `Are you sure you want to delete "${config.name}"?`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setConfigurations((prev) => prev.filter((c) => c.id !== configId));
        if (selectedId === configId) setSelectedId('config-default');
        setConfirmDialog(null);
        setToastMessage(`Deleted "${config.name}"`);
      },
    });
  }, [configurations, selectedId]);

  const handleToggleEnabled = useCallback((configId: string) => {
    setConfigurations((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, isEnabled: !c.isEnabled, lastUpdated: new Date().toISOString() } : c))
    );
  }, []);

  const handleRename = useCallback((configId: string, name: string) => {
    // Duplicate name validation (Fix 6)
    const duplicate = configurations.find((c) => c.id !== configId && c.name === name);
    if (duplicate) {
      setToastMessage('A configuration with this name already exists');
      return;
    }
    setConfigurations((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, name, lastUpdated: new Date().toISOString() } : c))
    );
  }, [configurations]);

  const handleUpdateSelected = useCallback((updates: Partial<Configuration>) => {
    if (!selectedId) return;
    // Duplicate name validation when renaming from detail section (Fix 6)
    if (updates.name !== undefined) {
      const duplicate = configurations.find((c) => c.id !== selectedId && c.name === updates.name);
      if (duplicate) {
        setToastMessage('A configuration with this name already exists');
        return;
      }
    }
    setConfigurations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, ...updates, lastUpdated: new Date().toISOString() } : c
      )
    );
  }, [selectedId, configurations]);

  const handleImport = useCallback(() => {
    // Simulate import flow
    setImportConfirmPending(true);
    setConfirmDialog({
      title: 'Import Configurations',
      message: 'Some configurations in the imported file don\'t exist in this digital twin. Regenerate missing configurations from the import data?',
      confirmLabel: 'Regenerate',
      confirmColor: '#2F80ED',
      onConfirm: () => {
        // Actually add a mock imported config (Fix 7)
        const importedConfig: Configuration = {
          id: `config-imported-${Date.now()}`,
          name: 'Imported Configuration',
          description: 'Configuration imported from external file. Contains custom part visibility states and regional settings.',
          tags: ['imported', 'external'],
          isEnabled: true,
          isDefault: false,
          isReadOnly: false,
          lastUpdated: new Date().toISOString(),
          sortOrder: configurations.length,
          permittedRoles: ['field-service-engineer', 'content-creator', 'admin'],
          partStates: {
            'CoolantAssembly': true,
            'PremiumExhaust': false,
            'AuxPowerModule': true,
          },
        };
        setConfigurations((prev) => [...prev, importedConfig]);
        setSelectedId(importedConfig.id);
        setConfirmDialog(null);
        setImportConfirmPending(false);
        setToastMessage('Configurations imported successfully');
      },
    });
  }, [configurations.length]);

  const handleExport = useCallback(() => {
    setToastMessage('Configurations exported to file');
  }, []);

  // Bulk operations (Fix 4)
  const handleBulkDelete = useCallback(() => {
    if (checkedIds.size === 0) return;
    const names = configurations.filter((c) => checkedIds.has(c.id)).map((c) => c.name);
    setConfirmDialog({
      title: 'Delete Selected Configurations',
      message: `Are you sure you want to delete ${checkedIds.size} configuration${checkedIds.size > 1 ? 's' : ''}?`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setConfigurations((prev) => prev.filter((c) => !checkedIds.has(c.id)));
        if (selectedId && checkedIds.has(selectedId)) setSelectedId('config-default');
        setCheckedIds(new Set());
        setConfirmDialog(null);
        setToastMessage(`Deleted ${names.length} configuration${names.length > 1 ? 's' : ''}`);
      },
    });
  }, [checkedIds, configurations, selectedId]);

  const handleBulkToggleEnabled = useCallback(() => {
    if (checkedIds.size === 0) return;
    // If all checked are enabled, disable them. Otherwise enable them.
    const checkedConfigs = configurations.filter((c) => checkedIds.has(c.id));
    const allEnabled = checkedConfigs.every((c) => c.isEnabled);
    setConfigurations((prev) =>
      prev.map((c) =>
        checkedIds.has(c.id) ? { ...c, isEnabled: !allEnabled, lastUpdated: new Date().toISOString() } : c
      )
    );
    setToastMessage(allEnabled ? `Disabled ${checkedIds.size} configurations` : `Enabled ${checkedIds.size} configurations`);
    setCheckedIds(new Set());
  }, [checkedIds, configurations]);

  // Move single config to folder
  const handleMoveToFolder = useCallback((configId: string, folderId: string | undefined) => {
    setConfigurations((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, folderId, lastUpdated: new Date().toISOString() } : c))
    );
    const folderName = folderId ? folders.find((f) => f.id === folderId)?.name : 'root';
    setToastMessage(`Moved to ${folderName}`);
  }, [folders]);

  // Bulk move to folder
  const handleBulkMoveToFolder = useCallback((folderId: string | undefined) => {
    if (checkedIds.size === 0) return;
    setConfigurations((prev) =>
      prev.map((c) => (checkedIds.has(c.id) ? { ...c, folderId, lastUpdated: new Date().toISOString() } : c))
    );
    const folderName = folderId ? folders.find((f) => f.id === folderId)?.name : 'root';
    setToastMessage(`Moved ${checkedIds.size} configurations to ${folderName}`);
    setCheckedIds(new Set());
    setShowMoveToFolderMenu(false);
  }, [checkedIds, folders]);

  // Folder CRUD
  const handleCreateFolder = useCallback(() => {
    let counter = 1;
    while (folders.some((f) => f.name === `New Folder ${counter}`)) counter++;
    const newFolder: ConfigFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `New Folder ${counter}`,
      isExpanded: true,
      sortOrder: folders.length,
    };
    setFolders((prev) => [...prev, newFolder]);
    setToastMessage('Folder created');
  }, [folders]);

  const handleRenameFolder = useCallback((folderId: string, name: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name } : f)));
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    const configsInFolder = configurations.filter((c) => c.folderId === folderId);
    setConfirmDialog({
      title: 'Delete Folder',
      message: configsInFolder.length > 0
        ? `"${folder.name}" contains ${configsInFolder.length} configuration${configsInFolder.length > 1 ? 's' : ''}. They will be moved to the root level.`
        : `Delete folder "${folder.name}"?`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        // Move contained configs to root
        setConfigurations((prev) =>
          prev.map((c) => (c.folderId === folderId ? { ...c, folderId: undefined } : c))
        );
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        setConfirmDialog(null);
        setToastMessage(`Deleted folder "${folder.name}"`);
      },
    });
  }, [folders, configurations]);

  const handleToggleFolderExpand = useCallback((folderId: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f)));
  }, []);

  // Select all / deselect all
  const selectableConfigs = filteredConfigs.filter((c) => !c.isDefault);
  const allSelected = selectableConfigs.length > 0 && selectableConfigs.every((c) => checkedIds.has(c.id));

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(selectableConfigs.map((c) => c.id)));
    }
  }, [allSelected, selectableConfigs]);

  // Close handler with toast for active non-default config (Fix 14)
  const handleClose = useCallback(() => {
    if (selectedId && selectedId !== 'config-default') {
      const sc = configurations.find((c) => c.id === selectedId);
      if (sc && !sc.isDefault) {
        setToastMessage('Configuration state saved. View reset to default.');
      }
    }
    onClose();
  }, [onClose, selectedId, configurations]);

  return (
    <>
      {/* Configurations List — FrontlineWindow */}
      <FrontlineWindow
        isOpen={isOpen}
        onClose={handleClose}
        title={`Configurations (${configurations.length})`}
        icon={<Sliders className="size-4" style={{ color: '#2F80ED' }} />}
        defaultPosition={{ x: window.innerWidth - 360 - 16, y: 60 }}
        defaultSize={{ width: 350, height: 560 }}
        minWidth={280}
        minHeight={300}
      >
        <div className="flex flex-col h-full">
          {/* Search */}
          <div data-demo="configurations-search" style={{ padding: '8px 12px' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or tag..."
                data-demo="configurations-search-input"
                className="w-full bg-white border outline-none min-h-[40px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                style={{
                  borderRadius: '8px',
                  padding: '8px 12px 8px 32px',
                  fontFamily: 'var(--font-family)',
                  fontSize: '13px',
                  color: '#36415D',
                  borderColor: '#C2C9DB',
                }}
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center" style={{ padding: '4px 12px 10px', gap: '6px' }}>
            <button
              onClick={handleCreateConfiguration}
              data-demo="configurations-create"
              className="flex-1 flex items-center justify-center gap-2 rounded-[8px] hover:shadow-[0_2px_8px_rgba(47,128,237,0.25)] active:scale-[0.98] transition-all min-h-[36px]"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#2F80ED',
                padding: '6px 12px',
              }}
            >
              <Plus className="size-3.5" />
              New Config
            </button>
            <button
              onClick={handleCreateFolder}
              className="flex items-center justify-center gap-1.5 rounded-[8px] border hover:bg-[#E9E9E9]/50 active:scale-[0.97] transition-all min-h-[36px]"
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: '12px',
                fontWeight: 500,
                color: '#36415D',
                borderColor: '#C2C9DB',
                padding: '6px 10px',
              }}
              title="Create folder"
            >
              <FolderPlus className="size-3.5" style={{ color: '#868D9E' }} />
            </button>
            {selectableConfigs.length > 0 && (
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center justify-center rounded-[8px] border hover:bg-[#E9E9E9]/50 active:scale-[0.97] transition-all min-h-[36px]"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: allSelected ? '#2F80ED' : '#868D9E',
                  borderColor: allSelected ? '#2F80ED' : '#C2C9DB',
                  padding: '6px 8px',
                }}
                title={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? 'Deselect' : 'Select all'}
              </button>
            )}
          </div>

          {/* Configuration List with Folders */}
          <div
            data-demo="configurations-list"
            className="flex-1 overflow-y-auto"
            style={{ padding: '0 4px' }}
          >
            {filteredConfigs.length > 0 ? (
              <>
                {/* Root-level configs (no folder) */}
                {rootConfigs.map((config) => (
                  <ConfigItem
                    key={config.id}
                    config={config}
                    isActive={selectedId === config.id}
                    isChecked={checkedIds.has(config.id)}
                    folders={folders}
                    onSelect={() => {
                      if (selectedId && selectedId !== config.id && selectedId !== 'config-default') {
                        const prev = configurations.find((c) => c.id === selectedId);
                        if (prev && !prev.isDefault) {
                          setToastMessage('Previous configuration state saved');
                        }
                      }
                      setSelectedId(config.id);
                    }}
                    onToggleEnabled={() => handleToggleEnabled(config.id)}
                    onDuplicate={() => handleDuplicate(config.id)}
                    onDelete={() => handleDelete(config.id)}
                    onRename={(name) => handleRename(config.id, name)}
                    onStartInlineRename={() => setSelectedId(config.id)}
                    onCopyLink={() => {
                      navigator.clipboard?.writeText(`${window.location.origin}/app/3d-viewer?config=${encodeURIComponent(config.name)}`);
                      setToastMessage('Link copied to clipboard');
                    }}
                    onToggleChecked={(shiftKey) => handleToggleCheckedWithShift(config.id, shiftKey)}
                    onMoveToFolder={(folderId) => handleMoveToFolder(config.id, folderId)}
                  />
                ))}

                {/* Folders */}
                {folders.map((folder) => {
                  const folderConfigs = configsByFolder[folder.id] || [];
                  // Hide empty folders when searching
                  if (searchQuery && folderConfigs.length === 0) return null;
                  return (
                    <div key={folder.id}>
                      <FolderItem
                        folder={folder}
                        configCount={folderConfigs.length}
                        isExpanded={folder.isExpanded}
                        onToggleExpand={() => handleToggleFolderExpand(folder.id)}
                        onRename={(name) => handleRenameFolder(folder.id, name)}
                        onDelete={() => handleDeleteFolder(folder.id)}
                      />
                      <AnimatePresence initial={false}>
                        {folder.isExpanded && folderConfigs.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ overflow: 'hidden', paddingLeft: '16px' }}
                          >
                            {folderConfigs.map((config) => (
                              <ConfigItem
                                key={config.id}
                                config={config}
                                isActive={selectedId === config.id}
                                isChecked={checkedIds.has(config.id)}
                                folders={folders}
                                onSelect={() => {
                                  if (selectedId && selectedId !== config.id && selectedId !== 'config-default') {
                                    const prev = configurations.find((c) => c.id === selectedId);
                                    if (prev && !prev.isDefault) {
                                      setToastMessage('Previous configuration state saved');
                                    }
                                  }
                                  setSelectedId(config.id);
                                }}
                                onToggleEnabled={() => handleToggleEnabled(config.id)}
                                onDuplicate={() => handleDuplicate(config.id)}
                                onDelete={() => handleDelete(config.id)}
                                onRename={(name) => handleRename(config.id, name)}
                                onStartInlineRename={() => setSelectedId(config.id)}
                                onCopyLink={() => {
                                  navigator.clipboard?.writeText(`${window.location.origin}/app/3d-viewer?config=${encodeURIComponent(config.name)}`);
                                  setToastMessage('Link copied to clipboard');
                                }}
                                onToggleChecked={() => {
                                  setCheckedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(config.id)) next.delete(config.id);
                                    else next.add(config.id);
                                    return next;
                                  });
                                }}
                                onMoveToFolder={(folderId) => handleMoveToFolder(config.id, folderId)}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center"
                style={{ padding: '40px 24px', gap: '12px' }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#F5F5F5',
                  }}
                >
                  <Sliders className="size-5" style={{ color: '#C2C9DB' }} />
                </div>
                <div className="text-center">
                  <p style={{ fontFamily: 'var(--font-family)', fontSize: '13px', fontWeight: 500, color: '#868D9E', margin: '0 0 4px' }}>
                    {searchQuery ? 'No configurations match your search' : 'No configurations yet'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#C2C9DB', margin: 0 }}>
                    {searchQuery ? 'Try a different search term' : 'Create a configuration to get started'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Action Bar */}
          {checkedIds.size >= 1 && (
            <div
              className="border-t"
              style={{
                borderColor: '#E9E9E9',
                padding: '8px 12px',
                backgroundColor: 'rgba(47, 128, 237, 0.04)',
              }}
            >
              <div className="flex items-center" style={{ gap: '5px' }}>
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#2F80ED',
                    backgroundColor: 'rgba(47, 128, 237, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '99px',
                  }}
                >
                  {checkedIds.size}
                </span>
                  {/* Move to folder */}
                  <div className="relative">
                    <button
                      ref={moveBtnRef}
                      onClick={() => {
                        if (!showMoveToFolderMenu && moveBtnRef.current) {
                          const rect = moveBtnRef.current.getBoundingClientRect();
                          setMoveMenuPos({ top: rect.top - 4, left: rect.left });
                        }
                        setShowMoveToFolderMenu(!showMoveToFolderMenu);
                      }}
                      className="flex items-center gap-1 rounded-[6px] border hover:bg-white active:scale-[0.97] transition-all min-h-[28px]"
                      style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#36415D',
                        borderColor: '#C2C9DB',
                        padding: '3px 8px',
                      }}
                      title="Move to folder"
                    >
                      <FolderInput className="size-3" style={{ color: '#868D9E' }} />
                      Move
                    </button>
                    <AnimatePresence>
                      {showMoveToFolderMenu && moveMenuPos && (
                        <motion.div
                          ref={moveMenuRef}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="fixed bg-white border rounded-[10px] shadow-elevation-lg z-[100]"
                          style={{ minWidth: '140px', bottom: `calc(100vh - ${moveMenuPos.top}px)`, left: moveMenuPos.left, borderColor: '#E9E9E9' }}
                        >
                          <div style={{ padding: '4px' }}>
                            <button
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[30px]"
                              style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#868D9E', fontStyle: 'italic' }}
                              onClick={() => handleBulkMoveToFolder(undefined)}
                            >
                              No folder (root)
                            </button>
                            {folders.map((folder) => (
                              <button
                                key={folder.id}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-left min-h-[30px]"
                                style={{ fontFamily: 'var(--font-family)', fontSize: '11px', color: '#36415D' }}
                                onClick={() => handleBulkMoveToFolder(folder.id)}
                              >
                                <FolderOpen className="size-3" style={{ color: '#868D9E' }} />
                                {folder.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={handleBulkToggleEnabled}
                    className="flex items-center gap-1 rounded-[6px] border hover:bg-white active:scale-[0.97] transition-all min-h-[28px]"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#36415D',
                      borderColor: '#C2C9DB',
                      padding: '3px 8px',
                    }}
                  >
                    <Eye className="size-3" style={{ color: '#868D9E' }} />
                    Toggle
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setCheckedIds(new Set())}
                    className="flex items-center justify-center rounded-[6px] hover:bg-white transition-colors"
                    style={{
                      width: '28px',
                      height: '28px',
                      color: '#868D9E',
                      border: '1px solid #C2C9DB',
                    }}
                    title="Clear selection"
                  >
                    <X className="size-3" />
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 rounded-[6px] hover:opacity-90 active:scale-[0.97] transition-all min-h-[28px]"
                    style={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: '#FF1F1F',
                      padding: '3px 10px',
                      boxShadow: '0 1px 4px rgba(255,31,31,0.2)',
                    }}
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
              </div>
            </div>
          )}

          {/* Footer: Import / Export (GAP 8 — FR33: label as Excel) */}
          <div
            data-demo="configurations-footer"
            className="border-t flex flex-col"
            style={{
              borderColor: '#E9E9E9',
              padding: '10px 12px',
              gap: '8px',
            }}
          >
            <div className="flex" style={{ gap: '6px' }}>
              <button
                onClick={handleImport}
                data-demo="configurations-import"
                className="flex-1 flex items-center justify-center gap-2 rounded-[8px] border hover:bg-[#E9E9E9]/40 active:scale-[0.97] transition-all min-h-[36px]"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#36415D',
                  borderColor: '#C2C9DB',
                  padding: '6px 12px',
                }}
              >
                <Upload className="size-3.5" style={{ color: '#868D9E' }} />
                Import
              </button>
              <button
                onClick={handleExport}
                data-demo="configurations-export"
                className="flex-1 flex items-center justify-center gap-2 rounded-[8px] border hover:bg-[#E9E9E9]/40 active:scale-[0.97] transition-all min-h-[36px]"
                style={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#36415D',
                  borderColor: '#C2C9DB',
                  padding: '6px 12px',
                }}
              >
                <Download className="size-3.5" style={{ color: '#868D9E' }} />
                Export
              </button>
            </div>
            <p style={{ fontFamily: 'var(--font-family)', fontSize: '10px', color: '#C2C9DB', textAlign: 'center', margin: 0 }}>
              Excel — parts catalog with config visibility columns
            </p>
          </div>
        </div>
      </FrontlineWindow>

      {/* Configuration Details — FrontlineWindow */}
      <FrontlineWindow
        isOpen={isOpen && !!selectedConfig}
        onClose={() => setSelectedId(null)}
        title={selectedConfig ? selectedConfig.name : 'Configuration Details'}
        icon={
          <div className="flex items-center gap-1.5">
            <Sliders className="size-4" style={{ color: '#2F80ED' }} />
            {selectedConfig && (
              <div
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: selectedConfig.isEnabled ? '#11E874' : '#C2C9DB',
                }}
              />
            )}
          </div>
        }
        defaultPosition={{ x: Math.max(16, window.innerWidth - 360 - 16 - 350 - 16), y: 60 }}
        defaultSize={{ width: 340, height: 560 }}
        minWidth={280}
        minHeight={240}
      >
        {selectedConfig && (
          <DetailSection
            config={selectedConfig}
            onUpdate={handleUpdateSelected}
            onShowToast={setToastMessage}
          />
        )}
      </FrontlineWindow>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            confirmColor={confirmDialog.confirmColor}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => {
              setConfirmDialog(null);
              setImportConfirmPending(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
