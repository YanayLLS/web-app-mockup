import {
  X, Search, Plus, MoreVertical, Trash2, ChevronDown, ChevronRight,
  GripVertical, Pencil, FolderPlus, Settings, RefreshCw, Copy,
  FolderInput, Filter, Play, Clock, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  MOCK_ANIMATIONS, MOCK_ANIMATION_FOLDERS,
  type AnimationItem, type AnimationFolder,
} from './animationsData';
import { PartsSelectionModal } from '../components/modals/PartsSelectionModal';

/* ──────────────────────────────────────────────────────────────────── */
/*  Inline Toast                                                      */
/* ──────────────────────────────────────────────────────────────────── */
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
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
          fontSize: '13px', fontWeight: 500, color: '#36415D',
          border: '1px solid #E9E9E9',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2F80ED', flexShrink: 0 }} />
        <span>{message}</span>
        <button onClick={onDismiss} className="hover:bg-[#F5F5F5] transition-colors rounded-md p-1 -mr-1" style={{ color: '#C2C9DB' }}>
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Confirm Dialog                                                    */
/* ──────────────────────────────────────────────────────────────────── */
function ConfirmDialog({
  title, message, confirmLabel, confirmColor, onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-white rounded-[14px] shadow-elevation-lg w-[calc(100vw-48px)] max-w-[380px]"
        style={{ padding: 24, border: '1px solid #E9E9E9', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#36415D', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#5E677D', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-[8px] border hover:bg-[#F5F5F5] transition-all"
            style={{ padding: '7px 16px', fontSize: 13, fontWeight: 500, color: '#36415D', borderColor: '#C2C9DB' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[8px] hover:brightness-110 transition-all"
            style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, color: 'white', backgroundColor: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Context Menu                                                      */
/* ──────────────────────────────────────────────────────────────────── */
function ContextMenu({
  x, y, items, onClose,
}: {
  x: number; y: number;
  items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, true, true);

  // Keep within viewport
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      let nx = x, ny = y;
      if (rect.right > window.innerWidth - 8) nx = x - rect.width;
      if (rect.bottom > window.innerHeight - 8) ny = y - rect.height;
      if (nx !== x || ny !== y) setPos({ x: Math.max(4, nx), y: Math.max(4, ny) });
    }
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[250] bg-white rounded-[10px] py-1.5 overflow-hidden"
      style={{
        left: pos.x, top: pos.y, minWidth: 180,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #E9E9E9',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 hover:bg-[#F5F5F5] transition-colors"
          style={{ fontSize: 13, color: item.danger ? '#FF1F1F' : '#36415D', fontWeight: item.danger ? 500 : 400 }}
        >
          <span style={{ color: item.danger ? '#FF1F1F' : '#868D9E' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Format duration                                                   */
/* ──────────────────────────────────────────────────────────────────── */
function formatDuration(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = Math.round(s % 60);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs.toFixed(1)}s`;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Animation Item Row                                                */
/* ──────────────────────────────────────────────────────────────────── */
function AnimationRow({
  anim, isSelected, isChecked, onSelect, onToggleCheck, onContextMenu, onRename,
}: {
  anim: AnimationItem;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: (shiftKey: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRename: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(anim.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditName(anim.name);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
    }
  }, [isEditing, anim.name]);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== anim.name) onRename(trimmed);
    setIsEditing(false);
  };

  return (
    <div
      className="flex items-center gap-2.5 rounded-[8px] cursor-pointer group transition-all relative"
      style={{
        padding: '7px 8px',
        margin: '1px 4px',
        backgroundColor: isSelected ? '#D9E0F0' : isChecked ? 'rgba(47,128,237,0.06)' : undefined,
      }}
      onClick={onSelect}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e); }}
      onMouseEnter={(e) => {
        if (!isSelected && !isChecked) (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5';
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isChecked) (e.currentTarget as HTMLElement).style.backgroundColor = '';
      }}
    >
      {/* Drag handle */}
      <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab" style={{ color: '#868D9E' }}>
        <GripVertical className="size-3.5" />
      </div>

      {/* Checkbox for multi-select */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleCheck(e.shiftKey); }}
        className="size-[16px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 transition-all"
        style={{
          borderColor: isChecked ? '#2F80ED' : '#C2C9DB',
          backgroundColor: isChecked ? '#2F80ED' : '#FFFFFF',
        }}
      >
        {isChecked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Thumbnail */}
      <div
        className="size-[36px] rounded-[6px] shrink-0 flex items-center justify-center"
        style={{ backgroundColor: anim.thumbnailColor + '20', border: `1px solid ${anim.thumbnailColor}30` }}
      >
        <Play className="size-3.5" style={{ color: anim.thumbnailColor }} fill={anim.thumbnailColor} />
      </div>

      {/* Name and duration */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white border outline-none focus:border-[#2E80ED] transition-all"
            style={{
              borderRadius: 4, padding: '2px 6px', fontSize: 13, color: '#36415D', borderColor: '#C2C9DB',
            }}
          />
        ) : (
          <div
            className="truncate"
            style={{ fontSize: 13, fontWeight: 500, color: '#36415D', lineHeight: '18px' }}
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            {anim.name}
          </div>
        )}
        <div className="flex items-center gap-1.5" style={{ marginTop: 1 }}>
          <Clock className="size-3" style={{ color: '#868D9E' }} />
          <span style={{ fontSize: 11, color: '#868D9E' }}>{formatDuration(anim.duration)}</span>
          {anim.hasSdkBadge && (
            <span
              className="rounded-[3px] flex items-center justify-center"
              style={{
                fontSize: 9, fontWeight: 700, color: '#2F80ED', backgroundColor: 'rgba(47,128,237,0.1)',
                padding: '1px 4px', marginLeft: 4, letterSpacing: '0.5px',
              }}
            >
              SDK
            </span>
          )}
        </div>
      </div>

      {/* Three-dot menu on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
        className="size-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/70 transition-all shrink-0"
        style={{ color: '#868D9E' }}
      >
        <MoreVertical className="size-3.5" />
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Folder Row                                                        */
/* ──────────────────────────────────────────────────────────────────── */
function FolderRow({
  folder, count, isExpanded, onToggleExpand, onRename, onDelete,
}: {
  folder: AnimationFolder; count: number; isExpanded: boolean;
  onToggleExpand: () => void; onRename: (name: string) => void; onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditName(folder.name);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
    }
  }, [isEditing, folder.name]);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== folder.name) onRename(trimmed);
    setIsEditing(false);
  };

  return (
    <div
      className="flex items-center gap-2 rounded-[8px] cursor-pointer group transition-colors"
      style={{ padding: '6px 8px', margin: '1px 4px' }}
      onClick={onToggleExpand}
      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F5F5'}
      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
    >
      {/* Expand arrow */}
      <div style={{ color: '#868D9E' }}>
        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </div>

      {/* Folder icon */}
      <div
        className="size-[28px] rounded-[6px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#E9E9E9' }}
      >
        <FolderInput className="size-3.5" style={{ color: '#868D9E' }} />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white border outline-none focus:border-[#2E80ED] transition-all"
            style={{ borderRadius: 4, padding: '2px 6px', fontSize: 13, color: '#36415D', borderColor: '#C2C9DB' }}
          />
        ) : (
          <span
            className="truncate block"
            style={{ fontSize: 13, fontWeight: 600, color: '#36415D' }}
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            {folder.name}
          </span>
        )}
      </div>

      {/* Count */}
      <span style={{ fontSize: 11, color: '#868D9E', fontWeight: 500 }}>{count}</span>

      {/* Actions on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="size-5 rounded flex items-center justify-center hover:bg-white/70 transition-colors"
          style={{ color: '#868D9E' }}
          title="Rename"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="size-5 rounded flex items-center justify-center hover:bg-[#FF1F1F]/10 transition-colors"
          style={{ color: '#FF1F1F' }}
          title="Delete folder"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Filter Chip                                                       */
/* ──────────────────────────────────────────────────────────────────── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        padding: '3px 8px 3px 10px', fontSize: 11, fontWeight: 500,
        color: '#2F80ED', backgroundColor: 'rgba(47,128,237,0.08)',
        border: '1px solid rgba(47,128,237,0.15)',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="size-3.5 rounded-full flex items-center justify-center hover:bg-[#2F80ED]/20 transition-colors"
      >
        <X className="size-2.5" />
      </button>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Filter Popover                                                    */
/* ──────────────────────────────────────────────────────────────────── */
function FilterPopover({
  appliedFilters,
  onApply,
  onClose,
  anchorRef,
}: {
  appliedFilters: { type: string; value: string }[];
  onApply: (filters: { type: string; value: string }[]) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, true, true);

  const partFilters = ['Impeller Assembly', 'Pump Housing', 'Drive Shaft', 'Oil Filter', 'Cooling System'];
  const procedureFilters = ['Oil Change', 'Seal Replacement', 'Full Inspection'];

  const isActive = (type: string, value: string) =>
    appliedFilters.some(f => f.type === type && f.value === value);

  const toggle = (type: string, value: string) => {
    if (isActive(type, value)) {
      onApply(appliedFilters.filter(f => !(f.type === type && f.value === value)));
    } else {
      onApply([...appliedFilters, { type, value }]);
    }
  };

  // Position fixed relative to the anchor button
  const [pos, setPos] = useState({ top: 0, right: 0 });
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [anchorRef]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      className="fixed bg-white rounded-[10px] z-[250] overflow-hidden"
      style={{
        width: 240, top: pos.top, right: pos.right,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #E9E9E9',
      }}
    >
      <div style={{ padding: '10px 12px 6px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          By Part
        </span>
      </div>
      <div style={{ padding: '0 8px 8px' }}>
        {partFilters.map(p => (
          <button
            key={p}
            onClick={() => toggle('part', p)}
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-[6px] hover:bg-[#F5F5F5] transition-colors"
            style={{ fontSize: 12, color: isActive('part', p) ? '#2F80ED' : '#36415D', fontWeight: isActive('part', p) ? 500 : 400 }}
          >
            <div
              className="size-[14px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0"
              style={{
                borderColor: isActive('part', p) ? '#2F80ED' : '#C2C9DB',
                backgroundColor: isActive('part', p) ? '#2F80ED' : '#FFFFFF',
              }}
            >
              {isActive('part', p) && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {p}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #E9E9E9', padding: '10px 12px 6px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          By Procedure
        </span>
      </div>
      <div style={{ padding: '0 8px 8px' }}>
        {procedureFilters.map(p => (
          <button
            key={p}
            onClick={() => toggle('procedure', p)}
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-[6px] hover:bg-[#F5F5F5] transition-colors"
            style={{ fontSize: 12, color: isActive('procedure', p) ? '#2F80ED' : '#36415D', fontWeight: isActive('procedure', p) ? 500 : 400 }}
          >
            <div
              className="size-[14px] rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0"
              style={{
                borderColor: isActive('procedure', p) ? '#2F80ED' : '#C2C9DB',
                backgroundColor: isActive('procedure', p) ? '#2F80ED' : '#FFFFFF',
              }}
            >
              {isActive('procedure', p) && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {p}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/*  Main Panel Component                                              */
/* ──────────────────────────────────────────────────────────────────── */
interface AnimationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnimationsPanel({ isOpen, onClose }: AnimationsPanelProps) {
  const [animations, setAnimations] = useState<AnimationItem[]>(MOCK_ANIMATIONS);
  const [folders, setFolders] = useState<AnimationFolder[]>(MOCK_ANIMATION_FOLDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const lastCheckedRef = useRef<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; message: string; confirmLabel: string; confirmColor: string; onConfirm: () => void;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; animId: string;
  } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ type: string; value: string }[]>([]);
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Filtered animations
  const filteredAnimations = useMemo(() => {
    return animations.filter((a) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.name.toLowerCase().includes(q)) return false;
      }
      // Applied filters
      for (const f of appliedFilters) {
        if (f.type === 'part' && !a.connectedParts.includes(f.value)) return false;
        if (f.type === 'procedure' && a.linkedProcedure !== f.value) return false;
      }
      return true;
    });
  }, [animations, searchQuery, appliedFilters]);

  const rootAnimations = filteredAnimations.filter(a => !a.folderId);
  const animsByFolder = folders.reduce<Record<string, AnimationItem[]>>((acc, f) => {
    acc[f.id] = filteredAnimations.filter(a => a.folderId === f.id);
    return acc;
  }, {});

  // Ordered IDs for shift-click range
  const orderedIds = useMemo(() => [
    ...rootAnimations.map(a => a.id),
    ...folders.flatMap(f => (animsByFolder[f.id] || []).map(a => a.id)),
  ], [rootAnimations, folders, animsByFolder]);

  // Shift+click multi-select
  const handleToggleCheck = useCallback((animId: string, shiftKey: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (shiftKey && lastCheckedRef.current && lastCheckedRef.current !== animId) {
        const lastIdx = orderedIds.indexOf(lastCheckedRef.current);
        const curIdx = orderedIds.indexOf(animId);
        if (lastIdx !== -1 && curIdx !== -1) {
          const from = Math.min(lastIdx, curIdx);
          const to = Math.max(lastIdx, curIdx);
          for (let i = from; i <= to; i++) next.add(orderedIds[i]);
          return next;
        }
      }
      if (next.has(animId)) next.delete(animId);
      else next.add(animId);
      return next;
    });
    lastCheckedRef.current = animId;
  }, [orderedIds]);

  // CRUD handlers
  const handleCreateAnimation = useCallback(() => {
    let counter = 1;
    while (animations.some(a => a.name === `New Animation ${counter}`)) counter++;
    const newAnim: AnimationItem = {
      id: `anim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `New Animation ${counter}`,
      duration: 0,
      sortOrder: animations.length,
      hasSdkBadge: false,
      thumbnailColor: '#868D9E',
      connectedParts: [],
    };
    setAnimations(prev => [...prev, newAnim]);
    setSelectedId(newAnim.id);
    setToastMessage('Animation created');
  }, [animations]);

  const handleCreateFolder = useCallback(() => {
    let counter = 1;
    while (folders.some(f => f.name === `New Folder ${counter}`)) counter++;
    const newFolder: AnimationFolder = {
      id: `af-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `New Folder ${counter}`,
      isExpanded: true,
      sortOrder: folders.length,
    };
    setFolders(prev => [...prev, newFolder]);
    setToastMessage('Folder created');
  }, [folders]);

  const handleDuplicate = useCallback((animId: string) => {
    const src = animations.find(a => a.id === animId);
    if (!src) return;
    const dup: AnimationItem = {
      ...src,
      id: `anim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${src.name} (Copy)`,
      sortOrder: animations.length,
    };
    setAnimations(prev => [...prev, dup]);
    setSelectedId(dup.id);
    setToastMessage(`Duplicated "${src.name}"`);
  }, [animations]);

  const handleDelete = useCallback((animId: string) => {
    const anim = animations.find(a => a.id === animId);
    if (!anim) return;
    setConfirmDialog({
      title: 'Delete Animation',
      message: `Are you sure you want to delete "${anim.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setAnimations(prev => prev.filter(a => a.id !== animId));
        if (selectedId === animId) setSelectedId(null);
        setCheckedIds(prev => { const n = new Set(prev); n.delete(animId); return n; });
        setConfirmDialog(null);
        setToastMessage(`Deleted "${anim.name}"`);
      },
    });
  }, [animations, selectedId]);

  const handleRename = useCallback((animId: string, name: string) => {
    setAnimations(prev => prev.map(a => a.id === animId ? { ...a, name } : a));
  }, []);

  const handleMoveToFolder = useCallback((animId: string, folderId: string | undefined) => {
    setAnimations(prev => prev.map(a => a.id === animId ? { ...a, folderId } : a));
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'root';
    setToastMessage(`Moved to ${folderName}`);
  }, [folders]);

  const handleRenameFolder = useCallback((folderId: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f));
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const hasChildren = animations.some(a => a.folderId === folderId);
    setConfirmDialog({
      title: 'Delete Folder',
      message: hasChildren
        ? `"${folder.name}" contains animations. They will be moved to root level.`
        : `Delete folder "${folder.name}"?`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setAnimations(prev => prev.map(a => a.folderId === folderId ? { ...a, folderId: undefined } : a));
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setConfirmDialog(null);
        setToastMessage('Folder deleted');
      },
    });
  }, [folders, animations]);

  const handleToggleFolderExpand = useCallback((folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f));
  }, []);

  const handleCollapseExpandAll = useCallback(() => {
    const newState = !allCollapsed;
    setFolders(prev => prev.map(f => ({ ...f, isExpanded: !newState })));
    setAllCollapsed(newState);
  }, [allCollapsed]);

  const handleRefresh = useCallback(() => {
    setStatusMessage('Refreshing...');
    setTimeout(() => {
      setStatusMessage('Up to date');
      setTimeout(() => setStatusMessage(null), 2000);
    }, 800);
  }, []);

  // Bulk delete
  const handleBulkDelete = useCallback(() => {
    if (checkedIds.size === 0) return;
    setConfirmDialog({
      title: 'Delete Selected Animations',
      message: `Delete ${checkedIds.size} animation${checkedIds.size > 1 ? 's' : ''}? This cannot be undone.`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setAnimations(prev => prev.filter(a => !checkedIds.has(a.id)));
        if (selectedId && checkedIds.has(selectedId)) setSelectedId(null);
        const count = checkedIds.size;
        setCheckedIds(new Set());
        setConfirmDialog(null);
        setToastMessage(`Deleted ${count} animation${count > 1 ? 's' : ''}`);
      },
    });
  }, [checkedIds, selectedId]);

  // Build context menu items for an animation
  const getContextMenuItems = (animId: string) => {
    const moveItems = [
      { label: 'Root level', folderId: undefined as string | undefined },
      ...folders.map(f => ({ label: f.name, folderId: f.id })),
    ];
    const currentFolder = animations.find(a => a.id === animId)?.folderId;
    return [
      { label: 'Rename', icon: <Pencil className="size-3.5" />, onClick: () => {
        // Trigger inline rename by selecting
        setSelectedId(animId);
        setToastMessage('Double-click the name to rename');
      }},
      { label: 'Duplicate', icon: <Copy className="size-3.5" />, onClick: () => handleDuplicate(animId) },
      ...moveItems
        .filter(m => m.folderId !== currentFolder)
        .map(m => ({
          label: `Move to ${m.label}`,
          icon: <FolderInput className="size-3.5" />,
          onClick: () => handleMoveToFolder(animId, m.folderId),
        })),
      { label: 'Delete', icon: <Trash2 className="size-3.5" />, onClick: () => handleDelete(animId), danger: true },
    ];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Panel backdrop */}
      <div
        className="fixed inset-0 z-[80]"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed right-0 top-0 bottom-0 z-[85] bg-white flex flex-col"
        style={{
          width: 380,
          maxWidth: '100vw',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.1), -1px 0 4px rgba(0,0,0,0.04)',
          borderLeft: '1px solid #E9E9E9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E9E9E9' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="size-8 rounded-[8px] flex items-center justify-center"
              style={{ backgroundColor: 'rgba(47,128,237,0.1)' }}
            >
              <Play className="size-4" style={{ color: '#2F80ED' }} fill="#2F80ED" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#36415D' }}>Animations</h2>
            <span
              className="rounded-full"
              style={{ fontSize: 11, fontWeight: 600, color: '#868D9E', backgroundColor: '#F5F5F5', padding: '2px 8px' }}
            >
              {animations.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCollapseExpandAll}
              className="size-7 rounded-md flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              style={{ color: '#868D9E' }}
              title={allCollapsed ? 'Expand all' : 'Collapse all'}
            >
              {allCollapsed ? <ChevronsUpDown className="size-4" /> : <ChevronsDownUp className="size-4" />}
            </button>
            <button
              onClick={handleRefresh}
              className="size-7 rounded-md flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              style={{ color: '#868D9E' }}
              title="Refresh"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              onClick={() => setToastMessage('Settings coming soon')}
              className="size-7 rounded-md flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              style={{ color: '#868D9E' }}
              title="Settings"
            >
              <Settings className="size-3.5" />
            </button>
            <button
              onClick={onClose}
              className="size-7 rounded-md flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              style={{ color: '#868D9E' }}
              title="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Search & Filter ── */}
        <div style={{ padding: '10px 12px 4px' }}>
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search animations..."
                className="w-full bg-white border outline-none min-h-[36px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                style={{
                  borderRadius: 8, padding: '7px 12px 7px 32px',
                  fontSize: 13, color: '#36415D', borderColor: '#C2C9DB',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded hover:bg-[#F5F5F5]"
                  style={{ color: '#868D9E' }}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <div className="relative">
              <button
                ref={filterBtnRef}
                onClick={() => setShowFilter(f => !f)}
                className="size-[36px] rounded-[8px] border flex items-center justify-center hover:bg-[#F5F5F5] transition-colors relative"
                style={{
                  borderColor: appliedFilters.length > 0 ? '#2F80ED' : '#C2C9DB',
                  color: appliedFilters.length > 0 ? '#2F80ED' : '#868D9E',
                }}
                title="Filter"
              >
                <Filter className="size-3.5" />
                {appliedFilters.length > 0 && (
                  <div
                    className="absolute -top-1 -right-1 size-[14px] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2F80ED', fontSize: 9, fontWeight: 700, color: 'white' }}
                  >
                    {appliedFilters.length}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {showFilter && (
                  <FilterPopover
                    appliedFilters={appliedFilters}
                    onApply={setAppliedFilters}
                    onClose={() => setShowFilter(false)}
                    anchorRef={filterBtnRef}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Applied Filter Chips ── */}
        <AnimatePresence>
          {appliedFilters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex items-center gap-1.5 flex-wrap" style={{ padding: '6px 14px' }}>
                {appliedFilters.map((f, i) => (
                  <FilterChip
                    key={`${f.type}-${f.value}`}
                    label={`${f.type === 'part' ? 'Part' : 'Proc'}: ${f.value}`}
                    onRemove={() => setAppliedFilters(prev => prev.filter((_, idx) => idx !== i))}
                  />
                ))}
                <button
                  onClick={() => setAppliedFilters([])}
                  style={{ fontSize: 11, color: '#868D9E', fontWeight: 500 }}
                  className="hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Toolbar ── */}
        <div className="flex items-center shrink-0" style={{ padding: '6px 12px 8px', gap: 6 }}>
          <button
            onClick={handleCreateAnimation}
            className="flex-1 flex items-center justify-center gap-2 rounded-[8px] hover:shadow-[0_2px_8px_rgba(47,128,237,0.25)] active:scale-[0.98] transition-all min-h-[34px]"
            style={{ fontSize: 12, fontWeight: 600, color: 'white', backgroundColor: '#2F80ED', padding: '6px 12px' }}
          >
            <Plus className="size-3.5" />
            New Animation
          </button>
          <button
            onClick={handleCreateFolder}
            className="flex items-center justify-center rounded-[8px] border hover:bg-[#E9E9E9]/50 active:scale-[0.97] transition-all min-h-[34px]"
            style={{ fontSize: 12, fontWeight: 500, color: '#36415D', borderColor: '#C2C9DB', padding: '6px 10px' }}
            title="Create folder"
          >
            <FolderPlus className="size-3.5" style={{ color: '#868D9E' }} />
          </button>
        </div>

        {/* ── Multi-Select Action Bar ── */}
        <AnimatePresence>
          {checkedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="flex items-center justify-between"
                style={{
                  padding: '8px 14px', margin: '0 12px 6px',
                  backgroundColor: 'rgba(47,128,237,0.06)', borderRadius: 8,
                  border: '1px solid rgba(47,128,237,0.12)',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2F80ED' }}>
                  {checkedIds.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 rounded-[6px] hover:bg-[#FF1F1F]/10 transition-colors"
                    style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, color: '#FF1F1F' }}
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                  <button
                    onClick={() => setCheckedIds(new Set())}
                    className="rounded-[6px] hover:bg-white transition-colors"
                    style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, color: '#868D9E' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Animation List ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '0 4px' }}>
          {filteredAnimations.length > 0 ? (
            <>
              {/* Root-level animations */}
              {rootAnimations.map(anim => (
                <AnimationRow
                  key={anim.id}
                  anim={anim}
                  isSelected={selectedId === anim.id}
                  isChecked={checkedIds.has(anim.id)}
                  onSelect={() => setSelectedId(anim.id)}
                  onToggleCheck={(shiftKey) => handleToggleCheck(anim.id, shiftKey)}
                  onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, animId: anim.id })}
                  onRename={(name) => handleRename(anim.id, name)}
                />
              ))}

              {/* Folders */}
              {folders.map(folder => {
                const folderAnims = animsByFolder[folder.id] || [];
                if (searchQuery && folderAnims.length === 0) return null;
                return (
                  <div key={folder.id}>
                    <FolderRow
                      folder={folder}
                      count={folderAnims.length}
                      isExpanded={folder.isExpanded}
                      onToggleExpand={() => handleToggleFolderExpand(folder.id)}
                      onRename={(name) => handleRenameFolder(folder.id, name)}
                      onDelete={() => handleDeleteFolder(folder.id)}
                    />
                    <AnimatePresence initial={false}>
                      {folder.isExpanded && folderAnims.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          style={{ overflow: 'hidden', paddingLeft: 16 }}
                        >
                          {folderAnims.map(anim => (
                            <AnimationRow
                              key={anim.id}
                              anim={anim}
                              isSelected={selectedId === anim.id}
                              isChecked={checkedIds.has(anim.id)}
                              onSelect={() => setSelectedId(anim.id)}
                              onToggleCheck={(shiftKey) => handleToggleCheck(anim.id, shiftKey)}
                              onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, animId: anim.id })}
                              onRename={(name) => handleRename(anim.id, name)}
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
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div
                className="size-14 rounded-[14px] flex items-center justify-center mb-4"
                style={{ backgroundColor: '#F5F5F5' }}
              >
                <Play className="size-6" style={{ color: '#C2C9DB' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#36415D', marginBottom: 4, textAlign: 'center' }}>
                {searchQuery || appliedFilters.length > 0 ? 'No matching animations' : 'No animations yet'}
              </p>
              <p style={{ fontSize: 12, color: '#868D9E', textAlign: 'center', lineHeight: 1.5 }}>
                {searchQuery || appliedFilters.length > 0
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first animation to get started.'}
              </p>
              {!searchQuery && appliedFilters.length === 0 && (
                <button
                  onClick={handleCreateAnimation}
                  className="flex items-center gap-2 rounded-[8px] mt-4 hover:shadow-[0_2px_8px_rgba(47,128,237,0.25)] active:scale-[0.98] transition-all"
                  style={{ fontSize: 13, fontWeight: 600, color: 'white', backgroundColor: '#2F80ED', padding: '8px 20px' }}
                >
                  <Plus className="size-3.5" />
                  Create Animation
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Status Bar ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '8px 16px', borderTop: '1px solid #E9E9E9', backgroundColor: '#FAFAFA' }}
        >
          <span style={{ fontSize: 11, color: '#868D9E' }}>
            {filteredAnimations.length} of {animations.length} animation{animations.length !== 1 ? 's' : ''}
          </span>
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.span
                key={statusMessage}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 11, color: '#2F80ED', fontWeight: 500 }}
              >
                {statusMessage}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems(contextMenu.animId)}
            onClose={() => setContextMenu(null)}
          />
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
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </AnimatePresence>

      {/* Parts Selection Modal */}
      <PartsSelectionModal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        onConfirm={(parts) => {
          setIsPartsModalOpen(false);
          setToastMessage(`Selected ${parts.length} parts`);
        }}
      />
    </>
  );
}
