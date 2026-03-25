import { useState, useEffect, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
  Plus,
  X,
  Trash2,
  Copy,
  MessageSquare,
  Palette,
  GitFork,
  TextCursorInput,
  Camera,
  ScanBarcode,
  Type,
  Check,
  Image as ImageIcon,
  Send,
  CheckCircle,
  RotateCcw,
  SmilePlus,
  Reply,
  Film,
  Volume2,
  Code,
  Search,
  Clock,
  Play,
  Folder,
  FolderOpen,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from './languageConstants';
import { NodeTooltip } from './NodeTooltip';
import { RichTextDescription } from './RichTextDescription';

interface Option {
  id: string;
  text: string;
  textMulti?: Record<string, string>;
  textMultiBase?: Record<string, string>; // source text when translation was made
}

interface PopupNotice {
  id: string;
  title: string;
  description: string;
  media: string[]; // Array of media IDs
  color: string;
}

interface EmojiReaction {
  emoji: string;
  userNames: string[];
}

interface InlineComment {
  id: string;
  authorInitials: string;
  authorColor: string;
  authorName: string;
  text: string;
  createdAt: string;
  reactions?: EmojiReaction[];
}

interface InlineCommentThread {
  id: string;
  resolved: boolean;
  comments: InlineComment[];
}

export interface DynamicNodeData {
  title: string;
  description: string;
  isColorized: boolean;
  color?: string;
  isInput: boolean;
  inputType: 'text' | 'picture' | 'barcode';
  isBranching: boolean;
  options: Option[];
  popups: PopupNotice[];
  media: string[]; // Array of media IDs attached to this step
  // Animation
  animationId?: string | null;
  animationName?: string;
  animationDuration?: string;
  animationColor?: string;
  // TTS Override
  ttsOverride?: string;
  // FlowCode
  flowCode?: string;
  flowCodeEnabled?: boolean;
  titleMulti?: Record<string, string>;
  titleMultiBase?: Record<string, string>; // source title when translation was made
  descriptionMulti?: Record<string, string>;
  descriptionMultiBase?: Record<string, string>; // source description when translation was made
  editingLanguage?: string;
  defaultLanguage?: string;
  editingEnabled?: boolean;
  commentCount?: number;
  commentThreads?: InlineCommentThread[];
  onAddComment?: (text: string, threadId?: string) => void;
  onResolveThread?: (threadId: string) => void;
  onUnresolveThread?: (threadId: string) => void;
  onToggleReaction?: (threadId: string, commentId: string, emoji: string) => void;
  onChange?: (data: Partial<DynamicNodeData>) => void;
  onAction?: (action: 'delete' | 'duplicate') => void;
  onAddOption?: () => void;
  onAddConnectedStep?: (sourceHandle?: string) => void;
  connectedHandles?: Set<string>;
  onOpenMediaLibrary?: (callback: (selectedMedia: string[]) => void) => void;
}

type ActiveMenu = 'none' | 'colorize' | 'input' | 'branching' | 'popup' | 'media' | 'animation' | 'tts' | 'flowcode';

// Animation folder/item structure matching the real Animation Manager
interface AnimFolder {
  id: string;
  name: string;
  items: { id: string; name: string; duration: string }[];
}
const ANIM_FOLDERS: AnimFolder[] = [
  {
    id: 'folder-1', name: 'Maintenance', items: [
      { id: 'anim-1', name: 'Fuel Cap Open', duration: '1.5s' },
      { id: 'anim-2', name: 'Top Cover Lift', duration: '2s' },
      { id: 'anim-4', name: 'Panel Remove', duration: '1.8s' },
    ],
  },
  {
    id: 'folder-2', name: 'Exploded Views', items: [
      { id: 'anim-5', name: 'Engine Explode', duration: '2.5s' },
      { id: 'anim-6', name: 'Air Filter Explode', duration: '2s' },
    ],
  },
];
const ANIM_ROOT_ITEMS = [
  { id: 'anim-3', name: 'Exhaust Highlight', duration: '1.2s' },
];
// Flat list for searching
const ALL_ANIMATIONS = [...ANIM_FOLDERS.flatMap(f => f.items), ...ANIM_ROOT_ITEMS];

const EMOJI_PRESETS = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '💯'];

// #36 — Human-readable color names
const COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'Red',
  '#f59e0b': 'Amber',
  '#3b82f6': 'Blue',
  '#10b981': 'Green',
  '#6366f1': 'Indigo',
  '#ec4899': 'Pink',
  '#8b5cf6': 'Purple',
  '#64748b': 'Slate',
};
const NODE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'];
const ALL_COLORS = NODE_COLORS;

type MenuSide = 'right' | 'left' | 'bottom';

