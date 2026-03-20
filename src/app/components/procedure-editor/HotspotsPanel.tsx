import {
  X, Search, Plus, MoreVertical, Copy, Trash2, ChevronDown, ChevronRight,
  MapPin, Eye, EyeOff, Pencil, GripVertical, Image, Video, FileText,
  Navigation, Camera, Move, ArrowRight, Settings2, Timer, MessageSquare,
  Crosshair, Diamond, AlertTriangle, ExternalLink, Maximize2, Minimize2,
  RotateCcw
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { FrontlineWindow } from './FrontlineWindow';

// ── Types ────────────────────────────────────────────────────────────

interface HotspotMediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf';
  url: string;
  thumbnailUrl: string;
}

interface HotspotAction {
  id: string;
  type: 'navigate' | 'open-url' | 'play-animation' | 'show-popup' | 'trigger-procedure';
  label: string;
  targetId?: string;
}

interface HotspotData {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
  isVisible: boolean;
  index: number;
  parentId?: string;
  constrainedPartId?: string;
  cameraDistance: number;
  hasCameraView: boolean;
  markerStyle: 'pin' | 'diamond' | 'dot' | 'ring';
  markerColor: string;
  media: HotspotMediaFile[];
  actions: HotspotAction[];
  children: string[]; // IDs of sub-hotspots
}

