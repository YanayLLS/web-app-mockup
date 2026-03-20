import { useState, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  Plus,
  X,
  GripVertical,
  Pencil,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronRight,
  Film,
  Clock,
  Hand,
  ArrowRight,
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { BaseModal } from '../modals/BaseModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

// ── Types ──────────────────────────────────────────────────────────────

interface StepAnimation {
  id: string;
  name: string;
  duration: string;
  durationSeconds: number;
  thumbnailColor: string; // Placeholder for thumbnail
  reverse: boolean;
  requireInteraction: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────

const MOCK_AVAILABLE_ANIMATIONS = [
  { id: 'anim-1', name: 'Open Fuel Cap', duration: '2.4s', durationSeconds: 2.4, thumbnailColor: '#4A90D9' },
  { id: 'anim-2', name: 'Rotate Assembly 360', duration: '3.1s', durationSeconds: 3.1, thumbnailColor: '#50C878' },
  { id: 'anim-3', name: 'Slide Cover Off', duration: '1.8s', durationSeconds: 1.8, thumbnailColor: '#E67E22' },
  { id: 'anim-4', name: 'Hinge Panel Open', duration: '1.2s', durationSeconds: 1.2, thumbnailColor: '#9B59B6' },
  { id: 'anim-5', name: 'Extend Piston Arm', duration: '4.0s', durationSeconds: 4.0, thumbnailColor: '#E74C3C' },
  { id: 'anim-6', name: 'Valve Turn Sequence', duration: '2.7s', durationSeconds: 2.7, thumbnailColor: '#1ABC9C' },
];

const INITIAL_STEP_ANIMATIONS: StepAnimation[] = [
  {
    id: 'anim-1',
    name: 'Open Fuel Cap',
    duration: '2.4s',
    durationSeconds: 2.4,
    thumbnailColor: '#4A90D9',
    reverse: false,
    requireInteraction: false,
  },
  {
    id: 'anim-3',
    name: 'Slide Cover Off',
    duration: '1.8s',
    durationSeconds: 1.8,
    thumbnailColor: '#E67E22',
    reverse: false,
    requireInteraction: true,
  },
  {
    id: 'anim-4',
    name: 'Hinge Panel Open',
    duration: '1.2s',
    durationSeconds: 1.2,
    thumbnailColor: '#9B59B6',
    reverse: true,
    requireInteraction: false,
  },
];

// ── Animation Thumbnail ────────────────────────────────────────────────

function AnimationThumbnail({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `${color}20`, border: `1px solid ${color}40` }}
    >
      <Film className="text-foreground/60" style={{ width: size * 0.4, height: size * 0.4 }} />
    </div>
  );
}

// ── Animation Item ─────────────────────────────────────────────────────