export function DynamicNode({ data, selected, id }: NodeProps<DynamicNodeData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const [menuSide, setMenuSide] = useState<MenuSide>('right');
  const [editingField, _setEditingField] = useState<'none' | 'title' | 'description'>('none');
  const setEditingField = (field: 'none' | 'title' | 'description') => {
    if (field !== 'none' && containerRef.current) {
      // Lock dimensions so switching to textarea/input doesn't resize the node
      containerRef.current.style.width = containerRef.current.offsetWidth + 'px';
      containerRef.current.style.minHeight = containerRef.current.offsetHeight + 'px';
      // Capture description div height before it unmounts
      if (field === 'description' && descDivRef.current) {
        descHeightRef.current = descDivRef.current.offsetHeight;
      }
    } else if (field === 'none' && containerRef.current) {
      containerRef.current.style.width = '';
      containerRef.current.style.minHeight = '';
    }
    _setEditingField(field);
  };
  const [showCommentPopover, setShowCommentPopover] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingToThread, setReplyingToThread] = useState<{ id: string; authorName: string } | null>(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState<{ threadId: string; commentId: string } | null>(null);
  const [animSearch, setAnimSearch] = useState('');
  const [animExpandedFolders, setAnimExpandedFolders] = useState<Set<string>>(new Set(ANIM_FOLDERS.map(f => f.id)));
  const [animFilterOpen, setAnimFilterOpen] = useState(false);

  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentPopoverRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descDivRef = useRef<HTMLDivElement>(null);
  const descHeightRef = useRef<number>(0);

  // Prevent ReactFlow zoom when scrolling inside an actually-scrollable child
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handler = (e: WheelEvent) => {
      let el = e.target as HTMLElement | null;
      while (el && el !== node) {
        const style = getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          e.stopPropagation();
          return;
        }
        el = el.parentElement;
      }
    };
    node.addEventListener('wheel', handler, { passive: true });
    return () => node.removeEventListener('wheel', handler);
  }, []);

  // Migrate old popup data format to new format
  useEffect(() => {
    if (!data.popups && (data as any).showPopup && (data as any).popupMessage) {
      const migratedPopup: PopupNotice = {
        id: crypto.randomUUID(),
        title: 'Notice',
        description: (data as any).popupMessage,
        media: [],
        color: '#f59e0b'
      };
      data.onChange?.({ popups: [migratedPopup] });
    } else if (!data.popups) {
      data.onChange?.({ popups: [] });
    }
    
    // Initialize media array if not present
    if (!data.media) {
      data.onChange?.({ media: [] });
    }
    
    // Migrate old popup media format
    if (data.popups) {
      const needsMigration = data.popups.some(p => typeof (p as any).media === 'string' || (p as any).media === undefined);
      if (needsMigration) {
        const migratedPopups = data.popups.map(p => ({
          ...p,
          media: typeof (p as any).media === 'string' ? [(p as any).media] : (Array.isArray(p.media) ? p.media : [])
        }));
        data.onChange?.({ popups: migratedPopups });
      }
    }
  }, [data]);

  // Language-aware content resolution
  const editLang = data.editingLanguage || 'EN-US';
  const defLang = data.defaultLanguage || 'EN-US';
  const isNonDefault = editLang !== defLang;

  const resolvedTitle = isNonDefault && data.titleMulti?.[editLang] !== undefined
    ? data.titleMulti[editLang]
    : data.title;
  const resolvedDesc = isNonDefault && data.descriptionMulti?.[editLang] !== undefined
    ? data.descriptionMulti[editLang]
    : data.description;

  // Local state for fast typing
  const [localTitle, setLocalTitle] = useState(resolvedTitle);
  const [localDesc, setLocalDesc] = useState(resolvedDesc);

  useEffect(() => { setLocalTitle(resolvedTitle); }, [resolvedTitle]);
  useEffect(() => { setLocalDesc(resolvedDesc); }, [resolvedDesc]);

  // Auto-grow textarea on mount and when description changes
  useEffect(() => {
    if (textareaRef.current) {
      const minH = descHeightRef.current || 28;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(Math.min(textareaRef.current.scrollHeight, 500), minH) + 'px';
    }
  }, [localDesc]);

  // Tell ReactFlow to recalculate handle positions when options or inline panel changes
  const optionIds = data.options?.map(o => o.id).join(',') ?? '';
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, optionIds, activeMenu, updateNodeInternals]);

  // Smart placement: measure node against viewport when menu opens
  useEffect(() => {
    if (activeMenu === 'none' || activeMenu === 'branching') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const menuWidth = 290; // 280 max-width + margin
    if (window.innerWidth - rect.right > menuWidth) {
      setMenuSide('right');
    } else if (rect.left > menuWidth) {
      setMenuSide('left');
    } else {
      setMenuSide('bottom');
    }
  }, [activeMenu]);

  // Close menu when clicking outside
  useClickOutside([menuRef, containerRef], () => setActiveMenu('none'));
  // #39 — Close comment popover when clicking outside
  useClickOutside([commentPopoverRef, containerRef], () => {
    if (showCommentPopover) {
      setShowCommentPopover(false);
      setReplyingToThread(null);
      setCommentDraft('');
      setEmojiPickerFor(null);
    }
  });

  const updateData = (updates: Partial<DynamicNodeData>) => {
    if (data.onChange) {
      data.onChange(updates);
    }
  };

  const handleToggleMenu = (menu: ActiveMenu) => {
    setActiveMenu(prev => prev === menu ? 'none' : menu);
  };

  const updateOption = (id: string, text: string) => {
    const newOptions = data.options.map(opt => opt.id === id ? { ...opt, text } : opt);
    updateData({ options: newOptions });
  };

  const removeOption = (id: string) => {
    updateData({ options: data.options.filter(opt => opt.id !== id) });
  };

  const updatePopup = (id: string, updates: Partial<PopupNotice>) => {
    const newPopups = (data.popups || []).map(p => p.id === id ? { ...p, ...updates } : p);
    updateData({ popups: newPopups });
  };

  const removePopup = (id: string) => {
    updateData({ popups: (data.popups || []).filter(p => p.id !== id) });
  };

  const addPopup = () => {
    if ((data.popups || []).length >= 10) return;
    const newPopup: PopupNotice = {
      id: crypto.randomUUID(),
      title: 'Notice',
      description: '',
      media: [],
      color: '#f59e0b'
    };
    updateData({ popups: [...(data.popups || []), newPopup] });
  };

  // Visual styles
  const gradientStyle = data.isColorized 
    ? { background: `linear-gradient(to top, ${data.color || '#f59e0b'} 2%, transparent 40%)` }
    : {};

  // Determine accent color
  const accentColor = data.isColorized ? (data.color || '#f59e0b') : ((data.options && data.options.length > 1) ? '#2F80ED' : '#C2C9DB');

  const hasAnimation = !!data.animationId;
  const hasTts = !!(data.ttsOverride && data.ttsOverride.trim());
  const hasFlowCode = !!data.flowCodeEnabled;

  return (
    <div
      ref={containerRef}
      className="relative group transition-all duration-200 w-max max-w-[90vw] min-w-[220px] sm:min-w-[280px] sm:max-w-[400px]"
    >
      <div
        className="canvas-step-card relative rounded-xl transition-all"
        style={{
          borderColor: selected ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
          boxShadow: selected
            ? '0 0 0 2px var(--primary), 0 4px 16px rgba(47,128,237,0.15)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Top}
          className=""
          style={{
            width: 14, height: 14,
            left: '50%',
            top: -7,
            transform: 'translateX(-50%)',
            background: accentColor,
            border: '2px solid var(--card)',
            cursor: 'crosshair',
            zIndex: 10,
          }}
        />

        {/* Colorize Gradient Overlay */}
        {data.isColorized && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-0 opacity-40"
            style={gradientStyle}
          />
        )}

        <div className="relative z-10 px-4 pt-3 pb-2.5 flex flex-col gap-1.5">

          {/* Language badge (non-default editing) */}
          {isNonDefault && (() => {
            const langDef = SUPPORTED_LANGUAGES.find(l => l.code === editLang);
            return langDef ? (
              <div
                className="absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                style={{ backgroundColor: 'rgba(47, 128, 237, 0.1)', color: 'var(--primary)' }}
              >
                <span>{langDef.flag}</span>
                <span>{langDef.code}</span>
              </div>
            ) : null;
          })()}

          {/* Title & Description — double-click to edit, otherwise draggable */}
          <div className="flex flex-col gap-0.5">
            {editingField === 'title' ? (
              <input
                ref={titleInputRef}
                type="text"
                value={localTitle}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, 100);
                  setLocalTitle(newValue);
                  if (isNonDefault) {
                    updateData({
                      titleMulti: { ...(data.titleMulti || {}), [editLang]: newValue },
                      titleMultiBase: { ...(data.titleMultiBase || {}), [editLang]: data.title },
                    });
                  } else {
                    updateData({ title: newValue, titleMulti: { ...(data.titleMulti || {}), [defLang]: newValue } });
                  }
                }}
                onBlur={() => setEditingField('none')}
                onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.currentTarget.blur(); } }}
                maxLength={100}
                autoFocus
                className="nodrag font-semibold bg-transparent border-none p-0 focus:ring-0 text-[13px] leading-snug placeholder-slate-300 w-full cursor-text"
                placeholder="Step Title"
                style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
              />
            ) : (
              <div
                onDoubleClick={() => setEditingField('title')}
                className="canvas-field-hover font-semibold text-[13px] leading-snug w-full cursor-grab min-h-[20px]"
                style={{ color: localTitle ? 'var(--foreground)' : '#cbd5e1', letterSpacing: '-0.01em' }}
              >
                {localTitle || 'Step Title'}
              </div>
            )}
            <RichTextDescription
                content={localDesc}
                isEditing={editingField === 'description'}
                onStartEdit={() => setEditingField('description')}
                onStopEdit={() => setEditingField('none')}
                onChange={(html) => {
                  setLocalDesc(html);
                  if (isNonDefault) {
                    updateData({
                      descriptionMulti: { ...(data.descriptionMulti || {}), [editLang]: html },
                      descriptionMultiBase: { ...(data.descriptionMultiBase || {}), [editLang]: data.description },
                    });
                  } else {
                    updateData({ description: html, descriptionMulti: { ...(data.descriptionMulti || {}), [defLang]: html } });
                  }
                }}
              />
          </div>

          {/* Feature Toolbar — icon grid with labels below */}
          {data.editingEnabled !== false && (
          <div className={`canvas-step-toolbar nodrag mt-1 ${activeMenu !== 'none' ? 'expanded' : ''}`}>
            <button
              onClick={() => handleToggleMenu('colorize')}
              className={`canvas-step-tool-btn ${data.isColorized ? 'active' : ''} ${activeMenu === 'colorize' ? 'menu-open' : ''}`}
              style={data.isColorized ? { '--tool-active-color': data.color || '#2F80ED' } as React.CSSProperties : undefined}
              title="Color"
            >
              <Palette size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Color</span>
            </button>

            <button
              onClick={() => handleToggleMenu('input')}
              className={`canvas-step-tool-btn ${data.isInput ? 'active' : ''} ${activeMenu === 'input' ? 'menu-open' : ''}`}
              style={data.isInput ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
              title="Input"
            >
              <TextCursorInput size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Input</span>
            </button>

            <button
              onClick={() => handleToggleMenu('branching')}
              className={`canvas-step-tool-btn ${data.options && data.options.length > 1 ? 'active' : ''} ${activeMenu === 'branching' ? 'menu-open' : ''}`}
              style={data.options && data.options.length > 1 ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
              title="Branching"
            >
              <GitFork size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Branch</span>
            </button>

            <button
              onClick={() => handleToggleMenu('popup')}
              className={`canvas-step-tool-btn ${data.popups && data.popups.length > 0 ? 'active' : ''} ${activeMenu === 'popup' ? 'menu-open' : ''}`}
              style={data.popups && data.popups.length > 0 ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
              title="Popup"
            >
              <MessageSquare size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Popup</span>
            </button>

            <button
              onClick={() => handleToggleMenu('media')}
              className={`canvas-step-tool-btn ${data.media && data.media.length > 0 ? 'active' : ''} ${activeMenu === 'media' ? 'menu-open' : ''}`}
              style={data.media && data.media.length > 0 ? { '--tool-active-color': '#2F80ED' } as React.CSSProperties : undefined}
              title="Media"
            >
              <ImageIcon size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Media</span>
            </button>

            <div className="canvas-step-tool-sep" />

            <button
              onClick={() => handleToggleMenu('animation')}
              className={`canvas-step-tool-btn ${hasAnimation ? 'active' : ''} ${activeMenu === 'animation' ? 'menu-open' : ''}`}
              style={hasAnimation ? { '--tool-active-color': '#9C27B0' } as React.CSSProperties : undefined}
              title="Animation"
            >
              <Film size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Anim</span>
            </button>

            <button
              onClick={() => handleToggleMenu('tts')}
              className={`canvas-step-tool-btn ${hasTts ? 'active' : ''} ${activeMenu === 'tts' ? 'menu-open' : ''}`}
              style={hasTts ? { '--tool-active-color': '#FF9800' } as React.CSSProperties : undefined}
              title="Text to Speech"
            >
              <Volume2 size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">TTS</span>
            </button>

            <button
              onClick={() => handleToggleMenu('flowcode')}
              className={`canvas-step-tool-btn ${hasFlowCode ? 'active' : ''} ${activeMenu === 'flowcode' ? 'menu-open' : ''}`}
              style={hasFlowCode ? { '--tool-active-color': '#4CAF50' } as React.CSSProperties : undefined}
              title="FlowCode"
            >
              <Code size={11} strokeWidth={1.8} />
              <span className="canvas-step-tool-label">Code</span>
            </button>

          </div>
          )}

          {/* Branching editor is now rendered in the output labels area below the card */}
        </div>

        {/* Floating Configuration Menus (non-branching menus only) */}
        {activeMenu !== 'none' && activeMenu !== 'branching' && (
          <div
            ref={menuRef}
            className={`canvas-config-menu nodrag placement-${menuSide}${activeMenu === 'animation' ? ' menu-animation' : ''}`}
          >
            {/* Connector arrow */}
            <div className={`canvas-config-menu-arrow ${menuSide === 'right' ? 'arrow-left' : menuSide === 'left' ? 'arrow-right' : 'arrow-top'}`} />

            {/* Colorize Menu */}
            {activeMenu === 'colorize' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                    <Palette size={14} style={{ color: '#f59e0b' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">Node Color</span>
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')}>
                    <X size={14} />
                  </button>
                </div>
                <div className="flex gap-2.5 justify-start flex-wrap">
                  <div className="group/col relative">
                    <button
                      onClick={() => updateData({ isColorized: false, color: undefined })}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${!data.isColorized ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: 'var(--border)',
                        ringColor: 'var(--foreground)'
                      }}
                      title="None"
                    >
                      <RotateCcw size={12} style={{ color: 'var(--card)' }} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#36415D] text-white text-[9px] font-medium rounded whitespace-nowrap opacity-0 group-hover/col:opacity-100 pointer-events-none transition-opacity">None</div>
                  </div>
                  {NODE_COLORS.map(c => (
                    <div key={c} className="group/col relative">
                      <button
                        onClick={() => updateData({ isColorized: true, color: c })}
                        className={`w-8 h-8 rounded-full border transition-transform hover:scale-110 ${data.isColorized && data.color === c ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                        style={{
                          backgroundColor: c,
                          borderColor: 'var(--border)',
                          ringColor: 'var(--foreground)'
                        }}
                        title={COLOR_NAMES[c] || c}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#36415D] text-white text-[9px] font-medium rounded whitespace-nowrap opacity-0 group-hover/col:opacity-100 pointer-events-none transition-opacity">{COLOR_NAMES[c] || c}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Menu */}
            {activeMenu === 'input' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(47, 128, 237, 0.12)' }}>
                    <TextCursorInput size={14} style={{ color: '#2F80ED' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">Input Required</span>
                  <label className="flex items-center cursor-pointer ml-auto mr-1">
                    <input
                      type="checkbox"
                      checked={data.isInput}
                      onChange={() => updateData({ isInput: !data.isInput })}
                      className="w-4 h-4 rounded border cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </label>
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')} style={{ marginLeft: 0 }}>
                    <X size={14} />
                  </button>
                </div>
                {data.isInput && (
                  <div className="flex flex-col gap-1">
                    {[
                      { id: 'text', label: 'Text Input', icon: Type },
                      { id: 'picture', label: 'Take Picture', icon: Camera },
                      { id: 'barcode', label: 'Scan Barcode', icon: ScanBarcode }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => updateData({ inputType: type.id as any })}
                        className={`canvas-config-menu-option ${data.inputType === type.id ? 'selected' : ''}`}
                      >
                        <type.icon size={14} />
                        {type.label}
                        {data.inputType === type.id && <Check size={12} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Popup Menu */}
            {activeMenu === 'popup' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                    <MessageSquare size={14} style={{ color: '#f59e0b' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">Popup Notices</span>
                  <span className="canvas-config-menu-header-badge">{(data.popups || []).length} / 10</span>
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')}>
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-0.5">
                  {(data.popups || []).map((popup, idx) => (
                    <div
                      key={popup.id}
                      className="flex flex-col gap-2.5 p-3 rounded-xl border transition-all"
                      style={{
                        borderColor: `${popup.color}30`,
                        backgroundColor: 'var(--background)',
                        borderLeft: `3px solid ${popup.color}`,
                      }}
                    >
                      {/* Title row */}
                      <div className="flex items-center gap-2">
                        <input
                          value={popup.title}
                          onChange={(e) => {
                            if (e.target.value.length <= 50) updatePopup(popup.id, { title: e.target.value });
                          }}
                          maxLength={50}
                          className="flex-1 text-[11px] font-semibold bg-transparent px-0 py-0 focus:outline-none"
                          placeholder="Popup Title"
                          style={{ color: 'var(--foreground)' }}
                        />
                        <button onClick={() => removePopup(popup.id)} className="p-0.5 rounded transition-colors shrink-0 canvas-icon-btn-danger opacity-40 hover:opacity-100">
                          <Trash2 size={11} />
                        </button>
                      </div>

                      {/* Description */}
                      <textarea
                        value={popup.description}
                        onChange={(e) => updatePopup(popup.id, { description: e.target.value })}
                        className="w-full text-[11px] border rounded-lg px-2.5 py-2 focus:outline-none resize-none canvas-input leading-relaxed"
                        placeholder="Description..."
                        rows={2}
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)',
                          color: 'var(--foreground)',
                        }}
                      />

                      {/* Bottom row: color dots + media */}
                      <div className="flex items-center gap-1.5">
                        {NODE_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updatePopup(popup.id, { color: c })}
                            className={`w-4 h-4 rounded-full transition-all ${popup.color === c ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-110'}`}
                            style={{
                              backgroundColor: c,
                              ringColor: c,
                            }}
                          />
                        ))}
                        <div className="w-px h-3 mx-0.5" style={{ backgroundColor: 'var(--border)' }} />
                        <button
                          onClick={() => {
                            data.onOpenMediaLibrary?.((selectedMedia) => {
                              updatePopup(popup.id, { media: [...popup.media, ...selectedMedia] });
                            });
                          }}
                          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md transition-colors hover:bg-black/5"
                          style={{ color: popup.media.length > 0 ? 'var(--primary)' : 'var(--muted)' }}
                        >
                          <ImageIcon size={10} />
                          {popup.media.length > 0 ? popup.media.length : ''}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {(data.popups || []).length < 10 && (
                  <button
                    onClick={addPopup}
                    className="canvas-config-menu-add"
                  >
                    <Plus size={14} /> Add Popup
                  </button>
                )}
              </div>
            )}

            {/* Media Menu */}
            {activeMenu === 'media' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                    <ImageIcon size={14} style={{ color: '#3b82f6' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">Step Media</span>
                  {data.media && data.media.length > 0 && (
                    <span className="canvas-config-menu-header-badge">{data.media.length} attached</span>
                  )}
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')}>
                    <X size={14} />
                  </button>
                </div>

                {/* Attached Media List */}
                {data.media && data.media.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                    {data.media.map((mediaId: string, idx: number) => {
                      const fileName = mediaId.startsWith('upload-')
                        ? mediaId.replace(/^upload-\d+-/, '')
                        : (mediaId.split('-').pop() || `Media ${idx + 1}`);
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
                      const isVideo = /\.(mp4|webm|mov|avi)$/i.test(fileName);
                      const thumbUrl = (data as any).mediaThumbs?.[mediaId];
                      return (
                        <div
                          key={idx}
                          className="canvas-config-menu-item-card group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {thumbUrl && isImage ? (
                              <img
                                src={thumbUrl}
                                alt={fileName}
                                className="canvas-media-thumb"
                              />
                            ) : (
                              <div className="canvas-media-thumb-placeholder">
                                {isVideo ? (
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
                                  </svg>
                                ) : (
                                  <ImageIcon size={14} />
                                )}
                              </div>
                            )}
                            <span className="text-xs truncate" style={{ color: 'var(--foreground)' }}>
                              {fileName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button
                                onClick={() => {
                                  const newMedia = [...data.media];
                                  [newMedia[idx], newMedia[idx - 1]] = [newMedia[idx - 1], newMedia[idx]];
                                  updateData({ media: newMedia });
                                }}
                                className="p-1 rounded transition-colors canvas-move-btn"
                                title="Move up"
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M18 15l-6-6-6 6" />
                                </svg>
                              </button>
                            )}
                            {idx < data.media.length - 1 && (
                              <button
                                onClick={() => {
                                  const newMedia = [...data.media];
                                  [newMedia[idx], newMedia[idx + 1]] = [newMedia[idx + 1], newMedia[idx]];
                                  updateData({ media: newMedia });
                                }}
                                className="p-1 rounded transition-colors canvas-move-btn"
                                title="Move down"
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => updateData({ media: data.media.filter((_: string, i: number) => i !== idx) })}
                              className="p-1 rounded transition-colors canvas-icon-btn-danger"
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label
                    className="flex items-center gap-2 px-3 py-2.5 rounded text-xs transition-colors border cursor-pointer canvas-upload-btn"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <ImageIcon size={14} />
                    Upload Media
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const existingThumbs = (data as any).mediaThumbs || {};
                          const newThumbs: Record<string, string> = { ...existingThumbs };
                          const newMediaIds = files.map((file) => {
                            const id = `upload-${Date.now()}-${file.name}`;
                            if (file.type.startsWith('image/')) {
                              newThumbs[id] = URL.createObjectURL(file);
                            }
                            return id;
                          });
                          updateData({ media: [...(data.media || []), ...newMediaIds], mediaThumbs: newThumbs });
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      data.onOpenMediaLibrary?.((selectedMedia) => {
                        updateData({ media: [...(data.media || []), ...selectedMedia] });
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded text-xs font-medium transition-colors border canvas-media-btn"
                    style={{
                      color: 'var(--primary)',
                      borderColor: 'rgba(47, 128, 237, 0.2)'
                    }}
                  >
                    <ImageIcon size={14} />
                    Select from Library
                  </button>
                </div>
              </div>
            )}

            {/* Animation Menu — popover with animation picker */}
            {activeMenu === 'animation' && (() => {
              const isSearching = animSearch.length > 0;
              const searchLower = animSearch.toLowerCase();
              const filteredAll = ALL_ANIMATIONS.filter(a => a.name.toLowerCase().includes(searchLower));
              const totalCount = ALL_ANIMATIONS.length;
              const toggleFolder = (fId: string) => {
                setAnimExpandedFolders(prev => {
                  const next = new Set(prev);
                  next.has(fId) ? next.delete(fId) : next.add(fId);
                  return next;
                });
              };
              const selectAnim = (anim: { id: string; name: string; duration: string }) => {
                updateData({ animationId: anim.id, animationName: anim.name, animationDuration: anim.duration, animationColor: '#9C27B0' });
                setAnimSearch('');
              };
              const renderAnimItem = (anim: { id: string; name: string; duration: string }, indent = false) => (
                <button
                  key={anim.id}
                  onClick={() => selectAnim(anim)}
                  className="flex items-center gap-2.5 w-full text-left rounded-lg transition-colors hover:bg-black/[0.04]"
                  style={{
                    padding: '7px 8px',
                    paddingLeft: indent ? '32px' : '8px',
                    ...(data.animationId === anim.id ? { backgroundColor: 'rgba(47,128,237,0.07)' } : {}),
                  }}
                >
                  <Play size={12} fill={data.animationId === anim.id ? '#2F80ED' : '#B0B7C8'} className="shrink-0" style={{ color: data.animationId === anim.id ? '#2F80ED' : '#B0B7C8' }} />
                  <span className="flex-1 min-w-0 text-[12px] font-medium truncate" style={{ color: data.animationId === anim.id ? '#2F80ED' : 'var(--foreground)' }}>{anim.name}</span>
                  <span className="text-[11px] shrink-0 tabular-nums" style={{ color: '#94A0B8' }}>{anim.duration}</span>
                </button>
              );

              return (
              <div className="flex flex-col" style={{ gap: 0 }}>
                {/* Header */}
                <div className="canvas-config-menu-header" style={{ paddingBottom: '10px', marginBottom: '10px' }}>
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(156, 39, 176, 0.12)' }}>
                    <Film size={14} style={{ color: '#9C27B0' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">Animation Manager</span>
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')}>
                    <X size={14} />
                  </button>
                </div>

                {/* Toolbar row: search + filter + folder + add */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#B0B7C8' }} />
                    <input
                      value={animSearch}
                      onChange={(e) => setAnimSearch(e.target.value)}
                      placeholder="Search animations..."
                      className="w-full text-[12px] pl-8 pr-3 py-[7px] rounded-lg border focus:outline-none focus:border-[#2E80ED]"
                      style={{ borderColor: '#C2C9DB', backgroundColor: '#fff', color: 'var(--foreground)' }}
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setAnimFilterOpen(!animFilterOpen)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-black/[0.04] transition-colors"
                      style={{ borderColor: '#C2C9DB', color: '#868D9E' }}
                      title="Filter"
                    >
                      <Filter size={14} />
                    </button>
                    {animFilterOpen && (
                      <div
                        className="absolute top-full right-0 mt-1 rounded-lg border shadow-lg py-1 z-10"
                        style={{ backgroundColor: '#fff', borderColor: '#E9E9E9', minWidth: '150px' }}
                      >
                        <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] hover:bg-black/[0.04] transition-colors" style={{ color: 'var(--foreground)' }}>
                          <Filter size={12} /> Filter by Part
                        </button>
                        <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] hover:bg-black/[0.04] transition-colors" style={{ color: 'var(--foreground)' }}>
                          <Film size={12} /> Filter by Procedure
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-black/[0.04] transition-colors"
                    style={{ borderColor: '#C2C9DB', color: '#868D9E' }}
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2F80ED] hover:bg-[#82B3F4] transition-colors"
                    style={{ color: '#fff' }}
                    title="Create animation"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Count bar */}
                <div className="flex items-center mt-2.5 px-1" style={{ gap: '6px' }}>
                  <span className="flex-1 text-[11px] font-medium" style={{ color: '#868D9E' }}>
                    {isSearching ? `${filteredAll.length} result${filteredAll.length !== 1 ? 's' : ''}` : `${totalCount} animation${totalCount !== 1 ? 's' : ''}`}
                  </span>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/[0.05] transition-colors" style={{ color: '#B0B7C8' }} title="Refresh">
                    <RefreshCw size={12} />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/[0.05] transition-colors" style={{ color: '#B0B7C8' }} title="Sort">
                    <ArrowUpDown size={12} />
                  </button>
                </div>

                {/* Currently attached animation */}
                {hasAnimation && (
                  <div
                    className="flex items-center gap-3 mt-2 p-2.5 rounded-lg border"
                    style={{ borderColor: 'rgba(47, 128, 237, 0.25)', backgroundColor: 'rgba(47, 128, 237, 0.04)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'rgba(47, 128, 237, 0.1)' }}
                    >
                      <Play size={13} fill="#2F80ED" style={{ color: '#2F80ED' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>{data.animationName}</div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: '#868D9E' }}>
                        <Clock size={10} /> {data.animationDuration}
                      </div>
                    </div>
                    <button
                      onClick={() => updateData({ animationId: null, animationName: undefined, animationDuration: undefined, animationColor: undefined })}
                      className="w-6 h-6 flex items-center justify-center rounded transition-colors canvas-icon-btn-danger opacity-50 hover:opacity-100 shrink-0"
                      title="Remove animation"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Divider before list */}
                <div className="mt-2" style={{ borderTop: '1px solid var(--border)' }} />

                {/* Animation list with folders */}
                <div className="flex flex-col pt-1 max-h-[280px] overflow-y-auto custom-scrollbar" style={{ gap: 0 }}>
                  {isSearching ? (
                    <>
                      {filteredAll.map(anim => renderAnimItem(anim))}
                      {filteredAll.length === 0 && (
                        <div className="text-[12px] text-center py-6" style={{ color: '#B0B7C8' }}>No animations found</div>
                      )}
                    </>
                  ) : (
                    <>
                      {ANIM_FOLDERS.map(folder => {
                        const isOpen = animExpandedFolders.has(folder.id);
                        return (
                          <div key={folder.id}>
                            <button
                              onClick={() => toggleFolder(folder.id)}
                              className="flex items-center gap-2 w-full text-left rounded-lg px-2 py-[6px] hover:bg-black/[0.04] transition-colors"
                            >
                              <ChevronRight
                                size={13}
                                className="shrink-0 transition-transform"
                                style={{ color: '#B0B7C8', transform: isOpen ? 'rotate(90deg)' : undefined }}
                              />
                              {isOpen
                                ? <FolderOpen size={14} className="shrink-0" style={{ color: '#F5A623' }} />
                                : <Folder size={14} className="shrink-0" style={{ color: '#F5A623' }} />
                              }
                              <span className="flex-1 text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{folder.name}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: '#868D9E', backgroundColor: 'rgba(0,0,0,0.05)' }}>{folder.items.length}</span>
                            </button>
                            {isOpen && folder.items.map(anim => renderAnimItem(anim, true))}
                          </div>
                        );
                      })}
                      {ANIM_ROOT_ITEMS.map(anim => renderAnimItem(anim))}
                    </>
                  )}
                </div>

                {/* Bottom action bar */}
                <div className="flex items-center gap-2 mt-2 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                  {hasAnimation ? (
                    <>
                      <button
                        onClick={() => updateData({ animationId: null, animationName: undefined, animationDuration: undefined, animationColor: undefined })}
                        className="flex-1 text-[11px] font-medium py-2 rounded-lg border hover:bg-black/[0.03] transition-colors"
                        style={{ borderColor: '#C2C9DB', color: '#5E677D' }}
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setActiveMenu('none')}
                        className="flex-1 text-[11px] font-semibold py-2 rounded-lg text-white transition-colors hover:brightness-110"
                        style={{ backgroundColor: '#2F80ED' }}
                      >
                        Done
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] w-full text-center py-1" style={{ color: '#B0B7C8' }}>
                      Select an animation to attach to this step
                    </span>
                  )}
                </div>
              </div>
              );
            })()}

            {/* TTS Override Menu */}
            {activeMenu === 'tts' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(255, 152, 0, 0.12)' }}>
                    <Volume2 size={14} style={{ color: '#FF9800' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">TTS Override</span>
                  {hasTts && (
                    <button
                      onClick={() => updateData({ ttsOverride: '' })}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ml-auto mr-1 canvas-icon-btn-danger"
                    >
                      Clear
                    </button>
                  )}
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')} style={hasTts ? { marginLeft: 0 } : undefined}>
                    <X size={14} />
                  </button>
                </div>
                <p className="text-[9px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Custom text the app's voice will read instead of the description.
                </p>
                <textarea
                  value={data.ttsOverride || ''}
                  onChange={(e) => updateData({ ttsOverride: e.target.value })}
                  placeholder="Type custom narration text..."
                  rows={3}
                  className="w-full text-[11px] border rounded-lg px-2.5 py-2 focus:outline-none resize-none canvas-input leading-relaxed"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                />
              </div>
            )}

            {/* FlowCode Menu */}
            {activeMenu === 'flowcode' && (
              <div className="flex flex-col gap-3">
                <div className="canvas-config-menu-header">
                  <div className="canvas-config-menu-header-icon" style={{ background: 'rgba(76, 175, 80, 0.12)' }}>
                    <Code size={14} style={{ color: '#4CAF50' }} />
                  </div>
                  <span className="canvas-config-menu-header-label">FlowCode</span>
                  <label className="flex items-center cursor-pointer ml-auto mr-1">
                    <input
                      type="checkbox"
                      checked={!!data.flowCodeEnabled}
                      onChange={() => updateData({ flowCodeEnabled: !data.flowCodeEnabled })}
                      className="w-4 h-4 rounded border cursor-pointer"
                      style={{ accentColor: '#4CAF50' }}
                    />
                  </label>
                  <button className="canvas-config-menu-header-close" onClick={() => setActiveMenu('none')} style={{ marginLeft: 0 }}>
                    <X size={14} />
                  </button>
                </div>
                {data.flowCodeEnabled ? (
                  <div className="relative">
                    <div
                      className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg text-[9px] font-semibold"
                      style={{ backgroundColor: '#1e1e1e', color: '#9CDCFE', borderBottom: '1px solid #333' }}
                    >
                      <Code size={9} /> flowcode.js
                    </div>
                    <textarea
                      value={data.flowCode || ''}
                      onChange={(e) => updateData({ flowCode: e.target.value })}
                      placeholder={'// Example:\ncontext.setVariable("status", "complete");\ncontext.goToStep("next");'}
                      rows={6}
                      className="w-full text-[10px] border rounded-lg px-2.5 pt-7 pb-2 focus:outline-none resize-none leading-relaxed"
                      style={{
                        borderColor: '#333',
                        backgroundColor: '#1e1e1e',
                        color: '#D4D4D4',
                        fontFamily: 'Consolas, "Courier New", monospace',
                        tabSize: 2,
                      }}
                      spellCheck={false}
                    />
                  </div>
                ) : (
                  <p className="text-[10px] py-2 text-center" style={{ color: 'var(--muted)' }}>
                    Enable the checkbox to write JavaScript that runs when this step executes.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Source handle dots — direct children of the card so ReactFlow can compute their position */}
        {data.options?.map((opt, index) => {
          const total = data.options.length;
          const leftPct = total === 1 ? 50 : 8 + (index / (total - 1)) * 84;
          // Scale down dots when there are many options so they don't overlap
          const dotSize = total <= 6 ? 14 : total <= 12 ? 10 : total <= 20 ? 7 : 5;
          const borderW = total <= 6 ? 2 : 1;
          return (
            <Handle
              key={opt.id}
              type="source"
              position={Position.Bottom}
              id={opt.id}
              className=""
              style={{
                width: dotSize, height: dotSize,
                left: `${leftPct}%`,
                bottom: -(dotSize / 2),
                transform: 'translateX(-50%)',
                background: total === 1 ? accentColor : 'var(--primary)',
                border: `${borderW}px solid var(--card)`,
                cursor: 'crosshair',
                zIndex: 10,
              }}
            />
          );
        })}

        {/* Labels and add-step buttons below the handle dots */}
        {data.options && data.options.length > 0 && (
          <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: '100%', overflow: 'visible' }}>
            {/* ── Branching edit mode: vertical scrollable list ── */}
            {activeMenu === 'branching' && data.options.length > 0 && (
              <div className="flex justify-center pointer-events-auto">
                <div
                  className="canvas-output-editor nodrag"
                  ref={menuRef}
                >
                  <button
                    onClick={() => data.onAddOption?.()}
                    className="canvas-output-add-btn"
                    style={{ flexShrink: 0 }}
                    title="Add option"
                  >
                    <Plus size={11} /> Add option
                  </button>
                  <div
                    className="canvas-output-list custom-scrollbar"
                    onMouseDown={(e) => {
                      // Only drag-scroll if not clicking on an input or button
                      const tag = (e.target as HTMLElement).tagName;
                      if (['INPUT', 'BUTTON', 'SVG', 'PATH'].includes(tag)) return;
                      const el = e.currentTarget;
                      const startY = e.clientY;
                      const startScroll = el.scrollTop;
                      const onMove = (ev: MouseEvent) => {
                        el.scrollTop = startScroll - (ev.clientY - startY);
                      };
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}
                  >
                    {data.options.map((opt, idx) => (
                        <div key={opt.id} className="canvas-output-chip group/opt">
                          <div className="canvas-output-chip-dot" style={{ backgroundColor: 'var(--primary)' }} />
                          <input
                            value={isNonDefault && opt.textMulti?.[editLang] !== undefined ? opt.textMulti[editLang] : opt.text}
                            onChange={(e) => {
                              if (isNonDefault) {
                                const newOptions = data.options.map(o => o.id === opt.id ? { ...o, textMulti: { ...(o.textMulti || {}), [editLang]: e.target.value } } : o);
                                updateData({ options: newOptions });
                              } else {
                                const newOptions = data.options.map(o => o.id === opt.id ? { ...o, text: e.target.value, textMulti: { ...(o.textMulti || {}), [defLang]: e.target.value } } : o);
                                updateData({ options: newOptions });
                              }
                            }}
                            className="canvas-output-chip-input"
                            placeholder={idx === 0 ? 'Default' : `Option ${idx + 1}`}
                          />
                          {idx > 0 && (
                            <button
                              onClick={() => removeOption(opt.id)}
                              className="canvas-output-chip-delete"
                              title="Remove"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Normal mode: read-only pills + add-step buttons ── */}
            {activeMenu !== 'branching' && (() => {
              const total = data.options.length;
              const isSingle = total === 1;
              const showCompact = total > 6;

              if (showCompact) {
                // Compact mode: show a single summary pill instead of individual labels
                return (
                  <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto" style={{ top: 8 }}>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                      style={{ backgroundColor: 'rgba(47, 128, 237, 0.10)', color: 'var(--primary)', whiteSpace: 'nowrap' }}
                    >
                      <GitFork size={10} />
                      {total} options
                    </div>
                  </div>
                );
              }

              return data.options.map((opt, index) => {
                const leftPct = isSingle ? 50 : 8 + (index / (total - 1)) * 84;
                const isConnected = data.connectedHandles?.has(opt.id);
                return (
                  <div key={opt.id} className="absolute pointer-events-auto" style={{ left: `${leftPct}%`, top: 0, transform: 'translateX(-50%)' }}>
                    {!isSingle && (
                      <div className="group/label absolute left-1/2 -translate-x-1/2" style={{ top: 8 }}>
                        <div
                          className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-center whitespace-nowrap max-w-[80px] truncate"
                          style={{ backgroundColor: 'rgba(47, 128, 237, 0.08)', color: 'var(--primary)' }}
                        >
                          {opt.text || `Option ${index + 1}`}
                        </div>
                        {opt.text && opt.text.length > 10 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#36415D] text-white text-[9px] font-medium rounded whitespace-nowrap opacity-0 group-hover/label:opacity-100 pointer-events-none transition-opacity z-30">
                            {opt.text}
                          </div>
                        )}
                      </div>
                    )}
                    {!isConnected && data.editingEnabled !== false && (
                      <NodeTooltip label="Add Step" desc="Create a connected step" side="bottom">
                        <button
                          onClick={(e) => { e.stopPropagation(); data.onAddConnectedStep?.(opt.id); }}
                          className={`absolute left-1/2 -translate-x-1/2 rounded-full border flex items-center justify-center transition-all hover:scale-110 nodrag canvas-add-btn ${
                            isSingle
                              ? 'w-9 h-9 opacity-30 hover:opacity-100'
                              : 'w-8 h-8 opacity-0 group-hover:opacity-40 hover:!opacity-100'
                          }`}
                          style={{ top: isSingle ? 8 : 32 }}
                        >
                          <Plus size={isSingle ? 16 : 14} />
                        </button>
                      </NodeTooltip>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Comment Badge + Inline Popover */}
        <>
        <button
          onClick={(e) => { e.stopPropagation(); setShowCommentPopover(!showCommentPopover); }}
          className={`absolute -top-2.5 -right-2.5 flex items-center gap-1 rounded-full z-20 transition-all nodrag ${
            (data.commentCount ?? 0) > 0
              ? 'opacity-100 px-2 py-1 hover:scale-105 hover:shadow-lg'
              : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1.5 hover:scale-110'
          }`}
          style={{
            background: (data.commentCount ?? 0) > 0
              ? 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)'
              : 'var(--muted)',
            color: 'white',
            boxShadow: (data.commentCount ?? 0) > 0
              ? '0 2px 8px rgba(47,128,237,0.4), 0 0 0 2px rgba(255,255,255,0.9)'
              : '0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          <MessageSquare size={11} fill="white" strokeWidth={0} />
          {(data.commentCount ?? 0) > 0 && (
            <span className="text-[10px] font-bold leading-none">{data.commentCount}</span>
          )}
        </button>

        {/* Inline Comment Popover — Premium Design */}
        {showCommentPopover && (
          <div
            ref={commentPopoverRef}
            className="absolute z-50 nodrag"
            style={{ top: -12, left: '100%', marginLeft: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Connector arrow */}
            <div
              className="absolute top-5 -left-[6px] w-3 h-3 rotate-45"
              style={{
                backgroundColor: 'var(--card)',
                borderLeft: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            />

            <div
              className="rounded-2xl border w-[320px] overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Header with gradient accent */}
              <div
                className="relative px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(47,128,237,0.06) 0%, rgba(86,204,242,0.04) 100%)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)',
                        boxShadow: '0 2px 6px rgba(47,128,237,0.3)',
                      }}
                    >
                      <MessageSquare size={14} color="white" fill="white" strokeWidth={0} />
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold block leading-tight" style={{ color: 'var(--foreground)' }}>
                        Comments
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {(data.commentThreads || []).reduce((sum, t) => sum + t.comments.length, 0)} messages
                        {(data.commentThreads || []).some(t => t.resolved) && (
                          <> · {(data.commentThreads || []).filter(t => t.resolved).length} resolved</>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowCommentPopover(false); setReplyingToThread(null); setCommentDraft(''); setEmojiPickerFor(null); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <X size={13} style={{ color: 'var(--muted)' }} />
                  </button>
                </div>
              </div>

              {/* Thread list */}
              <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
                {(data.commentThreads || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: 'var(--secondary)' }}
                    >
                      <MessageSquare size={22} style={{ color: 'var(--border)' }} />
                    </div>
                    <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      No comments yet
                    </p>
                    <p className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>
                      Start a discussion about this step
                    </p>
                  </div>
                ) : (
                  (data.commentThreads || []).map((thread, threadIdx) => (
                    <div
                      key={thread.id}
                      className="relative"
                      style={{
                        borderBottom: threadIdx < (data.commentThreads || []).length - 1 ? '1px solid var(--border)' : undefined,
                      }}
                    >
                      {/* Resolved banner */}
                      {thread.resolved && (
                        <div
                          className="flex items-center gap-1.5 px-4 py-1.5"
                          style={{
                            backgroundColor: 'rgba(17, 232, 116, 0.06)',
                            borderBottom: '1px solid rgba(17, 232, 116, 0.1)',
                          }}
                        >
                          <CheckCircle size={11} color="#11E874" />
                          <span className="text-[10px] font-medium" style={{ color: '#0dba5c' }}>
                            Thread resolved
                          </span>
                        </div>
                      )}

                      {/* Comments in thread */}
                      <div className={`px-4 py-3 flex flex-col gap-3 ${thread.resolved ? 'opacity-60' : ''}`}>
                        {thread.comments.map((c, commentIdx) => (
                          <div key={c.id} className="group/comment flex gap-2.5">
                            {/* Avatar with online indicator */}
                            <div className="relative shrink-0">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor: c.authorColor,
                                  boxShadow: `0 0 0 2px var(--card), 0 0 0 3px ${c.authorColor}30`,
                                }}
                              >
                                {c.authorInitials}
                              </div>
                              {commentIdx === 0 && !thread.resolved && (
                                <div
                                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                  style={{
                                    backgroundColor: '#11E874',
                                    borderColor: 'var(--card)',
                                  }}
                                />
                              )}
                            </div>

                            {/* Comment body */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>
                                    {c.authorName}
                                  </span>
                                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                                    {(() => {
                                      const now = Date.now();
                                      const then = new Date(c.createdAt).getTime();
                                      const mins = Math.floor((now - then) / 60000);
                                      if (mins < 1) return 'just now';
                                      if (mins < 60) return `${mins}m`;
                                      const hours = Math.floor(mins / 60);
                                      if (hours < 24) return `${hours}h`;
                                      return `${Math.floor(hours / 24)}d`;
                                    })()}
                                  </span>
                                </div>
                                {/* Hover actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                  <div className="relative">
                                    <div className="group/emoji relative">
                                      <button
                                        onClick={() => setEmojiPickerFor(
                                          emojiPickerFor?.commentId === c.id ? null : { threadId: thread.id, commentId: c.id }
                                        )}
                                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
                                      >
                                        <SmilePlus size={11} style={{ color: 'var(--muted)' }} />
                                      </button>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#36415D] text-white text-[9px] font-medium rounded whitespace-nowrap opacity-0 group-hover/emoji:opacity-100 pointer-events-none transition-opacity z-50">Add reaction</div>
                                    </div>
                                    {emojiPickerFor?.commentId === c.id && (
                                      <div
                                        className="absolute bottom-full right-0 mb-1 flex gap-0.5 p-1.5 rounded-lg z-50"
                                        style={{
                                          backgroundColor: 'var(--card)',
                                          border: '1px solid var(--border)',
                                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                        }}
                                      >
                                        {EMOJI_PRESETS.map(emoji => (
                                          <button
                                            key={emoji}
                                            onClick={() => {
                                              data.onToggleReaction?.(thread.id, c.id, emoji);
                                              setEmojiPickerFor(null);
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors text-[13px]"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setReplyingToThread({ id: thread.id, authorName: c.authorName });
                                      setCommentDraft(`@${c.authorName} `);
                                      setTimeout(() => commentInputRef.current?.focus(), 50);
                                    }}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
                                    title="Reply"
                                  >
                                    <Reply size={11} style={{ color: 'var(--muted)' }} />
                                  </button>
                                </div>
                              </div>

                              {/* Message bubble */}
                              <div
                                className="rounded-xl rounded-tl-sm px-3 py-2 text-[11px] leading-relaxed"
                                style={{
                                  backgroundColor: commentIdx === 0
                                    ? 'rgba(47,128,237,0.08)'
                                    : 'var(--secondary)',
                                  border: commentIdx === 0
                                    ? '1px solid rgba(47,128,237,0.12)'
                                    : '1px solid var(--border)',
                                  color: 'var(--foreground)',
                                }}
                              >
                                {c.text}
                              </div>

                              {/* Emoji reactions */}
                              {c.reactions && c.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.reactions.map(r => (
                                    <button
                                      key={r.emoji}
                                      onClick={() => data.onToggleReaction?.(thread.id, c.id, r.emoji)}
                                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors hover:bg-black/5"
                                      style={{
                                        backgroundColor: 'var(--secondary)',
                                        border: '1px solid var(--border)',
                                      }}
                                      title={r.userNames.join(', ')}
                                    >
                                      <span>{r.emoji}</span>
                                      <span style={{ color: 'var(--muted)' }}>{r.userNames.length}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Thread action bar */}
                      <div className="px-4 pb-2.5 flex items-center gap-2">
                        <button
                          onClick={() => thread.resolved ? data.onUnresolveThread?.(thread.id) : data.onResolveThread?.(thread.id)}
                          className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all hover:shadow-sm"
                          style={{
                            color: thread.resolved ? 'var(--primary)' : '#0dba5c',
                            backgroundColor: thread.resolved ? 'rgba(47,128,237,0.08)' : 'rgba(17, 232, 116, 0.08)',
                            border: `1px solid ${thread.resolved ? 'rgba(47,128,237,0.15)' : 'rgba(17, 232, 116, 0.15)'}`,
                          }}
                        >
                          {thread.resolved ? (
                            <><RotateCcw size={10} /> Reopen</>
                          ) : (
                            <><CheckCircle size={10} /> Resolve</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Compose area — polished input */}
              <div
                className="px-4 py-3"
                style={{
                  borderTop: '1px solid var(--border)',
                  background: 'linear-gradient(180deg, var(--card) 0%, var(--secondary) 100%)',
                }}
              >
                {/* Reply indicator */}
                {replyingToThread && (
                  <div
                    className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg text-[10px]"
                    style={{
                      backgroundColor: 'rgba(47,128,237,0.06)',
                      border: '1px solid rgba(47,128,237,0.12)',
                    }}
                  >
                    <span style={{ color: 'var(--primary)' }}>
                      <Reply size={10} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                      Replying to <strong>{replyingToThread.authorName}</strong>
                    </span>
                    <button
                      onClick={() => { setReplyingToThread(null); setCommentDraft(''); }}
                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/5"
                    >
                      <X size={10} style={{ color: 'var(--muted)' }} />
                    </button>
                  </div>
                )}
                <div
                  className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: `1.5px solid ${commentDraft.trim() ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: commentDraft.trim() ? '0 0 0 3px rgba(47,128,237,0.1)' : 'none',
                  }}
                >
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commentDraft.trim()) {
                        data.onAddComment?.(commentDraft.trim(), replyingToThread?.id);
                        setCommentDraft('');
                        setReplyingToThread(null);
                      }
                      if (e.key === 'Escape' && replyingToThread) {
                        setReplyingToThread(null);
                        setCommentDraft('');
                      }
                    }}
                    placeholder={replyingToThread ? 'Write a reply...' : 'Write a comment...'}
                    className="flex-1 text-[12px] bg-transparent focus:outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <button
                    onClick={() => {
                      if (commentDraft.trim()) {
                        data.onAddComment?.(commentDraft.trim(), replyingToThread?.id);
                        setCommentDraft('');
                        setReplyingToThread(null);
                      }
                    }}
                    disabled={!commentDraft.trim()}
                    className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all"
                    style={{
                      background: commentDraft.trim()
                        ? 'linear-gradient(135deg, #2F80ED 0%, #56CCF2 100%)'
                        : 'var(--secondary)',
                      color: commentDraft.trim() ? 'white' : 'var(--muted)',
                      boxShadow: commentDraft.trim() ? '0 2px 6px rgba(47,128,237,0.3)' : 'none',
                      transform: commentDraft.trim() ? 'scale(1)' : 'scale(0.95)',
                    }}
                    title="Send (Enter)"
                  >
                    <Send size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
                    {replyingToThread ? 'Esc to cancel · Enter to send' : 'Press Enter to send'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        </>

        {/* Node Actions — floating bar above the card */}
        {data.editingEnabled !== false && (
          <div
            className="absolute -top-11 right-0 z-20 nodrag
              flex items-center gap-1 px-1.5 py-1 rounded-lg
              opacity-0 group-hover:opacity-100 transition-all duration-150"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <NodeTooltip label="Duplicate" desc="Copy this step" shortcut="Ctrl+D">
              <button
                onClick={(e) => { e.stopPropagation(); data.onAction?.('duplicate'); }}
                className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-black/[0.06]"
              >
                <Copy size={13} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </NodeTooltip>
            <div className="w-px h-3.5" style={{ backgroundColor: 'var(--border)' }} />
            <NodeTooltip label="Delete" desc="Remove this step" shortcut="Del">
              <button
                onClick={(e) => { e.stopPropagation(); data.onAction?.('delete'); }}
                className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-red-50"
              >
                <Trash2 size={13} style={{ color: 'var(--destructive)' }} />
              </button>
            </NodeTooltip>
          </div>
        )}
      </div>
    </div>
  );
}