interface HotspotSettings {
  cyclingEnabled: boolean;
  cycleInterval: number; // seconds
  showDescriptions: boolean;
  showMarkerLabels: boolean;
  autoFocusOnSelect: boolean;
  offscreenIndicators: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_HOTSPOTS: HotspotData[] = [
  {
    id: 'hs-1',
    name: 'Oil Drain Port',
    description: 'Main oil drain port located at the base of the engine block. Used during routine oil changes — ensure engine is cool before accessing.',
    position: { x: -0.42, y: 0.15, z: 0.31 },
    isActive: true,
    isVisible: true,
    index: 0,
    constrainedPartId: 'EngineBlock',
    cameraDistance: 2.5,
    hasCameraView: true,
    markerStyle: 'pin',
    markerColor: '#2F80ED',
    media: [
      { id: 'm1', name: 'oil-drain-photo.jpg', type: 'image', url: '', thumbnailUrl: '' },
      { id: 'm2', name: 'drain-procedure.mp4', type: 'video', url: '', thumbnailUrl: '' },
    ],
    actions: [
      { id: 'a1', type: 'trigger-procedure', label: 'Start Oil Change Procedure', targetId: 'proc-oil-change' },
    ],
    children: ['hs-1a', 'hs-1b'],
  },
  {
    id: 'hs-1a',
    name: 'Drain Plug',
    description: 'M14 drain plug with copper washer. Torque: 25 Nm.',
    position: { x: -0.44, y: 0.12, z: 0.33 },
    isActive: true,
    isVisible: true,
    index: 0,
    parentId: 'hs-1',
    constrainedPartId: 'EngineBlock',
    cameraDistance: 1.5,
    hasCameraView: true,
    markerStyle: 'dot',
    markerColor: '#2F80ED',
    media: [],
    actions: [],
    children: [],
  },
  {
    id: 'hs-1b',
    name: 'Oil Filter Access',
    description: 'Spin-on oil filter. Use 76mm filter wrench for removal.',
    position: { x: -0.38, y: 0.18, z: 0.29 },
    isActive: true,
    isVisible: true,
    index: 1,
    parentId: 'hs-1',
    constrainedPartId: 'OilFilter',
    cameraDistance: 1.8,
    hasCameraView: true,
    markerStyle: 'dot',
    markerColor: '#2F80ED',
    media: [
      { id: 'm3', name: 'filter-location.jpg', type: 'image', url: '', thumbnailUrl: '' },
    ],
    actions: [],
    children: [],
  },
  {
    id: 'hs-2',
    name: 'Filter Access Panel',
    description: 'Removable panel providing access to air and fuel filters. Two quarter-turn fasteners secure the panel.',
    position: { x: 0.65, y: 0.42, z: -0.18 },
    isActive: true,
    isVisible: true,
    index: 1,
    cameraDistance: 3.0,
    hasCameraView: true,
    markerStyle: 'pin',
    markerColor: '#11E874',
    media: [
      { id: 'm4', name: 'panel-overview.jpg', type: 'image', url: '', thumbnailUrl: '' },
    ],
    actions: [
      { id: 'a2', type: 'show-popup', label: 'Show Filter Specs' },
      { id: 'a3', type: 'play-animation', label: 'Open Panel Animation', targetId: 'anim-panel-open' },
    ],
    children: [],
  },
  {
    id: 'hs-3',
    name: 'Control Panel',
    description: 'Main control panel with start/stop switch, voltage meter, frequency meter, and circuit breakers.',
    position: { x: 0.12, y: 0.95, z: 0.55 },
    isActive: true,
    isVisible: true,
    index: 2,
    constrainedPartId: 'ControlPanel',
    cameraDistance: 2.0,
    hasCameraView: true,
    markerStyle: 'diamond',
    markerColor: '#FF6B35',
    media: [
      { id: 'm5', name: 'control-panel-diagram.pdf', type: 'pdf', url: '', thumbnailUrl: '' },
      { id: 'm6', name: 'wiring-overview.jpg', type: 'image', url: '', thumbnailUrl: '' },
      { id: 'm7', name: 'startup-sequence.mp4', type: 'video', url: '', thumbnailUrl: '' },
    ],
    actions: [
      { id: 'a4', type: 'trigger-procedure', label: 'Start Generator Startup Procedure', targetId: 'proc-startup' },
      { id: 'a5', type: 'navigate', label: 'Go to Voltage Meter', targetId: 'hs-3a' },
    ],
    children: ['hs-3a'],
  },
  {
    id: 'hs-3a',
    name: 'Voltage Meter',
    description: 'Analog voltage meter. Normal operating range: 220-240V AC.',
    position: { x: 0.15, y: 1.02, z: 0.57 },
    isActive: true,
    isVisible: true,
    index: 0,
    parentId: 'hs-3',
    constrainedPartId: 'ControlPanel',
    cameraDistance: 1.2,
    hasCameraView: true,
    markerStyle: 'ring',
    markerColor: '#FF6B35',
    media: [],
    actions: [],
    children: [],
  },
  {
    id: 'hs-4',
    name: 'Coolant Reservoir',
    description: 'Pressurized coolant reservoir. Check level when engine is cold. Use only approved coolant type (50/50 mix).',
    position: { x: -0.55, y: 0.68, z: -0.22 },
    isActive: true,
    isVisible: true,
    index: 3,
    constrainedPartId: 'CoolantAssembly',
    cameraDistance: 2.8,
    hasCameraView: false,
    markerStyle: 'pin',
    markerColor: '#2F80ED',
    media: [],
    actions: [],
    children: [],
  },
  {
    id: 'hs-5',
    name: 'Exhaust Warning Zone',
    description: 'High temperature zone — surface temperatures can exceed 400\u00B0C during operation. Maintain 1m clearance.',
    position: { x: 0.88, y: 0.35, z: 0.05 },
    isActive: false,
    isVisible: true,
    index: 4,
    constrainedPartId: 'ExhaustManifold',
    cameraDistance: 3.5,
    hasCameraView: true,
    markerStyle: 'diamond',
    markerColor: '#FF1F1F',
    media: [
      { id: 'm8', name: 'heat-zones.jpg', type: 'image', url: '', thumbnailUrl: '' },
    ],
    actions: [
      { id: 'a6', type: 'show-popup', label: 'Show Safety Warning' },
    ],
    children: [],
  },
];

const DEFAULT_SETTINGS: HotspotSettings = {
  cyclingEnabled: false,
  cycleInterval: 5,
  showDescriptions: true,
  showMarkerLabels: true,
  autoFocusOnSelect: true,
  offscreenIndicators: true,
};

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
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#36415D', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: '#868D9E', marginBottom: '24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div className="flex justify-end" style={{ gap: '10px' }}>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-[8px] hover:bg-[#F5F5F5] active:scale-[0.97] transition-all min-h-[40px]"
            style={{ fontSize: '13px', fontWeight: 500, color: '#36415D', border: '1px solid #C2C9DB' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-[8px] text-white hover:brightness-110 active:scale-[0.97] transition-all min-h-[40px]"
            style={{
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

// ── Marker Style Icon ───────────────────────────────────────────────

function MarkerIcon({ style, color, size = 14 }: { style: HotspotData['markerStyle']; color: string; size?: number }) {
  switch (style) {
    case 'pin':
      return <MapPin style={{ width: size, height: size, color }} />;
    case 'diamond':
      return <Diamond style={{ width: size, height: size, color }} />;
    case 'dot':
      return (
        <div
          style={{
            width: size - 2,
            height: size - 2,
            borderRadius: '50%',
            backgroundColor: color,
            border: '2px solid white',
            boxShadow: `0 0 0 1px ${color}`,
          }}
        />
      );
    case 'ring':
      return (
        <div
          style={{
            width: size - 2,
            height: size - 2,
            borderRadius: '50%',
            border: `2.5px solid ${color}`,
          }}
        />
      );
  }
}

// ── Hotspot List Item ───────────────────────────────────────────────

interface HotspotItemProps {
  hotspot: HotspotData;
  isSelected: boolean;
  isExpanded: boolean;
  depth: number;
  childCount: number;
  onSelect: () => void;
  onToggleExpand: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleVisibility: () => void;
}

function HotspotItem({
  hotspot,
  isSelected,
  isExpanded,
  depth,
  childCount,
  onSelect,
  onToggleExpand,
  onContextMenu,
  onToggleVisibility,
}: HotspotItemProps) {
  return (
    <div
      className={`group cursor-pointer transition-all ${isSelected ? '' : 'hover:bg-[#E9E9E9]/40'}`}
      style={{
        padding: '4px 8px',
        paddingLeft: `${8 + depth * 20}px`,
        borderRadius: '8px',
        backgroundColor: isSelected ? '#D9E0F0' : undefined,
        borderLeft: isSelected ? '3px solid #2F80ED' : '3px solid transparent',
        opacity: hotspot.isActive ? 1 : 0.5,
      }}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center" style={{ gap: '6px', minHeight: '32px' }}>
        {/* Drag handle */}
        <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab" style={{ color: '#868D9E' }}>
          <GripVertical className="size-3" />
        </div>

        {/* Expand/collapse for parents */}
        {childCount > 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="hover:bg-[#E9E9E9] rounded transition-colors p-0.5"
            style={{ color: '#868D9E' }}
          >
            {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </button>
        ) : (
          <div style={{ width: '16px' }} />
        )}

        {/* Marker icon */}
        <MarkerIcon style={hotspot.markerStyle} color={hotspot.markerColor} size={14} />

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div
            className="truncate"
            style={{
              fontSize: '13px',
              fontWeight: isSelected ? 600 : 500,
              color: '#36415D',
            }}
          >
            {hotspot.name}
          </div>
          {hotspot.description && (
            <div
              className="truncate"
              style={{
                fontSize: '11px',
                color: '#868D9E',
                marginTop: '-1px',
              }}
            >
              {hotspot.description}
            </div>
          )}
        </div>

        {/* Action count badge */}
        {hotspot.actions.length > 0 && (
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#2F80ED',
              backgroundColor: 'rgba(47, 128, 237, 0.1)',
              padding: '1px 6px',
              borderRadius: '10px',
            }}
          >
            {hotspot.actions.length}
          </div>
        )}

        {/* Visibility toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E9E9E9] rounded p-0.5"
          style={{ color: hotspot.isVisible ? '#868D9E' : '#C2C9DB' }}
          title={hotspot.isVisible ? 'Hide marker' : 'Show marker'}
        >
          {hotspot.isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        </button>

        {/* Three-dot menu */}
        <button
          onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E9E9E9] rounded p-0.5"
          style={{ color: '#868D9E' }}
        >
          <MoreVertical className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Context Menu ────────────────────────────────────────────────────

interface ContextMenuProps {
  position: { top: number; left: number };
  hotspot: HotspotData;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onAddSubHotspot: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  onFocusInViewer: () => void;
}

function HotspotContextMenu({
  position,
  hotspot,
  onClose,
  onRename,
  onDelete,
  onAddSubHotspot,
  onDuplicate,
  onToggleActive,
  onFocusInViewer,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside([menuRef], onClose, true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const items = [
    { icon: <Pencil className="size-3.5" />, label: 'Rename', onClick: onRename },
    { icon: <Camera className="size-3.5" />, label: 'Focus in Viewer', onClick: onFocusInViewer },
    { icon: <Copy className="size-3.5" />, label: 'Duplicate', onClick: onDuplicate },
    ...(hotspot.parentId ? [] : [{ icon: <Plus className="size-3.5" />, label: 'Add Sub-Hotspot', onClick: onAddSubHotspot }]),
    { icon: hotspot.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />, label: hotspot.isActive ? 'Deactivate' : 'Activate', onClick: onToggleActive },
    'separator' as const,
    { icon: <Trash2 className="size-3.5" style={{ color: '#FF1F1F' }} />, label: 'Delete', onClick: onDelete, danger: true },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[250]"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div
        className="bg-white rounded-[10px] py-1.5 min-w-[180px]"
        style={{
          border: '1px solid #E9E9E9',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {items.map((item, i) => {
          if (item === 'separator') {
            return <div key={i} style={{ height: '1px', backgroundColor: '#E9E9E9', margin: '4px 8px' }} />;
          }
          return (
            <button
              key={i}
              className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${
                item.danger ? 'hover:bg-[rgba(255,31,31,0.06)]' : 'hover:bg-[#F5F5F5]'
              }`}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: item.danger ? '#FF1F1F' : '#36415D',
              }}
              onClick={() => { item.onClick(); onClose(); }}
            >
              <span style={{ color: item.danger ? '#FF1F1F' : '#868D9E' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Media Thumbnail ─────────────────────────────────────────────────

function MediaThumbnail({
  file,
  onRemove,
}: {
  file: HotspotMediaFile;
  onRemove: () => void;
}) {
  const iconMap = {
    image: <Image className="size-5" style={{ color: '#868D9E' }} />,
    video: <Video className="size-5" style={{ color: '#868D9E' }} />,
    pdf: <FileText className="size-5" style={{ color: '#868D9E' }} />,
  };

  return (
    <div
      className="group/media relative rounded-[8px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      style={{
        width: '72px',
        height: '72px',
        backgroundColor: '#F5F5F5',
        border: '1px solid #E9E9E9',
      }}
    >
      <div className="flex items-center justify-center h-full">
        {iconMap[file.type]}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 px-1 py-0.5 truncate"
        style={{
          fontSize: '9px',
          color: '#868D9E',
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      >
        {file.name}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 opacity-0 group-hover/media:opacity-100 transition-opacity rounded-full bg-white shadow-sm hover:bg-[#FFF0F0]"
        style={{
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X className="size-2.5" style={{ color: '#FF1F1F' }} />
      </button>
    </div>
  );
}

// ── Detail Panel ────────────────────────────────────────────────────

interface DetailPanelProps {
  hotspot: HotspotData;
  onUpdate: (updates: Partial<HotspotData>) => void;
  onAddMedia: () => void;
  onRemoveMedia: (mediaId: string) => void;
  onFocusInViewer: () => void;
}

function DetailPanel({ hotspot, onUpdate, onAddMedia, onRemoveMedia, onFocusInViewer }: DetailPanelProps) {
  const [localName, setLocalName] = useState(hotspot.name);
  const [localDesc, setLocalDesc] = useState(hotspot.description);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(hotspot.name);
    setLocalDesc(hotspot.description);
  }, [hotspot.id]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const commitName = () => {
    const trimmed = localName.trim();
    if (trimmed && trimmed !== hotspot.name) {
      onUpdate({ name: trimmed });
    } else {
      setLocalName(hotspot.name);
    }
    setIsEditingName(false);
  };

  const markerStyles: HotspotData['markerStyle'][] = ['pin', 'diamond', 'dot', 'ring'];
  const markerColors = ['#2F80ED', '#11E874', '#FF6B35', '#FF1F1F', '#8404B3', '#36415D'];

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar" style={{ padding: '12px' }}>
      {/* Name */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Name
        </label>
        {isEditingName ? (
          <input
            ref={nameInputRef}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setLocalName(hotspot.name); setIsEditingName(false); } }}
            className="w-full bg-white border outline-none min-h-[36px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all mt-1"
            style={{ borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: '#36415D', borderColor: '#C2C9DB' }}
          />
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-[#E9E9E9]/40 rounded-[8px] transition-colors mt-1"
            style={{ padding: '6px 10px', minHeight: '36px' }}
            onClick={() => setIsEditingName(true)}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#36415D', flex: 1 }}>{hotspot.name}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-50" style={{ color: '#868D9E' }} />
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Description
        </label>
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          onBlur={() => {
            if (localDesc !== hotspot.description) {
              onUpdate({ description: localDesc });
            }
          }}
          placeholder="Add a description..."
          className="w-full bg-white border outline-none focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all mt-1 resize-none custom-scrollbar"
          style={{
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '13px',
            color: '#36415D',
            borderColor: '#C2C9DB',
            minHeight: '72px',
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Position */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Position
        </label>
        <div className="flex gap-2 mt-1">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="flex-1">
              <div
                className="flex items-center gap-1.5 bg-white border rounded-[8px] overflow-hidden"
                style={{ borderColor: '#C2C9DB', padding: '4px 8px', minHeight: '34px' }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2F80ED', textTransform: 'uppercase' }}>
                  {axis}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={hotspot.position[axis]}
                  onChange={(e) =>
                    onUpdate({
                      position: { ...hotspot.position, [axis]: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-transparent outline-none text-right"
                  style={{ fontSize: '12px', color: '#36415D', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onFocusInViewer}
          className="flex items-center gap-1.5 mt-2 hover:bg-[#E9E9E9]/50 rounded-[6px] px-2 py-1 transition-colors"
          style={{ fontSize: '12px', color: '#2F80ED', fontWeight: 500 }}
        >
          <Crosshair className="size-3" />
          Focus in Viewer
        </button>
      </div>

      {/* Camera Distance */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Camera Distance
        </label>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={hotspot.cameraDistance}
            onChange={(e) => onUpdate({ cameraDistance: parseFloat(e.target.value) })}
            className="flex-1"
            style={{ accentColor: '#2F80ED' }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#36415D', fontVariantNumeric: 'tabular-nums', minWidth: '36px', textAlign: 'right' }}>
            {hotspot.cameraDistance.toFixed(1)}m
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="has-camera-view"
            checked={hotspot.hasCameraView}
            onChange={(e) => onUpdate({ hasCameraView: e.target.checked })}
            style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
          />
          <label htmlFor="has-camera-view" style={{ fontSize: '12px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
            Save camera viewpoint
          </label>
        </div>
      </div>

      {/* Marker Style */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Marker Style
        </label>
        <div className="flex gap-2 mt-1.5">
          {markerStyles.map((ms) => (
            <button
              key={ms}
              onClick={() => onUpdate({ markerStyle: ms })}
              className="flex items-center justify-center rounded-[8px] border transition-all hover:shadow-sm"
              style={{
                width: '36px',
                height: '36px',
                borderColor: hotspot.markerStyle === ms ? '#2F80ED' : '#E9E9E9',
                backgroundColor: hotspot.markerStyle === ms ? 'rgba(47,128,237,0.06)' : 'white',
              }}
            >
              <MarkerIcon style={ms} color={hotspot.markerStyle === ms ? '#2F80ED' : '#868D9E'} />
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {markerColors.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ markerColor: color })}
              className="rounded-full transition-all hover:scale-110"
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: color,
                border: hotspot.markerColor === color ? '2.5px solid white' : '2px solid transparent',
                boxShadow: hotspot.markerColor === color ? `0 0 0 2px ${color}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Constrained Part */}
      {hotspot.constrainedPartId && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Attached To Part
          </label>
          <div
            className="flex items-center gap-2 mt-1 bg-[#F5F5F5] rounded-[8px]"
            style={{ padding: '8px 10px', border: '1px solid #E9E9E9' }}
          >
            <Navigation className="size-3.5" style={{ color: '#2F80ED' }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#36415D' }}>
              {hotspot.constrainedPartId}
            </span>
          </div>
        </div>
      )}

      {/* Media Attachments */}
      <div style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-between">
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Media ({hotspot.media.length})
          </label>
          <button
            onClick={onAddMedia}
            className="flex items-center gap-1 hover:bg-[#E9E9E9]/50 rounded-[6px] px-2 py-0.5 transition-colors"
            style={{ fontSize: '11px', color: '#2F80ED', fontWeight: 600 }}
          >
            <Plus className="size-3" />
            Add
          </button>
        </div>
        {hotspot.media.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {hotspot.media.map((file) => (
              <MediaThumbnail key={file.id} file={file} onRemove={() => onRemoveMedia(file.id)} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center mt-2 rounded-[8px] border-dashed cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            style={{ border: '2px dashed #C2C9DB', padding: '20px', borderRadius: '8px' }}
            onClick={onAddMedia}
          >
            <Image className="size-5 mb-1" style={{ color: '#C2C9DB' }} />
            <span style={{ fontSize: '12px', color: '#868D9E' }}>Drop media here or click to add</span>
          </div>
        )}
      </div>

      {/* Actions placeholder */}
      <div style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-between">
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Actions ({hotspot.actions.length})
          </label>
          <button
            className="flex items-center gap-1 hover:bg-[#E9E9E9]/50 rounded-[6px] px-2 py-0.5 transition-colors"
            style={{ fontSize: '11px', color: '#2F80ED', fontWeight: 600 }}
          >
            <Plus className="size-3" />
            Add
          </button>
        </div>
        {hotspot.actions.length > 0 ? (
          <div className="flex flex-col gap-1.5 mt-2">
            {hotspot.actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-2 bg-white rounded-[8px] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                style={{ padding: '8px 10px', border: '1px solid #E9E9E9' }}
              >
                <ArrowRight className="size-3.5" style={{ color: '#2F80ED' }} />
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#36415D', flex: 1 }}>
                  {action.label}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#868D9E',
                    backgroundColor: '#F5F5F5',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {action.type.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center justify-center mt-2 rounded-[8px]"
            style={{ padding: '16px', backgroundColor: '#F5F5F5', border: '1px solid #E9E9E9', borderRadius: '8px' }}
          >
            <span style={{ fontSize: '12px', color: '#868D9E' }}>No actions configured</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#868D9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Status
        </label>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hotspot-active"
              checked={hotspot.isActive}
              onChange={(e) => onUpdate({ isActive: e.target.checked })}
              style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
            />
            <label htmlFor="hotspot-active" style={{ fontSize: '12px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
              Active
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hotspot-visible"
              checked={hotspot.isVisible}
              onChange={(e) => onUpdate({ isVisible: e.target.checked })}
              style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
            />
            <label htmlFor="hotspot-visible" style={{ fontSize: '12px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
              Visible
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings Panel ──────────────────────────────────────────────────

function SettingsPanel({
  settings,
  onUpdate,
}: {
  settings: HotspotSettings;
  onUpdate: (updates: Partial<HotspotSettings>) => void;
}) {
  return (
    <div className="flex flex-col gap-4" style={{ padding: '16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#36415D', marginBottom: '4px' }}>
        Hotspot Settings
      </div>

      {/* Cycling */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="cycling-enabled"
            checked={settings.cyclingEnabled}
            onChange={(e) => onUpdate({ cyclingEnabled: e.target.checked })}
            style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
          />
          <label htmlFor="cycling-enabled" style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
            Enable auto-cycling
          </label>
        </div>
        {settings.cyclingEnabled && (
          <div className="flex items-center gap-3" style={{ paddingLeft: '22px' }}>
            <Timer className="size-3.5" style={{ color: '#868D9E' }} />
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={settings.cycleInterval}
              onChange={(e) => onUpdate({ cycleInterval: parseInt(e.target.value) })}
              className="flex-1"
              style={{ accentColor: '#2F80ED' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#36415D', fontVariantNumeric: 'tabular-nums', minWidth: '28px' }}>
              {settings.cycleInterval}s
            </span>
          </div>
        )}
      </div>

      {/* Show Descriptions */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-descriptions"
          checked={settings.showDescriptions}
          onChange={(e) => onUpdate({ showDescriptions: e.target.checked })}
          style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
        />
        <label htmlFor="show-descriptions" style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
          Show description tooltips
        </label>
      </div>

      {/* Show Marker Labels */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-labels"
          checked={settings.showMarkerLabels}
          onChange={(e) => onUpdate({ showMarkerLabels: e.target.checked })}
          style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
        />
        <label htmlFor="show-labels" style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
          Show marker labels
        </label>
      </div>

      {/* Auto-focus on select */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="auto-focus"
          checked={settings.autoFocusOnSelect}
          onChange={(e) => onUpdate({ autoFocusOnSelect: e.target.checked })}
          style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
        />
        <label htmlFor="auto-focus" style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
          Auto-focus camera on selection
        </label>
      </div>

      {/* Off-screen indicators */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="offscreen-indicators"
          checked={settings.offscreenIndicators}
          onChange={(e) => onUpdate({ offscreenIndicators: e.target.checked })}
          style={{ accentColor: '#2F80ED', width: '14px', height: '14px' }}
        />
        <label htmlFor="offscreen-indicators" style={{ fontSize: '13px', color: '#36415D', fontWeight: 500, cursor: 'pointer' }}>
          Show off-screen indicators
        </label>
      </div>

      {/* Info note */}
      <div
        className="flex items-start gap-2 rounded-[8px]"
        style={{
          padding: '10px 12px',
          backgroundColor: 'rgba(47, 128, 237, 0.06)',
          border: '1px solid rgba(47, 128, 237, 0.15)',
          borderRadius: '8px',
          marginTop: '4px',
        }}
      >
        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" style={{ color: '#2F80ED' }} />
        <span style={{ fontSize: '12px', color: '#36415D', lineHeight: 1.5 }}>
          Cycling will automatically highlight hotspots in sequence. Users can interrupt cycling by interacting with any hotspot.
        </span>
      </div>
    </div>
  );
}

// ── 3D Marker Overlay (mockup in viewer) ────────────────────────────

interface Marker3DOverlayProps {
  hotspots: HotspotData[];
  selectedId: string | null;
  settings: HotspotSettings;
  cyclingIndex: number;
  onSelectHotspot: (id: string) => void;
}

function Marker3DOverlay({ hotspots, selectedId, settings, cyclingIndex, onSelectHotspot }: Marker3DOverlayProps) {
  // Convert 3D position to 2D screen-space mockup position
  const toScreen = (pos: { x: number; y: number; z: number }) => ({
    left: `${50 + pos.x * 30}%`,
    top: `${50 - pos.y * 30 + pos.z * 10}%`,
  });

  const visibleHotspots = hotspots.filter((h) => h.isVisible && !h.parentId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {visibleHotspots.map((hs, i) => {
        const screen = toScreen(hs.position);
        const isSelected = selectedId === hs.id;
        const isCycling = settings.cyclingEnabled && cyclingIndex === i;
        const isHovered = hoveredId === hs.id;
        const showTooltip = (isSelected || isHovered || isCycling) && settings.showDescriptions;

        return (
          <div key={hs.id}>
            {/* Marker */}
            <motion.div
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: screen.left,
                top: screen.top,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 20 : 10,
              }}
              animate={{
                scale: isSelected || isCycling ? 1.3 : 1,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              onClick={() => onSelectHotspot(hs.id)}
              onMouseEnter={() => setHoveredId(hs.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulse ring for selected/cycling */}
              {(isSelected || isCycling) && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '40px',
                    height: '40px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${hs.markerColor}`,
                    opacity: 0.3,
                  }}
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Marker body */}
              <div
                className="flex items-center justify-center rounded-full shadow-lg"
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: hs.markerColor,
                  border: `2.5px solid white`,
                  boxShadow: isSelected
                    ? `0 0 0 3px ${hs.markerColor}40, 0 4px 12px rgba(0,0,0,0.2)`
                    : '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <MarkerIcon style={hs.markerStyle} color="white" size={12} />
              </div>

              {/* Label */}
              {settings.showMarkerLabels && (
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {hs.name}
                </div>
              )}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && hs.description && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute pointer-events-none"
                  style={{
                    left: screen.left,
                    top: screen.top,
                    transform: 'translate(-50%, -100%)',
                    marginTop: '-28px',
                    zIndex: 30,
                  }}
                >
                  <div
                    className="bg-white rounded-[10px] shadow-lg max-w-[220px]"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #E9E9E9',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#36415D', marginBottom: '4px' }}>
                      {hs.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#868D9E', lineHeight: 1.4 }}>
                      {hs.description.length > 100 ? `${hs.description.slice(0, 100)}...` : hs.description}
                    </div>
                    {hs.actions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5" style={{ fontSize: '10px', color: '#2F80ED', fontWeight: 600 }}>
                        <ArrowRight className="size-3" />
                        {hs.actions.length} action{hs.actions.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    {/* Arrow */}
                    <div
                      className="absolute"
                      style={{
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'white',
                        borderRight: '1px solid #E9E9E9',
                        borderBottom: '1px solid #E9E9E9',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Off-screen indicators */}
      {settings.offscreenIndicators && (
        <>
          {/* Left indicator (mockup) */}
          <div
            className="absolute flex items-center gap-1 pointer-events-auto cursor-pointer"
            style={{
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            onClick={() => {
              const offscreen = hotspots.find((h) => h.isVisible && !h.parentId && h.position.x < -0.5);
              if (offscreen) onSelectHotspot(offscreen.id);
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'rgba(47, 128, 237, 0.8)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <ChevronRight className="size-3.5 rotate-180" style={{ color: 'white' }} />
            </div>
          </div>
        </>
      )}

      {/* Cycling animation bar */}
      {settings.cyclingEnabled && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto"
          style={{
            backgroundColor: 'rgba(0,0,0,0.65)',
            padding: '6px 14px',
            borderRadius: '20px',
          }}
        >
          <RotateCcw className="size-3" style={{ color: 'white' }} />
          <span style={{ fontSize: '11px', color: 'white', fontWeight: 500 }}>
            Cycling: {visibleHotspots[cyclingIndex]?.name || '---'}
          </span>
          <div className="flex gap-1 ml-1">
            {visibleHotspots.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: i === cyclingIndex ? '#2F80ED' : 'rgba(255,255,255,0.4)',
                  transition: 'background-color 0.2s',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main HotspotsPanel Component ────────────────────────────────────

interface HotspotsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotspotsPanel({ isOpen, onClose }: HotspotsPanelProps) {
  const [hotspots, setHotspots] = useState<HotspotData[]>(MOCK_HOTSPOTS);
  const [selectedId, setSelectedId] = useState<string | null>('hs-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['hs-1', 'hs-3']));
  const [settings, setSettings] = useState<HotspotSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    onConfirm: () => void;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { top: number; left: number };
    hotspotId: string;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [cyclingIndex, setCyclingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');

  const selectedHotspot = hotspots.find((h) => h.id === selectedId) ?? null;

  // Cycling timer
  useEffect(() => {
    if (!settings.cyclingEnabled) return;
    const visible = hotspots.filter((h) => h.isVisible && !h.parentId);
    if (visible.length === 0) return;
    const interval = setInterval(() => {
      setCyclingIndex((prev) => (prev + 1) % visible.length);
    }, settings.cycleInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.cyclingEnabled, settings.cycleInterval, hotspots]);

  // Rename input focus
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Filtered hotspots (search)
  const filteredHotspots = hotspots.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q);
  });

  // Build ordered list for display: root items first, children under parents
  const rootHotspots = filteredHotspots.filter((h) => !h.parentId).sort((a, b) => a.index - b.index);

  const getChildren = (parentId: string) =>
    filteredHotspots.filter((h) => h.parentId === parentId).sort((a, b) => a.index - b.index);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCreate = useCallback(() => {
    let counter = hotspots.length + 1;
    let name = `Hotspot ${counter}`;
    while (hotspots.some((h) => h.name === name)) {
      counter++;
      name = `Hotspot ${counter}`;
    }

    const newHotspot: HotspotData = {
      id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      description: '',
      position: { x: 0, y: 0, z: 0 },
      isActive: true,
      isVisible: true,
      index: rootHotspots.length,
      cameraDistance: 3.0,
      hasCameraView: false,
      markerStyle: 'pin',
      markerColor: '#2F80ED',
      media: [],
      actions: [],
      children: [],
    };
    setHotspots((prev) => [...prev, newHotspot]);
    setSelectedId(newHotspot.id);
    setActiveTab('detail');
    setToastMessage('Hotspot created — position it in the 3D viewer');
  }, [hotspots, rootHotspots.length]);

  const handleCreateSubHotspot = useCallback((parentId: string) => {
    const parent = hotspots.find((h) => h.id === parentId);
    if (!parent) return;
    const siblings = hotspots.filter((h) => h.parentId === parentId);
    const newSub: HotspotData = {
      id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${parent.name} - Sub ${siblings.length + 1}`,
      description: '',
      position: { ...parent.position },
      isActive: true,
      isVisible: true,
      index: siblings.length,
      parentId,
      cameraDistance: 1.5,
      hasCameraView: false,
      markerStyle: 'dot',
      markerColor: parent.markerColor,
      media: [],
      actions: [],
      children: [],
    };
    setHotspots((prev) =>
      prev.map((h) => (h.id === parentId ? { ...h, children: [...h.children, newSub.id] } : h)).concat(newSub)
    );
    setExpandedIds((prev) => new Set([...prev, parentId]));
    setSelectedId(newSub.id);
    setActiveTab('detail');
    setToastMessage('Sub-hotspot added');
  }, [hotspots]);

  const handleDuplicate = useCallback((hotspotId: string) => {
    const source = hotspots.find((h) => h.id === hotspotId);
    if (!source) return;
    const duplicate: HotspotData = {
      ...source,
      id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${source.name} (Copy)`,
      index: (source.parentId
        ? hotspots.filter((h) => h.parentId === source.parentId).length
        : rootHotspots.length),
      children: [],
    };
    setHotspots((prev) => [...prev, duplicate]);
    setSelectedId(duplicate.id);
    setToastMessage(`Duplicated "${source.name}"`);
  }, [hotspots, rootHotspots.length]);

  const handleDelete = useCallback((hotspotId: string) => {
    const hotspot = hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    const childCount = hotspots.filter((h) => h.parentId === hotspotId).length;
    setConfirmDialog({
      title: 'Delete Hotspot',
      message: `Are you sure you want to delete "${hotspot.name}"?${childCount > 0 ? ` This will also delete ${childCount} sub-hotspot${childCount > 1 ? 's' : ''}.` : ''}`,
      confirmLabel: 'Delete',
      confirmColor: '#FF1F1F',
      onConfirm: () => {
        setHotspots((prev) => {
          // Remove hotspot and its children
          const idsToRemove = new Set([hotspotId, ...prev.filter((h) => h.parentId === hotspotId).map((h) => h.id)]);
          return prev
            .filter((h) => !idsToRemove.has(h.id))
            .map((h) => ({
              ...h,
              children: h.children.filter((cid) => !idsToRemove.has(cid)),
            }));
        });
        if (selectedId === hotspotId || hotspots.find((h) => h.id === selectedId)?.parentId === hotspotId) {
          setSelectedId(null);
          setActiveTab('list');
        }
        setConfirmDialog(null);
        setToastMessage(`Deleted "${hotspot.name}"`);
      },
    });
  }, [hotspots, selectedId]);

  const handleRename = useCallback((hotspotId: string, name: string) => {
    setHotspots((prev) => prev.map((h) => (h.id === hotspotId ? { ...h, name } : h)));
  }, []);

  const handleUpdate = useCallback((hotspotId: string, updates: Partial<HotspotData>) => {
    setHotspots((prev) => prev.map((h) => (h.id === hotspotId ? { ...h, ...updates } : h)));
  }, []);

  const handleToggleVisibility = useCallback((hotspotId: string) => {
    setHotspots((prev) => prev.map((h) => (h.id === hotspotId ? { ...h, isVisible: !h.isVisible } : h)));
  }, []);

  const handleToggleActive = useCallback((hotspotId: string) => {
    setHotspots((prev) => prev.map((h) => (h.id === hotspotId ? { ...h, isActive: !h.isActive } : h)));
  }, []);

  const handleToggleExpand = useCallback((hotspotId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(hotspotId)) next.delete(hotspotId);
      else next.add(hotspotId);
      return next;
    });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, hotspotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      position: { top: e.clientY, left: e.clientX },
      hotspotId,
    });
  }, []);

  const handleRemoveMedia = useCallback((hotspotId: string, mediaId: string) => {
    setHotspots((prev) =>
      prev.map((h) => (h.id === hotspotId ? { ...h, media: h.media.filter((m) => m.id !== mediaId) } : h))
    );
  }, []);

  const handleUpdateSettings = useCallback((updates: Partial<HotspotSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const contextHotspot = contextMenu ? hotspots.find((h) => h.id === contextMenu.hotspotId) : null;

  // Count active root hotspots for header
  const activeCount = hotspots.filter((h) => h.isActive && !h.parentId).length;
  const totalRootCount = hotspots.filter((h) => !h.parentId).length;

  return (
    <>
      {/* Hotspots List Window */}
      <FrontlineWindow
        isOpen={isOpen}
        onClose={onClose}
        title={`Hotspots (${activeCount}/${totalRootCount})`}
        icon={<MapPin className="size-4" style={{ color: '#2F80ED' }} />}
        defaultPosition={{ x: window.innerWidth - 380 - 16, y: 60 }}
        defaultSize={{ width: 360, height: 580 }}
        minWidth={300}
        minHeight={350}
      >
        <div className="flex flex-col h-full">
          {/* Tab bar: List / Detail */}
          <div
            className="flex border-b"
            style={{ borderColor: '#E9E9E9', padding: '0 12px' }}
          >
            {(['list', 'detail'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-3 py-2 transition-colors"
                style={{
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? '#2F80ED' : '#868D9E',
                }}
              >
                {tab === 'list' ? 'Hotspot List' : 'Details'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="hotspot-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#2F80ED', borderRadius: '1px 1px 0 0' }}
                  />
                )}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-[6px] transition-colors ${showSettings ? 'bg-[#D9E0F0]' : 'hover:bg-[#E9E9E9]/50'}`}
              style={{ color: showSettings ? '#2F80ED' : '#868D9E' }}
              title="Settings"
            >
              <Settings2 className="size-3.5" />
            </button>
          </div>

          {/* Content */}
          {showSettings ? (
            <SettingsPanel settings={settings} onUpdate={handleUpdateSettings} />
          ) : activeTab === 'list' ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Search */}
              <div style={{ padding: '8px 12px' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#868D9E' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hotspots..."
                    className="w-full bg-white border outline-none min-h-[36px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                    style={{
                      borderRadius: '8px',
                      padding: '6px 12px 6px 32px',
                      fontSize: '13px',
                      color: '#36415D',
                      borderColor: '#C2C9DB',
                    }}
                  />
                </div>
              </div>

              {/* Add button */}
              <div style={{ padding: '0 12px 8px' }}>
                <button
                  onClick={handleCreate}
                  className="w-full flex items-center justify-center gap-2 rounded-[8px] hover:shadow-[0_2px_8px_rgba(47,128,237,0.25)] active:scale-[0.98] transition-all min-h-[36px]"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: '#2F80ED',
                    padding: '6px 12px',
                  }}
                >
                  <Plus className="size-3.5" />
                  Add Hotspot
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '0 4px' }}>
                {rootHotspots.length > 0 ? (
                  rootHotspots.map((hs) => {
                    const children = getChildren(hs.id);
                    const isExpanded = expandedIds.has(hs.id);

                    // Inline rename
                    if (renamingId === hs.id) {
                      return (
                        <div key={hs.id} style={{ padding: '4px 8px' }}>
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => {
                              const trimmed = renameValue.trim();
                              if (trimmed) handleRename(hs.id, trimmed);
                              setRenamingId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const trimmed = renameValue.trim();
                                if (trimmed) handleRename(hs.id, trimmed);
                                setRenamingId(null);
                              }
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="w-full bg-white border outline-none min-h-[32px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                            style={{ borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: '#36415D', borderColor: '#2E80ED' }}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={hs.id}>
                        <HotspotItem
                          hotspot={hs}
                          isSelected={selectedId === hs.id}
                          isExpanded={isExpanded}
                          depth={0}
                          childCount={children.length}
                          onSelect={() => {
                            setSelectedId(hs.id);
                          }}
                          onToggleExpand={() => handleToggleExpand(hs.id)}
                          onContextMenu={(e) => handleContextMenu(e, hs.id)}
                          onToggleVisibility={() => handleToggleVisibility(hs.id)}
                        />
                        <AnimatePresence initial={false}>
                          {isExpanded && children.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              style={{ overflow: 'hidden' }}
                            >
                              {children.map((child) => {
                                if (renamingId === child.id) {
                                  return (
                                    <div key={child.id} style={{ padding: '4px 8px', paddingLeft: '28px' }}>
                                      <input
                                        ref={renameInputRef}
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => {
                                          const trimmed = renameValue.trim();
                                          if (trimmed) handleRename(child.id, trimmed);
                                          setRenamingId(null);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const trimmed = renameValue.trim();
                                            if (trimmed) handleRename(child.id, trimmed);
                                            setRenamingId(null);
                                          }
                                          if (e.key === 'Escape') setRenamingId(null);
                                        }}
                                        className="w-full bg-white border outline-none min-h-[32px] focus:border-[#2E80ED] focus:shadow-[0_0_0_2px_rgba(46,128,237,0.12)] transition-all"
                                        style={{ borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: '#36415D', borderColor: '#2E80ED' }}
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <HotspotItem
                                    key={child.id}
                                    hotspot={child}
                                    isSelected={selectedId === child.id}
                                    isExpanded={false}
                                    depth={1}
                                    childCount={0}
                                    onSelect={() => setSelectedId(child.id)}
                                    onToggleExpand={() => {}}
                                    onContextMenu={(e) => handleContextMenu(e, child.id)}
                                    onToggleVisibility={() => handleToggleVisibility(child.id)}
                                  />
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8" style={{ color: '#868D9E' }}>
                    <MapPin className="size-8 mb-2" style={{ color: '#C2C9DB' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      {searchQuery ? 'No hotspots match your search' : 'No hotspots yet'}
                    </span>
                    {!searchQuery && (
                      <span style={{ fontSize: '12px', marginTop: '4px' }}>
                        Click "Add Hotspot" to get started
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Detail tab */
            selectedHotspot ? (
              <DetailPanel
                hotspot={selectedHotspot}
                onUpdate={(updates) => handleUpdate(selectedHotspot.id, updates)}
                onAddMedia={() => setToastMessage('Media library would open here')}
                onRemoveMedia={(mediaId) => handleRemoveMedia(selectedHotspot.id, mediaId)}
                onFocusInViewer={() => setToastMessage(`Focusing on "${selectedHotspot.name}" in viewer`)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1" style={{ color: '#868D9E' }}>
                <Crosshair className="size-8 mb-2" style={{ color: '#C2C9DB' }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Select a hotspot</span>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>to view and edit its details</span>
              </div>
            )
          )}
        </div>
      </FrontlineWindow>

      {/* 3D Marker Overlay — rendered in the viewer area */}
      {isOpen && (
        <Marker3DOverlay
          hotspots={hotspots}
          selectedId={selectedId}
          settings={settings}
          cyclingIndex={cyclingIndex}
          onSelectHotspot={(id) => {
            setSelectedId(id);
            setCyclingIndex(0); // Interrupt cycling
          }}
        />
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && contextHotspot && (
          <HotspotContextMenu
            position={contextMenu.position}
            hotspot={contextHotspot}
            onClose={() => setContextMenu(null)}
            onRename={() => {
              setRenamingId(contextMenu.hotspotId);
              setRenameValue(contextHotspot.name);
            }}
            onDelete={() => handleDelete(contextMenu.hotspotId)}
            onAddSubHotspot={() => handleCreateSubHotspot(contextMenu.hotspotId)}
            onDuplicate={() => handleDuplicate(contextMenu.hotspotId)}
            onToggleActive={() => handleToggleActive(contextMenu.hotspotId)}
            onFocusInViewer={() => setToastMessage(`Focusing on "${contextHotspot.name}" in viewer`)}
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
    </>
  );
}