function AnimationItem({
  anim,
  index,
  onRemove,
  onUpdate,
  onEdit,
  dragHandlers,
}: {
  anim: StepAnimation;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<StepAnimation>) => void;
  onEdit: () => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, idx: number) => void;
    onDragOver: (e: React.DragEvent, idx: number) => void;
    onDragEnd: () => void;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group"
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, index)}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDragEnd={dragHandlers.onDragEnd}
    >
      {/* Main row */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-transparent hover:border-[var(--input)] bg-card transition-all">
        <GripVertical className="size-3.5 text-muted shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimationThumbnail color={anim.thumbnailColor} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
              {anim.name}
            </span>
            {anim.reverse && (
              <span
                className="px-1.5 py-0.5 rounded text-white shrink-0"
                style={{ fontSize: '9px', fontWeight: 'var(--font-weight-bold)', background: 'var(--primary)' }}
              >
                REV
              </span>
            )}
            {anim.requireInteraction && (
              <Hand className="size-3 text-warning shrink-0" title="Requires interaction" />
            )}
          </div>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            <Clock className="size-3" />
            <span>{anim.duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="size-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
            title="Settings"
          >
            {expanded ? <ChevronDown className="size-3.5 text-muted" /> : <ChevronRight className="size-3.5 text-muted" />}
          </button>
          <button
            onClick={onEdit}
            className="size-7 rounded-md flex items-center justify-center hover:bg-primary/10 transition-colors"
            title="Edit animation"
          >
            <Pencil className="size-3.5 text-primary" />
          </button>
          <button
            onClick={onRemove}
            className="size-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
            title="Remove animation"
          >
            <X className="size-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Expanded settings */}
      {expanded && (
        <div className="ml-[52px] mt-1 mb-2 p-3 rounded-lg border border-border bg-background flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={anim.reverse}
              onCheckedChange={(val) => onUpdate({ reverse: !!val })}
              id={`reverse-${anim.id}`}
            />
            <label htmlFor={`reverse-${anim.id}`} className="text-foreground cursor-pointer" style={{ fontSize: 'var(--text-sm)' }}>
              Reverse playback
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={anim.requireInteraction}
              onCheckedChange={(val) => onUpdate({ requireInteraction: !!val })}
              id={`interaction-${anim.id}`}
            />
            <label htmlFor={`interaction-${anim.id}`} className="text-foreground cursor-pointer" style={{ fontSize: 'var(--text-sm)' }}>
              Require interaction to continue
            </label>
          </div>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            <Clock className="size-3" />
            Duration: {anim.duration}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Animation Picker Modal ─────────────────────────────────────────

function AddAnimationPicker({
  isOpen,
  onClose,
  onAdd,
  existingIds,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (anim: typeof MOCK_AVAILABLE_ANIMATIONS[number]) => void;
  existingIds: string[];
}) {
  const available = MOCK_AVAILABLE_ANIMATIONS.filter((a) => !existingIds.includes(a.id));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} blur>
      <div
        className="bg-card rounded-xl w-full max-w-md mx-4 border border-border overflow-hidden"
        style={{ boxShadow: 'var(--elevation-xl)' }}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="size-4 text-primary" />
            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
              Add Animation
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="size-4 text-muted" />
          </button>
        </div>
        <div className="p-2 max-h-[360px] overflow-y-auto">
          {available.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>All animations are already added</span>
            </div>
          ) : (
            available.map((anim) => (
              <button
                key={anim.id}
                onClick={() => onAdd(anim)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <AnimationThumbnail color={anim.thumbnailColor} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {anim.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    <Clock className="size-3" />
                    {anim.duration}
                  </div>
                </div>
                <Plus className="size-4 text-primary shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ── Multiple Animations Selection Popup ────────────────────────────────

function MultipleAnimationsPopup({
  isOpen,
  onClose,
  animations,
  onSelectEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  animations: StepAnimation[];
  onSelectEdit: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} blur>
      <div
        className="bg-card rounded-xl w-full max-w-md mx-4 border border-border overflow-hidden"
        style={{ boxShadow: 'var(--elevation-xl)' }}
      >
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Film className="size-4 text-primary" />
            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
              Select Animation to Edit
            </span>
          </div>
          <p className="text-muted mt-1" style={{ fontSize: 'var(--text-xs)' }}>
            This step has multiple animations. Choose which one to edit.
          </p>
        </div>
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {animations.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setSelectedId(anim.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${
                selectedId === anim.id ? 'bg-[var(--primary-background)] border border-primary/30' : 'hover:bg-secondary border border-transparent'
              }`}
            >
              <AnimationThumbnail color={anim.thumbnailColor} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {anim.name}
                </div>
                <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                  <Clock className="size-3" />
                  {anim.duration}
                  {anim.reverse && <span className="text-primary ml-1">(Reversed)</span>}
                </div>
              </div>
              {selectedId === anim.id && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-all"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedId) onSelectEdit(selectedId);
            }}
            disabled={!selectedId}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}
          >
            Edit Selected
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ── Playback Bar ───────────────────────────────────────────────────────

function PlaybackBar({
  animations,
  currentIndex,
  totalSteps,
  currentStepIndex,
}: {
  animations: StepAnimation[];
  currentIndex: number;
  totalSteps: number;
  currentStepIndex: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // Mock progress percentage

  const currentAnim = animations[currentIndex];
  if (!currentAnim) return null;

  const totalDuration = animations.reduce((sum, a) => sum + a.durationSeconds, 0);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--elevation-sm)' }}>
      {/* Animation info bar */}
      <div className="px-4 py-2.5 flex items-center gap-3 border-b border-border">
        <AnimationThumbnail color={currentAnim.thumbnailColor} size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            {currentAnim.name}
          </div>
          <div className="flex items-center gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            <span>Animation {currentIndex + 1} of {animations.length}</span>
            {currentAnim.requireInteraction && (
              <>
                <span className="text-muted">|</span>
                <span className="flex items-center gap-1 text-warning">
                  <Hand className="size-3" />
                  Tap to continue
                </span>
              </>
            )}
            {!currentAnim.requireInteraction && (
              <>
                <span className="text-muted">|</span>
                <span className="flex items-center gap-1 text-primary">
                  <ArrowRight className="size-3" />
                  Auto-advance
                </span>
              </>
            )}
          </div>
        </div>
        <span
          className="text-muted shrink-0 px-2 py-1 rounded-md bg-secondary"
          style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress timeline */}
      <div className="px-4 py-3">
        {/* Segment indicators for multiple animations */}
        {animations.length > 1 && (
          <div className="flex gap-1 mb-2">
            {animations.map((anim, i) => {
              const widthPct = (anim.durationSeconds / totalDuration) * 100;
              return (
                <div
                  key={anim.id}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: `${widthPct}%`,
                    background: i === currentIndex ? 'var(--primary)' : i < currentIndex ? 'var(--accent)' : 'var(--secondary)',
                  }}
                  title={`${anim.name} (${anim.duration})`}
                />
              );
            })}
          </div>
        )}

        {/* Main timeline slider */}
        <div className="flex items-center gap-3">
          <span className="text-muted w-8 text-right shrink-0" style={{ fontSize: 'var(--text-xs)' }}>
            {((progress / 100) * currentAnim.durationSeconds).toFixed(1)}s
          </span>

          <div className="flex-1 relative h-6 flex items-center">
            <div className="w-full h-1.5 rounded-full bg-secondary relative">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white cursor-pointer"
                style={{ left: `${progress}%`, transform: `translate(-50%, -50%)`, boxShadow: 'var(--elevation-sm)' }}
              />
            </div>
          </div>

          <span className="text-muted w-8 shrink-0" style={{ fontSize: 'var(--text-xs)' }}>
            {currentAnim.duration}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            className="size-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            title="Previous animation"
            disabled={currentIndex === 0}
          >
            <SkipBack className="size-4 text-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="size-10 rounded-full flex items-center justify-center bg-primary text-white hover:brightness-110 transition-all"
            style={{ boxShadow: '0 2px 8px var(--primary)40' }}
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </button>
          <button
            className="size-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            title="Next animation"
            disabled={currentIndex === animations.length - 1}
          >
            <SkipForward className="size-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function ProcedureAnimationIntegration() {
  const [animations, setAnimations] = useState<StepAnimation[]>(INITIAL_STEP_ANIMATIONS);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const dragHandlers = {
    onDragStart: (_e: React.DragEvent, idx: number) => setDragIdx(idx),
    onDragOver: (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      setOverIdx(idx);
    },
    onDragEnd: () => {
      if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
        setAnimations((prev) => {
          const next = [...prev];
          const [moved] = next.splice(dragIdx, 1);
          next.splice(overIdx, 0, moved);
          return next;
        });
      }
      setDragIdx(null);
      setOverIdx(null);
    },
  };

  const handleAdd = useCallback((anim: typeof MOCK_AVAILABLE_ANIMATIONS[number]) => {
    setAnimations((prev) => [
      ...prev,
      {
        ...anim,
        reverse: false,
        requireInteraction: false,
      },
    ]);
    setShowAddPicker(false);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    if (confirmRemoveId) {
      setAnimations((prev) => prev.filter((a) => a.id !== confirmRemoveId));
      setConfirmRemoveId(null);
    }
  }, [confirmRemoveId]);

  const handleUpdate = useCallback((id: string, updates: Partial<StepAnimation>) => {
    setAnimations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  const handleEditClick = useCallback(() => {
    if (animations.length > 1) {
      setShowMultiSelect(true);
    }
    // In single animation mode, would directly open the animation builder
  }, [animations.length]);

  const totalDuration = animations.reduce((sum, a) => sum + a.durationSeconds, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Animations Section ────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--elevation-sm)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary-background)' }}
            >
              <Film className="size-3.5 text-primary" />
            </div>
            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
              Animations
            </span>
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              {animations.length} animation{animations.length !== 1 ? 's' : ''}
              {animations.length > 0 && ` \u00b7 ${totalDuration.toFixed(1)}s total`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {animations.length > 1 && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )}
            <button
              onClick={() => setShowAddPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white hover:brightness-110 transition-all"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)' }}
            >
              <Plus className="size-3" />
              Add Animation
            </button>
          </div>
        </div>

        {/* Animation list */}
        {animations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-[var(--input)] bg-background">
            <Film className="size-8 text-muted mb-2" />
            <span className="text-muted" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
              No animations linked
            </span>
            <span className="text-muted mt-1" style={{ fontSize: 'var(--text-xs)' }}>
              Add an animation to bring this step to life
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {animations.map((anim, i) => (
              <div
                key={anim.id}
                style={{
                  opacity: dragIdx === i ? 0.4 : 1,
                  borderTop: overIdx === i && dragIdx !== null && dragIdx !== i ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                <AnimationItem
                  anim={anim}
                  index={i}
                  onRemove={() => setConfirmRemoveId(anim.id)}
                  onUpdate={(updates) => handleUpdate(anim.id, updates)}
                  onEdit={handleEditClick}
                  dragHandlers={dragHandlers}
                />
              </div>
            ))}
          </div>
        )}

        {/* Playback sequence indicator */}
        {animations.length > 1 && (
          <div className="mt-3 px-2 py-2 rounded-lg bg-background flex items-center gap-2 overflow-x-auto">
            <span className="text-muted shrink-0" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}>
              Sequence:
            </span>
            {animations.map((anim, i) => (
              <div key={anim.id} className="flex items-center gap-1.5 shrink-0">
                <div
                  className="px-2 py-0.5 rounded-md border"
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderColor: anim.thumbnailColor + '60',
                    background: anim.thumbnailColor + '15',
                    color: 'var(--foreground)',
                  }}
                >
                  {anim.name}
                </div>
                {i < animations.length - 1 && <ArrowRight className="size-3 text-muted" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Playback Bar (Viewer Mode Concept) ───────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Play className="size-3.5 text-primary" />
          <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)' }}>
            Playback Bar Preview (Viewer Mode)
          </span>
        </div>
        <PlaybackBar
          animations={animations}
          currentIndex={0}
          totalSteps={8}
          currentStepIndex={2}
        />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <AddAnimationPicker
        isOpen={showAddPicker}
        onClose={() => setShowAddPicker(false)}
        onAdd={handleAdd}
        existingIds={animations.map((a) => a.id)}
      />

      <MultipleAnimationsPopup
        isOpen={showMultiSelect}
        onClose={() => setShowMultiSelect(false)}
        animations={animations}
        onSelectEdit={(id) => {
          setShowMultiSelect(false);
          // Would open animation builder for the selected animation
        }}
      />

      <ConfirmDialog
        isOpen={!!confirmRemoveId}
        title="Remove Animation"
        message={`Are you sure you want to remove "${animations.find((a) => a.id === confirmRemoveId)?.name}" from this step? The animation will still exist in the project.`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setConfirmRemoveId(null)}
        variant="danger"
      />
    </div>
  );
}
