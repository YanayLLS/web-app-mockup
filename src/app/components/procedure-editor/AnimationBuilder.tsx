import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X, Save, Play, Pause, Square, ChevronDown, ChevronRight, Plus, Trash2,
  Copy, GripVertical, Camera, Move, Sparkles, Wrench, Eye, EyeOff,
  RotateCcw, Search, ChevronUp, Pencil, AlertCircle, Check, Film,
  Maximize2, Minimize2, Clock, Layers, Settings2, MoreVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../ui/select';

// ── Types ──────────────────────────────────────────────────────────────────

interface CameraWaypoint {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

interface MovementWaypoint {
  id: string;
  name: string;
  duration: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

interface PartGroup {
  id: string;
  name: string;
  parts: PartItem[];
  expanded: boolean;
}

interface PartItem {
  id: string;
  name: string;
  selected: boolean;
}

interface HighlightConfig {
  type: 'none' | 'constant' | 'flashing';
  startPercent: number;
  endPercent: number;
  color: string;
}

interface ToolConfig {
  toolId: string;
  animationId: string;
  mode: 'PlayOnce' | 'Loop' | 'PingPong';
  reverse: boolean;
  segmentDuration: number;
}

interface AnimationData {
  id: string;
  name: string;
  cameraWaypoints: CameraWaypoint[];
  movementWaypoints: MovementWaypoint[];
  highlight: HighlightConfig;
  tool: ToolConfig;
  modelRelative: boolean;
  hideAtEnd: boolean;
  selectedParts: string[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PART_GROUPS: PartGroup[] = [
  {
    id: 'g1', name: 'Engine Assembly', expanded: true,
    parts: [
      { id: 'p1', name: 'Cylinder Head', selected: true },
      { id: 'p2', name: 'Piston Assembly', selected: false },
      { id: 'p3', name: 'Crankshaft', selected: true },
      { id: 'p4', name: 'Oil Pan', selected: false },
    ]
  },
  {
    id: 'g2', name: 'Exhaust System', expanded: false,
    parts: [
      { id: 'p5', name: 'Exhaust Manifold', selected: false },
      { id: 'p6', name: 'Catalytic Converter', selected: false },
      { id: 'p7', name: 'Muffler', selected: false },
    ]
  },
  {
    id: 'g3', name: 'Electrical', expanded: false,
    parts: [
      { id: 'p8', name: 'Starter Motor', selected: false },
      { id: 'p9', name: 'Alternator', selected: false },
      { id: 'p10', name: 'Battery', selected: false },
      { id: 'p11', name: 'Wiring Harness', selected: false },
    ]
  },
  {
    id: 'g4', name: 'Cooling System', expanded: false,
    parts: [
      { id: 'p12', name: 'Radiator', selected: false },
      { id: 'p13', name: 'Water Pump', selected: false },
      { id: 'p14', name: 'Thermostat', selected: false },
    ]
  },
];

const MOCK_CAMERA_WAYPOINTS: CameraWaypoint[] = [
  { id: 'cw1', name: 'Start Position', position: { x: 5, y: 3, z: 8 }, target: { x: 0, y: 0, z: 0 } },
  { id: 'cw2', name: 'Engine Close-up', position: { x: 2, y: 1, z: 3 }, target: { x: 0, y: 0.5, z: 0 } },
  { id: 'cw3', name: 'Top View', position: { x: 0, y: 6, z: 0 }, target: { x: 0, y: 0, z: 0 } },
];

const MOCK_MOVEMENT_WAYPOINTS: MovementWaypoint[] = [
  { id: 'mw1', name: 'Initial Position', duration: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  { id: 'mw2', name: 'Lift Cylinder Head', duration: 1.5, position: { x: 0, y: 2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
  { id: 'mw3', name: 'Move to Workbench', duration: 2.0, position: { x: 3, y: 1, z: -1 }, rotation: { x: 0, y: 45, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
];

const MOCK_TOOLS = [
  { id: 't1', name: 'Torque Wrench' },
  { id: 't2', name: 'Socket Set 10mm' },
  { id: 't3', name: 'Pry Bar' },
  { id: 't4', name: 'Screwdriver - Phillips' },
  { id: 't5', name: 'Oil Filter Wrench' },
  { id: 't6', name: 'Multimeter' },
  { id: 't7', name: 'Pneumatic Impact' },
];

const MOCK_TOOL_ANIMATIONS = [
  { id: 'ta1', name: 'Tighten' },
  { id: 'ta2', name: 'Loosen' },
  { id: 'ta3', name: 'Insert' },
  { id: 'ta4', name: 'Remove' },
  { id: 'ta5', name: 'Rotate CW' },
  { id: 'ta6', name: 'Rotate CCW' },
];

// ── Sub-Components ─────────────────────────────────────────────────────────

// Unsaved Changes Modal
function UnsavedChangesModal({ onSave, onDiscard, onCancel }: {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-elevation-lg p-6 w-[400px] max-w-[90vw]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,193,7,0.15)] flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Unsaved Changes
            </h3>
            <p className="text-sm text-muted">Your changes will be lost if you don't save.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onCancel} className="text-foreground">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            Discard
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// Post-Save Dialog
function PostSaveDialog({ onCreateNew, onSameSetup, onContinue, onClose }: {
  onCreateNew: () => void;
  onSameSetup: () => void;
  onContinue: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-elevation-lg p-6 w-[440px] max-w-[90vw]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[rgba(17,232,116,0.15)] flex items-center justify-center">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-base text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Animation Saved
            </h3>
            <p className="text-sm text-muted">Your animation has been saved successfully.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCreateNew}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-background transition-colors group"
          >
            <Plus className="w-5 h-5 text-muted group-hover:text-primary" />
            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Create New</span>
            <span className="text-xs text-muted">Start fresh animation</span>
          </button>
          <button
            onClick={onSameSetup}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-background transition-colors group"
          >
            <Copy className="w-5 h-5 text-muted group-hover:text-primary" />
            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Same Setup</span>
            <span className="text-xs text-muted">Keep parts & settings</span>
          </button>
          <button
            onClick={onContinue}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-background transition-colors group"
          >
            <Pencil className="w-5 h-5 text-muted group-hover:text-primary" />
            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Continue Editing</span>
            <span className="text-xs text-muted">Return to editor</span>
          </button>
          <button
            onClick={onClose}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-background transition-colors group"
          >
            <X className="w-5 h-5 text-muted group-hover:text-primary" />
            <span className="text-sm text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>Close</span>
            <span className="text-xs text-muted">Exit animation builder</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Waypoint context menu
function WaypointContextMenu({ x, y, onDuplicate, onRename, onDelete, onClose }: {
  x: number; y: number;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[70] bg-card rounded-lg shadow-elevation-md border border-border py-1 w-[160px]"
      style={{ left: x, top: y }}
    >
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors" onClick={onDuplicate}>
        <Copy className="w-3.5 h-3.5" /> Duplicate
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors" onClick={onRename}>
        <Pencil className="w-3.5 h-3.5" /> Rename
      </button>
      <div className="my-1 h-px bg-border" />
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive-background transition-colors" onClick={onDelete}>
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

// ── Camera Channel ─────────────────────────────────────────────────────────

function CameraChannel({ waypoints, setWaypoints, modelRelative, setModelRelative }: {
  waypoints: CameraWaypoint[];
  setWaypoints: (w: CameraWaypoint[]) => void;
  modelRelative: boolean;
  setModelRelative: (v: boolean) => void;
}) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const handleCapturePOV = () => {
    const newWp: CameraWaypoint = {
      id: `cw-${Date.now()}`,
      name: `Waypoint ${waypoints.length + 1}`,
      position: { x: Math.random() * 10, y: Math.random() * 5, z: Math.random() * 10 },
      target: { x: 0, y: 0, z: 0 },
    };
    setWaypoints([...waypoints, newWp]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button size="sm" onClick={handleCapturePOV} className="gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          Capture POV
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={modelRelative}
            onCheckedChange={(checked) => setModelRelative(checked === true)}
            id="model-relative"
          />
          <label htmlFor="model-relative" className="text-xs text-foreground cursor-pointer">
            Model Relative
          </label>
        </div>
      </div>

      {waypoints.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted">
          <Camera className="w-8 h-8 mb-2 opacity-40" />
          <span className="text-sm">No camera waypoints</span>
          <span className="text-xs">Click "Capture POV" to add one</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {waypoints.map((wp, i) => (
          <div
            key={wp.id}
            className="flex items-center gap-2 px-2.5 py-2 bg-background rounded-md border border-border hover:border-primary/40 transition-colors group"
            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, id: wp.id }); }}
          >
            <GripVertical className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 cursor-grab" />
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {i + 1}
            </div>
            <span className="flex-1 text-sm text-foreground truncate">{wp.name}</span>
            <span className="text-xs text-muted font-mono">
              ({wp.position.x.toFixed(1)}, {wp.position.y.toFixed(1)}, {wp.position.z.toFixed(1)})
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary transition-all"
              onClick={(e) => setContextMenu({ x: e.clientX, y: e.clientY, id: wp.id })}
            >
              <MoreVertical className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        ))}
      </div>

      {contextMenu && (
        <WaypointContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={() => {
            const wp = waypoints.find(w => w.id === contextMenu.id);
            if (wp) setWaypoints([...waypoints, { ...wp, id: `cw-${Date.now()}`, name: `${wp.name} (copy)` }]);
            setContextMenu(null);
          }}
          onRename={() => setContextMenu(null)}
          onDelete={() => {
            setWaypoints(waypoints.filter(w => w.id !== contextMenu.id));
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// ── Movement Channel ───────────────────────────────────────────────────────

function MovementChannel({ waypoints, setWaypoints, hideAtEnd, setHideAtEnd, selectedParts }: {
  waypoints: MovementWaypoint[];
  setWaypoints: (w: MovementWaypoint[]) => void;
  hideAtEnd: boolean;
  setHideAtEnd: (v: boolean) => void;
  selectedParts: string[];
}) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [expandedWp, setExpandedWp] = useState<string | null>(null);

  const addWaypoint = () => {
    const newWp: MovementWaypoint = {
      id: `mw-${Date.now()}`,
      name: `Waypoint ${waypoints.length + 1}`,
      duration: 1.0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };
    setWaypoints([...waypoints, newWp]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected parts summary */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-primary-background rounded-md">
        <Layers className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {selectedParts.length} part{selectedParts.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Button size="sm" onClick={addWaypoint} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Waypoint
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={hideAtEnd}
            onCheckedChange={(checked) => setHideAtEnd(checked === true)}
            id="hide-at-end"
          />
          <label htmlFor="hide-at-end" className="text-xs text-foreground cursor-pointer">
            Hide at End
          </label>
        </div>
      </div>

      {waypoints.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted">
          <Move className="w-8 h-8 mb-2 opacity-40" />
          <span className="text-sm">No movement waypoints</span>
          <span className="text-xs">Click "Add Waypoint" to begin</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {waypoints.map((wp, i) => (
          <div key={wp.id} className="flex flex-col rounded-md border border-border hover:border-primary/40 transition-colors bg-background overflow-hidden">
            <div
              className="flex items-center gap-2 px-2.5 py-2 cursor-pointer group"
              onClick={() => setExpandedWp(expandedWp === wp.id ? null : wp.id)}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, id: wp.id }); }}
            >
              <GripVertical className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 cursor-grab" />
              <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                {i + 1}
              </div>
              <span className="flex-1 text-sm text-foreground truncate">{wp.name}</span>
              <span className="text-xs text-muted">{wp.duration}s</span>
              {expandedWp === wp.id ? <ChevronUp className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
            </div>

            {expandedWp === wp.id && (
              <div className="px-3 pb-3 border-t border-border pt-2 flex flex-col gap-3">
                {/* Duration */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted">Duration (seconds)</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[wp.duration]}
                      min={0}
                      max={10}
                      step={0.1}
                      className="flex-1"
                      onValueChange={([v]) => {
                        setWaypoints(waypoints.map(w => w.id === wp.id ? { ...w, duration: v } : w));
                      }}
                    />
                    <span className="text-xs text-foreground font-mono w-8 text-right">{wp.duration.toFixed(1)}</span>
                  </div>
                </div>
                {/* Position */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted">Position (X, Y, Z)</label>
                  <div className="flex gap-1.5">
                    {(['x', 'y', 'z'] as const).map(axis => (
                      <div key={axis} className="flex-1 flex items-center gap-1">
                        <span className="text-xs text-muted uppercase w-3">{axis}</span>
                        <input
                          type="number"
                          value={wp.position[axis]}
                          onChange={(e) => {
                            setWaypoints(waypoints.map(w => w.id === wp.id ? { ...w, position: { ...w.position, [axis]: parseFloat(e.target.value) || 0 } } : w));
                          }}
                          className="w-full px-1.5 py-1 text-xs rounded border border-input bg-input-background text-foreground focus:border-ring focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rotation */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted">Rotation (X, Y, Z)</label>
                  <div className="flex gap-1.5">
                    {(['x', 'y', 'z'] as const).map(axis => (
                      <div key={axis} className="flex-1 flex items-center gap-1">
                        <span className="text-xs text-muted uppercase w-3">{axis}</span>
                        <input
                          type="number"
                          value={wp.rotation[axis]}
                          onChange={(e) => {
                            setWaypoints(waypoints.map(w => w.id === wp.id ? { ...w, rotation: { ...w.rotation, [axis]: parseFloat(e.target.value) || 0 } } : w));
                          }}
                          className="w-full px-1.5 py-1 text-xs rounded border border-input bg-input-background text-foreground focus:border-ring focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <WaypointContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={() => {
            const wp = waypoints.find(w => w.id === contextMenu.id);
            if (wp) setWaypoints([...waypoints, { ...wp, id: `mw-${Date.now()}`, name: `${wp.name} (copy)` }]);
            setContextMenu(null);
          }}
          onRename={() => setContextMenu(null)}
          onDelete={() => {
            setWaypoints(waypoints.filter(w => w.id !== contextMenu.id));
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// ── Highlight Channel ──────────────────────────────────────────────────────

function HighlightChannel({ config, setConfig }: {
  config: HighlightConfig;
  setConfig: (c: HighlightConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Highlight Type</label>
        <Select value={config.type} onValueChange={(v) => setConfig({ ...config, type: v as HighlightConfig['type'] })}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="constant">Constant</SelectItem>
            <SelectItem value="flashing">Flashing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.type !== 'none' && (
        <>
          {/* Time Range */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Time Range</label>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted">Start</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[config.startPercent]}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={([v]) => setConfig({ ...config, startPercent: v })}
                  />
                  <span className="text-xs text-foreground font-mono w-8 text-right">{config.startPercent}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-muted">End</span>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[config.endPercent]}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={([v]) => setConfig({ ...config, endPercent: v })}
                  />
                  <span className="text-xs text-foreground font-mono w-8 text-right">{config.endPercent}%</span>
                </div>
              </div>
            </div>
            {/* Range bar visual */}
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden mt-1">
              <div
                className="absolute h-full rounded-full transition-all"
                style={{
                  left: `${config.startPercent}%`,
                  width: `${Math.max(0, config.endPercent - config.startPercent)}%`,
                  backgroundColor: config.color,
                  opacity: config.type === 'flashing' ? 0.7 : 1,
                }}
              />
              {config.type === 'flashing' && (
                <>
                  {/* Flashing indicator stripes */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-full w-[2px] bg-card/60"
                      style={{
                        left: `${config.startPercent + ((config.endPercent - config.startPercent) / 6) * (i + 1)}%`,
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Color</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  className="w-8 h-8 rounded border border-input cursor-pointer"
                  style={{ padding: 0 }}
                />
              </div>
              <input
                type="text"
                value={config.color}
                onChange={(e) => setConfig({ ...config, color: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs rounded border border-input bg-input-background text-foreground focus:border-ring focus:outline-none font-mono"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tool Channel ───────────────────────────────────────────────────────────

function ToolChannel({ config, setConfig }: {
  config: ToolConfig;
  setConfig: (c: ToolConfig) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tool Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Tool</label>
        <Select value={config.toolId} onValueChange={(v) => setConfig({ ...config, toolId: v })}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select tool..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_TOOLS.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animation Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Animation</label>
        <Select value={config.animationId} onValueChange={(v) => setConfig({ ...config, animationId: v })}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select animation..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_TOOL_ANIMATIONS.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Playback Mode</label>
        <RadioGroup
          value={config.mode}
          onValueChange={(v) => setConfig({ ...config, mode: v as ToolConfig['mode'] })}
          className="flex flex-col gap-2"
        >
          {(['PlayOnce', 'Loop', 'PingPong'] as const).map(mode => (
            <div key={mode} className="flex items-center gap-2">
              <RadioGroupItem value={mode} id={`tool-mode-${mode}`} />
              <label htmlFor={`tool-mode-${mode}`} className="text-sm text-foreground cursor-pointer">
                {mode === 'PingPong' ? 'Ping Pong' : mode === 'PlayOnce' ? 'Play Once' : mode}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Reverse */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={config.reverse}
          onCheckedChange={(checked) => setConfig({ ...config, reverse: checked === true })}
          id="tool-reverse"
        />
        <label htmlFor="tool-reverse" className="text-sm text-foreground cursor-pointer">Reverse</label>
      </div>

      {/* Segment Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>Segment Duration (seconds)</label>
        <div className="flex items-center gap-2">
          <Slider
            value={[config.segmentDuration]}
            min={0.1}
            max={30}
            step={0.1}
            className="flex-1"
            onValueChange={([v]) => setConfig({ ...config, segmentDuration: v })}
          />
          <span className="text-xs text-foreground font-mono w-10 text-right">{config.segmentDuration.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────

function Timeline({ isPlaying, setIsPlaying, progress, setProgress, speed, setSpeed }: {
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Animate progress when playing
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const animate = (now: number) => {
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        setProgress((prev: number) => {
          const next = prev + (dt * speed * 10); // 10 = full cycle ~10s at 1x
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Format mm:ss from progress
  const totalSec = (progress / 100) * 10; // assume 10s total
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-2 px-4 py-3 bg-card border-t border-border">
      {/* Scrubber track */}
      <div
        ref={trackRef}
        className="relative h-6 bg-secondary rounded-full cursor-pointer group"
        onClick={handleTrackClick}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-primary/20 rounded-full transition-[width]"
          style={{ width: `${progress}%`, transition: isPlaying ? 'none' : 'width 0.1s' }}
        />
        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm border-2 border-card transition-[left] cursor-grab"
          style={{ left: `calc(${progress}% - 6px)`, transition: isPlaying ? 'none' : 'left 0.1s' }}
        />
        {/* Channel lane markers */}
        <div className="absolute top-0 left-0 right-0 h-full flex items-center px-1">
          <div className="flex-1 h-1 rounded bg-primary/30 mx-0.5" />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={handleStop}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            onClick={() => { setProgress(0); }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Time display */}
          <span className="text-xs text-muted font-mono">{timeStr}</span>

          {/* Progress % */}
          <span className="text-xs text-foreground font-mono" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {progress.toFixed(1)}%
          </span>

          {/* Speed control */}
          <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                className={`px-2 py-1 text-xs transition-colors ${speed === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AnimationBuilder Component ────────────────────────────────────────

export function AnimationBuilder({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Core state
  const [animName, setAnimName] = useState('Cylinder Head Removal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showPostSave, setShowPostSave] = useState(false);

  // Parts
  const [partGroups, setPartGroups] = useState<PartGroup[]>(MOCK_PART_GROUPS);
  const [partsSearch, setPartsSearch] = useState('');

  // Channels
  const [activeChannel, setActiveChannel] = useState('camera');
  const [cameraWaypoints, setCameraWaypoints] = useState<CameraWaypoint[]>(MOCK_CAMERA_WAYPOINTS);
  const [movementWaypoints, setMovementWaypoints] = useState<MovementWaypoint[]>(MOCK_MOVEMENT_WAYPOINTS);
  const [modelRelative, setModelRelative] = useState(true);
  const [hideAtEnd, setHideAtEnd] = useState(false);
  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>({
    type: 'constant',
    startPercent: 10,
    endPercent: 80,
    color: '#2F80ED',
  });
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    toolId: 't1',
    animationId: 'ta1',
    mode: 'PlayOnce',
    reverse: false,
    segmentDuration: 3.0,
  });

  // Timeline
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Track changes
  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);

  // Wrap setters to track dirty state
  const updateCameraWaypoints = (w: CameraWaypoint[]) => { setCameraWaypoints(w); markDirty(); };
  const updateMovementWaypoints = (w: MovementWaypoint[]) => { setMovementWaypoints(w); markDirty(); };
  const updateHighlightConfig = (c: HighlightConfig) => { setHighlightConfig(c); markDirty(); };
  const updateToolConfig = (c: ToolConfig) => { setToolConfig(c); markDirty(); };
  const updateModelRelative = (v: boolean) => { setModelRelative(v); markDirty(); };
  const updateHideAtEnd = (v: boolean) => { setHideAtEnd(v); markDirty(); };

  // Parts selection helpers
  const selectedParts = partGroups.flatMap(g => g.parts.filter(p => p.selected).map(p => p.name));

  const togglePart = (groupId: string, partId: string) => {
    setPartGroups(groups => groups.map(g =>
      g.id === groupId
        ? { ...g, parts: g.parts.map(p => p.id === partId ? { ...p, selected: !p.selected } : p) }
        : g
    ));
    markDirty();
  };

  const toggleGroupExpanded = (groupId: string) => {
    setPartGroups(groups => groups.map(g =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    ));
  };

  const selectAllInGroup = (groupId: string, selected: boolean) => {
    setPartGroups(groups => groups.map(g =>
      g.id === groupId ? { ...g, parts: g.parts.map(p => ({ ...p, selected })) } : g
    ));
    markDirty();
  };

  // Filter parts
  const filteredGroups = partGroups.map(g => ({
    ...g,
    parts: g.parts.filter(p => p.name.toLowerCase().includes(partsSearch.toLowerCase())),
  })).filter(g => g.parts.length > 0);

  // Exit handler
  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  // Save handler
  const handleSave = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    setShowPostSave(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-card border-b border-border shrink-0">
        <Film className="w-5 h-5 text-primary" />
        <input
          type="text"
          value={animName}
          onChange={(e) => { setAnimName(e.target.value); markDirty(); }}
          className="flex-1 max-w-[320px] px-3 py-1.5 text-sm rounded-md border border-input bg-input-background text-foreground focus:border-ring focus:outline-none"
          style={{ fontWeight: 'var(--font-weight-medium)' }}
          placeholder="Animation name..."
        />
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 text-warning">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs">Unsaved</span>
          </div>
        )}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleExit} className="text-foreground">
          <X className="w-4 h-4" />
          Exit
        </Button>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar — Parts Selection */}
        <div className="w-[260px] shrink-0 flex flex-col border-r border-border bg-card">
          <div className="px-3 py-2.5 border-b border-border">
            <h3 className="text-sm text-foreground mb-2" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Parts
            </h3>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search parts..."
                value={partsSearch}
                onChange={(e) => setPartsSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-input bg-input-background text-foreground focus:border-ring focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
            {filteredGroups.map(group => (
              <div key={group.id} className="mb-1">
                <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded hover:bg-secondary/50 cursor-pointer">
                  <button onClick={() => toggleGroupExpanded(group.id)} className="p-0.5">
                    {group.expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-muted" />}
                  </button>
                  <Checkbox
                    checked={group.parts.every(p => p.selected)}
                    onCheckedChange={(checked) => selectAllInGroup(group.id, checked === true)}
                    className="mr-1"
                  />
                  <span className="text-sm text-foreground flex-1 truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {group.name}
                  </span>
                  <span className="text-xs text-muted">
                    {group.parts.filter(p => p.selected).length}/{group.parts.length}
                  </span>
                </div>

                {group.expanded && (
                  <div className="ml-5 flex flex-col">
                    {group.parts.map(part => (
                      <div
                        key={part.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                          part.selected ? 'bg-[rgba(47,128,237,0.08)]' : 'hover:bg-secondary/40'
                        }`}
                        onClick={() => togglePart(group.id, part.id)}
                      >
                        <Checkbox checked={part.selected} onCheckedChange={() => togglePart(group.id, part.id)} />
                        <span className={`truncate ${part.selected ? 'text-primary' : 'text-foreground'}`} style={part.selected ? { fontWeight: 'var(--font-weight-medium)' } : undefined}>
                          {part.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Parts summary */}
          <div className="px-3 py-2 border-t border-border bg-background">
            <span className="text-xs text-muted">
              {selectedParts.length} part{selectedParts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>

        {/* Center — 3D Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 3D viewport placeholder */}
          <div className="flex-1 relative bg-[#1a1d24] overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

            {/* Placeholder 3D content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                {/* Stylized 3D wireframe cube */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full opacity-30">
                    {/* Back face */}
                    <polygon points="60,40 160,40 160,140 60,140" fill="none" stroke="#2F80ED" strokeWidth="1" />
                    {/* Front face */}
                    <polygon points="40,60 140,60 140,160 40,160" fill="none" stroke="#2F80ED" strokeWidth="1.5" />
                    {/* Connecting edges */}
                    <line x1="40" y1="60" x2="60" y2="40" stroke="#2F80ED" strokeWidth="1" />
                    <line x1="140" y1="60" x2="160" y2="40" stroke="#2F80ED" strokeWidth="1" />
                    <line x1="140" y1="160" x2="160" y2="140" stroke="#2F80ED" strokeWidth="1" />
                    <line x1="40" y1="160" x2="60" y2="140" stroke="#2F80ED" strokeWidth="1" />
                    {/* Highlight on selected parts */}
                    <polygon points="60,80 120,80 120,120 60,120" fill="#2F80ED" fillOpacity="0.15" stroke="#2F80ED" strokeWidth="1.5" />
                  </svg>
                  {/* Animated glow effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/40" style={{ fontWeight: 'var(--font-weight-medium)' }}>3D Preview</p>
                  <p className="text-xs text-white/25 mt-1">Digital twin viewport</p>
                </div>
              </div>
            </div>

            {/* Axis indicator */}
            <div className="absolute bottom-4 left-4 flex items-end gap-0.5">
              <div className="flex flex-col items-center">
                <div className="w-[2px] h-8 bg-green-500/60" />
                <span className="text-[10px] text-green-500/80 mt-0.5">Y</span>
              </div>
              <div className="flex items-center">
                <div className="h-[2px] w-8 bg-red-500/60" />
                <span className="text-[10px] text-red-500/80 ml-0.5">X</span>
              </div>
              <div className="flex items-center -ml-[18px] -mb-2" style={{ transform: 'rotate(-45deg)' }}>
                <div className="h-[2px] w-6 bg-blue-500/60" />
                <span className="text-[10px] text-blue-500/80 ml-0.5">Z</span>
              </div>
            </div>

            {/* Viewport controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <button className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Maximize2 className="w-3.5 h-3.5 text-white/60" />
              </button>
              <button className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Eye className="w-3.5 h-3.5 text-white/60" />
              </button>
              <button className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Settings2 className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>

            {/* Camera info overlay */}
            {cameraWaypoints.length > 0 && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 backdrop-blur-sm">
                <Camera className="w-3 h-3 text-white/50" />
                <span className="text-[10px] text-white/60 font-mono">
                  Cam: ({cameraWaypoints[0].position.x.toFixed(1)}, {cameraWaypoints[0].position.y.toFixed(1)}, {cameraWaypoints[0].position.z.toFixed(1)})
                </span>
              </div>
            )}

            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-white" style={{ fontWeight: 'var(--font-weight-medium)' }}>Playing</span>
                <span className="text-xs text-white/70 font-mono">{progress.toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <Timeline
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            progress={progress}
            setProgress={setProgress}
            speed={speed}
            setSpeed={setSpeed}
          />
        </div>

        {/* Right Sidebar — Channel Editors */}
        <div className="w-[300px] shrink-0 flex flex-col border-l border-border bg-card">
          <Tabs value={activeChannel} onValueChange={setActiveChannel} className="flex flex-col flex-1 min-h-0">
            <div className="px-2 pt-2 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="camera" className="flex-1 gap-1 text-xs px-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="movement" className="flex-1 gap-1 text-xs px-1.5">
                  <Move className="w-3.5 h-3.5" />
                  Move
                </TabsTrigger>
                <TabsTrigger value="highlight" className="flex-1 gap-1 text-xs px-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Light
                </TabsTrigger>
                <TabsTrigger value="tool" className="flex-1 gap-1 text-xs px-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Tool
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              <TabsContent value="camera" className="mt-0">
                <CameraChannel
                  waypoints={cameraWaypoints}
                  setWaypoints={updateCameraWaypoints}
                  modelRelative={modelRelative}
                  setModelRelative={updateModelRelative}
                />
              </TabsContent>

              <TabsContent value="movement" className="mt-0">
                <MovementChannel
                  waypoints={movementWaypoints}
                  setWaypoints={updateMovementWaypoints}
                  hideAtEnd={hideAtEnd}
                  setHideAtEnd={updateHideAtEnd}
                  selectedParts={selectedParts}
                />
              </TabsContent>

              <TabsContent value="highlight" className="mt-0">
                <HighlightChannel
                  config={highlightConfig}
                  setConfig={updateHighlightConfig}
                />
              </TabsContent>

              <TabsContent value="tool" className="mt-0">
                <ToolChannel
                  config={toolConfig}
                  setConfig={updateToolConfig}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showUnsavedModal && (
        <UnsavedChangesModal
          onSave={() => { handleSave(); }}
          onDiscard={() => { setShowUnsavedModal(false); setHasUnsavedChanges(false); onClose(); }}
          onCancel={() => setShowUnsavedModal(false)}
        />
      )}

      {showPostSave && (
        <PostSaveDialog
          onCreateNew={() => {
            setShowPostSave(false);
            setAnimName('New Animation');
            setCameraWaypoints([]);
            setMovementWaypoints([]);
            setHighlightConfig({ type: 'none', startPercent: 0, endPercent: 100, color: '#2F80ED' });
            setToolConfig({ toolId: '', animationId: '', mode: 'PlayOnce', reverse: false, segmentDuration: 3.0 });
            setPartGroups(MOCK_PART_GROUPS.map(g => ({ ...g, parts: g.parts.map(p => ({ ...p, selected: false })) })));
            setProgress(0);
            setIsPlaying(false);
          }}
          onSameSetup={() => {
            setShowPostSave(false);
            setAnimName('New Animation (from setup)');
            setCameraWaypoints([]);
            setMovementWaypoints([]);
            setProgress(0);
            setIsPlaying(false);
          }}
          onContinue={() => setShowPostSave(false)}
          onClose={() => { setShowPostSave(false); onClose(); }}
        />
      )}
    </div>
  );
}
