import { useState, useRef, useCallback } from 'react';
import {
  FolderOpen,
  ArrowRight,
  Bookmark,
  ExternalLink,
  FileText,
  Play,
  Code,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

// ── Types ──────────────────────────────────────────────────────────────

type ActionType =
  | 'action-group'
  | 'go-to-hotspot'
  | 'open-bookmark'
  | 'open-link'
  | 'open-procedure'
  | 'play-animation'
  | 'unity-event';

type AnimationMode = 'PlayOnce' | 'Loop' | 'PingPong';

interface HotspotAction {
  id: string;
  type: ActionType;
  label: string;
  // Per-type config
  targetHotspot?: string;
  bookmarkId?: string;
  url?: string;
  procedureId?: string;
  animationId?: string;
  animationMode?: AnimationMode;
  animationReverse?: boolean;
  eventName?: string;
  children?: HotspotAction[]; // For action groups
}

// ── Mock Data ──────────────────────────────────────────────────────────

const MOCK_HOTSPOTS = [
  { id: 'hs-1', name: 'Fuel Inlet Valve' },
  { id: 'hs-2', name: 'Oil Filter Access' },
  { id: 'hs-3', name: 'Main Control Panel' },
  { id: 'hs-4', name: 'Exhaust Port' },
  { id: 'hs-5', name: 'Coolant Reservoir' },
];

const MOCK_BOOKMARKS = [
  { id: 'bm-1', name: 'Front Assembly View' },
  { id: 'bm-2', name: 'Engine Bay Overview' },
  { id: 'bm-3', name: 'Exploded Parts View' },
  { id: 'bm-4', name: 'Wiring Diagram Angle' },
];

const MOCK_PROCEDURES = [
  { id: 'proc-1', name: 'Oil Change Procedure', steps: 8 },
  { id: 'proc-2', name: 'Filter Replacement', steps: 5 },
  { id: 'proc-3', name: 'Safety Inspection', steps: 12 },
  { id: 'proc-4', name: 'Belt Tension Check', steps: 4 },
];

const MOCK_ANIMATIONS = [
  { id: 'anim-1', name: 'Open Fuel Cap', duration: '2.4s' },
  { id: 'anim-2', name: 'Rotate Assembly', duration: '3.1s' },
  { id: 'anim-3', name: 'Slide Cover Off', duration: '1.8s' },
  { id: 'anim-4', name: 'Hinge Panel Open', duration: '1.2s' },
];

const INITIAL_ACTIVATED_ACTIONS: HotspotAction[] = [
  {
    id: 'a1',
    type: 'play-animation',
    label: 'Play Animation',
    animationId: 'anim-1',
    animationMode: 'PlayOnce',
    animationReverse: false,
  },
  {
    id: 'a2',
    type: 'open-bookmark',
    label: 'Open Bookmark',
    bookmarkId: 'bm-2',
  },
  {
    id: 'a3',
    type: 'go-to-hotspot',
    label: 'Go To Hotspot',
    targetHotspot: 'hs-3',
  },
];

const INITIAL_DEACTIVATED_ACTIONS: HotspotAction[] = [
  {
    id: 'd1',
    type: 'play-animation',
    label: 'Play Animation',
    animationId: 'anim-1',
    animationMode: 'PlayOnce',
    animationReverse: true,
  },
];

const ACTION_TYPES: { type: ActionType; label: string; icon: typeof FolderOpen; description: string }[] = [
  { type: 'action-group', label: 'Action Group', icon: FolderOpen, description: 'Group multiple actions' },
  { type: 'go-to-hotspot', label: 'Go To Hotspot', icon: ArrowRight, description: 'Navigate to another hotspot' },
  { type: 'open-bookmark', label: 'Open Bookmark', icon: Bookmark, description: 'Jump to a saved view' },
  { type: 'open-link', label: 'Open Link', icon: ExternalLink, description: 'Open an external URL' },
  { type: 'open-procedure', label: 'Open Procedure', icon: FileText, description: 'Launch a procedure' },
  { type: 'play-animation', label: 'Play Animation', icon: Play, description: 'Trigger a 3D animation' },
  { type: 'unity-event', label: 'Unity Event', icon: Code, description: 'Send a custom event' },
];

function getActionIcon(type: ActionType) {
  const entry = ACTION_TYPES.find((a) => a.type === type);
  return entry ? entry.icon : Settings2;
}

function getActionTypeLabel(type: ActionType) {
  const entry = ACTION_TYPES.find((a) => a.type === type);
  return entry?.label ?? type;
}

function getTargetLabel(action: HotspotAction): string {
  switch (action.type) {
    case 'go-to-hotspot':
      return MOCK_HOTSPOTS.find((h) => h.id === action.targetHotspot)?.name ?? 'Select hotspot...';
    case 'open-bookmark':
      return MOCK_BOOKMARKS.find((b) => b.id === action.bookmarkId)?.name ?? 'Select bookmark...';
    case 'open-link':
      return action.url || 'Enter URL...';
    case 'open-procedure':
      return MOCK_PROCEDURES.find((p) => p.id === action.procedureId)?.name ?? 'Select procedure...';
    case 'play-animation': {
      const anim = MOCK_ANIMATIONS.find((a) => a.id === action.animationId);
      return anim ? `${anim.name} (${action.animationMode ?? 'PlayOnce'})` : 'Select animation...';
    }
    case 'unity-event':
      return action.eventName || 'Enter event name...';
    case 'action-group':
      return `${action.children?.length ?? 0} sub-actions`;
    default:
      return '';
  }
}

// ── Action Item Component ──────────────────────────────────────────────

function ActionItem({
  action,
  index,
  onRemove,
  onUpdate,
  dragHandlers,
}: {
  action: HotspotAction;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<HotspotAction>) => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, idx: number) => void;
    onDragOver: (e: React.DragEvent, idx: number) => void;
    onDragEnd: () => void;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getActionIcon(action.type);

  return (
    <div
      className="group"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-[var(--input)] bg-card transition-all cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="size-3.5 text-muted shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary-background)' }}
        >
          <Icon className="size-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            {getActionTypeLabel(action.type)}
          </div>
          <div className="text-muted truncate" style={{ fontSize: 'var(--text-xs)' }}>
            {getTargetLabel(action)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="size-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
          title="Remove action"
        >
          <X className="size-3.5 text-destructive" />
        </button>
        {expanded ? (
          <ChevronDown className="size-3.5 text-muted shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 text-muted shrink-0" />
        )}
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="ml-6 mt-1 mb-2 p-3 rounded-lg border border-border bg-background" style={{ fontSize: 'var(--text-sm)' }}>
          <ActionConfig action={action} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ── Per-type configuration panels ──────────────────────────────────────

function ActionConfig({
  action,
  onUpdate,
}: {
  action: HotspotAction;
  onUpdate: (updates: Partial<HotspotAction>) => void;
}) {
  switch (action.type) {
    case 'go-to-hotspot':
      return (
        <div className="flex flex-col gap-2">
          <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            Target Hotspot
          </label>
          <select
            value={action.targetHotspot ?? ''}
            onChange={(e) => onUpdate({ targetHotspot: e.target.value })}
            className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow"
            style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
          >
            <option value="">Select hotspot...</option>
            {MOCK_HOTSPOTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      );

    case 'open-bookmark':
      return (
        <div className="flex flex-col gap-2">
          <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            Bookmark
          </label>
          <select
            value={action.bookmarkId ?? ''}
            onChange={(e) => onUpdate({ bookmarkId: e.target.value })}
            className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow"
            style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
          >
            <option value="">Select bookmark...</option>
            {MOCK_BOOKMARKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {action.bookmarkId && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
              <Bookmark className="size-3.5 text-primary shrink-0" />
              <span className="text-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                {MOCK_BOOKMARKS.find((b) => b.id === action.bookmarkId)?.name}
              </span>
            </div>
          )}
        </div>
      );

    case 'open-link':
      return (
        <div className="flex flex-col gap-2">
          <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            URL
          </label>
          <input
            type="url"
            value={action.url ?? ''}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://example.com"
            className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
            style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
          />
          {action.url && !/^https?:\/\/.+/.test(action.url) && (
            <p className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
              Enter a valid URL starting with http:// or https://
            </p>
          )}
        </div>
      );

    case 'open-procedure':
      return (
        <div className="flex flex-col gap-2">
          <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            Procedure
          </label>
          <select
            value={action.procedureId ?? ''}
            onChange={(e) => onUpdate({ procedureId: e.target.value })}
            className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow"
            style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
          >
            <option value="">Select procedure...</option>
            {MOCK_PROCEDURES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.steps} steps)
              </option>
            ))}
          </select>
        </div>
      );

    case 'play-animation':
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
              Animation
            </label>
            <select
              value={action.animationId ?? ''}
              onChange={(e) => onUpdate({ animationId: e.target.value })}
              className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow"
              style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
            >
              <option value="">Select animation...</option>
              {MOCK_ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.duration})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
              Playback Mode
            </label>
            <div className="flex items-center gap-4">
              {(['PlayOnce', 'Loop', 'PingPong'] as AnimationMode[]).map((mode) => (
                <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`anim-mode-${action.id}`}
                    checked={action.animationMode === mode}
                    onChange={() => onUpdate({ animationMode: mode })}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                    {mode === 'PlayOnce' ? 'Play Once' : mode === 'PingPong' ? 'Ping Pong' : mode}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={action.animationReverse ?? false}
              onCheckedChange={(val) => onUpdate({ animationReverse: !!val })}
              id={`reverse-${action.id}`}
            />
            <label htmlFor={`reverse-${action.id}`} className="text-foreground cursor-pointer" style={{ fontSize: 'var(--text-sm)' }}>
              Reverse
            </label>
          </div>
        </div>
      );

    case 'unity-event':
      return (
        <div className="flex flex-col gap-2">
          <label className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
            Event Name
          </label>
          <input
            type="text"
            value={action.eventName ?? ''}
            onChange={(e) => onUpdate({ eventName: e.target.value })}
            placeholder="OnCustomEvent"
            className="w-full h-9 px-3 rounded-md border text-foreground bg-[var(--input-background)] outline-none transition-shadow focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 font-mono"
            style={{ borderColor: 'var(--input)', fontSize: 'var(--text-sm)' }}
          />
          <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            Sends a message to the Unity runtime
          </p>
        </div>
      );

    case 'action-group':
      return (
        <div className="flex flex-col gap-2">
          <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            Action groups execute all child actions together. Drag actions into this group to nest them.
          </p>
          <div className="p-2 rounded-md border border-dashed border-muted bg-secondary/30 text-center">
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              {action.children?.length ? `${action.children.length} sub-actions` : 'No sub-actions yet'}
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ── Action List Section (Activated / Deactivated) ──────────────────────

function ActionListSection({
  title,
  actions,
  onRemove,
  onUpdate,
  onAdd,
}: {
  title: string;
  actions: HotspotAction[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HotspotAction>) => void;
  onAdd: () => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const dragHandlers = {
    onDragStart: (_e: React.DragEvent, idx: number) => setDragIdx(idx),
    onDragOver: (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      setOverIdx(idx);
    },
    onDragEnd: () => {
      setDragIdx(null);
      setOverIdx(null);
    },
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
          style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>

      {actions.length === 0 ? (
        <div
          className="flex items-center justify-center py-6 rounded-lg border border-dashed border-[var(--input)] bg-background"
        >
          <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>No actions configured</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {actions.map((action, i) => (
            <div
              key={action.id}
              style={{
                opacity: dragIdx === i ? 0.4 : 1,
                borderTop: overIdx === i && dragIdx !== null && dragIdx !== i ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              <ActionItem
                action={action}
                index={i}
                onRemove={() => onRemove(action.id)}
                onUpdate={(updates) => onUpdate(action.id, updates)}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Action Picker ──────────────────────────────────────────────────

function AddActionPicker({
  onSelect,
  onClose,
}: {
  onSelect: (type: ActionType) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 bg-card rounded-xl border border-border overflow-hidden z-20"
      style={{ boxShadow: 'var(--elevation-lg)', top: '100%', marginTop: '4px' }}
    >
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
          Add Action
        </span>
        <button
          onClick={onClose}
          className="size-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <X className="size-3.5 text-muted" />
        </button>
      </div>
      <div className="p-1.5 max-h-[320px] overflow-y-auto">
        {ACTION_TYPES.map((at) => {
          const Icon = at.icon;
          return (
            <button
              key={at.type}
              onClick={() => onSelect(at.type)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-background)' }}
              >
                <Icon className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {at.label}
                </div>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                  {at.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────

export function HotspotActionsPanel() {
  const [activatedActions, setActivatedActions] = useState<HotspotAction[]>(INITIAL_ACTIVATED_ACTIONS);
  const [deactivatedActions, setDeactivatedActions] = useState<HotspotAction[]>(INITIAL_DEACTIVATED_ACTIONS);
  const [showPicker, setShowPicker] = useState<'activated' | 'deactivated' | null>(null);

  const addAction = useCallback(
    (type: ActionType, target: 'activated' | 'deactivated') => {
      const newAction: HotspotAction = {
        id: crypto.randomUUID(),
        type,
        label: getActionTypeLabel(type),
        animationMode: type === 'play-animation' ? 'PlayOnce' : undefined,
        children: type === 'action-group' ? [] : undefined,
      };
      if (target === 'activated') {
        setActivatedActions((prev) => [...prev, newAction]);
      } else {
        setDeactivatedActions((prev) => [...prev, newAction]);
      }
      setShowPicker(null);
    },
    [],
  );

  const removeActivated = useCallback((id: string) => {
    setActivatedActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const removeDeactivated = useCallback((id: string) => {
    setDeactivatedActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateActivated = useCallback((id: string, updates: Partial<HotspotAction>) => {
    setActivatedActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  const updateDeactivated = useCallback((id: string, updates: Partial<HotspotAction>) => {
    setDeactivatedActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-background)' }}
          >
            <Settings2 className="size-3.5 text-primary" />
          </div>
          <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
            Actions
          </span>
        </div>
        <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
          {activatedActions.length + deactivatedActions.length} total
        </span>
      </div>

      {/* On Activated */}
      <div className="relative">
        <ActionListSection
          title="On Activated"
          actions={activatedActions}
          onRemove={removeActivated}
          onUpdate={updateActivated}
          onAdd={() => setShowPicker(showPicker === 'activated' ? null : 'activated')}
        />
        {showPicker === 'activated' && (
          <AddActionPicker
            onSelect={(type) => addAction(type, 'activated')}
            onClose={() => setShowPicker(null)}
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* On Deactivated */}
      <div className="relative">
        <ActionListSection
          title="On Deactivated"
          actions={deactivatedActions}
          onRemove={removeDeactivated}
          onUpdate={updateDeactivated}
          onAdd={() => setShowPicker(showPicker === 'deactivated' ? null : 'deactivated')}
        />
        {showPicker === 'deactivated' && (
          <AddActionPicker
            onSelect={(type) => addAction(type, 'deactivated')}
            onClose={() => setShowPicker(null)}
          />
        )}
      </div>
    </div>
  );
}
